
// ... imports
import React, { useState } from 'react';
import { Crop, Decor, AnimalItem, MachineItem, ProcessingRecipe, Product } from '../../types';
import { ShoppingBasket, X, Lock, Star, Coins, Plus, Minus, Sprout, Bird, Factory, Armchair, ArrowRight, Clock, TrendingUp } from 'lucide-react';
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

  // ... (adjustSeedAmount, handleBuySeed, renderBuyButton helpers same as before) ...
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
        <button onClick={onClick} className={`mt-2 w-full text-white py-2 rounded-xl font-black text-xs shadow-sm active:scale-95 flex items-center justify-center gap-1 ${currency === 'STAR' ? 'bg-purple-500 hover:bg-purple-600' : 'bg-green-500 hover:bg-green-600'}`}>
            Mua <span className="text-sm">{cost}</span> {currency === 'STAR' ? <Star size={12} fill="currentColor"/> : <Coins size={12} fill="currentColor"/>}
        </button>
      );
  };

  // Helper to sort items
  const sortItems = <T extends { unlockReq?: number, minLevel?: number, cost: number }>(items: T[]) => {
      return [...items].sort((a, b) => {
          const levelA = a.unlockReq ?? a.minLevel ?? 0;
          const levelB = b.unlockReq ?? b.minLevel ?? 0;
          const lockedA = farmLevel < levelA;
          const lockedB = farmLevel < levelB;

          if (lockedA !== lockedB) return lockedA ? 1 : -1;
          if (levelA !== levelB) return levelA - levelB;
          return a.cost - b.cost;
      });
  };

  const getDecorAnimation = (decorId: string) => {
      if (['fountain', 'lamp_post', 'statue', 'dragon_statue', 'phoenix_totem'].includes(decorId)) return 'animate-pulse';
      if (['scarecrow', 'flower_pot', 'magic_beanstalk'].includes(decorId)) return 'animate-bounce';
      if (['hay_bale', 'bench', 'windmill_decor'].includes(decorId)) return 'hover:animate-spin';
      return 'hover:scale-110';
  };

  // UPDATED: Rarity tiers based on Cost (Stars)
  const getRarityImageStyle = (cost: number) => {
      if(cost >= 500) return 'drop-shadow-[0_0_20px_rgba(239,68,68,0.9)] filter brightness-110 contrast-125'; // MYTHIC (RED)
      if(cost >= 250) return 'drop-shadow-[0_0_15px_rgba(250,204,21,0.8)] filter brightness-110'; // LEGENDARY (GOLD)
      if(cost >= 100) return 'drop-shadow-[0_0_12px_rgba(168,85,247,0.7)]'; // EPIC (PURPLE)
      if(cost >= 50) return 'drop-shadow-[0_0_10px_rgba(59,130,246,0.6)]'; // RARE (BLUE)
      if(cost >= 20) return 'drop-shadow-[0_0_5px_rgba(34,197,94,0.5)]'; // UNCOMMON (GREEN)
      return 'drop-shadow-sm grayscale-[0.2]'; // COMMON (WHITE)
  };

  const getRarityBadgeStyle = (cost: number) => {
      if(cost >= 500) return 'bg-red-100 text-red-800 border-red-300 ring-1 ring-red-400';
      if(cost >= 250) return 'bg-yellow-100 text-yellow-800 border-yellow-300 ring-1 ring-yellow-400';
      if(cost >= 100) return 'bg-purple-100 text-purple-800 border-purple-200';
      if(cost >= 50) return 'bg-blue-100 text-blue-800 border-blue-200';
      if(cost >= 20) return 'bg-green-100 text-green-800 border-green-200';
      return 'bg-slate-100 text-slate-500 border-slate-200';
  };

  const sortedCrops = sortItems(crops.filter(c => !c.isMagic)) as Crop[];
  const sortedAnimals = sortItems(animals) as AnimalItem[];
  const sortedMachines = sortItems(machines) as MachineItem[];
  const sortedDecor = sortItems(decorations) as Decor[];

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
                                        <div className="flex justify-between items-start">
                                            <div className="font-black text-slate-700 text-sm">{crop.name}</div>
                                            {!isLocked && (
                                                <div className="text-[10px] font-bold text-green-600 flex items-center gap-1 bg-green-50 px-2 py-0.5 rounded-lg border border-green-100">
                                                    <TrendingUp size={10} /> Bán: {crop.sellPrice}
                                                </div>
                                            )}
                                        </div>
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
                                        
                                        <div className="bg-orange-50 rounded-xl p-2 border border-orange-100 flex flex-col gap-1 my-2">
                                            <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                                                <span className="text-[10px] uppercase text-slate-400 w-6">Ăn:</span>
                                                <div className="flex items-center gap-1 bg-white px-2 py-0.5 rounded-lg border border-slate-100 shadow-sm">
                                                    <span>{feedItem?.emoji}</span>
                                                    <span className="text-blue-600 text-[10px]">x{animal.feedAmount}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                                                    <span className="text-[10px] uppercase text-slate-400 w-6">Đẻ:</span>
                                                    <div className="flex items-center gap-1 bg-white px-2 py-0.5 rounded-lg border border-slate-100 shadow-sm">
                                                        <span>{produceItem?.emoji}</span>
                                                    </div>
                                                </div>
                                                {!isLocked && produceItem && (
                                                    <div className="text-[9px] font-bold text-green-600">
                                                        Bán: {produceItem.sellPrice} <Coins size={8} className="inline"/>
                                                    </div>
                                                )}
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

                                    <div className="bg-slate-50 rounded-xl p-2 border border-slate-100">
                                        <div className="text-[9px] font-black text-slate-400 uppercase mb-1 tracking-wider">Chế tạo & Lợi nhuận:</div>
                                        <div className="space-y-1.5">
                                            {machineRecipes.slice(0, 3).map(r => { 
                                                const out = allItems.find(i => i.id === r.outputId);
                                                return (
                                                    <div key={r.id} className="flex items-center justify-between text-xs font-bold text-slate-600 bg-white p-1 rounded-lg shadow-sm border border-slate-100">
                                                        <div className="flex items-center gap-1">
                                                            <span>{out?.emoji}</span>
                                                            <span className="text-[10px] truncate max-w-[60px]">{out?.name}</span>
                                                        </div>
                                                        <div className="text-[9px] text-green-600 font-black">
                                                            +{out?.sellPrice} <Coins size={8} className="inline"/>
                                                        </div>
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

                {/* DECOR */}
                {tab === 'DECOR' && (
                    <div className="grid grid-cols-1 gap-3">
                        {sortedDecor.map(decor => {
                            const owned = userState.decorations?.includes(decor.id);
                            const currency = decor.currency || 'STAR';
                            const anim = getDecorAnimation(decor.id);
                            const imgUrl = resolveImage(decor.imageUrl);
                            
                            const imageGlow = getRarityImageStyle(decor.cost);
                            const badgeStyle = getRarityBadgeStyle(decor.cost);

                            // Handle multiple buffs presentation
                            const renderBuffs = () => {
                                if (decor.multiBuffs) {
                                    return (
                                        <div className="flex flex-wrap gap-1 mt-1">
                                            {decor.multiBuffs.map((buff, idx) => (
                                                <div key={idx} className={`text-[9px] font-bold px-2 py-0.5 rounded-lg inline-flex items-center gap-1 border shadow-sm ${badgeStyle}`}>
                                                    <Plus size={8}/> {buff.desc}
                                                </div>
                                            ))}
                                        </div>
                                    );
                                }
                                if (decor.buff) {
                                    return (
                                        <div className={`text-[9px] font-bold px-2 py-1 rounded-lg inline-flex items-center gap-1 mt-1 border shadow-sm ${badgeStyle}`}>
                                            <Plus size={8}/> {decor.buff.desc}
                                        </div>
                                    );
                                }
                                return null;
                            };

                            return (
                                <div 
                                    key={decor.id} 
                                    className="p-4 rounded-3xl border-4 bg-white border-slate-100 shadow-sm flex items-center gap-4 transition-all relative overflow-hidden group"
                                >
                                    <div className={`w-16 h-16 flex items-center justify-center z-10 transition-all ${anim} ${imageGlow}`}>
                                        {imgUrl ? <img src={imgUrl} alt={decor.name} className="w-full h-full object-contain" /> : <div className="text-6xl">{decor.emoji}</div>}
                                    </div>
                                    
                                    <div className="flex-1 z-10">
                                        <div className="font-black text-sm text-slate-700 uppercase tracking-tight">{decor.name}</div>
                                        {renderBuffs()}
                                        
                                        {!owned ? (
                                            <div className="mt-2">
                                                {renderBuyButton(decor.cost, currency, () => onBuyDecor(decor), false)}
                                            </div>
                                        ) : (
                                            <div className="text-xs font-black text-green-700 mt-3 flex items-center gap-1 bg-green-100 px-3 py-1.5 rounded-xl w-fit shadow-sm border border-green-200">
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
