
import React from 'react';
import { UserState, Achievement } from '../types';
import { Trophy, Medal, Lock, Star, Zap, Book, Crown, Clock, Flame, Brain, Target, Coins, Heart, Smile, Globe, ShoppingBag, Truck, Sprout, Tractor, Droplets } from 'lucide-react';

interface GeneralAchievementsProps {
  userState: UserState;
  onClose: () => void;
}

export const APP_ACHIEVEMENTS: Achievement[] = [
  // --- HỌC TẬP (LEARNING) ---
  {
    id: 'first_step',
    title: 'Khởi đầu mới',
    description: 'Hoàn thành bài học đầu tiên.',
    icon: '🚀',
    condition: (state) => state.completedLevels.length >= 1,
    isUnlocked: false
  },
  {
    id: 'scholar_5',
    title: 'Học sinh chăm chỉ',
    description: 'Hoàn thành 5 bài học.',
    icon: '📝',
    condition: (state) => state.completedLevels.length >= 5,
    isUnlocked: false
  },
  {
    id: 'scholar_10',
    title: 'Mọt sách',
    description: 'Hoàn thành 10 bài học.',
    icon: '📚',
    condition: (state) => state.completedLevels.length >= 10,
    isUnlocked: false
  },
  {
    id: 'scholar_20',
    title: 'Thông thái',
    description: 'Hoàn thành 20 bài học.',
    icon: '🧠',
    condition: (state) => state.completedLevels.length >= 20,
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
    id: 'scholar_100',
    title: 'Thần đồng',
    description: 'Hoàn thành 100 bài học. Quá tuyệt vời!',
    icon: '👑',
    condition: (state) => state.completedLevels.length >= 100,
    isUnlocked: false
  },
  {
    id: 'star_hunter_10',
    title: 'Thợ săn sao',
    description: 'Đạt 3 sao ở 10 bài học.',
    icon: '⭐',
    condition: (state) => Object.values(state.levelStars).filter(s => s === 3).length >= 10,
    isUnlocked: false
  },
  {
    id: 'star_hunter_50',
    title: 'Vua 3 sao',
    description: 'Đạt 3 sao ở 50 bài học.',
    icon: '🌟',
    condition: (state) => Object.values(state.levelStars).filter(s => s === 3).length >= 50,
    isUnlocked: false
  },
  {
    id: 'polyglot',
    title: 'Nhà thám hiểm tri thức',
    description: 'Mở khóa 2 cuốn sách khác nhau (Tính năng đang phát triển).',
    icon: '🌍',
    condition: (state) => false, // Placeholder for future logic
    isUnlocked: false
  },

  // --- THỬ THÁCH (TIME ATTACK) ---
  {
    id: 'speed_1',
    title: 'Người tập sự',
    description: 'Vượt qua Cửa ải 5 (Boss 1) trong Thử Thách Tốc Độ.',
    icon: '⚔️',
    condition: (state) => {
        const saved = localStorage.getItem('time_attack_progress');
        return saved ? parseInt(saved) > 5 : false;
    },
    isUnlocked: false
  },
  {
    id: 'speed_2',
    title: 'Chiến binh',
    description: 'Vượt qua Cửa ải 10 (Boss 2).',
    icon: '🛡️',
    condition: (state) => {
        const saved = localStorage.getItem('time_attack_progress');
        return saved ? parseInt(saved) > 10 : false;
    },
    isUnlocked: false
  },
  {
    id: 'speed_3',
    title: 'Dũng sĩ',
    description: 'Vượt qua Cửa ải 25 (Một nửa chặng đường!).',
    icon: '🗡️',
    condition: (state) => {
        const saved = localStorage.getItem('time_attack_progress');
        return saved ? parseInt(saved) > 25 : false;
    },
    isUnlocked: false
  },
  {
    id: 'speed_master',
    title: 'Huyền thoại tốc độ',
    description: 'Chinh phục toàn bộ 50 Cửa ải!',
    icon: '🏆',
    condition: (state) => {
        const saved = localStorage.getItem('time_attack_progress');
        return saved ? parseInt(saved) >= 50 : false;
    },
    isUnlocked: false
  },

  // --- CHUYÊN CẦN (STREAK) ---
  {
    id: 'streak_3',
    title: 'Khởi động',
    description: 'Học 3 ngày liên tiếp.',
    icon: '🔥',
    condition: (state) => state.streak >= 3,
    isUnlocked: false
  },
  {
    id: 'streak_7',
    title: 'Tuần lễ vàng',
    description: 'Học 7 ngày liên tiếp.',
    icon: '📅',
    condition: (state) => state.streak >= 7,
    isUnlocked: false
  },
  {
    id: 'streak_14',
    title: 'Kiên trì',
    description: 'Học 14 ngày liên tiếp.',
    icon: '💪',
    condition: (state) => state.streak >= 14,
    isUnlocked: false
  },
  {
    id: 'streak_30',
    title: 'Thói quen tốt',
    description: 'Học 30 ngày liên tiếp. Không thể tin nổi!',
    icon: '🏅',
    condition: (state) => state.streak >= 30,
    isUnlocked: false
  },

  // --- TÀI PHÚ (WEALTH) ---
  {
    id: 'rich_1k',
    title: 'Ống heo đầy',
    description: 'Tích lũy 1,000 xu.',
    icon: '💰',
    condition: (state) => state.coins >= 1000,
    isUnlocked: false
  },
  {
    id: 'rich_5k',
    title: 'Tiểu thương',
    description: 'Tích lũy 5,000 xu.',
    icon: '💵',
    condition: (state) => state.coins >= 5000,
    isUnlocked: false
  },
  {
    id: 'rich_10k',
    title: 'Đại gia nhí',
    description: 'Tích lũy 10,000 xu.',
    icon: '💎',
    condition: (state) => state.coins >= 10000,
    isUnlocked: false
  },
  {
    id: 'shopper',
    title: 'Tín đồ mua sắm',
    description: 'Sở hữu 5 món đồ trang trí.',
    icon: '🛍️', // Fixed: Changed from 'shopping_bag' string to emoji
    condition: (state) => (state.decorations?.length || 0) >= 5,
    isUnlocked: false
  },

  // --- NÔNG TRẠI (FARMING) ---
  {
    id: 'farm_lv5',
    title: 'Chủ trang trại',
    description: 'Nông trại đạt cấp 5.',
    icon: '🚜',
    condition: (state) => (state.farmLevel || 1) >= 5,
    isUnlocked: false
  },
  {
    id: 'farm_lv10',
    title: 'Vua nông nghiệp',
    description: 'Nông trại đạt cấp 10.',
    icon: '🏰',
    condition: (state) => (state.farmLevel || 1) >= 10,
    isUnlocked: false
  },
  {
    id: 'harvest_50',
    title: 'Mùa màng bội thu',
    description: 'Thu hoạch tổng cộng 50 nông sản.',
    icon: '🌾',
    condition: (state) => {
        const total = Object.values(state.harvestedCrops || {}).reduce((a:any,b:any)=>a+b, 0) as number;
        return total >= 50;
    },
    isUnlocked: false
  },
  {
    id: 'harvest_500',
    title: 'Kho lương đầy ắp',
    description: 'Thu hoạch tổng cộng 500 nông sản.',
    icon: '🥕',
    condition: (state) => {
        const total = Object.values(state.harvestedCrops || {}).reduce((a:any,b:any)=>a+b, 0) as number;
        return total >= 500;
    },
    isUnlocked: false
  },
  {
    id: 'animal_lover',
    title: 'Yêu động vật',
    description: 'Mở khóa 3 chuồng nuôi.',
    icon: '🐔',
    condition: (state) => (state.livestockSlots?.filter(s => s.isUnlocked).length || 0) >= 3,
    isUnlocked: false
  },
  {
    id: 'machine_master',
    title: 'Kỹ sư nhí',
    description: 'Sở hữu 3 máy chế biến.',
    icon: '⚙️',
    condition: (state) => (state.machineSlots?.filter(s => s.isUnlocked && s.machineId).length || 0) >= 3,
    isUnlocked: false
  },
  {
    id: 'order_master',
    title: 'Thánh giao hàng',
    description: 'Kiếm được hơn 2000 xu từ các đơn hàng (ước tính).',
    icon: '🚚',
    condition: (state) => state.coins >= 2000 && (state.farmLevel || 1) >= 3, 
    isUnlocked: false
  },
  {
    id: 'water_master',
    title: 'Thần Mưa',
    description: 'Tích trữ 50 giọt nước.',
    icon: '💧',
    condition: (state) => state.waterDrops >= 50,
    isUnlocked: false
  },

  // --- BỘ SƯU TẬP (COLLECTION) ---
  {
    id: 'star_50',
    title: 'Người sưu tầm',
    description: 'Tích lũy 50 Ngôi sao.',
    icon: '✨',
    condition: (state) => state.stars >= 50,
    isUnlocked: false
  },
  {
    id: 'dragon_owner',
    title: 'Bạn của Rồng',
    description: 'Sở hữu avatar Rồng Thần (Cost 5000).',
    icon: '🐲',
    condition: (state) => state.currentAvatarId === 'dragon',
    isUnlocked: false
  }
];

export const GeneralAchievements: React.FC<GeneralAchievementsProps> = ({ userState, onClose }) => {
  const categories = [
      { id: 'LEARN', label: 'Học Tập', icon: Book },
      { id: 'GAME', label: 'Thử Thách', icon: Zap },
      { id: 'FARM', label: 'Nông Trại', icon: Sprout },
      { id: 'WEALTH', label: 'Tài Phú', icon: Coins },
  ];

  // Helper to categorize
  const getCategory = (id: string) => {
      if (id.startsWith('speed')) return 'GAME';
      if (id.startsWith('farm') || id.startsWith('harvest') || id.startsWith('animal') || id.startsWith('machine') || id.startsWith('order') || id.startsWith('water')) return 'FARM';
      if (id.startsWith('rich') || id.startsWith('shopper')) return 'WEALTH';
      return 'LEARN';
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 animate-fadeIn relative z-50">
      <div className="bg-white p-4 shadow-sm border-b border-slate-200 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-2">
           <Trophy className="text-blue-500" size={28} />
           <div>
               <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Thành Tích</h2>
               <p className="text-xs text-slate-400 font-bold">Thu thập huy hiệu vinh quang!</p>
           </div>
        </div>
        <button onClick={onClose} className="text-slate-400 font-bold hover:bg-slate-100 px-3 py-1 rounded-lg">Đóng</button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 no-scrollbar space-y-6">
        {categories.map(cat => {
            const catAchievements = APP_ACHIEVEMENTS.filter(a => getCategory(a.id) === cat.id);
            if (catAchievements.length === 0) return null;

            return (
                <div key={cat.id}>
                    <div className="flex items-center gap-2 mb-3 px-2">
                        <cat.icon size={20} className="text-slate-400"/>
                        <h3 className="font-black text-slate-500 uppercase tracking-widest text-sm">{cat.label}</h3>
                    </div>
                    <div className="grid grid-cols-1 gap-3">
                        {catAchievements.map((ach) => {
                            const isUnlocked = userState.unlockedAchievements?.includes(ach.id) || ach.condition(userState);
                            
                            return (
                            <div 
                                key={ach.id} 
                                className={`flex items-center p-3 rounded-2xl border-b-4 transition-all relative overflow-hidden ${
                                isUnlocked 
                                    ? 'bg-white border-blue-200 shadow-sm' 
                                    : 'bg-slate-100 border-slate-200 opacity-60'
                                }`}
                            >
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl shadow-inner mr-3 border-2 flex-shrink-0 ${isUnlocked ? 'bg-blue-50 border-blue-100' : 'bg-slate-200 border-slate-300 grayscale'}`}>
                                {ach.icon}
                                </div>
                                
                                <div className="flex-1 z-10 min-w-0">
                                <div className="flex items-center gap-2">
                                    <h3 className={`font-black text-sm uppercase tracking-tight truncate ${isUnlocked ? 'text-slate-800' : 'text-slate-500'}`}>
                                        {ach.title}
                                    </h3>
                                    {isUnlocked && <Star size={14} className="text-yellow-400 fill-yellow-400 animate-pulse flex-shrink-0" />}
                                </div>
                                <p className="text-[10px] font-bold text-slate-400 leading-tight">{ach.description}</p>
                                </div>

                                {!isUnlocked && <Lock className="text-slate-300 ml-2" size={16} />}
                            </div>
                            );
                        })}
                    </div>
                </div>
            )
        })}
        
        <div className="h-8"></div>
      </div>
    </div>
  );
};
