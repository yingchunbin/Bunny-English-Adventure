
import React, { useState } from 'react';
import { Crop, Decor, AnimalItem, MachineItem, ProcessingRecipe, Product } from '../../types';
import { ShoppingBasket, X, Lock, Star, Coins, Plus, Minus, Sprout, Bird, Factory, Armchair, ArrowRight, Clock } from 'lucide-react';
import { playSFX } from '../../utils/sound';
import { resolveImage } from '../../utils/imageUtils';

interface ShopModalProps {
  crops: Crop[];
  animals?: AnimalItem[];
  machines?: MachineItem[];
  decorations: Decor[];
  recipes?: ProcessingRecipe[];
  products?: Product[];
  userState: any;
  onBuySeed: (crop: Crop, amount: number) => void;
  onBuyAnimal?: (animal: AnimalItem) => void;
  onBuyMachine?: (machine: MachineItem) => void;
  onBuyDecor: (decor: Decor) => void;
  onClose: () => void;
  initialTab?: 'SEEDS' | 'ANIMALS' | 'MACHINES' | 'DECOR';
}

export const ShopModal: React.FC<ShopModalProps> = ({ 
    crops, animals = [], machines = [], decorations, recipes = [], products = [],
    userState, onBuySeed, onBuyAnimal, onBuyMachine, onBuyDecor, onClose, initialTab = 'SEEDS' 
}) => {
  const [tab, setTab] = useState(initialTab);
  const [seedAmounts, setSeedAmounts] = useState<Record<string, number>>({});
  const farmLevel = userState.farmLevel || 1;

  const adjustSeedAmount = (id: string, delta: number) => {
    const current = seedAmounts[id] || 1;
    const next = Math.max(1, current + delta);
    setSeedAmounts({ ...seedAmounts, [id]: next });
    playSFX('click');
  };

  const handleBuySeed = (crop: Crop) => {
    const amount = seedAmounts[crop.id] || 1;
    onBuySeed(crop, amount);
    setSeedAmounts({ ...seedAmounts, [crop.id]: 1 });
  };

  const renderBuyButton = (cost: number, currency: 'COIN' | 'STAR', onClick: () => void, isLocked: boolean) => {
      if (isLocked) return null;
      return (
        <button onClick={onClick} className={`mt-2 w-full text-white py-2 rounded-xl font-black text-xs shadow-sm active:scale-95 flex items-center justify-center gap-1 ${currency === 'STAR' ? 'bg-purple-500' : 'bg-green-500'}`}>
            Mua <span className="text-sm">{cost}</span> {currency === 'STAR' ? <Star size={12} fill="currentColor"/> : <Coins size={12} fill="currentColor"/>}
        </button>
      );
  };

  // Helper to sort items: Unlocked first, then by level, then by cost
  const sortItems = <T extends { unlockReq?: number, minLevel?: number, cost: number }>(items: T[]) => {
      return [...items].sort((a, b) => {
          const levelA = a.unlockReq ?? a.minLevel ?? 0;
          const levelB = b.unlockReq ?? b.minLevel ?? 0;
          const lockedA = farmLevel < levelA;
          const lockedB = farmLevel < levelB;

          if (lockedA !== lockedB) return lockedA ? 1 : -1; // Locked items at bottom
          if (levelA !== levelB) return levelA - levelB; // Lower level requirement first
          return a.cost - b.cost; // Cheaper items first
      });
  };

  const getDecorAnimation = (decorId: string) => {
      if (['fountain', 'lamp_post', 'statue'].includes(decorId)) return 'animate-pulse';
      if (['scarecrow', 'flower_pot'].includes(decorId)) return 'animate-bounce';
      if (['hay_bale', 'bench'].includes(decorId)) return 'hover:animate-spin';
      return 'hover:scale-110';
  };

  // Helper to determine rarity glow based on cost (Stars)
  const getRarityStyle = (cost: number) => {
      if(cost >= 20) return { 
          bg: 'bg-yellow-50', 
          border: 'border-yellow-400', 
          shadow: 'shadow-[0_0_15px_rgba(250,204,21,0.5)]', 
          text: 'text-yellow-600',
          badge: 'bg-yellow-100 text-yellow-700'
      }; // Legendary
      if(cost >= 10) return { 
          bg: 'bg-purple-50', 
          border: 'border-purple-400', 
          shadow: 'shadow-[0_0_10px_rgba(192,132,252,0.4)]', 
          text: 'text-purple-600',
          badge: 'bg-purple-100 text-purple-700'
      }; // Epic
      if(cost >= 5) return { 
          bg: 'bg-blue-50', 
          border: 'border-blue-300', 
          shadow: 'shadow-[0_0_8px_rgba(96,165,250,0.3)]', 
          text: 'text-blue-600',
          badge: 'bg-blue-100 text-blue-700'
      }; // Rare
      return { 
          bg: 'bg-white', 
          border: 'border-slate-200', 
          shadow: 'shadow-sm', 
          text: 'text-slate-700',
          badge: 'bg-slate-100 text-slate-500'
      }; // Common
  };

  const sortedCrops = sortItems(crops.filter(c => !c.isMagic));
  const sortedAnimals = sortItems(animals);
  const sortedMachines = sortItems(machines);
  const sortedDecor = sortItems(decorations);

  const allItems = [...crops, ...products];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fadeIn">
        <div className="bg-white rounded-[3rem] w-full max-w-lg h-[90vh] flex flex-col overflow-hidden border-8 border-pink-200 shadow-2xl relative">
            
            {/* Header */}
            <div className="bg-pink-500 px-4 py-3 flex justify-between items-center text-white shadow-md z-10">
                <div className="flex items-center gap-3">
                    <div className="bg-white/20 p-2 rounded-full"><ShoppingBasket size={24}/></div>
                    <div>
                        <h2 className="text-lg font-black uppercase tracking-tighter">Cửa hàng</h2>
                        <div className="flex gap-2 text-xs font-bold opacity-90">
                            <span className="flex items-center gap-1"><Coins size={10}/> {userState.coins}</span>
                            <span className="flex items-center gap-1"><Star size={10}/> {userState.stars}</span>
                        </div>
                    </div>
                </div>
                <button onClick={onClose} className="bg-white/20 p-2 rounded-full hover:bg-white/30 transition-colors"><X size={20}/></button>
            </div>

            {/* Tabs */}
            <div className="flex p-2 bg-pink-50 gap-2 overflow-x-auto no-scrollbar border-b border-pink-100">
                {[
                    { id: 'SEEDS', label: 'Hạt Giống', icon: Sprout },
                    { id: 'ANIMALS', label: 'Vật Nuôi', icon: Bird },
                    { id: 'MACHINES', label: 'Máy Móc', icon: Factory },
                    { id: 'DECOR', label: 'Trang Trí', icon: Armchair },
                ].map((t) => (
                    <button 
                        key={t.id}
                        onClick={() => setTab(t.id as any)}
                        className={`flex-1 py-2 px-4 rounded-xl font-black text-xs whitespace-nowrap transition-all ${tab === t.id ? 'bg-pink-500 text-white shadow-lg' : 'bg-white text-pink-400 border border-pink-100'}`}
                    >
                        <t.icon size={14}/> {t.label}
                    </button>
                ))}
            </div>

            <div className="flex-1 overflow-y-auto p-4 bg-slate-50 no-scrollbar">
                
                {/* SEEDS */}
                {tab === 'SEEDS' && (
                    <div className="grid grid-cols-1 gap-3">
                        {sortedCrops.map(crop => {
                            const isLocked = farmLevel < (crop.unlockReq || 0);
                            const amount = seedAmounts[crop.id] || 1;
                            const totalCost = crop.cost * amount;
                            const currency = crop.currency || 'COIN';
                            const imgUrl = resolveImage(crop.imageUrl);
                            
                            return (
                                <div key={crop.id} className={`bg-white p-3 rounded-2xl border-4 flex items-center gap-3 ${isLocked ? 'grayscale opacity-60 border-slate-200' : 'border-pink-100'}`}>
                                    <div className="w-12 h-12 flex items-center justify-center">
                                        {imgUrl ? <img src={imgUrl} alt={crop.name} className="w-full h-full object-contain" /> : <div className="text-5xl">{crop.emoji}</div>}
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-black text-slate-700 text-sm">{crop.name}</div>
                                        <div className="text-[10px] text-slate-500 font-bold">Thu hoạch: {crop.growthTime}s</div>
                                        
                                        {!isLocked ? (
                                            <div className="flex items-center gap-2 mt-2">
                                                <div className="flex items-center bg-slate-100 rounded-lg p-1">
                                                    <button onClick={() => adjustSeedAmount(crop.id, -1)} className="p-1"><Minus size={12}/></button>
                                                    <span className="w-6 text-center font-bold text-sm">{amount}</span>
                                                    <button onClick={() => adjustSeedAmount(crop.id, 1)} className="p-1"><Plus size={12}/></button>
                                                </div>
                                                <div className="flex-1">
                                                    {renderBuyButton(totalCost, currency, () => handleBuySeed(crop), false)}
                                                </div>
                                            </div>
                                        ) : <div className="text-[10px] text-slate-400 mt-1 font-bold bg-slate-100 px-2 py-1 rounded-md inline-block"><Lock size={8} className="inline"/> Lv {crop.unlockReq}</div>}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}

                {/* ANIMALS */}
                {tab === 'ANIMALS' && (
                    <div className="grid grid-cols-1 gap-3">
                        {sortedAnimals.map(animal => {
                            const isLocked = farmLevel < (animal.minLevel || 0);
                            const currency = animal.currency || 'COIN';
                            
                            const feedItem = allItems.find(c => c.id === animal.feedCropId);
                            const produceItem = allItems.find(p => p.id === animal.produceId);
                            const imgUrl = resolveImage(animal.imageUrl);
                            
                            return (
                                <div key={animal.id} className={`bg-white p-3 rounded-2xl border-4 flex items-center gap-3 ${isLocked ? 'grayscale opacity-60 border-slate-200' : 'border-orange-100'}`}>
                                    <div className="w-12 h-12 flex items-center justify-center">
                                        {imgUrl ? <img src={imgUrl} alt={animal.name} className="w-full h-full object-contain" /> : <div className="text-5xl">{animal.emoji}</div>}
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-black text-slate-700 text-sm">{animal.name}</div>
                                        
                                        {/* DETAIL BOX */}
                                        <div className="bg-orange-50 rounded-xl p-2 border border-orange-100 flex flex-col gap-1 my-2">
                                            <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                                                <span className="text-[10px] uppercase text-slate-400 w-6">Ăn:</span>
                                                <div className="flex items-center gap-1 bg-white px-2 py-0.5 rounded-lg border border-slate-100 shadow-sm">
                                                    <span>{feedItem?.emoji}</span>
                                                    <span className="text-blue-600 text-[10px]">x{animal.feedAmount}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                                                <span className="text-[10px] uppercase text-slate-400 w-6">Đẻ:</span>
                                                <div className="flex items-center gap-1 bg-white px-2 py-0.5 rounded-lg border border-slate-100 shadow-sm">
                                                    <span>{produceItem?.emoji}</span>
                                                </div>
                                                <span className="flex items-center gap-1 text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-md"><Clock size={8}/> {Math.ceil(animal.produceTime / 60)}p</span>
                                            </div>
                                        </div>

                                        {isLocked ? <div className="text-[10px] text-slate-400 mt-2 font-bold"><Lock size={10} className="inline"/> Cấp {animal.minLevel}</div> : renderBuyButton(animal.cost, currency, () => onBuyAnimal && onBuyAnimal(animal), false)}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}

                {/* MACHINES */}
                {tab === 'MACHINES' && (
                    <div className="grid grid-cols-1 gap-3">
                        {sortedMachines.map(machine => {
                            const isLocked = farmLevel < (machine.minLevel || 0);
                            const currency = machine.currency || 'COIN';
                            const machineRecipes = recipes.filter(r => r.machineId === machine.id);
                            const imgUrl = resolveImage(machine.imageUrl);

                            return (
                                <div key={machine.id} className={`bg-white p-3 rounded-2xl border-4 flex flex-col gap-2 ${isLocked ? 'grayscale opacity-60 border-slate-200' : 'border-blue-100'}`}>
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 flex items-center justify-center">
                                            {imgUrl ? <img src={imgUrl} alt={machine.name} className="w-full h-full object-contain" /> : <div className="text-5xl">{machine.emoji}</div>}
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-black text-slate-700 text-sm">{machine.name}</div>
                                            <div className="text-[10px] text-slate-500 font-bold leading-tight">{machine.description}</div>
                                        </div>
                                    </div>

                                    {/* RECIPES PREVIEW */}
                                    <div className="bg-slate-50 rounded-xl p-2 border border-slate-100">
                                        <div className="text-[9px] font-black text-slate-400 uppercase mb-1 tracking-wider">Chế tạo:</div>
                                        <div className="space-y-1.5">
                                            {machineRecipes.slice(0, 3).map(r => { // Show max 3 examples
                                                const out = allItems.find(i => i.id === r.outputId);
                                                return (
                                                    <div key={r.id} className="flex items-center gap-1.5 text-xs font-bold text-slate-600 bg-white p-1 rounded-lg shadow-sm border border-slate-100">
                                                        <div className="flex items-center -space-x-1">
                                                            {r.input.map(input => {
                                                                const item = allItems.find(i => i.id === input.id);
                                                                return <span key={input.id} className="bg-slate-100 rounded-full w-5 h-5 flex items-center justify-center text-xs border border-white">{item?.emoji}</span>
                                                            })}
                                                        </div>
                                                        <ArrowRight size={10} className="text-blue-300"/>
                                                        <span className="text-lg">{out?.emoji}</span>
                                                    </div>
                                                )
                                            })}
                                            {machineRecipes.length > 3 && <div className="text-[9px] text-center text-slate-400 italic">+ {machineRecipes.length - 3} món khác</div>}
                                        </div>
                                    </div>

                                    {isLocked ? <div className="text-[10px] text-slate-400 mt-1 font-bold text-center"><Lock size={10} className="inline"/> Cấp {machine.minLevel}</div> : renderBuyButton(machine.cost, currency, () => onBuyMachine && onBuyMachine(machine), false)}
                                </div>
                            )
                        })}
                    </div>
                )}

                {/* DECOR - UPDATED FOR MULTI-BUFFS */}
                {tab === 'DECOR' && (
                    <div className="grid grid-cols-1 gap-3">
                        {sortedDecor.map(decor => {
                            const owned = userState.decorations?.includes(decor.id);
                            const currency = decor.currency || 'STAR';
                            const anim = getDecorAnimation(decor.id);
                            const imgUrl = resolveImage(decor.imageUrl);
                            
                            // Determine rarity style
                            const style = getRarityStyle(decor.cost);

                            return (
                                <div 
                                    key={decor.id} 
                                    className={`p-4 rounded-3xl border-4 flex items-center gap-4 transition-all relative overflow-hidden group ${owned ? 'border-green-200 bg-green-50' : `${style.border} ${style.bg} ${style.shadow}`}`}
                                >
                                    
                                    {/* Glowing Background Effect */}
                                    <div className="absolute -left-4 -top-4 w-24 h-24 bg-gradient-to-br from-white/50 to-transparent rounded-full blur-xl opacity-60"></div>

                                    <div className={`w-16 h-16 flex items-center justify-center z-10 transition-all drop-shadow-md ${anim}`}>
                                        {imgUrl ? <img src={imgUrl} alt={decor.name} className="w-full h-full object-contain" /> : <div className="text-6xl">{decor.emoji}</div>}
                                    </div>
                                    
                                    <div className="flex-1 z-10">
                                        <div className={`font-black text-sm uppercase tracking-tight ${style.text}`}>{decor.name}</div>
                                        
                                        {/* Multi-buff rendering */}
                                        <div className="flex flex-wrap gap-1 mt-1">
                                            {decor.buffs?.map((buff, idx) => (
                                                <div key={idx} className={`text-[9px] font-bold px-2 py-0.5 rounded-lg inline-flex items-center gap-1 border shadow-sm backdrop-blur-sm ${style.badge} border-white/50`}>
                                                    <Plus size={8}/> {buff.desc}
                                                </div>
                                            ))}
                                        </div>
                                        
                                        {!owned ? (
                                            <div className="mt-2">
                                                {renderBuyButton(decor.cost, currency, () => onBuyDecor(decor), false)}
                                            </div>
                                        ) : (
                                            <div className="text-xs font-black text-green-600 mt-3 flex items-center gap-1 bg-white/50 px-2 py-1 rounded-lg w-fit">
                                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div> Đã sở hữu
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}

            </div>
        </div>
    </div>
  );
};
