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
import { Settings as SettingsIcon, MessageCircle, Gamepad2, ArrowLeft, Coins, Zap } from 'lucide-react';

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

const FARM_ACHIEVEMENTS: Mission[] = [
    { id: 'ach_harvest_100', desc: 'Thu hoạch 100 nông sản', type: 'HARVEST', category: 'ACHIEVEMENT', target: 100, current: 0, reward: { type: 'STAR', amount: 5 }, completed: false, claimed: false },
    { id: 'ach_earn_10000', desc: 'Kiếm 10.000 vàng', type: 'EARN', category: 'ACHIEVEMENT', target: 10000, current: 0, reward: { type: 'STAR', amount: 10 }, completed: false, claimed: false },
];

export default function App() {
  const [userState, setUserState] = useState<UserState>(() => {
      try {
        const saved = localStorage.getItem('turtle_english_state');
        return saved ? JSON.parse(saved) : DEFAULT_USER_STATE;
      } catch (e) {
        return DEFAULT_USER_STATE;
      }
  });
  
  // The FARM is now the HOME screen.
  const [screen, setScreen] = useState<Screen>(userState.grade ? Screen.FARM : Screen.ONBOARDING);
  const [activeLevel, setActiveLevel] = useState<LessonLevel | null>(null);
  const [gameStep, setGameStep] = useState<'GUIDE' | 'FLASHCARD' | 'TRANSLATION' | 'SPEAKING'>('FLASHCARD');
  
  const [showSettings, setShowSettings] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);

  useEffect(() => {
      localStorage.setItem('turtle_english_state', JSON.stringify(userState));
  }, [userState]);

  useEffect(() => {
      setVolumes(userState.settings.sfxVolume, userState.settings.bgmVolume);
      const shouldPlayBGM = [Screen.HOME, Screen.FARM, Screen.MAP, Screen.SHOP].includes(screen);
      playBGM(shouldPlayBGM);
  }, [userState.settings, screen]);

  const handleOnboardingComplete = (grade: number, textbookId: string) => {
    const levels = getLevels(grade, textbookId);
    const startId = levels[0]?.id; 
    
    const initialMissions: Mission[] = userState.missions && userState.missions.length > 0 ? userState.missions : [
        { id: 'm0', desc: 'Hoàn thành bài học mới', type: 'LEARN', category: 'DAILY', target: 1, current: 0, reward: { type: 'COIN', amount: 100 }, completed: false, claimed: false },
        { id: 'm1', desc: 'Thu hoạch 5 nông sản', type: 'HARVEST', category: 'DAILY', target: 5, current: 0, reward: { type: 'FERTILIZER', amount: 2 }, completed: false, claimed: false },
        { id: 'm2', desc: 'Kiếm được 500 vàng', type: 'EARN', category: 'DAILY', target: 500, current: 0, reward: { type: 'WATER', amount: 10 }, completed: false, claimed: false },
        ...FARM_ACHIEVEMENTS
    ];

    setUserState(prev => {
        const currentUnlocked = prev.unlockedLevels || [];
        const newUnlockedLevels = startId && !currentUnlocked.includes(startId) 
            ? [...currentUnlocked, startId] 
            : currentUnlocked;

        return {
            ...prev,
            grade,
            textbook: textbookId,
            unlockedLevels: newUnlockedLevels.length === 0 && startId ? [startId] : newUnlockedLevels,
            missions: initialMissions
        };
    });
    setScreen(Screen.FARM); // Go straight to Farm
    playSFX('success');
  };

  const handleStartLevel = (levelId: number) => {
      const level = LEVELS.find(l => l.id === levelId);
      if (level) {
          setActiveLevel(level);
          // Flow: Flashcard -> Translation -> Speaking -> Guide
          if (level.words.length > 0) setGameStep('FLASHCARD');
          else if (level.sentences.length > 0) setGameStep('TRANSLATION');
          else setGameStep('GUIDE');
          
          setScreen(Screen.GAME);
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

          // Update missions
          let missions = prev.missions;
          if (missions) {
             missions = missions.map(m => {
                 if (m.type === 'LEARN' && !m.completed) {
                     return { ...m, current: m.current + 1, completed: m.current + 1 >= m.target };
                 }
                 return m;
             });
          }

          return {
              ...prev,
              coins: prev.coins + bonusCoins + 50, // Base reward 50
              completedLevels: newCompleted,
              levelStars: { ...prev.levelStars, [activeLevel.id]: newStars },
              unlockedLevels: newUnlocked,
              streak: prev.streak + 1,
              missions
          };
      });
      setScreen(Screen.MAP); // Return to Map
      setActiveLevel(null);
      playSFX('success');
  };

  const GlobalHeader = () => (
      <div className="absolute top-0 left-0 right-0 p-3 z-50 flex justify-between items-start pointer-events-none">
          <div className="pointer-events-auto">
             {screen !== Screen.FARM && (
                 <button onClick={() => setScreen(Screen.FARM)} className="btn-3d btn-green w-12 h-12 flex items-center justify-center rounded-2xl">
                     <ArrowLeft size={24} strokeWidth={3} />
                 </button>
             )}
          </div>

          <div className="flex gap-2 pointer-events-auto">
              <div className="wood-texture px-4 py-2 rounded-2xl flex items-center gap-2 border-b-4 border-amber-900 shadow-lg">
                  <Coins size={20} className="text-yellow-400 drop-shadow-sm" fill="currentColor"/>
                  <span className="font-black text-white text-lg text-stroke shadow-black drop-shadow-md">{userState.coins}</span>
              </div>
              <div className="bg-blue-500 px-4 py-2 rounded-2xl flex items-center gap-2 border-2 border-white border-b-4 border-b-blue-700 shadow-lg">
                  <Zap size={20} className="text-yellow-300 drop-shadow-sm" fill="currentColor"/>
                  <span className="font-black text-white text-lg">{userState.fertilizers}</span>
              </div>
              <button onClick={() => setShowSettings(true)} className="btn-3d bg-slate-100 p-2 rounded-2xl border-b-4 border-slate-300">
                  <SettingsIcon size={24} className="text-slate-600"/>
              </button>
          </div>
      </div>
  );

  return (
      <div className="h-screen w-full bg-[#87CEEB] overflow-hidden font-sans text-slate-800 flex flex-col relative" onClick={initAudio}>
          {screen === Screen.ONBOARDING && <Onboarding onComplete={handleOnboardingComplete} />}
          
          {screen !== Screen.ONBOARDING && <GlobalHeader />}

          {screen === Screen.FARM && (
              <Farm 
                  userState={userState} 
                  onUpdateState={setUserState} 
                  onExit={() => {}} // Farm is root
                  allWords={LEVELS.flatMap(l => l.words)}
                  levels={getLevels(userState.grade, userState.textbook)}
                  onNavigate={(target) => setScreen(target)}
                  onShowAchievements={() => setShowAchievements(true)}
              />
          )}

          {screen === Screen.MAP && (
              <div className="h-full w-full bg-gradient-to-b from-[#87CEEB] to-[#e0f7fa] overflow-hidden relative">
                  <MapScreen 
                      levels={getLevels(userState.grade, userState.textbook)} 
                      unlockedLevels={userState.unlockedLevels}
                      completedLevels={userState.completedLevels}
                      levelStars={userState.levelStars}
                      onStartLevel={handleStartLevel}
                  />
                  {/* Decorative Foreground Cloud */}
                  <div className="absolute bottom-0 left-0 w-full h-24 bg-white/30 backdrop-blur-sm rounded-t-[50%] pointer-events-none" />
              </div>
          )}

          {screen === Screen.CHAT && (
              <div className="h-full flex flex-col bg-white pt-20">
                  <div className="flex-1 overflow-hidden mx-4 mb-4 rounded-3xl border-4 border-slate-200 shadow-xl">
                      <AIChat grade={userState.grade || 1} />
                  </div>
              </div>
          )}

          {screen === Screen.TIME_ATTACK && (
              <TimeAttackGame 
                  words={LEVELS.flatMap(l => l.words)}
                  onComplete={(score) => {
                      setUserState(prev => ({ ...prev, coins: prev.coins + score }));
                      setScreen(Screen.FARM);
                  }}
                  onExit={() => setScreen(Screen.FARM)}
              />
          )}

          {screen === Screen.GAME && activeLevel && (
              <div className="h-full flex flex-col bg-amber-50 pt-20 relative bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')]">
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 wood-texture px-6 py-2 rounded-xl text-white font-black text-lg border-2 border-white shadow-xl z-10 text-center min-w-[200px]">
                      {activeLevel.title}
                  </div>
                  <div className="flex-1 overflow-hidden relative m-4 rounded-[2rem] bg-white/50 backdrop-blur-sm border-4 border-white shadow-2xl">
                      {gameStep === 'FLASHCARD' && (
                          <FlashcardGame 
                              words={activeLevel.words} 
                              onComplete={() => {
                                  if (activeLevel.sentences.length > 0) setGameStep('TRANSLATION');
                                  else if (activeLevel.words.length > 0) setGameStep('SPEAKING');
                                  else setGameStep('GUIDE');
                              }}
                          />
                      )}
                      {gameStep === 'TRANSLATION' && (
                          <TranslationGame 
                              sentences={activeLevel.sentences} 
                              onComplete={() => {
                                  if (activeLevel.words.length > 0) setGameStep('SPEAKING');
                                  else setGameStep('GUIDE');
                              }}
                          />
                      )}
                      {gameStep === 'SPEAKING' && (
                          <SpeakingGame 
                              words={activeLevel.words} 
                              onComplete={(coins) => {
                                  setUserState(prev => ({ ...prev, coins: prev.coins + coins }));
                                  setGameStep('GUIDE');
                              }}
                          />
                      )}
                      {gameStep === 'GUIDE' && (
                          <LessonGuide 
                              level={activeLevel} 
                              userState={userState}
                              onUpdateState={setUserState}
                              onComplete={() => handleLevelComplete(0)}
                          />
                      )}
                  </div>
              </div>
          )}

          {showSettings && (
              <Settings 
                  userState={userState} 
                  onUpdateSettings={(newSettings) => setUserState(prev => ({ ...prev, settings: newSettings }))}
                  onResetData={() => {
                      localStorage.removeItem('turtle_english_state');
                      window.location.reload();
                  }}
                  onClose={() => setShowSettings(false)} 
              />
          )}

          {showAchievements && (
              <div className="fixed inset-0 z-[100]">
                  <Achievements userState={userState} onClose={() => setShowAchievements(false)} />
              </div>
          )}
      </div>
  );
}
