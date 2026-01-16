
import React, { useState } from 'react';
import { UserState, FarmPlot, LessonLevel, LivestockSlot, MachineSlot } from '../types';
import { CROPS, ANIMALS, MACHINES, PRODUCTS, RECIPES } from '../data/farmData';
import { PlotModal } from './farm/PlotModal';
import { AnimalShopModal } from './farm/AnimalShopModal';
import { MachineShopModal } from './farm/MachineShopModal';
import { useFarmGame } from '../hooks/useFarmGame';
import { Lock, Droplets, Shovel, CloudRain, Clock, Plus, Zap, ArrowRight, Heart } from 'lucide-react';
import { Avatar } from './Avatar';

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
  const { now, plantSeed, waterPlot, harvestPlot, buyAnimal, feedAnimal, collectProduct, buyMachine, startProcessing, collectMachine, feedPet } = useFarmGame(userState, onUpdateState);
  
  const [activeSection, setActiveSection] = useState<FarmSection>('CROPS');
  
  // Modals
  const [activeModal, setActiveModal] = useState<'NONE' | 'PLOT' | 'ANIMAL_SHOP' | 'MACHINE_SHOP'>('NONE');
  const [selectedId, setSelectedId] = useState<number | null>(null);

  // --- RENDERERS ---

  const renderSectionTabs = () => (
      <div className="flex bg-white/50 backdrop-blur-md p-1.5 rounded-[2rem] mx-4 mb-4 shadow-sm border border-white/40">
          {[
              { id: 'CROPS', label: 'Trồng Trọt', icon: '🌱', color: 'text-green-600 bg-green-100' },
              { id: 'ANIMALS', label: 'Chăn Nuôi', icon: '🐔', color: 'text-orange-600 bg-orange-100' },
              { id: 'MACHINES', label: 'Nhà Máy', icon: '🏭', color: 'text-blue-600 bg-blue-100' },
              { id: 'PET', label: 'Thú Cưng', icon: '🐶', color: 'text-pink-600 bg-pink-100' },
          ].map(tab => (
              <button
                  key={tab.id}
                  onClick={() => setActiveSection(tab.id as FarmSection)}
                  className={`flex-1 py-3 rounded-[1.5rem] text-xs font-black transition-all duration-300 flex flex-col items-center gap-1 ${
                      activeSection === tab.id 
                      ? `${tab.color.replace('text', 'bg').replace('bg', 'text-white')} shadow-md scale-105` 
                      : 'text-slate-400 hover:bg-white/50'
                  }`}
              >
                  <span className="text-xl">{tab.icon}</span>
                  {tab.label}
              </button>
          ))}
      </div>
  );

  const renderCrops = () => (
      <div className="grid grid-cols-2 gap-4 px-4 pb-24 animate-fadeIn">
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
                        flex flex-col items-center justify-center shadow-lg
                    `}
                  >
                      {!plot.isUnlocked ? (
                          <div className="flex flex-col items-center opacity-40">
                              <Lock className="text-slate-500 mb-1" size={32}/>
                              <div className="text-[10px] font-black text-slate-500 bg-slate-300 px-2 py-1 rounded-lg">Mở Khóa</div>
                          </div>
                      ) : crop ? (
                          <>
                              <div className={`text-6xl transition-all duration-500 filter drop-shadow-md ${isReady ? 'animate-bounce' : 'scale-75 opacity-90 grayscale-[0.3]'}`}>
                                  {crop.emoji}
                              </div>
                              {/* Progress Ring or Bar */}
                              {!isReady && (
                                  <div className="w-16 h-3 bg-black/20 rounded-full mt-2 overflow-hidden border border-white/20">
                                      <div className="h-full bg-green-400 transition-all duration-1000" style={{ width: `${progress}%` }}></div>
                                  </div>
                              )}
                              {isReady && (
                                  <div className="absolute -top-3 right-0 bg-yellow-400 text-yellow-900 text-[10px] font-black px-3 py-1 rounded-full shadow-md animate-pulse border-2 border-white">
                                      THU HOẠCH!
                                  </div>
                              )}
                              {isWatered && !isReady && (
                                  <div className="absolute top-2 right-2 bg-blue-500/20 p-1.5 rounded-full border border-blue-300/30 backdrop-blur-sm">
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
      const slots = userState.livestockSlots || Array(4).fill(null).map((_,i) => ({ id: i+1, isUnlocked: true, animalId: null, fedAt: null }));
      return (
          <div className="grid grid-cols-2 gap-4 px-4 pb-24 animate-fadeIn">
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
                            ${!animal ? 'bg-slate-100 border-slate-200 border-dashed' : 'bg-orange-50 border-orange-200'}
                            flex flex-col items-center justify-center shadow-md
                        `}
                      >
                          {!animal ? (
                              <div className="flex flex-col items-center text-slate-400">
                                  <Plus size={32} className="mb-2"/>
                                  <span className="text-xs font-black uppercase">Mua con giống</span>
                              </div>
                          ) : (
                              <>
                                  <div className={`text-6xl filter drop-shadow-sm transition-all ${!isFed ? 'grayscale opacity-70 scale-90' : isReady ? 'animate-bounce' : ''}`}>
                                      {animal.emoji}
                                  </div>
                                  
                                  {isReady ? (
                                      <div className="absolute -top-3 -right-2 bg-green-500 text-white px-3 py-1 rounded-full text-[10px] font-black shadow-md border-2 border-white animate-pulse">
                                          THU HOẠCH
                                      </div>
                                  ) : !isFed ? (
                                      <div className="absolute bottom-2 bg-orange-500 text-white px-3 py-1 rounded-full text-[10px] font-black shadow-sm flex items-center gap-1">
                                          <Zap size={10} fill="currentColor"/> CHO ĂN
                                      </div>
                                  ) : (
                                      <div className="w-16 h-3 bg-slate-200 rounded-full mt-2 overflow-hidden border border-white">
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
      const slots = userState.machineSlots || Array(4).fill(null).map((_,i) => ({ id: i+1, isUnlocked: true, machineId: null, activeRecipeId: null, startedAt: null }));
      return (
          <div className="grid grid-cols-2 gap-4 px-4 pb-24 animate-fadeIn">
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
                                // Simple auto-start first available recipe for demo purposes 
                                // In real app, open recipe selector modal
                                const firstRecipe = RECIPES.find(r => r.machineId === machine.id);
                                if(firstRecipe) startProcessing(slot.id, firstRecipe.id);
                            }
                        }}
                        className={`
                            relative aspect-square rounded-[2.5rem] transition-all duration-200 active:scale-95 border-b-[6px]
                            ${!machine ? 'bg-slate-100 border-slate-200 border-dashed' : 'bg-blue-50 border-blue-200'}
                            flex flex-col items-center justify-center shadow-md
                        `}
                      >
                          {!machine ? (
                              <div className="flex flex-col items-center text-slate-400">
                                  <Plus size={32} className="mb-2"/>
                                  <span className="text-xs font-black uppercase">Mua máy móc</span>
                              </div>
                          ) : (
                              <>
                                  <div className="text-6xl filter drop-shadow-sm">{machine.emoji}</div>
                                  
                                  {recipe ? (
                                      isReady ? (
                                          <div className="absolute inset-0 bg-white/80 rounded-[2.3rem] flex flex-col items-center justify-center backdrop-blur-sm">
                                              <div className="text-5xl animate-bounce mb-1">{product?.emoji}</div>
                                              <span className="text-[10px] font-black text-green-600 bg-green-100 px-2 py-1 rounded-lg">XONG RỒI!</span>
                                          </div>
                                      ) : (
                                          <div className="absolute bottom-2 w-16 h-3 bg-slate-200 rounded-full overflow-hidden border border-white">
                                              <div className="h-full bg-blue-500 transition-all duration-1000" style={{ width: `${progress}%` }}></div>
                                          </div>
                                      )
                                  ) : (
                                      <div className="absolute bottom-2 bg-blue-500 text-white px-3 py-1 rounded-full text-[10px] font-black shadow-sm flex items-center gap-1">
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

  const renderPet = () => (
      <div className="flex flex-col items-center px-6 pb-24 animate-fadeIn h-full justify-center">
          <div className="bg-white p-8 rounded-[3rem] shadow-2xl border-8 border-pink-200 relative mb-6 w-full max-w-sm flex flex-col items-center">
              <div className="text-[10rem] animate-bounce-slow filter drop-shadow-lg">🐶</div>
              
              {/* Stats */}
              <div className="w-full mt-4 space-y-2">
                  <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-widest">
                      <span>Cấp độ {userState.petLevel || 1}</span>
                      <span>Hạnh phúc</span>
                  </div>
                  <div className="h-6 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200 relative">
                      <div className="h-full bg-pink-400 transition-all duration-500" style={{ width: `${userState.petHappiness || 50}%` }}></div>
                      <div className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-white/90 shadow-sm">{userState.petHappiness || 50}%</div>
                  </div>
              </div>
          </div>

          <div className="grid grid-cols-4 gap-3 w-full max-w-sm">
              {['carrot', 'milk', 'egg', 'apple'].map(foodId => {
                  const food = [...CROPS, ...PRODUCTS].find(f => f.id === foodId);
                  const count = userState.harvestedCrops?.[foodId] || 0;
                  if (!food) return null;
                  
                  return (
                      <button 
                        key={foodId}
                        onClick={() => feedPet(foodId)}
                        className={`
                            aspect-square rounded-2xl bg-white border-b-4 border-slate-200 flex flex-col items-center justify-center shadow-sm active:scale-95 transition-all
                            ${count > 0 ? 'hover:border-pink-300 hover:bg-pink-50' : 'opacity-50 grayscale'}
                        `}
                      >
                          <span className="text-2xl mb-1">{food.emoji}</span>
                          <span className="text-[10px] font-bold text-slate-400">x{count}</span>
                      </button>
                  )
              })}
          </div>
          <p className="mt-4 text-xs font-bold text-slate-400 text-center">Cho thú cưng ăn để nhận quà bất ngờ!</p>
      </div>
  );

  return (
    <div className="w-full h-full bg-[#E0F7FA] relative overflow-y-auto no-scrollbar">
        {/* Background Decoration */}
        <div className="absolute inset-0 pointer-events-none opacity-20" style={{ backgroundImage: 'radial-gradient(#4DD0E1 2px, transparent 2px)', backgroundSize: '24px 24px' }}></div>
        
        {/* Weather Indicator */}
        {userState.weather === 'RAINY' && (
            <div className="absolute top-4 right-4 z-10 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-2 text-blue-600 font-bold text-xs shadow-sm border border-blue-100">
                <CloudRain size={16} /> Trời đang mưa
            </div>
        )}

        <div className="pt-4 sticky top-0 z-20 bg-[#E0F7FA]/90 backdrop-blur-sm">
            {renderSectionTabs()}
        </div>

        <div className="relative z-10">
            {activeSection === 'CROPS' && renderCrops()}
            {activeSection === 'ANIMALS' && renderAnimals()}
            {activeSection === 'MACHINES' && renderMachines()}
            {activeSection === 'PET' && renderPet()}
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
    </div>
  );
};
