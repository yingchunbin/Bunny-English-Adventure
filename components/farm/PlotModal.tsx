import React from 'react';
import { FarmPlot, Crop } from '../../types';
import { CROPS } from '../../data/farmData';
import { X, Lock, Droplets, Zap, Sprout, CloudRain, TrendingUp, Clock, Coins } from 'lucide-react';
import { Avatar } from '../Avatar';

interface PlotModalProps {
  plot: FarmPlot;
  inventory: any;
  waterDrops: number;
  fertilizers: number;
  userCoins: number;
  weather?: 'SUNNY' | 'RAINY';
  nextPlotCost: number;
  onAction: (action: 'PLANT' | 'WATER' | 'SING' | 'FERTILIZER' | 'HARVEST' | 'UNLOCK', data?: any) => void;
  onClose: () => void;
}

export const PlotModal: React.FC<PlotModalProps> = ({ plot, inventory, waterDrops, fertilizers, userCoins, weather, nextPlotCost, onAction, onClose }) => {
  const crop = plot.cropId ? CROPS.find(c => c.id === plot.cropId) : null;
  
  const now = Date.now();
  const elapsed = crop && plot.plantedAt ? (now - plot.plantedAt) / 1000 : 0;
  const progress = crop ? Math.min(100, (elapsed / crop.growthTime) * 100) : 0;
  const isReady = progress >= 100;
  const timeLeft = crop ? Math.max(0, Math.ceil(crop.growthTime - elapsed)) : 0;

  const formatTime = (seconds: number) => {
      const m = Math.floor(seconds / 60);
      const s = seconds % 60;
      return `${m}p ${s}s`;
  };

  const isPlotWatered = plot.isWatered || weather === 'RAINY';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-md animate-fadeIn">
        <div className="bg-white rounded-[3rem] w-full max-sm relative overflow-hidden border-8 border-emerald-100 shadow-2xl flex flex-col">
            <button onClick={onClose} className="absolute top-6 right-6 text-slate-300 hover:text-slate-500 z-10 transition-colors"><X size={28}/></button>
            
            {/* Header with Thầy Rùa */}
            <div className="bg-emerald-50 p-6 flex flex-col items-center border-b-4 border-emerald-100">
                <div className="mb-2"><Avatar emoji="🐢" bgGradient="bg-emerald-200" size="sm" /></div>
                <h3 className="text-xl font-black text-emerald-800 uppercase tracking-tighter">
                    {plot.isUnlocked ? (crop ? crop.name : "Ô đất màu mỡ") : "Khai phá đất mới"}
                </h3>
            </div>

            <div className="p-8">
                {/* LOCKED STATE */}
                {!plot.isUnlocked && (
                    <div className="flex flex-col items-center gap-6">
                        <div className="w-28 h-28 bg-slate-100 rounded-full flex items-center justify-center text-slate-300 border-4 border-white shadow-inner">
                            <Lock size={48} />
                        </div>
                        <p className="text-slate-500 text-center text-sm font-bold px-4 leading-relaxed">
                            Bé muốn mở thêm đất để trồng thật nhiều cây không? Thầy Rùa sẽ giúp bé!
                        </p>
                        <button 
                            onClick={() => onAction('UNLOCK')}
                            className={`w-full py-5 rounded-[2rem] font-black text-white flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl ${userCoins >= nextPlotCost ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-200' : 'bg-slate-300 cursor-not-allowed grayscale shadow-none'}`}
                        >
                            <TrendingUp size={24} /> MỞ ĐẤT ({nextPlotCost} <Coins size={18} fill="currentColor" className="text-white"/>)
                        </button>
                    </div>
                )}

                {/* EMPTY STATE */}
                {plot.isUnlocked && !crop && (
                    <div className="grid grid-cols-3 gap-3 max-h-[45vh] overflow-y-auto p-1 no-scrollbar">
                        {CROPS.filter(c => !c.isMagic || inventory[c.id] > 0).map(c => {
                            const count = inventory[c.id] || 0;
                            return (
                                <button 
                                    key={c.id}
                                    disabled={count === 0}
                                    onClick={() => onAction('PLANT', c.id)}
                                    className={`flex flex-col items-center p-4 rounded-3xl border-4 transition-all ${count > 0 ? 'border-white bg-emerald-50 hover:border-emerald-300 active:scale-90 shadow-sm' : 'opacity-40 grayscale'}`}
                                >
                                    <span className="text-4xl mb-2 drop-shadow-sm">{c.emoji}</span>
                                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${count > 0 ? 'bg-blue-500 text-white' : 'bg-slate-200'}`}>x{count}</span>
                                </button>
                            )
                        })}
                    </div>
                )}

                {/* GROWING STATE */}
                {plot.isUnlocked && crop && !isReady && (
                    <div className="flex flex-col gap-6">
                        <div className="flex flex-col items-center">
                            <div className="text-7xl mb-4 drop-shadow-xl animate-pulse">{crop.emoji}</div>
                            <div className="w-full h-6 bg-slate-100 rounded-full overflow-hidden border-2 border-slate-50 relative shadow-inner">
                                <div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all duration-1000" style={{ width: `${progress}%` }} />
                            </div>
                            <p className="text-[12px] text-slate-500 mt-2 font-black uppercase tracking-widest flex items-center gap-2">
                                <Clock size={14}/> {formatTime(timeLeft)}
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <button 
                                disabled={isPlotWatered}
                                onClick={() => onAction('WATER')}
                                className={`p-4 rounded-3xl flex flex-col items-center gap-2 font-black text-[10px] transition-all uppercase shadow-md ${isPlotWatered ? 'bg-blue-50 text-blue-300 border-2' : 'bg-blue-500 text-white'}`}
                            >
                                {weather === 'RAINY' ? <CloudRain size={28} /> : <Droplets size={28} />}
                                {weather === 'RAINY' ? "Đang mưa" : `Tưới (${waterDrops})`}
                            </button>
                            <button 
                                onClick={() => onAction('FERTILIZER')}
                                disabled={fertilizers === 0}
                                className={`p-4 rounded-3xl flex flex-col items-center gap-2 font-black text-[10px] transition-all uppercase shadow-lg ${fertilizers === 0 ? 'bg-slate-100 text-slate-300 grayscale' : 'bg-indigo-500 text-white'}`}
                            >
                                <Zap size={28} fill="currentColor" />
                                Bón phân ({fertilizers})
                            </button>
                        </div>
                    </div>
                )}

                {/* READY STATE */}
                {plot.isUnlocked && crop && isReady && (
                    <div className="flex flex-col items-center py-6">
                        <div className="text-9xl mb-8 animate-bounce drop-shadow-2xl">{crop.emoji}</div>
                        <button 
                            onClick={() => onAction('HARVEST')}
                            className="w-full py-6 bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-[2rem] font-black text-2xl shadow-2xl active:scale-95 flex items-center justify-center gap-4 uppercase tracking-wider"
                        >
                            <Sprout size={32} /> THU HOẠCH
                        </button>
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};