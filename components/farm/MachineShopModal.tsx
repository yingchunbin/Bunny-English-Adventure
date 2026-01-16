
import React from 'react';
import { MachineItem, ProcessingRecipe, Crop, Product } from '../../types';
import { X, Lock, ArrowRight, Factory, Zap, Star, Coins } from 'lucide-react';

interface MachineShopModalProps {
  machines: MachineItem[];
  recipes: ProcessingRecipe[];
  allItems: (Crop | Product)[];
  userLevel: number; // This is farmLevel
  userCoins: number;
  onBuy: (machine: MachineItem) => void;
  onClose: () => void;
}

export const MachineShopModal: React.FC<MachineShopModalProps> = ({ machines, recipes, allItems, userLevel, userCoins, onBuy, onClose }) => {
  
  // Sort machines: Unlocked first -> Min Level -> Cost
  const sortedMachines = [...machines].sort((a, b) => {
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
        <div className="bg-white rounded-[2.5rem] w-full max-w-md relative border-8 border-slate-200 shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
            
            <div className="bg-slate-100 p-4 flex items-center justify-between border-b-2 border-slate-200">
                <div className="flex items-center gap-3">
                    <div className="bg-white p-2 rounded-full shadow-sm"><Factory size={24} className="text-slate-600"/></div>
                    <div>
                        <h3 className="text-lg font-black text-slate-700 uppercase tracking-tight">Cửa hàng Máy Móc</h3>
                        <p className="text-[10px] font-bold text-slate-400">Chế biến nông sản thành món ngon</p>
                    </div>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500"><X size={24} /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 no-scrollbar">
                {sortedMachines.map(machine => {
                    const isLocked = userLevel < (machine.minLevel || 0);
                    const canAfford = userCoins >= machine.cost;
                    const machineRecipes = recipes.filter(r => r.machineId === machine.id);
                    const currency = machine.currency || 'COIN';

                    return (
                        <div key={machine.id} className={`bg-white rounded-[2rem] p-5 border-4 relative transition-all ${isLocked ? 'border-slate-200 opacity-70 grayscale-[0.5]' : 'border-blue-100 hover:border-blue-300 shadow-lg'}`}>
                            
                            {/* Header */}
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="text-5xl">{machine.emoji}</div>
                                    <div>
                                        <h4 className="font-black text-slate-800 text-lg">{machine.name}</h4>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{machine.description}</p>
                                    </div>
                                </div>
                                <div className={`px-3 py-1 rounded-full text-xs font-black border flex items-center gap-1 ${canAfford ? 'bg-amber-100 text-amber-700 border-amber-200' : 'bg-slate-100 text-slate-400 border-slate-200'}`}>
                                    {machine.cost} {currency === 'STAR' ? <Star size={12} fill="currentColor"/> : <Coins size={12} fill="currentColor"/>}
                                </div>
                            </div>

                            {/* Recipes Preview */}
                            <div className="bg-slate-50 rounded-xl p-3 mb-4 border border-slate-100">
                                <div className="text-[10px] font-black text-slate-400 uppercase mb-2 tracking-wider">Sản phẩm có thể làm:</div>
                                <div className="space-y-2">
                                    {machineRecipes.slice(0, 2).map(r => { // Show max 2 examples
                                        const out = allItems.find(i => i.id === r.outputId);
                                        return (
                                            <div key={r.id} className="flex items-center gap-2 text-xs font-bold text-slate-600 bg-white p-1.5 rounded-lg shadow-sm border border-slate-100">
                                                <div className="flex items-center gap-1">
                                                    {r.input.map(input => {
                                                        const item = allItems.find(i => i.id === input.id);
                                                        return <span key={input.id}>{item?.emoji}</span>
                                                    })}
                                                </div>
                                                <ArrowRight size={12} className="text-blue-400"/>
                                                <span>{out?.emoji}</span>
                                                <span className="text-[10px] text-slate-400 truncate">{out?.name}</span>
                                            </div>
                                        )
                                    })}
                                    {machineRecipes.length > 2 && <div className="text-[10px] text-center text-slate-400 italic">+ {machineRecipes.length - 2} công thức khác</div>}
                                </div>
                            </div>

                            {/* Button */}
                            {isLocked ? (
                                <button disabled className="w-full py-3 bg-slate-100 text-slate-400 rounded-xl font-black text-xs uppercase flex items-center justify-center gap-2 cursor-not-allowed">
                                    <Lock size={14}/> Mở khóa ở cấp độ {machine.minLevel}
                                </button>
                            ) : (
                                <button 
                                    onClick={() => onBuy(machine)}
                                    disabled={!canAfford}
                                    className={`w-full py-3 rounded-xl font-black text-sm uppercase shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 ${canAfford ? 'bg-blue-500 text-white hover:bg-blue-600 shadow-blue-200' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
                                >
                                    <Zap size={16} fill="currentColor"/> Lắp đặt máy
                                </button>
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    </div>
  );
};
