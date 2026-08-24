(function () {
  /*
   * 후원 링크. PayPal.Me 주소나 PayPal 기부 버튼 URL 을 넣으면 팝업 하단에 나온다.
   *   예) https://paypal.me/<본인아이디>
   *       https://www.paypal.com/donate/?hosted_button_id=<버튼ID>
   *
   * 확장 페이지는 script-src 'self' 라 PayPal JS SDK 는 못 쓴다.
   * 링크는 스크립트를 안 불러오므로 제약이 없다.
   *
   * 비워두면 링크 자체가 렌더되지 않는다.
   */
  const DONATE_URL = '';

  function mountDonate() {
    if (!DONATE_URL) return;
    const link = document.getElementById('donate');
    link.href = DONATE_URL;
    link.classList.add('on');
  }

  mountDonate();

  const grid = document.getElementById('grid');
  const themeTabs = document.getElementById('themeTabs');
  let currentPet = window.DEFAULT_PET || 'cat';
  let currentTheme = window.DEFAULT_THEME || 'normal';

  const themePets = () => window.PET_THEMES[currentTheme].pets;

  // storage 저장 -> content script 가 onChanged 로 감지.
  // onChanged 가 가끔 안 뜨는 경우가 있어 메시지로도 한 번 더 알린다.
  function broadcast(stored, message, done) {
    if (!chrome || !chrome.storage || !chrome.storage.local) return;
    chrome.storage.local.set(stored, () => {
      chrome.tabs.query({}, (tabs) => {
        tabs.forEach((tab) => {
          if (tab.id) {
            chrome.tabs.sendMessage(tab.id, message).catch(() => {
              // 콘텐츠 스크립트가 없는 탭 등은 무시
            });
          }
        });
      });
      if (done) done();
    });
  }

  function renderThemeTabs() {
    themeTabs.innerHTML = '';
    window.PET_THEME_LIST.forEach((theme) => {
      const tab = document.createElement('button');
      tab.className = 'theme-tab' + (theme === currentTheme ? ' selected' : '');
      tab.textContent = window.PET_THEME_NAMES[theme];
      tab.addEventListener('click', () => selectTheme(theme));
      themeTabs.appendChild(tab);
    });
  }

  function renderCards() {
    const pets = themePets();
    grid.innerHTML = '';
    window.PET_LIST.forEach((petType) => {
      const card = document.createElement('button');
      card.className = 'pet-card' + (petType === currentPet ? ' selected' : '');
      card.dataset.pet = petType;
      card.innerHTML = `
        <div class="check">✓</div>
        ${pets[petType]}
        <div class="name">${window.PET_NAMES[petType]}</div>
      `;
      card.addEventListener('click', () => selectPet(petType));
      grid.appendChild(card);
    });
  }

  function selectTheme(theme) {
    if (theme === currentTheme) return;
    currentTheme = theme;
    renderThemeTabs();
    renderCards();
    broadcast({ theme }, { type: 'CHANGE_THEME', theme });
  }

  function selectPet(petType) {
    currentPet = petType;
    document.querySelectorAll('.pet-card').forEach((c) => {
      c.classList.toggle('selected', c.dataset.pet === petType);
    });
    broadcast({ pet: petType }, { type: 'CHANGE_PET', petType });
  }

  const nameInput = document.getElementById('petNameInput');
  const saveNameBtn = document.getElementById('saveNameBtn');

  function savePetName() {
    const name = nameInput.value.trim();
    broadcast({ petName: name }, { type: 'CHANGE_NAME', name }, () => alert('Name saved! 🐾'));
  }

  saveNameBtn.addEventListener('click', savePetName);
  nameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') savePetName();
  });

  // 저장된 값 불러와서 초기 렌더
  if (chrome && chrome.storage && chrome.storage.local) {
    chrome.storage.local.get(['pet', 'petName', 'theme'], (result) => {
      if (result.pet) currentPet = result.pet;
      if (result.petName) nameInput.value = result.petName;
      if (result.theme && window.PET_THEMES[result.theme]) currentTheme = result.theme;
      renderThemeTabs();
      renderCards();
    });
  } else {
    renderThemeTabs();
    renderCards();
  }
})();
