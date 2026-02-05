
import React from 'react';
import { UserState, Achievement } from '../types';
import { Trophy, Medal, Lock, Sprout, Coins, BookOpen, Star, Zap, ShoppingBag, Truck } from 'lucide-react';

interface AchievementsProps {
  userState: UserState;
  onClose: () => void;
}

// --- SAFE DATA HELPERS ---
// Ngăn chặn crash do dữ liệu cũ bị null, undefined hoặc sai kiểu
const getSafeTotalHarvest = (state: UserState): number => {
    if (!state.harvestedCrops || typeof state.harvestedCrops !== 'object') return 0;
    return Object.values(state.harvestedCrops).reduce((acc: number, val: any) => {
        const num = Number(val);
        return acc + (isNaN(num) ? 0 : num);
    }, 0);
};

const getSafeItemCount = (state: UserState, itemId: string): number => {
    if (!state.harvestedCrops || typeof state.harvestedCrops !== 'object') return 0;
    const val = state.harvestedCrops[itemId];
    const num = Number(val);
    return isNaN(num) ? 0 : num;
};

export const ACHIEVEMENTS_LIST: Achievement[] = [
  // --- LEARNING ---
  {
    id: 'first_step',
    title: 'Bước Chân Đầu Tiên',
    description: 'Hoàn thành bài học đầu tiên.',
    icon: '🚀',
    condition: (state) => (state.completedLevels?.length || 0) >= 1,
    isUnlocked: false
  },
  {
    id: 'scholar_10',
    title: 'Mọt Sách Chính Hiệu',
    description: 'Hoàn thành 10 bài học.',
    icon: '📚',
    condition: (state) => (state.completedLevels?.length || 0) >= 10,
    isUnlocked: false
  },
  {
    id: 'scholar_50',
    title: 'Giáo Sư Biết Tuốt',
    description: 'Hoàn thành 50 bài học.',
    icon: '🎓',
    condition: (state) => (state.completedLevels?.length || 0) >= 50,
    isUnlocked: false
  },
  {
    id: 'streak_3',
    title: 'Chăm Chỉ Như Ong',
    description: 'Học 3 ngày liên tiếp không nghỉ.',
    icon: '🐝',
    condition: (state) => (state.streak || 0) >= 3,
    isUnlocked: false
  },
  {
    id: 'streak_7',
    title: 'Chiến Thần Điểm Danh',
    description: 'Học 7 ngày liên tiếp. Quá đỉnh!',
    icon: '🔥',
    condition: (state) => (state.streak || 0) >= 7,
    isUnlocked: false
  },

  // --- WEALTH & SHOPPING ---
  {
    id: 'rich_kid_1k',
    title: 'Đại Gia Mới Nổi',
    description: 'Tích lũy 1,000 xu trong túi.',
    icon: '💰',
    condition: (state) => (state.coins || 0) >= 1000,
    isUnlocked: false
  },
  {
    id: 'rich_kid_10k',
    title: 'Tỷ Phú Thời Gian',
    description: 'Sở hữu khối tài sản 10,000 xu.',
    icon: '💎',
    condition: (state) => (state.coins || 0) >= 10000,
    isUnlocked: false
  },
  {
    id: 'shopaholic',
    title: 'Tín Đồ Mua Sắm',
    description: 'Sở hữu 5 món đồ trang trí.',
    icon: '🛍️',
    condition: (state) => (state.decorations?.length || 0) >= 5,
    isUnlocked: false
  },
  {
    id: 'fashionista',
    title: 'Siêu Mẫu Nhí',
    description: 'Sở hữu bộ trang phục Rồng Thần.',
    icon: '🐲',
    condition: (state) => state.currentAvatarId === 'dragon',
    isUnlocked: false
  },

  // --- FARMING ---
  {
    id: 'farmer_newbie',
    title: 'Nông Dân Tập Sự',
    description: 'Thu hoạch 20 nông sản đầu tay.',
    icon: '🥕',
    condition: (state) => getSafeTotalHarvest(state) >= 20,
    isUnlocked: false
  },
  {
    id: 'farmer_pro',
    title: 'Lão Nông Chi Điền',
    description: 'Tay chai sạn vì thu hoạch 500 nông sản.',
    icon: '🚜',
    condition: (state) => getSafeTotalHarvest(state) >= 500,
    isUnlocked: false
  },
  {
    id: 'landlord',
    title: 'Chúa Tể Đất Đai',
    description: 'Mở khóa toàn bộ 6 ô đất trồng trọt.',
    icon: '🏝️',
    condition: (state) => (state.farmPlots || []).every(p => p.isUnlocked),
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
    condition: (state) => getSafeItemCount(state, 'egg') >= 50,
    isUnlocked: false
  },
  {
    id: 'milk_man',
    title: 'Thợ Vắt Sữa',
    description: 'Thu hoạch 50 bình Sữa Bò.',
    icon: '🥛',
    condition: (state) => getSafeItemCount(state, 'milk') >= 50,
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
    condition: (state) => (state.livestockSlots?.filter(s => s.isUnlocked).length || 0) >= 5,
    isUnlocked: false
  },

  // --- SPECIAL & FUNNY ---
  {
    id: 'order_master',
    title: 'Thánh Giao Hàng',
    description: 'Giao hàng chăm chỉ (Kiếm > 2000 xu).',
    icon: '🚚',
    condition: (state) => (state.coins || 0) >= 2000 && getSafeTotalHarvest(state) > 10,
    isUnlocked: false
  },
  {
    id: 'pet_bestie',
    title: 'Sen Của Boss',
    description: 'Nông trại đạt cấp 10.',
    icon: '🐶',
    condition: (state) => (state.farmLevel || 1) >= 10,
    isUnlocked: false
  },
  {
    id: 'sweet_tooth',
    title: 'Sâu Răng',
    description: 'Sản xuất 20 Kẹo hoặc Bánh Kem.',
    icon: '🍭',
    condition: (state) => (getSafeItemCount(state, 'candy') + getSafeItemCount(state, 'cake')) >= 20,
    isUnlocked: false
  },
  {
    id: 'perfume_maker',
    title: 'Chuyên Gia Mùi Hương',
    description: 'Chế tạo thành công Nước Hoa.',
    icon: '🌸',
    condition: (state) => getSafeItemCount(state, 'rose_perfume') > 0,
    isUnlocked: false
  }
];

export const Achievements: React.FC<AchievementsProps> = ({ userState, onClose }) => {
  // Helper to get progress safely
  const getProgress = (ach: Achievement) => {
      // Safe defaults
      const completedLevels = userState.completedLevels?.length || 0;
      const streak = userState.streak || 0;
      const coins = userState.coins || 0;
      const decorCount = userState.decorations?.length || 0;
      const water = userState.waterDrops || 0;
      const fertilizer = userState.fertilizers || 0;
      const plots = userState.farmPlots || [];
      const livestock = userState.livestockSlots || [];
      const farmLevel = userState.farmLevel || 1;

      if (ach.id === 'first_step') return Math.min(100, (completedLevels / 1) * 100);
      if (ach.id === 'scholar_10') return Math.min(100, (completedLevels / 10) * 100);
      if (ach.id === 'scholar_50') return Math.min(100, (completedLevels / 50) * 100);
      
      if (ach.id === 'streak_3') return Math.min(100, (streak / 3) * 100);
      if (ach.id === 'streak_7') return Math.min(100, (streak / 7) * 100);
      
      if (ach.id === 'rich_kid_1k') return Math.min(100, (coins / 1000) * 100);
      if (ach.id === 'rich_kid_10k') return Math.min(100, (coins / 10000) * 100);
      
      if (ach.id === 'shopaholic') return Math.min(100, (decorCount / 5) * 100);
      if (ach.id === 'fashionista') return userState.currentAvatarId === 'dragon' ? 100 : 0;

      if (ach.id === 'farmer_newbie') return Math.min(100, (getSafeTotalHarvest(userState) / 20) * 100);
      if (ach.id === 'farmer_pro') return Math.min(100, (getSafeTotalHarvest(userState) / 500) * 100);
      
      if (ach.id === 'landlord') return Math.min(100, (plots.filter(p => p.isUnlocked).length / 6) * 100);
      if (ach.id === 'water_god') return Math.min(100, (water / 50) * 100);
      if (ach.id === 'fertilizer_king') return Math.min(100, (fertilizer / 20) * 100);

      if (ach.id === 'chicken_whisperer') return Math.min(100, (getSafeItemCount(userState, 'egg') / 50) * 100);
      if (ach.id === 'milk_man') return Math.min(100, (getSafeItemCount(userState, 'milk') / 50) * 100);
      if (ach.id === 'lion_tamer') return livestock.some(s => s.animalId === 'lion') ? 100 : 0;
      if (ach.id === 'zoo_keeper') return Math.min(100, (livestock.filter(s => s.isUnlocked).length / 5) * 100);

      if (ach.id === 'order_master') return Math.min(100, (coins / 2000) * 100); 
      if (ach.id === 'pet_bestie') return Math.min(100, (farmLevel / 10) * 100);
      if (ach.id === 'sweet_tooth') {
          const total = getSafeItemCount(userState, 'candy') + getSafeItemCount(userState, 'cake');
          return Math.min(100, (total / 20) * 100);
      }
      if (ach.id === 'perfume_maker') return getSafeItemCount(userState, 'rose_perfume') > 0 ? 100 : 0;

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
            const progress = isUnlocked ? 100 : Math.max(0, getProgress(ach));
            
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
