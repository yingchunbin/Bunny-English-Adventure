
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Screen, UserState, Mission, LessonLevel, LivestockSlot, MachineSlot, DecorSlot } from './types';
import { Onboarding } from './components/Onboarding';
import { MapScreen } from './components/MapScreen';
import { Farm } from './components/Farm';
import { Settings } from './components/Settings';
import { StoryAdventure } from './components/StoryAdventure'; // Updated import
import { TimeAttackGame } from './components/TimeAttackGame';
import { GeneralAchievements } from './components/GeneralAchievements';
import { LessonGuide } from './components/LessonGuide';
import { FlashcardGame } from './components/FlashcardGame';
import { TranslationGame } from './components/TranslationGame';
import { SpeakingGame } from './components/SpeakingGame';
import { ConfirmModal } from './components/ui/ConfirmModal'; 
import { getLevels, LEVELS, TEXTBOOKS } from './constants';
import { playSFX, initAudio, playBGM, setVolumes, toggleBgmMute, isBgmMuted } from './utils/sound';
import { Map as MapIcon, Trophy, Settings as SettingsIcon, Book, Gamepad2, Sprout, BookOpen, PenLine, Volume2, VolumeX } from 'lucide-react'; // Changed MessageCircle to Book
import { FARM_ACHIEVEMENTS_DATA } from './data/farmData';

// VERSION KEY - Keep v16 to maintain the "fresh start" migration we established
const CURRENT_VERSION_KEY = 'turtle_english_state_v16';
const BACKUP_KEY = 'turtle_english_state_backup';

// LIST OF LEGACY KEYS FOR MIGRATION ONLY
const ALL_STORAGE_KEYS = [
    'turtle_english_state_v15',
    'turtle_english_state_v14',
    'turtle_english_state_v13',
    'turtle_english_state_v12',
    'turtle_english_state_v11',
    'turtle_english_state_v10',
    'turtle_english_state_v9',
    'turtle_english_state_v8',
    'turtle_english_state_v7',
    'turtle_english_state_v6',
    'turtle_english_state_v5',
    'turtle_english_state_v4',
    'turtle_english_state_v3',
    'turtle_english_state_v2',
    'turtle_english_state_v1',
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
      { id: 1, isUnlocked: true, animalId: null, fedAt: null, storage: [], queue: 0 },
      { id: 2, isUnlocked: true, animalId: null, fedAt: null, storage: [], queue: 0 },
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
  completedStories: [], // Initialize new field
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

const smartMergeArray = <T extends { id: any }>(defaultArr: T[], oldArr: any, keyCheck: string): T[] => {
    if (!Array.isArray(oldArr) || oldArr.length === 0) return defaultArr;
    const oldMap = new Map(oldArr.map((item: any) => [item.id, item]));
    const merged: T[] = defaultArr.map(defItem => {
        const oldItem = oldMap.get(defItem.id);
        if (oldItem) return { ...defItem, ...oldItem } as T;
        return defItem;
    });
    oldArr.forEach((item: any) => {
        if (!merged.find(m => m.id === item.id)) merged.push(item as T);
    });
    return merged;
};

const migrateState = (oldState: any): UserState => {
  let newState: UserState = { ...DEFAULT_USER_STATE };

  // Copy primitives
  const primitives = ['grade', 'textbook', 'coins', 'stars', 'currentAvatarId', 'streak', 'lastLoginDate', 'farmLevel', 'farmExp', 'waterDrops', 'fertilizers', 'wellUsageCount', 'lastWellDate'];
  primitives.forEach(key => {
      if (oldState[key] !== undefined) (newState as any)[key] = oldState[key];
  });

  // Copy Objects
  const objects = ['levelStars', 'lessonGuides', 'inventory', 'harvestedCrops', 'settings'];
  objects.forEach(key => {
      if (oldState[key]) (newState as any)[key] = oldState[key];
  });

  // Copy Arrays
  const simpleArrays = ['completedLevels', 'unlockedLevels', 'unlockedAchievements', 'decorations', 'missions', 'activeOrders', 'completedStories'];
  simpleArrays.forEach(key => {
      if (Array.isArray(oldState[key])) (newState as any)[key] = oldState[key];
  });

  // Smart Merge Complex Arrays
  newState.farmPlots = smartMergeArray(DEFAULT_USER_STATE.farmPlots, oldState.farmPlots, 'cropId');
  newState.livestockSlots = smartMergeArray<LivestockSlot>(DEFAULT_USER_STATE.livestockSlots || [], oldState.livestockSlots, 'animalId');
  newState.machineSlots = smartMergeArray<MachineSlot>(DEFAULT_USER_STATE.machineSlots || [], oldState.machineSlots, 'machineId');
  newState.decorSlots = smartMergeArray<DecorSlot>(DEFAULT_USER_STATE.decorSlots || [], oldState.decorSlots, 'decorId');

  return newState;
};

const calculateProgressScore = (state: any) => {
    if (!state) return -1;
    let score = 0;
    if (Array.isArray(state.completedLevels)) score += state.completedLevels.length * 50000;
    if (state.farmLevel) score += state.farmLevel * 5000;
    if (state.coins) score += state.coins;
    if (state.inventory) score += Object.keys(state.inventory).length * 10;
    return score;
};

export default function App() {
  const [isLoaded, setIsLoaded] = useState(false); 
  const [userState, setUserState] = useState<UserState>(DEFAULT_USER_STATE);
  
  // Use a Ref to hold state for emergency saves
  const userStateRef = useRef(userState);

  // --- INITIAL LOAD ---
  useEffect(() => {
      try {
        let loadedState: any = null;
        let sourceKey = '';

        // 1. PRIORITY: Check Current Key (v16) first
        // If v16 exists, WE USE IT. We do NOT compare scores. 
        // This prevents data loss if user spends coins (lowering score) and then reloads.
        const currentRaw = localStorage.getItem(CURRENT_VERSION_KEY);
        if (currentRaw) {
             try {
                const parsed = JSON.parse(currentRaw);
                if (parsed && typeof parsed === 'object') {
                    console.log(`✅ Loaded directly from ${CURRENT_VERSION_KEY}`);
                    loadedState = parsed;
                    sourceKey = CURRENT_VERSION_KEY;
                }
             } catch(e) {
                 console.error("Current version corrupt, checking backups...");
             }
        }

        // 2. MIGRATION: Only if v16 is missing or corrupt, scan all old keys for the best one
        if (!loadedState) {
            console.log("⚠️ Current version missing. Scanning for best backup...");
            const candidates: { key: string, data: any, score: number }[] = [];
            
            [...ALL_STORAGE_KEYS, BACKUP_KEY].forEach(key => {
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

            candidates.sort((a, b) => b.score - a.score);

            if (candidates.length > 0) {
                const best = candidates[0];
                console.log(`🏆 Restored from ${best.key} (Score: ${best.score})`);
                loadedState = best.data;
                sourceKey = best.key;
            }
        }

        // APPLY STATE
        if (loadedState) {
            const migrated = migrateState(loadedState);
            setUserState(migrated);
            userStateRef.current = migrated;
            
            // If we recovered from an old backup, save to v16 immediately to lock it in
            if (sourceKey !== CURRENT_VERSION_KEY) {
                localStorage.setItem(CURRENT_VERSION_KEY, JSON.stringify(migrated));
            }
        } else {
            console.log("🆕 New User Started");
            setUserState(DEFAULT_USER_STATE);
            userStateRef.current = DEFAULT_USER_STATE;
        }
      } catch (e) {
        console.error("Critical Load Error:", e);
        setUserState(DEFAULT_USER_STATE);
      } finally {
          setIsLoaded(true); 
      }
  }, []);

  // --- SAFER STATE UPDATE (ATOMIC) ---
  const handleUpdateState = useCallback((update: UserState | ((prev: UserState) => UserState)) => {
      if (!isLoaded) return;
      
      setUserState(prev => {
          const newState = typeof update === 'function' ? (update as any)(prev) : update;
          
          // Side Effect: Save to LocalStorage immediately
          try {
              localStorage.setItem(CURRENT_VERSION_KEY, JSON.stringify(newState));
              userStateRef.current = newState; // Keep ref synced
          } catch (e) {
              console.error("Save Failed:", e);
          }
          
          return newState;
      });
  }, [isLoaded]);

  // Emergency Backup on Visibility Change
  useEffect(() => {
      const handleVisibilityChange = () => {
          if (document.visibilityState === 'hidden' && isLoaded && userStateRef.current) {
              try {
                  localStorage.setItem(CURRENT_VERSION_KEY, JSON.stringify(userStateRef.current));
              } catch (e) { console.error(e); }
          }
      };
      document.addEventListener('visibilitychange', handleVisibilityChange);
      // Also save on beforeunload for desktop refresh
      window.addEventListener('beforeunload', handleVisibilityChange);
      
      return () => {
          document.removeEventListener('visibilitychange', handleVisibilityChange);
          window.removeEventListener('beforeunload', handleVisibilityChange);
      };
  }, [isLoaded]);

  const [screen, setScreen] = useState<Screen>(Screen.ONBOARDING);
  
  // Update screen based on loaded state
  useEffect(() => {
      if (isLoaded) {
          if (userState.grade) {
              setScreen(Screen.HOME);
          } else {
              setScreen(Screen.ONBOARDING);
          }
      }
  }, [isLoaded, userState.grade]);

  const [activeLevel, setActiveLevel] = useState<LessonLevel | null>(null);
  const [gameStep, setGameStep] = useState<'GUIDE' | 'FLASHCARD' | 'TRANSLATION' | 'SPEAKING'>('FLASHCARD');
  
  const [showSettings, setShowSettings] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showConfirmBook, setShowConfirmBook] = useState(false); 

  useEffect(() => {
      setVolumes(userState.settings.sfxVolume, userState.settings.bgmVolume);
      const shouldPlayBGM = [Screen.HOME, Screen.FARM, Screen.MAP].includes(screen);
      playBGM(shouldPlayBGM && !isMuted);
  }, [userState.settings, screen, isMuted]);

  const handleOnboardingComplete = (grade: number, textbookId: string) => {
    const levels = getLevels(grade, textbookId);
    const startId = levels[0]?.id; 
    
    handleUpdateState(prev => {
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
      
      handleUpdateState(prev => {
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

  const handleImportData = (data: any) => {
      if (data && typeof data === 'object') {
          const migrated = migrateState(data);
          handleUpdateState(migrated);
          localStorage.setItem(BACKUP_KEY, JSON.stringify(migrated));
          alert("Khôi phục dữ liệu thành công! Ứng dụng sẽ tải lại.");
          window.location.reload();
      } else {
          alert("File dữ liệu không hợp lệ.");
      }
  };

  const currentBookName = TEXTBOOKS.find(b => b.id === userState.textbook)?.name || "Chưa chọn sách";

  if (!isLoaded) return <div className="h-screen w-full flex items-center justify-center bg-slate-50 text-slate-400 font-bold">Đang tải dữ liệu...</div>;

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
                      <NavButton icon={<Book />} label="Truyện" onClick={() => setScreen(Screen.CHAT)} />
                      <NavButton icon={<Trophy />} label="Thành tích" onClick={() => setShowAchievements(true)} />
                  </div>
              </div>
          )}

          {screen === Screen.FARM && (
              <Farm 
                  userState={userState} 
                  onUpdateState={handleUpdateState} 
                  onExit={() => setScreen(Screen.HOME)} 
                  allWords={LEVELS.flatMap(l => l.words)}
                  levels={getLevels(userState.grade, userState.textbook)}
              />
          )}

          {screen === Screen.CHAT && (
              <StoryAdventure 
                  userState={userState} // Passed full userState
                  onCompleteStory={(storyId, rewards) => {
                      handleUpdateState(prev => {
                          const isNew = !(prev.completedStories || []).includes(storyId);
                          
                          // If already completed, give reduced rewards (half)
                          const finalRewards = {
                              coins: isNew ? rewards.coins : Math.floor(rewards.coins / 2),
                              stars: isNew ? rewards.stars : 0, // No extra stars for replay
                              water: isNew ? rewards.water : Math.floor(rewards.water / 2),
                              fertilizer: isNew ? rewards.fertilizer : 0
                          };

                          return {
                              ...prev,
                              coins: prev.coins + finalRewards.coins,
                              stars: (prev.stars || 0) + finalRewards.stars,
                              waterDrops: (prev.waterDrops || 0) + finalRewards.water,
                              fertilizers: (prev.fertilizers || 0) + finalRewards.fertilizer,
                              completedStories: isNew ? [...(prev.completedStories || []), storyId] : prev.completedStories
                          };
                      });
                  }}
                  onExit={() => setScreen(Screen.HOME)}
              />
          )}

          {screen === Screen.TIME_ATTACK && (
              <TimeAttackGame 
                  words={LEVELS.flatMap(l => l.words)}
                  onComplete={(score) => {
                      const earnedCoins = Math.floor(score / 10);
                      handleUpdateState(prev => ({ ...prev, coins: prev.coins + earnedCoins }));
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
                                  handleUpdateState(prev => ({ ...prev, coins: prev.coins + coins }));
                                  setGameStep('GUIDE');
                              }}
                          />
                      )}
                      {gameStep === 'GUIDE' && (
                          <LessonGuide 
                              level={activeLevel} 
                              userState={userState}
                              onUpdateState={handleUpdateState}
                              onComplete={() => handleLevelComplete(0)}
                          />
                      )}
                  </div>
              </div>
          )}

          {showSettings && (
              <Settings 
                  userState={userState} 
                  onUpdateSettings={(newSettings) => handleUpdateState(prev => ({ ...prev, settings: newSettings }))}
                  onResetData={() => {
                      // Only clear keys if user explicitly resets
                      [...ALL_STORAGE_KEYS, BACKUP_KEY, CURRENT_VERSION_KEY].forEach(k => localStorage.removeItem(k));
                      window.location.reload();
                  }}
                  onImportData={handleImportData}
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
