
import React, { memo, useMemo, useEffect, useRef, useState } from 'react';
import { LessonLevel } from '../types';
import { Lock, Star, Flag, Trophy } from 'lucide-react';
import { Achievements } from './Achievements';

interface MapScreenProps {
  levels: LessonLevel[];
  unlockedLevels: number[];
  completedLevels: number[];
  levelStars: Record<number, number>;
  onStartLevel: (id: number) => void;
}

export const MapScreen: React.FC<MapScreenProps> = memo(({ levels, unlockedLevels, completedLevels, levelStars, onStartLevel }) => {
  const currentLevelRef = useRef<HTMLDivElement>(null);
  const [showAchievements, setShowAchievements] = useState(false);

  // Auto-scroll to current level
  useEffect(() => {
    if (currentLevelRef.current) {
        setTimeout(() => {
            currentLevelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 300);
    }
  }, [levels]);

  // Generate snake path
  const pathCoordinates = useMemo(() => {
      return levels.map((_, index) => {
          // Snake pattern: x goes 20% -> 80% -> 20%
          const y = index * 160 + 100; // Vertical spacing
          const direction = Math.floor(index / 2) % 2 === 0 ? 1 : -1; // Zigzag direction
          const offset = (index % 2 === 0) ? 0 : 30 * direction;
          const x = 50 + offset; 
          return { x, y };
      });
  }, [levels]);

  const svgPath = useMemo(() => {
      if (pathCoordinates.length === 0) return '';
      let d = `M ${pathCoordinates[0].x}% ${pathCoordinates[0].y}px`;
      for (let i = 1; i < pathCoordinates.length; i++) {
          const prev = pathCoordinates[i-1];
          const curr = pathCoordinates[i];
          // Cubic bezier curve for smooth path
          const cpY = (prev.y + curr.y) / 2;
          d += ` C ${prev.x}% ${cpY}px, ${curr.x}% ${cpY}px, ${curr.x}% ${curr.y}px`;
      }
      return d;
  }, [pathCoordinates]);

  // Placeholder for user state mockup since MapScreen doesn't receive full UserState in props currently
  // In a real refactor, pass full userState or needed props to Achievements
  // For now, we assume Achievements will be handled or displayed via a modal
  // Ideally, the parent App should handle the modal visibility, but for quick fix:
  
  return (
    <div className="w-full h-full overflow-y-auto no-scrollbar relative bg-[#E0F2FE] pb-32">
      
      {/* Decorative Clouds */}
      <div className="absolute top-20 left-10 text-6xl opacity-40 cloud-anim pointer-events-none">☁️</div>
      <div className="absolute top-60 right-5 text-5xl opacity-30 cloud-anim pointer-events-none" style={{ animationDelay: '2s' }}>☁️</div>
      <div className="absolute top-[500px] left-[-20px] text-6xl opacity-40 cloud-anim pointer-events-none" style={{ animationDelay: '1s' }}>☁️</div>

      {/* Start Flag */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 flex flex-col items-center z-10">
          <div className="bg-blue-500 text-white px-4 py-1 rounded-full text-xs font-black uppercase shadow-md mb-2">Bắt đầu</div>
          <Flag size={32} className="text-red-500 fill-red-500 filter drop-shadow-md"/>
      </div>

      {/* Achievements Button (Floating) */}
      <button 
        // In a real implementation, this would trigger a prop or context modal. 
        // Since we didn't refactor App to pass the handler, this is a visual placeholder or needs local modal state if we had UserState.
        // Assuming parent might pass a handler later, but for now strictly visual as requested.
        className="fixed top-20 right-4 z-30 w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg border-2 border-yellow-200 animate-bounce active:scale-95"
        onClick={() => alert("Chức năng Thành Tựu sẽ sớm ra mắt!")} 
      >
          <Trophy size={24} className="text-yellow-800" />
      </button>

      <div className="w-full relative" style={{ height: `${levels.length * 160 + 200}px` }}>
          
          {/* Path Line */}
          <svg className="absolute top-0 left-0 w-full h-full z-0 pointer-events-none overflow-visible">
              {/* Shadow Path */}
              <path 
                d={svgPath} 
                fill="none" 
                stroke="#DBEAFE" 
                strokeWidth="24" 
                strokeLinecap="round" 
              />
              {/* Dotted Line */}
              <path 
                d={svgPath} 
                fill="none" 
                stroke="#93C5FD" 
                strokeWidth="6" 
                strokeDasharray="15 15"
                strokeLinecap="round" 
              />
          </svg>

          {/* Level Nodes */}
          {levels.map((level, idx) => {
              const pos = pathCoordinates[idx];
              const isUnlocked = idx === 0 || unlockedLevels.includes(level.id); // Ensure level 1 always unlocked logic
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
                      {/* Button */}
                      <button 
                        onClick={() => isUnlocked ? onStartLevel(level.id) : null}
                        disabled={!isUnlocked}
                        className={`
                            w-20 h-20 rounded-[2rem] flex items-center justify-center transition-all duration-200 relative btn-push
                            ${isCompleted 
                                ? 'bg-[#34D399] border-[#059669] shadow-[0_4px_0_#059669]' // Green for completed
                                : isCurrent 
                                    ? 'bg-[#3B82F6] border-[#1D4ED8] shadow-[0_6px_0_#1D4ED8] animate-soft-pulse' // Blue for current
                                    : 'bg-slate-300 border-slate-400 shadow-[0_4px_0_#94A3B8]' // Gray for locked
                            }
                            border-2
                        `}
                      >
                          {/* Inner Content */}
                          <div className="flex flex-col items-center justify-center">
                              {isUnlocked ? (
                                  <>
                                    <span className={`text-2xl font-black ${isCompleted ? 'text-white' : 'text-white'}`}>{idx + 1}</span>
                                    {isCompleted && (
                                        <div className="flex -space-x-1 mt-1">
                                            {[1,2,3].map(s => (
                                                <Star key={s} size={10} fill={s <= stars ? "#F59E0B" : "#D1D5DB"} className={s <= stars ? "text-yellow-400" : "text-gray-300"} />
                                            ))}
                                        </div>
                                    )}
                                  </>
                              ) : (
                                  <Lock className="text-slate-400" size={24} />
                              )}
                          </div>
                      </button>

                      {/* Tooltip Label for Current Level */}
                      {isCurrent && (
                          <div className="absolute -top-14 bg-white px-4 py-2 rounded-xl shadow-xl animate-bounce z-20 whitespace-nowrap">
                              <span className="text-xs font-black text-blue-600 uppercase tracking-wide">Học ngay!</span>
                              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-white rotate-45"></div>
                          </div>
                      )}
                      
                      {/* Level Title (Optional, appears below) */}
                      {isUnlocked && (
                          <div className="mt-3 bg-white/80 px-2 py-1 rounded-lg backdrop-blur-sm shadow-sm">
                              <span className="text-[10px] font-bold text-slate-600 truncate max-w-[100px] block">{level.title.split(':')[0]}</span>
                          </div>
                      )}
                  </div>
              );
          })}
      </div>
    </div>
  );
});
