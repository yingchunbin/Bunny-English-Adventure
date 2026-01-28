
import React, { useState, useEffect } from 'react';
import { Word } from '../../types';
import { X, Zap, Volume2, Truck, Droplets, Bug } from 'lucide-react';
import { playSFX } from '../../utils/sound';

interface LearningQuizModalProps {
  words: Word[];
  type: 'WATER' | 'PEST' | 'SPEED_UP' | 'NEW_ORDER'; 
  onSuccess: () => void;
  onClose: () => void;
  onShowAlert: (msg: string, type: 'INFO' | 'DANGER') => void;
}

const QUESTION_COUNT = 3;

export const LearningQuizModal: React.FC<LearningQuizModalProps> = ({ words, type, onSuccess, onClose, onShowAlert }) => {
  const [questions, setQuestions] = useState<Array<{ target: Word, options: Word[], mode: 'EN_TO_VI' | 'VI_TO_EN' | 'LISTEN' }>>([]);
  const [currentQIdx, setCurrentQIdx] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false); // Prevent double clicks
  
  useEffect(() => {
      if (words.length >= 4) {
          const newQuestions = [];
          for (let i = 0; i < QUESTION_COUNT; i++) {
              const target = words[Math.floor(Math.random() * words.length)];
              const distractors = words.filter(w => w.id !== target.id).sort(() => 0.5 - Math.random()).slice(0, 3);
              
              // Only text-based and audio modes now. Removed IMAGE_TO_EN.
              const modes: ('EN_TO_VI' | 'VI_TO_EN' | 'LISTEN')[] = ['EN_TO_VI', 'VI_TO_EN', 'LISTEN'];
              
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
      if (isProcessing || !questions[currentQIdx]) return;
      
      if (wordId === questions[currentQIdx].target.id) {
          setIsProcessing(true); // Lock immediately
          playSFX('correct');
          
          if (currentQIdx < QUESTION_COUNT - 1) {
              // Add delay before moving to next question to allow sound to play and prevent accidental double taps
              setTimeout(() => {
                  const nextIdx = currentQIdx + 1;
                  setCurrentQIdx(nextIdx);
                  // Auto play next audio
                  if (questions[nextIdx].mode === 'LISTEN') {
                      setTimeout(() => {
                          const u = new SpeechSynthesisUtterance(questions[nextIdx].target.english);
                          u.lang = 'en-US';
                          window.speechSynthesis.speak(u);
                      }, 200);
                  }
                  setIsProcessing(false); // Unlock
              }, 800);
          } else {
              // All correct - Final Question
              setTimeout(() => {
                  playSFX('success');
                  onSuccess();
                  // Do NOT set isProcessing to false here to prevent re-clicking while modal is closing
              }, 500);
          }
      } else {
          playSFX('wrong');
          onShowAlert("Sai rồi! Bé thử lại câu này nhé!", "DANGER");
          // No need to lock for wrong answer, or unlock immediately if you want
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
            
            <div className="text-center mb-6">
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
                <div className="flex justify-center gap-2 mt-3">
                    {[...Array(QUESTION_COUNT)].map((_, i) => (
                        <div key={i} className={`w-3 h-3 rounded-full transition-all ${i < currentQIdx ? 'bg-green-500' : i === currentQIdx ? 'bg-blue-500 scale-125' : 'bg-slate-200'}`} />
                    ))}
                </div>
            </div>

            {/* Question Display */}
            <div className="mb-6 text-center min-h-[5rem] flex flex-col justify-center">
                {currentQ.mode === 'LISTEN' ? (
                    <button onClick={playAudio} className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center mx-auto shadow-lg animate-pulse hover:bg-blue-600 transition-colors border-4 border-blue-300">
                        <Volume2 size={40} className="text-white"/>
                    </button>
                ) : (
                    <h2 className="text-3xl font-black text-indigo-600 drop-shadow-sm">
                        {currentQ.mode === 'EN_TO_VI' ? currentQ.target.english : currentQ.target.vietnamese}
                    </h2>
                )}
                <p className="text-slate-400 font-bold text-[10px] mt-2 uppercase tracking-widest">
                    {currentQ.mode === 'LISTEN' ? 'Nghe và chọn từ đúng' : 
                     currentQ.mode === 'EN_TO_VI' ? 'Chọn nghĩa tiếng Việt' : 'Chọn từ tiếng Anh'}
                </p>
            </div>

            {/* Text Options Grid */}
            <div className="grid grid-cols-1 gap-3">
                {currentQ.options.map(opt => {
                    const content = currentQ.mode === 'EN_TO_VI' ? opt.vietnamese : opt.english; 
                    const isEnglishText = currentQ.mode !== 'EN_TO_VI'; 

                    return (
                        <button 
                            key={opt.id}
                            onClick={() => handleAnswer(opt.id)}
                            disabled={isProcessing}
                            className={`p-4 rounded-xl border-b-4 transition-all active:scale-95 active:border-b-0 active:translate-y-1 flex items-center justify-center ${isEnglishText ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-orange-50 border-orange-200 text-orange-800'} ${isProcessing ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            <span className={`font-black ${isEnglishText ? 'text-xl' : 'text-lg'}`}>
                                {content}
                            </span>
                        </button>
                    )
                })}
            </div>
        </div>
    </div>
  );
};
