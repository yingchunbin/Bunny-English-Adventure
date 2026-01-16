
import React, { useState, useEffect } from 'react';
import { Word } from '../../types';
import { X, Check, BrainCircuit, Droplets, Bug, Zap, Volume2, Truck, RefreshCw } from 'lucide-react';
import { playSFX } from '../../utils/sound';
import { WordImage } from '../WordImage';

interface LearningQuizModalProps {
  words: Word[];
  type: 'WATER' | 'PEST' | 'SPEED_UP' | 'NEW_ORDER'; // Added NEW_ORDER
  onSuccess: () => void;
  onClose: () => void;
  onShowAlert: (msg: string, type: 'INFO' | 'DANGER') => void;
}

const QUESTION_COUNT = 3;

export const LearningQuizModal: React.FC<LearningQuizModalProps> = ({ words, type, onSuccess, onClose, onShowAlert }) => {
  const [questions, setQuestions] = useState<Array<{ target: Word, options: Word[], mode: 'IMAGE_TO_EN' | 'EN_TO_VI' | 'LISTEN' }>>([]);
  const [currentQIdx, setCurrentQIdx] = useState(0);
  
  useEffect(() => {
      if (words.length >= 4) {
          const newQuestions = [];
          for (let i = 0; i < QUESTION_COUNT; i++) {
              const target = words[Math.floor(Math.random() * words.length)];
              const distractors = words.filter(w => w.id !== target.id).sort(() => 0.5 - Math.random()).slice(0, 3);
              const modes: ('IMAGE_TO_EN' | 'EN_TO_VI' | 'LISTEN')[] = ['IMAGE_TO_EN', 'EN_TO_VI'];
              if (target.emoji) modes.push('LISTEN'); 
              
              const mode = modes[Math.floor(Math.random() * modes.length)];
              newQuestions.push({
                  target,
                  options: [target, ...distractors].sort(() => 0.5 - Math.random()),
                  mode
              });
          }
          setQuestions(newQuestions);
          
          // Auto play first audio if listen mode
          if (newQuestions[0].mode === 'LISTEN') {
              setTimeout(() => {
                  const u = new SpeechSynthesisUtterance(newQuestions[0].target.english);
                  u.lang = 'en-US';
                  window.speechSynthesis.speak(u);
              }, 500);
          }
      }
  }, []);

  const playAudio = () => {
      if (!questions[currentQIdx]) return;
      const u = new SpeechSynthesisUtterance(questions[currentQIdx].target.english);
      u.lang = 'en-US';
      window.speechSynthesis.speak(u);
  }

  const handleAnswer = (wordId: string) => {
      if (!questions[currentQIdx]) return;
      
      if (wordId === questions[currentQIdx].target.id) {
          playSFX('correct');
          
          if (currentQIdx < QUESTION_COUNT - 1) {
              const nextIdx = currentQIdx + 1;
              setCurrentQIdx(nextIdx);
              // Auto play next audio
              if (questions[nextIdx].mode === 'LISTEN') {
                  setTimeout(() => {
                      const u = new SpeechSynthesisUtterance(questions[nextIdx].target.english);
                      u.lang = 'en-US';
                      window.speechSynthesis.speak(u);
                  }, 500);
              }
          } else {
              // All correct
              setTimeout(() => {
                  playSFX('success');
                  onSuccess();
              }, 500);
          }
      } else {
          playSFX('wrong');
          // Regenerate current question to force retry with new data or shuffle options
          // Ideally we keep same question but user must try again. 
          // User feedback: "Sai rồi, thử lại nhé"
          onShowAlert("Sai rồi! Bé thử lại câu này nhé!", "DANGER");
      }
  };

  if (questions.length === 0) return null;

  const currentQ = questions[currentQIdx];

  let icon = <Zap size={32} />;
  let title = "Học Để Tăng Tốc";
  let desc = `Trả lời đúng ${QUESTION_COUNT} câu để giảm thời gian!`;
  let bg = "bg-yellow-100 text-yellow-600";

  if (type === 'WATER') {
      icon = <Droplets size={32} />;
      title = "Giếng Thần Tri Thức";
      desc = `Trả lời đúng ${QUESTION_COUNT} câu để lấy nước!`;
      bg = "bg-blue-100 text-blue-500";
  } else if (type === 'PEST') {
      icon = <Bug size={32} />;
      title = "Dũng Sĩ Diệt Sâu";
      desc = `Trả lời đúng ${QUESTION_COUNT} câu để dọn dẹp!`;
      bg = "bg-green-100 text-green-500";
  } else if (type === 'NEW_ORDER') {
      icon = <Truck size={32} />;
      title = "Tìm Kiếm Đơn Hàng";
      desc = `Hoàn thành ${QUESTION_COUNT} bài tập để nhận đơn mới!`;
      bg = "bg-orange-100 text-orange-500";
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-fadeIn">
        <div className="bg-white rounded-[2rem] w-full max-w-sm p-6 shadow-2xl relative border-4 border-indigo-200">
            <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"><X /></button>
            
            <div className="text-center mb-4">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-2 border-4 border-white shadow-lg ${bg}`}>
                    {icon}
                </div>
                <h3 className="text-lg font-black text-indigo-800 uppercase leading-none mb-1">
                    {title}
                </h3>
                <p className="text-xs font-bold text-slate-500">
                    {desc}
                </p>
                {/* Progress Dots */}
                <div className="flex justify-center gap-2 mt-2">
                    {[...Array(QUESTION_COUNT)].map((_, i) => (
                        <div key={i} className={`w-3 h-3 rounded-full ${i < currentQIdx ? 'bg-green-500' : i === currentQIdx ? 'bg-blue-500 animate-pulse' : 'bg-slate-200'}`} />
                    ))}
                </div>
            </div>

            <div className="mb-6 text-center">
                {currentQ.mode === 'LISTEN' ? (
                    <button onClick={playAudio} className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center mx-auto shadow-lg animate-pulse hover:bg-blue-600 transition-colors">
                        <Volume2 size={40} className="text-white"/>
                    </button>
                ) : (
                    <h2 className="text-2xl font-black text-indigo-600 min-h-[4rem] flex items-center justify-center">
                        {currentQ.mode === 'EN_TO_VI' ? currentQ.target.english : currentQ.target.vietnamese}
                    </h2>
                )}
                <p className="text-slate-400 font-bold text-xs mt-2 uppercase tracking-widest">
                    {currentQ.mode === 'LISTEN' ? 'Nghe và chọn hình đúng' : 
                     currentQ.mode === 'EN_TO_VI' ? 'Chọn nghĩa tiếng Việt' : 'Chọn từ tiếng Anh đúng'}
                </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
                {currentQ.options.map(opt => (
                    <button 
                        key={opt.id}
                        onClick={() => handleAnswer(opt.id)}
                        className="aspect-square bg-slate-50 rounded-xl border-2 border-slate-200 hover:border-indigo-400 hover:bg-indigo-50 transition-all active:scale-95 p-2 flex items-center justify-center"
                    >
                        {currentQ.mode === 'EN_TO_VI' ? (
                            <span className="font-bold text-slate-700 text-center text-sm">{opt.vietnamese}</span>
                        ) : (
                            <WordImage word={opt} className="w-full h-full rounded-lg" hideLabel={currentQ.mode === 'LISTEN'} />
                        )}
                    </button>
                ))}
            </div>
        </div>
    </div>
  );
};
