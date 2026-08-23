(function () {
  if (window.__screenPetLoaded) return;
  window.__screenPetLoaded = true;

  // ============ 상태 변수 및 초기화 ============
  const PET_W = 80;
  const PET_H = 80;
  const GRAVITY = 0.6;

  let currentPet = window.DEFAULT_PET || 'cat';
  let currentTheme = window.DEFAULT_THEME || 'normal';
  let currentName = '';
  let x = window.innerWidth - PET_W - 40;
  let y = window.innerHeight - PET_H - 10;
  let vx = 0;
  let vy = 0;
  let facing = -1; // -1: 왼쪽, 1: 오른쪽
  let state = 'idle';
  let stateTimer = 60;
  let targetX = x;
  let mouseX = -1000;
  let mouseY = -1000;
  let isDragging = false;
  let dragOffsetX = 0;
  let dragOffsetY = 0;
  let lastMouseMoveTime = 0;
  let isAtHome = false;
  let isDevToolsOpen = false;

  // ============ 펫 방석 (Cushion) ============
  const CUSHION_W = 100;
  const CUSHION_H = 100;
  const CUSHION_MARGIN_RIGHT = 20;
  const CUSHION_MARGIN_BOTTOM = 20;

  // 사용자가 지정한 방석 위치(왼쪽 기준 px). 저장값은 그대로 두고 화면에 그릴 때만 clamp 한다.
  let cushionX = window.innerWidth - CUSHION_W - CUSHION_MARGIN_RIGHT;

  const homeLeft = () => Math.min(Math.max(cushionX, 0), window.innerWidth - CUSHION_W);
  const homeTop = () => window.innerHeight - CUSHION_H - CUSHION_MARGIN_BOTTOM;
  // 펫(80)을 방석(100) 가운데에 놓는다
  const petHomeX = () => homeLeft() + (CUSHION_W - PET_W) / 2;
  const petHomeY = () => homeTop() + 85 - PET_H; // 이전의 안정적인 중앙 좌표로 복구

  // ============ 펫 DOM 생성 ============
  const pet = document.createElement('div');
  pet.id = 'screen-pet';
  let thought = null;

  function themeAssets() {
    const themes = window.PET_THEMES;
    return (themes && (themes[currentTheme] || themes.normal)) || { pets: {}, house: '' };
  }

  function buildPetHTML(petType, name) {
    const pets = themeAssets().pets;
    const svg = pets[petType] || pets.cat || '';
    const nameLabel = name ? `<div class="pet-name">${name}</div>` : '';
    return `<div class="pet-inner">${svg}<div class="pet-thought"></div>${nameLabel}</div>`;
  }

  // innerHTML 을 갈아끼우면 말풍선 노드도 새로 생기므로 참조를 매번 다시 잡는다
  function renderPet() {
    pet.dataset.pet = currentPet;
    pet.dataset.theme = currentTheme;
    pet.innerHTML = buildPetHTML(currentPet, currentName);
    thought = pet.querySelector('.pet-thought');
  }

  renderPet();
  document.body.appendChild(pet);

  // 펫 방석 DOM
  const house = document.createElement('div');
  house.id = 'pet-house';
  house.title = '방석 (클릭: 펫 재우기 / 드래그: 위치 옮기기)';
  document.body.appendChild(house);

  function renderHouse() {
    house.dataset.theme = currentTheme;
    house.innerHTML = themeAssets().house;
  }
  renderHouse();

  function applyCushionPosition() {
    house.style.left = `${homeLeft()}px`;
  }
  applyCushionPosition();

  function setPet(petType) {
    if (!themeAssets().pets[petType]) return;
    if (currentPet !== petType) {
      currentPet = petType;
      renderPet();
    }
    showThought(getGreeting());
  }

  function setName(name) {
    currentName = name;
    renderPet();
  }

  function setTheme(theme) {
    if (!window.PET_THEMES || !window.PET_THEMES[theme] || theme === currentTheme) return;
    currentTheme = theme;
    renderPet();
    renderHouse();
  }

  function setAtHome(value) {
    isAtHome = !!value;
    if (isAtHome) {
      pet.classList.add('at-home');
      // 진행 중이던 드래그/말풍선 정리
      isDragging = false;
      pet.classList.remove('dragging');
      if (thought) thought.classList.remove('show');
      // 펫을 집 안으로 즉시 이동시키고 잠재우기
      x = petHomeX();
      y = petHomeY();
      vx = 0;
      vy = 0;
      state = 'sleeping';
      stateTimer = Number.POSITIVE_INFINITY;
    } else {
      pet.classList.remove('at-home');
      // 집에서 막 깨어나서 일어선다
      state = 'idle';
      stateTimer = 60;
      vx = 0;
      vy = 0;
      // 방석 옆으로 빠져나오기 (왼쪽에 자리가 없으면 오른쪽으로)
      const exitLeft = homeLeft() - PET_W - 10;
      x = exitLeft >= 0
        ? exitLeft
        : Math.min(window.innerWidth - PET_W, homeLeft() + CUSHION_W + 10);
      y = groundY();
      showThought(getGreeting());
    }
  }

  // storage 에서 펫 타입 및 이름 읽어오기 및 리스너 등록
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    chrome.storage.local.get(['pet', 'petName', 'atHome', 'cushionX', 'theme'], (result) => {
      if (typeof result.cushionX === 'number') {
        cushionX = result.cushionX;
        applyCushionPosition();
      }
      if (result.theme) {
        setTheme(result.theme);
      }
      if (result.petName) {
        currentName = result.petName;
        setName(currentName);
      }
      if (result.pet) {
        setPet(result.pet);
      }
      if (result.atHome) {
        setAtHome(true);
      }
    });

    // 팝업에서 storage 변경 시 실시간 반영
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area === 'local') {
        if (changes.cushionX) {
          cushionX = changes.cushionX.newValue;
          applyCushionPosition();
        }
        if (changes.theme) setTheme(changes.theme.newValue);
        if (changes.pet) setPet(changes.pet.newValue);
        if (changes.petName) setName(changes.petName.newValue);
        if (changes.atHome) setAtHome(!!changes.atHome.newValue);
      }
    });
  }

  // 메시지 통신을 통한 실시간 반영 (fallback)
  if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
    chrome.runtime.onMessage.addListener((message) => {
      if (message.type === 'CHANGE_PET' && message.petType) {
        setPet(message.petType);
      } else if (message.type === 'CHANGE_NAME') {
        setName(message.name);
      } else if (message.type === 'CHANGE_THEME' && message.theme) {
        setTheme(message.theme);
      }
    });
  }

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
  };

  // 사용자 로컬 시간 기준. 탭을 오래 켜둬도 시간이 넘어가면 반영되도록 부를 때마다 계산한다.
  function currentTimeSlot() {
    const hour = new Date().getHours();
    if (hour < 5) return 'lateNight';
    if (hour < 11) return 'morning';
    if (hour < 14) return 'noon';
    if (hour < 18) return 'afternoon';
    if (hour < 22) return 'evening';
    return 'night';
  }

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

  const getGreeting = () => TIME_GREETINGS[currentTimeSlot()];

  function getThoughts(category) {
    const petThoughts = PET_THOUGHTS[currentPet] || PET_THOUGHTS.cat;
    const list = petThoughts[category] || petThoughts.idle;
    // 멍하니 있을 때만 시간대 대사를 섞는다. 클릭/추격/댄스 반응은 시간과 무관하다.
    const pool = category === 'idle' ? list.concat(TIME_THOUGHTS[currentTimeSlot()]) : list;
    return pool[Math.floor(Math.random() * pool.length)];
  }

  function showThought(text) {
    if (!thought) return;
    thought.textContent = text || getThoughts('idle');
    thought.classList.add('show');
    setTimeout(() => {
      if (thought) thought.classList.remove('show');
    }, 1500);
  }

  const groundY = () => window.innerHeight - PET_H - 28;

  // ============ 인터랙션 추가 변수 ============
  let mouseDownTime = 0;
  let clickCount = 0;
  let lastClickTime = 0;

  function createHeart(cx, cy) {
    const h = document.createElement('div');
    h.className = 'heart-particle';
    h.textContent = '❤️';
    h.style.left = cx + 'px';
    h.style.top = cy + 'px';
    document.body.appendChild(h);
    setTimeout(() => h.remove(), 800);
  }

  function createZzz() {
    if (state !== 'sleeping') return;
    if (pet.classList.contains('hidden')) return;
    const z = document.createElement('div');
    z.className = 'zzz-particle';
    z.textContent = 'Zzz';
    // 펫 위치 기준으로 생성
    z.style.left = (x + PET_W / 2) + 'px';
    z.style.top = (y) + 'px';
    document.body.appendChild(z);
    setTimeout(() => z.remove(), 3000);
  }

  // ============ 마우스 이벤트 ============
  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    lastMouseMoveTime = Date.now();

    if (isDraggingHouse) {
      cushionX = e.clientX - houseDragOffsetX;
      if (Math.abs(cushionX - houseDragStartX) > CUSHION_DRAG_THRESHOLD) houseDragMoved = true;
      applyCushionPosition();
      return;
    }

    if (isDragging) {
      x = e.clientX - dragOffsetX;
      y = e.clientY - dragOffsetY;
      vx = 0;
      vy = 0;

      // 드래그 방향에 따라 시선 변경
      if (Math.abs(e.movementX) > 1) {
        facing = e.movementX > 0 ? 1 : -1;
      }

      // 드래그 중에도 쓰다듬기 효과 (속도가 빠르면)
      if (Math.abs(e.movementX) + Math.abs(e.movementY) > 10) {
        if (Math.random() < 0.1) createHeart(e.clientX, e.clientY);
      }
    }
  }, { passive: true });

  pet.addEventListener('mousedown', (e) => {
    if (isAtHome) return;
    if (e.button !== 0) return;
    isDragging = true;
    mouseDownTime = Date.now();
    dragOffsetX = e.clientX - x;
    dragOffsetY = e.clientY - y;
    pet.classList.add('dragging');
    state = 'held';
    showThought('?!');
    e.preventDefault();
  });

  // ============ 방석 이동 ============
  const CUSHION_DRAG_THRESHOLD = 4; // 이 이상 움직이면 토글이 아니라 이동으로 본다
  let isDraggingHouse = false;
  let houseDragOffsetX = 0;
  let houseDragStartX = 0;
  let houseDragMoved = false;

  function toggleAtHome() {
    const next = !isAtHome;
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      // storage 에 쓰면 onChanged 리스너가 setAtHome 을 호출
      chrome.storage.local.set({ atHome: next });
    } else {
      setAtHome(next);
    }
  }

  house.addEventListener('mousedown', (e) => {
    if (e.button !== 0) return;
    isDraggingHouse = true;
    houseDragMoved = false;
    houseDragStartX = homeLeft();
    houseDragOffsetX = e.clientX - houseDragStartX;
    house.classList.add('dragging');
    e.preventDefault();
  });

  document.addEventListener('mouseup', () => {
    if (!isDraggingHouse) return;
    isDraggingHouse = false;
    house.classList.remove('dragging');

    if (!houseDragMoved) {
      toggleAtHome();
      return;
    }

    cushionX = homeLeft(); // 창 밖으로 끌고 나간 값은 놓는 시점에 정리
    applyCushionPosition();
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({ cushionX });
    }
  });

  // 드래그 후의 click 이 페이지로 새어나가지 않게 차단
  house.addEventListener('click', (e) => {
    e.stopPropagation();
    e.preventDefault();
  });

  document.addEventListener('mouseup', (e) => {
    if (isDragging) {
      const duration = Date.now() - mouseDownTime;
      isDragging = false;
      pet.classList.remove('dragging');

      if (duration < 200) {
        // 짧은 클릭 인터랙션
        handlePetClick(e.clientX, e.clientY);
      } else {
        state = 'falling';
        vy = 0;
      }
    }
  });

  function handlePetClick(cx, cy) {
    clickCount++;
    const now = Date.now();
    if (now - lastClickTime > 1000) clickCount = 1;
    lastClickTime = now;

    createHeart(cx, cy);

    if (clickCount >= 3) {
      // 3번 연속 클릭: 댄스!
      state = 'dancing';
      stateTimer = 180;
      showThought(getThoughts('dance'));
      clickCount = 0;
    } else {
      // 일반 클릭: 랜덤 반응
      const r = Math.random();
      if (r < 0.3) {
        state = 'shocked';
        stateTimer = 40;
        showThought(getThoughts('click'));
      } else if (r < 0.6) {
        state = 'jumping';
        vy = -12;
        vx = (Math.random() - 0.5) * 8;
        showThought(getThoughts('click'));
      } else {
        showThought('🥰');
        pet.classList.add('petting');
        setTimeout(() => pet.classList.remove('petting'), 1000);
      }
    }
  }

  // 더블클릭: 반가워하며 점프
  pet.addEventListener('dblclick', (e) => {
    if (isAtHome) return;
    state = 'dancing';
    stateTimer = 120;
    showThought('♬');
    e.preventDefault();
  });

  // 우클릭: 펫 숨기기/보이기
  pet.addEventListener('contextmenu', (e) => {
    if (isAtHome) return;
    e.preventDefault();
    pet.classList.toggle('hidden');
  });

  // ============ 상태 전이 ============
  function pickRandomTarget() {
    const margin = 40;
    const maxX = Math.max(margin, window.innerWidth - PET_W - margin);
    let target = margin + Math.random() * (maxX - margin);

    // 목적지가 방석과 겹치면 가까운 쪽 바깥으로 밀어낸다
    const cushionLeft = homeLeft();
    const cushionRight = cushionLeft + CUSHION_W;
    if (target + PET_W > cushionLeft && target < cushionRight) {
      target = target + PET_W / 2 < (cushionLeft + cushionRight) / 2
        ? cushionLeft - PET_W - 10
        : cushionRight + 10;
    }

    targetX = Math.min(maxX, Math.max(margin, target));
  }

  function chooseNextAction() {
    const r = Math.random();
    if (r < 0.2) { // 30% -> 20%
      state = 'walking';
      pickRandomTarget();
      stateTimer = 400; // 300 -> 400
    } else if (r < 0.3) { // 20% -> 10%
      state = 'running';
      pickRandomTarget();
      stateTimer = 250; // 180 -> 250
    } else if (r < 0.4) { // 20% -> 10%
      state = 'jumping';
      vy = -10 - Math.random() * 2; // 조금 덜 뛰게
      vx = (Math.random() - 0.5) * 4;
      stateTimer = 100;
      if (Math.random() < 0.2) showThought();
    } else if (r < 0.7) { // 15% -> 30%
      state = 'sitting';
      stateTimer = 400 + Math.random() * 400; // 더 오래 앉아있음
    } else if (r < 0.8) { // 8% -> 10%
      state = 'dancing';
      stateTimer = 150;
      showThought('♪');
    } else if (r < 0.9) { // 5% -> 10%
      state = 'sleeping';
      stateTimer = 800 + Math.random() * 1000; // 더 깊게 잠
      showThought('zzZ');
    } else { // 2% -> 10%
      state = 'idle';
      stateTimer = 200 + Math.random() * 300; // 더 오래 멍하게
    }
  }

  // ============ 메인 루프 ============
  let rafId = 0;

  function scheduleUpdate() {
    if (rafId) return;
    rafId = requestAnimationFrame(update);
  }

  function update() {
    rafId = 0;
    if (isDevToolsOpen) return; // 개발자도구가 열려 있는 동안은 루프 자체를 멈춘다

    stateTimer--;

    if (isAtHome) {
      // 방석 위에서 가만히 자기. 창 크기 변경에도 위치 재고정.
      x = petHomeX();
      y = petHomeY();
      vx = 0;
      vy = 0;
      state = 'sleeping';

      if (Math.random() < 0.015) createZzz();

      pet.style.setProperty('--x', `${x}px`);
      pet.style.setProperty('--y', `${y}px`);
      pet.style.setProperty('--facing', facing);
      pet.dataset.facing = facing; // 데이터 속성 추가
      pet.dataset.state = 'sleeping';

      scheduleUpdate();
      return;
    }

    if (!isDragging) {
      const cursorActive = Date.now() - lastMouseMoveTime < 800;
      const cursorLow = mouseY > window.innerHeight - 220;
      const cursorDist = mouseX - (x + PET_W / 2);
      const cursorAbsDist = Math.abs(cursorDist);

      if (
        cursorActive && cursorLow &&
        cursorAbsDist < 400 && cursorAbsDist > 30 &&
        ['jumping', 'falling', 'dancing', 'shocked'].indexOf(state) === -1
      ) {
        state = 'chasing';
        targetX = mouseX - PET_W / 2;
        stateTimer = 60;
      }

      if (state === 'idle' || state === 'sitting') {
        vx = 0;
        if (stateTimer <= 0) chooseNextAction();
      } else if (state === 'walking') {
        const dx = targetX - x;
        if (Math.abs(dx) < 3 || stateTimer <= 0) {
          state = 'idle';
          stateTimer = 120 + Math.random() * 120;
        } else {
          vx = dx > 0 ? 1.2 : -1.2;
          facing = dx > 0 ? 1 : -1;
        }
      } else if (state === 'running') {
        const dx = targetX - x;
        if (Math.abs(dx) < 3 || stateTimer <= 0) {
          state = 'idle';
          stateTimer = 60 + Math.random() * 120;
        } else {
          vx = dx > 0 ? 3.2 : -3.2;
          facing = dx > 0 ? 1 : -1;
        }
      } else if (state === 'chasing') {
        const dx = targetX - x;
        if (Math.abs(dx) < 10) {
          state = 'idle';
          stateTimer = 80;
        } else {
          vx = dx > 0 ? 4.0 : -4.0;
          facing = dx > 0 ? 1 : -1;
        }
      } else if (state === 'dancing') {
        vx = 0;
        if (stateTimer <= 0) state = 'idle';
      } else if (state === 'shocked') {
        vx = 0;
        if (stateTimer <= 0) state = 'idle';
      } else if (state === 'jumping' || state === 'falling') {
        vy += GRAVITY;
        if (y >= groundY() && vy > 0) {
          y = groundY();
          vy = 0;
          vx = 0;
          state = 'idle';
          stateTimer = 40;
        }
      } else if (state === 'sleeping') {
        vx = 0;
        if (stateTimer <= 0) state = 'idle';
      }

      x += vx;
      y += vy;

      if (['jumping', 'falling', 'held'].indexOf(state) === -1) {
        if (y < groundY()) {
          vy += GRAVITY;
          y += vy;
          if (y >= groundY()) {
            y = groundY();
            vy = 0;
          }
        } else {
          y = groundY();
          vy = 0;
        }
      }

      if (x < 0) {
        x = 0;
        vx = Math.abs(vx);
        facing = 1;
        if (state === 'walking' || state === 'running') pickRandomTarget();
      }
      if (x > window.innerWidth - PET_W) {
        x = window.innerWidth - PET_W;
        vx = -Math.abs(vx);
        facing = -1;
        if (state === 'walking' || state === 'running') pickRandomTarget();
      }
    }

    // 자는 중 Zzz 파티클 생성
    if (state === 'sleeping' && Math.random() < 0.015) {
      createZzz();
    }

    // CSS 애니메이션용 변수 주입
    pet.style.setProperty('--x', `${x}px`);
    pet.style.setProperty('--y', `${y}px`);
    pet.style.setProperty('--facing', facing);
    pet.dataset.facing = facing; // 데이터 속성 추가

    pet.dataset.state = state;

    scheduleUpdate();
  }

  scheduleUpdate();

  // ============ 개발자도구 감지 ============
  // 브라우저마다 devtools 를 열었을 때의 값이 제각각이라 두 가지 신호를 함께 본다.
  //
  //  (1) 흔한 경우 — 도킹된 devtools 가 뷰포트를 잘라내 outer 와 inner 차이가 크게 벌어진다.
  //  (2) 일부 환경 — 반대로 inner 가 outer 보다 커지는 모순된 값이 나온다.
  //      실측 예) 닫힘 outer 900x1052 / inner 900x931,  열림 outer 118x907 / inner 472x3628
  //      devtools 가 닫혀 있으면 브라우저 크롬 때문에 inner 는 언제나 outer 이하다.
  //
  // 관측 최소값을 기준선으로 삼는 방식은 쓰지 않는다. (2) 의 음수 차이를 기준선이 흡수해서
  // 여닫는 판정이 통째로 뒤집힌다.
  const DEVTOOLS_DELTA_W = 200;
  const DEVTOOLS_DELTA_H = 300;
  const OUTER_TOLERANCE = 4;

  function devToolsLooksOpen() {
    const iw = window.innerWidth;
    const ih = window.innerHeight;
    const ow = window.outerWidth;
    const oh = window.outerHeight;
    if (ow - iw > DEVTOOLS_DELTA_W || oh - ih > DEVTOOLS_DELTA_H) return true;
    return iw > ow + OUTER_TOLERANCE || ih > oh + OUTER_TOLERANCE;
  }

  function syncDevToolsState() {
    const open = devToolsLooksOpen();
    if (open === isDevToolsOpen) return;

    isDevToolsOpen = open;
    pet.classList.toggle('devtools-hidden', open);
    house.classList.toggle('devtools-hidden', open);

    if (open) {
      // 이미 떠 있는 파티클은 펫과 무관하게 남으므로 같이 치운다
      document.querySelectorAll('.zzz-particle, .heart-particle').forEach((el) => el.remove());
      isDragging = false;
      isDraggingHouse = false;
      pet.classList.remove('dragging');
      house.classList.remove('dragging');
    } else {
      scheduleUpdate();
    }
  }

  syncDevToolsState();
  setInterval(syncDevToolsState, 1000);

  window.addEventListener('resize', () => {
    syncDevToolsState();
    applyCushionPosition();
    if (y > groundY()) y = groundY();
    if (x > window.innerWidth - PET_W) x = window.innerWidth - PET_W;
  });

  setTimeout(() => showThought(getGreeting()), 500);
})();
