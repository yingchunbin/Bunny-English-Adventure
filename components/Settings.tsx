
import React from 'react';
import { UserState } from '../types';
import { Volume2, VolumeX, Battery, BatteryCharging, Trash2, X, User, Music } from 'lucide-react';

interface SettingsProps {
  userState: UserState;
  onUpdateSettings: (settings: any) => void;
  onResetData: () => void;
  onClose: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ userState, onUpdateSettings, onResetData, onClose }) => {
  const { settings } = userState;

  const handleVolumeChange = (type: 'sfx' | 'bgm', val: string) => {
    const value = parseFloat(val);
    if (type === 'sfx') onUpdateSettings({ ...settings, sfxVolume: value });
    else onUpdateSettings({ ...settings, bgmVolume: value });
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border-4 border-slate-100">
        
        <div className="bg-slate-50 p-4 flex justify-between items-center border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-700 flex items-center gap-2">
            <span className="text-2xl">⚙️</span> Cài Đặt
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><X size={24} className="text-slate-500"/></button>
        </div>

        <div className="p-6 space-y-6">
          
          {/* Profile Section */}
          <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
             <h3 className="font-bold text-blue-800 mb-3 flex items-center gap-2"><User size={18}/> Hồ Sơ Bé</h3>
             <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-blue-600 uppercase tracking-wider">Tên hiển thị</label>
                <input 
                    type="text" 
                    value={settings?.userName || ''} 
                    onChange={(e) => onUpdateSettings({ ...settings, userName: e.target.value })}
                    placeholder="Nhập tên bé..."
                    className="w-full p-3 rounded-xl border-2 border-blue-200 focus:border-blue-400 outline-none text-slate-900 bg-white font-black text-lg placeholder-slate-300 shadow-inner transition-all"
                />
             </div>
          </div>

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

          {/* Performance */}
          <div className="flex items-center justify-between py-2 border-t border-slate-100 pt-4">
             <div className="flex items-center gap-2">
                {settings?.lowPerformance ? <Battery className="text-orange-500"/> : <BatteryCharging className="text-green-500"/>}
                <span className="text-sm font-bold text-slate-600">Chế độ tiết kiệm pin</span>
             </div>
             <button 
                onClick={() => onUpdateSettings({ ...settings, lowPerformance: !settings?.lowPerformance })}
                className={`w-12 h-6 rounded-full transition-colors relative ${settings?.lowPerformance ? 'bg-green-500' : 'bg-slate-300'}`}
             >
                <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all shadow-sm ${settings?.lowPerformance ? 'left-7' : 'left-1'}`} />
             </button>
          </div>

          {/* Danger Zone */}
          <div className="pt-4 border-t border-red-100">
             <button 
                onClick={() => {
                    if(confirm("Ba mẹ có chắc muốn xóa toàn bộ dữ liệu học tập của bé không? Hành động này không thể hoàn tác.")) {
                        onResetData();
                    }
                }}
                className="w-full py-3 bg-red-50 text-red-600 rounded-xl font-bold border-2 border-red-100 hover:bg-red-100 flex items-center justify-center gap-2 transition-colors active:scale-95"
             >
                <Trash2 size={18} /> Xóa dữ liệu & Học lại
             </button>
          </div>

        </div>
      </div>
    </div>
  );
};
