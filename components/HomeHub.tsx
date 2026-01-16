
import React, { useState } from 'react';
import { UserState } from '../types';
import { Play, BookOpen, Warehouse, Swords, MessageCircle, Map as MapIcon, Lock } from 'lucide-react';

interface HomeHubProps {
  userState: UserState;
  onNavigate: (module: string) => void;
}

export const HomeHub: React.FC<HomeHubProps> = ({ userState, onNavigate }) => {
  const [zoomingTarget, setZoomingTarget] = useState<string | null>(null);

  const handleBuildingClick = (target: string) => {
    setZoomingTarget(target);
    // Delay navigation to allow animation to play
    setTimeout(() => {
      onNavigate(target);
      setZoomingTarget(null);
    }, 400); 
  };

  const Building = ({ id, label, icon: Icon, color, bg, x, y, size = "w-32 h-32", notification = false }: any) => {
    const isZooming = zoomingTarget === id;
    
    return (
      <div 
        onClick={() => handleBuildingClick(id)}
        className={`absolute flex flex-col items-center cursor-pointer group transition-all duration-300 ${isZooming ? 'z-50 building-enter' : 'z-10 hover:-translate-y-4 hover:scale-105'}`}
        style={{ left: x, top: y }}
      >
        {/* The Building Body */}
        <div className={`${size} ${bg} rounded-[2rem] border-b-8 border-black/20 shadow-2xl flex items-center justify-center relative transform rotate-x-12`}>
            {/* Roof Effect */}
            <div className="absolute -top-4 left-2 right-2 h-6 bg-white/20 rounded-full"></div>
            
            <Icon size={48} className="text-white drop-shadow-md" />
            
            {/* Notification Badge */}
            {notification && (
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 rounded-full border-4 border-white flex items-center justify-center animate-bounce shadow-lg">
                    <span className="text-white font-black text-xs">!</span>
                </div>
            )}
        </div>
        
        {/* Label Plate */}
        <div className={`mt-2 px-4 py-1.5 rounded-full ${color} border-2 border-white shadow-lg transform -skew-x-12 transition-transform group-hover:skew-x-0`}>
            <span className="text-xs font-black text-white uppercase tracking-wider">{label}</span>
        </div>

        {/* Shadow */}
        <div className="absolute -bottom-8 w-[80%] h-4 bg-black/20 rounded-[100%] blur-sm pointer-events-none"></div>
      </div>
    );
  };

  return (
    <div className="w-full h-full bg-[#8edc6e] relative overflow-hidden animate-zoom-in">
        {/* Interactive Background Layer */}
        <div className="absolute inset-0 pointer-events-none">
            {/* Sky */}
            <div className="h-[30%] bg-[#48C6EF] relative">
                <div className="absolute bottom-0 w-full h-24 bg-[#8edc6e] rounded-t-[50%] scale-150 translate-y-12"></div>
                <div className="absolute top-10 left-10 text-6xl opacity-80 animate-pulse">☁️</div>
                <div className="absolute top-20 right-20 text-5xl opacity-60">☁️</div>
            </div>
            
            {/* Paths */}
            <svg className="absolute top-[30%] left-0 w-full h-full opacity-30" viewBox="0 0 100 100" preserveAspectRatio="none">
                <path d="M50 0 L50 50 L20 80 M50 50 L80 80" stroke="#5c3a1e" strokeWidth="4" fill="none" strokeDasharray="5,5" />
            </svg>

            {/* Decor */}
            <div className="absolute top-[40%] left-[10%] text-4xl">🌲</div>
            <div className="absolute top-[35%] right-[15%] text-4xl">🌲</div>
            <div className="absolute bottom-[10%] left-[40%] text-4xl">🌻</div>
        </div>

        {/* --- BUILDINGS --- */}
        
        {/* 1. SCHOOL (Center Top) */}
        <Building 
            id="SCHOOL"
            label="Trường Học"
            icon={BookOpen}
            color="bg-blue-500"
            bg="bg-blue-400"
            x="50%" y="25%"
            size="w-40 h-40"
            style={{ transform: 'translateX(-50%)' }} // Center alignment
        />
        {/* CSS fix for center positioning since x="50%" starts at 50% */}
        <div className="absolute top-[25%] left-1/2 -translate-x-1/2 w-40 h-40 pointer-events-none" />

        {/* 2. LIBRARY (Top Left) */}
        <Building 
            id="LIBRARY"
            label="Thư Viện"
            icon={MapIcon}
            color="bg-purple-500"
            bg="bg-purple-400"
            x="10%" y="30%"
        />

        {/* 3. FARM (Bottom Left) */}
        <Building 
            id="FARM"
            label="Nông Trại"
            icon={Warehouse}
            color="bg-green-600"
            bg="bg-green-500"
            x="15%" y="60%"
            notification={userState.farmPlots.some(p => p.cropId && (Date.now() - (p.plantedAt||0)) > 10000)} // Simple check
        />

        {/* 4. ARENA (Bottom Right) */}
        <Building 
            id="ARENA"
            label="Đấu Trường"
            icon={Swords}
            color="bg-red-500"
            bg="bg-red-400"
            x="60%" y="55%"
        />

        {/* Chat Button (Floating) */}
        <button 
            onClick={() => onNavigate('CHAT')} // Note: Chat not fully implemented in App switch yet but keeping hook
            className="absolute bottom-6 right-6 w-16 h-16 bg-white rounded-full shadow-xl border-4 border-slate-100 flex items-center justify-center hover:scale-110 transition-transform active:scale-90 z-20"
        >
            <MessageCircle size={32} className="text-blue-500" />
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full border-2 border-white animate-pulse"></div>
        </button>

    </div>
  );
};
