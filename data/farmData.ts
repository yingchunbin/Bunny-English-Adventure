
import { Crop, Decor, AnimalItem, Product, ProcessingRecipe, MachineItem, Mission } from '../types';

// ... (Keep existing CROPS, ANIMALS, PRODUCTS, MACHINES, RECIPES, DECORATIONS arrays as they are) ...
// Since I need to output full content, I will include the existing data and append the new Missions.

// --- CROPS ---
export const CROPS: Crop[] = [
  // Basics
  { id: 'carrot', name: 'Cà rốt', emoji: '🥕', type: 'CROP', currency: 'COIN', cost: 10, sellPrice: 20, growthTime: 10, exp: 5, unlockReq: 0 }, 
  { id: 'wheat', name: 'Lúa mì', emoji: '🌾', type: 'CROP', currency: 'COIN', cost: 15, sellPrice: 35, growthTime: 30, exp: 10, unlockReq: 1 }, 
  { id: 'corn', name: 'Bắp ngô', emoji: '🌽', type: 'CROP', currency: 'COIN', cost: 25, sellPrice: 55, growthTime: 60, exp: 15, unlockReq: 2 },
  { id: 'tomato', name: 'Cà chua', emoji: '🍅', type: 'CROP', currency: 'COIN', cost: 40, sellPrice: 90, growthTime: 120, exp: 25, unlockReq: 3 },
  { id: 'potato', name: 'Khoai tây', emoji: '🥔', type: 'CROP', currency: 'COIN', cost: 30, sellPrice: 70, growthTime: 90, exp: 20, unlockReq: 2 },
  { id: 'cabbage', name: 'Bắp cải', emoji: '🥬', type: 'CROP', currency: 'COIN', cost: 35, sellPrice: 80, growthTime: 100, exp: 22, unlockReq: 3 },
  // Fruits & Veg
  { id: 'strawberry', name: 'Dâu tây', emoji: '🍓', type: 'CROP', currency: 'STAR', cost: 1, sellPrice: 150, growthTime: 180, exp: 50, unlockReq: 5, isMagic: true },
  { id: 'pumpkin', name: 'Bí ngô', emoji: '🎃', type: 'CROP', currency: 'COIN', cost: 60, sellPrice: 140, growthTime: 240, exp: 40, unlockReq: 6 },
  { id: 'eggplant', name: 'Cà tím', emoji: '🍆', type: 'CROP', currency: 'COIN', cost: 50, sellPrice: 110, growthTime: 200, exp: 35, unlockReq: 5 },
  { id: 'chili', name: 'Ớt đỏ', emoji: '🌶️', type: 'CROP', currency: 'COIN', cost: 45, sellPrice: 100, growthTime: 180, exp: 30, unlockReq: 4 },
  { id: 'cucumber', name: 'Dưa chuột', emoji: '🥒', type: 'CROP', currency: 'COIN', cost: 30, sellPrice: 75, growthTime: 90, exp: 20, unlockReq: 3 },
  { id: 'garlic', name: 'Tỏi', emoji: '🧄', type: 'CROP', currency: 'COIN', cost: 25, sellPrice: 60, growthTime: 80, exp: 18, unlockReq: 2 },
  { id: 'onion', name: 'Hành tây', emoji: '🧅', type: 'CROP', currency: 'COIN', cost: 25, sellPrice: 60, growthTime: 80, exp: 18, unlockReq: 2 },
  { id: 'broccoli', name: 'Súp lơ', emoji: '🥦', type: 'CROP', currency: 'COIN', cost: 55, sellPrice: 120, growthTime: 210, exp: 38, unlockReq: 6 },
  { id: 'mushroom', name: 'Nấm', emoji: '🍄', type: 'CROP', currency: 'COIN', cost: 20, sellPrice: 50, growthTime: 60, exp: 15, unlockReq: 2 },
  { id: 'pea', name: 'Đậu Hà Lan', emoji: '🫛', type: 'CROP', currency: 'COIN', cost: 30, sellPrice: 70, growthTime: 100, exp: 20, unlockReq: 3 },
  { id: 'sweet_potato', name: 'Khoai lang', emoji: '🍠', type: 'CROP', currency: 'COIN', cost: 35, sellPrice: 80, growthTime: 110, exp: 22, unlockReq: 4 },
  { id: 'ginger', name: 'Củ gừng', emoji: '🫚', type: 'CROP', currency: 'COIN', cost: 20, sellPrice: 45, growthTime: 50, exp: 12, unlockReq: 1 },
  { id: 'leafy_green', name: 'Rau xanh', emoji: '🥗', type: 'CROP', currency: 'COIN', cost: 15, sellPrice: 35, growthTime: 40, exp: 10, unlockReq: 1 },
  { id: 'bell_pepper', name: 'Ớt chuông', emoji: '🫑', type: 'CROP', currency: 'COIN', cost: 50, sellPrice: 115, growthTime: 200, exp: 35, unlockReq: 5 },
  // Industrial & Trees
  { id: 'cotton', name: 'Bông', emoji: '☁️', type: 'CROP', currency: 'COIN', cost: 70, sellPrice: 160, growthTime: 300, exp: 45, unlockReq: 7 },
  { id: 'sugarcane', name: 'Mía', emoji: '🎋', type: 'CROP', currency: 'COIN', cost: 40, sellPrice: 90, growthTime: 150, exp: 25, unlockReq: 4 },
  { id: 'coffee_bean', name: 'Hạt cà phê', emoji: '🫘', type: 'CROP', currency: 'COIN', cost: 80, sellPrice: 190, growthTime: 360, exp: 55, unlockReq: 8 },
  { id: 'tea_leaf', name: 'Lá trà', emoji: '🌿', type: 'CROP', currency: 'COIN', cost: 60, sellPrice: 140, growthTime: 240, exp: 40, unlockReq: 6 },
  { id: 'cocoa', name: 'Cacao', emoji: '🍫', type: 'CROP', currency: 'COIN', cost: 90, sellPrice: 210, growthTime: 400, exp: 60, unlockReq: 9 },
  { id: 'sunflower', name: 'Hướng dương', emoji: '🌻', type: 'CROP', currency: 'COIN', cost: 45, sellPrice: 105, growthTime: 180, exp: 30, unlockReq: 5 },
  { id: 'rose', name: 'Hoa hồng', emoji: '🌹', type: 'CROP', currency: 'STAR', cost: 2, sellPrice: 300, growthTime: 600, exp: 100, unlockReq: 10, isMagic: true },
  { id: 'tulip', name: 'Tulip', emoji: '🌷', type: 'CROP', currency: 'COIN', cost: 50, sellPrice: 120, growthTime: 200, exp: 35, unlockReq: 6 },
  { id: 'rice', name: 'Lúa gạo', emoji: '🍚', type: 'CROP', currency: 'COIN', cost: 20, sellPrice: 45, growthTime: 60, exp: 12, unlockReq: 1 },
  { id: 'soybean', name: 'Đậu nành', emoji: '🥜', type: 'CROP', currency: 'COIN', cost: 30, sellPrice: 70, growthTime: 90, exp: 20, unlockReq: 3 },
  // Fruits
  { id: 'apple_fruit', name: 'Táo', emoji: '🍎', type: 'CROP', currency: 'COIN', cost: 100, sellPrice: 250, growthTime: 500, exp: 70, unlockReq: 8 },
  { id: 'orange_fruit', name: 'Cam', emoji: '🍊', type: 'CROP', currency: 'COIN', cost: 90, sellPrice: 220, growthTime: 450, exp: 65, unlockReq: 7 },
  { id: 'grape', name: 'Nho', emoji: '🍇', type: 'CROP', currency: 'COIN', cost: 120, sellPrice: 300, growthTime: 600, exp: 80, unlockReq: 9 },
  { id: 'banana_fruit', name: 'Chuối', emoji: '🍌', type: 'CROP', currency: 'COIN', cost: 85, sellPrice: 200, growthTime: 400, exp: 60, unlockReq: 7 },
  { id: 'watermelon', name: 'Dưa hấu', emoji: '🍉', type: 'CROP', currency: 'COIN', cost: 70, sellPrice: 170, growthTime: 320, exp: 50, unlockReq: 6 },
  { id: 'lemon', name: 'Chanh', emoji: '🍋', type: 'CROP', currency: 'COIN', cost: 60, sellPrice: 140, growthTime: 280, exp: 40, unlockReq: 5 },
  { id: 'peach', name: 'Đào', emoji: '🍑', type: 'CROP', currency: 'COIN', cost: 110, sellPrice: 270, growthTime: 550, exp: 75, unlockReq: 8 },
  { id: 'cherry', name: 'Cherry', emoji: '🍒', type: 'CROP', currency: 'STAR', cost: 3, sellPrice: 400, growthTime: 700, exp: 120, unlockReq: 10, isMagic: true },
  { id: 'pineapple', name: 'Dứa', emoji: '🍍', type: 'CROP', currency: 'COIN', cost: 75, sellPrice: 180, growthTime: 350, exp: 55, unlockReq: 6 },
  { id: 'coconut_fruit', name: 'Dừa', emoji: '🥥', type: 'CROP', currency: 'COIN', cost: 95, sellPrice: 230, growthTime: 480, exp: 68, unlockReq: 8 },
  { id: 'mango', name: 'Xoài', emoji: '🥭', type: 'CROP', currency: 'COIN', cost: 105, sellPrice: 260, growthTime: 520, exp: 72, unlockReq: 9 },
  { id: 'kiwi', name: 'Kiwi', emoji: '🥝', type: 'CROP', currency: 'COIN', cost: 80, sellPrice: 195, growthTime: 380, exp: 58, unlockReq: 7 },
  { id: 'blueberry', name: 'Việt quất', emoji: '🫐', type: 'CROP', currency: 'COIN', cost: 130, sellPrice: 320, growthTime: 650, exp: 85, unlockReq: 10 },
  { id: 'olive', name: 'Ô liu', emoji: '🫒', type: 'CROP', currency: 'COIN', cost: 90, sellPrice: 220, growthTime: 450, exp: 65, unlockReq: 8 },
  { id: 'melon', name: 'Dưa lưới', emoji: '🍈', type: 'CROP', currency: 'COIN', cost: 70, sellPrice: 175, growthTime: 330, exp: 52, unlockReq: 6 },
  { id: 'pear', name: 'Lê', emoji: '🍐', type: 'CROP', currency: 'COIN', cost: 85, sellPrice: 210, growthTime: 420, exp: 62, unlockReq: 7 },
  { id: 'avocado', name: 'Bơ', emoji: '🥑', type: 'CROP', currency: 'COIN', cost: 115, sellPrice: 290, growthTime: 580, exp: 78, unlockReq: 9 },
  { id: 'dragonfruit', name: 'Thanh long', emoji: '🐲', type: 'CROP', currency: 'COIN', cost: 100, sellPrice: 250, growthTime: 500, exp: 70, unlockReq: 8 },
  { id: 'durian', name: 'Sầu riêng', emoji: '🤢', type: 'CROP', currency: 'STAR', cost: 5, sellPrice: 600, growthTime: 1000, exp: 200, unlockReq: 12, isMagic: true },
  { id: 'bamboo', name: 'Tre', emoji: '🎍', type: 'CROP', currency: 'COIN', cost: 40, sellPrice: 95, growthTime: 160, exp: 28, unlockReq: 4 },
];

export const ANIMALS: AnimalItem[] = [
    // Coop
    { id: 'chicken', name: 'Gà mái', emoji: '🐔', type: 'ANIMAL', currency: 'COIN', cost: 200, produceId: 'egg', produceTime: 60, feedCropId: 'wheat', feedAmount: 1, exp: 30, minLevel: 1 },
    { id: 'duck', name: 'Vịt', emoji: '🦆', type: 'ANIMAL', currency: 'COIN', cost: 300, produceId: 'duck_feather', produceTime: 90, feedCropId: 'corn', feedAmount: 1, exp: 40, minLevel: 2 },
    { id: 'goose', name: 'Ngỗng', emoji: '🪿', type: 'ANIMAL', currency: 'COIN', cost: 400, produceId: 'goose_egg', produceTime: 120, feedCropId: 'wheat', feedAmount: 2, exp: 50, minLevel: 3 },
    { id: 'turkey', name: 'Gà tây', emoji: '🦃', type: 'ANIMAL', currency: 'COIN', cost: 600, produceId: 'turkey_meat', produceTime: 180, feedCropId: 'corn', feedAmount: 3, exp: 70, minLevel: 5 },
    { id: 'quail', name: 'Chim cút', emoji: '🐦', type: 'ANIMAL', currency: 'COIN', cost: 250, produceId: 'quail_egg', produceTime: 50, feedCropId: 'rice', feedAmount: 1, exp: 25, minLevel: 2 },
    // Barn
    { id: 'cow', name: 'Bò sữa', emoji: '🐄', type: 'ANIMAL', currency: 'COIN', cost: 500, produceId: 'milk', produceTime: 120, feedCropId: 'corn', feedAmount: 2, exp: 60, minLevel: 3 },
    { id: 'pig', name: 'Heo', emoji: '🐷', type: 'ANIMAL', currency: 'COIN', cost: 450, produceId: 'bacon', produceTime: 150, feedCropId: 'carrot', feedAmount: 2, exp: 55, minLevel: 3 },
    { id: 'sheep', name: 'Cừu', emoji: '🐑', type: 'ANIMAL', currency: 'COIN', cost: 550, produceId: 'wool', produceTime: 200, feedCropId: 'wheat', feedAmount: 3, exp: 65, minLevel: 4 },
    { id: 'goat', name: 'Dê', emoji: '🐐', type: 'ANIMAL', currency: 'COIN', cost: 500, produceId: 'goat_milk', produceTime: 140, feedCropId: 'cabbage', feedAmount: 2, exp: 58, minLevel: 4 },
    { id: 'buffalo', name: 'Trâu', emoji: '🐃', type: 'ANIMAL', currency: 'COIN', cost: 800, produceId: 'buffalo_milk', produceTime: 240, feedCropId: 'rice', feedAmount: 4, exp: 90, minLevel: 6 },
    { id: 'horse', name: 'Ngựa', emoji: '🐎', type: 'ANIMAL', currency: 'STAR', cost: 10, produceId: 'horse_hair', produceTime: 300, feedCropId: 'apple_fruit', feedAmount: 3, exp: 120, minLevel: 8 },
    { id: 'donkey', name: 'Lừa', emoji: '🫏', type: 'ANIMAL', currency: 'COIN', cost: 400, produceId: 'leather', produceTime: 180, feedCropId: 'carrot', feedAmount: 3, exp: 60, minLevel: 5 },
    { id: 'llama', name: 'Lạc đà', emoji: '🦙', type: 'ANIMAL', currency: 'COIN', cost: 700, produceId: 'llama_wool', produceTime: 220, feedCropId: 'wheat', feedAmount: 4, exp: 80, minLevel: 7 },
    { id: 'ostrich', name: 'Đà điểu', emoji: '🐦‍⬛', type: 'ANIMAL', currency: 'COIN', cost: 900, produceId: 'ostrich_egg', produceTime: 300, feedCropId: 'corn', feedAmount: 5, exp: 100, minLevel: 8 },
    // Exotic
    { id: 'bee', name: 'Ong', emoji: '🐝', type: 'ANIMAL', currency: 'COIN', cost: 150, produceId: 'honey_comb', produceTime: 60, feedCropId: 'sunflower', feedAmount: 1, exp: 20, minLevel: 5 },
    { id: 'silkworm', name: 'Tằm', emoji: '🐛', type: 'ANIMAL', currency: 'COIN', cost: 100, produceId: 'silk_cocoon', produceTime: 40, feedCropId: 'leafy_green', feedAmount: 1, exp: 15, minLevel: 4 },
    { id: 'peacock', name: 'Công', emoji: '🦚', type: 'ANIMAL', currency: 'STAR', cost: 15, produceId: 'peacock_feather', produceTime: 400, feedCropId: 'grape', feedAmount: 2, exp: 150, minLevel: 10 },
    { id: 'rabbit_pet', name: 'Thỏ trắng', emoji: '🐇', type: 'ANIMAL', currency: 'COIN', cost: 200, produceId: 'rabbit_fur', produceTime: 80, feedCropId: 'carrot', feedAmount: 2, exp: 25, minLevel: 2 },
    { id: 'fish_koi', name: 'Cá Koi', emoji: '🎏', type: 'ANIMAL', currency: 'STAR', cost: 5, produceId: 'fish_roe', produceTime: 120, feedCropId: 'rice', feedAmount: 1, exp: 50, minLevel: 6 },
    { id: 'snail', name: 'Ốc sên', emoji: '🐌', type: 'ANIMAL', currency: 'COIN', cost: 50, produceId: 'snail_shell', produceTime: 300, feedCropId: 'leafy_green', feedAmount: 1, exp: 10, minLevel: 1 },
    // More basic farm animals
    { id: 'dog_guard', name: 'Chó giữ nhà', emoji: '🐕', type: 'ANIMAL', currency: 'COIN', cost: 1000, produceId: 'bone', produceTime: 360, feedCropId: 'bacon', feedAmount: 1, exp: 110, minLevel: 5 }, 
    { id: 'cat_pet', name: 'Mèo mướp', emoji: '🐈', type: 'ANIMAL', currency: 'COIN', cost: 800, produceId: 'yarn_ball', produceTime: 300, feedCropId: 'milk', feedAmount: 1, exp: 90, minLevel: 5 },
    { id: 'yak', name: 'Bò Tây Tạng', emoji: '🐂', type: 'ANIMAL', currency: 'STAR', cost: 20, produceId: 'yak_milk', produceTime: 400, feedCropId: 'wheat', feedAmount: 5, exp: 200, minLevel: 12 },
    { id: 'deer', name: 'Hươu', emoji: '🦌', type: 'ANIMAL', currency: 'STAR', cost: 12, produceId: 'antler', produceTime: 500, feedCropId: 'leafy_green', feedAmount: 4, exp: 140, minLevel: 10 },
    { id: 'bat', name: 'Dơi', emoji: '🦇', type: 'ANIMAL', currency: 'COIN', cost: 300, produceId: 'guano', produceTime: 150, feedCropId: 'tomato', feedAmount: 2, exp: 40, minLevel: 6 }, // Fixed feed to Tomato
    { id: 'frog', name: 'Ếch', emoji: '🐸', type: 'ANIMAL', currency: 'COIN', cost: 100, produceId: 'frog_leg', produceTime: 100, feedCropId: 'rice', feedAmount: 1, exp: 20, minLevel: 2 },
    { id: 'crab', name: 'Cua', emoji: '🦀', type: 'ANIMAL', currency: 'COIN', cost: 200, produceId: 'crab_meat', produceTime: 200, feedCropId: 'fish_roe', feedAmount: 1, exp: 35, minLevel: 7 },
    { id: 'lobster', name: 'Tôm hùm', emoji: '🦞', type: 'ANIMAL', currency: 'STAR', cost: 8, produceId: 'lobster_tail', produceTime: 300, feedCropId: 'fish_roe', feedAmount: 2, exp: 80, minLevel: 9 },
    { id: 'shrimp', name: 'Tôm', emoji: '🦐', type: 'ANIMAL', currency: 'COIN', cost: 150, produceId: 'shrimp_meat', produceTime: 120, feedCropId: 'rice', feedAmount: 1, exp: 25, minLevel: 4 },
    { id: 'squid', name: 'Mực', emoji: '🦑', type: 'ANIMAL', currency: 'COIN', cost: 300, produceId: 'ink_sac', produceTime: 180, feedCropId: 'fish_roe', feedAmount: 1, exp: 45, minLevel: 6 },
];

export const PRODUCTS: Product[] = [
    // Animal Raw
    { id: 'egg', name: 'Trứng gà', emoji: '🥚', type: 'PRODUCT', currency: 'COIN', cost: 0, sellPrice: 40 },
    { id: 'milk', name: 'Sữa tươi', emoji: '🥛', type: 'PRODUCT', currency: 'COIN', cost: 0, sellPrice: 80 },
    { id: 'bacon', name: 'Thịt heo', emoji: '🥓', type: 'PRODUCT', currency: 'COIN', cost: 0, sellPrice: 200 },
    { id: 'wool', name: 'Len', emoji: '🧶', type: 'PRODUCT', currency: 'COIN', cost: 0, sellPrice: 250 },
    { id: 'goat_milk', name: 'Sữa dê', emoji: '🥛', type: 'PRODUCT', currency: 'COIN', cost: 0, sellPrice: 120 },
    { id: 'duck_feather', name: 'Lông vịt', emoji: '🪶', type: 'PRODUCT', currency: 'COIN', cost: 0, sellPrice: 100 },
    { id: 'goose_egg', name: 'Trứng ngỗng', emoji: '🥚', type: 'PRODUCT', currency: 'COIN', cost: 0, sellPrice: 150 },
    { id: 'honey_comb', name: 'Sáp ong', emoji: '🍯', type: 'PRODUCT', currency: 'COIN', cost: 0, sellPrice: 180 },
    { id: 'silk_cocoon', name: 'Kén tằm', emoji: '🐛', type: 'PRODUCT', currency: 'COIN', cost: 0, sellPrice: 200 },
    { id: 'buffalo_milk', name: 'Sữa trâu', emoji: '🥛', type: 'PRODUCT', currency: 'COIN', cost: 0, sellPrice: 140 },
    { id: 'leather', name: 'Da thuộc', emoji: '👜', type: 'PRODUCT', currency: 'COIN', cost: 0, sellPrice: 300 },
    { id: 'rabbit_fur', name: 'Lông thỏ', emoji: '🐇', type: 'PRODUCT', currency: 'COIN', cost: 0, sellPrice: 110 },
    { id: 'quail_egg', name: 'Trứng cút', emoji: '🥚', type: 'PRODUCT', currency: 'COIN', cost: 0, sellPrice: 30 },
    { id: 'turkey_meat', name: 'Thịt gà tây', emoji: '🍖', type: 'PRODUCT', currency: 'COIN', cost: 0, sellPrice: 250 },
    { id: 'horse_hair', name: 'Lông ngựa', emoji: '🐎', type: 'PRODUCT', currency: 'COIN', cost: 0, sellPrice: 300 },
    { id: 'llama_wool', name: 'Len lạc đà', emoji: '🦙', type: 'PRODUCT', currency: 'COIN', cost: 0, sellPrice: 320 },
    { id: 'ostrich_egg', name: 'Trứng đà điểu', emoji: '🥚', type: 'PRODUCT', currency: 'COIN', cost: 0, sellPrice: 400 },
    { id: 'peacock_feather', name: 'Lông công', emoji: '🪶', type: 'PRODUCT', currency: 'COIN', cost: 0, sellPrice: 500 },
    { id: 'fish_roe', name: 'Trứng cá', emoji: '🟠', type: 'PRODUCT', currency: 'COIN', cost: 0, sellPrice: 100 },
    { id: 'snail_shell', name: 'Vỏ ốc', emoji: '🐚', type: 'PRODUCT', currency: 'COIN', cost: 0, sellPrice: 60 },
    { id: 'bone', name: 'Xương', emoji: '🦴', type: 'PRODUCT', currency: 'COIN', cost: 0, sellPrice: 50 },
    { id: 'yarn_ball', name: 'Cuộn len mèo', emoji: '🧶', type: 'PRODUCT', currency: 'COIN', cost: 0, sellPrice: 150 },
    { id: 'yak_milk', name: 'Sữa bò Yak', emoji: '🥛', type: 'PRODUCT', currency: 'COIN', cost: 0, sellPrice: 250 },
    { id: 'antler', name: 'Gạc hươu', emoji: '🦌', type: 'PRODUCT', currency: 'COIN', cost: 0, sellPrice: 600 },
    { id: 'guano', name: 'Phân dơi', emoji: '💩', type: 'PRODUCT', currency: 'COIN', cost: 0, sellPrice: 200 },
    { id: 'frog_leg', name: 'Đùi ếch', emoji: '🍗', type: 'PRODUCT', currency: 'COIN', cost: 0, sellPrice: 80 },
    { id: 'crab_meat', name: 'Thịt cua', emoji: '🦀', type: 'PRODUCT', currency: 'COIN', cost: 0, sellPrice: 180 },
    { id: 'lobster_tail', name: 'Đuôi tôm hùm', emoji: '🦞', type: 'PRODUCT', currency: 'COIN', cost: 0, sellPrice: 450 },
    { id: 'shrimp_meat', name: 'Tôm tươi', emoji: '🦐', type: 'PRODUCT', currency: 'COIN', cost: 0, sellPrice: 120 },
    { id: 'ink_sac', name: 'Túi mực', emoji: '⚫', type: 'PRODUCT', currency: 'COIN', cost: 0, sellPrice: 150 },

    // Processed Food - Bakery
    { id: 'bread', name: 'Bánh mì', emoji: '🍞', type: 'PROCESSED', currency: 'COIN', cost: 0, sellPrice: 100 },
    { id: 'cookie', name: 'Bánh quy', emoji: '🍪', type: 'PROCESSED', currency: 'COIN', cost: 0, sellPrice: 120 },
    { id: 'cake', name: 'Bánh kem', emoji: '🎂', type: 'PROCESSED', currency: 'COIN', cost: 0, sellPrice: 350 },
    { id: 'pie', name: 'Bánh bí ngô', emoji: '🥧', type: 'PROCESSED', currency: 'COIN', cost: 0, sellPrice: 280 },
    { id: 'croissant', name: 'Bánh sừng bò', emoji: '🥐', type: 'PROCESSED', currency: 'COIN', cost: 0, sellPrice: 150 },
    { id: 'pancake', name: 'Bánh kếp', emoji: '🥞', type: 'PROCESSED', currency: 'COIN', cost: 0, sellPrice: 130 },
    { id: 'donut', name: 'Bánh vòng', emoji: '🍩', type: 'PROCESSED', currency: 'COIN', cost: 0, sellPrice: 160 },
    { id: 'pizza', name: 'Pizza', emoji: '🍕', type: 'PROCESSED', currency: 'COIN', cost: 0, sellPrice: 400 },
    { id: 'burger', name: 'Hambuger', emoji: '🍔', type: 'PROCESSED', currency: 'COIN', cost: 0, sellPrice: 380 },
    { id: 'sandwich', name: 'Sandwich', emoji: '🥪', type: 'PROCESSED', currency: 'COIN', cost: 0, sellPrice: 200 },
    // Processed Food - Dairy & Sugar
    { id: 'butter', name: 'Bơ', emoji: '🧈', type: 'PROCESSED', currency: 'COIN', cost: 0, sellPrice: 150 },
    { id: 'cheese', name: 'Phô mai', emoji: '🧀', type: 'PROCESSED', currency: 'COIN', cost: 0, sellPrice: 200 },
    { id: 'cream', name: 'Kem tươi', emoji: '🧁', type: 'PROCESSED', currency: 'COIN', cost: 0, sellPrice: 180 },
    { id: 'sugar', name: 'Đường', emoji: '🧂', type: 'PROCESSED', currency: 'COIN', cost: 0, sellPrice: 80 },
    { id: 'syrup', name: 'Xi-rô', emoji: '🍯', type: 'PROCESSED', currency: 'COIN', cost: 0, sellPrice: 120 },
    { id: 'yogurt', name: 'Sữa chua', emoji: '🥣', type: 'PROCESSED', currency: 'COIN', cost: 0, sellPrice: 140 },
    { id: 'ice_cream', name: 'Kem ly', emoji: '🍨', type: 'PROCESSED', currency: 'COIN', cost: 0, sellPrice: 250 },
    { id: 'chocolate', name: 'Sô cô la', emoji: '🍫', type: 'PROCESSED', currency: 'COIN', cost: 0, sellPrice: 300 },
    { id: 'candy', name: 'Kẹo', emoji: '🍬', type: 'PROCESSED', currency: 'COIN', cost: 0, sellPrice: 90 },
    // Drinks
    { id: 'apple_juice', name: 'Nước táo', emoji: '🧃', type: 'PROCESSED', currency: 'COIN', cost: 0, sellPrice: 180 },
    { id: 'orange_juice', name: 'Nước cam', emoji: '🍹', type: 'PROCESSED', currency: 'COIN', cost: 0, sellPrice: 190 },
    { id: 'grape_juice', name: 'Nước nho', emoji: '🍷', type: 'PROCESSED', currency: 'COIN', cost: 0, sellPrice: 220 },
    { id: 'carrot_juice', name: 'Nước cà rốt', emoji: '🥤', type: 'PROCESSED', currency: 'COIN', cost: 0, sellPrice: 160 },
    { id: 'tomato_juice', name: 'Nước cà chua', emoji: '🥤', type: 'PROCESSED', currency: 'COIN', cost: 0, sellPrice: 170 },
    { id: 'coffee', name: 'Cà phê', emoji: '☕', type: 'PROCESSED', currency: 'COIN', cost: 0, sellPrice: 250 },
    { id: 'tea', name: 'Trà', emoji: '🍵', type: 'PROCESSED', currency: 'COIN', cost: 0, sellPrice: 150 },
    { id: 'green_smoothie', name: 'Sinh tố xanh', emoji: '🥬', type: 'PROCESSED', currency: 'COIN', cost: 0, sellPrice: 200 },
    { id: 'strawberry_milk', name: 'Sữa dâu', emoji: '🧋', type: 'PROCESSED', currency: 'COIN', cost: 0, sellPrice: 240 },
    { id: 'wine', name: 'Rượu vang', emoji: '🍾', type: 'PROCESSED', currency: 'COIN', cost: 0, sellPrice: 500 },
    // Textile & Craft
    { id: 'cotton_fabric', name: 'Vải cotton', emoji: '👕', type: 'PROCESSED', currency: 'COIN', cost: 0, sellPrice: 300 },
    { id: 'wool_yarn', name: 'Cuộn len', emoji: '🧶', type: 'PROCESSED', currency: 'COIN', cost: 0, sellPrice: 350 },
    { id: 'silk_cloth', name: 'Vải lụa', emoji: '👘', type: 'PROCESSED', currency: 'COIN', cost: 0, sellPrice: 450 },
    { id: 'sweater', name: 'Áo len', emoji: '🧥', type: 'PROCESSED', currency: 'COIN', cost: 0, sellPrice: 600 },
    { id: 'hat', name: 'Mũ rơm', emoji: '👒', type: 'PROCESSED', currency: 'COIN', cost: 0, sellPrice: 250 },
    { id: 'scarf', name: 'Khăn quàng', emoji: '🧣', type: 'PROCESSED', currency: 'COIN', cost: 0, sellPrice: 400 },
    { id: 'shirt', name: 'Áo sơ mi', emoji: '👔', type: 'PROCESSED', currency: 'COIN', cost: 0, sellPrice: 350 },
    // Snacks
    { id: 'popcorn', name: 'Bắp rang', emoji: '🍿', type: 'PROCESSED', currency: 'COIN', cost: 0, sellPrice: 120 },
    { id: 'fries', name: 'Khoai tây chiên', emoji: '🍟', type: 'PROCESSED', currency: 'COIN', cost: 0, sellPrice: 180 },
    { id: 'chips', name: 'Bim bim', emoji: '🍘', type: 'PROCESSED', currency: 'COIN', cost: 0, sellPrice: 150 },
    { id: 'salad', name: 'Salad', emoji: '🥗', type: 'PROCESSED', currency: 'COIN', cost: 0, sellPrice: 220 },
    { id: 'sushi', name: 'Sushi', emoji: '🍣', type: 'PROCESSED', currency: 'COIN', cost: 0, sellPrice: 450 },
    { id: 'grilled_corn', name: 'Ngô nướng', emoji: '🌽', type: 'PROCESSED', currency: 'COIN', cost: 0, sellPrice: 100 },
    { id: 'grilled_meat', name: 'Thịt nướng', emoji: '🥩', type: 'PROCESSED', currency: 'COIN', cost: 0, sellPrice: 300 },
    // Luxury/Misc
    { id: 'perfume', name: 'Nước hoa', emoji: '🧴', type: 'PROCESSED', currency: 'COIN', cost: 0, sellPrice: 600 },
    { id: 'floral_scent', name: 'Hương hoa', emoji: '🌸', type: 'PROCESSED', currency: 'COIN', cost: 0, sellPrice: 350 },
    { id: 'bouquet', name: 'Bó hoa', emoji: '💐', type: 'PROCESSED', currency: 'COIN', cost: 0, sellPrice: 400 },
    { id: 'sunflower_bouquet', name: 'Bó hướng dương', emoji: '🌻', type: 'PROCESSED', currency: 'COIN', cost: 0, sellPrice: 300 },
    { id: 'jam_strawberry', name: 'Mứt dâu', emoji: '🍯', type: 'PROCESSED', currency: 'COIN', cost: 0, sellPrice: 250 },
    { id: 'jam_grape', name: 'Mứt nho', emoji: '🍇', type: 'PROCESSED', currency: 'COIN', cost: 0, sellPrice: 280 },
    { id: 'apple_jam', name: 'Mứt táo', emoji: '🍎', type: 'PROCESSED', currency: 'COIN', cost: 0, sellPrice: 260 },
    { id: 'candle', name: 'Nến thơm', emoji: '🕯️', type: 'PROCESSED', currency: 'COIN', cost: 0, sellPrice: 350 },
];

export const MACHINES: MachineItem[] = [
    { id: 'bakery', name: 'Lò Bánh', emoji: '🥖', type: 'MACHINE', currency: 'COIN', cost: 800, unlockPrice: 800, description: 'Nướng bánh mì thơm ngon', minLevel: 2 },
    { id: 'dairy', name: 'Nhà máy Sữa', emoji: '🧀', type: 'MACHINE', currency: 'COIN', cost: 1500, unlockPrice: 1500, description: 'Làm bơ và phô mai', minLevel: 4 },
    { id: 'snack_machine', name: 'Máy Ăn Vặt', emoji: '🍟', type: 'MACHINE', currency: 'STAR', cost: 10, unlockPrice: 0, description: 'Làm bắp rang bơ, khoai tây chiên', minLevel: 5 },
    { id: 'sugar_mill', name: 'Máy Ép Mía', emoji: '🎋', type: 'MACHINE', currency: 'COIN', cost: 1200, unlockPrice: 1200, description: 'Sản xuất đường', minLevel: 4 },
    { id: 'loom', name: 'Máy Dệt', emoji: '🧶', type: 'MACHINE', currency: 'COIN', cost: 2000, unlockPrice: 2000, description: 'Dệt vải và len', minLevel: 6 },
    { id: 'juice_press', name: 'Máy Ép Trái Cây', emoji: '🍹', type: 'MACHINE', currency: 'COIN', cost: 1800, unlockPrice: 1800, description: 'Làm nước ép tươi', minLevel: 7 },
    { id: 'grill', name: 'Bếp Nướng', emoji: '🥩', type: 'MACHINE', currency: 'COIN', cost: 1600, unlockPrice: 1600, description: 'Nướng thịt và cá', minLevel: 5 },
    { id: 'ice_cream_maker', name: 'Máy Làm Kem', emoji: '🍦', type: 'MACHINE', currency: 'STAR', cost: 20, unlockPrice: 0, description: 'Làm kem mát lạnh', minLevel: 9 },
    { id: 'jam_maker', name: 'Nồi Nấu Mứt', emoji: '🍯', type: 'MACHINE', currency: 'COIN', cost: 2200, unlockPrice: 2200, description: 'Làm mứt trái cây', minLevel: 8 },
    { id: 'coffee_kiosk', name: 'Quầy Cà Phê', emoji: '☕', type: 'MACHINE', currency: 'COIN', cost: 2500, unlockPrice: 2500, description: 'Pha cà phê và trà', minLevel: 9 },
    { id: 'salad_bar', name: 'Quầy Salad', emoji: '🥗', type: 'MACHINE', currency: 'COIN', cost: 1400, unlockPrice: 1400, description: 'Trộn rau củ', minLevel: 5 },
    { id: 'pizza_oven', name: 'Lò Pizza', emoji: '🍕', type: 'MACHINE', currency: 'COIN', cost: 3000, unlockPrice: 3000, description: 'Nướng pizza Ý', minLevel: 10 },
    { id: 'sewing_machine', name: 'Máy May', emoji: '👗', type: 'MACHINE', currency: 'COIN', cost: 2800, unlockPrice: 2800, description: 'May quần áo', minLevel: 8 },
    { id: 'popcorn_pot', name: 'Nồi Nổ Bỏng', emoji: '🍿', type: 'MACHINE', currency: 'COIN', cost: 1000, unlockPrice: 1000, description: 'Nổ bắp rang', minLevel: 3 },
    { id: 'smoothie_blender', name: 'Máy Xay Sinh Tố', emoji: '🥤', type: 'MACHINE', currency: 'COIN', cost: 2400, unlockPrice: 2400, description: 'Xay sinh tố', minLevel: 8 },
    { id: 'candy_machine', name: 'Máy Làm Kẹo', emoji: '🍬', type: 'MACHINE', currency: 'STAR', cost: 15, unlockPrice: 0, description: 'Làm kẹo ngọt', minLevel: 7 },
    { id: 'sushi_bar', name: 'Quầy Sushi', emoji: '🍣', type: 'MACHINE', currency: 'STAR', cost: 30, unlockPrice: 0, description: 'Làm sushi Nhật', minLevel: 12 },
    { id: 'flower_shop', name: 'Bàn Gói Hoa', emoji: '💐', type: 'MACHINE', currency: 'COIN', cost: 1500, unlockPrice: 1500, description: 'Gói hoa tươi', minLevel: 6 },
    { id: 'perfume_lab', name: 'Phòng Nước Hoa', emoji: '🧪', type: 'MACHINE', currency: 'STAR', cost: 50, unlockPrice: 0, description: 'Chiết xuất nước hoa', minLevel: 15 },
    { id: 'chocolatier', name: 'Máy Sô Cô La', emoji: '🍫', type: 'MACHINE', currency: 'COIN', cost: 3500, unlockPrice: 3500, description: 'Làm sô cô la', minLevel: 11 },
];

export const RECIPES: ProcessingRecipe[] = [
    // Bakery
    { id: 'r_bread', machineId: 'bakery', name: 'Bánh mì', input: [{id: 'wheat', amount: 2}, {id: 'egg', amount: 1}], outputId: 'bread', duration: 30, exp: 20 },
    { id: 'r_cookie', machineId: 'bakery', name: 'Bánh quy', input: [{id: 'wheat', amount: 1}, {id: 'sugar', amount: 1}, {id: 'egg', amount: 1}], outputId: 'cookie', duration: 40, exp: 25 },
    { id: 'r_cake', machineId: 'bakery', name: 'Bánh kem', input: [{id: 'wheat', amount: 2}, {id: 'sugar', amount: 2}, {id: 'egg', amount: 2}, {id: 'milk', amount: 1}], outputId: 'cake', duration: 120, exp: 80 },
    { id: 'r_pie', machineId: 'bakery', name: 'Bánh bí ngô', input: [{id: 'pumpkin', amount: 1}, {id: 'wheat', amount: 2}, {id: 'egg', amount: 1}], outputId: 'pie', duration: 90, exp: 60 },
    // Dairy
    { id: 'r_butter', machineId: 'dairy', name: 'Bơ', input: [{id: 'milk', amount: 2}], outputId: 'butter', duration: 60, exp: 30 },
    { id: 'r_cheese', machineId: 'dairy', name: 'Phô mai', input: [{id: 'milk', amount: 3}], outputId: 'cheese', duration: 90, exp: 45 },
    { id: 'r_cream', machineId: 'dairy', name: 'Kem tươi', input: [{id: 'milk', amount: 1}, {id: 'sugar', amount: 1}], outputId: 'cream', duration: 40, exp: 20 },
    // Sugar Mill
    { id: 'r_sugar', machineId: 'sugar_mill', name: 'Đường', input: [{id: 'sugarcane', amount: 2}], outputId: 'sugar', duration: 30, exp: 15 },
    // Snack
    { id: 'r_popcorn', machineId: 'popcorn_pot', name: 'Bắp rang', input: [{id: 'corn', amount: 2}], outputId: 'popcorn', duration: 30, exp: 15 },
    { id: 'r_fries', machineId: 'snack_machine', name: 'Khoai tây chiên', input: [{id: 'potato', amount: 2}], outputId: 'fries', duration: 45, exp: 25 },
    { id: 'r_chips', machineId: 'snack_machine', name: 'Bim bim', input: [{id: 'potato', amount: 1}, {id: 'corn', amount: 1}], outputId: 'chips', duration: 40, exp: 20 },
    // Loom
    { id: 'r_fabric', machineId: 'loom', name: 'Vải cotton', input: [{id: 'cotton', amount: 2}], outputId: 'cotton_fabric', duration: 60, exp: 30 },
    { id: 'r_yarn', machineId: 'loom', name: 'Cuộn len', input: [{id: 'wool', amount: 2}], outputId: 'wool_yarn', duration: 60, exp: 35 },
    { id: 'r_silk', machineId: 'loom', name: 'Vải lụa', input: [{id: 'silk_cocoon', amount: 3}], outputId: 'silk_cloth', duration: 90, exp: 50 },
    // Juice
    { id: 'r_apple_juice', machineId: 'juice_press', name: 'Nước táo', input: [{id: 'apple_fruit', amount: 2}], outputId: 'apple_juice', duration: 45, exp: 25 },
    { id: 'r_carrot_juice', machineId: 'juice_press', name: 'Nước cà rốt', input: [{id: 'carrot', amount: 3}], outputId: 'carrot_juice', duration: 40, exp: 20 },
    { id: 'r_orange_juice', machineId: 'juice_press', name: 'Nước cam', input: [{id: 'orange_fruit', amount: 2}], outputId: 'orange_juice', duration: 45, exp: 25 },
    { id: 'r_grape_juice', machineId: 'juice_press', name: 'Nước nho', input: [{id: 'grape', amount: 2}], outputId: 'grape_juice', duration: 50, exp: 30 },
    { id: 'r_tomato_juice', machineId: 'juice_press', name: 'Nước cà chua', input: [{id: 'tomato', amount: 3}], outputId: 'tomato_juice', duration: 40, exp: 20 },
    // Sewing
    { id: 'r_shirt', machineId: 'sewing_machine', name: 'Áo sơ mi', input: [{id: 'cotton_fabric', amount: 2}], outputId: 'shirt', duration: 120, exp: 60 },
    { id: 'r_sweater', machineId: 'sewing_machine', name: 'Áo len', input: [{id: 'wool_yarn', amount: 3}], outputId: 'sweater', duration: 150, exp: 80 },
    { id: 'r_scarf', machineId: 'sewing_machine', name: 'Khăn quàng', input: [{id: 'wool_yarn', amount: 2}], outputId: 'scarf', duration: 90, exp: 40 },
    { id: 'r_hat', machineId: 'sewing_machine', name: 'Mũ rơm', input: [{id: 'wheat', amount: 5}], outputId: 'hat', duration: 60, exp: 30 },
    // Ice Cream
    { id: 'r_vanilla_ice', machineId: 'ice_cream_maker', name: 'Kem vani', input: [{id: 'cream', amount: 1}, {id: 'milk', amount: 1}, {id: 'sugar', amount: 1}], outputId: 'ice_cream', duration: 60, exp: 40 },
    // Candy
    { id: 'r_lollipop', machineId: 'candy_machine', name: 'Kẹo mút', input: [{id: 'sugar', amount: 2}, {id: 'strawberry', amount: 1}], outputId: 'candy', duration: 40, exp: 20 },
    // Grill
    { id: 'r_grilled_corn', machineId: 'grill', name: 'Ngô nướng', input: [{id: 'corn', amount: 2}], outputId: 'grilled_corn', duration: 30, exp: 15 },
    { id: 'r_grilled_meat', machineId: 'grill', name: 'Thịt nướng', input: [{id: 'bacon', amount: 1}], outputId: 'grilled_meat', duration: 45, exp: 30 },
    // Jam Maker
    { id: 'r_jam_straw', machineId: 'jam_maker', name: 'Mứt dâu', input: [{id: 'strawberry', amount: 2}, {id: 'sugar', amount: 1}], outputId: 'jam_strawberry', duration: 60, exp: 35 },
    { id: 'r_jam_grape', machineId: 'jam_maker', name: 'Mứt nho', input: [{id: 'grape', amount: 2}, {id: 'sugar', amount: 1}], outputId: 'jam_grape', duration: 60, exp: 35 },
    { id: 'r_jam_apple', machineId: 'jam_maker', name: 'Mứt táo', input: [{id: 'apple_fruit', amount: 2}, {id: 'sugar', amount: 1}], outputId: 'apple_jam', duration: 60, exp: 35 },
    // Coffee Kiosk
    { id: 'r_coffee', machineId: 'coffee_kiosk', name: 'Cà phê sữa', input: [{id: 'coffee_bean', amount: 2}, {id: 'milk', amount: 1}, {id: 'sugar', amount: 1}], outputId: 'coffee', duration: 40, exp: 30 },
    { id: 'r_tea', machineId: 'coffee_kiosk', name: 'Trà nóng', input: [{id: 'tea_leaf', amount: 2}, {id: 'sugar', amount: 1}], outputId: 'tea', duration: 30, exp: 20 },
    // Salad Bar
    { id: 'r_salad', machineId: 'salad_bar', name: 'Salad', input: [{id: 'leafy_green', amount: 2}, {id: 'tomato', amount: 1}, {id: 'cucumber', amount: 1}], outputId: 'salad', duration: 20, exp: 15 },
    // Pizza Oven
    { id: 'r_pizza', machineId: 'pizza_oven', name: 'Pizza', input: [{id: 'wheat', amount: 2}, {id: 'cheese', amount: 1}, {id: 'tomato', amount: 2}], outputId: 'pizza', duration: 90, exp: 70 },
    // Smoothie Blender
    { id: 'r_green_smoothie', machineId: 'smoothie_blender', name: 'Sinh tố xanh', input: [{id: 'leafy_green', amount: 2}, {id: 'apple_fruit', amount: 1}], outputId: 'green_smoothie', duration: 30, exp: 25 },
    { id: 'r_strawberry_milk', machineId: 'smoothie_blender', name: 'Sữa dâu', input: [{id: 'strawberry', amount: 2}, {id: 'milk', amount: 1}], outputId: 'strawberry_milk', duration: 30, exp: 25 },
    // Sushi Bar
    { id: 'r_sushi', machineId: 'sushi_bar', name: 'Sushi', input: [{id: 'rice', amount: 2}, {id: 'fish_roe', amount: 1}], outputId: 'sushi', duration: 60, exp: 50 },
    // Flower Shop
    { id: 'r_bouquet', machineId: 'flower_shop', name: 'Bó hoa', input: [{id: 'rose', amount: 2}, {id: 'tulip', amount: 1}], outputId: 'bouquet', duration: 40, exp: 30 },
    { id: 'r_sunflower_bouquet', machineId: 'flower_shop', name: 'Bó hướng dương', input: [{id: 'sunflower', amount: 3}], outputId: 'sunflower_bouquet', duration: 40, exp: 30 },
    // Perfume Lab
    { id: 'r_perfume', machineId: 'perfume_lab', name: 'Nước hoa', input: [{id: 'rose', amount: 3}], outputId: 'perfume', duration: 120, exp: 80 },
    { id: 'r_floral_scent', machineId: 'perfume_lab', name: 'Hương hoa', input: [{id: 'tulip', amount: 3}], outputId: 'floral_scent', duration: 120, exp: 80 },
    // Chocolatier
    { id: 'r_chocolate', machineId: 'chocolatier', name: 'Sô cô la', input: [{id: 'cocoa', amount: 2}, {id: 'sugar', amount: 1}, {id: 'milk', amount: 1}], outputId: 'chocolate', duration: 90, exp: 60 },
];

export const DECORATIONS: Decor[] = [
    { id: 'fence', name: 'Hàng rào', emoji: '🚧', type: 'DECOR', currency: 'COIN', cost: 100 },
    { id: 'flower_pot', name: 'Chậu hoa', emoji: '🌻', type: 'DECOR', currency: 'COIN', cost: 200 },
    { id: 'scarecrow', name: 'Bù nhìn', emoji: '🎃', type: 'DECOR', currency: 'COIN', cost: 500 },
    { id: 'fountain', name: 'Đài phun nước', emoji: '⛲', type: 'DECOR', currency: 'STAR', cost: 20 },
    { id: 'statue', name: 'Tượng Thần', emoji: '🗿', type: 'DECOR', currency: 'STAR', cost: 50 },
    { id: 'bench', name: 'Ghế đá', emoji: '🪑', type: 'DECOR', currency: 'COIN', cost: 150 },
    { id: 'lamp_post', name: 'Đèn đường', emoji: '💡', type: 'DECOR', currency: 'COIN', cost: 300 },
    { id: 'hay_bale', name: 'Đống rơm', emoji: '🌾', type: 'DECOR', currency: 'COIN', cost: 80 },
];

// Expanded Achievements - More tiers and new categories
export const FARM_ACHIEVEMENTS_DATA: Mission[] = [
    // Harvesting Tiers
    { id: 'hv_10', desc: 'Nông Dân Tập Sự (Thu hoạch 10)', type: 'HARVEST', category: 'ACHIEVEMENT', target: 10, current: 0, reward: { type: 'COIN', amount: 100 }, completed: false, claimed: false },
    { id: 'hv_50', desc: 'Nông Dân Chăm Chỉ (Thu hoạch 50)', type: 'HARVEST', category: 'ACHIEVEMENT', target: 50, current: 0, reward: { type: 'STAR', amount: 5 }, completed: false, claimed: false },
    { id: 'hv_200', desc: 'Tay Gặt Hái (Thu hoạch 200)', type: 'HARVEST', category: 'ACHIEVEMENT', target: 200, current: 0, reward: { type: 'STAR', amount: 10 }, completed: false, claimed: false },
    { id: 'hv_500', desc: 'Chúa Tể Ruộng Đồng (Thu hoạch 500)', type: 'HARVEST', category: 'ACHIEVEMENT', target: 500, current: 0, reward: { type: 'STAR', amount: 50 }, completed: false, claimed: false },
    { id: 'hv_1000', desc: 'Thần Nông Tái Thế (Thu hoạch 1000)', type: 'HARVEST', category: 'ACHIEVEMENT', target: 1000, current: 0, reward: { type: 'STAR', amount: 100 }, completed: false, claimed: false },
    { id: 'hv_2000', desc: 'Vua Nông Nghiệp (Thu hoạch 2000)', type: 'HARVEST', category: 'ACHIEVEMENT', target: 2000, current: 0, reward: { type: 'STAR', amount: 200 }, completed: false, claimed: false },
    
    // Earning Tiers
    { id: 'earn_500', desc: 'Khởi Nghiệp (Kiếm 500 xu)', type: 'EARN', category: 'ACHIEVEMENT', target: 500, current: 0, reward: { type: 'WATER', amount: 5 }, completed: false, claimed: false },
    { id: 'earn_2000', desc: 'Tiểu Thương (Kiếm 2000 xu)', type: 'EARN', category: 'ACHIEVEMENT', target: 2000, current: 0, reward: { type: 'COIN', amount: 500 }, completed: false, claimed: false },
    { id: 'earn_10k', desc: 'Đại Gia Phố Huyện (Kiếm 10k xu)', type: 'EARN', category: 'ACHIEVEMENT', target: 10000, current: 0, reward: { type: 'STAR', amount: 20 }, completed: false, claimed: false },
    { id: 'earn_50k', desc: 'Tỷ Phú Nông Trại (Kiếm 50k xu)', type: 'EARN', category: 'ACHIEVEMENT', target: 50000, current: 0, reward: { type: 'STAR', amount: 100 }, completed: false, claimed: false },
    { id: 'earn_100k', desc: 'Vua Tiền Tệ (Kiếm 100k xu)', type: 'EARN', category: 'ACHIEVEMENT', target: 100000, current: 0, reward: { type: 'STAR', amount: 200 }, completed: false, claimed: false },
    
    // Feeding Tiers
    { id: 'feed_10', desc: 'Bạn Của Muôn Loài (Cho ăn 10 lần)', type: 'FEED', category: 'ACHIEVEMENT', target: 10, current: 0, reward: { type: 'COIN', amount: 200 }, completed: false, claimed: false },
    { id: 'feed_50', desc: 'Chăm Sóc Tận Tình (Cho ăn 50 lần)', type: 'FEED', category: 'ACHIEVEMENT', target: 50, current: 0, reward: { type: 'FERTILIZER', amount: 10 }, completed: false, claimed: false },
    { id: 'feed_200', desc: 'Bảo Mẫu Tài Ba (Cho ăn 200 lần)', type: 'FEED', category: 'ACHIEVEMENT', target: 200, current: 0, reward: { type: 'STAR', amount: 15 }, completed: false, claimed: false },
    { id: 'feed_500', desc: 'Chuyên Gia Chăn Nuôi (Cho ăn 500 lần)', type: 'FEED', category: 'ACHIEVEMENT', target: 500, current: 0, reward: { type: 'STAR', amount: 50 }, completed: false, claimed: false },
    
    // Watering Tiers
    { id: 'water_20', desc: 'Tưới Tiêu (20 lần)', type: 'WATER', category: 'ACHIEVEMENT', target: 20, current: 0, reward: { type: 'COIN', amount: 100 }, completed: false, claimed: false },
    { id: 'water_100', desc: 'Thần Mưa (100 lần)', type: 'WATER', category: 'ACHIEVEMENT', target: 100, current: 0, reward: { type: 'WATER', amount: 20 }, completed: false, claimed: false },
    { id: 'water_500', desc: 'Biển Cả Mênh Mông (500 lần)', type: 'WATER', category: 'ACHIEVEMENT', target: 500, current: 0, reward: { type: 'STAR', amount: 30 }, completed: false, claimed: false },

    // Fertilizing Tiers
    { id: 'fert_10', desc: 'Kích Thích Tăng Trưởng (10 lần)', type: 'FERTILIZE', category: 'ACHIEVEMENT', target: 10, current: 0, reward: { type: 'WATER', amount: 5 }, completed: false, claimed: false },
    { id: 'fert_50', desc: 'Bậc Thầy Bón Phân (50 lần)', type: 'FERTILIZE', category: 'ACHIEVEMENT', target: 50, current: 0, reward: { type: 'STAR', amount: 10 }, completed: false, claimed: false },
    { id: 'fert_200', desc: 'Phù Thủy Hóa Học (200 lần)', type: 'FERTILIZE', category: 'ACHIEVEMENT', target: 200, current: 0, reward: { type: 'STAR', amount: 50 }, completed: false, claimed: false },

    // Quizzes Tiers
    { id: 'quiz_10', desc: 'Học Giả Chăm Chỉ (10 câu đố)', type: 'QUIZ', category: 'ACHIEVEMENT', target: 10, current: 0, reward: { type: 'STAR', amount: 5 }, completed: false, claimed: false },
    { id: 'quiz_50', desc: 'Giáo Sư Biết Tuốt (50 câu đố)', type: 'QUIZ', category: 'ACHIEVEMENT', target: 50, current: 0, reward: { type: 'STAR', amount: 25 }, completed: false, claimed: false },
    { id: 'quiz_200', desc: 'Thần Đồng Tiếng Anh (200 câu đố)', type: 'QUIZ', category: 'ACHIEVEMENT', target: 200, current: 0, reward: { type: 'STAR', amount: 100 }, completed: false, claimed: false },
    { id: 'quiz_1000', desc: 'Bách Khoa Toàn Thư (1000 câu đố)', type: 'QUIZ', category: 'ACHIEVEMENT', target: 1000, current: 0, reward: { type: 'STAR', amount: 500 }, completed: false, claimed: false },

    // Order Tiers (Simulated via Earn)
    { id: 'order_10', desc: 'Shipper Thân Thiện (Kiếm 1k xu)', type: 'EARN', category: 'ACHIEVEMENT', target: 1000, current: 0, reward: { type: 'FERTILIZER', amount: 3 }, completed: false, claimed: false },
    { id: 'order_50', desc: 'Shipper Tốc Độ (Kiếm 5k xu)', type: 'EARN', category: 'ACHIEVEMENT', target: 5000, current: 0, reward: { type: 'FERTILIZER', amount: 10 }, completed: false, claimed: false },
    { id: 'order_100', desc: 'Ông Trùm Logistics (Kiếm 20k xu)', type: 'EARN', category: 'ACHIEVEMENT', target: 20000, current: 0, reward: { type: 'STAR', amount: 50 }, completed: false, claimed: false },

    // Specific Items (Fun)
    { id: 'carrot_king', desc: 'Vua Cà Rốt (Thu hoạch 100)', type: 'HARVEST', category: 'ACHIEVEMENT', target: 100, current: 0, reward: { type: 'COIN', amount: 500 }, completed: false, claimed: false },
    { id: 'egg_master', desc: 'Chuyên Gia Trứng (Thu hoạch 50)', type: 'HARVEST', category: 'ACHIEVEMENT', target: 50, current: 0, reward: { type: 'COIN', amount: 300 }, completed: false, claimed: false },
    { id: 'milk_man', desc: 'Thợ Vắt Sữa (Thu hoạch 50)', type: 'HARVEST', category: 'ACHIEVEMENT', target: 50, current: 0, reward: { type: 'COIN', amount: 400 }, completed: false, claimed: false },
    { id: 'baker', desc: 'Thợ Làm Bánh (Thu hoạch 30)', type: 'HARVEST', category: 'ACHIEVEMENT', target: 30, current: 0, reward: { type: 'COIN', amount: 1000 }, completed: false, claimed: false },
    { id: 'pumpkin_patch', desc: 'Lễ Hội Bí Ngô (Thu hoạch 20)', type: 'HARVEST', category: 'ACHIEVEMENT', target: 20, current: 0, reward: { type: 'STAR', amount: 10 }, completed: false, claimed: false },
    { id: 'rose_garden', desc: 'Vườn Hồng Lãng Mạn (Thu hoạch 10)', type: 'HARVEST', category: 'ACHIEVEMENT', target: 10, current: 0, reward: { type: 'STAR', amount: 20 }, completed: false, claimed: false },
    { id: 'sushi_chef', desc: 'Đầu Bếp Sushi (Thu hoạch 20)', type: 'HARVEST', category: 'ACHIEVEMENT', target: 20, current: 0, reward: { type: 'STAR', amount: 30 }, completed: false, claimed: false },
    
    // Pest Control
    { id: 'bug_hunter_10', desc: 'Dũng Sĩ Diệt Sâu (10 lần)', type: 'QUIZ', category: 'ACHIEVEMENT', target: 10, current: 0, reward: { type: 'FERTILIZER', amount: 2 }, completed: false, claimed: false },
    { id: 'bug_hunter_50', desc: 'Kẻ Thù Của Sâu Bọ (50 lần)', type: 'QUIZ', category: 'ACHIEVEMENT', target: 50, current: 0, reward: { type: 'FERTILIZER', amount: 10 }, completed: false, claimed: false },
    { id: 'bug_hunter_100', desc: 'Thanh Trừng Sâu Bọ (100 lần)', type: 'QUIZ', category: 'ACHIEVEMENT', target: 100, current: 0, reward: { type: 'STAR', amount: 20 }, completed: false, claimed: false },

    // Speed Up
    { id: 'speed_up_10', desc: 'Tia Chớp (Tăng tốc 10 lần)', type: 'QUIZ', category: 'ACHIEVEMENT', target: 10, current: 0, reward: { type: 'WATER', amount: 5 }, completed: false, claimed: false },
    { id: 'speed_up_50', desc: 'Nhanh Như Gió (Tăng tốc 50 lần)', type: 'QUIZ', category: 'ACHIEVEMENT', target: 50, current: 0, reward: { type: 'WATER', amount: 20 }, completed: false, claimed: false },

    // Decoration (Simulated via Earn)
    { id: 'decor_fan', desc: 'Yêu Cái Đẹp (Kiếm 1000 xu)', type: 'EARN', category: 'ACHIEVEMENT', target: 1000, current: 0, reward: { type: 'COIN', amount: 100 }, completed: false, claimed: false }, 
    
    // Time Based (Simulated via Harvest counts as a proxy for time spent)
    { id: 'night_owl', desc: 'Cú Đêm Chăm Chỉ (Thu hoạch 200)', type: 'HARVEST', category: 'ACHIEVEMENT', target: 200, current: 0, reward: { type: 'STAR', amount: 5 }, completed: false, claimed: false },
    { id: 'early_bird', desc: 'Chú Chim Sớm (Thu hoạch 150)', type: 'HARVEST', category: 'ACHIEVEMENT', target: 150, current: 0, reward: { type: 'STAR', amount: 5 }, completed: false, claimed: false },
    
    { id: 'machine_op', desc: 'Kỹ Sư Vận Hành (Thu hoạch 300)', type: 'HARVEST', category: 'ACHIEVEMENT', target: 300, current: 0, reward: { type: 'COIN', amount: 1000 }, completed: false, claimed: false },
    
    // Misc
    { id: 'harvest_expert_1', desc: 'Thu Hoạch Lúa (50)', type: 'HARVEST', category: 'ACHIEVEMENT', target: 50, current: 0, reward: { type: 'COIN', amount: 100 }, completed: false, claimed: false },
    { id: 'harvest_expert_2', desc: 'Thu Hoạch Ngô (50)', type: 'HARVEST', category: 'ACHIEVEMENT', target: 50, current: 0, reward: { type: 'COIN', amount: 150 }, completed: false, claimed: false },
    { id: 'harvest_expert_3', desc: 'Thu Hoạch Cà Chua (50)', type: 'HARVEST', category: 'ACHIEVEMENT', target: 50, current: 0, reward: { type: 'COIN', amount: 200 }, completed: false, claimed: false },
    { id: 'harvest_expert_4', desc: 'Thu Hoạch Dâu Tây (50)', type: 'HARVEST', category: 'ACHIEVEMENT', target: 50, current: 0, reward: { type: 'STAR', amount: 10 }, completed: false, claimed: false },
    { id: 'harvest_expert_5', desc: 'Thu Hoạch Khoai Tây (50)', type: 'HARVEST', category: 'ACHIEVEMENT', target: 50, current: 0, reward: { type: 'COIN', amount: 200 }, completed: false, claimed: false },
];

export const DAILY_MISSION_POOL: Mission[] = [
    { id: 'd_water_5', desc: 'Tưới cây 5 lần', type: 'WATER', category: 'DAILY', target: 5, current: 0, reward: { type: 'COIN', amount: 50 }, completed: false, claimed: false },
    { id: 'd_water_10', desc: 'Tưới cây 10 lần', type: 'WATER', category: 'DAILY', target: 10, current: 0, reward: { type: 'STAR', amount: 1 }, completed: false, claimed: false },
    { id: 'd_harvest_10', desc: 'Thu hoạch 10 nông sản', type: 'HARVEST', category: 'DAILY', target: 10, current: 0, reward: { type: 'COIN', amount: 100 }, completed: false, claimed: false },
    { id: 'd_harvest_20', desc: 'Thu hoạch 20 nông sản', type: 'HARVEST', category: 'DAILY', target: 20, current: 0, reward: { type: 'STAR', amount: 2 }, completed: false, claimed: false },
    { id: 'd_quiz_3', desc: 'Trả lời đúng 3 câu đố', type: 'QUIZ', category: 'DAILY', target: 3, current: 0, reward: { type: 'STAR', amount: 1 }, completed: false, claimed: false },
    { id: 'd_quiz_5', desc: 'Trả lời đúng 5 câu đố', type: 'QUIZ', category: 'DAILY', target: 5, current: 0, reward: { type: 'STAR', amount: 3 }, completed: false, claimed: false },
    { id: 'd_feed_5', desc: 'Cho vật nuôi ăn 5 lần', type: 'FEED', category: 'DAILY', target: 5, current: 0, reward: { type: 'COIN', amount: 80 }, completed: false, claimed: false },
    { id: 'd_feed_10', desc: 'Cho vật nuôi ăn 10 lần', type: 'FEED', category: 'DAILY', target: 10, current: 0, reward: { type: 'STAR', amount: 1 }, completed: false, claimed: false },
    { id: 'd_fertilize_2', desc: 'Bón phân 2 lần', type: 'FERTILIZE', category: 'DAILY', target: 2, current: 0, reward: { type: 'STAR', amount: 1 }, completed: false, claimed: false },
    { id: 'd_earn_500', desc: 'Kiếm 500 xu từ đơn hàng', type: 'EARN', category: 'DAILY', target: 500, current: 0, reward: { type: 'FERTILIZER', amount: 2 }, completed: false, claimed: false },
    { id: 'd_earn_1000', desc: 'Kiếm 1000 xu từ đơn hàng', type: 'EARN', category: 'DAILY', target: 1000, current: 0, reward: { type: 'STAR', amount: 2 }, completed: false, claimed: false },
    { id: 'd_plant_10', desc: 'Trồng 10 cây mới', type: 'HARVEST', category: 'DAILY', target: 10, current: 0, reward: { type: 'WATER', amount: 5 }, completed: false, claimed: false },
];
