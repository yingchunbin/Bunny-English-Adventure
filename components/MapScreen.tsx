
import React, { memo, useMemo, useEffect, useRef } from 'react';
import { LessonLevel } from '../types';
import { Lock, Star, Flag } from 'lucide-react';

interface MapScreenProps {
  levels: LessonLevel[];
  unlockedLevels: number[];
  completedLevels: number[];
  levelStars: Record<number, number>;
  onStartLevel: (id: number) => void;
}

export const MapScreen: React.FC<MapScreenProps> = memo(({ levels, unlockedLevels, completedLevels, levelStars, onStartLevel }) => {
  const currentLevelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (currentLevelRef.current) {
        setTimeout(() => {
            currentLevelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 500);
    }
  }, []);

  const pathCoordinates = useMemo(() => {
      return levels.map((_, index) => {
          const y = index * 140 + 80;
          const x = 50 + 35 * Math.sin(index * 0.9); 
          return { x, y };
      });
  }, [levels]);

  const svgPath = useMemo(() => {
      if (pathCoordinates.length === 0) return '';
      let d = `M ${pathCoordinates[0].x}% ${pathCoordinates[0].y}px`;
      for (let i = 1; i < pathCoordinates.length; i++) {
          const prev = pathCoordinates[i-1];
          const curr = pathCoordinates[i];
          const cpY = (prev.y + curr.y) / 2;
          d += ` C ${prev.x}% ${cpY}px, ${curr.x}% ${cpY}px, ${curr.x}% ${curr.y}px`;
      }
      return d;
  }, [pathCoordinates]);

  return (
    <div className="w-full h-full overflow-y-auto no-scrollbar relative bg-[#6AB04C]">
      
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#FFF 2px, transparent 2px)', backgroundSize: '30px 30px' }}></div>

      <div className="w-full relative" style={{ height: `${levels.length * 140 + 300}px` }}>
          
          {/* The Path (Stitched style) */}
          <svg className="absolute top-0 left-0 w-full h-full z-0 pointer-events-none">
              <path 
                d={svgPath} 
                fill="none" 
                stroke="#558C3D" 
                strokeWidth="24" 
                strokeLinecap="round" 
              />
              <path 
                d={svgPath} 
                fill="none" 
                stroke="#FFFFFF" 
                strokeWidth="4" 
                strokeDasharray="10 15"
                strokeLinecap="round"
                opacity="0.6"
              />
          </svg>

          {/* Level Nodes */}
          {levels.map((level, idx) => {
              const pos = pathCoordinates[idx];
              const isUnlocked = unlockedLevels.includes(level.id);
              const isCompleted = completedLevels.includes(level.id);
              const isCurrent = isUnlocked && !isCompleted;
              const stars = levelStars[level.id] || 0;

              return (
                  <div 
                    key={level.id}
                    ref={isCurrent ? currentLevelRef : null}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10"
                    style={{ left: `${pos.x}%`, top: `${pos.y}px` }}
                  >
                      {/* 3D Button Node */}
                      <button 
                        onClick={() => onStartLevel(level.id)}
                        disabled={!isUnlocked}
                        className={`
                            w-20 h-20 rounded-full flex items-center justify-center transition-transform active:translate-y-2 relative
                            ${isCompleted 
                                ? 'bg-[#2ECC71] shadow-[0_6px_0_#27AE60,0_10px_10px_rgba(0,0,0,0.2)]' 
                                : isCurrent 
                                    ? 'bg-[#FF9F43] shadow-[0_6px_0_#E67E22,0_10px_10px_rgba(0,0,0,0.2)] animate-float' 
                                    : 'bg-[#95A5A6] shadow-[0_6px_0_#7F8C8D,0_10px_10px_rgba(0,0,0,0.2)]'
                            }
                        `}
                      >
                          {/* Inner Circle Highlight */}
                          <div className="w-16 h-16 rounded-full border-4 border-white/20 flex items-center justify-center">
                              {isUnlocked ? (
                                  <span className="text-2xl font-black text-white text-sticker">{idx + 1}</span>
                              ) : (
                                  <Lock className="text-white/50" />
                              )}
                          </div>

                          {/* Stars Ribbon */}
                          {isCompleted && (
                              <div className="absolute -bottom-3 bg-white px-2 py-1 rounded-full flex gap-0.5 shadow-sm border border-slate-100">
                                  {[1,2,3].map(s => (
                                      <Star key={s} size={10} fill={s <= stars ? "#F1C40F" : "#ECF0F1"} className={s <= stars ? "text-yellow-400" : "text-slate-200"} />
                                  ))}
                              </div>
                          )}
                      </button>

                      {/* Tooltip Label */}
                      {isCurrent && (
                          <div className="absolute -top-12 bg-white px-4 py-2 rounded-xl shadow-xl animate-bounce">
                              <span className="text-xs font-black text-slate-800 uppercase">Bắt đầu!</span>
                              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-white rotate-45"></div>
                          </div>
                      )}
                  </div>
              );
          })}
          
          <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex flex-col items-center">
              <Flag size={48} className="text-white fill-red-500 filter drop-shadow-lg"/>
          </div>
      </div>
    </div>
  );
});
