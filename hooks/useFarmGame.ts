
import { useState, useEffect, useCallback } from 'react';
import { UserState, FarmPlot, FarmOrder, Crop, Mission, LivestockSlot } from '../types';
import { CROPS, ANIMALS, PRODUCTS, RECIPES, MACHINES, FARM_ACHIEVEMENTS_DATA, DAILY_MISSION_POOL } from '../data/farmData';
import { playSFX } from '../utils/sound';

export const useFarmGame = (
  userState: UserState, 
  onUpdateState: (newState: UserState | ((prev: UserState) => UserState)) => void
) => {
  const [now, setNow] = useState(Date.now());
  
  // Helper: Create a single order (Updated for new ecosystem)
  const createSingleOrder = (grade: number, completedCount: number, currentLivestock: LivestockSlot[] = []) => {
      const npcs = ["Bác Gấu", "Cô Mèo", "Bạn Thỏ", "Chú Hổ", "Bà Cáo", "Thầy Rùa", "Chị Ong Vàng", "Anh Kiến", "Cụ Voi"];
      
      // Filter unlocked items
      const level = userState.farmLevel || 1;
      const unlockedCrops = CROPS.filter(c => !c.isMagic && level >= (c.unlockReq || 0));
      
      // Products available from machines or animals that user MIGHT have access to based on level
      const unlockedAnimals = ANIMALS.filter(a => level >= (a.minLevel || 0));
      const unlockedMachines = MACHINES.filter(m => level >= (m.minLevel || 0));
      
      const availableRawProducts = PRODUCTS.filter(p => 
          p.type === 'PRODUCT' && unlockedAnimals.some(a => a.produceId === p.id)
      );
      const availableProcessed = PRODUCTS.filter(p =>
          p.type === 'PROCESSED' && unlockedMachines.some(m => RECIPES.some(r => r.machineId === m.id && r.outputId === p.id))
      );

      const pool = [...unlockedCrops, ...availableRawProducts, ...availableProcessed];
      const safePool = pool.length > 0 ? pool : [CROPS[0]]; // Fallback

      const count = Math.floor(Math.random() * 2) + 1; // 1 or 2 items per order
      const tempReqs: Record<string, number> = {};

      for(let i=0; i<count; i++) {
          const randomItem = safePool[Math.floor(Math.random() * safePool.length)];
          const amount = Math.floor(Math.random() * 3) + 1; 
          tempReqs[randomItem.id] = (tempReqs[randomItem.id] || 0) + amount;
      }

      const requirements = [];
      let totalValue = 0;
      let totalExp = 0;

      for (const [itemId, amount] of Object.entries(tempReqs)) {
          requirements.push({ cropId: itemId, amount });
          const itemData = [...CROPS, ...PRODUCTS].find(x => x.id === itemId);
          if (itemData) {
              totalValue += itemData.sellPrice * amount;
              const expBase = itemData.type === 'CROP' ? (itemData as Crop).exp : 20;
              totalExp += expBase * amount * 3.0; // Balanced XP
          }
      }

      return {
          id: Math.random().toString(36).substr(2, 9),
          npcName: npcs[Math.floor(Math.random() * npcs.length)],
          requirements,
          rewardCoins: Math.ceil((totalValue * 1.5) / 10) * 10,
          rewardExp: Math.ceil(totalExp / 5) * 5,
          expiresAt: Date.now() + (Math.random() * 10 + 5) * 60 * 1000 // 5-15 minutes
      };
  };

  // --- INIT LOGIC (Effect) ---
  useEffect(() => {
      const todayStr = new Date().toDateString();
      onUpdateState(prev => {
          let newState = { ...prev };
          let changed = false;

          // 1. Initialize Achievements if missing
          const hasAchievements = prev.missions?.some(m => m.category === 'ACHIEVEMENT');
          if (!hasAchievements) {
              const achievements = FARM_ACHIEVEMENTS_DATA;
              newState.missions = [...(prev.missions || []), ...achievements];
              changed = true;
          }

          // 2. Initialize Daily Missions if new day
          if (prev.lastMissionUpdate !== todayStr) {
              const currentAchievements = newState.missions?.filter(m => m.category === 'ACHIEVEMENT') || [];
              
              // Pick 3 random daily missions from pool
              const dailies = [...DAILY_MISSION_POOL]
                  .sort(() => 0.5 - Math.random())
                  .slice(0, 3)
                  .map(m => ({ ...m, id: m.id + '_' + Date.now(), current: 0, completed: false, claimed: false }));
              
              newState.missions = [...currentAchievements, ...dailies];
              newState.lastMissionUpdate = todayStr;
              // Reset Well Count on new day
              newState.wellUsageCount = 0; 
              newState.lastWellDate = todayStr;
              changed = true;
          }

          // 3. Ensure Orders are initialized
          if (!prev.activeOrders || prev.activeOrders.length === 0) {
              const initialOrders = [
                  createSingleOrder(1, 0, prev.livestockSlots || []),
                  createSingleOrder(1, 0, prev.livestockSlots || []),
                  createSingleOrder(1, 0, prev.livestockSlots || [])
              ];
              newState.activeOrders = initialOrders;
              changed = true;
          }

          return changed ? newState : prev;
      });
  }, []); 

  // --- MAIN GAME LOOP ---
  useEffect(() => {
    const interval = setInterval(() => {
        const currentTime = Date.now();
        setNow(currentTime);

        onUpdateState(prev => {
            let newState = { ...prev };
            let hasChanges = false;

            // 1. Weather Logic
            if (Math.random() < 0.002) { 
                const newWeather = prev.weather === 'SUNNY' ? 'RAINY' : 'SUNNY';
                newState.weather = newWeather;
                hasChanges = true;
                if (newWeather === 'RAINY') {
                    newState.farmPlots = prev.farmPlots.map(p => 
                        p.cropId && !p.isWatered ? { ...p, isWatered: true } : p
                    );
                }
            }

            // 2. Bugs & Weeds Spawn
            if (Math.random() < 0.01) { // 1% chance per second
                const cleanPlots = prev.farmPlots.filter(p => p.isUnlocked && p.cropId && !p.hasBug && !p.hasWeed);
                if (cleanPlots.length > 0) {
                    const target = cleanPlots[Math.floor(Math.random() * cleanPlots.length)];
                    const isBug = Math.random() > 0.5;
                    newState.farmPlots = prev.farmPlots.map(p => 
                        p.id === target.id ? { ...p, hasBug: isBug, hasWeed: !isBug } : p
                    );
                    hasChanges = true;
                }
            }

            // 3. Orders Management
            let currentOrders = prev.activeOrders || [];
            const validOrders = currentOrders.filter(o => o.expiresAt > currentTime);
            
            if (validOrders.length !== currentOrders.length) {
                currentOrders = validOrders;
                hasChanges = true;
            }

            if (currentOrders.length < 3 && Math.random() < 0.1) {
                const newOrder = createSingleOrder(prev.grade || 1, prev.completedLevels?.length || 0, prev.livestockSlots || []);
                currentOrders = [...currentOrders, newOrder];
                hasChanges = true;
            }
            
            if (hasChanges) {
                newState.activeOrders = currentOrders;
            }

            return hasChanges ? newState : prev;
        });

    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const updateMissionProgress = useCallback((type: Mission['type'], amount: number) => {
      onUpdateState(prev => {
          if (!prev.missions) return prev;
          let changed = false;
          const newMissions = prev.missions.map(m => {
              if (m.type === type && !m.completed) {
                  const newCurrent = m.current + amount;
                  if (newCurrent !== m.current) {
                      changed = true;
                      return { ...m, current: newCurrent, completed: newCurrent >= m.target };
                  }
              }
              return m;
          });
          return changed ? { ...prev, missions: newMissions } : prev;
      });
  }, [onUpdateState]);

  const generateOrders = useCallback((grade: number, completedCount: number, currentLivestock: LivestockSlot[] = []) => {
      const newOrders: FarmOrder[] = [];
      while (newOrders.length < 3) {
          newOrders.push(createSingleOrder(grade, completedCount, currentLivestock));
      }
      return newOrders;
  }, []);

  const canAfford = (amount: number, currency: 'COIN' | 'STAR' = 'COIN') => {
      if (currency === 'STAR') return (userState.stars || 0) >= amount;
      return userState.coins >= amount;
  };

  // --- ACTIONS ---

  const checkWellUsage = () => {
      // 5 times per day max
      if ((userState.wellUsageCount || 0) >= 5) {
          return { allowed: false, msg: "Bé đã lấy nước 5 lần hôm nay rồi. Mai quay lại nhé!" };
      }
      return { allowed: true };
  };

  const useWell = () => {
      onUpdateState(prev => {
          const drops = Math.random() < 0.2 ? 5 : 3; // 20% chance for 5 drops, else 3
          return {
              ...prev,
              waterDrops: prev.waterDrops + drops,
              wellUsageCount: (prev.wellUsageCount || 0) + 1
          };
      });
      playSFX('water');
      return true; // Used successfully
  };

  const plantSeed = (plotId: number, seedId: string) => {
      const currentInventory = userState.inventory || {};
      const count = currentInventory[seedId] || 0;
      
      if (count <= 0) return { success: false, msg: "Hết hạt giống rồi bé ơi!" };
      
      playSFX('click');
      onUpdateState(prev => ({
          ...prev,
          inventory: { ...prev.inventory, [seedId]: count - 1 },
          farmPlots: prev.farmPlots.map(p => p.id === plotId ? { 
              ...p, 
              cropId: seedId, 
              plantedAt: Date.now(), 
              isWatered: prev.weather === 'RAINY',
              hasWeed: Math.random() < 0.1, 
              hasBug: false, 
              hasMysteryBox: false 
          } : p)
      }));
      return { success: true };
  };

  const waterPlot = (plotId: number, crop: Crop) => {
      if (userState.waterDrops <= 0) return { success: false, msg: "Bé cần thêm nước từ Giếng Thần!" };
      
      playSFX('water');
      const reduction = crop.growthTime * 0.25 * 1000;
      onUpdateState(prev => ({ 
          ...prev, 
          waterDrops: Math.max(0, prev.waterDrops - 1), 
          farmPlots: prev.farmPlots.map(p => p.id === plotId ? { ...p, isWatered: true, plantedAt: (p.plantedAt || Date.now()) - reduction } : p) 
      }));
      updateMissionProgress('WATER', 1);
      return { success: true };
  };

  // Resolve Pest/Weed via Quiz
  const resolvePest = (plotId: number) => {
      onUpdateState(prev => {
          let newExp = (prev.farmExp || 0) + 10;
          let newLevel = prev.farmLevel || 1;
          if (newExp >= newLevel * 100) { newLevel += 1; newExp -= newLevel * 100; }

          return {
            ...prev,
            farmExp: newExp,
            farmLevel: newLevel,
            farmPlots: prev.farmPlots.map(p => p.id === plotId ? { ...p, hasBug: false, hasWeed: false } : p)
          };
      });
      playSFX('success');
      updateMissionProgress('QUIZ', 1);
      return { success: true };
  };

  const harvestPlot = (plotId: number, crop: Crop) => {
      playSFX('harvest');
      onUpdateState(prev => {
          const currentHarvest = prev.harvestedCrops || {};
          const newHarvest = { ...currentHarvest };
          newHarvest[crop.id] = (newHarvest[crop.id] || 0) + 1;
          
          let newExp = (prev.farmExp || 0) + crop.exp;
          let newLevel = prev.farmLevel || 1;
          const XP_NEEDED = newLevel * 100;
          if (newExp >= XP_NEEDED) { newLevel += 1; newExp -= XP_NEEDED; }

          return {
              ...prev,
              harvestedCrops: newHarvest,
              farmExp: newExp,
              farmLevel: newLevel,
              farmPlots: prev.farmPlots.map(p => p.id === plotId ? { 
                  ...p, cropId: null, plantedAt: null, isWatered: false, hasBug: false, hasWeed: false, hasMysteryBox: Math.random() < 0.15 
              } : p)
          };
      });
      updateMissionProgress('HARVEST', 1);
      return { success: true };
  };

  const harvestAll = () => {
      const now = Date.now();
      let harvestedCount = 0;
      let expGained = 0;
      const newHarvestedCrops = { ...(userState.harvestedCrops || {}) };
      const newFarmPlots = [...userState.farmPlots];

      // Harvest Crops
      newFarmPlots.forEach((plot, index) => {
          if (plot.cropId && plot.plantedAt && !plot.hasBug && !plot.hasWeed) { // Can only harvest healthy crops
              const crop = CROPS.find(c => c.id === plot.cropId);
              if (crop) {
                  const elapsed = (now - plot.plantedAt) / 1000;
                  if (elapsed >= crop.growthTime) {
                      harvestedCount++;
                      expGained += crop.exp;
                      newHarvestedCrops[crop.id] = (newHarvestedCrops[crop.id] || 0) + 1;
                      
                      newFarmPlots[index] = { 
                          ...plot, 
                          cropId: null, 
                          plantedAt: null, 
                          isWatered: false, 
                          hasBug: false, 
                          hasWeed: false, 
                          hasMysteryBox: Math.random() < 0.15 
                      };
                  }
              }
          }
      });

      if (harvestedCount > 0) {
          playSFX('success');
          onUpdateState(prev => {
              let newExp = (prev.farmExp || 0) + expGained;
              let newLevel = prev.farmLevel || 1;
              let loops = 0;
              while (newExp >= newLevel * 100 && loops < 10) {
                  newExp -= newLevel * 100;
                  newLevel++;
                  loops++;
              }

              return {
                  ...prev,
                  harvestedCrops: newHarvestedCrops,
                  farmPlots: newFarmPlots,
                  farmExp: newExp,
                  farmLevel: newLevel
              };
          });
          updateMissionProgress('HARVEST', harvestedCount);
          return { success: true, count: harvestedCount };
      }
      return { success: false, count: 0 };
  };

  const buyAnimal = (slotId: number, animalId: string) => {
      const animal = ANIMALS.find(a => a.id === animalId);
      if (!animal) return { success: false, msg: "Lỗi dữ liệu vật nuôi" };
      
      const currency = animal.currency || 'COIN';
      if (!canAfford(animal.cost, currency)) return { success: false, msg: `Bé không đủ ${currency === 'STAR' ? 'Sao' : 'Xu'} rồi!` };

      playSFX('success');
      onUpdateState(prev => {
          const currentSlots = prev.livestockSlots || Array(4).fill(null).map((_,i) => ({ id: i+1, isUnlocked: true, animalId: null, fedAt: null }));
          const newState = {
              ...prev,
              livestockSlots: currentSlots.map(s => s.id === slotId ? { ...s, animalId: animal.id, fedAt: null } : s)
          };
          if (currency === 'STAR') newState.stars = (prev.stars || 0) - animal.cost;
          else newState.coins = prev.coins - animal.cost;
          return newState;
      });
      return { success: true };
  };

  const feedAnimal = (slotId: number) => {
      const slot = userState.livestockSlots?.find(s => s.id === slotId);
      if (!slot || !slot.animalId) return;
      const animal = ANIMALS.find(a => a.id === slot.animalId);
      if (!animal) return;

      const feedName = CROPS.find(c => c.id === animal.feedCropId)?.name || 'thức ăn';
      const userFeedAmount = userState.harvestedCrops?.[animal.feedCropId] || 0;

      if (userFeedAmount < animal.feedAmount) {
          return { success: false, msg: `Bé thiếu ${animal.feedAmount - userFeedAmount} ${feedName} để cho ${animal.name} ăn!` };
      }

      playSFX('click'); 
      onUpdateState(prev => ({
          ...prev,
          harvestedCrops: {
              ...prev.harvestedCrops,
              [animal.feedCropId]: (prev.harvestedCrops?.[animal.feedCropId] || 0) - animal.feedAmount
          },
          livestockSlots: prev.livestockSlots?.map(s => s.id === slotId ? { ...s, fedAt: Date.now() } : s)
      }));
      updateMissionProgress('FEED', 1);
      return { success: true, msg: `Đã cho ${animal.name} ăn ngon lành!` };
  };

  const collectProduct = (slotId: number) => {
      const slot = userState.livestockSlots?.find(s => s.id === slotId);
      if (!slot || !slot.animalId || !slot.fedAt) return;
      const animal = ANIMALS.find(a => a.id === slot.animalId);
      if (!animal) return;

      playSFX('harvest');
      onUpdateState(prev => {
          const currentHarvest = prev.harvestedCrops || {};
          const newHarvest = { ...currentHarvest };
          newHarvest[animal.produceId] = (newHarvest[animal.produceId] || 0) + 1;

          let newExp = (prev.farmExp || 0) + animal.exp;
          let newLevel = prev.farmLevel || 1;
          const XP_NEEDED = newLevel * 100;
          if (newExp >= XP_NEEDED) { newLevel += 1; newExp -= XP_NEEDED; }

          return {
              ...prev,
              harvestedCrops: newHarvest,
              farmExp: newExp,
              farmLevel: newLevel,
              livestockSlots: prev.livestockSlots?.map(s => s.id === slotId ? { ...s, fedAt: null } : s)
          };
      });
      return { success: true };
  };

  const buyMachine = (slotId: number, machineId: string) => {
      const machine = MACHINES.find(m => m.id === machineId);
      if (!machine) return { success: false, msg: "Lỗi dữ liệu máy móc" };
      const currency = machine.currency || 'COIN';
      if (!canAfford(machine.cost, currency)) return { success: false, msg: `Bé không đủ ${currency === 'STAR' ? 'Sao' : 'Xu'} rồi!` };

      playSFX('success');
      onUpdateState(prev => {
          const currentSlots = prev.machineSlots || []; 
          const newState = {
              ...prev,
              machineSlots: currentSlots.map(s => s.id === slotId ? { ...s, machineId: machine.id, activeRecipeId: null, startedAt: null } : s)
          };
          if (currency === 'STAR') newState.stars = (prev.stars || 0) - machine.cost;
          else newState.coins = prev.coins - machine.cost;
          return newState;
      });
      return { success: true };
  };

  const startProcessing = (slotId: number, recipeId: string) => {
      const slot = userState.machineSlots?.find(s => s.id === slotId);
      if (!slot || !slot.machineId) return { success: false, msg: "Lỗi máy móc" };
      
      const recipe = RECIPES.find(r => r.id === recipeId);
      if (!recipe) return { success: false, msg: "Lỗi công thức" };

      const currentHarvest = userState.harvestedCrops || {};
      // Check inputs
      for (const input of recipe.input) {
          if ((currentHarvest[input.id] || 0) < input.amount) {
              return { success: false, msg: `Thiếu nguyên liệu!` };
          }
      }

      playSFX('click');
      onUpdateState(prev => {
          const newHarvest = { ...(prev.harvestedCrops || {}) };
          recipe.input.forEach(input => {
              newHarvest[input.id] = (newHarvest[input.id] || 0) - input.amount;
          });

          return {
              ...prev,
              harvestedCrops: newHarvest,
              machineSlots: prev.machineSlots?.map(s => s.id === slotId ? { ...s, activeRecipeId: recipe.id, startedAt: Date.now() } : s)
          };
      });
      return { success: true };
  };

  const collectMachine = (slotId: number) => {
      const slot = userState.machineSlots?.find(s => s.id === slotId);
      if (!slot || !slot.activeRecipeId) return { success: false, msg: "Không có gì để thu hoạch" };
      
      const recipe = RECIPES.find(r => r.id === slot.activeRecipeId);
      if (!recipe) return { success: false, msg: "Lỗi công thức" };

      playSFX('harvest');
      onUpdateState(prev => {
          const currentHarvest = prev.harvestedCrops || {};
          const newHarvest = { ...currentHarvest };
          newHarvest[recipe.outputId] = (newHarvest[recipe.outputId] || 0) + 1;

          let newExp = (prev.farmExp || 0) + recipe.exp;
          let newLevel = prev.farmLevel || 1;
          const XP_NEEDED = newLevel * 100;
          if (newExp >= XP_NEEDED) { newLevel += 1; newExp -= XP_NEEDED; }

          return {
              ...prev,
              harvestedCrops: newHarvest,
              farmExp: newExp,
              farmLevel: newLevel,
              machineSlots: prev.machineSlots?.map(s => s.id === slotId ? { ...s, activeRecipeId: null, startedAt: null } : s)
          };
      });
      return { success: true };
  };

  const deliverOrder = (order: FarmOrder) => {
      const currentCrops = userState.harvestedCrops || {};
      let hasEnough = true;
      order.requirements.forEach(req => {
          if ((currentCrops[req.cropId] || 0) < req.amount) hasEnough = false;
      });

      if (!hasEnough) return { success: false, msg: "Bé chưa đủ hàng để giao!" };

      playSFX('success');
      onUpdateState(prev => {
          const newHarvested = { ...(prev.harvestedCrops || {}) };
          order.requirements.forEach(req => { newHarvested[req.cropId] -= req.amount; });
          
          let newExp = (prev.farmExp || 0) + order.rewardExp;
          let newLevel = prev.farmLevel || 1;
          const XP_NEEDED = newLevel * 100; 
          if (newExp >= XP_NEEDED) { newLevel += 1; newExp -= XP_NEEDED; }

          return {
              ...prev,
              coins: prev.coins + order.rewardCoins,
              harvestedCrops: newHarvested,
              farmLevel: newLevel,
              farmExp: newExp,
              activeOrders: (prev.activeOrders || []).filter(o => o.id !== order.id)
          };
      });
      updateMissionProgress('EARN', order.rewardCoins);
      return { success: true };
  };

  const addReward = (type: string, amount: number) => {
      onUpdateState(prev => ({
          ...prev,
          coins: type === 'COIN' ? prev.coins + amount : prev.coins,
          stars: type === 'STAR' ? (prev.stars || 0) + amount : (prev.stars || 0),
          fertilizers: type === 'FERTILIZER' ? prev.fertilizers + amount : prev.fertilizers,
          waterDrops: type === 'WATER' ? prev.waterDrops + amount : prev.waterDrops,
      }));
  };

  return { now, plantSeed, waterPlot, resolvePest, harvestPlot, harvestAll, buyAnimal, feedAnimal, collectProduct, buyMachine, startProcessing, collectMachine, deliverOrder, generateOrders, addReward, canAfford, updateMissionProgress, checkWellUsage, useWell };
};
