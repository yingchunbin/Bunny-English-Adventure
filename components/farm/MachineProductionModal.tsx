
import React from 'react';
import { MachineItem, ProcessingRecipe, Crop, Product, FarmItem } from '../../types';
import { X, Clock, Zap, ArrowRight, AlertCircle, ChefHat, Layers, Info } from 'lucide-react';
import { playSFX } from '../../utils/sound';
import { CROPS, ANIMALS, MACHINES, RECIPES } from '../../data/farmData';

interface MachineProductionModalProps {
  machine: MachineItem;
  recipes: ProcessingRecipe[];
  inventory: Record<string, number>; 
  allItems: (Crop | Product)[];
  onProduce: (recipeId: string) => void;
  onClose: () => void;
  queueLength: number; 
  onShowAlert: (msg: string, type: 'INFO' | 'DANGER') => void;
}

export const MachineProductionModal: React.FC<MachineProductionModalProps> = ({ 
    machine, recipes, inventory, allItems, onProduce, onClose, queueLength, onShowAlert
}) => {

  const handleStart = (recipeId: string) => {
      playSFX('click');
      onProduce(recipeId);
  };

  const handleIngredientClick = (item: FarmItem) => {
      playSFX('click');
      let msg = "";
      
      // 1. Check Crop
      const crop = CROPS.find(c => c.id === item.id);
      if (crop) {
          msg = `🌱 ${item.name} là Nông sản. Bé hãy trồng cây nhé!`;
      } else {
          // 2. Check Animal Product
          const animal = ANIMALS.find(a => a.produceId === item.id);
          if (animal) {
              msg = `🐮 ${item.name} lấy từ ${animal.name}. Bé hãy nuôi nó nhé!`;
          } else {
              // 3. Check Machine Product
              const recipe = RECIPES.find(r => r.outputId === item.id);
              if (recipe) {
                  const machine = MACHINES.find(m => m.id === recipe.machineId);
                  if (machine) {
                      msg = `🏭 ${item.name} làm từ máy ${machine.name}.`;
                  }
              }
          }
      }

      if (msg) {
          onShowAlert(msg, 'INFO');
      } else {
          onShowAlert(`Bé hãy tìm ${item.name} trong Nông trại nhé!`, 'INFO');
      }
  };

  const MAX_QUEUE = 3;
  const isQueueFull = queueLength >= MAX_QUEUE;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fadeIn">
        <div className="bg-white rounded-[2.5rem] w-full max-w-md relative border-8 border-blue-100 shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
            
            {/* Header */}
            <div className="bg-blue-50 p-6 flex items-center justify-between border-b-4 border-blue-100">
                <div className="flex items-center gap-4">
                    <div className="bg-white p-3 rounded-2xl shadow-sm text-5xl border-2 border-blue-200">
                        {machine.emoji}
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-blue-800 uppercase tracking-tight">{machine.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">Hàng chờ:</span>
                            <div className="flex gap-1">
                                {[...Array(MAX_QUEUE)].map((_, i) => (
                                    <div key={i} className={`w-3 h-3 rounded-full border border-blue-300 ${i < queueLength ? 'bg-blue-500' : 'bg-white'}`} />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-blue-200 rounded-full transition-colors text-blue-600 bg-white shadow-sm"><X size={24} /></button>
            </div>

            {/* Recipes List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 no-scrollbar">
                {recipes.length === 0 ? (
                    <div className="text-center py-10 text-slate-400 font-bold">Chưa có công thức nào!</div>
                ) : (
                    recipes.map(recipe => {
                        const product = allItems.find(p => p.id === recipe.outputId);
                        if (!product) return null;

                        // Check ingredients
                        let canCraft = true;
                        const ingredientsList = recipe.input.map(req => {
                            const item = allItems.find(i => i.id === req.id);
                            const has = inventory[req.id] || 0;
                            const enough = has >= req.amount;
                            if (!enough) canCraft = false;
                            return { ...req, item, has, enough };
                        });

                        return (
                            <div key={recipe.id} className="bg-white p-4 rounded-[2rem] border-4 border-white shadow-sm hover:border-blue-200 transition-all">
                                
                                {/* Top: Output Info */}
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="text-4xl drop-shadow-md">{product.emoji}</div>
                                        <div>
                                            <div className="font-black text-slate-800 text-lg leading-tight">{product.name}</div>
                                            <div className="flex items-center gap-3 mt-1">
                                                <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-lg flex items-center gap-1">
                                                    <Clock size={10} /> {Math.ceil(recipe.duration / 60)}p
                                                </span>
                                                <span className="text-[10px] font-bold text-purple-500 bg-purple-50 px-2 py-0.5 rounded-lg flex items-center gap-1">
                                                    <Zap size={10} fill="currentColor" /> +{recipe.exp} XP
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Divider */}
                                <div className="h-0.5 bg-slate-100 w-full mb-3 rounded-full"></div>

                                {/* Bottom: Ingredients & Action */}
                                <div className="flex items-center justify-between">
                                    {/* Ingredients Grid */}
                                    <div className="flex flex-wrap gap-2">
                                        {ingredientsList.map((ing, idx) => (
                                            <div 
                                                key={idx} 
                                                onClick={() => ing.item && handleIngredientClick(ing.item)}
                                                className={`relative group flex flex-col items-center p-1.5 rounded-xl border-2 min-w-[50px] cursor-pointer hover:scale-105 transition-transform ${ing.enough ? 'bg-slate-50 border-slate-100' : 'bg-red-50 border-red-100'}`}
                                            >
                                                <Info size={10} className="absolute top-0 right-0 text-blue-400 opacity-0 group-hover:opacity-100" />
                                                <span className="text-xl leading-none mb-1">{ing.item?.emoji}</span>
                                                <span className={`text-[9px] font-black ${ing.enough ? 'text-slate-600' : 'text-red-500'}`}>
                                                    {ing.has}/{ing.amount}
                                                </span>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Action Button */}
                                    <button 
                                        onClick={() => handleStart(recipe.id)}
                                        disabled={!canCraft || isQueueFull}
                                        className={`ml-2 px-5 py-3 rounded-2xl font-black text-xs uppercase shadow-md transition-all active:scale-95 flex items-center gap-2 ${canCraft && !isQueueFull ? 'bg-blue-500 text-white hover:bg-blue-600 shadow-blue-200' : 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'}`}
                                    >
                                        {isQueueFull ? (
                                            <>Đầy hàng chờ <Layers size={16}/></>
                                        ) : canCraft ? (
                                            <>Chế biến <ChefHat size={16}/></>
                                        ) : (
                                            <>Thiếu đồ <AlertCircle size={16}/></>
                                        )}
                                    </button>
                                </div>
                            </div>
                        )
                    })
                )}
            </div>
        </div>
    </div>
  );
};
