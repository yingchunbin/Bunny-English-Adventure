
import { LEVELS } from '../constants';
import { LessonLevel } from '../types';

export interface VocabHint {
    en: string;
    vi: string;
}

export interface StorySegment {
    vi: string;
    vocabList: VocabHint[]; // Changed from simple string to structured list
    grammarTip: string; 
}

export interface StoryVocab {
    word: string;
    ipa: string;
    meaning: string;
    usage?: string;
}

export interface Story {
    id: string;
    title: string;
    topic: string; 
    grade: number; 
    textbookId?: string; 
    segments: StorySegment[];
    vocabulary: StoryVocab[];
    reward: number;
    difficulty: 'EASY' | 'MEDIUM' | 'HARD';
    coverEmoji: string;
}

// FACTORY: Generate Stories automatically from the huge Lesson Database
const generateStoriesFromLevels = (): Story[] => {
    const validLevels = LEVELS.filter(l => l.sentences && l.sentences.length > 0);

    return validLevels.map((level: LessonLevel) => {
        // Map Words to Story Vocab
        const vocabulary: StoryVocab[] = level.words.map(w => ({
            word: w.english,
            ipa: `/${w.pronunciation}/`, 
            meaning: w.vietnamese,
            usage: w.exampleEn
        }));

        // Map Sentences to Story Segments
        const segments: StorySegment[] = level.sentences.map(s => {
            // Generate richer hints: Map ALL words in the lesson that appear in this sentence
            // Also add some basic mapping if possible, but for auto-gen, we rely on lesson words.
            const sentenceLower = s.en.toLowerCase();
            const relevantVocab = level.words
                .filter(w => sentenceLower.includes(w.english.toLowerCase()))
                .map(w => ({ en: w.english, vi: w.vietnamese }));

            return {
                vi: s.vi,
                vocabList: relevantVocab.length > 0 ? relevantVocab : [{ en: "...", vi: "Từ vựng bài học" }],
                grammarTip: relevantVocab.length > 0 
                    ? `Các con hãy chú ý dùng các từ: ${relevantVocab.map(v => v.en).join(', ')}`
                    : `Bé hãy dịch câu này sang tiếng Anh nhé.`
            };
        });

        let diff: 'EASY' | 'MEDIUM' | 'HARD' = 'EASY';
        if (level.grade >= 3) diff = 'MEDIUM';
        if (level.grade === 5) diff = 'HARD';

        const reward = Math.min(100, 30 + (segments.length * 10));

        return {
            id: `story_autogen_${level.id}`,
            title: level.title,
            topic: level.topic,
            grade: level.grade,
            textbookId: level.textbookId, 
            coverEmoji: "📖", 
            difficulty: diff,
            reward: reward,
            vocabulary: vocabulary,
            segments: segments
        };
    });
};

export const STORIES: Story[] = generateStoriesFromLevels();
