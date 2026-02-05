
import { useState, useEffect, useCallback, useRef } from 'react';
import { UserState, FarmPlot, FarmOrder, Crop, Mission, LivestockSlot, MachineSlot, Decor } from '../types';
import { CROPS, ANIMALS, PRODUCTS, RECIPES, MACHINES, FARM_ACHIEVEMENTS_DATA, DAILY_MISSION_POOL, DECORATIONS } from '../data/farmData';
import { playSFX } from '../utils/sound';

export const useFarmGame = (
  userState: UserState, 
  onUpdateState: (newState: UserState | ((prev: UserState) => UserState)) => void
) => {
  const [now, setNow] = useState(Date.now());
  const lastTickRef = useRef(Date.now());
  
  // Helper: Calculate total buff for a type from active slots (Supports Multi-buffs)
  const getDecorBonus = (type: 'EXP' | 'COIN' | 'TIME' | 'PEST' | 'YIELD'): number => {
      const activeSlots = userState.decorSlots?.filter(s => s.isUnlocked && s.decorId) || [];
      if (activeSlots.length === 0) return 0;
      
      let total = 0;
      activeSlots.forEach(slot => {
          const decor = DECORATIONS.find(d => d.id === slot.decorId);
          if (decor) {
              // Check legacy single buff
              if (decor.buff && decor.buff.type === type) {
                  total += decor.buff.value;
              }
              // Check new multi buffs
              if (decor.multiBuffs) {
                  decor.multiBuffs.forEach(buff => {
                      if (buff.type === type) total += buff.value;
                  });
              }
          }
      });
      return total;
  };

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

  // Helper: Recursive Base Cost Calculation
  const getBaseCost = (itemId: string): number => {
      const crop = CROPS.find(c => c.id === itemId);
      if (crop) {
          // If bought with Stars, value it highly (e.g., 500 coins per star)
          if (crop.currency === 'STAR') return crop.cost * 500; 
          return crop.cost;
      }

      const product = PRODUCTS.find(p => p.id === itemId);
      if (product) {
          if (product.type === 'PRODUCT') {
              const animal = ANIMALS.find(a => a.produceId === itemId);
              if (animal) {
                  // Cost = Feed Cost * Amount
                  return getBaseCost(animal.feedCropId) * animal.feedAmount;
              }
          } else if (product.type === 'PROCESSED') {
              const recipe = RECIPES.find(r => r.outputId === itemId);
              if (recipe) {
                  return recipe.input.reduce((sum, ing) => sum + (getBaseCost(ing.id) * ing.amount), 0);
              }
          }
      }
      return 10; // Fallback
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
      let totalCost = 0;
      let totalExp = 0;
      let maxProductionTime = 0;

      for (const [itemId, amount] of Object.entries(tempReqs)) {
          requirements.push({ cropId: itemId, amount });
          
          // Cost Calc using recursive function
          const baseCost = getBaseCost(itemId);
          totalCost += baseCost * amount;

          // Exp Calc
          const itemData = [...CROPS, ...PRODUCTS].find(x => x.id === itemId);
          if (itemData) {
              const expBase = itemData.type === 'CROP' ? (itemData as Crop).exp : 20;
              totalExp += expBase * amount * 3.0;
          }

          // Time Calc
          const unitTime = getItemProductionTime(itemId);
          const batchTime = unitTime * Math.ceil(amount / 2); 
          if (batchTime > maxProductionTime) maxProductionTime = batchTime;
      }

      const durationMinutes = Math.max(15, maxProductionTime * 3);

      // Reward Calculation: SIGNIFICANTLY BOOSTED
      const multiplier = 4.0 + Math.random() * 2.0; // Boosted multiplier (4.0x - 6.0x)
      
      const baseReward = Math.ceil(totalCost * multiplier);
      // Ensure minimum reward is substantial
      const finalCoins = Math.max(200, Math.ceil(baseReward / 10) * 10);

      // STAR REWARD UPDATE:
      // Minimum 30 Stars.
      // Add bonus stars based on total value of the order to encourage big orders.
      const baseStars = 30;
      const valueBonusStars = Math.floor(totalCost / 200); // e.g., 1000 value -> +5 stars
      const rewardStars = baseStars + valueBonusStars; 

      const rewardFertilizer = Math.random() < 0.6 ? Math.floor(Math.random() * 3) + 2 : 0; 

      return {
          id: Math.random().toString(36).substr(2, 9),
          npcName: npcs[Math.floor(Math.random() * npcs.length)],
          requirements,
          rewardCoins: finalCoins,
          rewardExp: Math.ceil(totalExp / 5) * 5,
          rewardStars: rewardStars,
          rewardFertilizer: rewardFertilizer,
          expiresAt: Date.now() + (durationMinutes * 60 * 1000)
      };
  };

  const unlockedMachinesCheck = (productId: string, ownedMachineIds: string[]) => {
      const recipe = RECIPES.find(r => r.outputId === productId);
      if (!recipe) return false;
      return ownedMachineIds.includes(recipe.machineId);
  };

  // Initialization Effect - CRITICAL FIX FOR ACHIEVEMENTS
  useEffect(() => {
      const todayStr = new Date().toDateString();
      
      onUpdateState(prev => {
          let newState = { ...prev };
          let changed = false;

          // 1. SYNC AND REPAIR EXISTING ACHIEVEMENTS
          // Map of correct/latest static data
          const staticMissionMap = new Map(FARM_ACHIEVEMENTS_DATA.map(m => [m.id, m]));
          
          if (prev.missions) {
              const repairedMissions = prev.missions.map(userMission => {
                  if (userMission.category === 'ACHIEVEMENT') {
                      const staticData = staticMissionMap.get(userMission.id);
                      if (staticData) {
                          // Repair logic: If reward is 0 or mission description is outdated, update from static data
                          // We preserve 'current', 'completed', 'claimed' status
                          if (userMission.reward.amount === 0 || userMission.desc !== staticData.desc || userMission.target !== staticData.target) {
                              changed = true;
                              return {
                                  ...userMission,
                                  target: staticData.target,
                                  reward: staticData.reward, // Fix the 0 reward bug
                                  desc: staticData.desc
                              };
                          }
                      }
                  }
                  return userMission;
              });
              
              if (changed) {
                  newState.missions = repairedMissions;
              }
          } else {
              newState.missions = []; // Initialize if missing
          }

          // 2. ADD MISSING ACHIEVEMENTS
          const currentMissionIds = new Set(newState.missions.map(m => m.id));
          const missingAchievements = FARM_ACHIEVEMENTS_DATA.filter(ach => !currentMissionIds.has(ach.id));

          if (missingAchievements.length > 0) {
              newState.missions = [...newState.missions, ...missingAchievements];
              changed = true;
          }

          // 3. DAILY MISSIONS UPDATE
          if (prev.lastMissionUpdate !== todayStr) {
              // Filter out old daily missions
              const currentAchievements = newState.missions.filter(m => m.category === 'ACHIEVEMENT');
              
              // Pick new daily missions
              const dailies = [...DAILY_MISSION_POOL]
                  .sort(() => 0.5 - Math.random())
                  .slice(0, 5)
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

          // Initial decor slots if undefined
          if (!prev.decorSlots) {
              newState.decorSlots = [
                  { id: 1, isUnlocked: true, decorId: null },
                  { id: 2, isUnlocked: true, decorId: null },
                  { id: 3, isUnlocked: false, decorId: null },
              ];
              changed = true;
          }

          return changed ? newState : prev;
      });
  }, []); 

  // Game Loop - Optimized
  useEffect(() => {
    const interval = setInterval(() => {
        const currentTime = Date.now();
        setNow(currentTime); // Keeps the UI timer updating

        // Performance Optimization: Throttle heavy updates
        // Only run logic checks every 1s, but render updates might happen less if no change
        if (currentTime - lastTickRef.current < 900) return;
        lastTickRef.current = currentTime;

        onUpdateState(prev => {
            let newState = { ...prev };
            let hasChanges = false;

            // 1. Weather (Rare chance)
            // Optimization: Only try changing weather if we are not in desired state
            if (Math.random() < 0.002) { 
                const newWeather = prev.weather === 'SUNNY' ? 'RAINY' : 'SUNNY';
                newState.weather = newWeather;
                hasChanges = true;
                if (newWeather === 'RAINY') {
                    // Batch update watered state
                    const needsWater = prev.farmPlots.some(p => p.cropId && !p.isWatered);
                    if (needsWater) {
                        newState.farmPlots = prev.farmPlots.map(p => 
                            p.cropId && !p.isWatered ? { ...p, isWatered: true } : p
                        );
                    }
                }
            }

            // 2. Bugs & Weeds
            // Optimization: Only run if there are clean plots to infect
            const cleanPlots = prev.farmPlots.filter(p => p.isUnlocked && p.cropId && !p.hasBug && !p.hasWeed);
            if (cleanPlots.length > 0) {
                let bugChance = 0.01;
                // Apply Decor Bonus
                const activeSlots = prev.decorSlots?.filter(s => s.isUnlocked && s.decorId) || [];
                let pestReduction = 0;
                activeSlots.forEach(slot => {
                    const decor = DECORATIONS.find(d => d.id === slot.decorId);
                    if (decor?.buff?.type === 'PEST') pestReduction += decor.buff.value;
                    if (decor?.multiBuffs) decor.multiBuffs.forEach(b => { if(b.type === 'PEST') pestReduction += b.value; });
                });
                bugChance = bugChance * (1 - Math.min(0.9, pestReduction / 100));

                if (Math.random() < bugChance) {
                    const target = cleanPlots[Math.floor(Math.random() * cleanPlots.length)];
                    const isBug = Math.random() > 0.5;
                    newState.farmPlots = prev.farmPlots.map(p => 
                        p.id === target.id ? { ...p, hasBug: isBug, hasWeed: !isBug } : p
                    );
                    hasChanges = true;
                }
            }

            // 3. Machine Auto-Process Queue
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
                // Only replace array if actual object references changed (handled by map)
                if (hasChanges) newState.machineSlots = updatedSlots;
            }

            // 4. Animal Auto-Process (IMPROVED QUEUE LOGIC)
            if (prev.livestockSlots) {
                const updatedSlots = prev.livestockSlots.map(slot => {
                    if (slot.animalId) {
                        const animal = ANIMALS.find(a => a.id === slot.animalId);
                        if (animal) {
                            let newStorage = [...(slot.storage || [])];
                            let newFedAt = slot.fedAt;
                            let newQueue = slot.queue || 0;
                            let slotChanged = false;

                            // If eating and time passed -> Produce
                            if (newFedAt) {
                                const elapsed = (currentTime - newFedAt) / 1000;
                                if (elapsed >= animal.produceTime) {
                                    // Only add product if storage not full
                                    if (newStorage.length < 3) {
                                        newStorage.push(animal.produceId);
                                        slotChanged = true;
                                        
                                        // Check queue for next cycle
                                        if (newQueue > 0) {
                                            newQueue--;
                                            newFedAt = currentTime; // Eat again immediately
                                        } else {
                                            newFedAt = null; // Stop eating
                                        }
                                    } else {
                                        // Storage full: Wait until collected. 
                                        // We pause production by NOT clearing fedAt or resetting queue.
                                        // Basically the animal stands there with product ready but can't drop it yet.
                                        // Or we can just let it finish and sit idle.
                                        // Simplest: Don't add to storage, don't consume queue, just wait.
                                    }
                                }
                            }

                            // If idle but has queue (rare case, usually handled above)
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

            // CRITICAL OPTIMIZATION: Only update state if something actually changed
            return hasChanges ? newState : prev;
        });

    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const canAfford = (amount: number, currency: 'COIN' | 'STAR' = 'COIN') => {
      if (currency === 'STAR') return (userState.stars || 0) >= amount;
      return userState.coins >= amount;
  };

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

  const addReward = (type: 'COIN' | 'STAR' | 'WATER' | 'FERTILIZER', amount: number) => {
      onUpdateState(prev => {
          const next = { ...prev };
          if (type === 'COIN') next.coins += amount;
          if (type === 'STAR') next.stars += amount;
          if (type === 'WATER') next.waterDrops += amount;
          if (type === 'FERTILIZER') next.fertilizers += amount;
          return next;
      });
  };

  const updateMissionProgress = (type: Mission['type'], amount: number) => {
      onUpdateState(prev => ({
          ...prev,
          missions: prev.missions?.map(m => {
              if (m.type === type && !m.completed && m.category === 'DAILY') {
                  const nextCurrent = m.current + amount;
                  return { ...m, current: nextCurrent, completed: nextCurrent >= m.target };
              }
              if (m.type === type && !m.completed && m.category === 'ACHIEVEMENT') {
                   // Also update achievements based on cumulative tracking if available, 
                   // but for simple implementation we assume 'current' in achievements tracks total if updated
                   const nextCurrent = m.current + amount;
                   return { ...m, current: nextCurrent, completed: nextCurrent >= m.target };
              }
              return m;
          })
      }));
  };

  const buyItem = (item: any, amount: number = 1) => {
      const totalCost = item.cost * amount;
      const currency = item.currency || 'COIN';
      
      if (!canAfford(totalCost, currency)) return { success: false, msg: `Không đủ ${currency === 'COIN' ? 'Xu' : 'Sao'}!` };

      playSFX('click');
      onUpdateState(prev => {
          const next = { ...prev };
          if (currency === 'COIN') next.coins -= totalCost;
          else next.stars -= totalCost;
          
          // Update Inventory Count
          next.inventory = { ...next.inventory, [item.id]: (next.inventory[item.id] || 0) + amount };
          
          // CRITICAL FIX: If item is a DECOR, ensure it's added to the 'decorations' ownership list
          // This list is used by InventoryModal to check ownership status.
          if (item.type === 'DECOR') {
             const currentDecors = next.decorations || [];
             if (!currentDecors.includes(item.id)) {
                 next.decorations = [...currentDecors, item.id];
             }
          }

          return next;
      });
      return { success: true };
  };

  const placeDecor = (slotId: number, decorId: string) => {
      const count = userState.inventory[decorId] || 0;
      // We check inventory count for placing multiple copies of same decor
      if (count <= 0) {
           return { success: false, msg: "Bạn chưa sở hữu thêm cái này!" };
      }
      
      onUpdateState(prev => ({
          ...prev,
          decorSlots: prev.decorSlots?.map(s => s.id === slotId ? { ...s, decorId } : s)
      }));
      return { success: true };
  };

  const removeDecor = (slotId: number) => {
      onUpdateState(prev => ({
          ...prev,
          decorSlots: prev.decorSlots?.map(s => s.id === slotId ? { ...s, decorId: null } : s)
      }));
      return { success: true };
  };

  const reclaimItem = (slotId: number, type: 'ANIMAL' | 'MACHINE', action: 'STORE' | 'SELL') => {
      let itemId: string | null = null;
      let cost = 0;

      if (type === 'ANIMAL') {
          const slot = userState.livestockSlots?.find(s => s.id === slotId);
          if (slot?.animalId) {
              itemId = slot.animalId;
              const animal = ANIMALS.find(a => a.id === itemId);
              cost = animal?.cost || 0;
          }
      } else {
          const slot = userState.machineSlots?.find(s => s.id === slotId);
          if (slot?.machineId) {
              itemId = slot.machineId;
              const machine = MACHINES.find(m => m.id === itemId);
              cost = machine?.cost || 0;
          }
      }

      if (!itemId) return { success: false, msg: "Lỗi không tìm thấy vật phẩm" };

      onUpdateState(prev => {
          const next = { ...prev };
          if (type === 'ANIMAL') {
              next.livestockSlots = next.livestockSlots?.map(s => s.id === slotId ? { ...s, animalId: null, fedAt: null, storage: [], queue: 0 } : s);
          } else {
              next.machineSlots = next.machineSlots?.map(s => s.id === slotId ? { ...s, machineId: null, activeRecipeId: null, startedAt: null, storage: [], queue: [] } : s);
          }

          if (action === 'STORE') {
              next.inventory = { ...next.inventory, [itemId!]: (next.inventory[itemId!] || 0) + 1 };
          } else {
              next.coins += Math.floor(cost / 2);
          }
          return next;
      });

      return { success: true };
  };

  const waterPlot = (plotId: number, crop: Crop) => {
      if (userState.waterDrops <= 0) return { success: false, msg: "Hết nước rồi!" };
      
      onUpdateState(prev => ({
          ...prev,
          waterDrops: prev.waterDrops - 1,
          farmPlots: prev.farmPlots.map(p => p.id === plotId ? { ...p, isWatered: true } : p)
      }));
      updateMissionProgress('WATER', 1);
      return { success: true };
  };

  const resolvePest = (plotId: number) => {
      onUpdateState(prev => ({
          ...prev,
          farmPlots: prev.farmPlots.map(p => p.id === plotId ? { ...p, hasBug: false, hasWeed: false } : p)
      }));
      return { success: true };
  };

  const harvestPlot = (plotId: number, crop: Crop) => {
      const yieldBonus = getDecorBonus('YIELD');
      let amount = 1;
      if (Math.random() * 100 < yieldBonus) amount = 2;

      onUpdateState(prev => ({
          ...prev,
          farmPlots: prev.farmPlots.map(p => p.id === plotId ? { ...p, cropId: null, plantedAt: null, isWatered: false, hasBug: false, hasWeed: false } : p),
          harvestedCrops: { ...prev.harvestedCrops, [crop.id]: (prev.harvestedCrops?.[crop.id] || 0) + amount },
          farmExp: (prev.farmExp || 0) + crop.exp,
          farmLevel: (prev.farmExp || 0) + crop.exp >= (prev.farmLevel || 1) * 100 ? (prev.farmLevel || 1) + 1 : prev.farmLevel
      }));
      updateMissionProgress('HARVEST', amount);
      return { success: true, amount };
  };

  const harvestAll = () => {
      let count = 0;
      let totalExp = 0;
      const newHarvested: Record<string, number> = {};

      onUpdateState(prev => {
          const next = { ...prev };
          next.farmPlots = next.farmPlots.map(p => {
              if (p.cropId && p.plantedAt && !p.hasBug && !p.hasWeed) {
                  const crop = CROPS.find(c => c.id === p.cropId);
                  if (crop && (Date.now() - p.plantedAt)/1000 >= crop.growthTime) {
                      const yieldBonus = getDecorBonus('YIELD');
                      const amount = (Math.random() * 100 < yieldBonus) ? 2 : 1;
                      
                      newHarvested[crop.id] = (newHarvested[crop.id] || 0) + amount;
                      totalExp += crop.exp;
                      count += amount;
                      
                      return { ...p, cropId: null, plantedAt: null, isWatered: false };
                  }
              }
              return p;
          });

          Object.entries(newHarvested).forEach(([id, amt]) => {
              next.harvestedCrops = { ...next.harvestedCrops, [id]: (next.harvestedCrops?.[id] || 0) + amt };
          });
          
          next.farmExp = (next.farmExp || 0) + totalExp;
          if (next.farmExp >= (next.farmLevel || 1) * 100) next.farmLevel = (next.farmLevel || 1) + 1;

          return next;
      });
      
      if (count > 0) updateMissionProgress('HARVEST', count);
      return { success: count > 0, count };
  };

  const feedAnimal = (slotId: number) => {
      const slot = userState.livestockSlots?.find(s => s.id === slotId);
      if (!slot || !slot.animalId) return { success: false, msg: "Lỗi chuồng" };
      
      const animal = ANIMALS.find(a => a.id === slot.animalId);
      if (!animal) return { success: false, msg: "Lỗi vật nuôi" };

      // Queue Logic: Limit active + queued to 3 total items.
      const currentQueue = slot.queue || 0;
      const currentStorage = slot.storage?.length || 0;
      const isEating = !!slot.fedAt;
      
      // Prevent feeding if queue is full (Max 1 eating + 2 queued = 3 products)
      if (isEating && currentQueue >= 2) return { success: false, msg: "Bụng bé no căng rồi!" };
      
      // Also prevent if storage is totally full? (Optional gameplay choice. Let's allow queuing but it pauses if storage 3/3)
      if (currentStorage >= 3) return { success: false, msg: "Thu hoạch trước đã nhé!" };

      const feedId = animal.feedCropId;
      const amount = animal.feedAmount;
      const has = userState.harvestedCrops?.[feedId] || 0;
      
      // Localized name check
      const feedItem = [...CROPS, ...PRODUCTS].find(c => c.id === feedId);
      const feedItemName = feedItem?.name || feedId;

      if (has < amount) return { success: false, msg: `Thiếu ${amount} ${feedItemName}` };

      onUpdateState(prev => ({
          ...prev,
          harvestedCrops: { ...prev.harvestedCrops, [feedId]: (prev.harvestedCrops?.[feedId] || 0) - amount },
          livestockSlots: prev.livestockSlots?.map(s => {
              if (s.id === slotId) {
                  // If eating, add to queue. If not eating, start eating.
                  if (s.fedAt) {
                      return { ...s, queue: (s.queue || 0) + 1 };
                  } else {
                      return { ...s, fedAt: Date.now() };
                  }
              }
              return s;
          })
      }));
      updateMissionProgress('FEED', 1);
      
      return { success: true, amount, feedEmoji: feedItem?.emoji };
  };

  const collectProduct = (slotId: number) => {
      const slot = userState.livestockSlots?.find(s => s.id === slotId);
      if (!slot || !slot.storage || slot.storage.length === 0) return;

      const items = slot.storage;
      let totalExp = 0;
      const newHarvested: Record<string, number> = {};

      items.forEach(id => {
          newHarvested[id] = (newHarvested[id] || 0) + 1;
          const animal = ANIMALS.find(a => a.produceId === id);
          if (animal) totalExp += animal.exp;
      });

      onUpdateState(prev => {
          const next = { ...prev };
          Object.entries(newHarvested).forEach(([id, amt]) => {
              next.harvestedCrops = { ...next.harvestedCrops, [id]: (next.harvestedCrops?.[id] || 0) + amt };
          });
          
          // Clear storage. Note: Logic for restarting production if queue exists is handled in Game Loop effect.
          next.livestockSlots = next.livestockSlots?.map(s => s.id === slotId ? { ...s, storage: [] } : s);
          
          next.farmExp = (next.farmExp || 0) + totalExp;
          if (next.farmExp >= (next.farmLevel || 1) * 100) next.farmLevel = (next.farmLevel || 1) + 1;
          return next;
      });
  };

  const startProcessing = (slotId: number, recipeId: string) => {
      const recipe = RECIPES.find(r => r.id === recipeId);
      if (!recipe) return { success: false, msg: "Lỗi công thức" };

      for (const ing of recipe.input) {
          if ((userState.harvestedCrops?.[ing.id] || 0) < ing.amount) {
              return { success: false, msg: "Thiếu nguyên liệu" };
          }
      }

      const slot = userState.machineSlots?.find(s => s.id === slotId);
      if (!slot) return { success: false };

      onUpdateState(prev => {
          const next = { ...prev };
          recipe.input.forEach(ing => {
              next.harvestedCrops = { ...next.harvestedCrops, [ing.id]: (next.harvestedCrops?.[ing.id] || 0) - ing.amount };
          });

          if (!slot.activeRecipeId) {
              next.machineSlots = next.machineSlots?.map(s => s.id === slotId ? { ...s, activeRecipeId: recipeId, startedAt: Date.now() } : s);
          } else {
              const queue = [...(slot.queue || [])];
              if (queue.length < 3) {
                  queue.push(recipeId);
                  next.machineSlots = next.machineSlots?.map(s => s.id === slotId ? { ...s, queue } : s);
              } else {
                  return prev;
              }
          }
          return next;
      });
      return { success: true };
  };

  const collectMachine = (slotId: number) => {
      const slot = userState.machineSlots?.find(s => s.id === slotId);
      if (!slot || !slot.storage || slot.storage.length === 0) return { success: false };

      const items = slot.storage;
      let totalExp = 0;
      const newHarvested: Record<string, number> = {};

      items.forEach(rId => {
          const recipe = RECIPES.find(r => r.id === rId);
          if (recipe) {
              newHarvested[recipe.outputId] = (newHarvested[recipe.outputId] || 0) + 1;
              totalExp += recipe.exp;
          }
      });

      onUpdateState(prev => {
          const next = { ...prev };
          Object.entries(newHarvested).forEach(([id, amt]) => {
              next.harvestedCrops = { ...next.harvestedCrops, [id]: (next.harvestedCrops?.[id] || 0) + amt };
          });
          next.machineSlots = next.machineSlots?.map(s => s.id === slotId ? { ...s, storage: [] } : s);
          next.farmExp = (next.farmExp || 0) + totalExp;
          if (next.farmExp >= (next.farmLevel || 1) * 100) next.farmLevel = (next.farmLevel || 1) + 1;
          return next;
      });
      return { success: true, count: items.length };
  };

  const deliverOrder = (order: FarmOrder) => {
      for (const req of order.requirements) {
          if ((userState.harvestedCrops?.[req.cropId] || 0) < req.amount) return { success: false, msg: "Thiếu hàng" };
      }

      onUpdateState(prev => {
          const next = { ...prev };
          order.requirements.forEach(req => {
              next.harvestedCrops = { ...next.harvestedCrops, [req.cropId]: (next.harvestedCrops?.[req.cropId] || 0) - req.amount };
          });
          next.coins += order.rewardCoins;
          next.farmExp = (next.farmExp || 0) + order.rewardExp;
          if (order.rewardStars) next.stars += order.rewardStars;
          if (order.rewardFertilizer) next.fertilizers += order.rewardFertilizer;

          if (next.farmExp >= (next.farmLevel || 1) * 100) next.farmLevel = (next.farmLevel || 1) + 1;

          const newOrders = next.activeOrders?.filter(o => o.id !== order.id) || [];
          newOrders.push(createSingleOrder(prev.grade || 1, prev.completedLevels?.length || 0, prev.livestockSlots || []));
          next.activeOrders = newOrders;

          return next;
      });
      updateMissionProgress('EARN', order.rewardCoins);
      return { success: true };
  };

  const generateOrders = (grade: number, completedCount: number, livestock: LivestockSlot[]) => {
      return [
          createSingleOrder(grade, completedCount, livestock),
          createSingleOrder(grade, completedCount, livestock),
          createSingleOrder(grade, completedCount, livestock)
      ];
  };

  const speedUpItem = (type: 'CROP' | 'ANIMAL' | 'MACHINE', slotId: number) => {
      onUpdateState(prev => {
          const next = { ...prev };
          if (type === 'CROP') {
              next.farmPlots = next.farmPlots.map(p => p.id === slotId ? { ...p, plantedAt: (p.plantedAt || 0) - 10000000 } : p);
          } else if (type === 'ANIMAL') {
              next.livestockSlots = next.livestockSlots?.map(s => s.id === slotId ? { ...s, fedAt: (s.fedAt || 0) - 10000000 } : s);
          } else if (type === 'MACHINE') {
              next.machineSlots = next.machineSlots?.map(s => s.id === slotId ? { ...s, startedAt: (s.startedAt || 0) - 10000000 } : s);
          }
          return next;
      });
  };

  const sellItem = (itemId: string, amount: number) => {
      const item = [...CROPS, ...PRODUCTS].find(i => i.id === itemId);
      if (!item) return { success: false };
      
      const earned = item.sellPrice * amount + Math.floor(item.sellPrice * amount * getDecorBonus('COIN') / 100);
      
      onUpdateState(prev => ({
          ...prev,
          coins: prev.coins + earned,
          harvestedCrops: { ...prev.harvestedCrops, [itemId]: (prev.harvestedCrops?.[itemId] || 0) - amount }
      }));
      updateMissionProgress('EARN', earned);
      return { success: true, earned };
  };

  const sellItemsBulk = (items: { itemId: string, amount: number }[]) => {
      let totalEarned = 0;
      onUpdateState(prev => {
          const next = { ...prev };
          items.forEach(({ itemId, amount }) => {
              const item = [...CROPS, ...PRODUCTS].find(i => i.id === itemId);
              if (item) {
                  const earned = item.sellPrice * amount + Math.floor(item.sellPrice * amount * getDecorBonus('COIN') / 100);
                  totalEarned += earned;
                  next.harvestedCrops = { ...next.harvestedCrops, [itemId]: (next.harvestedCrops?.[itemId] || 0) - amount };
              }
          });
          next.coins += totalEarned;
          return next;
      });
      updateMissionProgress('EARN', totalEarned);
      return { success: true, earned: totalEarned };
  };

  // BULK PLANT
  const plantSeedBulk = (seedId: string) => {
      const currentInventory = userState.inventory || {};
      const count = currentInventory[seedId] || 0;
      
      if (count <= 0) return { success: false, msg: "Hết hạt giống rồi bé ơi! Hãy vào Cửa Hàng mua thêm." };
      
      const timeBonus = Math.min(50, getDecorBonus('TIME'));
      const crop = CROPS.find(c => c.id === seedId);
      const growthTime = crop?.growthTime || 0;
      const reduceSeconds = (growthTime * timeBonus) / 100;
      
      const emptyPlots = userState.farmPlots.filter(p => p.isUnlocked && !p.cropId);
      
      if (emptyPlots.length === 0) return { success: false, msg: "Không còn ô đất trống nào!" };
      
      const canPlantCount = Math.min(count, emptyPlots.length);
      
      if (canPlantCount === 0) return { success: false, msg: "Lỗi không xác định." };

      playSFX('click');
      onUpdateState(prev => {
          const newPlots = [...prev.farmPlots];
          let planted = 0;
          
          for (let i = 0; i < newPlots.length; i++) {
              if (newPlots[i].isUnlocked && !newPlots[i].cropId && planted < canPlantCount) {
                  newPlots[i] = {
                      ...newPlots[i],
                      cropId: seedId,
                      plantedAt: Date.now() - (reduceSeconds * 1000),
                      isWatered: prev.weather === 'RAINY',
                      hasWeed: Math.random() < 0.1,
                      hasBug: false,
                      hasMysteryBox: false
                  };
                  planted++;
              }
          }

          return {
              ...prev,
              inventory: { ...prev.inventory, [seedId]: count - canPlantCount },
              farmPlots: newPlots
          };
      });
      
      return { success: true, count: canPlantCount };
  };

  const plantSeed = (plotId: number, seedId: string) => {
      const currentInventory = userState.inventory || {};
      const count = currentInventory[seedId] || 0;
      
      if (count <= 0) return { success: false, msg: "Hết hạt giống rồi bé ơi! Hãy vào Cửa Hàng mua thêm." };
      
      const timeBonus = Math.min(50, getDecorBonus('TIME'));
      const crop = CROPS.find(c => c.id === seedId);
      const growthTime = crop?.growthTime || 0;
      const reduceSeconds = (growthTime * timeBonus) / 100;
      
      playSFX('click');
      onUpdateState(prev => ({
          ...prev,
          inventory: { ...prev.inventory, [seedId]: count - 1 },
          farmPlots: prev.farmPlots.map(p => p.id === plotId ? { 
              ...p, 
              cropId: seedId, 
              plantedAt: Date.now() - (reduceSeconds * 1000), 
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

  return {
      now, plantSeed, plantSeedBulk, placeAnimal, placeMachine, reclaimItem, waterPlot, resolvePest, harvestPlot, harvestAll, buyItem, feedAnimal, collectProduct, startProcessing, collectMachine, deliverOrder, generateOrders, addReward, canAfford, updateMissionProgress, checkWellUsage, useWell, speedUpItem, placeDecor, removeDecor, sellItem, sellItemsBulk, getDecorBonus
  };
};
