(function () {
  if (window.__screenPetLoaded) return;
  window.__screenPetLoaded = true;

  // ============ 상태 변수 및 초기화 ============
  const PET_W = 80;
  const PET_H = 80;
  const GRAVITY = 0.6;

  let currentPet = window.DEFAULT_PET || 'cat';
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

  // ============ 펫 DOM 생성 ============
  const pet = document.createElement('div');
  pet.id = 'screen-pet';

  function buildPetHTML(petType) {
    const svg = (window.PET_SVGS && window.PET_SVGS[petType]) || (window.PET_SVGS && window.PET_SVGS.cat) || '';
    return `<div class="pet-inner">${svg}<div class="pet-thought"></div></div>`;
  }

  // 초기 펫 설정
  pet.dataset.pet = currentPet;
  pet.innerHTML = buildPetHTML(currentPet);
  document.body.appendChild(pet);

  let thought = pet.querySelector('.pet-thought');

  function setPet(petType) {
    if (!window.PET_SVGS || !window.PET_SVGS[petType]) return;
    if (currentPet === petType && pet.dataset.pet === petType && pet.querySelector('.pet-inner')) {
      // 이미 해당 펫이면 말풍선만 띄우기
      showThought('안녕!');
      return;
    }

    currentPet = petType;
    pet.dataset.pet = petType;
    pet.innerHTML = buildPetHTML(petType);
    // 다시 참조 잡기
    thought = pet.querySelector('.pet-thought');
    showThought('안녕!');
  }

  // storage 에서 펫 타입 읽어오기 및 리스너 등록
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    chrome.storage.local.get(['pet'], (result) => {
      if (result.pet) {
        setPet(result.pet);
      }
    });

    // 팝업에서 storage 변경 시 실시간 반영
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area === 'local' && changes.pet) {
        setPet(changes.pet.newValue);
      }
    });
  }

  // 메시지 통신을 통한 실시간 반영 (fallback)
  if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
    chrome.runtime.onMessage.addListener((message) => {
      if (message.type === 'CHANGE_PET' && message.petType) {
        setPet(message.petType);
      }
    });
  }

  const thoughts = ['냥~', '♡', '와~', '!', '쮸', '헷'];
  function showThought(text) {
    if (!thought) return;
    thought.textContent = text || thoughts[Math.floor(Math.random() * thoughts.length)];
    thought.classList.add('show');
    setTimeout(() => {
      if (thought) thought.classList.remove('show');
    }, 1500);
  }

  const groundY = () => window.innerHeight - PET_H - 10;

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
    }
  }, { passive: true });

  pet.addEventListener('mousedown', (e) => {
    if (e.button !== 0) return;
    isDragging = true;
    dragOffsetX = e.clientX - x;
    dragOffsetY = e.clientY - y;
    pet.classList.add('dragging');
    state = 'held';
    showThought('?!');
    e.preventDefault();
  });

  document.addEventListener('mouseup', () => {
    if (isDragging) {
      isDragging = false;
      pet.classList.remove('dragging');
      state = 'falling';
      vy = 0;
    }
  });

  // 더블클릭: 반가워하며 점프
  pet.addEventListener('dblclick', (e) => {
    state = 'jumping';
    vy = -14;
    vx = 0;
    showThought('♡');
    e.preventDefault();
  });

  // 우클릭: 펫 숨기기/보이기
  pet.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    pet.classList.toggle('hidden');
  });

  // ============ 상태 전이 ============
  function pickRandomTarget() {
    const margin = 40;
    targetX = margin + Math.random() * (window.innerWidth - PET_W - margin * 2);
  }

  function chooseNextAction() {
    const r = Math.random();
    if (r < 0.35) {
      state = 'walking';
      pickRandomTarget();
      stateTimer = 300;
    } else if (r < 0.6) {
      state = 'running';
      pickRandomTarget();
      stateTimer = 180;
    } else if (r < 0.8) {
      state = 'jumping';
      vy = -11 - Math.random() * 3;
      vx = (Math.random() - 0.5) * 6;
      stateTimer = 80;
      if (Math.random() < 0.3) showThought();
    } else if (r < 0.92) {
      state = 'sitting';
      stateTimer = 200 + Math.random() * 200;
    } else {
      state = 'idle';
      stateTimer = 100 + Math.random() * 100;
    }
  }

  // ============ 메인 루프 ============
  function update() {
    stateTimer--;

    if (!isDragging) {
      const cursorActive = Date.now() - lastMouseMoveTime < 800;
      const cursorLow = mouseY > window.innerHeight - 220;
      const cursorDist = mouseX - (x + PET_W / 2);
      const cursorAbsDist = Math.abs(cursorDist);

      if (
        cursorActive && cursorLow &&
        cursorAbsDist < 400 && cursorAbsDist > 30 &&
        state !== 'jumping' && state !== 'falling'
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
      } else if (state === 'jumping' || state === 'falling') {
        vy += GRAVITY;
        if (y >= groundY() && vy > 0) {
          y = groundY();
          vy = 0;
          vx = 0;
          state = 'idle';
          stateTimer = 40;
        }
      }

      x += vx;
      y += vy;

      if (state !== 'jumping' && state !== 'falling' && state !== 'held') {
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

    pet.style.transform = `translate(${x}px, ${y}px)`;
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

  setTimeout(() => showThought('안녕!'), 500);
})();
