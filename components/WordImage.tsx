
import React from 'react';
import { Word } from '../types';

interface WordImageProps {
  word: Word;
  className?: string;
  hideLabel?: boolean; // New prop to hide text
}

export const WordImage: React.FC<WordImageProps> = ({ word, className, hideLabel = false }) => {
  const displayContent = word.emoji || word.english.charAt(0).toUpperCase();
  const bgColor = word.color || '#E3F2FD';
  const isEmoji = !!word.emoji;
  
  const labelLength = word.english.length;
  let labelFontSize = "10";
  if (labelLength > 10) labelFontSize = "8";
  if (labelLength > 15) labelFontSize = "7";

  return (
    <div 
      className={`relative overflow-hidden flex items-center justify-center select-none shadow-inner ${className}`}
      style={{ 
        backgroundColor: bgColor,
        background: isEmoji ? bgColor : `linear-gradient(135deg, ${bgColor} 0%, #ffffff 100%)`
      }}
    >
      {/* Background patterns for non-emoji items to add visual interest */}
      {!isEmoji && (
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="pattern-circles" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                <circle cx="10" cy="10" r="2" fill="currentColor" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#pattern-circles)" />
          </svg>
        </div>
      )}

      {/* Dynamic SVG Rendering */}
      <svg 
        viewBox="0 0 100 100" 
        className="w-full h-full drop-shadow-sm"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Artistic Backdrop for Fallback letters */}
        {!isEmoji && (
          <circle cx="50" cy="50" r="35" fill="white" opacity="0.5" />
        )}
        
        {/* Main Icon / Letter */}
        <text 
          x="50%" 
          y={isEmoji || hideLabel ? "55%" : "54%"} 
          dominantBaseline="middle" 
          textAnchor="middle" 
          fontSize={isEmoji ? "60" : "44"} 
          fill={isEmoji ? "#333" : "#4A90E2"}
          style={{ 
            fontFamily: isEmoji ? "serif" : "'Nunito', sans-serif",
            fontWeight: "900",
            filter: "drop-shadow(2px 2px 2px rgba(0,0,0,0.1))"
          }}
        >
          {displayContent}
        </text>
        
        {/* Label - Only render if not hidden */}
        {!hideLabel && (
            <text 
            x="50%" 
            y="88%" 
            dominantBaseline="middle" 
            textAnchor="middle" 
            fontSize={labelFontSize}
            fill="#666" 
            fontWeight="800" 
            opacity="0.4"
            style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}
            >
            {word.english}
            </text>
        )}
      </svg>
    </div>
  );
};
