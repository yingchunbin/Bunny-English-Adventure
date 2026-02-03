
import React from 'react';
import { resolveImage } from '../utils/imageUtils';

interface AvatarProps {
  emoji?: string;
  bgGradient?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  animate?: boolean;
  imageId?: string; // New prop for Gacha images
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({ emoji, bgGradient = "bg-gray-200", size = 'md', animate = false, imageId, className = "" }) => {
  const sizeClasses = {
    sm: 'w-10 h-10 text-xl',
    md: 'w-20 h-20 text-4xl',
    lg: 'w-32 h-32 text-6xl',
    xl: 'w-48 h-48 text-8xl',
  };

  const imgUrl = imageId ? resolveImage(imageId) : null;

  return (
    <div className={`${sizeClasses[size]} ${bgGradient} rounded-full flex items-center justify-center shadow-lg border-4 border-white overflow-hidden relative ${animate ? 'animate-bounce' : ''} ${className}`}>
      {imgUrl ? (
          <img src={imgUrl} alt="Avatar" className="w-full h-full object-cover" />
      ) : (
          <span>{emoji}</span>
      )}
    </div>
  );
};
