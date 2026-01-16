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
import { Settings as SettingsIcon, Coins, Zap, Map as MapIcon, Sprout, Gamepad2, UserCircle2, Backpack, ArrowLeft, Plus } from 'lucide-react';
import { Avatar } from './components/Avatar';

// TABS - Redefined: Shop and Barn are now inside Farm
type Tab = 'FARM' | 'LEARN' | 'GAME' | 'PROFILE';

const DEFAULT_USER_STATE: UserState = {
  grade: null,
  textbook: null,
  coins: 500,
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
  livestockSlots: [],
  machineSlots: [],
  inventory: {
      'carrot': 2, 
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
        const saved = localStorage.getItem('turtle_english_state_v2'); 
        return saved ? JSON.parse(saved) : DEFAULT_USER_STATE;
      } catch (e) {
        return DEFAULT_USER_STATE;
      }
  });
  
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
      <div className="h-screen w-full bg-[#E0F7FA] overflow-hidden font-sans text-slate-800 flex flex-col relative" onClick={initAudio}>
          
          {/* HEADER */}
          <div className="bg-white/90 backdrop-blur-md px-4 py-3 flex justify-between items-center shadow-md z-30 sticky top-0 rounded-b-3xl mx-2 mt-1">
              <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 bg-yellow-400 text-white px-3 py-1.5 rounded-full border-b-4 border-yellow-600 shadow-sm btn-jelly select-none">
                      <Coins size={18} fill="currentColor"/>
                      <span className="font-black text-sm">{userState.coins}</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-blue-400 text-white px-3 py-1.5 rounded-full border-b-4 border-blue-600 shadow-sm btn-jelly select-none">
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

          {/* MAIN CONTENT AREA - PB-28 to clear Floating Nav */}
          <div className="flex-1 w-full h-full overflow-hidden relative">
              
              {/* TAB 1: LEARN (Map) */}
              {currentTab === 'LEARN' && (
                  <MapScreen 
                      levels={getLevels(userState.grade, userState.textbook)} 
                      unlockedLevels={userState.unlockedLevels}
                      completedLevels={userState.completedLevels}
                      levelStars={userState.levelStars}
                      onStartLevel={handleStartLevel}
                  />
              )}

              {/* TAB 2: FARM (Home Hub for all farm activities) */}
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

              {/* TAB 3: GAME (Arcade) */}
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

              {/* TAB 4: PROFILE (Avatar & Settings Placeholder) */}
              {currentTab === 'PROFILE' && (
                  <div className="h-full bg-indigo-50 flex flex-col items-center p-6 pb-28 animate-fadeIn overflow-y-auto">
                      <div className="w-full max-w-sm bg-white rounded-[2.5rem] p-6 shadow-xl border-4 border-white mb-6 text-center">
                          <div className="mx-auto mb-4 scale-125"><Avatar emoji={currentAvatar.emoji} bgGradient={currentAvatar.bgGradient} size="lg" animate /></div>
                          <h2 className="text-2xl font-black text-slate-800">{userState.settings.userName || 'Bé Yêu'}</h2>
                          <p className="text-slate-400 font-bold text-sm">Lớp {userState.grade}</p>
                      </div>
                      
                      <div className="w-full max-w-sm">
                          <h3 className="font-black text-slate-600 mb-3 uppercase tracking-wider text-xs px-2">Bộ Sưu Tập (Sắp ra mắt)</h3>
                          <div className="grid grid-cols-3 gap-3">
                              {AVATARS.map(avatar => (
                                  <button key={avatar.id} onClick={() => setUserState(prev => ({...prev, currentAvatarId: avatar.id}))} className={`p-4 rounded-2xl border-b-4 flex flex-col items-center gap-2 transition-all active:scale-95 ${userState.currentAvatarId === avatar.id ? 'bg-indigo-100 border-indigo-300 ring-2 ring-indigo-400' : 'bg-white border-slate-200 opacity-60 grayscale hover:opacity-100 hover:grayscale-0'}`}>
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

          {showSettings && <Settings userState={userState} onUpdateSettings={(s) => setUserState(prev => ({...prev, settings: s}))} onResetData={() => { localStorage.removeItem('turtle_english_state_v2'); window.location.reload(); }} onClose={() => setShowSettings(false)} />}
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
        {active && <span className="text-[10px] font-black mt-1 absolute -bottom-6 bg-white/80 px-2 py-0.5 rounded-full shadow-sm whitespace-nowrap">{label}</span>}
    </button>
);
