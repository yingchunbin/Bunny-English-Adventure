
import React, { useState, memo } from 'react';
import { Crop, Product, FarmItem, AnimalItem, MachineItem, Decor, LivestockSlot, MachineSlot } from '../../types';
import { Package, X, Sprout, Bird, Factory, Armchair, ShoppingBasket, ArrowRight, ArrowRightCircle, Check, CheckCircle2, Ban, Plus, Zap, Coins, Clock, Shield, Layers } from 'lucide-react';
import { playSFX } from '../../utils/sound';
import { resolveImage } from '../../utils/imageUtils';

interface InventoryModalProps {
  initialTab?: 'SEEDS' | 'ANIMALS' | 'MACHINES' | 'DECOR';
  inventory: Record<string, number>; 
  seeds: Crop[];
  animals: AnimalItem[];
  machines: MachineItem[];
  decorations: Decor[];
  allItems: (Crop | Product)[]; 
  
  ownedAnimals: LivestockSlot[];
  ownedMachines: MachineSlot[];
  ownedDecorations: string[]; 
  activeDecorIds?: string[]; 

  mode: 'VIEW' | 'SELECT_SEED' | 'PLACE_ANIMAL' | 'PLACE_MACHINE' | 'SELECT_DECOR'; 
  onSelectSeed?: (seedId: string) => void;
  onPlantAllSeeds?: (seedId: string) => void; // New Prop
  onSelectAnimal?: (animalId: string) => void;
  onSelectMachine?: (machineId: string) => void;
  onToggleDecor?: (decorId: string) => void; 
  onGoToShop?: () => void;
  onClose: () => void;
}

type Tab = 'SEEDS' | 'ANIMALS' | 'MACHINES' | 'DECOR';

const InventoryModalComponent: React.FC<InventoryModalProps> = ({ 
    initialTab = 'SEEDS',
    inventory, seeds, animals, machines, decorations, allItems,
    ownedAnimals, ownedMachines, ownedDecorations, activeDecorIds = [],
    mode, onSelectSeed, onPlantAllSeeds, onSelectAnimal, onSelectMachine, onToggleDecor, onClose, onGoToShop 
}) => {
  const [activeTab, setActiveTab] = useState<Tab>(initialTab);

  const getOwnedCount = (type: Tab, id: string) => {
      if (type === 'DECOR') {
          return ownedDecorations.includes(id) ? 1 : 0;
      }
      return inventory[id] || 0;
  };

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
          case 'EXP': return <Zap size={8} />;
          case 'COIN': return <Coins size={8} />;
          case 'TIME': return <Clock size={8} />;
          case 'PEST': return <Shield size={8} />;
          case 'YIELD': return <Sprout size={8} />;
          default: return <Plus size={8} />;
      }
  };

  const renderItemRow = (item: FarmItem, count: number) => {
      if (count <= 0 && activeTab !== 'DECOR') return null; 

      let extraInfo = null;
      let decorStatus = null;
      const imgUrl = resolveImage(item.imageUrl);
      
      let containerStyle = "border-slate-200";
      let imageStyle = "";
      let label = "";

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

      if (activeTab === 'DECOR') {
          const decor = decorations.find(d => d.id === item.id);
          const rarity = getRarityInfo(decor?.cost || 0);
          
          containerStyle = rarity.border;
          imageStyle = `${rarity.glow} ${rarity.anim}`;
          label = rarity.label;

          const buffs = decor?.multiBuffs || (decor?.buff ? [decor.buff] : []);

          if (buffs.length > 0) {
              extraInfo = (
                  <div className="flex flex-wrap gap-1 mt-1">
                      {buffs.slice(0, 2).map((buff, idx) => (
                          <div key={idx} className={`text-[8px] font-black px-1.5 py-0.5 rounded border inline-flex items-center gap-1 ${rarity.bg} ${rarity.color} ${rarity.border}`}>
                              {getBuffIcon(buff.type)} {buff.value}%
                          </div>
                      ))}
                      {buffs.length > 2 && <span className="text-[8px] text-slate-400">...</span>}
                  </div>
              );
          }
          
          const isPlaced = activeDecorIds.includes(item.id);

          if (mode === 'SELECT_DECOR') {
              decorStatus = (
                  <button 
                      onClick={() => !isPlaced && onToggleDecor && onToggleDecor(item.id)}
                      disabled={isPlaced}
                      className={`px-4 py-2 rounded-xl font-black text-xs uppercase shadow-md transition-all ${isPlaced ? 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300' : 'bg-purple-500 text-white active:scale-95'}`}
                  >
                      {isPlaced ? <><Ban size={12} className="inline mr-1"/> Đang dùng</> : "Đặt vào ô"}
                  </button>
              );
          } else {
              decorStatus = <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded shadow-sm border border-green-200">Đã sở hữu</span>
          }
      }

      return (
          <div key={item.id} className={`bg-white border-4 rounded-3xl p-3 flex items-center justify-between animate-fadeIn relative overflow-hidden ${containerStyle}`}>
              {activeTab === 'DECOR' && label && (
                  <div className={`absolute top-0 left-0 px-2 py-0.5 text-[7px] font-black text-white uppercase rounded-br-lg ${containerStyle.replace('border-','bg-').replace('50','500')}`}>
                      {label}
                  </div>
              )}

              <div className="flex items-center gap-3 z-10 pt-2">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl border relative overflow-hidden ${activeTab === 'DECOR' ? `bg-white` : activeTab === 'SEEDS' ? 'bg-green-50 border-green-100' : activeTab === 'ANIMALS' ? 'bg-orange-50 border-orange-100' : 'bg-blue-50 border-blue-100'}`}>
                      {imgUrl ? <img src={imgUrl} alt={item.name} className={`w-full h-full object-contain ${imageStyle}`} /> : <div className={imageStyle}>{item.emoji}</div>}
                  </div>
                  <div>
                      <div className="font-black text-sm uppercase text-slate-700">{item.name}</div>
                      {activeTab !== 'DECOR' && <div className="text-xs font-bold text-slate-400 mb-1">Số lượng: <span className="text-blue-600">{count}</span></div>}
                      {extraInfo}
                  </div>
              </div>

              <div className="flex flex-col gap-1.5 items-end z-10">
                  {mode === 'SELECT_SEED' && activeTab === 'SEEDS' && (
                      <div className="flex gap-1">
                          <button 
                              onClick={() => onSelectSeed && onSelectSeed(item.id)}
                              className="bg-green-500 text-white px-3 py-2 rounded-xl font-black text-[10px] uppercase shadow-md active:scale-95 transition-all"
                          >
                              Gieo 1
                          </button>
                          {onPlantAllSeeds && count > 1 && (
                              <button 
                                  onClick={() => onPlantAllSeeds(item.id)}
                                  className="bg-emerald-600 text-white px-3 py-2 rounded-xl font-black text-[10px] uppercase shadow-md active:scale-95 transition-all flex items-center gap-1"
                              >
                                  <Layers size={12}/> Gieo hết
                              </button>
                          )}
                      </div>
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

                  {activeTab === 'DECOR' && decorStatus}
              </div>
          </div>
      );
  };

  const getListForTab = () => {
      switch(activeTab) {
          case 'SEEDS': return seeds.filter(s => !s.isMagic);
          case 'ANIMALS': return animals;
          case 'MACHINES': return machines;
          case 'DECOR': return decorations.filter(d => ownedDecorations.includes(d.id));
          default: return [];
      }
  };

  const currentList = getListForTab();
  const isEmpty = currentList.every(item => getOwnedCount(activeTab, item.id) <= 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-fadeIn">
        <div className="bg-white rounded-[2.5rem] w-full max-w-md h-[80vh] flex flex-col overflow-hidden border-8 border-slate-200 shadow-2xl relative">
            
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

export const InventoryModal = memo(InventoryModalComponent);
