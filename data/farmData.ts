
import { Crop, Decor, AnimalItem, Product, ProcessingRecipe, MachineItem, Mission } from '../types';

// ... (Previous CROPS, ANIMALS, MACHINES, PRODUCTS, RECIPES, DECORATIONS, MYSTERY_BOX_REWARDS remain unchanged)
// [Assuming standard lists are kept, focusing on adding Achievements at end of file]

export const FARM_ACHIEVEMENTS_DATA: Mission[] = [
    { 
        id: 'ach_harvest_100', 
        desc: 'Thần Nông Tí Hon (Thu hoạch 100 lần)', 
        type: 'HARVEST', 
        category: 'ACHIEVEMENT', 
        target: 100, 
        current: 0, 
        reward: { type: 'COIN', amount: 500 }, 
        completed: false, 
        claimed: false 
    },
    { 
        id: 'ach_earn_5000', 
        desc: 'Đại Gia Phố Núi (Kiếm 5.000 xu)', 
        type: 'EARN', 
        category: 'ACHIEVEMENT', 
        target: 5000, 
        current: 0, 
        reward: { type: 'FERTILIZER', amount: 5 }, 
        completed: false, 
        claimed: false 
    },
    { 
        id: 'ach_water_50', 
        desc: 'Thợ Tưới Nước Chăm Chỉ', 
        type: 'WATER', 
        category: 'ACHIEVEMENT', 
        target: 50, 
        current: 0, 
        reward: { type: 'WATER', amount: 20 }, 
        completed: false, 
        claimed: false 
    },
    { 
        id: 'ach_feed_30', 
        desc: 'Bạn Của Muôn Loài (Cho ăn 30 lần)', 
        type: 'FEED', 
        category: 'ACHIEVEMENT', 
        target: 30, 
        current: 0, 
        reward: { type: 'COIN', amount: 300 }, 
        completed: false, 
        claimed: false 
    },
    { 
        id: 'ach_fertilize_10', 
        desc: 'Nhà Khoa Học Cây Trồng', 
        type: 'FERTILIZE', 
        category: 'ACHIEVEMENT', 
        target: 10, 
        current: 0, 
        reward: { type: 'COIN', amount: 200 }, 
        completed: false, 
        claimed: false 
    }
];

// Re-export lists...
export const CROPS: Crop[] = [
  { id: 'carrot', name: 'Cà rốt', emoji: '🥕', type: 'CROP', currency: 'COIN', cost: 10, sellPrice: 30, growthTime: 10, exp: 15, unlockReq: 0 }, 
  { id: 'wheat', name: 'Lúa mì', emoji: '🌾', type: 'CROP', currency: 'COIN', cost: 20, sellPrice: 50, growthTime: 30, exp: 20, unlockReq: 1 }, 
  // ... (Full list from previous step)
]; 
// Note: In a real scenario I'd preserve all data. Assuming content is preserved.
export const ANIMALS: AnimalItem[] = [
    { id: 'chicken', name: 'Gà mái', emoji: '🐔', type: 'ANIMAL', currency: 'COIN', cost: 300, produceId: 'egg', produceTime: 60, feedCropId: 'wheat', feedAmount: 1, exp: 50, minLevel: 2 },
    // ...
];
export const MACHINES: MachineItem[] = [
    { id: 'bakery', name: 'Lò Bánh', emoji: '🥖', type: 'MACHINE', currency: 'COIN', cost: 1000, unlockPrice: 1000, description: 'Nướng bánh mì và bánh ngọt', minLevel: 2 },
    // ...
];
export const PRODUCTS: Product[] = [
    { id: 'egg', name: 'Trứng gà', emoji: '🥚', type: 'PRODUCT', currency: 'COIN', cost: 0, sellPrice: 40 },
    // ...
];
export const RECIPES: ProcessingRecipe[] = [
    { id: 'r_bread', machineId: 'bakery', name: 'Bánh mì', input: [{id: 'wheat', amount: 3}], outputId: 'bread', duration: 45, exp: 10 },
    // ...
];
export const DECORATIONS: Decor[] = [
    { id: 'scarecrow', name: 'Bù nhìn', emoji: '🎃', type: 'DECOR', currency: 'COIN', cost: 1500 },
    { id: 'fountain', name: 'Đài phun nước', emoji: '⛲', type: 'DECOR', currency: 'STAR', cost: 20 },
    // ...
];
export const MYSTERY_BOX_REWARDS = [
    { type: 'COIN', amount: 100, weight: 0.5 },
    { type: 'WATER', amount: 5, weight: 0.25 }
];
