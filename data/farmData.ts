
import { Crop, Decor, AnimalItem, Product, ProcessingRecipe, MachineItem, Mission } from '../types';

// ... (CROPS, ANIMALS, MACHINES, RECIPES, PRODUCTS, DECORATIONS remain unchanged - preserving existing data structure)
// NOTE: I am keeping the item definitions identical to previous versions to save space in this response, 
// and focusing on rewriting the generateAchievements logic at the bottom.

export const CROPS: Crop[] = [
  // Basics - High Profit to start
  { id: 'carrot', name: 'Cà rốt', emoji: '🥕', type: 'CROP', currency: 'COIN', cost: 10, sellPrice: 35, growthTime: 10, exp: 5, unlockReq: 0 }, 
  { id: 'wheat', name: 'Lúa mì', emoji: '🌾', type: 'CROP', currency: 'COIN', cost: 15, sellPrice: 50, growthTime: 30, exp: 10, unlockReq: 1 }, 
  { id: 'corn', name: 'Bắp ngô', emoji: '🌽', type: 'CROP', currency: 'COIN', cost: 25, sellPrice: 85, growthTime: 60, exp: 15, unlockReq: 2 },
  
  // Mid Tier - ~3.5x to 4x Profit
  { id: 'tomato', name: 'Cà chua', emoji: '🍅', type: 'CROP', currency: 'COIN', cost: 40, sellPrice: 150, growthTime: 120, exp: 25, unlockReq: 3 },
  { id: 'potato', name: 'Khoai tây', emoji: '🥔', type: 'CROP', currency: 'COIN', cost: 30, sellPrice: 110, growthTime: 90, exp: 20, unlockReq: 2 },
  { id: 'cabbage', name: 'Bắp cải', emoji: '🥬', type: 'CROP', currency: 'COIN', cost: 35, sellPrice: 130, growthTime: 100, exp: 22, unlockReq: 3 },
  
  // Special
  { id: 'strawberry', name: 'Dâu tây', emoji: '🍓', type: 'CROP', currency: 'STAR', cost: 1, sellPrice: 300, growthTime: 180, exp: 50, unlockReq: 5, isMagic: true },
  
  // High Tier - ~4x to 5x Profit (Long wait = Big reward)
  { id: 'pumpkin', name: 'Bí ngô', emoji: '🎃', type: 'CROP', currency: 'COIN', cost: 60, sellPrice: 280, growthTime: 240, exp: 40, unlockReq: 6 },
  { id: 'eggplant', name: 'Cà tím', emoji: '🍆', type: 'CROP', currency: 'COIN', cost: 50, sellPrice: 220, growthTime: 200, exp: 35, unlockReq: 5 },
  { id: 'chili', name: 'Ớt đỏ', emoji: '🌶️', type: 'CROP', currency: 'COIN', cost: 45, sellPrice: 200, growthTime: 180, exp: 30, unlockReq: 4 },
  { id: 'cucumber', name: 'Dưa chuột', emoji: '🥒', type: 'CROP', currency: 'COIN', cost: 30, sellPrice: 120, growthTime: 90, exp: 20, unlockReq: 3 },
  
  // Flavor Crops
  { id: 'garlic', name: 'Tỏi', emoji: '🧄', type: 'CROP', currency: 'COIN', cost: 25, sellPrice: 100, growthTime: 80, exp: 18, unlockReq: 2 },
  { id: 'onion', name: 'Hành tây', emoji: '🧅', type: 'CROP', currency: 'COIN', cost: 25, sellPrice: 100, growthTime: 80, exp: 18, unlockReq: 2 },
  { id: 'broccoli', name: 'Súp lơ', emoji: '🥦', type: 'CROP', currency: 'COIN', cost: 55, sellPrice: 250, growthTime: 210, exp: 38, unlockReq: 6 },
  { id: 'mushroom', name: 'Nấm', emoji: '🍄', type: 'CROP', currency: 'COIN', cost: 20, sellPrice: 80, growthTime: 60, exp: 15, unlockReq: 2 },
  { id: 'pea', name: 'Đậu Hà Lan', emoji: '🫛', type: 'CROP', currency: 'COIN', cost: 30, sellPrice: 120, growthTime: 100, exp: 20, unlockReq: 3 },
  { id: 'sweet_potato', name: 'Khoai lang', emoji: '🍠', type: 'CROP', currency: 'COIN', cost: 35, sellPrice: 140, growthTime: 110, exp: 22, unlockReq: 4 },
  { id: 'ginger', name: 'Củ gừng', emoji: '🫚', type: 'CROP', currency: 'COIN', cost: 20, sellPrice: 75, growthTime: 50, exp: 12, unlockReq: 1 },
  { id: 'leafy_green', name: 'Rau xanh', emoji: '🥗', type: 'CROP', currency: 'COIN', cost: 15, sellPrice: 60, growthTime: 40, exp: 10, unlockReq: 1 },
  { id: 'bell_pepper', name: 'Ớt chuông', emoji: '🫑', type: 'CROP', currency: 'COIN', cost: 50, sellPrice: 230, growthTime: 200, exp: 35, unlockReq: 5 },
  
  // Cash Crops (High Level)
  { id: 'cotton', name: 'Bông', emoji: '☁️', type: 'CROP', currency: 'COIN', cost: 70, sellPrice: 350, growthTime: 300, exp: 45, unlockReq: 7 },
  { id: 'sugarcane', name: 'Mía', emoji: '🎋', type: 'CROP', currency: 'COIN', cost: 40, sellPrice: 180, growthTime: 150, exp: 25, unlockReq: 4 },
  { id: 'coffee_bean', name: 'Hạt cà phê', emoji: '🫘', type: 'CROP', currency: 'COIN', cost: 80, sellPrice: 400, growthTime: 360, exp: 55, unlockReq: 8 },
  { id: 'tea_leaf', name: 'Lá trà', emoji: '🌿', type: 'CROP', currency: 'COIN', cost: 60, sellPrice: 280, growthTime: 240, exp: 40, unlockReq: 6 },
  { id: 'cocoa', name: 'Cacao', emoji: '🍫', type: 'CROP', currency: 'COIN', cost: 90, sellPrice: 450, growthTime: 400, exp: 60, unlockReq: 9 },
  { id: 'sunflower', name: 'Hướng dương', emoji: '🌻', type: 'CROP', currency: 'COIN', cost: 45, sellPrice: 200, growthTime: 180, exp: 30, unlockReq: 5 },
  
  // Magic
  { id: 'rose', name: 'Hoa hồng', emoji: '🌹', type: 'CROP', currency: 'STAR', cost: 2, sellPrice: 600, growthTime: 600, exp: 100, unlockReq: 10, isMagic: true },
  
  { id: 'tulip', name: 'Tulip', emoji: '🌷', type: 'CROP', currency: 'COIN', cost: 50, sellPrice: 240, growthTime: 200, exp: 35, unlockReq: 6 },
  { id: 'rice', name: 'Lúa gạo', emoji: '🍚', type: 'CROP', currency: 'COIN', cost: 20, sellPrice: 80, growthTime: 60, exp: 12, unlockReq: 1 },
  { id: 'soybean', name: 'Đậu nành', emoji: '🥜', type: 'CROP', currency: 'COIN', cost: 30, sellPrice: 120, growthTime: 90, exp: 20, unlockReq: 3 },
  
  // Fruits
  { id: 'apple_fruit', name: 'Táo', emoji: '🍎', type: 'CROP', currency: 'COIN', cost: 100, sellPrice: 500, growthTime: 500, exp: 70, unlockReq: 8 },
  { id: 'orange_fruit', name: 'Cam', emoji: '🍊', type: 'CROP', currency: 'COIN', cost: 90, sellPrice: 450, growthTime: 450, exp: 65, unlockReq: 7 },
  { id: 'grape', name: 'Nho', emoji: '🍇', type: 'CROP', currency: 'COIN', cost: 120, sellPrice: 600, growthTime: 600, exp: 80, unlockReq: 9 },
  { id: 'banana_fruit', name: 'Chuối', emoji: '🍌', type: 'CROP', currency: 'COIN', cost: 85, sellPrice: 400, growthTime: 400, exp: 60, unlockReq: 7 },
  { id: 'watermelon', name: 'Dưa hấu', emoji: '🍉', type: 'CROP', currency: 'COIN', cost: 70, sellPrice: 320, growthTime: 320, exp: 50, unlockReq: 6 },
  { id: 'lemon', name: 'Chanh', emoji: '🍋', type: 'CROP', currency: 'COIN', cost: 60, sellPrice: 280, growthTime: 280, exp: 40, unlockReq: 5 },
  { id: 'peach', name: 'Đào', emoji: '🍑', type: 'CROP', currency: 'COIN', cost: 110, sellPrice: 550, growthTime: 550, exp: 75, unlockReq: 8 },
  { id: 'cherry', name: 'Cherry', emoji: '🍒', type: 'CROP', currency: 'STAR', cost: 3, sellPrice: 800, growthTime: 700, exp: 120, unlockReq: 10, isMagic: true },
  { id: 'pineapple', name: 'Dứa', emoji: '🍍', type: 'CROP', currency: 'COIN', cost: 75, sellPrice: 350, growthTime: 350, exp: 55, unlockReq: 6 },
  { id: 'coconut_fruit', name: 'Dừa', emoji: '🥥', type: 'CROP', currency: 'COIN', cost: 95, sellPrice: 480, growthTime: 480, exp: 68, unlockReq: 8 },
  { id: 'mango', name: 'Xoài', emoji: '🥭', type: 'CROP', currency: 'COIN', cost: 105, sellPrice: 520, growthTime: 520, exp: 72, unlockReq: 9 },
  { id: 'kiwi', name: 'Kiwi', emoji: '🥝', type: 'CROP', currency: 'COIN', cost: 80, sellPrice: 380, growthTime: 380, exp: 58, unlockReq: 7 },
  { id: 'blueberry', name: 'Việt quất', emoji: '🫐', type: 'CROP', currency: 'COIN', cost: 130, sellPrice: 650, growthTime: 650, exp: 85, unlockReq: 10 },
  { id: 'olive', name: 'Ô liu', emoji: '🫒', type: 'CROP', currency: 'COIN', cost: 90, sellPrice: 420, growthTime: 450, exp: 65, unlockReq: 8 },
  { id: 'melon', name: 'Dưa lưới', emoji: '🍈', type: 'CROP', currency: 'COIN', cost: 70, sellPrice: 320, growthTime: 330, exp: 52, unlockReq: 6 },
  { id: 'pear', name: 'Lê', emoji: '🍐', type: 'CROP', currency: 'COIN', cost: 85, sellPrice: 400, growthTime: 420, exp: 62, unlockReq: 7 },
  { id: 'avocado', name: 'Bơ', emoji: '🥑', type: 'CROP', currency: 'COIN', cost: 115, sellPrice: 580, growthTime: 580, exp: 78, unlockReq: 9 },
  { id: 'dragonfruit', name: 'Thanh long', emoji: '🐲', type: 'CROP', currency: 'COIN', cost: 100, sellPrice: 500, growthTime: 500, exp: 70, unlockReq: 8 },
  { id: 'durian', name: 'Sầu riêng', emoji: '🤢', type: 'CROP', currency: 'STAR', cost: 5, sellPrice: 1200, growthTime: 1000, exp: 200, unlockReq: 12, isMagic: true },
  { id: 'bamboo', name: 'Tre', emoji: '🎍', type: 'CROP', currency: 'COIN', cost: 40, sellPrice: 180, growthTime: 160, exp: 28, unlockReq: 4 },
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
    { id: 'dog_guard', name: 'Chó giữ nhà', emoji: '🐕', type: 'ANIMAL', currency: 'COIN', cost: 1000, produceId: 'bone', produceTime: 360, feedCropId: 'bacon', feedAmount: 1, exp: 110, minLevel: 5 }, 
    { id: 'cat_pet', name: 'Mèo mướp', emoji: '🐈', type: 'ANIMAL', currency: 'COIN', cost: 800, produceId: 'yarn_ball', produceTime: 300, feedCropId: 'milk', feedAmount: 1, exp: 90, minLevel: 5 },
    { id: 'yak', name: 'Bò Tây Tạng', emoji: '🐂', type: 'ANIMAL', currency: 'STAR', cost: 20, produceId: 'yak_milk', produceTime: 400, feedCropId: 'wheat', feedAmount: 5, exp: 200, minLevel: 12 },
    { id: 'deer', name: 'Hươu', emoji: '🦌', type: 'ANIMAL', currency: 'STAR', cost: 12, produceId: 'antler', produceTime: 500, feedCropId: 'leafy_green', feedAmount: 4, exp: 140, minLevel: 10 },
    { id: 'bat', name: 'Dơi', emoji: '🦇', type: 'ANIMAL', currency: 'COIN', cost: 300, produceId: 'guano', produceTime: 150, feedCropId: 'tomato', feedAmount: 2, exp: 40, minLevel: 6 }, 
    { id: 'frog', name: 'Ếch', emoji: '🐸', type: 'ANIMAL', currency: 'COIN', cost: 100, produceId: 'frog_leg', produceTime: 100, feedCropId: 'rice', feedAmount: 1, exp: 20, minLevel: 2 },
    { id: 'crab', name: 'Cua', emoji: '🦀', type: 'ANIMAL', currency: 'COIN', cost: 200, produceId: 'crab_meat', produceTime: 200, feedCropId: 'fish_roe', feedAmount: 1, exp: 35, minLevel: 7 },
    { id: 'lobster', name: 'Tôm hùm', emoji: '🦞', type: 'ANIMAL', currency: 'STAR', cost: 8, produceId: 'lobster_tail', produceTime: 300, feedCropId: 'fish_roe', feedAmount: 2, exp: 80, minLevel: 9 },
    { id: 'shrimp', name: 'Tôm', emoji: '🦐', type: 'ANIMAL', currency: 'COIN', cost: 150, produceId: 'shrimp_meat', produceTime: 120, feedCropId: 'rice', feedAmount: 1, exp: 25, minLevel: 4 },
    { id: 'squid', name: 'Mực', emoji: '🦑', type: 'ANIMAL', currency: 'COIN', cost: 300, produceId: 'ink_sac', produceTime: 180, feedCropId: 'fish_roe', feedAmount: 1, exp: 45, minLevel: 6 },
];

export const MACHINES: MachineItem[] = [
    { id: 'bakery', name: 'Lò Bánh Mì', emoji: '🍞', type: 'MACHINE', currency: 'COIN', cost: 500, unlockPrice: 500, minLevel: 2, description: 'Nướng các loại bánh' },
    { id: 'dairy', name: 'Nhà Máy Sữa', emoji: '🧀', type: 'MACHINE', currency: 'COIN', cost: 800, unlockPrice: 800, minLevel: 3, description: 'Chế biến sữa' },
    { id: 'sugar_mill', name: 'Máy Ép Mía', emoji: '🍬', type: 'MACHINE', currency: 'COIN', cost: 1200, unlockPrice: 1200, minLevel: 4, description: 'Sản xuất đường' },
    { id: 'juice_press', name: 'Máy Ép Trái Cây', emoji: '🍹', type: 'MACHINE', currency: 'COIN', cost: 1500, unlockPrice: 1500, minLevel: 6, description: 'Làm nước ép' },
    { id: 'coffee_kiosk', name: 'Quầy Cà Phê', emoji: '☕', type: 'MACHINE', currency: 'COIN', cost: 2000, unlockPrice: 2000, minLevel: 8, description: 'Pha chế cà phê' },
    { id: 'sushi_bar', name: 'Quầy Sushi', emoji: '🍣', type: 'MACHINE', currency: 'STAR', cost: 10, unlockPrice: 0, minLevel: 7, description: 'Làm Sushi Nhật Bản' },
    { id: 'flower_shop', name: 'Tiệm Hoa', emoji: '💐', type: 'MACHINE', currency: 'STAR', cost: 15, unlockPrice: 0, minLevel: 6, description: 'Cắm hoa nghệ thuật' },
    { id: 'perfume_lab', name: 'Phòng Nước Hoa', emoji: '🧪', type: 'MACHINE', currency: 'STAR', cost: 20, unlockPrice: 0, minLevel: 10, description: 'Chiết xuất nước hoa' },
    { id: 'chocolatier', name: 'Xưởng Sô-cô-la', emoji: '🍫', type: 'MACHINE', currency: 'COIN', cost: 3000, unlockPrice: 3000, minLevel: 9, description: 'Làm sô cô la' },
];

export const RECIPES: ProcessingRecipe[] = [
    // Bakery
    { id: 'r_bread', machineId: 'bakery', name: 'Bánh mì', input: [{ id: 'wheat', amount: 3 }], outputId: 'bread', duration: 300, exp: 5 },
    { id: 'r_cookie', machineId: 'bakery', name: 'Bánh quy', input: [{ id: 'wheat', amount: 2 }, { id: 'egg', amount: 1 }], outputId: 'cookie', duration: 600, exp: 10 },
    { id: 'r_cake', machineId: 'bakery', name: 'Bánh kem', input: [{ id: 'wheat', amount: 2 }, { id: 'egg', amount: 2 }, { id: 'milk', amount: 1 }], outputId: 'cake', duration: 3600, exp: 50 },
    { id: 'r_pie', machineId: 'bakery', name: 'Bánh bí ngô', input: [{ id: 'pumpkin', amount: 1 }, { id: 'wheat', amount: 2 }, { id: 'egg', amount: 1 }], outputId: 'pie', duration: 1800, exp: 30 },
    { id: 'r_croissant', machineId: 'bakery', name: 'Bánh sừng bò', input: [{ id: 'wheat', amount: 3 }, { id: 'butter', amount: 1 }], outputId: 'croissant', duration: 900, exp: 20 },
    { id: 'r_pancake', machineId: 'bakery', name: 'Bánh kếp', input: [{ id: 'wheat', amount: 2 }, { id: 'egg', amount: 1 }, { id: 'milk', amount: 1 }], outputId: 'pancake', duration: 600, exp: 15 },
    { id: 'r_donut', machineId: 'bakery', name: 'Bánh vòng', input: [{ id: 'wheat', amount: 2 }, { id: 'sugar', amount: 1 }], outputId: 'donut', duration: 900, exp: 18 },
    { id: 'r_pizza', machineId: 'bakery', name: 'Pizza', input: [{ id: 'wheat', amount: 2 }, { id: 'tomato', amount: 1 }, { id: 'cheese', amount: 1 }], outputId: 'pizza', duration: 2400, exp: 40 },
    { id: 'r_burger', machineId: 'bakery', name: 'Hambuger', input: [{ id: 'bread', amount: 1 }, { id: 'bacon', amount: 1 }], outputId: 'burger', duration: 1200, exp: 35 },
    { id: 'r_sandwich', machineId: 'bakery', name: 'Sandwich', input: [{ id: 'bread', amount: 2 }, { id: 'bacon', amount: 1 }, { id: 'cheese', amount: 1 }], outputId: 'sandwich', duration: 1500, exp: 25 },

    // Dairy
    { id: 'r_butter', machineId: 'dairy', name: 'Bơ', input: [{ id: 'milk', amount: 2 }], outputId: 'butter', duration: 600, exp: 10 },
    { id: 'r_cheese', machineId: 'dairy', name: 'Phô mai', input: [{ id: 'milk', amount: 3 }], outputId: 'cheese', duration: 1200, exp: 20 },
    { id: 'r_cream', machineId: 'dairy', name: 'Kem tươi', input: [{ id: 'milk', amount: 1 }], outputId: 'cream', duration: 300, exp: 8 },
    { id: 'r_yogurt', machineId: 'dairy', name: 'Sữa chua', input: [{ id: 'milk', amount: 1 }, { id: 'sugar', amount: 1 }], outputId: 'yogurt', duration: 900, exp: 15 },
    { id: 'r_ice_cream', machineId: 'dairy', name: 'Kem ly', input: [{ id: 'cream', amount: 1 }, { id: 'sugar', amount: 1 }, { id: 'milk', amount: 1 }], outputId: 'ice_cream', duration: 2400, exp: 35 },

    // Sugar Mill
    { id: 'r_sugar', machineId: 'sugar_mill', name: 'Đường', input: [{ id: 'sugarcane', amount: 1 }], outputId: 'sugar', duration: 300, exp: 5 },
    { id: 'r_syrup', machineId: 'sugar_mill', name: 'Xi-rô', input: [{ id: 'sugarcane', amount: 2 }], outputId: 'syrup', duration: 600, exp: 12 },

    // Juice Press
    { id: 'r_apple_juice', machineId: 'juice_press', name: 'Nước táo', input: [{ id: 'apple_fruit', amount: 3 }], outputId: 'apple_juice', duration: 600, exp: 15 },
    { id: 'r_orange_juice', machineId: 'juice_press', name: 'Nước cam', input: [{ id: 'orange_fruit', amount: 3 }], outputId: 'orange_juice', duration: 600, exp: 15 },
    { id: 'r_grape_juice', machineId: 'juice_press', name: 'Nước nho', input: [{ id: 'grape', amount: 3 }], outputId: 'grape_juice', duration: 600, exp: 15 },
    { id: 'r_carrot_juice', machineId: 'juice_press', name: 'Nước cà rốt', input: [{ id: 'carrot', amount: 3 }], outputId: 'carrot_juice', duration: 600, exp: 12 },
    { id: 'r_tomato_juice', machineId: 'juice_press', name: 'Nước cà chua', input: [{ id: 'tomato', amount: 3 }], outputId: 'tomato_juice', duration: 600, exp: 12 },
    { id: 'r_green_smoothie', machineId: 'juice_press', name: 'Sinh tố xanh', input: [{ id: 'leafy_green', amount: 2 }, { id: 'apple_fruit', amount: 1 }], outputId: 'green_smoothie', duration: 900, exp: 20 },

    // Coffee Kiosk
    { id: 'r_coffee', machineId: 'coffee_kiosk', name: 'Cà phê', input: [{ id: 'coffee_bean', amount: 3 }], outputId: 'coffee', duration: 300, exp: 10 },
    { id: 'r_tea', machineId: 'coffee_kiosk', name: 'Trà', input: [{ id: 'tea_leaf', amount: 3 }], outputId: 'tea', duration: 300, exp: 10 },
    { id: 'r_strawberry_milk', machineId: 'coffee_kiosk', name: 'Sữa dâu', input: [{ id: 'strawberry', amount: 2 }, { id: 'milk', amount: 1 }], outputId: 'strawberry_milk', duration: 600, exp: 18 },

    // Chocolatier
    { id: 'r_chocolate', machineId: 'chocolatier', name: 'Sô cô la', input: [{ id: 'cocoa', amount: 2 }, { id: 'sugar', amount: 1 }, { id: 'milk', amount: 1 }], outputId: 'chocolate', duration: 1800, exp: 30 },
    { id: 'r_candy', machineId: 'chocolatier', name: 'Kẹo', input: [{ id: 'syrup', amount: 1 }, { id: 'strawberry', amount: 1 }], outputId: 'candy', duration: 600, exp: 15 },

    // Sushi Bar
    { id: 'r_sushi', machineId: 'sushi_bar', name: 'Sushi', input: [{ id: 'rice', amount: 2 }, { id: 'fish_roe', amount: 1 }], outputId: 'sushi', duration: 900, exp: 25 },

    // Flower Shop
    { id: 'r_bouquet', machineId: 'flower_shop', name: 'Bó Hoa', input: [{ id: 'rose', amount: 2 }, { id: 'tulip', amount: 2 }], outputId: 'bouquet', duration: 1200, exp: 30 },
    { id: 'r_sunflower_bouquet', machineId: 'flower_shop', name: 'Bó Hướng Dương', input: [{ id: 'sunflower', amount: 3 }], outputId: 'sunflower_bouquet', duration: 900, exp: 25 },

    // Perfume Lab
    { id: 'r_perfume', machineId: 'perfume_lab', name: 'Nước Hoa Hồng', input: [{ id: 'rose', amount: 5 }], outputId: 'perfume', duration: 3600, exp: 100 },
    { id: 'r_floral_scent', machineId: 'perfume_lab', name: 'Hương Hoa', input: [{ id: 'tulip', amount: 3 }, { id: 'sunflower', amount: 2 }], outputId: 'floral_scent', duration: 2400, exp: 80 },
];

export const PRODUCTS: Product[] = [
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
    { id: 'butter', name: 'Bơ', emoji: '🧈', type: 'PROCESSED', currency: 'COIN', cost: 0, sellPrice: 150 },
    { id: 'cheese', name: 'Phô mai', emoji: '🧀', type: 'PROCESSED', currency: 'COIN', cost: 0, sellPrice: 200 },
    { id: 'cream', name: 'Kem tươi', emoji: '🧁', type: 'PROCESSED', currency: 'COIN', cost: 0, sellPrice: 180 },
    { id: 'sugar', name: 'Đường', emoji: '🧂', type: 'PROCESSED', currency: 'COIN', cost: 0, sellPrice: 80 },
    { id: 'syrup', name: 'Xi-rô', emoji: '🍯', type: 'PROCESSED', currency: 'COIN', cost: 0, sellPrice: 120 },
    { id: 'yogurt', name: 'Sữa chua', emoji: '🥣', type: 'PROCESSED', currency: 'COIN', cost: 0, sellPrice: 140 },
    { id: 'ice_cream', name: 'Kem ly', emoji: '🍨', type: 'PROCESSED', currency: 'COIN', cost: 0, sellPrice: 250 },
    { id: 'chocolate', name: 'Sô cô la', emoji: '🍫', type: 'PROCESSED', currency: 'COIN', cost: 0, sellPrice: 300 },
    { id: 'candy', name: 'Kẹo', emoji: '🍬', type: 'PROCESSED', currency: 'COIN', cost: 0, sellPrice: 90 },
    { id: 'apple_juice', name: 'Nước táo', emoji: '🧃', type: 'PROCESSED', currency: 'COIN', cost: 0, sellPrice: 180 },
    { id: 'orange_juice', name: 'Nước cam', emoji: '🍹', type: 'PROCESSED', currency: 'COIN', cost: 0, sellPrice: 190 },
    { id: 'grape_juice', name: 'Nước nho', emoji: '🍷', type: 'PROCESSED', currency: 'COIN', cost: 0, sellPrice: 220 },
    { id: 'carrot_juice', name: 'Nước cà rốt', emoji: '🥤', type: 'PROCESSED', currency: 'COIN', cost: 0, sellPrice: 160 },
    { id: 'tomato_juice', name: 'Nước cà chua', emoji: '🥤', type: 'PROCESSED', currency: 'COIN', cost: 0, sellPrice: 170 },
    { id: 'coffee', name: 'Cà phê', emoji: '☕', type: 'PROCESSED', currency: 'COIN', cost: 0, sellPrice: 250 },
    { id: 'tea', name: 'Trà', emoji: '🍵', type: 'PROCESSED', currency: 'COIN', cost: 0, sellPrice: 150 },
    { id: 'green_smoothie', name: 'Sinh tố xanh', emoji: '🥬', type: 'PROCESSED', currency: 'COIN', cost: 0, sellPrice: 200 },
    { id: 'strawberry_milk', name: 'Sữa dâu', emoji: '🧋', type: 'PROCESSED', currency: 'COIN', cost: 0, sellPrice: 240 },
    { id: 'sushi', name: 'Sushi', emoji: '🍣', type: 'PROCESSED', currency: 'COIN', cost: 0, sellPrice: 250 },
    { id: 'bouquet', name: 'Bó Hoa', emoji: '💐', type: 'PROCESSED', currency: 'COIN', cost: 0, sellPrice: 180 },
    { id: 'sunflower_bouquet', name: 'Bó Hướng Dương', emoji: '🌻', type: 'PROCESSED', currency: 'COIN', cost: 0, sellPrice: 200 },
    { id: 'perfume', name: 'Nước Hoa Hồng', emoji: '🌹', type: 'PROCESSED', currency: 'COIN', cost: 0, sellPrice: 400 },
    { id: 'floral_scent', name: 'Hương Hoa', emoji: '🌷', type: 'PROCESSED', currency: 'COIN', cost: 0, sellPrice: 350 },
];

export const DECORATIONS: Decor[] = [
    // --- COMMON (WHITE) < 20 STARS ---
    {
        id: 'worm', name: 'Giun Đất', emoji: '🪱', type: 'DECOR', currency: 'STAR', cost: 2,
        imageUrl: 'https://drive.google.com/thumbnail?id=1wfo2MjPdShrLdZl-ERt76noMJu4otOGE&sz=w500',
        buff: { type: 'TIME', value: 2, desc: 'Giảm 2% thời gian' } 
    },
    {
        id: 'hand_rake', name: 'Cào Cầm Tay', emoji: '🖐️', type: 'DECOR', currency: 'STAR', cost: 3,
        imageUrl: 'https://drive.google.com/thumbnail?id=15-gZp4d01eD1mwco_qeyxGG1jdWle1U7&sz=w500',
        buff: { type: 'TIME', value: 3, desc: 'Giảm 3% thời gian' }
    },
    {
        id: 'slug', name: 'Ốc Sên Trần', emoji: '🐌', type: 'DECOR', currency: 'STAR', cost: 4,
        imageUrl: 'https://drive.google.com/thumbnail?id=1BKGlvPfxaYjiJ0m-edWTqDtmRV8vZhO7&sz=w500',
        buff: { type: 'EXP', value: 3, desc: '+3% Kinh nghiệm' }
    },
    {
        id: 'moth', name: 'Bướm Đêm', emoji: '🦋', type: 'DECOR', currency: 'STAR', cost: 5,
        imageUrl: 'https://drive.google.com/thumbnail?id=1Ch3rv0oYZAjCyerOVJzade_zG-0NJTqb&sz=w500',
        buff: { type: 'COIN', value: 3, desc: '+3% Giá bán' }
    },
    {
        id: 'straw_hat', name: 'Mũ Rơm', emoji: '👒', type: 'DECOR', currency: 'STAR', cost: 5,
        imageUrl: 'https://drive.google.com/thumbnail?id=1-9iqMH9k0saXjI39CtWdj0SWp4UfNBuR&sz=w500',
        buff: { type: 'EXP', value: 4, desc: '+4% Kinh nghiệm' }
    },
    {
        id: 'leaves_rake', name: 'Cào Lá', emoji: '🍂', type: 'DECOR', currency: 'STAR', cost: 6,
        imageUrl: 'https://drive.google.com/thumbnail?id=12JVmDy26SVAvYV-xdSJXmWEz3oZPJ-o4&sz=w500',
        buff: { type: 'EXP', value: 5, desc: '+5% Kinh nghiệm' }
    },
    {
        id: 'fence', name: 'Hàng Rào', emoji: '🪜', type: 'DECOR', currency: 'STAR', cost: 7,
        imageUrl: 'https://drive.google.com/thumbnail?id=1cSNDep2PY9I1D-TcxcTtVDWP2RQIbxtC&sz=w500',
        buff: { type: 'PEST', value: 10, desc: 'Giảm 10% sâu bệnh' }
    },
    {
        id: 'hoe', name: 'Cái Cuốc', emoji: '⛏️', type: 'DECOR', currency: 'STAR', cost: 8,
        imageUrl: 'https://drive.google.com/thumbnail?id=1ySYL3tQRjv8_9lodKAYXL9hDgABlJyWL&sz=w500',
        buff: { type: 'TIME', value: 5, desc: 'Giảm 5% thời gian' }
    },
    {
        id: 'caterpillar', name: 'Sâu Bướm', emoji: '🐛', type: 'DECOR', currency: 'STAR', cost: 8,
        imageUrl: 'https://drive.google.com/thumbnail?id=1vsu6vhRsedfisGpXR79KJ3wUCwvNr8Y1&sz=w500',
        buff: { type: 'COIN', value: 5, desc: '+5% Giá bán' }
    },
    {
        id: 'boots', name: 'Ủng Cao Su', emoji: '👢', type: 'DECOR', currency: 'STAR', cost: 10,
        imageUrl: 'https://drive.google.com/thumbnail?id=1Eg1N55-osusJbTdrKeIVruRxL51VSKRq&sz=w500',
        buff: { type: 'EXP', value: 6, desc: '+6% Kinh nghiệm' }
    },
    {
        id: 'spray_bottle', name: 'Bình Xịt', emoji: '🧴', type: 'DECOR', currency: 'STAR', cost: 10,
        imageUrl: 'https://drive.google.com/thumbnail?id=1LtrTB8OHsrxaj_YlDtL61HusOFUoCher&sz=w500',
        buff: { type: 'PEST', value: 15, desc: 'Giảm 15% sâu bệnh' }
    },
    {
        id: 'hand_scythe', name: 'Liềm Cắt Cỏ', emoji: '🗡️', type: 'DECOR', currency: 'STAR', cost: 12,
        imageUrl: 'https://drive.google.com/thumbnail?id=17C4n6pom71Ov16sIC_qIw4fdHi2UvX3c&sz=w500',
        buff: { type: 'COIN', value: 8, desc: '+8% Giá bán' }
    },
    {
        id: 'hose', name: 'Vòi Nước', emoji: '🚿', type: 'DECOR', currency: 'STAR', cost: 12,
        imageUrl: 'https://drive.google.com/thumbnail?id=1fLmmiB1SpoZBxmcbBgOU5E4c-XWZ5wt1&sz=w500',
        buff: { type: 'TIME', value: 8, desc: 'Giảm 8% thời gian' }
    },
    {
        id: 'seeds_green', name: 'Túi Hạt Lục', emoji: '🟢', type: 'DECOR', currency: 'STAR', cost: 15,
        imageUrl: 'https://drive.google.com/thumbnail?id=1j1WXaTz2xUzN17NUm8KDmbMfkXLTXknu&sz=w500',
        buff: { type: 'COIN', value: 10, desc: '+10% Giá bán' }
    },
    {
        id: 'seeds_blue', name: 'Túi Hạt Xanh', emoji: '🔵', type: 'DECOR', currency: 'STAR', cost: 15,
        imageUrl: 'https://drive.google.com/thumbnail?id=1xLi6PQJPYWtP6MM32KewhT-jgr5lnkzb&sz=w500',
        buff: { type: 'EXP', value: 10, desc: '+10% Kinh nghiệm' }
    },
    {
        id: 'pitchfork', name: 'Cây Chỉa', emoji: '🔱', type: 'DECOR', currency: 'STAR', cost: 18,
        imageUrl: 'https://drive.google.com/thumbnail?id=1tLqTclwFt8PyB4IsQQzqQwX_TosNyMnW&sz=w500',
        buff: { type: 'TIME', value: 10, desc: 'Giảm 10% thời gian' }
    },

    // --- UNCOMMON (GREEN) 20 - 49 STARS ---
    {
        id: 'watering_can', name: 'Bình Tưới', emoji: '🚿', type: 'DECOR', currency: 'STAR', cost: 20,
        imageUrl: 'https://drive.google.com/thumbnail?id=1ysX5GSyAZ8IA34laMl3hkx4qegsBGliX&sz=w500',
        multiBuffs: [
            { type: 'TIME', value: 12, desc: '-12% Thời gian' },
            { type: 'YIELD', value: 5, desc: '5% Tỷ lệ x2 Nông sản' }
        ]
    },
    {
        id: 'mouse', name: 'Chuột Đồng', emoji: '🐁', type: 'DECOR', currency: 'STAR', cost: 20,
        imageUrl: 'https://drive.google.com/thumbnail?id=1Q38-oxgTTEcbADPF3zdalMLaFisvak9P&sz=w500',
        multiBuffs: [
            { type: 'EXP', value: 12, desc: '+12% Kinh nghiệm' },
            { type: 'COIN', value: 5, desc: '+5% Giá bán' }
        ]
    },
    {
        id: 'ladybug', name: 'Bọ Cánh Cam', emoji: '🐞', type: 'DECOR', currency: 'STAR', cost: 22,
        imageUrl: 'https://drive.google.com/thumbnail?id=1q0cOgsjY7XMGLDizBXcjDGlLY07YfiB-&sz=w500',
        multiBuffs: [
            { type: 'PEST', value: 25, desc: 'Giảm 25% sâu bệnh' },
            { type: 'YIELD', value: 5, desc: '5% Tỷ lệ x2 Nông sản' }
        ]
    },
    {
        id: 'sheers', name: 'Kéo Tỉa', emoji: '✂️', type: 'DECOR', currency: 'STAR', cost: 25,
        imageUrl: 'https://drive.google.com/thumbnail?id=1p-bEXuaMgO0eAUY4IrD7TmGZZBht5o0r&sz=w500',
        multiBuffs: [
            { type: 'EXP', value: 15, desc: '+15% Kinh nghiệm' },
            { type: 'TIME', value: 5, desc: '-5% Thời gian' }
        ]
    },
    {
        id: 'scythe', name: 'Lưỡi Hái', emoji: '🌾', type: 'DECOR', currency: 'STAR', cost: 28,
        imageUrl: 'https://drive.google.com/thumbnail?id=11mfhhzi969VAtka4hMvLI98NP1OQH9X7&sz=w500',
        multiBuffs: [
            { type: 'COIN', value: 15, desc: '+15% Giá bán' },
            { type: 'YIELD', value: 5, desc: '5% Tỷ lệ x2 Nông sản' }
        ]
    },
    {
        id: 'rake', name: 'Cào Lớn', emoji: '🧹', type: 'DECOR', currency: 'STAR', cost: 30,
        imageUrl: 'https://drive.google.com/thumbnail?id=133g3TXzWG6t9xAk2kYLu_B-PejpISA7q&sz=w500',
        multiBuffs: [
            { type: 'TIME', value: 15, desc: '-15% Thời gian' },
            { type: 'EXP', value: 5, desc: '+5% Kinh nghiệm' }
        ]
    },
    {
        id: 'axe', name: 'Rìu', emoji: '🪓', type: 'DECOR', currency: 'STAR', cost: 35,
        imageUrl: 'https://drive.google.com/thumbnail?id=1LmqqQLmn55ofA5ZbqjmYDakxwf464VyB&sz=w500',
        multiBuffs: [
            { type: 'EXP', value: 20, desc: '+20% Kinh nghiệm' },
            { type: 'COIN', value: 5, desc: '+5% Giá bán' }
        ]
    },
    {
        id: 'saw', name: 'Cưa Gỗ', emoji: '🪚', type: 'DECOR', currency: 'STAR', cost: 40,
        imageUrl: 'https://drive.google.com/thumbnail?id=1J8pK8ScZficISIGm7BV0eXNl7OXoRQIW&sz=w500',
        multiBuffs: [
            { type: 'EXP', value: 25, desc: '+25% Kinh nghiệm' },
            { type: 'TIME', value: 5, desc: '-5% Thời gian' }
        ]
    },
    {
        id: 'wheelbarrow', name: 'Xe Rùa', emoji: '🛒', type: 'DECOR', currency: 'STAR', cost: 45,
        imageUrl: 'https://drive.google.com/thumbnail?id=184jjzLYfgqiX_a3sNMQp7Rglafpuk1M0&sz=w500',
        multiBuffs: [
            { type: 'TIME', value: 20, desc: '-20% Thời gian' },
            { type: 'YIELD', value: 10, desc: '10% Tỷ lệ x2 Nông sản' }
        ]
    },

    // --- RARE (BLUE) 50 - 99 STARS ---
    {
        id: 'mulch', name: 'Bao Phân Bón', emoji: '💩', type: 'DECOR', currency: 'STAR', cost: 50,
        imageUrl: 'https://drive.google.com/thumbnail?id=1Jy25JGxzPl-DsNvX1_jxNCb7SQoVOizI&sz=w500',
        multiBuffs: [
            { type: 'TIME', value: 25, desc: '-25% Thời gian' },
            { type: 'EXP', value: 10, desc: '+10% Kinh nghiệm' }
        ]
    },
    {
        id: 'pickaxe', name: 'Cuốc Chim', emoji: '⛏️', type: 'DECOR', currency: 'STAR', cost: 55,
        imageUrl: 'https://drive.google.com/thumbnail?id=1ZFLFyFxIgdP1eocJ2GqkUnjp6bI39URr&sz=w500',
        multiBuffs: [
            { type: 'EXP', value: 30, desc: '+30% Kinh nghiệm' },
            { type: 'COIN', value: 10, desc: '+10% Giá bán' }
        ]
    },
    {
        id: 'harpy_statue', name: 'Tượng Đại Bàng', emoji: '🦅', type: 'DECOR', currency: 'STAR', cost: 60,
        imageUrl: 'https://drive.google.com/thumbnail?id=1SHyHvU0iL6S5Frkgq0mM-KQOyUwUyp1N&sz=w500', 
        multiBuffs: [
            { type: 'EXP', value: 15, desc: '+15% XP' },
            { type: 'TIME', value: 15, desc: '-15% Thời gian' }
        ]
    },
    {
        id: 'basket', name: 'Giỏ Đựng', emoji: '🧺', type: 'DECOR', currency: 'STAR', cost: 60,
        imageUrl: 'https://drive.google.com/thumbnail?id=1d2qaq5ZDMlPtN9glY0rPkU07gX4AAVNg&sz=w500',
        multiBuffs: [
            { type: 'COIN', value: 20, desc: '+20% Giá bán' },
            { type: 'YIELD', value: 10, desc: '10% Tỷ lệ x2 Nông sản' }
        ]
    },
    {
        id: 'rabbit', name: 'Thỏ Con', emoji: '🐇', type: 'DECOR', currency: 'STAR', cost: 65,
        imageUrl: 'https://drive.google.com/thumbnail?id=1OsGv_tE6qPXg4OgKa6uBr4KMCHW8jrns&sz=w500',
        multiBuffs: [
            { type: 'COIN', value: 25, desc: '+25% Giá bán' },
            { type: 'PEST', value: 20, desc: 'Giảm 20% sâu bệnh' }
        ]
    },
    {
        id: 'pesticide', name: 'Thuốc Trừ Sâu', emoji: '☠️', type: 'DECOR', currency: 'STAR', cost: 70,
        imageUrl: 'https://drive.google.com/thumbnail?id=1iLVhnKaZDNiBBS_WBAdp9p9fhmsMUyRa&sz=w500',
        multiBuffs: [
            { type: 'PEST', value: 50, desc: 'Giảm 50% sâu bệnh' },
            { type: 'YIELD', value: 10, desc: '10% Tỷ lệ x2 Nông sản' }
        ]
    },
    {
        id: 'bee', name: 'Ong Mật', emoji: '🐝', type: 'DECOR', currency: 'STAR', cost: 80,
        imageUrl: 'https://drive.google.com/thumbnail?id=1CW5gal1rZ5003ds2wZlegQD_k1yxQ1h5&sz=w500',
        multiBuffs: [
            { type: 'COIN', value: 30, desc: '+30% Giá bán' },
            { type: 'YIELD', value: 15, desc: '15% Tỷ lệ x2 Nông sản' }
        ]
    },
    {
        id: 'gorgon_statue', name: 'Tượng Xà Nữ', emoji: '🐍', type: 'DECOR', currency: 'STAR', cost: 85,
        imageUrl: 'https://drive.google.com/thumbnail?id=1SW-rHJQWaPEGiSQcAP-CjmRuYaObI4sF&sz=w500',
        multiBuffs: [
            { type: 'PEST', value: 50, desc: 'Giảm 50% sâu bệnh' },
            { type: 'YIELD', value: 15, desc: '15% Tỷ lệ x2 Nông sản' }
        ]
    },

    // --- EPIC (PURPLE) 100 - 249 STARS ---
    {
        id: 'dragon_statue', name: 'Tượng Rồng Thần', emoji: '🐉', type: 'DECOR', currency: 'STAR', cost: 100,
        imageUrl: 'https://drive.google.com/thumbnail?id=1jsJUmOmSvKPOf16m2u60MLjhZRWVG-SR&sz=w500', 
        multiBuffs: [
            { type: 'YIELD', value: 20, desc: '20% Tỷ lệ x2 Nông sản' },
            { type: 'COIN', value: 20, desc: '+20% Giá bán' },
            { type: 'PEST', value: 30, desc: 'Giảm 30% sâu bệnh' }
        ]
    },
    {
        id: 'mummy_guard', name: 'Xác Ướp Ai Cập', emoji: '🧟', type: 'DECOR', currency: 'STAR', cost: 120,
        imageUrl: 'https://drive.google.com/thumbnail?id=10hs1RSpGCIjqBOZkOkxIjs6l28Cfrhgc&sz=w500',
        multiBuffs: [
            { type: 'COIN', value: 25, desc: '+25% Giá bán' },
            { type: 'EXP', value: 25, desc: '+25% XP' },
            { type: 'PEST', value: 40, desc: 'Giảm 40% sâu bệnh' }
        ]
    },
    {
        id: 'angler_lantern', name: 'Đèn Lồng Biển Sâu', emoji: '🐟', type: 'DECOR', currency: 'STAR', cost: 180,
        imageUrl: 'https://drive.google.com/thumbnail?id=1rj90094F-dJGASfb21GuU4BPGf06t_Rr&sz=w500',
        multiBuffs: [
            { type: 'TIME', value: 20, desc: '-20% Thời gian' },
            { type: 'YIELD', value: 20, desc: '20% Tỷ lệ x2 Nông sản' },
            { type: 'COIN', value: 15, desc: '+15% Giá bán' }
        ]
    },

    // --- LEGENDARY (GOLD) 250 - 499 STARS ---
    {
        id: 'white_tiger', name: 'Bạch Hổ Thần', emoji: '🐯', type: 'DECOR', currency: 'STAR', cost: 300,
        imageUrl: 'https://drive.google.com/thumbnail?id=1LveDXwjxmWf6X5as9hc-6jZQR2OzLCzI&sz=w500',
        description: 'Linh thú bảo hộ phương Tây.',
        multiBuffs: [
            { type: 'YIELD', value: 30, desc: '30% Tỷ lệ x2 Nông sản' },
            { type: 'COIN', value: 40, desc: '+40% Giá bán' },
            { type: 'EXP', value: 30, desc: '+30% XP' }
        ]
    },
    {
        id: 'fire_dragon', name: 'Rồng Lửa', emoji: '🦎', type: 'DECOR', currency: 'STAR', cost: 400,
        imageUrl: 'https://drive.google.com/thumbnail?id=1N1kz76R9lR0U9ckZ-QIuslacQqh5931R&sz=w500',
        description: 'Sức mạnh hủy diệt mọi sâu bệnh.',
        multiBuffs: [
            { type: 'PEST', value: 80, desc: 'Giảm 80% sâu bệnh' },
            { type: 'TIME', value: 30, desc: '-30% Thời gian' },
            { type: 'COIN', value: 30, desc: '+30% Giá bán' }
        ]
    },
    {
        id: 'energy_cube', name: 'Khối Năng Lượng', emoji: '⚡', type: 'DECOR', currency: 'STAR', cost: 450,
        imageUrl: 'https://drive.google.com/thumbnail?id=1cVnvDjVA6xb69n00hO-RML8ghORjMPzd&sz=w500',
        description: 'Công nghệ tương lai thúc đẩy sản xuất.',
        multiBuffs: [
            { type: 'TIME', value: 45, desc: '-45% Thời gian' },
            { type: 'YIELD', value: 25, desc: '25% Tỷ lệ x2 Nông sản' },
            { type: 'EXP', value: 25, desc: '+25% XP' }
        ]
    },

    // --- MYTHIC (RED) 500+ STARS ---
    {
        id: 'treasure_mimic', name: 'Rương Kho Báu', emoji: '📦', type: 'DECOR', currency: 'STAR', cost: 600,
        imageUrl: 'https://drive.google.com/thumbnail?id=1tkTzHXgI8IT0bWPgVki_VaylKEresOOr&sz=w500',
        description: 'Chứa đựng sự giàu sang vô tận.',
        multiBuffs: [
            { type: 'COIN', value: 80, desc: '+80% Giá bán' },
            { type: 'YIELD', value: 35, desc: '35% Tỷ lệ x2 Nông sản' },
            { type: 'EXP', value: 40, desc: '+40% XP' },
            { type: 'TIME', value: 20, desc: '-20% Thời gian' }
        ]
    },
    {
        id: 'forest_fairy', name: 'Tiên Nữ Rừng Xanh', emoji: '🧚', type: 'DECOR', currency: 'STAR', cost: 800,
        imageUrl: 'https://drive.google.com/thumbnail?id=1v2tMcq1AOI80i5SvDT5oHNfgZ-dnAyQl&sz=w500',
        description: 'Ban phước lành cho vạn vật sinh sôi.',
        multiBuffs: [
            { type: 'YIELD', value: 60, desc: '60% Tỷ lệ x2 Nông sản' },
            { type: 'TIME', value: 35, desc: '-35% Thời gian' },
            { type: 'EXP', value: 50, desc: '+50% XP' },
            { type: 'PEST', value: 90, desc: 'Giảm 90% sâu bệnh' }
        ]
    },
    {
        id: 'djinn_lamp', name: 'Thần Đèn', emoji: '🧞', type: 'DECOR', currency: 'STAR', cost: 1000,
        imageUrl: 'https://drive.google.com/thumbnail?id=1jsJUmOmSvKPOf16m2u60MLjhZRWVG-SR&sz=w500',
        description: 'Quyền năng tối thượng thay đổi thực tại.',
        multiBuffs: [
            { type: 'TIME', value: 50, desc: '-50% Thời gian (Max)' },
            { type: 'COIN', value: 100, desc: '+100% Giá bán' },
            { type: 'YIELD', value: 50, desc: '50% Tỷ lệ x2 Nông sản' },
            { type: 'EXP', value: 100, desc: '+100% XP' }
        ]
    }
];

// --- MASSIVE ACHIEVEMENT GENERATION ---
// 10 Types x Many Tiers = Hundreds of Achievements
const generateAchievements = (): Mission[] => {
    const achievements: Mission[] = [];
    
    // Tiers for generic number scaling: [10, 25, 50, 100, 250, 500, 1000, ...]
    const generateTiers = (max: number) => {
        const tiers = [];
        let current = 10;
        while (current <= max) {
            tiers.push(current);
            if (current < 100) current += 15; // 10, 25, 40, 55...
            else if (current < 500) current += 50;
            else if (current < 2000) current += 250;
            else if (current < 10000) current += 1000;
            else if (current < 100000) current += 10000;
            else current += 100000;
        }
        return tiers;
    };

    // Helper to add a category of achievements
    const createCategory = (
        prefix: string,
        type: Mission['type'],
        titleTemplate: (n: number) => string,
        tiers: number[],
        baseRewardType: 'COIN' | 'STAR' | 'WATER' | 'FERTILIZER'
    ) => {
        tiers.forEach((target, index) => {
            // Reward Logic: 
            // Low tiers: Coins
            // High tiers: Stars (Every 5th tier or high numbers)
            let rType = baseRewardType;
            let amount = Math.floor(target / 10);

            if (index > 0 && index % 5 === 0) { // Every 5th tier gets Stars
                rType = 'STAR';
                amount = Math.max(5, Math.ceil(index / 2)); // 5, 6, 7... stars
            } else if (target >= 10000 && rType === 'COIN') {
                 // For huge coin targets, switch to stars to keep values sane
                 rType = 'STAR';
                 amount = 50 + Math.floor(target / 10000); 
            } else {
                 // Standard scaling
                 if (rType === 'COIN') amount = Math.max(100, target * 2);
                 if (rType === 'WATER' || rType === 'FERTILIZER') amount = Math.max(2, Math.ceil(target / 20));
            }

            achievements.push({
                id: `${prefix}_${target}`,
                desc: titleTemplate(target),
                type: type,
                category: 'ACHIEVEMENT',
                target: target,
                current: 0,
                reward: { type: rType, amount: amount },
                completed: false,
                claimed: false
            });
        });
    };

    // 1. HARVEST (Thu hoạch nông sản) - Up to 100,000 items
    createCategory('hv', 'HARVEST', (n) => `Thu hoạch ${n.toLocaleString()} nông sản`, generateTiers(100000), 'COIN');

    // 2. EARN (Kiếm xu) - Up to 10,000,000 coins
    createCategory('earn', 'EARN', (n) => `Kiếm tổng cộng ${n.toLocaleString()} xu`, generateTiers(5000000).map(n => n * 10), 'STAR'); // Scaled x10 for coins

    // 3. SPEND (Tiêu tiền - New) - Up to 10,000,000 coins
    createCategory('spend', 'EARN', (n) => `Tiêu ${n.toLocaleString()} xu mua sắm`, generateTiers(5000000).map(n => n * 10), 'FERTILIZER'); // Reusing EARN type for icon, but logic will track spending
    
    // 4. WATER (Tưới cây) - Up to 10,000 times
    createCategory('water', 'WATER', (n) => `Tưới cây ${n.toLocaleString()} lần`, generateTiers(10000), 'STAR');

    // 5. FEED (Cho ăn) - Up to 5,000 times
    createCategory('feed', 'FEED', (n) => `Cho vật nuôi ăn ${n.toLocaleString()} lần`, generateTiers(5000), 'COIN');

    // 6. FERTILIZE (Bón phân - New) - Up to 2,000 times
    createCategory('fert', 'FERTILIZE', (n) => `Dùng phân bón ${n.toLocaleString()} lần`, generateTiers(2000), 'WATER');

    // 7. QUIZ (Giải đố/Học tập) - Up to 5,000 correct answers
    createCategory('quiz', 'QUIZ', (n) => `Trả lời đúng ${n.toLocaleString()} câu hỏi`, generateTiers(5000), 'STAR');

    // 8. PLANT (Gieo hạt - New) - Up to 10,000 seeds
    // Reusing HARVEST type icon for planting visually
    createCategory('plant', 'HARVEST', (n) => `Gieo hạt ${n.toLocaleString()} lần`, generateTiers(10000), 'FERTILIZER');

    // 9. DELIVER (Giao hàng - New logic needed in code to track this specific metric, usually mapped to EARN in simple systems, but let's make it explicit)
    // We will track this via a new counter or reusing mission update logic
    createCategory('deliver', 'EARN', (n) => `Hoàn thành ${n.toLocaleString()} đơn hàng`, generateTiers(1000), 'STAR');

    // 10. LEVEL UP (Thăng cấp nông trại)
    // Custom tiers for levels: 2, 5, 10, 15, 20... up to 100
    const levelTiers = [];
    for(let i=2; i<=100; i+= (i<10?1: i<20?2 : 5)) levelTiers.push(i);
    
    createCategory('level', 'QUIZ', (n) => `Đạt cấp độ nông trại ${n}`, levelTiers, 'STAR');

    return achievements;
};

export const FARM_ACHIEVEMENTS_DATA: Mission[] = generateAchievements();

export const DAILY_MISSION_POOL: Mission[] = [
    // 80% STAR REWARDS
    { id: 'd_water_10', desc: 'Tưới cây 10 lần', type: 'WATER', category: 'DAILY', target: 10, current: 0, reward: { type: 'STAR', amount: 15 }, completed: false, claimed: false },
    { id: 'd_water_20', desc: 'Tưới cây 20 lần', type: 'WATER', category: 'DAILY', target: 20, current: 0, reward: { type: 'STAR', amount: 25 }, completed: false, claimed: false },
    { id: 'd_harvest_20', desc: 'Thu hoạch 20 nông sản', type: 'HARVEST', category: 'DAILY', target: 20, current: 0, reward: { type: 'STAR', amount: 20 }, completed: false, claimed: false },
    { id: 'd_harvest_50', desc: 'Thu hoạch 50 nông sản', type: 'HARVEST', category: 'DAILY', target: 50, current: 0, reward: { type: 'STAR', amount: 40 }, completed: false, claimed: false },
    { id: 'd_quiz_5', desc: 'Trả lời đúng 5 câu đố', type: 'QUIZ', category: 'DAILY', target: 5, current: 0, reward: { type: 'STAR', amount: 20 }, completed: false, claimed: false },
    { id: 'd_quiz_10', desc: 'Trả lời đúng 10 câu đố', type: 'QUIZ', category: 'DAILY', target: 10, current: 0, reward: { type: 'STAR', amount: 35 }, completed: false, claimed: false },
    { id: 'd_feed_10', desc: 'Cho vật nuôi ăn 10 lần', type: 'FEED', category: 'DAILY', target: 10, current: 0, reward: { type: 'STAR', amount: 30 }, completed: false, claimed: false },
    { id: 'd_feed_20', desc: 'Cho vật nuôi ăn 20 lần', type: 'FEED', category: 'DAILY', target: 20, current: 0, reward: { type: 'STAR', amount: 50 }, completed: false, claimed: false },
    { id: 'd_fertilize_5', desc: 'Bón phân 5 lần', type: 'FERTILIZE', category: 'DAILY', target: 5, current: 0, reward: { type: 'STAR', amount: 25 }, completed: false, claimed: false },
    { id: 'd_earn_2000', desc: 'Kiếm 2000 xu từ đơn hàng', type: 'EARN', category: 'DAILY', target: 2000, current: 0, reward: { type: 'STAR', amount: 30 }, completed: false, claimed: false },
    { id: 'd_earn_5000', desc: 'Kiếm 5000 xu từ đơn hàng', type: 'EARN', category: 'DAILY', target: 5000, current: 0, reward: { type: 'STAR', amount: 50 }, completed: false, claimed: false },
    
    // 20% OTHER REWARDS (BUT HIGH VALUE)
    { id: 'd_water_5', desc: 'Tưới cây 5 lần', type: 'WATER', category: 'DAILY', target: 5, current: 0, reward: { type: 'COIN', amount: 500 }, completed: false, claimed: false },
    { id: 'd_plant_20', desc: 'Trồng 20 cây mới', type: 'HARVEST', category: 'DAILY', target: 20, current: 0, reward: { type: 'FERTILIZER', amount: 5 }, completed: false, claimed: false },
    { id: 'd_feed_5', desc: 'Cho vật nuôi ăn 5 lần', type: 'FEED', category: 'DAILY', target: 5, current: 0, reward: { type: 'COIN', amount: 300 }, completed: false, claimed: false },
];
