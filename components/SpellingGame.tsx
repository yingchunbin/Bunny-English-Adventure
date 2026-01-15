
import React, { useState, useEffect } from 'react';
import { Word } from '../types';
import { playSFX } from '../utils/sound';
import { Check, RefreshCcw, Volume2, HelpCircle, ArrowRight } from 'lucide-react';
import { WordImage } from './WordImage';

interface SpellingGameProps {
  words: Word[];
  onComplete: () => void;
}

export const SpellingGame: React.FC<SpellingGameProps> = ({ words, onComplete }) => {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [shuffledLetters, setShuffledLetters] = useState<{id: number, char: string}[]>([]);
  const [selectedLetters, setSelectedLetters] = useState<{id: number, char: string}[]>([]);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [hintUsed, setHintUsed] = useState(false);

  const targetWord = words[currentWordIndex];

  // Prepare letters
  useEffect(() => {
    if (targetWord) {
      const cleanWord = targetWord.english.toUpperCase().replace(/[^A-Z]/g, '');
      const letters = cleanWord.split('').map((char, index) => ({ id: index, char }));
      // Shuffle
      setShuffledLetters(letters.sort(() => Math.random() - 0.5));
      setSelectedLetters([]);
      setIsCorrect(null);
      setHintUsed(false);
      
      // Auto play audio
      const u = new SpeechSynthesisUtterance(targetWord.english);
      u.lang = 'en-US';
      window.speechSynthesis.speak(u);
    }
  }, [targetWord, currentWordIndex]);

  const handleSelectLetter = (letter: {id: number, char: string}) => {
    if (isCorrect) return;
    playSFX('click');
    const newSelected = [...selectedLetters, letter];
    setSelectedLetters(newSelected);
    setShuffledLetters(prev => prev.filter(l => l.id !== letter.id));

    // Check if full word formed
    const cleanTarget = targetWord.english.toUpperCase().replace(/[^A-Z]/g, '');
    if (newSelected.length === cleanTarget.length) {
        const formedWord = newSelected.map(l => l.char).join('');
        if (formedWord === cleanTarget) {
            playSFX('correct');
            setIsCorrect(true);
            setTimeout(() => {
                if (currentWordIndex < words.length - 1) {
                    setCurrentWordIndex(prev => prev + 1);
                } else {
                    onComplete();
                }
            }, 1000);
        } else {
            playSFX('wrong');
            setIsCorrect(false);
            // Reset after delay
            setTimeout(() => {
                handleReset();
            }, 800);
        }
    }
  };

  const handleReset = () => {
      const cleanWord = targetWord.english.toUpperCase().replace(/[^A-Z]/g, '');
      const letters = cleanWord.split('').map((char, index) => ({ id: index, char }));
      setShuffledLetters(letters.sort(() => Math.random() - 0.5));
      setSelectedLetters([]);
      setIsCorrect(null);
  };

  const handleHint = () => {
      if (hintUsed || selectedLetters.length > 0) return;
      setHintUsed(true);
      const cleanTarget = targetWord.english.toUpperCase().replace(/[^A-Z]/g, '');
      const firstChar = cleanTarget[0];
      
      // Find first char in shuffled
      const found = shuffledLetters.find(l => l.char === firstChar);
      if (found) {
          handleSelectLetter(found);
      }
  };

  if (!targetWord) return null;

  return (
    <div className="flex flex-col items-center justify-start w-full h-full p-4 animate-fadeIn">
        <div className="bg-white p-4 rounded-[2rem] shadow-xl border-4 border-indigo-100 w-full max-w-sm flex flex-col items-center relative flex-1">
            
            <div className="flex justify-between w-full items-center mb-4">
               <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Câu {currentWordIndex + 1}/{words.length}</span>
               <h3 className="text-indigo-500 font-black uppercase text-xs bg-indigo-50 px-3 py-1 rounded-full">Ghép từ</h3>
            </div>
            
            {/* Image & Audio */}
            <div className="relative w-32 h-32 mb-4 transform transition-transform">
                <WordImage word={targetWord} className="w-full h-full rounded-[1.5rem] shadow-lg border-2 border-slate-100" />
                <button 
                    onClick={() => {
                        const u = new SpeechSynthesisUtterance(targetWord.english);
                        u.lang = 'en-US';
                        window.speechSynthesis.speak(u);
                    }}
                    className="absolute -bottom-2 -right-2 bg-blue-500 text-white p-2 rounded-full shadow-lg active:scale-95 hover:bg-blue-600 transition-colors"
                >
                    <Volume2 size={20} />
                </button>
            </div>

            <p className="text-slate-500 font-bold mb-6 text-xl">"{targetWord.vietnamese}"</p>

            {/* Answer Slots - Bigger & clearer */}
            <div className="flex gap-2 mb-8 flex-wrap justify-center min-h-[64px] content-center bg-slate-50 p-2 rounded-2xl w-full">
                {targetWord.english.toUpperCase().replace(/[^A-Z]/g, '').split('').map((_, idx) => {
                    const letter = selectedLetters[idx];
                    return (
                        <div key={idx} className={`w-10 h-12 sm:w-12 sm:h-14 rounded-xl flex items-center justify-center text-2xl font-black transition-all shadow-sm border-b-4 ${
                            letter 
                            ? (isCorrect === true ? 'bg-green-500 text-white border-green-700 transform scale-110' : isCorrect === false ? 'bg-red-500 text-white border-red-700 animate-shake' : 'bg-indigo-500 text-white border-indigo-700')
                            : 'bg-white border-slate-200 border-2 border-dashed'
                        }`}>
                            {letter ? letter.char : ''}
                        </div>
                    )
                })}
            </div>

            {/* Letter Bank - Grid layout for easier tapping */}
            <div className="grid grid-cols-5 gap-3 mb-6 w-full px-2">
                {shuffledLetters.map((letter) => (
                    <button
                        key={letter.id}
                        onClick={() => handleSelectLetter(letter)}
                        className="aspect-square bg-white border-2 border-indigo-100 border-b-[5px] rounded-xl font-black text-indigo-600 text-xl hover:bg-indigo-50 active:scale-95 active:border-b-2 transition-all shadow-sm flex items-center justify-center"
                    >
                        {letter.char}
                    </button>
                ))}
            </div>

            <div className="flex justify-between w-full mt-auto">
                <button onClick={handleReset} className="text-slate-400 hover:text-slate-600 p-3 bg-slate-100 rounded-2xl hover:bg-slate-200 transition-colors"><RefreshCcw size={20}/></button>
                <button onClick={handleHint} className={`${hintUsed ? 'text-slate-300 bg-slate-100 cursor-not-allowed' : 'text-yellow-600 bg-yellow-100 hover:bg-yellow-200 border-b-4 border-yellow-200 active:border-b-0 active:translate-y-1'} px-4 py-2 rounded-2xl transition-all font-bold flex items-center gap-2 text-sm`}>
                    <HelpCircle size={18}/> Gợi ý
                </button>
            </div>
        </div>
    </div>
  );
};
