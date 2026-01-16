
import React, { useState } from 'react';
import { Crop, Product, FarmOrder } from '../../types';
import { Warehouse, X, Coins, Sparkles, Sprout, Egg, AlertTriangle, Truck, Trash, Info, Cookie } from 'lucide-react';

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
  const [activeTab, setActiveTab] = useState<'CROPS' | 'ANIMAL_PROD' | 'PROCESSED'>('CROPS');
  const [confirmState, setConfirmState] = useState<{ type: 'SELL_ALL_TAB' | 'SELL_SINGLE' | 'SELL_ALL_ITEM', itemId?: string, itemName?: string, value?: number } | null>(null);

  // Helper: Kiểm tra xem vật phẩm có đang cần cho đơn hàng không
  const isNeededForOrder = (itemId: string) => {
      return activeOrders.some(order => order.requirements.some(req => req.cropId === itemId));
  };

  // Filter items logic based on new tabs
  const filteredItems = crops.filter(item => {
      const hasStock = (harvested?.[item.id] || 0) > 0;
      if (!hasStock) return false;
      
      if (activeTab === 'CROPS') return item.type === 'CROP';
      if (activeTab === 'ANIMAL_PROD') return item.type === 'PRODUCT'; // Animal products like eggs, milk
      if (activeTab === 'PROCESSED') return item.type === 'PROCESSED'; // Machine goods
      
      return false;
  });

  const hasItems = filteredItems.length > 0;
  const totalValue = filteredItems.reduce((acc, item) => acc + (item.sellPrice * (harvested[item.id] || 0)), 0);

  const handleSellClick = (item: Crop | Product, mode: 'SINGLE' | 'ALL') => {
      const isWanted = isNeededForOrder(item.id);
      
      // If not wanted for order, just sell immediately (fast UX)
      if (!isWanted) {
          if (mode === 'SINGLE') onSell(item.id);
          else onSellAll(item.id);
          return;
      }

      // If wanted, show local confirmation
      setConfirmState({
          type: mode === 'SINGLE' ? 'SELL_SINGLE' : 'SELL_ALL_ITEM',
          itemId: item.id,
          itemName: item.name,
          value: item.sellPrice * (mode === 'SINGLE' ? 1 : (harvested[item.id] || 0))
      });
  };

  const executeConfirm = () => {
      if (!confirmState) return;
      if (confirmState.type === 'SELL_ALL_TAB') {
          filteredItems.forEach(item => onSellAll(item.id));
      } else if (confirmState.type === 'SELL_SINGLE' && confirmState.itemId) {
          onSell(confirmState.itemId);
      } else if (confirmState.type === 'SELL_ALL_ITEM' && confirmState.itemId) {
          onSellAll(confirmState.itemId);
      }
      setConfirmState(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fadeIn">
        <div className="bg-white rounded-[3rem] w-full max-w-md relative border-8 border-emerald-100 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-gradient-to-r from-emerald-500 to-emerald-700 p-6 text-white text-center relative">
                <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"><X size={24}/></button>
                <h3 className="text-2xl font-black flex items-center justify-center gap-3 uppercase tracking-tighter">
                    <Warehouse size={32} /> Kho nông sản
                </h3>
            </div>
            
            {/* Tabs */}
            <div className="flex bg-emerald-50 p-2 gap-1 overflow-x-auto no-scrollbar">
                <button 
                  onClick={() => setActiveTab('CROPS')}
                  className={`flex-1 py-3 rounded-2xl flex flex-col items-center justify-center gap-1 font-black text-[10px] transition-all whitespace-nowrap min-w-[80px] ${activeTab === 'CROPS' ? 'bg-emerald-500 text-white shadow-md' : 'text-emerald-600 hover:bg-emerald-100'}`}
                >
                    <Sprout size={18} /> TRỒNG TRỌT
                </button>
                <button 
                  onClick={() => setActiveTab('ANIMAL_PROD')}
                  className={`flex-1 py-3 rounded-2xl flex flex-col items-center justify-center gap-1 font-black text-[10px] transition-all whitespace-nowrap min-w-[80px] ${activeTab === 'ANIMAL_PROD' ? 'bg-orange-500 text-white shadow-md' : 'text-orange-600 hover:bg-orange-100'}`}
                >
                    <Egg size={18} /> CHĂN NUÔI
                </button>
                <button 
                  onClick={() => setActiveTab('PROCESSED')}
                  className={`flex-1 py-3 rounded-2xl flex flex-col items-center justify-center gap-1 font-black text-[10px] transition-all whitespace-nowrap min-w-[80px] ${activeTab === 'PROCESSED' ? 'bg-blue-500 text-white shadow-md' : 'text-blue-600 hover:bg-blue-100'}`}
                >
                    <Cookie size={18} /> HÀNG HÓA
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar bg-emerald-50/20 relative">
                
                {/* Internal Confirmation Overlay */}
                {confirmState && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/90 p-6 animate-fadeIn rounded-xl">
                        <div className="text-center w-full bg-white p-4 rounded-3xl shadow-xl border-2 border-slate-100">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500 border-4 border-white shadow-lg">
                                <AlertTriangle size={32} />
                            </div>
                            <h4 className="text-lg font-black text-slate-800 mb-2">
                                {confirmState.type === 'SELL_ALL_TAB' ? "Bán hết sạch?" : "Cẩn thận!"}
                            </h4>
                            <p className="text-sm font-bold text-slate-500 mb-6">
                                {confirmState.type === 'SELL_ALL_TAB' 
                                    ? "Bé có chắc muốn bán tất cả mọi thứ trong tab này không?" 
                                    : <span>Đơn hàng đang cần <b>{confirmState.itemName}</b>.<br/>Bán đi là không giao được đâu đó!</span>}
                            </p>
                            <div className="flex gap-3">
                                <button onClick={() => setConfirmState(null)} className="flex-1 py-3 bg-slate-100 text-slate-500 rounded-xl font-bold hover:bg-slate-200">Hủy</button>
                                <button onClick={executeConfirm} className="flex-1 py-3 bg-red-500 text-white rounded-xl font-bold shadow-lg shadow-red-200 hover:bg-red-600">
                                    Bán luôn
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Global Sell All Button */}
                {hasItems && (
                    <button 
                        onClick={() => setConfirmState({ type: 'SELL_ALL_TAB' })}
                        className="w-full py-4 bg-gradient-to-r from-yellow-400 to-amber-500 text-white rounded-[2rem] font-black text-xs uppercase shadow-lg shadow-amber-200 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all mb-2 border-2 border-white"
                    >
                        <Sparkles size={18}/> Bán tất cả tab này (+{totalValue} <Coins size={14} fill="currentColor"/>)
                    </button>
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
                                  onClick={() => handleSellClick(item, 'SINGLE')}
                                  className="px-4 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-xl font-black text-[10px] shadow-sm active:scale-90 flex items-center justify-center gap-2 border border-amber-200 transition-all uppercase w-28"
                                >
                                    Bán 1 (+{item.sellPrice})
                                </button>
                                {count > 1 && (
                                    <button 
                                      onClick={() => handleSellClick(item, 'ALL')}
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
                            Kho trống trơn!
                        </p>
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};
