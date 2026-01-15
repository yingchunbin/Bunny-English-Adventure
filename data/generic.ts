
import { RawUnitData } from './types';

export const GENERIC_TOPICS: Record<string, Omit<RawUnitData, 'theme'> & { theme: string }> = {
  animals: {
    title: "Animals (Động vật)",
    theme: 'nature',
    words: [
      { en: "Tiger", vi: "Hổ", pro: "ˈtaɪɡə", exEn: "Scary tiger.", exVi: "Con hổ đáng sợ." },
      { en: "Monkey", vi: "Khỉ", pro: "ˈmʌŋki", exEn: "Funny monkey.", exVi: "Con khỉ vui nhộn." },
      { en: "Bear", vi: "Gấu", pro: "beə", exEn: "Big bear.", exVi: "Con gấu to." },
      { en: "Elephant", vi: "Voi", pro: "ˈelɪfənt", exEn: "Huge elephant.", exVi: "Con voi khổng lồ." },
    ],
    sentences: [
      { en: "I saw a tiger at the zoo", vi: "Tớ đã thấy một con hổ ở sở thú" },
      { en: "The monkeys are funny", vi: "Những con khỉ thật vui nhộn" },
      { en: "Do you like elephants", vi: "Bạn có thích voi không" }
    ]
  },
  food: {
    title: "Food & Drink (Đồ ăn)",
    theme: 'warm',
    words: [
      { en: "Noodle", vi: "Mì", pro: "ˈnuːdl", exEn: "Beef noodle.", exVi: "Mì bò." },
      { en: "Bread", vi: "Bánh mì", pro: "bred", exEn: "Eat bread.", exVi: "Ăn bánh mì." },
      { en: "Water", vi: "Nước", pro: "ˈwɔːtə", exEn: "Drink water.", exVi: "Uống nước." },
      { en: "Rice", vi: "Cơm", pro: "raɪs", exEn: "White rice.", exVi: "Cơm trắng." },
    ],
    sentences: [
      { en: "What would you like to eat", vi: "Bạn muốn ăn gì" },
      { en: "I would like some noodles", vi: "Tớ muốn một ít mì" },
      { en: "Please give me some water", vi: "Làm ơn cho tớ chút nước" }
    ]
  },
  future: {
    title: "Future Plans (Dự định)",
    theme: 'cool',
    words: [
      { en: "Visit", vi: "Thăm", pro: "ˈvɪzɪt", exEn: "Visit grandma.", exVi: "Thăm bà." },
      { en: "Practice", vi: "Luyện tập", pro: "ˈpræktɪs", exEn: "Practice English.", exVi: "Luyện tiếng Anh." },
      { en: "Draw", vi: "Vẽ", pro: "drɔː", exEn: "Draw picture.", exVi: "Vẽ tranh." },
      { en: "Build", vi: "Xây", pro: "bɪld", exEn: "Build house.", exVi: "Xây nhà." },
    ],
    sentences: [
      { en: "I will visit my grandma", vi: "Tớ sẽ đi thăm bà" },
      { en: "What will you do tomorrow", vi: "Ngày mai bạn sẽ làm gì" },
      { en: "She will draw a picture", vi: "Cô ấy sẽ vẽ một bức tranh" }
    ]
  },
  health: {
    title: "Health (Sức khỏe)",
    theme: 'urban',
    words: [
      { en: "Fever", vi: "Sốt", pro: "ˈfiːvə", exEn: "High fever.", exVi: "Sốt cao." },
      { en: "Headache", vi: "Đau đầu", pro: "ˈhedeɪk", exEn: "It hurts.", exVi: "Đau quá." },
      { en: "Medicine", vi: "Thuốc", pro: "ˈmedsn", exEn: "Take medicine.", exVi: "Uống thuốc." },
      { en: "Rest", vi: "Nghỉ ngơi", pro: "rest", exEn: "Take a rest.", exVi: "Nghỉ ngơi đi." },
    ],
    sentences: [
      { en: "I have a headache", vi: "Tớ bị đau đầu" },
      { en: "You should take a rest", vi: "Bạn nên nghỉ ngơi" },
      { en: "He has a fever", vi: "Cậu ấy bị sốt" }
    ]
  }
};

export const GENERIC_MAP = ['animals', 'food', 'future', 'health', 'animals', 'food', 'future', 'health'];
