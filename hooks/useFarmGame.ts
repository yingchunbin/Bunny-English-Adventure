
import { useState, useEffect, useCallback } from 'react';
import { UserState, FarmPlot, FarmOrder, Crop, Mission, LivestockSlot } from '../types';
import { CROPS, ANIMALS, PRODUCTS, RECIPES, MACHINES, FARM_ACHIEVEMENTS_DATA } from '../data/farmData';
import { playSFX } from '../utils/sound';

export const useFarmGame = (
  userState: UserState, 
  onUpdateState: (newState: UserState | ((prev: UserState) => UserState)) => void
) => {
  const [now, setNow] = useState(Date.now());
  
  // Helper: Create a single order
  const createSingleOrder = (grade: number, completedCount: number, currentLivestock: LivestockSlot[] = []) => {
      const npcs = ["Bác Gấu", "Cô Mèo", "Bạn Thỏ", "Chú Hổ", "Bà Cáo", "Thầy Rùa", "Chị Ong Vàng", "Anh Kiến", "Cụ Voi"];
      const unlockedCrops = CROPS.filter(c => !c.isMagic && (completedCount || 0) >= (c.unlockReq || 0));
      
      const ownedAnimalIds = currentLivestock ? currentLivestock.map(s => s.animalId).filter(Boolean) : [];
      const availableProducts = PRODUCTS.filter(p => {
          const producer = ANIMALS.find(a => a.produceId === p.id);
          return producer && ownedAnimalIds.includes(producer.id);
      });

      const pool = [...unlockedCrops, ...availableProducts];
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
              const expBase = itemData.type === 'PRODUCT' ? 20 : (itemData as Crop).exp || 10;
              totalExp += expBase * amount * 6.0; 
          }
      }

      return {
          id: Math.random().toString(36).substr(2, 9),
          npcName: npcs[Math.floor(Math.random() * npcs.length)],
          requirements,
          rewardCoins: Math.ceil((totalValue * 1.5) / 10) * 10,
          rewardExp: Math.ceil(totalExp / 5) * 5,
          expiresAt: Date.now() + (Math.random() * 5 + 5) * 60 * 1000 // 5-10 minutes
      };
  };

  // --- INIT LOGIC (Effect) ---
  useEffect(() => {
      // Ensure Missions are initialized
      if (!userState.missions || userState.missions.length === 0) {
          onUpdateState(prev => ({ ...prev, missions: FARM_ACHIEVEMENTS_DATA }));
      }
      
      // Ensure Orders are initialized
      if (!userState.activeOrders || userState.activeOrders.length === 0) {
          const initialOrders = [
              createSingleOrder(1, 0, userState.livestockSlots || []),
              createSingleOrder(1, 0, userState.livestockSlots || []),
              createSingleOrder(1, 0, userState.livestockSlots || [])
          ];
          onUpdateState(prev => ({ ...prev, activeOrders: initialOrders }));
      }
  }, []); // Run once on mount

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

            // 2. Bugs
            if (Math.random() < 0.005) {
                const eligiblePlots = prev.farmPlots.filter(p => p.isUnlocked && p.cropId && !p.hasBug && !p.hasWeed);
                if (eligiblePlots.length > 0) {
                    const target = eligiblePlots[Math.floor(Math.random() * eligiblePlots.length)];
                    newState.farmPlots = prev.farmPlots.map(p => 
                        p.id === target.id ? { ...p, hasBug: true } : p
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

  const canAfford = (amount: number) => userState.coins >= amount;

  // --- ACTIONS ---

  const plantSeed = (plotId: number, seedId: string) => {
      const currentInventory = userState.inventory || {};
      const count = currentInventory[seedId] || 0;
      
      if (count <= 0) return { success: false, msg: "Hết hạt giống rồi bé ơi!" };
      
      playSFX('click');
      onUpdateState(prev => ({
          ...prev,
          // CRITICAL FIX: Ensure we reduce inventory count
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

  const catchBug = (plotId: number) => {
      onUpdateState(prev => ({
          ...prev,
          farmPlots: prev.farmPlots.map(p => p.id === plotId ? { ...p, hasBug: false, isWatered: false } : p)
      }));
      return { success: true };
  };

  const harvestPlot = (plotId: number, crop: Crop) => {
      playSFX('harvest');
      onUpdateState(prev => {
          // CRITICAL FIX: Add to HARVESTED CROPS, NOT INVENTORY
          const currentHarvest = prev.harvestedCrops || {};
          const newHarvest = { ...currentHarvest };
          newHarvest[crop.id] = (newHarvest[crop.id] || 0) + 1;
          
          let newExp = (prev.petExp || 0) + crop.exp;
          let newLevel = prev.petLevel || 1;
          const XP_NEEDED = newLevel * 100;
          if (newExp >= XP_NEEDED) { newLevel += 1; newExp -= XP_NEEDED; }

          return {
              ...prev,
              harvestedCrops: newHarvest, // Only update this
              petExp: newExp,
              petLevel: newLevel,
              farmPlots: prev.farmPlots.map(p => p.id === plotId ? { 
                  ...p, cropId: null, plantedAt: null, isWatered: false, hasBug: false, hasWeed: false, hasMysteryBox: Math.random() < 0.15 
              } : p)
          };
      });
      updateMissionProgress('HARVEST', 1);
      return { success: true };
  };

  const buyAnimal = (slotId: number, animalId: string) => {
      const animal = ANIMALS.find(a => a.id === animalId);
      if (!animal) return { success: false, msg: "Lỗi dữ liệu vật nuôi" };
      if (!canAfford(animal.cost)) return { success: false, msg: "Bé không đủ tiền rồi!" };

      playSFX('success');
      onUpdateState(prev => {
          const currentSlots = prev.livestockSlots || Array(4).fill(null).map((_,i) => ({ id: i+1, isUnlocked: true, animalId: null, fedAt: null }));
          return {
              ...prev,
              coins: prev.coins - animal.cost,
              livestockSlots: currentSlots.map(s => s.id === slotId ? { ...s, animalId: animal.id, fedAt: null } : s)
          };
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

          let newExp = (prev.petExp || 0) + animal.exp;
          let newLevel = prev.petLevel || 1;
          const XP_NEEDED = newLevel * 100;
          if (newExp >= XP_NEEDED) { newLevel += 1; newExp -= XP_NEEDED; }

          return {
              ...prev,
              harvestedCrops: newHarvest,
              petExp: newExp,
              petLevel: newLevel,
              livestockSlots: prev.livestockSlots?.map(s => s.id === slotId ? { ...s, fedAt: null } : s)
          };
      });
      return { success: true };
  };

  const buyMachine = (slotId: number, machineId: string) => {
      const machine = MACHINES.find(m => m.id === machineId);
      if (!machine) return { success: false, msg: "Lỗi dữ liệu máy móc" };
      if (!canAfford(machine.cost)) return { success: false, msg: "Bé không đủ tiền rồi!" };

      playSFX('success');
      onUpdateState(prev => {
          const currentSlots = prev.machineSlots || []; 
          return {
              ...prev,
              coins: prev.coins - machine.cost,
              machineSlots: currentSlots.map(s => s.id === slotId ? { ...s, machineId: machine.id, activeRecipeId: null, startedAt: null } : s)
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
      // Check inputs
      for (const input of recipe.input) {
          if ((currentHarvest[input.id] || 0) < input.amount) {
              // const item = [...CROPS, ...PRODUCTS].find(i => i.id === input.id);
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

          let newExp = (prev.petExp || 0) + recipe.exp;
          let newLevel = prev.petLevel || 1;
          const XP_NEEDED = newLevel * 100;
          if (newExp >= XP_NEEDED) { newLevel += 1; newExp -= XP_NEEDED; }

          return {
              ...prev,
              harvestedCrops: newHarvest,
              petExp: newExp,
              petLevel: newLevel,
              machineSlots: prev.machineSlots?.map(s => s.id === slotId ? { ...s, activeRecipeId: null, startedAt: null } : s)
          };
      });
      return { success: true };
  };

  const feedPet = (cropId: string) => {
      const count = userState.harvestedCrops?.[cropId] || 0;
      if (count <= 0) return { success: false, msg: "Bé chưa có nông sản này để cho ăn!" };

      playSFX('success');
      let rewardMsg = "";
      
      onUpdateState(prev => {
          const currentHappiness = prev.petHappiness || 0;
          const newHappiness = Math.min(100, currentHappiness + 20);
          
          let coinsBonus = 0;
          let fertilizerBonus = 0;

          if (newHappiness >= 100 && currentHappiness < 100) {
             coinsBonus = 50;
             fertilizerBonus = 1;
             rewardMsg = "Thú cưng vui quá! Tặng bé 50 xu và 1 phân bón!";
          }

          return {
            ...prev,
            coins: prev.coins + coinsBonus,
            fertilizers: prev.fertilizers + fertilizerBonus,
            petHappiness: newHappiness,
            harvestedCrops: { ...prev.harvestedCrops, [cropId]: count - 1 }
          };
      });
      return { success: true, msg: rewardMsg };
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
          
          let newExp = (prev.petExp || 0) + order.rewardExp;
          let newLevel = prev.petLevel || 1;
          const XP_NEEDED = newLevel * 100; 
          if (newExp >= XP_NEEDED) { newLevel += 1; newExp -= XP_NEEDED; }

          return {
              ...prev,
              coins: prev.coins + order.rewardCoins,
              harvestedCrops: newHarvested,
              petLevel: newLevel,
              petExp: newExp,
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
          fertilizers: type === 'FERTILIZER' ? prev.fertilizers + amount : prev.fertilizers,
          waterDrops: type === 'WATER' ? prev.waterDrops + amount : prev.waterDrops,
          inventory: type === 'magic_bean' ? { ...prev.inventory, 'magic_bean': (prev.inventory['magic_bean']||0) + 1 } : prev.inventory
      }));
  };

  return { now, plantSeed, waterPlot, catchBug, harvestPlot, buyAnimal, feedAnimal, collectProduct, buyMachine, startProcessing, collectMachine, deliverOrder, generateOrders, addReward, canAfford, feedPet, updateMissionProgress };
};
