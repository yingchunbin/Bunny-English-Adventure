
import React, { useState, useEffect } from 'react';
import { Word } from '../types';
import { Volume2, ArrowRight, RotateCw, Headphones, BookOpen, Ear } from 'lucide-react';
import { playSFX } from '../utils/sound';

interface FlashcardGameProps {
  words: Word[];
  onComplete: () => void;
  initialMode?: 'LEARN' | 'QUIZ';
  backupWords?: Word[]; // Allow providing extra words for distractors
}

// Updated Question Types based on user request
type QuestionType = 'EN_TO_VI' | 'VI_TO_EN' | 'LISTEN_TO_EN' | 'LISTEN_TO_VI';

export const FlashcardGame: React.FC<FlashcardGameProps> = ({ words, onComplete, initialMode = 'LEARN', backupWords = [] }) => {
  if (!words || words.length === 0) {
      return (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 p-4">
              <BookOpen size={48} className="mb-2 text-gray-300"/>
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
      // Randomize between the 4 text/audio based question types
      const availableTypes: QuestionType[] = ['EN_TO_VI', 'VI_TO_EN', 'LISTEN_TO_EN', 'LISTEN_TO_VI'];
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
      
      // Ensure we have at least some options
      while (distractors.length < 3 && uniquePool.length > 1) {
          const random = uniquePool[Math.floor(Math.random() * uniquePool.length)];
          if (random.id !== currentQuizWord.id) distractors.push(random);
      }

      const options = [currentQuizWord, ...distractors].sort(() => 0.5 - Math.random());
      setCurrentOptions(options);
      
      setSelectedOption(null);
      setIsCorrect(null);

      // Auto play audio for listening questions
      if (nextType === 'LISTEN_TO_EN' || nextType === 'LISTEN_TO_VI') {
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
      // For EN_TO_VI or LISTEN_TO_VI, options are Vietnamese
      if (questionType === 'EN_TO_VI' || questionType === 'LISTEN_TO_VI') {
          return <span className="text-sm sm:text-lg font-bold text-slate-700 text-center leading-tight">{opt.vietnamese}</span>;
      }
      // For VI_TO_EN or LISTEN_TO_EN, options are English
      return <span className="text-base sm:text-xl font-black text-blue-700 text-center leading-tight">{opt.english}</span>;
  };

  const renderQuestionHeader = () => {
      switch (questionType) {
          case 'EN_TO_VI':
              return (
                  <div className="text-center mb-6 animate-fadeIn">
                      <h2 className="text-gray-400 font-bold mb-2 uppercase tracking-wide text-[10px]">Dịch sang Tiếng Việt</h2>
                      <h1 className="text-4xl font-black text-blue-600 drop-shadow-sm mb-2">{currentQuizWord.english}</h1>
                      <button onClick={() => playAudio(currentQuizWord.english)} className="text-blue-400 hover:text-blue-600 active:scale-95 transition-transform"><Volume2 size={24} className="mx-auto" /></button>
                  </div>
              );
          case 'VI_TO_EN':
              return (
                  <div className="text-center mb-6 animate-fadeIn">
                      <h2 className="text-gray-400 font-bold mb-2 uppercase tracking-wide text-[10px]">Chọn từ Tiếng Anh</h2>
                      <h1 className="text-3xl font-black text-orange-600 drop-shadow-sm">{currentQuizWord.vietnamese}</h1>
                  </div>
              );
          case 'LISTEN_TO_EN':
              return (
                  <div className="text-center mb-6 animate-fadeIn">
                      <h2 className="text-gray-400 font-bold mb-4 uppercase tracking-wide text-[10px]">Nghe và chọn từ Tiếng Anh</h2>
                      <button onClick={() => playAudio(currentQuizWord.english)} className="w-20 h-20 bg-blue-500 text-white rounded-full flex items-center justify-center mx-auto shadow-lg shadow-blue-200 hover:bg-blue-600 hover:scale-110 transition-all active:scale-95 animate-pulse">
                          <Volume2 size={40} />
                      </button>
                  </div>
              );
          case 'LISTEN_TO_VI':
              return (
                  <div className="text-center mb-6 animate-fadeIn">
                      <h2 className="text-gray-400 font-bold mb-4 uppercase tracking-wide text-[10px]">Nghe và chọn nghĩa Tiếng Việt</h2>
                      <button onClick={() => playAudio(currentQuizWord.english)} className="w-20 h-20 bg-pink-500 text-white rounded-full flex items-center justify-center mx-auto shadow-lg shadow-pink-200 hover:bg-pink-600 hover:scale-110 transition-all active:scale-95 animate-pulse">
                          <Ear size={40} />
                      </button>
                  </div>
              );
      }
  };

  if (mode === 'LEARN') {
    return (
      <div className="flex flex-col items-center w-full max-w-md mx-auto p-4 animate-fadeIn relative h-full max-h-[600px]">
        {/* Progress Dots */}
        <div className="w-full flex items-center justify-between mb-4 flex-shrink-0">
            <h2 className="text-xs font-black text-blue-600 bg-blue-100 px-3 py-1 rounded-full border border-blue-200">
                Học từ ({currentIndex + 1}/{words.length})
            </h2>
            <div className="flex gap-1">
                {words.map((_, idx) => (
                    <div key={idx} className={`h-1.5 w-1.5 rounded-full transition-all ${idx === currentIndex ? 'bg-blue-500 scale-150' : idx < currentIndex ? 'bg-green-400' : 'bg-gray-200'}`} />
                ))}
            </div>
        </div>
        
        {/* FLASHCARD CONTAINER */}
        <div className="relative w-full flex-1 perspective-1000 group z-10 mb-4 min-h-[350px]">
          <div className={`relative w-full h-full duration-500 transform-style-3d transition-transform cursor-pointer ${isFlipped ? 'rotate-y-180' : ''}`} onClick={handleFlip}>
            
            {/* FRONT CARD (EN + VI) */}
            <div className="absolute w-full h-full backface-hidden bg-white border-4 border-blue-100 rounded-[2rem] shadow-xl flex flex-col items-center justify-center p-6 relative overflow-hidden">
                {/* Decoration Circles */}
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-50 rounded-full z-0 opacity-50"></div>
                <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-orange-50 rounded-full z-0 opacity-50"></div>
                
                <div className="z-10 text-center flex flex-col items-center gap-6">
                    <div>
                        <h3 className="text-4xl sm:text-5xl font-black text-blue-600 tracking-tight mb-2 drop-shadow-sm">
                            {currentWord.english}
                        </h3>
                        <div className="w-16 h-1 bg-gray-100 mx-auto rounded-full"></div>
                    </div>
                    
                    <p className="text-xl sm:text-2xl font-bold text-slate-500">
                        {currentWord.vietnamese}
                    </p>

                    <button 
                        onClick={(e) => { 
                            e.preventDefault();
                            e.stopPropagation();
                            playAudio(currentWord.english); 
                        }} 
                        className="mt-4 w-16 h-16 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg shadow-blue-200 flex items-center justify-center transition-transform active:scale-90"
                    >
                        <Volume2 size={32} />
                    </button>
                </div>

                <div className="absolute bottom-4 right-4 text-gray-300 flex items-center gap-1 text-[10px] uppercase font-bold tracking-widest">
                    <RotateCw size={14} /> Lật thẻ
                </div>
            </div>

            {/* BACK CARD (EN + IPA + EXAMPLE) */}
            <div className="absolute w-full h-full backface-hidden rotate-y-180 bg-white border-4 border-orange-100 rounded-[2rem] shadow-xl flex flex-col overflow-hidden">
                {/* Header Section */}
                <div className="bg-orange-50/50 p-6 flex flex-col items-center justify-center border-b border-orange-100">
                     <h3 className="text-3xl font-black text-slate-800">
                        {currentWord.english}
                     </h3>
                     <span className="text-gray-400 font-mono text-lg italic mt-1">/{currentWord.pronunciation}/</span>
                </div>

                {/* Example Section */}
                <div className="flex-1 p-6 flex flex-col justify-center items-center bg-white">
                    <div className="w-full bg-blue-50 p-5 rounded-2xl border border-blue-100 relative text-center">
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-100 text-blue-600 text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-wider shadow-sm border border-blue-200">
                            Ví dụ
                        </div>
                        
                        <p className="text-xl font-bold text-slate-700 mt-2 mb-2 leading-snug">
                            "{currentWord.exampleEn}"
                        </p>
                        <p className="text-sm font-medium text-slate-500 italic mb-4">
                            {currentWord.exampleVi}
                        </p>

                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                playAudio(currentWord.exampleEn, 0.85); // Slower for sentences
                            }}
                            className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-200 text-blue-500 font-bold text-xs hover:bg-blue-50 active:scale-95 transition-all"
                        >
                            <Headphones size={14} /> Nghe cả câu
                        </button>
                    </div>
                </div>
            </div>
          </div>
        </div>

        {/* Navigation Button */}
        <div className="w-full px-1 flex-shrink-0">
          <button onClick={handleNextLearn} className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl font-bold text-xl shadow-lg shadow-green-200 active:translate-y-1 transition-all flex items-center justify-center gap-3">
            {currentIndex < words.length - 1 ? "Tiếp theo" : "Làm bài tập"} <ArrowRight size={24} />
          </button>
        </div>
      </div>
    );
  }

  if (!currentQuizWord) return <div className="flex justify-center items-center h-48"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div></div>;

  return (
      <div className="flex flex-col items-center justify-center w-full max-w-md mx-auto p-4 animate-fadeIn h-full">
        <div className="w-full mb-6">
            <div className="flex justify-between items-center text-xs font-bold text-gray-400 mb-2">
                <span>Câu hỏi {quizIndex + 1}/{words.length}</span>
                <span>Điểm: {score}</span>
            </div>
            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-yellow-400 transition-all duration-300 ease-out" style={{ width: `${((quizIndex) / words.length) * 100}%` }} />
            </div>
        </div>

        <div className="flex-1 flex flex-col justify-center w-full">
            {renderQuestionHeader()}
            
            <div className="grid grid-cols-1 gap-3 w-full">
                {currentOptions.map((opt) => {
                    const isSelected = selectedOption === opt.id;
                    const isTarget = opt.id === currentQuizWord.id;
                    
                    let borderClass = 'border-2 border-slate-100 hover:border-blue-300';
                    let bgClass = 'bg-white';
                    let textClass = 'text-slate-700';
                    let shadowClass = 'shadow-sm';

                    if (selectedOption) {
                        if (isTarget) {
                            borderClass = 'border-2 border-green-500'; 
                            bgClass = 'bg-green-50';
                            textClass = 'text-green-700';
                            shadowClass = 'shadow-md shadow-green-100';
                        } else if (isSelected && !isTarget) {
                            borderClass = 'border-2 border-red-500'; 
                            bgClass = 'bg-red-50 opacity-80';
                            textClass = 'text-red-700';
                        } else {
                            bgClass = 'bg-slate-50 opacity-50'; 
                        }
                    }

                    return (
                        <button
                            key={opt.id}
                            onClick={() => handleOptionSelect(opt.id)}
                            disabled={!!selectedOption}
                            className={`relative rounded-2xl p-4 transition-all active:scale-98 min-h-[60px] flex items-center justify-center ${bgClass} ${borderClass} ${shadowClass}`}
                        >
                            {renderOptionContent(opt)}
                        </button>
                    )
                })}
            </div>
        </div>
      </div>
  )
};
