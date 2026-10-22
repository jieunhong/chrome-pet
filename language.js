(function (root) {
  const PET_THOUGHTS = {
    cat: {
      idle: ['😺', '💤', '✨', '🐟', '♡', '😼', '🧶', '💭', '🌙', '😻', '🐾', 'meow~', 'zzZ', 'purr~', 'hmph', '…', 'yawn~', 'comfy ♡', '~nya'],
      click: ['😾', '🙀', '💕', '😽', '🫣', '!!', 'hehe', 'hey!', 'pat me~', 'more!', 'stop!', 'purrr'],
      chase: ['🏃', '🐭', '😼!', 'gotcha!', 'mine!'],
      dance: ['🎵', '🎶', '💃', '♪', 'dance~', 'wooo!'],
    },
    dog: {
      idle: ['🐶', '💤', '✨', '🦴', '♡', '🐾', '💭', '🌸', '😊', '🎾', '🥰', 'woof~', 'zzZ', 'arf!', 'hehe', '…', 'yawn~', 'happy ♡', 'sniff~'],
      click: ['🐕', '💕', '🥺', '😍', '🫶', '!!', 'hehe', 'yay!', 'again!', 'more!', 'woof!', 'love it!'],
      chase: ['🏃', '🎾', '🐶!', 'fetch!', 'wait!'],
      dance: ['🎵', '🎶', '🐕‍🦺', '♪', 'dance~', 'wooo!'],
    },
    maltese_white: {
      idle: ['☁️', '💤', '✨', '🎀', '♡', '🐾', '💭', '🌸', '😊', '🧸', '🥰', 'woof!', 'zzZ', 'ruff!', 'hehe', '…', 'yawn~', 'fluffy ♡', 'sniff~'],
      click: ['🐶', '💕', '🥺', '😍', '🫶', '!!', 'hehe', 'yay!', 'again!', 'more!', 'woof!', 'love it!'],
      chase: ['🏃', '🎾', '🐶!', 'fetch!', 'wait!'],
      dance: ['🎵', '🎶', '🐩', '♪', 'dance~', 'wooo!'],
    },
    hamster: {
      idle: ['🐹', '💤', '✨', '🌻', '♡', '🥜', '💭', '🧀', '😊', '🎡', '🥰', 'squeak~', 'zzZ', 'nom nom', 'hehe', '…', 'yawn~', 'cozy ♡', 'munch~'],
      click: ['🐹!', '💕', '🥺', '😳', '🫣', '!!', 'hehe', 'eek!', 'cheeks!', 'more!', 'squeak!', 'fluffy!'],
      chase: ['🏃', '🌻', '🐹!', 'seeds!', 'mine!'],
      dance: ['🎵', '🎶', '🐹', '♪', 'dance~', 'wooo!'],
    },
    dino: {
      idle: ['🦕', '💤', '✨', '🌿', '♡', '🌋', '💭', '🍃', '😊', '🥚', '🥰', 'rawr~', 'zzZ', 'stomp', 'hehe', '…', 'yawn~', 'cozy ♡', 'munch~'],
      click: ['🦕!', '💕', '🥺', '😳', '🫣', '!!', 'hehe', 'roar!', 'rawr!', 'more!', 'stomp!', 'dino!'],
      chase: ['🏃', '🌿', '🦕!', 'chomp!', 'mine!'],
      dance: ['🎵', '🎶', '🦕', '♪', 'dance~', 'wooo!'],
    },
    harp_seal: {
      idle: ['🦭', '💤', '✨', '🐟', '♡', '❄️', '💭', '🌊', '😊', '🥰', 'flop~', 'zzZ', 'boop', 'hehe', '…', 'yawn~', 'chilly ♡', 'roll roll'],
      click: ['🦭!', '💕', '🥺', '😳', '🫶', '!!', 'hehe', 'ork ork!', 'boop me!', 'more!', 'flap flap!', 'squish!'],
      chase: ['🏃', '🏐', '🦭!', 'bounce!', 'mine!'],
      dance: ['🎵', '🎶', '🦭', '♪', 'dance~', 'wooo!'],
    },
  };

  const TIME_THOUGHTS = {
    lateNight: ['🌙', '😴', '🥱', '🛌', 'still up?', 'go sleep~', 'zzZ...', 'so late…', 'sleepy…'],
    morning: ['☀️', '🌅', '🥐', '🌤️', 'morning~', 'good morning!', 'stretch~', 'rise n shine', 'breakfast?'],
    noon: ['🍚', '😋', '🍜', '🥪', '🍙', 'lunch time!', 'hungry…', 'nom nom', 'feed me~'],
    afternoon: ['☕', '🥱', '🍪', '🌤️', 'sleepy…', 'break time~', 'snack?', 'so slow…', 'yawn~'],
    evening: ['🌆', '🍽️', '🌇', '🛋️', '✨', 'good evening~', 'dinner?', 'cozy~', 'nice day?'],
    night: ['🌙', '⭐', '💤', '🌠', 'bedtime~', 'sleepy…', 'good night', 'nighty~', 'zzZ'],
  };

  const TIME_GREETINGS = {
    lateNight: 'still up? 🌙',
    morning: 'good morning! ☀️',
    noon: 'lunch time? 🍚',
    afternoon: 'hey~ ☕',
    evening: 'good evening! 🌆',
    night: 'sleepy~ 🌙',
  };

  const KOREAN = {
    "meow~": "야옹~",
    "zzZ": "쿨쿨",
    "purr~": "골골~",
    "hmph": "흥",
    "yawn~": "하암~",
    "comfy ♡": "편안해 ♡",
    "~nya": "냐옹~",
    "hehe": "헤헤",
    "hey!": "있잖아!",
    "pat me~": "쓰다듬어 줘~",
    "more!": "더 해 줘!",
    "stop!": "그만!",
    "purrr": "골골골",
    "gotcha!": "잡았다!",
    "mine!": "내 거야!",
    "dance~": "춤추자~",
    "wooo!": "신난다!",
    "woof~": "멍멍~",
    "arf!": "왈!",
    "happy ♡": "행복해 ♡",
    "sniff~": "킁킁~",
    "yay!": "야호!",
    "again!": "또 해 줘!",
    "woof!": "멍멍!",
    "love it!": "너무 좋아!",
    "fetch!": "잡으러 가자!",
    "wait!": "기다려!",
    "ruff!": "왕왕!",
    "fluffy ♡": "폭신해 ♡",
    "squeak~": "찍찍~",
    "nom nom": "냠냠",
    "cozy ♡": "포근해 ♡",
    "munch~": "오물오물~",
    "eek!": "앗!",
    "cheeks!": "볼이 빵빵!",
    "squeak!": "찍찍!",
    "fluffy!": "폭신폭신!",
    "seeds!": "씨앗이다!",
    "rawr~": "크앙~",
    "stomp": "쿵쿵",
    "roar!": "어흥!",
    "rawr!": "크앙!",
    "stomp!": "쿵쿵!",
    "dino!": "공룡이다!",
    "chomp!": "와앙!",
    "flop~": "철퍼덕~",
    "boop": "콕",
    "chilly ♡": "시원해 ♡",
    "roll roll": "데굴데굴",
    "ork ork!": "오르 오르!",
    "boop me!": "콕 해 줘!",
    "flap flap!": "파닥파닥!",
    "squish!": "말랑말랑!",
    "bounce!": "통통!",
    "still up?": "아직 안 자?",
    "go sleep~": "이제 자자~",
    "zzZ...": "쿨쿨...",
    "so late…": "밤이 깊었네…",
    "sleepy…": "졸려…",
    "morning~": "좋은 아침~",
    "good morning!": "좋은 아침!",
    "stretch~": "쭈욱 기지개~",
    "rise n shine": "기분 좋게 일어나자",
    "breakfast?": "아침 먹었어?",
    "lunch time!": "점심시간이야!",
    "hungry…": "배고파…",
    "feed me~": "밥 줘~",
    "break time~": "잠깐 쉬자~",
    "snack?": "간식 먹을까?",
    "so slow…": "시간이 느리게 가네…",
    "good evening~": "편안한 저녁~",
    "dinner?": "저녁 먹었어?",
    "cozy~": "포근해~",
    "nice day?": "좋은 하루였어?",
    "bedtime~": "잘 시간이야~",
    "good night": "잘 자",
    "nighty~": "잘 자~",
    "still up? 🌙": "아직 안 자? 🌙",
    "good morning! ☀️": "좋은 아침! ☀️",
    "lunch time? 🍚": "점심 먹었어? 🍚",
    "hey~ ☕": "잠깐 쉬어 가자~ ☕",
    "good evening! 🌆": "편안한 저녁 보내! 🌆",
    "sleepy~ 🌙": "졸려~ 🌙",
    "Could not hide. Try again.": "숨기지 못했어. 다시 해 줘."
};

  function normalizePreference(value) {
    return value === 'ko' || value === 'en' ? value : 'auto';
  }

  function browserLanguage() {
    try {
      if (typeof chrome !== 'undefined' && chrome.i18n && chrome.i18n.getUILanguage) {
        const language = chrome.i18n.getUILanguage();
        if (language) return language;
      }
    } catch (error) { /* A disconnected extension can still use navigator. */ }
    return typeof navigator !== 'undefined' && navigator.language ? navigator.language : 'en';
  }

  function resolve(preference, language = browserLanguage()) {
    const selected = normalizePreference(preference);
    if (selected !== 'auto') return selected;
    return typeof language === 'string' && /^ko(?:-|$)/i.test(language) ? 'ko' : 'en';
  }

  function text(key, language) {
    return language === 'ko' ? (KOREAN[key] || key) : key;
  }

  function thoughts(pet, category, language) {
    const categories = PET_THOUGHTS[pet] || PET_THOUGHTS.cat;
    return (categories[category] || categories.idle).map((key) => text(key, language));
  }

  function timeThoughts(slot, language) {
    return (TIME_THOUGHTS[slot] || TIME_THOUGHTS.morning).map((key) => text(key, language));
  }

  function greeting(slot, language) {
    return text(TIME_GREETINGS[slot] || TIME_GREETINGS.morning, language);
  }

  root.PetLanguage = Object.freeze({ normalizePreference, browserLanguage, resolve, text, thoughts, timeThoughts, greeting });
})(typeof globalThis !== 'undefined' ? globalThis : this);
