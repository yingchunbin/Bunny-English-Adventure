
import React, { useState, useEffect } from 'react';
import { Word } from '../types';
import { Volume2, ArrowRight, RotateCw, ImageOff, ShoppingBag, Package } from 'lucide-react';
import { playSFX } from '../utils/sound';
import { WordImage } from './WordImage';

interface FlashcardGameProps {
  words: Word[];
  onComplete: () => void;
  initialMode?: 'LEARN' | 'QUIZ';
  backupWords?: Word[]; 
}

type QuestionType = 'EN_TO_VI' | 'VI_TO_EN' | 'AUDIO_TO_IMAGE';

export const FlashcardGame: React.FC<FlashcardGameProps> = ({ words, onComplete, initialMode = 'LEARN', backupWords = [] }) => {
  // ... [Keep core logic state variables same as before for functionality] ...
  const [mode, setMode] = useState<'LEARN' | 'QUIZ'>(initialMode);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [quizIndex, setQuizIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [currentOptions, setCurrentOptions] = useState<Word[]>([]);
  const [questionType, setQuestionType] = useState<QuestionType>('EN_TO_VI');

  const currentWord = words[currentIndex] || words[0]; 
  const currentQuizWord = words[quizIndex];

  // ... [Helper functions: playAudio, handleFlip, handleNextLearn, etc. same as before] ...
  const playAudio = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    window.speechSynthesis.speak(utterance);
  };

  const handleNextLearn = () => {
    playSFX('click');
    if (currentIndex < words.length - 1) {
      setIsFlipped(false);
      setCurrentIndex(prev => prev + 1);
    } else {
      setMode('QUIZ');
      setQuizIndex(0);
    }
  };

  // Re-implementing quiz logic hook
  useEffect(() => {
    if (mode === 'QUIZ' && currentQuizWord) {
      const availableTypes: QuestionType[] = ['EN_TO_VI', 'VI_TO_EN', 'AUDIO_TO_IMAGE'];
      const nextType = availableTypes[Math.floor(Math.random() * availableTypes.length)];
      setQuestionType(nextType);

      const fullPool = [...words, ...backupWords];
      const uniquePool = Array.from(new Map(fullPool.map(item => [item.id, item])).values());
      const distractors = uniquePool.filter(w => w.id !== currentQuizWord.id).sort(() => 0.5 - Math.random()).slice(0, 3);
      const options = [currentQuizWord, ...distractors].sort(() => 0.5 - Math.random());
      
      setCurrentOptions(options);
      setSelectedOption(null);
      setIsCorrect(null);

      if (nextType === 'AUDIO_TO_IMAGE') setTimeout(() => playAudio(currentQuizWord.english), 500);
    }
  }, [mode, quizIndex]);

  const handleOptionSelect = (optionId: string) => {
    if (selectedOption) return;
    setSelectedOption(optionId);
    const correct = optionId === currentQuizWord.id;
    setIsCorrect(correct);
    if (correct) {
      setScore(prev => prev + 1);
      playSFX('correct');
    } else playSFX('wrong');

    setTimeout(() => {
        if (quizIndex < words.length - 1) setQuizIndex(prev => prev + 1);
        else onComplete();
    }, 1500);
  };

  // --- RENDER ---

  if (mode === 'LEARN') {
    return (
      <div className="flex flex-col items-center w-full h-full p-6 animate-pop">
        {/* Progress Dots */}
        <div className="flex gap-1 mb-4">
            {words.map((_, idx) => (
                <div key={idx} className={`w-3 h-3 rounded-full border-2 border-white shadow-sm ${idx === currentIndex ? 'bg-orange-500 scale-125' : idx < currentIndex ? 'bg-green-500' : 'bg-slate-200'}`} />
            ))}
        </div>

        {/* Card Container - The "Wooden Board" */}
        <div className="relative w-full max-w-sm aspect-[3/4] perspective-1000" onClick={() => { setIsFlipped(!isFlipped); playSFX('flip'); }}>
            <div className={`relative w-full h-full transition-transform duration-500 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
                
                {/* FRONT */}
                <div className="absolute inset-0 backface-hidden bg-[#fff8e1] rounded-3xl border-8 border-[#8d6e63] shadow-2xl flex flex-col items-center p-4">
                    <div className="w-4 h-4 bg-gray-300 rounded-full absolute top-2 left-1/2 -translate-x-1/2 shadow-inner border border-gray-400"></div> {/* Nail */}
                    
                    <div className="flex-1 w-full bg-white rounded-2xl border-4 border-[#8d6e63] border-dashed flex items-center justify-center p-4 overflow-hidden relative mt-4">
                        <WordImage word={currentWord} className="w-full h-full object-contain" />
                        <div className="absolute bottom-2 right-2 text-slate-300"><RotateCw size={24}/></div>
                    </div>
                    
                    <h2 className="mt-4 text-4xl font-black text-[#5d4037]">{currentWord.english}</h2>
                    <button 
                        onClick={(e) => { e.stopPropagation(); playAudio(currentWord.english); }} 
                        className="mt-2 p-3 bg-orange-500 rounded-full text-white shadow-lg active:scale-95"
                    >
                        <Volume2 size={24} />
                    </button>
                </div>

                {/* BACK */}
                <div className="absolute inset-0 backface-hidden rotate-y-180 bg-[#ffecb3] rounded-3xl border-8 border-[#8d6e63] shadow-2xl flex flex-col items-center p-6 text-center">
                    <div className="w-4 h-4 bg-gray-300 rounded-full absolute top-2 left-1/2 -translate-x-1/2 shadow-inner border border-gray-400"></div>
                    <h2 className="text-3xl font-black text-orange-600 mt-8 mb-2">{currentWord.vietnamese}</h2>
                    <p className="text-slate-500 italic font-mono text-lg mb-6">/{currentWord.pronunciation}/</p>
                    
                    <div className="bg-white/50 p-4 rounded-xl border-2 border-orange-200 w-full">
                        <p className="text-lg font-bold text-slate-700">"{currentWord.exampleEn}"</p>
                        <p className="text-sm text-slate-500 mt-1">{currentWord.exampleVi}</p>
                    </div>
                </div>
            </div>
        </div>

        <button onClick={handleNextLearn} className="mt-6 w-full max-w-sm py-4 btn-green text-xl font-black uppercase flex items-center justify-center gap-2">
            Tiếp theo <ArrowRight strokeWidth={4}/>
        </button>
      </div>
    );
  }

  // QUIZ MODE (Market Stall)
  return (
      <div className="flex flex-col h-full w-full p-4 relative">
          
          {/* Top Signboard (Question) */}
          <div className="wood-texture mx-auto px-8 py-6 rounded-b-[2rem] shadow-xl border-t-0 max-w-sm w-full text-center relative z-20">
              <div className="absolute -top-2 left-4 w-4 h-16 bg-[#5d4037] rounded-b-full"></div> {/* Rope */}
              <div className="absolute -top-2 right-4 w-4 h-16 bg-[#5d4037] rounded-b-full"></div>
              
              {questionType === 'EN_TO_VI' && (
                  <>
                    <p className="text-xs font-black text-[#5d4037] opacity-60 uppercase mb-1">Dịch sang Tiếng Việt</p>
                    <h1 className="text-3xl font-black text-white text-stroke drop-shadow-md">{currentQuizWord.english}</h1>
                    <button onClick={() => playAudio(currentQuizWord.english)} className="mx-auto mt-2 text-white bg-white/20 rounded-full p-1"><Volume2/></button>
                  </>
              )}
              {questionType === 'VI_TO_EN' && <h1 className="text-3xl font-black text-white text-stroke drop-shadow-md">{currentQuizWord.vietnamese}</h1>}
              {questionType === 'AUDIO_TO_IMAGE' && (
                  <button onClick={() => playAudio(currentQuizWord.english)} className="w-20 h-20 bg-orange-500 rounded-full flex items-center justify-center mx-auto shadow-inner border-4 border-white animate-pulse">
                      <Volume2 size={40} className="text-white" />
                  </button>
              )}
          </div>

          {/* Crate Options */}
          <div className="flex-1 grid grid-cols-2 gap-4 content-center max-w-sm mx-auto w-full mt-4">
              {currentOptions.map((opt) => {
                  const isSelected = selectedOption === opt.id;
                  const isTarget = opt.id === currentQuizWord.id;
                  
                  let bgClass = "bg-[#d7ccc8]"; // Default crate color
                  let borderClass = "border-[#a1887f]";
                  
                  if (selectedOption) {
                      if (isTarget) { bgClass = "bg-green-500"; borderClass = "border-green-700"; }
                      else if (isSelected) { bgClass = "bg-red-500"; borderClass = "border-red-700"; }
                  }

                  return (
                      <button
                          key={opt.id}
                          onClick={() => handleOptionSelect(opt.id)}
                          disabled={!!selectedOption}
                          className={`
                              relative aspect-square rounded-2xl border-b-8 transition-all active:translate-y-2
                              flex flex-col items-center justify-center p-2 shadow-lg
                              ${bgClass} ${borderClass}
                          `}
                      >
                          {/* Wood Plank Texture Effect */}
                          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] opacity-20 rounded-xl pointer-events-none"></div>
                          
                          <div className="relative z-10 text-center">
                              {questionType === 'AUDIO_TO_IMAGE' ? (
                                  <WordImage word={opt} className="w-24 h-24 rounded-lg border-4 border-white/50" hideLabel={true} />
                              ) : (
                                  <span className="text-lg font-black text-slate-800 drop-shadow-sm leading-tight">
                                      {questionType === 'VI_TO_EN' ? opt.english : opt.vietnamese}
                                  </span>
                              )}
                          </div>
                          
                          {/* Crate Detail */}
                          <div className="absolute bottom-2 left-2 right-2 h-1 bg-black/10 rounded-full"></div>
                      </button>
                  )
              })}
          </div>

          {/* Score Counter */}
          <div className="absolute top-4 right-4 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full font-black text-xs border-2 border-white shadow-md z-30">
              {score}/{words.length} ⭐️
          </div>
      </div>
  )
};
