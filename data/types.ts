
export interface RawWord {
  en: string;
  vi: string;
  pro: string;
  exEn: string;
  exVi: string;
}

export interface RawSentence {
  en: string;
  vi: string;
}

export interface RawUnitData {
  title: string;
  theme: 'warm' | 'cool' | 'nature' | 'urban';
  words: RawWord[];
  sentences: RawSentence[];
}

export type GradeCurriculum = Record<number, RawUnitData>; // Key is Unit Number (1, 2, 3...)
