
import React, { useState } from 'react';
import { Crop, Product, FarmOrder } from '../../types';
import { Warehouse, X, Coins, Sparkles, Sprout, Egg, AlertTriangle, Truck, Trash } from 'lucide-react';

interface BarnModalProps {
  crops: (Crop | Product)[];
  harvested: any;
  activeOrders: FarmOrder[];
  onSell: (cropId: string) => void;
  onSellAll: (cropId: string) => void;
  onSellEverything: () => void;
  onClose: () => void;
}

export const BarnModal: React.FC<BarnModalProps> = ({ crops, harvested, activeOrders, onSell, onSellAll, onSellEverything, onClose }) => {
  const [activeTab, setActiveTab] = useState<'CROPS' | 'PRODUCTS'>('CROPS');
  const [confirmSellAll, setConfirmSellAll] = useState(false);

  // Helper: Kiểm tra xem vật phẩm có đang cần cho đơn hàng không
  const isNeededForOrder = (itemId: string) => {
      return activeOrders.some(order => order.requirements.some(req => req.cropId === itemId));
  };

  // Filter items logic
  const filteredItems = crops.filter(item => {
      const hasStock = (harvested?.[item.id] || 0) > 0;
      if (!hasStock) return false;
      if (activeTab === 'CROPS') return item.type === 'CROP';
      if (activeTab === 'PRODUCTS') return item.type === 'PRODUCT';
      return false;
  });

  const hasItems = filteredItems.length > 0;
  const totalValue = filteredItems.reduce((acc, item) => acc + (item.sellPrice * (harvested[item.id] || 0)), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fadeIn">
        <div className="bg-white rounded-[3rem] w-full max-w-md relative border-8 border-emerald-100 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="bg-gradient-to-r from-emerald-500 to-emerald-700 p-6 text-white text-center relative">
                <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"><X size={24}/></button>
                <h3 className="text-2xl font-black flex items-center justify-center gap-3 uppercase tracking-tighter">
                    <Warehouse size={32} /> Kho nông sản
                </h3>
            </div>
            
            {/* Tabs */}
            <div className="flex bg-emerald-50 p-2 gap-2">
                <button 
                  onClick={() => setActiveTab('CROPS')}
                  className={`flex-1 py-3 rounded-2xl flex items-center justify-center gap-2 font-black text-xs transition-all ${activeTab === 'CROPS' ? 'bg-emerald-500 text-white shadow-md' : 'text-emerald-600 hover:bg-emerald-100'}`}
                >
                    <Sprout size={16} /> NÔNG SẢN
                </button>
                <button 
                  onClick={() => setActiveTab('PRODUCTS')}
                  className={`flex-1 py-3 rounded-2xl flex items-center justify-center gap-2 font-black text-xs transition-all ${activeTab === 'PRODUCTS' ? 'bg-emerald-500 text-white shadow-md' : 'text-emerald-600 hover:bg-emerald-100'}`}
                >
                    <Egg size={16} /> THỰC PHẨM
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar bg-emerald-50/20">
                {/* Global Sell All Button with Confirmation */}
                {hasItems && (
                  !confirmSellAll ? (
                    <button 
                        onClick={() => setConfirmSellAll(true)}
                        className="w-full py-4 bg-gradient-to-r from-yellow-400 to-amber-500 text-white rounded-[2rem] font-black text-xs uppercase shadow-lg shadow-amber-200 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all mb-2 border-2 border-white"
                    >
                        <Sparkles size={18}/> Bán tất cả tab này (+{totalValue} <Coins size={14} fill="currentColor"/>)
                    </button>
                  ) : (
                    <div className="bg-red-50 p-3 rounded-2xl border-2 border-red-200 mb-2 flex items-center justify-between animate-fadeIn">
                        <span className="text-[10px] font-bold text-red-600 flex items-center gap-1"><AlertTriangle size={12}/> Bé chắc chắn bán hết sạch không?</span>
                        <div className="flex gap-2">
                            <button onClick={() => setConfirmSellAll(false)} className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-500">Hủy</button>
                            <button 
                                onClick={() => { filteredItems.forEach(item => onSellAll(item.id)); setConfirmSellAll(false); }}
                                className="px-3 py-1 bg-red-500 text-white rounded-lg text-xs font-bold shadow-sm"
                            >
                                Bán luôn
                            </button>
                        </div>
                    </div>
                  )
                )}

                {/* Items List */}
                {filteredItems.map(item => {
                    const count = harvested[item.id];
                    const isWanted = isNeededForOrder(item.id);
                    
                    return (
                        <div key={item.id} className={`flex items-center justify-between p-3 rounded-[2rem] border-4 bg-white shadow-sm transition-all group ${isWanted ? 'border-orange-200 bg-orange-50/30' : 'border-white hover:border-emerald-200'}`}>
                            <div className="flex items-center gap-4 relative">
                                <span className="text-4xl drop-shadow-md group-hover:scale-110 transition-transform select-none">{item.emoji}</span>
                                <div>
                                    <div className="font-black text-slate-800 text-sm uppercase tracking-tighter">{item.name}</div>
                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Đang có: <span className="text-emerald-600 font-black">{count}</span></div>
                                </div>
                                {isWanted && (
                                    <div className="absolute -top-3 -left-2 bg-red-500 text-white text-[8px] font-black px-2 py-0.5 rounded-full shadow-md flex items-center gap-1 animate-pulse">
                                        <Truck size={8}/> CẦN GIAO
                                    </div>
                                )}
                            </div>
                            <div className="flex flex-col gap-1.5 items-end">
                                <button 
                                  onClick={() => { if(isWanted && !confirm(`Đơn hàng đang cần ${item.name}. Bé có chắc muốn bán không?`)) return; onSell(item.id); }}
                                  className="px-4 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-xl font-black text-[10px] shadow-sm active:scale-90 flex items-center justify-center gap-2 border border-amber-200 transition-all uppercase w-28"
                                >
                                    Bán 1 (+{item.sellPrice})
                                </button>
                                {count > 1 && (
                                    <button 
                                      onClick={() => { if(isWanted && !confirm(`Đơn hàng đang cần ${item.name}. Bé có chắc muốn bán hết không?`)) return; onSellAll(item.id); }}
                                      className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black text-[10px] shadow-md active:scale-90 flex items-center justify-center gap-2 transition-all uppercase w-28"
                                    >
                                        Bán hết (+{item.sellPrice * count})
                                    </button>
                                )}
                            </div>
                        </div>
                    )
                })}
                
                {!hasItems && (
                    <div className="text-center py-20 flex flex-col items-center opacity-50">
                        <div className="text-6xl mb-4 grayscale">🧺</div>
                        <p className="text-slate-400 font-black uppercase text-[10px] tracking-widest">
                            Chưa có {activeTab === 'CROPS' ? 'nông sản' : 'thực phẩm'} nào.
                        </p>
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};
