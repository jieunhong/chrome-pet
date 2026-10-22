/* Shared local tarot data. Saved results contain IDs and numbers, never translated text. */
(function (global) {
  const entries = [
    ['fool', '0', 'The Fool', '바보', 'star', 76, 96, 'Yellow pencil', '노란 연필', 'Try one small thing you have been curious about. A light first step is enough.', '궁금했던 일을 작게 시작해 보세요. 가벼운 첫걸음만으로도 충분해요.'],
    ['magician', 'I', 'The Magician', '마법사', 'wand', 80, 98, 'Favorite pen', '좋아하는 펜', 'Your familiar tools can help a new idea take shape. Pick one and begin.', '익숙한 도구가 새로운 아이디어를 도와줄 수 있어요. 하나를 골라 시작해 보세요.'],
    ['priestess', 'II', 'The High Priestess', '여사제', 'moon', 74, 94, 'Bookmark', '책갈피', 'Leave a little room for quiet thought. Write down the idea that keeps returning.', '조용히 생각할 시간을 조금 남겨 보세요. 자꾸 떠오르는 생각을 적어도 좋아요.'],
    ['empress', 'III', 'The Empress', '여황제', 'flower', 82, 98, 'Small plant', '작은 화분', 'Make your surroundings a little kinder. A tidy corner or warm greeting can brighten the day.', '주변을 조금 더 다정하게 만들어 보세요. 정돈한 한쪽 공간이나 따뜻한 인사가 잘 어울려요.'],
    ['emperor', 'IV', 'The Emperor', '황제', 'crown', 76, 95, 'Checklist', '체크리스트', 'Choose a simple order for your tasks. Finishing one small promise can feel grounding.', '할 일에 간단한 순서를 정해 보세요. 작은 약속 하나를 지키는 데 집중해도 좋아요.'],
    ['hierophant', 'V', 'The Hierophant', '교황', 'key', 72, 92, 'Old notebook', '오래된 노트', 'A familiar routine or a helpful tip may be useful. Keep what fits you today.', '익숙한 습관이나 누군가의 팁을 살펴보세요. 오늘의 나에게 맞는 것만 가져와도 괜찮아요.'],
    ['lovers', 'VI', 'The Lovers', '연인', 'heart', 82, 98, 'Matching socks', '짝이 맞는 양말', 'Give a conversation your full attention. A sincere question can make room for connection.', '대화 하나에 온전히 귀 기울여 보세요. 진심 어린 질문으로 서로를 조금 더 알아가도 좋아요.'],
    ['chariot', 'VII', 'The Chariot', '전차', 'wheel', 80, 97, 'Comfortable shoes', '편한 신발', 'Pick one direction instead of rushing everywhere. A steady pace is still progress.', '여러 곳으로 서두르기보다 한 방향을 골라 보세요. 차분한 속도도 분명한 전진이에요.'],
    ['strength', 'VIII', 'Strength', '힘', 'flower', 78, 96, 'Soft handkerchief', '부드러운 손수건', 'Gentleness can be a useful kind of strength. Give yourself the patience you offer a friend.', '부드러움도 든든한 힘이 될 수 있어요. 친구에게 주는 기다림을 나에게도 건네 보세요.'],
    ['hermit', 'IX', 'The Hermit', '은둔자', 'star', 68, 90, 'Reading light', '독서등', 'Take a short pause from the noise. One unhurried thought may help you choose your next step.', '주변의 소음에서 잠깐 쉬어 가세요. 서두르지 않는 생각 하나가 다음 걸음을 도와줄 수 있어요.'],
    ['wheel', 'X', 'Wheel of Fortune', '운명의 수레바퀴', 'wheel', 77, 97, 'Round keyring', '둥근 열쇠고리', 'If a plan shifts, try a small adjustment. You do not need to control every part of the day.', '계획이 달라지면 조금만 조정해 보세요. 하루의 모든 부분을 통제하지 않아도 괜찮아요.'],
    ['justice', 'XI', 'Justice', '정의', 'balance', 73, 93, 'Ruler', '자', 'Check the details before deciding. A fair look at both sides can make a choice clearer.', '결정하기 전에 작은 조건을 확인해 보세요. 양쪽을 고르게 살피면 선택이 조금 선명해질 수 있어요.'],
    ['hanged', 'XII', 'The Hanged Man', '매달린 사람', 'moon', 65, 88, 'Postcard', '엽서', 'Try looking at a familiar task from another angle. A pause can be part of the process.', '익숙한 일을 다른 각도에서 바라보세요. 잠깐 멈추는 것도 과정의 일부가 될 수 있어요.'],
    ['death', 'XIII', 'Death', '죽음', 'flower', 70, 92, 'Empty box', '빈 상자', 'This card invites a fresh start, not a prediction of harm. Let one finished task leave your list.', '해로운 일을 예고하는 카드가 아니라 새 출발의 상징이에요. 끝난 일 하나를 목록에서 내려놓아 보세요.'],
    ['temperance', 'XIV', 'Temperance', '절제', 'cup', 78, 96, 'Favorite mug', '좋아하는 머그잔', 'Mix effort with a little breathing room. A comfortable middle pace may suit you today.', '노력 사이에 숨 쉴 여유를 섞어 보세요. 오늘은 편안한 중간 속도가 잘 맞을 수 있어요.'],
    ['devil', 'XV', 'The Devil', '악마', 'key', 64, 88, 'Phone pouch', '휴대폰 파우치', 'Notice a habit that keeps pulling your attention. Try one small boundary without blaming yourself.', '자꾸 주의를 빼앗는 습관을 알아차려 보세요. 자책하기보다 작은 경계 하나를 정해도 좋아요.'],
    ['tower', 'XVI', 'The Tower', '탑', 'wand', 66, 90, 'Eraser', '지우개', 'You can revise a plan that no longer fits. This is an invitation to simplify, not a warning of disaster.', '지금과 맞지 않는 계획은 고쳐도 괜찮아요. 재난의 예고가 아니라 단순하게 다시 정리하자는 제안이에요.'],
    ['star', 'XVII', 'The Star', '별', 'star', 84, 99, 'Star sticker', '별 스티커', 'Make space for a small hope. A kind note to your future self is a lovely place to start.', '작은 기대 하나를 위한 자리를 만들어 보세요. 미래의 나에게 다정한 메모를 남겨도 좋아요.'],
    ['moon', 'XVIII', 'The Moon', '달', 'moon', 68, 91, 'Blue notebook', '파란 노트', 'It is fine if everything is not clear yet. Check what you know and leave guesses open.', '아직 모든 것이 선명하지 않아도 괜찮아요. 아는 것은 확인하고 추측에는 여지를 남겨 보세요.'],
    ['sun', 'XIX', 'The Sun', '태양', 'sun', 88, 100, 'Orange accessory', '주황색 소품', 'Notice something that already brings you joy. Share a small win with someone you like.', '이미 나를 기쁘게 하는 것을 찾아보세요. 작은 성취를 좋아하는 사람과 나눠도 좋아요.'],
    ['judgement', 'XX', 'Judgement', '심판', 'wand', 75, 95, 'Fresh page', '새 종이', 'Look back with curiosity rather than criticism. Choose one thing you would like to try differently.', '비판보다 호기심으로 지난 일을 돌아보세요. 다르게 시도하고 싶은 것 하나를 골라 보세요.'],
    ['world', 'XXI', 'The World', '세계', 'wheel', 85, 99, 'Round coaster', '둥근 컵받침', 'Give yourself credit for a completed step. You can enjoy this moment before starting the next one.', '마친 걸음 하나를 스스로 인정해 주세요. 다음 일을 시작하기 전에 이 순간을 즐겨도 괜찮아요.'],
  ];
  const cards = entries.map(([id, numeral, en, ko, symbol, min, max, itemEn, itemKo, readingEn, readingKo]) => ({
    id, numeral, symbol, min, max,
    en: { name: en, item: itemEn, reading: readingEn },
    ko: { name: ko, item: itemKo, reading: readingKo },
  }));
  const reversedEntries = [
    ['fool', 70, 94, 'Small map', '작은 지도', 'Before jumping into something new, check one practical detail. A thoughtful start can still be playful.', '새로운 일에 뛰어들기 전에 현실적인 조건 하나를 확인해 보세요. 신중하게 시작해도 즐거움은 남아 있어요.'],
    ['magician', 75, 96, 'Pencil case', '필통', 'If your attention is scattered, put the extra tools aside. One clear intention can help you use what you already know.', '주의가 흩어진다면 도구를 조금 덜어내 보세요. 분명한 의도 하나가 이미 아는 것을 활용하도록 도와줄 수 있어요.'],
    ['priestess', 76, 95, 'Sticky note', '메모지', 'Separate your own thoughts from the many opinions around you. Name what you need before asking for another answer.', '주변의 여러 의견과 내 생각을 잠깐 나눠 보세요. 다른 답을 찾기 전에 지금 필요한 것을 적어도 좋아요.'],
    ['empress', 78, 97, 'Hand cream', '핸드크림', 'Care does not have to go only outward. Give yourself a small comfort without needing to earn it first.', '돌봄이 늘 바깥으로만 향할 필요는 없어요. 무언가를 해내지 않았어도 나에게 작은 편안함을 선물해 보세요.'],
    ['emperor', 74, 95, 'Soft pencil', '부드러운 연필', 'Leave a little flexibility in a strict plan. Sharing a decision or adjusting one rule can make the day feel lighter.', '엄격한 계획에 작은 여지를 남겨 보세요. 결정을 나누거나 규칙 하나를 조정하면 하루가 가벼워질 수 있어요.'],
    ['hierophant', 79, 97, 'Colorful paper clip', '알록달록한 클립', 'A familiar method is not the only method. Try a small variation that better suits how you like to work.', '익숙한 방식만이 유일한 방법은 아니에요. 내가 편하게 일할 수 있는 작은 변형을 시도해 보세요.'],
    ['lovers', 75, 95, 'Two colored pens', '두 가지 색의 펜', 'Different wishes can share the same conversation. Say what matters to you gently, and leave space for the other person.', '서로 다른 바람도 한 대화 안에 담을 수 있어요. 내게 중요한 것을 다정하게 말하고 상대의 자리도 남겨 주세요.'],
    ['chariot', 72, 94, 'Spare shoelace', '여분의 신발 끈', 'If you feel pulled in several directions, pause before pushing harder. Choose a destination small enough for today.', '여러 방향으로 끌리는 느낌이라면 더 힘주기 전에 잠깐 멈춰 보세요. 오늘 갈 수 있을 만큼 작은 목적지를 정해도 좋아요.'],
    ['strength', 76, 96, 'Warm mug', '따뜻한 머그잔', 'You do not need to prove your strength at every moment. Speak to yourself kindly while learning something difficult.', '매 순간 강함을 증명할 필요는 없어요. 어려운 것을 배우는 나에게 다정한 말을 건네 보세요.'],
    ['hermit', 78, 96, 'Postcard', '엽서', 'Quiet reflection may be ready for a little company. Share one thought with someone who listens without rushing you.', '조용히 품었던 생각에 작은 동행을 더해도 좋아요. 재촉하지 않고 들어주는 사람에게 한 가지를 나눠 보세요.'],
    ['wheel', 72, 94, 'Spare button', '여분의 단추', 'When timing feels awkward, focus on one thing within reach. A useful adjustment matters more than forcing the whole plan.', '타이밍이 어긋나는 느낌이라면 손에 닿는 일 하나에 집중해 보세요. 전체 계획을 밀어붙이기보다 작은 조정이 도움이 될 수 있어요.'],
    ['justice', 74, 95, 'Clean eraser', '깨끗한 지우개', 'Revisit a conclusion before judging yourself or someone else. A missing detail may deserve a fair hearing.', '나나 다른 사람을 판단하기 전에 결론을 한 번 돌아보세요. 빠뜨린 사정이 있는지 공평하게 들어도 좋아요.'],
    ['hanged', 79, 97, 'Small timer', '작은 타이머', 'If waiting has become a habit, try one gentle action. Set a short timer and make the next step manageable.', '기다림이 습관이 되었다면 부드럽게 행동 하나를 시작해 보세요. 짧은 시간을 정하고 다음 걸음을 작게 만들어도 좋아요.'],
    ['death', 77, 96, 'Envelope', '봉투', 'A change can happen in small stages. Put one finished chapter aside with gratitude; you do not need to rush the goodbye.', '변화는 작은 단계로 찾아와도 괜찮아요. 마친 일 하나를 고마운 마음으로 정리하되 작별을 서두르지 않아도 돼요.'],
    ['temperance', 73, 95, 'Water bottle', '물병', 'If the day feels overfilled, remove one unnecessary demand. Finding your rhythm can begin with a simpler schedule.', '하루가 너무 꽉 찬 느낌이라면 불필요한 요구 하나를 덜어 보세요. 조금 단순한 일정에서 내 리듬을 찾아도 좋아요.'],
    ['devil', 82, 98, 'Loose ribbon', '느슨한 리본', 'Notice a pattern you are ready to loosen. A small boundary can be a kind way to make more room for yourself.', '조금 느슨하게 풀고 싶은 반복을 알아차려 보세요. 작은 경계가 나를 위한 공간을 넓히는 다정한 방법이 될 수 있어요.'],
    ['tower', 80, 97, 'Building block', '조립 블록', 'You can rebuild one part without discarding everything. Keep what supports you and change a piece that no longer fits.', '모든 것을 버리지 않고도 한 부분을 다시 세울 수 있어요. 나를 지지하는 것은 남기고 맞지 않는 조각 하나를 바꿔 보세요.'],
    ['star', 78, 97, 'Star bookmark', '별 책갈피', 'Hope can be quiet rather than bright. Recall one small thing that helped before and let it be enough for this moment.', '기대는 환하게 빛나기보다 조용히 머물러도 괜찮아요. 전에 도움이 됐던 작은 것 하나를 떠올리고 지금은 그것으로 충분하다고 해 주세요.'],
    ['moon', 81, 98, 'Clear folder', '투명 파일', 'Sort a worry into what you know and what you are guessing. A clear question may help the fog feel less crowded.', '걱정을 아는 사실과 추측으로 나눠 보세요. 선명한 질문 하나가 복잡한 마음을 정리하는 데 도움이 될 수 있어요.'],
    ['sun', 80, 98, 'Yellow handkerchief', '노란 손수건', 'Joy need not be a big event. Notice a modest pleasure without comparing it with someone else’s brighter moment.', '기쁨이 꼭 큰 사건일 필요는 없어요. 다른 사람의 빛나는 순간과 비교하지 않고 소박한 즐거움을 발견해 보세요.'],
    ['judgement', 78, 96, 'Blank note card', '빈 메모 카드', 'Set down the inner scorecard for a moment. You can learn from a choice without turning it into a verdict on yourself.', '마음속 평가표를 잠깐 내려놓아 보세요. 선택에서 배울 수는 있지만 그것이 나 전체에 대한 판결일 필요는 없어요.'],
    ['world', 79, 97, 'Paper clip', '종이 클립', 'A loose end does not erase what you have completed. Choose one small finishing touch and acknowledge the progress already made.', '남은 일이 있다고 마친 일까지 사라지는 것은 아니에요. 작은 마무리 하나를 고르고 이미 걸어온 만큼을 인정해 주세요.'],
  ];
  reversedEntries.forEach(([id, min, max, itemEn, itemKo, readingEn, readingKo]) => {
    cards.find((entry) => entry.id === id).reversed = {
      min, max, en: { item: itemEn, reading: readingEn }, ko: { item: itemKo, reading: readingKo },
    };
  });
  // Preserve the original ranges for already-saved, unversioned daily results.
  const legacyScoreRanges = Object.fromEntries(cards.map((entry) => [entry.id, {
    min: entry.min, max: entry.max,
    reversed: { min: entry.reversed.min, max: entry.reversed.max },
  }]));
  const SCORE_VERSION = 2;
  const strings = {
    en: { title: "Today's Fortune", subtitle: 'Pick one card for today', close: 'Close fortune', card: 'Choose card', loading: 'Shuffling your cards…', score: 'Fortune score', item: 'Lucky item', disclaimer: 'A little daily fortune, just for fun.', retry: 'Try again', error: 'Could not load your fortune. Please try again.', chosen: 'Your card', stale: 'A new day has begun. Draw today’s card.' },
    ko: { title: '오늘의 운세', subtitle: '오늘의 카드 한 장을 골라 보세요', close: '운세 닫기', card: '카드 선택', loading: '카드를 준비하고 있어요…', score: '오늘의 운세 점수', item: '행운의 아이템', disclaimer: '재미로 보는 오늘의 운세', retry: '다시 시도', error: '운세를 불러오지 못했어요. 다시 시도해 주세요.', chosen: '선택한 카드', stale: '새로운 하루가 시작됐어요. 오늘의 카드를 뽑아 보세요.' },
  };
  Object.assign(strings.en, { upright: 'Upright', reversed: 'Reversed' });
  Object.assign(strings.ko, { upright: '정방향', reversed: '역방향' });
  const day = (now = new Date()) => `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const isMorning = (now = new Date()) => now.getHours() >= 6 && now.getHours() < 12;
  const card = (id) => cards.find((entry) => entry.id === id);
  const copy = (language) => strings[language === 'ko' ? 'ko' : 'en'];
  function offer(random = Math.random) {
    const pool = cards.map(({ id }) => id);
    return Array.from({ length: 3 }, () => pool.splice(Math.min(pool.length - 1, Math.floor(random() * pool.length)), 1)[0]);
  }
  function validResult(result, date) {
    const selected = result && card(result.cardId);
    if (!selected || (Object.prototype.hasOwnProperty.call(result, 'reversed') && typeof result.reversed !== 'boolean')) return false;
    const versioned = Object.prototype.hasOwnProperty.call(result, 'scoreVersion');
    if (versioned && result.scoreVersion !== SCORE_VERSION) return false;
    const legacy = legacyScoreRanges[selected.id];
    const range = versioned ? { min: 15, max: 100 } : result.reversed === true ? legacy.reversed : legacy;
    return result.date === date && Number.isInteger(result.slot) && result.slot >= 0 && result.slot < 3 && Number.isInteger(result.score) && result.score >= range.min && result.score <= range.max;
  }
  function dailyState(stored, date = day(), random = Math.random) {
    if (stored && stored.date === date && Array.isArray(stored.offer) && stored.offer.length === 3 && new Set(stored.offer).size === 3 && stored.offer.every(card)) {
      const result = validResult(stored.result, date) ? { ...stored.result, reversed: stored.result.reversed === true } : null;
      return { date, offer: stored.offer, autoShown: stored.autoShown === true, result };
    }
    return { date, offer: offer(random), autoShown: false, result: null };
  }
  function draw(daily, slot, random = Math.random) {
    if (daily.result) return daily;
    if (!Number.isInteger(slot) || slot < 0 || slot > 2) throw new Error('INVALID_SLOT');
    const selected = card(daily.offer[slot]);
    const reversed = random() < 0.5;
    // Direction, score band, and score are independent samples. High:middle:low = 6:3:1.
    const band = random();
    const range = band < 0.6 ? { min: 75, max: 100 } : band < 0.9 ? { min: 45, max: 74 } : { min: 15, max: 44 };
    const score = range.min + Math.min(range.max - range.min, Math.floor(random() * (range.max - range.min + 1)));
    return { ...daily, autoShown: true, result: { date: daily.date, cardId: selected.id, score, slot, reversed, scoreVersion: SCORE_VERSION } };
  }
  const symbols = {
    star: '<path d="M0-20L5-6L20-6L8 3L12 18L0 9L-12 18L-8 3L-20-6L-5-6Z"/>',
    sun: '<circle r="12"/><path d="M0-24V-18M0 18V24M-24 0H-18M18 0H24M-17-17L-13-13M13 13L17 17M-17 17L-13 13M13-13L17-17" fill="none" stroke-width="3"/>',
    moon: '<path d="M9-21A23 23 0 1 0 9 21A20 20 0 0 1 9-21Z"/>',
    heart: '<path d="M0 18C-34-4-14-27 0-12C14-27 34-4 0 18Z"/>',
    flower: '<circle cx="0" cy="-12" r="10"/><circle cx="12" cy="0" r="10"/><circle cx="0" cy="12" r="10"/><circle cx="-12" cy="0" r="10"/><circle r="6" fill="#fff5cd"/>',
    crown: '<path d="M-20-12L-10-3L0-19L10-3L20-12L16 14H-16Z"/>',
    key: '<circle cx="-8" cy="-8" r="10" fill="none" stroke-width="5"/><path d="M0 0L18 18M10 10L16 4M16 16L22 10" fill="none" stroke-width="5"/>',
    wheel: '<circle r="20" fill="none" stroke-width="4"/><circle r="5"/><path d="M0-18V18M-18 0H18M-13-13L13 13M-13 13L13-13" fill="none" stroke-width="3"/>',
    balance: '<path d="M0-21V20M-12 20H12M-20-12H20M-14-12L-22 6H-6ZM14-12L6 6H22Z" fill="none" stroke-width="3"/>',
    cup: '<path d="M-16-17H16V-3Q16 10 0 10Q-16 10-16-3ZM-2 10H2V20H13V23H-13V20H-2Z"/>',
    wand: '<path d="M-15 19L13-16" fill="none" stroke-width="6"/><path d="M15-25L18-19L25-17L18-14L15-7L12-14L5-17L12-19Z"/>',
  };
  // Each character is one square pixel; both the artwork and numerals avoid fonts.
  const pixelSymbols = {
    star: [
      '.....1.....', '.....1.....', '....121....', '....121....', '11111211111',
      '.122222221.', '..1222221..', '...12221...', '..1221221..', '..11...11..', '.1.......1.',
    ],
    sun: [
      '.....1.....', '.1...1...1.', '..1.....1..', '....111....', '...12221...',
      '11.12221.11', '...12221...', '....111....', '..1.....1..', '.1...1...1.', '.....1.....',
    ],
    moon: [
      '....1111...', '..11221....', '.12221.....', '.1221......', '12221......',
      '12221......', '12221......', '.1221......', '.12221....1', '..12221111.', '....1111...',
    ],
    heart: [
      '...........', '..111.111..', '.122112221.', '12222122221', '12222222221',
      '12222222221', '.122222221.', '..1222221..', '...12221...', '....121....', '.....1.....',
    ],
    flower: [
      '....111....', '...12221...', '...12221...', '.111222111.', '12221312221',
      '12213331221', '12221312221', '.111222111.', '...12221...', '...12221...', '....111....',
    ],
    crown: [
      '.....2.....', '.....1.....', '2...111...2', '11..121..11', '12111211121',
      '12222222221', '.122222221.', '.121232121.', '.111111111.', '.122222221.', '.111111111.',
    ],
    key: [
      '..111......', '.12221.....', '12...21....', '12...21....', '12...21....',
      '.12221.....', '..11121....', '.....121.1.', '......12121', '.......121.', '........11.',
    ],
    wheel: [
      '...11111...', '..12.1.21..', '.12..1..21.', '12.1.1.1.21', '1...111...1',
      '11111211111', '1...111...1', '12.1.1.1.21', '.12..1..21.', '..12.1.21..', '...11111...',
    ],
    balance: [
      '.....2.....', '.....1.....', '.111111111.', '..1..1..1..', '.1.1.1.1.1.',
      '1...111...1', '12221112221', '.111.1.111.', '.....1.....', '....121....', '...11111...',
    ],
    cup: [
      '.111111111.', '.122222221.', '.122222221.', '.122232221.', '.122222221.',
      '..1222221..', '...11111...', '....121....', '....121....', '..1121211..', '..1111111..',
    ],
    wand: [
      '.......2...', '.......1...', '.....11111.', '......121..', '.......1...',
      '......12...', '.....12....', '....12.....', '...12......', '..12.......', '.11........',
    ],
  };
  const pixelNumerals = {
    '0': ['111', '101', '101', '101', '111'],
    I: ['111', '010', '010', '010', '111'],
    V: ['101', '101', '101', '101', '010'],
    X: ['101', '101', '010', '101', '101'],
  };
  function pixelGrid(rows, x, y, size, palette) {
    return rows.map((row, rowIndex) => Array.from(row, (value, column) => palette[value]
      ? `<rect x="${x + column * size}" y="${y + rowIndex * size}" width="${size}" height="${size}" fill="${palette[value]}"/>`
      : '').join('')).join('');
  }
  function pixelCard(selected) {
    const palette = { 1: '#e9b96f', 2: '#fff0bb', 3: '#b899d4' };
    const numeral = selected ? Array.from(selected.numeral, (character, index) =>
      pixelGrid(pixelNumerals[character], 40 - (selected.numeral.length * 8 - 2) / 2 + index * 8, 18, 2, { 1: palette[2] })).join('') : '';
    const emblem = selected
      ? `<g data-pixel-symbol="${selected.symbol}">${pixelGrid(pixelSymbols[selected.symbol], 18, 40, 4, palette)}</g>`
      : `${pixelGrid(pixelSymbols.star, 18, 34, 4, palette)}<rect x="16" y="20" width="4" height="4" fill="#b899d4"/><rect x="60" y="20" width="4" height="4" fill="#b899d4"/>`;
    return `<svg viewBox="0 0 80 112" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges" aria-hidden="true"><path d="M4 0H76V4H80V108H76V112H4V108H0V4H4Z" fill="#392c59"/><rect x="4" y="4" width="72" height="104" fill="#e9b96f"/><rect x="8" y="8" width="64" height="96" fill="#73528d"/><rect x="12" y="12" width="56" height="88" fill="#43305f"/>${numeral}${emblem}<rect x="20" y="92" width="12" height="4" fill="#b899d4"/><rect x="36" y="92" width="8" height="4" fill="#e9b96f"/><rect x="48" y="92" width="12" height="4" fill="#b899d4"/></svg>`;
  }
  function cardSVG(id, theme = 'normal') {
    const selected = card(id);
    if (theme === 'pixel') return pixelCard(selected);
    const emblem = selected
      ? `<text x="40" y="25" text-anchor="middle" font-family="Georgia,serif" font-size="12" fill="#ffe8b4">${selected.numeral}</text><g transform="translate(40 62)" fill="#f2cc85" stroke="#f2cc85">${symbols[selected.symbol]}</g>`
      : '<path d="M40 29L45 45L61 51L45 57L40 75L35 57L19 51L35 45Z" fill="#f2cc85"/><circle cx="40" cy="51" r="28" fill="none" stroke="#bc97cf" stroke-width="1"/><circle cx="17" cy="20" r="2" fill="#f2cc85"/><circle cx="63" cy="92" r="2" fill="#f2cc85"/>';
    return `<svg viewBox="0 0 80 112" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect x="1" y="1" width="78" height="110" rx="9" fill="#493563" stroke="#d8b576" stroke-width="2"/><rect x="7" y="7" width="66" height="98" rx="5" fill="#63447f" stroke="#bc97cf"/>${emblem}</svg>`;
  }
  // One queue per background worker serializes the first daily draw across tabs.
  // The harness uses the same service with localStorage adapters.
  function createService({ read, write, isActive = async () => true, now = () => new Date(), random = Math.random }) {
    let queue = Promise.resolve();
    let reservation = null;
    let nextToken = 0;
    const owner = (sender) => sender && sender.tab ? sender.tab.id : 'local';
    const fail = (code) => { const error = new Error(code); error.code = code; throw error; };
    const assertDate = (date) => { if (date !== day(now())) fail('STALE_DATE'); };
    const response = (daily) => ({ ok: true, date: daily.date, result: daily.result, autoShown: daily.autoShown });
    async function execute(message, sender) {
      const date = message.date;
      assertDate(date);
      if (!['load', 'claim', 'shown', 'release', 'draw'].includes(message.action)) fail('INVALID_ACTION');
      if (message.action === 'release') {
        if (reservation && reservation.token === message.token && reservation.owner === owner(sender)) reservation = null;
        return { ok: true, date };
      }
      const stored = await read();
      assertDate(date);
      let daily = dailyState(stored, date, random);
      if (message.action === 'claim') {
        if (!isMorning(now()) || daily.autoShown || daily.result) return { ...response(daily), available: false };
        if (!await isActive(sender)) return { ...response(daily), available: false };
        assertDate(date);
        if (reservation && reservation.date === date && reservation.expires > now().getTime()) return { ...response(daily), available: false };
        reservation = { date, owner: owner(sender), token: `${date}:${++nextToken}:${now().getTime()}`, expires: now().getTime() + 15000 };
        return { ...response(daily), available: true, token: reservation.token };
      }
      if (message.action === 'shown') {
        if (!reservation || reservation.date !== date || reservation.token !== message.token || reservation.owner !== owner(sender) || reservation.expires <= now().getTime()) fail('CLAIM_EXPIRED');
        if (!await isActive(sender)) fail('NOT_ACTIVE');
        assertDate(date);
        daily = { ...daily, autoShown: true };
      }
      if (message.action === 'draw') {
        if (!Number.isInteger(message.slot) || message.slot < 0 || message.slot > 2) fail('INVALID_SLOT');
        daily = draw(daily, message.slot, random);
      }
      assertDate(date);
      if (JSON.stringify(stored) !== JSON.stringify(daily)) await write(daily);
      assertDate(date);
      if (message.action === 'shown' || message.action === 'draw') reservation = null;
      return response(daily);
    }
    function request(message, sender) {
      const work = queue.then(() => execute(message, sender));
      queue = work.catch(() => {});
      return work.catch((error) => ({ ok: false, error: error.code || 'STORAGE_ERROR' }));
    }
    return { request };
  }
  global.PetFortune = { cards, day, isMorning, card, copy, offer, dailyState, draw, validResult, cardSVG, createService };
})(globalThis);
