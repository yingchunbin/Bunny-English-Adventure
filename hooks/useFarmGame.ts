
import { useState, useEffect, useCallback } from 'react';
import { UserState, FarmPlot, FarmOrder, Crop, Mission, LivestockSlot, MachineSlot } from '../types';
import { CROPS, ANIMALS, PRODUCTS, RECIPES, MACHINES, FARM_ACHIEVEMENTS_DATA, DAILY_MISSION_POOL } from '../data/farmData';
import { playSFX } from '../utils/sound';

export const useFarmGame = (
  userState: UserState, 
  onUpdateState: (newState: UserState | ((prev: UserState) => UserState)) => void
) => {
  const [now, setNow] = useState(Date.now());
  
  // Helper: Calculate Base Time for an Item (in minutes)
  const getItemProductionTime = (itemId: string): number => {
      // 1. Check Crop
      const crop = CROPS.find(c => c.id === itemId);
      if (crop) return Math.ceil(crop.growthTime / 60);

      // 2. Check Animal Product
      const animal = ANIMALS.find(a => a.produceId === itemId);
      if (animal) {
          const feedCropTime = getItemProductionTime(animal.feedCropId);
          return Math.ceil(animal.produceTime / 60) + feedCropTime;
      }

      // 3. Check Machine Product
      const recipe = RECIPES.find(r => r.outputId === itemId);
      if (recipe) {
          let inputTime = 0;
          recipe.input.forEach(input => {
              inputTime = Math.max(inputTime, getItemProductionTime(input.id));
          });
          return Math.ceil(recipe.duration / 60) + inputTime;
      }

      return 5; // Default fallback
  };

  // Helper: Create a single order with calculated time
  const createSingleOrder = (grade: number, completedCount: number, currentLivestock: LivestockSlot[] = []) => {
      const npcs = ["Bác Gấu", "Cô Mèo", "Bạn Thỏ", "Chú Hổ", "Bà Cáo", "Thầy Rùa", "Chị Ong Vàng", "Anh Kiến", "Cụ Voi"];
      const level = userState.farmLevel || 1;

      const unlockedCrops = CROPS.filter(c => !c.isMagic && level >= (c.unlockReq || 0));
      
      const unlockedAnimals = ANIMALS.filter(a => level >= (a.minLevel || 0));
      const availableRawProducts = PRODUCTS.filter(p => 
          p.type === 'PRODUCT' && unlockedAnimals.some(a => a.produceId === p.id)
      );

      const ownedMachineIds = userState.machineSlots?.filter(s => s.isUnlocked && s.machineId).map(s => s.machineId) || [];
      const availableProcessed = PRODUCTS.filter(p =>
          p.type === 'PROCESSED' && unlockedMachinesCheck(p.id, ownedMachineIds)
      );

      const pool = [...unlockedCrops, ...availableRawProducts, ...availableProcessed];
      const safePool = pool.length > 0 ? pool : [CROPS[0]]; 

      let maxItems = 1;
      let maxQty = 3;
      if (level > 5) { maxItems = 2; maxQty = 5; }
      if (level > 10) { maxItems = 3; maxQty = 8; }

      const count = Math.floor(Math.random() * maxItems) + 1; 
      const tempReqs: Record<string, number> = {};

      for(let i=0; i<count; i++) {
          const randomItem = safePool[Math.floor(Math.random() * safePool.length)];
          const amount = Math.floor(Math.random() * maxQty) + 1; 
          tempReqs[randomItem.id] = (tempReqs[randomItem.id] || 0) + amount;
      }

      const requirements = [];
      let totalValue = 0;
      let totalExp = 0;
      let maxProductionTime = 0;

      for (const [itemId, amount] of Object.entries(tempReqs)) {
          requirements.push({ cropId: itemId, amount });
          
          // Value & Exp Calc
          const itemData = [...CROPS, ...PRODUCTS].find(x => x.id === itemId);
          if (itemData) {
              totalValue += itemData.sellPrice * amount;
              const expBase = itemData.type === 'CROP' ? (itemData as Crop).exp : 20;
              totalExp += expBase * amount * 3.0;
          }

          // Time Calc: Estimate time to produce this batch
          // We assume parallel production if user has multiple slots, but let's be generous.
          // Time = UnitTime * Amount.
          const unitTime = getItemProductionTime(itemId);
          const batchTime = unitTime * Math.ceil(amount / 2); // Assume 2 slots avg
          if (batchTime > maxProductionTime) maxProductionTime = batchTime;
      }

      // Order Duration Calculation
      // Minimum 15 minutes.
      // Factor: 3x production time to be safe and relaxed for kids.
      const durationMinutes = Math.max(15, maxProductionTime * 3);

      // Economy & Reward Calculation
      // Multiplier increased to 2.5 to ensure profit
      const finalCoins = Math.ceil((totalValue * 2.5) / 10) * 10;
      // 30% Chance to get 1-3 Stars
      const rewardStars = Math.random() < 0.3 ? Math.floor(Math.random() * 3) + 1 : 0;

      return {
          id: Math.random().toString(36).substr(2, 9),
          npcName: npcs[Math.floor(Math.random() * npcs.length)],
          requirements,
          rewardCoins: finalCoins,
          rewardExp: Math.ceil(totalExp / 5) * 5,
          rewardStars: rewardStars,
          expiresAt: Date.now() + (durationMinutes * 60 * 1000)
      };
  };

  const unlockedMachinesCheck = (productId: string, ownedMachineIds: string[]) => {
      const recipe = RECIPES.find(r => r.outputId === productId);
      if (!recipe) return false;
      return ownedMachineIds.includes(recipe.machineId);
  };

  // --- INIT LOGIC (Effect) ---
  useEffect(() => {
      const todayStr = new Date().toDateString();
      onUpdateState(prev => {
          let newState = { ...prev };
          let changed = false;

          // --- FIX: MERGE MISSING ACHIEVEMENTS ---
          // Identify existing achievement IDs in user state
          const currentMissionIds = new Set(prev.missions?.map(m => m.id) || []);
          
          // Find achievements in MASTER DATA that are NOT in user state
          const missingAchievements = FARM_ACHIEVEMENTS_DATA.filter(ach => !currentMissionIds.has(ach.id));

          if (missingAchievements.length > 0) {
              // Append missing achievements
              newState.missions = [...(prev.missions || []), ...missingAchievements];
              changed = true;
          }

          // Daily Mission Reset Logic
          if (prev.lastMissionUpdate !== todayStr) {
              const currentAchievements = newState.missions?.filter(m => m.category === 'ACHIEVEMENT') || [];
              const dailies = [...DAILY_MISSION_POOL]
                  .sort(() => 0.5 - Math.random())
                  .slice(0, 5) // 5 daily missions
                  .map(m => ({ ...m, id: m.id + '_' + Date.now(), current: 0, completed: false, claimed: false }));
              
              newState.missions = [...currentAchievements, ...dailies];
              newState.lastMissionUpdate = todayStr;
              newState.wellUsageCount = 0; 
              newState.lastWellDate = todayStr;
              changed = true;
          }

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

            // 1. Weather
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

            // 2. Bugs & Weeds
            if (Math.random() < 0.01) {
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

            // 3. Machine Auto-Process Queue Logic
            if (prev.machineSlots) {
                const updatedSlots = prev.machineSlots.map(slot => {
                    if (slot.activeRecipeId && slot.startedAt) {
                        const recipe = RECIPES.find(r => r.id === slot.activeRecipeId);
                        if (recipe) {
                            const elapsed = (currentTime - slot.startedAt) / 1000;
                            if (elapsed >= recipe.duration) {
                                hasChanges = true;
                                const newStorage = [...(slot.storage || []), slot.activeRecipeId];
                                
                                let nextRecipeId: string | null = null;
                                let nextStart: number | null = null;
                                let newQueue = [...(slot.queue || [])];

                                if (newQueue.length > 0) {
                                    nextRecipeId = newQueue.shift() || null;
                                    nextStart = currentTime;
                                }

                                return {
                                    ...slot,
                                    storage: newStorage,
                                    activeRecipeId: nextRecipeId,
                                    startedAt: nextStart,
                                    queue: newQueue
                                };
                            }
                        }
                    }
                    return slot;
                });
                if (hasChanges) newState.machineSlots = updatedSlots;
            }

            // 4. Animal Auto-Process (Updated Logic for Queue)
            if (prev.livestockSlots) {
                const updatedSlots = prev.livestockSlots.map(slot => {
                    if (slot.animalId) {
                        const animal = ANIMALS.find(a => a.id === slot.animalId);
                        if (animal) {
                            let newStorage = [...(slot.storage || [])];
                            let newFedAt = slot.fedAt;
                            let newQueue = slot.queue || 0;
                            let slotChanged = false;

                            // 1. Check if current feeding is done
                            if (newFedAt) {
                                const elapsed = (currentTime - newFedAt) / 1000;
                                if (elapsed >= animal.produceTime) {
                                    newStorage.push(animal.produceId);
                                    newFedAt = null; // Feeding done
                                    slotChanged = true;
                                }
                            }

                            // 2. Check if we should start next feeding from queue
                            // Limit is 3: (current_producing:1 + waiting_in_queue + storage) must handle nicely.
                            // Actually, strict limit is usually on OUTPUT storage.
                            // If storage is full (3 items), we stop.
                            if (!newFedAt && newQueue > 0 && newStorage.length < 3) {
                                newQueue--;
                                newFedAt = currentTime;
                                slotChanged = true;
                            }

                            if (slotChanged) {
                                hasChanges = true;
                                return {
                                    ...slot,
                                    storage: newStorage,
                                    fedAt: newFedAt,
                                    queue: newQueue
                                };
                            }
                        }
                    }
                    return slot;
                });
                if (hasChanges) newState.livestockSlots = updatedSlots;
            }

            // 5. Orders Management
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
      if ((userState.wellUsageCount || 0) >= 5) {
          return { allowed: false, msg: "Bé đã lấy nước 5 lần hôm nay rồi. Mai quay lại nhé!" };
      }
      return { allowed: true };
  };

  const useWell = () => {
      onUpdateState(prev => {
          const drops = Math.random() < 0.2 ? 5 : 3; 
          return {
              ...prev,
              waterDrops: prev.waterDrops + drops,
              wellUsageCount: (prev.wellUsageCount || 0) + 1
          };
      });
      playSFX('water');
      return true;
  };

  const buyItem = (item: any, amount: number) => {
      const currency = item.currency || 'COIN';
      const totalCost = item.cost * amount;

      if (!canAfford(totalCost, currency)) {
          return { success: false, msg: `Bé không đủ ${currency === 'STAR' ? 'Sao' : 'Xu'} rồi!` };
      }

      playSFX('success');
      onUpdateState(prev => {
          const newState = { ...prev };
          if (currency === 'STAR') newState.stars = (prev.stars || 0) - totalCost;
          else newState.coins = prev.coins - totalCost;
          
          newState.inventory = { ...prev.inventory, [item.id]: (prev.inventory[item.id] || 0) + amount };
          
          if (item.type === 'DECOR') {
              if (!newState.decorations?.includes(item.id)) {
                  newState.decorations = [...(newState.decorations || []), item.id];
              }
          }
          return newState;
      });
      return { success: true };
  };

  const plantSeed = (plotId: number, seedId: string) => {
      const currentInventory = userState.inventory || {};
      const count = currentInventory[seedId] || 0;
      
      if (count <= 0) return { success: false, msg: "Hết hạt giống rồi bé ơi! Hãy vào Cửa Hàng mua thêm." };
      
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

  const placeAnimal = (slotId: number, animalId: string) => {
      const count = userState.inventory[animalId] || 0;
      if (count <= 0) return { success: false, msg: "Bé chưa có con vật này trong túi đồ!" };

      playSFX('click');
      onUpdateState(prev => ({
          ...prev,
          inventory: { ...prev.inventory, [animalId]: count - 1 },
          livestockSlots: prev.livestockSlots?.map(s => s.id === slotId ? { ...s, animalId, fedAt: null, storage: [], queue: 0 } : s)
      }));
      return { success: true };
  };

  const placeMachine = (slotId: number, machineId: string) => {
      const count = userState.inventory[machineId] || 0;
      if (count <= 0) return { success: false, msg: "Bé chưa có máy này trong túi đồ!" };

      playSFX('click');
      onUpdateState(prev => ({
          ...prev,
          inventory: { ...prev.inventory, [machineId]: count - 1 },
          machineSlots: prev.machineSlots?.map(s => s.id === slotId ? { ...s, machineId, activeRecipeId: null, startedAt: null, queue: [], storage: [] } : s)
      }));
      return { success: true };
  };

  const reclaimItem = (slotId: number, type: 'ANIMAL' | 'MACHINE', action: 'STORE' | 'SELL') => {
      onUpdateState(prev => {
          const newState = { ...prev };
          let itemId: string | null = null;
          let sellPrice = 0;

          if (type === 'ANIMAL') {
              const slot = prev.livestockSlots?.find(s => s.id === slotId);
              if (slot && slot.animalId) {
                  itemId = slot.animalId;
                  const item = ANIMALS.find(a => a.id === itemId);
                  if (item) sellPrice = Math.floor(item.cost / 2);
                  newState.livestockSlots = prev.livestockSlots?.map(s => s.id === slotId ? { ...s, animalId: null, fedAt: null, storage: [], queue: 0 } : s);
              }
          } else {
              const slot = prev.machineSlots?.find(s => s.id === slotId);
              if (slot && slot.machineId) {
                  itemId = slot.machineId;
                  const item = MACHINES.find(m => m.id === itemId);
                  if (item) sellPrice = Math.floor(item.cost / 2);
                  newState.machineSlots = prev.machineSlots?.map(s => s.id === slotId ? { ...s, machineId: null, activeRecipeId: null, startedAt: null, queue: [], storage: [] } : s);
              }
          }

          if (itemId) {
              if (action === 'STORE') {
                  newState.inventory = { ...prev.inventory, [itemId]: (prev.inventory[itemId] || 0) + 1 };
              } else if (action === 'SELL') {
                  newState.coins = prev.coins + sellPrice;
              }
          }

          return newState;
      });
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

      newFarmPlots.forEach((plot, index) => {
          if (plot.cropId && plot.plantedAt && !plot.hasBug && !plot.hasWeed) { 
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

  const feedAnimal = (slotId: number) => {
      const slot = userState.livestockSlots?.find(s => s.id === slotId);
      if (!slot || !slot.animalId) return;
      const animal = ANIMALS.find(a => a.id === slot.animalId);
      if (!animal) return;

      // Check Limits
      const currentActive = slot.fedAt ? 1 : 0;
      const currentQueue = slot.queue || 0;
      const currentStorage = slot.storage?.length || 0;
      
      if ((currentActive + currentQueue + currentStorage) >= 3) {
          return { success: false, msg: "Chuồng đầy rồi! Hãy thu hoạch trước khi cho ăn tiếp." };
      }

      const feedCrop = CROPS.find(c => c.id === animal.feedCropId);
      const feedName = feedCrop?.name || 'thức ăn';
      const feedEmoji = feedCrop?.emoji || '🥕';
      const userFeedAmount = userState.harvestedCrops?.[animal.feedCropId] || 0;

      if (userFeedAmount < animal.feedAmount) {
          return { 
              success: false, 
              msg: `Bé cần ${animal.feedAmount} ${feedName} (trong Kho nông sản) để cho ${animal.name} ăn. Bé đang có ${userFeedAmount}. Hãy trồng thêm nhé!` 
          };
      }

      playSFX('eat'); 
      onUpdateState(prev => {
          let newSlot = { ...slot };
          // If not currently working, start immediately
          if (!slot.fedAt) {
              newSlot.fedAt = Date.now();
          } else {
              // Add to queue
              newSlot.queue = (slot.queue || 0) + 1;
          }

          return {
            ...prev,
            harvestedCrops: {
                ...prev.harvestedCrops,
                [animal.feedCropId]: (prev.harvestedCrops?.[animal.feedCropId] || 0) - animal.feedAmount
            },
            livestockSlots: prev.livestockSlots?.map(s => s.id === slotId ? newSlot : s)
          }
      });
      updateMissionProgress('FEED', 1);
      return { success: true, msg: `Đã cho ${animal.name} ăn!`, feedEmoji: feedEmoji, amount: animal.feedAmount };
  };

  const collectProduct = (slotId: number) => {
      const slot = userState.livestockSlots?.find(s => s.id === slotId);
      if (!slot) return { success: false, msg: "Lỗi chuồng" };
      
      const storedItems = slot.storage || [];
      if (storedItems.length === 0) return { success: false, msg: "Không có gì để thu hoạch" };

      const animal = ANIMALS.find(a => a.id === slot.animalId);
      if (!animal) return { success: false, msg: "Lỗi vật nuôi" };

      playSFX('harvest');
      onUpdateState(prev => {
          const currentHarvest = prev.harvestedCrops || {};
          const newHarvest = { ...currentHarvest };
          const itemsCount = storedItems.length;
          
          // Add products to inventory
          const productId = animal.produceId;
          newHarvest[productId] = (newHarvest[productId] || 0) + itemsCount;

          let newExp = (prev.farmExp || 0) + (animal.exp * itemsCount);
          let newLevel = prev.farmLevel || 1;
          while (newExp >= newLevel * 100 && newLevel < 50) { newExp -= newLevel * 100; newLevel++; }

          return {
              ...prev,
              harvestedCrops: newHarvest,
              farmExp: newExp,
              farmLevel: newLevel,
              livestockSlots: prev.livestockSlots?.map(s => s.id === slotId ? { ...s, storage: [] } : s)
          };
      });
      return { success: true };
  };

  const startProcessing = (slotId: number, recipeId: string) => {
      const slot = userState.machineSlots?.find(s => s.id === slotId);
      if (!slot || !slot.machineId) return { success: false, msg: "Lỗi máy móc" };
      
      const recipe = RECIPES.find(r => r.id === recipeId);
      if (!recipe) return { success: false, msg: "Lỗi công thức" };

      const currentHarvest = userState.harvestedCrops || {};
      for (const input of recipe.input) {
          if ((currentHarvest[input.id] || 0) < input.amount) {
              const inputItem = [...CROPS, ...PRODUCTS].find(i => i.id === input.id);
              return { success: false, msg: `Thiếu ${input.amount} ${inputItem?.name || 'nguyên liệu'} trong Kho nông sản!` };
          }
      }

      playSFX('click');
      onUpdateState(prev => {
          const newHarvest = { ...(prev.harvestedCrops || {}) };
          recipe.input.forEach(input => {
              newHarvest[input.id] = (newHarvest[input.id] || 0) - input.amount;
          });

          let newSlot = { ...slot };
          if (!slot.activeRecipeId) {
              newSlot.activeRecipeId = recipe.id;
              newSlot.startedAt = Date.now();
          } else {
              const queue = slot.queue || [];
              if (queue.length >= 3) return prev; 
              newSlot.queue = [...queue, recipe.id];
          }

          return {
              ...prev,
              harvestedCrops: newHarvest,
              machineSlots: prev.machineSlots?.map(s => s.id === slotId ? newSlot : s)
          };
      });
      return { success: true };
  };

  const collectMachine = (slotId: number) => {
      const slot = userState.machineSlots?.find(s => s.id === slotId);
      if (!slot) return { success: false, msg: "Lỗi máy" };
      
      const storedItems = slot.storage || [];
      if (storedItems.length === 0) return { success: false, msg: "Không có gì để thu hoạch" };

      playSFX('harvest');
      onUpdateState(prev => {
          const currentHarvest = prev.harvestedCrops || {};
          const newHarvest = { ...currentHarvest };
          
          let expGained = 0;
          storedItems.forEach(recipeId => {
              const recipe = RECIPES.find(r => r.id === recipeId);
              if (recipe) {
                  newHarvest[recipe.outputId] = (newHarvest[recipe.outputId] || 0) + 1;
                  expGained += recipe.exp;
              }
          });

          let newExp = (prev.farmExp || 0) + expGained;
          let newLevel = prev.farmLevel || 1;
          while (newExp >= newLevel * 100 && newLevel < 50) { 
              newExp -= newLevel * 100;
              newLevel++;
          }

          return {
              ...prev,
              harvestedCrops: newHarvest,
              farmExp: newExp,
              farmLevel: newLevel,
              machineSlots: prev.machineSlots?.map(s => s.id === slotId ? { 
                  ...s, 
                  storage: [] // Clear storage
              } : s)
          };
      });
      updateMissionProgress('HARVEST', storedItems.length); 
      return { success: true, count: storedItems.length };
  };

  const deliverOrder = (order: FarmOrder) => {
      const currentCrops = userState.harvestedCrops || {};
      let hasEnough = true;
      order.requirements.forEach(req => {
          if ((currentCrops[req.cropId] || 0) < req.amount) hasEnough = false;
      });

      if (!hasEnough) return { success: false, msg: "Bé chưa đủ hàng trong Kho nông sản để giao!" };

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
              stars: prev.stars + (order.rewardStars || 0), // Award stars
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

  // --- SPEED UP LOGIC (Updated to reduce 50% remaining time) ---
  const speedUpItem = (type: 'CROP' | 'ANIMAL' | 'MACHINE', slotId: number) => {
      const now = Date.now();
      playSFX('powerup');
      onUpdateState(prev => {
          if (type === 'CROP') {
              const plot = prev.farmPlots.find(p => p.id === slotId);
              const crop = CROPS.find(c => c.id === plot?.cropId);
              if (plot && plot.plantedAt && crop) {
                  const duration = crop.growthTime * 1000;
                  const elapsed = now - plot.plantedAt;
                  const remaining = Math.max(0, duration - elapsed);
                  const reduction = remaining * 0.5; // Reduce remaining by 50%
                  
                  // To achieve this, we fake `plantedAt` being earlier
                  return {
                      ...prev,
                      farmPlots: prev.farmPlots.map(p => p.id === slotId ? { ...p, plantedAt: (p.plantedAt || 0) - reduction } : p)
                  };
              }
              return prev;
          } else if (type === 'ANIMAL') {
              const slot = prev.livestockSlots?.find(s => s.id === slotId);
              const animal = ANIMALS.find(a => a.id === slot?.animalId);
              if (slot && slot.fedAt && animal) {
                  const duration = animal.produceTime * 1000;
                  const elapsed = now - slot.fedAt;
                  const remaining = Math.max(0, duration - elapsed);
                  const reduction = remaining * 0.5;

                  return {
                      ...prev,
                      livestockSlots: prev.livestockSlots?.map(s => s.id === slotId ? { ...s, fedAt: (s.fedAt || 0) - reduction } : s)
                  };
              }
              return prev;
          } else {
              const slot = prev.machineSlots?.find(s => s.id === slotId);
              const recipe = RECIPES.find(r => r.id === slot?.activeRecipeId);
              if (slot && slot.startedAt && recipe) {
                  const duration = recipe.duration * 1000;
                  const elapsed = now - slot.startedAt;
                  const remaining = Math.max(0, duration - elapsed);
                  const reduction = remaining * 0.5;

                  return {
                      ...prev,
                      machineSlots: prev.machineSlots?.map(s => s.id === slotId ? { ...s, startedAt: (s.startedAt || 0) - reduction } : s)
                  };
              }
              return prev;
          }
      });
  };

  return { 
      now, 
      plantSeed, 
      placeAnimal, 
      placeMachine,
      reclaimItem, 
      waterPlot, 
      resolvePest, 
      harvestPlot, 
      harvestAll, 
      buyItem, 
      feedAnimal, 
      collectProduct, 
      startProcessing, 
      collectMachine, 
      deliverOrder, 
      generateOrders, 
      addReward, 
      canAfford, 
      updateMissionProgress, 
      checkWellUsage, 
      useWell,
      speedUpItem // Exported
  };
};
