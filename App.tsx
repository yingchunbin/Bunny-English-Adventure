
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Screen, UserState, LessonLevel, UserSettings, Mission } from './types';
import { AVATARS, getLevels, TEXTBOOKS } from './constants';
import { Avatar } from './components/Avatar';
import { FlashcardGame } from './components/FlashcardGame';
import { TranslationGame } from './components/TranslationGame';
import { SpeakingGame } from './components/SpeakingGame';
import { MemoryGame } from './components/MemoryGame'; 
import { LessonGuide } from './components/LessonGuide';
import { Onboarding } from './components/Onboarding';
import { AIChat } from './components/AIChat';
import { Achievements, ACHIEVEMENTS_LIST } from './components/Achievements';
import { TimeAttackGame } from './components/TimeAttackGame'; 
import { Farm } from './components/Farm'; 
import { Settings } from './components/Settings';
import { MapScreen } from './components/MapScreen'; 
import { Map, ShoppingBag, ArrowLeft, Play, Flame, Zap, Trophy, Sprout, Droplets, Settings as SettingsIcon, Book, Languages, Mic, GraduationCap, AlertTriangle, Volume2, VolumeX, Home, Coins, Edit3, X } from 'lucide-react';
import { playSFX, setVolumes, initAudio, playBGM, toggleBgmMute, isBgmMuted } from './utils/sound';

const App: React.FC = () => {
  const [userState, setUserState] = useState<UserState>(() => {
    const saved = localStorage.getItem('bunny_english_state');
    if (saved) {
      try { 
          const parsed = JSON.parse(saved);
          if (!parsed.settings) {
              parsed.settings = { bgmVolume: 0.3, sfxVolume: 0.8, lowPerformance: false, userName: 'Bé Yêu' };
          }
          if (!parsed.farmPlots) {
              parsed.farmPlots = Array(6).fill(null).map((_, i) => ({
                  id: i + 1, isUnlocked: i < 2, cropId: null, plantedAt: null, isWatered: false, hasWeed: false, hasBug: false, hasMysteryBox: false
              }));
          }
          // Fix: Ensure livestock slots exist and handle legacy data
          if (!parsed.livestockSlots || !Array.isArray(parsed.livestockSlots) || parsed.livestockSlots.length === 0) {
              // Default: 4 unlocked, 1 locked
              parsed.livestockSlots = [1,2,3,4].map(id => ({ id, isUnlocked: true, animalId: null, fedAt: null })).concat([{ id: 5, isUnlocked: false, animalId: null, fedAt: null }]);
          }
          // Fix: Ensure machine slots exist and support unlimited expansion (start with 1 unlocked, 1 locked)
          if (!parsed.machineSlots || !Array.isArray(parsed.machineSlots) || parsed.machineSlots.length === 0) {
              parsed.machineSlots = [
                  { id: 1, machineId: null, isUnlocked: true, activeRecipeId: null, startedAt: null },
                  { id: 2, machineId: null, isUnlocked: false, activeRecipeId: null, startedAt: null }
              ];
          }

          if (!parsed.levelStars) parsed.levelStars = {};
          if (!parsed.lessonGuides) parsed.lessonGuides = {};
          if (!parsed.inventory) parsed.inventory = { 'carrot': 2 };
          if (parsed.waterDrops === undefined) parsed.waterDrops = 5;
          if (parsed.fertilizers === undefined) parsed.fertilizers = 1;
          
          return parsed;
      } catch (e) {
          console.error("Save file corrupted, resetting", e);
      }
    }
    return {
      grade: null, textbook: null, coins: 0, currentAvatarId: 'bunny',
      completedLevels: [], levelStars: {}, unlockedLevels: [], streak: 0, lastLoginDate: null, unlockedAchievements: [],
      lessonGuides: {},
      farmPlots: Array(6).fill(null).map((_, i) => ({ id: i + 1, isUnlocked: i < 2, cropId: null, plantedAt: null, isWatered: false, hasWeed: false, hasBug: false, hasMysteryBox: false })),
      livestockSlots: [1,2,3,4].map(id => ({ id, isUnlocked: true, animalId: null, fedAt: null })).concat([{ id: 5, isUnlocked: false, animalId: null, fedAt: null }]),
      machineSlots: [
          { id: 1, machineId: null, isUnlocked: true, activeRecipeId: null, startedAt: null },
          { id: 2, machineId: null, isUnlocked: false, activeRecipeId: null, startedAt: null }
      ],
      inventory: { 'carrot': 2 }, fertilizers: 1, waterDrops: 5, decorations: [], harvestedCrops: {}, weather: 'SUNNY', petLevel: 1, petExp: 0, missions: [],
      settings: { bgmVolume: 0.3, sfxVolume: 0.8, lowPerformance: false, userName: 'Bé Yêu' } 
    };
  });

  const [screen, setScreen] = useState<Screen>(() => {
     const saved = localStorage.getItem('bunny_english_state');
     if (saved) {
        try {
            const parsed = JSON.parse(saved);
            if (parsed.grade && parsed.textbook) return Screen.HOME;
        } catch {}
     }
     return Screen.ONBOARDING;
  });
  
  const [currentLevelId, setCurrentLevelId] = useState<number>(101);
  const [gameStep, setGameStep] = useState<number>(0); 
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [reviewLevel, setReviewLevel] = useState<LessonLevel | null>(null);
  const [levelRewards, setLevelRewards] = useState<{coins: number, water: number, fertilizer: number, magicBean: number} | null>(null);
  const [showDailyReward, setShowDailyReward] = useState(false);
  const [newAchievement, setNewAchievement] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isBgmMutedState, setIsBgmMutedState] = useState(isBgmMuted);
  const [showAchievements, setShowAchievements] = useState(false); 
  const [showReOnboardModal, setShowReOnboardModal] = useState(false); // NEW STATE FOR MODAL

  const hasInteracted = useRef(false);

  useEffect(() => {
    localStorage.setItem('bunny_english_state', JSON.stringify(userState));
  }, [userState]);

  useEffect(() => {
      const { sfxVolume, bgmVolume } = userState.settings;
      setVolumes(sfxVolume, bgmVolume);
  }, [userState.settings]);

  useEffect(() => {
    const newUnlocks: string[] = [];
    ACHIEVEMENTS_LIST.forEach(ach => {
        if (!userState.unlockedAchievements?.includes(ach.id) && ach.condition(userState)) {
            newUnlocks.push(ach.id);
        }
    });

    if (newUnlocks.length > 0) {
        playSFX('success');
        setUserState(prev => ({
            ...prev,
            unlockedAchievements: [...(prev.unlockedAchievements || []), ...newUnlocks]
        }));
        setNewAchievement(ACHIEVEMENTS_LIST.find(a => a.id === newUnlocks[0])?.title || "Thành tích mới");
        setTimeout(() => setNewAchievement(null), 4000);
    }
  }, [userState.coins, userState.streak, userState.completedLevels, userState.harvestedCrops]);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    if (userState.grade && userState.textbook && userState.lastLoginDate !== today) {
       setTimeout(() => setShowDailyReward(true), 1500); 
       setUserState(prev => ({...prev, lastLoginDate: today, streak: (prev.lastLoginDate ? prev.streak + 1 : 1) })); 
    }
  }, []);

  const handleUserInteraction = useCallback(() => {
    if (!hasInteracted.current) {
      initAudio();
      playBGM(true);
      hasInteracted.current = true;
    }
  }, []);

  const handleBgmToggle = (e: React.MouseEvent) => {
      e.stopPropagation();
      const muted = toggleBgmMute();
      setIsBgmMutedState(muted);
  };

  useEffect(() => {
    window.addEventListener('click', handleUserInteraction);
    window.addEventListener('touchstart', handleUserInteraction);
    return () => {
      window.removeEventListener('click', handleUserInteraction);
      window.removeEventListener('touchstart', handleUserInteraction);
    };
  }, [handleUserInteraction]);

  const handleSettingsUpdate = (newSettings: UserSettings) => {
      setUserState(prev => ({ ...prev, settings: newSettings }));
  };

  const handleResetData = () => {
      localStorage.removeItem('bunny_english_state');
      window.location.reload();
  };

  const claimDailyReward = () => {
      playSFX('success');
      setUserState(prev => ({ 
          ...prev, 
          coins: prev.coins + 100, 
          waterDrops: (prev.waterDrops || 0) + 3 
      })); 
      setShowDailyReward(false);
  };

  const currentAvatar = AVATARS.find(a => a.id === userState.currentAvatarId) || AVATARS[0];
  const currentLevels = getLevels(userState.grade, userState.textbook);
  const currentTextbookName = TEXTBOOKS.find(t => t.id === userState.textbook)?.name || "Chưa chọn sách";
  
  const activeLevel = isReviewMode && reviewLevel 
    ? reviewLevel 
    : currentLevels.find(l => l.id === currentLevelId) || currentLevels[0];

  const handleOnboardingComplete = (grade: number, textbookId: string) => {
    const levels = getLevels(grade, textbookId);
    const startId = levels[0]?.id || 0;
    
    // Only init missions if not already present
    const initialMissions: Mission[] = userState.missions && userState.missions.length > 0 ? userState.missions : [
        { id: 'm0', desc: 'Hoàn thành bài học mới', type: 'LEARN', category: 'DAILY', target: 1, current: 0, reward: { type: 'COIN', amount: 100 }, completed: false, claimed: false },
        { id: 'm1', desc: 'Thu hoạch 5 nông sản', type: 'HARVEST', category: 'DAILY', target: 5, current: 0, reward: { type: 'FERTILIZER', amount: 2 }, completed: false, claimed: false },
        { id: 'm2', desc: 'Kiếm được 500 vàng', type: 'EARN', category: 'DAILY', target: 500, current: 0, reward: { type: 'WATER', amount: 10 }, completed: false, claimed: false }
    ];

    setUserState(prev => ({
      ...prev,
      grade,
      textbook: textbookId,
      unlockedLevels: prev.unlockedLevels.length === 0 ? [startId] : prev.unlockedLevels,
      missions: initialMissions
    }));
    setScreen(Screen.HOME);
    playSFX('success');
  };

  // UPDATED: Open custom modal instead of window.confirm
  const handleReOnboardingClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      playSFX('click');
      setShowReOnboardModal(true);
  };

  const confirmReOnboarding = () => {
      playSFX('click');
      setShowReOnboardModal(false);
      setScreen(Screen.ONBOARDING);
  };

  const handleStartLevel = useCallback((id: number) => {
    setIsReviewMode(false);
    setCurrentLevelId(id);
    setGameStep(0); 
    setLevelRewards({ coins: 0, water: 0, fertilizer: 0, magicBean: 0 }); 
    setScreen(Screen.GAME);
    playSFX('click');
  }, []);

  const handleStartReview = () => {
    const completed = currentLevels.filter(l => userState.completedLevels.includes(l.id));
    if (completed.length === 0) {
        alert("Bé hãy hoàn thành ít nhất 1 bài học để mở khóa tính năng ôn tập nhé!");
        return;
    }
    const allWords = completed.flatMap(l => l.words);
    const randomWords = allWords.sort(() => 0.5 - Math.random()).slice(0, 10);

    const mockReviewLevel: LessonLevel = {
        id: 9999, grade: userState.grade || 1, type: 'GAME', title: "Ôn Tập Nhanh", topic: "Review",
        isLocked: false, stars: 0, words: randomWords, sentences: []
    };

    setReviewLevel(mockReviewLevel);
    setIsReviewMode(true);
    setGameStep(0);
    setLevelRewards({ coins: 0, water: 0, fertilizer: 0, magicBean: 0 });
    setScreen(Screen.GAME);
    playSFX('click');
  };

  const handleGameComplete = (scoreOrCoins: number) => {
    let earnedCoins = scoreOrCoins;
    let earnedWater = 0;
    let earnedFertilizer = 0;

    // GAMIFICATION BALANCE:
    // Review Mode: Gives Farming Resources to encourage daily reviews
    if (isReviewMode) {
        earnedCoins = 20; 
        earnedWater = 5;  // More water for farming
        earnedFertilizer = 2; // Rare item
    } else if (activeLevel.type === 'EXAM') {
        // Time Attack: Score / 5 = Coins (Better rate)
        earnedCoins = Math.floor(scoreOrCoins / 5); 
        // Bonus water for good performance
        if (scoreOrCoins > 100) earnedWater = 3;
    }

    setLevelRewards(prev => prev ? { 
        ...prev, 
        coins: prev.coins + earnedCoins,
        water: prev.water + earnedWater,
        fertilizer: prev.fertilizer + earnedFertilizer
    } : { coins: earnedCoins, water: earnedWater, fertilizer: earnedFertilizer, magicBean: 0 });
    
    playSFX('correct');
    
    if (isReviewMode || activeLevel.type === 'GAME' || activeLevel.type === 'EXAM') {
        setShowConfetti(true);
        playSFX('cheer');
        setGameStep(4); 
        return;
    }

    let nextStep = gameStep + 1;
    if (nextStep === 1 && (!activeLevel.sentences || activeLevel.sentences.length === 0)) nextStep++;
    if (nextStep === 2 && (!activeLevel.words || activeLevel.words.length === 0)) nextStep++;
    
    if (nextStep === 4) {
        setShowConfetti(true);
        playSFX('cheer');
    }
    setGameStep(nextStep);
  };

  const finishLevel = () => {
    playSFX('success');
    setShowConfetti(false);
    
    const earnedCoins = levelRewards?.coins || 50;
    const earnedWater = levelRewards?.water || 0;
    const earnedFertilizer = levelRewards?.fertilizer || 0;
    
    // Default lesson reward: 2 water drops to ensure loop
    const baseWater = !isReviewMode && activeLevel.type === 'LESSON' ? 2 : 0; 
    
    const currentIndex = currentLevels.findIndex(l => l.id === currentLevelId);
    let nextLevelId = currentLevelId; 
    if (currentIndex >= 0 && currentIndex < currentLevels.length - 1) nextLevelId = currentLevels[currentIndex + 1].id;

    setUserState(prev => {
        const currentStars = prev.levelStars?.[currentLevelId] || 0;
        const newStars = earnedCoins >= 90 ? 3 : earnedCoins >= 60 ? 2 : 1;
        
        // Update Learning Missions
        const newMissions = prev.missions?.map(m => {
            if (m.type === 'LEARN' && !m.completed) {
                const newCurrent = m.current + 1;
                return { ...m, current: newCurrent, completed: newCurrent >= m.target };
            }
            return m;
        });

        return {
            ...prev,
            coins: prev.coins + earnedCoins,
            waterDrops: (prev.waterDrops || 0) + baseWater + earnedWater,
            fertilizers: (prev.fertilizers || 0) + earnedFertilizer,
            completedLevels: [...new Set([...prev.completedLevels, currentLevelId])],
            levelStars: { ...prev.levelStars, [currentLevelId]: Math.max(currentStars, newStars) },
            unlockedLevels: [...new Set([...prev.unlockedLevels, nextLevelId])],
            missions: newMissions
        };
    });

    setScreen(isReviewMode ? Screen.HOME : Screen.MAP);
    setIsReviewMode(false);
  };

  const renderGame = () => {
    if (!activeLevel) return <div>Error: Level not found</div>;

    if ((activeLevel.type === 'LESSON' || activeLevel.type === 'GAME') && (!activeLevel.words || activeLevel.words.length === 0)) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-6 text-center text-gray-500">
                <AlertTriangle size={48} className="mb-2 text-yellow-500" />
                <h3 className="font-bold text-lg mb-2">Bài học đang được cập nhật</h3>
                <p className="mb-4">Hiện chưa có dữ liệu từ vựng cho bài này.</p>
                <button onClick={() => setScreen(Screen.MAP)} className="px-6 py-2 bg-blue-500 text-white rounded-xl font-bold">Quay lại</button>
            </div>
        );
    }

    if (activeLevel.type === 'GAME' && gameStep < 4) return <MemoryGame words={activeLevel.words} onComplete={handleGameComplete} />;
    
    if (activeLevel.type === 'EXAM' && gameStep < 4) {
        const reviewPool = currentLevels.filter(l => userState.completedLevels.includes(l.id)).flatMap(l => l.words);
        const finalPool = reviewPool.length > 5 ? reviewPool : activeLevel.words;
        // NOTE: onComplete here passes Score, handled by logic above to convert to Coins
        return <TimeAttackGame words={finalPool} onComplete={handleGameComplete} onExit={() => setScreen(Screen.MAP)} mode="BOSS" />;
    }

    if (gameStep === 0) return <FlashcardGame words={activeLevel.words} onComplete={() => handleGameComplete(activeLevel.words.length * 5)} initialMode={isReviewMode ? 'QUIZ' : 'LEARN'}/>;
    if (gameStep === 1) return <TranslationGame sentences={activeLevel.sentences} onComplete={handleGameComplete} />;
    if (gameStep === 2) return <SpeakingGame words={activeLevel.words} onComplete={handleGameComplete} />;
    if (gameStep === 3) return <LessonGuide level={activeLevel} userState={userState} onUpdateState={setUserState} onComplete={() => handleGameComplete(0)} />;

    if (gameStep === 4) {
      const earnedCoins = levelRewards?.coins || 0;
      const earnedWater = (levelRewards?.water || 0) + (!isReviewMode && activeLevel.type === 'LESSON' ? 2 : 0);
      const earnedFert = levelRewards?.fertilizer || 0;

      return (
        <div className="flex flex-col items-center justify-center h-full animate-fadeIn text-center p-6 relative">
          <div className="text-8xl mb-4 animate-bounce">🏆</div>
          <h2 className="text-4xl font-black text-yellow-500 mb-6 drop-shadow-sm">{isReviewMode ? "Ôn tập xuất sắc!" : "Chiến thắng rồi!"}</h2>
          <div className="bg-white/90 p-8 rounded-[2.5rem] shadow-xl border-4 border-yellow-200 w-full max-w-sm">
              <h3 className="font-black text-gray-400 mb-4 uppercase text-sm tracking-widest">Phần thưởng của bé</h3>
              <div className="flex justify-around items-center">
                  <div className="flex flex-col items-center gap-1">
                      <div className="text-yellow-500 font-black text-3xl flex items-center gap-1">+{earnedCoins} <Coins size={24} fill="currentColor"/></div>
                      <div className="text-xs text-gray-400 font-bold uppercase">Vàng</div>
                  </div>
                  {(earnedWater > 0) && (
                      <>
                        <div className="w-px h-12 bg-gray-200"></div>
                        <div className="flex flex-col items-center gap-1">
                            <div className="text-blue-500 font-black text-3xl flex items-center gap-1">+{earnedWater} <Droplets size={24} fill="currentColor"/></div>
                            <div className="text-xs text-gray-400 font-bold uppercase">Nước</div>
                        </div>
                      </>
                  )}
                  {(earnedFert > 0) && (
                      <>
                        <div className="w-px h-12 bg-gray-200"></div>
                        <div className="flex flex-col items-center gap-1">
                            <div className="text-purple-500 font-black text-3xl flex items-center gap-1">+{earnedFert} <Zap size={24} fill="currentColor"/></div>
                            <div className="text-xs text-gray-400 font-bold uppercase">Phân bón</div>
                        </div>
                      </>
                  )}
              </div>
          </div>
          <button onClick={finishLevel} className="mt-8 px-8 py-5 bg-gradient-to-r from-green-400 to-emerald-600 text-white rounded-3xl font-black text-2xl shadow-xl shadow-green-200 hover:scale-105 transition-transform z-10 w-full max-w-sm active:scale-95">
            {isReviewMode ? "Về trang chủ" : "Tiếp tục ngay"}
          </button>
        </div>
      );
    }
    return null;
  };

  const renderGameTabs = () => {
    if (!activeLevel || isReviewMode || activeLevel.type !== 'LESSON') return null;
    const steps = [
       { icon: <Book size={16}/>, label: "Từ vựng", has: activeLevel.words.length > 0 },
       { icon: <Languages size={16}/>, label: "Dịch câu", has: activeLevel.sentences.length > 0 },
       { icon: <Mic size={16}/>, label: "Luyện nói", has: activeLevel.words.length > 0 },
       { icon: <GraduationCap size={16}/>, label: "Bí kíp", has: true }
    ];

    return (
      <div className="flex justify-center gap-2 p-3 bg-white/80 backdrop-blur-sm border-b border-gray-100 overflow-x-auto no-scrollbar">
        {steps.map((s, idx) => s.has && (
          <button key={idx} onClick={() => { setGameStep(idx); playSFX('click'); }} className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap ${gameStep === idx ? 'bg-blue-500 text-white shadow-md' : 'bg-gray-100 text-gray-500'}`}>
            {s.icon} {s.label}
          </button>
        ))}
      </div>
    );
  };

  if (screen === Screen.ONBOARDING) return <Onboarding onComplete={handleOnboardingComplete} />;

  return (
    <div className="w-full h-screen bg-sky-50 font-sans text-gray-800 overflow-hidden flex flex-col relative" onClick={handleUserInteraction}>
      {showConfetti && (
          <div className="absolute inset-0 pointer-events-none z-[60] overflow-hidden">
              {[...Array(40)].map((_, i) => (
                  <div key={i} className="absolute animate-confetti" style={{
                      left: `${Math.random() * 100}%`,
                      top: `-${Math.random() * 20}%`,
                      backgroundColor: ['#ff0', '#f00', '#0f0', '#00f', '#f0f', '#0ff'][Math.floor(Math.random() * 6)],
                      width: `${8 + Math.random() * 12}px`, 
                      height: `${8 + Math.random() * 12}px`,
                      animationDuration: `${2 + Math.random() * 2}s`,
                      animationDelay: `${Math.random()}s`
                  }} />
              ))}
          </div>
      )}
      
      <style>{`
        @keyframes confetti {
            0% { transform: translateY(0) rotate(0deg) scale(1); opacity: 1; } 
            50% { opacity: 1; }
            100% { transform: translateY(100vh) rotate(1440deg) scale(0.5); opacity: 0; }
        }
        .animate-confetti { animation: confetti linear forwards; }
      `}</style>

      <div className="absolute inset-0 pointer-events-none z-0 opacity-30 overflow-hidden">
         {!userState.settings.lowPerformance && (
             <>
                <div className="absolute top-10 left-10 text-6xl opacity-50 animate-pulse">☁️</div>
                <div className="absolute bottom-20 right-10 text-6xl opacity-50 animate-bounce">🌿</div>
             </>
         )}
      </div>

      {![Screen.TIME_ATTACK, Screen.FARM].includes(screen) && (
        <div className="bg-white p-3 shadow-sm flex items-center justify-between sticky top-0 z-50 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => { setScreen(Screen.HOME); playSFX('click'); }}
              className={`p-2 rounded-2xl transition-all ${screen === Screen.HOME ? 'bg-blue-500 text-white shadow-lg shadow-blue-200' : 'text-gray-400 hover:bg-gray-100'}`}
            >
              <Home size={24} />
            </button>
            <div 
              className="flex items-center gap-2 cursor-pointer hover:scale-105 transition-transform" 
              onClick={() => { setScreen(Screen.SHOP); playSFX('click'); }}
            >
              <Avatar emoji={currentAvatar.emoji} bgGradient={currentAvatar.bgGradient} size="sm" />
              <div className="hidden sm:block">
                <span className="font-black text-base block leading-none text-slate-800">{userState.settings.userName || "Bé Yêu"}</span>
                <span className="text-xs font-bold text-blue-500 uppercase tracking-widest">Lớp {userState.grade}</span>
              </div>
            </div>
            {/* Edit Grade/Book Button - UPDATED HANDLER */}
            {screen === Screen.HOME && (
                <button 
                    onClick={handleReOnboardingClick} 
                    className="p-3 ml-2 bg-white rounded-2xl text-slate-400 hover:text-blue-500 hover:bg-blue-50 border-2 border-transparent hover:border-blue-100 transition-all active:scale-90 shadow-sm relative z-50 pointer-events-auto" 
                    title="Chọn lại lớp"
                    aria-label="Chọn lại lớp"
                >
                    <Edit3 size={18} />
                </button>
            )}
          </div>
          
          <div className="flex items-center gap-2 sm:gap-3">
            <button onClick={handleBgmToggle} className={`p-2.5 rounded-2xl transition-all ${isBgmMutedState ? 'bg-gray-100 text-gray-400' : 'bg-purple-100 text-purple-600 shadow-sm shadow-purple-200'}`}>
                {isBgmMutedState ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>
            <div className="bg-yellow-100 px-4 py-2 rounded-2xl flex items-center gap-2 border-2 border-yellow-300 shadow-sm">
              <Coins size={20} className="text-yellow-500" fill="currentColor" />
              <span className="font-black text-yellow-700 text-lg leading-none">{userState.coins}</span>
            </div>
            <button onClick={() => { setShowAchievements(true); playSFX('click'); }} className="p-2.5 rounded-2xl text-gray-400 hover:bg-gray-100 transition-all"><Trophy size={24} /></button>
            <button onClick={() => { setShowSettings(true); playSFX('click'); }} className="p-2.5 rounded-2xl text-gray-400 hover:bg-gray-100 transition-all"><SettingsIcon size={24} /></button>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto relative flex flex-col z-10">
        
        {screen === Screen.HOME && (
           <div className="flex flex-col items-center justify-center h-full p-6 text-center animate-fadeIn">
              <div className="relative mb-6">
                <div className="cursor-pointer" onClick={() => { setScreen(Screen.SHOP); playSFX('click'); }}>
                  <Avatar emoji={currentAvatar.emoji} bgGradient={currentAvatar.bgGradient} size="lg" animate={!userState.settings.lowPerformance} />
                </div>
                {userState.streak > 0 && <div className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full animate-bounce border-4 border-white shadow-lg">{userState.streak} ngày 🔥</div>}
              </div>
              <h1 className="text-4xl font-black text-slate-800 mb-2 tracking-tight">Chào {userState.settings.userName || "Bé"}!</h1>
              <div className="flex items-center justify-center gap-2 mb-8">
                  <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">Hôm nay bé muốn làm gì nào?</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
                <button onClick={() => { setScreen(Screen.MAP); playSFX('click'); }} className="col-span-2 py-5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-[2rem] font-black text-2xl shadow-xl shadow-blue-200 flex items-center justify-center gap-3 hover:scale-105 active:scale-95 transition-transform"><Play fill="white" size={28}/> BẮT ĐẦU HỌC</button>
                <button onClick={() => { setScreen(Screen.FARM); playSFX('click'); }} className="py-4 bg-emerald-500 text-white rounded-[1.5rem] font-black text-lg shadow-xl shadow-emerald-200 flex flex-col items-center justify-center gap-1 hover:scale-105 active:scale-95 transition-transform"><Sprout size={28}/> NÔNG TRẠI</button>
                <button onClick={() => { setScreen(Screen.TIME_ATTACK); playSFX('click'); }} className="py-4 bg-rose-500 text-white rounded-[1.5rem] font-black text-lg shadow-xl shadow-rose-200 flex flex-col items-center justify-center gap-1 hover:scale-105 active:scale-95 transition-transform"><Flame size={28}/> TỐC ĐỘ</button>
                <button onClick={handleStartReview} className="py-4 bg-purple-500 text-white rounded-[1.5rem] font-black text-lg shadow-xl shadow-purple-200 flex flex-col items-center justify-center gap-1 hover:scale-105 active:scale-95 transition-transform"><Zap size={28}/> ÔN TẬP</button>
                <button onClick={() => { setScreen(Screen.SHOP); playSFX('click'); }} className="py-4 bg-pink-500 text-white rounded-[1.5rem] font-black text-lg shadow-xl shadow-pink-200 flex flex-col items-center justify-center gap-1 hover:scale-105 active:scale-95 transition-transform"><ShoppingBag size={28}/> TRANG BỊ</button>
              </div>
              <div className="mt-6 text-xs text-slate-400 font-bold bg-white px-4 py-2 rounded-full shadow-sm border border-slate-100">
                  Đang học: <span className="text-blue-500">Lớp {userState.grade}</span> - <span className="text-green-600">{currentTextbookName}</span>
              </div>
           </div>
        )}

        {screen === Screen.MAP && (
          <MapScreen 
            levels={currentLevels}
            unlockedLevels={userState.unlockedLevels}
            completedLevels={userState.completedLevels}
            levelStars={userState.levelStars}
            onStartLevel={handleStartLevel}
          />
        )}

        {screen === Screen.GAME && (
           <div className="h-full flex flex-col animate-fadeIn bg-white sm:bg-transparent">
             <div className="px-4 py-2 bg-white shadow-sm flex items-center justify-between z-10 border-b border-gray-100">
               <button onClick={() => { setScreen(isReviewMode ? Screen.HOME : Screen.MAP); playSFX('click'); }} className="p-2 -ml-2 text-gray-500 hover:bg-gray-100 rounded-full flex items-center gap-1 font-bold"><ArrowLeft size={20} /> Thoát</button>
               <span className="font-bold text-gray-700 truncate max-w-[200px]">{activeLevel.title}</span>
               <div className="w-8"></div>
             </div>
             {renderGameTabs()}
             <div className="flex-1 overflow-y-auto">{renderGame()}</div>
           </div>
        )}

        {/* Pass levels to Farm for smart content filtering */}
        {screen === Screen.FARM && <Farm userState={userState} onUpdateState={setUserState} onExit={() => setScreen(Screen.HOME)} allWords={currentLevels.flatMap(l => l.words)} levels={currentLevels} />}
        {/* Pass ALL words to Time Attack for maximum replayability */}
        {screen === Screen.TIME_ATTACK && <TimeAttackGame words={currentLevels.flatMap(l => l.words)} onComplete={(s) => handleGameComplete(s)} onExit={() => setScreen(Screen.HOME)} mode="BOSS" />}
        {screen === Screen.SHOP && (
            <div className="p-6 max-w-lg mx-auto animate-fadeIn">
                <div className="flex items-center gap-2 mb-6"><ShoppingBag className="text-pink-600" size={32}/><h2 className="text-3xl font-black text-pink-900 tracking-tight">Cửa hàng trang phục</h2></div>
                <div className="grid grid-cols-2 gap-4">
                    {AVATARS.map(avatar => {
                        const isSelected = userState.currentAvatarId === avatar.id;
                        return (
                            <div key={avatar.id} className={`bg-white p-6 rounded-[2rem] shadow-md border-b-[6px] flex flex-col items-center gap-4 transition-all ${isSelected ? 'border-purple-500 bg-purple-50' : 'border-gray-200'}`}>
                                <Avatar emoji={avatar.emoji} bgGradient={avatar.bgGradient} size="md" />
                                <h3 className="font-black text-slate-800 text-center text-sm">{avatar.name}</h3>
                                {isSelected ? <span className="text-green-600 font-black text-xs bg-green-100 px-4 py-1.5 rounded-full border-2 border-green-200 uppercase tracking-widest">Đang dùng</span> : 
                                <button onClick={() => { if(userState.coins >= avatar.cost) { setUserState(prev => ({ ...prev, currentAvatarId: avatar.id, coins: prev.coins - avatar.cost })); playSFX('success'); } else { alert("Bé chưa đủ Vàng rồi!"); } }} className="w-full py-2 bg-slate-100 hover:bg-blue-100 text-blue-600 rounded-xl font-black text-xs flex items-center justify-center gap-1 active:scale-95 transition-transform">{avatar.cost === 0 ? "MIỄN PHÍ" : <>{avatar.cost} <Coins size={14} fill="currentColor" /></>}</button>}
                            </div>
                        )
                    })}
                </div>
            </div>
        )}
        
        {showSettings && <Settings userState={userState} onUpdateSettings={handleSettingsUpdate} onResetData={handleResetData} onClose={() => setShowSettings(false)} />}
        
        {/* Achievements Modal */}
        {showAchievements && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-fadeIn">
                <div className="bg-white w-full max-w-md rounded-[3rem] shadow-2xl overflow-hidden h-[80vh] flex flex-col">
                    <Achievements userState={userState} onClose={() => setShowAchievements(false)} />
                </div>
            </div>
        )}

        {/* CUSTOM MODAL FOR RE-ONBOARDING */}
        {showReOnboardModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fadeIn">
                <div className="bg-white rounded-[2.5rem] p-8 max-w-sm w-full text-center relative border-4 border-blue-100 shadow-2xl">
                    <button onClick={() => setShowReOnboardModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X size={24} /></button>
                    <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600">
                        <GraduationCap size={40} />
                    </div>
                    <h3 className="text-xl font-black text-slate-800 mb-2">Chọn lại lớp học?</h3>
                    <p className="text-gray-500 font-bold text-sm mb-8 leading-relaxed">
                        Bé muốn chọn lại Lớp và Sách học phải không? Tiến trình học hiện tại của sách cũ sẽ được lưu lại nhé.
                    </p>
                    <div className="flex gap-3">
                        <button onClick={() => setShowReOnboardModal(false)} className="flex-1 py-3 bg-gray-100 text-gray-500 rounded-2xl font-bold hover:bg-gray-200 transition-colors">Không</button>
                        <button onClick={confirmReOnboarding} className="flex-1 py-3 bg-blue-500 text-white rounded-2xl font-bold hover:bg-blue-600 transition-colors shadow-lg shadow-blue-200">Đồng ý</button>
                    </div>
                </div>
            </div>
        )}

        {showDailyReward && (
            <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-4 animate-fadeIn backdrop-blur-sm">
                <div className="bg-white rounded-[2.5rem] shadow-2xl p-10 max-w-sm w-full text-center relative animate-bounce border-4 border-yellow-400">
                    <div className="text-8xl mb-4">🎁</div>
                    <h2 className="text-3xl font-black text-slate-800 mb-2 tracking-tight">Quà hàng ngày!</h2>
                    <p className="text-gray-500 font-bold mb-8">Chào bé yêu quay trở lại, tặng bé quà nè!</p>
                    <button onClick={claimDailyReward} className="w-full py-5 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-3xl font-black text-2xl shadow-xl shadow-orange-200 active:scale-95 transition-transform flex items-center justify-center gap-2">Nhận 100 <Coins size={28} fill="currentColor" /></button>
                </div>
            </div>
        )}
        {newAchievement && (
            <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-[80] animate-bounce">
                <div className="bg-yellow-400 text-white px-8 py-4 rounded-full shadow-2xl flex items-center gap-3 border-4 border-white">
                    <Trophy size={32} /> <span className="font-black text-xl tracking-tight">{newAchievement}</span>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default App;
