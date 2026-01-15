
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { UserState, FarmPlot, Word, LivestockSlot, LessonLevel, MachineSlot, ProcessingRecipe, MachineItem } from '../types';
import { CROPS, ANIMALS, PRODUCTS, DECORATIONS, MYSTERY_BOX_REWARDS, RECIPES, MACHINES } from '../data/farmData';
import { Droplets, Lock, ShoppingBasket, Warehouse, Truck, Sparkles, Coins, Home, Heart, Zap, X, Star, Plus, TrendingUp, ScrollText, Tractor, Award, Info, CheckCircle, AlertCircle, CloudRain, Sprout, Egg, Dog, Bug, Factory, Timer, Trash2, ArrowRight } from 'lucide-react';
import { playSFX } from '../utils/sound';
import { AVATARS } from '../constants';
import { Avatar } from './Avatar';
import { FlashcardGame } from './FlashcardGame'; 
import { SpellingGame } from './SpellingGame';
import { SpeakingGame } from './SpeakingGame';

import { OrderBoard } from './farm/OrderBoard';
import { ShopModal } from './farm/ShopModal';
import { BarnModal } from './farm/BarnModal';
import { WellModal } from './farm/WellModal';
import { PlotModal } from './farm/PlotModal';
import { MissionModal } from './farm/MissionModal';
import { AnimalShopModal } from './farm/AnimalShopModal';
import { MachineShopModal } from './farm/MachineShopModal';
import { useFarmGame } from '../hooks/useFarmGame';

interface FarmProps {
  userState: UserState;
  onUpdateState: (newState: UserState | ((prev: UserState) => UserState)) => void;
  onExit: () => void;
  allWords: Word[]; 
  levels?: LessonLevel[]; 
}

type FarmZone = 'FIELDS' | 'PASTURE' | 'FACTORY' | 'PET_HOME';
type MiniGameType = 'FLASHCARD' | 'SPELLING' | 'SPEAKING';

export const Farm: React.FC<FarmProps> = ({ userState, onUpdateState, onExit, allWords, levels = [] }) => {
  const { 
      now, 
      plantSeed, waterPlot, catchBug, harvestPlot, 
      buyAnimal, feedAnimal, collectProduct,
      deliverOrder, generateOrders, addReward, canAfford, feedPet, updateMissionProgress
  } = useFarmGame(userState, onUpdateState);
  
  const [currentZone, setCurrentZone] = useState<FarmZone>('FIELDS');
  const [flyingItems, setFlyingItems] = useState<{id: number, icon: any, x: number, y: number, type: 'COIN' | 'ITEM' | 'HEART'}[]>([]);
  const [activeModal, setActiveModal] = useState<'NONE' | 'SHOP' | 'BARN' | 'PET_INTERACT' | 'ORDERS' | 'QUIZ' | 'WELL' | 'PLOT' | 'MISSIONS' | 'ANIMAL_BUY' | 'MACHINE_CRAFT' | 'MACHINE_BUY'>('NONE');
  const [selectedPlotId, setSelectedPlotId] = useState<number | null>(null);
  const [selectedSlotId, setSelectedSlotId] = useState<number | null>(null); 
  const [selectedMachineSlotId, setSelectedMachineSlotId] = useState<number | null>(null);
  const [quizContext, setQuizContext] = useState<{ type: MiniGameType; words: Word[]; plotId?: number; rewardType?: 'WEED' | 'BUG' | 'MYSTERY' | 'REFRESH'; } | null>(null);
  const [toast, setToast] = useState<{ msg: string, type: 'error' | 'success' | 'info' } | null>(null);

  const showToast = (msg: string, type: 'error' | 'success' | 'info' = 'info') => {
      setToast({ msg, type });
      setTimeout(() => setToast(null), 3000);
  };

  const spawnFlyingItem = (rect: DOMRect | undefined, icon: any, type: 'COIN' | 'ITEM' | 'HEART' = 'ITEM') => {
      if (!rect) return;
      const id = Date.now() + Math.random();
      setFlyingItems(prev => [...prev, { id, icon, x: rect.left + rect.width/2, y: rect.top, type }]);
      setTimeout(() => {
          setFlyingItems(prev => prev.filter(item => item.id !== id));
      }, 1500); 
  };

  // --- SMART CONTENT SELECTION ---
  const reviewPool = useMemo(() => {
      if (!levels || levels.length === 0) return allWords.slice(0, 10);
      const completedIds = userState.completedLevels || [];
      const learnedLevels = levels.filter(l => completedIds.includes(l.id));
      let pool = learnedLevels.flatMap(l => l.words);
      if (pool.length < 5) {
          const firstUnlocked = levels.find(l => userState.unlockedLevels?.includes(l.id));
          if (firstUnlocked) pool = firstUnlocked.words;
          else pool = levels[0]?.words || allWords.slice(0, 10);
      }
      return pool;
  }, [userState.completedLevels, levels, allWords]);

  useEffect(() => {
    // Init Machine Slots if missing
    if (!userState.machineSlots || userState.machineSlots.length === 0) {
        onUpdateState(prev => ({
            ...prev,
            // Initial state: 1 unlocked, 1 locked
            machineSlots: [
                { id: 1, machineId: null, isUnlocked: true, activeRecipeId: null, startedAt: null },
                { id: 2, machineId: null, isUnlocked: false, activeRecipeId: null, startedAt: null }
            ]
        }));
    } else {
        // AUTO-EXPAND LOGIC: If the last slot is unlocked, add a new locked one
        const lastSlot = userState.machineSlots[userState.machineSlots.length - 1];
        if (lastSlot.isUnlocked) {
             onUpdateState(prev => ({
                ...prev,
                machineSlots: [
                    ...(prev.machineSlots || []),
                    { id: lastSlot.id + 1, machineId: null, isUnlocked: false, activeRecipeId: null, startedAt: null }
                ]
            }));
        }
    }

    // Ensure livestock slots logic handled in App.tsx mainly, but double check here if empty
    if (!userState.livestockSlots || userState.livestockSlots.length === 0) {
         onUpdateState(prev => {
             // Init with 4 unlocked and 1 locked
             const newSlots = [1,2,3,4].map(id => ({ id, isUnlocked: true, animalId: null, fedAt: null }));
             newSlots.push({ id: 5, isUnlocked: false, animalId: null, fedAt: null });
             return { ...prev, livestockSlots: newSlots };
         });
    }
  }, [userState.machineSlots]); // Check when machineSlots changes

  const getPlotStatus = useCallback((plot: FarmPlot) => {
    if (!plot.cropId || !plot.plantedAt) return { isReady: false, progress: 0, crop: null };
    const crop = CROPS.find(c => c.id === plot.cropId);
    if (!crop) return { isReady: false, progress: 0, crop: null };
    const elapsed = (now - plot.plantedAt) / 1000;
    const progress = Math.min(100, (elapsed / crop.growthTime) * 100);
    return { isReady: progress >= 100, progress, crop, elapsed };
  }, [now]);

  // LINEAR COST FORMULA (Easier for kids)
  const unlockedCount = userState.farmPlots.filter(p => p.isUnlocked).length;
  // Cost = 500 * (count - 1)
  const nextPlotCost = 500 * (Math.max(1, unlockedCount - 1));

  // Livestock Expansion Cost (Linear)
  const unlockedBarnCount = userState.livestockSlots?.filter(s => s.isUnlocked).length || 4;
  const nextBarnCost = 1000 + ((unlockedBarnCount - 4) * 500);

  // Machine Expansion Cost
  const unlockedMachineCount = userState.machineSlots?.filter(s => s.isUnlocked).length || 1;
  const nextMachineSlotCost = 2000 + ((unlockedMachineCount - 1) * 1000);

  const startMiniGame = (rewardType: 'WEED' | 'BUG' | 'MYSTERY' | 'REFRESH', plotId?: number) => {
      let type: MiniGameType = 'FLASHCARD';
      const rand = Math.random();
      if (rewardType === 'MYSTERY') {
          type = rand > 0.5 ? 'SPELLING' : 'SPEAKING';
      } else if (rewardType === 'BUG') {
          type = 'SPEAKING';
      } else if (rewardType === 'WEED') {
          type = rand > 0.7 ? 'SPELLING' : 'FLASHCARD';
      } else {
          type = 'FLASHCARD';
      }
      const shuffled = [...reviewPool].sort(() => 0.5 - Math.random());
      
      // Adjusted Question Count based on Reward Type
      let questionCount = 1;
      if (rewardType === 'MYSTERY' || rewardType === 'REFRESH') questionCount = 3;
      
      const selectedWords = shuffled.slice(0, questionCount);
      setQuizContext({ type, words: selectedWords, plotId, rewardType });
      setActiveModal('QUIZ');
  };

  const handleHarvestAll = () => {
      let harvestedCount = 0;
      userState.farmPlots.forEach(plot => {
          const status = getPlotStatus(plot);
          if (status.isReady && status.crop) {
              harvestPlot(plot.id, status.crop);
              harvestedCount++;
          }
      });
      
      if (harvestedCount > 0) {
          playSFX('harvest');
          showToast(`Đã thu hoạch ${harvestedCount} ô đất!`, "success");
      } else {
          showToast("Chưa có cây nào chín cả!", "info");
      }
  };

  const handlePlotClick = (plot: FarmPlot) => {
      if (!plot.isUnlocked) {
          if (plot.id > unlockedCount + 1) {
              showToast("Bé hãy khai phá từng ô đất một nhé!", "error");
              playSFX('wrong');
              return;
          }
          setSelectedPlotId(plot.id);
          setActiveModal('PLOT');
          return;
      }
      const status = getPlotStatus(plot);
      if (plot.hasBug) {
          playSFX('wrong');
          startMiniGame('BUG', plot.id);
          return;
      }
      if (plot.hasWeed) {
          startMiniGame('WEED', plot.id);
          return;
      }
      if (status.isReady && status.crop) {
          harvestPlot(plot.id, status.crop);
          const rect = document.getElementById(`plot-${plot.id}`)?.getBoundingClientRect();
          spawnFlyingItem(rect, status.crop.emoji, 'ITEM');
          spawnFlyingItem(rect, `+${status.crop.exp} XP`, 'COIN');
          showToast(`Thu hoạch ${status.crop.name}!`, "success");
          return;
      }
      if (plot.hasMysteryBox) {
          startMiniGame('MYSTERY', plot.id);
          return;
      }
      setSelectedPlotId(plot.id);
      setActiveModal('PLOT');
  };

  const handlePlotAction = (action: string, data?: any) => {
      if (!selectedPlotId) return;
      const plot = userState.farmPlots.find(p => p.id === selectedPlotId)!;
      const crop = plot.cropId ? CROPS.find(c => c.id === plot.cropId) : null;
      let res: any = { success: false };

      switch (action) {
          case 'PLANT': res = plantSeed(selectedPlotId, data); break;
          case 'WATER': if (crop) res = waterPlot(selectedPlotId, crop); break;
          case 'FERTILIZER': 
            if (userState.fertilizers > 0 && crop) {
                playSFX('success');
                const boostAmount = crop.growthTime * 0.3 * 1000;
                onUpdateState(prev => ({ 
                    ...prev, 
                    fertilizers: prev.fertilizers - 1, 
                    farmPlots: prev.farmPlots.map(p => p.id === selectedPlotId ? { ...p, plantedAt: (p.plantedAt || now) - boostAmount } : p)
                }));
                updateMissionProgress('FERTILIZE', 1);
                res = { success: true };
                showToast("Bón phân thành công!", "success");
            } else res = { success: false, msg: "Bé đã hết phân bón!" };
            break;
          case 'HARVEST': if (crop) res = harvestPlot(selectedPlotId, crop); break;
          case 'UNLOCK':
              if (canAfford(nextPlotCost)) {
                  playSFX('success');
                  onUpdateState(prev => {
                      let newPlots = prev.farmPlots.map(p => p.id === selectedPlotId ? { ...p, isUnlocked: true } : p);
                      if (selectedPlotId === prev.farmPlots.length) {
                          newPlots.push({ id: prev.farmPlots.length + 1, isUnlocked: false, cropId: null, plantedAt: null });
                      }
                      return { ...prev, coins: prev.coins - nextPlotCost, farmPlots: newPlots };
                  });
                  res = { success: true };
                  showToast("Mở đất thành công! Tuyệt quá bé ơi.", "success");
              } else res = { success: false, msg: `Bé thiếu ${nextPlotCost - userState.coins} xu!` };
              break;
      }
      if (res.success) setActiveModal('NONE');
      else if (res.msg) showToast(res.msg, "error");
  };

  // --- ANIMAL LOGIC ---
  const handleSlotClick = (slot: LivestockSlot) => {
      // HANDLE UNLOCKING LIVESTOCK SLOT
      if (!slot.isUnlocked) {
          if (slot.id > unlockedBarnCount + 1) {
              showToast("Bé hãy mở từng chuồng một nhé!", "error");
              playSFX('wrong');
              return;
          }

          if (canAfford(nextBarnCost)) {
              if (confirm(`Mở rộng chuồng trại với giá ${nextBarnCost} xu?`)) {
                  onUpdateState(prev => {
                      const newSlots = prev.livestockSlots?.map(s => s.id === slot.id ? { ...s, isUnlocked: true } : s) || [];
                      // Expand Logic: If this is the last slot (regardless of total count), push a new locked one
                      if (slot.id === (prev.livestockSlots?.length || 0)) {
                          newSlots.push({ id: slot.id + 1, isUnlocked: false, animalId: null, fedAt: null });
                      }
                      return { ...prev, coins: prev.coins - nextBarnCost, livestockSlots: newSlots };
                  });
                  playSFX('success');
                  showToast("Mở rộng chuồng thành công!", "success");
              }
          } else {
              showToast(`Cần ${nextBarnCost} xu để mở rộng!`, "error");
          }
          return;
      }

      if (!slot.animalId) {
          setSelectedSlotId(slot.id);
          setActiveModal('ANIMAL_BUY');
      } else {
          const animal = ANIMALS.find(a => a.id === slot.animalId);
          if (!animal) return;
          const rect = document.getElementById(`slot-${slot.id}`)?.getBoundingClientRect();
          
          if (!slot.fedAt) {
              const res = feedAnimal(slot.id);
              if (res) {
                  if(res.success) {
                      showToast(res.msg || "Đã cho ăn!", "success");
                      spawnFlyingItem(rect, "❤️", 'HEART'); 
                  }
                  else showToast(res.msg || "Lỗi", "error");
              }
          } else {
              const elapsed = (now - slot.fedAt) / 1000;
              if (elapsed >= animal.produceTime) {
                  const res = collectProduct(slot.id);
                  if (res?.success) {
                      const product = PRODUCTS.find(p => p.id === animal.produceId);
                      spawnFlyingItem(rect, product?.emoji || "📦", 'ITEM');
                      spawnFlyingItem(rect, `+${animal.exp} XP`, 'COIN');
                      showToast(`Thu hoạch thành công!`, "success");
                  }
              } else {
                  showToast(`${animal.name} đang ăn... còn ${Math.ceil(animal.produceTime - elapsed)}s`, "info");
              }
          }
      }
  };

  const sellAnimal = (slot: LivestockSlot) => {
      if (!slot.animalId) return;
      const animal = ANIMALS.find(a => a.id === slot.animalId);
      if (!animal) return;
      
      const refund = Math.floor(animal.cost * 0.5);
      if (confirm(`Bán ${animal.name} để nhận lại ${refund} xu?`)) {
          onUpdateState(prev => ({
              ...prev,
              coins: prev.coins + refund,
              livestockSlots: prev.livestockSlots?.map(s => s.id === slot.id ? { ...s, animalId: null, fedAt: null } : s)
          }));
          playSFX('success');
          showToast(`Đã bán ${animal.name}!`, "info");
      }
  };

  // --- MACHINE LOGIC ---
  const handleMachineSlotClick = (slot: MachineSlot) => {
      if (!slot.isUnlocked) {
          const currentUnlockedCount = userState.machineSlots?.filter(s => s.isUnlocked).length || 0;
          if (slot.id > currentUnlockedCount + 1) {
              showToast("Bé hãy mở rộng từng ô một nhé!", "error");
              playSFX('wrong');
              return;
          }

          if (canAfford(nextMachineSlotCost)) {
              if (confirm(`Mở rộng nhà máy với giá ${nextMachineSlotCost} xu?`)) {
                  onUpdateState(prev => {
                      const newSlots = prev.machineSlots?.map(s => s.id === slot.id ? { ...s, isUnlocked: true } : s) || [];
                      // Logic now handled in useEffect, but redundancy here is safe for instant update
                      if (slot.id === (prev.machineSlots?.length || 0)) {
                          newSlots.push({ id: slot.id + 1, machineId: null, isUnlocked: false, activeRecipeId: null, startedAt: null });
                      }
                      return { ...prev, coins: prev.coins - nextMachineSlotCost, machineSlots: newSlots };
                  });
                  playSFX('success');
                  showToast("Mở rộng thành công!", "success");
              }
          } else {
              showToast(`Cần ${nextMachineSlotCost} xu!`, "error");
          }
          return;
      }

      if (!slot.machineId) {
          setSelectedMachineSlotId(slot.id);
          setActiveModal('MACHINE_BUY');
      } else {
          // Machine is built, handle crafting
          if (slot.activeRecipeId && slot.startedAt) {
              // Check completion
              const recipe = RECIPES.find(r => r.id === slot.activeRecipeId);
              if (!recipe) return;
              const elapsed = (now - slot.startedAt) / 1000;
              
              if (elapsed >= recipe.duration) {
                  // Collect
                  const product = PRODUCTS.find(p => p.id === recipe.outputId);
                  playSFX('success');
                  const rect = document.getElementById(`machine-${slot.id}`)?.getBoundingClientRect();
                  spawnFlyingItem(rect, product?.emoji || "🎁", 'ITEM');
                  
                  onUpdateState(prev => ({
                      ...prev,
                      harvestedCrops: { ...prev.harvestedCrops, [recipe.outputId]: (prev.harvestedCrops?.[recipe.outputId]||0) + 1 },
                      machineSlots: prev.machineSlots?.map(s => s.id === slot.id ? { ...s, activeRecipeId: null, startedAt: null } : s)
                  }));
                  showToast(`Chế biến xong ${product?.name}!`, "success");
              } else {
                  showToast(`Đang chế biến... còn ${Math.ceil(recipe.duration - elapsed)}s`, "info");
              }
          } else {
              // Open crafting menu
              setSelectedMachineSlotId(slot.id);
              setActiveModal('MACHINE_CRAFT');
          }
      }
  };

  const buyMachine = (machine: MachineItem) => {
      if (!selectedMachineSlotId) return;
      if (!canAfford(machine.cost)) {
          showToast("Không đủ tiền!", "error");
          return;
      }
      
      onUpdateState(prev => ({
          ...prev,
          coins: prev.coins - machine.cost,
          machineSlots: prev.machineSlots?.map(s => s.id === selectedMachineSlotId ? { ...s, machineId: machine.id } : s)
      }));
      playSFX('success');
      setActiveModal('NONE');
      showToast(`Đã lắp đặt ${machine.name}!`, "success");
  };

  const startCrafting = (recipe: ProcessingRecipe) => {
      if (!selectedMachineSlotId) return;
      const machineSlot = userState.machineSlots?.find(s => s.id === selectedMachineSlotId);
      if (!machineSlot) return;

      // Check ingredients
      const missing = recipe.input.find(req => (userState.harvestedCrops?.[req.id] || 0) < req.amount);
      if (missing) {
          const item = [...CROPS, ...PRODUCTS].find(c => c.id === missing.id);
          showToast(`Thiếu ${missing.amount - (userState.harvestedCrops?.[missing.id] || 0)} ${item?.name}!`, "error");
          return;
      }

      playSFX('click');
      onUpdateState(prev => {
          const newHarvest = { ...prev.harvestedCrops };
          recipe.input.forEach(req => newHarvest[req.id] -= req.amount);
          return {
              ...prev,
              harvestedCrops: newHarvest,
              machineSlots: prev.machineSlots?.map(s => s.id === selectedMachineSlotId ? { ...s, activeRecipeId: recipe.id, startedAt: Date.now() } : s)
          };
      });
      setActiveModal('NONE');
      showToast(`Bắt đầu làm ${PRODUCTS.find(p => p.id === recipe.outputId)?.name}!`, "success");
  };

  const sellMachine = (slot: MachineSlot) => {
      if (!slot.machineId) return;
      const machine = MACHINES.find(m => m.id === slot.machineId);
      if (!machine) return;
      
      const refund = Math.floor(machine.cost * 0.5);
      if (confirm(`Bán máy ${machine.name} để nhận lại ${refund} xu?`)) {
          onUpdateState(prev => ({
              ...prev,
              coins: prev.coins + refund,
              machineSlots: prev.machineSlots?.map(s => s.id === slot.id ? { ...s, machineId: null, activeRecipeId: null, startedAt: null } : s)
          }));
          playSFX('success');
          showToast(`Đã bán máy!`, "info");
      }
  }

  // --- BARN SELL HANDLERS (Fixed Logic) ---
  const handleSellOne = (itemId: string) => {
      onUpdateState(prev => {
          const item = [...CROPS, ...PRODUCTS].find(c => c.id === itemId);
          const currentCount = prev.harvestedCrops?.[itemId] || 0;
          if (!item || currentCount <= 0) return prev;
          
          return {
              ...prev,
              coins: prev.coins + item.sellPrice,
              harvestedCrops: { ...prev.harvestedCrops, [itemId]: currentCount - 1 }
          };
      });
      playSFX('success');
  };

  const handleSellAllItem = (itemId: string) => {
      onUpdateState(prev => {
          const item = [...CROPS, ...PRODUCTS].find(c => c.id === itemId);
          const currentCount = prev.harvestedCrops?.[itemId] || 0;
          if (!item || currentCount <= 0) return prev;

          return {
              ...prev,
              coins: prev.coins + (item.sellPrice * currentCount),
              harvestedCrops: { ...prev.harvestedCrops, [itemId]: 0 }
          };
      });
      playSFX('success');
  };

  const handleSellEverything = () => {
      onUpdateState(prev => {
          let total = 0;
          [...CROPS, ...PRODUCTS].forEach(c => {
              total += (prev.harvestedCrops?.[c.id] || 0) * c.sellPrice;
          });
          return { ...prev, coins: prev.coins + total, harvestedCrops: {} };
      });
      playSFX('success');
  };

  // --- HANDLERS ---
  const handleQuizSuccess = (earnedScore: number = 1) => {
    if (!quizContext) return;
    const { plotId, rewardType } = quizContext;

    // Strict Skip Logic: If score is 0 (Skipped), punish by removing obstacle but no reward.
    if (earnedScore === 0) {
        if (rewardType === 'MYSTERY' && plotId) {
            onUpdateState(prev => ({ ...prev, farmPlots: prev.farmPlots.map(p => p.id === plotId ? { ...p, hasMysteryBox: false } : p) }));
            showToast("Đã bỏ qua. Hộp quà biến mất!", "info");
        } else if (rewardType === 'WEED' && plotId) {
             onUpdateState(prev => ({ ...prev, farmPlots: prev.farmPlots.map(p => p.id === plotId ? { ...p, hasWeed: false } : p) }));
             showToast("Đã dọn cỏ (Không nhận thưởng).", "info");
        } else if (rewardType === 'BUG' && plotId) {
             onUpdateState(prev => ({ ...prev, farmPlots: prev.farmPlots.map(p => p.id === plotId ? { ...p, hasBug: false, isWatered: false } : p) }));
             showToast("Đã bắt sâu (Không nhận thưởng).", "info");
        }
        setActiveModal('NONE');
        setQuizContext(null);
        return;
    }

    playSFX('correct');

    if (rewardType === 'REFRESH') {
        const newOrders = generateOrders(userState.grade||1, userState.completedLevels?.length||0, userState.livestockSlots);
        onUpdateState(prev => ({ ...prev, activeOrders: newOrders }));
        showToast("Đã mời thương lái mới!", "success");
    } else if (rewardType === 'WEED' && plotId) {
        onUpdateState(prev => ({ ...prev, coins: prev.coins + 10, farmPlots: prev.farmPlots.map(p => p.id === plotId ? { ...p, hasWeed: false } : p) }));
        showToast("Sạch cỏ rồi! Nhận 10 đồng xu.", "success");
    } else if (rewardType === 'BUG' && plotId) {
        catchBug(plotId);
        showToast("Đã bắt sâu! Cây lại lớn tiếp rồi.", "success");
    } else if (rewardType === 'MYSTERY' && plotId) {
        const r = Math.random();
        let reward = MYSTERY_BOX_REWARDS[Math.floor(r * MYSTERY_BOX_REWARDS.length)];
        onUpdateState(prev => ({ ...prev, farmPlots: prev.farmPlots.map(p => p.id === plotId ? { ...p, hasMysteryBox: false } : p) }));
        addReward(reward.type, reward.amount);
        showToast(`Bé nhận được ${reward.amount} ${reward.type === 'COIN' ? 'đồng xu' : reward.type}!`, "success");
    }
    setActiveModal('NONE');
    setQuizContext(null);
  };

  const triggerOrderRefreshQuiz = () => {
      startMiniGame('REFRESH');
  };

  const currentAvatar = AVATARS.find(a => a.id === userState.currentAvatarId);
  const XP_FOR_NEXT_LEVEL = ((userState.petLevel || 1) * 100);
  const petExpProgress = Math.min(100, ((userState.petExp || 0) / XP_FOR_NEXT_LEVEL) * 100);

  // --- RENDERERS ---
  const renderFields = () => (
      <div className="grid grid-cols-2 gap-x-8 gap-y-12 max-w-sm mx-auto px-6 pb-32 pt-10 relative">
          
          {/* HARVEST ALL BUTTON */}
          {userState.farmPlots.some(p => { const s = getPlotStatus(p); return s.isReady; }) && (
              <button 
                onClick={handleHarvestAll}
                className="absolute -top-12 right-0 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-full font-black text-xs shadow-lg animate-bounce flex items-center gap-2 z-20 border-2 border-white"
              >
                  <Tractor size={16} /> Thu hoạch hết
              </button>
          )}

          {userState.farmPlots.map(plot => {
            let content = null;
            let bgClass = "bg-[#a16207]"; 
            const status = getPlotStatus(plot);

            if (!plot.isUnlocked) {
              const unlockedCount = userState.farmPlots.filter(p => p.isUnlocked).length;
              const isNext = plot.id === unlockedCount + 1;
              bgClass = "bg-slate-200 border-slate-300 shadow-inner grayscale";
              content = (
                  <div className="text-slate-400 font-black flex flex-col items-center">
                      {isNext ? <div className="animate-bounce flex flex-col items-center text-emerald-600"><Plus size={32}/><span className="text-xs font-black">MỞ ĐẤT</span></div> : <Lock size={28} />}
                      <div className="text-sm mt-1 flex items-center gap-1 font-bold">
                        {isNext ? nextPlotCost : '???'} <Coins size={14} fill="#fbbf24" className="text-amber-500" />
                      </div>
                  </div>
              );
            } else if (plot.hasMysteryBox) {
               bgClass = "bg-indigo-600 border-indigo-400 ring-4 ring-indigo-200 animate-pulse shadow-2xl";
               content = (
                <div className="flex flex-col items-center justify-center w-full h-full text-white">
                  <Avatar emoji="🐢" bgGradient="bg-white/20" size="sm" animate />
                  <span className="text-xs font-black tracking-tighter mt-2 uppercase text-white">Quà Thầy Rùa</span>
                </div>
               );
            } else if (plot.hasBug) {
                bgClass = "bg-red-800 border-red-500 ring-4 ring-red-200 shadow-xl";
                content = (
                    <div className="flex flex-col items-center justify-center w-full h-full text-white animate-shake">
                        <Bug size={48} className="text-red-300"/>
                        <span className="text-xs font-black bg-red-500 px-3 py-1 rounded-full mt-2 uppercase shadow-md animate-pulse">Cứu cây!</span>
                    </div>
                );
            } else if (plot.hasWeed) {
                bgClass = "bg-[#713f12] border-rose-400 ring-4 ring-rose-100 shadow-xl";
                content = <div className="flex flex-col items-center justify-center w-full h-full"><span className="text-6xl drop-shadow-xl animate-wiggle">🌿</span><span className="text-xs text-white font-black bg-rose-500 px-3 py-1 rounded-full mt-3 uppercase shadow-md">Nhổ cỏ</span></div>;
            } else if (plot.cropId) {
              const { isReady, progress, crop } = status;
              bgClass = (plot.isWatered || userState.weather === 'RAINY') ? "bg-[#713f12] border-sky-400/60" : "bg-[#854d0e]";
              content = (
                <div className="flex flex-col items-center justify-center w-full h-full relative">
                  {isReady && <Sparkles className="absolute text-yellow-400 animate-ping opacity-50" size={80} />}
                  <div className={`transition-all duration-1000 relative z-10 ${isReady ? 'scale-110 animate-bounce' : 'scale-90'}`}>
                    <span className="text-8xl drop-shadow-2xl select-none">
                        {isReady ? crop?.emoji : (status.elapsed || 0) < crop!.growthTime / 3 ? '🌱' : (status.elapsed || 0) < crop!.growthTime * 0.6 ? '🌿' : crop?.emoji}
                    </span>
                  </div>
                  {!isReady && (
                      <div className="absolute -bottom-6 w-20 h-4 bg-black/40 rounded-full p-1 border border-white/30 backdrop-blur-sm overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all duration-1000" style={{ width: `${progress}%` }} />
                      </div>
                  )}
                  {isReady && <div className="absolute -top-4 -right-4 bg-yellow-400 text-yellow-900 text-xs font-black w-10 h-10 flex items-center justify-center rounded-full shadow-lg border-2 border-white animate-pulse"><TrendingUp size={20}/></div>}
                </div>
              );
            } else {
              bgClass = "bg-[#a16207] hover:bg-[#854d0e] border-b-[12px] border-black/20 transition-all";
              content = <div className="w-12 h-4 bg-black/10 rounded-full blur-md opacity-40"></div>;
            }

            return (
              <button key={plot.id} id={`plot-${plot.id}`} onClick={() => handlePlotClick(plot)} className={`aspect-square rounded-[3rem] flex items-center justify-center border-4 border-white/30 shadow-2xl transition-all active:scale-95 active:translate-y-2 relative ${bgClass} ${status.isReady ? 'ring-4 ring-yellow-400/50' : ''}`}>
                {content}
              </button>
            );
          })}
      </div>
  );

  const renderPasture = () => (
      <div className="grid grid-cols-2 gap-6 max-w-sm mx-auto px-6 pb-32 pt-10">
          {(userState.livestockSlots || []).map(slot => {
              // LOCKED SLOT
              if (!slot.isUnlocked) {
                  const unlockedCount = userState.livestockSlots?.filter(s => s.isUnlocked).length || 0;
                  // Explicitly check ID sequence to ensure correct button shows
                  const isNext = slot.id === unlockedCount + 1;
                  
                  return (
                      <button 
                        key={slot.id} 
                        onClick={() => handleSlotClick(slot)} 
                        className={`aspect-square rounded-[2rem] border-4 flex flex-col items-center justify-center shadow-inner transition-all ${isNext ? 'bg-slate-100 border-slate-300 text-slate-500 hover:bg-slate-200 active:scale-95' : 'bg-slate-200 border-slate-300 text-slate-300 opacity-60 cursor-not-allowed'}`}
                        disabled={!isNext}
                      >
                          {isNext ? <div className="animate-bounce flex flex-col items-center text-orange-500"><Plus size={32}/><span className="text-xs font-black">MỞ CHUỒNG</span></div> : <Lock size={32} />}
                          <div className="text-[10px] font-black mt-1 flex items-center gap-1">
                            {isNext ? nextBarnCost : '???'} <Coins size={10} fill="#fbbf24" className={isNext ? "text-amber-500" : "text-slate-400"}/>
                          </div>
                      </button>
                  );
              }

              const animal = slot.animalId ? ANIMALS.find(a => a.id === slot.animalId) : null;
              let isReady = false;
              let progress = 0;
              let stateText = "Trống";
              let feedEmoji = null;
              let ownedFeed = 0;
              let neededFeed = 0;

              if (animal) {
                  if (!slot.fedAt) {
                      stateText = "Đói bụng";
                      const feed = CROPS.find(c => c.id === animal.feedCropId);
                      feedEmoji = feed ? feed.emoji : "🍽️";
                      ownedFeed = userState.harvestedCrops?.[animal.feedCropId] || 0;
                      neededFeed = animal.feedAmount;
                  } else {
                      const elapsed = (now - slot.fedAt) / 1000;
                      progress = Math.min(100, (elapsed / animal.produceTime) * 100);
                      if (progress >= 100) {
                          isReady = true;
                          stateText = "Thu hoạch!";
                      } else {
                          stateText = "Đang lớn...";
                      }
                  }
              }

              return (
                  <div key={slot.id} className="relative group">
                    <button 
                        id={`slot-${slot.id}`}
                        onClick={() => handleSlotClick(slot)}
                        className={`w-full aspect-square rounded-[2rem] border-4 flex flex-col items-center justify-center relative shadow-xl transition-all active:scale-95 ${
                            !animal ? 'bg-white border-slate-200 border-dashed' : 
                            isReady ? 'bg-yellow-100 border-yellow-400 ring-4 ring-yellow-200' :
                            !slot.fedAt ? 'bg-red-50 border-red-300' : 'bg-green-50 border-green-300'
                        }`}
                    >
                        {!animal ? (
                            <div className="flex flex-col items-center text-slate-400 hover:text-orange-500 transition-colors">
                                <Plus size={32} />
                                <span className="text-xs font-black uppercase mt-1">Mua nuôi</span>
                            </div>
                        ) : (
                            <>
                                <div className={`text-6xl drop-shadow-md transition-all ${isReady ? 'animate-bounce' : !slot.fedAt ? 'animate-pulse grayscale' : ''}`}>
                                    {animal.emoji}
                                </div>
                                
                                {!slot.fedAt && (
                                    <div className={`absolute -top-3 -right-3 px-3 py-1.5 rounded-2xl flex items-center justify-center border-2 shadow-lg animate-bounce z-10 ${ownedFeed >= neededFeed ? 'bg-white border-green-200 text-slate-700' : 'bg-red-100 border-red-300 text-red-600'}`}>
                                        <span className="text-sm mr-1">{feedEmoji}</span>
                                        <span className="text-[10px] font-black">{ownedFeed}/{neededFeed}</span>
                                    </div>
                                )}

                                <div className={`absolute bottom-3 px-3 py-1 rounded-full text-xs font-black uppercase border shadow-sm ${
                                    isReady ? 'bg-yellow-500 text-white border-white' :
                                    !slot.fedAt ? 'bg-red-500 text-white border-white' :
                                    'bg-white text-green-600 border-green-200'
                                }`}>
                                    {stateText}
                                </div>
                                {slot.fedAt && !isReady && (
                                    <div className="absolute top-3 w-16 h-2 bg-slate-200 rounded-full overflow-hidden border border-white">
                                        <div className="h-full bg-green-500 transition-all duration-1000" style={{ width: `${progress}%` }} />
                                    </div>
                                )}
                            </>
                        )}
                    </button>
                    {animal && (
                        <button onClick={() => sellAnimal(slot)} className="absolute -top-2 -left-2 bg-red-100 p-2 rounded-full text-red-500 border-2 border-red-200 shadow-md opacity-0 group-hover:opacity-100 transition-opacity">
                            <Trash2 size={16}/>
                        </button>
                    )}
                  </div>
              );
          })}
      </div>
  );

  const renderFactory = () => (
      <div className="grid grid-cols-1 gap-6 max-w-sm mx-auto px-6 pb-32 pt-10">
          {(userState.machineSlots || []).map(slot => {
              // LOCKED SLOT = EXPAND BUTTON
              if (!slot.isUnlocked) {
                  const unlockedCount = userState.machineSlots?.filter(s => s.isUnlocked).length || 0;
                  const isNext = slot.id === unlockedCount + 1;
                  
                  return (
                      <button 
                        key={slot.id} 
                        onClick={() => handleMachineSlotClick(slot)} 
                        disabled={!isNext}
                        className={`bg-slate-200 rounded-[2rem] h-32 flex flex-col items-center justify-center border-4 border-slate-300 shadow-inner transition-all ${isNext ? 'hover:bg-slate-100 active:scale-95 cursor-pointer' : 'opacity-50 cursor-not-allowed'}`}
                      >
                          {isNext ? (
                              <div className="animate-bounce flex flex-col items-center text-blue-600">
                                  <Plus size={40}/>
                                  <span className="text-xs font-black uppercase mt-1">MỞ RỘNG NHÀ MÁY</span>
                              </div>
                          ) : <Lock size={32} className="text-slate-400"/>}
                          
                          <div className="text-xs font-bold mt-2 flex items-center gap-1 text-slate-500">
                              {isNext ? <>{nextMachineSlotCost} <Coins size={14} fill="#fbbf24" className="text-amber-500"/></> : '???'}
                          </div>
                      </button>
                  )
              }

              if (!slot.machineId) {
                  return (
                      <button key={slot.id} onClick={() => handleMachineSlotClick(slot)} className="bg-slate-100 rounded-[2rem] h-32 flex flex-col items-center justify-center text-slate-400 border-4 border-slate-300 border-dashed hover:bg-slate-200 transition-colors">
                          <Plus size={40}/>
                          <span className="text-xs font-black mt-2 uppercase">Lắp đặt máy</span>
                      </button>
                  )
              }

              const machine = MACHINES.find(m => m.id === slot.machineId);
              const recipe = slot.activeRecipeId ? RECIPES.find(r => r.id === slot.activeRecipeId) : null;
              const product = recipe ? PRODUCTS.find(p => p.id === recipe.outputId) : null;
              
              const elapsed = slot.startedAt ? (now - slot.startedAt) / 1000 : 0;
              const progress = recipe ? Math.min(100, (elapsed / recipe.duration) * 100) : 0;
              const isReady = progress >= 100;

              return (
                  <div key={slot.id} className="relative group">
                    <button 
                        id={`machine-${slot.id}`}
                        onClick={() => handleMachineSlotClick(slot)}
                        className={`w-full h-32 rounded-[2rem] border-4 flex items-center justify-between p-6 shadow-xl transition-all active:scale-95 relative overflow-hidden ${recipe ? (isReady ? 'bg-green-100 border-green-300' : 'bg-blue-50 border-blue-200') : 'bg-white border-slate-200'}`}
                    >
                        <div className="z-10 flex flex-col items-start">
                            <h3 className="font-black text-slate-700 text-lg uppercase flex items-center gap-2">
                                <span className="text-2xl">{machine?.emoji}</span> {machine?.name}
                            </h3>
                            <div className="text-xs font-bold text-slate-500 mt-1">
                                {recipe ? (isReady ? "Xong rồi!" : "Đang chế biến...") : "Chạm để sản xuất"}
                            </div>
                        </div>
                        
                        {recipe ? (
                            <div className="z-10 flex flex-col items-center">
                                <div className={`text-5xl drop-shadow-md ${isReady ? 'animate-bounce' : 'animate-pulse'}`}>
                                    {product?.emoji}
                                </div>
                                {!isReady && <div className="flex items-center gap-1 text-[10px] font-bold mt-1 text-slate-500"><Timer size={10}/> {Math.ceil(recipe.duration - elapsed)}s</div>}
                            </div>
                        ) : (
                            <div className="z-10 opacity-30 text-4xl grayscale">⚙️</div>
                        )}

                        {/* Background Deco */}
                        <div className="absolute right-[-20px] bottom-[-20px] text-8xl opacity-5 grayscale pointer-events-none">{machine?.emoji}</div>

                        {recipe && !isReady && (
                            <div className="absolute bottom-0 left-0 h-2 bg-blue-200 w-full">
                                <div className="h-full bg-blue-500 transition-all duration-1000" style={{ width: `${progress}%` }} />
                            </div>
                        )}
                    </button>
                    <button onClick={() => sellMachine(slot)} className="absolute -top-2 -left-2 bg-red-100 p-2 rounded-full text-red-500 border-2 border-red-200 shadow-md opacity-0 group-hover:opacity-100 transition-opacity">
                        <Trash2 size={16}/>
                    </button>
                  </div>
              )
          })}
      </div>
  );

  const renderPetHome = () => (
      <div className="flex flex-col items-center pt-10 px-6 pb-32 h-full">
          <div className="bg-white/80 backdrop-blur-sm p-8 rounded-[3rem] shadow-2xl border-4 border-rose-200 w-full max-w-sm flex flex-col items-center relative">
              <div className="absolute top-4 left-6 bg-rose-100 px-3 py-1 rounded-full text-xs font-black text-rose-600 border border-rose-200">
                  Cấp {userState.petLevel || 1}
              </div>
              <div className="absolute top-4 right-6 bg-blue-100 px-3 py-1 rounded-full text-xs font-black text-blue-600 border border-blue-200 flex items-center gap-1">
                  <Heart size={10} fill="currentColor"/> {userState.petHappiness || 0}%
              </div>
              <div className="mt-8 mb-6 scale-150 transform hover:rotate-6 transition-transform cursor-pointer" onClick={() => setActiveModal('PET_INTERACT')}>
                  <Avatar emoji={currentAvatar?.emoji || '🐰'} bgGradient={currentAvatar?.bgGradient || 'bg-pink-100'} size="lg" animate />
              </div>
              <p className="text-center text-slate-500 font-bold text-sm italic mb-6">"Cho tớ ăn nông sản để tớ lớn nhanh nhé!"</p>
              <button onClick={() => setActiveModal('PET_INTERACT')} className="w-full py-4 bg-rose-500 text-white rounded-2xl font-black uppercase tracking-widest shadow-lg hover:bg-rose-600 active:scale-95 transition-all text-sm">Chơi đùa & Cho ăn</button>
          </div>
      </div>
  );

  return (
    <div className={`flex flex-col h-full animate-fadeIn relative overflow-hidden transition-colors duration-1000 ${userState.weather === 'RAINY' ? 'bg-slate-500' : 'bg-[#e0f2fe]'}`}>
      
      {/* HEADER HUD */}
      <div className="bg-white/90 backdrop-blur-md px-4 py-3 shadow-lg flex flex-col z-40 sticky top-0 border-b-4 border-blue-100/50">
            <div className="flex items-center justify-between">
                <button onClick={onExit} className="p-2 text-slate-600 hover:bg-slate-100 rounded-2xl active:scale-90 transition-all bg-white border border-slate-200 shadow-sm"><Home size={24}/></button>
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 bg-amber-50 px-3 py-1.5 rounded-2xl border-2 border-amber-200 shadow-sm">
                        <Coins size={20} className="text-amber-500" fill="currentColor" />
                        <span className="text-amber-700 font-black text-base tabular-nums">{userState.coins}</span>
                    </div>
                    <button onClick={() => setActiveModal('MISSIONS')} className="relative p-2 bg-indigo-100 text-indigo-600 rounded-2xl shadow-sm hover:bg-indigo-200 transition-all active:scale-90">
                        <ScrollText size={24} />
                        {userState.missions?.some(m => m.completed && !m.claimed) && <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-pulse" />}
                    </button>
                </div>
            </div>
            
            <div className="mt-2 flex items-center gap-2 px-1">
                <Award size={16} className="text-indigo-400" />
                <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                    <div className="h-full bg-gradient-to-r from-indigo-400 to-purple-500 transition-all duration-1000" style={{ width: `${petExpProgress}%` }} />
                </div>
                <span className="text-xs font-black text-indigo-600 tabular-nums">{userState.petExp}/{XP_FOR_NEXT_LEVEL}</span>
            </div>
      </div>

      {/* DYNAMIC TOASTS */}
      {toast && (
          <div className={`fixed top-28 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-full font-black text-sm shadow-2xl animate-fadeIn border-2 backdrop-blur-xl flex items-center gap-3 transition-all whitespace-nowrap ${
              toast.type === 'error' ? 'bg-rose-500 text-white border-rose-400' : 
              toast.type === 'success' ? 'bg-emerald-500 text-white border-emerald-400' : 
              'bg-sky-500 text-white border-sky-400'
          }`}>
              {toast.type === 'error' ? <AlertCircle size={20} /> : toast.type === 'success' ? <CheckCircle size={20} /> : <Info size={20} />}
              <span className="uppercase tracking-tight">{toast.msg}</span>
          </div>
      )}

      {/* Weather Overlay */}
      {userState.weather === 'RAINY' && (
          <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden opacity-30">
              {[...Array(20)].map((_, i) => (
                  <div key={i} className="absolute text-blue-300 animate-rain text-2xl" style={{ left: `${Math.random() * 100}%`, top: `-${Math.random() * 20}%`, animationDuration: `${0.5 + Math.random()}s` }}><CloudRain /></div>
              ))}
          </div>
      )}

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 relative overflow-y-auto no-scrollbar">
          <div className="absolute inset-0 z-0 pointer-events-none opacity-20" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/cubes.png")' }}></div>
          <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
             {(userState.decorations || []).map((dId, idx) => {
                 const decor = DECORATIONS.find(d => d.id === dId);
                 if(!decor) return null;
                 return <div key={idx} className="absolute text-4xl" style={{ top: `${10 + idx * 15}%`, left: idx % 2 === 0 ? '5%' : '85%' }}>{decor.emoji}</div>
             })}
          </div>

          {currentZone === 'FIELDS' && renderFields()}
          {currentZone === 'PASTURE' && renderPasture()}
          {currentZone === 'FACTORY' && renderFactory()}
          {currentZone === 'PET_HOME' && renderPetHome()}
      </div>

      {/* BOTTOM NAVIGATION & ACTIONS */}
      <div className="bg-white p-2 pb-6 shadow-[0_-4px_20px_rgba(0,0,0,0.1)] rounded-t-[2rem] flex flex-col gap-3 relative z-40">
          <div className="flex justify-center gap-4 -mt-10 mb-2">
             <button onClick={() => setActiveModal('ORDERS')} className="flex flex-col items-center justify-center w-16 h-16 bg-orange-500 rounded-full border-4 border-white shadow-lg text-white active:scale-90 transition-transform relative">
                 <Truck size={24} />
                 <span className="text-xs font-black uppercase mt-0.5">Đơn hàng</span>
             </button>
             <button onClick={() => setActiveModal('BARN')} className="flex flex-col items-center justify-center w-16 h-16 bg-emerald-600 rounded-full border-4 border-white shadow-lg text-white active:scale-90 transition-transform relative">
                 <Warehouse size={24} />
                 <span className="text-xs font-black uppercase mt-0.5">Kho</span>
                 {userState.activeOrders?.length ? <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border border-white animate-pulse" /> : null}
             </button>
             <button onClick={() => setActiveModal('SHOP')} className="flex flex-col items-center justify-center w-16 h-16 bg-pink-500 rounded-full border-4 border-white shadow-lg text-white active:scale-90 transition-transform relative">
                 <ShoppingBasket size={24} />
                 <span className="text-xs font-black uppercase mt-0.5">Cửa hàng</span>
             </button>
             {currentZone === 'FIELDS' && (
                 <button onClick={() => setActiveModal('WELL')} className="flex flex-col items-center justify-center w-16 h-16 bg-blue-500 rounded-full border-4 border-white shadow-lg text-white active:scale-90 transition-transform relative">
                     <Droplets size={24} />
                     <span className="text-xs font-black uppercase mt-0.5">{userState.waterDrops}</span>
                 </button>
             )}
          </div>

          <div className="flex bg-slate-100 p-1.5 rounded-full mx-4 relative overflow-x-auto no-scrollbar">
              <button onClick={() => setCurrentZone('FIELDS')} className={`flex-shrink-0 px-4 py-3 rounded-full flex items-center justify-center gap-2 font-black text-sm transition-all relative z-10 ${currentZone === 'FIELDS' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400'}`}>
                  <Sprout size={18} /> TRỒNG TRỌT
              </button>
              <button onClick={() => setCurrentZone('PASTURE')} className={`flex-shrink-0 px-4 py-3 rounded-full flex items-center justify-center gap-2 font-black text-sm transition-all relative z-10 ${currentZone === 'PASTURE' ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-400'}`}>
                  <Egg size={18} /> CHĂN NUÔI
              </button>
              <button onClick={() => setCurrentZone('FACTORY')} className={`flex-shrink-0 px-4 py-3 rounded-full flex items-center justify-center gap-2 font-black text-sm transition-all relative z-10 ${currentZone === 'FACTORY' ? 'bg-white text-slate-700 shadow-sm' : 'text-slate-400'}`}>
                  <Factory size={18} /> CHẾ BIẾN
              </button>
              <button onClick={() => setCurrentZone('PET_HOME')} className={`flex-shrink-0 px-4 py-3 rounded-full flex items-center justify-center gap-2 font-black text-sm transition-all relative z-10 ${currentZone === 'PET_HOME' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-400'}`}>
                  <Dog size={18} /> THÚ CƯNG
              </button>
          </div>
      </div>

      {/* FLYING ITEMS ANIMATION */}
      {flyingItems.map(item => (
          <div key={item.id} className="absolute z-[100] animate-floatUp pointer-events-none flex flex-col items-center" style={{ left: item.x, top: item.y }}>
              <div className="text-4xl drop-shadow-md">{item.icon}</div>
              {item.type === 'COIN' && <div className="text-yellow-400 font-black text-xs stroke-black text-shadow">+Vàng</div>}
          </div>
      ))}

      {/* MODALS */}
      {activeModal === 'SHOP' && (
          <ShopModal 
              crops={CROPS} 
              decorations={DECORATIONS} 
              userState={userState} 
              onBuySeed={(crop, amount) => {
                  if (userState.coins >= crop.cost * amount) {
                      playSFX('success');
                      onUpdateState(prev => ({ 
                          ...prev, 
                          coins: prev.coins - (crop.cost * amount), 
                          inventory: { ...prev.inventory, [crop.id]: (prev.inventory[crop.id] || 0) + amount } 
                      }));
                      showToast(`Đã mua ${amount} hạt ${crop.name}`, "success");
                  }
              }} 
              onBuyDecor={(decor) => {
                  onUpdateState(prev => ({ ...prev, coins: prev.coins - decor.cost, decorations: [...(prev.decorations || []), decor.id] }));
                  playSFX('success');
                  showToast(`Đã mua ${decor.name}!`, "success");
              }}
              onClose={() => setActiveModal('NONE')} 
          />
      )}

      {activeModal === 'BARN' && (
          <BarnModal 
              crops={[...CROPS, ...PRODUCTS]} 
              harvested={userState.harvestedCrops || {}} 
              activeOrders={userState.activeOrders || []}
              onSell={handleSellOne}
              onSellAll={handleSellAllItem}
              onSellEverything={handleSellEverything}
              onClose={() => setActiveModal('NONE')} 
          />
      )}

      {activeModal === 'ORDERS' && (
          <OrderBoard 
              orders={userState.activeOrders || []} 
              items={[...CROPS, ...PRODUCTS]} 
              inventory={userState.harvestedCrops || {}} 
              onDeliver={deliverOrder}
              onRefresh={triggerOrderRefreshQuiz}
              onClose={() => setActiveModal('NONE')} 
          />
      )}

      {activeModal === 'WELL' && (
          <WellModal 
              words={reviewPool} 
              onSuccess={(amount) => {
                  onUpdateState(prev => ({ ...prev, waterDrops: (prev.waterDrops || 0) + amount }));
                  showToast(`Nhận được ${amount} giọt nước!`, "success");
                  setActiveModal('NONE');
              }} 
              onClose={() => setActiveModal('NONE')} 
          />
      )}

      {activeModal === 'PLOT' && selectedPlotId && (
          <PlotModal 
              plot={userState.farmPlots.find(p => p.id === selectedPlotId)!}
              inventory={userState.inventory}
              waterDrops={userState.waterDrops}
              fertilizers={userState.fertilizers}
              userCoins={userState.coins}
              weather={userState.weather}
              nextPlotCost={nextPlotCost}
              onAction={handlePlotAction}
              onClose={() => setActiveModal('NONE')} 
          />
      )}

      {activeModal === 'MISSIONS' && (
          <MissionModal 
              missions={userState.missions || []} 
              onClaim={(m) => {
                  playSFX('success');
                  addReward(m.reward.type, m.reward.amount);
                  onUpdateState(prev => ({
                      ...prev,
                      missions: prev.missions?.map(mis => mis.id === m.id ? { ...mis, claimed: true } : mis)
                  }));
                  showToast("Đã nhận thưởng nhiệm vụ!", "success");
              }} 
              onClose={() => setActiveModal('NONE')} 
          />
      )}

      {activeModal === 'ANIMAL_BUY' && selectedSlotId && (
          <AnimalShopModal 
              animals={ANIMALS} 
              crops={[...CROPS, ...PRODUCTS]} 
              products={PRODUCTS} 
              userLevel={Math.floor((userState.petExp || 0)/300) + 1}
              userCoins={userState.coins}
              onBuy={(animal) => {
                  const res = buyAnimal(selectedSlotId, animal.id);
                  if (res.success) {
                      showToast(`Đã mua ${animal.name}!`, "success");
                      setActiveModal('NONE');
                  } else {
                      showToast(res.msg || "Lỗi", "error");
                  }
              }} 
              onClose={() => setActiveModal('NONE')} 
          />
      )}

      {/* PET INTERACT MODAL */}
      {activeModal === 'PET_INTERACT' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-fadeIn">
              <div className="bg-white rounded-[2.5rem] w-full max-w-sm relative p-6 text-center border-8 border-rose-200 shadow-2xl">
                  <button onClick={() => setActiveModal('NONE')} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"><X size={24}/></button>
                  <h3 className="text-xl font-black text-rose-500 mb-4 uppercase">Chăm sóc thú cưng</h3>
                  <div className="mb-6 transform scale-125">
                      <Avatar emoji={currentAvatar?.emoji || '🐰'} bgGradient={currentAvatar?.bgGradient || 'bg-pink-100'} size="lg" animate />
                  </div>
                  <p className="text-sm font-bold text-slate-500 mb-4">Cho tớ ăn nông sản để tớ lớn nhanh nhé!</p>
                  
                  <div className="grid grid-cols-4 gap-2 max-h-60 overflow-y-auto no-scrollbar p-2 bg-slate-50 rounded-xl">
                      {[...CROPS, ...PRODUCTS].map(item => {
                          const count = userState.harvestedCrops?.[item.id] || 0;
                          if (count === 0) return null;
                          return (
                              <button key={item.id} onClick={() => {
                                  const res = feedPet(item.id);
                                  if (res.success) {
                                      if (res.msg) showToast(res.msg, "success");
                                      else playSFX('eat'); 
                                  }
                              }} className="flex flex-col items-center bg-white p-2 rounded-xl shadow-sm border-2 border-slate-100 active:scale-90 transition-transform">
                                  <span className="text-2xl">{item.emoji}</span>
                                  <span className="text-[10px] font-black text-slate-600">x{count}</span>
                              </button>
                          )
                      })}
                  </div>
              </div>
          </div>
      )}

      {activeModal === 'MACHINE_BUY' && selectedMachineSlotId && (
          <MachineShopModal 
              machines={MACHINES} 
              recipes={RECIPES} 
              allItems={[...CROPS, ...PRODUCTS]} 
              userLevel={Math.floor((userState.petExp || 0)/300) + 1} 
              userCoins={userState.coins} 
              onBuy={buyMachine} 
              onClose={() => setActiveModal('NONE')} 
          />
      )}

      {activeModal === 'MACHINE_CRAFT' && selectedMachineSlotId && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-fadeIn">
              <div className="bg-white rounded-[2.5rem] w-full max-w-md relative border-8 border-slate-200 shadow-2xl overflow-hidden">
                  <div className="bg-slate-100 p-4 flex justify-between items-center">
                      <h3 className="font-black text-slate-700 uppercase">Chế biến</h3>
                      <button onClick={() => setActiveModal('NONE')}><X className="text-slate-400"/></button>
                  </div>
                  <div className="p-4 bg-slate-50 space-y-3 max-h-[60vh] overflow-y-auto no-scrollbar">
                      {(() => {
                          const slot = userState.machineSlots?.find(s => s.id === selectedMachineSlotId);
                          const machine = MACHINES.find(m => m.id === slot?.machineId);
                          const availableRecipes = RECIPES.filter(r => r.machineId === machine?.id);
                          
                          if (!machine) return <div>Lỗi máy móc</div>;

                          return availableRecipes.map(recipe => {
                              const product = PRODUCTS.find(p => p.id === recipe.outputId);
                              const canCraft = recipe.input.every(req => (userState.harvestedCrops?.[req.id] || 0) >= req.amount);

                              return (
                                  <button 
                                      key={recipe.id} 
                                      onClick={() => startCrafting(recipe)}
                                      className={`w-full bg-white p-3 rounded-2xl border-4 flex items-center justify-between shadow-sm transition-all ${canCraft ? 'border-green-100 hover:border-green-300' : 'border-slate-200 opacity-60'}`}
                                  >
                                      <div className="flex items-center gap-3">
                                          <div className="text-4xl">{product?.emoji}</div>
                                          <div className="text-left">
                                              <div className="font-black text-sm text-slate-800">{product?.name}</div>
                                              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500">
                                                  {recipe.input.map(inItem => {
                                                      const item = [...CROPS, ...PRODUCTS].find(i => i.id === inItem.id);
                                                      const has = userState.harvestedCrops?.[inItem.id] || 0;
                                                      return (
                                                          <span key={inItem.id} className={has < inItem.amount ? "text-red-500" : "text-green-600"}>
                                                              {item?.emoji} {inItem.amount}
                                                          </span>
                                                      )
                                                  })}
                                                  <span className="ml-1 flex items-center"><Timer size={10}/> {recipe.duration}s</span>
                                              </div>
                                          </div>
                                      </div>
                                      <div className="bg-blue-50 text-blue-600 px-3 py-1 rounded-lg font-black text-xs">
                                          Chế biến
                                      </div>
                                  </button>
                              )
                          });
                      })()}
                  </div>
              </div>
          </div>
      )}

      {/* QUIZ MODAL FIXED */}
      {activeModal === 'QUIZ' && quizContext && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/90 p-4 backdrop-blur-2xl animate-fadeIn">
              <div className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl border-8 border-indigo-400 overflow-hidden flex flex-col h-auto max-h-[90vh]">
                  <div className="bg-indigo-500 p-6 text-white text-center font-black text-xl flex items-center justify-center gap-3 uppercase tracking-tighter shrink-0">
                      <Avatar emoji="🐢" bgGradient="bg-white/20" size="sm"/> 
                      {quizContext.type === 'FLASHCARD' ? 'Thầy Rùa đố bé' : quizContext.type === 'SPELLING' ? 'Ghép từ cùng Thầy Rùa' : 'Luyện nói cùng Thầy Rùa'}
                  </div>
                  <div className="p-4 flex-1 overflow-y-auto relative no-scrollbar">
                      {quizContext.type === 'FLASHCARD' && <FlashcardGame words={quizContext.words} backupWords={allWords} initialMode="QUIZ" onComplete={handleQuizSuccess} />}
                      {quizContext.type === 'SPELLING' && <SpellingGame words={quizContext.words} onComplete={handleQuizSuccess} />}
                      {quizContext.type === 'SPEAKING' && <SpeakingGame words={quizContext.words} onComplete={(score) => handleQuizSuccess(score)} />}
                  </div>
                  <div className="p-4 shrink-0 flex justify-center">
                      <button onClick={() => handleQuizSuccess(0)} className="text-slate-300 font-bold text-xs uppercase hover:text-slate-500">Bỏ qua</button>
                  </div>
              </div>
          </div>
      )}
      <style>{`
        @keyframes floatUp { 0% { transform: translateY(0) scale(1); opacity: 1; } 100% { transform: translateY(-150px) scale(2.5); opacity: 0; } }
        .animate-floatUp { animation: floatUp 1.5s ease-out forwards; }
        .animate-rain { animation: rain 1s linear infinite; }
        @keyframes rain { 0% { transform: translateY(-100vh); opacity: 0; } 50% { opacity: 1; } 100% { transform: translateY(100vh); opacity: 0; } }
        @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-2px) rotate(-5deg); } 75% { transform: translateX(2px) rotate(5deg); } }
        .animate-shake { animation: shake 0.5s ease-in-out infinite; }
      `}</style>
    </div>
  );
};
