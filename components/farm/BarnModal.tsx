
import React, { useState } from 'react';
import { Crop, Product, FarmOrder } from '../../types';
import { Warehouse, X, Coins, Sparkles, Sprout, Egg, AlertTriangle, Truck, Cookie } from 'lucide-react';
import { resolveImage } from '../../utils/imageUtils';

interface BarnModalProps {
  crops: (Crop | Product)[];
  harvested: any;
  activeOrders: FarmOrder[];
  coinBuffPercent: number; 
  onSell: (itemId: string, e: React.MouseEvent) => void; 
  onSellAll: (itemId: string, e: React.MouseEvent) => void;
  onSellBulk: (items: { itemId: string, amount: number }[], e: React.MouseEvent) => void; 
  onClose: () => void;
}

export const BarnModal: React.FC<BarnModalProps> = ({ crops, harvested, activeOrders, coinBuffPercent, onSell, onSellAll, onSellBulk, onClose }) => {
  const [activeTab, setActiveTab] = useState<'CROPS' | 'ANIMAL_PROD' | 'PROCESSED'>('CROPS');
  const [confirmState, setConfirmState] = useState<{ 
      type: 'SELL_ALL_TAB' | 'SELL_SINGLE' | 'SELL_ALL_ITEM', 
      itemId?: string, 
      itemName?: string, 
      value?: number
  } | null>(null);

  const calculatePrice = (basePrice: number) => {
      const bonus = Math.floor(basePrice * (coinBuffPercent / 100));
      return basePrice + bonus;
  };

  const isNeededForOrder = (itemId: string) => {
      return activeOrders.some(order => order.requirements.some(req => req.cropId === itemId));
  };

  const filteredItems = crops.filter(item => {
      const hasStock = (harvested?.[item.id] || 0) > 0;
      if (!hasStock) return false;
      
      if (activeTab === 'CROPS') return item.type === 'CROP';
      if (activeTab === 'ANIMAL_PROD') return item.type === 'PRODUCT';
      if (activeTab === 'PROCESSED') return item.type === 'PROCESSED';
      
      return false;
  });

  const hasItems = filteredItems.length > 0;
  
  const handleSellClick = (item: Crop | Product, mode: 'SINGLE' | 'ALL', e: React.MouseEvent) => {
      const isWanted = isNeededForOrder(item.id);
      
      if (!isWanted) {
          if (mode === 'SINGLE') onSell(item.id, e);
          else onSellAll(item.id, e);
          return;
      }

      const unitPrice = calculatePrice(item.sellPrice);
      setConfirmState({
          type: mode === 'SINGLE' ? 'SELL_SINGLE' : 'SELL_ALL_ITEM',
          itemId: item.id,
          itemName: item.name,
          value: unitPrice * (mode === 'SINGLE' ? 1 : (harvested[item.id] || 0))
      });
  };

  const handleSellAllTab = () => {
      const totalValue = filteredItems.reduce((sum, item) => {
          const count = harvested[item.id] || 0;
          return sum + (calculatePrice(item.sellPrice) * count);
      }, 0);

      setConfirmState({
          type: 'SELL_ALL_TAB',
          value: totalValue
      });
  };

  const executeConfirm = (e: React.MouseEvent) => {
      if (!confirmState) return;
      
      if (confirmState.type === 'SELL_ALL_TAB') {
          const itemsToSell = filteredItems.map(item => ({
              itemId: item.id,
              amount: harvested[item.id] || 0
          }));
          onSellBulk(itemsToSell, e);
      } else if (confirmState.type === 'SELL_SINGLE' && confirmState.itemId) {
          onSell(confirmState.itemId, e);
      } else if (confirmState.type === 'SELL_ALL_ITEM' && confirmState.itemId) {
          onSellAll(confirmState.itemId, e);
      }
      setConfirmState(null);
  };

  const tabTotalValue = filteredItems.reduce((sum, item) => {
      const count = harvested[item.id] || 0;
      return sum + (calculatePrice(item.sellPrice) * count);
  }, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fadeIn">
        <div className="bg-white rounded-[2.5rem] w-full max-w-md relative border-8 border-emerald-100 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-gradient-to-r from-emerald-500 to-emerald-700 p-4 text-white text-center relative flex-shrink-0">
                <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"><X size={24}/></button>
                <h3 className="text-xl font-black flex items-center justify-center gap-3 uppercase tracking-tighter">
                    <Warehouse size={28} /> Kho nông sản
                </h3>
            </div>
            
            <div className="flex bg-emerald-50 p-2 gap-1 overflow-x-auto no-scrollbar flex-shrink-0">
                <button 
                  onClick={() => setActiveTab('CROPS')}
                  className={`flex-1 py-2 rounded-2xl flex flex-col items-center justify-center gap-1 font-black text-[10px] transition-all whitespace-nowrap min-w-[70px] ${activeTab === 'CROPS' ? 'bg-emerald-500 text-white shadow-md' : 'text-emerald-600 hover:bg-emerald-100'}`}
                >
                    <Sprout size={16} /> TRỒNG TRỌT
                </button>
                <button 
                  onClick={() => setActiveTab('ANIMAL_PROD')}
                  className={`flex-1 py-2 rounded-2xl flex flex-col items-center justify-center gap-1 font-black text-[10px] transition-all whitespace-nowrap min-w-[70px] ${activeTab === 'ANIMAL_PROD' ? 'bg-orange-500 text-white shadow-md' : 'text-orange-600 hover:bg-orange-100'}`}
                >
                    <Egg size={16} /> CHĂN NUÔI
                </button>
                <button 
                  onClick={() => setActiveTab('PROCESSED')}
                  className={`flex-1 py-2 rounded-2xl flex flex-col items-center justify-center gap-1 font-black text-[10px] transition-all whitespace-nowrap min-w-[70px] ${activeTab === 'PROCESSED' ? 'bg-blue-500 text-white shadow-md' : 'text-blue-600 hover:bg-blue-100'}`}
                >
                    <Cookie size={16} /> HÀNG HÓA
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-emerald-50/20 relative no-scrollbar">
                {hasItems && (
                    <button 
                        onClick={handleSellAllTab}
                        className="w-full py-4 bg-gradient-to-r from-yellow-400 to-amber-500 text-white rounded-[2rem] font-black text-xs uppercase shadow-lg shadow-amber-200 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all mb-2 border-2 border-white"
                    >
                        <Sparkles size={18}/> Bán tất cả tab này (+{tabTotalValue})
                    </button>
                )}

                {filteredItems.map(item => {
                    const count = harvested[item.id];
                    const isWanted = isNeededForOrder(item.id);
                    const imgUrl = resolveImage(item.imageUrl);
                    const unitPrice = calculatePrice(item.sellPrice);
                    
                    return (
                        <div key={item.id} className={`flex items-center justify-between p-3 rounded-[2rem] border-4 bg-white shadow-sm transition-all group ${isWanted ? 'border-orange-200 bg-orange-50/30' : 'border-white hover:border-emerald-200'}`}>
                            <div className="flex items-center gap-3 relative">
                                <div className="w-12 h-12 flex items-center justify-center">
                                    {imgUrl ? <img src={imgUrl} alt={item.name} className="w-full h-full object-contain" /> : <span className="text-4xl drop-shadow-md select-none">{item.emoji}</span>}
                                </div>
                                <div>
                                    <div className="font-black text-slate-800 text-xs uppercase tracking-tighter">{item.name}</div>
                                    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Đang có: <span className="text-emerald-600 font-black">{count}</span></div>
                                    <div className="text-[9px] font-bold text-amber-500 mt-0.5 flex items-center gap-1">
                                        Giá bán: {unitPrice} <Coins size={8} className="inline"/> 
                                        {coinBuffPercent > 0 && <span className="text-green-500 text-[8px]">(+{coinBuffPercent}%)</span>}
                                    </div>
                                </div>
                                {isWanted && (
                                    <div className="absolute -top-3 -left-2 bg-red-500 text-white text-[8px] font-black px-2 py-0.5 rounded-full shadow-md flex items-center gap-1 animate-pulse">
                                        <Truck size={8}/> CẦN GIAO
                                    </div>
                                )}
                            </div>
                            <div className="flex flex-col gap-1.5 items-end">
                                <button 
                                  onClick={(e) => handleSellClick(item, 'SINGLE', e)}
                                  className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-xl font-black text-[9px] shadow-sm active:scale-90 flex items-center justify-center gap-1 border border-amber-200 transition-all uppercase w-24"
                                >
                                    Bán 1 (+{unitPrice})
                                </button>
                                {count > 1 && (
                                    <button 
                                      onClick={(e) => handleSellClick(item, 'ALL', e)}
                                      className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black text-[9px] shadow-md active:scale-90 flex items-center justify-center gap-1 transition-all uppercase w-24"
                                    >
                                        Bán hết (+{unitPrice * count})
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

        {/* OVERLAY CONFIRMATION - Improved to prevent clipping and ensure visibility */}
        {confirmState && (
            <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 p-4 animate-fadeIn backdrop-blur-md">
                <div className="w-full max-w-xs bg-white p-5 rounded-[2rem] shadow-2xl border-4 border-slate-100 flex flex-col items-center relative overflow-y-auto max-h-[90vh]">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4 text-red-500 border-4 border-white shadow-lg animate-bounce flex-shrink-0">
                        <AlertTriangle size={32} />
                    </div>
                    <h4 className="text-xl font-black text-slate-800 mb-2 text-center uppercase tracking-tight">
                        {confirmState.type === 'SELL_ALL_TAB' ? "Bán hết sạch?" : "Cẩn thận!"}
                    </h4>
                    <p className="text-slate-500 font-bold mb-6 text-center text-sm leading-relaxed">
                        {confirmState.type === 'SELL_ALL_TAB' 
                            ? "Bé có chắc muốn bán tất cả mọi thứ trong tab này không?" 
                            : <span>Đơn hàng đang cần <b>{confirmState.itemName}</b>.<br/>Bán đi là không giao được đâu đó!</span>}
                    </p>
                    
                    {/* Profit Preview */}
                    <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl px-6 py-3 mb-6 flex flex-col items-center justify-center gap-1 w-full shadow-inner">
                        <span className="text-[10px] font-bold text-yellow-700 uppercase tracking-widest">Sẽ nhận được:</span>
                        <span className="text-3xl font-black text-yellow-600 flex items-center gap-2 drop-shadow-sm">
                            +{confirmState.value} <Coins size={28} fill="currentColor"/>
                        </span>
                    </div>

                    <div className="flex gap-3 w-full">
                        <button 
                            onClick={() => setConfirmState(null)} 
                            className="flex-1 py-3 bg-slate-100 text-slate-500 rounded-xl font-black hover:bg-slate-200 transition-colors uppercase tracking-wider text-xs"
                        >
                            Hủy
                        </button>
                        <button 
                            onClick={executeConfirm} 
                            className="flex-1 py-3 bg-red-500 text-white rounded-xl font-black shadow-lg shadow-red-200 hover:bg-red-600 transition-transform active:scale-95 uppercase tracking-wider text-xs flex items-center justify-center gap-1"
                        >
                            BÁN LUÔN (+{confirmState.value})
                        </button>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};
