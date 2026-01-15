
import React, { useEffect, useState, useRef } from 'react';
import { getLessonSummary } from '../services/geminiService';
import { Avatar } from './Avatar';
import { Sparkles, ArrowRight, Lightbulb, Zap, Heart, BookOpen, Clock } from 'lucide-react';
import { LessonLevel, UserState } from '../types';

interface LessonGuideProps {
  level: LessonLevel;
  userState: UserState;
  onUpdateState: (newState: UserState) => void;
  onComplete: () => void;
}

export const LessonGuide: React.FC<LessonGuideProps> = ({ level, userState, onUpdateState, onComplete }) => {
  const [summary, setSummary] = useState<string>(userState.lessonGuides?.[level.id] || '');
  const [isLoading, setIsLoading] = useState(!userState.lessonGuides?.[level.id]);
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchSummary = async () => {
      if (userState.lessonGuides?.[level.id]) {
        setSummary(userState.lessonGuides[level.id]);
        setIsLoading(false);
      } else {
        const words = level.words.map(w => w.english);
        const sentences = level.sentences.map(s => s.en);
        const result = await getLessonSummary(level.title, words, sentences);
        setSummary(result);
        
        onUpdateState({
            ...userState,
            lessonGuides: { ...userState.lessonGuides, [level.id]: result }
        });
        
        setIsLoading(false);
      }
    };
    fetchSummary();
  }, [level.id]);

  const handleScroll = () => {
    if (scrollContainerRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
        // Check if user has reached bottom (with 20px tolerance)
        if (scrollTop + clientHeight >= scrollHeight - 20) {
            setHasScrolledToBottom(true);
        }
    }
  };

  const renderTextWithBold = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="text-blue-700 font-extrabold">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  const renderContent = () => {
    if (!summary) return null;
    const lines = summary.split('\n');
    return lines.map((line, idx) => {
        const trimmed = line.trim();
        
        if (trimmed.startsWith('###')) {
            const title = trimmed.replace(/###/g, '').trim();
            let Icon = BookOpen;
            let color = "text-blue-600";
            let bg = "bg-blue-50";

            if (title.includes("Bí Kíp")) { Icon = Lightbulb; color = "text-yellow-600"; bg = "bg-yellow-50"; }
            if (title.includes("Sự Thật")) { Icon = Sparkles; color = "text-purple-600"; bg = "bg-purple-50"; }
            if (title.includes("Thử Thách")) { Icon = Zap; color = "text-red-600"; bg = "bg-red-50"; }
            if (title.includes("Lời Nhắn")) { Icon = Heart; color = "text-pink-600"; bg = "bg-pink-50"; }

            return (
                <div key={idx} className={`flex items-center gap-2 ${color} ${bg} p-3 rounded-xl mt-6 mb-3 font-black text-xl shadow-sm animate-fadeIn`}>
                    <Icon size={24} />
                    {title}
                </div>
            );
        }
        
        if (trimmed.length === 0) return <div key={idx} className="h-2"></div>;
        
        return (
          <p key={idx} className="text-gray-700 leading-relaxed mb-2 text-lg animate-fadeIn" style={{ animationDelay: `${idx * 0.05}s` }}>
            {renderTextWithBold(trimmed)}
          </p>
        );
    });
  };

  return (
    <div className="flex flex-col h-full p-6 animate-fadeIn bg-sky-50">
      <div className="flex flex-col items-center mb-4">
        <Avatar emoji="🐢" bgGradient="bg-gradient-to-br from-green-300 to-emerald-300" size="md" animate />
        <h2 className="text-2xl font-black text-green-700 mt-2 text-center uppercase tracking-tight">Bí Kíp Của Thầy Rùa</h2>
      </div>

      <div 
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 bg-white rounded-3xl shadow-xl p-6 border-4 border-green-100 overflow-y-auto relative scroll-smooth no-scrollbar"
      >
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-4">
            <Sparkles className="animate-spin text-yellow-400" size={48} />
            <p className="animate-pulse font-bold text-green-600">Thầy Rùa đang chuẩn bị bí kíp...</p>
          </div>
        ) : (
          <div className="pb-4">
            {renderContent()}
            <div className="h-8 flex items-center justify-center text-gray-300 italic text-sm">--- Hết bí kíp ---</div>
          </div>
        )}
      </div>

      <button 
        onClick={onComplete}
        disabled={isLoading || !hasScrolledToBottom}
        className={`mt-4 w-full py-4 rounded-2xl font-black text-xl shadow-lg flex items-center justify-center gap-2 transition-all duration-300
            ${!isLoading && hasScrolledToBottom 
                ? 'bg-green-500 text-white shadow-green-200 hover:bg-green-600 hover:scale-105' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed grayscale'
            }`}
      >
        {isLoading ? (
            <>
                <Sparkles size={24} className="animate-spin" /> Đang tải...
            </>
        ) : !hasScrolledToBottom ? (
            <>
                <ArrowRight size={24} className="rotate-90" /> Bé hãy kéo xuống đọc hết nhé
            </>
        ) : (
            <>
                Đã ghi nhớ! Nhận quà <ArrowRight size={24} className="animate-bounce-x" />
            </>
        )}
      </button>
    </div>
  );
};
