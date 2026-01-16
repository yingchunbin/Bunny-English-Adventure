
import React, { useState, useEffect } from 'react';
import { Word } from '../../types';
import { X, Check, BrainCircuit, Droplets, Bug } from 'lucide-react';
import { playSFX } from '../../utils/sound';
import { WordImage } from '../WordImage';

interface LearningQuizModalProps {
  words: Word[]; // Pool of words from current curriculum
  type: 'WATER' | 'PEST'; // Context
  onSuccess: () => void;
  onClose: () => void;
}

export const LearningQuizModal: React.FC<LearningQuizModalProps> = ({ words, type, onSuccess, onClose }) => {
  const [question, setQuestion] = useState<{ target: Word, options: Word[] } | null>(null);
  
  useEffect(() => {
      if (words.length >= 4) {
          const target = words[Math.floor(Math.random() * words.length)];
          const distractors = words.filter(w => w.id !== target.id).sort(() => 0.5 - Math.random()).slice(0, 3);
          setQuestion({
              target,
              options: [target, ...distractors].sort(() => 0.5 - Math.random())
          });
      }
  }, []);

  const handleAnswer = (wordId: string) => {
      if (!question) return;
      if (wordId === question.target.id) {
          playSFX('correct');
          onSuccess();
      } else {
          playSFX('wrong');
          alert("Sai rồi! Bé thử lại lần sau nhé!");
          onClose();
      }
  };

  if (!question) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-fadeIn">
        <div className="bg-white rounded-[2rem] w-full max-w-sm p-6 shadow-2xl relative border-4 border-indigo-200">
            <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"><X /></button>
            
            <div className="text-center mb-6">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 border-4 border-white shadow-lg ${type === 'WATER' ? 'bg-blue-100 text-blue-500' : 'bg-green-100 text-green-500'}`}>
                    {type === 'WATER' ? <Droplets size={32} /> : <Bug size={32} />}
                </div>
                <h3 className="text-lg font-black text-indigo-800 uppercase">
                    {type === 'WATER' ? "Giếng Thần Tri Thức" : "Thử Thách Nông Trại"}
                </h3>
                <p className="text-xs font-bold text-slate-500">
                    {type === 'WATER' ? "Chọn hình đúng để lấy nước!" : "Trả lời đúng để dọn dẹp!"}
                </p>
            </div>

            <div className="mb-6 text-center">
                <p className="text-slate-600 font-bold mb-2">Đâu là từ:</p>
                <h2 className="text-3xl font-black text-indigo-600">{question.target.english}</h2>
            </div>

            <div className="grid grid-cols-2 gap-3">
                {question.options.map(opt => (
                    <button 
                        key={opt.id}
                        onClick={() => handleAnswer(opt.id)}
                        className="aspect-square bg-slate-50 rounded-xl border-2 border-slate-200 hover:border-indigo-400 hover:bg-indigo-50 transition-all active:scale-95 p-2"
                    >
                        <WordImage word={opt} className="w-full h-full rounded-lg" hideLabel />
                    </button>
                ))}
            </div>
        </div>
    </div>
  );
};
