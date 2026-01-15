
import React from 'react';
import { UserState, Achievement } from '../types';
import { Trophy, Medal, Lock, Sprout, Coins, BookOpen, Star } from 'lucide-react';

interface AchievementsProps {
  userState: UserState;
  onClose: () => void;
}

export const ACHIEVEMENTS_LIST: Achievement[] = [
  {
    id: 'first_step',
    title: 'Khởi Động',
    description: 'Hoàn thành bài học đầu tiên.',
    icon: '🚀',
    condition: (state) => state.completedLevels.length >= 1,
    isUnlocked: false
  },
  {
    id: 'streak_3',
    title: 'Chăm Chỉ',
    description: 'Học 3 ngày liên tiếp.',
    icon: '🔥',
    condition: (state) => state.streak >= 3,
    isUnlocked: false
  },
  {
    id: 'rich_kid',
    title: 'Nhà Giàu',
    description: 'Tích lũy 1000 xu.',
    icon: '💰',
    condition: (state) => state.coins >= 1000,
    isUnlocked: false
  },
  {
    id: 'millionaire',
    title: 'Triệu Phú',
    description: 'Tích lũy 10,000 xu.',
    icon: '💎',
    condition: (state) => state.coins >= 10000,
    isUnlocked: false
  },
  {
    id: 'scholar',
    title: 'Học Bá',
    description: 'Hoàn thành 10 bài học.',
    icon: '🎓',
    condition: (state) => state.completedLevels.length >= 10,
    isUnlocked: false
  },
  {
    id: 'farmer_1',
    title: 'Nông Dân Tập Sự',
    description: 'Thu hoạch 20 nông sản.',
    icon: '🌾',
    condition: (state) => Object.values(state.harvestedCrops || {}).reduce((a:any,b:any)=>a+b, 0) >= 20,
    isUnlocked: false
  },
  {
    id: 'master_farmer',
    title: 'Lão Nông Chi Điền',
    description: 'Thu hoạch 200 nông sản.',
    icon: '🚜',
    condition: (state) => Object.values(state.harvestedCrops || {}).reduce((a:any,b:any)=>a+b, 0) >= 200,
    isUnlocked: false
  },
  {
    id: 'pet_lover',
    title: 'Bạn Của Thú Cưng',
    description: 'Nuôi Thú Cưng đạt cấp 5.',
    icon: '🐶',
    condition: (state) => (state.petLevel || 1) >= 5,
    isUnlocked: false
  },
  {
    id: 'master_chef',
    title: 'Đầu Bếp',
    description: 'Thu hoạch 10 Trứng hoặc Sữa.',
    icon: '🍳',
    condition: (state) => ((state.harvestedCrops?.['egg']||0) + (state.harvestedCrops?.['milk']||0)) >= 10,
    isUnlocked: false
  },
  {
    id: 'beekeeper',
    title: 'Người Nuôi Ong',
    description: 'Thu hoạch 5 Mật Ong.',
    icon: '🐝',
    condition: (state) => (state.harvestedCrops?.['honey']||0) >= 5,
    isUnlocked: false
  },
  {
    id: 'lion_tamer',
    title: 'Chúa Sơn Lâm',
    description: 'Sở hữu một chú Sư Tử.',
    icon: '🦁',
    condition: (state) => state.livestockSlots?.some(s => s.animalId === 'lion') || false,
    isUnlocked: false
  },
  {
    id: 'florist',
    title: 'Người Yêu Hoa',
    description: 'Thu hoạch 10 bông hoa (Hồng/Tulip/Hướng dương).',
    icon: '💐',
    condition: (state) => {
        const rose = state.harvestedCrops?.['rose'] || 0;
        const tulip = state.harvestedCrops?.['tulip'] || 0;
        const sun = state.harvestedCrops?.['sunflower'] || 0;
        return (rose + tulip + sun) >= 10;
    },
    isUnlocked: false
  },
  {
    id: 'landlord',
    title: 'Đại Chủ Đất',
    description: 'Mở khóa 6 ô đất.',
    icon: '🏝️',
    condition: (state) => state.farmPlots.filter(p => p.isUnlocked).length >= 6,
    isUnlocked: false
  },
  {
    id: 'water_master',
    title: 'Thần Nước',
    description: 'Tích lũy 50 giọt nước.',
    icon: '💧',
    condition: (state) => (state.waterDrops || 0) >= 50,
    isUnlocked: false
  }
];

export const Achievements: React.FC<AchievementsProps> = ({ userState, onClose }) => {
  // Helper to get progress
  const getProgress = (ach: Achievement) => {
      if (ach.id === 'first_step') return Math.min(100, (userState.completedLevels.length / 1) * 100);
      if (ach.id === 'streak_3') return Math.min(100, (userState.streak / 3) * 100);
      if (ach.id === 'rich_kid') return Math.min(100, (userState.coins / 1000) * 100);
      if (ach.id === 'millionaire') return Math.min(100, (userState.coins / 10000) * 100);
      if (ach.id === 'scholar') return Math.min(100, (userState.completedLevels.length / 10) * 100);
      if (ach.id === 'farmer_1') {
          const total = Object.values(userState.harvestedCrops || {}).reduce((a:any,b:any)=>a+b, 0) as number;
          return Math.min(100, (total / 20) * 100);
      }
      if (ach.id === 'master_farmer') {
          const total = Object.values(userState.harvestedCrops || {}).reduce((a:any,b:any)=>a+b, 0) as number;
          return Math.min(100, (total / 200) * 100);
      }
      if (ach.id === 'pet_lover') return Math.min(100, ((userState.petLevel || 1) / 5) * 100);
      if (ach.id === 'master_chef') {
          const total = ((userState.harvestedCrops?.['egg']||0) + (userState.harvestedCrops?.['milk']||0));
          return Math.min(100, (total / 10) * 100);
      }
      if (ach.id === 'beekeeper') return Math.min(100, ((userState.harvestedCrops?.['honey']||0) / 5) * 100);
      if (ach.id === 'florist') {
          const rose = userState.harvestedCrops?.['rose'] || 0;
          const tulip = userState.harvestedCrops?.['tulip'] || 0;
          const sun = userState.harvestedCrops?.['sunflower'] || 0;
          return Math.min(100, ((rose + tulip + sun) / 10) * 100);
      }
      if (ach.id === 'lion_tamer') return userState.livestockSlots?.some(s => s.animalId === 'lion') ? 100 : 0;
      if (ach.id === 'landlord') return Math.min(100, (userState.farmPlots.filter(p => p.isUnlocked).length / 6) * 100);
      if (ach.id === 'water_master') return Math.min(100, (userState.waterDrops / 50) * 100);
      return 0;
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 animate-fadeIn">
      <div className="bg-white p-4 shadow-sm border-b border-slate-200 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-2">
           <Trophy className="text-yellow-500" size={28} />
           <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Bảng Thành Tích</h2>
        </div>
        <button onClick={onClose} className="text-slate-400 font-bold hover:bg-slate-100 px-3 py-1 rounded-lg">Đóng</button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-1 gap-4">
          {ACHIEVEMENTS_LIST.map((ach) => {
            const isUnlocked = userState.unlockedAchievements?.includes(ach.id) || ach.condition(userState);
            const progress = isUnlocked ? 100 : getProgress(ach);
            
            return (
              <div 
                key={ach.id} 
                className={`flex items-center p-4 rounded-3xl border-4 transition-all relative overflow-hidden ${
                  isUnlocked 
                    ? 'bg-white border-yellow-300 shadow-lg' 
                    : 'bg-white border-slate-200 opacity-90'
                }`}
              >
                {/* Progress Bar Background */}
                <div className="absolute bottom-0 left-0 h-1.5 bg-slate-100 w-full">
                    <div className="h-full bg-green-500 transition-all duration-1000" style={{ width: `${progress}%` }} />
                </div>

                <div className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl shadow-inner mr-4 border-2 ${isUnlocked ? 'bg-yellow-50 border-yellow-200' : 'bg-slate-50 border-slate-200 grayscale'}`}>
                  {ach.icon}
                </div>
                
                <div className="flex-1 z-10">
                  <div className="flex items-center gap-2">
                      <h3 className={`font-black text-lg uppercase tracking-tight ${isUnlocked ? 'text-slate-800' : 'text-slate-500'}`}>
                        {ach.title}
                      </h3>
                      {isUnlocked && <Star size={16} className="text-yellow-500 fill-yellow-500 animate-pulse" />}
                  </div>
                  <p className="text-xs font-bold text-slate-400">{ach.description}</p>
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
