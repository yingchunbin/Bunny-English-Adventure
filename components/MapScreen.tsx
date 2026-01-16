
import React, { memo, useMemo, useEffect, useRef } from 'react';
import { LessonLevel } from '../types';
import { Map, Star, Skull, Gamepad2, Lock, Play } from 'lucide-react';

interface MapScreenProps {
  levels: LessonLevel[];
  unlockedLevels: number[];
  completedLevels: number[];
  levelStars: Record<number, number>;
  onStartLevel: (id: number) => void;
}

export const MapScreen: React.FC<MapScreenProps> = memo(({ levels, unlockedLevels, completedLevels, levelStars, onStartLevel }) => {
  
  const currentLevelRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to the latest unlocked level
  useEffect(() => {
    if (currentLevelRef.current) {
        setTimeout(() => {
            currentLevelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 500);
    }
  }, []);

  // Calculate SVG Path for the road connecting the levels
  const pathData = useMemo(() => {
    if (levels.length === 0) return '';
    
    const nodeHeight = 180; // Increased spacing slightly for better text fit
    const centerX = 50; // Percentage
    const xOffset = 30; // Percentage swing left/right

    let d = `M ${centerX} 60`; 

    levels.forEach((_, i) => {
        if (i === levels.length - 1) return;
        
        const currentX = i % 2 === 0 ? centerX - xOffset : centerX + xOffset;
        const currentY = (i * nodeHeight) + 60; 

        const nextX = (i + 1) % 2 === 0 ? centerX - xOffset : centerX + xOffset;
        const nextY = ((i + 1) * nodeHeight) + 60;

        const cp1x = currentX;
        const cp1y = currentY + (nodeHeight / 2);
        const cp2x = nextX;
        const cp2y = nextY - (nodeHeight / 2);

        if (i === 0) {
             d = `M ${currentX} ${currentY}`;
        }
        
        d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${nextX} ${nextY}`;
    });

    return d;
  }, [levels.length]);

  return (
    <div className="flex flex-col items-center w-full min-h-full py-8 animate-fadeIn relative">
      
      {/* Background Decor */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0 overflow-hidden">
          <div className="absolute top-20 left-10 text-6xl opacity-20 animate-pulse">☁️</div>
          <div className="absolute top-60 right-10 text-6xl opacity-20 animate-pulse delay-700">☁️</div>
          <div className="absolute bottom-40 left-20 text-6xl opacity-20 animate-pulse delay-1000">☁️</div>
      </div>

      <h2 className="text-2xl font-black text-blue-900 mb-8 flex items-center gap-2 z-10 bg-white/90 px-6 py-3 rounded-full shadow-lg border-2 border-blue-100 sticky top-4 backdrop-blur-md">
        <Map className="text-blue-500" /> Bản đồ học tập
      </h2>
      
      <div className="relative w-full max-w-md px-6 pb-32">
        
        {/* The Road */}
        <svg className="absolute top-0 left-0 w-full h-full -z-10 pointer-events-none" style={{ minHeight: `${levels.length * 180}px` }}>
            <path 
                d={pathData} 
                fill="none" 
                stroke="#cbd5e1" 
                strokeWidth="16" 
                strokeLinecap="round" 
                strokeDasharray="20 30"
                className="drop-shadow-sm opacity-60"
            />
        </svg>

        <div className="flex flex-col items-center gap-[88px] w-full mt-4">
            {levels.map((level, idx) => {
                const isUnlocked = unlockedLevels.includes(level.id);
                const isCompleted = completedLevels.includes(level.id);
                const stars = levelStars?.[level.id] || 0;
                
                // Determine if this is the "current" level (unlocked but not completed, OR the last unlocked one)
                // Simplified: It's current if unlocked and not completed.
                const isCurrent = isUnlocked && !isCompleted;
                
                // Zig-zag layout
                const translateX = idx % 2 === 0 ? '-translate-x-14' : 'translate-x-14';

                return (
                <div 
                    key={level.id} 
                    ref={isCurrent ? currentLevelRef : null}
                    className={`relative flex flex-col items-center group transition-transform duration-500 ${translateX}`}
                >
                    {/* Level Button */}
                    <button 
                    onClick={() => onStartLevel(level.id)} 
                    disabled={!isUnlocked} 
                    className={`
                        relative w-24 h-24 rounded-[2.5rem] flex items-center justify-center border-b-[6px] shadow-xl transition-all z-10 
                        ${!isUnlocked 
                            ? "bg-slate-100 border-slate-300 text-slate-300 cursor-not-allowed" 
                            : "hover:scale-110 active:scale-95 cursor-pointer hover:-translate-y-1"
                        }
                        ${level.type === 'EXAM' 
                            ? "bg-gradient-to-b from-red-400 to-red-500 border-red-700 ring-4 ring-red-100" 
                            : level.type === 'GAME' 
                                ? "bg-gradient-to-b from-purple-400 to-purple-500 border-purple-700 ring-4 ring-purple-100" 
                                : isCompleted 
                                    ? "bg-gradient-to-b from-green-400 to-green-500 border-green-700" 
                                    : "bg-gradient-to-b from-blue-400 to-blue-500 border-blue-700"
                        }
                    `}
                    >
                        <span className="text-3xl font-black text-white drop-shadow-md">
                            {level.type === 'EXAM' ? <Skull size={32}/> : level.type === 'GAME' ? <Gamepad2 size={32}/> : idx + 1}
                        </span>
                        
                        {/* Lock Icon */}
                        {!isUnlocked && (
                            <div className="absolute inset-0 flex items-center justify-center bg-white/40 rounded-[2.5rem] backdrop-blur-[1px]">
                                <Lock className="text-slate-500" size={24} />
                            </div>
                        )}

                        {/* "Start Here" Indicator */}
                        {isCurrent && (
                            <div className="absolute -top-10 left-1/2 -translate-x-1/2 flex flex-col items-center z-20 animate-bounce">
                                <div className="bg-orange-500 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg border-2 border-white whitespace-nowrap flex items-center gap-1">
                                    <Play size={10} fill="currentColor" /> HỌC NGAY
                                </div>
                                <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-orange-500"></div>
                            </div>
                        )}
                    </button>

                    {/* Stars */}
                    {isUnlocked && (
                        <div className="absolute -bottom-4 flex gap-0.5 bg-white/90 px-2 py-1 rounded-full shadow-sm border border-slate-100 transform z-20">
                            {[1,2,3].map(s => (
                                <Star 
                                    key={s} 
                                    size={14} 
                                    fill={s <= stars ? "#FACC15" : "#E2E8F0"}
                                    strokeWidth={0}
                                    className={s <= stars ? "scale-110" : ""} 
                                />
                            ))}
                        </div>
                    )}
                    
                    {/* Unit Title - Fixed Truncation */}
                    <div className="absolute top-28 w-40 flex flex-col items-center z-0">
                        <div className="bg-white/95 px-3 py-2 rounded-xl shadow-sm border-2 border-slate-100 text-center backdrop-blur-sm">
                            <p className="text-[11px] font-bold text-slate-700 leading-tight line-clamp-2">
                                {level.title}
                            </p>
                        </div>
                    </div>
                </div>
                );
            })}
        </div>
      </div>
    </div>
  );
});
