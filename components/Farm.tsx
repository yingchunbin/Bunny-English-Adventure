
import React, { useState } from 'react';
import { UserState } from '../types';
import { CROPS, ANIMALS, MACHINES, PRODUCTS, RECIPES, DECORATIONS } from '../data/farmData';
import { PlotModal } from './farm/PlotModal';
import { ShopModal } from './farm/ShopModal';
import { MissionModal } from './farm/MissionModal';
import { OrderBoard } from './farm/OrderBoard';
import { InventoryModal } from './farm/InventoryModal';
import { useFarmGame } from '../hooks/useFarmGame';
import { Lock, Droplets, CloudRain, Clock, Zap, Tractor, Factory, ShoppingBasket, Bird, Scroll, Truck, Hand, Hammer, Home, Coins, ArrowUp } from 'lucide-react';
import { playSFX } from '../utils/sound';

interface FarmProps {
  userState: UserState;
  onUpdateState: (newState: UserState | ((prev: UserState) => UserState)) => void;
  onExit: () => void;
  allWords: any;
  levels: any;
}

type FarmSection = 'CROPS' | 'ANIMALS' | 'MACHINES';

export const Farm: React.FC<FarmProps> = ({ userState, onUpdateState, onExit }) => {
  const { now, plantSeed, waterPlot, harvestPlot, harvestAll, buyAnimal, feedAnimal, collectProduct, buyMachine, startProcessing, collectMachine, canAfford, deliverOrder, addReward, generateOrders } = useFarmGame(userState, onUpdateState);
  
  const [activeSection, setActiveSection] = useState<FarmSection>('CROPS');
  const [activeModal, setActiveModal] = useState<'NONE' | 'PLOT' | 'SHOP' | 'MISSIONS' | 'ORDERS' | 'INVENTORY'>('NONE');
  const [inventoryMode, setInventoryMode] = useState<'VIEW' | 'SELECT_SEED'>('VIEW');
  const [selectedId, setSelectedId] = useState<number | null>(null);

  // --- EXPANSION LOGIC ---
  const handleExpand = (type: 'PLOT' | 'PEN' | 'MACHINE') => {
      const baseCost = 500;
      let currentCount = 0;
      if (type === 'PLOT') currentCount = userState.farmPlots.length;
      if (type === 'PEN') currentCount = userState.livestockSlots?.length || 0;
      if (type === 'MACHINE') currentCount = userState.machineSlots?.length || 0;

      // Price increases by 50% each time
      const cost = baseCost * Math.pow(1.5, Math.max(0, currentCount - 6)); 
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

  // --- RENDERERS ---

  const renderSectionTabs = () => (
      <div className="flex bg-white/90 backdrop-blur-sm p-1.5 rounded-2xl mx-4 mb-4 shadow-sm border-2 border-white sticky top-0 z-20 gap-1">
          {[
              { id: 'CROPS', label: 'Trồng Trọt', icon: <Tractor size={18}/>, color: 'text-green-600 bg-green-50' },
              { id: 'ANIMALS', label: 'Chăn Nuôi', icon: <Bird size={18}/>, color: 'text-orange-600 bg-orange-50' },
              { id: 'MACHINES', label: 'Chế Biến', icon: <Factory size={18}/>, color: 'text-blue-600 bg-blue-50' },
              { id: 'SHOP', label: 'Cửa Hàng', icon: <ShoppingBasket size={18}/>, color: 'text-pink-600 bg-pink-50' },
          ].map(tab => (
              <button
                  key={tab.id}
                  onClick={() => {
                      if (tab.id === 'SHOP') setActiveModal('SHOP');
                      else setActiveSection(tab.id as FarmSection);
                  }}
                  className={`flex-1 py-2.5 rounded-xl text-[10px] font-black transition-all flex flex-col items-center gap-1 leading-tight ${
                      (activeSection as string) === tab.id && tab.id !== 'SHOP'
                      ? `${tab.color.replace('text', 'bg').replace('bg', 'text-white').replace('50', '500')} shadow-md scale-105 border-b-4 border-black/10` 
                      : 'text-slate-400 hover:bg-slate-100'
                  }`}
              >
                  {tab.icon}
                  {tab.label}
              </button>
          ))}
      </div>
  );

  const renderHUD = () => (
      <div className="px-4 mb-4 flex gap-2 justify-center">
          <button onClick={() => setActiveModal('MISSIONS')} className="flex-1 flex items-center justify-center gap-2 bg-white px-3 py-2 rounded-2xl shadow-sm border-b-4 border-indigo-100 text-indigo-600 font-black text-xs active:scale-95 transition-all">
              <Scroll size={16} /> Nhiệm Vụ
          </button>
          <button onClick={() => setActiveModal('ORDERS')} className="flex-1 flex items-center justify-center gap-2 bg-white px-3 py-2 rounded-2xl shadow-sm border-b-4 border-orange-100 text-orange-600 font-black text-xs active:scale-95 transition-all">
              <Truck size={16} /> Đơn Hàng
          </button>
      </div>
  );

  const renderHarvestButton = () => (
      <div className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div className="bg-amber-400 text-amber-900 font-black text-xs px-4 py-2 rounded-full shadow-[0_4px_0_rgba(180,83,9,0.3)] border-2 border-white animate-bounce flex items-center gap-1 backdrop-blur-sm">
             <Hand size={14} /> Thu hoạch
          </div>
      </div>
  );

  const renderEmptySlot = (label: string, onClick: () => void) => (
      <button 
        onClick={onClick}
        className="relative aspect-square rounded-[2rem] bg-[#e2e8f0] border-4 border-[#cbd5e1] border-dashed flex flex-col items-center justify-center text-slate-400 group hover:bg-[#f1f5f9] transition-all active:scale-95"
      >
          <div className="bg-white p-3 rounded-full shadow-sm mb-2 group-hover:scale-110 transition-transform">
             <Hammer size={24} className="text-slate-300" />
          </div>
          <span className="text-[10px] font-black uppercase">{label}</span>
      </button>
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
                    onClick={() => { 
                        if (!plot.isUnlocked) return;
                        if (!crop) {
                            setSelectedId(plot.id);
                            setInventoryMode('SELECT_SEED');
                            setActiveModal('INVENTORY');
                        } else if (isReady) {
                            // Immediate Harvest
                            harvestPlot(plot.id, crop);
                        } else {
                            setSelectedId(plot.id); 
                            setActiveModal('PLOT'); 
                        }
                    }}
                    className={`
                        relative aspect-square rounded-[2.5rem] transition-all duration-200 active:scale-95 border-b-[6px] group overflow-hidden
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
                              <div className={`text-7xl transition-all duration-500 z-10 ${isReady ? 'scale-110 drop-shadow-2xl' : 'scale-75 opacity-90 grayscale-[0.3]'}`}>
                                  {crop.emoji}
                              </div>
                              {!isReady && (
                                  <div className="absolute bottom-6 w-16 h-2 bg-black/20 rounded-full overflow-hidden border border-white/20 backdrop-blur-sm z-10">
                                      <div className="h-full bg-green-400 transition-all duration-1000" style={{ width: `${progress}%` }}></div>
                                  </div>
                              )}
                              {isReady && renderHarvestButton()}
                              {isWatered && !isReady && (
                                  <div className="absolute top-3 right-3 text-blue-300 opacity-90 bg-blue-500/20 p-1 rounded-full"><Droplets size={16} fill="currentColor" /></div>
                              )}
                          </>
                      ) : (
                          <div className="text-white/30 text-xs font-black uppercase border-2 border-white/30 px-3 py-1 rounded-full pointer-events-none">Đất Trống</div>
                      )}
                  </button>
              );
          })}
          {renderEmptySlot("Mở Đất Mới", () => handleExpand('PLOT'))}
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
                            if (!animal) { setSelectedId(slot.id); setActiveModal('SHOP'); }
                            else if (isReady) collectProduct(slot.id);
                            else if (!isFed) feedAnimal(slot.id);
                        }}
                        className={`
                            relative aspect-square rounded-[2.5rem] transition-all duration-200 active:scale-95 border-b-[6px] shadow-md overflow-hidden flex flex-col items-center justify-center
                            ${!slot.isUnlocked ? 'bg-slate-200 border-slate-300' : !animal ? 'bg-amber-50 border-amber-200 border-dashed' : 'bg-[#FFF3E0] border-[#FFE0B2]'}
                        `}
                      >
                          {!slot.isUnlocked ? (
                              <Lock className="text-slate-400" />
                          ) : !animal ? (
                              <>
                                <div className="text-3xl opacity-30 mb-2">🛖</div>
                                <span className="text-[10px] font-black text-amber-400 uppercase">Chuồng Trống</span>
                              </>
                          ) : (
                              <>
                                  <div className={`text-7xl z-10 transition-all ${!isFed ? 'grayscale opacity-60 scale-90' : isReady ? 'scale-110 drop-shadow-xl' : 'animate-walk'}`}>
                                      {animal.emoji}
                                  </div>
                                  {isReady && renderHarvestButton()}
                                  {!isFed && <div className="absolute bottom-6 bg-orange-500 text-white px-3 py-1.5 rounded-full text-[10px] font-black shadow-lg z-20 flex items-center gap-1 border-2 border-white"><Zap size={10} fill="currentColor"/> ĐÓI BỤNG</div>}
                                  {isFed && !isReady && (
                                      <div className="absolute bottom-6 w-16 h-2 bg-black/10 rounded-full overflow-hidden border border-white z-10">
                                          <div className="h-full bg-orange-400 transition-all duration-1000" style={{ width: `${progress}%` }}></div>
                                      </div>
                                  )}
                              </>
                          )}
                      </button>
                  )
              })}
              {renderEmptySlot("Xây Chuồng", () => handleExpand('PEN'))}
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
                            if (!machine) { setSelectedId(slot.id); setActiveModal('SHOP'); }
                            else if (isReady) collectMachine(slot.id);
                            else if (!recipe) { 
                                const firstRecipe = RECIPES.find(r => r.machineId === machine.id);
                                if(firstRecipe) startProcessing(slot.id, firstRecipe.id);
                            }
                        }}
                        className={`
                            relative aspect-square rounded-[2.5rem] transition-all duration-200 active:scale-95 border-b-[6px] shadow-lg overflow-hidden flex flex-col items-center justify-center
                            ${!slot.isUnlocked ? 'bg-slate-200 border-slate-300' : !machine ? 'bg-blue-50 border-blue-200 border-dashed' : 'bg-slate-100 border-slate-300'}
                        `}
                      >
                          {!slot.isUnlocked ? (
                              <Lock className="text-slate-400" />
                          ) : !machine ? (
                              <>
                                <div className="text-3xl opacity-30 mb-2">🏗️</div>
                                <span className="text-[10px] font-black text-blue-400 uppercase">Nền Móng</span>
                              </>
                          ) : (
                              <>
                                  <div className={`text-7xl z-10 relative drop-shadow-md ${recipe && !isReady ? 'animate-pulse' : ''}`}>{machine.emoji}</div>
                                  {recipe && isReady && (
                                      <div className="absolute inset-0 bg-white/80 flex flex-col items-center justify-center z-20 backdrop-blur-sm">
                                          <div className="text-6xl animate-bounce mb-2 drop-shadow-lg">{product?.emoji}</div>
                                          {renderHarvestButton()}
                                      </div>
                                  )}
                                  {recipe && !isReady && (
                                      <div className="absolute bottom-6 w-16 h-2 bg-slate-200 rounded-full overflow-hidden border border-white z-10">
                                          <div className="h-full bg-blue-500 transition-all duration-1000" style={{ width: `${progress}%` }}></div>
                                      </div>
                                  )}
                              </>
                          )}
                      </button>
                  )
              })}
              {renderEmptySlot("Thêm Máy", () => handleExpand('MACHINE'))}
          </div>
      );
  };

  const getReadyCount = () => {
      let count = 0;
      userState.farmPlots.forEach(p => {
          if (p.cropId && p.plantedAt) {
              const c = CROPS.find(crop => crop.id === p.cropId);
              if (c && (now - p.plantedAt)/1000 >= c.growthTime) count++;
          }
      });
      return count;
  };

  const readyCount = getReadyCount();

  return (
    <div className="w-full h-full bg-[#E0F7FA] relative overflow-y-auto no-scrollbar flex flex-col">
        {/* HEADER WITH LV AND XP */}
        <div className="bg-white/90 backdrop-blur-md px-4 py-3 shadow-lg flex justify-between items-center z-40 sticky top-0 border-b-4 border-green-100/50">
            <button onClick={onExit} className="p-2 text-slate-600 hover:bg-slate-100 rounded-2xl active:scale-90 transition-all bg-white border border-slate-200 shadow-sm z-50 relative"><Home size={24}/></button>
            
            <div className="flex flex-1 mx-4 items-center gap-3">
                <div className="flex-1 bg-slate-100 h-8 rounded-full border-2 border-slate-200 relative overflow-hidden flex items-center px-3">
                    <div className="absolute left-0 top-0 h-full bg-blue-400 transition-all duration-500" style={{ width: `${Math.min(100, ((userState.farmExp || 0) / ((userState.farmLevel || 1) * 100)) * 100)}%` }} />
                    <span className="relative z-10 text-[10px] font-black text-slate-600 w-full text-center">
                        LV {userState.farmLevel || 1}
                    </span>
                </div>
                <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-xl border border-amber-200">
                    <Coins size={14} className="text-amber-500" fill="currentColor"/>
                    <span className="text-xs font-black text-amber-700">{userState.coins}</span>
                </div>
            </div>
        </div>

        <div className="flex-1 relative">
            {renderSectionTabs()}
            {renderHUD()}

            <div className="relative z-10 pb-32">
                {activeSection === 'CROPS' && renderCrops()}
                {activeSection === 'ANIMALS' && renderAnimals()}
                {activeSection === 'MACHINES' && renderMachines()}
            </div>
        </div>

        {/* Harvest All Button - Floating */}
        {readyCount >= 2 && (
            <div className="absolute bottom-24 right-4 z-40 animate-bounce">
                <button 
                    onClick={() => {
                        const res = harvestAll();
                        if (res.success) playSFX('success');
                    }}
                    className="bg-amber-500 text-white p-4 rounded-full shadow-2xl border-4 border-white flex items-center justify-center gap-2 font-black text-xs uppercase hover:bg-amber-600 transition-all active:scale-90"
                >
                    <Hand size={24} /> Thu hoạch tất cả ({readyCount})
                </button>
            </div>
        )}

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
                    if (action === 'PLANT') {
                        const res = plantSeed(selectedId, data);
                        if(res.success) { playSFX('success'); setActiveModal('NONE'); }
                        else { playSFX('wrong'); alert(res.msg); }
                    }
                    if (action === 'WATER') waterPlot(selectedId, CROPS.find(c => c.id === userState.farmPlots.find(p => p.id === selectedId)?.cropId)!); 
                    if (action === 'HARVEST') {
                        harvestPlot(selectedId, CROPS.find(c => c.id === userState.farmPlots.find(p => p.id === selectedId)?.cropId)!); 
                        setActiveModal('NONE');
                    }
                }}
                onClose={() => setActiveModal('NONE')} 
            />
        )}

        {/* UNIFIED SHOP: Opened contextually or globally */}
        {(activeModal === 'SHOP') && (
            <ShopModal 
                crops={CROPS} 
                animals={ANIMALS} 
                machines={MACHINES} 
                decorations={DECORATIONS} 
                userState={userState} 
                onBuySeed={(crop, amount) => {
                    const cost = crop.cost * amount;
                    if (userState.coins >= cost) {
                        onUpdateState(prev => ({
                            ...prev,
                            coins: prev.coins - cost,
                            inventory: { ...prev.inventory, [crop.id]: (prev.inventory[crop.id] || 0) + amount }
                        }));
                        playSFX('success');
                    } else {
                        playSFX('wrong');
                        alert("Không đủ tiền!");
                    }
                }}
                onBuyAnimal={(animal) => {
                    if (selectedId) {
                        const res = buyAnimal(selectedId, animal.id);
                        if (res.success) { setActiveModal('NONE'); setSelectedId(null); }
                        else alert(res.msg);
                    }
                }}
                onBuyMachine={(machine) => {
                    if (selectedId) {
                        const res = buyMachine(selectedId, machine.id);
                        if (res.success) { setActiveModal('NONE'); setSelectedId(null); }
                        else alert(res.msg);
                    }
                }}
                onBuyDecor={(decor) => {
                    if (decor.currency === 'STAR' ? true : userState.coins >= decor.cost) { // Basic check, real check in ShopModal or logic below
                         onUpdateState(prev => {
                             let newState = { ...prev };
                             if (decor.currency === 'COIN') {
                                 newState.coins -= decor.cost;
                             }
                             // If star currency, assuming we don't deduct stars, just check level/stars req.
                             newState.decorations = [...(prev.decorations || []), decor.id];
                             return newState;
                         });
                         playSFX('success');
                    }
                }}
                onClose={() => { setActiveModal('NONE'); setSelectedId(null); }} 
            />
        )}

        {activeModal === 'MISSIONS' && (
            <MissionModal 
                missions={userState.missions || []} 
                onClaim={(m) => {
                    playSFX('success');
                    addReward(m.reward.type, m.reward.amount);
                    onUpdateState(prev => ({
                        ...prev,
                        missions: prev.missions?.map(miss => miss.id === m.id ? { ...miss, claimed: true } : miss)
                    }));
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
                onRefresh={() => {
                    playSFX('click');
                    const newOrders = generateOrders(userState.grade || 1, userState.completedLevels?.length || 0, userState.livestockSlots || []);
                    onUpdateState(prev => ({ ...prev, activeOrders: newOrders }));
                }}
                onClose={() => setActiveModal('NONE')}
            />
        )}

        {activeModal === 'INVENTORY' && (
            <InventoryModal 
                inventory={userState.inventory} 
                harvested={userState.harvestedCrops || {}} 
                seeds={CROPS} 
                products={[...CROPS, ...PRODUCTS]} 
                animals={ANIMALS}
                mode={inventoryMode}
                onSelectSeed={(seedId) => {
                    if (selectedId) {
                        const res = plantSeed(selectedId, seedId);
                        if(res.success) { playSFX('success'); setActiveModal('NONE'); }
                        else { playSFX('wrong'); alert(res.msg); }
                    }
                }}
                onGoToShop={() => { setActiveModal('SHOP'); }}
                onClose={() => setActiveModal('NONE')}
                onSell={() => {}}
            />
        )}
    </div>
  );
};
