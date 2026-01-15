
import React, { useState, useEffect } from 'react';
import { Word } from '../../types';
import { Volume2, Droplets, X, RefreshCw } from 'lucide-react';
import { playSFX } from '../../utils/sound';
import { WordImage } from '../WordImage';

interface WellModalProps {
  words: Word[];
  onSuccess: (amount: number) => void;
  onClose: () => void;
}

export const WellModal: React.FC<WellModalProps> = ({ words, onSuccess, onClose }) => {
  const [targetWord, setTargetWord] = useState<Word | null>(null);
  const [options, setOptions] = useState<Word[]>([]);
  const [step, setStep] = useState<'READY' | 'PLAYING' | 'SUCCESS'>('READY');
  const [wrongId, setWrongId] = useState<string | null>(null);

  // Helper to pick a new word
  const pickNewWord = () => {
    if (words.length >= 4) {
      const target = words[Math.floor(Math.random() * words.length)];
      setTargetWord(target);
      const distractors = words.filter(w => w.id !== target.id).sort(() => 0.5 - Math.random()).slice(0, 3);
      setOptions([target, ...distractors].sort(() => 0.5 - Math.random()));
      
      // Auto play sound for the new word
      setTimeout(() => {
          const u = new SpeechSynthesisUtterance(target.english);
          u.lang = 'en-US';
          window.speechSynthesis.speak(u);
      }, 300);
    }
  };

  useEffect(() => {
    pickNewWord();
  }, []); // Run ONLY once on mount

  const playWord = () => {
    if (!targetWord) return;
    const u = new SpeechSynthesisUtterance(targetWord.english);
    u.lang = 'en-US';
    u.rate = 0.8;
    window.speechSynthesis.speak(u);
  };

  const handleOptionClick = (word: Word) => {
    if (!targetWord) return;
    
    if (word.id === targetWord.id) {
        playSFX('success');
        setStep('SUCCESS');
        setTimeout(() => {
            onSuccess(2); // Balanced reward: 2 drops
        }, 1500);
    } else {
        playSFX('wrong');
        setWrongId(word.id);
        
        // Logic: Wrong answer -> Shake -> Switch to NEW word immediately
        setTimeout(() => {
            setWrongId(null);
            pickNewWord(); // Force new word
        }, 500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fadeIn">
        <div className="bg-white rounded-3xl p-6 w-full max-w-sm relative border-4 border-blue-200 shadow-2xl overflow-hidden">
            <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X /></button>
            <div className="text-center mb-6">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2 border-4 border-blue-300">
                    <Droplets className="text-blue-500 animate-bounce" size={40} />
                </div>
                <h3 className="text-xl font-bold text-blue-700">Giếng Thần Tri Thức</h3>
                <p className="text-xs text-gray-500">Nghe và chọn đúng hình để lấy nước!</p>
            </div>

            {step === 'READY' && (
                <div className="text-center">
                    <p className="mb-4 text-gray-600 font-bold">Trả lời đúng: Nhận 2 Giọt nước<br/>Trả lời sai: Đổi câu hỏi khác</p>
                    <button onClick={() => { setStep('PLAYING'); playWord(); }} className="px-8 py-3 bg-blue-500 text-white rounded-xl font-bold shadow-lg shadow-blue-200 active:scale-95">Bắt đầu</button>
                </div>
            )}

            {step === 'PLAYING' && targetWord && (
                <div className="flex flex-col items-center">
                    <button onClick={playWord} className="mb-6 p-4 bg-blue-500 text-white rounded-full shadow-lg hover:scale-110 transition-transform animate-pulse"><Volume2 size={32} /></button>
                    <div className="grid grid-cols-2 gap-4 w-full">
                        {options.map(opt => (
                            <button 
                                key={opt.id} 
                                onClick={() => handleOptionClick(opt)} 
                                className={`aspect-square rounded-xl border-2 p-2 transition-all active:scale-95 relative ${wrongId === opt.id ? 'border-red-500 bg-red-100 animate-shake' : 'border-gray-200 hover:border-blue-400 hover:bg-blue-50'}`}
                            >
                                <WordImage word={opt} className="w-full h-full rounded-lg" />
                                {wrongId === opt.id && <div className="absolute inset-0 flex items-center justify-center bg-red-200/50 rounded-lg"><X className="text-red-600" size={48} /></div>}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {step === 'SUCCESS' && (
                <div className="text-center animate-bounce py-8">
                    <h2 className="text-2xl font-bold text-blue-600 mb-2">Chính xác!</h2>
                    <p className="text-gray-600">Bạn nhận được <span className="font-bold text-blue-500">+2 Giọt Nước</span></p>
                </div>
            )}
            
            <style>{`
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-5px); }
                    75% { transform: translateX(5px); }
                }
                .animate-shake { animation: shake 0.3s ease-in-out; }
            `}</style>
        </div>
    </div>
  );
};
