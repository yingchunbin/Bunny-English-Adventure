
import { Crop, Decor, AnimalItem, Product, ProcessingRecipe, MachineItem, Mission } from '../types';

// ... (KEEP ALL EXISTING EXPORTS: CROPS, ANIMALS, MACHINES, RECIPES, PRODUCTS, DECORATIONS)
// I will rewrite the achievements generation logic at the bottom of the file completely.

export const CROPS: Crop[] = [
  // Basics
  { id: 'carrot', name: 'Cà rốt', emoji: '🥕', type: 'CROP', currency: 'COIN', cost: 10, sellPrice: 20, growthTime: 10, exp: 5, unlockReq: 0 }, 
  { id: 'wheat', name: 'Lúa mì', emoji: '🌾', type: 'CROP', currency: 'COIN', cost: 15, sellPrice: 35, growthTime: 30, exp: 10, unlockReq: 1 }, 
  { id: 'corn', name: 'Bắp ngô', emoji: '🌽', type: 'CROP', currency: 'COIN', cost: 25, sellPrice: 55, growthTime: 60, exp: 15, unlockReq: 2 },
  { id: 'tomato', name: 'Cà chua', emoji: '🍅', type: 'CROP', currency: 'COIN', cost: 40, sellPrice: 90, growthTime: 120, exp: 25, unlockReq: 3 },
  { id: 'potato', name: 'Khoai tây', emoji: '🥔', type: 'CROP', currency: 'COIN', cost: 30, sellPrice: 70, growthTime: 90, exp: 20, unlockReq: 2 },
  { id: 'cabbage', name: 'Bắp cải', emoji: '🥬', type: 'CROP', currency: 'COIN', cost: 35, sellPrice: 80, growthTime: 100, exp: 22, unlockReq: 3 },
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
        id: 'gloves', name: 'Găng Tay', emoji: '🧤', type: 'DECOR', currency: 'STAR', cost: 4,
        imageUrl: 'https://drive.google.com/thumbnail?id=1k41o4Z8R4M45a6VjFfX5u5r4f_6a2t6s&sz=w500',
        buff: { type: 'EXP', value: 2, desc: '+2% EXP' }
    },
    {
        id: 'bucket', name: 'Xô Nước', emoji: '🪣', type: 'DECOR', currency: 'STAR', cost: 5,
        imageUrl: 'https://drive.google.com/thumbnail?id=1l0x2b4c6d8e0f1g3h5i7j9k0l1m2n3o&sz=w500', // Mock ID
        buff: { type: 'TIME', value: 4, desc: 'Giảm 4% thời gian' }
    },
    {
        id: 'sign', name: 'Biển Gỗ', emoji: '🪵', type: 'DECOR', currency: 'STAR', cost: 8,
        imageUrl: 'https://drive.google.com/thumbnail?id=1p2q3r4s5t6u7v8w9x0y1z2a3b4c5d6e&sz=w500', // Mock ID
        buff: { type: 'EXP', value: 3, desc: '+3% EXP' }
    },

    // --- RARE (GREEN) 20 - 50 STARS ---
    {
        id: 'watering_can', name: 'Bình Tưới', emoji: '🚿', type: 'DECOR', currency: 'STAR', cost: 20,
        imageUrl: 'https://drive.google.com/thumbnail?id=1jK4g2s3d5f6h7j8k9l0m1n2o3p4q5r&sz=w500', // Mock ID
        buff: { type: 'TIME', value: 8, desc: 'Giảm 8% thời gian' }
    },
    {
        id: 'scarecrow', name: 'Bù Nhìn', emoji: '🧟', type: 'DECOR', currency: 'STAR', cost: 25,
        imageUrl: 'https://drive.google.com/thumbnail?id=1s2t3u4v5w6x7y8z9a0b1c2d3e4f5g&sz=w500', // Mock ID
        buff: { type: 'PEST', value: 10, desc: '-10% Sâu bệnh' }
    },
    {
        id: 'wheelbarrow', name: 'Xe Cút Kít', emoji: '🛒', type: 'DECOR', currency: 'STAR', cost: 30,
        imageUrl: 'https://drive.google.com/thumbnail?id=1h2i3j4k5l6m7n8o9p0q1r2s3t4u5v&sz=w500', // Mock ID
        buff: { type: 'EXP', value: 5, desc: '+5% EXP' }
    },
    {
        id: 'birdhouse', name: 'Tổ Chim', emoji: '🏠', type: 'DECOR', currency: 'STAR', cost: 35,
        imageUrl: 'https://drive.google.com/thumbnail?id=1w2x3y4z5a6b7c8d9e0f1g2h3i4j5k&sz=w500', // Mock ID
        buff: { type: 'PEST', value: 15, desc: '-15% Sâu bệnh' }
    },
    {
        id: 'flower_pot', name: 'Chậu Hoa', emoji: '🪴', type: 'DECOR', currency: 'STAR', cost: 40,
        imageUrl: 'https://drive.google.com/thumbnail?id=1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z&sz=w500', // Mock ID
        buff: { type: 'YIELD', value: 5, desc: '5% Tỷ lệ x2 Nông sản' }
    },

    // --- QUY HIEM (BLUE) 50 - 100 STARS ---
    {
        id: 'fountain', name: 'Đài Phun Nước', emoji: '⛲', type: 'DECOR', currency: 'STAR', cost: 50,
        imageUrl: 'https://drive.google.com/thumbnail?id=1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o&sz=w500', // Mock ID
        buff: { type: 'TIME', value: 12, desc: 'Giảm 12% thời gian' }
    },
    {
        id: 'lamp_post', name: 'Đèn Đường', emoji: '💡', type: 'DECOR', currency: 'STAR', cost: 60,
        imageUrl: 'https://drive.google.com/thumbnail?id=1p2q3r4s5t6u7v8w9x0y1z2a3b4c5d&sz=w500', // Mock ID
        buff: { type: 'EXP', value: 8, desc: '+8% EXP' }
    },
    {
        id: 'windmill_decor', name: 'Cối Xay Gió Nhỏ', emoji: '🌬️', type: 'DECOR', currency: 'STAR', cost: 80,
        imageUrl: 'https://drive.google.com/thumbnail?id=1e2f3g4h5i6j7k8l9m0n1o2p3q4r5s&sz=w500', // Mock ID
        buff: { type: 'COIN', value: 5, desc: '+5% Giá bán' }
    },
    {
        id: 'tractor_decor', name: 'Máy Cày Cổ', emoji: '🚜', type: 'DECOR', currency: 'STAR', cost: 90,
        imageUrl: 'https://drive.google.com/thumbnail?id=1t2u3v4w5x6y7z8a9b0c1d2e3f4g5h&sz=w500', // Mock ID
        multiBuffs: [
            { type: 'TIME', value: 10, desc: '-10% Thời gian' },
            { type: 'EXP', value: 5, desc: '+5% EXP' }
        ]
    },

    // --- SU THI (PURPLE) 100 - 250 STARS ---
    {
        id: 'greenhouse', name: 'Nhà Kính', emoji: '🏚️', type: 'DECOR', currency: 'STAR', cost: 120,
        imageUrl: 'https://drive.google.com/thumbnail?id=1i2j3k4l5m6n7o8p9q0r1s2t3u4v5w&sz=w500', // Mock ID
        multiBuffs: [
            { type: 'TIME', value: 15, desc: '-15% Thời gian' },
            { type: 'PEST', value: 20, desc: '-20% Sâu bệnh' }
        ]
    },
    {
        id: 'lucky_cat', name: 'Mèo Thần Tài', emoji: '🐱', type: 'DECOR', currency: 'STAR', cost: 150,
        imageUrl: 'https://drive.google.com/thumbnail?id=1x2y3z4a5b6c7d8e9f0g1h2i3j4k5l&sz=w500', // Mock ID
        buff: { type: 'COIN', value: 15, desc: '+15% Giá bán' }
    },
    {
        id: 'statue_gnome', name: 'Tượng Thần Lùn', emoji: '🗿', type: 'DECOR', currency: 'STAR', cost: 200,
        imageUrl: 'https://drive.google.com/thumbnail?id=1m2n3o4p5q6r7s8t9u0v1w2x3y4z5a&sz=w500', // Mock ID
        multiBuffs: [
            { type: 'YIELD', value: 10, desc: '10% Tỷ lệ x2 Nông sản' },
            { type: 'EXP', value: 10, desc: '+10% EXP' }
        ]
    },

    // --- HUYEN THOAI (YELLOW) 250 - 500 STARS ---
    {
        id: 'tree_of_life', name: 'Cây Sinh Mệnh', emoji: '🌳', type: 'DECOR', currency: 'STAR', cost: 300,
        imageUrl: 'https://drive.google.com/thumbnail?id=1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p&sz=w500', // Mock ID
        multiBuffs: [
            { type: 'TIME', value: 20, desc: '-20% Thời gian' },
            { type: 'PEST', value: 50, desc: '-50% Sâu bệnh' },
            { type: 'EXP', value: 15, desc: '+15% EXP' }
        ]
    },
    {
        id: 'golden_silo', name: 'Kho Vàng', emoji: '🏯', type: 'DECOR', currency: 'STAR', cost: 400,
        imageUrl: 'https://drive.google.com/thumbnail?id=1q2r3s4t5u6v7w8x9y0z1a2b3c4d5e&sz=w500', // Mock ID
        multiBuffs: [
            { type: 'COIN', value: 25, desc: '+25% Giá bán' },
            { type: 'YIELD', value: 15, desc: '15% Tỷ lệ x2 Nông sản' }
        ]
    },

    // --- THAN THOAI (RED) 500+ STARS ---
    {
        id: 'dragon_statue', name: 'Tượng Rồng Thần', emoji: '🐲', type: 'DECOR', currency: 'STAR', cost: 600,
        imageUrl: 'https://drive.google.com/thumbnail?id=1f2g3h4i5j6k7l8m9n0o1p2q3r4s5t&sz=w500', // Mock ID
        description: 'Tăng sức mạnh toàn diện cho nông trại.',
        multiBuffs: [
            { type: 'TIME', value: 25, desc: '-25% Thời gian' },
            { type: 'COIN', value: 30, desc: '+30% Giá bán' },
            { type: 'EXP', value: 30, desc: '+30% EXP' },
            { type: 'PEST', value: 80, desc: '-80% Sâu bệnh' }
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

// --- MASSIVE ACHIEVEMENT GENERATOR ---
const generateMassiveAchievements = (): Mission[] => {
    const list: Mission[] = [];
    
    // 10 Categories x 50 Levels = 500 Achievements
    const categories = [
        { id: 'HARVEST', name: 'Thu hoạch Nông Sản', action: 'thu hoạch', unit: 'lần', base: 10, multiplier: 1.2 },
        { id: 'FEED', name: 'Chăm sóc Vật Nuôi', action: 'cho ăn', unit: 'lần', base: 10, multiplier: 1.2 },
        { id: 'WATER', name: 'Tưới Cây', action: 'tưới nước', unit: 'lần', base: 20, multiplier: 1.2 },
        { id: 'PLANT', name: 'Gieo Hạt', action: 'gieo hạt', unit: 'lần', base: 20, multiplier: 1.2 },
        { id: 'FERTILIZE', name: 'Bón Phân', action: 'bón phân', unit: 'lần', base: 5, multiplier: 1.3 }, // Harder
        { id: 'BUY', name: 'Mua Sắm', action: 'mua vật phẩm', unit: 'món', base: 5, multiplier: 1.2 },
        { id: 'SELL', name: 'Bán Hàng', action: 'bán vật phẩm', unit: 'món', base: 10, multiplier: 1.2 },
        { id: 'EARN', name: 'Tích Lũy Xu', action: 'kiếm', unit: 'xu', base: 1000, multiplier: 1.25 }, // Harder scaling for money
        { id: 'QUIZ', name: 'Học Tập', action: 'trả lời đúng', unit: 'câu đố', base: 5, multiplier: 1.15 },
        { id: 'LEARN', name: 'Tiến Độ Bài Học', action: 'hoàn thành', unit: 'bài học', base: 1, multiplier: 1.1 } // Very slow scaling
    ];

    categories.forEach(cat => {
        let currentTarget = cat.base;
        
        for (let level = 1; level <= 50; level++) {
            // Round target to nice numbers (e.g. 12 -> 10, 125 -> 120)
            let roundedTarget = Math.floor(currentTarget);
            if (roundedTarget > 100) roundedTarget = Math.floor(roundedTarget / 10) * 10;
            if (roundedTarget > 1000) roundedTarget = Math.floor(roundedTarget / 100) * 100;

            // Calculate Reward
            // Coins = Level * 50
            // Stars = Level (Every 5 levels get bonus)
            // Fertilizer = Every 10 levels
            
            const coins = Math.max(100, level * 50);
            let stars = Math.ceil(level / 2);
            if (level % 5 === 0) stars += 5; // Bonus stars every 5 levels
            
            const rewards: any[] = [
                { type: 'COIN', amount: coins },
                { type: 'STAR', amount: stars }
            ];

            if (level % 10 === 0) {
                rewards.push({ type: 'FERTILIZER', amount: Math.floor(level / 5) });
                rewards.push({ type: 'WATER', amount: level });
            }

            list.push({
                id: `ach_${cat.id}_${level}`,
                desc: `${cat.name} ${level}: ${cat.action} ${roundedTarget.toLocaleString()} ${cat.unit}`,
                type: cat.id as any,
                category: 'ACHIEVEMENT',
                target: roundedTarget,
                current: 0,
                completed: false,
                claimed: false,
                rewards: rewards
            });

            // Increment target for next level
            currentTarget = currentTarget * cat.multiplier;
        }
    });

    return list;
};

export const FARM_ACHIEVEMENTS_DATA: Mission[] = generateMassiveAchievements();

export const DAILY_MISSION_POOL: Mission[] = [
    { id: 'd_water_5', desc: 'Tưới cây 5 lần', type: 'WATER', category: 'DAILY', target: 5, current: 0, rewards: [{ type: 'COIN', amount: 50 }], completed: false, claimed: false },
    { id: 'd_water_10', desc: 'Tưới cây 10 lần', type: 'WATER', category: 'DAILY', target: 10, current: 0, rewards: [{ type: 'STAR', amount: 1 }], completed: false, claimed: false },
    { id: 'd_harvest_10', desc: 'Thu hoạch 10 nông sản', type: 'HARVEST', category: 'DAILY', target: 10, current: 0, rewards: [{ type: 'COIN', amount: 100 }], completed: false, claimed: false },
    { id: 'd_harvest_20', desc: 'Thu hoạch 20 nông sản', type: 'HARVEST', category: 'DAILY', target: 20, current: 0, rewards: [{ type: 'STAR', amount: 2 }], completed: false, claimed: false },
    { id: 'd_quiz_3', desc: 'Trả lời đúng 3 câu đố', type: 'QUIZ', category: 'DAILY', target: 3, current: 0, rewards: [{ type: 'STAR', amount: 1 }], completed: false, claimed: false },
    { id: 'd_quiz_5', desc: 'Trả lời đúng 5 câu đố', type: 'QUIZ', category: 'DAILY', target: 5, current: 0, rewards: [{ type: 'STAR', amount: 3 }], completed: false, claimed: false },
    { id: 'd_feed_5', desc: 'Cho vật nuôi ăn 5 lần', type: 'FEED', category: 'DAILY', target: 5, current: 0, rewards: [{ type: 'COIN', amount: 80 }], completed: false, claimed: false },
    { id: 'd_feed_10', desc: 'Cho vật nuôi ăn 10 lần', type: 'FEED', category: 'DAILY', target: 10, current: 0, rewards: [{ type: 'STAR', amount: 1 }], completed: false, claimed: false },
    { id: 'd_fertilize_2', desc: 'Bón phân 2 lần', type: 'FERTILIZE', category: 'DAILY', target: 2, current: 0, rewards: [{ type: 'STAR', amount: 1 }], completed: false, claimed: false },
    { id: 'd_earn_500', desc: 'Kiếm 500 xu từ đơn hàng', type: 'EARN', category: 'DAILY', target: 500, current: 0, rewards: [{ type: 'FERTILIZER', amount: 2 }], completed: false, claimed: false },
    { id: 'd_earn_1000', desc: 'Kiếm 1000 xu từ đơn hàng', type: 'EARN', category: 'DAILY', target: 1000, current: 0, rewards: [{ type: 'STAR', amount: 2 }], completed: false, claimed: false },
    { id: 'd_plant_10', desc: 'Trồng 10 cây mới', type: 'HARVEST', category: 'DAILY', target: 10, current: 0, rewards: [{ type: 'WATER', amount: 5 }], completed: false, claimed: false },
];
