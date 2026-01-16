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
import { Map as MapIcon, Trophy, Settings as SettingsIcon, MessageCircle, Gamepad2, Sprout } from 'lucide-react';

const DEFAULT_USER_STATE: UserState = {
  grade: null,
  textbook: null,
  coins: 0,
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
  
  const [screen, setScreen] = useState<Screen>(userState.grade ? Screen.HOME : Screen.ONBOARDING);
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
    setScreen(Screen.HOME);
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
      setScreen(Screen.HOME);
      setActiveLevel(null);
      playSFX('success');
  };

  return (
      <div className="h-screen w-full bg-slate-50 overflow-hidden font-sans text-slate-800 flex flex-col" onClick={initAudio}>
          {screen === Screen.ONBOARDING && <Onboarding onComplete={handleOnboardingComplete} />}
          
          {screen === Screen.HOME && (
              <div className="h-full flex flex-col">
                  {/* Header */}
                  <div className="flex justify-between items-center p-4 bg-white shadow-sm z-10 border-b border-slate-100 flex-shrink-0">
                      <div className="flex items-center gap-2">
                          <span className="text-2xl">🐢</span>
                          <span className="font-black text-blue-600 text-lg">Turtle English</span>
                      </div>
                      <div className="flex gap-3">
                          <div className="bg-yellow-100 text-yellow-700 px-3 py-1.5 rounded-full font-black text-sm flex items-center gap-1 border-2 border-yellow-200">
                              <span className="text-yellow-500 text-lg">🪙</span> {userState.coins}
                          </div>
                          <button onClick={() => setShowSettings(true)} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors"><SettingsIcon size={20} className="text-slate-500" /></button>
                      </div>
                  </div>

                  <div className="flex-1 overflow-y-auto relative bg-slate-50">
                      <MapScreen 
                          levels={getLevels(userState.grade, userState.textbook)} 
                          unlockedLevels={userState.unlockedLevels}
                          completedLevels={userState.completedLevels}
                          levelStars={userState.levelStars}
                          onStartLevel={handleStartLevel}
                      />
                  </div>

                  {/* Improved Bottom Nav */}
                  <div className="bg-white border-t border-slate-200 px-2 py-3 flex justify-around items-center shadow-[0_-4px_20px_rgba(0,0,0,0.05)] flex-shrink-0 pb-safe">
                      <NavButton icon={<MapIcon />} label="Bản đồ" active={true} onClick={() => {}} />
                      <NavButton icon={<Sprout />} label="Nông trại" onClick={() => setScreen(Screen.FARM)} />
                      <NavButton icon={<Gamepad2 />} label="Trò chơi" onClick={() => setScreen(Screen.TIME_ATTACK)} />
                      <NavButton icon={<MessageCircle />} label="Hỏi Thầy" onClick={() => setScreen(Screen.CHAT)} />
                      <NavButton icon={<Trophy />} label="Thành tích" onClick={() => setShowAchievements(true)} />
                  </div>
              </div>
          )}

          {screen === Screen.FARM && (
              <Farm 
                  userState={userState} 
                  onUpdateState={setUserState} 
                  onExit={() => setScreen(Screen.HOME)} 
                  allWords={LEVELS.flatMap(l => l.words)}
                  levels={getLevels(userState.grade, userState.textbook)}
              />
          )}

          {screen === Screen.CHAT && (
              <div className="h-full flex flex-col bg-white">
                  <div className="p-4 bg-white shadow-sm flex items-center gap-2 border-b border-slate-100 flex-shrink-0">
                      <button onClick={() => setScreen(Screen.HOME)} className="text-slate-500 font-bold hover:bg-slate-100 px-3 py-1 rounded-lg">Quay lại</button>
                      <h2 className="font-bold text-lg">Hỏi đáp cùng Thầy Rùa</h2>
                  </div>
                  <div className="flex-1 overflow-hidden">
                      <AIChat grade={userState.grade || 1} />
                  </div>
              </div>
          )}

          {screen === Screen.TIME_ATTACK && (
              <TimeAttackGame 
                  words={LEVELS.flatMap(l => l.words)}
                  onComplete={(score) => {
                      setUserState(prev => ({ ...prev, coins: prev.coins + score }));
                      setScreen(Screen.HOME);
                  }}
                  onExit={() => setScreen(Screen.HOME)}
              />
          )}

          {screen === Screen.GAME && activeLevel && (
              <div className="h-full flex flex-col bg-white">
                  <div className="p-4 flex items-center justify-between border-b border-slate-100 shadow-sm z-10 flex-shrink-0">
                      <button onClick={() => setScreen(Screen.HOME)} className="text-slate-400 font-bold px-3 py-1 bg-slate-50 rounded-lg">Thoát</button>
                      <h2 className="font-bold text-blue-600 truncate max-w-[200px] text-lg">{activeLevel.title}</h2>
                      <div className="w-8"></div>
                  </div>
                  <div className="flex-1 overflow-hidden relative">
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
              <div className="fixed inset-0 z-50">
                  <Achievements userState={userState} onClose={() => setShowAchievements(false)} />
              </div>
          )}
      </div>
  );
}

const NavButton = ({ icon, label, active, onClick }: any) => (
    <button onClick={onClick} className={`flex flex-col items-center gap-1 transition-colors p-2 min-w-[60px] active:scale-95 ${active ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}>
        {React.cloneElement(icon, { size: 28, strokeWidth: active ? 2.5 : 2 })}
        <span className={`text-[10px] font-bold ${active ? 'text-blue-600' : 'text-slate-400'}`}>{label}</span>
    </button>
);