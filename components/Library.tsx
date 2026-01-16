
import React, { useState } from 'react';
import { Word } from '../types';
import { WordImage } from './WordImage';
import { ArrowLeft, ArrowRight, RotateCw, Volume2, Star } from 'lucide-react';
import { playSFX } from '../utils/sound';

interface LibraryProps {
  words: Word[];
  unlockedCount: number;
}

export const Library: React.FC<LibraryProps> = ({ words, unlockedCount }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Filter only unlocked words (simulation)
  const availableWords = words.slice(0, Math.max(5, unlockedCount));
  const currentWord = availableWords[currentIndex];

  const handleNext = () => {
    playSFX('flip');
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % availableWords.length);
  };

  const handlePrev = () => {
    playSFX('flip');
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + availableWords.length) % availableWords.length);
  };

  const playAudio = (e: React.MouseEvent) => {
    e.stopPropagation();
    const u = new SpeechSynthesisUtterance(currentWord.english);
    u.lang = 'en-US';
    window.speechSynthesis.speak(u);
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-purple-50">
        
        {/* Progress */}
        <div className="mb-6 flex flex-col items-center">
            <span className="text-purple-400 font-bold uppercase text-xs tracking-widest mb-1">Thẻ từ vựng của bạn</span>
            <div className="text-2xl font-black text-purple-700">{currentIndex + 1} / {availableWords.length}</div>
        </div>

        {/* Card Container */}
        <div 
            className="w-full max-w-sm aspect-[3/4] perspective-1000 cursor-pointer group"
            onClick={() => { setIsFlipped(!isFlipped); playSFX('click'); }}
        >
            <div className={`relative w-full h-full transition-transform duration-500 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
                
                {/* FRONT */}
                <div className="absolute inset-0 backface-hidden bg-white rounded-[2.5rem] border-4 border-purple-100 shadow-2xl flex flex-col items-center p-6 justify-between">
                    <div className="w-full flex justify-between items-start">
                        <Star size={24} className="text-yellow-400 fill-yellow-400" />
                        <div className="bg-purple-100 p-2 rounded-full"><RotateCw size={20} className="text-purple-400"/></div>
                    </div>
                    
                    <div className="flex-1 w-full flex items-center justify-center my-4">
                        <div className="w-48 h-48 rounded-full border-8 border-purple-50 overflow-hidden shadow-inner">
                            <WordImage word={currentWord} className="w-full h-full" hideLabel />
                        </div>
                    </div>

                    <div className="text-center mb-8">
                        <h2 className="text-4xl font-black text-slate-800 mb-2">{currentWord.english}</h2>
                        <button onClick={playAudio} className="p-3 bg-purple-500 text-white rounded-full shadow-lg active:scale-95 transition-transform">
                            <Volume2 size={24} />
                        </button>
                    </div>
                </div>

                {/* BACK */}
                <div className="absolute inset-0 backface-hidden rotate-y-180 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-[2.5rem] shadow-2xl flex flex-col items-center justify-center p-8 text-center text-white border-4 border-white/20">
                    <h2 className="text-4xl font-black mb-2">{currentWord.vietnamese}</h2>
                    <p className="text-lg opacity-80 font-mono mb-8">/{currentWord.pronunciation}/</p>
                    
                    <div className="bg-white/10 p-4 rounded-2xl w-full border border-white/10">
                        <p className="text-lg font-bold mb-1">"{currentWord.exampleEn}"</p>
                        <p className="text-sm opacity-75">{currentWord.exampleVi}</p>
                    </div>
                </div>
            </div>
        </div>

        {/* Controls */}
        <div className="flex gap-6 mt-8 w-full max-w-xs justify-center">
            <button onClick={handlePrev} className="p-4 bg-white rounded-full shadow-lg text-purple-400 hover:text-purple-600 active:scale-95 transition-all">
                <ArrowLeft size={32} />
            </button>
            <button onClick={handleNext} className="p-4 bg-purple-500 rounded-full shadow-lg text-white hover:bg-purple-600 active:scale-95 transition-all">
                <ArrowRight size={32} />
            </button>
        </div>

    </div>
  );
};
