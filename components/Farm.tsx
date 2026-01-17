
import React, { useState, useEffect, useRef } from 'react';
import { UserState, FarmPlot } from '../types';
import { CROPS, ANIMALS, MACHINES, DECORATIONS, RECIPES, PRODUCTS } from '../data/farmData';
import { PlotModal } from './farm/PlotModal';
import { ShopModal } from './farm/ShopModal';
import { MissionModal } from './farm/MissionModal';
import { OrderBoard } from './farm/OrderBoard';
import { InventoryModal } from './farm/InventoryModal';
import { BarnModal } from './farm/BarnModal';
import { LearningQuizModal } from './farm/LearningQuizModal';
import { ItemManageModal } from './farm/ItemManageModal'; 
import { MachineProductionModal } from './farm/MachineProductionModal'; 
import { ConfirmModal } from './ui/ConfirmModal';
import { useFarmGame } from '../hooks/useFarmGame';
import { Lock, Droplets, Clock, Zap, Tractor, Factory, ShoppingBasket, Bird, Scroll, Truck, Hand, Hammer, Home, Coins, Star, AlertTriangle, Bug, Warehouse, ArrowUpCircle, Sparkles, Settings, Layers } from 'lucide-react';
import { playSFX } from '../utils/sound';

interface FarmProps {
  userState: UserState;
  onUpdateState: (newState: UserState | ((prev: UserState) => UserState)) => void;
  onExit: () => void;
  allWords: any;
  levels: any;
}

type FarmSection = 'CROPS' | 'ANIMALS' | 'MACHINES';

interface FlyingItem {
    id: number;
    emoji: string;
    x: number;
    y: number;
    targetX: number;
    targetY: number;
}

interface FloatingText {
    id: number;
    text: React.ReactNode; // Changed to allow JSX/Icons
    x: number;
    y: number;
    color: string;
}

export const Farm: React.FC<FarmProps> = ({ userState, onUpdateState, onExit, allWords }) => {
  const { now, plantSeed, placeAnimal, placeMachine, reclaimItem, waterPlot, resolvePest, harvestPlot, harvestAll, buyItem, feedAnimal, collectProduct, startProcessing, collectMachine, canAfford, deliverOrder, addReward, generateOrders, checkWellUsage, useWell, speedUpItem } = useFarmGame(userState, onUpdateState);
  
  const [activeSection, setActiveSection] = useState<FarmSection>('CROPS');
  const [activeModal, setActiveModal] = useState<'NONE' | 'PLOT' | 'SHOP' | 'MISSIONS' | 'ORDERS' | 'INVENTORY' | 'BARN' | 'QUIZ' | 'MANAGE_ITEM' | 'PRODUCTION'>('NONE');
  const [quizContext, setQuizContext] = useState<{ type: 'WATER' | 'PEST' | 'SPEED_UP' | 'NEW_ORDER', plotId?: number, slotId?: number, entityType?: 'CROP' | 'ANIMAL' | 'MACHINE' } | null>(null);
  const [inventoryMode, setInventoryMode] = useState<'VIEW' | 'SELECT_SEED' | 'PLACE_ANIMAL' | 'PLACE_MACHINE'>('VIEW');
  const [initialInvTab, setInitialInvTab] = useState<'SEEDS' | 'ANIMALS' | 'MACHINES' | 'DECOR'>('SEEDS');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [manageItemConfig, setManageItemConfig] = useState<{ type: 'ANIMAL' | 'MACHINE', slotId: number, itemId: string } | null>(null);
  const [productionConfig, setProductionConfig] = useState<{ slotId: number, machineId: string } | null>(null); 
  
  // FX States
  const [flyingItems, setFlyingItems] = useState<FlyingItem[]>([]);
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
  const [showLevelUp, setShowLevelUp] = useState(false);
  
  // Modal Configurations
  const [confirmConfig, setConfirmConfig] = useState<{ isOpen: boolean; message: string; onConfirm: () => void } | null>(null);
  const [alertConfig, setAlertConfig] = useState<{ isOpen: boolean; message: string; type: 'INFO' | 'DANGER' } | null>(null);

  // Refs
  const prevLevelRef = useRef(userState.farmLevel || 1);
  const barnBtnRef = useRef<HTMLButtonElement>(null); 

  // --- LEVEL UP CHECK ---
  useEffect(() => {
      const currentLevel = userState.farmLevel || 1;
      if (currentLevel > prevLevelRef.current) {
          playSFX('success'); 
          setShowLevelUp(true);
          setTimeout(() => setShowLevelUp(false), 4000); 
      }
      prevLevelRef.current = currentLevel;
  }, [userState.farmLevel]);

  // --- HELPER FOR ALERTS ---
  const handleShowAlert = (msg: string, type: 'INFO' | 'DANGER' = 'DANGER') => {
      playSFX('wrong');
      setAlertConfig({ isOpen: true, message: msg, type });
  };

  // --- HARVEST FX LOGIC ---
  const triggerHarvestFX = (rect: DOMRect, emoji: string, amount: number, exp: number) => {
      if (barnBtnRef.current) {
          const targetRect = barnBtnRef.current.getBoundingClientRect();
          const newItem: FlyingItem = {
              id: Date.now() + Math.random(),
              emoji,
              x: rect.left + rect.width / 2,
              y: rect.top + rect.height / 2,
              targetX: targetRect.left + targetRect.width / 2,
              targetY: targetRect.top + targetRect.height / 2
          };
          setFlyingItems(prev => [...prev, newItem]);
          setTimeout(() => setFlyingItems(prev => prev.filter(i => i.id !== newItem.id)), 800);
      }

      const texts: FloatingText[] = [
          { id: Date.now(), text: `+${exp} XP`, x: rect.left, y: rect.top - 20, color: 'text-blue-600' }
      ];
      if (amount > 1) texts.push({ id: Date.now()+1, text: `x${amount}`, x: rect.left + 40, y: rect.top - 10, color: 'text-green-600' });
      
      setFloatingTexts(prev => [...prev, ...texts]);
      setTimeout(() => setFloatingTexts(prev => prev.filter(t => !texts.includes(t))), 1500);
  };

  const addFloatingText = (x: number, y: number, text: React.ReactNode, color: string = 'text-yellow-500') => {
      const newText: FloatingText = { id: Date.now() + Math.random(), text, x, y, color };
      setFloatingTexts(prev => [...prev, newText]);
      setTimeout(() => setFloatingTexts(prev => prev.filter(t => t.id !== newText.id)), 1500);
  };

  const handleHarvestWithFX = (plot: FarmPlot, e: React.MouseEvent) => {
      e.stopPropagation();
      const crop = CROPS.find(c => c.id === plot.cropId);
      if (crop) {
          const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
          triggerHarvestFX(rect, crop.emoji, 1, crop.exp);
          harvestPlot(plot.id, crop);
      }
  };

  // --- EXPANSION LOGIC ---
  const handleExpand = (type: 'PLOT' | 'PEN' | 'MACHINE') => {
      const baseCost = 500;
      let currentCount = 0;
      if (type === 'PLOT') {
          currentCount = userState.farmPlots.length; 
      }
      if (type === 'PEN') currentCount = userState.livestockSlots?.length || 0;
      if (type === 'MACHINE') currentCount = userState.machineSlots?.length || 0;

      // Adjusted cost formula to be more progressive but reasonable
      // Start increasing after 2nd/6th item depending on type, but base logic unified
      // Machines: 500 * 1.5^(count - 2) so 3rd machine costs 750
      // Plots: 500 * 1.5^(count - 6) so 7th plot costs 750
      const threshold = type === 'PLOT' ? 6 : 2;
      const cost = baseCost * Math.pow(1.5, Math.max(0, currentCount - threshold)); 
      const finalCost = Math.floor(cost / 100) * 100; 

      setConfirmConfig({
          isOpen: true,
          message: `Mở rộng thêm ô mới với giá ${finalCost} Xu?`,
          onConfirm: () => {
              if (canAfford(finalCost, 'COIN')) {
                  playSFX('success');
                  onUpdateState(prev => {
                      const newState = { ...prev, coins: prev.coins - finalCost };
                      
                      if (type === 'PLOT') {
                          const lockedPlotIndex = prev.farmPlots.findIndex(p => !p.isUnlocked);
                          if (lockedPlotIndex !== -1) {
                              const newPlots = [...prev.farmPlots];
                              newPlots[lockedPlotIndex] = { ...newPlots[lockedPlotIndex], isUnlocked: true };
                              newState.farmPlots = newPlots;
                          } else {
                              const newId = Date.now();
                              newState.farmPlots = [...prev.farmPlots, { id: newId, isUnlocked: true, cropId: null, plantedAt: null }];
                          }
                      }
                      else if (type === 'PEN') {
                          const newId = Date.now();
                          newState.livestockSlots = [...(prev.livestockSlots || []), { id: newId, isUnlocked: true, animalId: null, fedAt: null }];
                      }
                      else if (type === 'MACHINE') {
                          const newId = Date.now();
                          newState.machineSlots = [...(prev.machineSlots || []), { id: newId, isUnlocked: true, machineId: null, activeRecipeId: null, startedAt: null }];
                      }
                      return newState;
                  });
              } else {
                  handleShowAlert("Bé không đủ tiền để mở rộng rồi!");
              }
              setConfirmConfig(null);
          }
      });
  };

  // --- INTERACTION LOGIC ---
  const handlePlotClick = (plot: any, e: React.MouseEvent) => {
      if (!plot.isUnlocked) {
          setSelectedId(plot.id);
          setActiveModal('PLOT');
          return;
      }

      const crop = plot.cropId ? CROPS.find(c => c.id === plot.cropId) : null;
      
      if (crop && (plot.hasBug || plot.hasWeed)) {
          setQuizContext({ type: 'PEST', plotId: plot.id });
          setActiveModal('QUIZ');
          return;
      }

      if (!crop) {
          setSelectedId(plot.id);
          setInventoryMode('SELECT_SEED');
          setInitialInvTab('SEEDS');
          setActiveModal('INVENTORY');
      } else {
          const elapsed = (now - plot.plantedAt) / 1000;
          if (elapsed >= crop.growthTime) {
              handleHarvestWithFX(plot, e);
          } else {
              setSelectedId(plot.id); 
              setActiveModal('PLOT'); 
          }
      }
  };

  const handleWellClick = (e: React.MouseEvent) => {
      const status = checkWellUsage();
      if (!status.allowed) {
          handleShowAlert(status.msg || "Giếng thần đã cạn nước hôm nay!", 'INFO');
          return;
      }
      setQuizContext({ type: 'WATER' });
      setActiveModal('QUIZ');
  };

  const onQuizSuccess = () => {
      if (quizContext?.type === 'WATER') {
          useWell();
          const rect = document.getElementById('well-btn')?.getBoundingClientRect();
          if(rect) addFloatingText(rect.left, rect.top, "+Nước", "text-blue-500");
      } else if (quizContext?.type === 'PEST' && quizContext.plotId) {
          resolvePest(quizContext.plotId);
          const plot = userState.farmPlots.find(p => p.id === quizContext.plotId);
          if (plot) addFloatingText(window.innerWidth/2, window.innerHeight/2, "Sạch sẽ!", "text-green-500");
      } else if (quizContext?.type === 'SPEED_UP' && quizContext.slotId && quizContext.entityType) {
          speedUpItem(quizContext.entityType, quizContext.slotId);
          addFloatingText(window.innerWidth/2, window.innerHeight/2, "Tăng tốc!", "text-yellow-500");
      } else if (quizContext?.type === 'NEW_ORDER') {
          const newOrders = generateOrders(userState.grade || 1, userState.completedLevels?.length || 0, userState.livestockSlots || []);
          onUpdateState(prev => ({ ...prev, activeOrders: newOrders }));
          addFloatingText(window.innerWidth/2, window.innerHeight/2, "Đơn mới!", "text-orange-500");
      }
      setActiveModal('NONE');
      setQuizContext(null);
  };

  const handleCollectProduct = (slot: any, e: React.MouseEvent) => {
      // Collects entire storage now
      const animal = ANIMALS.find(a => a.id === slot.animalId);
      if(animal) {
          const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
          const count = slot.storage?.length || 0;
          
          if (count > 0) {
              triggerHarvestFX(rect, animal.emoji, count, animal.exp * count);
              collectProduct(slot.id);
          }
      }
  };

  const handleFeedAnimal = (slot: any, e: React.MouseEvent) => {
      // Prevent bubble up
      e.stopPropagation();
      const res: any = feedAnimal(slot.id);
      if (res && !res.success) {
          handleShowAlert(res.msg);
      } else if (res && res.success) {
          // Show floating text for consumption
          const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
          // Use emoji in floating text
          addFloatingText(rect.left, rect.top, 
            <div className="flex items-center gap-1">
                <span className="font-black text-red-500">-{res.amount}</span>
                <span className="text-2xl">{res.feedEmoji}</span>
            </div>, 
            "text-red-500"
          );
      }
  };

  const handleCollectMachine = (slot: any, e: React.MouseEvent) => {
      // NOTE: Now collects entire storage
      const res = collectMachine(slot.id);
      if (res && res.success) {
          const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
          addFloatingText(rect.left, rect.top, `+${res.count} Sản phẩm`, "text-green-500");
          // Trigger FX for first item as representative
          const lastItem = slot.storage?.[slot.storage.length-1];
          if(lastItem) {
              const recipe = RECIPES.find(r => r.id === lastItem);
              const prod = PRODUCTS.find(p => p.id === recipe?.outputId);
              if(prod) triggerHarvestFX(rect, prod.emoji, res.count, 0); // XP handled in useFarmGame
          }
      } else if (res && !res.success) {
          // If empty, open production menu
          const machine = MACHINES.find(m => m.id === slot.machineId);
          if(machine) {
              setProductionConfig({ slotId: slot.id, machineId: machine.id });
              setActiveModal('PRODUCTION');
          }
      }
  };

  // --- RENDERERS ---

  const renderSectionTabs = () => (
      <div className="flex bg-white/90 backdrop-blur-sm p-1.5 rounded-2xl mx-4 mb-4 shadow-[0_-4px_20px_rgba(0,0,0,0.1)] border-2 border-white sticky bottom-4 z-50 gap-1">
          {[
              { id: 'CROPS', label: 'Trồng Trọt', icon: <Tractor size={20}/>, color: 'text-green-600 bg-green-50' },
              { id: 'ANIMALS', label: 'Chăn Nuôi', icon: <Bird size={20}/>, color: 'text-orange-600 bg-orange-50' },
              { id: 'MACHINES', label: 'Chế Biến', icon: <Factory size={20}/>, color: 'text-blue-600 bg-blue-50' },
              { id: 'SHOP', label: 'Cửa Hàng', icon: <ShoppingBasket size={20}/>, color: 'text-pink-600 bg-pink-50' },
          ].map(tab => (
              <button
                  key={tab.id}
                  onClick={() => {
                      if (tab.id === 'SHOP') setActiveModal('SHOP');
                      else setActiveSection(tab.id as FarmSection);
                      playSFX('click');
                  }}
                  className={`flex-1 py-3 rounded-xl text-[10px] font-black transition-all flex flex-col items-center gap-1 leading-tight ${
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
      <div className="px-4 py-2 flex gap-2 justify-center sticky top-[60px] z-30 pointer-events-auto">
          <button ref={barnBtnRef} onClick={() => setActiveModal('BARN')} className="w-12 h-12 bg-emerald-500 text-white rounded-2xl shadow-md border-2 border-white flex items-center justify-center active:scale-95 transition-all">
              <Warehouse size={22} />
          </button>

          <button onClick={() => setActiveModal('MISSIONS')} className="flex-1 flex items-center justify-center gap-2 bg-white px-3 py-2 rounded-2xl shadow-md border-2 border-indigo-100 text-indigo-600 font-black text-xs active:scale-95 transition-all relative">
              <Scroll size={16} /> Nhiệm Vụ
              {/* Notification Dot */}
              {userState.missions?.some(m => m.completed && !m.claimed) && <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full animate-ping"></span>}
          </button>
          
          <button onClick={() => setActiveModal('ORDERS')} className="flex-1 flex items-center justify-center gap-2 bg-white px-3 py-2 rounded-2xl shadow-md border-2 border-orange-100 text-orange-600 font-black text-xs active:scale-95 transition-all">
              <Truck size={16} /> Đơn Hàng
          </button>
          
          <button id="well-btn" onClick={handleWellClick} className="w-12 h-12 bg-blue-500 text-white rounded-2xl shadow-md border-2 border-white flex items-center justify-center active:scale-95 transition-all relative">
              <Droplets size={22} />
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[8px] px-1.5 rounded-full border border-white font-bold">
                  {5 - (userState.wellUsageCount || 0)}
              </span>
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

  const renderSpeedUpButton = (type: 'CROP' | 'ANIMAL' | 'MACHINE', slotId: number, position: string = 'absolute top-2 left-2') => (
      <button
          onClick={(e) => { e.stopPropagation(); setQuizContext({ type: 'SPEED_UP', slotId, entityType: type }); setActiveModal('QUIZ'); }}
          className={`${position} z-30 bg-yellow-400 text-white p-1.5 rounded-full shadow-sm hover:bg-yellow-500 border-2 border-white animate-pulse active:scale-90 transition-all`}
      >
          <Zap size={14} fill="currentColor" />
      </button>
  );

  const renderCrops = () => (
      <div className="grid grid-cols-2 gap-4 px-4 pt-4 pb-32 animate-fadeIn">
          {userState.farmPlots.map(plot => {
              const crop = plot.cropId ? CROPS.find(c => c.id === plot.cropId) : null;
              const elapsed = crop && plot.plantedAt ? (now - plot.plantedAt) / 1000 : 0;
              const progress = crop ? Math.min(100, (elapsed / crop.growthTime) * 100) : 0;
              const isReady = progress >= 100;
              const isWatered = plot.isWatered || userState.weather === 'RAINY';
              const hasPest = plot.hasBug || plot.hasWeed;

              return (
                  <button 
                    key={plot.id}
                    onClick={(e) => handlePlotClick(plot, e)}
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
                              {hasPest && (
                                  <div className="absolute top-2 right-2 z-30 animate-bounce">
                                      {plot.hasBug ? 
                                        <div className="bg-red-500 text-white p-1 rounded-full border-2 border-white shadow-sm"><Bug size={16}/></div> : 
                                        <div className="bg-green-600 text-white p-1 rounded-full border-2 border-white shadow-sm"><AlertTriangle size={16}/></div>
                                      }
                                  </div>
                              )}
                              
                              {/* SPEED UP BUTTON - Default Top Left for Crops */}
                              {!isReady && !hasPest && renderSpeedUpButton('CROP', plot.id)}

                              <div className={`text-7xl transition-all duration-500 z-10 ${isReady ? 'scale-110 drop-shadow-2xl' : 'scale-75 opacity-90 grayscale-[0.3]'}`}>
                                  {crop.emoji}
                              </div>
                              
                              {!isReady && (
                                  <div className="absolute bottom-6 w-16 h-2 bg-black/20 rounded-full overflow-hidden border border-white/20 backdrop-blur-sm z-10">
                                      <div className="h-full bg-green-400 transition-all duration-1000" style={{ width: `${progress}%` }}></div>
                                  </div>
                              )}
                              
                              {isReady && !hasPest && renderHarvestButton()}
                              
                              {isWatered && !isReady && !hasPest && (
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
          <div className="grid grid-cols-2 gap-4 px-4 pt-4 pb-32 animate-fadeIn">
              {slots.map(slot => {
                  const animal = slot.animalId ? ANIMALS.find(a => a.id === slot.animalId) : null;
                  const isFed = !!slot.fedAt;
                  const progress = animal && isFed ? Math.min(100, ((now - (slot.fedAt || 0))/1000 / animal.produceTime) * 100) : 0;
                  const storageItems = slot.storage || [];
                  const hasStorage = storageItems.length > 0;
                  const queueCount = slot.queue || 0;
                  
                  const storedProduceId = storageItems[0];
                  const produce = PRODUCTS.find(p => p.id === storedProduceId);
                  
                  // Feed requirement data
                  const feedItem = animal ? [...CROPS, ...PRODUCTS].find(c => c.id === animal.feedCropId) : null;
                  const userHas = animal ? (userState.harvestedCrops?.[animal.feedCropId] || 0) : 0;
                  const canFeed = animal && userHas >= animal.feedAmount;

                  return (
                      <button 
                        key={slot.id}
                        onClick={(e) => {
                            if (!animal) { 
                                setSelectedId(slot.id); 
                                setInventoryMode('PLACE_ANIMAL');
                                setInitialInvTab('ANIMALS');
                                setActiveModal('INVENTORY'); 
                            }
                            else if (hasStorage) handleCollectProduct(slot, e);
                            else handleFeedAnimal(slot, e); // Queue feed
                        }}
                        className={`
                            relative aspect-square rounded-[2.5rem] transition-all duration-200 active:scale-95 border-b-[6px] shadow-md overflow-hidden flex flex-col items-center justify-center
                            ${!slot.isUnlocked ? 'bg-slate-200 border-slate-300' : !animal ? 'bg-amber-50 border-amber-200 border-dashed' : 'bg-[#FFF3E0] border-[#FFE0B2]'}
                        `}
                      >
                          {/* MANAGE BUTTON FOR ANIMAL - Top Right */}
                          {animal && (
                              <div 
                                onClick={(e) => { 
                                    e.stopPropagation(); 
                                    setManageItemConfig({ type: 'ANIMAL', slotId: slot.id, itemId: animal.id }); 
                                    setActiveModal('MANAGE_ITEM'); 
                                }} 
                                className="absolute top-2 right-2 z-30 bg-white/80 p-1.5 rounded-full shadow-sm hover:bg-white text-slate-400 hover:text-slate-600 transition-colors"
                              >
                                  <Settings size={14} />
                              </div>
                          )}

                          {/* SPEED UP - MOVED TO BOTTOM LEFT to avoid queue overlap */}
                          {animal && isFed && renderSpeedUpButton('ANIMAL', slot.id, 'absolute bottom-2 left-2')}

                          {!slot.isUnlocked ? (
                              <Lock className="text-slate-400" />
                          ) : !animal ? (
                              <>
                                <div className="text-3xl opacity-30 mb-2">🛖</div>
                                <span className="text-[10px] font-black text-amber-400 uppercase">Chuồng Trống</span>
                              </>
                          ) : (
                              <>
                                  {/* Queue Display - Top Left */}
                                  {queueCount > 0 && (
                                      <div className="absolute top-2 left-2 z-20 flex gap-1 bg-white/80 px-1.5 py-0.5 rounded-full shadow-sm border border-slate-100">
                                          <span className="text-xs">{feedItem?.emoji}</span>
                                          <span className="text-[10px] font-black text-orange-600">x{queueCount}</span>
                                      </div>
                                  )}

                                  <div className={`text-7xl z-10 transition-all ${!isFed ? 'scale-90' : 'animate-walk'}`}>
                                      {animal.emoji}
                                  </div>
                                  
                                  {hasStorage && (
                                      <div className="absolute inset-0 bg-white/60 flex flex-col items-center justify-center z-20 backdrop-blur-[2px]">
                                          <div className="text-5xl animate-bounce mb-2 drop-shadow-lg relative">
                                              {produce?.emoji || '🥚'}
                                              {storageItems.length > 1 && (
                                                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-black px-2 py-0.5 rounded-full border border-white">
                                                      x{storageItems.length}
                                                  </span>
                                              )}
                                          </div>
                                          {renderHarvestButton()}
                                      </div>
                                  )}

                                  {!isFed && !hasStorage && (
                                      <div className="absolute bottom-6 z-20 flex flex-col items-center">
                                          <div className={`px-3 py-1.5 rounded-full text-[10px] font-black shadow-lg flex items-center gap-1.5 border-2 border-white transition-all ${canFeed ? 'bg-green-500 text-white animate-bounce' : 'bg-white/90 text-slate-700 backdrop-blur-sm'}`}>
                                              {canFeed ? <Zap size={10} fill="currentColor"/> : <span className="text-red-500 font-bold">Cần:</span>}
                                              <span className="text-sm leading-none filter drop-shadow-sm">{feedItem?.emoji}</span>
                                              <span>x{animal.feedAmount}</span>
                                          </div>
                                          {!canFeed && (
                                              <div className="mt-1 bg-red-500 text-white text-[8px] font-bold px-2 py-0.5 rounded-full border border-white shadow-sm">
                                                  Thiếu {animal.feedAmount - userHas}
                                              </div>
                                          )}
                                      </div>
                                  )}
                                  
                                  {isFed && (
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
          <div className="grid grid-cols-2 gap-4 px-4 pt-4 pb-32 animate-fadeIn">
              {slots.map(slot => {
                  const machine = slot.machineId ? MACHINES.find(m => m.id === slot.machineId) : null;
                  const recipe = slot.activeRecipeId ? RECIPES.find(r => r.id === slot.activeRecipeId) : null;
                  const progress = recipe && slot.startedAt ? Math.min(100, ((now - slot.startedAt)/1000 / recipe.duration) * 100) : 0;
                  const storageItems = slot.storage || [];
                  const hasStorage = storageItems.length > 0;
                  
                  // Identify product waiting in storage (show last one)
                  const storedRecipeId = storageItems[storageItems.length - 1];
                  const storedRecipe = storedRecipeId ? RECIPES.find(r => r.id === storedRecipeId) : null;
                  const storedProduct = storedRecipe ? PRODUCTS.find(p => p.id === storedRecipe.outputId) : null;

                  // Determine possible outputs for this machine (to display icons above)
                  const possibleOutputs = machine ? RECIPES.filter(r => r.machineId === machine.id).map(r => r.outputId) : [];
                  const uniqueOutputs = [...new Set(possibleOutputs)]; // No slice, show all
                  const outputProducts = uniqueOutputs.map(oid => PRODUCTS.find(p => p.id === oid)).filter(Boolean);

                  return (
                      <button 
                        key={slot.id}
                        onClick={(e) => {
                            if (!machine) { 
                                setSelectedId(slot.id); 
                                setInventoryMode('PLACE_MACHINE');
                                setInitialInvTab('MACHINES');
                                setActiveModal('INVENTORY'); 
                            }
                            else if (hasStorage) handleCollectMachine(slot, e);
                            else { 
                                // Open Production Modal to queue items
                                setProductionConfig({ slotId: slot.id, machineId: machine.id });
                                setActiveModal('PRODUCTION');
                            }
                        }}
                        className={`
                            relative aspect-square rounded-[2.5rem] transition-all duration-200 active:scale-95 border-b-[6px] shadow-lg overflow-hidden flex flex-col items-center justify-center
                            ${!slot.isUnlocked ? 'bg-slate-200 border-slate-300' : !machine ? 'bg-blue-50 border-blue-200 border-dashed' : 'bg-slate-100 border-slate-300'}
                        `}
                      >
                          {/* MANAGE BUTTON FOR MACHINE */}
                          {machine && (
                              <div 
                                onClick={(e) => { 
                                    e.stopPropagation(); 
                                    setManageItemConfig({ type: 'MACHINE', slotId: slot.id, itemId: machine.id }); 
                                    setActiveModal('MANAGE_ITEM'); 
                                }} 
                                className="absolute top-2 right-2 z-30 bg-white/80 p-1.5 rounded-full shadow-sm hover:bg-white text-slate-400 hover:text-slate-600 transition-colors"
                              >
                                  <Settings size={14} />
                              </div>
                          )}

                          {/* SPEED UP - Only if working and not finished */}
                          {/* FIX: Moved to bottom-left to avoid overlap with Queue */}
                          {machine && recipe && renderSpeedUpButton('MACHINE', slot.id, 'absolute bottom-2 left-2')}

                          {!slot.isUnlocked ? (
                              <Lock className="text-slate-400" />
                          ) : !machine ? (
                              <>
                                <div className="text-3xl opacity-30 mb-2">🏗️</div>
                                <span className="text-[10px] font-black text-blue-400 uppercase">Nền Móng</span>
                              </>
                          ) : (
                              <>
                                  {/* PRODUCT PREVIEW ICONS (Floating Above) */}
                                  {!recipe && !hasStorage && (
                                      <div className="absolute top-2 left-1/2 -translate-x-1/2 flex flex-wrap justify-center gap-0.5 z-10 bg-white/80 px-2 py-1 rounded-xl shadow-sm border border-slate-100 animate-bounce-slight max-w-[80%]">
                                          {outputProducts.map(p => (
                                              <span key={p?.id} className="text-sm leading-none filter drop-shadow-sm">{p?.emoji}</span>
                                          ))}
                                      </div>
                                  )}

                                  <div className={`text-6xl z-10 relative drop-shadow-md transition-all mt-6 ${recipe ? 'animate-bounce-slight' : ''}`}>
                                      {machine.emoji}
                                  </div>
                                  
                                  {/* Machine Name Below */}
                                  <div className="absolute bottom-2 z-10 bg-slate-200/80 px-2 py-0.5 rounded text-[9px] font-black text-slate-600 truncate max-w-[80%] uppercase tracking-tighter backdrop-blur-sm">
                                      {machine.name}
                                  </div>
                                  
                                  {/* Working Effects */}
                                  {recipe && (
                                      <>
                                          <div className="absolute -top-4 right-0 text-xl animate-float-smoke opacity-70 pointer-events-none">💨</div>
                                          <div className="absolute bottom-2 right-2 text-slate-400 animate-spin-slow pointer-events-none"><Settings size={18} /></div>
                                      </>
                                  )}

                                  {/* FINISHED STORAGE DISPLAY - OVERLAY */}
                                  {hasStorage && (
                                      <div className="absolute inset-0 bg-white/60 flex flex-col items-center justify-center z-20 backdrop-blur-[2px]">
                                          <div className="text-6xl animate-bounce mb-2 drop-shadow-lg relative">
                                              {storedProduct?.emoji}
                                              {storageItems.length > 1 && (
                                                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-black px-2 py-0.5 rounded-full border border-white">
                                                      x{storageItems.length}
                                                  </span>
                                              )}
                                          </div>
                                          {renderHarvestButton()}
                                      </div>
                                  )}

                                  {/* PROGRESS BAR (Only if working) */}
                                  {recipe && (
                                      <div className="absolute bottom-8 w-16 h-2 bg-slate-200 rounded-full overflow-hidden border border-white z-10">
                                          <div className="h-full bg-blue-500 transition-all duration-1000" style={{ width: `${progress}%` }}></div>
                                      </div>
                                  )}

                                  {/* QUEUE DISPLAY (Only if active recipe exists) */}
                                  {slot.queue && slot.queue.length > 0 && (
                                      <div className="absolute top-2 left-2 z-20 flex gap-1">
                                          {[...Array(slot.queue.length)].map((_, i) => (
                                              <div key={i} className="w-3 h-3 bg-blue-500 rounded-full border border-white shadow-sm" />
                                          ))}
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
          if (p.cropId && p.plantedAt && !p.hasBug && !p.hasWeed) {
              const c = CROPS.find(crop => crop.id === p.cropId);
              if (c && (now - p.plantedAt)/1000 >= c.growthTime) count++;
          }
      });
      return count;
  };

  const readyCount = getReadyCount();
  const nextLevelExp = (userState.farmLevel || 1) * 100;

  return (
    <div className="w-full h-full bg-[#E0F7FA] relative overflow-y-auto no-scrollbar flex flex-col">
        <style>{`
            @keyframes float-smoke {
                0% { transform: translateY(0) scale(0.5); opacity: 0; }
                50% { opacity: 0.8; }
                100% { transform: translateY(-20px) scale(1.5); opacity: 0; }
            }
            .animate-float-smoke { animation: float-smoke 2s infinite; }
            @keyframes bounce-slight {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-3px); }
            }
            .animate-bounce-slight { animation: bounce-slight 1s infinite; }
        `}</style>

        {/* HEADER WITH LV AND XP */}
        <div className="bg-white/90 backdrop-blur-md px-4 py-3 shadow-lg flex justify-between items-center z-40 sticky top-0 border-b-4 border-green-100/50">
            <button onClick={onExit} className="p-2 text-slate-600 hover:bg-slate-100 rounded-2xl active:scale-90 transition-all bg-white border border-slate-200 shadow-sm z-50 relative"><Home size={24}/></button>
            
            <div className="flex flex-1 mx-4 items-center gap-2">
                <div className="flex-1 bg-slate-100 h-9 rounded-full border-2 border-slate-200 relative overflow-hidden flex items-center px-3">
                    <div className="absolute left-0 top-0 h-full bg-blue-400 transition-all duration-500" style={{ width: `${Math.min(100, ((userState.farmExp || 0) / nextLevelExp) * 100)}%` }} />
                    <div className="relative z-10 flex w-full justify-between items-center text-[10px] font-black text-slate-600">
                        <span className="bg-white/50 px-1 rounded">LV {userState.farmLevel || 1}</span>
                        <span>{userState.farmExp}/{nextLevelExp} XP</span>
                    </div>
                </div>
                <div className="flex flex-col gap-1 items-end">
                    <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200 text-[10px] font-black text-amber-700 min-w-[60px] justify-between">
                        <Coins size={10} fill="currentColor"/> {userState.coins}
                    </div>
                    <div className="flex items-center gap-1 bg-purple-50 px-2 py-0.5 rounded-lg border border-purple-200 text-[10px] font-black text-purple-700 min-w-[60px] justify-between">
                        <Star size={10} fill="currentColor"/> {userState.stars}
                    </div>
                </div>
            </div>
        </div>

        {/* TOP HUD AREA */}
        {renderHUD()}

        {/* MAIN SCROLLABLE AREA */}
        <div className="flex-1 relative z-10 pb-4">
            {activeSection === 'CROPS' && renderCrops()}
            {activeSection === 'ANIMALS' && renderAnimals()}
            {activeSection === 'MACHINES' && renderMachines()}
        </div>

        {/* BOTTOM TABS */}
        <div className="sticky bottom-0 z-50">
            {renderSectionTabs()}
        </div>

        {/* Harvest All Button - Fixed Position Icon */}
        {readyCount >= 2 && (
            <div className="fixed bottom-24 right-4 z-[60] animate-bounce">
                <button 
                    onClick={() => {
                        const res = harvestAll();
                        if (res.success) {
                            playSFX('success');
                            if(barnBtnRef.current) {
                                const rect = barnBtnRef.current.getBoundingClientRect();
                                addFloatingText(rect.left, rect.top, `+${res.count} Sản phẩm`, "text-orange-500");
                            }
                        }
                    }}
                    className="bg-amber-500 text-white w-16 h-16 rounded-full shadow-2xl border-4 border-white flex flex-col items-center justify-center font-black text-[10px] uppercase hover:bg-amber-600 transition-all active:scale-90"
                >
                    <Hand size={24} />
                    <span>Thu hoạch</span>
                    <span className="bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center absolute -top-1 -right-1 border-2 border-white shadow-sm">{readyCount}</span>
                </button>
            </div>
        )}

        {/* --- FX LAYERS --- */}
        {floatingTexts.map(item => (
            <div
                key={item.id}
                className={`fixed z-[100] font-black text-lg pointer-events-none drop-shadow-md animate-floatUp ${item.color}`}
                style={{ left: item.x, top: item.y }}
            >
                {item.text}
                <style>{`
                    @keyframes floatUp {
                        0% { opacity: 1; transform: translateY(0) scale(1); }
                        100% { opacity: 0; transform: translateY(-50px) scale(1.2); }
                    }
                    .animate-floatUp { animation: floatUp 1.5s ease-out forwards; }
                `}</style>
            </div>
        ))}

        {flyingItems.map(item => (
            <div
                key={item.id}
                className="fixed z-[100] text-4xl pointer-events-none"
                style={{
                    left: item.x,
                    top: item.y,
                    animation: `flyToBarn 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards`
                }}
            >
                {item.emoji}
                <style>{`
                    @keyframes flyToBarn {
                        0% { transform: translate(0, 0) scale(1); opacity: 1; }
                        100% { transform: translate(${item.targetX - item.x}px, ${item.targetY - item.y}px) scale(0.5); opacity: 0; }
                    }
                `}</style>
            </div>
        ))}

        {/* Level Up Overlay */}
        {showLevelUp && (
            <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/70 animate-fadeIn backdrop-blur-sm">
                <div className="relative animate-bounce">
                    <div className="text-[150px]">🆙</div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Sparkles size={120} className="text-yellow-300 animate-spin-slow" />
                    </div>
                </div>
                <h2 className="text-4xl font-black text-white mt-4 drop-shadow-lg text-center bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                    LÊN CẤP {userState.farmLevel}!
                </h2>
                <div className="flex gap-4 mt-8">
                    {[...Array(10)].map((_, i) => (
                        <div key={i} className="text-2xl animate-ping" style={{ animationDelay: `${i * 0.1}s` }}>🎉</div>
                    ))}
                </div>
            </div>
        )}

        {/* Modals */}
        {activeModal === 'MANAGE_ITEM' && manageItemConfig && (
            <ItemManageModal 
                item={[...ANIMALS, ...MACHINES].find(i => i.id === manageItemConfig.itemId)!}
                onStore={() => {
                    const res = reclaimItem(manageItemConfig.slotId, manageItemConfig.type, 'STORE');
                    if(res.success) { playSFX('success'); setActiveModal('NONE'); }
                }}
                onSell={() => {
                    const res = reclaimItem(manageItemConfig.slotId, manageItemConfig.type, 'SELL');
                    if(res.success) { playSFX('coins'); setActiveModal('NONE'); }
                }}
                onClose={() => setActiveModal('NONE')}
            />
        )}

        {activeModal === 'PRODUCTION' && productionConfig && (
            <MachineProductionModal
                machine={MACHINES.find(m => m.id === productionConfig.machineId)!}
                recipes={RECIPES.filter(r => r.machineId === productionConfig.machineId)}
                inventory={userState.harvestedCrops || {}}
                allItems={[...CROPS, ...PRODUCTS]}
                onProduce={(recipeId) => {
                    const res = startProcessing(productionConfig.slotId, recipeId);
                    if (res && !res.success) {
                        handleShowAlert(res.msg);
                    } else {
                        playSFX('success');
                        // Do not close immediately, allow multi-queue
                    }
                }}
                onClose={() => {
                    setActiveModal('NONE');
                    setProductionConfig(null);
                }}
                queueLength={userState.machineSlots?.find(s => s.id === productionConfig.slotId)?.queue?.length || 0}
                onShowAlert={handleShowAlert}
            />
        )}

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
                        else { handleShowAlert(res.msg); }
                    }
                    if (action === 'WATER') {
                        const res = waterPlot(selectedId, CROPS.find(c => c.id === userState.farmPlots.find(p => p.id === selectedId)?.cropId)!); 
                        if (res.success) {
                            setActiveModal('NONE');
                            const rect = document.getElementById('well-btn')?.getBoundingClientRect();
                            if(rect) addFloatingText(rect.left, rect.top, "-1 Nước", "text-blue-400");
                        }
                    }
                    if (action === 'FERTILIZER') {
                        if (userState.fertilizers > 0) {
                            onUpdateState(prev => ({
                                ...prev,
                                fertilizers: prev.fertilizers - 1,
                                farmPlots: prev.farmPlots.map(p => p.id === selectedId ? { ...p, plantedAt: (p.plantedAt || 0) - (CROPS.find(c=>c.id===p.cropId)?.growthTime || 0)*500 } : p)
                            }));
                            playSFX('powerup');
                            setActiveModal('NONE');
                        }
                    }
                    if (action === 'HARVEST') {
                        harvestPlot(selectedId, CROPS.find(c => c.id === userState.farmPlots.find(p => p.id === selectedId)?.cropId)!); 
                        setActiveModal('NONE');
                    }
                    if (action === 'UNLOCK') {
                        setActiveModal('NONE');
                        handleExpand('PLOT');
                    }
                }}
                onClose={() => setActiveModal('NONE')} 
            />
        )}

        {/* WAREHOUSE / BARN MODAL */}
        {activeModal === 'BARN' && (
            <BarnModal 
                crops={[...CROPS, ...PRODUCTS]} 
                harvested={userState.harvestedCrops || {}} 
                activeOrders={userState.activeOrders || []}
                onSell={(itemId) => {
                    const item = [...CROPS, ...PRODUCTS].find(i => i.id === itemId);
                    if (item && (userState.harvestedCrops?.[itemId] || 0) > 0) {
                        onUpdateState(prev => ({
                            ...prev,
                            coins: prev.coins + item.sellPrice,
                            harvestedCrops: { ...prev.harvestedCrops, [itemId]: (prev.harvestedCrops?.[itemId] || 0) - 1 }
                        }));
                        playSFX('coins');
                    }
                }}
                onSellAll={(itemId) => {
                    const item = [...CROPS, ...PRODUCTS].find(i => i.id === itemId);
                    const count = userState.harvestedCrops?.[itemId] || 0;
                    if (item && count > 0) {
                        onUpdateState(prev => ({
                            ...prev,
                            coins: prev.coins + (item.sellPrice * count),
                            harvestedCrops: { ...prev.harvestedCrops, [itemId]: 0 }
                        }));
                        playSFX('coins');
                    }
                }}
                onSellEverything={() => {}}
                onClose={() => setActiveModal('NONE')}
            />
        )}

        {/* SHOP MODAL */}
        {(activeModal === 'SHOP') && (
            <ShopModal 
                crops={CROPS} 
                animals={ANIMALS} 
                machines={MACHINES} 
                decorations={DECORATIONS} 
                recipes={RECIPES}
                products={PRODUCTS}
                userState={userState} 
                onBuySeed={(crop, amount) => {
                    const res = buyItem(crop, amount);
                    if (!res.success) handleShowAlert(res.msg);
                }}
                onBuyAnimal={(animal) => {
                    const res = buyItem(animal, 1);
                    if (!res.success) handleShowAlert(res.msg);
                }}
                onBuyMachine={(machine) => {
                    const res = buyItem(machine, 1);
                    if (!res.success) handleShowAlert(res.msg);
                }}
                onBuyDecor={(decor) => {
                    const res = buyItem(decor, 1);
                    if (!res.success) handleShowAlert(res.msg);
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
                    // Start QUIZ instead of directly refreshing
                    playSFX('click');
                    setQuizContext({ type: 'NEW_ORDER' });
                    setActiveModal('QUIZ');
                }}
                onClose={() => setActiveModal('NONE')}
                onShowAlert={handleShowAlert}
            />
        )}

        {activeModal === 'INVENTORY' && (
            <InventoryModal 
                initialTab={initialInvTab}
                inventory={userState.inventory} 
                seeds={CROPS} 
                animals={ANIMALS}
                machines={MACHINES}
                decorations={DECORATIONS}
                ownedAnimals={userState.livestockSlots || []}
                ownedMachines={userState.machineSlots || []}
                ownedDecorations={userState.decorations || []}
                allItems={[...CROPS, ...PRODUCTS]}
                mode={inventoryMode}
                onSelectSeed={(seedId) => {
                    if (selectedId) {
                        const res = plantSeed(selectedId, seedId);
                        if(res.success) { playSFX('success'); setActiveModal('NONE'); }
                        else { handleShowAlert(res.msg); }
                    }
                }}
                onSelectAnimal={(animalId) => {
                    if (selectedId) {
                        const res = placeAnimal(selectedId, animalId);
                        if(res.success) { playSFX('success'); setActiveModal('NONE'); }
                        else { handleShowAlert(res.msg); }
                    }
                }}
                onSelectMachine={(machineId) => {
                    if (selectedId) {
                        const res = placeMachine(selectedId, machineId);
                        if(res.success) { playSFX('success'); setActiveModal('NONE'); }
                        else { handleShowAlert(res.msg); }
                    }
                }}
                onGoToShop={() => { setActiveModal('SHOP'); }}
                onClose={() => setActiveModal('NONE')}
            />
        )}

        {activeModal === 'QUIZ' && quizContext && (
            <LearningQuizModal 
                words={allWords} 
                type={quizContext.type} 
                onSuccess={onQuizSuccess} 
                onClose={() => { setActiveModal('NONE'); setQuizContext(null); }} 
                onShowAlert={handleShowAlert}
            />
        )}

        {/* Standard Confirmation Modal */}
        <ConfirmModal 
            isOpen={!!confirmConfig}
            message={confirmConfig?.message || ''}
            onConfirm={confirmConfig?.onConfirm || (() => {})}
            onCancel={() => setConfirmConfig(null)}
        />

        {/* Alert Modal (using same component) */}
        <ConfirmModal 
            isOpen={!!alertConfig}
            message={alertConfig?.message || ''}
            onConfirm={() => setAlertConfig(null)}
            type={alertConfig?.type || 'INFO'}
            singleButton={true}
        />
    </div>
  );
};
