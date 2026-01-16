
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Word } from '../types';
import { Clock, Zap, Home, Skull, Sword, Snowflake, Bomb, Heart, Volume2, Check, X, Image as ImageIcon, Type, Rocket, Star, Shield, Lock as LockIcon, ArrowRight, RefreshCcw, Candy, Bot } from 'lucide-react';
import { playSFX } from '../utils/sound';
import { WordImage } from './WordImage';

interface TimeAttackGameProps {
  words: Word[];
  onComplete: (score: number) => void;
  onExit: () => void;
  mode?: 'CLASSIC' | 'BOSS'; 
}

type QuestionType = 'IMAGE_TO_EN' | 'EN_TO_VI' | 'VI_TO_EN' | 'LISTEN' | 'SPELLING' | 'TRUE_FALSE' | 'MIXED';

interface StageConfig {
    id: number;
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

export const TimeAttackGame: React.FC<TimeAttackGameProps> = ({ words, onComplete, onExit }) => {
  // Use useMemo to prevent regeneration on every render
  const DOORS = useMemo<DoorConfig[]>(() => [
        {
            id: 1,
            name: "Rừng Rậm Khởi Đầu",
            bg: "bg-emerald-900",
            bossEmoji: "🦍",
            stages: [
                { id: 1, name: "Nhìn Hình Đoán Chữ", type: 'IMAGE_TO_EN', target: 5, timeAdd: 5, desc: "Hình này là từ gì?", icon: ImageIcon },
                { id: 2, name: "Từ Vựng Cơ Bản", type: 'EN_TO_VI', target: 5, timeAdd: 5, desc: "Dịch từ sang tiếng Việt", icon: Type },
                { id: 3, name: "BOSS: King Kong", type: 'MIXED', target: 10, timeAdd: 3, desc: "Đánh bại trùm!", icon: Skull }
            ]
        },
        {
            id: 2,
            name: "Sa Mạc Khô Cằn",
            bg: "bg-amber-900",
            bossEmoji: "🦂",
            stages: [
                { id: 1, name: "Chính Tả", type: 'SPELLING', target: 6, timeAdd: 4, desc: "Chọn từ viết đúng", icon: Type },
                { id: 2, name: "Dịch Ngược", type: 'VI_TO_EN', target: 6, timeAdd: 4, desc: "Dịch Việt -> Anh", icon: Type },
                { id: 3, name: "BOSS: Vua Bọ Cạp", type: 'MIXED', target: 15, timeAdd: 2, desc: "Cẩn thận nọc độc!", icon: Skull }
            ]
        },
        {
            id: 3,
            name: "Đại Dương Sâu Thẳm",
            bg: "bg-blue-950",
            bossEmoji: "🐙",
            stages: [
                { id: 1, name: "Luyện Nghe", type: 'LISTEN', target: 8, timeAdd: 4, desc: "Nghe và chọn đáp án", icon: Volume2 },
                { id: 2, name: "Phản Xạ Đúng Sai", type: 'TRUE_FALSE', target: 10, timeAdd: 3, desc: "Hình & Chữ có khớp không?", icon: Check },
                { id: 3, name: "BOSS: Bạch Tuộc", type: 'MIXED', target: 20, timeAdd: 2, desc: "Trùm vùng biển", icon: Skull }
            ]
        },
        {
            id: 4,
            name: "Vùng Băng Giá",
            bg: "bg-cyan-900",
            bossEmoji: "🥶", 
            stages: [
                { id: 1, name: "Siêu Tốc Độ", type: 'IMAGE_TO_EN', target: 10, timeAdd: 3, desc: "Nhanh tay lẹ mắt", icon: Zap },
                { id: 2, name: "Bão Tuyết", type: 'SPELLING', target: 8, timeAdd: 3, desc: "Đừng sai chính tả", icon: Snowflake },
                { id: 3, name: "BOSS: Người Tuyết", type: 'MIXED', target: 25, timeAdd: 2, desc: "Lạnh buốt xương!", icon: Skull }
            ]
        },
        {
            id: 5,
            name: "Núi Lửa Hủy Diệt",
            bg: "bg-red-950",
            bossEmoji: "🐉",
            stages: [
                { id: 1, name: "Hỗn Loạn", type: 'MIXED', target: 12, timeAdd: 2, desc: "Tất cả các dạng bài", icon: Star },
                { id: 2, name: "Sinh Tồn", type: 'TRUE_FALSE', target: 15, timeAdd: 2, desc: "Sai là thua", icon: Shield },
                { id: 3, name: "BOSS: Rồng Lửa", type: 'MIXED', target: 35, timeAdd: 1, desc: "Trùm cực mạnh", icon: Skull }
            ]
        },
        {
            id: 6,
            name: "Vương Quốc Kẹo Ngọt",
            bg: "bg-pink-900",
            bossEmoji: "🧸",
            stages: [
                { id: 1, name: "Mưa Kẹo", type: 'IMAGE_TO_EN', target: 15, timeAdd: 2, desc: "Nhìn hình thật nhanh", icon: Candy },
                { id: 2, name: "Đường Ngọt", type: 'TRUE_FALSE', target: 15, timeAdd: 2, desc: "Phân biệt thật giả", icon: Check },
                { id: 3, name: "BOSS: Gấu Gummy", type: 'MIXED', target: 40, timeAdd: 1, desc: "Đừng để bị dính!", icon: Skull }
            ]
        },
        {
            id: 7,
            name: "Thành Phố Công Nghệ",
            bg: "bg-indigo-950",
            bossEmoji: "🤖",
            stages: [
                { id: 1, name: "Mã Hóa", type: 'SPELLING', target: 20, timeAdd: 2, desc: "Gõ đúng từ vựng", icon: Type },
                { id: 2, name: "Tín Hiệu", type: 'LISTEN', target: 20, timeAdd: 2, desc: "Nghe âm thanh", icon: Volume2 },
                { id: 3, name: "BOSS: Mecha Robot", type: 'MIXED', target: 50, timeAdd: 1, desc: "Trùm cuối siêu cấp", icon: Bot }
            ]
        }
  ], []);

  // States
  const [gameState, setGameState] = useState<'INTRO' | 'DOOR_TRANSITION' | 'PLAYING' | 'GAME_OVER' | 'VICTORY'>('INTRO');
  const [currentDoorIdx, setCurrentDoorIdx] = useState(0);
  const [currentStageIdx, setCurrentStageIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60); 
  const [score, setScore] = useState(0);
  const [progress, setProgress] = useState(0);
  
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

  const startLevel = () => {
      setGameState('PLAYING');
      setProgress(0);
      setIsPaused(false);
      // Give initial boosts for starting
      if (currentStageIdx === 0 && currentDoorIdx === 0) {
          setTimeLeft(60);
      } else if (currentStageIdx === 0) {
          // Bonus items when entering new door
          setPowerUps(prev => ({
              freeze: Math.max(prev.freeze, 1),
              bomb: Math.max(prev.bomb, 1),
              time: Math.max(prev.time, 1)
          }));
          setTimeLeft(prev => Math.min(prev + 30, 99)); 
      }
      nextQuestion();
  };

  const nextQuestion = () => {
      setIsPaused(false); // Resume timer
      let type = currentStage.type;
      
      if (type === 'MIXED') {
          const types: QuestionType[] = ['EN_TO_VI', 'VI_TO_EN', 'LISTEN', 'IMAGE_TO_EN', 'TRUE_FALSE', 'SPELLING'];
          type = types[Math.floor(Math.random() * types.length)];
      }

      // Smart Filtering based on available data
      if (type === 'IMAGE_TO_EN' || type === 'TRUE_FALSE') {
          const wordsWithEmoji = words.filter(w => !!w.emoji);
          if (wordsWithEmoji.length < 4) type = 'EN_TO_VI';
      }

      setQuestionType(type);

      let validTargets = words;
      if (type === 'IMAGE_TO_EN' || type === 'TRUE_FALSE') {
          validTargets = words.filter(w => !!w.emoji);
          if (validTargets.length === 0) validTargets = words; 
      }

      const randomIdx = Math.floor(Math.random() * validTargets.length);
      const target = validTargets[randomIdx];
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
              const fakePool = words.filter(w => w.id !== target.id && (!!w.emoji));
              const fallbackPool = words.filter(w => w.id !== target.id);
              const finalFakePool = fakePool.length > 0 ? fakePool : fallbackPool;
              let fake = finalFakePool[Math.floor(Math.random() * finalFakePool.length)];
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
          // CRITICAL FIX: Ensure max 4 options
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
      // Prevent multiple clicks or clicks during pause
      if (gameState !== 'PLAYING' || !currentWord || isPaused) return;

      let isCorrect = false;
      if (questionType === 'TRUE_FALSE') isCorrect = answer === trueFalseAnswer;
      else if (questionType === 'SPELLING') isCorrect = answer.isCorrect === true;
      else isCorrect = answer.id === currentWord.id;

      if (isCorrect) {
          playSFX('correct');
          setIsPaused(true); // Freeze timer immediately on correct answer
          
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
              // Boss damage effect sound
              if (newProgress % 2 === 0) playSFX('harvest'); 
              setTimeout(() => setBossShake(false), 300);
          }

          // Check for Stage Completion
          if (newProgress >= currentStage.target) {
              playSFX(isBossStage ? 'cheer' : 'success');
              if (currentStageIdx < currentDoor.stages.length - 1) {
                  setTimeout(() => {
                      setCurrentStageIdx(prev => prev + 1);
                      setProgress(0);
                      nextQuestion();
                  }, 500);
              } else {
                  if (currentDoorIdx < DOORS.length - 1) {
                      setTimeout(() => {
                          setCurrentDoorIdx(prev => prev + 1);
                          setCurrentStageIdx(0);
                          setGameState('DOOR_TRANSITION');
                      }, 500);
                  } else {
                      setTimeout(() => setGameState('VICTORY'), 500);
                  }
              }
              return;
          }
          // Delay next question slightly to show feedback
          setTimeout(nextQuestion, 400); 
      } else {
          playSFX('wrong');
          setShake(true);
          setTimeout(() => setShake(false), 400);
          setFlash('RED');
          setCombo(0);
          // Penalty: Reduce time but don't go below 0
          setTimeLeft(prev => Math.max(prev - 2, 0)); 
          setIsPaused(true); // Freeze timer to show wrong feedback
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

  // --- RENDER ---
  const renderHeader = () => (
    <div className={`flex items-center justify-between px-4 py-3 backdrop-blur-md z-20 border-b shadow-lg transition-colors duration-300 ${isFever ? 'bg-orange-500/80 border-yellow-300' : 'bg-black/30 border-white/10'}`}>
        <div className="flex items-center gap-3">
            <button onClick={onExit} className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors"><Home size={20}/></button>
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
          return (
              <div className="w-full max-w-sm mb-4 bg-white/10 backdrop-blur-xl p-4 rounded-[2rem] border-2 border-white/20 text-center shadow-2xl">
                  <div className="flex flex-col items-center gap-4">
                      <div className="w-28 h-28 rounded-2xl overflow-hidden shadow-lg border-4 border-white">
                          <WordImage word={trueFalseAnswer ? currentWord : (fakeWord || currentWord)} className="w-full h-full" hideLabel={true} />
                      </div>
                      <div className="text-3xl font-black text-white drop-shadow-md">{currentWord.english}</div>
                  </div>
              </div>
          );
      }
      if (questionType === 'LISTEN') {
          return (
              <div className="w-full max-w-sm mb-4 bg-white/10 backdrop-blur-xl p-6 rounded-[2rem] border-2 border-white/20 text-center shadow-2xl">
                  <button onClick={() => playAudio(currentWord.english)} className="w-20 h-20 bg-purple-500 rounded-full flex items-center justify-center mx-auto shadow-lg animate-pulse border-4 border-purple-300">
                      <Volume2 size={40} className="text-white"/>
                  </button>
                  <p className="mt-4 text-xs font-bold text-white/60">Nghe và chọn đáp án đúng</p>
              </div>
          );
      }
      if (questionType === 'IMAGE_TO_EN') {
          return (
              <div className="w-full max-w-sm mb-6 flex justify-center">
                  <div className="w-40 h-40 bg-white rounded-3xl shadow-2xl border-8 border-white transform hover:scale-105 transition-transform">
                      <WordImage word={currentWord} className="w-full h-full rounded-2xl" hideLabel={true} />
                  </div>
              </div>
          );
      }
      return (
          <div className="w-full max-w-sm mb-6 bg-white/10 backdrop-blur-xl p-6 rounded-[2rem] border-2 border-white/20 text-center shadow-2xl">
              <h2 className={`text-3xl sm:text-4xl font-black drop-shadow-md break-words leading-tight ${questionType === 'VI_TO_EN' ? 'text-yellow-300' : 'text-white'}`}>
                  {questionType === 'VI_TO_EN' ? currentWord.vietnamese : questionType === 'SPELLING' ? `"${currentWord.vietnamese}"` : currentWord.english}
              </h2>
              {questionType === 'SPELLING' && <p className="text-xs mt-2 text-white/60">Chọn từ viết đúng</p>}
          </div>
      );
  };

  const renderOptions = () => {
      if (questionType === 'TRUE_FALSE') {
          return (
              <div className="flex gap-4 w-full max-w-sm">
                  <button onClick={() => handleAnswer(true)} className="flex-1 py-4 bg-green-500 rounded-3xl shadow-lg border-b-8 border-green-700 active:border-b-0 active:translate-y-2 transition-all flex flex-col items-center justify-center gap-1">
                      <Check size={32} className="text-white"/>
                      <span className="text-lg font-black text-white uppercase">Đúng</span>
                  </button>
                  <button onClick={() => handleAnswer(false)} className="flex-1 py-4 bg-red-500 rounded-3xl shadow-lg border-b-8 border-red-700 active:border-b-0 active:translate-y-2 transition-all flex flex-col items-center justify-center gap-1">
                      <X size={32} className="text-white"/>
                      <span className="text-lg font-black text-white uppercase">Sai</span>
                  </button>
              </div>
          );
      }
      return (
          <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
              {options.slice(0, 4).map((opt, idx) => { // Force slice to 4 to prevent UI break
                  const id = opt.id || idx;
                  const isDisabled = disabledOptions.includes(id);
                  const content = questionType === 'SPELLING' ? opt.text :
                                  ['LISTEN','IMAGE_TO_EN','VI_TO_EN'].includes(questionType) ? opt.english : opt.vietnamese;
                  return (
                      <button key={id} disabled={isDisabled} onClick={() => handleAnswer(opt)} className={`relative p-3 rounded-2xl font-bold text-md shadow-lg active:scale-95 transition-all ${isDisabled ? 'bg-slate-800/50 text-slate-600 cursor-not-allowed border-2 border-slate-700' : 'bg-white text-slate-900 hover:bg-blue-50 border-b-[6px] border-slate-300 active:border-b-0 active:translate-y-1.5'}`}>
                          {content}
                          {isDisabled && <Skull className="absolute inset-0 m-auto text-slate-500 opacity-50" size={20}/>}
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
                <div className={`mb-4 relative transition-transform duration-100 ${bossShake ? 'scale-90 translate-x-2 brightness-150' : 'animate-bounce-slow'}`}>
                    <div className="text-8xl filter drop-shadow-[0_0_20px_rgba(239,68,68,0.6)]">{currentDoor.bossEmoji}</div>
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-red-600 text-white text-[10px] font-black px-3 py-1 rounded-full border-2 border-red-400 whitespace-nowrap shadow-lg">HP: {currentStage.target - progress}</div>
                </div>
            )}
            {renderQuestionCard()}
            {renderOptions()}
        </div>
        <div className="p-4 bg-black/20 backdrop-blur-sm flex justify-center gap-4 z-20 pb-8 sm:pb-6 border-t border-white/5">
             <button onClick={useFreeze} disabled={powerUps.freeze <= 0 || isFrozen} className={`flex flex-col items-center gap-1 group ${powerUps.freeze <= 0 ? 'opacity-30 grayscale' : 'active:scale-90 transition-transform hover:-translate-y-1'}`}><div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center border-b-4 border-blue-700 relative shadow-lg"><Snowflake size={24} className="text-white"/><span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full text-[10px] flex items-center justify-center font-black border-2 border-white shadow-sm">{powerUps.freeze}</span></div></button>
             <button onClick={useBomb} disabled={powerUps.bomb <= 0 || questionType === 'TRUE_FALSE'} className={`flex flex-col items-center gap-1 group ${powerUps.bomb <= 0 ? 'opacity-30 grayscale' : 'active:scale-90 transition-transform hover:-translate-y-1'}`}><div className="w-12 h-12 bg-slate-700 rounded-2xl flex items-center justify-center border-b-4 border-slate-900 relative shadow-lg"><Bomb size={24} className="text-white"/><span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full text-[10px] flex items-center justify-center font-black border-2 border-white shadow-sm">{powerUps.bomb}</span></div></button>
             <button onClick={useHeal} disabled={powerUps.time <= 0} className={`flex flex-col items-center gap-1 group ${powerUps.time <= 0 ? 'opacity-30 grayscale' : 'active:scale-90 transition-transform hover:-translate-y-1'}`}><div className="w-12 h-12 bg-green-500 rounded-2xl flex items-center justify-center border-b-4 border-green-700 relative shadow-lg"><Heart size={24} fill="white" className="text-white"/><span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full text-[10px] flex items-center justify-center font-black border-2 border-white shadow-sm">{powerUps.time}</span></div></button>
        </div>
        <style>{`@keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-5px); } 75% { transform: translateX(5px); } } .animate-shake { animation: shake 0.4s ease-in-out; } .animate-spin-slow { animation: spin 3s linear infinite; } .animate-bounce-slow { animation: bounce 2s infinite; }`}</style>
    </div>
  );

  function renderIntroOrTransition() {
      const isIntro = gameState === 'INTRO';
      return (
          <div className={`flex flex-col items-center justify-center h-full p-6 ${isIntro ? 'bg-slate-900' : currentDoor.bg} text-white animate-fadeIn text-center overflow-y-auto`}>
              <div className="z-10 flex flex-col items-center w-full max-w-md my-auto">
                  {isIntro ? (
                      <>
                        <h1 className="text-3xl font-black uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-yellow-300 to-red-500 mb-2 drop-shadow-lg">Hành Trình Tốc Độ</h1>
                        <p className="text-gray-400 mb-6 text-xs font-bold">Vượt qua {DOORS.length} Cửa ải để trở thành Huyền Thoại!</p>
                        <div className="w-full space-y-3 mb-6">
                            {DOORS.map((d, i) => (
                                <div key={d.id} className={`flex items-center p-3 rounded-2xl border-2 ${i === 0 ? 'bg-white/10 border-yellow-400' : 'bg-black/20 border-slate-700 opacity-60'}`}>
                                    <div className="w-10 h-10 rounded-full bg-black/40 flex items-center justify-center text-xl mr-3 border border-white/20">{d.bossEmoji}</div>
                                    <div className="flex-1 text-left"><div className="font-bold text-xs uppercase text-yellow-500">Cửa {d.id}</div><div className="font-black text-sm">{d.name}</div></div>
                                    {i > 0 && <LockIcon size={16} className="text-slate-500" />}
                                </div>
                            ))}
                        </div>
                        <button onClick={() => { setGameState('PLAYING'); nextQuestion(); }} className="w-full py-4 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-2xl font-black text-xl shadow-lg border-b-4 border-red-800 active:scale-95"><Sword size={24} className="inline mr-2"/> BẮT ĐẦU</button>
                      </>
                  ) : (
                      <>
                        <div className="text-7xl mb-4 animate-bounce filter drop-shadow-2xl">{currentDoor.bossEmoji}</div>
                        <h2 className="text-yellow-400 font-black text-xs uppercase tracking-[0.3em] mb-2">Cửa ải {currentDoor.id}</h2>
                        <h1 className="text-2xl font-black mb-6">{currentDoor.name}</h1>
                        <div className="grid grid-cols-2 gap-3 w-full mb-8">
                            {currentDoor.stages.map((s, i) => {
                                const Icon = s.icon;
                                const isPassed = i < currentStageIdx;
                                const isCurrent = i === currentStageIdx;
                                return (
                                    <div key={s.id} className={`p-3 rounded-xl border flex flex-col gap-1 text-left relative overflow-hidden ${isCurrent ? 'bg-white text-slate-900 border-yellow-400 shadow-lg scale-105 z-10' : 'bg-black/20 border-white/10 text-white/60'}`}>
                                        <div className="flex justify-between items-center"><span className="text-[9px] font-black uppercase tracking-wider">Màn {i+1}</span><Icon size={14} /></div>
                                        <div className="font-bold text-xs leading-tight">{s.name}</div>
                                        {isPassed && <div className="absolute inset-0 bg-green-500/80 flex items-center justify-center"><Check size={24} className="text-white"/></div>}
                                    </div>
                                )
                            })}
                        </div>
                        <button onClick={startLevel} className="w-full py-4 bg-white text-slate-900 rounded-2xl font-black text-xl shadow-lg active:scale-95 flex items-center justify-center gap-2">TIẾN LÊN <ArrowRight size={24}/></button>
                      </>
                  )}
                  <button onClick={onExit} className="mt-6 text-white/50 text-sm font-bold hover:text-white">Quay lại</button>
              </div>
          </div>
      )
  }

  function renderEndGame() {
      const isWin = gameState === 'VICTORY';
      return (
          <div className="flex flex-col items-center justify-center h-full p-6 bg-slate-900 text-white animate-fadeIn text-center">
              <div className="text-8xl mb-6 animate-bounce filter drop-shadow-[0_0_30px_rgba(255,255,255,0.3)]">{isWin ? '🏆' : '💪'}</div>
              <h2 className={`text-4xl font-black uppercase mb-2 tracking-tight ${isWin ? 'text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-yellow-600' : 'text-gray-300'}`}>{isWin ? 'CHIẾN THẮNG!' : 'CỐ LÊN NHÉ!'}</h2>
              <p className="text-gray-400 mb-6 text-sm">{isWin ? "Bé thật xuất sắc! Huyền thoại tốc độ!" : "Thua keo này ta bày keo khác. Bé làm tốt lắm!"}</p>
              <div className="bg-white/10 p-6 rounded-3xl w-full max-w-xs mb-8 border border-white/10 backdrop-blur-md">
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Tổng điểm</div>
                  <div className="text-5xl font-black text-white mb-2">{score}</div>
                  <div className="text-[10px] font-bold text-yellow-400">Đã vượt qua {currentDoorIdx} Cửa ải</div>
              </div>
              <button onClick={() => onComplete(score)} className={`w-full max-w-xs py-4 rounded-2xl font-black text-lg shadow-xl mb-4 active:scale-95 ${isWin ? 'bg-yellow-500 text-yellow-900' : 'bg-blue-600 text-white'}`}>{isWin ? 'NHẬN QUÀ KHỦNG' : 'NHẬN QUÀ KHÍCH LỆ'}</button>
              {!isWin && <button onClick={() => { setGameState('INTRO'); setCurrentDoorIdx(0); setCurrentStageIdx(0); setScore(0); }} className="text-white/50 font-bold hover:text-white flex items-center gap-2 text-sm"><RefreshCcw size={16}/> Thử lại từ đầu</button>}
          </div>
      )
  }
};
