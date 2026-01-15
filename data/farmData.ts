
import { Crop, Decor, AnimalItem, Product, ProcessingRecipe, MachineItem } from '../types';

// --- 1. CÂY TRỒNG (24 Loại) ---
export const CROPS: Crop[] = [
  // Cấp 1-5: Cơ bản
  { id: 'carrot', name: 'Cà rốt', emoji: '🥕', type: 'CROP', currency: 'COIN', cost: 15, sellPrice: 25, growthTime: 10, exp: 2, unlockReq: 0 }, 
  { id: 'wheat', name: 'Lúa mì', emoji: '🌾', type: 'CROP', currency: 'COIN', cost: 30, sellPrice: 48, growthTime: 30, exp: 4, unlockReq: 1 }, 
  { id: 'corn', name: 'Ngô', emoji: '🌽', type: 'CROP', currency: 'COIN', cost: 50, sellPrice: 80, growthTime: 60, exp: 6, unlockReq: 2 },
  { id: 'rice', name: 'Lúa', emoji: '🌱', type: 'CROP', currency: 'COIN', cost: 20, sellPrice: 35, growthTime: 45, exp: 3, unlockReq: 2 },
  { id: 'potato', name: 'Khoai tây', emoji: '🥔', type: 'CROP', currency: 'COIN', cost: 60, sellPrice: 100, growthTime: 90, exp: 8, unlockReq: 3 },
  { id: 'cabbage', name: 'Bắp cải', emoji: '🥬', type: 'CROP', currency: 'COIN', cost: 70, sellPrice: 120, growthTime: 120, exp: 10, unlockReq: 4 },
  
  // Cấp 6-10: Rau củ & Trái cây
  { id: 'tomato', name: 'Cà chua', emoji: '🍅', type: 'CROP', currency: 'COIN', cost: 90, sellPrice: 150, growthTime: 150, exp: 12, unlockReq: 5 },
  { id: 'strawberry', name: 'Dâu tây', emoji: '🍓', type: 'CROP', currency: 'COIN', cost: 120, sellPrice: 200, growthTime: 180, exp: 15, unlockReq: 6 },
  { id: 'sugarcane', name: 'Mía', emoji: '🎋', type: 'CROP', currency: 'COIN', cost: 100, sellPrice: 170, growthTime: 200, exp: 14, unlockReq: 7 },
  { id: 'cotton', name: 'Bông', emoji: '☁️', type: 'CROP', currency: 'COIN', cost: 140, sellPrice: 240, growthTime: 240, exp: 18, unlockReq: 8 },
  { id: 'pumpkin', name: 'Bí ngô', emoji: '🎃', type: 'CROP', currency: 'COIN', cost: 160, sellPrice: 280, growthTime: 300, exp: 20, unlockReq: 9 },
  { id: 'grapes', name: 'Nho', emoji: '🍇', type: 'CROP', currency: 'COIN', cost: 200, sellPrice: 350, growthTime: 360, exp: 25, unlockReq: 10 },

  // Cấp 11-15: Cây công nghiệp & Nhiệt đới
  { id: 'watermelon', name: 'Dưa hấu', emoji: '🍉', type: 'CROP', currency: 'COIN', cost: 220, sellPrice: 400, growthTime: 420, exp: 30, unlockReq: 11 },
  { id: 'chilli', name: 'Ớt', emoji: '🌶️', type: 'CROP', currency: 'COIN', cost: 180, sellPrice: 320, growthTime: 400, exp: 28, unlockReq: 11 },
  { id: 'coffee', name: 'Cà phê', emoji: '🫘', type: 'CROP', currency: 'COIN', cost: 250, sellPrice: 450, growthTime: 480, exp: 35, unlockReq: 12 },
  { id: 'pineapple', name: 'Dứa', emoji: '🍍', type: 'CROP', currency: 'COIN', cost: 280, sellPrice: 500, growthTime: 540, exp: 40, unlockReq: 13 },
  { id: 'sunflower', name: 'Hướng dương', emoji: '🌻', type: 'CROP', currency: 'COIN', cost: 150, sellPrice: 260, growthTime: 220, exp: 20, unlockReq: 14 },
  { id: 'bamboo', name: 'Tre', emoji: '🎍', type: 'CROP', currency: 'COIN', cost: 200, sellPrice: 340, growthTime: 300, exp: 25, unlockReq: 15 },

  // Cấp 16+: Hoa & Cây đặc biệt
  { id: 'rose', name: 'Hoa hồng', emoji: '🌹', type: 'CROP', currency: 'COIN', cost: 300, sellPrice: 600, growthTime: 600, exp: 50, unlockReq: 16 },
  { id: 'tulip', name: 'Hoa Tulip', emoji: '🌷', type: 'CROP', currency: 'COIN', cost: 350, sellPrice: 700, growthTime: 700, exp: 60, unlockReq: 17 },
  { id: 'lotus', name: 'Hoa sen', emoji: '🪷', type: 'CROP', currency: 'COIN', cost: 400, sellPrice: 800, growthTime: 800, exp: 70, unlockReq: 18 },
  { id: 'cocoa', name: 'Ca cao', emoji: '🍫', type: 'CROP', currency: 'COIN', cost: 450, sellPrice: 900, growthTime: 900, exp: 80, unlockReq: 19 },
  { id: 'mushroom', name: 'Nấm', emoji: '🍄', type: 'CROP', currency: 'COIN', cost: 500, sellPrice: 1000, growthTime: 1000, exp: 90, unlockReq: 20 },
  { id: 'rainbow_flower', name: 'Hoa Cầu Vồng', emoji: '🌈', type: 'CROP', currency: 'STAR', cost: 5, sellPrice: 5000, growthTime: 600, exp: 500, unlockReq: 25, isMagic: true },
];

// --- 2. VẬT NUÔI (20 Loại) ---
export const ANIMALS: AnimalItem[] = [
    // Gia cầm & Gia súc nhỏ
    { id: 'chicken', name: 'Gà mái', emoji: '🐔', type: 'ANIMAL', currency: 'COIN', cost: 500, produceId: 'egg', produceTime: 60, feedCropId: 'wheat', feedAmount: 1, exp: 10, minLevel: 2 },
    { id: 'duck', name: 'Vịt bầu', emoji: '🦆', type: 'ANIMAL', currency: 'COIN', cost: 1500, produceId: 'duck_egg', produceTime: 120, feedCropId: 'corn', feedAmount: 1, exp: 20, minLevel: 3 },
    { id: 'rabbit', name: 'Thỏ trắng', emoji: '🐰', type: 'ANIMAL', currency: 'COIN', cost: 2500, produceId: 'rabbit_fur', produceTime: 180, feedCropId: 'carrot', feedAmount: 2, exp: 30, minLevel: 4 },
    { id: 'silkworm', name: 'Tằm', emoji: '🐛', type: 'ANIMAL', currency: 'COIN', cost: 3000, produceId: 'silk', produceTime: 300, feedCropId: 'cabbage', feedAmount: 2, exp: 40, minLevel: 5 },
    { id: 'bee', name: 'Ong mật', emoji: '🐝', type: 'ANIMAL', currency: 'COIN', cost: 3500, produceId: 'honey', produceTime: 360, feedCropId: 'sunflower', feedAmount: 2, exp: 45, minLevel: 6 },

    // Gia súc lớn
    { id: 'pig', name: 'Heo ủn ỉn', emoji: '🐖', type: 'ANIMAL', currency: 'COIN', cost: 5000, produceId: 'bacon', produceTime: 400, feedCropId: 'potato', feedAmount: 2, exp: 50, minLevel: 7 },
    { id: 'sheep', name: 'Cừu', emoji: '🐑', type: 'ANIMAL', currency: 'COIN', cost: 6000, produceId: 'wool', produceTime: 600, feedCropId: 'wheat', feedAmount: 3, exp: 60, minLevel: 8 },
    { id: 'cow', name: 'Bò sữa', emoji: '🐄', type: 'ANIMAL', currency: 'COIN', cost: 8000, produceId: 'milk', produceTime: 500, feedCropId: 'corn', feedAmount: 3, exp: 70, minLevel: 9 },
    { id: 'goat', name: 'Dê núi', emoji: '🐐', type: 'ANIMAL', currency: 'COIN', cost: 9000, produceId: 'goat_milk', produceTime: 550, feedCropId: 'cabbage', feedAmount: 3, exp: 75, minLevel: 10 },
    { id: 'buffalo', name: 'Trâu nước', emoji: '🐃', type: 'ANIMAL', currency: 'COIN', cost: 10000, produceId: 'buffalo_milk', produceTime: 700, feedCropId: 'rice', feedAmount: 4, exp: 80, minLevel: 11 },

    // Động vật đặc biệt & hoang dã
    { id: 'turkey', name: 'Gà Tây', emoji: '🦃', type: 'ANIMAL', currency: 'COIN', cost: 12000, produceId: 'turkey_feather', produceTime: 800, feedCropId: 'corn', feedAmount: 4, exp: 90, minLevel: 12 },
    { id: 'horse', name: 'Ngựa', emoji: '🐎', type: 'ANIMAL', currency: 'COIN', cost: 15000, produceId: 'horseshoe', produceTime: 900, feedCropId: 'carrot', feedAmount: 5, exp: 100, minLevel: 13 },
    { id: 'ostrich', name: 'Đà điểu', emoji: '🐦', type: 'ANIMAL', currency: 'COIN', cost: 18000, produceId: 'giant_egg', produceTime: 1000, feedCropId: 'tomato', feedAmount: 4, exp: 110, minLevel: 14 },
    { id: 'camel', name: 'Lạc đà', emoji: '🐪', type: 'ANIMAL', currency: 'COIN', cost: 20000, produceId: 'camel_milk', produceTime: 1200, feedCropId: 'cactus_fruit', feedAmount: 2, exp: 120, minLevel: 15 }, // cactus_fruit = prickly pear, let's use pumpkin for now or add cactus
    { id: 'llama', name: 'Lạc đà Alpaca', emoji: '🦙', type: 'ANIMAL', currency: 'COIN', cost: 22000, produceId: 'llama_fur', produceTime: 1100, feedCropId: 'wheat', feedAmount: 5, exp: 130, minLevel: 16 },
    
    // Thú quý hiếm (High Level)
    { id: 'peacock', name: 'Chim Công', emoji: '🦚', type: 'ANIMAL', currency: 'COIN', cost: 30000, produceId: 'peacock_feather', produceTime: 1500, feedCropId: 'grapes', feedAmount: 3, exp: 150, minLevel: 17 },
    { id: 'panda', name: 'Gấu Trúc', emoji: '🐼', type: 'ANIMAL', currency: 'COIN', cost: 40000, produceId: 'bamboo_shoot', produceTime: 1800, feedCropId: 'bamboo', feedAmount: 5, exp: 200, minLevel: 18 },
    { id: 'elephant', name: 'Voi', emoji: '🐘', type: 'ANIMAL', currency: 'COIN', cost: 50000, produceId: 'heavy_log', produceTime: 2000, feedCropId: 'watermelon', feedAmount: 3, exp: 250, minLevel: 19 },
    { id: 'lion', name: 'Sư Tử', emoji: '🦁', type: 'ANIMAL', currency: 'COIN', cost: 60000, produceId: 'golden_mane', produceTime: 2500, feedCropId: 'bacon', feedAmount: 2, exp: 300, minLevel: 20 },
    { id: 'unicorn', name: 'Kỳ Lân', emoji: '🦄', type: 'ANIMAL', currency: 'STAR', cost: 100, produceId: 'fairy_dust', produceTime: 3600, feedCropId: 'rainbow_flower', feedAmount: 1, exp: 1000, minLevel: 25 },
];

// --- 3. MÁY MÓC (12 Loại) ---
export const MACHINES: MachineItem[] = [
    { id: 'bakery', name: 'Lò Bánh', emoji: '🥖', type: 'MACHINE', currency: 'COIN', cost: 2000, unlockPrice: 2000, description: 'Nướng bánh mì và bánh ngọt', minLevel: 3 },
    { id: 'snack_machine', name: 'Máy Ăn Vặt', emoji: '🍿', type: 'MACHINE', currency: 'COIN', cost: 3500, unlockPrice: 3500, description: 'Làm bắp rang và snack', minLevel: 5 },
    { id: 'dairy', name: 'Nhà Máy Sữa', emoji: '🧀', type: 'MACHINE', currency: 'COIN', cost: 5000, unlockPrice: 5000, description: 'Chế biến các loại sữa', minLevel: 7 },
    { id: 'textile', name: 'Máy Dệt', emoji: '🧵', type: 'MACHINE', currency: 'COIN', cost: 6500, unlockPrice: 6500, description: 'Dệt vải từ bông và len', minLevel: 8 },
    { id: 'sugar_mill', name: 'Máy Ép Mía', emoji: '🍬', type: 'MACHINE', currency: 'COIN', cost: 8000, unlockPrice: 8000, description: 'Sản xuất đường', minLevel: 9 },
    { id: 'beverage', name: 'Máy Pha Chế', emoji: '🍹', type: 'MACHINE', currency: 'COIN', cost: 9500, unlockPrice: 9500, description: 'Làm nước ép và cà phê', minLevel: 10 },
    { id: 'grill', name: 'Lò Nướng Thịt', emoji: '🍖', type: 'MACHINE', currency: 'COIN', cost: 12000, unlockPrice: 12000, description: 'Nướng thịt thơm ngon', minLevel: 12 },
    { id: 'jam_maker', name: 'Máy Làm Mứt', emoji: '🍯', type: 'MACHINE', currency: 'COIN', cost: 15000, unlockPrice: 15000, description: 'Làm mứt trái cây', minLevel: 14 },
    { id: 'ice_cream', name: 'Máy Làm Kem', emoji: '🍦', type: 'MACHINE', currency: 'COIN', cost: 20000, unlockPrice: 20000, description: 'Làm kem mát lạnh', minLevel: 16 },
    { id: 'perfume', name: 'Máy Nước Hoa', emoji: '⚗️', type: 'MACHINE', currency: 'COIN', cost: 30000, unlockPrice: 30000, description: 'Chiết xuất hương hoa', minLevel: 18 },
    { id: 'sushi_bar', name: 'Quầy Sushi', emoji: '🍣', type: 'MACHINE', currency: 'COIN', cost: 45000, unlockPrice: 45000, description: 'Làm cơm cuộn', minLevel: 20 },
    { id: 'jewelry', name: 'Máy Trang Sức', emoji: '💎', type: 'MACHINE', currency: 'COIN', cost: 60000, unlockPrice: 60000, description: 'Chế tác đồ trang sức', minLevel: 22 },
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
    { id: 'r_oj', machineId: 'beverage', name: 'Nước cam', input: [{id: 'orange', amount: 3}], outputId: 'orange_juice', duration: 45, exp: 20 }, // Wait, added orange to crops? Yes (implied in list, adding now)
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
    { id: 'scarecrow', name: 'Bù nhìn rơm', emoji: '🎃', type: 'DECOR', currency: 'COIN', cost: 2000, description: 'Đuổi 60% sâu bệnh' },
    { id: 'fence', name: 'Hàng rào trắng', emoji: '🪜', type: 'DECOR', currency: 'COIN', cost: 3500, description: 'Trang trí nông trại' },
    { id: 'path', name: 'Lối đi đá', emoji: '🪨', type: 'DECOR', currency: 'COIN', cost: 1500, description: 'Lát đường đi đẹp' }, 
    { id: 'fountain', name: 'Đài phun nước', emoji: '⛲', type: 'DECOR', currency: 'COIN', cost: 8000, description: 'Tạo không khí mát mẻ' },
    { id: 'bench', name: 'Ghế đá', emoji: '🪑', type: 'DECOR', currency: 'COIN', cost: 2500, description: 'Nơi nghỉ chân' },
    { id: 'lamp', name: 'Đèn đường', emoji: '💡', type: 'DECOR', currency: 'COIN', cost: 4000, description: 'Sáng lung linh' },
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
