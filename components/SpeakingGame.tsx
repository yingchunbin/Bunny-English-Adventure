
import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Star, SkipForward, AlertCircle, ArrowRight, Keyboard, Check } from 'lucide-react';
import { Word } from '../types';
import { playSFX } from '../utils/sound';

interface SpeakingGameProps {
  word?: Word;
  words?: Word[];
  onComplete: (coins: number) => void;
}

export const SpeakingGame: React.FC<SpeakingGameProps> = ({ word, words, onComplete }) => {
  const data = words || (word ? [word] : []);

  if (data.length === 0) {
      return (
          <div className="flex flex-col items-center justify-center h-full p-6 text-center text-gray-500">
              <AlertCircle size={48} className="mb-2 text-gray-300"/>
              <p>Chưa có dữ liệu luyện nói.</p>
              <button onClick={() => onComplete(0)} className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-xl font-bold">Bỏ qua</button>
          </div>
      );
  }

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [score, setScore] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(true);
  const [totalCoins, setTotalCoins] = useState(0);
  
  // Typing fallback mode
  const [isTypingMode, setIsTypingMode] = useState(false);
  const [typedInput, setTypedInput] = useState('');
  
  const currentWord = data[currentIndex];
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
      setIsTypingMode(true); // Auto switch to typing if no speech support
    }
    return () => {
      if (recognitionRef.current) try { recognitionRef.current.stop(); } catch(e) {}
    };
  }, []);

  useEffect(() => {
    setTranscript('');
    setTypedInput('');
    setScore(null);
    setIsListening(false);
    if (isSupported && !isTypingMode) setErrorMsg(null);
  }, [currentIndex, isSupported, isTypingMode]);

  const handleListen = () => {
    if (!isSupported) return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.lang = 'en-US';
      recognition.continuous = false;
      recognition.interimResults = false;

      setIsListening(true);
      setTranscript('');
      setScore(null);
      setErrorMsg(null);

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        setTranscript(text);
        evaluate(text);
      };
      recognition.onerror = (event: any) => {
        setIsListening(false);
        if (event.error === 'not-allowed') {
            setErrorMsg("Hãy cho phép dùng Micro hoặc chuyển sang chế độ gõ phím.");
        } else {
            setErrorMsg("Không nghe rõ, thử lại hoặc gõ phím nhé!");
        }
      };
      recognition.onend = () => setIsListening(false);
      recognition.start();
    } catch (e) {
      setIsListening(false);
      setErrorMsg("Lỗi khởi động micro.");
    }
  };

  const evaluate = (input: string) => {
    if (!currentWord) return;
    const cleanInput = input.toLowerCase().trim().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g,"");
    const cleanTarget = currentWord.english.toLowerCase().trim();
    
    let calculatedScore = 0;
    
    // Exact match
    if (cleanInput === cleanTarget) {
        calculatedScore = 10;
        playSFX('correct');
    } 
    // Partial match (Lenient for kids)
    else if (cleanInput.includes(cleanTarget) || cleanTarget.includes(cleanInput)) {
        calculatedScore = 8;
        playSFX('success');
    }
    // Very lenient (first letter or significant overlap)
    else if (cleanInput.length > 2 && cleanTarget.startsWith(cleanInput.substring(0,2))) {
         calculatedScore = 7;
         playSFX('success');
    }
    else {
        calculatedScore = 4;
        playSFX('wrong');
    }
    setScore(calculatedScore);
  };

  const handleTypeSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      setTranscript(typedInput);
      evaluate(typedInput);
  };

  const handleNext = () => {
    playSFX('click');
    if (score && score >= 7) {
        setTotalCoins(prev => prev + 10);
    }
    
    if (currentIndex < data.length - 1) {
        setCurrentIndex(prev => prev + 1);
    } else {
        // Final completion logic
        // Add final coin if last word was correct
        const finalCoin = (score && score >= 7) ? totalCoins + 10 : totalCoins;
        onComplete(finalCoin);
    }
  };

  const handleSkip = () => {
      if (currentWord) setTranscript(currentWord.english);
      setScore(0); // Give 0 score for skipping
      playSFX('wrong');
  };

  if (!currentWord) return <div>Đang tải...</div>;

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-md mx-auto p-4 h-full animate-fadeIn">
      <div className="w-full flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-pink-600 flex items-center gap-2">
            {isTypingMode ? <Keyboard size={24}/> : <Mic size={24}/>}
            {isTypingMode ? 'Luyện Viết' : 'Luyện Nói'}
            <span className="text-base text-gray-400">({currentIndex + 1}/{data.length})</span>
        </h2>
        <div className="h-3 w-24 bg-gray-200 rounded-full">
          <div className="h-full bg-pink-500 rounded-full transition-all duration-300" style={{ width: `${((currentIndex + 1) / data.length) * 100}%` }} />
        </div>
      </div>

      {/* Main Display - No Image, Huge Text, IPA */}
      <div className="w-full bg-white p-8 rounded-[2rem] shadow-xl mb-6 border-4 border-pink-100 flex flex-col items-center justify-center min-h-[220px] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-4 bg-pink-100/50"></div>
        
        <h3 className="text-6xl sm:text-7xl font-black text-pink-600 tracking-tight mb-2 drop-shadow-sm text-center leading-none">
            {currentWord.english}
        </h3>
        
        <div className="bg-slate-100 px-4 py-1 rounded-xl mt-2">
            <span className="text-2xl sm:text-3xl font-mono text-slate-500 font-bold">/{currentWord.pronunciation}/</span>
        </div>
        
        <p className="text-lg text-slate-400 font-bold mt-4">
            {currentWord.vietnamese}
        </p>
      </div>

      <div className="h-4"></div>

      <div className="mb-4 text-center w-full flex flex-col items-center justify-center min-h-[4rem]">
        {!errorMsg ? (
            <div className="text-lg transition-all w-full flex flex-col items-center">
                {isListening ? (
                    <div className="flex items-center gap-1 h-10 animate-pulse text-pink-500 font-bold text-xl">Đang nghe...</div>
                ) : transcript ? (
                    <div className="flex flex-col gap-1 items-center animate-fadeIn">
                        <p className="text-gray-500 text-xs uppercase font-bold">Kết quả:</p>
                        <p className={`font-black text-3xl ${score && score > 6 ? 'text-green-600' : 'text-red-500'}`}>"{transcript}"</p>
                    </div>
                ) : !isTypingMode && <p className="text-gray-400 text-base font-medium">Bấm Mic và đọc to từ trên nhé!</p>}
            </div>
        ) : <div className="flex items-center gap-2 text-red-500 font-bold text-base bg-red-50 px-4 py-2 rounded-xl animate-fadeIn"><AlertCircle size={20} /> {errorMsg}</div>}
      </div>

      {score === null || (score < 7 && score !== 0) ? (
        <div className="w-full flex flex-col items-center gap-4">
            {isTypingMode ? (
                <form onSubmit={handleTypeSubmit} className="w-full flex gap-2">
                    <input 
                        type="text" 
                        value={typedInput}
                        onChange={(e) => setTypedInput(e.target.value)}
                        placeholder="Gõ từ tiếng Anh..."
                        className="flex-1 p-4 rounded-2xl border-2 border-gray-200 focus:border-pink-400 outline-none text-xl font-bold text-center"
                        autoFocus
                    />
                    <button type="submit" disabled={!typedInput} className="bg-pink-500 text-white p-4 rounded-2xl font-bold shadow-lg active:scale-95 disabled:opacity-50">
                        <Check size={28} />
                    </button>
                </form>
            ) : (
                <button
                    onClick={handleListen}
                    disabled={isListening || !isSupported}
                    className={`w-24 h-24 rounded-full flex items-center justify-center shadow-xl transition-all transform 
                        ${!isSupported ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 
                        isListening ? 'bg-red-100 text-red-500 scale-110 ring-4 ring-red-200' : 
                        'bg-gradient-to-br from-pink-500 to-orange-500 text-white hover:scale-105 active:scale-95'}`}
                >
                    {isListening ? <MicOff size={40} /> : <Mic size={40} />}
                </button>
            )}

            <div className="flex gap-4 mt-2">
                <button 
                    onClick={() => setIsTypingMode(!isTypingMode)} 
                    className="py-3 px-5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-600 rounded-xl font-bold text-sm flex items-center gap-2 transition-colors"
                >
                    {isTypingMode ? <><Mic size={16}/> Chuyển sang Nói</> : <><Keyboard size={16}/> Chuyển sang Gõ</>}
                </button>
                <button onClick={handleSkip} className="py-3 px-5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl font-bold text-sm flex items-center gap-2 transition-colors">
                    <SkipForward size={16} /> Bỏ qua (0 điểm)
                </button>
            </div>
        </div>
      ) : (
        <button onClick={handleNext} className="w-full py-5 bg-green-500 text-white rounded-2xl font-black text-xl shadow-lg shadow-green-200 hover:bg-green-600 flex items-center justify-center gap-2 animate-bounce">
          {currentIndex < data.length - 1 ? "Tiếp tục" : "Hoàn thành"} <ArrowRight size={24} />
        </button>
      )}

      {score !== null && (
        <div className="mt-6 flex flex-col items-center animate-fadeIn">
            {score === 0 ? (
                <p className="text-xl font-bold text-gray-400 mt-2">Đã bỏ qua. Lần sau cố lên nhé!</p>
            ) : (
                <>
                    <div className="flex gap-1">
                        {[...Array(3)].map((_, i) => (
                            <Star key={i} size={40} className={`transition-all duration-500 ${i < (score > 7 ? 3 : score > 4 ? 2 : 1) ? "fill-yellow-400 text-yellow-400 scale-110" : "text-gray-200"}`} />
                        ))}
                    </div>
                    <p className="text-xl font-bold text-yellow-500 mt-2">{score >= 7 ? "Tuyệt vời!" : "Cố lên chút nữa!"}</p>
                </>
            )}
        </div>
      )}
    </div>
  );
};
