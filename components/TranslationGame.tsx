
import React, { useState, useEffect } from 'react';
import { getTranslationFeedback, FeedbackResponse } from '../services/geminiService';
import { Sparkles, ArrowRight, ArrowLeftRight, HelpCircle, Volume2, Lightbulb } from 'lucide-react';
import { Avatar } from './Avatar';
import { playSFX } from '../utils/sound';

interface SentenceData {
  en: string;
  vi: string;
  scrambled: string[]; // Vi words
  scrambledEn: string[]; // En words
}

interface TranslationGameProps {
  sentences: SentenceData[];
  onComplete: (coinsEarned: number) => void;
}

// Robust normalization: lowercase, remove all punctuation, normalize spaces
const normalize = (str: string) => str.toLowerCase().replace(/[.,?!]/g, '').replace(/\s+/g, ' ').trim();

export const TranslationGame: React.FC<TranslationGameProps> = ({ sentences, onComplete }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<'EN_TO_VI' | 'VI_TO_EN'>('EN_TO_VI');
  
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [availableWords, setAvailableWords] = useState<string[]>([]);
  
  const [aiFeedback, setAiFeedback] = useState<FeedbackResponse | null>(null);
  const [status, setStatus] = useState<'IDLE' | 'CHECKING' | 'CORRECT' | 'WRONG'>('IDLE');
  const [hintsUsed, setHintsUsed] = useState(0);

  const currentSentence = sentences[currentIndex];

  useEffect(() => {
    if (currentSentence) {
      const newDirection = currentIndex % 2 === 0 ? 'EN_TO_VI' : 'VI_TO_EN';
      setDirection(newDirection);

      const words = newDirection === 'EN_TO_VI' 
        ? [...currentSentence.scrambled] 
        : [...currentSentence.scrambledEn];
        
      setAvailableWords(words);
      setSelectedIndices([]);
      setAiFeedback(null);
      setStatus('IDLE');
      setHintsUsed(0);
    }
  }, [currentIndex, currentSentence]);

  const handleSelectWord = (index: number) => {
    if (status === 'CORRECT') return;
    if (selectedIndices.includes(index)) return;

    playSFX('click');
    setSelectedIndices([...selectedIndices, index]);
    
    if (status === 'WRONG') {
        setStatus('IDLE');
        setAiFeedback(null);
    }
  };

  const handleRemoveWord = (selectedIndexInList: number) => {
    if (status === 'CORRECT') return;
    playSFX('click');
    const newSelected = [...selectedIndices];
    newSelected.splice(selectedIndexInList, 1);
    setSelectedIndices(newSelected);
    
    if (status === 'WRONG') {
        setStatus('IDLE');
        setAiFeedback(null);
    }
  };

  const handleHint = () => {
      const targetSentence = direction === 'EN_TO_VI' ? currentSentence.vi : currentSentence.en;
      const targetWords = targetSentence.split(' ');
      
      setHintsUsed(h => h + 1);
      playSFX('flip');
      
      // Simple hint: if user hasn't selected anything or is stuck
      setAiFeedback({
          isCorrect: false,
          hint: `Câu này có ${targetWords.length} từ. Con thử đọc to lên xem!`,
          highlight: [],
          encouragement: "Gần đúng rồi!"
      });
  };

  const checkAnswer = async () => {
    if (selectedIndices.length === 0) return;
    
    setStatus('CHECKING');
    const userSentence = selectedIndices.map(i => availableWords[i]).join(' ');
    const targetSentence = direction === 'EN_TO_VI' ? currentSentence.vi : currentSentence.en;

    // Use robust normalization for comparison
    if (normalize(userSentence) === normalize(targetSentence)) {
      playSFX('correct');
      setStatus('CORRECT');
      setAiFeedback({
          isCorrect: true,
          hint: "",
          highlight: [],
          encouragement: "Tuyệt vời! Chính xác 100% 🎉"
      });
      return;
    }

    playSFX('wrong');
    setAiFeedback({
        isCorrect: false,
        hint: "Bé hãy xem lại thứ tự các từ nhé!",
        highlight: [],
        encouragement: "Suýt đúng rồi! Thử lại đi nào 💪"
    });
    setStatus('WRONG');
  };

  const handleNext = () => {
    if (currentIndex < sentences.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      onComplete(sentences.length * 10);
    }
  };

  const giveUp = () => {
      setAiFeedback({
          isCorrect: false,
          hint: `Đáp án đúng là: "${direction === 'EN_TO_VI' ? currentSentence.vi : currentSentence.en}"`,
          highlight: [],
          encouragement: "Không sao đâu, lần sau bé sẽ làm tốt hơn! 🐢"
      });
      setStatus('CORRECT'); 
  };

  if (!currentSentence) return <div>Đã hết câu hỏi!</div>;

  const questionText = direction === 'EN_TO_VI' ? currentSentence.en : currentSentence.vi;
  const questionLang = direction === 'EN_TO_VI' ? 'English' : 'Tiếng Việt';
  const textSizeClass = questionText.length > 30 ? 'text-lg sm:text-xl' : 'text-2xl sm:text-3xl';

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto p-4 h-full animate-fadeIn">
      {/* Progress Bar */}
      <div className="w-full flex justify-between items-center mb-4">
        <h2 className="text-xs sm:text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
           <ArrowLeftRight size={14} />
           {direction === 'EN_TO_VI' ? "Anh ➔ Việt" : "Việt ➔ Anh"}
        </h2>
        <div className="h-3 w-24 sm:w-32 bg-slate-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-purple-500 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${((currentIndex + 1) / sentences.length) * 100}%` }}
          />
        </div>
      </div>
      
      {/* Question Card */}
      <div className="w-full bg-white p-4 sm:p-6 rounded-[2rem] shadow-xl border-b-8 border-purple-100 mb-4 text-center relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-purple-400 to-pink-400"></div>
        <span className="absolute top-4 left-4 text-[10px] font-extrabold bg-purple-100 text-purple-600 px-3 py-1 rounded-full uppercase tracking-wider">{questionLang}</span>
        
        <p className={`${textSizeClass} font-black text-slate-800 mt-6 mb-4 leading-snug break-words`}>{questionText}</p>
        
        {direction === 'EN_TO_VI' && (
            <button 
            onClick={() => {
                const u = new SpeechSynthesisUtterance(currentSentence.en);
                u.lang = 'en-US'; 
                window.speechSynthesis.speak(u);
            }}
            className="inline-flex items-center gap-2 text-sm text-purple-600 font-bold bg-purple-50 hover:bg-purple-100 px-4 py-2 rounded-full transition-colors active:scale-95"
            >
            <Volume2 size={18} /> Nghe
            </button>
        )}
      </div>

      {/* Answer Area - Improved CSS for Overflow */}
      <div className={`w-full min-h-[120px] h-auto bg-white rounded-2xl p-4 mb-4 flex flex-wrap gap-2 items-start content-start border-2 transition-colors duration-300 shadow-inner ${
          status === 'WRONG' ? 'border-red-400 bg-red-50' : 
          status === 'CORRECT' ? 'border-green-400 bg-green-50' : 
          'border-slate-200 focus-within:border-blue-400'
        }`}>
        
        {selectedIndices.length === 0 && <span className="text-slate-400 italic w-full text-center text-sm font-medium mt-8">Bấm vào từ bên dưới để dịch...</span>}
        
        {selectedIndices.map((wordIndex, idx) => {
            const word = availableWords[wordIndex];
            return (
                <button 
                    key={`selected-${wordIndex}-${idx}`}
                    onClick={() => handleRemoveWord(idx)}
                    className="px-3 py-2 sm:px-4 sm:py-3 rounded-xl shadow-sm border-b-4 font-black text-lg sm:text-xl active:translate-y-1 active:border-b-0 transition-all animate-fadeIn bg-white text-slate-800 border-slate-200 hover:border-slate-300"
                >
                    {word}
                </button>
            );
        })}
      </div>

      {/* Word Bank */}
      <div className="flex flex-wrap gap-2 justify-center mb-6 w-full">
        {availableWords.map((word, idx) => {
          const isSelected = selectedIndices.includes(idx);
          return (
            <button
                key={`bank-${idx}`}
                onClick={() => handleSelectWord(idx)}
                disabled={isSelected}
                className={`px-3 py-2 sm:px-4 sm:py-3 rounded-xl border-b-4 font-black text-base sm:text-lg shadow-sm transition-all duration-200 ${
                    isSelected 
                    ? 'opacity-0 cursor-default pointer-events-none transform scale-90' 
                    : 'bg-blue-50 text-blue-800 border-blue-200 hover:bg-blue-100 hover:border-blue-300 active:border-b-0 active:translate-y-1'
                }`}
            >
                {word}
            </button>
          )
        })}
      </div>

      {/* Feedback & Actions */}
      <div className="w-full mt-auto">
        {status === 'CHECKING' && (
           <div className="flex flex-col items-center justify-center gap-2 text-purple-600 font-bold animate-pulse py-4">
             <Sparkles className="animate-spin" size={32} />
             <span>Thầy Rùa đang xem...</span>
           </div>
        )}

        {status === 'WRONG' && aiFeedback && (
            <div className="flex gap-3 bg-red-100 p-4 rounded-2xl border border-red-200 animate-fadeIn mb-4">
                <div className="shrink-0">
                    <Avatar emoji="🐢" bgGradient="bg-gradient-to-br from-red-400 to-orange-400" size="sm" />
                </div>
                <div className="flex-1">
                    <p className="font-bold text-red-800 mb-1">{aiFeedback.encouragement}</p>
                    <p className="text-sm text-red-700 bg-white/50 p-2 rounded-lg">💡 {aiFeedback.hint}</p>
                </div>
            </div>
        )}

        {status === 'CORRECT' && aiFeedback && (
             <div className="flex gap-3 bg-green-100 p-4 rounded-2xl border border-green-200 animate-fadeIn mb-4">
                <div className="shrink-0">
                    <Avatar emoji="🐢" bgGradient="bg-gradient-to-br from-green-400 to-emerald-400" size="sm" animate />
                </div>
                <div className="flex-1 flex flex-col justify-center">
                    <p className="font-bold text-green-800 text-lg">{aiFeedback.encouragement}</p>
                </div>
            </div>
        )}

        <div className="flex gap-3 pb-2">
            {status === 'CORRECT' ? (
                <button 
                    onClick={handleNext}
                    className="flex-1 py-4 bg-green-500 text-white rounded-2xl font-bold text-xl shadow-lg shadow-green-200 hover:bg-green-600 flex items-center justify-center gap-2 transition-transform hover:scale-105"
                >
                    {currentIndex < sentences.length - 1 ? "Tiếp tục" : "Hoàn thành"} <ArrowRight />
                </button>
            ) : (
                <>
                    <button
                        onClick={handleHint}
                        disabled={status === 'CHECKING'}
                        className="px-4 py-4 bg-yellow-100 text-yellow-600 rounded-2xl font-bold hover:bg-yellow-200 border-2 border-yellow-200 active:scale-95 transition-all"
                        title="Gợi ý"
                    >
                        <Lightbulb size={24} className={hintsUsed > 0 ? "fill-yellow-400 text-yellow-400" : ""} />
                    </button>

                    {status === 'WRONG' && (
                        <button
                            onClick={giveUp}
                            className="px-4 py-4 bg-gray-200 text-gray-500 rounded-2xl font-bold hover:bg-gray-300 active:scale-95"
                            title="Xem đáp án"
                        >
                            <HelpCircle size={24} />
                        </button>
                    )}
                    
                    <button 
                        onClick={checkAnswer}
                        disabled={status === 'CHECKING' || selectedIndices.length === 0}
                        className={`flex-1 py-4 rounded-2xl font-bold text-xl shadow-lg transition-all flex items-center justify-center gap-2 ${
                            status === 'WRONG' 
                            ? 'bg-red-500 text-white shadow-red-200 hover:bg-red-600 active:scale-95' 
                            : 'bg-blue-600 text-white shadow-blue-200 hover:bg-blue-700 active:scale-95 disabled:opacity-50 disabled:active:scale-100'
                        }`}
                    >
                        {status === 'WRONG' ? 'Thử lại' : 'Kiểm tra'}
                    </button>
                </>
            )}
        </div>
      </div>
    </div>
  );
};
