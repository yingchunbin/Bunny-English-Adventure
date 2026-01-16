
import { Crop, Decor, AnimalItem, Product, ProcessingRecipe, MachineItem, Mission } from '../types';

// --- CROPS ---
export const CROPS: Crop[] = [
  { id: 'carrot', name: 'Cà rốt', emoji: '🥕', type: 'CROP', currency: 'COIN', cost: 10, sellPrice: 20, growthTime: 10, exp: 5, unlockReq: 0 }, 
  { id: 'wheat', name: 'Lúa mì', emoji: '🌾', type: 'CROP', currency: 'COIN', cost: 15, sellPrice: 35, growthTime: 30, exp: 10, unlockReq: 1 }, 
  { id: 'corn', name: 'Bắp ngô', emoji: '🌽', type: 'CROP', currency: 'COIN', cost: 25, sellPrice: 55, growthTime: 60, exp: 15, unlockReq: 2 },
  { id: 'tomato', name: 'Cà chua', emoji: '🍅', type: 'CROP', currency: 'COIN', cost: 40, sellPrice: 90, growthTime: 120, exp: 25, unlockReq: 3 },
  { id: 'strawberry', name: 'Dâu tây', emoji: '🍓', type: 'CROP', currency: 'STAR', cost: 1, sellPrice: 150, growthTime: 180, exp: 50, unlockReq: 5, isMagic: true },
];

// --- ANIMALS ---
export const ANIMALS: AnimalItem[] = [
    { id: 'chicken', name: 'Gà mái', emoji: '🐔', type: 'ANIMAL', currency: 'COIN', cost: 200, produceId: 'egg', produceTime: 60, feedCropId: 'wheat', feedAmount: 1, exp: 30, minLevel: 1 },
    { id: 'cow', name: 'Bò sữa', emoji: '🐄', type: 'ANIMAL', currency: 'COIN', cost: 500, produceId: 'milk', produceTime: 120, feedCropId: 'corn', feedAmount: 2, exp: 60, minLevel: 3 },
    { id: 'pig', name: 'Heo ủn ỉn', emoji: '🐷', type: 'ANIMAL', currency: 'STAR', cost: 5, produceId: 'bacon', produceTime: 300, feedCropId: 'carrot', feedAmount: 5, exp: 100, minLevel: 5 },
];

// --- PRODUCTS (Harvested from animals or made in machines) ---
export const PRODUCTS: Product[] = [
    { id: 'egg', name: 'Trứng gà', emoji: '🥚', type: 'PRODUCT', currency: 'COIN', cost: 0, sellPrice: 40 },
    { id: 'milk', name: 'Sữa tươi', emoji: '🥛', type: 'PRODUCT', currency: 'COIN', cost: 0, sellPrice: 80 },
    { id: 'bacon', name: 'Thịt heo', emoji: '🥓', type: 'PRODUCT', currency: 'COIN', cost: 0, sellPrice: 200 },
    { id: 'bread', name: 'Bánh mì', emoji: '🍞', type: 'PROCESSED', currency: 'COIN', cost: 0, sellPrice: 100 },
    { id: 'butter', name: 'Bơ', emoji: '🧈', type: 'PROCESSED', currency: 'COIN', cost: 0, sellPrice: 150 },
    { id: 'popcorn', name: 'Bắp rang', emoji: '🍿', type: 'PROCESSED', currency: 'COIN', cost: 0, sellPrice: 120 },
];

// --- MACHINES ---
export const MACHINES: MachineItem[] = [
    { id: 'bakery', name: 'Lò Bánh', emoji: '🥖', type: 'MACHINE', currency: 'COIN', cost: 800, unlockPrice: 800, description: 'Nướng bánh mì thơm ngon', minLevel: 2 },
    { id: 'dairy', name: 'Nhà máy Sữa', emoji: '🧀', type: 'MACHINE', currency: 'COIN', cost: 1500, unlockPrice: 1500, description: 'Làm bơ và phô mai', minLevel: 4 },
    { id: 'snack_machine', name: 'Máy Ăn Vặt', emoji: '🍟', type: 'MACHINE', currency: 'STAR', cost: 10, unlockPrice: 0, description: 'Làm bắp rang bơ', minLevel: 5 },
];

// --- RECIPES ---
export const RECIPES: ProcessingRecipe[] = [
    { id: 'r_bread', machineId: 'bakery', name: 'Bánh mì', input: [{id: 'wheat', amount: 2}, {id: 'egg', amount: 1}], outputId: 'bread', duration: 30, exp: 20 },
    { id: 'r_butter', machineId: 'dairy', name: 'Bơ', input: [{id: 'milk', amount: 2}], outputId: 'butter', duration: 60, exp: 30 },
    { id: 'r_popcorn', machineId: 'snack_machine', name: 'Bắp rang', input: [{id: 'corn', amount: 3}], outputId: 'popcorn', duration: 45, exp: 25 },
];

// --- DECORATIONS ---
export const DECORATIONS: Decor[] = [
    { id: 'fence', name: 'Hàng rào', emoji: '🚧', type: 'DECOR', currency: 'COIN', cost: 100 },
    { id: 'flower_pot', name: 'Chậu hoa', emoji: '🌻', type: 'DECOR', currency: 'COIN', cost: 200 },
    { id: 'scarecrow', name: 'Bù nhìn', emoji: '🎃', type: 'DECOR', currency: 'COIN', cost: 500 },
    { id: 'fountain', name: 'Đài phun nước', emoji: '⛲', type: 'DECOR', currency: 'STAR', cost: 20 },
    { id: 'statue', name: 'Tượng Thần', emoji: '🗿', type: 'DECOR', currency: 'STAR', cost: 50 },
];

export const FARM_ACHIEVEMENTS_DATA: Mission[] = [
    // Achievements (One time)
    { id: 'ach_hv_50', desc: 'Thu hoạch 50 lần', type: 'HARVEST', category: 'ACHIEVEMENT', target: 50, current: 0, reward: { type: 'STAR', amount: 5 }, completed: false, claimed: false },
    { id: 'ach_earn_1k', desc: 'Kiếm 1000 xu', type: 'EARN', category: 'ACHIEVEMENT', target: 1000, current: 0, reward: { type: 'STAR', amount: 10 }, completed: false, claimed: false },
];

export const DAILY_MISSION_POOL: Mission[] = [
    { id: 'd_water_5', desc: 'Tưới cây 5 lần', type: 'WATER', category: 'DAILY', target: 5, current: 0, reward: { type: 'COIN', amount: 50 }, completed: false, claimed: false },
    { id: 'd_harvest_10', desc: 'Thu hoạch 10 nông sản', type: 'HARVEST', category: 'DAILY', target: 10, current: 0, reward: { type: 'COIN', amount: 100 }, completed: false, claimed: false },
    { id: 'd_quiz_3', desc: 'Trả lời đúng 3 câu đố', type: 'QUIZ', category: 'DAILY', target: 3, current: 0, reward: { type: 'STAR', amount: 1 }, completed: false, claimed: false },
    { id: 'd_feed_5', desc: 'Cho vật nuôi ăn 5 lần', type: 'FEED', category: 'DAILY', target: 5, current: 0, reward: { type: 'COIN', amount: 80 }, completed: false, claimed: false },
];
