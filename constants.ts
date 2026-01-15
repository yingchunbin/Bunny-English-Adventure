
import { AvatarItem, LessonLevel, LessonType } from './types';
import { GradeCurriculum } from './data/types';
import { G1_GLOBAL_SUCCESS } from './data/grade1/global_success';
import { G1_FAMILY_FRIENDS } from './data/grade1/family_friends';
import { G1_SMART_START } from './data/grade1/smart_start';
import { G1_MACMILLAN } from './data/grade1/macmillan';

import { G2_GLOBAL_SUCCESS } from './data/grade2/global_success';
import { G2_FAMILY_FRIENDS } from './data/grade2/family_friends';
import { G2_SMART_START } from './data/grade2/smart_start';
import { G2_MACMILLAN } from './data/grade2/macmillan';

import { G3_GLOBAL_SUCCESS } from './data/grade3/global_success';
import { G3_FAMILY_FRIENDS } from './data/grade3/family_friends';
import { G3_SMART_START } from './data/grade3/smart_start';
import { G3_MACMILLAN } from './data/grade3/macmillan';

import { G4_GLOBAL_SUCCESS } from './data/grade4/global_success';
import { G4_FAMILY_FRIENDS } from './data/grade4/family_friends';
import { G4_SMART_START } from './data/grade4/smart_start';
import { G4_MACMILLAN } from './data/grade4/macmillan';

import { G5_GLOBAL_SUCCESS } from './data/grade5/global_success';
import { G5_FAMILY_FRIENDS } from './data/grade5/family_friends';
import { G5_SMART_START } from './data/grade5/smart_start';
import { G5_MACMILLAN } from './data/grade5/macmillan';

export const TEXTBOOKS = [
  { id: 'global_success', name: 'Global Success (BGD)' },
  { id: 'family_friends', name: 'Family and Friends' },
  { id: 'smart_start', name: 'i-Learn Smart Start' },
  { id: 'macmillan', name: 'Macmillan Next Move' },
];

export const AVATARS: AvatarItem[] = [
  { id: 'bunny', name: 'Thỏ Nhanh Nhẹn', emoji: '🐰', cost: 0, bgGradient: 'bg-gradient-to-br from-pink-300 to-rose-300' },
  { id: 'turtle', name: 'Rùa Thông Thái', emoji: '🐢', cost: 50, bgGradient: 'bg-gradient-to-br from-green-300 to-emerald-300' },
  { id: 'tiger', name: 'Hổ Dũng Cảm', emoji: '🐯', cost: 100, bgGradient: 'bg-gradient-to-br from-orange-300 to-red-300' },
  { id: 'cat', name: 'Mèo Tinh Nghịch', emoji: '🐱', cost: 200, bgGradient: 'bg-gradient-to-br from-purple-300 to-indigo-300' },
  { id: 'fox', name: 'Cáo Thông Minh', emoji: '🦊', cost: 300, bgGradient: 'bg-gradient-to-br from-orange-400 to-amber-400' },
  { id: 'panda', name: 'Gấu Trúc Cute', emoji: '🐼', cost: 500, bgGradient: 'bg-gradient-to-br from-slate-300 to-slate-400' },
  { id: 'lion', name: 'Sư Tử Chúa', emoji: '🦁', cost: 1000, bgGradient: 'bg-gradient-to-br from-yellow-300 to-amber-500' },
  { id: 'dragon', name: 'Rồng Thần', emoji: '🐲', cost: 5000, bgGradient: 'bg-gradient-to-br from-emerald-400 to-teal-600' },
];

const WORD_ICONS: Record<string, string> = {
  // --- GREETINGS, NAMES & BASICS ---
  "hello": "👋", "hi": "👋", "goodbye": "👋", "bye": "👋", "name": "📛", "friend": "👫", "pupil": "👦", "student": "🎓",
  "yes": "✅", "no": "❌", "fine": "👍", "thank": "🙏", "please": "🙏", "nice": "😊", "meet": "🤝", "you": "🫵", "my": "🙋",
  "good morning": "🌅", "good afternoon": "☀️", "good evening": "🌆", "good night": "🌙", "how": "❓", "what": "❓", "who": "❓", "where": "📍", "when": "⏰", "why": "🤔",
  "annie": "👧", "bill": "👦", "rosy": "👧", "tim": "👦", "ben": "👦", "mai": "👧", "nam": "👦", "quan": "👦", "phong": "👦", "mary": "👧", "linda": "👧", "peter": "👦", "tony": "👦", "tom": "👦", "hoa": "👧", "mr": "👨", "ms": "👩", "miss": "👩",

  // --- NUMBERS ---
  "one": "1️⃣", "two": "2️⃣", "three": "3️⃣", "four": "4️⃣", "five": "5️⃣", "six": "6️⃣", "seven": "7️⃣", "eight": "8️⃣", "nine": "9️⃣", "ten": "🔟",
  "zero": "0️⃣", "eleven": "1️⃣1️⃣", "twelve": "1️⃣2️⃣", "thirteen": "1️⃣3️⃣", "fourteen": "1️⃣4️⃣", "fifteen": "1️⃣5️⃣", "sixteen": "1️⃣6️⃣", 
  "seventeen": "1️⃣7️⃣", "eighteen": "1️⃣8️⃣", "nineteen": "1️⃣9️⃣", "twenty": "2️⃣0️⃣", "thirty": "3️⃣0️⃣", "forty": "4️⃣0️⃣", "fifty": "5️⃣0️⃣", 
  "hundred": "💯", "thousand": "💰", "first": "🥇", "second": "🥈", "third": "🥉", "count": "🔢",

  // --- COLORS & SHAPES ---
  "red": "🔴", "blue": "🔵", "yellow": "🟡", "green": "🟢", "brown": "🟤", "orange": "🟠", "black": "⚫", "white": "⚪", "pink": "🌸", "purple": "🟣", "grey": "👽", "gray": "👽", "gold": "🥇", "silver": "🥈", "blond": "👱",
  "circle": "⭕", "square": "YX", "triangle": "🔺", "rectangle": "▬", "star": "⭐", "shape": "🔷",

  // --- SCHOOL & STATIONERY ---
  "school": "🏫", "classroom": "👨‍🏫", "library": "📚", "gym": "🏀", "playground": "🎠", "computer room": "💻", "art room": "🎨", "music room": "🎵", "cafeteria": "🍽️", "canteen": "🍽️",
  "pen": "🖊️", "pencil": "✏️", "ruler": "📏", "rubber": "🧼", "eraser": "🧼", "book": "📖", "notebook": "📒", "bag": "🎒", "school bag": "🎒", "backpack": "🎒", 
  "desk": "🪑", "chair": "🪑", "board": "📋", "blackboard": "⬛", "whiteboard": "⬜", "chalk": "🖍️", "crayon": "🖍️", "pencil case": "👝", 
  "sharpener": "🔪", "paper": "📄", "map": "🗺️", "globe": "🌍", "computer": "💻", "keyboard": "⌨️", "computer mouse": "🖱️", "screen": "🖥️", "peg": "📍", "ink": "✒️", "timetable": "📅",

  // --- SUBJECTS ---
  "math": "➗", "maths": "➗", "mathematics": "➗", "english": "🇬🇧", "vietnamese": "🇻🇳", "science": "🧪", "history": "📜", "geography": "🌍", 
  "music": "🎵", "art": "🎨", "pe": "⚽", "physical education": "⚽", "it": "💻", "technology": "💻", "literature": "📚", "dictation": "✍️",

  // --- ANIMALS & PETS ---
  "cat": "🐱", "kitten": "🐱", "dog": "🐶", "puppy": "🐶", "bird": "🐦", "fish": "🐟", "mouse": "🐭", "tiger": "🐯", "lion": "🦁", "monkey": "🐵", 
  "elephant": "🐘", "bear": "🐻", "rabbit": "🐰", "duck": "🦆", "chicken": "🐔", "hen": "🐔", "rooster": "🐓", "cow": "🐄", "goat": "🐐", 
  "horse": "🐎", "sheep": "🐑", "pig": "🐷", "snake": "🐍", "spider": "🕷️", "lizard": "🦎", "crocodile": "🐊", "alligator": "🐊", "zebra": "🦓", "giraffe": "🦒", 
  "hippo": "🦛", "parrot": "🦜", "shark": "🦈", "whale": "🐋", "dolphin": "🐬", "bat": "🦇", "penguin": "🐧", "kangaroo": "🦘", "panda": "🐼",
  "ant": "🐜", "bee": "🐝", "butterfly": "🦋", "frog": "🐸", "turtle": "🐢", "fox": "🦊", "wolf": "🐺", "camel": "🐪", "donkey": "𫚉", "goose": "🪿",
  "owl": "🦉", "rhino": "🦏", "gorilla": "🦍", "crab": "🦀", "octopus": "🐙", "jellyfish": "🪼", "starfish": "⭐", "shrimp": "🦐", "claw": "🦞", 
  "ox": "🐂", "goldfish": "🐠", "insect": "🐞", "fur": "🧶", "zebu": "🐂", "coral": "🪸",
  "peacock": "🦚",

  // --- FOOD & DRINK ---
  "apple": "🍎", "banana": "🍌", "orange fruit": "🍊", "mango": "🥭", "grape": "🍇", "grapes": "🍇", "lemon": "🍋", "strawberry": "🍓", 
  "watermelon": "🍉", "pineapple": "🍍", "coconut": "🥥", "pear": "🍐", "peach": "🍑", "cherry": "🍒", "papaya": "🍈", "yam": "🍠", "olive": "🫒",
  "egg": "🥚", "eggs": "🥚", "meat": "🥩", "pork": "🥩", "beef": "🥩", "chicken meat": "🍗", "fish meat": "🐟", "rice": "🍚", "bread": "🍞", "cake": "🍰", 
  "pizza": "🍕", "pasta": "🍝", "noodle": "🍜", "noodles": "🍜", "popcorn": "🍿", "milk": "🥛", "water": "💧", "juice": "🧃", "lemonade": "🥤", 
  "tea": "🍵", "coffee": "☕", "soda": "🥤", "candy": "🍬", "sweet": "🍬", "biscuit": "🍪", "cookie": "🍪", "chocolate": "🍫", "ice cream": "🍦", "ice lolly": "🍭",
  "soup": "🥣", "salad": "🥗", "sandwich": "🥪", "burger": "🍔", "hamburger": "🍔", "fries": "🍟", "chips": "🍟", "yogurt": "🥣", "cheese": "🧀", 
  "butter": "🧈", "sausage": "🌭", "tomato": "🍅", "potato": "🥔", "carrot": "🥕", "carrots": "🥕", "onion": "🧅", "beans": "🫘", "cabbage": "🥬", "corn": "🌽",
  "breakfast": "🍳", "lunch": "🍱", "dinner": "🍽️", "meal": "🥘", "lunch box": "🍱", "jam": "🍯", "jelly": "🍮", "omelet": "🍳", "pancake": "🥞", "oil": "🛢️", "salt": "🧂", "honey": "🍯",

  // --- BODY PARTS ---
  "head": "👤", "face": "😊", "eye": "👁️", "eyes": "👀", "ear": "👂", "nose": "👃", "mouth": "👄", "tooth": "🦷", "teeth": "🦷",
  "hair": "💇", "hand": "✋", "hands": "👐", "arm": "💪", "leg": "🦵", "foot": "🦶", "feet": "👣", "finger": "☝️", "fingers": "👐", "thumb": "👍", "toe": "🦶",
  "neck": "🧣", "shoulder": "🤷", "knee": "🦵", "back": "🔙", "stomach": "🤰", "body": "🧍", "brain": "🧠", "heart": "❤️", "muscle": "💪", "blood": "🩸", "skeleton": "💀", "tummy": "🤰",

  // --- CLOTHES ---
  "shirt": "👕", "t-shirt": "👕", "dress": "👗", "skirt": "👗", "shorts": "🩳", "trousers": "👖", "pants": "👖", "jeans": "👖", 
  "socks": "🧦", "shoes": "👟", "boots": "👢", "trainers": "👟", "sneakers": "👟", "hat": "🧢", "cap": "🧢", "jacket": "🧥", "coat": "🧥", "vest": "🦺",
  "scarf": "🧣", "gloves": "🧤", "glasses": "👓", "sunglasses": "🕶️", "watch": "⌚", "handbag": "👜", "belt": "🥋", "pyjamas": "🛌", "pajamas": "🛌",
  "uniform": "🥋", "swimsuit": "🩱", "sweater": "🧥", "jumper": "🧥", "umbrella": "☂️", "ring": "💍", "necklace": "📿", "costume": "🎭", "mask": "👺", "helmet": "⛑️",

  // --- FAMILY & PEOPLE ---
  "family": "👨‍👩‍👧‍👦", "father": "👨", "dad": "👨", "daddy": "👨", "mother": "👩", "mom": "👩", "mommy": "👩", "brother": "👦", "sister": "👧", 
  "baby": "👶", "grandpa": "👴", "grandfather": "👴", "grandma": "👵", "grandmother": "👵", "parents": "👫", "grandparents": "👴👵", 
  "cousin": "🧒", "uncle": "🙋‍♂️", "aunt": "🙋‍♀️", "man": "👨", "men": "👬", "woman": "👩", "women": "👭", "boy": "👦", "girl": "👧", 
  "child": "🧒", "children": "🧒", "person": "👤", "people": "👥", "neighbor": "🏘️", "guest": "🙌", "bride": "👰", "customer": "🛒", "housewife": "🏠",

  // --- JOBS ---
  "job": "💼", "teacher": "👨‍🏫", "doctor": "👨‍⚕️", "nurse": "👩‍⚕️", "pilot": "👨‍✈️", "driver": "🚌", "farmer": "👨‍🌾", "worker": "👷", "police": "👮", "police officer": "👮",
  "firefighter": "👨‍🚒", "fireman": "👨‍🚒", "waiter": "🤵", "waitress": "💁‍♀️", "chef": "👨‍🍳", "cook": "👨‍🍳", "shop assistant": "🏪",
  "singer": "🎤", "dancer": "💃", "artist": "🎨", "writer": "✍️", "scientist": "👨‍🔬", "footballer": "⚽", "player": "🏃",
  "dentist": "🦷", "vet": "🐾", "actor": "🎭", "soldier": "🪖", "postman": "📮", "astronaut": "👨‍🚀", "detective": "🕵️", "juggler": "🤹", "acrobat": "🤸", "musician": "🎷", "thief": "🦹", "winner": "🏆", "baker": "🥖", "reporter": "🎤",

  // --- PLACES, BUILDINGS & NATURE ---
  "house": "🏠", "home": "🏡", "room": "🚪", "living room": "🛋️", "bedroom": "🛏️", "kitchen": "🍳", "bathroom": "🛁", "dining room": "🍽️", "hall": "🚪",
  "garden": "🌻", "yard": "🏡", "garage": "🚗", "window": "🪟", "door": "🚪", "floor": "🧱", "wall": "🧱", "roof": "🏠", "rug": "🧶", "cabinet": "🗄️", "shelf": "📚", "pillow": "🛌", "blanket": "🛌", "fridge": "❄️",
  "park": "🌳", "zoo": "🦁", "beach": "🏖️", "sea": "🌊", "ocean": "🌊", "lake": "🌅", "river": "🏞️", "mountain": "⛰️", "hill": "⛰️", 
  "forest": "🌲", "jungle": "🌴", "island": "🏝️", "field": "🌾", "farm": "🚜", "city": "🏙️", "town": "🏘️", "village": "🏡", "countryside": "🌄", "address": "📍", "lane": "🛣️", "tower": "🗼", "flat": "🏢", "hometown": "🏘️",
  "shop": "🏪", "store": "🏪", "supermarket": "🛒", "market": "🏪", "bookshop": "📚", "bakery": "🍞", "pharmacy": "💊", "hospital": "🏥", 
  "police station": "🚓", "fire station": "🚒", "post office": "📮", "bank": "🏦", "cinema": "🎬", "museum": "🏛️", "theater": "🎭", 
  "stadium": "🏟️", "restaurant": "🍽️", "cafe": "☕", "hotel": "🏨", "airport": "✈️", "station": "🚉", "bus stop": "🚏",
  "pool": "🏊", "bridge": "🌉", "street": "🛣️", "road": "🛣️", "corner": "↪️", "petrol station": "⛽", "space station": "🛰️", "campsite": "⛺", "tent": "⛺", "campfire": "🔥", "castle": "🏰", "igloo": "❄️", "waterfall": "🌊", "cave": "🕳️", "ruins": "🏛️", "volcano": "🌋",
  "imperial city": "🏯", "ancient town": "🏮", "underground": "🚇",

  // --- WEATHER & SEASONS ---
  "weather": "🌦️", "sun": "☀️", "sunny": "☀️", "rain": "🌧️", "rainy": "🌧️", "cloud": "☁️", "cloudy": "☁️", "wind": "💨", "windy": "💨", 
  "snow": "❄️", "snowy": "❄️", "snowing": "❄️", "storm": "⛈️", "stormy": "⛈️", "fog": "🌫️", "foggy": "🌫️", "hot": "🥵", "cold": "🥶", "warm": "🌡️", "cool": "🌬️", "dry": "🌵", "wet": "💧",
  "rainbow": "🌈", "sky": "☁️", "moon": "🌙", "season": "📅", "spring": "🌸", "summer": "☀️", "autumn": "🍂", "fall": "🍂", "winter": "⛄", 
  "earthquake": "🏚️", "flood": "🌊", "tornado": "🌪️", "pollution": "🏭", "energy": "⚡",

  // --- TIME ---
  "time": "⏰", "clock": "🕰️", "hour": "⏳", "minute": "⏱️", "o'clock": "🕛", "quarter": "¼", "half": "½",
  "day": "🌞", "night": "🌜", "week": "📅", "month": "📆", "year": "🗓️", "today": "👇", "tomorrow": "👉", "yesterday": "👈", "midnight": "🕛", "noon": "☀️",
  "morning": "🌅", "afternoon": "☀️", "evening": "🌆", "weekend": "🎉", 
  "monday": "1️⃣", "tuesday": "2️⃣", "wednesday": "3️⃣", "thursday": "4️⃣", "friday": "5️⃣", "saturday": "6️⃣", "sunday": "7️⃣",
  "january": "❄️", "february": "💘", "march": "🌱", "april": "🌧️", "may": "🌸", "june": "☀️", "july": "🏖️", "august": "🎒", 
  "september": "🍂", "october": "🎃", "november": "🦃", "december": "🎄", "tet": "🧧", "christmas": "🎄", "holiday": "🏖️", "vacation": "🏖️", "lunar new year": "🧧",

  // --- TRANSPORT ---
  "car": "🚗", "bus": "🚌", "bike": "🚲", "bicycle": "🚲", "motorbike": "🛵", "train": "🚆", "plane": "✈️", "boat": "🚤", "ship": "🚢", 
  "truck": "🚚", "taxi": "🚖", "helicopter": "🚁", "van": "🚐", "scooter": "🛴", "skateboard": "🛹", "rocket": "🚀", "ufo": "🛸", "unicycle": "🚲", "flying car": "🚗", "jetpack": "🚀", "time machine": "⏳",

  // --- ACTIONS (VERBS & NOUNS FROM VERBS) ---
  "run": "🏃", "running": "🏃", "walk": "🚶", "walking": "🚶", "jump": "🦘", "hop": "🐇", "climb": "🧗", "swim": "🏊", "swimming": "🏊", "dance": "💃", "dancing": "💃", "sing": "🎤", "singing": "🎤", "read": "📖", "reading": "📖", "write": "✍️", "writing": "✍️",
  "draw": "🎨", "drawing": "🎨", "paint": "🖌️", "painting": "🖌️", "cooking": "🍳", "eat": "🍴", "eating": "🍴", "drink": "🥤", "play": "🎮", "playing": "🎮", "sleep": "😴", "sleeping": "😴", "wake up": "⏰", "get up": "🛌",
  "wash": "🧼", "clean": "🧹", "cleaning": "🧹", "brush": "🪥", "brush teeth": "🪥", "comb": "💇", "study": "📝", "learn": "🧠", "teach": "👨‍🏫", "listen": "👂", "listening": "👂", "hear": "👂", 
  "see": "👀", "look": "👀", "speak": "🗣️", "talk": "🗣️", "say": "💬", "ask": "❓", "answer": "❗", "sit": "🪑", "sit down": "🪑", "stand": "🧍", "stand up": "🧍",
  "open": "🔓", "close": "🔒", "go": "➡️", "come": "⬅️", "stop": "🛑", "fly": "🕊️", "flying": "🕊️", "ride": "🚴", "riding": "🚴", "drive": "🚗", "driving": "🚗", "buy": "🛒", "sell": "💰",
  "give": "🎁", "take": "🤲", "make": "🔨", "making": "🔨", "do": "✅", "practice": "🤸", "help": "🤝", "visit": "🏠", "travel": "🧳", "work": "💼", 
  "live": "🏠", "love": "❤️", "like": "👍", "hate": "👎", "start": "🏁", "finish": "🏁", "end": "🔚", "win": "🏆", "lose": "😢", "collect": "🐚", "collecting": "🐚", "catch": "🎣", "find": "🔍", "protect": "🛡️", "recycle": "♻️", "save": "💾", "change": "🔄", "explore": "🧭", "solve": "🧩", "join": "➕", "enjoy": "😊", "chat": "💬", "skate": "⛸️", "skating": "⛸️", "slide": "🛝", "sliding": "🛝", "swing": "🤸", "swinging": "🤸", "feed": "🥣", "tidy up": "🧹", "cheer": "📣", "decorate": "🎀", "pour": "🫗", "plant": "🌱",
  "play football": "⚽", "play basketball": "🏀", "play badminton": "🏸", "play chess": "♟️", "play tennis": "🎾", "play table tennis": "🏓", "play the guitar": "🎸", "play the piano": "🎹", "do gymnastics": "🤸", "rollerblade": "🛼", "make the bed": "🛌", "watch tv": "📺", "listening to music": "🎧", "skip": "🏃‍♀️", "skipping": "🏃‍♀️", "cycle": "🚴", "cycling": "🚴", "camp": "⛺", "camping": "⛺",

  // --- FEELINGS & ADJECTIVES ---
  "happy": "😄", "sad": "😢", "angry": "😡", "scared": "😱", "afraid": "😱", "tired": "😫", "sleepy": "😴", "bored": "😐", "excited": "🤩", 
  "surprised": "😲", "nervous": "😬", "sick": "🤒", "ill": "🤒", "great": "🌟", "good": "👍", "bad": "👎", 
  "big": "🐘", "small": "🐜", "little": "🐜", "long": "📏", "short": "🤏", "tall": "🦒", "fat": "🐷", "thin": "🥢", "fast": "🐆", "slow": "🐢",
  "old": "👴", "new": "✨", "young": "👶", "beautiful": "👸", "pretty": "👸", "ugly": "👹", "cute": "🥺", "dirty": "💩",
  "easy": "✅", "difficult": "🤯", "hard": "🧱", "soft": "☁️", "strong": "💪", "weak": "🥀", "rich": "💰", "poor": "💸", 
  "expensive": "💎", "cheap": "🏷️", "loud": "🔊", "quiet": "🤫", "busy": "🐝", "free": "🆓", "kind": "😇", "naughty": "😈", "smart": "🧠", "clever": "🧠", "crowded": "👨‍👩‍👧‍👦", "peaceful": "🕊️", "noisy": "📢", "ancient": "🏛️", "modern": "🏙️", "comfortable": "🛋️", "safe": "🦺", "dangerous": "⚠️", "famous": "🌟", "successful": "🏆",

  // --- COUNTRIES & FLAGS ---
  "vietnam": "🇻🇳", "england": "🇬🇧", "uk": "🇬🇧", "america": "🇺🇸", "usa": "🇺🇸", "australia": "🇦🇺", "japan": "🇯🇵", "korea": "🇰🇷", 
  "china": "🇨🇳", "singapore": "🇸🇬", "malaysia": "🇲🇾", "thailand": "🇹🇭", "france": "🇫🇷", "canada": "🇨🇦", "brazil": "🇧🇷", "mexico": "🇲🇽", "italy": "🇮🇹", "spain": "🇪🇸",

  // --- MISC / OBJECTS ---
  "toy": "🧸", "doll": "🎎", "kite": "🪁", "ball": "⚽", "balloon": "🎈", "game": "🎮", "puzzle": "🧩", "top": "🌪️", "sandcastle": "🏰", "shell": "🐚", "bucket": "🪣", "spade": "♠️", "net": "🥅", "seesaw": "⚖️",
  "song": "🎶", "picture": "🖼️", "photo": "📷", "camera": "📷", "phone": "📱", "telephone": "☎️", "money": "💵", "coin": "🪙", 
  "box": "📦", "gift": "🎁", "present": "🎁", "card": "💌", "letter": "✉️", "email": "📧", "flower": "🌸", "tree": "🌳", "leaf": "🍃", "grass": "🌿",
  "fire": "🔥", "ice": "🧊", "flag": "🚩", "trophy": "🏆", "medal": "🥇", "certificate": "📜",
  "festival": "🎉", "party": "🥳", "wedding": "💒", "concert": "🎤", "fair": "🎡", "parade": "👯", "fireworks": "🎆", "graduation": "🎓", "speech": "🗣️",
  "future": "🔮", "past": "⏪", "world": "🌍", "earth": "🌍", "space": "🌌", "alien": "👽", "ghost": "👻", 
  "monster": "👹", "robot": "🤖", "treasure": "💎", "king": "👑", "queen": "👸", "prince": "🤴", "princess": "👸", "pyramid": "🔺", "tomb": "⚰️", "mummy": "🧟", "statue": "🗿", "column": "🏛️",
  "light bulb": "💡", "wheel": "⚙️", "engine": "🚂", "machine": "🤖", "hologram": "👻", "internet": "🌐", "wifi": "📶", "laptop": "💻", "tablet": "📱", "headphones": "🎧", "speaker": "🔊", "charger": "🔌", "battery": "🔋", "rubbish": "🗑️", "bin": "🗑️", "plastic": "🥤", "glass": "🥃", "metal": "🔩", "wood": "🪵", "fabric": "🧵",
  "remote control": "📱", "dictionary": "📕", "comic book": "🦸", "sticker": "🏷️", "magnet": "🧲", "rope": "➰", "torch": "🔦", "compass": "🧭",
  "civilization": "🏛️", "temple": "🛕", "carve": "🗿", "suitcase": "🧳", "sunscreen": "🧴", "towel": "🧖", "soap": "🧼", "orchestra": "🎻", "stage": "🎭",
  "dinosaur": "🦖", "model": "🏗️", "roundabout": "🔄", "traffic light": "🚦", "price": "🏷️", "footprint": "👣", "mystery": "🕵️", "gravity": "🌑", "float": "🎈",
};

const BG_COLORS = [
  '#FFEBEE', '#F3E5F5', '#E3F2FD', '#E0F2F1', '#F1F8E9', '#FFFDE7', '#FFF3E0', '#FBE9E7',
  '#E1F5FE', '#E8F5E9', '#FFF8E1', '#FCE4EC', '#F3E5F5', '#E8EAF6'
];

const getWordMetadata = (text: string): { emoji?: string, color: string } => {
  const cleanText = text.toLowerCase().trim().replace(/[?!.]/g, '');
  
  // 1. Direct match
  let emoji = WORD_ICONS[cleanText];
  
  if (!emoji) {
      // 2. Singular form
      if (cleanText.endsWith('s') && WORD_ICONS[cleanText.slice(0, -1)]) emoji = WORD_ICONS[cleanText.slice(0, -1)];
      else if (cleanText.endsWith('es') && WORD_ICONS[cleanText.slice(0, -2)]) emoji = WORD_ICONS[cleanText.slice(0, -2)];
      else if (cleanText.endsWith('ies') && WORD_ICONS[cleanText.slice(0, -3) + 'y']) emoji = WORD_ICONS[cleanText.slice(0, -3) + 'y'];
      
      // 3. Verb forms
      else if (cleanText.endsWith('ing')) {
          const base = cleanText.slice(0, -3);
          emoji = WORD_ICONS[base] || WORD_ICONS[cleanText]; // Check "swimming" directly then "swim"
          if (!emoji && base.endsWith(base[base.length-1])) emoji = WORD_ICONS[base.slice(0,-1)]; // runn-ing -> run
          if (!emoji && WORD_ICONS[base + 'e']) emoji = WORD_ICONS[base + 'e']; // writ-ing -> write
      }
      else if (cleanText.endsWith('ed')) {
          const base = cleanText.slice(0, -2);
          emoji = WORD_ICONS[base] || WORD_ICONS[base + 'e'];
      }
      
      // 4. Smart Partial Match (Reverse search for compound words)
      if (!emoji) {
          const parts = cleanText.split(' ');
          
          // Strategy: Check specific keywords
          if (parts.includes("play")) {
             const sport = parts.find(p => p !== "play" && p !== "the");
             if (sport && WORD_ICONS[sport]) emoji = WORD_ICONS[sport];
          }
          else if (parts.includes("go")) {
             const dest = parts.find(p => p !== "go" && p !== "to" && p !== "the");
             if (dest && WORD_ICONS[dest]) emoji = WORD_ICONS[dest];
          }
          
          if (!emoji && parts.length > 1) {
             // Fallback: try last word (noun)
             if (WORD_ICONS[parts[parts.length - 1]]) emoji = WORD_ICONS[parts[parts.length - 1]];
             // Fallback: try first word (verb)
             else if (WORD_ICONS[parts[0]]) emoji = WORD_ICONS[parts[0]];
          }
      }
  }

  // Fallback for VERY specific phrases not caught above
  if (!emoji) {
      if (cleanText.includes("teddy")) emoji = "🧸";
      else if (cleanText.includes("ball")) emoji = "⚽";
      else if (cleanText.includes("ice cream")) emoji = "🍦";
      else if (cleanText.includes("puzzle")) emoji = "🧩";
      else if (cleanText.includes("cake")) emoji = "🍰";
      else if (cleanText.includes("juice")) emoji = "🧃";
  }

  let hash = 0;
  for (let i = 0; i < cleanText.length; i++) hash = cleanText.charCodeAt(i) + ((hash << 5) - hash);
  const color = BG_COLORS[Math.abs(hash) % BG_COLORS.length];

  return { emoji, color };
};

const scrambleSentence = (sentence: string): string[] => {
  return sentence.split(' ').sort(() => Math.random() - 0.5);
};

const CURRICULUM_MAP: Record<number, Record<string, GradeCurriculum>> = {
  1: { 'global_success': G1_GLOBAL_SUCCESS, 'family_friends': G1_FAMILY_FRIENDS, 'smart_start': G1_SMART_START, 'macmillan': G1_MACMILLAN },
  2: { 'global_success': G2_GLOBAL_SUCCESS, 'family_friends': G2_FAMILY_FRIENDS, 'smart_start': G2_SMART_START, 'macmillan': G2_MACMILLAN },
  3: { 'global_success': G3_GLOBAL_SUCCESS, 'family_friends': G3_FAMILY_FRIENDS, 'smart_start': G3_SMART_START, 'macmillan': G3_MACMILLAN },
  4: { 'global_success': G4_GLOBAL_SUCCESS, 'family_friends': G4_FAMILY_FRIENDS, 'smart_start': G4_SMART_START, 'macmillan': G4_MACMILLAN },
  5: { 'global_success': G5_GLOBAL_SUCCESS, 'family_friends': G5_FAMILY_FRIENDS, 'smart_start': G5_SMART_START, 'macmillan': G5_MACMILLAN },
};

const createLevel = (id: number, grade: number, unitNum: number, data: any, type: LessonType = 'LESSON'): LessonLevel => {
  return {
    id, grade, type, title: data.title, topic: data.title.split(':')[0], isLocked: unitNum > 1, stars: 0,
    words: data.words.map((w: any) => {
      const meta = getWordMetadata(w.en);
      return {
        id: w.en.toLowerCase().replace(/\s/g, '_'), 
        english: w.en, 
        vietnamese: w.vi, 
        pronunciation: w.pro, 
        emoji: meta.emoji, 
        color: meta.color,
        exampleEn: w.exEn, 
        exampleVi: w.exVi,
      };
    }),
    sentences: data.sentences.map((s: any) => ({
      en: s.en, vi: s.vi, scrambled: scrambleSentence(s.vi), scrambledEn: scrambleSentence(s.en),
    })),
  };
};

const generateLevels = (): LessonLevel[] => {
  const allLevels: LessonLevel[] = [];
  const books = ['global_success', 'family_friends', 'smart_start', 'macmillan'];
  
  for (let grade = 1; grade <= 5; grade++) {
    books.forEach((bookId, bookIndex) => {
        const gradeData = CURRICULUM_MAP[grade]?.[bookId];
        if (gradeData) {
            Object.keys(gradeData).forEach((unitKey) => {
                const unitNum = parseInt(unitKey);
                const levelId = (grade * 1000) + (bookIndex * 100) + unitNum;
                let type: LessonType = 'LESSON';
                if (unitNum % 3 === 0) type = 'EXAM';
                if (unitNum % 5 === 0) type = 'GAME';
                allLevels.push(createLevel(levelId, grade, unitNum, gradeData[unitNum], type));
            });
        }
    });
  }
  return allLevels;
};

export const LEVELS: LessonLevel[] = generateLevels();

export const getLevels = (grade: number | null, bookId: string | null) => {
    if (!grade) return [];
    const bId = bookId || 'global_success';
    const bookIndex = TEXTBOOKS.findIndex(b => b.id === bId);
    if (bookIndex === -1) return [];
    const start = (grade * 1000) + (bookIndex * 100);
    const end = start + 100;
    return LEVELS.filter(l => l.id > start && l.id < end).sort((a,b) => a.id - b.id);
};