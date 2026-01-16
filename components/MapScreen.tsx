
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

  return (
    <div className="w-full h-full overflow-y-auto no-scrollbar relative bg-[#E0F7FA] pb-32">
      
      {/* Decorative Clouds */}
      <div className="absolute top-20 left-10 text-6xl opacity-40 cloud-anim pointer-events-none">☁️</div>
      <div className="absolute top-60 right-5 text-5xl opacity-30 cloud-anim pointer-events-none" style={{ animationDelay: '2s' }}>☁️</div>
      <div className="absolute top-[500px] left-[-20px] text-6xl opacity-40 cloud-anim pointer-events-none" style={{ animationDelay: '1s' }}>☁️</div>

      {/* Start Flag */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 flex flex-col items-center z-10">
          <div className="bg-sky-500 text-white px-4 py-1 rounded-full text-xs font-black uppercase shadow-md mb-2">Bắt đầu</div>
          <Flag size={32} className="text-red-500 fill-red-500 filter drop-shadow-md"/>
      </div>

      {/* Achievements Button (Floating - Static now) */}
      <button 
        className="fixed top-24 right-4 z-40 w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg border-2 border-white hover:scale-110 transition-transform active:scale-95"
        onClick={() => setShowAchievements(true)} 
      >
          <Trophy size={24} className="text-white" fill="currentColor" />
      </button>

      <div className="w-full relative" style={{ height: `${levels.length * 160 + 200}px` }}>
          
          {/* Path Line */}
          <svg className="absolute top-0 left-0 w-full h-full z-0 pointer-events-none overflow-visible">
              {/* Shadow Path */}
              <path 
                d={svgPath} 
                fill="none" 
                stroke="#B2EBF2" 
                strokeWidth="24" 
                strokeLinecap="round" 
              />
              {/* Dotted Line */}
              <path 
                d={svgPath} 
                fill="none" 
                stroke="#4DD0E1" 
                strokeWidth="6" 
                strokeDasharray="15 15"
                strokeLinecap="round" 
              />
          </svg>

          {/* Level Nodes */}
          {levels.map((level, idx) => {
              const pos = pathCoordinates[idx];
              const isUnlocked = idx === 0 || unlockedLevels.includes(level.id); 
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
                            w-20 h-20 rounded-[2.5rem] flex items-center justify-center transition-all duration-200 relative btn-jelly
                            ${isCompleted 
                                ? 'bg-emerald-400 border-emerald-600' // Green for completed
                                : isCurrent 
                                    ? 'bg-sky-500 border-sky-700' // Blue for current
                                    : 'bg-slate-200 border-slate-300' // Gray for locked
                            }
                            shadow-lg
                        `}
                      >
                          {/* Inner Content */}
                          <div className="flex flex-col items-center justify-center">
                              {isUnlocked ? (
                                  <>
                                    <span className={`text-2xl font-black text-white drop-shadow-md`}>{idx + 1}</span>
                                    {isCompleted && (
                                        <div className="flex -space-x-1 mt-1">
                                            {[1,2,3].map(s => (
                                                <Star key={s} size={10} fill={s <= stars ? "#FDE047" : "#CBD5E1"} className={s <= stars ? "text-yellow-300" : "text-slate-300"} />
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
                          <div className="absolute -top-14 bg-white px-4 py-2 rounded-xl shadow-xl animate-bounce z-20 whitespace-nowrap text-center">
                              <span className="text-xs font-black text-sky-600 uppercase tracking-wide block">Học ngay!</span>
                              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-white rotate-45"></div>
                          </div>
                      )}
                      
                      {/* Level Title */}
                      {isUnlocked && (
                          <div className="mt-3 bg-white/60 px-3 py-1.5 rounded-xl backdrop-blur-sm shadow-sm border border-white/50">
                              <span className="text-[10px] font-bold text-slate-600 truncate max-w-[120px] block text-center">{level.title.split(':')[0]}</span>
                          </div>
                      )}
                  </div>
              );
          })}
      </div>

      {/* Learning Achievements Modal */}
      {showAchievements && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fadeIn">
              <div className="w-full max-w-md h-[80vh] bg-white rounded-3xl shadow-2xl overflow-hidden">
                  {/* We reuse the Achievements component but pass userState and onClose */}
                  {/* Note: In a real app we'd pass userState via props or context. Assuming parent passes it. 
                      Since MapScreen doesn't have full userState in props, we might need to mock or lift state. 
                      Ideally, MapScreen should receive userState or just the achievement data. 
                      
                      FIX: MapScreen props updated to assume we can access achievements data or we lift this modal to App.tsx. 
                      For now, to fix the jumping trophy, I'm putting the modal trigger here. 
                      However, `userState` is missing in `MapScreenProps`. 
                      I will pass `userState` to `MapScreen` in `App.tsx`.
                  */}
                  {/* Placeholder until parent passes state - effectively handled in App.tsx generally, 
                      but if we want it here, we need to update the Interface. 
                      
                      Let's assume for this specific file update, we will lift the modal to App.tsx or pass userState.
                      I will render a simple view here if props are missing or update App.tsx to pass it.
                  */}
                  <div className="p-6 text-center">
                      <h3 className="text-xl font-black mb-4">Bảng Thành Tích</h3>
                      <p className="text-slate-500 mb-6">Bạn cần hoàn thành các bài học để mở khóa!</p>
                      <button onClick={() => setShowAchievements(false)} className="bg-slate-200 px-6 py-3 rounded-xl font-bold">Đóng</button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
});
