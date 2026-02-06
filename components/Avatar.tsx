
import React from 'react';
import { resolveImage } from '../utils/imageUtils';
import { Rarity } from '../types';

interface AvatarProps {
  emoji?: string;
  bgGradient?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  animate?: boolean;
  imageId?: string; // New prop for Gacha images
  rarity?: Rarity; // NEW: To apply effects
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({ emoji, bgGradient = "bg-gray-200", size = 'md', animate = false, imageId, rarity, className = "" }) => {
  const sizeClasses = {
    sm: 'w-10 h-10 text-xl border-2',
    md: 'w-20 h-20 text-4xl border-4',
    lg: 'w-32 h-32 text-6xl border-4',
    xl: 'w-48 h-48 text-8xl border-8',
  };

  // Rarity Styles
  let rarityClass = "border-white shadow-lg";
  let glowEffect = "";
  
  if (rarity === 'LEGENDARY') {
      rarityClass = "border-yellow-400 bg-yellow-100 ring-2 ring-yellow-200";
      glowEffect = "drop-shadow-[0_0_10px_rgba(250,204,21,0.8)]";
  } else if (rarity === 'EPIC') {
      rarityClass = "border-purple-400 bg-purple-100 ring-2 ring-purple-200";
      glowEffect = "drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]";
  } else if (rarity === 'RARE') {
      rarityClass = "border-blue-400 bg-blue-100 ring-2 ring-blue-200";
      glowEffect = "drop-shadow-[0_0_5px_rgba(96,165,250,0.8)]";
  }

  const imgUrl = imageId ? resolveImage(imageId) : null;

  return (
    <div className={`${sizeClasses[size]} ${!imageId ? bgGradient : ''} rounded-full flex items-center justify-center overflow-hidden relative ${animate || rarity === 'LEGENDARY' ? 'animate-bounce-slow' : ''} ${rarityClass} ${className}`}>
      {imgUrl ? (
          <img src={imgUrl} alt="Avatar" className={`w-full h-full object-cover ${glowEffect}`} />
      ) : (
          <span>{emoji}</span>
      )}
      {/* Shiny reflection effect for high tiers */}
      {(rarity === 'LEGENDARY' || rarity === 'EPIC') && (
          <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/30 to-white/0 opacity-50 animate-pulse pointer-events-none"></div>
      )}
    </div>
  );
};
