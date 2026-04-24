(function () {
  if (window.__screenPetLoaded) return;
  window.__screenPetLoaded = true;

  // ============ 상태 변수 및 초기화 ============
  const PET_W = 80;
  const PET_H = 80;
  const GRAVITY = 0.6;

  let currentPet = window.DEFAULT_PET || 'cat';
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

  // ============ 펫 하우스 ============
  const HOUSE_W = 100;
  const HOUSE_H = 100;
  const HOUSE_MARGIN_RIGHT = 20;
  const HOUSE_MARGIN_BOTTOM = 20;

  const homeLeft = () => window.innerWidth - HOUSE_W - HOUSE_MARGIN_RIGHT;
  const homeTop = () => window.innerHeight - HOUSE_H - HOUSE_MARGIN_BOTTOM;
  // 펫이 집 출입구 안쪽에 살짝 보이게 하는 좌표
  const petHomeX = () => homeLeft() + (HOUSE_W - PET_W) / 2;
  const petHomeY = () => homeTop() + HOUSE_H - PET_H + 8;

  // ============ 펫 DOM 생성 ============
  const pet = document.createElement('div');
  pet.id = 'screen-pet';

  function buildPetHTML(petType, name) {
    const svg = (window.PET_SVGS && window.PET_SVGS[petType]) || (window.PET_SVGS && window.PET_SVGS.cat) || '';
    const nameLabel = name ? `<div class="pet-name">${name}</div>` : '';
    return `<div class="pet-inner">${svg}<div class="pet-thought"></div>${nameLabel}</div>`;
  }

  // 초기 펫 설정
  pet.dataset.pet = currentPet;
  pet.innerHTML = buildPetHTML(currentPet, currentName);
  document.body.appendChild(pet);

  // 펫 하우스 DOM
  const house = document.createElement('div');
  house.id = 'pet-house';
  house.title = '펫 하우스 (클릭하여 펫을 안에 재우기)';
  house.innerHTML = window.HOUSE_SVG || '';
  document.body.appendChild(house);

  let thought = pet.querySelector('.pet-thought');

  function setPet(petType) {
    if (!window.PET_SVGS || !window.PET_SVGS[petType]) return;
    if (currentPet === petType && pet.dataset.pet === petType && pet.querySelector('.pet-inner')) {
      // 이미 해당 펫이면 말풍선만 띄우기
      showThought('hi! 👋');
      return;
    }

    currentPet = petType;
    pet.dataset.pet = petType;
    pet.innerHTML = buildPetHTML(petType, currentName);
    // 다시 참조 잡기
    thought = pet.querySelector('.pet-thought');
    showThought('hi! 👋');
  }

  function setName(name) {
    currentName = name;
    pet.innerHTML = buildPetHTML(currentPet, currentName);
    // 다시 참조 잡기
    thought = pet.querySelector('.pet-thought');
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
      // 집 왼쪽 옆으로 살짝 빠져나오기
      x = Math.max(20, homeLeft() - PET_W - 10);
      y = groundY();
      showThought('hi! 👋');
    }
  }

  // storage 에서 펫 타입 및 이름 읽어오기 및 리스너 등록
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    chrome.storage.local.get(['pet', 'petName', 'atHome'], (result) => {
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

  function getThoughts(category) {
    const petThoughts = PET_THOUGHTS[currentPet] || PET_THOUGHTS.cat;
    const list = petThoughts[category] || petThoughts.idle;
    return list[Math.floor(Math.random() * list.length)];
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
    if (isDragging) {
      x = e.clientX - dragOffsetX;
      y = e.clientY - dragOffsetY;
      vx = 0;
      vy = 0;

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

  // 집 클릭으로 토글
  house.addEventListener('click', (e) => {
    e.stopPropagation();
    e.preventDefault();
    const next = !isAtHome;
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      // storage 에 쓰면 onChanged 리스너가 setAtHome 을 호출
      chrome.storage.local.set({ atHome: next });
    } else {
      setAtHome(next);
    }
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
    // 집 영역(우측 하단)을 가급적 피해서 배회한다
    const safeMax = Math.max(margin + 50, homeLeft() - PET_W - 10);
    targetX = margin + Math.random() * (safeMax - margin);
  }

  function chooseNextAction() {
    const r = Math.random();
    if (r < 0.3) {
      state = 'walking';
      pickRandomTarget();
      stateTimer = 300;
    } else if (r < 0.5) {
      state = 'running';
      pickRandomTarget();
      stateTimer = 180;
    } else if (r < 0.7) {
      state = 'jumping';
      vy = -11 - Math.random() * 3;
      vx = (Math.random() - 0.5) * 6;
      stateTimer = 80;
      if (Math.random() < 0.3) showThought();
    } else if (r < 0.85) {
      state = 'sitting';
      stateTimer = 200 + Math.random() * 200;
    } else if (r < 0.93) {
      state = 'dancing';
      stateTimer = 150;
      showThought('♪');
    } else if (r < 0.98) {
      state = 'sleeping';
      stateTimer = 600 + Math.random() * 600; // 오래 잠
      showThought('zzZ');
    } else {
      state = 'idle';
      stateTimer = 100 + Math.random() * 100;
    }
  }

  // ============ 메인 루프 ============
  function update() {
    stateTimer--;

    if (isAtHome) {
      // 집 안에서 가만히 자기. 창 크기 변경에도 위치 재고정.
      x = petHomeX();
      y = petHomeY();
      vx = 0;
      vy = 0;
      state = 'sleeping';

      if (Math.random() < 0.015) createZzz();

      pet.style.transform = `translate(${x}px, ${y}px)`;
      pet.style.setProperty('--x', `${x}px`);
      pet.style.setProperty('--y', `${y}px`);
      pet.style.setProperty('--facing', facing);
      pet.dataset.state = 'sleeping';
      const innerHome = pet.querySelector('.pet-inner');
      if (innerHome) innerHome.style.transform = `scaleX(${facing}) scale(0.55)`;

      requestAnimationFrame(update);
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
          stateTimer = 60 + Math.random() * 120;
        } else {
          vx = Math.sign(dx) * 1.8;
          facing = Math.sign(dx);
        }
      } else if (state === 'running') {
        const dx = targetX - x;
        if (Math.abs(dx) < 3 || stateTimer <= 0) {
          state = 'idle';
          stateTimer = 30 + Math.random() * 60;
        } else {
          vx = Math.sign(dx) * 4.5;
          facing = Math.sign(dx);
        }
      } else if (state === 'chasing') {
        const dx = targetX - x;
        if (Math.abs(dx) < 10) {
          state = 'idle';
          stateTimer = 40;
          if (Math.random() < 0.5) showThought();
        } else {
          vx = Math.sign(dx) * 5.5;
          facing = Math.sign(dx);
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

    pet.style.transform = `translate(${x}px, ${y}px)`;
    // CSS 애니메이션용 변수 주입
    pet.style.setProperty('--x', `${x}px`);
    pet.style.setProperty('--y', `${y}px`);
    pet.style.setProperty('--facing', facing);

    const inner = pet.querySelector('.pet-inner');
    if (inner) inner.style.transform = `scaleX(${facing})`;
    pet.dataset.state = state;

    requestAnimationFrame(update);
  }

  update();

  window.addEventListener('resize', () => {
    if (y > groundY()) y = groundY();
    if (x > window.innerWidth - PET_W) x = window.innerWidth - PET_W;
  });

  setTimeout(() => showThought('hi! 👋'), 500);
})();
