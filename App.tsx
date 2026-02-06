
// ... existing imports
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Screen, UserState, Mission, LessonLevel, LivestockSlot, MachineSlot, DecorSlot } from './types';
import { Onboarding } from './components/Onboarding';
import { MapScreen } from './components/MapScreen';
import { Farm } from './components/Farm';
import { Settings } from './components/Settings';
import { StoryAdventure } from './components/StoryAdventure'; 
import { TimeAttackGame } from './components/TimeAttackGame';
import { GeneralAchievements } from './components/GeneralAchievements';
import { GachaScreen } from './components/GachaScreen'; // Import new component
import { LessonGuide } from './components/LessonGuide';
import { FlashcardGame } from './components/FlashcardGame';
import { TranslationGame } from './components/TranslationGame';
import { SpeakingGame } from './components/SpeakingGame';
import { ConfirmModal } from './components/ui/ConfirmModal'; 
import { getLevels, LEVELS, TEXTBOOKS, AVATARS } from './constants';
import { playSFX, initAudio, playBGM, setVolumes, toggleBgmMute, isBgmMuted } from './utils/sound';
import { Map as MapIcon, Trophy, Settings as SettingsIcon, Book, Gamepad2, Sprout, BookOpen, PenLine, Volume2, VolumeX, Gift, Bug } from 'lucide-react'; 
import { FARM_ACHIEVEMENTS_DATA } from './data/farmData';
import { Avatar } from './components/Avatar'; // Import Avatar
import { AdminPanel } from './components/AdminPanel'; // Import AdminPanel

const ALL_STORAGE_KEYS = [
  'turtle_english_state',
  'turtle_english_state_v1',
  'turtle_english_state_v2',
  'turtle_english_state_v3',
  'turtle_english_state_v4',
  'turtle_english_state_v5',
  'turtle_english_state_v6',
  'turtle_english_state_v7',
  'turtle_english_state_v8',
  'turtle_english_state_v9',
  'turtle_english_state_v10',
  'turtle_english_state_v11',
  'turtle_english_state_v12',
  'turtle_english_state_v13',
  'turtle_english_state_v14',
  'turtle_english_state_v15',
  'turtle_english_state_v16',
  'turtle_english_state_v17',
];

const CURRENT_VERSION_KEY = 'turtle_english_state_v18'; // Increment version
const BACKUP_KEY = 'turtle_english_state_backup';

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
  completedStories: [], 
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
  gachaCollection: [], // Initialize
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
  const primitives = ['grade', 'textbook', 'coins', 'stars', 'currentAvatarId', 'currentGachaAvatarId', 'streak', 'lastLoginDate', 'farmLevel', 'farmExp', 'waterDrops', 'fertilizers', 'wellUsageCount', 'lastWellDate'];
  primitives.forEach(key => {
      if (oldState[key] !== undefined) (newState as any)[key] = oldState[key];
  });
  const objects = ['levelStars', 'lessonGuides', 'inventory', 'harvestedCrops', 'settings'];
  objects.forEach(key => {
      if (oldState[key]) (newState as any)[key] = oldState[key];
  });
  const simpleArrays = ['completedLevels', 'unlockedLevels', 'unlockedAchievements', 'decorations', 'missions', 'activeOrders', 'completedStories', 'gachaCollection'];
  simpleArrays.forEach(key => {
      if (Array.isArray(oldState[key])) (newState as any)[key] = oldState[key];
  });
  newState.farmPlots = smartMergeArray(DEFAULT_USER_STATE.farmPlots, oldState.farmPlots, 'cropId');
  newState.livestockSlots = smartMergeArray<LivestockSlot>(DEFAULT_USER_STATE.livestockSlots || [], oldState.livestockSlots, 'animalId');
  newState.machineSlots = smartMergeArray<MachineSlot>(DEFAULT_USER_STATE.machineSlots || [], oldState.machineSlots, 'machineId');
  newState.decorSlots = smartMergeArray<DecorSlot>(DEFAULT_USER_STATE.decorSlots || [], oldState.decorSlots, 'decorId');
  return newState;
};

// ... (calculateProgressScore - no changes)
const calculateProgressScore = (state: UserState) => {
    let score = 0;
    score += (state.completedLevels?.length || 0) * 10;
    score += (state.stars || 0) * 5;
    score += (state.coins || 0) / 100;
    return Math.floor(score);
};

export default function App() {
  const [isLoaded, setIsLoaded] = useState(false); 
  const [userState, setUserState] = useState<UserState>(DEFAULT_USER_STATE);
  const userStateRef = useRef(userState);

  // Improved Data Loading Logic: Scans backwards for ANY valid save
  useEffect(() => {
      try {
        let loadedState: any = null;
        
        // Scan keys from newest to oldest (including current)
        const keysToCheck = [CURRENT_VERSION_KEY, ...[...ALL_STORAGE_KEYS].reverse()];
        
        for (const key of keysToCheck) {
            const raw = localStorage.getItem(key);
            if (raw) {
                try {
                    const parsed = JSON.parse(raw);
                    if (parsed && typeof parsed === 'object') {
                        console.log(`✅ Loaded data from ${key}`);
                        loadedState = parsed;
                        break; // Stop at first valid data found
                    }
                } catch(e) { console.warn(`Failed to parse ${key}`, e); }
            }
        }

        if (!loadedState) {
            // Check backup key
            const backup = localStorage.getItem(BACKUP_KEY);
            if (backup) {
                try { loadedState = JSON.parse(backup); console.log("✅ Loaded from backup"); } catch(e) {}
            }
        }

        if (!loadedState) {
            console.log("ℹ️ No previous data found, starting new.");
            loadedState = DEFAULT_USER_STATE;
        }

        if (loadedState) {
            const migrated = migrateState(loadedState);
            setUserState(migrated);
            userStateRef.current = migrated;
            
            // Save immediately to current version key to ensure migration persists
            localStorage.setItem(CURRENT_VERSION_KEY, JSON.stringify(migrated));
        } 
      } catch (e) {
        console.error("Critical loading error", e);
        setUserState(DEFAULT_USER_STATE);
      } finally {
          setIsLoaded(true); 
      }
  }, []);

  const handleUpdateState = useCallback((update: UserState | ((prev: UserState) => UserState)) => {
      if (!isLoaded) return;
      setUserState(prev => {
          const newState = typeof update === 'function' ? (update as any)(prev) : update;
          try {
              localStorage.setItem(CURRENT_VERSION_KEY, JSON.stringify(newState));
              // Also save backup occasionally (simple implementation: always save backup on important state changes)
              if (Math.random() < 0.1) localStorage.setItem(BACKUP_KEY, JSON.stringify(newState));
              userStateRef.current = newState; 
          } catch (e) { console.error(e); }
          return newState;
      });
  }, [isLoaded]);

  const [screen, setScreen] = useState<Screen>(Screen.ONBOARDING);
  
  useEffect(() => {
      if (isLoaded) {
          if (userState.grade) {
              setScreen(Screen.HOME);
          } else {
              setScreen(Screen.ONBOARDING);
          }
      }
  }, [isLoaded, userState.grade]);

  // ... (Game state variables - same)
  const [activeLevel, setActiveLevel] = useState<LessonLevel | null>(null);
  const [gameStep, setGameStep] = useState<'GUIDE' | 'FLASHCARD' | 'TRANSLATION' | 'SPEAKING'>('FLASHCARD');
  
  const [showSettings, setShowSettings] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false); // ADMIN STATE
  const [isMuted, setIsMuted] = useState(false);
  const [showConfirmBook, setShowConfirmBook] = useState(false); 

  useEffect(() => {
      setVolumes(userState.settings.sfxVolume, userState.settings.bgmVolume);
      const shouldPlayBGM = [Screen.HOME, Screen.FARM, Screen.MAP, Screen.GACHA].includes(screen);
      playBGM(shouldPlayBGM && !isMuted);
  }, [userState.settings, screen, isMuted]);

  // ... (Handlers - same)
  const handleOnboardingComplete = (grade: number, textbookId: string) => {
    const levels = getLevels(grade, textbookId);
    const startId = levels[0]?.id; 
    handleUpdateState(prev => {
        const currentUnlocked = prev.unlockedLevels || [];
        const newUnlockedLevels = startId && !currentUnlocked.includes(startId) ? [...currentUnlocked, startId] : currentUnlocked;
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

  const confirmChangeBook = () => { setScreen(Screen.ONBOARDING); setShowConfirmBook(false); };
  const handleToggleMute = () => { const muted = toggleBgmMute(); setIsMuted(muted); };
  
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
      const earnedStars = 3; 
      
      handleUpdateState(prev => {
          const newCompleted = prev.completedLevels.includes(activeLevel.id) ? prev.completedLevels : [...prev.completedLevels, activeLevel.id];
          const newStarsRecord = Math.max(prev.levelStars[activeLevel.id] || 0, earnedStars);
          
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
              stars: prev.stars + earnedStars, 
              completedLevels: newCompleted,
              levelStars: { ...prev.levelStars, [activeLevel.id]: newStarsRecord },
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
          alert("Khôi phục dữ liệu thành công! Ứng dụng sẽ tải lại.");
          window.location.reload();
      } else {
          alert("File dữ liệu không hợp lệ.");
      }
  };


  const currentBookName = TEXTBOOKS.find(b => b.id === userState.textbook)?.name || "Chưa chọn sách";

  // Resolve current avatar
  const avatarItem = AVATARS.find(a => a.id === userState.currentAvatarId) || AVATARS[0];
  const isGachaAvatar = userState.currentAvatarId === 'gacha_custom' && userState.currentGachaAvatarId;
  const isAdminMode = userState.settings.userName === 'BAKUNTIN';

  if (!isLoaded) return <div className="h-screen w-full flex items-center justify-center bg-slate-50 text-slate-400 font-bold">Đang tải dữ liệu...</div>;

  return (
      <div className="h-screen w-full bg-slate-50 overflow-hidden font-sans text-slate-800" onClick={initAudio}>
          {screen === Screen.ONBOARDING && <Onboarding onComplete={handleOnboardingComplete} />}
          
          {screen === Screen.HOME && (
              <div className="h-full flex flex-col">
                  {/* Header */}
                  <div className="flex justify-between items-center p-3 bg-white shadow-sm z-10 border-b border-slate-100">
                      <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                              {/* Display Avatar in Header */}
                              {isGachaAvatar ? (
                                  <Avatar imageId={userState.currentGachaAvatarId} size="sm" className="border-2 border-indigo-200" />
                              ) : (
                                  <Avatar emoji={avatarItem.emoji} bgGradient={avatarItem.bgGradient} size="sm" className="border-2 border-indigo-200" />
                              )}
                              <div>
                                  <span className="font-black text-blue-600 text-lg leading-none">Turtle English</span>
                                  {userState.grade && (
                                    <div className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                                        <BookOpen size={10} /> Lớp {userState.grade}
                                    </div>
                                  )}
                              </div>
                          </div>
                      </div>
                      
                      <div className="flex gap-2">
                          {isAdminMode && (
                              <button onClick={() => setShowAdmin(true)} className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg animate-pulse" title="Admin Panel">
                                  <Bug size={18} />
                              </button>
                          )}
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
                      <NavButton icon={<Gift />} label="Vòng Quay" onClick={() => setScreen(Screen.GACHA)} />
                      <NavButton icon={<Gamepad2 />} label="Trò chơi" onClick={() => setScreen(Screen.TIME_ATTACK)} />
                      <NavButton icon={<Book />} label="Truyện" onClick={() => setScreen(Screen.CHAT)} />
                  </div>
              </div>
          )}
          
          {screen === Screen.GACHA && (
              <GachaScreen 
                  userState={userState}
                  onUpdateState={handleUpdateState}
                  onExit={() => setScreen(Screen.HOME)}
              />
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

          {/* ... (Other screens: CHAT, TIME_ATTACK, GAME, Settings, Achievements, ConfirmModal - Same) */}
          {screen === Screen.CHAT && (
              <StoryAdventure 
                  userState={userState} 
                  onCompleteStory={(storyId, rewards) => {
                      handleUpdateState(prev => {
                          const isNew = !(prev.completedStories || []).includes(storyId);
                          const finalRewards = {
                              coins: isNew ? rewards.coins : Math.floor(rewards.coins / 2),
                              stars: isNew ? rewards.stars : 0, 
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

          {showAdmin && (
              <AdminPanel 
                  userState={userState}
                  onUpdateState={handleUpdateState}
                  onClose={() => setShowAdmin(false)}
              />
          )}

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
