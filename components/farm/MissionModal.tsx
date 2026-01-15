import React, { useState } from 'react';
import { Mission } from '../../types';
import { X, Gift, Coins, Droplets, Zap, Star } from 'lucide-react';
import { Avatar } from '../Avatar';

interface MissionModalProps {
  missions: Mission[];
  onClaim: (mission: Mission) => void;
  onClose: () => void;
}

export const MissionModal: React.FC<MissionModalProps> = ({ missions, onClaim, onClose }) => {
  const [activeTab, setActiveTab] = useState<'DAILY' | 'ACHIEVEMENT'>('DAILY');
  const filteredMissions = missions.filter(m => m.category === activeTab);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fadeIn">
        <div className="bg-white rounded-[3rem] w-full max-w-sm relative border-8 border-indigo-100 shadow-2xl flex flex-col h-[80vh] overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-500 to-indigo-700 p-8 text-white text-center relative flex flex-col items-center">
                <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full"><X size={24}/></button>
                <div className="mb-2"><Avatar emoji="🐢" bgGradient="bg-white/20" size="sm" /></div>
                <h3 className="text-2xl font-black uppercase tracking-tighter">Nhiệm Vụ Học Tập</h3>
            </div>

            <div className="flex bg-indigo-50 p-2 gap-2">
                <button 
                  onClick={() => setActiveTab('DAILY')}
                  className={`flex-1 py-3 rounded-2xl font-black text-xs transition-all ${activeTab === 'DAILY' ? 'bg-indigo-500 text-white shadow-md' : 'text-indigo-400 hover:bg-indigo-100'}`}
                >
                    NHIỆM VỤ NGÀY
                </button>
                <button 
                  onClick={() => setActiveTab('ACHIEVEMENT')}
                  className={`flex-1 py-3 rounded-2xl font-black text-xs transition-all ${activeTab === 'ACHIEVEMENT' ? 'bg-indigo-500 text-white shadow-md' : 'text-indigo-400 hover:bg-indigo-100'}`}
                >
                    THÀNH TỰU
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar bg-indigo-50/20">
                {filteredMissions.length === 0 ? (
                    <div className="text-center py-10 text-slate-400 italic">Bé đã hoàn thành hết rồi!</div>
                ) : (
                    filteredMissions.map(m => {
                        const progress = Math.min(100, (m.current / m.target) * 100);
                        return (
                            <div key={m.id} className={`p-4 rounded-[2rem] border-4 bg-white shadow-sm transition-all ${m.claimed ? 'opacity-60 grayscale' : m.completed ? 'border-green-400 scale-105' : 'border-white'}`}>
                                <h4 className="font-black text-slate-800 text-[11px] uppercase leading-tight mb-2">{m.desc}</h4>
                                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden mb-3 border border-slate-50">
                                    <div className="h-full bg-indigo-500 transition-all duration-1000" style={{ width: `${progress}%` }} />
                                </div>
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <div className="flex items-center gap-1 bg-yellow-50 px-2 py-0.5 rounded-full border border-yellow-100">
                                            <span className="text-[10px] font-black text-yellow-700">+{m.reward.amount}</span>
                                            {m.reward.type === 'COIN' ? <Coins size={10} className="text-yellow-500" fill="currentColor"/> : 
                                             m.reward.type === 'WATER' ? <Droplets size={10} className="text-blue-500" fill="currentColor"/> :
                                             m.reward.type === 'STAR' ? <Star size={10} className="text-purple-500" fill="currentColor"/> :
                                             <Zap size={10} className="text-purple-500" fill="currentColor"/>}
                                        </div>
                                    </div>
                                    {m.completed && !m.claimed ? (
                                        <button onClick={() => onClaim(m)} className="bg-green-500 hover:bg-green-600 text-white px-4 py-1.5 rounded-full font-black text-[10px] uppercase shadow-lg flex items-center gap-1">
                                            <Gift size={12}/> Nhận
                                        </button>
                                    ) : m.claimed ? (
                                        <span className="text-[9px] font-black text-slate-300 uppercase">Đã nhận</span>
                                    ) : (
                                        <span className="text-[10px] font-black text-indigo-400">{m.current}/{m.target}</span>
                                    )}
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
