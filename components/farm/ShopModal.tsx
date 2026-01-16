
import React, { useState } from 'react';
import { Crop, Decor, AnimalItem, MachineItem } from '../../types';
import { X, Coins, Plus, Minus, Sprout, Bird, Factory, Armchair, Search } from 'lucide-react';

interface ShopModalProps {
  crops: Crop[];
  animals: AnimalItem[];
  machines: MachineItem[];
  decorations: Decor[];
  userState: any;
  onBuyItem: (item: any, amount: number) => void;
  onClose: () => void;
}

type ShopTab = 'SEEDS' | 'ANIMALS' | 'MACHINES' | 'DECOR';

export const ShopModal: React.FC<ShopModalProps> = ({ crops, animals, machines, decorations, userState, onBuyItem, onClose }) => {
  const [tab, setTab] = useState<ShopTab>('SEEDS');
  const [amounts, setAmounts] = useState<Record<string, number>>({});
  const [searchTerm, setSearchTerm] = useState('');

  const getAmount = (id: string) => amounts[id] || 1;
  const setAmount = (id: string, val: number) => setAmounts(prev => ({...prev, [id]: Math.max(1, val)}));

  const renderItemCard = (item: any) => {
      const isLocked = (userState.completedLevels?.length || 0) < (item.unlockReq || item.minLevel || 0);
      const amount = getAmount(item.id);
      const totalCost = item.cost * amount;
      const canAfford = userState.coins >= totalCost;
      
      return (
          <div key={item.id} className={`bg-white p-3 rounded-2xl border-2 flex flex-col gap-2 relative transition-all shadow-sm ${isLocked ? 'opacity-60 grayscale border-slate-200' : 'border-blue-50 hover:border-blue-200'}`}>
              <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-xl bg-slate-50 flex items-center justify-center text-4xl shadow-inner select-none">
                      {item.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                      <div className="font-black text-slate-800 text-sm truncate">{item.name}</div>
                      <div className="text-[10px] text-slate-400 line-clamp-1">{item.description || `Cấp độ ${item.unlockReq || item.minLevel}`}</div>
                      <div className="flex items-center gap-1 text-xs font-black text-amber-600 mt-1">
                          <Coins size={12} fill="currentColor"/> {item.cost}
                      </div>
                  </div>
              </div>

              {!isLocked ? (
                  <div className="flex items-center gap-2 mt-auto">
                      {tab === 'SEEDS' && (
                          <div className="flex items-center bg-slate-100 rounded-lg px-1 h-8 border border-slate-200">
                              <button onClick={() => setAmount(item.id, amount - 1)} className="p-1 hover:bg-white rounded text-blue-600"><Minus size={12}/></button>
                              <span className="w-6 text-center font-bold text-xs">{amount}</span>
                              <button onClick={() => setAmount(item.id, amount + 1)} className="p-1 hover:bg-white rounded text-blue-600"><Plus size={12}/></button>
                          </div>
                      )}
                      <button 
                          onClick={() => onBuyItem(item, amount)}
                          disabled={!canAfford}
                          className={`flex-1 h-8 rounded-lg font-black text-[10px] uppercase shadow-sm active:scale-95 flex items-center justify-center gap-1 ${canAfford ? 'bg-blue-500 text-white hover:bg-blue-600' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
                      >
                          {canAfford ? 'Mua ngay' : 'Thiếu tiền'}
                      </button>
                  </div>
              ) : (
                  <div className="mt-auto bg-slate-100 text-slate-400 py-1.5 rounded-lg flex items-center justify-center gap-2 text-[10px] font-black uppercase">
                      Khóa (Lv {item.unlockReq || item.minLevel})
                  </div>
              )}
          </div>
      );
  };

  const getActiveData = () => {
      let data: any[] = [];
      if (tab === 'SEEDS') data = crops.filter(c => !c.isMagic);
      if (tab === 'ANIMALS') data = animals;
      if (tab === 'MACHINES') data = machines;
      if (tab === 'DECOR') data = decorations;
      
      return data.filter(i => i.name.toLowerCase().includes(searchTerm.toLowerCase()));
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fadeIn">
        <div className="bg-[#F0F9FF] rounded-[2.5rem] w-full max-w-lg h-[90vh] flex flex-col overflow-hidden border-8 border-white shadow-2xl relative">
            
            {/* Header */}
            <div className="bg-white px-6 py-4 flex justify-between items-center shadow-sm z-10">
                <h2 className="font-black text-xl text-blue-600 uppercase tracking-tighter">Siêu Thị Nông Trại</h2>
                <button onClick={onClose} className="bg-slate-100 p-2 rounded-full hover:bg-slate-200 text-slate-500 transition-colors"><X size={20}/></button>
            </div>

            {/* Search & Stats */}
            <div className="px-4 py-3 bg-white border-b border-slate-100 flex gap-3 items-center">
                <div className="flex-1 bg-slate-100 rounded-xl flex items-center px-3 py-2 gap-2">
                    <Search size={16} className="text-slate-400"/>
                    <input 
                        className="bg-transparent outline-none text-sm font-bold text-slate-600 w-full placeholder:text-slate-400" 
                        placeholder="Tìm kiếm..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="bg-amber-100 text-amber-700 px-3 py-2 rounded-xl font-black text-xs flex items-center gap-1 border border-amber-200">
                    <Coins size={14} fill="currentColor"/> {userState.coins}
                </div>
            </div>

            {/* Tabs */}
            <div className="flex p-2 gap-2 overflow-x-auto no-scrollbar bg-white shrink-0 shadow-sm">
                {[
                    { id: 'SEEDS', label: 'Hạt Giống', icon: Sprout },
                    { id: 'ANIMALS', label: 'Vật Nuôi', icon: Bird },
                    { id: 'MACHINES', label: 'Máy Móc', icon: Factory },
                    { id: 'DECOR', label: 'Trang Trí', icon: Armchair },
                ].map(t => (
                    <button
                        key={t.id}
                        onClick={() => setTab(t.id as ShopTab)}
                        className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-black text-xs whitespace-nowrap transition-all ${tab === t.id ? 'bg-blue-500 text-white shadow-lg shadow-blue-200' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
                    >
                        <t.icon size={14}/> {t.label}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 bg-slate-50">
                <div className="grid grid-cols-2 gap-3 pb-20">
                    {getActiveData().map(renderItemCard)}
                </div>
            </div>
        </div>
    </div>
  );
};
