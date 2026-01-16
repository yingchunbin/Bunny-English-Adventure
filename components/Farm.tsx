
import React, { useState } from 'react';
import { UserState } from '../types';
import { CROPS, ANIMALS, MACHINES, PRODUCTS, RECIPES } from '../data/farmData';
import { PlotModal } from './farm/PlotModal';
import { AnimalShopModal } from './farm/AnimalShopModal';
import { MachineShopModal } from './farm/MachineShopModal';
import { MissionModal } from './farm/MissionModal';
import { OrderBoard } from './farm/OrderBoard';
import { Achievements } from './Achievements';
import { useFarmGame } from '../hooks/useFarmGame';
import { Lock, Droplets, Shovel, CloudRain, Clock, Plus, Zap, Heart, Tractor, Factory, Smile, Bird, Scroll, Truck, Trophy } from 'lucide-react';
import { playSFX } from '../utils/sound';

interface FarmProps {
  userState: UserState;
  onUpdateState: (newState: UserState | ((prev: UserState) => UserState)) => void;
  onExit: () => void;
}

type FarmSection = 'CROPS' | 'ANIMALS' | 'MACHINES' | 'PET';

export const Farm: React.FC<FarmProps> = ({ userState, onUpdateState }) => {
  const { now, plantSeed, waterPlot, harvestPlot, buyAnimal, feedAnimal, collectProduct, buyMachine, startProcessing, collectMachine, feedPet, canAfford, deliverOrder, addReward } = useFarmGame(userState, onUpdateState);
  
  const [activeSection, setActiveSection] = useState<FarmSection>('CROPS');
  const [activeModal, setActiveModal] = useState<'NONE' | 'PLOT' | 'ANIMAL_SHOP' | 'MACHINE_SHOP' | 'MISSIONS' | 'ORDERS' | 'ACHIEVEMENTS'>('NONE');
  const [selectedId, setSelectedId] = useState<number | null>(null);

  // --- EXPANSION LOGIC ---
  const handleExpand = (type: 'PLOT' | 'PEN' | 'MACHINE') => {
      const baseCost = 500;
      let currentCount = 0;
      if (type === 'PLOT') currentCount = userState.farmPlots.length;
      if (type === 'PEN') currentCount = userState.livestockSlots?.length || 0;
      if (type === 'MACHINE') currentCount = userState.machineSlots?.length || 0;

      const cost = baseCost * Math.pow(1.5, Math.max(0, currentCount - 2)); 
      const finalCost = Math.floor(cost / 100) * 100; 

      if (window.confirm(`Mở rộng thêm ô mới với giá ${finalCost} Xu?`)) {
          if (canAfford(finalCost)) {
              playSFX('success');
              onUpdateState(prev => {
                  const newState = { ...prev, coins: prev.coins - finalCost };
                  const newId = Date.now();
                  
                  if (type === 'PLOT') {
                      newState.farmPlots = [...prev.farmPlots, { id: newId, isUnlocked: true, cropId: null, plantedAt: null }];
                  } else if (type === 'PEN') {
                      newState.livestockSlots = [...(prev.livestockSlots || []), { id: newId, isUnlocked: true, animalId: null, fedAt: null }];
                  } else if (type === 'MACHINE') {
                      newState.machineSlots = [...(prev.machineSlots || []), { id: newId, isUnlocked: true, machineId: null, activeRecipeId: null, startedAt: null }];
                  }
                  return newState;
              });
          } else {
              playSFX('wrong');
              alert("Bạn không đủ tiền!");
          }
      }
  };

  const DUMMY_MISSIONS = [
      { id: 'm1', desc: 'Thu hoạch 5 Cà rốt', type: 'HARVEST', category: 'DAILY', target: 5, current: 0, reward: { type: 'COIN', amount: 50 }, completed: false, claimed: false },
      { id: 'm2', desc: 'Cho Gà ăn', type: 'FEED', category: 'DAILY', target: 3, current: 0, reward: { type: 'WATER', amount: 5 }, completed: false, claimed: false },
      { id: 'm3', desc: 'Tưới nước', type: 'WATER', category: 'DAILY', target: 10, current: 0, reward: { type: 'FERTILIZER', amount: 1 }, completed: false, claimed: false },
  ];

  // Ensure missions exist
  if (!userState.missions || userState.missions.length === 0) {
      onUpdateState(prev => ({ ...prev, missions: DUMMY_MISSIONS as any }));
  }

  // --- RENDERERS ---

  const renderSectionTabs = () => (
      <div className="flex bg-white/80 backdrop-blur-sm p-1 rounded-2xl mx-4 mb-4 shadow-sm border border-white sticky top-0 z-20">
          {[
              { id: 'CROPS', label: 'Ruộng', icon: <Tractor size={18}/>, color: 'text-green-600 bg-green-100' },
              { id: 'ANIMALS', label: 'Chuồng', icon: <Bird size={18}/>, color: 'text-orange-600 bg-orange-100' },
              { id: 'MACHINES', label: 'Nhà Máy', icon: <Factory size={18}/>, color: 'text-blue-600 bg-blue-100' },
              { id: 'PET', label: 'Thú Cưng', icon: <Smile size={18}/>, color: 'text-pink-600 bg-pink-100' },
          ].map(tab => (
              <button
                  key={tab.id}
                  onClick={() => setActiveSection(tab.id as FarmSection)}
                  className={`flex-1 py-3 rounded-xl text-[10px] font-black transition-all flex flex-col items-center gap-1 ${
                      activeSection === tab.id 
                      ? `${tab.color.replace('text', 'bg').replace('bg', 'text-white')} shadow-md scale-105` 
                      : 'text-slate-400 hover:bg-white/50'
                  }`}
              >
                  {tab.icon}
                  {tab.label}
              </button>
          ))}
      </div>
  );

  const renderHUD = () => (
      <div className="px-4 mb-4 flex gap-3 justify-center">
          <button onClick={() => setActiveModal('MISSIONS')} className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-indigo-100 text-indigo-600 font-bold text-xs hover:scale-105 transition-transform">
              <Scroll size={16} /> Nhiệm Vụ
          </button>
          <button onClick={() => setActiveModal('ORDERS')} className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-orange-100 text-orange-600 font-bold text-xs hover:scale-105 transition-transform">
              <Truck size={16} /> Đơn Hàng
          </button>
          <button onClick={() => setActiveModal('ACHIEVEMENTS')} className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-yellow-100 text-yellow-600 font-bold text-xs hover:scale-105 transition-transform">
              <Trophy size={16} /> Thành Tựu
          </button>
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
                        relative aspect-square rounded-[2rem] transition-all duration-200 active:scale-95 border-b-[6px] group overflow-hidden
                        ${!plot.isUnlocked ? 'bg-slate-200 border-slate-300' : isWatered ? 'bg-[#795548] border-[#5D4037]' : 'bg-[#A1887F] border-[#8D6E63]'}
                        shadow-lg flex flex-col items-center justify-center
                    `}
                  >
                      {!plot.isUnlocked ? (
                          <div className="flex flex-col items-center opacity-40">
                              <Lock className="text-slate-500 mb-1" size={32}/>
                              <div className="text-[10px] font-black text-slate-500 bg-slate-300 px-2 py-1 rounded-lg">Mở Khóa</div>
                          </div>
                      ) : crop ? (
                          <>
                              <div className={`text-6xl transition-all duration-500 z-10 ${isReady ? 'animate-bounce drop-shadow-lg' : 'scale-75 opacity-90 grayscale-[0.3]'}`}>
                                  {crop.emoji}
                              </div>
                              {!isReady && (
                                  <div className="absolute bottom-4 w-16 h-2 bg-black/20 rounded-full mt-2 overflow-hidden border border-white/20 backdrop-blur-sm z-10">
                                      <div className="h-full bg-green-400 transition-all duration-1000" style={{ width: `${progress}%` }}></div>
                                  </div>
                              )}
                              {isReady && (
                                  <div className="absolute -top-3 right-0 bg-yellow-400 text-yellow-900 text-[10px] font-black px-2 py-1 rounded-full shadow-md animate-pulse border-2 border-white z-20">Thu Hoạch!</div>
                              )}
                              {isWatered && !isReady && (
                                  <div className="absolute top-2 right-2 text-blue-300 opacity-80"><Droplets size={16} fill="currentColor" /></div>
                              )}
                          </>
                      ) : (
                          <div className="text-white/20 text-4xl group-hover:scale-110 transition-transform"><Plus size={40} strokeWidth={4}/></div>
                      )}
                  </button>
              );
          })}
          <button onClick={() => handleExpand('PLOT')} className="aspect-square rounded-[2rem] border-4 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 gap-2 hover:bg-white/50 transition-colors bg-white/20">
              <Plus size={32} />
              <span className="text-[10px] font-black uppercase">Mở đất</span>
          </button>
      </div>
  );

  const renderAnimals = () => {
      const slots = userState.livestockSlots || [];
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
                            if (!animal) { setSelectedId(slot.id); setActiveModal('ANIMAL_SHOP'); }
                            else if (isReady) collectProduct(slot.id);
                            else if (!isFed) feedAnimal(slot.id);
                        }}
                        className={`
                            relative aspect-square rounded-[2rem] transition-all duration-200 active:scale-95 border-b-[6px] shadow-md overflow-hidden flex flex-col items-center justify-center
                            ${!slot.isUnlocked ? 'bg-slate-200 border-slate-300' : !animal ? 'bg-white border-slate-200 border-dashed' : 'bg-[#FFF3E0] border-[#FFE0B2]'}
                        `}
                      >
                          {!slot.isUnlocked ? (
                              <Lock className="text-slate-400" />
                          ) : !animal ? (
                              <div className="flex flex-col items-center text-slate-300">
                                  <Plus size={32} />
                                  <span className="text-[10px] font-black uppercase mt-1">Mua vật nuôi</span>
                              </div>
                          ) : (
                              <>
                                  <div className={`text-6xl z-10 transition-all ${!isFed ? 'grayscale opacity-60 scale-90' : isReady ? 'animate-bounce' : 'animate-walk'}`}>
                                      {animal.emoji}
                                  </div>
                                  {isReady && <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-[10px] font-black shadow-md z-20">THU HOẠCH</div>}
                                  {!isFed && <div className="absolute bottom-4 bg-orange-500 text-white px-2 py-1 rounded-full text-[10px] font-black shadow-md z-20 flex items-center gap-1"><Zap size={10}/> ĐÓI</div>}
                                  {isFed && !isReady && (
                                      <div className="absolute bottom-4 w-16 h-2 bg-black/10 rounded-full overflow-hidden border border-white z-10">
                                          <div className="h-full bg-orange-400 transition-all duration-1000" style={{ width: `${progress}%` }}></div>
                                      </div>
                                  )}
                              </>
                          )}
                      </button>
                  )
              })}
              <button onClick={() => handleExpand('PEN')} className="aspect-square rounded-[2rem] border-4 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 gap-2 hover:bg-white/50 transition-colors bg-white/20">
                  <Plus size={32} />
                  <span className="text-[10px] font-black uppercase">Xây chuồng</span>
              </button>
          </div>
      );
  };

  const renderMachines = () => {
      const slots = userState.machineSlots || [];
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
                            if (!machine) { setSelectedId(slot.id); setActiveModal('MACHINE_SHOP'); }
                            else if (isReady) collectMachine(slot.id);
                            else if (!recipe) { 
                                const firstRecipe = RECIPES.find(r => r.machineId === machine.id);
                                if(firstRecipe) startProcessing(slot.id, firstRecipe.id);
                            }
                        }}
                        className={`
                            relative aspect-square rounded-[2rem] transition-all duration-200 active:scale-95 border-b-[6px] shadow-lg overflow-hidden flex flex-col items-center justify-center
                            ${!slot.isUnlocked ? 'bg-slate-200 border-slate-300' : !machine ? 'bg-white border-slate-200 border-dashed' : 'bg-slate-50 border-slate-200'}
                        `}
                      >
                          {!slot.isUnlocked ? (
                              <Lock className="text-slate-400" />
                          ) : !machine ? (
                              <div className="flex flex-col items-center text-slate-300">
                                  <Plus size={32} />
                                  <span className="text-[10px] font-black uppercase mt-1">Mua máy</span>
                              </div>
                          ) : (
                              <>
                                  <div className={`text-6xl z-10 relative drop-shadow-md ${recipe && !isReady ? 'animate-pulse' : ''}`}>{machine.emoji}</div>
                                  {recipe && isReady && (
                                      <div className="absolute inset-0 bg-white/90 flex flex-col items-center justify-center z-20 backdrop-blur-sm">
                                          <div className="text-5xl animate-bounce mb-1">{product?.emoji}</div>
                                          <span className="text-[10px] font-black text-green-600 bg-green-100 px-2 py-1 rounded-full">XONG!</span>
                                      </div>
                                  )}
                                  {recipe && !isReady && (
                                      <div className="absolute bottom-4 w-16 h-2 bg-slate-200 rounded-full overflow-hidden border border-white z-10">
                                          <div className="h-full bg-blue-500 transition-all duration-1000" style={{ width: `${progress}%` }}></div>
                                      </div>
                                  )}
                              </>
                          )}
                      </button>
                  )
              })}
              <button onClick={() => handleExpand('MACHINE')} className="aspect-square rounded-[2rem] border-4 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 gap-2 hover:bg-white/50 transition-colors bg-white/20">
                  <Plus size={32} />
                  <span className="text-[10px] font-black uppercase">Thêm máy</span>
              </button>
          </div>
      );
  };

  const renderPetZoo = () => (
      <div className="w-full h-full pb-32 px-4 animate-fadeIn flex flex-col items-center">
          {/* Main Habitat */}
          <div className="w-full max-w-md aspect-[4/3] rounded-[3rem] border-8 border-[#8D6E63] relative overflow-hidden shadow-2xl bg-[#A5D6A7]">
              {/* Environment Layer */}
              <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute top-10 left-10 text-4xl opacity-80">🌳</div>
                  <div className="absolute top-20 right-10 text-3xl opacity-70">🌲</div>
                  <div className="absolute bottom-10 left-20 text-2xl opacity-60">🍄</div>
                  <div className="absolute bottom-5 right-5 text-4xl opacity-50">🪨</div>
                  <div className="absolute top-5 left-1/4 text-5xl opacity-40 animate-pulse">☁️</div>
              </div>

              {/* The Pet */}
              <div 
                className="absolute bottom-1/3 left-1/2 transform -translate-x-1/2 text-[8rem] cursor-pointer z-10 transition-transform active:scale-110 drop-shadow-2xl"
                style={{ animation: 'sway 3s infinite ease-in-out' }}
                onClick={() => { playSFX('eat'); feedPet('carrot'); }} 
              >
                  🐶
              </div>
              
              {/* Pet Stats */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-md px-4 py-2 rounded-full border-2 border-white shadow-sm flex items-center gap-3 z-20">
                  <div className="flex flex-col items-center">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Level {userState.petLevel || 1}</span>
                      <div className="w-20 h-2 bg-slate-200 rounded-full overflow-hidden"><div className="h-full bg-blue-500" style={{width: '40%'}}></div></div>
                  </div>
                  <div className="flex flex-col items-center">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Vui vẻ</span>
                      <div className="w-20 h-2 bg-slate-200 rounded-full overflow-hidden"><div className="h-full bg-pink-500" style={{width: `${userState.petHappiness || 50}%`}}></div></div>
                  </div>
              </div>
          </div>

          {/* Action Bar */}
          <div className="mt-6 bg-white p-4 rounded-[2rem] w-full max-w-md shadow-lg flex justify-around items-center border border-slate-100">
              <button className="flex flex-col items-center gap-1 text-slate-500 hover:text-pink-500 transition-colors" onClick={() => feedPet('carrot')}>
                  <div className="w-12 h-12 bg-pink-50 rounded-2xl flex items-center justify-center text-2xl shadow-sm border border-pink-100">🥕</div>
                  <span className="text-[10px] font-bold uppercase">Cho ăn</span>
              </button>
              <button className="flex flex-col items-center gap-1 text-slate-500 hover:text-blue-500 transition-colors">
                  <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-2xl shadow-sm border border-blue-100">🎾</div>
                  <span className="text-[10px] font-bold uppercase">Chơi đùa</span>
              </button>
              <button className="flex flex-col items-center gap-1 text-slate-500 hover:text-purple-500 transition-colors">
                  <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center text-2xl shadow-sm border border-purple-100">🛁</div>
                  <span className="text-[10px] font-bold uppercase">Tắm rửa</span>
              </button>
          </div>
          
          <style>{`
            @keyframes sway {
                0%, 100% { transform: translateX(-50%) rotate(-5deg); }
                50% { transform: translateX(-50%) rotate(5deg); }
            }
          `}</style>
      </div>
  );

  return (
    <div className="w-full h-full bg-[#E0F7FA] relative overflow-y-auto no-scrollbar">
        {renderSectionTabs()}
        {renderHUD()}

        <div className="relative z-10 min-h-full">
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

        {activeModal === 'MISSIONS' && (
            <MissionModal 
                missions={userState.missions || []} 
                onClaim={(m) => {
                    playSFX('success');
                    addReward(m.reward.type, m.reward.amount);
                }}
                onClose={() => setActiveModal('NONE')} 
            />
        )}

        {activeModal === 'ORDERS' && (
            <OrderBoard 
                orders={userState.activeOrders || []} 
                items={[...CROPS, ...PRODUCTS]}
                inventory={userState.harvestedCrops || {}}
                onDeliver={(o) => deliverOrder(o)}
                onRefresh={() => {}}
                onClose={() => setActiveModal('NONE')}
            />
        )}

        {activeModal === 'ACHIEVEMENTS' && (
            <div className="fixed inset-0 z-50 p-4 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                <div className="w-full max-w-md h-[80vh] bg-white rounded-3xl overflow-hidden relative">
                    <Achievements userState={userState} onClose={() => setActiveModal('NONE')} category="FARM" />
                </div>
            </div>
        )}
    </div>
  );
};
