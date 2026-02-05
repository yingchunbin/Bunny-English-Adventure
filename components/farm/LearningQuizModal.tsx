
import React, { useState, useEffect } from 'react';
import { Word } from '../../types';
import { X, Zap, Volume2, Truck, Droplets, Bug, Star } from 'lucide-react';
import { playSFX } from '../../utils/sound';

interface LearningQuizModalProps {
  words: Word[];
  type: 'WATER' | 'PEST' | 'SPEED_UP' | 'NEW_ORDER'; 
  questionCount?: number; 
  onSuccess: () => void;
  onClose: () => void;
  onShowAlert: (msg: string, type: 'INFO' | 'DANGER') => void;
}

interface Question {
    id: number;
    target: Word;
    options: Word[];
    mode: 'EN_TO_VI' | 'VI_TO_EN' | 'LISTEN';
}

export const LearningQuizModal: React.FC<LearningQuizModalProps> = ({ words, type, questionCount = 3, onSuccess, onClose, onShowAlert }) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQIdx, setCurrentQIdx] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false); 
  
  // Initialize Questions Once on Mount
  useEffect(() => {
      // 1. Deduplicate words by ID to prevent logic errors (important when merging multiple levels)
      const uniqueWordsMap = new Map();
      words.forEach(w => uniqueWordsMap.set(w.id, w));
      const uniqueWords = Array.from(uniqueWordsMap.values());

      if (uniqueWords.length >= 4) {
          const newQuestions: Question[] = [];
          for (let i = 0; i < questionCount; i++) {
              // Pick random target
              const targetIndex = Math.floor(Math.random() * uniqueWords.length);
              const target = uniqueWords[targetIndex];
              
              // Select Distractors: Filter out target, shuffle, take exactly 3
              const distractors = uniqueWords
                  .filter(w => w.id !== target.id)
                  .sort(() => 0.5 - Math.random())
                  .slice(0, 3);
              
              // Random mode
              const modes: ('EN_TO_VI' | 'VI_TO_EN' | 'LISTEN')[] = ['EN_TO_VI', 'VI_TO_EN', 'LISTEN'];
              const mode = modes[Math.floor(Math.random() * modes.length)];
              
              // Combine and Shuffle Options (Target + 3 Distractors = 4 Options)
              const options = [target, ...distractors].sort(() => 0.5 - Math.random());

              newQuestions.push({
                  id: i,
                  target,
                  options,
                  mode
              });
          }
          setQuestions(newQuestions);
          setCurrentQIdx(0);
          
          // Auto play first audio if listen mode
          if (newQuestions[0] && newQuestions[0].mode === 'LISTEN') {
              setTimeout(() => {
                  const u = new SpeechSynthesisUtterance(newQuestions[0].target.english);
                  u.lang = 'en-US';
                  window.speechSynthesis.speak(u);
              }, 500);
          }
      }
  }, []); // Empty dependency array ensures this only runs ONCE when the modal opens

  const playAudio = () => {
      if (!questions[currentQIdx]) return;
      const u = new SpeechSynthesisUtterance(questions[currentQIdx].target.english);
      u.lang = 'en-US';
      window.speechSynthesis.speak(u);
  }

  const handleAnswer = (wordId: string) => {
      if (isProcessing || !questions[currentQIdx]) return;
      
      const currentQ = questions[currentQIdx];

      if (wordId === currentQ.target.id) {
          setIsProcessing(true); // Lock immediately
          playSFX('correct');
          
          if (currentQIdx < questionCount - 1) {
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
              }, 500);
          }
      } else {
          playSFX('wrong');
          onShowAlert("Sai rồi! Bé thử lại câu này nhé!", "DANGER");
      }
  };

  if (questions.length === 0) return null;

  const currentQ = questions[currentQIdx];

  // Dynamic Styles based on "Type"
  let icon = <Zap size={32} />;
  let title = "Thử Thách";
  let desc = `Trả lời đúng ${questionCount} câu!`;
  let bg = "bg-yellow-100 text-yellow-600";

  if (type === 'WATER') {
      icon = <Droplets size={32} />;
      title = questionCount > 3 ? "Kiếm Sao (Dễ)" : "Giếng Thần Tri Thức";
      desc = `Trả lời đúng ${questionCount} câu!`;
      bg = "bg-blue-100 text-blue-500";
  } else if (type === 'PEST') {
      icon = questionCount > 10 ? <Star size={32}/> : <Bug size={32} />;
      title = questionCount > 10 ? "Kiếm Sao (Vừa)" : "Dũng Sĩ Diệt Sâu";
      desc = `Trả lời đúng ${questionCount} câu!`;
      bg = "bg-green-100 text-green-500";
  } else if (type === 'NEW_ORDER') {
      icon = questionCount > 10 ? <Star size={32}/> : <Truck size={32} />;
      title = questionCount > 10 ? "Kiếm Sao (Khó)" : "Tìm Kiếm Đơn Hàng";
      desc = `Hoàn thành ${questionCount} bài tập!`;
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
                <div className="flex justify-center gap-1 mt-3 flex-wrap px-4">
                    {[...Array(questionCount)].map((_, i) => (
                        <div key={i} className={`w-2 h-2 rounded-full transition-all ${i < currentQIdx ? 'bg-green-500' : i === currentQIdx ? 'bg-blue-500 scale-125' : 'bg-slate-200'}`} />
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
