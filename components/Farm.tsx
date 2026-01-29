
// ... existing imports ...
import React, { useState, useEffect, useRef } from 'react';
import { UserState, FarmPlot, Decor } from '../types';
import { CROPS, ANIMALS, MACHINES, DECORATIONS, RECIPES, PRODUCTS } from '../data/farmData';
import { PlotModal } from './farm/PlotModal';
import { ShopModal } from './farm/ShopModal';
import { MissionModal } from './farm/MissionModal';
import { OrderBoard } from './farm/OrderBoard';
import { InventoryModal } from './farm/InventoryModal';
import { BarnModal } from './farm/BarnModal';
import { LearningQuizModal } from './farm/LearningQuizModal';
import { ItemManageModal } from './farm/ItemManageModal'; 
import { MachineProductionModal } from './farm/MachineProductionModal'; 
import { ConfirmModal } from './ui/ConfirmModal';
import { useFarmGame } from '../hooks/useFarmGame';
import { Lock, Droplets, Clock, Zap, Tractor, Factory, ShoppingBasket, Bird, Scroll, Truck, Hand, Hammer, Home, Coins, Star, AlertTriangle, Bug, Warehouse, Settings, Layers, Armchair, Plus, Sparkles } from 'lucide-react';
import { playSFX } from '../utils/sound';
import { resolveImage } from '../utils/imageUtils'; // Import utility

// ... existing props and types ...
interface FarmProps {
  userState: UserState;
  onUpdateState: (newState: UserState | ((prev: UserState) => UserState)) => void;
  onExit: () => void;
  allWords: any;
  levels: any;
}

type FarmSection = 'CROPS' | 'ANIMALS' | 'MACHINES' | 'DECOR';

interface FlyingItem {
    id: number;
    emoji: string;
    x: number;
    y: number;
    targetX: number;
    targetY: number;
}

interface FloatingText {
    id: number;
    text: React.ReactNode; 
    x: number;
    y: number;
    color: string;
}

export const Farm: React.FC<FarmProps> = ({ userState, onUpdateState, onExit, allWords }) => {
  const { now, plantSeed, placeAnimal, placeMachine, reclaimItem, waterPlot, resolvePest, harvestPlot, harvestAll, buyItem, feedAnimal, collectProduct, startProcessing, collectMachine, canAfford, deliverOrder, addReward, generateOrders, checkWellUsage, useWell, speedUpItem, placeDecor, removeDecor } = useFarmGame(userState, onUpdateState);
  
  const [activeSection, setActiveSection] = useState<FarmSection>('CROPS');
  const [activeModal, setActiveModal] = useState<'NONE' | 'PLOT' | 'SHOP' | 'MISSIONS' | 'ORDERS' | 'INVENTORY' | 'BARN' | 'QUIZ' | 'MANAGE_ITEM' | 'PRODUCTION'>('NONE');
  const [quizContext, setQuizContext] = useState<{ type: 'WATER' | 'PEST' | 'SPEED_UP' | 'NEW_ORDER', plotId?: number, slotId?: number, entityType?: 'CROP' | 'ANIMAL' | 'MACHINE' } | null>(null);
  const [inventoryMode, setInventoryMode] = useState<'VIEW' | 'SELECT_SEED' | 'PLACE_ANIMAL' | 'PLACE_MACHINE' | 'SELECT_DECOR'>('VIEW');
  const [initialInvTab, setInitialInvTab] = useState<'SEEDS' | 'ANIMALS' | 'MACHINES' | 'DECOR'>('SEEDS');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [manageItemConfig, setManageItemConfig] = useState<{ type: 'ANIMAL' | 'MACHINE', slotId: number, itemId: string } | null>(null);
  const [productionConfig, setProductionConfig] = useState<{ slotId: number, machineId: string } | null>(null); 
  
  // FX States
  const [flyingItems, setFlyingItems] = useState<FlyingItem[]>([]);
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
  const [showLevelUp, setShowLevelUp] = useState(false);
  
  // Modal Configurations
  const [confirmConfig, setConfirmConfig] = useState<{ isOpen: boolean; message: string; onConfirm: () => void } | null>(null);
  const [alertConfig, setAlertConfig] = useState<{ isOpen: boolean; message: string; type: 'INFO' | 'DANGER' } | null>(null);

  // Refs
  const prevLevelRef = useRef(userState.farmLevel || 1);
  const barnBtnRef = useRef<HTMLButtonElement>(null); 

  // --- LEVEL UP CHECK ---
  useEffect(() => {
      const currentLevel = userState.farmLevel || 1;
      if (currentLevel > prevLevelRef.current) {
          playSFX('success'); 
          setShowLevelUp(true);
          setTimeout(() => setShowLevelUp(false), 4000); 
      }
      prevLevelRef.current = currentLevel;
  }, [userState.farmLevel]);

  const handleShowAlert = (msg: string, type: 'INFO' | 'DANGER' = 'DANGER') => {
      playSFX('wrong');
      setAlertConfig({ isOpen: true, message: msg, type });
  };

  const triggerHarvestFX = (rect: DOMRect, emoji: string, amount: number, exp: number) => {
      if (barnBtnRef.current) {
          const targetRect = barnBtnRef.current.getBoundingClientRect();
          const newItem: FlyingItem = {
              id: Date.now() + Math.random(),
              emoji,
              x: rect.left + rect.width / 2,
              y: rect.top + rect.height / 2,
              targetX: targetRect.left + targetRect.width / 2,
              targetY: targetRect.top + targetRect.height / 2
          };
          setFlyingItems(prev => [...prev, newItem]);
          setTimeout(() => setFlyingItems(prev => prev.filter(i => i.id !== newItem.id)), 800);
      }

      const texts: FloatingText[] = [
          { id: Date.now(), text: `+${exp} XP`, x: rect.left, y: rect.top - 20, color: 'text-blue-600' }
      ];
      if (amount > 1) texts.push({ id: Date.now()+1, text: `x${amount}`, x: rect.left + 40, y: rect.top - 10, color: 'text-green-600' });
      
      setFloatingTexts(prev => [...prev, ...texts]);
      setTimeout(() => setFloatingTexts(prev => prev.filter(t => !texts.includes(t))), 1500);
  };

  const addFloatingText = (x: number, y: number, text: React.ReactNode, color: string = 'text-yellow-500') => {
      const newText: FloatingText = { id: Date.now() + Math.random(), text, x, y, color };
      setFloatingTexts(prev => [...prev, newText]);
      setTimeout(() => setFloatingTexts(prev => prev.filter(t => t.id !== newText.id)), 1500);
  };

  const handleHarvestWithFX = (plot: FarmPlot, e: React.MouseEvent) => {
      e.stopPropagation();
      const crop = CROPS.find(c => c.id === plot.cropId);
      if (crop) {
          const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
          triggerHarvestFX(rect, crop.emoji, 1, crop.exp);
          harvestPlot(plot.id, crop);
      }
  };

  const handleExpand = (type: 'PLOT' | 'PEN' | 'MACHINE' | 'DECOR') => {
      const baseCost = 500;
      let currentCount = 0;
      let defaultSlots = 0;

      if (type === 'PLOT') {
          currentCount = userState.farmPlots.length;
          defaultSlots = 4;
      } else if (type === 'PEN') {
          currentCount = userState.livestockSlots?.length || 0;
          defaultSlots = 2;
      } else if (type === 'MACHINE') {
          currentCount = userState.machineSlots?.length || 0;
          defaultSlots = 2;
      } else if (type === 'DECOR') {
          currentCount = userState.decorSlots?.length || 0;
          defaultSlots = 3;
      }

      // Calculate cost: 500 for first expansion, then increases.
      // Formula: 500 * 1.5 ^ (count - default)
      const extraSlots = Math.max(0, currentCount - defaultSlots);
      const cost = Math.floor(baseCost * Math.pow(1.5, extraSlots));
      const finalCost = Math.floor(cost / 100) * 100; 

      setConfirmConfig({
          isOpen: true,
          message: `Mở rộng thêm ô mới với giá ${finalCost} Xu?`,
          onConfirm: () => {
              if (canAfford(finalCost, 'COIN')) {
                  playSFX('success');
                  onUpdateState(prev => {
                      const newState = { ...prev, coins: prev.coins - finalCost };
                      
                      if (type === 'PLOT') {
                          const locked = prev.farmPlots.find(p => !p.isUnlocked);
                          if (locked) newState.farmPlots = prev.farmPlots.map(p => p.id === locked.id ? { ...p, isUnlocked: true } : p);
                          else newState.farmPlots = [...prev.farmPlots, { id: Date.now(), isUnlocked: true, cropId: null, plantedAt: null }];
                      }
                      else if (type === 'PEN') {
                          const newId = Date.now();
                          newState.livestockSlots = [...(prev.livestockSlots || []), { id: newId, isUnlocked: true, animalId: null, fedAt: null }];
                      }
                      else if (type === 'MACHINE') {
                          const newId = Date.now();
                          newState.machineSlots = [...(prev.machineSlots || []), { id: newId, isUnlocked: true, machineId: null, activeRecipeId: null, startedAt: null }];
                      }
                      else if (type === 'DECOR') {
                          const locked = prev.decorSlots?.find(s => !s.isUnlocked);
                          if (locked) newState.decorSlots = prev.decorSlots?.map(s => s.id === locked.id ? { ...s, isUnlocked: true } : s);
                          else newState.decorSlots = [...(prev.decorSlots || []), { id: Date.now(), isUnlocked: true, decorId: null }];
                      }
                      return newState;
                  });
              } else {
                  handleShowAlert("Bé không đủ tiền để mở rộng rồi!");
              }
              setConfirmConfig(null);
          }
      });
  };

  const handlePlotClick = (plot: any, e: React.MouseEvent) => {
      if (!plot.isUnlocked) {
          setSelectedId(plot.id);
          setActiveModal('PLOT');
          return;
      }

      const crop = plot.cropId ? CROPS.find(c => c.id === plot.cropId) : null;
      
      if (crop && (plot.hasBug || plot.hasWeed)) {
          setQuizContext({ type: 'PEST', plotId: plot.id });
          setActiveModal('QUIZ');
          return;
      }

      if (!crop) {
          setSelectedId(plot.id);
          setInventoryMode('SELECT_SEED');
          setInitialInvTab('SEEDS');
          setActiveModal('INVENTORY');
      } else {
          const elapsed = (now - plot.plantedAt) / 1000;
          if (elapsed >= crop.growthTime) {
              handleHarvestWithFX(plot, e);
          } else {
              setSelectedId(plot.id); 
              setActiveModal('PLOT'); 
          }
      }
  };

  const handleWellClick = (e: React.MouseEvent) => {
      const status = checkWellUsage();
      if (!status.allowed) {
          handleShowAlert(status.msg || "Giếng thần đã cạn nước hôm nay!", 'INFO');
          return;
      }
      setQuizContext({ type: 'WATER' });
      setActiveModal('QUIZ');
  };

  const onQuizSuccess = () => {
      if (quizContext?.type === 'WATER') {
          useWell();
          const rect = document.getElementById('well-btn')?.getBoundingClientRect();
          if(rect) addFloatingText(rect.left, rect.top, "+Nước", "text-blue-500");
      } else if (quizContext?.type === 'PEST' && quizContext.plotId) {
          resolvePest(quizContext.plotId);
          const plot = userState.farmPlots.find(p => p.id === quizContext.plotId);
          if (plot) addFloatingText(window.innerWidth/2, window.innerHeight/2, "Sạch sẽ!", "text-green-500");
      } else if (quizContext?.type === 'SPEED_UP' && quizContext.slotId && quizContext.entityType) {
          speedUpItem(quizContext.entityType, quizContext.slotId);
          addFloatingText(window.innerWidth/2, window.innerHeight/2, "Tăng tốc!", "text-yellow-500");
      } else if (quizContext?.type === 'NEW_ORDER') {
          const newOrders = generateOrders(userState.grade || 1, userState.completedLevels?.length || 0, userState.livestockSlots || []);
          onUpdateState(prev => ({ ...prev, activeOrders: newOrders }));
          addFloatingText(window.innerWidth/2, window.innerHeight/2, "Đơn mới!", "text-orange-500");
      }
      setActiveModal('NONE');
      setQuizContext(null);
  };

  const handleCollectProduct = (slot: any, e: React.MouseEvent) => {
      const animal = ANIMALS.find(a => a.id === slot.animalId);
      if(animal) {
          const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
          const count = slot.storage?.length || 0;
          
          if (count > 0) {
              triggerHarvestFX(rect, animal.emoji, count, animal.exp * count);
              collectProduct(slot.id);
          }
      }
  };

  const handleFeedAnimal = (slot: any, e: React.MouseEvent) => {
      e.stopPropagation();
      const res: any = feedAnimal(slot.id);
      if (res && !res.success) {
          handleShowAlert(res.msg);
      } else if (res && res.success) {
          const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
          addFloatingText(rect.left, rect.top, 
            <div className="flex items-center gap-1">
                <span className="font-black text-red-500">-{res.amount}</span>
                <span className="text-2xl">{res.feedEmoji}</span>
            </div>, 
            "text-red-500"
          );
      }
  };

  const handleCollectMachine = (slot: any, e: React.MouseEvent) => {
      const res = collectMachine(slot.id);
      if (res && res.success) {
          const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
          addFloatingText(rect.left, rect.top, `+${res.count} Sản phẩm`, "text-green-500");
          const lastItem = slot.storage?.[slot.storage.length-1];
          if(lastItem) {
              const recipe = RECIPES.find(r => r.id === lastItem);
              const prod = PRODUCTS.find(p => p.id === recipe?.outputId);
              if(prod) triggerHarvestFX(rect, prod.emoji, res.count, 0); 
          }
      } else if (res && !res.success) {
          const machine = MACHINES.find(m => m.id === slot.machineId);
          if(machine) {
              setProductionConfig({ slotId: slot.id, machineId: machine.id });
              setActiveModal('PRODUCTION');
          }
      }
  };

  const renderSectionTabs = () => (
      <div className="flex bg-white/90 backdrop-blur-sm p-1.5 rounded-2xl mx-4 mb-4 shadow-[0_-4px_20px_rgba(0,0,0,0.1)] border-2 border-white sticky bottom-4 z-50 gap-1 overflow-x-auto no-scrollbar">
          {[
              { id: 'CROPS', label: 'Trồng Trọt', icon: <Tractor size={20}/>, color: 'text-green-600 bg-green-50' },
              { id: 'ANIMALS', label: 'Chăn Nuôi', icon: <Bird size={20}/>, color: 'text-orange-600 bg-orange-50' },
              { id: 'MACHINES', label: 'Chế Biến', icon: <Factory size={20}/>, color: 'text-blue-600 bg-blue-50' },
              { id: 'DECOR', label: 'Trang Trí', icon: <Armchair size={20}/>, color: 'text-purple-600 bg-purple-50' },
              { id: 'SHOP', label: 'Cửa Hàng', icon: <ShoppingBasket size={20}/>, color: 'text-pink-600 bg-pink-50' },
          ].map(tab => (
              <button
                  key={tab.id}
                  onClick={() => {
                      if (tab.id === 'SHOP') setActiveModal('SHOP');
                      else setActiveSection(tab.id as FarmSection);
                      playSFX('click');
                  }}
                  className={`flex-1 min-w-[70px] py-3 rounded-xl text-[10px] font-black transition-all flex flex-col items-center gap-1 leading-tight ${
                      (activeSection as string) === tab.id && tab.id !== 'SHOP'
                      ? `${tab.color.replace('text', 'bg').replace('bg', 'text-white').replace('50', '500')} shadow-md scale-105 border-b-4 border-black/10` 
                      : 'text-slate-400 hover:bg-slate-100'
                  }`}
              >
                  {tab.icon}
                  {tab.label}
              </button>
          ))}
      </div>
  );

  const renderHUD = () => (
      <div className="px-4 py-2 flex gap-2 justify-center sticky top-[60px] z-30 pointer-events-auto">
          <button ref={barnBtnRef} onClick={() => setActiveModal('BARN')} className="w-12 h-12 bg-emerald-500 text-white rounded-2xl shadow-md border-2 border-white flex items-center justify-center active:scale-95 transition-all">
              <Warehouse size={22} />
          </button>

          <button onClick={() => setActiveModal('MISSIONS')} className="flex-1 flex items-center justify-center gap-2 bg-white px-3 py-2 rounded-2xl shadow-md border-2 border-indigo-100 text-indigo-600 font-black text-xs active:scale-95 transition-all relative">
              <Scroll size={16} /> Nhiệm Vụ
              {/* Notification Dot */}
              {userState.missions?.some(m => m.completed && !m.claimed) && <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full animate-ping"></span>}
          </button>
          
          <button onClick={() => setActiveModal('ORDERS')} className="flex-1 flex items-center justify-center gap-2 bg-white px-3 py-2 rounded-2xl shadow-md border-2 border-orange-100 text-orange-600 font-black text-xs active:scale-95 transition-all relative">
              <Truck size={16} /> Đơn Hàng
              {userState.activeOrders?.some(o => o.expiresAt > now) && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center border border-white animate-pulse">!</span>}
          </button>
          
          <button id="well-btn" onClick={handleWellClick} className="w-12 h-12 bg-blue-500 text-white rounded-2xl shadow-md border-2 border-white flex items-center justify-center active:scale-95 transition-all relative">
              <Droplets size={22} />
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[8px] px-1.5 rounded-full border border-white font-bold">
                  {5 - (userState.wellUsageCount || 0)}
              </span>
          </button>
      </div>
  );

  const renderHarvestButton = () => (
      <div className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div className="bg-amber-400 text-amber-900 font-black text-xs px-4 py-2 rounded-full shadow-[0_4px_0_rgba(180,83,9,0.3)] border-2 border-white animate-bounce flex items-center gap-1 backdrop-blur-sm">
             <Hand size={14} /> Thu hoạch
          </div>
      </div>
  );

  const renderEmptySlot = (label: string, onClick: () => void) => (
      <button 
        onClick={onClick}
        className="relative aspect-square rounded-[2rem] bg-[#e2e8f0] border-4 border-[#cbd5e1] border-dashed flex flex-col items-center justify-center text-slate-400 group hover:bg-[#f1f5f9] transition-all active:scale-95"
      >
          <div className="bg-white p-3 rounded-full shadow-sm mb-2 group-hover:scale-110 transition-transform">
             <Hammer size={24} className="text-slate-300" />
          </div>
          <span className="text-[10px] font-black uppercase">{label}</span>
      </button>
  );

  const renderSpeedUpButton = (type: 'CROP' | 'ANIMAL' | 'MACHINE', slotId: number, position: string = 'absolute top-2 left-2') => (
      <button
          onClick={(e) => { e.stopPropagation(); setQuizContext({ type: 'SPEED_UP', slotId, entityType: type }); setActiveModal('QUIZ'); }}
          className={`${position} z-30 bg-yellow-400 text-white p-1.5 rounded-full shadow-sm hover:bg-yellow-500 border-2 border-white animate-pulse active:scale-90 transition-all`}
      >
          <Zap size={14} fill="currentColor" />
      </button>
  );

  const renderCrops = () => {
      const plots = userState.farmPlots;
      return (
          <div className="grid grid-cols-2 gap-4 px-4 pt-4 pb-32 animate-fadeIn">
              {plots.map(plot => {
                  const crop = plot.cropId ? CROPS.find(c => c.id === plot.cropId) : null;
                  const imgUrl = resolveImage(crop?.imageUrl);
                  
                  const elapsed = crop && plot.plantedAt ? (now - plot.plantedAt) / 1000 : 0;
                  const progress = crop ? Math.min(100, (elapsed / crop.growthTime) * 100) : 0;
                  const isReady = progress >= 100;
                  
                  return (
                      <button 
                        key={plot.id}
                        onClick={(e) => handlePlotClick(plot, e)}
                        className={`
                            relative aspect-square rounded-[2.5rem] transition-all duration-200 active:scale-95 shadow-lg overflow-hidden flex flex-col items-center justify-center
                            ${!plot.isUnlocked 
                                ? 'bg-slate-200 border-b-[6px] border-slate-300' 
                                : !crop 
                                    ? 'bg-[#F0F4C3] border-b-[6px] border-[#DCE775]' 
                                    : isReady 
                                        ? 'bg-gradient-to-b from-amber-200 to-amber-400 border-b-[6px] border-amber-600' 
                                        : 'bg-[#C8E6C9] border-b-[6px] border-[#81C784]'}
                        `}
                      >
                          {!plot.isUnlocked ? (
                              <Lock className="text-slate-400" />
                          ) : !crop ? (
                              <div className="text-3xl opacity-30">🌱</div>
                          ) : (
                              <>
                                  <div className={`text-6xl z-10 transition-transform ${isReady ? 'animate-bounce' : 'scale-90'}`}>
                                      {imgUrl ? <img src={imgUrl} alt={crop.name} className="w-full h-full object-contain" /> : crop.emoji}
                                  </div>
                                  
                                  {/* Status Indicators */}
                                  <div className="absolute top-2 right-2 flex flex-col gap-1">
                                      {plot.hasBug && <div className="bg-red-500 text-white p-1 rounded-full animate-bounce shadow-sm"><Bug size={12}/></div>}
                                      {plot.isWatered && !isReady && <div className="bg-blue-500 text-white p-1 rounded-full shadow-sm"><Droplets size={12}/></div>}
                                  </div>

                                  {/* Progress Bar or Ready Text */}
                                  {isReady ? (
                                      <div className="absolute bottom-3 bg-white/90 px-3 py-1 rounded-full text-[10px] font-black text-green-600 shadow-sm border border-green-200 animate-pulse">
                                          THU HOẠCH
                                      </div>
                                  ) : (
                                      <div className="absolute bottom-4 w-16 h-2 bg-slate-200 rounded-full overflow-hidden border border-slate-300">
                                          <div className="h-full bg-green-500 transition-all duration-1000" style={{ width: `${progress}%` }} />
                                      </div>
                                  )}

                                  {/* Speed Up */}
                                  {!isReady && !plot.hasBug && (
                                      renderSpeedUpButton('CROP', plot.id)
                                  )}
                              </>
                          )}
                      </button>
                  )
              })}
              {renderEmptySlot("Mở Đất Mới", () => handleExpand('PLOT'))}
          </div>
      );
  };

  const renderAnimals = () => {
      const slots = userState.livestockSlots || [];
      return (
          <div className="grid grid-cols-2 gap-4 px-4 pt-4 pb-32 animate-fadeIn">
              {slots.map(slot => {
                  const animal = slot.animalId ? ANIMALS.find(a => a.id === slot.animalId) : null;
                  const product = animal ? PRODUCTS.find(p => p.id === animal.produceId) : null;
                  const feedItem = animal ? [...CROPS, ...PRODUCTS].find(c => c.id === animal.feedCropId) : null;
                  const userHasFeed = animal ? (userState.harvestedCrops?.[animal.feedCropId] || 0) : 0;
                  const canFeed = animal && userHasFeed >= animal.feedAmount;

                  const imgUrl = resolveImage(animal?.imageUrl);
                  
                  const isProducing = slot.fedAt !== null;
                  let progress = 0;
                  
                  if (isProducing && animal && slot.fedAt) {
                      const elapsed = (now - slot.fedAt) / 1000;
                      progress = Math.min(100, (elapsed / animal.produceTime) * 100);
                  }

                  const hasProduct = (slot.storage?.length || 0) > 0;
                  // Critical: Animal is hungry if NOT currently producing AND NOT holding product
                  const isHungry = !isProducing && !hasProduct && animal;

                  return (
                      <button 
                        key={slot.id}
                        onClick={(e) => {
                            if (!slot.isUnlocked) return;
                            if (!animal) {
                                setSelectedId(slot.id);
                                setInventoryMode('PLACE_ANIMAL');
                                setInitialInvTab('ANIMALS');
                                setActiveModal('INVENTORY');
                            } else if (hasProduct) {
                                handleCollectProduct(slot, e);
                            } else if (isHungry) {
                                handleFeedAnimal(slot, e);
                            } else {
                                // Manage mode (sell/store)
                                setManageItemConfig({ type: 'ANIMAL', slotId: slot.id, itemId: animal.id });
                                setActiveModal('MANAGE_ITEM');
                            }
                        }}
                        className={`
                            relative aspect-square rounded-[2.5rem] transition-all duration-200 active:scale-95 shadow-lg overflow-hidden flex flex-col items-center justify-center
                            ${!slot.isUnlocked 
                                ? 'bg-slate-200 border-b-[6px] border-slate-300' 
                                : !animal 
                                    ? 'bg-[#FFE0B2] border-b-[6px] border-[#FFB74D] border-dashed' 
                                    : hasProduct 
                                        ? 'bg-gradient-to-b from-orange-200 to-orange-400 border-b-[6px] border-orange-600' 
                                        : 'bg-[#FFF3E0] border-b-[6px] border-[#FFCC80]'}
                        `}
                      >
                          {!slot.isUnlocked ? (
                              <Lock className="text-slate-400" />
                          ) : !animal ? (
                              <>
                                <div className="text-3xl opacity-30 mb-2">🐾</div>
                                <span className="text-[10px] font-black text-orange-400 uppercase">Trống</span>
                              </>
                          ) : (
                              <>
                                  <div className={`text-6xl z-10 transition-transform ${hasProduct ? 'animate-bounce' : 'scale-90'}`}>
                                      {imgUrl ? <img src={imgUrl} alt={animal.name} className="w-full h-full object-contain" /> : animal.emoji}
                                  </div>
                                  
                                  {/* Hungry Indicator with Feed */}
                                  {isHungry && (
                                      <div className={`absolute bottom-3 bg-white/90 px-2 py-1 rounded-full text-[9px] font-black shadow-sm border border-orange-200 flex items-center gap-1 z-20 ${!canFeed ? 'opacity-70 grayscale' : 'animate-pulse'}`}>
                                          <span className="text-xs">{feedItem?.emoji}</span>
                                          <span className={canFeed ? 'text-green-600' : 'text-red-500'}>{animal.feedAmount}</span>
                                      </div>
                                  )}

                                  {hasProduct && (
                                      <div className="absolute top-2 right-2 bg-green-500 text-white w-8 h-8 rounded-full flex items-center justify-center shadow-md animate-bounce border-2 border-white">
                                          {product?.emoji}
                                      </div>
                                  )}

                                  {/* Progress Bar */}
                                  {isProducing && !hasProduct && (
                                      <div className="absolute bottom-4 w-16 h-2 bg-slate-200 rounded-full overflow-hidden border border-slate-300">
                                          <div className="h-full bg-orange-500 transition-all duration-1000" style={{ width: `${progress}%` }} />
                                      </div>
                                  )}

                                  {/* Queue */}
                                  {slot.queue && slot.queue > 0 && (
                                      <div className="absolute bottom-2 left-2 bg-blue-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold border border-white">
                                          {slot.queue}
                                      </div>
                                  )}

                                  {/* Speed Up - CRITICAL: Ensure this renders */}
                                  {isProducing && !hasProduct && (
                                      renderSpeedUpButton('ANIMAL', slot.id)
                                  )}
                              </>
                          )}
                      </button>
                  )
              })}
              {renderEmptySlot("Mở Chuồng", () => handleExpand('PEN'))}
          </div>
      );
  };

  const renderMachines = () => {
      const slots = userState.machineSlots || [];
      return (
          <div className="grid grid-cols-2 gap-4 px-4 pt-4 pb-32 animate-fadeIn">
              {slots.map(slot => {
                  const machine = slot.machineId ? MACHINES.find(m => m.id === slot.machineId) : null;
                  const recipe = slot.activeRecipeId ? RECIPES.find(r => r.id === slot.activeRecipeId) : null;
                  const product = recipe ? PRODUCTS.find(p => p.id === recipe.outputId) : null;
                  const imgUrl = resolveImage(machine?.imageUrl);
                  
                  const isProcessing = !!slot.startedAt && !!recipe;
                  let progress = 0;
                  
                  if (isProcessing && recipe && slot.startedAt) {
                      const elapsed = (now - slot.startedAt) / 1000;
                      progress = Math.min(100, (elapsed / recipe.duration) * 100);
                  }

                  const hasProduct = (slot.storage?.length || 0) > 0;

                  return (
                      <button 
                        key={slot.id}
                        onClick={(e) => {
                            if (!slot.isUnlocked) return;
                            if (!machine) {
                                setSelectedId(slot.id);
                                setInventoryMode('PLACE_MACHINE');
                                setInitialInvTab('MACHINES');
                                setActiveModal('INVENTORY');
                            } else if (hasProduct) {
                                handleCollectMachine(slot, e);
                            } else if (!isProcessing) {
                                setProductionConfig({ slotId: slot.id, machineId: machine.id });
                                setActiveModal('PRODUCTION');
                            } else {
                                // Processing click -> maybe show info or speed up
                                // Or allow manage if idle
                                if(!isProcessing && !hasProduct) {
                                    setManageItemConfig({ type: 'MACHINE', slotId: slot.id, itemId: machine.id });
                                    setActiveModal('MANAGE_ITEM');
                                }
                            }
                        }}
                        className={`
                            relative aspect-square rounded-[2.5rem] transition-all duration-200 active:scale-95 shadow-lg overflow-hidden flex flex-col items-center justify-center
                            ${!slot.isUnlocked 
                                ? 'bg-slate-200 border-b-[6px] border-slate-300' 
                                : !machine 
                                    ? 'bg-[#E3F2FD] border-b-[6px] border-[#90CAF9] border-dashed' 
                                    : hasProduct 
                                        ? 'bg-gradient-to-b from-blue-200 to-blue-400 border-b-[6px] border-blue-600' 
                                        : isProcessing
                                            ? 'bg-[#BBDEFB] border-b-[6px] border-[#64B5F6] animate-pulse-slow'
                                            : 'bg-[#E3F2FD] border-b-[6px] border-[#90CAF9]'}
                        `}
                      >
                          {!slot.isUnlocked ? (
                              <Lock className="text-slate-400" />
                          ) : !machine ? (
                              <>
                                <div className="text-3xl opacity-30 mb-2">⚙️</div>
                                <span className="text-[10px] font-black text-blue-400 uppercase">Trống</span>
                              </>
                          ) : (
                              <>
                                  <div className={`text-6xl z-10 transition-transform ${hasProduct ? 'animate-bounce' : 'scale-90'} ${isProcessing ? 'animate-wiggle' : ''}`}>
                                      {imgUrl ? <img src={imgUrl} alt={machine.name} className="w-full h-full object-contain" /> : machine.emoji}
                                  </div>
                                  
                                  {/* Product Ready Indicator */}
                                  {hasProduct && (
                                      <div className="absolute -top-1 -right-1 bg-white p-1 rounded-full shadow-md border-2 border-blue-200 z-20">
                                          <div className="w-8 h-8 flex items-center justify-center text-xl bg-blue-100 rounded-full">
                                              {/* Just show icon of last produced item if possible, else generic */}
                                              🎁
                                          </div>
                                          <span className="absolute -bottom-1 -right-1 bg-red-500 text-white text-[8px] w-4 h-4 rounded-full flex items-center justify-center border border-white">
                                              {slot.storage?.length}
                                          </span>
                                      </div>
                                  )}

                                  {/* Progress Bar */}
                                  {isProcessing && !hasProduct && (
                                      <div className="absolute bottom-4 w-16 h-2 bg-slate-200 rounded-full overflow-hidden border border-slate-300">
                                          <div className="h-full bg-blue-500 transition-all duration-1000" style={{ width: `${progress}%` }} />
                                      </div>
                                  )}

                                  {/* Queue */}
                                  {slot.queue && slot.queue.length > 0 && (
                                      <div className="absolute bottom-2 left-2 flex -space-x-2">
                                          {slot.queue.map((rid, i) => {
                                              // Find product to show icon
                                              const r = RECIPES.find(rec => rec.id === rid);
                                              const p = PRODUCTS.find(prod => prod.id === r?.outputId);
                                              return (
                                                  <div key={i} className="w-5 h-5 bg-white rounded-full border border-slate-200 flex items-center justify-center text-[10px] shadow-sm">
                                                      {p?.emoji || '•'}
                                                  </div>
                                              )
                                          })}
                                      </div>
                                  )}

                                  {/* Speed Up */}
                                  {isProcessing && !hasProduct && (
                                      renderSpeedUpButton('MACHINE', slot.id)
                                  )}
                                  
                                  {!isProcessing && !hasProduct && (
                                      <div className="absolute top-2 right-2 bg-white/50 p-1 rounded-full cursor-pointer hover:bg-white transition-colors" onClick={(e) => {
                                          e.stopPropagation();
                                          setManageItemConfig({ type: 'MACHINE', slotId: slot.id, itemId: machine.id });
                                          setActiveModal('MANAGE_ITEM');
                                      }}>
                                          <Settings size={12} className="text-slate-400"/>
                                      </div>
                                  )}
                              </>
                          )}
                      </button>
                  )
              })}
              {renderEmptySlot("Mở Ô Máy", () => handleExpand('MACHINE'))}
          </div>
      );
  };

  const renderDecors = () => {
      const slots = userState.decorSlots || [];
      return (
          <div className="grid grid-cols-2 gap-4 px-4 pt-4 pb-32 animate-fadeIn">
              {slots.map(slot => {
                  const decor = slot.decorId ? DECORATIONS.find(d => d.id === slot.decorId) : null;
                  const imgUrl = resolveImage(decor?.imageUrl);
                  
                  let animClass = "";
                  if (decor?.id === 'fountain') animClass = "animate-bounce";
                  else if (decor?.id === 'lamp_post') animClass = "animate-pulse";
                  else if (decor?.id === 'scarecrow' || decor?.id === 'flower_pot') animClass = "animate-wiggle";
                  else if (decor?.id === 'windmill_decor') animClass = "animate-spin-slow";
                  else if (decor?.id === 'lucky_cat') animClass = "animate-bounce";

                  return (
                      <button 
                        key={slot.id}
                        onClick={() => {
                            if (slot.isUnlocked) {
                                setSelectedId(slot.id);
                                if (!decor) {
                                    setInventoryMode('SELECT_DECOR');
                                    setInitialInvTab('DECOR');
                                    setActiveModal('INVENTORY');
                                } else {
                                    setConfirmConfig({
                                        isOpen: true,
                                        message: `Bạn có muốn cất "${decor.name}" vào kho không?`,
                                        onConfirm: () => {
                                            removeDecor(slot.id);
                                            setConfirmConfig(null);
                                        }
                                    });
                                }
                            }
                        }}
                        className={`
                            relative aspect-square rounded-[2.5rem] transition-all duration-200 active:scale-95 shadow-lg overflow-hidden flex flex-col items-center justify-center
                            ${!slot.isUnlocked 
                                ? 'bg-slate-200 border-b-[6px] border-slate-300' 
                                : !decor 
                                    ? 'bg-purple-50 border-b-[6px] border-purple-200 border-dashed' 
                                    : 'bg-[#F3E5F5] border-b-[6px] border-[#E1BEE7]'}
                        `}
                      >
                          {!slot.isUnlocked ? (
                              <Lock className="text-slate-400" />
                          ) : !decor ? (
                              <>
                                <div className="text-3xl opacity-30 mb-2">✨</div>
                                <span className="text-[10px] font-black text-purple-400 uppercase">Trống</span>
                              </>
                          ) : (
                              <>
                                  {imgUrl ? (
                                      <div className={`w-full h-full p-2 z-10 transition-all ${animClass}`}>
                                          <img 
                                            src={imgUrl} 
                                            alt={decor.name} 
                                            className="w-full h-full object-contain drop-shadow-md" 
                                          />
                                      </div>
                                  ) : (
                                      <div className={`text-7xl z-10 transition-all drop-shadow-md ${animClass}`}>
                                          {decor.emoji}
                                      </div>
                                  )}
                                  
                                  {/* Multi-buff visual indicator */}
                                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex flex-col gap-0.5 items-center z-20">
                                      <div className="bg-white/90 px-2 py-0.5 rounded-lg backdrop-blur-sm border border-purple-100 shadow-sm min-w-[60px] text-center">
                                          <span className="text-[9px] font-black text-slate-700 uppercase tracking-tighter truncate">{decor.name}</span>
                                      </div>
                                      {decor.buffs && decor.buffs.length > 0 && (
                                          <div className="flex gap-1">
                                              {decor.buffs.slice(0, 2).map((b, i) => (
                                                  <span key={i} className="text-[7px] font-bold text-white bg-purple-500 px-1.5 py-0.5 rounded-full shadow-sm">
                                                      {b.value}% {b.type}
                                                  </span>
                                              ))}
                                              {decor.buffs.length > 2 && <span className="text-[7px] bg-purple-500 text-white px-1 rounded-full">+</span>}
                                          </div>
                                      )}
                                  </div>
                              </>
                          )}
                      </button>
                  )
              })}
              {renderEmptySlot("Mở Ô Mới", () => handleExpand('DECOR'))}
          </div>
      );
  };

  const getReadyCount = () => {
      let count = 0;
      userState.farmPlots.forEach(p => {
          if (p.cropId && p.plantedAt && !p.hasBug && !p.hasWeed) {
              const c = CROPS.find(crop => crop.id === p.cropId);
              if (c && (now - p.plantedAt)/1000 >= c.growthTime) count++;
          }
      });
      return count;
  };

  const readyCount = getReadyCount();
  const nextLevelExp = (userState.farmLevel || 1) * 100;

  return (
    <div className="w-full h-full bg-[#E0F7FA] relative overflow-y-auto no-scrollbar flex flex-col">
        {/* ... (Styles and Header - Unchanged) ... */}
        {/* ... */}
        
        {/* HEADER WITH LV AND XP */}
        <div className="bg-white/90 backdrop-blur-md px-4 py-3 shadow-lg flex justify-between items-center z-40 sticky top-0 border-b-4 border-green-100/50">
            <button onClick={onExit} className="p-2 text-slate-600 hover:bg-slate-100 rounded-2xl active:scale-90 transition-all bg-white border border-slate-200 shadow-sm z-50 relative"><Home size={24}/></button>
            
            <div className="flex flex-1 mx-4 items-center gap-2">
                <div className="flex-1 bg-slate-100 h-9 rounded-full border-2 border-slate-200 relative overflow-hidden flex items-center px-3">
                    <div className="absolute left-0 top-0 h-full bg-blue-400 transition-all duration-500" style={{ width: `${Math.min(100, ((userState.farmExp || 0) / nextLevelExp) * 100)}%` }} />
                    <div className="relative z-10 flex w-full justify-between items-center text-[10px] font-black text-slate-600">
                        <span className="bg-white/50 px-1 rounded">LV {userState.farmLevel || 1}</span>
                        <span>{userState.farmExp}/{nextLevelExp} XP</span>
                    </div>
                </div>
                <div className="flex flex-col gap-1 items-end">
                    <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200 text-[10px] font-black text-amber-700 min-w-[60px] justify-between">
                        <Coins size={10} fill="currentColor"/> {userState.coins}
                    </div>
                    <div className="flex items-center gap-1 bg-purple-50 px-2 py-0.5 rounded-lg border border-purple-200 text-[10px] font-black text-purple-700 min-w-[60px] justify-between">
                        <Star size={10} fill="currentColor"/> {userState.stars}
                    </div>
                </div>
            </div>
        </div>

        {/* TOP HUD AREA */}
        {renderHUD()}

        {/* MAIN SCROLLABLE AREA */}
        <div className="flex-1 relative z-10 pb-4">
            {activeSection === 'CROPS' && renderCrops()}
            {activeSection === 'ANIMALS' && renderAnimals()}
            {activeSection === 'MACHINES' && renderMachines()}
            {activeSection === 'DECOR' && renderDecors()}
        </div>

        {/* BOTTOM TABS */}
        <div className="sticky bottom-0 z-50">
            {renderSectionTabs()}
        </div>

        {/* Harvest All Button - Fixed Position Icon */}
        {readyCount >= 2 && (
            <div className="fixed bottom-24 right-4 z-[60] animate-bounce">
                <button 
                    onClick={() => {
                        const res = harvestAll();
                        if (res.success) {
                            playSFX('success');
                            if(barnBtnRef.current) {
                                const rect = barnBtnRef.current.getBoundingClientRect();
                                addFloatingText(rect.left, rect.top, `+${res.count} Sản phẩm`, "text-orange-500");
                            }
                        }
                    }}
                    className="bg-amber-500 text-white w-16 h-16 rounded-full shadow-2xl border-4 border-white flex flex-col items-center justify-center font-black text-[10px] uppercase hover:bg-amber-600 transition-all active:scale-90"
                >
                    <Hand size={24} />
                    <span>Thu hoạch</span>
                    <span className="bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center absolute -top-1 -right-1 border-2 border-white shadow-sm">{readyCount}</span>
                </button>
            </div>
        )}

        {/* --- FX LAYERS --- */}
        {floatingTexts.map(item => (
            <div
                key={item.id}
                className={`fixed z-[100] font-black text-lg pointer-events-none drop-shadow-md animate-floatUp ${item.color}`}
                style={{ left: item.x, top: item.y }}
            >
                {item.text}
            </div>
        ))}

        {flyingItems.map(item => (
            <div
                key={item.id}
                className="fixed z-[100] text-4xl pointer-events-none"
                style={{
                    left: item.x,
                    top: item.y,
                    animation: `flyToBarn 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards`
                }}
            >
                {item.emoji}
            </div>
        ))}

        {/* Level Up Overlay */}
        {showLevelUp && (
            <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/70 animate-fadeIn backdrop-blur-sm">
                <div className="relative animate-bounce">
                    <div className="text-[150px]">🆙</div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Sparkles size={120} className="text-yellow-300 animate-spin-slow" />
                    </div>
                </div>
                <h2 className="text-4xl font-black text-white mt-4 drop-shadow-lg text-center bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                    LÊN CẤP {userState.farmLevel}!
                </h2>
                <div className="flex gap-4 mt-8">
                    {[...Array(10)].map((_, i) => (
                        <div key={i} className="text-2xl animate-ping" style={{ animationDelay: `${i * 0.1}s` }}>🎉</div>
                    ))}
                </div>
            </div>
        )}

        {/* Modals */}
        {activeModal === 'MANAGE_ITEM' && manageItemConfig && (
            <ItemManageModal 
                item={[...ANIMALS, ...MACHINES].find(i => i.id === manageItemConfig.itemId)!}
                onStore={() => {
                    const res = reclaimItem(manageItemConfig.slotId, manageItemConfig.type, 'STORE');
                    if(res.success) { playSFX('success'); setActiveModal('NONE'); }
                }}
                onSell={() => {
                    const res = reclaimItem(manageItemConfig.slotId, manageItemConfig.type, 'SELL');
                    if(res.success) { playSFX('coins'); setActiveModal('NONE'); }
                }}
                onClose={() => setActiveModal('NONE')}
            />
        )}

        {activeModal === 'PRODUCTION' && productionConfig && (
            <MachineProductionModal
                machine={MACHINES.find(m => m.id === productionConfig.machineId)!}
                recipes={RECIPES.filter(r => r.machineId === productionConfig.machineId)}
                inventory={userState.harvestedCrops || {}}
                allItems={[...CROPS, ...PRODUCTS]}
                onProduce={(recipeId) => {
                    const res = startProcessing(productionConfig.slotId, recipeId);
                    if (res && !res.success) {
                        handleShowAlert(res.msg);
                    } else {
                        playSFX('success');
                    }
                }}
                onClose={() => {
                    setActiveModal('NONE');
                    setProductionConfig(null);
                }}
                queueLength={userState.machineSlots?.find(s => s.id === productionConfig.slotId)?.queue?.length || 0}
                onShowAlert={handleShowAlert}
            />
        )}

        {activeModal === 'PLOT' && selectedId && (
            <PlotModal 
                plot={userState.farmPlots.find(p => p.id === selectedId)!}
                inventory={userState.inventory}
                waterDrops={userState.waterDrops}
                fertilizers={userState.fertilizers}
                userCoins={userState.coins}
                weather={userState.weather}
                nextPlotCost={500}
                onAction={(action, data) => {
                    if (action === 'PLANT') {
                        const res = plantSeed(selectedId, data);
                        if(res.success) { playSFX('success'); setActiveModal('NONE'); }
                        else { handleShowAlert(res.msg); }
                    }
                    if (action === 'WATER') {
                        const res = waterPlot(selectedId, CROPS.find(c => c.id === userState.farmPlots.find(p => p.id === selectedId)?.cropId)!); 
                        if (res.success) {
                            setActiveModal('NONE');
                            const rect = document.getElementById('well-btn')?.getBoundingClientRect();
                            if(rect) addFloatingText(rect.left, rect.top, "-1 Nước", "text-blue-400");
                        }
                    }
                    if (action === 'FERTILIZER') {
                        if (userState.fertilizers > 0) {
                            onUpdateState(prev => ({
                                ...prev,
                                fertilizers: prev.fertilizers - 1,
                                farmPlots: prev.farmPlots.map(p => p.id === selectedId ? { ...p, plantedAt: (p.plantedAt || 0) - (CROPS.find(c=>c.id===p.cropId)?.growthTime || 0)*500 } : p)
                            }));
                            playSFX('powerup');
                            setActiveModal('NONE');
                        }
                    }
                    if (action === 'HARVEST') {
                        harvestPlot(selectedId, CROPS.find(c => c.id === userState.farmPlots.find(p => p.id === selectedId)?.cropId)!); 
                        setActiveModal('NONE');
                    }
                    if (action === 'UNLOCK') {
                        setActiveModal('NONE');
                        handleExpand('PLOT');
                    }
                }}
                onClose={() => setActiveModal('NONE')} 
            />
        )}

        {activeModal === 'BARN' && (
            <BarnModal 
                crops={[...CROPS, ...PRODUCTS]} 
                harvested={userState.harvestedCrops || {}} 
                activeOrders={userState.activeOrders || []}
                onSell={(itemId) => {
                    const item = [...CROPS, ...PRODUCTS].find(i => i.id === itemId);
                    if (item && (userState.harvestedCrops?.[itemId] || 0) > 0) {
                        onUpdateState(prev => ({
                            ...prev,
                            coins: prev.coins + item.sellPrice,
                            harvestedCrops: { ...prev.harvestedCrops, [itemId]: (prev.harvestedCrops?.[itemId] || 0) - 1 }
                        }));
                        playSFX('coins');
                    }
                }}
                onSellAll={(itemId) => {
                    const item = [...CROPS, ...PRODUCTS].find(i => i.id === itemId);
                    const count = userState.harvestedCrops?.[itemId] || 0;
                    if (item && count > 0) {
                        onUpdateState(prev => ({
                            ...prev,
                            coins: prev.coins + (item.sellPrice * count),
                            harvestedCrops: { ...prev.harvestedCrops, [itemId]: 0 }
                        }));
                        playSFX('coins');
                    }
                }}
                onSellEverything={() => {}}
                onClose={() => setActiveModal('NONE')}
            />
        )}

        {(activeModal === 'SHOP') && (
            <ShopModal 
                crops={CROPS} 
                animals={ANIMALS} 
                machines={MACHINES} 
                decorations={DECORATIONS} 
                recipes={RECIPES}
                products={PRODUCTS}
                userState={userState} 
                onBuySeed={(crop, amount) => {
                    const res = buyItem(crop, amount);
                    if (!res.success) handleShowAlert(res.msg);
                }}
                onBuyAnimal={(animal) => {
                    const res = buyItem(animal, 1);
                    if (!res.success) handleShowAlert(res.msg);
                }}
                onBuyMachine={(machine) => {
                    const res = buyItem(machine, 1);
                    if (!res.success) handleShowAlert(res.msg);
                }}
                onBuyDecor={(decor) => {
                    const res = buyItem(decor, 1);
                    if (!res.success) handleShowAlert(res.msg);
                }}
                onClose={() => { setActiveModal('NONE'); setSelectedId(null); }} 
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
                        missions: prev.missions?.map(miss => miss.id === m.id ? { ...miss, claimed: true } : miss)
                    }));
                }}
                onClose={() => setActiveModal('NONE')} 
            />
        )}

        {activeModal === 'ORDERS' && (
            <OrderBoard 
                orders={userState.activeOrders || []} 
                items={[...CROPS, ...PRODUCTS]} 
                inventory={userState.harvestedCrops || {}}
                onDeliver={(o) => deliverOrder(o)}
                onRefresh={() => {
                    playSFX('click');
                    setQuizContext({ type: 'NEW_ORDER' });
                    setActiveModal('QUIZ');
                }}
                onClose={() => setActiveModal('NONE')}
                onShowAlert={handleShowAlert}
            />
        )}

        {activeModal === 'INVENTORY' && (
            <InventoryModal 
                initialTab={initialInvTab}
                inventory={userState.inventory} 
                seeds={CROPS} 
                animals={ANIMALS} 
                machines={MACHINES} 
                decorations={DECORATIONS} 
                ownedAnimals={userState.livestockSlots || []} 
                ownedMachines={userState.machineSlots || []} 
                ownedDecorations={userState.decorations || []}
                activeDecorIds={userState.decorSlots?.map(s => s.decorId).filter(id => id !== null) as string[]} 
                allItems={[...CROPS, ...PRODUCTS]} 
                mode={inventoryMode}
                onSelectSeed={(seedId) => {
                    if (selectedId) {
                        const res = plantSeed(selectedId, seedId);
                        if(res.success) { playSFX('success'); setActiveModal('NONE'); }
                        else { handleShowAlert(res.msg); }
                    }
                }}
                onSelectAnimal={(animalId) => {
                    if (selectedId) {
                        const res = placeAnimal(selectedId, animalId);
                        if(res.success) { playSFX('success'); setActiveModal('NONE'); }
                        else { handleShowAlert(res.msg); }
                    }
                }}
                onSelectMachine={(machineId) => {
                    if (selectedId) {
                        const res = placeMachine(selectedId, machineId);
                        if(res.success) { playSFX('success'); setActiveModal('NONE'); }
                        else { handleShowAlert(res.msg); }
                    }
                }}
                onToggleDecor={(decorId) => {
                    if (selectedId) {
                        const res = placeDecor(selectedId, decorId);
                        if(res.success) { playSFX('success'); setActiveModal('NONE'); }
                    }
                }}
                onGoToShop={() => { setActiveModal('SHOP'); }}
                onClose={() => setActiveModal('NONE')}
            />
        )}

        {activeModal === 'QUIZ' && quizContext && (
            <LearningQuizModal 
                words={allWords} 
                type={quizContext.type} 
                onSuccess={onQuizSuccess} 
                onClose={() => { setActiveModal('NONE'); setQuizContext(null); }} 
                onShowAlert={handleShowAlert}
            />
        )}

        <ConfirmModal 
            isOpen={!!confirmConfig}
            message={confirmConfig?.message || ''}
            onConfirm={confirmConfig?.onConfirm || (() => {})}
            onCancel={() => setConfirmConfig(null)}
        />

        <ConfirmModal 
            isOpen={!!alertConfig}
            message={alertConfig?.message || ''}
            onConfirm={() => setAlertConfig(null)}
            type={alertConfig?.type || 'INFO'}
            singleButton={true}
        />
    </div>
  );
};
