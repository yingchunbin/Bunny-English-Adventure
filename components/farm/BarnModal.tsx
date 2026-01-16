
import React, { useState } from 'react';
import { Crop, Product, FarmOrder } from '../../types';
import { Warehouse, X, Coins, Sparkles, Sprout, Egg, AlertTriangle, Truck, Trash, Info } from 'lucide-react';

interface BarnModalProps {
  crops: (Crop | Product)[];
  harvested: any;
  activeOrders: FarmOrder[];
  onSell: (cropId: string) => void;
  onSellAll: (cropId: string) => void;
  onSellEverything: () => void;
  onClose: () => void;
  inline?: boolean;
}

export const BarnModal: React.FC<BarnModalProps> = ({ crops, harvested, activeOrders, onSell, onSellAll, onSellEverything, onClose, inline = false }) => {
  const [activeTab, setActiveTab] = useState<'CROPS' | 'PRODUCTS'>('CROPS');

  const filteredItems = crops.filter(item => {
      const hasStock = (harvested?.[item.id] || 0) > 0;
      if (!hasStock) return false;
      if (activeTab === 'CROPS') return item.type === 'CROP';
      if (activeTab === 'PRODUCTS') return item.type === 'PRODUCT';
      return false;
  });

  const containerClass = inline ? "w-full h-full flex flex-col" : "fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fadeIn";
  const innerClass = inline ? "flex-1 flex flex-col overflow-hidden bg-white" : "bg-white rounded-[3rem] w-full max-w-md relative border-8 border-emerald-100 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]";

  const content = (
      <div className={innerClass}>
          {!inline && (
            <div className="bg-emerald-500 p-4 text-white flex justify-between items-center">
                <h3 className="font-black text-lg flex items-center gap-2"><Warehouse/> Kho</h3>
                <button onClick={onClose}><X/></button>
            </div>
          )}
          
          <div className="flex bg-emerald-50 p-2 gap-2 shrink-0">
                <button onClick={() => setActiveTab('CROPS')} className={`flex-1 py-3 rounded-2xl flex items-center justify-center gap-2 font-black text-xs transition-all ${activeTab === 'CROPS' ? 'bg-emerald-500 text-white shadow-md' : 'text-emerald-600 hover:bg-emerald-100'}`}>
                    <Sprout size={16} /> NÔNG SẢN
                </button>
                <button onClick={() => setActiveTab('PRODUCTS')} className={`flex-1 py-3 rounded-2xl flex items-center justify-center gap-2 font-black text-xs transition-all ${activeTab === 'PRODUCTS' ? 'bg-emerald-500 text-white shadow-md' : 'text-emerald-600 hover:bg-emerald-100'}`}>
                    <Egg size={16} /> THỰC PHẨM
                </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar bg-emerald-50/20">
              {filteredItems.length === 0 ? (
                  <div className="text-center py-20 opacity-50 font-black text-slate-300 text-xs uppercase tracking-widest">Trống trơn...</div>
              ) : (
                  filteredItems.map(item => (
                      <div key={item.id} className="flex items-center justify-between p-3 rounded-[2rem] border-2 border-emerald-50 bg-white shadow-sm">
                          <div className="flex items-center gap-4">
                              <span className="text-4xl drop-shadow-sm">{item.emoji}</span>
                              <div>
                                  <div className="font-black text-slate-800 text-sm uppercase">{item.name}</div>
                                  <div className="text-[10px] font-bold text-slate-400">SL: <span className="text-emerald-600">{harvested[item.id]}</span></div>
                              </div>
                          </div>
                          <button className="px-4 py-2 bg-amber-100 text-amber-700 rounded-xl font-black text-[10px] uppercase hover:bg-amber-200 transition-colors">
                              Bán {item.sellPrice}
                          </button>
                      </div>
                  ))
              )}
          </div>
      </div>
  );

  if (inline) return content;
  return <div className={containerClass}>{content}</div>;
};
