
import React, { useState } from 'react';
import { Crop, Product, FarmItem, AnimalItem, MachineItem, Decor, LivestockSlot, MachineSlot } from '../../types';
import { Package, X, Sprout, Bird, Factory, Armchair, ShoppingBasket, ArrowRight, ArrowRightCircle } from 'lucide-react';
import { playSFX } from '../../utils/sound';

interface InventoryModalProps {
  initialTab?: 'SEEDS' | 'ANIMALS' | 'MACHINES' | 'DECOR';
  inventory: Record<string, number>; // Seeds
  seeds: Crop[];
  animals: AnimalItem[];
  machines: MachineItem[];
  decorations: Decor[];
  allItems: (Crop | Product)[]; // For looking up product icons
  
  ownedAnimals: LivestockSlot[];
  ownedMachines: MachineSlot[];
  ownedDecorations: string[]; // List of IDs

  mode: 'VIEW' | 'SELECT_SEED' | 'PLACE_ANIMAL' | 'PLACE_MACHINE'; 
  onSelectSeed?: (seedId: string) => void;
  onSelectAnimal?: (animalId: string) => void;
  onSelectMachine?: (machineId: string) => void;
  onGoToShop?: () => void;
  onClose: () => void;
}

type Tab = 'SEEDS' | 'ANIMALS' | 'MACHINES' | 'DECOR';

export const InventoryModal: React.FC<InventoryModalProps> = ({ 
    initialTab = 'SEEDS',
    inventory, seeds, animals, machines, decorations, allItems,
    ownedAnimals, ownedMachines, ownedDecorations,
    mode, onSelectSeed, onSelectAnimal, onSelectMachine, onClose, onGoToShop 
}) => {
  const [activeTab, setActiveTab] = useState<Tab>(initialTab);

  const getOwnedCount = (type: Tab, id: string) => {
      // In inventory modal, we now care about "Available to place" count which is stored in inventory for all types
      // The old logic for ANIMALS/MACHINES/DECOR counted *placed* items, but here we want *unplaced* inventory items.
      return inventory[id] || 0;
  };

  const renderItemRow = (item: FarmItem, count: number) => {
      // STRICT FILTER: Always hide if count <= 0
      if (count <= 0) return null;

      // In SELECT/PLACE modes, ensure we are on the right tab to avoid confusion, 
      // though user might want to browse. But for actions, we only render buttons if tab matches mode intent.
      
      let extraInfo = null;
      if (activeTab === 'ANIMALS') {
          const animal = animals.find(a => a.id === item.id);
          const produce = allItems.find(p => p.id === animal?.produceId);
          if (produce) {
              extraInfo = (
                  <div className="flex items-center gap-1 text-[10px] text-slate-500 bg-orange-50 px-2 py-1 rounded-lg border border-orange-100">
                      <span>Sản phẩm:</span>
                      <span className="text-lg leading-none">{produce.emoji}</span>
                  </div>
              );
          }
      }
      
      if (activeTab === 'MACHINES') {
           const machine = machines.find(m => m.id === item.id);
           if (machine) {
                extraInfo = <div className="text-[10px] text-slate-400 italic truncate max-w-[120px]">{machine.description}</div>;
           }
      }

      return (
          <div key={item.id} className="bg-white border-4 border-slate-100 rounded-3xl p-3 flex items-center justify-between shadow-sm animate-fadeIn">
              <div className="flex items-center gap-3">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl border ${activeTab === 'SEEDS' ? 'bg-green-50 border-green-100' : activeTab === 'ANIMALS' ? 'bg-orange-50 border-orange-100' : activeTab === 'MACHINES' ? 'bg-blue-50 border-blue-100' : 'bg-purple-50 border-purple-100'}`}>
                      {item.emoji}
                  </div>
                  <div>
                      <div className="font-black text-slate-700 text-sm uppercase">{item.name}</div>
                      <div className="text-xs font-bold text-slate-400 mb-1">Số lượng: <span className="text-blue-600">{count}</span></div>
                      {extraInfo}
                  </div>
              </div>

              {/* Action Buttons */}
              {mode === 'SELECT_SEED' && activeTab === 'SEEDS' && (
                  <button 
                      onClick={() => onSelectSeed && onSelectSeed(item.id)}
                      className="bg-green-500 text-white px-4 py-2 rounded-xl font-black text-xs uppercase shadow-md active:scale-95 transition-all"
                  >
                      Gieo hạt
                  </button>
              )}

              {mode === 'PLACE_ANIMAL' && activeTab === 'ANIMALS' && (
                  <button 
                      onClick={() => onSelectAnimal && onSelectAnimal(item.id)}
                      className="bg-orange-500 text-white px-4 py-2 rounded-xl font-black text-xs uppercase shadow-md active:scale-95 transition-all"
                  >
                      Thả chuồng
                  </button>
              )}

              {mode === 'PLACE_MACHINE' && activeTab === 'MACHINES' && (
                  <button 
                      onClick={() => onSelectMachine && onSelectMachine(item.id)}
                      className="bg-blue-500 text-white px-4 py-2 rounded-xl font-black text-xs uppercase shadow-md active:scale-95 transition-all"
                  >
                      Lắp đặt
                  </button>
              )}
          </div>
      );
  };

  const getListForTab = () => {
      switch(activeTab) {
          case 'SEEDS': return seeds.filter(s => !s.isMagic);
          case 'ANIMALS': return animals;
          case 'MACHINES': return machines;
          case 'DECOR': return decorations;
          default: return [];
      }
  };

  const currentList = getListForTab();
  // Check if current tab is empty
  const isEmpty = currentList.every(item => getOwnedCount(activeTab, item.id) <= 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-fadeIn">
        <div className="bg-white rounded-[2.5rem] w-full max-w-md h-[80vh] flex flex-col overflow-hidden border-8 border-slate-200 shadow-2xl relative">
            
            {/* Header */}
            <div className="bg-slate-100 p-4 flex justify-between items-center border-b-2 border-slate-200">
                <div className="flex items-center gap-2">
                    <Package size={24} className="text-slate-600"/>
                    <h2 className="text-xl font-black text-slate-700 uppercase tracking-tight">Túi Đồ</h2>
                </div>
                <div className="flex gap-2">
                    {onGoToShop && (
                        <button onClick={onGoToShop} className="bg-pink-500 text-white px-3 py-1.5 rounded-xl font-bold text-xs shadow-sm active:scale-95 flex items-center gap-1">
                            <ShoppingBasket size={14}/> Shop
                        </button>
                    )}
                    <button onClick={onClose} className="p-2 bg-white rounded-full text-slate-400 hover:text-slate-600 shadow-sm"><X size={20}/></button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex p-2 gap-1 bg-slate-50 overflow-x-auto no-scrollbar">
                {[
                    { id: 'SEEDS', label: 'Hạt Giống', icon: Sprout, color: 'text-green-600', activeBg: 'bg-green-500' },
                    { id: 'ANIMALS', label: 'Vật Nuôi', icon: Bird, color: 'text-orange-600', activeBg: 'bg-orange-500' },
                    { id: 'MACHINES', label: 'Máy Móc', icon: Factory, color: 'text-blue-600', activeBg: 'bg-blue-500' },
                    { id: 'DECOR', label: 'Trang Trí', icon: Armchair, color: 'text-purple-600', activeBg: 'bg-purple-500' },
                ].map(tab => (
                    <button 
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as Tab)}
                        className={`flex-1 py-2 px-1 rounded-xl font-black text-[10px] flex flex-col items-center gap-1 transition-all whitespace-nowrap ${activeTab === tab.id ? `${tab.activeBg} text-white shadow-md` : `bg-white ${tab.color}`}`}
                    >
                        <tab.icon size={16}/> {tab.label}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
                
                {currentList.map(item => renderItemRow(item, getOwnedCount(activeTab, item.id)))}

                {isEmpty && (
                    <div className="text-center py-12 opacity-50 flex flex-col items-center">
                        <div className="text-5xl mb-2 grayscale">📦</div>
                        <p className="text-slate-400 font-bold text-xs uppercase tracking-wider">
                            {activeTab === 'SEEDS' ? "Hết hạt giống rồi!" : 
                             activeTab === 'ANIMALS' ? "Chưa có con vật nào!" :
                             activeTab === 'MACHINES' ? "Chưa có máy móc nào!" : "Chưa có đồ trang trí!"}
                        </p>
                    </div>
                )}

                {/* Show shortcut to shop if empty */}
                {onGoToShop && (
                    <button onClick={onGoToShop} className="w-full py-3 bg-white border-2 border-dashed border-slate-300 rounded-2xl text-slate-400 font-bold flex items-center justify-center gap-2 hover:bg-slate-50 mt-4 text-xs uppercase">
                        Đến Cửa Hàng mua thêm <ArrowRightCircle size={16}/>
                    </button>
                )}
            </div>
        </div>
    </div>
  );
};
