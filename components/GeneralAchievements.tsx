
import React from 'react';
import { UserState, Achievement } from '../types';
import { Trophy, Medal, Lock, Star, X } from 'lucide-react';

interface GeneralAchievementsProps {
  userState: UserState;
  onClose: () => void;
}

// App-wide achievements (Learning streak, levels, etc.)
export const APP_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_step',
    title: 'Khởi đầu mới',
    description: 'Hoàn thành bài học đầu tiên.',
    icon: '🚀',
    condition: (state) => state.completedLevels.length >= 1,
    isUnlocked: false
  },
  {
    id: 'scholar_10',
    title: 'Mọt sách chăm chỉ',
    description: 'Hoàn thành 10 bài học.',
    icon: '📚',
    condition: (state) => state.completedLevels.length >= 10,
    isUnlocked: false
  },
  {
    id: 'scholar_50',
    title: 'Bác học nhí',
    description: 'Hoàn thành 50 bài học.',
    icon: '🎓',
    condition: (state) => state.completedLevels.length >= 50,
    isUnlocked: false
  },
  {
    id: 'streak_3',
    title: 'Chăm chỉ như Ong',
    description: 'Học 3 ngày liên tiếp.',
    icon: '🐝',
    condition: (state) => state.streak >= 3,
    isUnlocked: false
  },
  {
    id: 'streak_7',
    title: 'Chiến thần điểm danh',
    description: 'Học 7 ngày liên tiếp. Quá đỉnh!',
    icon: '🔥',
    condition: (state) => state.streak >= 7,
    isUnlocked: false
  },
  {
    id: 'rich_kid_1k',
    title: 'Ống heo đầy',
    description: 'Tích lũy 1,000 xu.',
    icon: '💰',
    condition: (state) => state.coins >= 1000,
    isUnlocked: false
  }
];

export const GeneralAchievements: React.FC<GeneralAchievementsProps> = ({ userState, onClose }) => {
  return (
    <div className="flex flex-col h-full bg-slate-50 animate-fadeIn relative z-50">
      <div className="bg-white p-4 shadow-sm border-b border-slate-200 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-2">
           <Trophy className="text-blue-500" size={28} />
           <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Thành Tích Học Tập</h2>
        </div>
        <button onClick={onClose} className="text-slate-400 font-bold hover:bg-slate-100 px-3 py-1 rounded-lg">Đóng</button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 no-scrollbar">
        <div className="grid grid-cols-1 gap-4">
          {APP_ACHIEVEMENTS.map((ach) => {
            const isUnlocked = userState.unlockedAchievements?.includes(ach.id) || ach.condition(userState);
            
            return (
              <div 
                key={ach.id} 
                className={`flex items-center p-4 rounded-3xl border-4 transition-all relative overflow-hidden ${
                  isUnlocked 
                    ? 'bg-white border-blue-300 shadow-lg' 
                    : 'bg-slate-100 border-slate-200 opacity-80'
                }`}
              >
                <div className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl shadow-inner mr-4 border-2 flex-shrink-0 ${isUnlocked ? 'bg-blue-50 border-blue-200' : 'bg-slate-200 border-slate-300 grayscale'}`}>
                  {ach.icon}
                </div>
                
                <div className="flex-1 z-10 min-w-0">
                  <div className="flex items-center gap-2">
                      <h3 className={`font-black text-sm sm:text-lg uppercase tracking-tight truncate ${isUnlocked ? 'text-slate-800' : 'text-slate-500'}`}>
                        {ach.title}
                      </h3>
                      {isUnlocked && <Star size={16} className="text-yellow-500 fill-yellow-500 animate-pulse flex-shrink-0" />}
                  </div>
                  <p className="text-[10px] sm:text-xs font-bold text-slate-400 leading-tight">{ach.description}</p>
                </div>

                {!isUnlocked && <Lock className="text-slate-300 ml-2" size={20} />}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
