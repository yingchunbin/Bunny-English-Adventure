
import React, { useState } from 'react';
import { Crop, Product, FarmItem, AnimalItem, MachineItem } from '../../types';
import { Package, X, Sprout, Egg, Hammer, Coins, Sparkles, ArrowRight, ShoppingBasket } from 'lucide-react';
import { playSFX } from '../../utils/sound';

interface InventoryModalProps {
  inventory: Record<string, number>; // Seeds
  harvested: Record<string, number>; // Crops/Products
  seeds: Crop[];
  animals: AnimalItem[]; 
  products: (Crop | Product)[];
  
  mode: 'VIEW' | 'SELECT_SEED'; 
  onSelectSeed?: (seedId: string) => void;
  onSell?: (itemId: string, amount: number) => void;
  onClose: () => void;
  onGoToShop?: () => void; 
}

type Tab = 'SEEDS' | 'PRODUCE';

export const InventoryModal: React.FC<InventoryModalProps> = ({ 
    inventory, harvested, seeds, products, mode, onSelectSeed, onSell, onClose, onGoToShop 
}) => {
  const [activeTab, setActiveTab] = useState<Tab>(mode === 'SELECT_SEED' ? 'SEEDS' : 'PRODUCE');

  // Helper to render an item row
  const renderItemRow = (item: FarmItem, count: number, isSeed: boolean) => {
      // In select mode, show seeds even if 0 count to prompt buying
      // In VIEW mode, only show owned items
      if (mode === 'VIEW' && count <= 0) return null; 

      return (
          <div key={item.id} className="bg-white border-4 border-slate-100 rounded-3xl p-3 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3">
                  <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-3xl border border-slate-200">
                      {item.emoji}
                  </div>
                  <div>
                      <div className="font-black text-slate-700 text-sm uppercase">{item.name}</div>
                      <div className="text-xs font-bold text-slate-400">Số lượng: <span className={count > 0 ? "text-blue-600" : "text-red-500"}>{count}</span></div>
                  </div>
              </div>

              {/* Actions based on Mode */}
              {mode === 'SELECT_SEED' && isSeed ? (
                  count > 0 ? (
                      <button 
                          onClick={() => onSelectSeed && onSelectSeed(item.id)}
                          className="bg-green-500 text-white px-4 py-2 rounded-xl font-black text-xs uppercase shadow-md active:scale-95 transition-all"
                      >
                          Gieo hạt
                      </button>
                  ) : (
                      <button 
                          onClick={onGoToShop}
                          className="bg-amber-500 text-white px-4 py-2 rounded-xl font-black text-xs uppercase shadow-md active:scale-95 transition-all flex items-center gap-1"
                      >
                          Mua thêm
                      </button>
                  )
              ) : mode === 'VIEW' && count > 0 ? (
                  <div className="flex gap-1 items-center bg-slate-100 px-3 py-1 rounded-xl">
                      <span className="text-[10px] font-black text-slate-400">Giá bán: { (item as any).sellPrice }</span>
                      <Coins size={10} className="text-amber-500"/>
                  </div>
              ) : null}
          </div>
      );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-fadeIn">
        <div className="bg-white rounded-[2.5rem] w-full max-w-md h-[80vh] flex flex-col overflow-hidden border-8 border-slate-200 shadow-2xl relative">
            
            {/* Header */}
            <div className="bg-slate-100 p-4 flex justify-between items-center border-b-2 border-slate-200">
                <div className="flex items-center gap-2">
                    <Package size={24} className="text-slate-600"/>
                    <h2 className="text-xl font-black text-slate-700 uppercase tracking-tight">Túi Đồ</h2>
                </div>
                <div className="flex gap-2">
                    {onGoToShop && (
                        <button onClick={onGoToShop} className="bg-pink-500 text-white px-3 py-1.5 rounded-xl font-bold text-xs shadow-sm active:scale-95 flex items-center gap-1">
                            <ShoppingBasket size={14}/> Shop
                        </button>
                    )}
                    <button onClick={onClose} className="p-2 bg-white rounded-full text-slate-400 hover:text-slate-600 shadow-sm"><X size={20}/></button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex p-2 gap-2 bg-slate-50">
                <button onClick={() => setActiveTab('SEEDS')} className={`flex-1 py-2 rounded-xl font-black text-xs flex flex-col items-center gap-1 transition-all ${activeTab === 'SEEDS' ? 'bg-green-500 text-white shadow-md' : 'bg-white text-slate-400'}`}>
                    <Sprout size={16}/> Hạt Giống
                </button>
                <button onClick={() => setActiveTab('PRODUCE')} className={`flex-1 py-2 rounded-xl font-black text-xs flex flex-col items-center gap-1 transition-all ${activeTab === 'PRODUCE' ? 'bg-orange-500 text-white shadow-md' : 'bg-white text-slate-400'}`}>
                    <Egg size={16}/> Nông Sản
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
                
                {activeTab === 'SEEDS' && (
                    <>
                        {seeds.filter(s => !s.isMagic).map(seed => renderItemRow(seed, inventory[seed.id] || 0, true))}
                        {/* Always show option to buy more if empty list or just at bottom */}
                        <button onClick={onGoToShop} className="w-full py-3 bg-white border-2 border-dashed border-slate-300 rounded-2xl text-slate-400 font-bold flex items-center justify-center gap-2 hover:bg-slate-50 mt-4">
                            Đến Cửa Hàng mua thêm hạt giống <ArrowRight size={16}/>
                        </button>
                    </>
                )}

                {activeTab === 'PRODUCE' && (
                    <>
                        {products.map(p => {
                            const count = harvested[p.id] || 0;
                            return renderItemRow(p, count, false);
                        })}
                        {Object.values(harvested).reduce((a,b)=>a+b, 0) === 0 && (
                            <div className="text-center py-10 text-slate-400 font-bold text-sm">Chưa có nông sản nào!</div>
                        )}
                    </>
                )}
            </div>
        </div>
    </div>
  );
};
