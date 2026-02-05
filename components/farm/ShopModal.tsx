
import React, { useState, memo } from 'react';
import { Crop, Decor, AnimalItem, MachineItem, ProcessingRecipe, Product } from '../../types';
import { ShoppingBasket, X, Lock, Star, Coins, Plus, Minus, Sprout, Bird, Factory, Armchair, ArrowRight, Clock, TrendingUp, Shield, Zap } from 'lucide-react';
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

const ShopModalComponent: React.FC<ShopModalProps> = ({ 
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
    if (amount > 0) {
        onBuySeed(crop, amount);
        setSeedAmounts({ ...seedAmounts, [crop.id]: 1 }); // Reset after buy
    }
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

  // Rarity Definitions
  const getRarityInfo = (cost: number) => {
      if (cost >= 500) return { 
          label: "THẦN THOẠI", 
          color: "text-red-600", 
          bg: "bg-red-50", 
          border: "border-red-500", 
          glow: "drop-shadow-[0_0_15px_rgba(239,68,68,0.8)]",
          anim: "animate-pulse"
      };
      if (cost >= 250) return { 
          label: "HUYỀN THOẠI", 
          color: "text-yellow-600", 
          bg: "bg-yellow-50", 
          border: "border-yellow-500", 
          glow: "drop-shadow-[0_0_12px_rgba(234,179,8,0.8)]",
          anim: "animate-pulse"
      };
      if (cost >= 100) return { 
          label: "SỬ THI", 
          color: "text-purple-600", 
          bg: "bg-purple-50", 
          border: "border-purple-500", 
          glow: "drop-shadow-[0_0_10px_rgba(168,85,247,0.6)]",
          anim: ""
      };
      if (cost >= 50) return { 
          label: "QUÝ HIẾM", 
          color: "text-blue-600", 
          bg: "bg-blue-50", 
          border: "border-blue-500", 
          glow: "drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]",
          anim: ""
      };
      if (cost >= 20) return { 
          label: "HIẾM", 
          color: "text-green-600", 
          bg: "bg-green-50", 
          border: "border-green-500", 
          glow: "drop-shadow-sm",
          anim: ""
      };
      return { 
          label: "THƯỜNG", 
          color: "text-slate-500", 
          bg: "bg-slate-50", 
          border: "border-slate-300", 
          glow: "",
          anim: ""
      };
  };

  const getBuffIcon = (type: string) => {
      switch(type) {
          case 'EXP': return <Zap size={10} />;
          case 'COIN': return <Coins size={10} />;
          case 'TIME': return <Clock size={10} />;
          case 'PEST': return <Shield size={10} />;
          case 'YIELD': return <Sprout size={10} />;
          default: return <Plus size={10} />;
      }
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
                                                <div className="flex items-center bg-slate-100 rounded-lg p-1 border border-slate-200">
                                                    <button onClick={() => adjustSeedAmount(crop.id, -1)} className="p-1 hover:bg-white rounded transition-colors"><Minus size={12}/></button>
                                                    
                                                    {/* INPUT FIELD FOR QUANTITY */}
                                                    <input 
                                                        type="number" 
                                                        min="1"
                                                        max="999"
                                                        value={amount}
                                                        onChange={(e) => {
                                                            const val = parseInt(e.target.value);
                                                            if (!isNaN(val) && val >= 0) {
                                                                setSeedAmounts({ ...seedAmounts, [crop.id]: val });
                                                            } else if (e.target.value === '') {
                                                                setSeedAmounts({ ...seedAmounts, [crop.id]: 0 });
                                                            }
                                                        }}
                                                        className="w-10 text-center font-bold text-sm bg-transparent outline-none p-0 appearance-none mx-1 text-slate-700"
                                                    />
                                                    
                                                    <button onClick={() => adjustSeedAmount(crop.id, 1)} className="p-1 hover:bg-white rounded transition-colors"><Plus size={12}/></button>
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

                {tab === 'DECOR' && (
                    <div className="grid grid-cols-1 gap-3">
                        {sortedDecor.map(decor => {
                            const owned = userState.decorations?.includes(decor.id);
                            const currency = decor.currency || 'STAR';
                            const imgUrl = resolveImage(decor.imageUrl);
                            
                            const rarity = getRarityInfo(decor.cost);

                            const renderBuffs = () => {
                                const buffs = decor.multiBuffs || (decor.buff ? [decor.buff] : []);
                                if (buffs.length === 0) return null;

                                return (
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        {buffs.map((buff, idx) => (
                                            <div key={idx} className={`text-[9px] font-black px-2 py-0.5 rounded-lg inline-flex items-center gap-1 border ${rarity.bg} ${rarity.color} ${rarity.border}`}>
                                                {getBuffIcon(buff.type)} 
                                                <span>{buff.value}% {buff.desc}</span>
                                            </div>
                                        ))}
                                    </div>
                                );
                            };

                            return (
                                <div 
                                    key={decor.id} 
                                    className={`p-4 rounded-3xl border-4 bg-white shadow-sm flex items-center gap-4 transition-all relative overflow-hidden group ${rarity.border}`}
                                >
                                    <div className={`absolute top-0 left-0 px-3 py-0.5 rounded-br-xl text-[8px] font-black text-white uppercase tracking-widest ${rarity.bg.replace('bg-','bg-').replace('50','500')}`}>
                                        {rarity.label}
                                    </div>

                                    <div className={`w-16 h-16 flex items-center justify-center z-10 transition-all ${rarity.anim} ${rarity.glow} mt-2`}>
                                        {imgUrl ? <img src={imgUrl} alt={decor.name} className="w-full h-full object-contain" /> : <div className="text-6xl">{decor.emoji}</div>}
                                    </div>
                                    
                                    <div className="flex-1 z-10 pt-2">
                                        <div className={`font-black text-sm uppercase tracking-tight ${rarity.color}`}>{decor.name}</div>
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

export const ShopModal = memo(ShopModalComponent);
