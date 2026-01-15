
import React, { useState, useEffect } from 'react';
import { Word } from '../types';
import { Volume2, ArrowRight, Check, X, Trophy, Sparkles, Lightbulb, ImageOff, RotateCw, Headphones } from 'lucide-react';
import { playSFX } from '../utils/sound';
import { WordImage } from './WordImage';

interface FlashcardGameProps {
  words: Word[];
  onComplete: () => void;
  initialMode?: 'LEARN' | 'QUIZ';
  backupWords?: Word[]; // Allow providing extra words for distractors
}

type QuestionType = 'EN_TO_VI' | 'VI_TO_EN' | 'AUDIO_TO_IMAGE';

export const FlashcardGame: React.FC<FlashcardGameProps> = ({ words, onComplete, initialMode = 'LEARN', backupWords = [] }) => {
  if (!words || words.length === 0) {
      return (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 p-4">
              <ImageOff size={48} className="mb-2 text-gray-300"/>
              <p>Chưa có từ vựng cho bài này.</p>
              <button onClick={onComplete} className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-xl font-bold">Bỏ qua</button>
          </div>
      );
  }

  const [mode, setMode] = useState<'LEARN' | 'QUIZ'>(initialMode);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // QUIZ MODE STATE
  const [quizIndex, setQuizIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [currentOptions, setCurrentOptions] = useState<Word[]>([]);
  const [questionType, setQuestionType] = useState<QuestionType>('EN_TO_VI');

  const currentWord = words[currentIndex] || words[0]; 
  const currentQuizWord = words[quizIndex];

  const playAudio = (text: string, rate: number = 0.8) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = rate;
    window.speechSynthesis.speak(utterance);
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
    playSFX('flip');
  };

  const handleNextLearn = () => {
    playSFX('click');
    if (currentIndex < words.length - 1) {
      setIsFlipped(false);
      setTimeout(() => setCurrentIndex(prev => prev + 1), 150);
    } else {
      setMode('QUIZ');
      setQuizIndex(0);
    }
  };

  useEffect(() => {
    if (mode === 'QUIZ' && currentQuizWord) {
      // NOTE: Removed 'words' and 'backupWords' from dependency array to prevent infinite re-renders if parent re-renders
      // logic is driven by 'quizIndex' changing.
      const availableTypes: QuestionType[] = ['EN_TO_VI', 'VI_TO_EN'];
      // Only enable Image question if the word has an emoji
      if (currentQuizWord.emoji) availableTypes.push('AUDIO_TO_IMAGE');
      
      const nextType = availableTypes[Math.floor(Math.random() * availableTypes.length)];
      setQuestionType(nextType);

      // Create a pool of potential distractors
      const fullPool = [...words, ...backupWords];
      // Deduplicate by ID
      const uniquePool = Array.from(new Map(fullPool.map(item => [item.id, item])).values());

      const distractors = uniquePool
        .filter(w => w.id !== currentQuizWord.id)
        .sort(() => 0.5 - Math.random())
        .slice(0, 3);
      
      // Ensure we have at least some options, even if duplicates (fallback)
      while (distractors.length < 3 && uniquePool.length > 1) {
          const random = uniquePool[Math.floor(Math.random() * uniquePool.length)];
          if (random.id !== currentQuizWord.id) distractors.push(random);
      }

      const options = [currentQuizWord, ...distractors].sort(() => 0.5 - Math.random());
      setCurrentOptions(options);
      
      setSelectedOption(null);
      setIsCorrect(null);

      if (nextType === 'AUDIO_TO_IMAGE') {
          setTimeout(() => playAudio(currentQuizWord.english), 500);
      }
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
    } else {
      playSFX('wrong');
    }

    setTimeout(() => {
        if (quizIndex < words.length - 1) {
            setQuizIndex(prev => prev + 1);
        } else {
            onComplete();
        }
    }, 1500);
  };

  const renderOptionContent = (opt: Word) => {
      switch (questionType) {
          case 'EN_TO_VI':
              return <span className="text-sm sm:text-lg font-bold text-slate-700 text-center leading-tight">{opt.vietnamese}</span>;
          case 'VI_TO_EN':
              return <span className="text-base sm:text-xl font-black text-blue-700 text-center leading-tight">{opt.english}</span>;
          case 'AUDIO_TO_IMAGE':
              return (
                  <div className="flex flex-col items-center justify-center w-full h-full p-1 sm:p-2">
                      <WordImage word={opt} className="w-full h-20 sm:h-32 rounded-lg" />
                  </div>
              );
      }
  };

  const renderQuestionHeader = () => {
      if (questionType === 'EN_TO_VI') {
          return (
              <div className="text-center mb-4 sm:mb-6 animate-fadeIn">
                  <h2 className="text-gray-500 font-bold mb-1 uppercase tracking-wide text-[10px]">Dịch sang Tiếng Việt</h2>
                  <h1 className="text-2xl sm:text-4xl font-black text-blue-600 drop-shadow-sm">{currentQuizWord.english}</h1>
                  <button onClick={() => playAudio(currentQuizWord.english)} className="mt-1 text-blue-400 hover:text-blue-600"><Volume2 size={20} className="mx-auto" /></button>
              </div>
          );
      } else if (questionType === 'VI_TO_EN') {
          return (
              <div className="text-center mb-4 sm:mb-6 animate-fadeIn">
                  <h2 className="text-gray-500 font-bold mb-1 uppercase tracking-wide text-[10px]">Chọn từ Tiếng Anh đúng</h2>
                  <h1 className="text-xl sm:text-3xl font-black text-orange-600 drop-shadow-sm">{currentQuizWord.vietnamese}</h1>
              </div>
          );
      } else {
          return (
              <div className="text-center mb-2 sm:mb-4 animate-fadeIn">
                  <h2 className="text-gray-500 font-bold mb-1 uppercase tracking-wide text-[10px]">Nghe và chọn hình đúng</h2>
                  <button onClick={() => playAudio(currentQuizWord.english)} className="w-12 h-12 sm:w-16 sm:h-16 bg-pink-500 text-white rounded-full flex items-center justify-center mx-auto shadow-lg hover:bg-pink-600 hover:scale-110 transition-all active:scale-95 animate-bounce"><Volume2 size={24} /></button>
              </div>
          );
      }
  };

  if (mode === 'LEARN') {
    return (
      <div className="flex flex-col items-center w-full max-w-md mx-auto p-4 animate-fadeIn relative h-full max-h-[500px]">
        <div className="w-full flex items-center justify-between mb-4 flex-shrink-0">
            <h2 className="text-xs font-black text-blue-600 bg-blue-100 px-3 py-1 rounded-full border border-blue-200">
                Học từ ({currentIndex + 1}/{words.length})
            </h2>
            <div className="flex gap-1">
                {words.map((_, idx) => (
                    <div key={idx} className={`h-1.5 w-1.5 rounded-full transition-all ${idx === currentIndex ? 'bg-blue-500 scale-125' : idx < currentIndex ? 'bg-green-400' : 'bg-gray-200'}`} />
                ))}
            </div>
        </div>
        
        <div className="relative w-full flex-1 perspective-1000 group z-10 mb-4">
          <div className={`relative w-full h-full duration-500 transform-style-3d transition-transform cursor-pointer ${isFlipped ? 'rotate-y-180' : ''}`} onClick={handleFlip}>
            
            {/* FRONT */}
            <div className="absolute w-full h-full backface-hidden bg-white border-2 sm:border-4 border-blue-100 rounded-3xl shadow-xl flex flex-col overflow-hidden">
                <div className="flex-1 w-full bg-blue-50 p-2 sm:p-4 relative flex items-center justify-center overflow-hidden">
                    <WordImage word={currentWord} className="w-full h-full rounded-2xl shadow-inner bg-white object-contain" />
                    <div className="absolute bottom-2 right-2 bg-white/80 p-1 rounded-full text-blue-300">
                        <RotateCw size={16} />
                    </div>
                </div>
                
                <div className="h-auto min-h-[100px] sm:min-h-[140px] flex flex-col items-center justify-center p-3 sm:p-4 bg-white relative z-20">
                    <h3 className="text-xl sm:text-3xl font-black text-slate-800 mb-2 tracking-tight text-center leading-tight line-clamp-2">
                        {currentWord.english}
                    </h3>
                    
                    <button 
                        onClick={(e) => { 
                            e.preventDefault();
                            e.stopPropagation();
                            playAudio(currentWord.english); 
                        }} 
                        className="flex items-center gap-1 px-4 py-2 sm:px-6 sm:py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-full font-bold shadow-lg transition-transform active:scale-95 z-30"
                    >
                        <Volume2 size={18} /> 
                        <span className="text-xs sm:text-base">Nghe từ</span>
                    </button>
                </div>
            </div>

            {/* BACK */}
            <div className="absolute w-full h-full backface-hidden rotate-y-180 bg-white border-2 sm:border-4 border-orange-100 rounded-3xl shadow-xl flex flex-col overflow-hidden">
                <div className="bg-orange-50 p-4 flex flex-col items-center justify-center h-[35%] border-b border-orange-100 relative">
                     <h3 className="text-xl sm:text-2xl font-black text-orange-600 mb-1 text-center leading-tight break-words px-2">
                        {currentWord.vietnamese}
                     </h3>
                     <p className="text-gray-400 font-mono text-sm italic">/{currentWord.pronunciation}/</p>
                </div>
                <div className="flex-1 p-3 sm:p-4 flex flex-col justify-center bg-white">
                    <div className="bg-blue-50 p-3 rounded-xl border-l-4 border-blue-400 relative">
                        <span className="absolute -top-2 left-2 bg-blue-400 text-white text-[8px] px-2 py-0.5 rounded-full font-bold">Ví dụ</span>
                        
                        <div className="flex items-start gap-2 mt-2">
                            <button 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    playAudio(currentWord.exampleEn, 0.7);
                                }}
                                className="mt-0.5 text-blue-500 hover:text-blue-700 bg-white p-1.5 rounded-full shadow-sm active:scale-90 transition-transform"
                            >
                                <Headphones size={14} />
                            </button>
                            <div>
                                <p className="text-sm sm:text-base font-bold text-slate-700 leading-snug">"{currentWord.exampleEn}"</p>
                                <p className="text-[10px] sm:text-xs text-slate-500 mt-1 italic">{currentWord.exampleVi}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
          </div>
        </div>

        <div className="w-full flex gap-2 px-1 flex-shrink-0">
          <button onClick={handleNextLearn} className="w-full py-3 bg-gradient-to-r from-green-400 to-green-600 text-white rounded-2xl font-bold text-base shadow-[0_4px_0_rgb(21,128,61)] active:translate-y-1 transition-all flex items-center justify-center gap-2">
            {currentIndex < words.length - 1 ? "Tiếp theo" : "Làm bài tập"} <ArrowRight size={20} />
          </button>
        </div>
      </div>
    );
  }

  if (!currentQuizWord) return <div className="flex justify-center items-center h-48"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div></div>;

  return (
      <div className="flex flex-col items-center justify-center w-full max-w-md mx-auto p-2 sm:p-4 animate-fadeIn">
        <div className="flex items-center gap-2 mb-4 bg-yellow-100 px-3 py-1 rounded-full border border-yellow-300 shadow-sm">
            <Trophy className="text-yellow-600 fill-yellow-600" size={16} />
            <span className="text-sm font-black text-yellow-800">Điểm: {score}/{words.length}</span>
        </div>

        {renderQuestionHeader()}
        
        <div className="grid grid-cols-2 gap-3 w-full">
            {currentOptions.map((opt) => {
                const isSelected = selectedOption === opt.id;
                const isTarget = opt.id === currentQuizWord.id;
                
                let borderClass = 'border-b-4 border-gray-200 hover:border-blue-300';
                let bgClass = 'bg-white';
                let animationClass = '';

                if (selectedOption) {
                    if (isTarget) {
                        borderClass = 'border-b-4 border-green-600 ring-2 ring-green-200'; 
                        bgClass = 'bg-green-50';
                    } else if (isSelected && !isTarget) {
                        borderClass = 'border-b-4 border-red-600'; 
                        bgClass = 'bg-red-50 opacity-80';
                        animationClass = 'animate-shake'; 
                    } else {
                        borderClass = 'border-gray-100 opacity-40 border-b-2'; 
                    }
                }

                const heightClass = (questionType === 'AUDIO_TO_IMAGE' || opt.emoji) ? 'min-h-[90px] sm:min-h-[120px]' : 'min-h-[60px] sm:min-h-[80px]';

                return (
                    <button
                        key={opt.id}
                        onClick={() => handleOptionSelect(opt.id)}
                        disabled={!!selectedOption}
                        className={`relative rounded-2xl p-2 shadow-md transition-all active:scale-95 flex flex-col items-center justify-center ${heightClass} ${bgClass} ${borderClass} ${animationClass}`}
                    >
                        {renderOptionContent(opt)}
                    </button>
                )
            })}
        </div>
        
         <div className="mt-6 h-2 w-full bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-yellow-400 transition-all duration-300" style={{ width: `${((quizIndex) / words.length) * 100}%` }} />
        </div>
      </div>
  )
};
