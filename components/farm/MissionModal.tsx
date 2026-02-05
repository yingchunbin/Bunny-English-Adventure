
import React, { useState } from 'react';
import { Mission, MissionReward } from '../../types';
import { X, Gift, Coins, Droplets, Zap, Star, Tractor, Heart, CloudRain, Briefcase, CheckCircle } from 'lucide-react';
import { Avatar } from '../Avatar';

interface MissionModalProps {
  missions: Mission[];
  onClaim: (mission: Mission, e: React.MouseEvent) => void;
  onClose: () => void;
}

export const MissionModal: React.FC<MissionModalProps> = ({ missions, onClaim, onClose }) => {
  const [activeTab, setActiveTab] = useState<'DAILY' | 'ACHIEVEMENT'>('DAILY');
  
  // Filter and sort missions defensively
  const filteredMissions = (missions || [])
    .filter(m => m && m.category === activeTab) // Ensure m exists
    .sort((a, b) => {
        // Priority 1: Claimable
        const aClaimable = a.completed && !a.claimed;
        const bClaimable = b.completed && !b.claimed;
        if (aClaimable && !bClaimable) return -1;
        if (!aClaimable && bClaimable) return 1;

        // Priority 3: Claimed (Push to bottom)
        if (a.claimed && !b.claimed) return 1;
        if (!a.claimed && b.claimed) return -1;

        // Priority 2: Progress % Descending
        const progA = (a.current || 0) / (a.target || 1);
        const progB = (b.current || 0) / (b.target || 1);
        return progB - progA;
    });

  const getMissionIcon = (type: Mission['type']) => {
      switch (type) {
          case 'HARVEST': return <Tractor size={24} className="text-orange-500" />;
          case 'FEED': return <Heart size={24} className="text-pink-500" />;
          case 'WATER': return <CloudRain size={24} className="text-blue-500" />;
          case 'EARN': return <Briefcase size={24} className="text-amber-600" />;
          case 'FERTILIZE': return <Zap size={24} className="text-purple-500" />;
          default: return <Star size={24} className="text-yellow-500" />;
      }
  };

  const getRewardIcon = (type: string) => {
      if (type === 'COIN') return <Coins size={14} className="text-yellow-500" fill="currentColor"/>;
      if (type === 'WATER') return <Droplets size={14} className="text-blue-500" fill="currentColor"/>;
      if (type === 'STAR') return <Star size={14} className="text-purple-500" fill="currentColor"/>;
      if (type === 'FERTILIZER') return <Zap size={14} className="text-amber-500" fill="currentColor"/>;
      return <Gift size={14} className="text-pink-500"/>;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fadeIn">
        <div className="bg-white rounded-[3rem] w-full max-w-md relative border-8 border-indigo-100 shadow-2xl flex flex-col h-[85vh] overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-500 to-indigo-700 p-6 text-white text-center relative flex flex-col items-center shadow-md z-10">
                <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"><X size={24}/></button>
                <div className="mb-2 scale-110"><Avatar emoji="🐢" bgGradient="bg-white/20" size="sm" /></div>
                <h3 className="text-2xl font-black uppercase tracking-tighter">Nhiệm Vụ & Thành Tựu</h3>
                <p className="text-[10px] font-bold opacity-80 uppercase tracking-widest mt-1">Làm giàu không khó!</p>
            </div>

            <div className="flex bg-indigo-50 p-2 gap-2 border-b border-indigo-100">
                <button 
                  onClick={() => setActiveTab('DAILY')}
                  className={`flex-1 py-3 rounded-2xl font-black text-xs transition-all uppercase ${activeTab === 'DAILY' ? 'bg-indigo-500 text-white shadow-lg' : 'text-indigo-400 hover:bg-indigo-100'}`}
                >
                    Nhiệm vụ ngày
                </button>
                <button 
                  onClick={() => setActiveTab('ACHIEVEMENT')}
                  className={`flex-1 py-3 rounded-2xl font-black text-xs transition-all uppercase ${activeTab === 'ACHIEVEMENT' ? 'bg-orange-500 text-white shadow-lg' : 'text-orange-400 hover:bg-orange-50'}`}
                >
                    Thành Tựu
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar bg-slate-50">
                {filteredMissions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 opacity-50">
                        <div className="text-6xl mb-4 grayscale">📜</div>
                        <div className="text-slate-400 font-bold italic">Chưa có nhiệm vụ nào!</div>
                    </div>
                ) : (
                    filteredMissions.map(m => {
                        const progress = Math.min(100, ((m.current || 0) / (m.target || 1)) * 100);
                        const isCompleted = m.completed;
                        const isClaimable = isCompleted && !m.claimed;
                        
                        // Defensive Reward Handling: Filter out null/undefined rewards
                        // Support both new 'rewards' array and legacy 'reward' object
                        const rawRewards = m.rewards || (m.reward ? [m.reward] : []);
                        const rewardsList = rawRewards.filter(r => r && typeof r === 'object' && typeof r.amount === 'number');

                        return (
                            <div key={m.id} className={`p-4 rounded-[2rem] border-4 bg-white shadow-sm transition-all relative overflow-hidden group ${m.claimed ? 'opacity-60 grayscale border-slate-200' : isClaimable ? 'border-green-400 ring-4 ring-green-100 order-first' : 'border-white hover:border-indigo-200'}`}>
                                
                                {isClaimable && (
                                    <div className="absolute top-0 right-0 bg-green-500 text-white text-[9px] font-black px-3 py-1 rounded-bl-xl shadow-sm z-20 animate-pulse">
                                        NHẬN NGAY!
                                    </div>
                                )}

                                <div className="flex items-center gap-4 mb-3 relative z-10">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 shadow-inner ${isCompleted ? 'bg-green-100 border-green-200' : 'bg-slate-50 border-slate-100'}`}>
                                        {m.claimed ? <CheckCircle size={24} className="text-green-600"/> : getMissionIcon(m.type)}
                                    </div>
                                    <div className="flex-1">
                                        <h4 className={`font-black text-xs sm:text-sm uppercase leading-tight mb-1 ${isCompleted ? 'text-green-700' : 'text-slate-700'}`}>{m.desc}</h4>
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-bold text-slate-400">Tiến độ:</span>
                                            <span className={`text-[10px] font-black ${isCompleted ? 'text-green-600' : 'text-indigo-500'}`}>{m.current}/{m.target}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden mb-3 border border-slate-200 relative z-10">
                                    <div className={`h-full transition-all duration-1000 ${isCompleted ? 'bg-green-500' : 'bg-indigo-400'}`} style={{ width: `${progress}%` }} />
                                </div>

                                <div className="flex justify-between items-center relative z-10">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="text-[10px] text-slate-400 font-bold uppercase mr-1">Quà:</span>
                                        {rewardsList.map((r, i) => (
                                            <div key={i} className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-full border border-yellow-200">
                                                <span className="text-xs font-black text-yellow-700">+{r.amount}</span>
                                                {getRewardIcon(r.type)}
                                            </div>
                                        ))}
                                    </div>
                                    
                                    {isClaimable ? (
                                        <button onClick={(e) => onClaim(m, e)} className="bg-green-500 hover:bg-green-600 text-white px-5 py-2 rounded-xl font-black text-[10px] uppercase shadow-lg shadow-green-200 flex items-center gap-1 animate-bounce ml-2">
                                            <Gift size={14}/> Nhận Quà
                                        </button>
                                    ) : m.claimed ? (
                                        <span className="text-[10px] font-black text-slate-400 uppercase bg-slate-100 px-3 py-1 rounded-lg">Đã nhận</span>
                                    ) : (
                                        <span className="text-[10px] font-bold text-slate-300 italic">Đang thực hiện...</span>
                                    )}
                                </div>
                                
                                {/* Background Deco */}
                                <div className="absolute -right-4 -bottom-4 text-8xl opacity-5 pointer-events-none rotate-12 group-hover:rotate-0 transition-transform">
                                    {m.category === 'ACHIEVEMENT' ? '🏆' : '📅'}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    </div>
  );
};
