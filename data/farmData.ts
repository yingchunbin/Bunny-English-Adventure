
import { Crop, Decor, AnimalItem, Product, ProcessingRecipe, MachineItem } from '../types';

// --- 1. CÂY TRỒNG (Rebalanced: Unlock req lowered, XP/Price increased) ---
export const CROPS: Crop[] = [
  // Cấp 1-3: Cơ bản (Dễ trồng, nhanh thu hoạch)
  { id: 'carrot', name: 'Cà rốt', emoji: '🥕', type: 'CROP', currency: 'COIN', cost: 10, sellPrice: 30, growthTime: 10, exp: 15, unlockReq: 0 }, 
  { id: 'wheat', name: 'Lúa mì', emoji: '🌾', type: 'CROP', currency: 'COIN', cost: 20, sellPrice: 50, growthTime: 30, exp: 20, unlockReq: 1 }, 
  { id: 'corn', name: 'Ngô', emoji: '🌽', type: 'CROP', currency: 'COIN', cost: 40, sellPrice: 90, growthTime: 60, exp: 30, unlockReq: 1 },
  { id: 'rice', name: 'Lúa', emoji: '🌱', type: 'CROP', currency: 'COIN', cost: 15, sellPrice: 40, growthTime: 45, exp: 25, unlockReq: 2 },
  
  // Cấp 4-6: Rau củ (Giá trị trung bình)
  { id: 'potato', name: 'Khoai tây', emoji: '🥔', type: 'CROP', currency: 'COIN', cost: 50, sellPrice: 120, growthTime: 90, exp: 40, unlockReq: 2 },
  { id: 'cabbage', name: 'Bắp cải', emoji: '🥬', type: 'CROP', currency: 'COIN', cost: 60, sellPrice: 140, growthTime: 120, exp: 45, unlockReq: 3 },
  { id: 'tomato', name: 'Cà chua', emoji: '🍅', type: 'CROP', currency: 'COIN', cost: 80, sellPrice: 180, growthTime: 150, exp: 50, unlockReq: 3 },
  { id: 'strawberry', name: 'Dâu tây', emoji: '🍓', type: 'CROP', currency: 'COIN', cost: 100, sellPrice: 250, growthTime: 180, exp: 60, unlockReq: 4 },
  
  // Cấp 7-9: Cây công nghiệp
  { id: 'sugarcane', name: 'Mía', emoji: '🎋', type: 'CROP', currency: 'COIN', cost: 90, sellPrice: 200, growthTime: 200, exp: 55, unlockReq: 4 },
  { id: 'cotton', name: 'Bông', emoji: '☁️', type: 'CROP', currency: 'COIN', cost: 120, sellPrice: 280, growthTime: 240, exp: 70, unlockReq: 5 },
  { id: 'pumpkin', name: 'Bí ngô', emoji: '🎃', type: 'CROP', currency: 'COIN', cost: 150, sellPrice: 350, growthTime: 300, exp: 80, unlockReq: 5 },
  { id: 'grapes', name: 'Nho', emoji: '🍇', type: 'CROP', currency: 'COIN', cost: 180, sellPrice: 400, growthTime: 360, exp: 90, unlockReq: 6 },

  // Cấp 10+: Cao cấp
  { id: 'watermelon', name: 'Dưa hấu', emoji: '🍉', type: 'CROP', currency: 'COIN', cost: 200, sellPrice: 450, growthTime: 420, exp: 100, unlockReq: 6 },
  { id: 'chilli', name: 'Ớt', emoji: '🌶️', type: 'CROP', currency: 'COIN', cost: 160, sellPrice: 380, growthTime: 400, exp: 95, unlockReq: 7 },
  { id: 'coffee', name: 'Cà phê', emoji: '🫘', type: 'CROP', currency: 'COIN', cost: 220, sellPrice: 500, growthTime: 480, exp: 110, unlockReq: 7 },
  { id: 'pineapple', name: 'Dứa', emoji: '🍍', type: 'CROP', currency: 'COIN', cost: 250, sellPrice: 550, growthTime: 540, exp: 120, unlockReq: 8 },
  { id: 'sunflower', name: 'Hướng dương', emoji: '🌻', type: 'CROP', currency: 'COIN', cost: 130, sellPrice: 300, growthTime: 220, exp: 65, unlockReq: 8 },
  { id: 'bamboo', name: 'Tre', emoji: '🎍', type: 'CROP', currency: 'COIN', cost: 180, sellPrice: 400, growthTime: 300, exp: 85, unlockReq: 9 },

  // Cấp 16+: Hoa & Cây đặc biệt
  { id: 'rose', name: 'Hoa hồng', emoji: '🌹', type: 'CROP', currency: 'COIN', cost: 280, sellPrice: 650, growthTime: 600, exp: 150, unlockReq: 9 },
  { id: 'tulip', name: 'Hoa Tulip', emoji: '🌷', type: 'CROP', currency: 'COIN', cost: 300, sellPrice: 700, growthTime: 700, exp: 160, unlockReq: 10 },
  { id: 'lotus', name: 'Hoa sen', emoji: '🪷', type: 'CROP', currency: 'COIN', cost: 350, sellPrice: 800, growthTime: 800, exp: 180, unlockReq: 10 },
  { id: 'cocoa', name: 'Ca cao', emoji: '🍫', type: 'CROP', currency: 'COIN', cost: 400, sellPrice: 900, growthTime: 900, exp: 200, unlockReq: 11 },
  { id: 'mushroom', name: 'Nấm', emoji: '🍄', type: 'CROP', currency: 'COIN', cost: 450, sellPrice: 1000, growthTime: 1000, exp: 220, unlockReq: 12 },
  { id: 'rainbow_flower', name: 'Hoa Cầu Vồng', emoji: '🌈', type: 'CROP', currency: 'STAR', cost: 5, sellPrice: 5000, growthTime: 600, exp: 1000, unlockReq: 15, isMagic: true },
];

// --- 2. VẬT NUÔI (Rebalanced: Lower minLevel, easier entry) ---
export const ANIMALS: AnimalItem[] = [
    // Level 2-5: Basic
    { id: 'chicken', name: 'Gà mái', emoji: '🐔', type: 'ANIMAL', currency: 'COIN', cost: 300, produceId: 'egg', produceTime: 60, feedCropId: 'wheat', feedAmount: 1, exp: 50, minLevel: 2 },
    { id: 'duck', name: 'Vịt bầu', emoji: '🦆', type: 'ANIMAL', currency: 'COIN', cost: 800, produceId: 'duck_egg', produceTime: 120, feedCropId: 'corn', feedAmount: 1, exp: 80, minLevel: 2 },
    { id: 'rabbit', name: 'Thỏ trắng', emoji: '🐰', type: 'ANIMAL', currency: 'COIN', cost: 1500, produceId: 'rabbit_fur', produceTime: 180, feedCropId: 'carrot', feedAmount: 2, exp: 100, minLevel: 3 },
    { id: 'silkworm', name: 'Tằm', emoji: '🐛', type: 'ANIMAL', currency: 'COIN', cost: 2000, produceId: 'silk', produceTime: 300, feedCropId: 'cabbage', feedAmount: 2, exp: 120, minLevel: 4 },
    { id: 'bee', name: 'Ong mật', emoji: '🐝', type: 'ANIMAL', currency: 'COIN', cost: 2500, produceId: 'honey', produceTime: 360, feedCropId: 'sunflower', feedAmount: 2, exp: 150, minLevel: 4 },

    // Level 5-10: Intermediate
    { id: 'pig', name: 'Heo ủn ỉn', emoji: '🐖', type: 'ANIMAL', currency: 'COIN', cost: 3500, produceId: 'bacon', produceTime: 400, feedCropId: 'potato', feedAmount: 2, exp: 180, minLevel: 5 },
    { id: 'sheep', name: 'Cừu', emoji: '🐑', type: 'ANIMAL', currency: 'COIN', cost: 4500, produceId: 'wool', produceTime: 600, feedCropId: 'wheat', feedAmount: 3, exp: 200, minLevel: 6 },
    { id: 'cow', name: 'Bò sữa', emoji: '🐄', type: 'ANIMAL', currency: 'COIN', cost: 6000, produceId: 'milk', produceTime: 500, feedCropId: 'corn', feedAmount: 3, exp: 250, minLevel: 7 },
    { id: 'goat', name: 'Dê núi', emoji: '🐐', type: 'ANIMAL', currency: 'COIN', cost: 7500, produceId: 'goat_milk', produceTime: 550, feedCropId: 'cabbage', feedAmount: 3, exp: 280, minLevel: 8 },
    { id: 'buffalo', name: 'Trâu nước', emoji: '🐃', type: 'ANIMAL', currency: 'COIN', cost: 9000, produceId: 'buffalo_milk', produceTime: 700, feedCropId: 'rice', feedAmount: 4, exp: 320, minLevel: 9 },

    // Level 10+: Advanced
    { id: 'turkey', name: 'Gà Tây', emoji: '🦃', type: 'ANIMAL', currency: 'COIN', cost: 10000, produceId: 'turkey_feather', produceTime: 800, feedCropId: 'corn', feedAmount: 4, exp: 350, minLevel: 10 },
    { id: 'horse', name: 'Ngựa', emoji: '🐎', type: 'ANIMAL', currency: 'COIN', cost: 12000, produceId: 'horseshoe', produceTime: 900, feedCropId: 'carrot', feedAmount: 5, exp: 400, minLevel: 11 },
    { id: 'ostrich', name: 'Đà điểu', emoji: '🐦', type: 'ANIMAL', currency: 'COIN', cost: 15000, produceId: 'giant_egg', produceTime: 1000, feedCropId: 'tomato', feedAmount: 4, exp: 450, minLevel: 12 },
    { id: 'camel', name: 'Lạc đà', emoji: '🐪', type: 'ANIMAL', currency: 'COIN', cost: 18000, produceId: 'camel_milk', produceTime: 1200, feedCropId: 'pumpkin', feedAmount: 2, exp: 500, minLevel: 13 },
    { id: 'llama', name: 'Lạc đà Alpaca', emoji: '🦙', type: 'ANIMAL', currency: 'COIN', cost: 20000, produceId: 'llama_fur', produceTime: 1100, feedCropId: 'wheat', feedAmount: 5, exp: 550, minLevel: 14 },
    
    // Level 15+: Rare
    { id: 'peacock', name: 'Chim Công', emoji: '🦚', type: 'ANIMAL', currency: 'COIN', cost: 25000, produceId: 'peacock_feather', produceTime: 1500, feedCropId: 'grapes', feedAmount: 3, exp: 600, minLevel: 15 },
    { id: 'panda', name: 'Gấu Trúc', emoji: '🐼', type: 'ANIMAL', currency: 'COIN', cost: 30000, produceId: 'bamboo_shoot', produceTime: 1800, feedCropId: 'bamboo', feedAmount: 5, exp: 700, minLevel: 16 },
    { id: 'elephant', name: 'Voi', emoji: '🐘', type: 'ANIMAL', currency: 'COIN', cost: 40000, produceId: 'heavy_log', produceTime: 2000, feedCropId: 'watermelon', feedAmount: 3, exp: 800, minLevel: 17 },
    { id: 'lion', name: 'Sư Tử', emoji: '🦁', type: 'ANIMAL', currency: 'COIN', cost: 50000, produceId: 'golden_mane', produceTime: 2500, feedCropId: 'bacon', feedAmount: 2, exp: 1000, minLevel: 18 },
    { id: 'unicorn', name: 'Kỳ Lân', emoji: '🦄', type: 'ANIMAL', currency: 'STAR', cost: 50, produceId: 'fairy_dust', produceTime: 3600, feedCropId: 'rainbow_flower', feedAmount: 1, exp: 2000, minLevel: 20 },
];

// --- 3. MÁY MÓC (Rebalanced: Lower unlock price and level) ---
export const MACHINES: MachineItem[] = [
    { id: 'bakery', name: 'Lò Bánh', emoji: '🥖', type: 'MACHINE', currency: 'COIN', cost: 1000, unlockPrice: 1000, description: 'Nướng bánh mì và bánh ngọt', minLevel: 2 },
    { id: 'snack_machine', name: 'Máy Ăn Vặt', emoji: '🍿', type: 'MACHINE', currency: 'COIN', cost: 2000, unlockPrice: 2000, description: 'Làm bắp rang và snack', minLevel: 3 },
    { id: 'dairy', name: 'Nhà Máy Sữa', emoji: '🧀', type: 'MACHINE', currency: 'COIN', cost: 3500, unlockPrice: 3500, description: 'Chế biến các loại sữa', minLevel: 4 },
    { id: 'textile', name: 'Máy Dệt', emoji: '🧵', type: 'MACHINE', currency: 'COIN', cost: 5000, unlockPrice: 5000, description: 'Dệt vải từ bông và len', minLevel: 6 },
    { id: 'sugar_mill', name: 'Máy Ép Mía', emoji: '🍬', type: 'MACHINE', currency: 'COIN', cost: 6500, unlockPrice: 6500, description: 'Sản xuất đường', minLevel: 7 },
    { id: 'beverage', name: 'Máy Pha Chế', emoji: '🍹', type: 'MACHINE', currency: 'COIN', cost: 8000, unlockPrice: 8000, description: 'Làm nước ép và cà phê', minLevel: 8 },
    { id: 'grill', name: 'Lò Nướng Thịt', emoji: '🍖', type: 'MACHINE', currency: 'COIN', cost: 10000, unlockPrice: 10000, description: 'Nướng thịt thơm ngon', minLevel: 10 },
    { id: 'jam_maker', name: 'Máy Làm Mứt', emoji: '🍯', type: 'MACHINE', currency: 'COIN', cost: 12000, unlockPrice: 12000, description: 'Làm mứt trái cây', minLevel: 11 },
    { id: 'ice_cream', name: 'Máy Làm Kem', emoji: '🍦', type: 'MACHINE', currency: 'COIN', cost: 15000, unlockPrice: 15000, description: 'Làm kem mát lạnh', minLevel: 12 },
    { id: 'perfume', name: 'Máy Nước Hoa', emoji: '⚗️', type: 'MACHINE', currency: 'COIN', cost: 20000, unlockPrice: 20000, description: 'Chiết xuất hương hoa', minLevel: 14 },
    { id: 'sushi_bar', name: 'Quầy Sushi', emoji: '🍣', type: 'MACHINE', currency: 'COIN', cost: 30000, unlockPrice: 30000, description: 'Làm cơm cuộn', minLevel: 16 },
    { id: 'jewelry', name: 'Máy Trang Sức', emoji: '💎', type: 'MACHINE', currency: 'COIN', cost: 50000, unlockPrice: 50000, description: 'Chế tác đồ trang sức', minLevel: 18 },
];

// --- 4. SẢN PHẨM (Raw + Processed) ---
export const PRODUCTS: Product[] = [
    // --- RAW FROM ANIMALS ---
    { id: 'egg', name: 'Trứng gà', emoji: '🥚', type: 'PRODUCT', currency: 'COIN', cost: 0, sellPrice: 40 },
    { id: 'duck_egg', name: 'Trứng vịt', emoji: '🪺', type: 'PRODUCT', currency: 'COIN', cost: 0, sellPrice: 60 },
    { id: 'rabbit_fur', name: 'Lông thỏ', emoji: '☁️', type: 'PRODUCT', currency: 'COIN', cost: 0, sellPrice: 80 },
    { id: 'silk', name: 'Tơ tằm', emoji: '🕸️', type: 'PRODUCT', currency: 'COIN', cost: 0, sellPrice: 120 },
    { id: 'honey', name: 'Mật ong', emoji: '🍯', type: 'PRODUCT', currency: 'COIN', cost: 0, sellPrice: 150 },
    { id: 'bacon', name: 'Thịt heo', emoji: '🥓', type: 'PRODUCT', currency: 'COIN', cost: 0, sellPrice: 180 },
    { id: 'wool', name: 'Len cừu', emoji: '🧶', type: 'PRODUCT', currency: 'COIN', cost: 0, sellPrice: 200 },
    { id: 'milk', name: 'Sữa bò', emoji: '🥛', type: 'PRODUCT', currency: 'COIN', cost: 0, sellPrice: 220 },
    { id: 'goat_milk', name: 'Sữa dê', emoji: '🥛', type: 'PRODUCT', currency: 'COIN', cost: 0, sellPrice: 250 },
    { id: 'buffalo_milk', name: 'Sữa trâu', emoji: '🍼', type: 'PRODUCT', currency: 'COIN', cost: 0, sellPrice: 280 },
    { id: 'turkey_feather', name: 'Lông gà tây', emoji: '🪶', type: 'PRODUCT', currency: 'COIN', cost: 0, sellPrice: 300 },
    { id: 'horseshoe', name: 'Móng ngựa', emoji: '🧲', type: 'PRODUCT', currency: 'COIN', cost: 0, sellPrice: 350 },
    { id: 'giant_egg', name: 'Trứng đà điểu', emoji: '🥚', type: 'PRODUCT', currency: 'COIN', cost: 0, sellPrice: 400 },
    { id: 'camel_milk', name: 'Sữa lạc đà', emoji: '🍶', type: 'PRODUCT', currency: 'COIN', cost: 0, sellPrice: 450 },
    { id: 'llama_fur', name: 'Lông Llama', emoji: '🧶', type: 'PRODUCT', currency: 'COIN', cost: 0, sellPrice: 500 },
    { id: 'peacock_feather', name: 'Lông công', emoji: '🪶', type: 'PRODUCT', currency: 'COIN', cost: 0, sellPrice: 800 },
    { id: 'bamboo_shoot', name: 'Măng trúc', emoji: '🎍', type: 'PRODUCT', currency: 'COIN', cost: 0, sellPrice: 900 },
    { id: 'heavy_log', name: 'Gỗ quý', emoji: '🪵', type: 'PRODUCT', currency: 'COIN', cost: 0, sellPrice: 1200 },
    { id: 'golden_mane', name: 'Bờm sư tử', emoji: '🦁', type: 'PRODUCT', currency: 'COIN', cost: 0, sellPrice: 2000 },
    { id: 'fairy_dust', name: 'Bụi tiên', emoji: '✨', type: 'PRODUCT', currency: 'COIN', cost: 0, sellPrice: 5000 },

    // --- PROCESSED ---
    // Bakery
    { id: 'bread', name: 'Bánh mì', emoji: '🍞', type: 'PROCESSED', currency: 'COIN', cost: 0, sellPrice: 150 },
    { id: 'cookie', name: 'Bánh quy', emoji: '🍪', type: 'PROCESSED', currency: 'COIN', cost: 0, sellPrice: 120 },
    { id: 'cake', name: 'Bánh kem', emoji: '🍰', type: 'PROCESSED', currency: 'COIN', cost: 0, sellPrice: 400 },
    // Snack
    { id: 'popcorn', name: 'Bắp rang', emoji: '🍿', type: 'PROCESSED', currency: 'COIN', cost: 0, sellPrice: 180 },
    { id: 'potato_chips', name: 'Snack khoai tây', emoji: '🍟', type: 'PROCESSED', currency: 'COIN', cost: 0, sellPrice: 220 },
    // Dairy
    { id: 'butter', name: 'Bơ', emoji: '🧈', type: 'PROCESSED', currency: 'COIN', cost: 0, sellPrice: 350 },
    { id: 'cheese', name: 'Phô mai', emoji: '🧀', type: 'PROCESSED', currency: 'COIN', cost: 0, sellPrice: 450 },
    { id: 'yogurt', name: 'Sữa chua', emoji: '🥣', type: 'PROCESSED', currency: 'COIN', cost: 0, sellPrice: 300 },
    // Textile
    { id: 'cotton_fabric', name: 'Vải cotton', emoji: '👕', type: 'PROCESSED', currency: 'COIN', cost: 0, sellPrice: 400 },
    { id: 'silk_cloth', name: 'Vải lụa', emoji: '🧣', type: 'PROCESSED', currency: 'COIN', cost: 0, sellPrice: 600 },
    { id: 'wool_sweater', name: 'Áo len', emoji: '🧥', type: 'PROCESSED', currency: 'COIN', cost: 0, sellPrice: 800 },
    // Sugar
    { id: 'sugar', name: 'Đường', emoji: '🍬', type: 'PROCESSED', currency: 'COIN', cost: 0, sellPrice: 250 },
    { id: 'candy', name: 'Kẹo ngọt', emoji: '🍭', type: 'PROCESSED', currency: 'COIN', cost: 0, sellPrice: 300 },
    // Beverage
    { id: 'coffee_cup', name: 'Cà phê nóng', emoji: '☕', type: 'PROCESSED', currency: 'COIN', cost: 0, sellPrice: 550 },
    { id: 'orange_juice', name: 'Nước cam', emoji: '🍊', type: 'PROCESSED', currency: 'COIN', cost: 0, sellPrice: 350 },
    { id: 'pineapple_juice', name: 'Nước dứa', emoji: '🍍', type: 'PROCESSED', currency: 'COIN', cost: 0, sellPrice: 650 },
    { id: 'tea_cup', name: 'Trà nóng', emoji: '🍵', type: 'PROCESSED', currency: 'COIN', cost: 0, sellPrice: 400 },
    // Grill
    { id: 'grilled_fish', name: 'Cá nướng', emoji: '🐟', type: 'PROCESSED', currency: 'COIN', cost: 0, sellPrice: 700 }, // Need raw fish? Let's use generic item or sushi logic
    { id: 'steak', name: 'Bít tết', emoji: '🥩', type: 'PROCESSED', currency: 'COIN', cost: 0, sellPrice: 900 },
    { id: 'bbq_corn', name: 'Ngô nướng', emoji: '🌽', type: 'PROCESSED', currency: 'COIN', cost: 0, sellPrice: 200 },
    // Jam
    { id: 'strawberry_jam', name: 'Mứt dâu', emoji: '🍓', type: 'PROCESSED', currency: 'COIN', cost: 0, sellPrice: 450 },
    { id: 'grape_jam', name: 'Mứt nho', emoji: '🍇', type: 'PROCESSED', currency: 'COIN', cost: 0, sellPrice: 500 },
    // Ice Cream
    { id: 'vanilla_ice_cream', name: 'Kem vani', emoji: '🍦', type: 'PROCESSED', currency: 'COIN', cost: 0, sellPrice: 600 },
    { id: 'choco_ice_cream', name: 'Kem sô cô la', emoji: '🍫', type: 'PROCESSED', currency: 'COIN', cost: 0, sellPrice: 750 },
    { id: 'strawberry_ice_cream', name: 'Kem dâu', emoji: '🍧', type: 'PROCESSED', currency: 'COIN', cost: 0, sellPrice: 700 },
    // Perfume
    { id: 'rose_perfume', name: 'Nước hoa hồng', emoji: '🌹', type: 'PROCESSED', currency: 'COIN', cost: 0, sellPrice: 1500 },
    { id: 'tulip_perfume', name: 'Hương Tulip', emoji: '🌷', type: 'PROCESSED', currency: 'COIN', cost: 0, sellPrice: 1800 },
    { id: 'lotus_perfume', name: 'Hương Sen', emoji: '🪷', type: 'PROCESSED', currency: 'COIN', cost: 0, sellPrice: 2200 },
    // Sushi
    { id: 'egg_sushi', name: 'Sushi trứng', emoji: '🍣', type: 'PROCESSED', currency: 'COIN', cost: 0, sellPrice: 500 },
    { id: 'veggie_roll', name: 'Cơm cuộn rau', emoji: '🥒', type: 'PROCESSED', currency: 'COIN', cost: 0, sellPrice: 600 },
    // Jewelry
    { id: 'feather_hat', name: 'Mũ lông vũ', emoji: '👒', type: 'PROCESSED', currency: 'COIN', cost: 0, sellPrice: 2500 },
    { id: 'lion_charm', name: 'Bùa sư tử', emoji: '🧿', type: 'PROCESSED', currency: 'COIN', cost: 0, sellPrice: 5000 },
];

// --- 5. CÔNG THỨC (Recipes) ---
export const RECIPES: ProcessingRecipe[] = [
    // Bakery
    { id: 'r_bread', machineId: 'bakery', name: 'Bánh mì', input: [{id: 'wheat', amount: 3}], outputId: 'bread', duration: 45, exp: 10 },
    { id: 'r_cookie', machineId: 'bakery', name: 'Bánh quy', input: [{id: 'wheat', amount: 1}, {id: 'egg', amount: 1}], outputId: 'cookie', duration: 60, exp: 15 },
    { id: 'r_cake', machineId: 'bakery', name: 'Bánh kem', input: [{id: 'wheat', amount: 2}, {id: 'egg', amount: 2}, {id: 'milk', amount: 1}], outputId: 'cake', duration: 180, exp: 40 },
    
    // Snack Machine
    { id: 'r_popcorn', machineId: 'snack_machine', name: 'Bắp rang', input: [{id: 'corn', amount: 2}], outputId: 'popcorn', duration: 30, exp: 12 },
    { id: 'r_chips', machineId: 'snack_machine', name: 'Snack khoai', input: [{id: 'potato', amount: 2}], outputId: 'potato_chips', duration: 45, exp: 18 },
    
    // Dairy
    { id: 'r_butter', machineId: 'dairy', name: 'Làm Bơ', input: [{id: 'milk', amount: 2}], outputId: 'butter', duration: 90, exp: 25 },
    { id: 'r_cheese', machineId: 'dairy', name: 'Phô mai', input: [{id: 'milk', amount: 3}], outputId: 'cheese', duration: 120, exp: 35 },
    { id: 'r_yogurt', machineId: 'dairy', name: 'Sữa chua', input: [{id: 'milk', amount: 1}, {id: 'sugar', amount: 1}], outputId: 'yogurt', duration: 100, exp: 20 },
    
    // Textile
    { id: 'r_fabric', machineId: 'textile', name: 'Dệt vải', input: [{id: 'cotton', amount: 3}], outputId: 'cotton_fabric', duration: 150, exp: 30 },
    { id: 'r_silk', machineId: 'textile', name: 'Dệt lụa', input: [{id: 'silk', amount: 2}], outputId: 'silk_cloth', duration: 200, exp: 50 },
    { id: 'r_wool', machineId: 'textile', name: 'Đan áo len', input: [{id: 'wool', amount: 3}], outputId: 'wool_sweater', duration: 240, exp: 60 },
    
    // Sugar Mill
    { id: 'r_sugar', machineId: 'sugar_mill', name: 'Làm đường', input: [{id: 'sugarcane', amount: 2}], outputId: 'sugar', duration: 60, exp: 15 },
    { id: 'r_candy', machineId: 'sugar_mill', name: 'Làm kẹo', input: [{id: 'sugar', amount: 2}, {id: 'strawberry', amount: 1}], outputId: 'candy', duration: 90, exp: 25 },
    
    // Beverage
    { id: 'r_coffee', machineId: 'beverage', name: 'Pha cà phê', input: [{id: 'coffee', amount: 3}], outputId: 'coffee_cup', duration: 60, exp: 30 },
    { id: 'r_oj', machineId: 'beverage', name: 'Nước cam', input: [{id: 'orange', amount: 3}], outputId: 'orange_juice', duration: 45, exp: 20 },
    { id: 'r_tea', machineId: 'beverage', name: 'Pha trà', input: [{id: 'tea', amount: 2}], outputId: 'tea_cup', duration: 45, exp: 20 },
    { id: 'r_pine_juice', machineId: 'beverage', name: 'Nước dứa', input: [{id: 'pineapple', amount: 2}], outputId: 'pineapple_juice', duration: 60, exp: 35 },

    // Grill
    { id: 'r_steak', machineId: 'grill', name: 'Nướng thịt', input: [{id: 'bacon', amount: 2}], outputId: 'steak', duration: 120, exp: 60 },
    { id: 'r_bbq_corn', machineId: 'grill', name: 'Ngô nướng', input: [{id: 'corn', amount: 2}, {id: 'butter', amount: 1}], outputId: 'bbq_corn', duration: 90, exp: 20 },
    
    // Jam Maker
    { id: 'r_jam_straw', machineId: 'jam_maker', name: 'Mứt dâu', input: [{id: 'strawberry', amount: 3}, {id: 'sugar', amount: 1}], outputId: 'strawberry_jam', duration: 180, exp: 40 },
    { id: 'r_jam_grape', machineId: 'jam_maker', name: 'Mứt nho', input: [{id: 'grapes', amount: 3}, {id: 'sugar', amount: 1}], outputId: 'grape_jam', duration: 200, exp: 45 },
    
    // Ice Cream
    { id: 'r_ice_vanilla', machineId: 'ice_cream', name: 'Kem Vani', input: [{id: 'milk', amount: 2}, {id: 'sugar', amount: 1}], outputId: 'vanilla_ice_cream', duration: 150, exp: 50 },
    { id: 'r_ice_choco', machineId: 'ice_cream', name: 'Kem Sôcôla', input: [{id: 'milk', amount: 2}, {id: 'cocoa', amount: 2}], outputId: 'choco_ice_cream', duration: 180, exp: 60 },
    { id: 'r_ice_straw', machineId: 'ice_cream', name: 'Kem Dâu', input: [{id: 'milk', amount: 2}, {id: 'strawberry', amount: 2}], outputId: 'strawberry_ice_cream', duration: 180, exp: 55 },
    
    // Perfume
    { id: 'r_perf_rose', machineId: 'perfume', name: 'Hương Hồng', input: [{id: 'rose', amount: 3}], outputId: 'rose_perfume', duration: 300, exp: 100 },
    { id: 'r_perf_tulip', machineId: 'perfume', name: 'Hương Tulip', input: [{id: 'tulip', amount: 3}], outputId: 'tulip_perfume', duration: 330, exp: 110 },
    { id: 'r_perf_lotus', machineId: 'perfume', name: 'Hương Sen', input: [{id: 'lotus', amount: 2}], outputId: 'lotus_perfume', duration: 360, exp: 130 },
    
    // Sushi
    { id: 'r_sushi_egg', machineId: 'sushi_bar', name: 'Sushi trứng', input: [{id: 'rice', amount: 2}, {id: 'egg', amount: 1}], outputId: 'egg_sushi', duration: 90, exp: 40 },
    { id: 'r_sushi_veg', machineId: 'sushi_bar', name: 'Cuộn rau', input: [{id: 'rice', amount: 2}, {id: 'carrot', amount: 1}], outputId: 'veggie_roll', duration: 80, exp: 35 },
    
    // Jewelry
    { id: 'r_hat', machineId: 'jewelry', name: 'Mũ lông vũ', input: [{id: 'peacock_feather', amount: 1}, {id: 'turkey_feather', amount: 2}], outputId: 'feather_hat', duration: 400, exp: 200 },
    { id: 'r_charm', machineId: 'jewelry', name: 'Bùa sư tử', input: [{id: 'golden_mane', amount: 1}, {id: 'silk', amount: 2}], outputId: 'lion_charm', duration: 600, exp: 500 },
];

export const DECORATIONS: Decor[] = [
    { id: 'scarecrow', name: 'Bù nhìn rơm', emoji: '🎃', type: 'DECOR', currency: 'COIN', cost: 1500, description: 'Đuổi 60% sâu bệnh' },
    { id: 'fence', name: 'Hàng rào trắng', emoji: '🪜', type: 'DECOR', currency: 'COIN', cost: 2000, description: 'Trang trí nông trại' },
    { id: 'path', name: 'Lối đi đá', emoji: '🪨', type: 'DECOR', currency: 'COIN', cost: 1000, description: 'Lát đường đi đẹp' }, 
    { id: 'fountain', name: 'Đài phun nước', emoji: '⛲', type: 'DECOR', currency: 'COIN', cost: 5000, description: 'Tạo không khí mát mẻ' },
    { id: 'bench', name: 'Ghế đá', emoji: '🪑', type: 'DECOR', currency: 'COIN', cost: 1200, description: 'Nơi nghỉ chân' },
    { id: 'lamp', name: 'Đèn đường', emoji: '💡', type: 'DECOR', currency: 'COIN', cost: 2500, description: 'Sáng lung linh' },
    { id: 'castle', name: 'Lâu đài cát', emoji: '🏰', type: 'DECOR', currency: 'STAR', cost: 10, description: 'Chứng nhận Học Bá (Cần 10 Sao)' },
    { id: 'dragon_statue', name: 'Tượng Rồng', emoji: '🐉', type: 'DECOR', currency: 'STAR', cost: 25, description: 'Sức mạnh tri thức (Cần 25 Sao)' },
    { id: 'ufo', name: 'Đĩa bay', emoji: '🛸', type: 'DECOR', currency: 'STAR', cost: 60, description: 'Công nghệ ngoài hành tinh (Cần 60 Sao)' },
];

export const MYSTERY_BOX_REWARDS = [
    { type: 'COIN', amount: 100, weight: 0.5 },
    { type: 'WATER', amount: 5, weight: 0.25 },
    { type: 'FERTILIZER', amount: 2, weight: 0.15 }, 
    { type: 'magic_bean', amount: 1, weight: 0.1 } 
];
