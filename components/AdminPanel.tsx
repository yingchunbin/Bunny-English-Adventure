
import React, { useState } from 'react';
import { UserState } from '../types';
import { X, Save, Unlock, Zap, Trash2, Sprout } from 'lucide-react';
import { LEVELS } from '../constants';
import { CROPS, ANIMALS, MACHINES, DECORATIONS } from '../data/farmData';
import { ConfirmModal } from './ui/ConfirmModal';

interface AdminPanelProps {
  userState: UserState;
  onUpdateState: (newState: UserState | ((prev: UserState) => UserState)) => void;
  onClose: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ userState, onUpdateState, onClose }) => {
  const [coins, setCoins] = useState(userState.coins);
  const [stars, setStars] = useState(userState.stars);
  const [water, setWater] = useState(userState.waterDrops);
  const [fert, setFert] = useState(userState.fertilizers);
  const [farmLevel, setFarmLevel] = useState(userState.farmLevel || 1);
  
  const [alertMsg, setAlertMsg] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleSaveResources = () => {
    onUpdateState(prev => ({
      ...prev,
      coins: Number(coins),
      stars: Number(stars),
      waterDrops: Number(water),
      fertilizers: Number(fert),
      farmLevel: Number(farmLevel)
    }));
    setAlertMsg("Đã cập nhật tài nguyên!");
  };

  const handleUnlockAllLevels = () => {
    const allLevelIds = LEVELS.map(l => l.id);
    onUpdateState(prev => ({
      ...prev,
      unlockedLevels: allLevelIds
    }));
    setAlertMsg("Đã mở khóa tất cả bài học!");
  };

  const handleUnlockFarm = () => {
    onUpdateState(prev => ({
      ...prev,
      farmPlots: prev.farmPlots.map(p => ({ ...p, isUnlocked: true })),
      livestockSlots: [1,2,3,4,5,6].map(id => ({ id, isUnlocked: true, animalId: null, fedAt: null, storage: [], queue: 0 })),
      machineSlots: [1,2,3,4,5,6].map(id => ({ id, isUnlocked: true, machineId: null, activeRecipeId: null, startedAt: null, queue: [], storage: [] })),
      decorSlots: [1,2,3,4,5,6].map(id => ({ id, isUnlocked: true, decorId: null })),
    }));
    setAlertMsg("Đã mở rộng toàn bộ nông trại!");
  };

  const handleMaxInventory = () => {
    const allItems: Record<string, number> = {};
    [...CROPS, ...ANIMALS, ...MACHINES, ...DECORATIONS].forEach(item => {
        allItems[item.id] = 99;
    });
    onUpdateState(prev => ({
        ...prev,
        inventory: allItems
    }));
    setAlertMsg("Đã thêm 99 mỗi loại vật phẩm vào kho!");
  };

  const handleReset = () => {
      localStorage.clear();
      window.location.reload();
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl border-4 border-red-500 overflow-hidden text-white">
        
        <div className="bg-red-600 p-4 flex justify-between items-center">
          <h2 className="text-xl font-black uppercase tracking-widest flex items-center gap-2">
            🐞 ADMIN MODE: BAKUNTIN
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-red-700 rounded-full"><X /></button>
        </div>

        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto no-scrollbar">
          
          {/* Resources */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase">Tài nguyên</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-slate-400">Xu</label>
                <input type="number" value={coins} onChange={e => setCoins(Number(e.target.value))} className="w-full bg-slate-800 p-2 rounded border border-slate-700 font-mono text-yellow-400" />
              </div>
              <div>
                <label className="text-[10px] text-slate-400">Sao</label>
                <input type="number" value={stars} onChange={e => setStars(Number(e.target.value))} className="w-full bg-slate-800 p-2 rounded border border-slate-700 font-mono text-purple-400" />
              </div>
              <div>
                <label className="text-[10px] text-slate-400">Nước</label>
                <input type="number" value={water} onChange={e => setWater(Number(e.target.value))} className="w-full bg-slate-800 p-2 rounded border border-slate-700 font-mono text-blue-400" />
              </div>
              <div>
                <label className="text-[10px] text-slate-400">Phân bón</label>
                <input type="number" value={fert} onChange={e => setFert(Number(e.target.value))} className="w-full bg-slate-800 p-2 rounded border border-slate-700 font-mono text-green-400" />
              </div>
              <div className="col-span-2">
                <label className="text-[10px] text-slate-400">Cấp độ Nông Trại</label>
                <input type="number" value={farmLevel} onChange={e => setFarmLevel(Number(e.target.value))} className="w-full bg-slate-800 p-2 rounded border border-slate-700 font-mono text-white" />
              </div>
            </div>
            <button onClick={handleSaveResources} className="w-full py-2 bg-blue-600 hover:bg-blue-500 rounded-lg font-bold flex items-center justify-center gap-2">
                <Save size={16} /> Lưu Thay Đổi
            </button>
          </div>

          <div className="h-px bg-slate-700 my-2"></div>

          {/* Cheats */}
          <div className="space-y-3">
             <h3 className="text-xs font-bold text-slate-400 uppercase">Lệnh Nhanh</h3>
             <button onClick={handleUnlockAllLevels} className="w-full py-3 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-xl font-bold flex items-center justify-between px-4">
                <span>Mở khóa tất cả bài học</span>
                <Unlock size={18} className="text-green-400"/>
             </button>
             <button onClick={handleUnlockFarm} className="w-full py-3 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-xl font-bold flex items-center justify-between px-4">
                <span>Mở rộng full Nông trại</span>
                <Sprout size={18} className="text-green-400"/>
             </button>
             <button onClick={handleMaxInventory} className="w-full py-3 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-xl font-bold flex items-center justify-between px-4">
                <span>Full Túi đồ (99 all)</span>
                <Zap size={18} className="text-yellow-400"/>
             </button>
          </div>

          <div className="h-px bg-slate-700 my-2"></div>

          <button onClick={() => setShowResetConfirm(true)} className="w-full py-3 bg-red-900/50 hover:bg-red-900 border border-red-800 text-red-400 rounded-xl font-bold flex items-center justify-center gap-2">
              <Trash2 size={18} /> Wipe Save Data
          </button>

        </div>
      </div>

      <ConfirmModal 
        isOpen={!!alertMsg}
        message={alertMsg || ''}
        onConfirm={() => setAlertMsg(null)}
        singleButton
      />

      <ConfirmModal 
        isOpen={showResetConfirm}
        message="Admin Reset: Xóa sạch dữ liệu?"
        onConfirm={handleReset}
        onCancel={() => setShowResetConfirm(false)}
        type="DANGER"
      />
    </div>
  );
};
