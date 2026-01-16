
import React, { memo, useMemo, useEffect, useRef } from 'react';
import { LessonLevel } from '../types';
import { Lock, Star, Play, Flag } from 'lucide-react';

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

  // Generate a winding SVG path
  const pathCoordinates = useMemo(() => {
      return levels.map((_, index) => {
          const y = index * 120 + 50;
          // Sine wave x position
          const x = 50 + 35 * Math.sin(index * 0.8); 
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
    <div className="w-full h-full overflow-y-auto no-scrollbar relative pb-32">
      
      {/* Background World */}
      <div className="absolute inset-0 w-full h-full pointer-events-none">
          {/* Creating a long scrolling background */}
          <div className="w-full" style={{ height: `${levels.length * 120 + 200}px` }}>
              {/* Dirt Path */}
              <svg className="absolute top-0 left-0 w-full h-full z-0" style={{ pointerEvents: 'none' }}>
                  <path 
                    d={svgPath} 
                    fill="none" 
                    stroke="#eecfa1" 
                    strokeWidth="40" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                    style={{ filter: 'drop-shadow(0px 2px 0px rgba(0,0,0,0.1))' }}
                  />
                  <path 
                    d={svgPath} 
                    fill="none" 
                    stroke="#deb887" 
                    strokeWidth="34" 
                    strokeDasharray="10 15"
                    strokeLinecap="round"
                  />
              </svg>

              {/* Decor */}
              {levels.map((_, i) => {
                  if (i % 3 === 0) return <div key={`tree-${i}`} className="absolute text-6xl" style={{ top: `${i*120}px`, left: '10%' }}>🌲</div>
                  if (i % 5 === 0) return <div key={`rock-${i}`} className="absolute text-4xl" style={{ top: `${i*120 + 50}px`, left: '80%' }}>🪨</div>
                  return null;
              })}
          </div>
      </div>

      {/* Level Nodes */}
      <div className="relative w-full z-10" style={{ height: `${levels.length * 120 + 200}px` }}>
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
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"
                    style={{ left: `${pos.x}%`, top: `${pos.y}px` }}
                  >
                      {/* Interaction Button */}
                      <button 
                        onClick={() => onStartLevel(level.id)}
                        disabled={!isUnlocked}
                        className={`w-20 h-20 rounded-full flex items-center justify-center transition-transform active:scale-95 relative group ${
                            isCompleted ? 'bg-green-500 border-b-8 border-green-700' :
                            isCurrent ? 'bg-orange-500 border-b-8 border-orange-700 animate-bounce' :
                            'bg-slate-400 border-b-8 border-slate-600 grayscale'
                        } shadow-xl`}
                      >
                          {/* Inner Icon */}
                          <div className="w-16 h-16 rounded-full border-4 border-white/30 flex items-center justify-center bg-black/10">
                              {isUnlocked ? (
                                  <span className="text-2xl font-black text-white drop-shadow-md">{idx + 1}</span>
                              ) : (
                                  <Lock className="text-white/50" />
                              )}
                          </div>

                          {/* Stars */}
                          {isCompleted && (
                              <div className="absolute -bottom-2 flex gap-0.5">
                                  {[1,2,3].map(s => (
                                      <Star key={s} size={12} fill={s <= stars ? "#fbbf24" : "#4b5563"} className={s <= stars ? "text-yellow-300" : "text-slate-600"} />
                                  ))}
                              </div>
                          )}
                      </button>

                      {/* Tooltip Label */}
                      {isCurrent && (
                          <div className="absolute -top-12 bg-white px-3 py-1 rounded-xl shadow-lg border-2 border-orange-100 whitespace-nowrap animate-pop">
                              <span className="text-xs font-black text-orange-600 uppercase">Học ngay!</span>
                              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-white rotate-45 border-r-2 border-b-2 border-orange-100"></div>
                          </div>
                      )}
                  </div>
              );
          })}
          
          {/* Finish Line */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center">
              <Flag size={48} className="text-red-500 fill-current animate-pulse"/>
              <span className="wood-texture px-4 py-1 rounded text-white font-black text-xs uppercase shadow-md">Đích đến</span>
          </div>
      </div>
    </div>
  );
});
