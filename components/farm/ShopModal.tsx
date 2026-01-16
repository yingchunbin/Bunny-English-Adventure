
import React, { useState } from 'react';
import { Crop, Decor, AnimalItem, MachineItem } from '../../types';
import { X, Coins, Plus, Minus, Sprout, Bird, Factory, Armchair, Search, Clock, Lock } from 'lucide-react';

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
          <div key={item.id} className={`bg-white p-4 rounded-3xl border-4 relative transition-all shadow-sm flex gap-4 ${isLocked ? 'border-slate-200 opacity-70 grayscale' : 'border-blue-50 hover:border-blue-200'}`}>
              
              {/* Left: Image & Badge */}
              <div className="flex flex-col items-center justify-center min-w-[80px]">
                  <div className="w-20 h-20 bg-slate-50 rounded-2xl flex items-center justify-center text-5xl shadow-inner mb-2 border-2 border-slate-100">
                      {item.emoji}
                  </div>
                  {isLocked && <div className="bg-slate-200 px-2 py-1 rounded text-[10px] font-bold text-slate-500 flex items-center gap-1"><Lock size={10}/> Lv {item.unlockReq || item.minLevel}</div>}
              </div>

              {/* Right: Info & Actions */}
              <div className="flex-1 flex flex-col justify-between min-w-0">
                  <div>
                      <div className="flex justify-between items-start">
                          <h3 className="font-black text-slate-800 text-lg leading-tight truncate">{item.name}</h3>
                          <div className="flex items-center gap-1 text-amber-600 bg-amber-50 px-2 py-1 rounded-lg border border-amber-100">
                              <Coins size={12} fill="currentColor"/> <span className="font-black text-xs">{item.cost}</span>
                          </div>
                      </div>
                      
                      {/* Detailed Stats */}
                      <div className="mt-2 space-y-1">
                          {item.growthTime && (
                              <div className="flex items-center gap-2 text-xs text-slate-500 font-bold">
                                  <Clock size={12}/> <span>{Math.ceil(item.growthTime / 60)} phút</span>
                              </div>
                          )}
                          {item.produceTime && (
                              <div className="flex items-center gap-2 text-xs text-slate-500 font-bold">
                                  <Clock size={12}/> <span>Thu hoạch mỗi {Math.ceil(item.produceTime / 60)}p</span>
                              </div>
                          )}
                          {item.sellPrice && (
                              <div className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded w-fit">
                                  Bán: {item.sellPrice} xu
                              </div>
                          )}
                      </div>
                  </div>

                  {/* Buy Controls */}
                  {!isLocked && (
                      <div className="mt-3 flex items-center gap-2">
                          {tab === 'SEEDS' && (
                              <div className="flex items-center bg-slate-100 rounded-xl px-1 h-10 border border-slate-200">
                                  <button onClick={() => setAmount(item.id, amount - 1)} className="p-2 hover:bg-white rounded-lg text-blue-600 transition-colors"><Minus size={14}/></button>
                                  <span className="w-8 text-center font-black text-sm">{amount}</span>
                                  <button onClick={() => setAmount(item.id, amount + 1)} className="p-2 hover:bg-white rounded-lg text-blue-600 transition-colors"><Plus size={14}/></button>
                              </div>
                          )}
                          <button 
                              onClick={() => onBuyItem(item, amount)}
                              disabled={!canAfford}
                              className={`flex-1 h-10 rounded-xl font-black text-xs uppercase shadow-md active:scale-95 flex items-center justify-center gap-1 transition-all ${canAfford ? 'bg-blue-500 text-white hover:bg-blue-600 shadow-blue-200' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
                          >
                              {canAfford ? 'Mua Ngay' : 'Thiếu Tiền'}
                          </button>
                      </div>
                  )}
              </div>
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
        <div className="bg-[#F8FAFC] rounded-[2.5rem] w-full max-w-lg h-[90vh] flex flex-col overflow-hidden border-8 border-white shadow-2xl relative">
            
            {/* Header */}
            <div className="bg-white px-6 py-4 flex justify-between items-center shadow-sm z-10 border-b border-slate-100">
                <div className="flex items-center gap-2">
                    <span className="text-2xl">🏪</span>
                    <div>
                        <h2 className="font-black text-xl text-slate-800 uppercase tracking-tight">Siêu Thị</h2>
                        <div className="flex items-center gap-1 text-amber-600 font-bold text-xs bg-amber-50 px-2 py-0.5 rounded-full w-fit">
                            <Coins size={12} fill="currentColor"/> {userState.coins}
                        </div>
                    </div>
                </div>
                <button onClick={onClose} className="bg-slate-100 p-2.5 rounded-full hover:bg-slate-200 text-slate-500 transition-colors"><X size={20}/></button>
            </div>

            {/* Search */}
            <div className="px-4 py-3 bg-white border-b border-slate-100">
                <div className="bg-slate-100 rounded-2xl flex items-center px-4 py-3 gap-2 border border-slate-200 focus-within:border-blue-400 transition-colors">
                    <Search size={18} className="text-slate-400"/>
                    <input 
                        className="bg-transparent outline-none text-sm font-bold text-slate-700 w-full placeholder:text-slate-400" 
                        placeholder="Tìm kiếm vật phẩm..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Tabs */}
            <div className="flex p-2 gap-2 overflow-x-auto no-scrollbar bg-white shrink-0 shadow-sm border-b border-slate-100">
                {[
                    { id: 'SEEDS', label: 'Hạt Giống', icon: Sprout },
                    { id: 'ANIMALS', label: 'Vật Nuôi', icon: Bird },
                    { id: 'MACHINES', label: 'Máy Móc', icon: Factory },
                    { id: 'DECOR', label: 'Trang Trí', icon: Armchair },
                ].map(t => (
                    <button
                        key={t.id}
                        onClick={() => setTab(t.id as ShopTab)}
                        className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-black text-xs whitespace-nowrap transition-all ${tab === t.id ? 'bg-blue-500 text-white shadow-lg shadow-blue-200' : 'bg-slate-50 text-slate-500 hover:bg-slate-100 border border-transparent'}`}
                    >
                        <t.icon size={14}/> {t.label}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 bg-slate-50">
                <div className="flex flex-col gap-3 pb-20">
                    {getActiveData().map(renderItemCard)}
                </div>
            </div>
        </div>
    </div>
  );
};
