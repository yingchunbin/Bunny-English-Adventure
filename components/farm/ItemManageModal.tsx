
import React from 'react';
import { FarmItem } from '../../types';
import { X, Package, Trash2, Coins, ArrowRight } from 'lucide-react';
import { playSFX } from '../../utils/sound';

interface ItemManageModalProps {
  item: FarmItem;
  onStore: () => void;
  onSell: () => void;
  onClose: () => void;
}

export const ItemManageModal: React.FC<ItemManageModalProps> = ({ item, onStore, onSell, onClose }) => {
  const sellPrice = Math.floor(item.cost / 2);

  const handleStore = () => {
      playSFX('click');
      onStore();
  };

  const handleSell = () => {
      playSFX('coins');
      onSell();
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fadeIn">
        <div className="bg-white rounded-[2.5rem] w-full max-w-sm p-6 shadow-2xl border-4 border-slate-100 relative overflow-hidden">
            <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors"><X size={20} className="text-slate-500"/></button>
            
            <div className="flex flex-col items-center mb-6">
                <div className="text-8xl mb-4 drop-shadow-md animate-bounce-slow">{item.emoji}</div>
                <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight text-center">{item.name}</h3>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Quản lý vật phẩm</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
                {/* Store Button */}
                <button 
                    onClick={handleStore}
                    className="flex flex-col items-center justify-center gap-2 bg-blue-50 hover:bg-blue-100 border-2 border-blue-200 p-4 rounded-3xl transition-all active:scale-95 group"
                >
                    <div className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <Package size={24} />
                    </div>
                    <div className="text-center">
                        <div className="font-black text-blue-600 text-sm uppercase">Cất vào túi</div>
                        <div className="text-[10px] text-blue-400 font-bold">Để dùng sau</div>
                    </div>
                </button>

                {/* Sell Button */}
                <button 
                    onClick={handleSell}
                    className="flex flex-col items-center justify-center gap-2 bg-red-50 hover:bg-red-100 border-2 border-red-200 p-4 rounded-3xl transition-all active:scale-95 group"
                >
                    <div className="w-12 h-12 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <Trash2 size={24} />
                    </div>
                    <div className="text-center">
                        <div className="font-black text-red-600 text-sm uppercase">Bán lại</div>
                        <div className="text-[10px] text-red-400 font-bold flex items-center justify-center gap-1">
                            +{sellPrice} <Coins size={10} fill="currentColor"/>
                        </div>
                    </div>
                </button>
            </div>

            <div className="mt-6 text-center">
                <p className="text-[10px] text-slate-400 italic">
                    *Lưu ý: Bán lại chỉ nhận được 50% giá trị gốc.
                </p>
            </div>
        </div>
    </div>
  );
};
