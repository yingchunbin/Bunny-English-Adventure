
import React, { useState, useEffect } from 'react';
import { Word } from '../../types';
import { X, Check, BrainCircuit, Droplets, Bug, Zap } from 'lucide-react';
import { playSFX } from '../../utils/sound';
import { WordImage } from '../WordImage';

interface LearningQuizModalProps {
  words: Word[];
  type: 'WATER' | 'PEST' | 'SPEED_UP';
  onSuccess: () => void;
  onClose: () => void;
  onShowAlert: (msg: string, type: 'INFO' | 'DANGER') => void;
}

export const LearningQuizModal: React.FC<LearningQuizModalProps> = ({ words, type, onSuccess, onClose, onShowAlert }) => {
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
          onShowAlert("Sai rồi! Bé thử lại lần sau nhé!", "DANGER");
          onClose();
      }
  };

  if (!question) return null;

  let icon = <Zap size={32} />;
  let title = "Học Để Tăng Tốc";
  let desc = "Trả lời đúng để giảm thời gian chờ!";
  let bg = "bg-yellow-100 text-yellow-600";

  if (type === 'WATER') {
      icon = <Droplets size={32} />;
      title = "Giếng Thần Tri Thức";
      desc = "Chọn hình đúng để lấy nước!";
      bg = "bg-blue-100 text-blue-500";
  } else if (type === 'PEST') {
      icon = <Bug size={32} />;
      title = "Thử Thách Nông Trại";
      desc = "Trả lời đúng để dọn dẹp!";
      bg = "bg-green-100 text-green-500";
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-fadeIn">
        <div className="bg-white rounded-[2rem] w-full max-w-sm p-6 shadow-2xl relative border-4 border-indigo-200">
            <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"><X /></button>
            
            <div className="text-center mb-6">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 border-4 border-white shadow-lg ${bg}`}>
                    {icon}
                </div>
                <h3 className="text-lg font-black text-indigo-800 uppercase">
                    {title}
                </h3>
                <p className="text-xs font-bold text-slate-500">
                    {desc}
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
