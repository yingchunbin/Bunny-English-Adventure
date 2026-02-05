
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { GachaItem, UserState, Rarity, Word } from '../types';
import { GACHA_ITEMS } from '../data/gachaData';
import { Avatar } from './Avatar';
import { Star, Home, RefreshCw, Trophy, HelpCircle, ArrowRight, Check, X, Shield, Zap, Plus, Sparkles, Lock, ArrowUpCircle, Flame } from 'lucide-react';
import { playSFX, initAudio } from '../utils/sound'; // Imported initAudio
import { LearningQuizModal } from './farm/LearningQuizModal';
import { LEVELS } from '../constants';
import { resolveImage } from '../utils/imageUtils';
import { ConfirmModal } from './ui/ConfirmModal';

interface GachaScreenProps {
  userState: UserState;
  onUpdateState: (newState: UserState | ((prev: UserState) => UserState)) => void;
  onExit: () => void;
}

// Config for Ticker
const CARD_WIDTH = 120; // Width of each item in ticker
const CARD_GAP = 12; // Gap between items
const WINNING_INDEX = 45; // The index where the slider stops
const TOTAL_DUMMY_ITEMS = 60; // Total items in strip

// --- CUSTOM EGG COMPONENT ---
const DinoEgg = ({ size = 100, className = "" }: { size?: number, className?: string }) => (
  <svg
    width={size}
    height={size * 1.2}
    viewBox="0 0 100 120"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`${className}`}
    style={{ overflow: 'visible' }}
  >
    <defs>
      <radialGradient id="eggBase" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(30 30) rotate(50) scale(100)">
        <stop stopColor="#FFFBEB" />
        <stop offset="1" stopColor="#FDE68A" />
      </radialGradient>
      <filter id="insetShadow" x="-50%" y="-50%" width="200%" height="200%">
        <feComponentTransfer in="SourceAlpha">
          <feFuncA type="table" tableValues="1 0" />
        </feComponentTransfer>
        <feGaussianBlur stdDeviation="3" />
        <feOffset dx="2" dy="4" result="offsetblur" />
        <feFlood floodColor="rgba(0,0,0,0.1)" result="color" />
        <feComposite in2="offsetblur" operator="in" />
        <feComposite in2="SourceAlpha" operator="in" />
        <feMerge>
          <feMergeNode in="SourceGraphic" />
          <feMergeNode />
        </feMerge>
      </filter>
    </defs>
    
    {/* Main Egg Body */}
    <path
      d="M50 2C25 2 2 35 2 70C2 105 25 118 50 118C75 118 98 105 98 70C98 35 75 2 50 2Z"
      fill="url(#eggBase)"
      stroke="#F59E0B"
      strokeWidth="2"
    />

    {/* Spots */}
    <g clipPath="url(#eggClip)">
        <circle cx="30" cy="40" r="8" fill="#FCA5A5" opacity="0.8" />
        <circle cx="70" cy="30" r="6" fill="#93C5FD" opacity="0.8" />
        <circle cx="80" cy="60" r="10" fill="#86EFAC" opacity="0.8" />
        <circle cx="20" cy="80" r="12" fill="#C4B5FD" opacity="0.8" />
        <circle cx="55" cy="95" r="9" fill="#FDBA74" opacity="0.8" />
        <circle cx="50" cy="55" r="5" fill="#FCD34D" opacity="0.6" />
    </g>

    {/* Highlight/Shine */}
    <ellipse cx="30" cy="25" rx="8" ry="12" fill="white" fillOpacity="0.6" transform="rotate(-20 30 25)" />
  </svg>
);

export const GachaScreen: React.FC<GachaScreenProps> = ({ userState, onUpdateState, onExit }) => {
  const [view, setView] = useState<'MACHINE' | 'REVEAL' | 'COLLECTION' | 'QUIZ_SELECT' | 'BULK_SUMMARY'>('MACHINE');
  
  // Ticker State
  const [isSpinning, setIsSpinning] = useState(false);
  // Ref to track spinning state in the sound loop callback to avoid stale closures
  const isSpinningRef = useRef(false);

  const [tickerItems, setTickerItems] = useState<Rarity[]>([]); 
  const [scrollX, setScrollX] = useState(0);
  const [transitionDuration, setTransitionDuration] = useState(0);
  
  // Reveal State
  const [pendingRewards, setPendingRewards] = useState<GachaItem[]>([]); // Array to support bulk
  const [revealProgress, setRevealProgress] = useState(0); 
  const [isRevealed, setIsRevealed] = useState(false);

  // Collection State
  const [selectedItem, setSelectedItem] = useState<GachaItem | null>(null);
  const [activeQuiz, setActiveQuiz] = useState<'EASY' | 'MEDIUM' | 'HARD' | null>(null);

  // In-Game Alert
  const [alertConfig, setAlertConfig] = useState<{ isOpen: boolean; message: string; type: 'INFO' | 'DANGER' } | null>(null);

  // Use Memo for words to prevent re-renders in child modals
  const allWords = useMemo(() => LEVELS.flatMap(l => l.words), []);

  // -- HELPERS --
  // Use gachaInventory for count-based logic
  const inventory = userState.gachaInventory || {};
  const ownedItems = GACHA_ITEMS.filter(item => (inventory[item.id] || 0) > 0);

  const getRarityStyle = (rarity: Rarity) => {
      switch(rarity) {
          case 'LEGENDARY': return { 
              border: 'border-yellow-400', 
              bg: 'bg-yellow-100', 
              text: 'text-yellow-700', 
              shadow: 'shadow-yellow-200',
              // Image specific glow - applied directly to img tag for contour glow
              imageGlow: 'drop-shadow-[0_0_20px_rgba(250,204,21,1)] filter brightness-110 animate-pulse',
              eggGlow: 'drop-shadow-[0_0_30px_rgba(234,179,8,0.9)]'
          };
          case 'EPIC': return { 
              border: 'border-purple-400', 
              bg: 'bg-purple-100', 
              text: 'text-purple-700', 
              shadow: 'shadow-purple-200',
              imageGlow: 'drop-shadow-[0_0_15px_rgba(168,85,247,0.9)] filter contrast-125',
              eggGlow: 'drop-shadow-[0_0_25px_rgba(168,85,247,0.8)]'
          };
          case 'RARE': return { 
              border: 'border-blue-400', 
              bg: 'bg-blue-100', 
              text: 'text-blue-700', 
              shadow: 'shadow-blue-200',
              imageGlow: 'drop-shadow-[0_0_8px_rgba(96,165,250,0.8)]',
              eggGlow: 'drop-shadow-[0_0_20px_rgba(96,165,250,0.7)]'
          };
          default: return { 
              border: 'border-slate-300', 
              bg: 'bg-slate-100', 
              text: 'text-slate-600', 
              shadow: 'shadow-slate-200',
              imageGlow: '',
              eggGlow: 'drop-shadow-lg'
          };
      }
  };

  const getRarityLabel = (rarity: Rarity) => {
      switch(rarity) {
          case 'LEGENDARY': return 'THẦN THOẠI';
          case 'EPIC': return 'SỬ THI';
          case 'RARE': return 'HIẾM';
          default: return 'THƯỜNG';
      }
  };

  // Adjusted Rates: Common is much higher now
  const getRandomRarity = (): Rarity => {
      const rand = Math.random() * 100;
      if (rand < 1) return 'LEGENDARY'; // 1%
      if (rand < 5) return 'EPIC';      // 4%
      if (rand < 25) return 'RARE';     // 20%
      return 'COMMON';                  // 75%
  };

  // --- SOUND TICKER EFFECT ---
  useEffect(() => {
      isSpinningRef.current = isSpinning;
      
      if (!isSpinning) return;
      
      let speed = 50; // Starting speed (fast)
      let time = 0;
      let timerId: number;

      const tickLoop = () => {
          if (!isSpinningRef.current) return;
          
          playSFX('tick');
          
          // Slow down curve
          time += speed;
          if (time > 3000) speed += 15;
          if (time > 4000) speed += 40;
          
          // Stop sound shortly before visual stop (5500ms)
          if (time < 5200) {
              timerId = window.setTimeout(tickLoop, speed);
          }
      };
      
      tickLoop();
      return () => clearTimeout(timerId);
  }, [isSpinning]);

  // --- ACTIONS ---

  const prepareSpin = (count: number) => {
      const results: GachaItem[] = [];
      
      for(let i=0; i<count; i++) {
          const rarity = getRandomRarity(); // Use new weighted function
          
          const candidates = GACHA_ITEMS.filter(item => item.rarity === rarity);
          const winner = candidates[Math.floor(Math.random() * candidates.length)];
          results.push(winner);
      }
      
      setPendingRewards(results);

      const rarityOrder = { 'LEGENDARY': 3, 'EPIC': 2, 'RARE': 1, 'COMMON': 0 };
      const bestItem = [...results].sort((a,b) => rarityOrder[b.rarity] - rarityOrder[a.rarity])[0];

      // Build Ticker Strip
      const items: Rarity[] = [];
      for (let i = 0; i < TOTAL_DUMMY_ITEMS; i++) {
          if (i === WINNING_INDEX) {
              items.push(bestItem.rarity); 
          } else {
              items.push(getRandomRarity());
          }
      }
      setTickerItems(items);
      
      setTransitionDuration(0);
      setScrollX(0);
      
      return bestItem;
  };

  const handleSpin = (count: number) => {
      const cost = count === 1 ? 10 : 90;
      if (userState.stars < cost) {
          setView('QUIZ_SELECT');
          return;
      }

      // Initialize Audio Context on user interaction to enable auto-play
      initAudio();

      const bestItem = prepareSpin(count);
      if (!bestItem) return;

      onUpdateState(prev => ({ ...prev, stars: prev.stars - cost }));
      setIsSpinning(true);
      // Removed playSFX('click') here to let the tick loop start cleanly

      setTimeout(() => {
          const itemFullWidth = CARD_WIDTH + CARD_GAP;
          const targetX = (WINNING_INDEX * itemFullWidth) - (window.innerWidth < 640 ? window.innerWidth/2 : 200) + (CARD_WIDTH / 2);
          const jitter = (Math.random() * 40) - 20; 

          setTransitionDuration(5000); 
          setScrollX(targetX + jitter);
      }, 100);

      setTimeout(() => {
          setIsSpinning(false);
          setTimeout(() => {
              setRevealProgress(0);
              setIsRevealed(false);
              setView('REVEAL');
              if (bestItem.rarity === 'LEGENDARY') playSFX('cheer');
              else playSFX('success');
          }, 1000);
      }, 5500); 
  };

  const handleRevealInteraction = () => {
      if (isRevealed) {
          // UPDATE INVENTORY with counts
          onUpdateState(prev => {
              const newInv = { ...(prev.gachaInventory || {}) };
              const currentCollection = new Set(prev.gachaCollection || []);
              
              pendingRewards.forEach(item => {
                  newInv[item.id] = (newInv[item.id] || 0) + 1;
                  currentCollection.add(item.id);
              });
              
              return {
                  ...prev,
                  gachaInventory: newInv,
                  gachaCollection: Array.from(currentCollection)
              };
          });

          if (pendingRewards.length > 1) {
              setView('BULK_SUMMARY');
          } else {
              setView('MACHINE');
              setPendingRewards([]);
          }
          return;
      }

      const step = 20;
      const next = revealProgress + step;
      playSFX('crack');

      if (next >= 100) {
          setRevealProgress(100);
          setIsRevealed(true);
          playSFX('powerup');
          playSFX('cheer');
      } else {
          setRevealProgress(next);
      }
  };

  const handleFuse = () => {
      if (!selectedItem) return;
      const count = inventory[selectedItem.id] || 0;
      if (count < 10) return;

      // Determine next rarity
      let nextRarity: Rarity | null = null;
      if (selectedItem.rarity === 'COMMON') nextRarity = 'RARE';
      else if (selectedItem.rarity === 'RARE') nextRarity = 'EPIC';
      else if (selectedItem.rarity === 'EPIC') nextRarity = 'LEGENDARY';

      if (!nextRarity) {
          setAlertConfig({ isOpen: true, message: "Thần Thoại là cấp cao nhất rồi, không thể nâng cấp nữa!", type: 'INFO' });
          return;
      }

      // Pick a random item of the next rarity
      const candidates = GACHA_ITEMS.filter(i => i.rarity === nextRarity);
      if (candidates.length === 0) return; // Should not happen
      const reward = candidates[Math.floor(Math.random() * candidates.length)];

      playSFX('powerup');
      
      // Consume 10 items
      onUpdateState(prev => ({
          ...prev,
          gachaInventory: {
              ...prev.gachaInventory,
              [selectedItem.id]: (prev.gachaInventory?.[selectedItem.id] || 0) - 10
          }
      }));

      // Set up reveal flow for the new item
      setSelectedItem(null); // Close modal
      setPendingRewards([reward]);
      setRevealProgress(0);
      setIsRevealed(false);
      setView('REVEAL');
  };

  const handleQuizSuccess = () => {
      if (!activeQuiz) return;
      let reward = 0;
      if (activeQuiz === 'EASY') reward = 5;
      if (activeQuiz === 'MEDIUM') reward = 15;
      if (activeQuiz === 'HARD') reward = 30;

      playSFX('success');
      onUpdateState(prev => ({ ...prev, stars: prev.stars + reward }));
      setActiveQuiz(null);
      setView('MACHINE'); 
  };

  const handleEquip = (item: GachaItem) => {
      onUpdateState(prev => ({ ...prev, currentGachaAvatarId: item.imageId, currentAvatarId: 'gacha_custom' }));
      setSelectedItem(null);
      playSFX('click');
  };

  // --- RENDERERS ---

  const renderTicker = () => (
      <div className="flex flex-col items-center justify-center h-full relative w-full overflow-hidden">
           {/* Top Bar */}
           <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-4 py-2 rounded-full shadow-lg border-2 border-yellow-300 flex items-center gap-2 z-20">
               <Star className="text-yellow-400 fill-yellow-400 animate-pulse" size={24}/>
               <span className="text-xl font-black text-yellow-600">{userState.stars}</span>
               <button onClick={() => setView('QUIZ_SELECT')} className="bg-yellow-400 text-white rounded-full p-1 hover:bg-yellow-500 active:scale-90 transition-transform"><Plus size={16}/></button>
           </div>

           {/* CS:GO Ticker Machine */}
           <div className="w-full max-w-2xl bg-slate-800 p-1 py-8 relative shadow-2xl border-y-8 border-slate-900 overflow-hidden mb-10">
               <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-yellow-400 z-20 shadow-[0_0_10px_rgba(250,204,21,0.8)]"></div>
               <div className="absolute left-1/2 top-0 -translate-x-1/2 -mt-2 text-yellow-400 z-20">▼</div>
               <div className="absolute left-1/2 bottom-0 -translate-x-1/2 -mb-2 text-yellow-400 z-20">▲</div>

               <div 
                  className="flex items-center will-change-transform"
                  style={{
                      transform: `translateX(-${scrollX}px)`,
                      transition: `transform ${transitionDuration}ms cubic-bezier(0.1, 0.9, 0.2, 1)`
                  }}
               >
                   {tickerItems.map((rarity, idx) => {
                       const style = getRarityStyle(rarity);
                       // Add a glow style based on rarity to the box
                       const boxGlow = rarity === 'LEGENDARY' ? 'shadow-[0_0_20px_rgba(234,179,8,0.8)] border-yellow-300' 
                                     : rarity === 'EPIC' ? 'shadow-[0_0_15px_rgba(168,85,247,0.8)] border-purple-400' 
                                     : rarity === 'RARE' ? 'shadow-[0_0_10px_rgba(59,130,246,0.5)] border-blue-400' 
                                     : '';

                       return (
                           <div 
                                key={idx} 
                                className={`flex-shrink-0 mx-[6px] rounded-xl border-4 ${style.border} ${style.bg} flex items-center justify-center relative shadow-inner ${boxGlow}`}
                                style={{ width: `${CARD_WIDTH}px`, height: `${CARD_WIDTH}px` }}
                           >
                               <div className="absolute inset-0 bg-white/10 opacity-50 rounded-lg"></div>
                               <DinoEgg size={70} className="z-10" />
                               <span className="absolute bottom-2 text-[10px] font-black uppercase opacity-60 text-slate-900 tracking-wider">
                                   {rarity === 'LEGENDARY' ? '???' : '?'}
                               </span>
                           </div>
                       )
                   })}
               </div>
               
               <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-slate-900 to-transparent z-10 pointer-events-none"></div>
               <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-slate-900 to-transparent z-10 pointer-events-none"></div>
           </div>

           <div className="px-4 w-full max-w-sm flex flex-col gap-3">
               <button 
                  onClick={() => handleSpin(1)} 
                  disabled={isSpinning}
                  className="w-full py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl font-black text-xl shadow-[0_6px_0_#312e81] active:shadow-none active:translate-y-1.5 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group"
               >
                   <RefreshCw size={24} className={isSpinning ? "animate-spin" : ""}/> 
                   {isSpinning ? "Đang quay..." : "QUAY 1 (10 Sao)"}
               </button>

               <button 
                  onClick={() => handleSpin(10)} 
                  disabled={isSpinning}
                  className="w-full py-4 bg-gradient-to-r from-pink-500 to-rose-600 text-white rounded-2xl font-black text-xl shadow-[0_6px_0_#9f1239] active:shadow-none active:translate-y-1.5 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden"
               >
                   <div className="absolute top-0 right-0 bg-yellow-400 text-yellow-900 text-[10px] font-black px-2 py-0.5 rounded-bl-lg">HOT</div>
                   <Sparkles size={24} className={isSpinning ? "animate-pulse" : ""}/> 
                   {isSpinning ? "Đang quay..." : "QUAY 10 (90 Sao)"}
               </button>
           </div>
           
           <p className="text-center text-slate-400 font-bold mt-4 text-xs uppercase tracking-widest">
               Cơ hội nhận vật phẩm Thần Thoại!
           </p>
      </div>
  );

  const renderReveal = () => {
      if (pendingRewards.length === 0) return null;
      
      const rarityOrder = { 'LEGENDARY': 3, 'EPIC': 2, 'RARE': 1, 'COMMON': 0 };
      const bestItem = [...pendingRewards].sort((a,b) => rarityOrder[b.rarity] - rarityOrder[a.rarity])[0];
      
      const style = getRarityStyle(bestItem.rarity);
      const shakeClass = revealProgress > 0 && !isRevealed ? "animate-wiggle" : "";

      return (
          <div className="fixed inset-0 z-[100] bg-slate-900/90 backdrop-blur-sm flex flex-col items-center justify-center p-4 animate-fadeIn">
              {!isRevealed ? (
                  <>
                      <div className="text-white text-2xl font-black mb-12 animate-bounce uppercase tracking-widest text-center">
                          {pendingRewards.length > 1 ? "Trứng Vàng!" : "Nặn trứng nào!"} <br/>
                          <span className="text-sm font-normal opacity-70 normal-case">(Nhấp liên tục vào trứng)</span>
                      </div>
                      
                      {/* EGG CONTAINER: No box, just egg + glow */}
                      <div 
                          className={`relative w-64 h-64 flex items-center justify-center cursor-pointer active:scale-95 transition-transform ${shakeClass}`}
                          onClick={handleRevealInteraction}
                      >
                           <div className="transition-transform duration-100 z-10" style={{ transform: `scale(${1 + (revealProgress / 500)})` }}>
                               <DinoEgg size={220} className={style.eggGlow} />
                           </div>
                           
                           {/* Cracks visuals */}
                           {revealProgress > 30 && <div className="absolute top-1/4 left-1/4 w-12 h-1 bg-black/40 rotate-45 rounded-full filter blur-[1px] z-20"></div>}
                           {revealProgress > 60 && <div className="absolute bottom-1/3 right-1/3 w-16 h-1 bg-black/40 -rotate-12 rounded-full filter blur-[1px] z-20"></div>}
                           {revealProgress > 80 && <div className="absolute inset-0 bg-white/30 animate-pulse rounded-full z-20 mix-blend-overlay"></div>}
                           
                           {/* Glow behind egg based on rarity */}
                           {['LEGENDARY', 'EPIC'].includes(bestItem.rarity) && (
                               <div className={`absolute inset-0 blur-3xl opacity-50 rounded-full animate-pulse -z-10 ${bestItem.rarity === 'LEGENDARY' ? 'bg-yellow-500' : 'bg-purple-500'}`}></div>
                           )}

                           <div className="absolute -bottom-16 font-black text-2xl text-white/50 uppercase tracking-widest animate-pulse">
                               ???
                           </div>
                      </div>

                      <div className="w-64 h-4 bg-slate-700/50 rounded-full mt-16 overflow-hidden border-2 border-white/20">
                          <div className="h-full bg-yellow-400 transition-all duration-200" style={{ width: `${revealProgress}%` }}></div>
                      </div>
                  </>
              ) : (
                  <>
                      {/* The Revealed Item */}
                      <div className="relative animate-scaleIn">
                          <div className={`absolute inset-0 bg-white/50 blur-3xl animate-pulse`}></div>
                          <div className={`relative w-72 aspect-square bg-white rounded-[2.5rem] border-8 ${style.border} p-6 shadow-2xl flex flex-col items-center justify-center`}>
                              
                              {['LEGENDARY', 'EPIC'].includes(bestItem.rarity) && (
                                   <div className="absolute inset-0 overflow-hidden rounded-[2rem]">
                                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] h-[200%] bg-gradient-to-r from-transparent via-yellow-200/30 to-transparent animate-spin-slow"></div>
                                   </div>
                              )}
                              
                              <div className="w-48 h-48 relative z-10 mb-4 flex items-center justify-center">
                                  {/* Using direct IMG for glow effects to avoid overflow clipping in Avatar component */}
                                  <img 
                                    src={resolveImage(bestItem.imageId)} 
                                    alt={bestItem.name} 
                                    className={`w-full h-full object-contain ${style.imageGlow}`} 
                                  />
                              </div>
                              
                              <div className={`px-4 py-1 rounded-full text-xs font-black text-white uppercase tracking-widest mb-2 z-10 ${style.border.replace('border', 'bg').replace('400', '500')}`}>
                                  {getRarityLabel(bestItem.rarity)}
                              </div>
                              <h2 className={`text-2xl font-black text-center z-10 ${style.text.replace('100', '600')}`}>
                                  {bestItem.name}
                              </h2>
                          </div>
                      </div>

                      <button 
                          onClick={handleRevealInteraction} 
                          className="mt-10 px-12 py-4 bg-white text-slate-900 rounded-full font-black text-xl shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                      >
                          {pendingRewards.length > 1 ? `XEM TẤT CẢ (${pendingRewards.length})` : <><Check size={24} className="text-green-500" /> NHẬN</>}
                      </button>
                  </>
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
                  const style = getRarityStyle(item.rarity);
                  return (
                      <div key={idx} className={`bg-white rounded-xl p-2 flex flex-col items-center border-b-4 ${style.border} animate-scaleIn`} style={{animationDelay: `${idx*50}ms`}}>
                          <div className="w-16 h-16 mb-2 flex items-center justify-center">
                              <img 
                                src={resolveImage(item.imageId)} 
                                alt={item.name} 
                                className={`w-full h-full object-contain ${style.imageGlow}`} 
                              />
                          </div>
                          <div className={`text-[8px] font-black text-white px-2 py-0.5 rounded-full mb-1 ${style.border.replace('border','bg').replace('400', '500')}`}>
                              {getRarityLabel(item.rarity)}
                          </div>
                          <div className="text-[10px] font-bold text-center text-slate-800 leading-tight truncate w-full">{item.name}</div>
                      </div>
                  )
              })}
          </div>
          <button 
              onClick={() => { setView('MACHINE'); setPendingRewards([]); }}
              className="mt-8 px-12 py-4 bg-yellow-400 text-yellow-900 rounded-full font-black text-xl shadow-lg hover:scale-105 active:scale-95 transition-all"
          >
              TUYỆT VỜI
          </button>
      </div>
  );

  const renderCollection = () => {
      // Group items by rarity for Pokedex view
      const pools = [
          { type: 'COMMON', label: 'Thường', bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-600', prob: 75 },
          { type: 'RARE', label: 'Hiếm', bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', prob: 20 },
          { type: 'EPIC', label: 'Sử Thi', bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', prob: 4 },
          { type: 'LEGENDARY', label: 'Thần Thoại', bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700', prob: 1 },
      ];

      const userInventory = userState.gachaInventory || {};

      return (
      <div className="w-full h-full overflow-y-auto p-4 bg-slate-50 pb-24">
          <div className="flex justify-between items-center mb-6 px-2">
               <div>
                   <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Bộ Sưu Tập</h3>
                   <p className="text-xs text-slate-400 font-bold">Thu thập trọn bộ {GACHA_ITEMS.length} bảo bối!</p>
               </div>
               <div className="text-right bg-white px-4 py-2 rounded-xl border-2 border-slate-100 shadow-sm">
                   <div className="text-2xl font-black text-blue-600">{ownedItems.length}<span className="text-sm text-slate-300">/{GACHA_ITEMS.length}</span></div>
               </div>
          </div>

          <div className="space-y-8 pb-10">
              {pools.map((pool) => {
                  const poolItems = GACHA_ITEMS.filter(i => i.rarity === pool.type);
                  const poolOwned = poolItems.filter(i => (userInventory[i.id] || 0) > 0).length;
                  const rarityStyle = getRarityStyle(pool.type as Rarity);

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
                                  const count = userInventory[item.id] || 0;
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
                                                      <div className="absolute inset-0 p-2 flex items-center justify-center">
                                                          <img 
                                                              src={resolveImage(item.imageId)} 
                                                              alt={item.name} 
                                                              className={`w-full h-full object-contain ${rarityStyle.imageGlow}`} 
                                                          />
                                                      </div>
                                                      <div className="absolute top-1 right-1 bg-black/50 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full z-10 backdrop-blur-[1px]">
                                                          x{count}
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
              <div className="fixed bottom-0 left-0 w-full bg-white p-6 shadow-[0_-5px_30px_rgba(0,0,0,0.15)] z-30 rounded-t-[2.5rem] flex flex-col items-center animate-slideUp border-t-4 border-slate-100 max-h-[85vh] overflow-y-auto">
                  <div className="flex items-center gap-6 mb-6">
                      <div className={`p-4 w-24 h-24 flex items-center justify-center rounded-2xl border-4 ${getRarityStyle(selectedItem.rarity).border} shadow-lg relative`}>
                           <img 
                                src={resolveImage(selectedItem.imageId)} 
                                alt={selectedItem.name} 
                                className={`w-full h-full object-contain ${getRarityStyle(selectedItem.rarity).imageGlow}`} 
                           />
                           <div className="absolute -top-3 -right-3 bg-red-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-black text-xs border-2 border-white shadow-md">
                               x{inventory[selectedItem.id]}
                           </div>
                      </div>
                      <div>
                          <div className={`text-[10px] font-black uppercase mb-1 inline-block px-2 py-0.5 rounded-md text-white ${getRarityStyle(selectedItem.rarity).border.replace('border', 'bg').replace('400', '500')}`}>
                              {getRarityLabel(selectedItem.rarity)}
                          </div>
                          <h3 className="text-2xl font-black text-slate-800 leading-tight">{selectedItem.name}</h3>
                          <p className="text-xs text-slate-500 font-bold mt-1">Sở hữu: {inventory[selectedItem.id]}</p>
                      </div>
                  </div>

                  <div className="flex flex-col gap-3 w-full">
                      {/* Equip Button */}
                      <button onClick={() => handleEquip(selectedItem)} className="w-full py-4 bg-green-500 text-white rounded-2xl font-bold shadow-lg shadow-green-200 hover:bg-green-600 transition-colors flex items-center justify-center gap-2">
                          <Check size={20}/> Dùng làm Avatar
                      </button>
                      
                      {/* Fuse Button */}
                      {(inventory[selectedItem.id] || 0) >= 10 && selectedItem.rarity !== 'LEGENDARY' && (
                          <button 
                              onClick={handleFuse}
                              className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl font-bold shadow-lg shadow-purple-200 flex items-center justify-center gap-2 animate-pulse"
                          >
                              <div className="flex flex-col items-center leading-none">
                                  <div className="flex items-center gap-2">
                                      <Flame size={20} fill="currentColor"/> DUNG HỢP (NÂNG CẤP)
                                  </div>
                                  <span className="text-[10px] opacity-80 mt-1">Tiêu hao 10 thẻ - Nhận 1 thẻ cấp cao hơn</span>
                              </div>
                          </button>
                      )}

                      <button onClick={() => setSelectedItem(null)} className="w-full py-3 bg-slate-100 text-slate-500 rounded-2xl font-bold hover:bg-slate-200 transition-colors">
                          Đóng
                      </button>
                  </div>
              </div>
          )}
      </div>
      );
  };

  const renderQuizSelect = () => (
      <div className="flex flex-col h-full bg-slate-900 text-white p-6 relative overflow-hidden">
          <button onClick={() => setView('MACHINE')} className="absolute top-4 left-4 p-2 bg-white/10 rounded-full hover:bg-white/20"><ArrowRight className="rotate-180"/></button>
          
          <div className="text-center mt-8 mb-8 z-10">
              <div className="text-6xl mb-4 animate-bounce">🎓</div>
              <h2 className="text-3xl font-black uppercase text-yellow-400 mb-2">Kiếm Sao</h2>
              <p className="text-slate-300 font-bold">Trả lời câu hỏi để nhận thêm Sao quay Gacha!</p>
          </div>

          <div className="space-y-4 z-10 max-w-sm mx-auto w-full">
              <button 
                  onClick={() => setActiveQuiz('EASY')}
                  className="w-full p-4 bg-green-500 hover:bg-green-600 rounded-2xl flex items-center justify-between shadow-lg group active:scale-95 transition-all"
              >
                  <div className="flex items-center gap-3">
                      <div className="bg-white/20 p-2 rounded-full"><Shield size={24}/></div>
                      <div className="text-left">
                          <div className="font-black text-lg uppercase">Dễ</div>
                          <div className="text-xs opacity-80 font-bold">5 câu hỏi cơ bản</div>
                      </div>
                  </div>
                  <div className="flex items-center gap-1 font-black bg-black/20 px-3 py-1 rounded-lg">
                      +5 <Star size={14} fill="currentColor"/>
                  </div>
              </button>

              <button 
                  onClick={() => setActiveQuiz('MEDIUM')}
                  className="w-full p-4 bg-blue-500 hover:bg-blue-600 rounded-2xl flex items-center justify-between shadow-lg group active:scale-95 transition-all"
              >
                  <div className="flex items-center gap-3">
                      <div className="bg-white/20 p-2 rounded-full"><Zap size={24}/></div>
                      <div className="text-left">
                          <div className="font-black text-lg uppercase">Vừa</div>
                          <div className="text-xs opacity-80 font-bold">10 câu Nghe & Dịch</div>
                      </div>
                  </div>
                  <div className="flex items-center gap-1 font-black bg-black/20 px-3 py-1 rounded-lg">
                      +15 <Star size={14} fill="currentColor"/>
                  </div>
              </button>

              <button 
                  onClick={() => setActiveQuiz('HARD')}
                  className="w-full p-4 bg-purple-600 hover:bg-purple-700 rounded-2xl flex items-center justify-between shadow-lg group active:scale-95 transition-all border-2 border-purple-400"
              >
                  <div className="flex items-center gap-3">
                      <div className="bg-white/20 p-2 rounded-full"><Trophy size={24}/></div>
                      <div className="text-left">
                          <div className="font-black text-lg uppercase">Khó</div>
                          <div className="text-xs opacity-80 font-bold">15 câu Tổng hợp</div>
                      </div>
                  </div>
                  <div className="flex items-center gap-1 font-black bg-black/20 px-3 py-1 rounded-lg">
                      +30 <Star size={14} fill="currentColor"/>
                  </div>
              </button>
          </div>

          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
               {[...Array(20)].map((_, i) => (
                   <Star key={i} className="absolute animate-pulse" style={{ left: `${Math.random()*100}%`, top: `${Math.random()*100}%`, animationDelay: `${Math.random()}s` }} size={Math.random()*20 + 10} />
               ))}
          </div>
      </div>
  );
  
  return (
    <div className="flex flex-col h-full bg-slate-50 animate-fadeIn relative overflow-hidden">
        {/* Top Nav */}
        {view !== 'QUIZ_SELECT' && view !== 'REVEAL' && view !== 'BULK_SUMMARY' && (
            <div className="bg-indigo-600 px-4 py-3 flex items-center justify-between shadow-md z-30 text-white">
                <div className="flex items-center gap-4">
                    <button onClick={onExit} className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"><Home size={20}/></button>
                    <h2 className="font-black text-lg uppercase tracking-wider">Vòng Quay May Mắn</h2>
                </div>
                <div className="flex bg-indigo-800 rounded-xl p-1 gap-1">
                    <button 
                        onClick={() => setView('MACHINE')} 
                        className={`px-4 py-1.5 rounded-lg font-bold text-xs uppercase transition-all ${view === 'MACHINE' ? 'bg-white text-indigo-700 shadow-sm' : 'text-indigo-300 hover:text-white'}`}
                    >
                        Quay
                    </button>
                    <button 
                        onClick={() => setView('COLLECTION')} 
                        className={`px-4 py-1.5 rounded-lg font-bold text-xs uppercase transition-all ${view === 'COLLECTION' ? 'bg-white text-indigo-700 shadow-sm' : 'text-indigo-300 hover:text-white'}`}
                    >
                        Túi Đồ
                    </button>
                </div>
            </div>
        )}

        {/* Main Content Area */}
        <div className={`flex-1 relative overflow-hidden ${view === 'MACHINE' ? "bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" : ''}`}>
             {view === 'MACHINE' && renderTicker()}
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
