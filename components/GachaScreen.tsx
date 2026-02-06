
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { GachaItem, UserState, Rarity } from '../types';
import { GACHA_ITEMS } from '../data/gachaData';
import { Star, Home, Plus, X, Check, Lock, HelpCircle, ArrowRight, Shield, Zap, Trophy, Backpack, GraduationCap, Gift } from 'lucide-react';
import { playSFX, initAudio } from '../utils/sound';
import { LearningQuizModal } from './farm/LearningQuizModal';
import { LEVELS } from '../constants';
import { resolveImage } from '../utils/imageUtils';
import { ConfirmModal } from './ui/ConfirmModal';

interface GachaScreenProps {
  userState: UserState;
  onUpdateState: (newState: UserState | ((prev: UserState) => UserState)) => void;
  onExit: () => void;
}

// --- CONSTANTS ---
// 14 Slots arranged in a rectangle
const TOTAL_SLOTS = 14; 

// Initial visual pattern
const INITIAL_PATTERN: Rarity[] = [
    'COMMON', 'RARE', 'COMMON', 'EPIC',    
    'RARE', 'COMMON', 'LEGENDARY',         
    'EPIC', 'RARE', 'COMMON', 'RARE',      
    'COMMON', 'RARE', 'COMMON'             
];

// --- HELPER COMPONENTS ---

const DinoEgg = ({ size = 100, rarity = 'COMMON' }: { size?: number, rarity?: Rarity }) => {
  const colors = {
      'COMMON': ['#e2e8f0', '#94a3b8'],
      'RARE': ['#60a5fa', '#2563eb'],
      'EPIC': ['#e879f9', '#9333ea'],
      'LEGENDARY': ['#fcd34d', '#d97706'],
  };
  const [c1, c2] = colors[rarity] || colors['COMMON'];

  return (
    <svg width={size} height={size * 1.2} viewBox="0 0 100 120" fill="none" className="drop-shadow-md transition-all duration-300">
      <path d="M50 4C25 4 4 35 4 70C4 105 25 116 50 116C75 116 96 105 96 70C96 35 75 4 50 4Z" fill={`url(#grad-${rarity}-${size})`} stroke="white" strokeWidth="3" />
      <defs>
        <radialGradient id={`grad-${rarity}-${size}`} cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(30 30) rotate(50) scale(90)">
          <stop stopColor={c1} />
          <stop offset="1" stopColor={c2} />
        </radialGradient>
      </defs>
      <circle cx="30" cy="40" r="6" fill="white" fillOpacity="0.4" />
      <circle cx="70" cy="60" r="10" fill="white" fillOpacity="0.4" />
      <ellipse cx="30" cy="25" rx="10" ry="18" fill="white" fillOpacity="0.5" transform="rotate(-20 30 25)" />
    </svg>
  );
};

const getRarityLabel = (rarity: Rarity) => {
    switch(rarity) {
        case 'LEGENDARY': return 'HUYỀN THOẠI';
        case 'EPIC': return 'SỬ THI';
        case 'RARE': return 'HIẾM';
        default: return 'THƯỜNG';
    }
};

const getCardStyle = (rarity: Rarity) => {
    switch(rarity) {
        case 'LEGENDARY': return { bg: 'bg-gradient-to-b from-yellow-400 to-yellow-600', border: 'border-yellow-500', text: 'text-yellow-900' };
        case 'EPIC': return { bg: 'bg-gradient-to-b from-purple-400 to-purple-600', border: 'border-purple-500', text: 'text-white' };
        case 'RARE': return { bg: 'bg-gradient-to-b from-blue-400 to-blue-600', border: 'border-blue-500', text: 'text-white' };
        default: return { bg: 'bg-gradient-to-b from-slate-300 to-slate-400', border: 'border-slate-400', text: 'text-slate-800' };
    }
};

const getImageEffects = (rarity: Rarity) => {
    switch(rarity) {
        case 'LEGENDARY': return "drop-shadow-[0_0_15px_rgba(250,204,21,0.9)] animate-pulse brightness-110";
        case 'EPIC': return "drop-shadow-[0_0_10px_rgba(168,85,247,0.8)]";
        case 'RARE': return "drop-shadow-[0_0_5px_rgba(96,165,250,0.8)]";
        default: return "drop-shadow-sm grayscale-[0.1]";
    }
};

export const GachaScreen: React.FC<GachaScreenProps> = ({ userState, onUpdateState, onExit }) => {
  const [view, setView] = useState<'MACHINE' | 'REVEAL' | 'COLLECTION' | 'QUIZ_SELECT' | 'BULK_SUMMARY'>('MACHINE');
  
  // Machine State
  const [slots, setSlots] = useState<Rarity[]>(INITIAL_PATTERN);
  const [activeIndex, setActiveIndex] = useState<number>(-1); // Start with no active light
  const [isSpinning, setIsSpinning] = useState(false);
  const [winningIndex, setWinningIndex] = useState<number>(-1);
  
  // Results
  const [pendingRewards, setPendingRewards] = useState<GachaItem[]>([]);
  const [finalItem, setFinalItem] = useState<GachaItem | null>(null);
  const [revealProgress, setRevealProgress] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [selectedItem, setSelectedItem] = useState<GachaItem | null>(null);

  // Misc
  const [activeQuiz, setActiveQuiz] = useState<'EASY' | 'MEDIUM' | 'HARD' | null>(null);
  const [alertConfig, setAlertConfig] = useState<{ isOpen: boolean; message: string; type: 'INFO' | 'DANGER' } | null>(null);
  const ownedInventory = userState.gachaInventory || {};
  const allWords = useMemo(() => LEVELS.flatMap(l => l.words), []);

  const getRandomRarity = (): Rarity => {
      const rand = Math.random() * 100;
      if (rand < 2) return 'LEGENDARY'; 
      if (rand < 10) return 'EPIC';      
      if (rand < 40) return 'RARE';     
      return 'COMMON';                  
  };

  // --- NEW LOGIC: Generate a balanced board for display ---
  // Ensure the board always looks tempting (at least 1 Legendary, 2 Epic)
  const generateBalancedBoard = (guaranteedRarity?: Rarity): Rarity[] => {
      const board: Rarity[] = [];
      // Fill base requirements
      board.push('LEGENDARY'); 
      board.push('EPIC');
      board.push('EPIC');
      board.push('RARE');
      board.push('RARE');
      board.push('RARE');
      
      // If we have a winner, ensure it's in the pool
      if (guaranteedRarity) {
          board.push(guaranteedRarity);
      }

      // Fill the rest with random (weighted)
      while (board.length < TOTAL_SLOTS) {
          board.push(getRandomRarity());
      }

      // Shuffle
      return board.sort(() => Math.random() - 0.5);
  };

  // --- ENGINE: RANDOM FLASH ANIMATION (Adjusted to ~7s) ---
  const flashLoop = (targetIndex: number, currentStep: number, totalSteps: number, currentDelay: number) => {
      // 1. Pick a RANDOM index to light up
      let nextIndex = Math.floor(Math.random() * TOTAL_SLOTS);
      // Ensure visual change
      if (nextIndex === activeIndex) nextIndex = (nextIndex + 1) % TOTAL_SLOTS;
      
      setActiveIndex(nextIndex);
      playSFX('tick'); 

      // 2. Calculate next delay
      let nextDelay = currentDelay;
      const remainingSteps = totalSteps - currentStep;

      // Custom Timing Logic for ~7s Duration
      // Phase 1: Fast spin (first ~4s)
      // Phase 2: Slow down (last ~3s)
      
      if (remainingSteps < 20) {
          // Linear slowdown for the end
          // Increase delay by 20ms each step
          nextDelay += 20; 
      } else {
          // Maintain fast speed
          nextDelay = 50; 
      }

      // 3. Continue or Stop
      if (currentStep < totalSteps) {
          setTimeout(() => {
              flashLoop(targetIndex, currentStep + 1, totalSteps, nextDelay);
          }, nextDelay);
      } else {
          // FINAL STOP: Force active index to the TARGET index
          setActiveIndex(targetIndex);
          finishSpin();
      }
  };

  const finishSpin = () => {
      setIsSpinning(false);
      playSFX('success');
      setTimeout(() => {
          setView('REVEAL');
          setRevealProgress(0);
          setIsRevealed(false);
      }, 1000);
  };

  const handleSpin = (count: number) => {
      initAudio();

      const cost = count === 1 ? 10 : 90;
      if (userState.stars < cost) {
          setView('QUIZ_SELECT');
          return;
      }

      // Deduct
      onUpdateState(prev => ({ ...prev, stars: prev.stars - cost }));

      // 1. Generate Results Logic
      const results: GachaItem[] = [];
      for(let i=0; i<count; i++) {
          const rarity = getRandomRarity(); 
          const candidates = GACHA_ITEMS.filter(item => item.rarity === rarity);
          const winner = candidates[Math.floor(Math.random() * candidates.length)];
          results.push(winner);
      }
      setPendingRewards(results);

      // 2. Determine Main Display Item (Best Rarity)
      const rarityOrder = { 'LEGENDARY': 3, 'EPIC': 2, 'RARE': 1, 'COMMON': 0 };
      const bestItem = [...results].sort((a,b) => rarityOrder[b.rarity] - rarityOrder[a.rarity])[0];
      setFinalItem(bestItem);

      // 3. SHUFFLE THE BOARD (Visual Refresh)
      // Ensure the board contains the winning rarity
      const newBoard = generateBalancedBoard(bestItem.rarity);
      setSlots(newBoard);

      // 4. Pick a target slot that matches the winning rarity
      const validIndices = newBoard.map((r, i) => r === bestItem.rarity ? i : -1).filter(i => i !== -1);
      const targetIdx = validIndices[Math.floor(Math.random() * validIndices.length)];
      setWinningIndex(targetIdx);

      // 5. Start Animation
      setIsSpinning(true);
      
      // Reduced steps to 60 for shorter duration (~7s with updated slowdown)
      const totalSteps = 60; 
      flashLoop(targetIdx, 0, totalSteps, 50); // Start fast at 50ms
  };

  // --- ACTIONS ---
  const handleCrackEgg = () => {
      if (isRevealed) {
          handleClaim();
          return;
      }
      playSFX('crack');
      const next = revealProgress + 25;
      if (next >= 100) {
          setRevealProgress(100);
          setIsRevealed(true);
          playSFX('cheer');
          playSFX('coins');
      } else {
          setRevealProgress(next);
      }
  };

  const handleClaim = () => {
      onUpdateState(prev => {
          const newInv = { ...(prev.gachaInventory || {}) };
          pendingRewards.forEach(item => {
              newInv[item.id] = (newInv[item.id] || 0) + 1;
          });
          return { ...prev, gachaInventory: newInv };
      });

      if (pendingRewards.length > 1) {
          setView('BULK_SUMMARY');
      } else {
          setView('MACHINE');
          setActiveIndex(-1); // Reset highlight
          setPendingRewards([]);
      }
  };

  const handleEquip = (item: GachaItem) => {
      onUpdateState(prev => ({ ...prev, currentAvatarId: 'gacha_custom', currentGachaAvatarId: item.id }));
      playSFX('click');
      setSelectedItem(null);
      setAlertConfig({ isOpen: true, message: `Đã chọn ${item.name} làm Avatar!`, type: 'INFO' });
  };

  const handleQuizSuccess = () => {
      if (!activeQuiz) return;
      let reward = 5;
      if (activeQuiz === 'MEDIUM') reward = 15;
      if (activeQuiz === 'HARD') reward = 30;
      
      playSFX('success');
      onUpdateState(prev => ({ ...prev, stars: prev.stars + reward }));
      setAlertConfig({ isOpen: true, message: `Nhận được ${reward} Sao!`, type: 'INFO' });
      setActiveQuiz(null);
  };

  // --- RENDER HELPERS ---
  
  const renderSlot = (index: number) => {
      const rarity = slots[index];
      const isActive = index === activeIndex;
      
      let borderColor = "border-slate-700";
      let bgColor = "bg-slate-800";
      let glow = "";
      let scale = "scale-100";

      // Rarity Colors
      if (rarity === 'COMMON') { borderColor = "border-slate-500"; bgColor = "bg-slate-700"; }
      if (rarity === 'RARE') { borderColor = "border-blue-500"; bgColor = "bg-blue-900"; }
      if (rarity === 'EPIC') { borderColor = "border-purple-500"; bgColor = "bg-purple-900"; }
      if (rarity === 'LEGENDARY') { borderColor = "border-yellow-500"; bgColor = "bg-yellow-900"; }

      // Active Cursor State
      if (isActive) {
          borderColor = "border-white";
          bgColor = "bg-gradient-to-br from-white via-yellow-100 to-white"; 
          glow = "shadow-[0_0_35px_rgba(255,255,255,0.9)] z-20 brightness-125 ring-4 ring-white/50";
          scale = "scale-110";
      }

      return (
          <div 
            key={index}
            className={`relative rounded-2xl border-[3px] flex items-center justify-center transition-all duration-100 aspect-square h-full w-full ${borderColor} ${bgColor} ${glow} ${scale}`}
          >
              <div className={`transition-all duration-100 ${isActive ? 'opacity-100 scale-110' : 'opacity-80'}`}>
                  <DinoEgg size={50} rarity={rarity} />
              </div>
          </div>
      );
  };

  const renderMachine = () => (
      <div className="flex flex-col h-full bg-slate-900 relative overflow-hidden">
          {/* Header */}
          <div className="flex justify-between items-center p-3 bg-slate-800 border-b border-slate-700 z-20 shadow-md">
              <button onClick={onExit} className="p-2 bg-slate-700 rounded-full text-slate-300 hover:text-white transition-colors"><Home size={24}/></button>
              
              <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 bg-black/40 px-3 py-1.5 rounded-full border border-yellow-500/50 shadow-inner">
                      <Star className="text-yellow-400 fill-yellow-400" size={18}/>
                      <span className="text-lg font-black text-white">{userState.stars}</span>
                  </div>

                  <button 
                    onClick={() => { playSFX('click'); setView('QUIZ_SELECT'); }}
                    className="bg-green-600 hover:bg-green-500 text-white px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1 shadow-sm border border-green-400 active:scale-95"
                  >
                    <GraduationCap size={14}/> Kiếm Sao
                  </button>
                  <button 
                    onClick={() => { playSFX('click'); setView('COLLECTION'); }}
                    className="bg-slate-700 hover:bg-slate-600 text-slate-200 px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1 border border-slate-500 active:scale-95"
                  >
                    <Backpack size={14}/> Túi Đồ
                  </button>
              </div>
          </div>

          {/* MAIN ARCADE BOARD */}
          <div className="flex-1 flex flex-col p-4 pb-8 h-full">
              <div className="flex-1 bg-slate-800 p-3 rounded-[2.5rem] border-8 border-slate-600 shadow-2xl relative w-full flex flex-col justify-center max-w-md mx-auto">
                  
                  {/* Grid Template: 4 Cols x 5 Rows (Outer Ring) 
                      0  1  2  3
                      13       4
                      12       5
                      11       6
                      10 9  8  7
                  */}
                  <div className="grid grid-cols-4 gap-3">
                      
                      {/* TOP ROW */}
                      {renderSlot(0)}
                      {renderSlot(1)}
                      {renderSlot(2)}
                      {renderSlot(3)}

                      {/* MIDDLE ROW 1 */}
                      {renderSlot(13)}
                      <div className="col-span-2 row-span-3 bg-slate-900 rounded-3xl border-4 border-slate-700 flex flex-col items-center justify-between p-3 gap-2 relative shadow-inner h-full">
                          
                          {/* Top: Spin 1 */}
                          <button 
                              onClick={() => !isSpinning && handleSpin(1)}
                              disabled={isSpinning}
                              className="w-full h-1/3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-black text-xs shadow-[0_3px_0_#1e40af] active:shadow-none active:translate-y-1 transition-all disabled:opacity-50 disabled:grayscale flex flex-col items-center justify-center border-t border-blue-400"
                          >
                              QUAY 1
                              <div className="bg-black/20 px-2 py-0.5 rounded text-[9px] font-normal flex items-center gap-1 mt-0.5">10 <Star size={8} fill="currentColor"/></div>
                          </button>

                          {/* Middle: Status Text */}
                          <div className="h-1/3 flex items-center justify-center w-full">
                              {isSpinning ? (
                                  <span className="text-yellow-400 font-black animate-pulse uppercase tracking-widest text-xs drop-shadow-md text-center">Đang quay...</span>
                              ) : (
                                  <span className="text-slate-500 font-bold uppercase text-[9px] tracking-widest text-center">NHẤN ĐỂ QUAY</span>
                              )}
                          </div>

                          {/* Bottom: Spin 10 */}
                          <button 
                              onClick={() => !isSpinning && handleSpin(10)}
                              disabled={isSpinning}
                              className="w-full h-1/3 bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-400 hover:to-rose-500 text-white rounded-xl font-black text-xs shadow-[0_3px_0_#be123c] active:shadow-none active:translate-y-1 transition-all disabled:opacity-50 disabled:grayscale flex flex-col items-center justify-center relative overflow-hidden border-t border-pink-400"
                          >
                              <div className="absolute top-0 right-0 bg-yellow-400 text-black text-[7px] font-black px-1.5 py-0.5 rounded-bl">HOT</div>
                              QUAY 10
                              <div className="bg-black/20 px-2 py-0.5 rounded text-[9px] font-normal flex items-center gap-1 mt-0.5">90 <Star size={8} fill="currentColor"/></div>
                          </button>
                      </div>
                      {renderSlot(4)}

                      {/* MIDDLE ROW 2 */}
                      {renderSlot(12)}
                      {renderSlot(5)}

                      {/* MIDDLE ROW 3 */}
                      {renderSlot(11)}
                      {renderSlot(6)}

                      {/* BOTTOM ROW (Correctly Mapped) */}
                      {renderSlot(10)}
                      {renderSlot(9)}
                      {renderSlot(8)}
                      {renderSlot(7)}

                  </div>
              </div>
          </div>
      </div>
  );

  const renderReveal = () => {
      const item = finalItem || pendingRewards[0]; 
      
      let bgGradient = "from-slate-800 to-slate-900";
      let glowColor = "bg-white";
      let rarityColor = "text-white/50"; // Default for Common

      if (item?.rarity === 'LEGENDARY') { 
          bgGradient = "from-yellow-900 to-slate-900"; 
          glowColor = "bg-yellow-500"; 
          rarityColor = "text-yellow-400";
      }
      if (item?.rarity === 'EPIC') { 
          bgGradient = "from-purple-900 to-slate-900"; 
          glowColor = "bg-purple-500"; 
          rarityColor = "text-purple-300";
      }
      if (item?.rarity === 'RARE') { 
          bgGradient = "from-blue-900 to-slate-900"; 
          glowColor = "bg-blue-500"; 
          rarityColor = "text-blue-300";
      }

      return (
          <div className={`fixed inset-0 z-50 flex flex-col items-center justify-center p-6 bg-gradient-to-b ${bgGradient} animate-fadeIn`}>
              {!isRevealed ? (
                  <div className="flex flex-col items-center cursor-pointer select-none w-full h-full justify-center" onClick={handleCrackEgg}>
                      <h2 className="text-white text-3xl font-black uppercase mb-12 animate-bounce drop-shadow-lg text-center">Chạm để mở!</h2>
                      <div className={`relative transition-transform duration-100 ${revealProgress > 0 ? 'animate-shake' : ''}`}>
                          <DinoEgg size={280} rarity={item?.rarity} />
                          {revealProgress > 25 && <div className="absolute top-1/3 left-1/4 w-12 h-1 bg-black/60 rotate-45 rounded-full filter blur-[1px]"></div>}
                          {revealProgress > 50 && <div className="absolute bottom-1/3 right-1/4 w-16 h-1 bg-black/60 -rotate-12 rounded-full filter blur-[1px]"></div>}
                          {revealProgress > 75 && <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-white/30 animate-pulse rounded-full filter blur-xl"></div>}
                      </div>
                      <div className="mt-12 w-64 h-4 bg-black/50 rounded-full overflow-hidden border border-white/20">
                          <div className="h-full bg-yellow-400 transition-all duration-200" style={{ width: `${revealProgress}%` }}></div>
                      </div>
                  </div>
              ) : (
                  <div className="flex flex-col items-center animate-scaleIn w-full h-full justify-center">
                      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200vw] h-[200vw] ${glowColor} opacity-20 animate-spin-slow pointer-events-none [mask-image:radial-gradient(circle,black_30%,transparent_70%)]`}></div>
                      
                      {/* Rarity Label (Vietnamese) Positioned Above Image */}
                      <div className={`text-2xl font-black uppercase tracking-[0.3em] mb-8 ${rarityColor} drop-shadow-lg animate-fadeIn delay-500`}>
                          {getRarityLabel(item?.rarity || 'COMMON')}
                      </div>

                      <div className="relative z-10 mb-8">
                          <img 
                            src={resolveImage(item?.imageId)} 
                            alt={item?.name} 
                            className={`w-64 h-64 object-contain animate-float ${getImageEffects(item?.rarity)}`} 
                          />
                      </div>
                      
                      <h1 className="text-4xl font-black text-white text-center mb-10 drop-shadow-md px-4">{item?.name}</h1>
                      <button onClick={handleClaim} className="px-12 py-4 bg-white text-slate-900 rounded-full font-black text-xl shadow-xl hover:scale-105 active:scale-95 transition-all">
                          {pendingRewards.length > 1 ? `XEM ${pendingRewards.length} MÓN` : 'NHẬN QUÀ'}
                      </button>
                  </div>
              )}
          </div>
      )
  };

  const renderBulkSummary = () => (
      <div className="fixed inset-0 z-[100] bg-slate-900 flex flex-col items-center justify-center p-4 animate-fadeIn">
          <h2 className="text-3xl font-black text-white mb-6 uppercase tracking-widest text-center animate-bounce">
              Thu hoạch lớn!
          </h2>
          <div className="bg-white/10 rounded-[2rem] p-4 w-full max-w-2xl border-4 border-white/20 grid grid-cols-2 sm:grid-cols-5 gap-3 max-h-[70vh] overflow-y-auto no-scrollbar">
              {pendingRewards.map((item, idx) => {
                  const style = getCardStyle(item.rarity);
                  return (
                      <div key={idx} className={`bg-white rounded-xl p-2 flex flex-col items-center border-b-4 ${style.border} animate-scaleIn`} style={{animationDelay: `${idx*50}ms`}}>
                          <div className="w-16 h-16 mb-2 flex items-center justify-center">
                              <img src={resolveImage(item.imageId)} alt={item.name} className="w-full h-full object-contain" />
                          </div>
                          <div className={`text-[8px] font-black px-2 py-0.5 rounded-full mb-1 text-white ${style.bg.replace('bg-gradient-to-b', 'bg').replace('50', '500')}`}>
                              {getRarityLabel(item.rarity)}
                          </div>
                          <div className="text-[10px] font-bold text-center text-slate-800 leading-tight truncate w-full">{item.name}</div>
                      </div>
                  )
              })}
          </div>
          <button 
              onClick={() => { setView('MACHINE'); setActiveIndex(-1); setPendingRewards([]); setFinalItem(null); }}
              className="mt-8 px-12 py-4 bg-yellow-400 text-yellow-900 rounded-full font-black text-xl shadow-lg hover:scale-105 active:scale-95 transition-all"
          >
              TUYỆT VỜI
          </button>
      </div>
  );

  const renderCollection = () => {
      const pools = [
          { type: 'COMMON', label: 'Thường', bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-600', prob: 70 },
          { type: 'RARE', label: 'Hiếm', bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', prob: 22 },
          { type: 'EPIC', label: 'Sử Thi', bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', prob: 6 },
          { type: 'LEGENDARY', label: 'Thần Thoại', bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700', prob: 2 },
      ];
      
      const ownedIds = Object.keys(ownedInventory).filter(id => ownedInventory[id] > 0);
      const totalOwnedTypes = ownedIds.length;

      return (
      <div className="flex flex-col h-full bg-slate-50">
          {/* STICKY HEADER */}
          <div className="bg-white px-4 py-3 shadow-sm z-20 flex-shrink-0 border-b border-slate-200 sticky top-0">
              <div className="flex justify-between items-center mb-2">
                   <button onClick={() => setView('MACHINE')} className="flex items-center gap-1 text-blue-600 font-bold text-xs hover:bg-blue-50 px-2 py-1 rounded-lg transition-colors"><ArrowRight className="rotate-180" size={14}/> Quay lại</button>
                   <div className="text-right bg-slate-50 px-3 py-1 rounded-xl border border-slate-100">
                       <span className="text-xl font-black text-blue-600">{totalOwnedTypes}</span><span className="text-xs text-slate-400 font-bold">/{GACHA_ITEMS.length}</span>
                   </div>
              </div>
              <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight leading-none">Bộ Sưu Tập</h3>
              <p className="text-xs text-slate-400 font-bold mt-1">Thu thập trọn bộ {GACHA_ITEMS.length} bảo bối!</p>
          </div>

          <div className="flex-1 overflow-y-auto p-4 pb-24 space-y-8 no-scrollbar">
              {pools.map((pool) => {
                  const poolItems = GACHA_ITEMS.filter(i => i.rarity === pool.type);
                  const poolOwned = poolItems.filter(i => ownedInventory[i.id] > 0).length;
                  const rarityStyle = getCardStyle(pool.type as Rarity);

                  return (
                      <div key={pool.type} className={`rounded-3xl border-4 ${pool.border} ${pool.bg} p-4 relative overflow-hidden`}>
                          <div className="flex justify-between items-center mb-4 relative z-10">
                              <h4 className={`font-black uppercase tracking-wider ${pool.text}`}>
                                  {pool.label} <span className="text-xs opacity-80 normal-case ml-1">({pool.prob}%)</span>
                              </h4>
                              <span className="text-[10px] font-bold bg-white/50 px-2 py-1 rounded-lg text-slate-500">
                                  {poolOwned}/{poolItems.length}
                              </span>
                          </div>
                          
                          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 relative z-10">
                              {poolItems.map(item => {
                                  const count = ownedInventory[item.id] || 0;
                                  const isOwned = count > 0;
                                  const isEquipped = item.id === userState.currentGachaAvatarId;
                                  
                                  return (
                                      <div key={item.id} className="flex flex-col items-center">
                                          <button 
                                              onClick={() => isOwned && setSelectedItem(item)}
                                              disabled={!isOwned}
                                              className={`
                                                  relative w-full aspect-square rounded-xl border-2 flex flex-col items-center justify-center overflow-visible transition-all mb-1
                                                  ${isOwned 
                                                      ? `bg-white border-white shadow-sm active:scale-95 cursor-pointer` 
                                                      : 'bg-black/5 border-black/5 cursor-not-allowed'}
                                                  ${isEquipped ? 'ring-4 ring-green-400 z-10' : ''}
                                              `}
                                          >
                                              {isOwned ? (
                                                  <>
                                                      {count > 1 && (
                                                          <div className="absolute top-1 right-1 bg-red-500 text-white text-[9px] font-black w-5 h-5 rounded-full flex items-center justify-center border border-white z-20">
                                                              {count > 99 ? '99+' : count}
                                                          </div>
                                                      )}
                                                      <div className="absolute inset-0 p-2 flex items-center justify-center">
                                                          <img 
                                                              src={resolveImage(item.imageId)} 
                                                              alt={item.name} 
                                                              className={`w-full h-full object-contain ${getImageEffects(item.rarity)}`} 
                                                          />
                                                      </div>
                                                      <div className="absolute bottom-0 w-full bg-black/70 backdrop-blur-[1px] py-0.5 px-1 rounded-b-lg">
                                                          <div className="text-[7px] font-bold text-center text-white truncate w-full uppercase">{item.name}</div>
                                                      </div>
                                                  </>
                                              ) : (
                                                  <>
                                                      <HelpCircle className="text-slate-300 mb-1" size={24}/>
                                                      <Lock size={12} className="text-slate-400 absolute top-1 right-1"/>
                                                      <div className="absolute bottom-1 text-[8px] font-bold text-slate-400 opacity-60">???</div>
                                                  </>
                                              )}
                                          </button>
                                      </div>
                                  )
                              })}
                          </div>
                      </div>
                  )
              })}
          </div>

          {selectedItem && (
              <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-fadeIn">
                  <div className="bg-white rounded-[2.5rem] w-full max-w-sm p-6 relative overflow-hidden shadow-2xl border-4 border-slate-100 flex flex-col items-center">
                      <button onClick={() => setSelectedItem(null)} className="absolute top-4 right-4 p-2 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors z-20"><X size={20}/></button>

                      <div className="flex flex-col items-center mb-6 w-full relative">
                          <div className="relative z-10 w-48 h-48 flex items-center justify-center mb-4">
                               <img 
                                    src={resolveImage(selectedItem.imageId)} 
                                    alt={selectedItem.name} 
                                    className={`w-full h-full object-contain ${getImageEffects(selectedItem.rarity)}`} 
                               />
                          </div>
                          
                          <div className={`text-[10px] font-black uppercase mb-2 inline-block px-3 py-1 rounded-full text-white ${getCardStyle(selectedItem.rarity).bg.replace('bg-gradient-to-b', 'bg').replace('50', '500')}`}>
                              {getRarityLabel(selectedItem.rarity)}
                          </div>
                          <h3 className="text-2xl font-black text-slate-800 leading-tight text-center">{selectedItem.name}</h3>
                          <div className="text-sm text-slate-400 font-bold mt-1">Đang có: <span className="text-blue-600">{ownedInventory[selectedItem.id]}</span></div>
                      </div>
                      
                      <div className="flex flex-col gap-3 w-full relative z-20">
                          <button 
                            onClick={() => handleEquip(selectedItem)} 
                            className="w-full py-4 bg-green-500 text-white rounded-2xl font-bold shadow-lg shadow-green-200 hover:bg-green-600 transition-colors flex items-center justify-center gap-2 active:scale-95"
                          >
                              <Check size={20}/> Đặt làm Avatar
                          </button>
                      </div>
                  </div>
              </div>
          )}
      </div>
      );
  }

  const renderQuizSelect = () => (
      <div className="flex flex-col h-full bg-slate-900 text-white p-6 relative overflow-hidden">
          <button onClick={() => setView('MACHINE')} className="absolute top-4 left-4 p-2 bg-white/10 rounded-full hover:bg-white/20"><ArrowRight className="rotate-180"/></button>
          
          <div className="text-center mt-8 mb-8 z-10">
              <div className="text-6xl mb-4 animate-bounce">🎓</div>
              <h2 className="text-3xl font-black uppercase text-yellow-400 mb-2">Kiếm Sao</h2>
              <p className="text-slate-300 font-bold">Trả lời câu hỏi để nhận thêm Sao quay Gacha!</p>
          </div>

          <div className="space-y-4 z-10 max-w-sm mx-auto w-full">
              <button onClick={() => setActiveQuiz('EASY')} className="w-full p-4 bg-green-500 hover:bg-green-600 rounded-2xl flex items-center justify-between shadow-lg group active:scale-95 transition-all"><div className="flex items-center gap-3"><div className="bg-white/20 p-2 rounded-full"><Shield size={24}/></div><div className="text-left"><div className="font-black text-lg uppercase">Dễ</div><div className="text-xs opacity-80 font-bold">5 câu hỏi cơ bản</div></div></div><div className="flex items-center gap-1 font-black bg-black/20 px-3 py-1 rounded-lg">+5 <Star size={14} fill="currentColor"/></div></button>
              <button onClick={() => setActiveQuiz('MEDIUM')} className="w-full p-4 bg-blue-500 hover:bg-blue-600 rounded-2xl flex items-center justify-between shadow-lg group active:scale-95 transition-all"><div className="flex items-center gap-3"><div className="bg-white/20 p-2 rounded-full"><Zap size={24}/></div><div className="text-left"><div className="font-black text-lg uppercase">Vừa</div><div className="text-xs opacity-80 font-bold">10 câu Nghe & Dịch</div></div></div><div className="flex items-center gap-1 font-black bg-black/20 px-3 py-1 rounded-lg">+15 <Star size={14} fill="currentColor"/></div></button>
              <button onClick={() => setActiveQuiz('HARD')} className="w-full p-4 bg-purple-600 hover:bg-purple-700 rounded-2xl flex items-center justify-between shadow-lg group active:scale-95 transition-all border-2 border-purple-400"><div className="flex items-center gap-3"><div className="bg-white/20 p-2 rounded-full"><Trophy size={24}/></div><div className="text-left"><div className="font-black text-lg uppercase">Khó</div><div className="text-xs opacity-80 font-bold">15 câu Tổng hợp</div></div></div><div className="flex items-center gap-1 font-black bg-black/20 px-3 py-1 rounded-lg">+30 <Star size={14} fill="currentColor"/></div></button>
          </div>
      </div>
  );

  return (
    <div className="flex flex-col h-full bg-slate-50 animate-fadeIn relative overflow-hidden" onClick={initAudio}>
        {view !== 'QUIZ_SELECT' && view !== 'REVEAL' && view !== 'BULK_SUMMARY' && (
            <div className="bg-indigo-600 px-4 py-3 flex items-center justify-between shadow-md z-30 text-white hidden">
               {/* Header hidden in Machine view for full immersion, shown in others */}
            </div>
        )}

        <div className={`flex-1 relative overflow-hidden ${view === 'MACHINE' ? "bg-slate-900" : ''}`}>
             {view === 'MACHINE' && renderMachine()}
             {view === 'REVEAL' && renderReveal()}
             {view === 'BULK_SUMMARY' && renderBulkSummary()}
             {view === 'COLLECTION' && renderCollection()}
             {view === 'QUIZ_SELECT' && renderQuizSelect()}
        </div>

        {activeQuiz && (
            <LearningQuizModal 
                words={allWords} 
                type={activeQuiz === 'EASY' ? 'WATER' : activeQuiz === 'MEDIUM' ? 'PEST' : 'NEW_ORDER'} 
                questionCount={activeQuiz === 'EASY' ? 5 : activeQuiz === 'MEDIUM' ? 10 : 15}
                onSuccess={handleQuizSuccess}
                onClose={() => setActiveQuiz(null)}
                onShowAlert={(msg, type) => setAlertConfig({ isOpen: true, message: msg, type })}
            />
        )}

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
