import React, { useState, useEffect } from 'react';
import { UserState, LessonLevel } from './types';
import { Onboarding } from './components/Onboarding';
import { MapScreen } from './components/MapScreen';
import { Farm } from './components/Farm';
import { Settings } from './components/Settings';
import { TimeAttackGame } from './components/TimeAttackGame';
import { LessonGuide } from './components/LessonGuide';
import { FlashcardGame } from './components/FlashcardGame';
import { TranslationGame } from './components/TranslationGame';
import { SpeakingGame } from './components/SpeakingGame';
import { getLevels, LEVELS } from './constants';
import { playSFX, initAudio, playBGM, setVolumes } from './utils/sound';
import { Settings as SettingsIcon, Coins, Zap, Map as MapIcon, Sprout, Gamepad2, ShoppingBag, Backpack, ArrowLeft, Plus } from 'lucide-react';
import { ShopModal } from './components/farm/ShopModal';
import { BarnModal } from './components/farm/BarnModal';
import { CROPS, DECORATIONS, PRODUCTS } from './data/farmData';

// TABS
type Tab = 'FARM' | 'LEARN' | 'GAME' | 'SHOP' | 'BARN';

const DEFAULT_USER_STATE: UserState = {
  grade: null,
  textbook: null,
  coins: 500, // Starting coins
  currentAvatarId: 'bunny',
  completedLevels: [],
  levelStars: {},
  unlockedLevels: [],
  streak: 0,
  lastLoginDate: null,
  unlockedAchievements: [],
  lessonGuides: {},
  farmPlots: [
      { id: 1, isUnlocked: true, cropId: null, plantedAt: null },
      { id: 2, isUnlocked: true, cropId: null, plantedAt: null }, // Start with 2 plots
      { id: 3, isUnlocked: false, cropId: null, plantedAt: null },
      { id: 4, isUnlocked: false, cropId: null, plantedAt: null },
      { id: 5, isUnlocked: false, cropId: null, plantedAt: null },
      { id: 6, isUnlocked: false, cropId: null, plantedAt: null },
  ],
  livestockSlots: [],
  machineSlots: [],
  inventory: {
      'carrot': 2, // Free seeds
      'wheat': 2
  },
  harvestedCrops: {},
  fertilizers: 1,
  waterDrops: 10,
  settings: {
      bgmVolume: 0.3,
      sfxVolume: 0.8,
      lowPerformance: false
  }
};

export default function App() {
  const [userState, setUserState] = useState<UserState>(() => {
      try {
        const saved = localStorage.getItem('turtle_english_state_v2'); // Versioned storage
        return saved ? JSON.parse(saved) : DEFAULT_USER_STATE;
      } catch (e) {
        return DEFAULT_USER_STATE;
      }
  });
  
  // Navigation State - Default to LEARN for focus
  const [currentTab, setCurrentTab] = useState<Tab>('LEARN');
  const [activeLevel, setActiveLevel] = useState<LessonLevel | null>(null);
  const [gameStep, setGameStep] = useState<'GUIDE' | 'FLASHCARD' | 'TRANSLATION' | 'SPEAKING'>('FLASHCARD');
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
      localStorage.setItem('turtle_english_state_v2', JSON.stringify(userState));
  }, [userState]);

  useEffect(() => {
      setVolumes(userState.settings.sfxVolume, userState.settings.bgmVolume);
      playBGM(true);
  }, [userState.settings]);

  // --- LOGIC HANDLERS ---

  const handleOnboardingComplete = (grade: number, textbookId: string) => {
    setUserState(prev => ({ ...prev, grade, textbook: textbookId }));
    setCurrentTab('LEARN');
    playSFX('success');
  };

  const handleStartLevel = (levelId: number) => {
      const level = LEVELS.find(l => l.id === levelId);
      if (level) {
          setActiveLevel(level);
          // Determine starting step based on level content
          if (level.words.length > 0) setGameStep('FLASHCARD');
          else if (level.sentences.length > 0) setGameStep('TRANSLATION');
          else setGameStep('GUIDE');
          playSFX('click');
      }
  };

  const handleLevelComplete = (bonusCoins: number) => {
      if (!activeLevel) return;
      
      setUserState(prev => {
          const newCompleted = prev.completedLevels.includes(activeLevel.id) ? prev.completedLevels : [...prev.completedLevels, activeLevel.id];
          
          // Logic: Unlock next level
          const levels = getLevels(prev.grade, prev.textbook);
          const idx = levels.findIndex(l => l.id === activeLevel.id);
          const nextLevel = levels[idx + 1];
          let newUnlocked = prev.unlockedLevels;
          if (nextLevel && !newUnlocked.includes(nextLevel.id)) {
              newUnlocked = [...newUnlocked, nextLevel.id];
          }

          // Rewards: 100 Coins + 5 Water Drops per lesson
          return {
              ...prev,
              coins: prev.coins + bonusCoins + 100,
              waterDrops: prev.waterDrops + 5,
              completedLevels: newCompleted,
              unlockedLevels: newUnlocked,
              streak: prev.streak + 1
          };
      });
      setActiveLevel(null);
      playSFX('success');
  };

  const handleShopBuy = (item: any, amount: number) => {
      const totalCost = item.cost * amount;
      if (userState.coins >= totalCost) {
          if (item.type === 'CROP') {
              setUserState(prev => ({ 
                  ...prev, 
                  coins: prev.coins - totalCost, 
                  inventory: { ...prev.inventory, [item.id]: (prev.inventory[item.id] || 0) + amount } 
              }));
          } else {
              setUserState(prev => ({ 
                  ...prev, 
                  coins: prev.coins - totalCost, 
                  decorations: [...(prev.decorations || []), item.id] 
              }));
          }
          playSFX('success');
      } else {
          playSFX('wrong');
          alert("Bé không đủ tiền rồi! Hãy học thêm bài học nhé.");
      }
  };

  const handleSell = (itemId: string, amount: number, price: number) => {
      if ((userState.harvestedCrops?.[itemId] || 0) >= amount) {
          setUserState(prev => ({
              ...prev,
              coins: prev.coins + (price * amount),
              harvestedCrops: { ...prev.harvestedCrops, [itemId]: (prev.harvestedCrops?.[itemId] || 0) - amount }
          }));
          playSFX('success');
      }
  };

  // --- RENDERERS ---

  if (!userState.grade) {
      return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  // --- FULLSCREEN LEARNING MODE (No Tabs) ---
  if (activeLevel) {
      return (
          <div className="h-screen w-full bg-white flex flex-col">
              <div className="px-4 py-3 flex items-center justify-between bg-white border-b-2 border-slate-100 z-50">
                  <button onClick={() => setActiveLevel(null)} className="p-2 bg-slate-100 rounded-xl text-slate-500 hover:bg-slate-200 transition-colors">
                      <ArrowLeft size={24}/>
                  </button>
                  <div className="flex flex-col items-center">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Đang học</span>
                      <h2 className="font-black text-slate-700 text-lg leading-none">{activeLevel.title.split(':')[0]}</h2>
                  </div>
                  <div className="w-10"></div>
              </div>
              
              <div className="flex-1 overflow-hidden relative bg-slate-50">
                  {gameStep === 'FLASHCARD' && <FlashcardGame words={activeLevel.words} onComplete={() => setGameStep('TRANSLATION')} />}
                  {gameStep === 'TRANSLATION' && <TranslationGame sentences={activeLevel.sentences} onComplete={() => setGameStep('SPEAKING')} />}
                  {gameStep === 'SPEAKING' && <SpeakingGame words={activeLevel.words} onComplete={(coins) => { setUserState(prev => ({...prev, coins: prev.coins + coins})); setGameStep('GUIDE'); }} />}
                  {gameStep === 'GUIDE' && <LessonGuide level={activeLevel} userState={userState} onUpdateState={setUserState} onComplete={() => handleLevelComplete(0)} />}
              </div>
          </div>
      );
  }

  // --- MAIN TAB INTERFACE ---
  return (
      <div className="h-screen w-full bg-[#E0F7FA] overflow-hidden font-sans text-slate-800 flex flex-col relative" onClick={initAudio}>
          
          {/* TOP HEADER (Global Resources) */}
          <div className="bg-white/90 backdrop-blur-md px-4 py-3 flex justify-between items-center shadow-md z-30 sticky top-0 rounded-b-3xl mx-2 mt-1">
              <div className="flex items-center gap-2">
                  <div 
                    onClick={() => setCurrentTab('SHOP')}
                    className="flex items-center gap-1.5 bg-yellow-400 text-white px-3 py-1.5 rounded-full border-b-4 border-yellow-600 active:border-b-0 active:translate-y-1 transition-all cursor-pointer select-none shadow-sm btn-jelly"
                  >
                      <Coins size={18} fill="currentColor"/>
                      <span className="font-black text-sm">{userState.coins}</span>
                      <div className="bg-white text-yellow-500 rounded-full p-0.5 ml-1"><Plus size={10} strokeWidth={4}/></div>
                  </div>
                  <div className="flex items-center gap-1.5 bg-blue-400 text-white px-3 py-1.5 rounded-full border-b-4 border-blue-600 select-none shadow-sm btn-jelly">
                      <Zap size={18} fill="currentColor"/>
                      <span className="font-black text-sm">{userState.waterDrops}</span>
                  </div>
              </div>
              
              <div className="flex items-center gap-2">
                  <div className="bg-white px-3 py-1.5 rounded-full border-2 border-slate-100 text-slate-500 text-xs font-black shadow-sm">
                      🔥 {userState.streak}
                  </div>
                  <button onClick={() => setShowSettings(true)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors">
                      <SettingsIcon size={24}/>
                  </button>
              </div>
          </div>

          {/* MAIN CONTENT AREA */}
          <div className="flex-1 w-full h-full overflow-hidden relative">
              
              {/* TAB 1: LEARN (Map) - Default */}
              {currentTab === 'LEARN' && (
                  <MapScreen 
                      levels={getLevels(userState.grade, userState.textbook)} 
                      unlockedLevels={userState.unlockedLevels}
                      completedLevels={userState.completedLevels}
                      levelStars={userState.levelStars}
                      onStartLevel={handleStartLevel}
                  />
              )}

              {/* TAB 2: FARM (Simulation) */}
              {currentTab === 'FARM' && (
                  <Farm 
                      userState={userState} 
                      onUpdateState={setUserState} 
                      onExit={() => {}} 
                      allWords={[]} 
                      levels={[]} 
                      onNavigate={(target) => {}} 
                      onShowAchievements={() => {}}
                  />
              )}

              {/* TAB 3: GAME (Mini-games) */}
              {currentTab === 'GAME' && (
                  <div className="h-full w-full bg-slate-900 relative flex flex-col">
                      <TimeAttackGame 
                          words={LEVELS.flatMap(l => l.words)}
                          onComplete={(score) => {
                              setUserState(prev => ({ ...prev, coins: prev.coins + score }));
                              // Optionally stay on game screen or go back
                          }}
                          onExit={() => setCurrentTab('LEARN')}
                      />
                  </div>
              )}

              {/* TAB 4: SHOP */}
              {currentTab === 'SHOP' && (
                  <div className="h-full bg-[#FFF5F5] flex flex-col p-4"> 
                      <ShopModal 
                          crops={CROPS} 
                          decorations={DECORATIONS} 
                          userState={userState} 
                          onBuySeed={(c, a) => handleShopBuy(c, a)} 
                          onBuyDecor={(d) => handleShopBuy(d, 1)} 
                          onClose={() => {}} 
                          inline={true} 
                      />
                  </div>
              )}

              {/* TAB 5: BARN (Inventory) */}
              {currentTab === 'BARN' && (
                  <div className="h-full bg-[#F0FDF4] flex flex-col p-4"> 
                      <BarnModal 
                          crops={[...CROPS, ...PRODUCTS]} 
                          harvested={userState.harvestedCrops || {}} 
                          activeOrders={userState.activeOrders || []}
                          onSell={(id) => {
                              const item = [...CROPS, ...PRODUCTS].find(i => i.id === id);
                              if (item) handleSell(id, 1, item.sellPrice);
                          }}
                          onSellAll={(id) => {}}
                          onSellEverything={() => {}}
                          onClose={() => {}}
                          inline={true}
                      />
                  </div>
              )}
          </div>

          {/* FLOATING NAVIGATION BAR */}
          <div className="absolute bottom-6 left-4 right-4 bg-white rounded-[2rem] px-2 py-3 shadow-2xl border-2 border-white z-40 flex justify-around items-center ring-4 ring-black/5">
                  <NavButton active={currentTab === 'LEARN'} icon={MapIcon} label="Học Tập" onClick={() => setCurrentTab('LEARN')} color="text-blue-500" bgColor="bg-blue-100" />
                  <NavButton active={currentTab === 'FARM'} icon={Sprout} label="Nông Trại" onClick={() => setCurrentTab('FARM')} color="text-green-500" bgColor="bg-green-100" />
                  <NavButton active={currentTab === 'GAME'} icon={Gamepad2} label="Trò Chơi" onClick={() => setCurrentTab('GAME')} color="text-purple-500" bgColor="bg-purple-100" />
                  <NavButton active={currentTab === 'SHOP'} icon={ShoppingBag} label="Cửa Hàng" onClick={() => setCurrentTab('SHOP')} color="text-pink-500" bgColor="bg-pink-100" />
                  <NavButton active={currentTab === 'BARN'} icon={Backpack} label="Kho Đồ" onClick={() => setCurrentTab('BARN')} color="text-amber-500" bgColor="bg-amber-100" />
          </div>

          {showSettings && <Settings userState={userState} onUpdateSettings={(s) => setUserState(prev => ({...prev, settings: s}))} onResetData={() => { localStorage.removeItem('turtle_english_state_v2'); window.location.reload(); }} onClose={() => setShowSettings(false)} />}
      </div>
  );
}

const NavButton = ({ active, icon: Icon, label, onClick, color, bgColor }: any) => (
    <button 
        onClick={onClick}
        className={`flex flex-col items-center justify-center w-14 h-14 rounded-2xl transition-all duration-300 ${active ? `${bgColor} ${color} -translate-y-4 scale-110 shadow-lg` : 'text-slate-300 hover:text-slate-400'}`}
    >
        <Icon 
            size={24} 
            strokeWidth={active ? 3 : 2.5}
            fill={active ? "currentColor" : "none"} 
            fillOpacity={0.2}
        />
        {active && <span className="text-[9px] font-black mt-1">{label}</span>}
    </button>
);
