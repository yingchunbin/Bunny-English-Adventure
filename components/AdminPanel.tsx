
import React from 'react';
import { UserState } from '../types';
import { X, Coins, Star, Droplets, Zap, Lock, Unlock, Trophy, Sprout, ShieldAlert } from 'lucide-react';
import { LEVELS } from '../constants';
import { playSFX } from '../utils/sound';

interface AdminPanelProps {
  userState: UserState;
  onUpdateState: (newState: UserState | ((prev: UserState) => UserState)) => void;
  onClose: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ userState, onUpdateState, onClose }) => {
  
  const addResource = (type: 'COIN' | 'STAR' | 'WATER' | 'FERTILIZER', amount: number) => {
    onUpdateState(prev => ({
      ...prev,
      coins: type === 'COIN' ? prev.coins + amount : prev.coins,
      stars: type === 'STAR' ? (prev.stars || 0) + amount : (prev.stars || 0),
      waterDrops: type === 'WATER' ? prev.waterDrops + amount : prev.waterDrops,
      fertilizers: type === 'FERTILIZER' ? prev.fertilizers + amount : prev.fertilizers,
    }));
    playSFX('coins');
  };

  const setLevel = (level: number) => {
    onUpdateState(prev => ({ ...prev, farmLevel: level, farmExp: 0 }));
    playSFX('powerup');
  };

  const unlockAllLevels = () => {
    onUpdateState(prev => ({
      ...prev,
      unlockedLevels: LEVELS.map(l => l.id)
    }));
    playSFX('success');
  };

  const unlockAllPlots = () => {
    onUpdateState(prev => ({
      ...prev,
      farmPlots: prev.farmPlots.map(p => ({ ...p, isUnlocked: true })),
      livestockSlots: prev.livestockSlots?.map(s => ({ ...s, isUnlocked: true })),
      machineSlots: prev.machineSlots?.map(s => ({ ...s, isUnlocked: true })),
      decorSlots: prev.decorSlots?.map(s => ({ ...s, isUnlocked: true })),
    }));
    playSFX('success');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border-4 border-slate-700 text-slate-200">
        
        <div className="bg-slate-800 p-4 flex justify-between items-center border-b border-slate-700">
          <h2 className="text-xl font-black text-red-500 flex items-center gap-2 uppercase tracking-widest">
            <ShieldAlert size={24} /> Admin Tools
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded-full transition-colors"><X size={24} /></button>
        </div>

        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          
          {/* Resources */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Tài nguyên</h3>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => addResource('COIN', 10000)} className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 p-3 rounded-xl border border-slate-600 active:scale-95 transition-all">
                <Coins className="text-yellow-500" size={20} /> +10k Xu
              </button>
              <button onClick={() => addResource('STAR', 100)} className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 p-3 rounded-xl border border-slate-600 active:scale-95 transition-all">
                <Star className="text-purple-500" size={20} /> +100 Sao
              </button>
              <button onClick={() => addResource('WATER', 50)} className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 p-3 rounded-xl border border-slate-600 active:scale-95 transition-all">
                <Droplets className="text-blue-500" size={20} /> +50 Nước
              </button>
              <button onClick={() => addResource('FERTILIZER', 50)} className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 p-3 rounded-xl border border-slate-600 active:scale-95 transition-all">
                <Zap className="text-green-500" size={20} /> +50 Phân bón
              </button>
            </div>
          </div>

          {/* Leveling */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Cấp độ Nông trại</h3>
            <div className="flex gap-3">
              {[1, 5, 10, 20, 50].map(lvl => (
                <button 
                  key={lvl}
                  onClick={() => setLevel(lvl)}
                  className={`flex-1 py-2 rounded-lg font-bold border active:scale-95 transition-all ${userState.farmLevel === lvl ? 'bg-green-600 text-white border-green-500' : 'bg-slate-800 border-slate-600 hover:bg-slate-700'}`}
                >
                  Lv {lvl}
                </button>
              ))}
            </div>
          </div>

          {/* Unlocks */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Mở khóa & Hack</h3>
            <div className="grid grid-cols-1 gap-3">
              <button onClick={unlockAllLevels} className="flex items-center justify-center gap-2 bg-blue-900/50 hover:bg-blue-800/50 p-4 rounded-xl border border-blue-700 text-blue-300 active:scale-95 transition-all font-bold">
                <Unlock size={20} /> Mở khóa tất cả Bài Học
              </button>
              
              <button onClick={unlockAllPlots} className="flex items-center justify-center gap-2 bg-emerald-900/50 hover:bg-emerald-800/50 p-4 rounded-xl border border-emerald-700 text-emerald-300 active:scale-95 transition-all font-bold">
                <Sprout size={20} /> Mở khóa tất cả Ô đất/Chuồng/Máy
              </button>

              <button 
                onClick={() => onUpdateState(prev => ({ ...prev, unlockedAchievements: ['first_step', 'scholar_100', 'rich_10k', 'dragon_owner'] }))} 
                className="flex items-center justify-center gap-2 bg-amber-900/50 hover:bg-amber-800/50 p-4 rounded-xl border border-amber-700 text-amber-300 active:scale-95 transition-all font-bold"
              >
                <Trophy size={20} /> Hack Thành Tựu
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-700">
             <div className="text-[10px] font-mono text-slate-500 text-center">
                SESSION ID: {Date.now().toString(36).toUpperCase()} <br/>
                USER: {userState.settings.userName}
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};
