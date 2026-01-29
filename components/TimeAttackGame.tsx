
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Word } from '../types';
import { Clock, Zap, Home, Skull, Sword, Snowflake, Bomb, Heart, Volume2, Check, X, Type, Star, Shield, Lock, ArrowRight, RefreshCcw, Play, Trophy, Sparkles, Coins } from 'lucide-react';
import { playSFX } from '../utils/sound';

interface TimeAttackGameProps {
  words: Word[];
  onComplete: (score: number) => void;
  onExit: () => void;
}

type QuestionType = 'EN_TO_VI' | 'VI_TO_EN' | 'LISTEN' | 'SPELLING' | 'TRUE_FALSE' | 'MIXED';

interface StageConfig {
    id: number;
    globalId: number; // 1 to 50
    name: string;
    type: QuestionType;
    target: number; 
    timeAdd: number; 
    desc: string;
    icon: any;
}

interface DoorConfig {
    id: number;
    name: string;
    bg: string;
    bossEmoji: string;
    stages: StageConfig[];
}

const generateMisspelling = (word: string): string => {
    const chars = word.split('');
    if (chars.length < 3) return word + 's';
    const r = Math.random();
    if (r < 0.33) {
        const idx = Math.floor(Math.random() * chars.length);
        chars.splice(idx, 0, chars[idx]);
    } else if (r < 0.66) {
        const idx = Math.floor(Math.random() * chars.length);
        chars.splice(idx, 1);
    } else {
        const idx = Math.floor(Math.random() * (chars.length - 1));
        const temp = chars[idx];
        chars[idx] = chars[idx+1];
        chars[idx+1] = temp;
    }
    return chars.join('');
};

// Algorithmic Level Generation for 50 Levels (10 Worlds x 5 Stages)
const generateLevelData = (): DoorConfig[] => {
    const worlds = [
        { name: "Khu Rừng Nhỏ", bg: "bg-emerald-900", boss: "🌲" },
        { name: "Hang Động Đá", bg: "bg-stone-800", boss: "🦇" },
        { name: "Sa Mạc Nóng", bg: "bg-amber-900", boss: "🦂" },
        { name: "Biển Sâu", bg: "bg-blue-950", boss: "🐙" },
        { name: "Vùng Băng Giá", bg: "bg-cyan-900", boss: "🥶" },
        { name: "Núi Lửa", bg: "bg-red-950", boss: "🐉" },
        { name: "Lâu Đài Ma", bg: "bg-purple-950", boss: "👻" },
        { name: "Thế Giới Kẹo", bg: "bg-pink-900", boss: "🍭" },
        { name: "Thành Phố Máy", bg: "bg-slate-900", boss: "🤖" },
        { name: "Vũ Trụ", bg: "bg-indigo-950", boss: "👽" },
    ];

    let globalCounter = 1;

    return worlds.map((world, wIdx) => {
        const stages: StageConfig[] = [];
        const baseTarget = 5 + wIdx * 2; 
        const timeBonus = Math.max(2, 6 - Math.ceil(wIdx / 2)); 

        for (let s = 1; s <= 5; s++) {
            let type: QuestionType = 'EN_TO_VI';
            let icon = Type;
            let name = `Màn ${s}`;
            let desc = "Cố lên!";

            // Determine stage type pattern
            if (s === 1) { type = 'EN_TO_VI'; icon = Type; desc = "Dịch Việt"; }
            else if (s === 2) { type = 'VI_TO_EN'; icon = Type; desc = "Dịch Anh"; }
            else if (s === 3) { type = 'LISTEN'; icon = Volume2; desc = "Luyện nghe"; }
            else if (s === 4) { type = 'TRUE_FALSE'; icon = Check; desc = "Đúng hay Sai?"; }
            else if (s === 5) { type = 'MIXED'; icon = Skull; desc = "Đấu Trùm!"; } 

            stages.push({
                id: s,
                globalId: globalCounter++,
                name: s === 5 ? `BOSS` : name,
                type,
                target: s === 5 ? baseTarget * 1.5 : baseTarget,
                timeAdd: timeBonus,
                desc,
                icon
            });
        }

        return {
            id: wIdx + 1,
            name: world.name,
            bg: world.bg,
            bossEmoji: world.boss,
            stages
        };
    });
};

export const TimeAttackGame: React.FC<TimeAttackGameProps> = ({ words, onComplete, onExit }) => {
  const DOORS = useMemo<DoorConfig[]>(() => generateLevelData(), []);

  // Persistent progress (in a real app this would be in userState, local storage for now)
  const [maxUnlockedLevel, setMaxUnlockedLevel] = useState(() => {
      const saved = localStorage.getItem('time_attack_progress');
      return saved ? parseInt(saved) : 1;
  });

  // States
  const [gameState, setGameState] = useState<'INTRO' | 'DOOR_TRANSITION' | 'PLAYING' | 'GAME_OVER' | 'VICTORY'>('INTRO');
  
  // Selection State
  const [selectedWorldIdx, setSelectedWorldIdx] = useState(0);

  // Gameplay State
  const [currentDoorIdx, setCurrentDoorIdx] = useState(0);
  const [currentStageIdx, setCurrentStageIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60); 
  const [score, setScore] = useState(0);
  const [progress, setProgress] = useState(0);
  
  // Reward animation state
  const [showReward, setShowReward] = useState(false);
  
  // Question Data
  const [currentWord, setCurrentWord] = useState<Word | null>(null);
  const [options, setOptions] = useState<any[]>([]);
  const [questionType, setQuestionType] = useState<QuestionType>('EN_TO_VI');
  const [trueFalseAnswer, setTrueFalseAnswer] = useState<boolean>(true);
  const [fakeWord, setFakeWord] = useState<Word | null>(null);

  // Power-ups & Effects
  const [powerUps, setPowerUps] = useState({ freeze: 1, bomb: 1, time: 1 });
  const [isFrozen, setIsFrozen] = useState(false);
  const [disabledOptions, setDisabledOptions] = useState<string[]>([]);
  const [shake, setShake] = useState(false);
  const [flash, setFlash] = useState<'GREEN' | 'RED' | null>(null);
  const [bossShake, setBossShake] = useState(false);
  const [combo, setCombo] = useState(0);
  const [isPaused, setIsPaused] = useState(false); 

  const timerRef = useRef<number | null>(null);
  
  const currentDoor = DOORS[currentDoorIdx];
  const currentStage = currentDoor.stages[currentStageIdx];
  const isBossStage = currentStageIdx === currentDoor.stages.length - 1;
  const isFever = combo >= 5;

  useEffect(() => {
      localStorage.setItem('time_attack_progress', maxUnlockedLevel.toString());
  }, [maxUnlockedLevel]);

  useEffect(() => {
      if (words.length < 4) {
          alert("Cần ít nhất 4 từ vựng để chơi chế độ này!");
          onExit();
      }
  }, [words]);

  // Main Timer Logic
  useEffect(() => {
    if (gameState === 'PLAYING' && !isFrozen && !isPaused) {
        timerRef.current = window.setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 0) {
                    handleGameOver();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    } else {
        if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [gameState, isFrozen, isPaused]);

  const handleGameOver = () => {
      setGameState('GAME_OVER');
      playSFX('wrong');
  };

  const initLevel = (doorIdx: number, stageIdx: number) => {
      setCurrentDoorIdx(doorIdx);
      setCurrentStageIdx(stageIdx);
      setGameState('DOOR_TRANSITION');
      
      // Reset stats for new run
      setScore(0);
      setCombo(0);
      setTimeLeft(60); 
      setPowerUps({ freeze: 1, bomb: 1, time: 1 });
  };

  const startLevel = () => {
      setGameState('PLAYING');
      setProgress(0);
      setIsPaused(false);
      nextQuestion();
  };

  const nextQuestion = () => {
      setIsPaused(false);
      let type = currentStage.type;
      
      if (type === 'MIXED') {
          const types: QuestionType[] = ['EN_TO_VI', 'VI_TO_EN', 'LISTEN', 'TRUE_FALSE', 'SPELLING'];
          type = types[Math.floor(Math.random() * types.length)];
      }

      setQuestionType(type);

      const randomIdx = Math.floor(Math.random() * words.length);
      const target = words[randomIdx];
      setCurrentWord(target);
      
      setDisabledOptions([]);
      setFlash(null);

      // Generate Options logic...
      if (type === 'TRUE_FALSE') {
          const isCorrect = Math.random() > 0.5;
          setTrueFalseAnswer(isCorrect);
          if (isCorrect) {
              setFakeWord(null); 
          } else {
              const fakePool = words.filter(w => w.id !== target.id);
              let fake = fakePool[Math.floor(Math.random() * fakePool.length)];
              setFakeWord(fake);
          }
          setOptions([true, false]);
      } else if (type === 'SPELLING') {
          const correct = target.english;
          const wrong1 = generateMisspelling(correct);
          let wrong2 = generateMisspelling(correct);
          while(wrong2 === wrong1) wrong2 = generateMisspelling(correct);
          let wrong3 = generateMisspelling(correct);
          while(wrong3 === wrong1 || wrong3 === wrong2) wrong3 = generateMisspelling(correct);
          
          setOptions([
              { id: target.id, text: correct, isCorrect: true },
              { id: 'w1', text: wrong1, isCorrect: false },
              { id: 'w2', text: wrong2, isCorrect: false },
              { id: 'w3', text: wrong3, isCorrect: false }
          ].sort(() => 0.5 - Math.random()));
      } else {
          const distractors = words.filter(w => w.id !== target.id)
                                   .sort(() => 0.5 - Math.random())
                                   .slice(0, 3);
          const fullOptions = [target, ...distractors].sort(() => 0.5 - Math.random());
          setOptions(fullOptions.slice(0, 4));
      }

      if (type === 'LISTEN') {
          setTimeout(() => playAudio(target.english), 200);
      }
  };

  const playAudio = (text: string) => {
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'en-US';
      u.rate = 0.9;
      window.speechSynthesis.speak(u);
  }

  const handleAnswer = (answer: any) => {
      if (gameState !== 'PLAYING' || !currentWord || isPaused) return;

      let isCorrect = false;
      if (questionType === 'TRUE_FALSE') isCorrect = answer === trueFalseAnswer;
      else if (questionType === 'SPELLING') isCorrect = answer.isCorrect === true;
      else isCorrect = answer.id === currentWord.id;

      if (isCorrect) {
          playSFX('correct');
          setIsPaused(true); 
          
          const comboBonus = Math.floor(combo / 3) * 10;
          const feverMultiplier = isFever ? 2 : 1;
          setScore(prev => prev + (20 + comboBonus) * feverMultiplier);
          setCombo(prev => prev + 1);
          setFlash('GREEN');
          setTimeLeft(prev => Math.min(prev + currentStage.timeAdd, 99));

          const newProgress = progress + 1;
          setProgress(newProgress);

          if (isBossStage) {
              setBossShake(true);
              if (newProgress % 2 === 0) playSFX('harvest'); 
              setTimeout(() => setBossShake(false), 300);
          }

          if (newProgress >= currentStage.target) {
              playSFX(isBossStage ? 'cheer' : 'success');
              
              // Unlock next level if this was the furthest
              if (currentStage.globalId === maxUnlockedLevel && maxUnlockedLevel < 50) {
                  setMaxUnlockedLevel(prev => prev + 1);
              }

              // Check if end of world
              if (currentStageIdx < currentDoor.stages.length - 1) {
                  // Next stage in same world
                  setTimeout(() => {
                      setCurrentStageIdx(prev => prev + 1);
                      setProgress(0);
                      nextQuestion();
                  }, 500);
              } else {
                  // World Completed
                  setTimeout(() => setGameState('VICTORY'), 500);
              }
              return;
          }
          setTimeout(nextQuestion, 400); 
      } else {
          playSFX('wrong');
          setShake(true);
          setTimeout(() => setShake(false), 400);
          setFlash('RED');
          setCombo(0);
          setTimeLeft(prev => Math.max(prev - 2, 0)); 
          setIsPaused(true); 
          setTimeout(nextQuestion, 800); 
      }
  };

  const useFreeze = () => { 
      if (powerUps.freeze > 0 && !isFrozen) { 
          setPowerUps(p => ({ ...p, freeze: p.freeze - 1 })); 
          setIsFrozen(true); 
          playSFX('flip'); 
          setTimeout(() => setIsFrozen(false), 5000); 
      }
  };
  const useBomb = () => { 
      if (powerUps.bomb > 0 && !['TRUE_FALSE','SPELLING'].includes(questionType)) { 
          setPowerUps(p => ({ ...p, bomb: p.bomb - 1 })); 
          playSFX('flip'); 
          const wrongOptions = options.filter(o => o.id !== currentWord?.id); 
          setDisabledOptions(wrongOptions.slice(0, 2).map(w => w.id)); 
      }
  };
  const useHeal = () => { 
      if (powerUps.time > 0) { 
          setPowerUps(p => ({ ...p, time: p.time - 1 })); 
          playSFX('success'); 
          setTimeLeft(prev => Math.min(prev + 15, 99)); 
      }
  };

  const handleClaimReward = () => {
      playSFX('success');
      setShowReward(true);
      // Wait for animation before completing
      setTimeout(() => {
          onComplete(score);
      }, 3000);
  };

  // --- RENDER ---
  const renderHeader = () => (
    <div className={`flex items-center justify-between px-4 py-3 backdrop-blur-md z-20 border-b shadow-lg transition-colors duration-300 ${isFever ? 'bg-orange-500/80 border-yellow-300' : 'bg-black/30 border-white/10'}`}>
        <div className="flex items-center gap-3">
            <button onClick={() => setGameState('INTRO')} className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors"><Home size={20}/></button>
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border-2 transition-colors ${timeLeft < 10 ? 'bg-red-600/80 border-red-400 animate-pulse' : 'bg-black/40 border-white/20'}`}>
                {isPaused && !isFrozen ? <Clock size={16} className="text-yellow-400"/> : <Clock size={16} className={timeLeft < 10 ? 'animate-spin' : ''}/>}
                <span className="font-mono font-black text-lg w-8 text-center">{timeLeft}</span>
            </div>
        </div>
        <div className="flex flex-col items-center">
            <div className="text-sm font-black text-yellow-400 flex items-center gap-2">
                {isBossStage ? <span className="text-red-500 animate-pulse flex items-center gap-1"><Skull size={14}/> BOSS</span> : `Màn ${currentStage.id}`}
            </div>
        </div>
        <div className="flex flex-col items-end">
            <div className="text-white font-black text-xl leading-none drop-shadow-md">Điểm: {score}</div>
            {isFever && <div className="text-[10px] font-black text-yellow-300 animate-bounce">🔥 FEVER x2</div>}
        </div>
    </div>
  );

  const renderQuestionCard = () => {
      if (!currentWord) return null;
      if (questionType === 'TRUE_FALSE') {
          const displayWord = trueFalseAnswer ? currentWord : (fakeWord || currentWord);
          return (
              <div className="w-full max-w-sm mb-4 bg-white/10 backdrop-blur-xl p-4 rounded-[2rem] border-2 border-white/20 text-center shadow-2xl">
                  <div className="flex flex-col items-center gap-2">
                      <div className="text-2xl text-white/80 font-bold mb-2 uppercase">Có phải nghĩa là?</div>
                      <div className="text-4xl font-black text-yellow-300 drop-shadow-md">{displayWord.vietnamese}</div>
                      <div className="my-2 text-white/50 text-sm">--- so với ---</div>
                      <div className="text-4xl font-black text-white drop-shadow-md">{currentWord.english}</div>
                  </div>
              </div>
          );
      }
      if (questionType === 'LISTEN') {
          return (
              <div className="w-full max-w-sm mb-4 bg-white/10 backdrop-blur-xl p-6 rounded-[2rem] border-2 border-white/20 text-center shadow-2xl">
                  <button onClick={() => playAudio(currentWord.english)} className="w-24 h-24 bg-purple-500 rounded-full flex items-center justify-center mx-auto shadow-lg animate-pulse border-4 border-purple-300">
                      <Volume2 size={48} className="text-white"/>
                  </button>
                  <p className="mt-4 text-sm font-bold text-white/80">Nghe và chọn từ đúng</p>
              </div>
          );
      }
      return (
          <div className="w-full max-w-sm mb-6 bg-white/10 backdrop-blur-xl p-8 rounded-[2rem] border-2 border-white/20 text-center shadow-2xl">
              <h2 className={`text-4xl sm:text-5xl font-black drop-shadow-md break-words leading-tight ${questionType === 'VI_TO_EN' ? 'text-yellow-300' : 'text-white'}`}>
                  {questionType === 'VI_TO_EN' ? currentWord.vietnamese : questionType === 'SPELLING' ? `"${currentWord.vietnamese}"` : currentWord.english}
              </h2>
              {questionType === 'SPELLING' && <p className="text-sm mt-3 text-white/60 font-bold">Chọn từ viết đúng chính tả</p>}
              {questionType === 'EN_TO_VI' && <p className="text-sm mt-3 text-white/60 font-bold">Chọn nghĩa tiếng Việt</p>}
          </div>
      );
  };

  const renderOptions = () => {
      if (questionType === 'TRUE_FALSE') {
          return (
              <div className="flex gap-4 w-full max-w-sm">
                  <button onClick={() => handleAnswer(true)} className="flex-1 py-6 bg-green-500 rounded-3xl shadow-lg border-b-8 border-green-700 active:border-b-0 active:translate-y-2 transition-all flex flex-col items-center justify-center gap-1">
                      <Check size={40} className="text-white"/>
                      <span className="text-xl font-black text-white uppercase">Đúng</span>
                  </button>
                  <button onClick={() => handleAnswer(false)} className="flex-1 py-6 bg-red-500 rounded-3xl shadow-lg border-b-8 border-red-700 active:border-b-0 active:translate-y-2 transition-all flex flex-col items-center justify-center gap-1">
                      <X size={40} className="text-white"/>
                      <span className="text-xl font-black text-white uppercase">Sai</span>
                  </button>
              </div>
          );
      }
      return (
          <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
              {options.slice(0, 4).map((opt, idx) => { 
                  const id = opt.id || idx;
                  const isDisabled = disabledOptions.includes(id);
                  const content = questionType === 'SPELLING' ? opt.text :
                                  ['LISTEN','VI_TO_EN'].includes(questionType) ? opt.english : opt.vietnamese;
                  return (
                      <button key={id} disabled={isDisabled} onClick={() => handleAnswer(opt)} className={`relative p-4 rounded-2xl font-bold text-lg shadow-lg active:scale-95 transition-all min-h-[80px] flex items-center justify-center leading-tight ${isDisabled ? 'bg-slate-800/50 text-slate-600 cursor-not-allowed border-2 border-slate-700' : 'bg-white text-slate-900 hover:bg-blue-50 border-b-[6px] border-slate-300 active:border-b-0 active:translate-y-1.5'}`}>
                          {content}
                          {isDisabled && <Skull className="absolute inset-0 m-auto text-slate-500 opacity-50" size={24}/>}
                      </button>
                  )
              })}
          </div>
      );
  };

  if (gameState === 'INTRO' || gameState === 'DOOR_TRANSITION') return renderIntroOrTransition();
  if (gameState === 'VICTORY' || gameState === 'GAME_OVER') return renderEndGame();

  const bossHpPercent = isBossStage ? ((currentStage.target - progress) / currentStage.target) * 100 : 0;
  const stageProgressPercent = !isBossStage ? (progress / currentStage.target) * 100 : 0;

  return (
    <div className={`flex flex-col h-full ${currentDoor.bg} text-white relative overflow-hidden transition-colors duration-1000`}>
        <div className={`absolute inset-0 pointer-events-none z-0 transition-opacity duration-200 ${flash === 'RED' ? 'bg-red-500/30' : flash === 'GREEN' ? 'bg-green-500/30' : 'opacity-0'}`} />
        {isFrozen && <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center border-[20px] border-blue-300/50 bg-blue-500/10"><Snowflake size={100} className="text-blue-200 animate-spin-slow opacity-80"/></div>}
        {renderHeader()}
        <div className="w-full h-3 bg-black/40 relative">
            {isBossStage ? <div className="h-full bg-gradient-to-r from-red-600 to-red-400 transition-all duration-300 ease-out" style={{ width: `${bossHpPercent}%` }} /> : <div className="h-full bg-gradient-to-r from-green-500 to-emerald-400 transition-all duration-300 ease-out" style={{ width: `${stageProgressPercent}%` }} />}
        </div>
        <div className={`flex-1 flex flex-col items-center justify-center p-4 z-10 ${shake ? 'animate-shake' : ''}`}>
            {isBossStage && (
                <div className={`mb-6 relative transition-transform duration-100 ${bossShake ? 'scale-90 translate-x-2 brightness-150' : 'animate-bounce-slow'}`}>
                    <div className="text-9xl filter drop-shadow-[0_0_30px_rgba(239,68,68,0.6)]">{currentDoor.bossEmoji}</div>
                    <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-red-600 text-white text-xs font-black px-4 py-1.5 rounded-full border-2 border-red-400 whitespace-nowrap shadow-lg">HP: {currentStage.target - progress}</div>
                </div>
            )}
            {renderQuestionCard()}
            {renderOptions()}
        </div>
        <div className="p-4 bg-black/20 backdrop-blur-sm flex justify-center gap-4 z-20 pb-8 sm:pb-6 border-t border-white/5">
             <button onClick={useFreeze} disabled={powerUps.freeze <= 0 || isFrozen} className={`flex flex-col items-center gap-1 group ${powerUps.freeze <= 0 ? 'opacity-30 grayscale' : 'active:scale-90 transition-transform hover:-translate-y-1'}`}><div className="w-14 h-14 bg-blue-500 rounded-2xl flex items-center justify-center border-b-4 border-blue-700 relative shadow-lg"><Snowflake size={28} className="text-white"/><span className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full text-xs flex items-center justify-center font-black border-2 border-white shadow-sm">{powerUps.freeze}</span></div></button>
             <button onClick={useBomb} disabled={powerUps.bomb <= 0 || questionType === 'TRUE_FALSE'} className={`flex flex-col items-center gap-1 group ${powerUps.bomb <= 0 ? 'opacity-30 grayscale' : 'active:scale-90 transition-transform hover:-translate-y-1'}`}><div className="w-14 h-14 bg-slate-700 rounded-2xl flex items-center justify-center border-b-4 border-slate-900 relative shadow-lg"><Bomb size={28} className="text-white"/><span className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full text-xs flex items-center justify-center font-black border-2 border-white shadow-sm">{powerUps.bomb}</span></div></button>
             <button onClick={useHeal} disabled={powerUps.time <= 0} className={`flex flex-col items-center gap-1 group ${powerUps.time <= 0 ? 'opacity-30 grayscale' : 'active:scale-90 transition-transform hover:-translate-y-1'}`}><div className="w-14 h-14 bg-green-500 rounded-2xl flex items-center justify-center border-b-4 border-green-700 relative shadow-lg"><Heart size={28} fill="white" className="text-white"/><span className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full text-xs flex items-center justify-center font-black border-2 border-white shadow-sm">{powerUps.time}</span></div></button>
        </div>
        <style>{`@keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-5px); } 75% { transform: translateX(5px); } } .animate-shake { animation: shake 0.4s ease-in-out; } .animate-spin-slow { animation: spin 3s linear infinite; } .animate-bounce-slow { animation: bounce 2s infinite; }`}</style>
    </div>
  );

  function renderIntroOrTransition() {
      const isIntro = gameState === 'INTRO';
      
      // If we are transitioning, just show the boss and title
      if (!isIntro) {
          return (
            <div className={`flex flex-col items-center justify-center h-full p-6 ${currentDoor.bg} text-white animate-fadeIn text-center overflow-y-auto`}>
                <div className="z-10 flex flex-col items-center w-full max-w-md my-auto">
                    <div className="text-8xl mb-6 animate-bounce filter drop-shadow-2xl">{currentDoor.bossEmoji}</div>
                    <h2 className="text-yellow-400 font-black text-xs uppercase tracking-[0.3em] mb-2">Khu vực {currentDoor.id}</h2>
                    <h1 className="text-3xl font-black mb-8">{currentDoor.name}</h1>
                    <div className="bg-white/10 p-4 rounded-xl mb-8 border border-white/20 w-full">
                        <div className="font-bold text-yellow-300 uppercase text-xs mb-1">Mục tiêu màn {currentStage.id}</div>
                        <div className="text-xl font-black mb-2">{currentStage.desc}</div>
                        <div className="text-sm text-white/70">Trả lời đúng {currentStage.target} câu</div>
                    </div>
                    <button onClick={startLevel} className="w-full py-5 bg-white text-slate-900 rounded-2xl font-black text-xl shadow-lg active:scale-95 flex items-center justify-center gap-2">TIẾN LÊN <ArrowRight size={28}/></button>
                </div>
            </div>
          );
      }

      // FULL LEVEL SELECTOR UI
      return (
          <div className="flex flex-col h-full bg-slate-900 text-white animate-fadeIn">
              <div className="p-4 bg-slate-800 shadow-md border-b border-slate-700 flex justify-between items-center z-10">
                  <button onClick={onExit} className="text-slate-400 hover:text-white flex items-center gap-1 font-bold text-sm"><Home size={18}/> Thoát</button>
                  <h1 className="font-black text-xl text-yellow-400 uppercase tracking-tighter">Thử Thách Tốc Độ</h1>
                  <div className="w-16"></div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-6">
                  <div className="text-center mb-6">
                      <div className="text-6xl mb-2">⚔️</div>
                      <p className="text-slate-400 text-sm">Vượt qua 50 cửa ải để trở thành Huyền thoại!</p>
                  </div>

                  {DOORS.map((door, idx) => {
                      const isLocked = door.stages[0].globalId > maxUnlockedLevel;
                      const isCompleted = door.stages[4].globalId < maxUnlockedLevel;
                      
                      return (
                          <div key={door.id} className={`rounded-3xl border-4 overflow-hidden relative ${isLocked ? 'border-slate-700 bg-slate-800 opacity-60 grayscale' : 'border-slate-600 bg-slate-800'}`}>
                              {/* World Header */}
                              <div className={`${door.bg} p-4 flex items-center justify-between`}>
                                  <div className="flex items-center gap-3">
                                      <div className="text-4xl filter drop-shadow-md">{door.bossEmoji}</div>
                                      <div>
                                          <div className="text-[10px] font-bold text-yellow-300 uppercase tracking-widest">Khu vực {door.id}</div>
                                          <div className="font-black text-lg">{door.name}</div>
                                      </div>
                                  </div>
                                  {isLocked && <Lock className="text-slate-400" size={24} />}
                                  {isCompleted && <Trophy className="text-yellow-400" size={24} />}
                              </div>

                              {/* Stages Grid */}
                              {!isLocked && (
                                  <div className="p-4 grid grid-cols-5 gap-2">
                                      {door.stages.map((stage) => {
                                          const stageLocked = stage.globalId > maxUnlockedLevel;
                                          const stageDone = stage.globalId < maxUnlockedLevel;
                                          
                                          return (
                                              <button 
                                                  key={stage.id}
                                                  disabled={stageLocked}
                                                  onClick={() => initLevel(idx, stage.id - 1)}
                                                  className={`
                                                      aspect-square rounded-xl flex flex-col items-center justify-center relative border-b-4 transition-all
                                                      ${stageLocked 
                                                          ? 'bg-slate-700 border-slate-800 text-slate-500' 
                                                          : stageDone 
                                                              ? 'bg-green-600 border-green-800 text-white' 
                                                              : 'bg-yellow-500 border-yellow-700 text-yellow-900 animate-pulse'
                                                      }
                                                  `}
                                              >
                                                  {stage.id === 5 ? <Skull size={16}/> : <span className="font-black text-lg">{stage.id}</span>}
                                                  {stageLocked && <div className="absolute inset-0 bg-black/40 rounded-xl flex items-center justify-center"><Lock size={12} className="text-slate-400"/></div>}
                                                  {stageDone && <div className="absolute -top-1 -right-1 bg-yellow-400 rounded-full w-4 h-4 flex items-center justify-center border border-white"><Star size={8} className="text-yellow-800" fill="currentColor"/></div>}
                                              </button>
                                          )
                                      })}
                                  </div>
                              )}
                          </div>
                      );
                  })}
                  
                  <div className="h-8"></div>
              </div>
          </div>
      )
  }

  function renderEndGame() {
      const isWin = gameState === 'VICTORY';
      const earnedCoins = Math.floor(score / 10);

      return (
          <div className="flex flex-col items-center justify-center h-full p-6 bg-slate-900 text-white animate-fadeIn text-center relative overflow-hidden">
              
              {/* Reward Overlay with Animation */}
              {showReward && (
                  <div className="absolute inset-0 z-50 bg-black/90 flex flex-col items-center justify-center animate-fadeIn backdrop-blur-md">
                      <div className="relative mb-8">
                          <div className="text-[120px] animate-bounce">🎁</div>
                          <Sparkles className="absolute -top-10 -left-10 text-yellow-400 animate-spin-slow opacity-80" size={150} />
                      </div>
                      <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-500 mb-4 animate-pulse">
                          NHẬN QUÀ THÀNH CÔNG!
                      </h2>
                      <div className="bg-white/10 p-6 rounded-3xl border-2 border-yellow-500/50 flex flex-col items-center animate-bounce-slow">
                          <Coins size={64} className="text-yellow-400 mb-2" fill="currentColor" />
                          <span className="text-5xl font-black text-white">+{earnedCoins} XU</span>
                      </div>
                  </div>
              )}

              <div className="text-9xl mb-6 animate-bounce filter drop-shadow-[0_0_30px_rgba(255,255,255,0.3)]">{isWin ? '🏆' : '💪'}</div>
              <h2 className={`text-4xl font-black uppercase mb-2 tracking-tight ${isWin ? 'text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-yellow-600' : 'text-gray-300'}`}>{isWin ? 'CHIẾN THẮNG!' : 'HẾT GIỜ RỒI!'}</h2>
              <p className="text-gray-400 mb-8 text-lg font-medium">{isWin ? "Bé thật xuất sắc! Khu vực đã được chinh phục!" : "Cố gắng lên nhé! Bé làm tốt lắm."}</p>
              
              <div className="bg-white/10 p-6 rounded-3xl w-full max-w-xs mb-8 border border-white/10 backdrop-blur-md">
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Tổng điểm</div>
                  <div className="text-6xl font-black text-white mb-2">{score}</div>
                  <div className="text-sm font-bold text-yellow-400 flex items-center justify-center gap-2">
                      <Coins size={16} fill="currentColor"/> Nhận được {earnedCoins} Xu
                  </div>
              </div>

              {!showReward && (
                  <button 
                    onClick={handleClaimReward} 
                    className={`w-full max-w-xs py-5 rounded-2xl font-black text-xl shadow-xl mb-4 active:scale-95 transition-all flex items-center justify-center gap-2 ${isWin ? 'bg-yellow-500 text-yellow-900 hover:bg-yellow-400' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                  >
                      {isWin ? <Trophy size={24}/> : <Coins size={24}/>}
                      {isWin ? 'NHẬN QUÀ KHỦNG' : 'NHẬN QUÀ'}
                  </button>
              )}

              {!isWin && !showReward && (
                  <button onClick={() => { setGameState('INTRO'); }} className="text-white/50 font-bold hover:text-white flex items-center gap-2 text-sm"><RefreshCcw size={16}/> Chọn lại màn</button>
              )}
          </div>
      )
  }
};
