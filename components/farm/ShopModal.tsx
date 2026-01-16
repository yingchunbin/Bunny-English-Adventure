
import React, { useState } from 'react';
import { Crop, Decor } from '../../types';
import { ShoppingBasket, X, Lock, Star, Coins, Check, AlertCircle, Plus, Minus, ShoppingCart } from 'lucide-react';
import { playSFX } from '../../utils/sound';

interface ShopModalProps {
  crops: Crop[];
  decorations: Decor[];
  userState: any;
  onBuySeed: (crop: Crop, amount: number) => void;
  onBuyDecor: (decor: Decor) => void;
  onClose: () => void;
}

export const ShopModal: React.FC<ShopModalProps> = ({ crops, decorations, userState, onBuySeed, onBuyDecor, onClose }) => {
  const [tab, setTab] = useState<'SEEDS' | 'DECOR'>('SEEDS');
  const [amounts, setAmounts] = useState<Record<string, number>>({});
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const totalStars = Object.values(userState.levelStars || {}).reduce((a: any, b: any) => a + b, 0) as number;

  const showLocalError = (msg: string) => {
    setErrorMsg(msg);
    playSFX('wrong');
    setTimeout(() => setErrorMsg(null), 2000);
  };

  const adjustAmount = (id: string, delta: number) => {
    const current = amounts[id] || 1;
    const next = Math.max(1, current + delta);
    setAmounts({ ...amounts, [id]: next });
    playSFX('click');
  };

  const handleBuySeed = (crop: Crop) => {
    const amount = amounts[crop.id] || 1;
    const totalCost = crop.cost * amount;
    if (userState.coins < totalCost) {
      showLocalError("Bé không đủ đồng xu rồi!");
      return;
    }
    onBuySeed(crop, amount);
    setAmounts({ ...amounts, [crop.id]: 1 });
  };

  const handleBuyDecor = (decor: Decor) => {
    const isAffordable = decor.currency === 'COIN' ? userState.coins >= decor.cost : totalStars >= decor.cost;
    if (!isAffordable) {
      showLocalError(`Bé cần thêm ${decor.currency === 'COIN' ? 'Đồng xu' : 'Sao'}!`);
      return;
    }
    onBuyDecor(decor);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fadeIn">
        <div className="bg-white rounded-[3rem] w-full max-w-sm relative h-[85vh] flex flex-col overflow-hidden border-8 border-pink-200 shadow-2xl">
            
            {/* HUD Status Bar */}
            <div className="bg-pink-600 px-6 py-4 flex justify-between items-center text-white">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5 bg-black/20 px-3 py-1 rounded-full border border-white/20 shadow-inner">
                        <Coins size={14} fill="#fbbf24" className="text-yellow-400" />
                        <span className="font-black text-sm tabular-nums">{userState.coins}</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-black/20 px-3 py-1 rounded-full border border-white/20 shadow-inner">
                        <Star size={14} fill="#a855f7" className="text-purple-400" />
                        <span className="font-black text-sm tabular-nums">{totalStars}</span>
                    </div>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors"><X size={20}/></button>
            </div>

            {/* Header Content */}
            <div className="bg-pink-50 p-4 text-center border-b border-pink-100">
                <h2 className="text-xl font-black text-pink-700 uppercase tracking-tighter flex items-center justify-center gap-2">
                    <ShoppingBasket size={24}/> Cửa hàng
                </h2>
            </div>

            {/* Tabs */}
            <div className="flex p-3 gap-2 bg-pink-50/30">
                <button onClick={() => setTab('SEEDS')} className={`flex-1 py-3 rounded-2xl font-black text-xs transition-all ${tab === 'SEEDS' ? 'bg-pink-500 text-white shadow-lg' : 'bg-white text-pink-600 border border-pink-100'}`}>
                    HẠT GIỐNG
                </button>
                <button onClick={() => setTab('DECOR')} className={`flex-1 py-3 rounded-2xl font-black text-xs transition-all ${tab === 'DECOR' ? 'bg-pink-500 text-white shadow-lg' : 'bg-white text-pink-600 border border-pink-100'}`}>
                    TRANG TRÍ
                </button>
            </div>

            {/* Error Message Toast */}
            {errorMsg && (
                <div className="absolute top-32 left-1/2 -translate-x-1/2 z-[60] bg-rose-500 text-white px-6 py-2 rounded-full font-black text-[11px] shadow-xl animate-bounce flex items-center gap-2 border-2 border-white">
                    <AlertCircle size={16}/> {errorMsg}
                </div>
            )}

            <div className="flex-1 overflow-y-auto p-4 no-scrollbar bg-pink-50/10">
                {tab === 'SEEDS' && (
                    <div className="flex flex-col gap-4">
                        {crops.map(crop => {
                            if (crop.isMagic) return null;
                            const isLocked = (userState.completedLevels?.length || 0) < (crop.unlockReq || 0);
                            const amount = amounts[crop.id] || 1;
                            const totalCost = crop.cost * amount;
                            const canAfford = userState.coins >= totalCost;
                            const currentOwned = userState.inventory[crop.id] || 0;
                            
                            return (
                                <div key={crop.id} className={`bg-white p-4 rounded-[2rem] border-4 flex items-center gap-4 relative transition-all shadow-sm ${isLocked ? 'opacity-60 grayscale border-slate-200' : 'border-pink-50'}`}>
                                    <div className="text-6xl drop-shadow-md select-none">{crop.emoji}</div>
                                    
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start">
                                            <div className="font-black text-slate-800 text-sm uppercase tracking-tighter truncate">{crop.name}</div>
                                            {currentOwned > 0 && <span className="text-[9px] font-bold text-pink-500 bg-pink-50 px-2 py-0.5 rounded-lg border border-pink-100">Đang có: {currentOwned}</span>}
                                        </div>
                                        <div className="flex items-center gap-1 text-[10px] font-bold text-amber-600 mb-2">
                                            <Coins size={10} fill="currentColor"/> {crop.cost} / hạt
                                        </div>
                                        
                                        {!isLocked ? (
                                            <div className="flex items-center gap-3">
                                                <div className="flex items-center bg-slate-100 rounded-xl p-1 border border-slate-200 shadow-inner">
                                                    <button onClick={() => adjustAmount(crop.id, -1)} className="p-1.5 hover:bg-white rounded-lg text-pink-600 transition-colors"><Minus size={14}/></button>
                                                    <span className="w-8 text-center font-black text-slate-700 text-sm">{amount}</span>
                                                    <button onClick={() => adjustAmount(crop.id, 1)} className="p-1.5 hover:bg-white rounded-lg text-pink-600 transition-colors"><Plus size={14}/></button>
                                                </div>
                                                <button 
                                                    onClick={() => handleBuySeed(crop)}
                                                    className={`flex-1 py-2 rounded-xl font-black text-[10px] uppercase shadow-md transition-all active:scale-95 flex items-center justify-center gap-1 ${canAfford ? 'bg-pink-500 text-white' : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'}`}
                                                >
                                                    <ShoppingCart size={12}/> {totalCost}
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="bg-slate-100 text-slate-400 py-1.5 px-3 rounded-lg flex items-center gap-2 text-[9px] font-black uppercase w-fit border border-slate-200">
                                                <Lock size={10}/> Hoàn thành {crop.unlockReq} bài học
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}

                {tab === 'DECOR' && (
                    <div className="flex flex-col gap-3">
                        {decorations.map(decor => {
                            const owned = userState.decorations?.includes(decor.id);
                            const canAfford = decor.currency === 'COIN' ? userState.coins >= decor.cost : totalStars >= decor.cost;
                            const currencyIcon = decor.currency === 'COIN' ? <Coins size={12} fill="currentColor"/> : <Star size={12} fill="currentColor"/>;
                            const currencyColor = decor.currency === 'COIN' ? 'text-amber-600' : 'text-purple-600';
                            
                            return (
                                <button 
                                    key={decor.id} 
                                    disabled={owned}
                                    onClick={() => handleBuyDecor(decor)}
                                    className={`flex items-center gap-4 p-4 border-4 rounded-[2rem] transition-all text-left bg-white shadow-sm ${owned ? 'border-green-200 opacity-60' : canAfford ? 'border-pink-100 hover:border-pink-400' : 'border-red-100'}`}
                                >
                                    <div className="text-5xl drop-shadow-sm select-none">{decor.emoji}</div>
                                    <div className="flex-1">
                                        <h4 className="font-black text-slate-800 text-sm uppercase tracking-tighter">{decor.name}</h4>
                                        <p className="text-[10px] text-slate-400 font-bold leading-tight">{decor.description}</p>
                                    </div>
                                    {owned ? <div className="bg-green-100 text-green-600 p-2 rounded-full border-2 border-green-200"><Check size={20} /></div> : (
                                        <div className={`px-4 py-2 rounded-2xl font-black text-xs flex items-center gap-2 shadow-sm ${canAfford ? currencyColor + ' bg-slate-50 border border-slate-100' : 'text-red-400 bg-red-50 border border-red-100'}`}>
                                            {decor.cost} {currencyIcon}
                                        </div>
                                    )}
                                </button>
                            )
                        })}
                    </div>
                )}
            </div>

            <div className="p-4 bg-white border-t border-pink-50 text-center">
                <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Gieo hạt chăm chỉ để mua thêm nhiều đồ mới nhé!</p>
            </div>
        </div>
    </div>
  );
};
