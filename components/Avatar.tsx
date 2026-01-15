import React from 'react';

interface AvatarProps {
  emoji: string;
  bgGradient: string;
  size?: 'sm' | 'md' | 'lg';
  animate?: boolean;
}

export const Avatar: React.FC<AvatarProps> = ({ emoji, bgGradient, size = 'md', animate = false }) => {
  const sizeClasses = {
    sm: 'w-10 h-10 text-xl',
    md: 'w-20 h-20 text-4xl',
    lg: 'w-32 h-32 text-6xl',
  };

  return (
    <div className={`${sizeClasses[size]} ${bgGradient} rounded-full flex items-center justify-center shadow-lg border-4 border-white ${animate ? 'animate-bounce' : ''}`}>
      <span>{emoji}</span>
    </div>
  );
};
