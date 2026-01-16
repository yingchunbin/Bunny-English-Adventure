
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
  // Safety check
  if (!words || words.length === 0) {
      return (
          <div className="flex flex-col items-center justify-center h-full p-6 text-center">
              <ImageOff size={48} className="text-slate-300 mb-4"/>
              <p className="text-slate-500 font-bold">Không có từ vựng nào để học.</p>
              <button onClick={onComplete} className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-xl font-bold">Quay lại</button>
          </div>
      );
  }

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

  if (mode === 'LEARN') {
    return (
      <div className="flex flex-col items-center w-full h-full p-6 animate-pop justify-center">
        {/* Progress Dots */}
        <div className="flex gap-1.5 mb-6">
            {words.map((_, idx) => (
                <div key={idx} className={`w-3 h-3 rounded-full shadow-sm transition-all ${idx === currentIndex ? 'bg-orange-500 scale-125' : idx < currentIndex ? 'bg-green-400' : 'bg-slate-200'}`} />
            ))}
        </div>

        {/* Card Container */}
        <div className="relative w-full max-w-sm aspect-[3/4] perspective-1000" onClick={() => { setIsFlipped(!isFlipped); playSFX('flip'); }}>
            <div className={`relative w-full h-full transition-transform duration-500 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
                
                {/* FRONT */}
                <div className="absolute inset-0 backface-hidden bg-white rounded-[2rem] border-b-8 border-r-4 border-slate-200 shadow-xl flex flex-col items-center p-6">
                    <div className="flex-1 w-full flex items-center justify-center relative">
                        <WordImage word={currentWord} className="w-48 h-48 rounded-full border-8 border-sky-50" />
                        <div className="absolute bottom-0 right-0 text-slate-300 bg-slate-100 p-2 rounded-full"><RotateCw size={20}/></div>
                    </div>
                    
                    <h2 className="mt-6 text-4xl font-black text-slate-800">{currentWord.english}</h2>
                    <button 
                        onClick={(e) => { e.stopPropagation(); playAudio(currentWord.english); }} 
                        className="mt-4 p-4 bg-sky-100 text-sky-600 rounded-full shadow-md active:scale-95 transition-transform"
                    >
                        <Volume2 size={32} />
                    </button>
                </div>

                {/* BACK */}
                <div className="absolute inset-0 backface-hidden rotate-y-180 bg-sky-50 rounded-[2rem] border-b-8 border-r-4 border-sky-200 shadow-xl flex flex-col items-center p-6 text-center justify-center">
                    <h2 className="text-3xl font-black text-sky-700 mb-2">{currentWord.vietnamese}</h2>
                    <p className="text-slate-500 font-mono text-lg mb-8 bg-white px-4 py-1 rounded-lg shadow-sm">/{currentWord.pronunciation}/</p>
                    
                    <div className="bg-white p-6 rounded-2xl w-full shadow-sm">
                        <p className="text-lg font-bold text-slate-700 mb-2">"{currentWord.exampleEn}"</p>
                        <p className="text-sm text-slate-500 italic">{currentWord.exampleVi}</p>
                    </div>
                </div>
            </div>
        </div>

        <button onClick={handleNextLearn} className="mt-8 w-full max-w-sm py-4 bg-green-500 text-white rounded-2xl shadow-lg border-b-4 border-green-600 active:border-b-0 active:translate-y-1 font-black uppercase flex items-center justify-center gap-2 transition-all">
            Tiếp theo <ArrowRight strokeWidth={3}/>
        </button>
      </div>
    );
  }

  // QUIZ MODE
  return (
      <div className="flex flex-col h-full w-full p-4 relative justify-center bg-indigo-50">
          
          <div className="bg-white mx-auto px-8 py-8 rounded-[2rem] shadow-xl border-b-8 border-indigo-100 max-w-sm w-full text-center relative z-20 mb-6">
              {questionType === 'EN_TO_VI' && (
                  <>
                    <p className="text-xs font-black text-indigo-400 uppercase mb-2 tracking-widest">Dịch sang Tiếng Việt</p>
                    <h1 className="text-4xl font-black text-slate-800">{currentQuizWord.english}</h1>
                    <button onClick={() => playAudio(currentQuizWord.english)} className="mx-auto mt-3 text-indigo-500 bg-indigo-50 rounded-full p-2"><Volume2/></button>
                  </>
              )}
              {questionType === 'VI_TO_EN' && (
                  <>
                    <p className="text-xs font-black text-indigo-400 uppercase mb-2 tracking-widest">Dịch sang Tiếng Anh</p>
                    <h1 className="text-3xl font-black text-slate-800">{currentQuizWord.vietnamese}</h1>
                  </>
              )}
              {questionType === 'AUDIO_TO_IMAGE' && (
                  <button onClick={() => playAudio(currentQuizWord.english)} className="w-24 h-24 bg-indigo-500 text-white rounded-full flex items-center justify-center mx-auto shadow-lg animate-pulse">
                      <Volume2 size={48} />
                  </button>
              )}
          </div>

          <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto w-full">
              {currentOptions.map((opt) => {
                  const isSelected = selectedOption === opt.id;
                  const isTarget = opt.id === currentQuizWord.id;
                  
                  let btnClass = "bg-white border-slate-200 text-slate-600";
                  if (selectedOption) {
                      if (isTarget) btnClass = "bg-green-500 border-green-600 text-white";
                      else if (isSelected) btnClass = "bg-red-500 border-red-600 text-white";
                      else btnClass = "bg-slate-100 border-slate-200 text-slate-400 opacity-50";
                  }

                  return (
                      <button
                          key={opt.id}
                          onClick={() => handleOptionSelect(opt.id)}
                          disabled={!!selectedOption}
                          className={`
                              relative aspect-square rounded-2xl border-b-4 transition-all active:scale-95
                              flex flex-col items-center justify-center p-3 shadow-sm
                              ${btnClass}
                          `}
                      >
                          {questionType === 'AUDIO_TO_IMAGE' ? (
                              <WordImage word={opt} className="w-full h-full rounded-xl" hideLabel={true} />
                          ) : (
                              <span className="text-lg font-black leading-tight">
                                  {questionType === 'VI_TO_EN' ? opt.english : opt.vietnamese}
                              </span>
                          )}
                      </button>
                  )
              })}
          </div>
      </div>
  )
};
