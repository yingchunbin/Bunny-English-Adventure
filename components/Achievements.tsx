
import React from 'react';
import { UserState, Achievement } from '../types';
import { Trophy, Medal, Lock, Sprout, Coins, BookOpen, Star, Zap, ShoppingBag, Truck, X } from 'lucide-react';

interface AchievementsProps {
  userState: UserState;
  onClose: () => void;
  category: 'LEARNING' | 'FARM';
}

const LEARNING_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_step',
    title: 'Bước Chân Đầu Tiên',
    description: 'Hoàn thành bài học đầu tiên.',
    icon: '🚀',
    condition: (state) => state.completedLevels.length >= 1,
    isUnlocked: false
  },
  {
    id: 'scholar_10',
    title: 'Mọt Sách Chính Hiệu',
    description: 'Hoàn thành 10 bài học.',
    icon: '📚',
    condition: (state) => state.completedLevels.length >= 10,
    isUnlocked: false
  },
  {
    id: 'scholar_50',
    title: 'Giáo Sư Biết Tuốt',
    description: 'Hoàn thành 50 bài học.',
    icon: '🎓',
    condition: (state) => state.completedLevels.length >= 50,
    isUnlocked: false
  },
  {
    id: 'streak_3',
    title: 'Chăm Chỉ Như Ong',
    description: 'Học 3 ngày liên tiếp không nghỉ.',
    icon: '🐝',
    condition: (state) => state.streak >= 3,
    isUnlocked: false
  },
  {
    id: 'streak_7',
    title: 'Chiến Thần Điểm Danh',
    description: 'Học 7 ngày liên tiếp. Quá đỉnh!',
    icon: '🔥',
    condition: (state) => state.streak >= 7,
    isUnlocked: false
  }
];

const FARM_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'farmer_newbie',
    title: 'Nông Dân Tập Sự',
    description: 'Thu hoạch 20 nông sản.',
    icon: '🥕',
    condition: (state) => Object.values(state.harvestedCrops || {}).reduce((a:any,b:any)=>a+b, 0) >= 20,
    isUnlocked: false
  },
  {
    id: 'rich_kid_1k',
    title: 'Đại Gia Mới Nổi',
    description: 'Tích lũy 1,000 xu.',
    icon: '💰',
    condition: (state) => state.coins >= 1000,
    isUnlocked: false
  },
  {
    id: 'landlord',
    title: 'Chúa Tể Đất Đai',
    description: 'Mở khóa toàn bộ 6 ô đất.',
    icon: '🏝️',
    condition: (state) => state.farmPlots.every(p => p.isUnlocked),
    isUnlocked: false
  },
  {
    id: 'zoo_keeper',
    title: 'Giám Đốc Sở Thú',
    description: 'Mở rộng 4 chuồng trại.',
    icon: '🎫',
    condition: (state) => (state.livestockSlots?.filter(s => s.isUnlocked).length || 0) >= 4,
    isUnlocked: false
  },
  {
    id: 'factory_owner',
    title: 'Ông Trùm Nhà Máy',
    description: 'Sở hữu 4 máy chế biến.',
    icon: '🏭',
    condition: (state) => (state.machineSlots?.filter(s => s.isUnlocked).length || 0) >= 4,
    isUnlocked: false
  }
];

export const Achievements: React.FC<AchievementsProps> = ({ userState, onClose, category }) => {
  const list = category === 'LEARNING' ? LEARNING_ACHIEVEMENTS : FARM_ACHIEVEMENTS;
  const bgColor = category === 'LEARNING' ? 'bg-sky-50' : 'bg-green-50';
  const headerColor = category === 'LEARNING' ? 'text-blue-600' : 'text-green-600';

  // Helper to get progress
  const getProgress = (ach: Achievement) => {
      // Simple generic progress logic for visual demo
      if (userState.unlockedAchievements?.includes(ach.id)) return 100;
      return 0; // In a real app, calculate specific % based on condition
  };

  return (
    <div className={`flex flex-col h-full ${bgColor} animate-fadeIn rounded-t-3xl`}>
      <div className="bg-white p-4 shadow-sm border-b border-slate-100 flex items-center justify-between sticky top-0 z-10 rounded-t-3xl">
        <div className="flex items-center gap-2">
           <Trophy className="text-yellow-500" size={28} />
           <h2 className={`text-lg font-black uppercase tracking-tight ${headerColor}`}>
             {category === 'LEARNING' ? 'Bảng Vàng Học Tập' : 'Thành Tựu Nông Trại'}
           </h2>
        </div>
        <button onClick={onClose} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 text-slate-500"><X size={20}/></button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 no-scrollbar">
        <div className="grid grid-cols-1 gap-4">
          {list.map((ach) => {
            const isUnlocked = userState.unlockedAchievements?.includes(ach.id) || ach.condition(userState);
            
            return (
              <div 
                key={ach.id} 
                className={`flex items-center p-3 rounded-2xl border-b-4 transition-all relative overflow-hidden ${
                  isUnlocked 
                    ? 'bg-white border-yellow-400 shadow-sm' 
                    : 'bg-slate-100 border-slate-200 grayscale opacity-80'
                }`}
              >
                <div className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl shadow-inner mr-4 border-2 flex-shrink-0 ${isUnlocked ? 'bg-yellow-50 border-yellow-200' : 'bg-white border-slate-200'}`}>
                  {ach.icon}
                </div>
                
                <div className="flex-1 z-10 min-w-0">
                  <div className="flex items-center gap-2">
                      <h3 className={`font-black text-sm uppercase tracking-tight truncate ${isUnlocked ? 'text-slate-800' : 'text-slate-500'}`}>
                        {ach.title}
                      </h3>
                      {isUnlocked && <Star size={14} className="text-yellow-500 fill-yellow-500 animate-pulse flex-shrink-0" />}
                  </div>
                  <p className="text-[10px] font-bold text-slate-400 leading-tight mt-0.5">{ach.description}</p>
                </div>

                {!isUnlocked && <Lock className="text-slate-300 ml-2" size={18} />}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
