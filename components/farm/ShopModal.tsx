
import React, { useState } from 'react';
import { Crop, Decor, AnimalItem, MachineItem } from '../../types';
import { ShoppingBasket, X, Lock, Star, Coins, Plus, Minus, Sprout, Bird, Factory, Armchair } from 'lucide-react';
import { playSFX } from '../../utils/sound';

interface ShopModalProps {
  crops: Crop[];
  animals?: AnimalItem[];
  machines?: MachineItem[];
  decorations: Decor[];
  userState: any;
  onBuySeed: (crop: Crop, amount: number) => void;
  onBuyAnimal?: (animal: AnimalItem) => void;
  onBuyMachine?: (machine: MachineItem) => void;
  onBuyDecor: (decor: Decor) => void;
  onClose: () => void;
  initialTab?: 'SEEDS' | 'ANIMALS' | 'MACHINES' | 'DECOR';
}

export const ShopModal: React.FC<ShopModalProps> = ({ 
    crops, animals = [], machines = [], decorations, 
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

  const sortedCrops = sortItems(crops.filter(c => !c.isMagic));
  const sortedAnimals = sortItems(animals);
  const sortedMachines = sortItems(machines);
  const sortedDecor = sortItems(decorations);

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
                        className={`flex items-center gap-1 px-4 py-2 rounded-xl font-black text-xs whitespace-nowrap transition-all ${tab === t.id ? 'bg-pink-500 text-white shadow-lg' : 'bg-white text-pink-400 border border-pink-100'}`}
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
                            
                            return (
                                <div key={crop.id} className={`bg-white p-3 rounded-2xl border-4 flex items-center gap-3 ${isLocked ? 'grayscale opacity-60 border-slate-200' : 'border-pink-100'}`}>
                                    <div className="text-5xl">{crop.emoji}</div>
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
                            // Find feed and produce items to show details
                            const feedItem = crops.find(c => c.id === animal.feedCropId);
                            // Produce item could be in PRODUCTS array which isn't passed here directly, 
                            // but we can infer or rely on text if item not found, 
                            // however to keep it simple, we just show name.
                            
                            return (
                                <div key={animal.id} className="bg-white p-3 rounded-2xl border-4 border-orange-100 flex items-center gap-3">
                                    <div className="text-5xl">{animal.emoji}</div>
                                    <div className="flex-1">
                                        <div className="font-black text-slate-700 text-sm">{animal.name}</div>
                                        
                                        <div className="flex flex-wrap gap-2 mt-1">
                                            <div className="text-[10px] bg-orange-50 px-2 py-1 rounded text-orange-600 font-bold flex items-center gap-1">
                                                Ăn: {feedItem ? feedItem.emoji : '???'}
                                            </div>
                                            <div className="text-[10px] bg-blue-50 px-2 py-1 rounded text-blue-600 font-bold">
                                                SX: {Math.ceil(animal.produceTime/60)}p
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
                            return (
                                <div key={machine.id} className="bg-white p-3 rounded-2xl border-4 border-blue-100 flex items-center gap-3">
                                    <div className="text-5xl">{machine.emoji}</div>
                                    <div className="flex-1">
                                        <div className="font-black text-slate-700 text-sm">{machine.name}</div>
                                        <div className="text-[10px] text-slate-500 font-bold leading-tight">{machine.description}</div>
                                        {isLocked ? <div className="text-[10px] text-slate-400 mt-2 font-bold"><Lock size={10} className="inline"/> Cấp {machine.minLevel}</div> : renderBuyButton(machine.cost, currency, () => onBuyMachine && onBuyMachine(machine), false)}
                                    </div>
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
                            const currency = decor.currency || 'COIN';
                            return (
                                <div key={decor.id} className={`bg-white p-3 rounded-2xl border-4 flex items-center gap-3 ${owned ? 'border-green-200 bg-green-50' : 'border-purple-100'}`}>
                                    <div className="text-5xl">{decor.emoji}</div>
                                    <div className="flex-1">
                                        <div className="font-black text-slate-700 text-sm">{decor.name}</div>
                                        
                                        {!owned ? renderBuyButton(decor.cost, currency, () => onBuyDecor(decor), false) 
                                        : <div className="text-xs font-black text-green-600 mt-2 text-center bg-white rounded-lg py-1">Đã sở hữu</div>}
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
