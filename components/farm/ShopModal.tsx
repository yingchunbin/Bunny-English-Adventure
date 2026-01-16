
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
  inline?: boolean; // New prop for inline display
}

export const ShopModal: React.FC<ShopModalProps> = ({ crops, decorations, userState, onBuySeed, onBuyDecor, onClose, inline = false }) => {
  const [tab, setTab] = useState<'SEEDS' | 'DECOR'>('SEEDS');
  const [amounts, setAmounts] = useState<Record<string, number>>({});
  
  // If inline, use a simplified layout (no fixed overlay)
  const containerClass = inline 
    ? "w-full h-full flex flex-col bg-white" 
    : "fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fadeIn";
    
  const innerClass = inline
    ? "flex-1 flex flex-col overflow-hidden"
    : "bg-white rounded-[3rem] w-full max-w-sm relative h-[85vh] flex flex-col overflow-hidden border-8 border-pink-200 shadow-2xl";

  const content = (
      <div className={innerClass}>
          {!inline && (
            <div className="bg-pink-600 px-6 py-4 flex justify-between items-center text-white">
                <h2 className="font-black text-lg">Cửa Hàng</h2>
                <button onClick={onClose}><X size={24}/></button>
            </div>
          )}

          {/* Tabs */}
          <div className="flex p-3 gap-2 bg-pink-50/30 shrink-0">
              <button onClick={() => setTab('SEEDS')} className={`flex-1 py-3 rounded-2xl font-black text-xs transition-all ${tab === 'SEEDS' ? 'bg-pink-500 text-white shadow-lg' : 'bg-white text-pink-600 border border-pink-100'}`}>
                  HẠT GIỐNG
              </button>
              <button onClick={() => setTab('DECOR')} className={`flex-1 py-3 rounded-2xl font-black text-xs transition-all ${tab === 'DECOR' ? 'bg-pink-500 text-white shadow-lg' : 'bg-white text-pink-600 border border-pink-100'}`}>
                  TRANG TRÍ
              </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 no-scrollbar bg-pink-50/10">
              {tab === 'SEEDS' && (
                  <div className="flex flex-col gap-4">
                      {crops.map(crop => {
                          if (crop.isMagic) return null;
                          const isLocked = (userState.completedLevels?.length || 0) < (crop.unlockReq || 0);
                          const amount = amounts[crop.id] || 1;
                          const totalCost = crop.cost * amount;
                          const canAfford = userState.coins >= totalCost;
                          
                          return (
                              <div key={crop.id} className={`bg-white p-4 rounded-[2rem] border-2 flex items-center gap-4 relative transition-all shadow-sm ${isLocked ? 'opacity-60 grayscale border-slate-200' : 'border-pink-100'}`}>
                                  <div className="text-5xl drop-shadow-md select-none">{crop.emoji}</div>
                                  <div className="flex-1 min-w-0">
                                      <div className="font-black text-slate-800 text-sm uppercase tracking-tighter truncate">{crop.name}</div>
                                      <div className="flex items-center gap-1 text-[10px] font-bold text-amber-600 mb-2">
                                          <Coins size={10} fill="currentColor"/> {crop.cost}
                                      </div>
                                      
                                      {!isLocked ? (
                                          <div className="flex items-center gap-3">
                                              <div className="flex items-center bg-slate-100 rounded-xl p-1 border border-slate-200">
                                                  <button onClick={() => setAmounts({...amounts, [crop.id]: Math.max(1, amount-1)})} className="p-1 hover:bg-white rounded-lg text-pink-600"><Minus size={14}/></button>
                                                  <span className="w-6 text-center font-black text-slate-700 text-sm">{amount}</span>
                                                  <button onClick={() => setAmounts({...amounts, [crop.id]: amount+1})} className="p-1 hover:bg-white rounded-lg text-pink-600"><Plus size={14}/></button>
                                              </div>
                                              <button 
                                                  onClick={() => onBuySeed(crop, amount)}
                                                  className={`flex-1 py-2 rounded-xl font-black text-[10px] uppercase shadow-sm active:scale-95 flex items-center justify-center gap-1 ${canAfford ? 'bg-pink-500 text-white' : 'bg-slate-200 text-slate-400'}`}
                                              >
                                                  Mua {totalCost}
                                              </button>
                                          </div>
                                      ) : (
                                          <div className="text-slate-400 text-[10px] font-bold bg-slate-100 px-2 py-1 rounded-lg inline-block">Lv {crop.unlockReq}</div>
                                      )}
                                  </div>
                              </div>
                          )
                      })}
                  </div>
              )}
              {tab === 'DECOR' && (
                  <div className="flex flex-col gap-3">
                      {decorations.map(decor => (
                          <div key={decor.id} className="bg-white p-4 rounded-[2rem] border-2 border-purple-100 flex items-center gap-4">
                              <div className="text-4xl">{decor.emoji}</div>
                              <div className="flex-1">
                                  <h4 className="font-black text-slate-700 text-sm">{decor.name}</h4>
                                  <p className="text-[10px] text-slate-400">{decor.description}</p>
                              </div>
                              <button onClick={() => onBuyDecor(decor)} className="bg-purple-500 text-white px-4 py-2 rounded-xl font-bold text-xs shadow-sm active:scale-95">
                                  {decor.cost} {decor.currency === 'COIN' ? '🟡' : '⭐'}
                              </button>
                          </div>
                      ))}
                  </div>
              )}
          </div>
      </div>
  );

  if (inline) return content;
  return <div className={containerClass}>{content}</div>;
};
