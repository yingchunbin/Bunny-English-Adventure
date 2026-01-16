import React, { useState, useEffect } from 'react';
import { Screen, UserState, Mission, LessonLevel } from './types';
import { Onboarding } from './components/Onboarding';
import { MapScreen } from './components/MapScreen';
import { Farm } from './components/Farm';
import { Settings } from './components/Settings';
import { AIChat } from './components/AIChat';
import { TimeAttackGame } from './components/TimeAttackGame';
import { Achievements } from './components/Achievements';
import { LessonGuide } from './components/LessonGuide';
import { FlashcardGame } from './components/FlashcardGame';
import { TranslationGame } from './components/TranslationGame';
import { SpeakingGame } from './components/SpeakingGame';
import { getLevels, LEVELS } from './constants';
import { playSFX, initAudio, playBGM, setVolumes } from './utils/sound';
import { Settings as SettingsIcon, Coins, Zap, Sprout, BookOpen, Swords, ShoppingBag, Backpack, Map as MapIcon } from 'lucide-react';
import { ShopModal } from './components/farm/ShopModal';
import { BarnModal } from './components/farm/BarnModal';
import { CROPS, DECORATIONS, PRODUCTS } from './data/farmData';

// Tab Definitions
type Tab = 'FARM' | 'SCHOOL' | 'ARENA' | 'SHOP' | 'BAG';

const DEFAULT_USER_STATE: UserState = {
  grade: null,
  textbook: null,
  coins: 100,
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
      { id: 2, isUnlocked: false, cropId: null, plantedAt: null },
      { id: 3, isUnlocked: false, cropId: null, plantedAt: null },
      { id: 4, isUnlocked: false, cropId: null, plantedAt: null },
      { id: 5, isUnlocked: false, cropId: null, plantedAt: null },
      { id: 6, isUnlocked: false, cropId: null, plantedAt: null },
  ],
  livestockSlots: [],
  machineSlots: [],
  inventory: {},
  harvestedCrops: {},
  fertilizers: 3,
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
        const saved = localStorage.getItem('turtle_english_state');
        return saved ? JSON.parse(saved) : DEFAULT_USER_STATE;
      } catch (e) {
        return DEFAULT_USER_STATE;
      }
  });
  
  // Navigation State
  const [currentTab, setCurrentTab] = useState<Tab>('FARM');
  const [isFullScreen, setIsFullScreen] = useState(false); // Controls if tabs are hidden (e.g. inside a game)
  const [activeLevel, setActiveLevel] = useState<LessonLevel | null>(null);
  const [gameStep, setGameStep] = useState<'GUIDE' | 'FLASHCARD' | 'TRANSLATION' | 'SPEAKING'>('FLASHCARD');
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
      localStorage.setItem('turtle_english_state', JSON.stringify(userState));
  }, [userState]);

  useEffect(() => {
      setVolumes(userState.settings.sfxVolume, userState.settings.bgmVolume);
      playBGM(!isFullScreen); // Stop BGM during intense games if needed, or keep it.
  }, [userState.settings, isFullScreen]);

  // --- HANDLERS ---

  const handleOnboardingComplete = (grade: number, textbookId: string) => {
    setUserState(prev => ({ ...prev, grade, textbook: textbookId }));
    setCurrentTab('FARM');
    playSFX('success');
  };

  const handleStartLevel = (levelId: number) => {
      const level = LEVELS.find(l => l.id === levelId);
      if (level) {
          setActiveLevel(level);
          if (level.words.length > 0) setGameStep('FLASHCARD');
          else if (level.sentences.length > 0) setGameStep('TRANSLATION');
          else setGameStep('GUIDE');
          
          setIsFullScreen(true); // Enter Game Mode
          playSFX('click');
      }
  };

  const handleLevelComplete = (bonusCoins: number) => {
      if (!activeLevel) return;
      const stars = 3; 
      setUserState(prev => {
          const newCompleted = prev.completedLevels.includes(activeLevel.id) ? prev.completedLevels : [...prev.completedLevels, activeLevel.id];
          const newStars = Math.max(prev.levelStars[activeLevel.id] || 0, stars);
          
          const levels = getLevels(prev.grade, prev.textbook);
          const idx = levels.findIndex(l => l.id === activeLevel.id);
          const nextLevel = levels[idx + 1];
          let newUnlocked = prev.unlockedLevels;
          if (nextLevel && !newUnlocked.includes(nextLevel.id)) {
              newUnlocked = [...newUnlocked, nextLevel.id];
          }

          return {
              ...prev,
              coins: prev.coins + bonusCoins + 50,
              completedLevels: newCompleted,
              levelStars: { ...prev.levelStars, [activeLevel.id]: newStars },
              unlockedLevels: newUnlocked,
              streak: prev.streak + 1
          };
      });
      setIsFullScreen(false); // Return to Tabs
      setActiveLevel(null);
      playSFX('success');
  };

  const handleShopBuy = (item: any, amount: number) => {
      // Mock buy logic, simplified for demo
      if (item.type === 'CROP') {
          setUserState(prev => ({ 
              ...prev, 
              coins: prev.coins - (item.cost * amount), 
              inventory: { ...prev.inventory, [item.id]: (prev.inventory[item.id] || 0) + amount } 
          }));
      } else {
          setUserState(prev => ({ 
              ...prev, 
              coins: prev.coins - item.cost, 
              decorations: [...(prev.decorations || []), item.id] 
          }));
      }
      playSFX('success');
  };

  // --- RENDERERS ---

  const renderContent = () => {
      switch (currentTab) {
          case 'FARM':
              return (
                  <Farm 
                      userState={userState} 
                      onUpdateState={setUserState} 
                      onExit={() => {}} 
                      allWords={LEVELS.flatMap(l => l.words)}
                      levels={getLevels(userState.grade, userState.textbook)}
                      onNavigate={(target) => { 
                          if(target === 'MAP') setCurrentTab('SCHOOL');
                          if(target === 'TIME_ATTACK') setCurrentTab('ARENA');
                      }}
                      onShowAchievements={() => {}}
                  />
              );
          case 'SCHOOL':
              return (
                  <div className="h-full w-full bg-[#FFF9F0] relative">
                      <div className="absolute top-0 left-0 w-full p-4 z-10 bg-[#FFF9F0]/90 backdrop-blur-sm border-b-2 border-orange-100">
                          <h2 className="text-xl font-black text-orange-600 text-center uppercase">Bản đồ học tập</h2>
                      </div>
                      <div className="pt-16 pb-24 h-full">
                        <MapScreen 
                            levels={getLevels(userState.grade, userState.textbook)} 
                            unlockedLevels={userState.unlockedLevels}
                            completedLevels={userState.completedLevels}
                            levelStars={userState.levelStars}
                            onStartLevel={handleStartLevel}
                        />
                      </div>
                  </div>
              );
          case 'ARENA':
              return (
                  <div className="h-full flex flex-col bg-slate-100 pb-20">
                      <div className="bg-white p-4 shadow-sm border-b-2 border-slate-200">
                          <h2 className="text-xl font-black text-slate-700 text-center uppercase">Khu Vui Chơi</h2>
                      </div>
                      <div className="p-4 grid gap-4">
                          <button onClick={() => setIsFullScreen(true)} className="card-flat p-6 flex items-center gap-4 bg-purple-50 border-purple-100 hover:border-purple-300 transition-all active:scale-95">
                              <div className="w-16 h-16 bg-purple-500 rounded-2xl flex items-center justify-center text-3xl shadow-md">⏱️</div>
                              <div className="text-left">
                                  <h3 className="font-black text-lg text-purple-700">Thử Thách Tốc Độ</h3>
                                  <p className="text-xs text-purple-500 font-bold">Trả lời nhanh để ghi điểm!</p>
                              </div>
                          </button>
                          <div className="card-flat p-6 flex items-center gap-4 bg-blue-50 border-blue-100 opacity-60">
                              <div className="w-16 h-16 bg-blue-400 rounded-2xl flex items-center justify-center text-3xl shadow-md grayscale">🤖</div>
                              <div className="text-left">
                                  <h3 className="font-black text-lg text-blue-700">Đấu với AI</h3>
                                  <p className="text-xs text-blue-500 font-bold">Sắp ra mắt...</p>
                              </div>
                          </div>
                      </div>
                  </div>
              );
          case 'SHOP':
              return (
                  <div className="h-full bg-[#FFF9F0] pb-24 pt-4 px-4 overflow-hidden flex flex-col">
                      <h2 className="text-xl font-black text-orange-600 text-center mb-4 uppercase">Cửa Hàng</h2>
                      <div className="flex-1 bg-white rounded-[2rem] border-2 border-orange-100 overflow-hidden shadow-inner">
                          {/* Reusing ShopModal content logic but inline */}
                          <ShopModal 
                              crops={CROPS} 
                              decorations={DECORATIONS} 
                              userState={userState} 
                              onBuySeed={(c, a) => handleShopBuy(c, a)} 
                              onBuyDecor={(d) => handleShopBuy(d, 1)} 
                              onClose={() => {}} 
                              inline={true} // New prop to handle inline rendering
                          />
                      </div>
                  </div>
              );
          case 'BAG':
              return (
                  <div className="h-full bg-[#FFF9F0] pb-24 pt-4 px-4 overflow-hidden flex flex-col">
                      <h2 className="text-xl font-black text-green-600 text-center mb-4 uppercase">Kho Đồ</h2>
                      <div className="flex-1 bg-white rounded-[2rem] border-2 border-green-100 overflow-hidden shadow-inner">
                          <BarnModal 
                              crops={[...CROPS, ...PRODUCTS]} 
                              harvested={userState.harvestedCrops || {}} 
                              activeOrders={userState.activeOrders || []}
                              onSell={(id) => {}} // Simple mock
                              onSellAll={(id) => {}}
                              onSellEverything={() => {}}
                              onClose={() => {}}
                              inline={true}
                          />
                      </div>
                  </div>
              );
      }
  };

  // --- FULL SCREEN GAME RENDER ---
  if (!userState.grade) {
      return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  if (isFullScreen) {
      if (activeLevel) {
          return (
              <div className="h-screen w-full bg-white flex flex-col">
                  <div className="p-4 flex items-center justify-between bg-slate-50 border-b-2 border-slate-200">
                      <button onClick={() => setIsFullScreen(false)} className="btn-flat btn-white px-4 py-2 text-xs rounded-xl">Thoát</button>
                      <h2 className="font-black text-slate-700">{activeLevel.title}</h2>
                      <div className="w-12"></div>
                  </div>
                  <div className="flex-1 overflow-hidden relative">
                      {gameStep === 'FLASHCARD' && <FlashcardGame words={activeLevel.words} onComplete={() => setGameStep('TRANSLATION')} />}
                      {gameStep === 'TRANSLATION' && <TranslationGame sentences={activeLevel.sentences} onComplete={() => setGameStep('SPEAKING')} />}
                      {gameStep === 'SPEAKING' && <SpeakingGame words={activeLevel.words} onComplete={(coins) => { setUserState(prev => ({...prev, coins: prev.coins + coins})); setGameStep('GUIDE'); }} />}
                      {gameStep === 'GUIDE' && <LessonGuide level={activeLevel} userState={userState} onUpdateState={setUserState} onComplete={() => handleLevelComplete(0)} />}
                  </div>
              </div>
          );
      }
      // Time Attack Case
      if (currentTab === 'ARENA') {
          return (
              <TimeAttackGame 
                  words={LEVELS.flatMap(l => l.words)}
                  onComplete={(score) => {
                      setUserState(prev => ({ ...prev, coins: prev.coins + score }));
                      setIsFullScreen(false);
                  }}
                  onExit={() => setIsFullScreen(false)}
              />
          );
      }
  }

  return (
      <div className="h-screen w-full bg-[#FFF9F0] overflow-hidden font-sans text-slate-800 flex flex-col relative" onClick={initAudio}>
          
          {/* TOP HUD (Pill Style) */}
          <div className="absolute top-4 left-4 right-4 z-50 flex justify-between pointer-events-none">
              <div className="flex gap-2 pointer-events-auto">
                  <div className="flex items-center gap-1 bg-white pl-2 pr-3 py-1 rounded-full border-2 border-slate-100 shadow-sm">
                      <Coins size={16} className="text-yellow-500 fill-yellow-500"/>
                      <span className="font-black text-slate-700 text-sm">{userState.coins}</span>
                  </div>
                  <div className="flex items-center gap-1 bg-white pl-2 pr-3 py-1 rounded-full border-2 border-slate-100 shadow-sm">
                      <Zap size={16} className="text-blue-500 fill-blue-500"/>
                      <span className="font-black text-slate-700 text-sm">{userState.fertilizers}</span>
                  </div>
              </div>
              <button onClick={() => setShowSettings(true)} className="pointer-events-auto bg-white p-2 rounded-full border-2 border-slate-100 shadow-sm text-slate-400 active:scale-95 transition-transform">
                  <SettingsIcon size={20}/>
              </button>
          </div>

          {/* MAIN CONTENT AREA */}
          <div className="flex-1 w-full h-full overflow-hidden">
              {renderContent()}
          </div>

          {/* BOTTOM NAVIGATION BAR (Sticky Footer) */}
          <div className="fixed bottom-6 left-4 right-4 h-20 bg-white rounded-[2rem] shadow-xl border border-slate-100 flex items-center justify-around z-40 px-2">
              <NavButton icon={<Sprout />} label="Nông Trại" active={currentTab === 'FARM'} onClick={() => setCurrentTab('FARM')} color="text-green-500" />
              <NavButton icon={<MapIcon />} label="Học Tập" active={currentTab === 'SCHOOL'} onClick={() => setCurrentTab('SCHOOL')} color="text-blue-500" />
              <NavButton icon={<Swords />} label="Đấu Trường" active={currentTab === 'ARENA'} onClick={() => setCurrentTab('ARENA')} color="text-purple-500" />
              <NavButton icon={<ShoppingBag />} label="Cửa Hàng" active={currentTab === 'SHOP'} onClick={() => setCurrentTab('SHOP')} color="text-orange-500" />
              <NavButton icon={<Backpack />} label="Kho Đồ" active={currentTab === 'BAG'} onClick={() => setCurrentTab('BAG')} color="text-amber-500" />
          </div>

          {showSettings && <Settings userState={userState} onUpdateSettings={(s) => setUserState(prev => ({...prev, settings: s}))} onResetData={() => {}} onClose={() => setShowSettings(false)} />}
      </div>
  );
}

// Sub-component for Nav Button
const NavButton = ({ icon, label, active, onClick, color }: any) => (
    <button 
        onClick={onClick}
        className={`flex flex-col items-center justify-center w-16 h-full transition-all duration-300 relative ${active ? '-translate-y-6' : 'hover:-translate-y-1'}`}
    >
        <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-sm transition-all duration-300 ${active ? `bg-white border-4 border-${color.split('-')[1]}-100 scale-125 shadow-lg` : 'bg-transparent'}`}>
            {React.cloneElement(icon, { 
                size: active ? 24 : 24, 
                className: active ? color : 'text-slate-300',
                strokeWidth: 2.5
            })}
        </div>
        {active && (
            <span className={`text-[10px] font-black uppercase tracking-wide mt-1 animate-fadeIn ${color}`}>{label}</span>
        )}
    </button>
);
