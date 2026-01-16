
import React, { useState } from 'react';
import { UserState, FarmPlot, LessonLevel } from '../types';
import { CROPS, ANIMALS, MACHINES, PRODUCTS, RECIPES } from '../data/farmData';
import { PlotModal } from './farm/PlotModal';
import { AnimalShopModal } from './farm/AnimalShopModal';
import { MachineShopModal } from './farm/MachineShopModal';
import { ShopModal } from './farm/ShopModal';
import { BarnModal } from './farm/BarnModal';
import { useFarmGame } from '../hooks/useFarmGame';
import { Lock, Droplets, Shovel, CloudRain, Clock, Plus, Zap, Heart, ShoppingBag, Warehouse, Tractor, Factory, Smile, Bird } from 'lucide-react';
import { playSFX } from '../utils/sound';

interface FarmProps {
  userState: UserState;
  onUpdateState: (newState: UserState | ((prev: UserState) => UserState)) => void;
  onExit: () => void;
  allWords: any[]; 
  levels?: LessonLevel[]; 
  onNavigate: (target: string) => void;
  onShowAchievements: () => void;
}

type FarmSection = 'CROPS' | 'ANIMALS' | 'MACHINES' | 'PET';

export const Farm: React.FC<FarmProps> = ({ userState, onUpdateState }) => {
  const { now, plantSeed, waterPlot, harvestPlot, buyAnimal, feedAnimal, collectProduct, buyMachine, startProcessing, collectMachine, feedPet, canAfford } = useFarmGame(userState, onUpdateState);
  
  const [activeSection, setActiveSection] = useState<FarmSection>('CROPS');
  
  // Modals
  const [activeModal, setActiveModal] = useState<'NONE' | 'PLOT' | 'ANIMAL_SHOP' | 'MACHINE_SHOP' | 'FARM_SHOP' | 'BARN'>('NONE');
  const [selectedId, setSelectedId] = useState<number | null>(null);

  // --- ACTIONS HANDLERS WRAPPERS ---
  const handleShopBuy = (item: any, amount: number) => {
      const totalCost = item.cost * amount;
      if (canAfford(totalCost)) {
          if (item.type === 'CROP') {
              onUpdateState(prev => ({ 
                  ...prev, 
                  coins: prev.coins - totalCost, 
                  inventory: { ...prev.inventory, [item.id]: (prev.inventory[item.id] || 0) + amount } 
              }));
          } else { // DECOR
              onUpdateState(prev => ({ 
                  ...prev, 
                  coins: prev.coins - totalCost, 
                  decorations: [...(prev.decorations || []), item.id] 
              }));
          }
      } 
  };

  const handleSell = (itemId: string, amount: number, price: number) => {
      onUpdateState(prev => ({
          ...prev,
          coins: prev.coins + (price * amount),
          harvestedCrops: { ...prev.harvestedCrops, [itemId]: (prev.harvestedCrops?.[itemId] || 0) - amount }
      }));
  };

  // --- RENDERERS ---

  const renderSectionTabs = () => (
      <div className="flex bg-white/70 backdrop-blur-md p-1.5 rounded-[2rem] mx-4 mb-4 shadow-sm border border-white/50 justify-between">
          {[
              { id: 'CROPS', label: 'Ruộng', icon: <Tractor size={20}/>, color: 'text-green-600 bg-green-100', activeColor: 'bg-green-500 text-white' },
              { id: 'ANIMALS', label: 'Chuồng', icon: <Bird size={20}/>, color: 'text-orange-600 bg-orange-100', activeColor: 'bg-orange-500 text-white' },
              { id: 'MACHINES', label: 'Nhà Máy', icon: <Factory size={20}/>, color: 'text-blue-600 bg-blue-100', activeColor: 'bg-blue-500 text-white' },
              { id: 'PET', label: 'Sở Thú', icon: <Smile size={20}/>, color: 'text-pink-600 bg-pink-100', activeColor: 'bg-pink-500 text-white' },
          ].map(tab => (
              <button
                  key={tab.id}
                  onClick={() => setActiveSection(tab.id as FarmSection)}
                  className={`px-3 py-3 rounded-[1.5rem] text-[10px] font-black transition-all duration-300 flex flex-col items-center gap-1 w-1/4 ${
                      activeSection === tab.id 
                      ? `${tab.activeColor} shadow-md scale-105 ring-2 ring-white` 
                      : 'text-slate-400 hover:bg-white/50'
                  }`}
              >
                  {tab.icon}
                  {tab.label}
              </button>
          ))}
      </div>
  );

  const renderCrops = () => (
      <div className="grid grid-cols-2 gap-4 px-4 pb-32 animate-fadeIn">
          {userState.farmPlots.map(plot => {
              const crop = plot.cropId ? CROPS.find(c => c.id === plot.cropId) : null;
              const elapsed = crop && plot.plantedAt ? (now - plot.plantedAt) / 1000 : 0;
              const progress = crop ? Math.min(100, (elapsed / crop.growthTime) * 100) : 0;
              const isReady = progress >= 100;
              const isWatered = plot.isWatered || userState.weather === 'RAINY';

              return (
                  <button 
                    key={plot.id}
                    onClick={() => { setSelectedId(plot.id); setActiveModal('PLOT'); }}
                    className={`
                        relative aspect-square rounded-[2.5rem] transition-all duration-200 active:scale-95 border-b-[6px] group
                        ${!plot.isUnlocked ? 'bg-slate-200 border-slate-300' : isWatered ? 'bg-[#8D7254] border-[#6F5940]' : 'bg-[#D6C0A6] border-[#BCA084]'}
                        flex flex-col items-center justify-center shadow-lg overflow-hidden
                    `}
                  >
                      {!plot.isUnlocked ? (
                          <div className="flex flex-col items-center opacity-40">
                              <Lock className="text-slate-500 mb-1" size={32}/>
                              <div className="text-[10px] font-black text-slate-500 bg-slate-300 px-2 py-1 rounded-lg">Mở Khóa</div>
                          </div>
                      ) : crop ? (
                          <>
                              {/* Soil Details */}
                              <div className="absolute bottom-0 w-full h-1/3 bg-black/10 rounded-b-[2rem]"></div>
                              
                              <div className={`text-6xl transition-all duration-500 filter drop-shadow-md z-10 ${isReady ? 'animate-bounce' : 'scale-75 opacity-90 grayscale-[0.3]'}`}>
                                  {crop.emoji}
                              </div>
                              {/* Progress Ring or Bar */}
                              {!isReady && (
                                  <div className="w-16 h-3 bg-black/30 rounded-full mt-2 overflow-hidden border border-white/20 backdrop-blur-sm z-10">
                                      <div className="h-full bg-green-400 transition-all duration-1000" style={{ width: `${progress}%` }}></div>
                                  </div>
                              )}
                              {isReady && (
                                  <div className="absolute -top-3 right-0 bg-yellow-400 text-yellow-900 text-[10px] font-black px-3 py-1 rounded-full shadow-md animate-pulse border-2 border-white z-20">
                                      THU HOẠCH!
                                  </div>
                              )}
                              {isWatered && !isReady && (
                                  <div className="absolute top-2 right-2 bg-blue-500/20 p-1.5 rounded-full border border-blue-300/30 backdrop-blur-sm z-10">
                                      <Droplets size={14} className="text-blue-100 fill-blue-200" />
                                  </div>
                              )}
                          </>
                      ) : (
                          <div className="text-4xl opacity-20 text-[#6F5940] group-hover:scale-110 transition-transform"><Shovel /></div>
                      )}
                  </button>
              );
          })}
      </div>
  );

  const renderAnimals = () => {
      // Ensure 4 slots always rendered
      const slots = userState.livestockSlots && userState.livestockSlots.length > 0 
        ? userState.livestockSlots 
        : Array(4).fill(null).map((_,i) => ({ id: i+1, isUnlocked: true, animalId: null, fedAt: null }));

      return (
          <div className="grid grid-cols-2 gap-4 px-4 pb-32 animate-fadeIn">
              {slots.map(slot => {
                  const animal = slot.animalId ? ANIMALS.find(a => a.id === slot.animalId) : null;
                  const isFed = !!slot.fedAt;
                  const elapsed = isFed && animal ? (now - (slot.fedAt || 0)) / 1000 : 0;
                  const progress = animal ? Math.min(100, (elapsed / animal.produceTime) * 100) : 0;
                  const isReady = isFed && progress >= 100;

                  return (
                      <button 
                        key={slot.id}
                        onClick={() => {
                            if (!animal) { setActiveModal('ANIMAL_SHOP'); setSelectedId(slot.id); }
                            else if (isReady) collectProduct(slot.id);
                            else if (!isFed) feedAnimal(slot.id);
                        }}
                        className={`
                            relative aspect-square rounded-[2.5rem] transition-all duration-200 active:scale-95 border-b-[6px] 
                            ${!animal ? 'bg-slate-100 border-slate-200 border-dashed' : 'bg-amber-50 border-amber-200'}
                            flex flex-col items-center justify-center shadow-md overflow-hidden
                        `}
                      >
                          {/* Fence Decor */}
                          {animal && <div className="absolute bottom-0 w-full h-8 border-t-4 border-amber-800/20 bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] opacity-50"></div>}

                          {!animal ? (
                              <div className="flex flex-col items-center text-slate-400">
                                  <Plus size={32} className="mb-2 bg-slate-200 rounded-full p-1"/>
                                  <span className="text-[10px] font-black uppercase">Mua vật nuôi</span>
                              </div>
                          ) : (
                              <>
                                  <div className={`text-6xl filter drop-shadow-sm transition-all z-10 ${!isFed ? 'grayscale opacity-70 scale-90' : isReady ? 'animate-bounce' : 'animate-walk'}`}>
                                      {animal.emoji}
                                  </div>
                                  
                                  {isReady ? (
                                      <div className="absolute -top-3 -right-2 bg-green-500 text-white px-3 py-1 rounded-full text-[10px] font-black shadow-md border-2 border-white animate-pulse z-20">
                                          THU HOẠCH
                                      </div>
                                  ) : !isFed ? (
                                      <div className="absolute bottom-2 bg-orange-500 text-white px-3 py-1 rounded-full text-[10px] font-black shadow-sm flex items-center gap-1 z-20">
                                          <Zap size={10} fill="currentColor"/> CHO ĂN
                                      </div>
                                  ) : (
                                      <div className="w-16 h-3 bg-slate-200/50 rounded-full mt-2 overflow-hidden border border-white z-10">
                                          <div className="h-full bg-orange-400 transition-all duration-1000" style={{ width: `${progress}%` }}></div>
                                      </div>
                                  )}
                              </>
                          )}
                      </button>
                  )
              })}
          </div>
      );
  };

  const renderMachines = () => {
      const slots = userState.machineSlots && userState.machineSlots.length > 0
        ? userState.machineSlots
        : Array(4).fill(null).map((_,i) => ({ id: i+1, isUnlocked: true, machineId: null, activeRecipeId: null, startedAt: null }));

      return (
          <div className="grid grid-cols-2 gap-4 px-4 pb-32 animate-fadeIn">
              {slots.map(slot => {
                  const machine = slot.machineId ? MACHINES.find(m => m.id === slot.machineId) : null;
                  const recipe = slot.activeRecipeId ? RECIPES.find(r => r.id === slot.activeRecipeId) : null;
                  const elapsed = recipe && slot.startedAt ? (now - slot.startedAt) / 1000 : 0;
                  const progress = recipe ? Math.min(100, (elapsed / recipe.duration) * 100) : 0;
                  const isReady = recipe && progress >= 100;
                  const product = recipe ? PRODUCTS.find(p => p.id === recipe.outputId) : null;

                  return (
                      <button 
                        key={slot.id}
                        onClick={() => {
                            if (!machine) { setActiveModal('MACHINE_SHOP'); setSelectedId(slot.id); }
                            else if (isReady) collectMachine(slot.id);
                            else if (!recipe) { 
                                // Auto-start demo
                                const firstRecipe = RECIPES.find(r => r.machineId === machine.id);
                                if(firstRecipe) startProcessing(slot.id, firstRecipe.id);
                            }
                        }}
                        className={`
                            relative aspect-square rounded-[2.5rem] transition-all duration-200 active:scale-95 border-b-[6px]
                            ${!machine ? 'bg-slate-100 border-slate-200 border-dashed' : 'bg-blue-50 border-blue-200'}
                            flex flex-col items-center justify-center shadow-md overflow-hidden
                        `}
                      >
                          {/* Industrial Floor */}
                          {machine && <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-blue-50 opacity-50"></div>}

                          {!machine ? (
                              <div className="flex flex-col items-center text-slate-400">
                                  <Plus size={32} className="mb-2 bg-slate-200 rounded-full p-1"/>
                                  <span className="text-[10px] font-black uppercase">Mua máy móc</span>
                              </div>
                          ) : (
                              <>
                                  <div className={`text-6xl filter drop-shadow-sm z-10 ${recipe && !isReady ? 'animate-pulse' : ''}`}>{machine.emoji}</div>
                                  
                                  {recipe ? (
                                      isReady ? (
                                          <div className="absolute inset-0 bg-white/80 rounded-[2.3rem] flex flex-col items-center justify-center backdrop-blur-sm z-20">
                                              <div className="text-5xl animate-bounce mb-1">{product?.emoji}</div>
                                              <span className="text-[10px] font-black text-green-600 bg-green-100 px-2 py-1 rounded-lg">XONG RỒI!</span>
                                          </div>
                                      ) : (
                                          <div className="absolute bottom-2 w-16 h-3 bg-slate-200 rounded-full overflow-hidden border border-white z-10">
                                              <div className="h-full bg-blue-500 transition-all duration-1000" style={{ width: `${progress}%` }}></div>
                                          </div>
                                      )
                                  ) : (
                                      <div className="absolute bottom-2 bg-blue-500 text-white px-3 py-1 rounded-full text-[10px] font-black shadow-sm flex items-center gap-1 z-10">
                                          <Zap size={10} fill="currentColor"/> CHẾ BIẾN
                                      </div>
                                  )}
                              </>
                          )}
                      </button>
                  )
              })}
          </div>
      );
  };

  const renderPetZoo = () => (
      <div className="px-4 pb-32 animate-fadeIn flex flex-col gap-4">
          {/* Main Pet Enclosure */}
          <div className="bg-[#A3D980] rounded-[3rem] p-6 border-8 border-[#86C260] shadow-xl relative min-h-[300px] flex flex-col items-center justify-center overflow-hidden">
              {/* Decoration Elements */}
              <div className="absolute top-4 left-4 text-4xl opacity-50">🌳</div>
              <div className="absolute bottom-8 right-4 text-3xl opacity-50">🪨</div>
              <div className="absolute top-10 right-10 text-2xl opacity-40">🌼</div>

              <div className="text-[8rem] animate-walk cursor-pointer drop-shadow-2xl transition-transform active:scale-110 z-10" onClick={() => playSFX('eat')}>
                  🐶
              </div>
              
              <div className="bg-white/80 backdrop-blur-md px-6 py-3 rounded-full mt-4 flex flex-col items-center gap-1 shadow-lg border-2 border-white z-10">
                  <div className="text-xs font-black text-slate-500 uppercase tracking-widest">Cấp độ {userState.petLevel || 1}</div>
                  <div className="w-32 h-4 bg-slate-200 rounded-full overflow-hidden border border-slate-300">
                      <div className="h-full bg-pink-500 transition-all duration-500" style={{ width: `${userState.petHappiness || 50}%` }}></div>
                  </div>
                  <div className="text-[10px] font-bold text-pink-500">Hạnh phúc {userState.petHappiness || 50}%</div>
              </div>
          </div>

          <div className="bg-white p-4 rounded-[2rem] shadow-lg border-2 border-slate-100">
              <h4 className="font-black text-slate-700 text-xs uppercase mb-3 text-center">Cho bé ăn nào!</h4>
              <div className="grid grid-cols-4 gap-3">
                  {['carrot', 'milk', 'egg', 'apple'].map(foodId => {
                      const food = [...CROPS, ...PRODUCTS].find(f => f.id === foodId);
                      const count = userState.harvestedCrops?.[foodId] || 0;
                      if (!food) return null;
                      
                      return (
                          <button 
                            key={foodId}
                            onClick={() => feedPet(foodId)}
                            className={`
                                aspect-square rounded-2xl bg-slate-50 border-b-4 border-slate-200 flex flex-col items-center justify-center shadow-sm active:scale-95 transition-all relative
                                ${count > 0 ? 'hover:border-pink-300 hover:bg-pink-50' : 'opacity-50 grayscale'}
                            `}
                          >
                              <span className="text-2xl mb-1">{food.emoji}</span>
                              <div className="absolute -top-2 -right-2 bg-slate-800 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-sm">{count}</div>
                          </button>
                      )
                  })}
              </div>
          </div>
      </div>
  );

  return (
    <div className="w-full h-full bg-[#E0F7FA] relative overflow-y-auto no-scrollbar">
        {/* Background Decoration */}
        <div className="absolute inset-0 pointer-events-none opacity-20" style={{ backgroundImage: 'radial-gradient(#4DD0E1 2px, transparent 2px)', backgroundSize: '24px 24px' }}></div>
        
        {/* Farm Header Actions */}
        <div className="px-4 py-2 flex gap-3 z-10 relative">
            <button 
                onClick={() => setActiveModal('FARM_SHOP')}
                className="flex-1 bg-pink-500 text-white p-3 rounded-2xl shadow-lg border-b-4 border-pink-700 active:border-b-0 active:translate-y-1 flex items-center justify-center gap-2 font-black text-xs uppercase transition-all"
            >
                <ShoppingBag size={18} /> Cửa Hàng
            </button>
            <button 
                onClick={() => setActiveModal('BARN')}
                className="flex-1 bg-amber-500 text-white p-3 rounded-2xl shadow-lg border-b-4 border-amber-700 active:border-b-0 active:translate-y-1 flex items-center justify-center gap-2 font-black text-xs uppercase transition-all"
            >
                <Warehouse size={18} /> Kho Đồ
            </button>
        </div>

        {/* Weather Indicator */}
        {userState.weather === 'RAINY' && (
            <div className="mx-4 mt-2 mb-2 bg-blue-100/80 backdrop-blur-sm px-4 py-2 rounded-xl flex items-center justify-center gap-2 text-blue-600 font-bold text-xs shadow-inner border border-blue-200">
                <CloudRain size={16} /> Trời đang mưa, cây sẽ tự uống nước!
            </div>
        )}

        <div className="pt-2 sticky top-0 z-20 bg-[#E0F7FA]/95 backdrop-blur-sm pb-1">
            {renderSectionTabs()}
        </div>

        <div className="relative z-10">
            {activeSection === 'CROPS' && renderCrops()}
            {activeSection === 'ANIMALS' && renderAnimals()}
            {activeSection === 'MACHINES' && renderMachines()}
            {activeSection === 'PET' && renderPetZoo()}
        </div>

        {/* Modals */}
        {activeModal === 'PLOT' && selectedId && (
            <PlotModal 
                plot={userState.farmPlots.find(p => p.id === selectedId)!}
                inventory={userState.inventory}
                waterDrops={userState.waterDrops}
                fertilizers={userState.fertilizers}
                userCoins={userState.coins}
                weather={userState.weather}
                nextPlotCost={500}
                onAction={(action, data) => {
                    if (action === 'PLANT') plantSeed(selectedId, data);
                    if (action === 'WATER') waterPlot(selectedId, CROPS[0]); 
                    if (action === 'HARVEST') harvestPlot(selectedId, CROPS[0]); 
                    setActiveModal('NONE');
                }}
                onClose={() => setActiveModal('NONE')} 
            />
        )}

        {activeModal === 'ANIMAL_SHOP' && selectedId && (
            <AnimalShopModal 
                animals={ANIMALS}
                crops={[...CROPS, ...PRODUCTS]}
                products={PRODUCTS}
                userLevel={userState.petLevel || 1}
                userCoins={userState.coins}
                onBuy={(animal) => { buyAnimal(selectedId, animal.id); setActiveModal('NONE'); }}
                onClose={() => setActiveModal('NONE')}
            />
        )}

        {activeModal === 'MACHINE_SHOP' && selectedId && (
            <MachineShopModal 
                machines={MACHINES}
                recipes={RECIPES}
                allItems={[...CROPS, ...PRODUCTS]}
                userLevel={userState.petLevel || 1}
                userCoins={userState.coins}
                onBuy={(machine) => { buyMachine(selectedId, machine.id); setActiveModal('NONE'); }}
                onClose={() => setActiveModal('NONE')}
            />
        )}

        {activeModal === 'FARM_SHOP' && (
            <ShopModal 
                crops={CROPS} 
                decorations={[]} 
                userState={userState} 
                onBuySeed={(c, a) => handleShopBuy(c, a)} 
                onBuyDecor={(d) => handleShopBuy(d, 1)} 
                onClose={() => setActiveModal('NONE')} 
            />
        )}

        {activeModal === 'BARN' && (
            <BarnModal 
                crops={[...CROPS, ...PRODUCTS]} 
                harvested={userState.harvestedCrops || {}} 
                activeOrders={userState.activeOrders || []}
                onSell={(id) => {
                    const item = [...CROPS, ...PRODUCTS].find(i => i.id === id);
                    if (item) handleSell(id, 1, item.sellPrice);
                }}
                onSellAll={(id) => {}}
                onSellEverything={() => {}}
                onClose={() => setActiveModal('NONE')}
            />
        )}
    </div>
  );
};
