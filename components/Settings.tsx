
import React, { useState, useRef } from 'react';
import { UserState } from '../types';
import { Volume2, Music, Battery, BatteryCharging, Trash2, X, User, Download, Upload, Coins, Star, Droplets, Zap, Unlock, Sprout, Hammer } from 'lucide-react';
import { ConfirmModal } from './ui/ConfirmModal';
import { playSFX } from '../utils/sound';

interface SettingsProps {
  userState: UserState;
  onUpdateState: (newState: UserState | ((prev: UserState) => UserState)) => void;
  onResetData: () => void;
  onImportData?: (data: any) => void;
  onClose: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ userState, onUpdateState, onResetData, onImportData, onClose }) => {
  const { settings } = userState;
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check for Admin Name
  const isAdmin = settings.userName?.trim().toUpperCase() === 'BAKUNTIN';

  const handleVolumeChange = (type: 'sfx' | 'bgm', val: string) => {
    const value = parseFloat(val);
    onUpdateState(prev => ({
        ...prev,
        settings: {
            ...prev.settings,
            [type === 'sfx' ? 'sfxVolume' : 'bgmVolume']: value
        }
    }));
  };

  const handleNameChange = (val: string) => {
      onUpdateState(prev => ({
          ...prev,
          settings: { ...prev.settings, userName: val }
      }));
  };

  const handlePerformanceChange = () => {
      onUpdateState(prev => ({
          ...prev,
          settings: { ...prev.settings, lowPerformance: !prev.settings.lowPerformance }
      }));
  };

  const handleExport = () => {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(userState));
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", `turtle_english_backup_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
          try {
              const json = JSON.parse(event.target?.result as string);
              if (onImportData) onImportData(json);
          } catch (err) {
              alert("File lỗi! Không thể đọc dữ liệu.");
          }
      };
      reader.readAsText(file);
  };

  // --- ADMIN ACTIONS ---
  const adminAddResource = (type: 'COIN' | 'STAR' | 'WATER' | 'FERTILIZER', amount: number) => {
      playSFX('powerup');
      onUpdateState(prev => ({
          ...prev,
          coins: type === 'COIN' ? prev.coins + amount : prev.coins,
          stars: type === 'STAR' ? prev.stars + amount : prev.stars,
          waterDrops: type === 'WATER' ? prev.waterDrops + amount : prev.waterDrops,
          fertilizers: type === 'FERTILIZER' ? prev.fertilizers + amount : prev.fertilizers,
      }));
  };

  const adminLevelUpFarm = () => {
      playSFX('success');
      onUpdateState(prev => ({
          ...prev,
          farmLevel: (prev.farmLevel || 1) + 1,
          farmExp: 0
      }));
  };

  const adminUnlockAllLevels = () => {
      playSFX('success');
      onUpdateState(prev => {
          // Unlock vast range of levels based on current book/grade logic
          // Simple hack: Unlock IDs 1000-6000
          const allIds = [];
          for(let i=1000; i<6000; i++) allIds.push(i);
          return {
              ...prev,
              unlockedLevels: allIds
          };
      });
      alert("Đã mở khóa toàn bộ bài học!");
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border-4 border-slate-100 flex flex-col max-h-[90vh]">
        
        <div className="bg-slate-50 p-4 flex justify-between items-center border-b border-slate-200 shrink-0">
          <h2 className="text-xl font-bold text-slate-700 flex items-center gap-2">
            <span className="text-2xl">⚙️</span> Cài Đặt
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><X size={24} className="text-slate-500"/></button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar">
          
          {/* Profile Section */}
          <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
             <h3 className="font-bold text-blue-800 mb-3 flex items-center gap-2"><User size={18}/> Hồ Sơ Bé</h3>
             <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-blue-600 uppercase tracking-wider">Tên hiển thị</label>
                <input 
                    type="text" 
                    value={settings?.userName || ''} 
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="Nhập tên bé..."
                    className="w-full p-3 rounded-xl border-2 border-blue-200 focus:border-blue-400 outline-none text-slate-900 bg-white font-black text-lg placeholder-slate-300 shadow-inner transition-all"
                />
                <p className="text-[10px] text-blue-400 italic">Nhập "BAKUNTIN" để mở chế độ Admin.</p>
             </div>
          </div>

          {/* DEVELOPER TOOLS (HIDDEN) */}
          {isAdmin && (
              <div className="bg-slate-800 p-4 rounded-2xl border-2 border-slate-600 shadow-xl animate-fadeIn">
                  <div className="flex items-center gap-2 mb-4 text-yellow-400 border-b border-slate-600 pb-2">
                      <Hammer size={20} />
                      <h3 className="font-black uppercase tracking-widest text-sm">Developer Tools</h3>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 mb-4">
                      <button onClick={() => adminAddResource('COIN', 10000)} className="bg-amber-600 hover:bg-amber-500 text-white p-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1 active:scale-95 transition-all">
                          <Coins size={14}/> +10K Xu
                      </button>
                      <button onClick={() => adminAddResource('STAR', 100)} className="bg-purple-600 hover:bg-purple-500 text-white p-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1 active:scale-95 transition-all">
                          <Star size={14}/> +100 Sao
                      </button>
                      <button onClick={() => adminAddResource('WATER', 50)} className="bg-blue-600 hover:bg-blue-500 text-white p-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1 active:scale-95 transition-all">
                          <Droplets size={14}/> +50 Nước
                      </button>
                      <button onClick={() => adminAddResource('FERTILIZER', 20)} className="bg-green-600 hover:bg-green-500 text-white p-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1 active:scale-95 transition-all">
                          <Zap size={14}/> +20 Phân
                      </button>
                  </div>

                  <div className="grid grid-cols-1 gap-2">
                      <button onClick={adminLevelUpFarm} className="bg-indigo-600 hover:bg-indigo-500 text-white p-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition-all border border-indigo-400">
                          <Sprout size={16}/> Lên Cấp Nông Trại (+1 LV)
                      </button>
                      <button onClick={adminUnlockAllLevels} className="bg-red-900 hover:bg-red-800 text-white p-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition-all border border-red-700">
                          <Unlock size={16}/> Mở Khóa Tất Cả Bài Học
                      </button>
                  </div>
              </div>
          )}

          {/* Audio Section */}
          <div className="space-y-4">
            <h3 className="font-bold text-slate-700 uppercase text-xs tracking-widest">Âm Thanh</h3>
            
            {/* Music Volume */}
            <div className="flex items-center gap-4">
              <div className="w-8 flex justify-center"><Music size={20} className="text-purple-500"/></div>
              <span className="text-sm font-bold text-slate-500 w-20">Nhạc nền</span>
              <input 
                type="range" min="0" max="1" step="0.1" 
                value={settings?.bgmVolume ?? 0.3} 
                onChange={(e) => handleVolumeChange('bgm', e.target.value)}
                className="flex-1 accent-purple-500 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* SFX Volume */}
            <div className="flex items-center gap-4">
              <div className="w-8 flex justify-center"><Volume2 size={20} className="text-green-500"/></div>
              <span className="text-sm font-bold text-slate-500 w-20">Hiệu ứng</span>
              <input 
                type="range" min="0" max="1" step="0.1" 
                value={settings?.sfxVolume ?? 0.8} 
                onChange={(e) => handleVolumeChange('sfx', e.target.value)}
                className="flex-1 accent-green-500 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>

          {/* Backup & Restore */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
              <h3 className="font-bold text-slate-700 uppercase text-xs tracking-widest">Dữ Liệu & Sao Lưu</h3>
              <div className="grid grid-cols-2 gap-3">
                  <button 
                      onClick={handleExport}
                      className="flex flex-col items-center justify-center gap-2 bg-emerald-50 hover:bg-emerald-100 border-2 border-emerald-200 p-3 rounded-2xl transition-all active:scale-95 text-emerald-700 font-bold text-xs"
                  >
                      <Download size={20} /> Tải dữ liệu về
                  </button>
                  
                  <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="flex flex-col items-center justify-center gap-2 bg-amber-50 hover:bg-amber-100 border-2 border-amber-200 p-3 rounded-2xl transition-all active:scale-95 text-amber-700 font-bold text-xs"
                  >
                      <Upload size={20} /> Nạp dữ liệu cũ
                  </button>
                  <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      accept=".json" 
                      onChange={handleFileChange}
                  />
              </div>
              <p className="text-[10px] text-slate-400 italic text-center">
                  *Hãy tải dữ liệu về thường xuyên để không bị mất khi đổi máy nhé!
              </p>
          </div>

          {/* Performance */}
          <div className="flex items-center justify-between py-2 border-t border-slate-100 pt-4">
             <div className="flex items-center gap-2">
                {settings?.lowPerformance ? <Battery className="text-orange-500"/> : <BatteryCharging className="text-green-500"/>}
                <span className="text-sm font-bold text-slate-600">Chế độ tiết kiệm pin</span>
             </div>
             <button 
                onClick={handlePerformanceChange}
                className={`w-12 h-6 rounded-full transition-colors relative ${settings?.lowPerformance ? 'bg-green-500' : 'bg-slate-300'}`}
             >
                <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all shadow-sm ${settings?.lowPerformance ? 'left-7' : 'left-1'}`} />
             </button>
          </div>

          {/* Danger Zone */}
          <div className="pt-4 border-t border-red-100">
             <button 
                onClick={() => setShowConfirmReset(true)}
                className="w-full py-3 bg-red-50 text-red-600 rounded-xl font-bold border-2 border-red-100 hover:bg-red-100 flex items-center justify-center gap-2 transition-colors active:scale-95"
             >
                <Trash2 size={18} /> Xóa dữ liệu & Học lại
             </button>
          </div>

        </div>
      </div>

      <ConfirmModal 
        isOpen={showConfirmReset}
        message="Ba mẹ có chắc muốn xóa toàn bộ dữ liệu học tập của bé không? Hành động này không thể hoàn tác."
        onConfirm={onResetData}
        onCancel={() => setShowConfirmReset(false)}
        type="DANGER"
        confirmText="Xóa luôn"
      />
    </div>
  );
};
