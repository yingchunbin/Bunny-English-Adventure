
import React, { useState } from 'react';
import { UserState, FarmPlot, LessonLevel } from '../types';
import { CROPS } from '../data/farmData';
import { Screen } from '../types';
import { PlotModal } from './farm/PlotModal';
import { useFarmGame } from '../hooks/useFarmGame';
import { Lock } from 'lucide-react';

interface FarmProps {
  userState: UserState;
  onUpdateState: (newState: UserState | ((prev: UserState) => UserState)) => void;
  onExit: () => void;
  allWords: any[]; 
  levels?: LessonLevel[]; 
  onNavigate: (target: string) => void; // Changed type signature
  onShowAchievements: () => void;
}

export const Farm: React.FC<FarmProps> = ({ userState, onUpdateState, onNavigate }) => {
  const { now, plantSeed, waterPlot, harvestPlot } = useFarmGame(userState, onUpdateState);
  const [activeModal, setActiveModal] = useState<string>('NONE');
  const [selectedPlotId, setSelectedPlotId] = useState<number | null>(null);
  
  // --- RENDERING HELPERS ---

  const renderPlot = (plot: FarmPlot, index: number) => {
      const crop = plot.cropId ? CROPS.find(c => c.id === plot.cropId) : null;
      const row = Math.floor(index / 2);
      const col = index % 2;
      
      // Adjusted positioning for the Farm Tab view (centered vertically)
      const leftBase = 50 + (col * 120) - (row * 60); 
      const topBase = 200 + (row * 80) + (col * 40);

      const status = crop && plot.plantedAt ? Math.min(100, ((now - plot.plantedAt)/1000 / crop.growthTime)*100) : 0;
      const isReady = status >= 100;

      return (
          <div 
            key={plot.id}
            onClick={() => { setSelectedPlotId(plot.id); setActiveModal('PLOT'); }}
            className="absolute transition-transform hover:scale-105 active:scale-95 cursor-pointer z-10"
            style={{ left: `${leftBase}px`, top: `${topBase}px` }}
          >
              <div className="w-28 h-24 relative">
                  <div className={`absolute bottom-0 w-full h-12 rounded-3xl ${plot.isUnlocked ? 'bg-[#C29218]' : 'bg-slate-400'}`}></div>
                  
                  <div className={`absolute bottom-2 w-full h-20 rounded-[2rem] flex items-center justify-center transition-all ${plot.isUnlocked ? 'bg-[#E1B12C] border-4 border-[#F4C756]' : 'bg-slate-300 border-4 border-slate-200'}`}>
                      {plot.isUnlocked && (
                          <div className="w-20 h-14 bg-[#DFA01E] rounded-full opacity-40"></div>
                      )}
                  </div>

                  <div className="absolute -top-4 left-0 right-0 flex justify-center">
                      {!plot.isUnlocked ? (
                          <div className="bg-black/20 p-2 rounded-full"><Lock className="text-white opacity-50" size={24}/></div>
                      ) : crop ? (
                          <div className={`text-6xl filter drop-shadow-lg transition-transform ${isReady ? 'animate-bounce' : 'scale-75'}`}>
                              {crop.emoji}
                          </div>
                      ) : (
                          <div className="text-4xl opacity-0 hover:opacity-50 transition-opacity">🌱</div>
                      )}
                  </div>

                  {crop && !isReady && (
                      <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-16 h-3 bg-black/30 rounded-full overflow-hidden border border-white/50">
                          <div className="h-full bg-lime-400" style={{ width: `${status}%` }}></div>
                      </div>
                  )}
              </div>
          </div>
      );
  };

  const Building = ({ label, emoji, color, onClick, x, y }: any) => (
      <div 
        onClick={onClick}
        className="absolute flex flex-col items-center cursor-pointer group z-20 hover:-translate-y-2 transition-transform"
        style={{ left: x, top: y }}
      >
          <div className="relative filter drop-shadow-xl">
              <div className={`text-8xl p-1`}>
                  {emoji}
              </div>
              <div className={`absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full ${color} border-2 border-white shadow-md whitespace-nowrap`}>
                  <span className="text-[10px] font-black text-white uppercase">{label}</span>
              </div>
          </div>
      </div>
  );

  return (
    <div className="w-full h-full bg-[#48C6EF] relative overflow-hidden flex flex-col items-center">
        
        {/* Background */}
        <div className="absolute inset-0 pointer-events-none">
            <svg className="absolute bottom-0 w-full h-[60%]" preserveAspectRatio="none" viewBox="0 0 1440 320">
                <path fill="#6AB04C" fillOpacity="1" d="M0,160L48,176C96,192,192,224,288,224C384,224,480,192,576,165.3C672,139,768,117,864,128C960,139,1056,181,1152,197.3C1248,213,1344,203,1392,197.3L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
            </svg>
            <div className="absolute top-10 left-10 text-6xl opacity-80 animate-float text-white drop-shadow-md">☁️</div>
            <div className="absolute top-20 right-20 text-5xl opacity-60 animate-float text-white drop-shadow-md" style={{ animationDelay: '1.5s' }}>☁️</div>
        </div>

        {/* --- GAME WORLD --- */}
        <div className="relative w-full max-w-md h-full mt-20 overflow-visible" style={{ perspective: '1000px' }}>
            
            {/* Buildings now navigate to Tabs */}
            <Building label="Trường Học" emoji="🏫" color="bg-red-500" x="10%" y="20px" onClick={() => onNavigate('MAP')} />
            <Building label="Khu Vui Chơi" emoji="🎡" color="bg-purple-500" x="70%" y="20px" onClick={() => onNavigate('TIME_ATTACK')} />

            <div className="absolute inset-0 top-32 pointer-events-none">
                <div className="relative w-full h-full pointer-events-auto" style={{ transform: 'rotateX(10deg)' }}>
                    {userState.farmPlots.map((plot, i) => renderPlot(plot, i))}
                </div>
            </div>
        </div>

        {/* Modals */}
        {activeModal === 'PLOT' && selectedPlotId && (
            <PlotModal 
                plot={userState.farmPlots.find(p => p.id === selectedPlotId)!}
                inventory={userState.inventory}
                waterDrops={userState.waterDrops}
                fertilizers={userState.fertilizers}
                userCoins={userState.coins}
                nextPlotCost={500}
                onAction={(action, data) => {
                    if (action === 'PLANT') plantSeed(selectedPlotId, data);
                    if (action === 'WATER') waterPlot(selectedPlotId, CROPS[0]); 
                    if (action === 'HARVEST') harvestPlot(selectedPlotId, CROPS[0]); 
                    setActiveModal('NONE');
                }}
                onClose={() => setActiveModal('NONE')} 
            />
        )}
    </div>
  );
};
