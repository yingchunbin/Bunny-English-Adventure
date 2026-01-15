
import React from 'react';
import { UserState, Achievement } from '../types';
import { Trophy, Medal, Lock, Sprout, Coins, BookOpen, Star, Zap, ShoppingBag, Truck } from 'lucide-react';

interface AchievementsProps {
  userState: UserState;
  onClose: () => void;
}

export const ACHIEVEMENTS_LIST: Achievement[] = [
  // --- LEARNING ---
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
  },

  // --- WEALTH & SHOPPING ---
  {
    id: 'rich_kid_1k',
    title: 'Đại Gia Mới Nổi',
    description: 'Tích lũy 1,000 xu trong túi.',
    icon: '💰',
    condition: (state) => state.coins >= 1000,
    isUnlocked: false
  },
  {
    id: 'rich_kid_10k',
    title: 'Tỷ Phú Thời Gian',
    description: 'Sở hữu khối tài sản 10,000 xu.',
    icon: '💎',
    condition: (state) => state.coins >= 10000,
    isUnlocked: false
  },
  {
    id: 'shopaholic',
    title: 'Tín Đồ Mua Sắm',
    description: 'Mua sắm hết mình (Tổng chi tiêu > 5000 xu - Chưa tính năng này nhưng để đó).', 
    // Logic check tạm thời dựa trên số đồ trang trí sở hữu
    icon: '🛍️',
    condition: (state) => (state.decorations?.length || 0) >= 5,
    isUnlocked: false
  },
  {
    id: 'fashionista',
    title: 'Siêu Mẫu Nhí',
    description: 'Sở hữu bộ trang phục Rồng Thần.',
    icon: '🐲',
    condition: (state) => state.currentAvatarId === 'dragon', // Requires checking ownership ideally, currently checks active
    isUnlocked: false
  },

  // --- FARMING ---
  {
    id: 'farmer_newbie',
    title: 'Nông Dân Tập Sự',
    description: 'Thu hoạch 20 nông sản đầu tay.',
    icon: '🥕',
    condition: (state) => Object.values(state.harvestedCrops || {}).reduce((a:any,b:any)=>a+b, 0) >= 20,
    isUnlocked: false
  },
  {
    id: 'farmer_pro',
    title: 'Lão Nông Chi Điền',
    description: 'Tay chai sạn vì thu hoạch 500 nông sản.',
    icon: '🚜',
    condition: (state) => Object.values(state.harvestedCrops || {}).reduce((a:any,b:any)=>a+b, 0) >= 500,
    isUnlocked: false
  },
  {
    id: 'landlord',
    title: 'Chúa Tể Đất Đai',
    description: 'Mở khóa toàn bộ 6 ô đất trồng trọt.',
    icon: '🏝️',
    condition: (state) => state.farmPlots.every(p => p.isUnlocked),
    isUnlocked: false
  },
  {
    id: 'water_god',
    title: 'Thủy Tinh',
    description: 'Tích trữ 50 giọt nước tưới cây.',
    icon: '💧',
    condition: (state) => (state.waterDrops || 0) >= 50,
    isUnlocked: false
  },
  {
    id: 'fertilizer_king',
    title: 'Vua Phân Bón',
    description: 'Tích trữ 20 bao phân bón.',
    icon: '⚡',
    condition: (state) => (state.fertilizers || 0) >= 20,
    isUnlocked: false
  },

  // --- LIVESTOCK ---
  {
    id: 'chicken_whisperer',
    title: 'Người Gọi Gà',
    description: 'Thu hoạch 50 quả Trứng.',
    icon: '🥚',
    condition: (state) => (state.harvestedCrops?.['egg'] || 0) >= 50,
    isUnlocked: false
  },
  {
    id: 'milk_man',
    title: 'Thợ Vắt Sữa',
    description: 'Thu hoạch 50 bình Sữa Bò.',
    icon: '🥛',
    condition: (state) => (state.harvestedCrops?.['milk'] || 0) >= 50,
    isUnlocked: false
  },
  {
    id: 'lion_tamer',
    title: 'Chúa Sơn Lâm',
    description: 'Dũng cảm nuôi một chú Sư Tử trong chuồng.',
    icon: '🦁',
    condition: (state) => state.livestockSlots?.some(s => s.animalId === 'lion') || false,
    isUnlocked: false
  },
  {
    id: 'zoo_keeper',
    title: 'Giám Đốc Sở Thú',
    description: 'Mở rộng tối đa 5 chuồng trại.',
    icon: '🎫',
    condition: (state) => state.livestockSlots?.every(s => s.isUnlocked) || false,
    isUnlocked: false
  },

  // --- SPECIAL & FUNNY ---
  {
    id: 'order_master',
    title: 'Thánh Giao Hàng',
    description: 'Hoàn thành 10 nhiệm vụ giao hàng.',
    icon: '🚚',
    condition: (state) => {
        // This is tricky without explicit counter, let's assume coin earnings > 2000 implies ~10 orders
        // Or check a mission progress if available. For now, check coin threshold as proxy for active play
        return state.coins >= 2000 && Object.keys(state.harvestedCrops || {}).length > 5; 
    },
    isUnlocked: false
  },
  {
    id: 'pet_bestie',
    title: 'Sen Của Boss',
    description: 'Nuôi thú cưng đạt cấp 10.',
    icon: '🐶',
    condition: (state) => (state.petLevel || 1) >= 10,
    isUnlocked: false
  },
  {
    id: 'sweet_tooth',
    title: 'Sâu Răng',
    description: 'Sản xuất 20 Kẹo hoặc Bánh Kem.',
    icon: '🍭',
    condition: (state) => ((state.harvestedCrops?.['candy']||0) + (state.harvestedCrops?.['cake']||0)) >= 20,
    isUnlocked: false
  },
  {
    id: 'perfume_maker',
    title: 'Chuyên Gia Mùi Hương',
    description: 'Chế tạo thành công Nước Hoa.',
    icon: '🌸',
    condition: (state) => (state.harvestedCrops?.['rose_perfume'] || 0) > 0,
    isUnlocked: false
  }
];

export const Achievements: React.FC<AchievementsProps> = ({ userState, onClose }) => {
  // Helper to get progress (Simplified for some complex ones)
  const getProgress = (ach: Achievement) => {
      if (ach.id === 'first_step') return Math.min(100, (userState.completedLevels.length / 1) * 100);
      if (ach.id === 'scholar_10') return Math.min(100, (userState.completedLevels.length / 10) * 100);
      if (ach.id === 'scholar_50') return Math.min(100, (userState.completedLevels.length / 50) * 100);
      
      if (ach.id === 'streak_3') return Math.min(100, (userState.streak / 3) * 100);
      if (ach.id === 'streak_7') return Math.min(100, (userState.streak / 7) * 100);
      
      if (ach.id === 'rich_kid_1k') return Math.min(100, (userState.coins / 1000) * 100);
      if (ach.id === 'rich_kid_10k') return Math.min(100, (userState.coins / 10000) * 100);
      
      if (ach.id === 'shopaholic') return Math.min(100, ((userState.decorations?.length || 0) / 5) * 100);
      if (ach.id === 'fashionista') return userState.currentAvatarId === 'dragon' ? 100 : 0;

      if (ach.id === 'farmer_newbie') {
          const total = Object.values(userState.harvestedCrops || {}).reduce((a:any,b:any)=>a+b, 0) as number;
          return Math.min(100, (total / 20) * 100);
      }
      if (ach.id === 'farmer_pro') {
          const total = Object.values(userState.harvestedCrops || {}).reduce((a:any,b:any)=>a+b, 0) as number;
          return Math.min(100, (total / 500) * 100);
      }
      if (ach.id === 'landlord') return Math.min(100, (userState.farmPlots.filter(p => p.isUnlocked).length / 6) * 100);
      if (ach.id === 'water_god') return Math.min(100, (userState.waterDrops / 50) * 100);
      if (ach.id === 'fertilizer_king') return Math.min(100, (userState.fertilizers / 20) * 100);

      if (ach.id === 'chicken_whisperer') return Math.min(100, ((userState.harvestedCrops?.['egg'] || 0) / 50) * 100);
      if (ach.id === 'milk_man') return Math.min(100, ((userState.harvestedCrops?.['milk'] || 0) / 50) * 100);
      if (ach.id === 'lion_tamer') return userState.livestockSlots?.some(s => s.animalId === 'lion') ? 100 : 0;
      if (ach.id === 'zoo_keeper') return Math.min(100, ((userState.livestockSlots?.filter(s => s.isUnlocked).length || 0) / 5) * 100);

      if (ach.id === 'order_master') return 0; // Hard to track exact progress without new state
      if (ach.id === 'pet_bestie') return Math.min(100, ((userState.petLevel || 1) / 10) * 100);
      if (ach.id === 'sweet_tooth') {
          const total = ((userState.harvestedCrops?.['candy']||0) + (userState.harvestedCrops?.['cake']||0));
          return Math.min(100, (total / 20) * 100);
      }
      if (ach.id === 'perfume_maker') return (userState.harvestedCrops?.['rose_perfume'] || 0) > 0 ? 100 : 0;

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

      <div className="flex-1 overflow-y-auto p-4 no-scrollbar">
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

                <div className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl shadow-inner mr-4 border-2 flex-shrink-0 ${isUnlocked ? 'bg-yellow-50 border-yellow-200' : 'bg-slate-50 border-slate-200 grayscale'}`}>
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
