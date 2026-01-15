
import React, { useMemo } from 'react';
import { Word } from '../types';

interface WordImageProps {
  word: Word;
  className?: string;
  hideLabel?: boolean; // New prop to hide text
}

export const WordImage: React.FC<WordImageProps> = ({ word, className, hideLabel = false }) => {
  const isEmoji = !!word.emoji;
  
  // Use generic emoji if available, otherwise display the full English word
  const displayContent = isEmoji ? word.emoji : word.english;
  
  // Hash function to generate consistent pseudo-random numbers for patterns
  const getHash = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash);
  };

  const hash = useMemo(() => getHash(word.id), [word.id]);
  
  // Generate consistent styling based on word hash
  const bgColor = word.color || `hsl(${hash % 360}, 70%, 90%)`;
  const patternType = hash % 3; // 0: circles, 1: stripes, 2: solid/gradient
  const accentColor = `hsl(${(hash + 40) % 360}, 60%, 80%)`;

  // Calculate font size for text based on length
  const getFontSize = () => {
      if (isEmoji) return "60";
      const len = displayContent?.length || 0;
      if (len <= 3) return "40";
      if (len <= 6) return "32";
      if (len <= 9) return "24";
      return "18"; // Long words
  };

  const fontSize = getFontSize();

  // Label sizing logic
  const labelLength = word.english.length;
  let labelFontSize = "10";
  if (labelLength > 10) labelFontSize = "8";
  if (labelLength > 15) labelFontSize = "7";

  return (
    <div 
      className={`relative overflow-hidden flex items-center justify-center select-none shadow-inner ${className}`}
      style={{ 
        backgroundColor: bgColor,
        background: isEmoji 
            ? bgColor 
            : `linear-gradient(${hash % 360}deg, ${bgColor} 0%, #ffffff 100%)`
      }}
    >
      {/* Background patterns to make generic cards look distinct */}
      {!isEmoji && (
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id={`pat-${word.id}`} x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                {patternType === 0 && <circle cx="10" cy="10" r="2" fill={accentColor} />}
                {patternType === 1 && <path d="M0 20 L20 0 Z" stroke={accentColor} strokeWidth="2" />}
                {patternType === 2 && <rect x="0" y="0" width="10" height="10" fill={accentColor} />}
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill={`url(#pat-${word.id})`} />
          </svg>
        </div>
      )}

      {/* Dynamic SVG Rendering */}
      <svg 
        viewBox="0 0 100 100" 
        className="w-full h-full drop-shadow-sm z-10"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Artistic Backdrop for Text-only cards */}
        {!isEmoji && (
          <circle cx="50" cy="50" r="40" fill="white" opacity="0.8" />
        )}
        
        {/* Main Content (Emoji or Word) */}
        <text 
          x="50%" 
          y={isEmoji || hideLabel ? "55%" : "54%"} 
          dominantBaseline="middle" 
          textAnchor="middle" 
          fontSize={fontSize} 
          fill={isEmoji ? "#333" : "#4A90E2"}
          style={{ 
            fontFamily: isEmoji ? "serif" : "'Nunito', sans-serif",
            fontWeight: "900",
            filter: "drop-shadow(1px 1px 0px rgba(255,255,255,0.8))"
          }}
        >
          {displayContent}
        </text>
        
        {/* Label - Only render if not hidden AND not already displayed as main content */}
        {!hideLabel && isEmoji && (
            <text 
            x="50%" 
            y="88%" 
            dominantBaseline="middle" 
            textAnchor="middle" 
            fontSize={labelFontSize}
            fill="#666" 
            fontWeight="800" 
            opacity="0.6"
            style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}
            >
            {word.english}
            </text>
        )}
      </svg>
    </div>
  );
};
