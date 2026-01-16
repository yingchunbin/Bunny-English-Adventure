
import React from 'react';
import { AnimalItem, Crop, Product } from '../../types';
import { X, Lock, Clock, ArrowRight, Info, Star, Coins } from 'lucide-react';
import { Avatar } from '../Avatar';

interface AnimalShopModalProps {
  animals: AnimalItem[];
  crops: (Crop | Product)[];
  products: Product[];
  userLevel: number; // This is farmLevel
  userCoins: number;
  onBuy: (animal: AnimalItem) => void;
  onClose: () => void;
}

export const AnimalShopModal: React.FC<AnimalShopModalProps> = ({ animals, crops, products, userLevel, userCoins, onBuy, onClose }) => {
  
  // Sort animals: Unlocked first -> Min Level -> Cost
  const sortedAnimals = [...animals].sort((a, b) => {
      const levelA = a.minLevel || 0;
      const levelB = b.minLevel || 0;
      const lockedA = userLevel < levelA;
      const lockedB = userLevel < levelB;

      if (lockedA !== lockedB) return lockedA ? 1 : -1;
      if (levelA !== levelB) return levelA - levelB;
      return a.cost - b.cost;
  });

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-fadeIn">
        <div className="bg-white rounded-[2.5rem] w-full max-w-md relative border-8 border-orange-200 shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
            
            {/* Header */}
            <div className="bg-orange-100 p-4 flex items-center justify-between border-b-2 border-orange-200">
                <div className="flex items-center gap-3">
                    <div className="bg-white p-2 rounded-full shadow-sm"><span className="text-2xl">🐮</span></div>
                    <div>
                        <h3 className="text-lg font-black text-orange-800 uppercase tracking-tight">Cửa hàng Thú Nuôi</h3>
                        <p className="text-[10px] font-bold text-orange-500">Nuôi lớn để thu hoạch sản phẩm</p>
                    </div>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-orange-200 rounded-full transition-colors text-orange-600"><X size={24} /></button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-orange-50/30 no-scrollbar">
                {sortedAnimals.map(animal => {
                    const isLocked = userLevel < (animal.minLevel || 0);
                    const feedItem = [...crops, ...products].find(c => c.id === animal.feedCropId);
                    const produceItem = [...crops, ...products].find(p => p.id === animal.produceId);
                    const canAfford = userCoins >= animal.cost;
                    const currency = animal.currency || 'COIN';

                    return (
                        <div key={animal.id} className={`bg-white rounded-3xl p-4 border-4 relative transition-all ${isLocked ? 'border-slate-200 opacity-70 grayscale-[0.5]' : 'border-orange-100 hover:border-orange-300 shadow-md'}`}>
                            
                            <div className="flex gap-4">
                                {/* Left: Image */}
                                <div className="flex flex-col items-center justify-center gap-2 min-w-[80px]">
                                    <div className="text-6xl drop-shadow-sm">{animal.emoji}</div>
                                    <div className="text-xs font-black text-slate-700 text-center">{animal.name}</div>
                                </div>

                                {/* Right: Info */}
                                <div className="flex-1 flex flex-col gap-2">
                                    {/* Info Box */}
                                    <div className="bg-orange-50 rounded-xl p-2 border border-orange-100 flex flex-col gap-1.5">
                                        {/* Feed Row */}
                                        <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                                            <span className="text-[10px] uppercase text-slate-400 w-8">Ăn:</span>
                                            <div className="flex items-center gap-1 bg-white px-2 py-0.5 rounded-lg border border-slate-100 shadow-sm">
                                                <span>{feedItem?.emoji}</span>
                                                <span className="text-blue-600">x{animal.feedAmount}</span>
                                            </div>
                                            <span className="text-[10px] text-slate-400 truncate max-w-[60px]">{feedItem?.name}</span>
                                        </div>

                                        {/* Produce Row */}
                                        <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                                            <span className="text-[10px] uppercase text-slate-400 w-8">Đẻ:</span>
                                            <div className="flex items-center gap-1 bg-white px-2 py-0.5 rounded-lg border border-slate-100 shadow-sm">
                                                <span>{produceItem?.emoji}</span>
                                            </div>
                                            <span className="flex items-center gap-1 text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-md"><Clock size={8}/> {Math.ceil(animal.produceTime / 60)}p</span>
                                        </div>
                                    </div>

                                    {/* Action Button */}
                                    {isLocked ? (
                                        <div className="mt-auto bg-slate-100 text-slate-400 py-2 rounded-xl flex items-center justify-center gap-2 text-xs font-black uppercase">
                                            <Lock size={12}/> Mở khóa Lv {animal.minLevel}
                                        </div>
                                    ) : (
                                        <button 
                                            onClick={() => onBuy(animal)}
                                            disabled={!canAfford}
                                            className={`mt-auto w-full py-2 rounded-xl font-black text-sm shadow-md flex items-center justify-center gap-1 transition-all active:scale-95 ${canAfford ? 'bg-orange-500 text-white hover:bg-orange-600' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
                                        >
                                            {animal.cost} {currency === 'STAR' ? <Star size={12} fill="currentColor"/> : <Coins size={12} fill="currentColor"/>} Mua ngay
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    </div>
  );
};
