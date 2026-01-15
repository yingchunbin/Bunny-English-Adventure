
import { useState, useEffect, useCallback } from 'react';
import { UserState, FarmPlot, FarmOrder, Crop, Mission, LivestockSlot } from '../types';
import { CROPS, ANIMALS, PRODUCTS, MYSTERY_BOX_REWARDS } from '../data/farmData';
import { playSFX } from '../utils/sound';

export const useFarmGame = (
  userState: UserState, 
  onUpdateState: (newState: UserState | ((prev: UserState) => UserState)) => void
) => {
  const [now, setNow] = useState(Date.now());
  
  // Helper: Tạo 1 đơn hàng duy nhất (để trám vào chỗ trống)
  const createSingleOrder = (grade: number, completedCount: number, currentLivestock: LivestockSlot[] = []) => {
      const npcs = ["Bác Gấu", "Cô Mèo", "Bạn Thỏ", "Chú Hổ", "Bà Cáo", "Thầy Rùa"];
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
              const expBase = itemData.type === 'PRODUCT' ? 15 : (itemData as Crop).exp || 5;
              totalExp += expBase * amount * 2.5; 
          }
      }

      const duration = (Math.random() * 5 + 2) * 60 * 1000; // 2-7 minutes

      return {
          id: Math.random().toString(36).substr(2, 9),
          npcName: npcs[Math.floor(Math.random() * npcs.length)],
          requirements,
          rewardCoins: Math.floor(totalValue * 1.5),
          rewardExp: Math.floor(totalExp),
          expiresAt: Date.now() + duration
      };
  };

  // --- MAIN GAME LOOP ---
  useEffect(() => {
    const interval = setInterval(() => {
        const currentTime = Date.now();
        setNow(currentTime);

        onUpdateState(prev => {
            let newState = { ...prev };
            let hasChanges = false;

            // 1. Weather Logic (Mưa ngẫu nhiên - 0.2% mỗi giây)
            if (Math.random() < 0.002) { 
                const newWeather = prev.weather === 'SUNNY' ? 'RAINY' : 'SUNNY';
                newState.weather = newWeather;
                hasChanges = true;
                
                // Mưa thì tự động tưới cây
                if (newWeather === 'RAINY') {
                    newState.farmPlots = prev.farmPlots.map(p => 
                        p.cropId && !p.isWatered ? { ...p, isWatered: true } : p
                    );
                }
            }

            // 2. Sâu bệnh (0.5% mỗi giây)
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

            // 3. Quản lý Đơn hàng (Hết hạn & Tự bù)
            let currentOrders = prev.activeOrders || [];
            const validOrders = currentOrders.filter(o => o.expiresAt > currentTime);
            
            // Nếu có đơn hết hạn, cập nhật danh sách
            if (validOrders.length !== currentOrders.length) {
                currentOrders = validOrders;
                hasChanges = true;
            }

            // Nếu thiếu đơn (dưới 3), 10% cơ hội mỗi giây sẽ có thương buôn mới đến
            if (currentOrders.length < 3 && Math.random() < 0.1) {
                const newOrder = createSingleOrder(prev.grade || 1, prev.completedLevels?.length || 0, prev.livestockSlots);
                currentOrders = [...currentOrders, newOrder];
                hasChanges = true;
            }
            
            if (hasChanges) {
                newState.activeOrders = currentOrders;
            }

            // 4. Cứu trợ khẩn cấp (Tránh game over)
            const totalSeeds = Object.values(prev.inventory || {}).reduce((a, b) => a + b, 0);
            const activeCrops = prev.farmPlots.filter(p => p.cropId).length;
            if (prev.coins < 10 && totalSeeds === 0 && activeCrops === 0) {
                newState.inventory = { ...prev.inventory, 'carrot': (prev.inventory['carrot'] || 0) + 3 };
                newState.waterDrops = Math.max(prev.waterDrops, 5);
                hasChanges = true;
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
                  changed = true;
                  return { ...m, current: newCurrent, completed: newCurrent >= m.target };
              }
              return m;
          });
          return changed ? { ...prev, missions: newMissions } : prev;
      });
  }, [onUpdateState]);

  // Tạo mới toàn bộ danh sách (Dùng cho nút Refresh thủ công)
  const generateOrders = useCallback((grade: number, completedCount: number, currentLivestock: LivestockSlot[] = []) => {
      const newOrders: FarmOrder[] = [];
      while (newOrders.length < 3) {
          newOrders.push(createSingleOrder(grade, completedCount, currentLivestock));
      }
      return newOrders;
  }, []);

  const canAfford = (amount: number) => userState.coins >= amount;

  const plantSeed = (plotId: number, seedId: string) => {
      const count = userState.inventory[seedId] || 0;
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

  const catchBug = (plotId: number) => {
      // LOGIC MỚI: Bắt sâu xong cây sẽ bị "khát nước" (isWatered = false)
      // Điều này tạo ra chuỗi gameplay: Bắt Sâu -> Tưới Nước -> Thu Hoạch
      onUpdateState(prev => ({
          ...prev,
          farmPlots: prev.farmPlots.map(p => p.id === plotId ? { ...p, hasBug: false, isWatered: false } : p)
      }));
      return { success: true };
  };

  const harvestPlot = (plotId: number, crop: Crop) => {
      playSFX('harvest');
      onUpdateState(prev => {
          const currentCrops = prev.harvestedCrops || {};
          const newHarvest = { ...currentCrops };
          newHarvest[crop.id] = (newHarvest[crop.id] || 0) + 1;
          
          let newExp = (prev.petExp || 0) + crop.exp;
          let newLevel = prev.petLevel || 1;
          const XP_PER_LEVEL = 300; 
          if (newExp >= XP_PER_LEVEL) { 
              newLevel += 1; 
              newExp -= XP_PER_LEVEL; 
          }

          return {
              ...prev,
              harvestedCrops: newHarvest,
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
          if (newExp >= 300) { newLevel += 1; newExp -= 300; }

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
          const XP_PER_LEVEL = 300; 
          if (newExp >= XP_PER_LEVEL) { newLevel += 1; newExp -= XP_PER_LEVEL; }

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

  return { now, plantSeed, waterPlot, catchBug, harvestPlot, buyAnimal, feedAnimal, collectProduct, deliverOrder, generateOrders, addReward, canAfford, feedPet, updateMissionProgress };
};
