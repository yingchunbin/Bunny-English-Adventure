
import React, { useState, useEffect } from 'react';
import { Word } from '../types';
import { playSFX } from '../utils/sound';
import { Sparkles, RefreshCcw, ImageOff } from 'lucide-react';
import { WordImage } from './WordImage';

interface MemoryGameProps {
  words: Word[];
  onComplete: (coins: number) => void;
}

interface Card {
  id: string; 
  wordId: string; 
  content: string | Word; // Updated to accept Word object
  type: 'TEXT' | 'IMAGE';
  isFlipped: boolean;
  isMatched: boolean;
}

export const MemoryGame: React.FC<MemoryGameProps> = ({ words, onComplete }) => {
  if (!words || words.length < 2) {
      return (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <ImageOff size={48} className="mb-2"/>
              <p>Cần ít nhất 2 từ để chơi.</p>
              <button onClick={() => onComplete(0)} className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-xl">Bỏ qua</button>
          </div>
      );
  }

  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<Card[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const [matches, setMatches] = useState(0);
  const [moves, setMoves] = useState(0);

  useEffect(() => {
    initializeGame();
  }, [words]);

  const initializeGame = () => {
    const gameWords = words.slice(0, 6);
    const newCards: Card[] = [];
    gameWords.forEach(word => {
      newCards.push({
        id: `text-${word.id}`,
        wordId: word.id,
        content: word.english,
        type: 'TEXT',
        isFlipped: false,
        isMatched: false,
      });
      newCards.push({
        id: `img-${word.id}`,
        wordId: word.id,
        content: word, // Pass full word object
        type: 'IMAGE',
        isFlipped: false,
        isMatched: false,
      });
    });

    setCards(newCards.sort(() => Math.random() - 0.5));
    setFlippedCards([]);
    setMatches(0);
    setMoves(0);
    setIsChecking(false);
  };

  const handleCardClick = (clickedCard: Card) => {
    if (isChecking || clickedCard.isFlipped || clickedCard.isMatched) return;

    playSFX('flip');
    const updatedCards = cards.map(c => c.id === clickedCard.id ? { ...c, isFlipped: true } : c);
    setCards(updatedCards);

    const newFlipped = [...flippedCards, clickedCard];
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      setIsChecking(true);
      setMoves(prev => prev + 1);
      checkForMatch(newFlipped[0], newFlipped[1]);
    }
  };

  const checkForMatch = (card1: Card, card2: Card) => {
    if (card1.wordId === card2.wordId) {
      playSFX('correct');
      setTimeout(() => {
        setCards(prev => prev.map(c => c.wordId === card1.wordId ? { ...c, isMatched: true, isFlipped: true } : c));
        setFlippedCards([]);
        setIsChecking(false);
        setMatches(prev => {
            const newMatches = prev + 1;
            if (newMatches === Math.min(words.length, 6)) setTimeout(() => onComplete(50), 1000);
            return newMatches;
        });
      }, 500);
    } else {
      playSFX('click');
      setTimeout(() => {
        setCards(prev => prev.map(c => c.id === card1.id || c.id === card2.id ? { ...c, isFlipped: false } : c));
        setFlippedCards([]);
        setIsChecking(false);
      }, 1000);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full w-full max-w-md mx-auto p-4 animate-fadeIn">
      <div className="flex justify-between w-full items-center mb-6">
        <h2 className="text-2xl font-bold text-purple-600 flex items-center gap-2"><Sparkles className="text-yellow-400" /> Memory Game</h2>
        <div className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-bold text-sm">Moves: {moves}</div>
      </div>

      <div className="grid grid-cols-3 gap-3 w-full aspect-square">
        {cards.map(card => (
          <div key={card.id} className="relative w-full h-28 sm:h-32 perspective-1000 cursor-pointer" onClick={() => handleCardClick(card)}>
            <div className={`w-full h-full transition-transform duration-500 transform-style-3d ${card.isFlipped ? 'rotate-y-180' : ''}`}>
              <div className="absolute w-full h-full backface-hidden bg-gradient-to-br from-purple-400 to-blue-400 rounded-xl border-4 border-white shadow-md flex items-center justify-center">
                 <Sparkles className="text-white opacity-50" size={32} />
              </div>
              <div className={`absolute w-full h-full backface-hidden rotate-y-180 rounded-xl border-4 shadow-md flex items-center justify-center p-2 bg-white ${card.isMatched ? 'border-green-400 bg-green-50' : 'border-purple-200'}`}>
                {card.type === 'IMAGE' ? (
                    <WordImage word={card.content as Word} className="w-full h-full rounded-lg" />
                ) : (
                    <span className="font-bold text-blue-800 text-sm sm:text-base text-center break-words leading-tight">{card.content as string}</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      <button onClick={initializeGame} className="mt-8 flex items-center gap-2 text-gray-400 hover:text-gray-600"><RefreshCcw size={16} /> Chơi lại</button>
    </div>
  );
};
