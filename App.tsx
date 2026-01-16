
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
import { getLevels, LEVELS, TEXTBOOKS } from './constants';
import { playSFX, initAudio, playBGM, setVolumes, toggleBgmMute, isBgmMuted } from './utils/sound';
import { Map as MapIcon, Trophy, Settings as SettingsIcon, MessageCircle, Gamepad2, Sprout, BookOpen, PenLine, Volume2, VolumeX } from 'lucide-react';
import { FARM_ACHIEVEMENTS_DATA } from './data/farmData';

const DEFAULT_USER_STATE: UserState = {
  grade: null,
  textbook: null,
  coins: 100, // Give some starting coins
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
      { id: 2, isUnlocked: true, cropId: null, plantedAt: null }, // Unlock 2 plots by default
      { id: 3, isUnlocked: false, cropId: null, plantedAt: null },
      { id: 4, isUnlocked: false, cropId: null, plantedAt: null },
  ],
  livestockSlots: [],
  machineSlots: [],
  inventory: { 'carrot': 3 }, // Start with 3 carrot seeds
  harvestedCrops: {},
  fertilizers: 3,
  waterDrops: 10,
  petLevel: 1,
  petExp: 0,
  petHappiness: 50,
  missions: FARM_ACHIEVEMENTS_DATA, // Initialize achievements/missions
  activeOrders: [], 
  settings: {
      bgmVolume: 0.3,
      sfxVolume: 0.8,
      lowPerformance: false
  }
};

export default function App() {
  const [userState, setUserState] = useState<UserState>(() => {
      try {
        const saved = localStorage.getItem('turtle_english_state_v5'); // Bump version
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
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
      localStorage.setItem('turtle_english_state_v5', JSON.stringify(userState));
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

  const handleChangeBook = () => {
      if (window.confirm("Bé có chắc muốn chọn lại Lớp và Sách không?")) {
          setScreen(Screen.ONBOARDING);
      }
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
                          <button onClick={handleChangeBook} className="p-2 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-colors border border-blue-200" title="Chọn lại sách">
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
                      setUserState(prev => ({ ...prev, coins: prev.coins + score }));
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
                      localStorage.removeItem('turtle_english_state_v5');
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
      </div>
  );
}

const NavButton = ({ icon, label, active, onClick }: any) => (
    <button onClick={onClick} className={`flex flex-col items-center gap-1 transition-colors ${active ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}>
        {React.cloneElement(icon, { size: 24 })}
        <span className="text-[10px] font-bold">{label}</span>
    </button>
);
