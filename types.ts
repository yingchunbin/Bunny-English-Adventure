
export enum Screen {
  ONBOARDING = 'ONBOARDING',
  HOME = 'HOME',
  MAP = 'MAP',
  GAME = 'GAME',
  CHAT = 'CHAT',
  FARM = 'FARM',
  SETTINGS = 'SETTINGS', 
  TIME_ATTACK = 'TIME_ATTACK',
}

export enum GameType {
  FLASHCARD = 'FLASHCARD',
  TRANSLATION = 'TRANSLATION',
  SPEAKING = 'SPEAKING',
}

export type LessonType = 'LESSON' | 'EXAM' | 'GAME';

export interface Word {
  id: string;
  english: string;
  vietnamese: string;
  pronunciation: string; 
  emoji?: string;
  color?: string;
  exampleEn: string;
  exampleVi: string;
}

export interface LessonLevel {
  id: number;
  grade: number; 
  textbookId?: string; 
  type: LessonType; 
  title: string;
  topic: string;
  isLocked: boolean;
  stars: number; 
  words: Word[];
  sentences: {
    en: string;
    vi: string; 
    scrambled: string[]; 
    scrambledEn: string[]; 
  }[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  condition: (state: UserState) => boolean;
  isUnlocked: boolean; 
  reward?: { type: 'COIN' | 'WATER' | 'FERTILIZER' | 'STAR', amount: number }; 
}

export type ItemType = 'CROP' | 'DECOR' | 'TOOL' | 'ANIMAL' | 'PRODUCT' | 'PROCESSED' | 'MACHINE';

export interface FarmItem {
  id: string;
  name: string;
  emoji: string;
  type: ItemType;
  description?: string;
  cost: number;
  currency: 'COIN' | 'STAR'; 
  minLevel?: number; 
}

export interface Crop extends FarmItem {
  type: 'CROP';
  sellPrice: number;
  growthTime: number; 
  exp: number;
  unlockReq: number; 
  isMagic?: boolean;
}

export interface AnimalItem extends FarmItem {
    type: 'ANIMAL';
    produceId: string; 
    produceTime: number; 
    feedCropId: string; 
    feedAmount: number;
    exp: number;
}

export interface Product extends FarmItem {
    type: 'PRODUCT' | 'PROCESSED';
    sellPrice: number;
}

export interface MachineItem extends FarmItem {
    type: 'MACHINE';
    unlockPrice: number; 
}

export interface ProcessingRecipe {
    id: string;
    machineId: string; 
    name: string;
    input: { id: string; amount: number }[]; 
    outputId: string; 
    duration: number; 
    exp: number;
}

export interface Decor extends FarmItem {
  type: 'DECOR';
  effect?: string; 
}

export interface FarmPlot {
  id: number;
  isUnlocked: boolean;
  cropId: string | null;
  plantedAt: number | null; 
  isWatered?: boolean; 
  hasWeed?: boolean; 
  hasBug?: boolean; 
  hasMysteryBox?: boolean; 
}

export interface LivestockSlot {
    id: number;
    isUnlocked: boolean;
    animalId: string | null;
    fedAt: number | null; 
    queue?: number; // Number of pre-paid feeds waiting in line
    storage?: string[]; // Array of product IDs ready to collect
    isReady?: boolean;
}

export interface MachineSlot {
    id: number;
    machineId: string | null; 
    isUnlocked: boolean;
    activeRecipeId: string | null;
    startedAt: number | null;
    queue?: string[]; // Array of recipeIds waiting in line
    storage?: string[]; // Array of recipeIds that are finished and waiting to be collected
    isReady?: boolean;
}

export interface FarmOrder {
  id: string;
  npcName: string; 
  requirements: { cropId: string; amount: number }[];
  rewardCoins: number;
  rewardExp: number;
  rewardStars?: number; // Added stars reward
  expiresAt: number; 
}

export interface Mission {
  id: string;
  desc: string;
  type: 'LEARN' | 'HARVEST' | 'EARN' | 'WATER' | 'FERTILIZE' | 'FEED' | 'QUIZ';
  category: 'DAILY' | 'ACHIEVEMENT';
  target: number;
  current: number;
  reward: { type: 'WATER' | 'FERTILIZER' | 'COIN' | 'STAR', amount: number };
  completed: boolean;
  claimed: boolean;
}

export interface UserSettings {
  bgmVolume: number; 
  sfxVolume: number; 
  lowPerformance: boolean; 
  userName?: string;
}

export interface UserState {
  grade: number | null;
  textbook: string | null;
  coins: number;
  stars: number; // Added Premium Currency
  currentAvatarId: string;
  completedLevels: number[];
  levelStars: Record<number, number>; 
  unlockedLevels: number[];
  streak: number; 
  lastLoginDate: string | null; 
  unlockedAchievements: string[];
  lessonGuides: Record<number, string>; 
  farmPlots: FarmPlot[];
  livestockSlots?: LivestockSlot[]; 
  machineSlots?: MachineSlot[]; 
  inventory: { [itemId: string]: number }; // Seeds & Items
  harvestedCrops?: { [itemId: string]: number }; // Harvested Products
  fertilizers: number; 
  waterDrops: number; 
  weather?: 'SUNNY' | 'RAINY'; 
  lastWeatherUpdate?: number; 
  decorations?: string[]; 
  
  farmLevel?: number;
  farmExp?: number;

  // Well System
  lastWellDate?: string;
  wellUsageCount?: number;

  missions?: Mission[];
  lastMissionUpdate?: string; // Track day for daily reset
  activeOrders?: FarmOrder[]; 
  settings: UserSettings; 
}

export interface AvatarItem {
  id: string;
  name: string;
  emoji: string;
  cost: number;
  bgGradient: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}
