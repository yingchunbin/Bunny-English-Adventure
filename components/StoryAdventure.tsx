
import React, { useState, useEffect, useRef } from 'react';
import { Book, Check, ChevronRight, Home, RefreshCw, Star, ArrowLeft, MessageCircle, Sparkles, GraduationCap, Volume2, Trophy, Award, Wand2, Droplets, Zap, Coins } from 'lucide-react';
import { STORIES, Story, StorySegment } from '../data/stories';
import { evaluateStoryTranslation, StoryFeedback, generateCohesiveStory } from '../services/geminiService';
import { playSFX } from '../utils/sound';
import { Avatar } from './Avatar';
import { UserState } from '../types';

interface StoryRewards {
    coins: number;
    stars: number;
    water: number;
    fertilizer: number;
}

interface StoryAdventureProps {
    userState: UserState; // Pass full state to access grade and textbook
    onCompleteStory: (storyId: string, rewards: StoryRewards) => void;
    onExit: () => void;
}

export const StoryAdventure: React.FC<StoryAdventureProps> = ({ userState, onCompleteStory, onExit }) => {
    const [selectedStory, setSelectedStory] = useState<Story | null>(null);
    const [storySegments, setStorySegments] = useState<StorySegment[]>([]);
    const [isLoadingStory, setIsLoadingStory] = useState(false);

    const [currentSegmentIdx, setCurrentSegmentIdx] = useState(0);
    const [userInput, setUserInput] = useState('');
    const [feedback, setFeedback] = useState<StoryFeedback | null>(null);
    const [isEvaluating, setIsEvaluating] = useState(false);
    
    // UI States
    const [showSummary, setShowSummary] = useState(false);
    const [showAchievements, setShowAchievements] = useState(false);
    const [isClaiming, setIsClaiming] = useState(false);
    const [fullEnglishStory, setFullEnglishStory] = useState<string[]>([]);
    const [calculatedRewards, setCalculatedRewards] = useState<StoryRewards | null>(null);

    const contentAreaRef = useRef<HTMLDivElement>(null);

    // Helper to consistent reward calculation
    const calculateRewards = (story: Story): StoryRewards => {
        const grade = story.grade || 1;
        
        // Extract Unit Number for progression (e.g. Unit 1 -> 1, Unit 12 -> 12)
        // Fallback to 1 if not found (e.g. Starter)
        const unitMatch = story.title.match(/Unit (\d+)/);
        const unitNum = unitMatch ? parseInt(unitMatch[1]) : 1;
        const isReview = story.title.toLowerCase().includes('review');

        // VOCAB & LENGTH FACTORS
        const vocabCount = story.vocabulary?.length || 6;

        // 1. COINS CALCULATION (Boosted to Thousands)
        // Base: 1000
        // Grade Scale: +100 per grade (Grade 5 gets +500)
        // Unit Progression: +50 per unit (Unit 10 gets +500)
        // Content Bonus: +50 per vocab word
        let coins = 1000 + (grade * 100) + (unitNum * 50) + (vocabCount * 50);
        
        // 2. WATER CALCULATION
        // Base: 3
        // Grade Scale: +1 per grade
        // Unit Bonus: +1 for every 3 units
        let water = 3 + grade + Math.floor(unitNum / 3);

        // 3. FERTILIZER CALCULATION (Increased)
        // Base: 2
        // Grade Bonus: +1 for every 2 grades
        // Unit Bonus: +1 for every 5 units
        let fertilizer = 2 + Math.floor(grade / 2) + Math.floor(unitNum / 5);

        // 4. STAR CALCULATION (Tripled)
        // Base: 3
        // Bonus: Review chapters or Every 5th Unit gets +2
        let stars = 3;
        if (isReview || (unitNum > 0 && unitNum % 5 === 0)) {
            stars += 2;
        }

        return { coins, stars, water, fertilizer };
    };

    // Auto-scroll to top of content area when segment changes (optional, but sticky handles visibility)
    useEffect(() => {
        if (selectedStory && contentAreaRef.current) {
            contentAreaRef.current.scrollTop = 0;
        }
    }, [currentSegmentIdx, selectedStory]);

    const handleSelectStory = async (story: Story) => {
        playSFX('click');
        setSelectedStory(story);
        setShowSummary(false);
        setFullEnglishStory([]);
        setCurrentSegmentIdx(0);
        setUserInput('');
        setFeedback(null);
        setCalculatedRewards(null);

        // CHECK CACHE FIRST
        const cacheKey = `story_content_${story.id}`;
        const cached = localStorage.getItem(cacheKey);

        if (cached) {
            try {
                const parsed = JSON.parse(cached);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    setStorySegments(parsed);
                    return;
                }
            } catch (e) {
                console.warn("Invalid cached story, regenerating...");
            }
        }

        // IF NO CACHE, GENERATE
        setIsLoadingStory(true);
        const vocabList = story.vocabulary.map(v => v.word);
        
        // Call AI to weave a story
        const result = await generateCohesiveStory(story.title, vocabList, story.grade);
        
        if (result.segments && result.segments.length > 0) {
            // Transform to match StorySegment interface
            const newSegments: StorySegment[] = result.segments.map(s => ({
                vi: s.vi,
                vocabList: s.vocabList || [],
                grammarTip: s.grammarTip,
                enHelper: "" // Deprecated but kept for type compatibility if needed
            }));
            setStorySegments(newSegments);
            // Save to cache
            localStorage.setItem(cacheKey, JSON.stringify(newSegments));
        } else {
            // Fallback to static segments if AI fails (might lack vocabList structure, so fallback safely)
            setStorySegments(story.segments.map(s => ({ ...s, vocabList: s.vocabList || [] })));
        }
        setIsLoadingStory(false);
    };

    const handleCheck = async () => {
        if (!selectedStory || !userInput.trim() || isEvaluating) return;

        setIsEvaluating(true);
        playSFX('click');

        const currentSegment = storySegments[currentSegmentIdx];
        
        // Pass ONLY the current sentence for strict 1-to-1 evaluation
        const result = await evaluateStoryTranslation(
            currentSegment.vi,
            userInput
        );

        setFeedback(result);
        setIsEvaluating(false);

        if (result.isCorrect) {
            playSFX('correct');
        } else {
            playSFX('wrong');
        }
    };

    const handleNext = () => {
        if (!selectedStory || !feedback) return;
        
        const finalSentence = feedback.isCorrect ? userInput : feedback.corrected;
        setFullEnglishStory(prev => [...prev, finalSentence]);

        if (currentSegmentIdx < storySegments.length - 1) {
            setCurrentSegmentIdx(prev => prev + 1);
            setUserInput('');
            setFeedback(null);
            playSFX('flip');
        } else {
            // Calculate Rewards based on specific Story data
            const rewards = calculateRewards(selectedStory);
            setCalculatedRewards(rewards);
            setShowSummary(true);
            playSFX('success');
        }
    };

    const handleFinishReward = () => {
        if (!selectedStory || isClaiming || !calculatedRewards) return;
        setIsClaiming(true);
        playSFX('coins');
        
        // Save progress with calculated combo rewards
        onCompleteStory(selectedStory.id, calculatedRewards);

        // Delay to show effect/sound before going back to list
        setTimeout(() => {
            setSelectedStory(null);
            setShowSummary(false);
            setIsClaiming(false);
            setCalculatedRewards(null);
        }, 1500);
    };

    const playFullStory = () => {
        if (fullEnglishStory.length === 0) return;
        window.speechSynthesis.cancel();
        const text = fullEnglishStory.join(' ');
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        utterance.rate = 0.9;
        window.speechSynthesis.speak(utterance);
    };

    // Calculate Achievement Stats
    const completedStoriesList = userState.completedStories || [];
    const completedCount = completedStoriesList.length;
    const vocabCount = STORIES.filter(s => completedStoriesList.includes(s.id)).reduce((acc, s) => acc + (s.vocabulary?.length || 0), 0);
    
    let rankTitle = "Mọt Sách Tập Sự";
    if (completedCount >= 10) rankTitle = "Thám Tử Truyện Tranh";
    if (completedCount >= 30) rankTitle = "Tiến Sĩ Ngôn Ngữ";
    if (completedCount >= 50) rankTitle = "Thần Đồng Kể Chuyện";

    // FILTER LOGIC: Only show stories for the user's current grade AND current textbook
    const visibleStories = STORIES.filter(s => 
        s.grade === userState.grade && 
        (s.textbookId === undefined || s.textbookId === userState.textbook)
    );

    // --- LIST VIEW ---
    if (!selectedStory) {
        return (
            <div className="flex flex-col h-full bg-slate-50 animate-fadeIn relative">
                {/* Header */}
                <div className="bg-white px-4 py-3 shadow-sm border-b border-slate-200 sticky top-0 z-20">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <button onClick={onExit} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500"><Home size={24}/></button>
                            <div>
                                <h2 className="font-black text-slate-800 text-lg uppercase tracking-tight">Thư Viện Lớp {userState.grade}</h2>
                                <p className="text-xs text-slate-400 font-bold">Đọc truyện - Nhận quà Nông Trại</p>
                            </div>
                        </div>
                        <button 
                            onClick={() => setShowAchievements(true)} 
                            className="bg-yellow-100 text-yellow-600 p-2 rounded-xl border-2 border-yellow-200 hover:bg-yellow-200 active:scale-95 transition-all shadow-sm"
                        >
                            <Trophy size={20} />
                        </button>
                    </div>
                </div>

                {/* Achievements Modal */}
                {showAchievements && (
                    <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
                        <div className="bg-white rounded-[2rem] w-full max-w-sm p-6 shadow-2xl border-4 border-yellow-200 relative overflow-hidden">
                            <button onClick={() => setShowAchievements(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"><ArrowLeft /></button>
                            
                            <div className="text-center mb-6">
                                <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2 border-4 border-yellow-300 shadow-inner">
                                    <Award className="text-yellow-600" size={40} />
                                </div>
                                <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Hồ Sơ Đọc Sách</h3>
                                <div className="inline-block bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-black mt-1 shadow-sm uppercase tracking-wider">
                                    {rankTitle}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 flex flex-col items-center">
                                    <Book size={24} className="text-blue-500 mb-1"/>
                                    <span className="text-2xl font-black text-slate-700">{completedCount}</span>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase">Truyện đã đọc</span>
                                </div>
                                <div className="bg-green-50 p-4 rounded-2xl border border-green-100 flex flex-col items-center">
                                    <GraduationCap size={24} className="text-green-500 mb-1"/>
                                    <span className="text-2xl font-black text-slate-700">{vocabCount}</span>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase">Từ vựng</span>
                                </div>
                            </div>
                            
                            <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                                <div className="h-full bg-yellow-400 transition-all duration-1000" style={{ width: `${Math.min(100, (completedCount / 50) * 100)}%` }} />
                            </div>
                            <p className="text-center text-[10px] text-slate-400 mt-2 font-bold uppercase">Tiến độ thần đồng (Mục tiêu: 50 truyện)</p>
                        </div>
                    </div>
                )}

                <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-20">
                    {visibleStories.length === 0 ? (
                        <div className="text-center py-10 text-slate-400">
                            <p>Chưa có truyện nào cho lớp {userState.grade} trong sách này.</p>
                        </div>
                    ) : (
                        visibleStories.map((story) => {
                            const isDone = completedStoriesList.includes(story.id);
                            // Pass the whole story object to calculate progressive rewards
                            const rewards = calculateRewards(story);
                            
                            return (
                                <button 
                                    key={story.id}
                                    onClick={() => handleSelectStory(story)}
                                    className={`w-full text-left p-4 rounded-[2rem] border-4 shadow-sm transition-all active:scale-95 group relative overflow-hidden flex items-center gap-4 ${isDone ? 'bg-green-50 border-green-200' : 'bg-white border-slate-100 hover:border-blue-200'}`}
                                >
                                    <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center text-3xl shadow-inner flex-shrink-0 border border-slate-100">
                                        {story.coverEmoji}
                                    </div>
                                    <div className="flex-1 relative z-10">
                                        <div className="flex justify-between items-start mb-1">
                                            <h3 className="text-base font-black text-slate-800 leading-tight line-clamp-2">{story.title}</h3>
                                            {isDone && <div className="bg-green-500 text-white p-1 rounded-full"><Check size={12}/></div>}
                                        </div>
                                        {/* Reward Badges */}
                                        <div className="flex items-center gap-2 mt-2 overflow-x-auto no-scrollbar">
                                            <span className="flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-lg border border-amber-100">
                                                <Coins size={12} className="fill-amber-500 text-amber-500"/> {rewards.coins}
                                            </span>
                                            <span className="flex items-center gap-1 text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg border border-blue-100">
                                                <Droplets size={12} className="fill-blue-500 text-blue-500"/> {rewards.water}
                                            </span>
                                            {rewards.fertilizer > 0 && (
                                                <span className="flex items-center gap-1 text-[10px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded-lg border border-green-100">
                                                    <Zap size={12} className="fill-green-500 text-green-500"/> {rewards.fertilizer}
                                                </span>
                                            )}
                                            <span className="flex items-center gap-1 text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded-lg border border-purple-100">
                                                <Star size={12} className="fill-purple-500 text-purple-500"/> {rewards.stars}
                                            </span>
                                        </div>
                                    </div>
                                </button>
                            )
                        })
                    )}
                </div>
            </div>
        );
    }

    // --- LOADING STATE (GENERATING STORY) ---
    if (isLoadingStory) {
        return (
            <div className="flex flex-col h-full bg-white items-center justify-center animate-fadeIn p-6">
                <div className="w-32 h-32 bg-blue-50 rounded-full flex items-center justify-center mb-6 animate-bounce border-4 border-blue-100">
                    <Wand2 size={64} className="text-blue-500" />
                </div>
                <h2 className="text-2xl font-black text-blue-600 text-center mb-2">Thầy Rùa đang viết truyện...</h2>
                <p className="text-slate-400 font-bold text-center mb-8">Đang sử dụng phép thuật để kết nối các từ vựng...</p>
                <div className="w-full max-w-xs h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 animate-pulse w-full rounded-full"></div>
                </div>
            </div>
        );
    }

    // --- SUMMARY VIEW (BEFORE REWARD) ---
    if (showSummary && calculatedRewards) {
        return (
            <div className="flex flex-col h-full bg-indigo-50 animate-fadeIn relative overflow-hidden">
                {/* Confetti Effect Simulation */}
                {isClaiming && (
                    <div className="absolute inset-0 pointer-events-none z-50">
                        {[...Array(20)].map((_, i) => (
                            <div 
                                key={i}
                                className="absolute text-2xl animate-bounce"
                                style={{
                                    left: `${Math.random() * 100}%`,
                                    top: `${Math.random() * 50}%`,
                                    animationDuration: `${0.5 + Math.random()}s`,
                                    animationDelay: `${Math.random() * 0.2}s`
                                }}
                            >
                                {['⭐', '🎉', '💰', '✨'][i % 4]}
                            </div>
                        ))}
                    </div>
                )}

                <div className="p-6 flex flex-col items-center justify-start flex-1 overflow-y-auto">
                    <div className="text-6xl mb-4 animate-bounce">{selectedStory?.coverEmoji}</div>
                    <h2 className="text-2xl font-black text-indigo-800 mb-1 uppercase text-center">Tổng Kết Truyện</h2>
                    <p className="text-indigo-500 font-bold mb-6 text-sm text-center px-4">"{selectedStory?.title}"</p>
                    
                    {/* Story Content */}
                    <div className="bg-white p-6 rounded-3xl border-4 border-indigo-100 shadow-xl w-full max-w-sm mb-6 relative">
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-indigo-500 text-white px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest shadow-md flex items-center gap-2">
                            English Version
                        </div>
                        <div className="text-slate-700 font-medium text-lg leading-relaxed text-justify mt-2 mb-4">
                            {fullEnglishStory.join(' ')}
                        </div>
                        <button 
                            onClick={playFullStory}
                            className="w-full py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors"
                        >
                            <Volume2 size={16} /> Nghe cả truyện
                        </button>
                    </div>

                    {/* REWARD COMBO BOX */}
                    <div className="w-full max-w-sm bg-yellow-50 rounded-3xl border-4 border-yellow-200 p-4 mb-4">
                        <div className="text-center font-black text-yellow-700 uppercase mb-3 text-sm tracking-widest">Phần thưởng Nông Trại</div>
                        <div className="grid grid-cols-4 gap-2">
                            <div className="flex flex-col items-center bg-white p-2 rounded-2xl border border-yellow-100 shadow-sm">
                                <Coins className="text-amber-500 mb-1" size={24} fill="currentColor"/>
                                <span className="font-black text-slate-700 text-xs">+{calculatedRewards.coins}</span>
                            </div>
                            <div className="flex flex-col items-center bg-white p-2 rounded-2xl border border-yellow-100 shadow-sm">
                                <Star className="text-purple-500 mb-1" size={24} fill="currentColor"/>
                                <span className="font-black text-slate-700 text-xs">+{calculatedRewards.stars}</span>
                            </div>
                            <div className="flex flex-col items-center bg-white p-2 rounded-2xl border border-yellow-100 shadow-sm">
                                <Droplets className="text-blue-500 mb-1" size={24} fill="currentColor"/>
                                <span className="font-black text-slate-700 text-xs">+{calculatedRewards.water}</span>
                            </div>
                            <div className="flex flex-col items-center bg-white p-2 rounded-2xl border border-yellow-100 shadow-sm">
                                <Zap className="text-green-500 mb-1" size={24} fill="currentColor"/>
                                <span className="font-black text-slate-700 text-xs">+{calculatedRewards.fertilizer}</span>
                            </div>
                        </div>
                    </div>

                    {/* Vocabulary List */}
                    <div className="w-full max-w-sm">
                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 ml-2 flex items-center gap-1">
                            <GraduationCap size={14}/> Từ vựng đã học
                        </h4>
                        <div className="space-y-2">
                            {selectedStory?.vocabulary && selectedStory.vocabulary.length > 0 ? (
                                selectedStory.vocabulary.map((vocab, idx) => (
                                    <div key={idx} className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-black text-indigo-600 text-lg">{vocab.word}</span>
                                                <span className="text-xs text-slate-400 font-mono bg-slate-100 px-1.5 rounded">{vocab.ipa}</span>
                                            </div>
                                            <div className="text-sm font-bold text-slate-600">{vocab.meaning}</div>
                                        </div>
                                        {vocab.usage && (
                                            <div className="text-[10px] font-bold text-orange-500 bg-orange-50 px-2 py-1 rounded-lg">
                                                {vocab.usage}
                                            </div>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <div className="flex flex-wrap gap-2">
                                    {storySegments.map((seg) => (
                                        seg.vocabList?.map((v, i) => (
                                            <span key={i} className="bg-white px-3 py-1.5 rounded-xl border border-slate-100 text-slate-600 text-xs font-bold shadow-sm">
                                                {v.en}
                                            </span>
                                        ))
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="p-4 bg-white border-t border-indigo-100">
                    <button 
                        onClick={handleFinishReward}
                        disabled={isClaiming}
                        className={`w-full py-4 rounded-2xl font-black text-lg shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95 ${isClaiming ? 'bg-green-500 text-white scale-105' : 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-orange-200'}`}
                    >
                        {isClaiming ? <Check /> : <Sparkles size={20} />} 
                        {isClaiming ? 'Đã nhận!' : `Nhận Quà Nông Trại`} 
                    </button>
                </div>
            </div>
        );
    }

    // --- GAME VIEW ---
    const currentSegment = storySegments[currentSegmentIdx];
    const progress = ((currentSegmentIdx) / storySegments.length) * 100;

    return (
        <div className="flex flex-col h-full bg-slate-50 relative">
            {/* Header */}
            <div className="px-4 py-3 border-b border-slate-200 flex items-center gap-3 bg-white z-20 sticky top-0 shadow-sm">
                <button onClick={() => setSelectedStory(null)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"><ArrowLeft size={24}/></button>
                <div className="flex-1">
                    <div className="flex justify-between items-end mb-1">
                        <div className="text-xs font-black text-slate-400 uppercase tracking-wider truncate max-w-[200px]">{selectedStory?.title}</div>
                        <div className="text-xs font-bold text-slate-300 flex-shrink-0">{currentSegmentIdx + 1}/{storySegments.length}</div>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 transition-all duration-500 ease-out" style={{ width: `${progress}%` }} />
                    </div>
                </div>
            </div>

            <div ref={contentAreaRef} className="flex-1 overflow-y-auto p-4 pb-40 scroll-smooth">
                {/* 1. Past Stories Context (Faded) */}
                <div className="space-y-2 mb-4">
                    {storySegments.map((seg, idx) => {
                        if (idx >= currentSegmentIdx) return null;
                        return (
                            <div key={idx} className="text-slate-400 text-sm font-medium leading-relaxed opacity-60">
                                {seg.vi}
                            </div>
                        );
                    })}
                </div>

                {/* 2. Sticky Current Sentence */}
                <div className="sticky top-0 z-10 pt-2 pb-6 -mx-4 px-4 bg-gradient-to-b from-slate-50 via-slate-50 to-slate-50/0">
                    <div className="bg-white p-5 rounded-[2rem] border-2 border-blue-100 shadow-xl relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-2 h-full bg-blue-500"></div>
                        <div className="text-xs font-black text-blue-400 uppercase tracking-widest mb-2">Dịch câu này:</div>
                        <p className="text-2xl font-bold text-slate-800 leading-snug">
                            {currentSegment.vi}
                        </p>
                    </div>
                </div>

                {/* 3. Rich Vocab Hints */}
                {!feedback && currentSegment && (
                    <div className="mb-4 animate-fadeIn">
                        {currentSegment.vocabList && currentSegment.vocabList.length > 0 && (
                            <div className="mb-4">
                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Từ vựng gợi ý:</div>
                                <div className="flex flex-wrap gap-2">
                                    {currentSegment.vocabList.map((v, i) => (
                                        <div key={i} className="flex flex-col bg-white border-2 border-slate-100 rounded-xl px-3 py-1.5 shadow-sm">
                                            <span className="text-xs font-black text-blue-600">{v.en}</span>
                                            <span className="text-[10px] font-medium text-slate-500">{v.vi}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Grammar Tip */}
                        <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-4 rounded-3xl border border-indigo-100 relative mt-2 flex items-start gap-3">
                            <Avatar emoji="🐢" bgGradient="bg-indigo-200" size="sm" animate />
                            <div>
                                <h4 className="text-xs font-black text-indigo-500 uppercase tracking-wider mb-1">Bí kíp Thầy Rùa</h4>
                                <p className="text-sm text-slate-700 font-medium leading-snug">{currentSegment.grammarTip}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* 4. Input Area */}
                <textarea 
                    value={userInput}
                    onChange={(e) => {
                        if (!feedback) setUserInput(e.target.value);
                    }}
                    placeholder="Gõ tiếng Anh vào đây..."
                    disabled={!!feedback}
                    className="w-full p-5 rounded-3xl border-2 border-slate-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 outline-none text-xl font-bold text-slate-700 bg-white placeholder-slate-300 resize-none h-32 transition-all shadow-sm disabled:bg-slate-50 disabled:text-slate-500"
                />

                {/* Feedback */}
                {feedback && (
                    <div className={`mt-6 p-5 rounded-3xl border-l-8 shadow-md animate-fadeIn ${feedback.isCorrect ? 'bg-green-50 border-green-500' : 'bg-orange-50 border-orange-400'}`}>
                        <div className="flex items-start gap-4">
                            <Avatar emoji="🐢" bgGradient={feedback.isCorrect ? "bg-green-200" : "bg-orange-200"} size="sm" animate={feedback.isCorrect} />
                            <div className="flex-1">
                                <div className="flex justify-between items-center mb-1">
                                    <h4 className={`font-black text-lg ${feedback.isCorrect ? 'text-green-700' : 'text-orange-700'}`}>
                                        {feedback.isCorrect ? "Chính xác!" : "Gần đúng rồi!"}
                                    </h4>
                                    <span className="text-xs font-bold bg-white px-2 py-1 rounded-lg border shadow-sm">{feedback.score}/10</span>
                                </div>
                                <p className="text-sm font-medium text-slate-700 mb-3">{feedback.explanation}</p>
                                
                                <div className="bg-white/80 p-3 rounded-xl border border-slate-100 mb-3">
                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Đáp án gợi ý:</div>
                                    <p className="font-bold text-blue-600 text-lg">{feedback.corrected}</p>
                                </div>

                                {/* Native Alternatives */}
                                {feedback.alternatives && feedback.alternatives.length > 0 && (
                                    <div className="bg-purple-50 p-3 rounded-xl border border-purple-100">
                                        <div className="flex items-center gap-1.5 mb-1.5">
                                            <MessageCircle size={12} className="text-purple-500" />
                                            <span className="text-[10px] font-black text-purple-600 uppercase tracking-wider">Cách nói tự nhiên khác</span>
                                        </div>
                                        <ul className="space-y-1">
                                            {feedback.alternatives.map((alt, i) => (
                                                <li key={i} className="text-sm font-medium text-slate-700 italic">"{alt}"</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                                
                                {!feedback.isCorrect && feedback.suggestion && (
                                    <p className="text-xs text-orange-600 mt-2 font-medium italic flex items-center gap-1">
                                        💡 {feedback.suggestion}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Bottom Actions */}
            <div className="p-4 border-t border-slate-100 bg-white absolute bottom-0 left-0 w-full z-30 pb-6">
                {!feedback ? (
                    <button 
                        onClick={handleCheck}
                        disabled={!userInput.trim() || isEvaluating}
                        className={`w-full py-4 rounded-2xl font-black text-lg shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95 ${!userInput.trim() || isEvaluating ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200'}`}
                    >
                        {isEvaluating ? <RefreshCw className="animate-spin" /> : <Check />}
                        {isEvaluating ? 'Thầy đang chấm...' : 'Kiểm tra'}
                    </button>
                ) : (
                    <div className="flex gap-3">
                        {!feedback.isCorrect ? (
                            <button 
                                onClick={() => { setFeedback(null); playSFX('click'); }}
                                className="flex-1 py-4 bg-slate-100 text-slate-500 hover:bg-slate-200 rounded-2xl font-bold shadow-sm transition-colors active:scale-95"
                            >
                                Làm lại
                            </button>
                        ) : null}
                        <button 
                            onClick={handleNext}
                            className="flex-[2] py-4 bg-green-500 text-white hover:bg-green-600 rounded-2xl font-black text-lg shadow-lg shadow-green-200 flex items-center justify-center gap-2 transition-all active:scale-95"
                        >
                            {currentSegmentIdx < storySegments.length - 1 ? 'Câu tiếp theo' : 'Xem kết quả'} <ChevronRight />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
