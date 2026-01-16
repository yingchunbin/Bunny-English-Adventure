
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
import { getLevels, LEVELS, AVATARS } from './constants';
import { playSFX, initAudio, playBGM, setVolumes } from './utils/sound';
import { Settings as SettingsIcon, Coins, Zap, Map as MapIcon, Sprout, Gamepad2, UserCircle2, ShoppingBag, Warehouse, ArrowLeft, Plus } from 'lucide-react';
import { Avatar } from './components/Avatar';
import { Achievements } from './components/Achievements';
import { ShopModal } from './components/farm/ShopModal';
import { BarnModal } from './components/farm/BarnModal';
import { CROPS, ANIMALS, MACHINES, DECORATIONS, PRODUCTS } from './data/farmData';

// TABS
type Tab = 'FARM' | 'LEARN' | 'GAME' | 'PROFILE';

const DEFAULT_USER_STATE: UserState = {
  grade: null,
  textbook: null,
  coins: 1000, // Start with more coins for fun
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
      { id: 2, isUnlocked: true, cropId: null, plantedAt: null },
      { id: 3, isUnlocked: false, cropId: null, plantedAt: null },
      { id: 4, isUnlocked: false, cropId: null, plantedAt: null },
      { id: 5, isUnlocked: false, cropId: null, plantedAt: null },
      { id: 6, isUnlocked: false, cropId: null, plantedAt: null },
  ],
  livestockSlots: [
      { id: 1, isUnlocked: true, animalId: null, fedAt: null },
      { id: 2, isUnlocked: true, animalId: null, fedAt: null },
      { id: 3, isUnlocked: false, animalId: null, fedAt: null },
      { id: 4, isUnlocked: false, animalId: null, fedAt: null },
  ],
  machineSlots: [
      { id: 1, isUnlocked: true, machineId: null, activeRecipeId: null, startedAt: null },
      { id: 2, isUnlocked: true, machineId: null, activeRecipeId: null, startedAt: null },
      { id: 3, isUnlocked: false, machineId: null, activeRecipeId: null, startedAt: null },
      { id: 4, isUnlocked: false, machineId: null, activeRecipeId: null, startedAt: null },
  ],
  inventory: {
      'carrot': 5, 
      'wheat': 5
  },
  harvestedCrops: {},
  fertilizers: 3,
  waterDrops: 20,
  settings: {
      bgmVolume: 0.3,
      sfxVolume: 0.8,
      lowPerformance: false
  }
};

export default function App() {
  const [userState, setUserState] = useState<UserState>(() => {
      try {
        const saved = localStorage.getItem('bunny_english_state_v3'); 
        return saved ? JSON.parse(saved) : DEFAULT_USER_STATE;
      } catch (e) {
        return DEFAULT_USER_STATE;
      }
  });
  
  const [currentTab, setCurrentTab] = useState<Tab>('LEARN');
  const [activeLevel, setActiveLevel] = useState<LessonLevel | null>(null);
  const [gameStep, setGameStep] = useState<'GUIDE' | 'FLASHCARD' | 'TRANSLATION' | 'SPEAKING'>('FLASHCARD');
  const [showSettings, setShowSettings] = useState(false);
  
  // Modals lifted to App level for Header access
  const [showShop, setShowShop] = useState(false);
  const [showBarn, setShowBarn] = useState(false);
  const [showAchievements, setShowAchievements] = useState<'LEARNING' | 'FARM' | null>(null);

  useEffect(() => {
      localStorage.setItem('bunny_english_state_v3', JSON.stringify(userState));
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
          const levels = getLevels(prev.grade, prev.textbook);
          const idx = levels.findIndex(l => l.id === activeLevel.id);
          const nextLevel = levels[idx + 1];
          let newUnlocked = prev.unlockedLevels;
          if (nextLevel && !newUnlocked.includes(nextLevel.id)) {
              newUnlocked = [...newUnlocked, nextLevel.id];
          }

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

  // --- RENDERERS ---

  if (!userState.grade) {
      return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  // --- FULLSCREEN LEARNING MODE ---
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

  const currentAvatar = AVATARS.find(a => a.id === userState.currentAvatarId) || AVATARS[0];

  return (
      <div className="h-screen w-full bg-[#F0F9FF] overflow-hidden font-sans text-slate-800 flex flex-col relative" onClick={initAudio}>
          
          {/* HEADER (Sticky) */}
          <div className="bg-white/90 backdrop-blur-md px-4 py-3 flex justify-between items-center shadow-sm z-30 sticky top-0 rounded-b-3xl mx-2 mt-1 border-b border-slate-100">
              <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 bg-yellow-400 text-white px-3 py-1.5 rounded-full border-b-4 border-yellow-500 shadow-sm btn-jelly select-none">
                      <Coins size={18} fill="currentColor"/>
                      <span className="font-black text-sm">{userState.coins}</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-blue-400 text-white px-3 py-1.5 rounded-full border-b-4 border-blue-500 shadow-sm btn-jelly select-none">
                      <Zap size={18} fill="currentColor"/>
                      <span className="font-black text-sm">{userState.waterDrops}</span>
                  </div>
              </div>
              
              {/* Farm Specific Header Actions */}
              {currentTab === 'FARM' && (
                  <div className="flex items-center gap-2 animate-fadeIn">
                      <button onClick={() => setShowShop(true)} className="p-2 bg-pink-100 text-pink-600 rounded-full hover:bg-pink-200 transition-colors">
                          <ShoppingBag size={20} />
                      </button>
                      <button onClick={() => setShowBarn(true)} className="p-2 bg-amber-100 text-amber-600 rounded-full hover:bg-amber-200 transition-colors">
                          <Warehouse size={20} />
                      </button>
                  </div>
              )}

              {/* Settings */}
              <div className="flex items-center gap-2">
                  {currentTab !== 'FARM' && (
                      <div className="bg-white px-3 py-1.5 rounded-full border-2 border-slate-100 text-slate-500 text-xs font-black shadow-sm">
                          🔥 {userState.streak}
                      </div>
                  )}
                  <button onClick={() => setShowSettings(true)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors">
                      <SettingsIcon size={24}/>
                  </button>
              </div>
          </div>

          {/* MAIN CONTENT AREA */}
          <div className="flex-1 w-full h-full overflow-hidden relative">
              
              {/* TAB 1: LEARN (Map) */}
              {currentTab === 'LEARN' && (
                  <>
                    <MapScreen 
                        levels={getLevels(userState.grade, userState.textbook)} 
                        unlockedLevels={userState.unlockedLevels}
                        completedLevels={userState.completedLevels}
                        levelStars={userState.levelStars}
                        onStartLevel={handleStartLevel}
                    />
                    {/* Floating Trophy on Map triggers Learning Achievements */}
                    <button 
                        className="absolute top-4 right-4 z-40 w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg border-2 border-white hover:scale-110 transition-transform active:scale-95"
                        onClick={() => setShowAchievements('LEARNING')}
                    >
                        <span className="text-xl">🏆</span>
                    </button>
                  </>
              )}

              {/* TAB 2: FARM */}
              {currentTab === 'FARM' && (
                  <Farm 
                      userState={userState} 
                      onUpdateState={setUserState} 
                      onExit={() => {}}
                  />
              )}

              {/* TAB 3: GAME */}
              {currentTab === 'GAME' && (
                  <div className="h-full w-full bg-slate-900 relative flex flex-col pb-28">
                      <TimeAttackGame 
                          words={LEVELS.flatMap(l => l.words)}
                          onComplete={(score) => {
                              setUserState(prev => ({ ...prev, coins: prev.coins + score }));
                          }}
                          onExit={() => setCurrentTab('LEARN')}
                      />
                  </div>
              )}

              {/* TAB 4: PROFILE */}
              {currentTab === 'PROFILE' && (
                  <div className="h-full bg-sky-50 flex flex-col items-center p-6 pb-28 animate-fadeIn overflow-y-auto">
                      <div className="w-full max-w-sm bg-white rounded-[2.5rem] p-6 shadow-xl border-4 border-white mb-6 text-center">
                          <div className="mx-auto mb-4 scale-125"><Avatar emoji={currentAvatar.emoji} bgGradient={currentAvatar.bgGradient} size="lg" animate /></div>
                          <h2 className="text-2xl font-black text-slate-800">{userState.settings.userName || 'Bé Yêu'}</h2>
                          <p className="text-slate-400 font-bold text-sm">Lớp {userState.grade}</p>
                      </div>
                      
                      <div className="w-full max-w-sm">
                          <h3 className="font-black text-slate-600 mb-3 uppercase tracking-wider text-xs px-2">Bộ Sưu Tập</h3>
                          <div className="grid grid-cols-3 gap-3">
                              {AVATARS.map(avatar => (
                                  <button key={avatar.id} onClick={() => setUserState(prev => ({...prev, currentAvatarId: avatar.id}))} className={`p-4 rounded-2xl border-b-4 flex flex-col items-center gap-2 transition-all active:scale-95 ${userState.currentAvatarId === avatar.id ? 'bg-sky-100 border-sky-300 ring-2 ring-sky-400' : 'bg-white border-slate-200 opacity-60 grayscale hover:opacity-100 hover:grayscale-0'}`}>
                                      <span className="text-3xl">{avatar.emoji}</span>
                                  </button>
                              ))}
                          </div>
                      </div>
                  </div>
              )}
          </div>

          {/* FLOATING NAVIGATION BAR */}
          <div className="absolute bottom-6 left-4 right-4 bg-white/95 backdrop-blur-xl rounded-[2.5rem] px-2 py-3 shadow-2xl border-2 border-white/50 z-40 flex justify-around items-center ring-4 ring-black/5">
                  <NavButton active={currentTab === 'LEARN'} icon={MapIcon} label="Học Tập" onClick={() => setCurrentTab('LEARN')} color="text-blue-500" bgColor="bg-blue-100" />
                  <NavButton active={currentTab === 'FARM'} icon={Sprout} label="Nông Trại" onClick={() => setCurrentTab('FARM')} color="text-green-600" bgColor="bg-green-100" />
                  <NavButton active={currentTab === 'GAME'} icon={Gamepad2} label="Trò Chơi" onClick={() => setCurrentTab('GAME')} color="text-purple-500" bgColor="bg-purple-100" />
                  <NavButton active={currentTab === 'PROFILE'} icon={UserCircle2} label="Hồ Sơ" onClick={() => setCurrentTab('PROFILE')} color="text-pink-500" bgColor="bg-pink-100" />
          </div>

          {/* GLOBAL MODALS */}
          {showSettings && <Settings userState={userState} onUpdateSettings={(s) => setUserState(prev => ({...prev, settings: s}))} onResetData={() => { localStorage.removeItem('bunny_english_state_v3'); window.location.reload(); }} onClose={() => setShowSettings(false)} />}
          
          {showShop && (
            <ShopModal 
                crops={CROPS} 
                animals={ANIMALS} 
                machines={MACHINES} 
                decorations={DECORATIONS} 
                userState={userState} 
                onBuyItem={(item, amount) => {
                    const cost = item.cost * amount;
                    if (userState.coins >= cost) {
                        setUserState(prev => {
                            const ns = { ...prev, coins: prev.coins - cost };
                            if (item.type === 'CROP') ns.inventory = { ...prev.inventory, [item.id]: (prev.inventory[item.id] || 0) + amount };
                            else if (item.type === 'DECOR') ns.decorations = [...(prev.decorations || []), item.id];
                            return ns;
                        });
                        playSFX('success');
                    } else {
                        playSFX('wrong');
                        alert("Không đủ tiền!");
                    }
                }} 
                onClose={() => setShowShop(false)} 
            />
          )}

          {showBarn && (
            <BarnModal 
                crops={[...CROPS, ...PRODUCTS]} 
                harvested={userState.harvestedCrops || {}} 
                activeOrders={[]}
                onSell={(id) => {
                    const item = [...CROPS, ...PRODUCTS].find(i => i.id === id);
                    if(item && (userState.harvestedCrops?.[id] || 0) > 0) {
                        setUserState(prev => ({
                            ...prev,
                            coins: prev.coins + item.sellPrice,
                            harvestedCrops: { ...prev.harvestedCrops, [id]: (prev.harvestedCrops?.[id] || 0) - 1 }
                        }));
                        playSFX('success');
                    }
                }}
                onSellAll={() => {}}
                onSellEverything={() => {}}
                onClose={() => setShowBarn(false)} 
            />
          )}

          {showAchievements && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
                  <div className="w-full max-w-md h-[80vh] bg-white rounded-3xl shadow-2xl overflow-hidden relative">
                      <Achievements userState={userState} onClose={() => setShowAchievements(null)} category={showAchievements} />
                  </div>
              </div>
          )}
      </div>
  );
}

const NavButton = ({ active, icon: Icon, label, onClick, color, bgColor }: any) => (
    <button 
        onClick={onClick}
        className={`flex flex-col items-center justify-center w-16 h-16 rounded-2xl transition-all duration-300 ${active ? `${bgColor} ${color} -translate-y-6 scale-110 shadow-xl border-4 border-white` : 'text-slate-400 hover:text-slate-600 active:scale-95'}`}
    >
        <Icon 
            size={active ? 28 : 24} 
            strokeWidth={active ? 3 : 2.5}
            fill={active ? "currentColor" : "none"} 
            fillOpacity={0.2}
        />
        {active && <span className="text-[10px] font-black mt-1 absolute -bottom-6 bg-white/90 px-2 py-0.5 rounded-full shadow-sm whitespace-nowrap backdrop-blur-sm">{label}</span>}
    </button>
);
