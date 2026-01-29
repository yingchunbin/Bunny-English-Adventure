
import React, { useState, useEffect } from 'react';
import { Screen, UserState, Mission, LessonLevel } from './types';
import { Onboarding } from './components/Onboarding';
import { MapScreen } from './components/MapScreen';
import { Farm } from './components/Farm';
import { Settings } from './components/Settings';
import { AIChat } from './components/AIChat';
import { TimeAttackGame } from './components/TimeAttackGame';
import { GeneralAchievements } from './components/GeneralAchievements';
import { LessonGuide } from './components/LessonGuide';
import { FlashcardGame } from './components/FlashcardGame';
import { TranslationGame } from './components/TranslationGame';
import { SpeakingGame } from './components/SpeakingGame';
import { ConfirmModal } from './components/ui/ConfirmModal'; 
import { getLevels, LEVELS, TEXTBOOKS } from './constants';
import { playSFX, initAudio, playBGM, setVolumes, toggleBgmMute, isBgmMuted } from './utils/sound';
import { Map as MapIcon, Trophy, Settings as SettingsIcon, MessageCircle, Gamepad2, Sprout, BookOpen, PenLine, Volume2, VolumeX } from 'lucide-react';
import { FARM_ACHIEVEMENTS_DATA } from './data/farmData';

// TARGET KEY FOR THE APP
const CURRENT_VERSION_KEY = 'turtle_english_state_v11';

// ALL POSSIBLE KEYS TO SCAN (Current + Legacy)
const ALL_STORAGE_KEYS = [
    'turtle_english_state_v11',
    'turtle_english_state_v10',
    'turtle_english_state_v9',
    'turtle_english_state_v8',
    'turtle_english_state_v7',
    'turtle_english_state'
];

const DEFAULT_USER_STATE: UserState = {
  grade: null,
  textbook: null,
  coins: 200, 
  stars: 5, 
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
  ],
  livestockSlots: [
      { id: 1, isUnlocked: true, animalId: null, fedAt: null, storage: [] },
      { id: 2, isUnlocked: true, animalId: null, fedAt: null, storage: [] },
  ],
  machineSlots: [
      { id: 1, isUnlocked: true, machineId: null, activeRecipeId: null, startedAt: null, storage: [], queue: [] },
      { id: 2, isUnlocked: true, machineId: null, activeRecipeId: null, startedAt: null, storage: [], queue: [] },
  ],
  decorSlots: [
      { id: 1, isUnlocked: true, decorId: null },
      { id: 2, isUnlocked: true, decorId: null },
      { id: 3, isUnlocked: false, decorId: null },
  ],
  inventory: { 'carrot': 2, 'wheat': 2 }, 
  harvestedCrops: {},
  fertilizers: 3,
  waterDrops: 10,
  farmLevel: 1,
  farmExp: 0,
  missions: FARM_ACHIEVEMENTS_DATA, 
  activeOrders: [], 
  wellUsageCount: 0,
  lastWellDate: '',
  settings: {
      bgmVolume: 0.3,
      sfxVolume: 0.8,
      lowPerformance: false
  }
};

// Helper function to migrate and sanitize data
const migrateState = (oldState: any): UserState => {
  // 1. Merge with default to ensure all new fields exist
  let newState = { ...DEFAULT_USER_STATE, ...oldState };

  // 2. Decor Slots Migration (v8 -> v9/v10)
  if ((!newState.decorSlots || newState.decorSlots.length === 0) && oldState.activeDecorIds) {
      const defaultSlots = [
          { id: 1, isUnlocked: true, decorId: null },
          { id: 2, isUnlocked: true, decorId: null },
          { id: 3, isUnlocked: false, decorId: null },
      ];
      
      if (Array.isArray(oldState.activeDecorIds)) {
          oldState.activeDecorIds.forEach((dId: string, idx: number) => {
              if (idx < defaultSlots.length) {
                  defaultSlots[idx] = { ...defaultSlots[idx], isUnlocked: true, decorId: dId };
              }
          });
      }
      newState.decorSlots = defaultSlots;
  }

  // 3. Ensure critical arrays exist and preserve machine data
  // Critical fix: Ensure machineSlots from oldState are respected if they exist, to prevent loss on reload
  if (oldState.machineSlots && Array.isArray(oldState.machineSlots) && oldState.machineSlots.length > 0) {
      newState.machineSlots = oldState.machineSlots;
  } else {
      newState.machineSlots = DEFAULT_USER_STATE.machineSlots;
  }

  if (!newState.decorSlots) newState.decorSlots = DEFAULT_USER_STATE.decorSlots;
  if (!newState.unlockedLevels) newState.unlockedLevels = oldState.unlockedLevels || DEFAULT_USER_STATE.unlockedLevels;
  if (!newState.completedLevels) newState.completedLevels = oldState.completedLevels || DEFAULT_USER_STATE.completedLevels;
  if (!newState.farmPlots) newState.farmPlots = oldState.farmPlots || DEFAULT_USER_STATE.farmPlots;
  
  return newState;
};

// Calculate a "Progress Score" to decide which save file is best
const calculateProgressScore = (state: any) => {
    if (!state) return -1;
    let score = 0;
    
    // Most important: How much did they learn?
    if (Array.isArray(state.completedLevels)) {
        score += state.completedLevels.length * 10000;
    }

    // Secondary: Farm progress
    if (state.farmLevel) {
        score += state.farmLevel * 1000;
    }

    // Tertiary: Wealth
    if (state.coins) {
        score += state.coins;
    }

    return score;
};

export default function App() {
  const [userState, setUserState] = useState<UserState>(() => {
      try {
        // 1. Gather all candidates from all known keys
        const candidates: { key: string, data: any, score: number }[] = [];

        ALL_STORAGE_KEYS.forEach(key => {
            const raw = localStorage.getItem(key);
            if (raw) {
                try {
                    const parsed = JSON.parse(raw);
                    if (parsed && typeof parsed === 'object') {
                        const score = calculateProgressScore(parsed);
                        candidates.push({ key, data: parsed, score });
                    }
                } catch (e) {
                    console.warn(`Corrupt data in ${key}`);
                }
            }
        });

        // 2. Sort by Score Descending (Highest progress first)
        candidates.sort((a, b) => b.score - a.score);

        if (candidates.length > 0) {
            const best = candidates[0];
            console.log(`🏆 Restoring best save from: ${best.key} (Score: ${best.score})`);
            return migrateState(best.data);
        }
        
        // 3. New user (No valid data found anywhere)
        return DEFAULT_USER_STATE;
      } catch (e) {
        console.error("Critical State Error:", e);
        return DEFAULT_USER_STATE;
      }
  });
  
  const [screen, setScreen] = useState<Screen>(userState.grade ? Screen.HOME : Screen.ONBOARDING);
  const [activeLevel, setActiveLevel] = useState<LessonLevel | null>(null);
  const [gameStep, setGameStep] = useState<'GUIDE' | 'FLASHCARD' | 'TRANSLATION' | 'SPEAKING'>('FLASHCARD');
  
  const [showSettings, setShowSettings] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showConfirmBook, setShowConfirmBook] = useState(false); 

  useEffect(() => {
      // Save to the CURRENT v11 key, ensuring future reloads pick this up
      localStorage.setItem(CURRENT_VERSION_KEY, JSON.stringify(userState));
  }, [userState]);

  useEffect(() => {
      setVolumes(userState.settings.sfxVolume, userState.settings.bgmVolume);
      const shouldPlayBGM = [Screen.HOME, Screen.FARM, Screen.MAP].includes(screen);
      playBGM(shouldPlayBGM && !isMuted);
  }, [userState.settings, screen, isMuted]);

  const handleOnboardingComplete = (grade: number, textbookId: string) => {
    const levels = getLevels(grade, textbookId);
    const startId = levels[0]?.id; 
    
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
        };
    });
    setScreen(Screen.HOME);
    playSFX('success');
  };

  const confirmChangeBook = () => {
      setScreen(Screen.ONBOARDING);
      setShowConfirmBook(false);
  };

  const handleToggleMute = () => {
      const muted = toggleBgmMute();
      setIsMuted(muted);
  };

  const handleStartLevel = (levelId: number) => {
      const level = LEVELS.find(l => l.id === levelId);
      if (level) {
          setActiveLevel(level);
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

          return {
              ...prev,
              coins: prev.coins + bonusCoins + 50,
              completedLevels: newCompleted,
              levelStars: { ...prev.levelStars, [activeLevel.id]: newStars },
              unlockedLevels: newUnlocked,
              streak: prev.streak + 1,
          };
      });
      setScreen(Screen.HOME);
      setActiveLevel(null);
      playSFX('success');
  };

  const currentBookName = TEXTBOOKS.find(b => b.id === userState.textbook)?.name || "Chưa chọn sách";

  return (
      <div className="h-screen w-full bg-slate-50 overflow-hidden font-sans text-slate-800" onClick={initAudio}>
          {screen === Screen.ONBOARDING && <Onboarding onComplete={handleOnboardingComplete} />}
          
          {screen === Screen.HOME && (
              <div className="h-full flex flex-col">
                  {/* HEADER */}
                  <div className="flex justify-between items-center p-3 bg-white shadow-sm z-10 border-b border-slate-100">
                      <div className="flex flex-col">
                          <div className="flex items-center gap-1">
                              <span className="text-xl">🐢</span>
                              <span className="font-black text-blue-600 text-lg">Turtle English</span>
                          </div>
                          {userState.grade && (
                              <div className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                                  <BookOpen size={10} /> Lớp {userState.grade} - {currentBookName.split(' ')[0]}...
                              </div>
                          )}
                      </div>
                      
                      <div className="flex gap-2">
                          <button onClick={handleToggleMute} className={`p-2 rounded-full transition-colors border ${isMuted ? 'bg-slate-100 text-slate-400 border-slate-200' : 'bg-green-50 text-green-600 border-green-200'}`}>
                              {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                          </button>
                          <button onClick={() => setShowConfirmBook(true)} className="p-2 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-colors border border-blue-200" title="Chọn lại sách">
                              <PenLine size={18} />
                          </button>
                          <button onClick={() => setShowSettings(true)} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors border border-slate-200">
                              <SettingsIcon size={18} className="text-slate-500" />
                          </button>
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

                  <div className="bg-white border-t border-slate-200 p-2 flex justify-around items-center pb-6 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
                      <NavButton icon={<MapIcon />} label="Bản đồ" active onClick={() => {}} />
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
                  <div className="p-4 bg-white shadow-sm flex items-center gap-2 border-b border-slate-100">
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
                      const earnedCoins = Math.floor(score / 10);
                      setUserState(prev => ({ ...prev, coins: prev.coins + earnedCoins }));
                      setScreen(Screen.HOME);
                  }}
                  onExit={() => setScreen(Screen.HOME)}
              />
          )}

          {screen === Screen.GAME && activeLevel && (
              <div className="h-full flex flex-col bg-white">
                  <div className="p-4 flex items-center justify-between border-b border-slate-100 shadow-sm z-10">
                      <button onClick={() => setScreen(Screen.HOME)} className="text-slate-400 font-bold">Thoát</button>
                      <h2 className="font-bold text-blue-600 truncate max-w-[200px]">{activeLevel.title}</h2>
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
                      // Only clear keys if user explicitly resets
                      ALL_STORAGE_KEYS.forEach(k => localStorage.removeItem(k));
                      window.location.reload();
                  }}
                  onClose={() => setShowSettings(false)} 
              />
          )}

          {showAchievements && (
              <div className="fixed inset-0 z-50">
                  <GeneralAchievements userState={userState} onClose={() => setShowAchievements(false)} />
              </div>
          )}

          {/* Confirm Modal for Book Change */}
          <ConfirmModal 
              isOpen={showConfirmBook}
              message="Bé có chắc muốn chọn lại Lớp và Sách không?"
              onConfirm={confirmChangeBook}
              onCancel={() => setShowConfirmBook(false)}
              confirmText="Chọn lại"
              cancelText="Hủy"
              type="INFO"
          />
      </div>
  );
}

const NavButton = ({ icon, label, active, onClick }: any) => (
    <button onClick={onClick} className={`flex flex-col items-center gap-1 transition-colors ${active ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}>
        {React.cloneElement(icon, { size: 24 })}
        <span className="text-[10px] font-bold">{label}</span>
    </button>
);
