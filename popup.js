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
  const DONATE_URL = 'https://paypal.me/hongbbubbu';

  function mountDonate() {
    if (!DONATE_URL) return;
    const link = document.getElementById('donate');
    link.href = DONATE_URL;
    link.classList.add('on');
  }

  mountDonate();

  const grid = document.getElementById('grid');
  const houseGrid = document.getElementById('houseGrid');
  const themeTabs = document.getElementById('themeTabs');
  let currentPet = window.DEFAULT_PET || 'cat';
  let currentTheme = window.DEFAULT_THEME || 'normal';
  let currentHouse = window.DEFAULT_HOUSE || 'cushion';

  const themePets = () => window.PET_THEMES[currentTheme].pets;
  const themeHouses = () => window.PET_THEMES[currentTheme].houses || {};

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

  function renderHouseCards() {
    const houses = themeHouses();
    houseGrid.innerHTML = '';
    (window.HOUSE_STYLE_LIST || []).forEach((styleKey) => {
      const card = document.createElement('button');
      card.className = 'pet-card' + (styleKey === currentHouse ? ' selected' : '');
      card.dataset.house = styleKey;
      card.innerHTML = `
        <div class="check">✓</div>
        ${houses[styleKey] || ''}
        <div class="name">${window.HOUSE_STYLES[styleKey].name}</div>
      `;
      card.addEventListener('click', () => selectHouse(styleKey));
      houseGrid.appendChild(card);
    });
  }

  function selectHouse(styleKey) {
    currentHouse = styleKey;
    houseGrid.querySelectorAll('.pet-card').forEach((c) => {
      c.classList.toggle('selected', c.dataset.house === styleKey);
    });
    broadcast({ houseStyle: styleKey }, { type: 'CHANGE_HOUSE', house: styleKey });
  }

  function selectTheme(theme) {
    if (theme === currentTheme) return;
    currentTheme = theme;
    renderThemeTabs();
    renderCards();
    renderHouseCards();
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

  const birthdayInput = document.getElementById('petBirthdayInput');
  const saveBirthdayBtn = document.getElementById('saveBirthdayBtn');
  const birthdayStatus = document.getElementById('birthdayStatus');

  function saveBirthday() {
    const birthday = birthdayInput.value;
    if (!PetBirthday.isValidDate(birthday) || !birthdayInput.checkValidity()) {
      birthdayStatus.textContent = 'Choose a valid birthday.';
      birthdayInput.reportValidity();
      return;
    }
    saveBirthdayBtn.disabled = true;
    chrome.storage.local.set({ petBirthday: birthday }, () => {
      saveBirthdayBtn.disabled = false;
      birthdayStatus.textContent = chrome.runtime.lastError
        ? 'Could not save. Please try again.' : 'Birthday saved! 🎂';
      if (!chrome.runtime.lastError) {
        chrome.tabs.query({}, (tabs) => {
          tabs.forEach((tab) => {
            if (tab.id) chrome.tabs.sendMessage(tab.id, { type: 'CHANGE_BIRTHDAY', birthday }).catch(() => {});
          });
        });
      }
    });
  }

  saveBirthdayBtn.addEventListener('click', saveBirthday);
  birthdayInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && !saveBirthdayBtn.disabled) saveBirthday();
  });
  chrome.runtime.sendMessage({ type: 'ENSURE_BIRTHDAY' }, (result) => {
    if (chrome.runtime.lastError || !result || result.error) {
      birthdayStatus.textContent = 'Could not load birthday. Reopen settings to retry.';
      return;
    }
    birthdayInput.value = result.petBirthday;
    birthdayInput.disabled = false;
    saveBirthdayBtn.disabled = false;
    birthdayStatus.textContent = 'Defaults to installation day. Celebrate every year!';
  });

  const languageSelect = document.getElementById('petLanguageSelect');
  const languageStatus = document.getElementById('languageStatus');
  let savedLanguage = 'auto';
  let languageValueReceived = false;
  const restorePetBtn = document.getElementById('restorePetBtn');
  const restorePetStatus = document.getElementById('restorePetStatus');
  let hiddenUntil = 0;
  let hiddenLoaded = false;
  let hiddenValueReceived = false;
  let hiddenRevision = 0;
  let restoring = false;
  let restoreNotice = '';
  let restoreTimer = 0;

  function renderRestorePet() {
    const ko = PetLanguage.resolve(savedLanguage) === 'ko';
    const hidden = hiddenUntil > Date.now();
    const copy = ko ? {
      button: '펫 즉시 복구', loading: '숨김 상태 확인 중…', saving: '펫을 복구하는 중…',
      hidden: '숨김 시간을 취소하고 펫을 다시 표시해요.', visible: '시간 지정 숨김이 꺼져 있어요.',
      restored: '숨김을 해제했어요. 활성 탭에서 펫을 만나요!',
      failed: '복구하지 못했어요. 다시 눌러 주세요.', loadError: '상태 확인에 실패했어요. 복구를 눌러 주세요.',
    } : {
      button: 'Restore pet now', loading: 'Loading visibility…', saving: 'Restoring your pet…',
      hidden: 'Cancel timed hiding and bring your pet back.', visible: 'Timed hiding is off.',
      restored: 'Hiding cleared. See your pet on the active tab!',
      failed: 'Could not restore. Please try again.', loadError: 'Could not load status. Try restoring your pet.',
    };
    restorePetBtn.textContent = copy.button;
    restorePetBtn.disabled = restoring || !hiddenLoaded || (!hidden && !['loadError', 'failed'].includes(restoreNotice));
    restorePetStatus.textContent = !hiddenLoaded ? copy.loading
      : restoring ? copy.saving : copy[restoreNotice] || (hidden ? copy.hidden : copy.visible);
    clearTimeout(restoreTimer);
    if (hidden) restoreTimer = setTimeout(() => {
      if (hiddenUntil <= Date.now()) restoreNotice = '';
      renderRestorePet();
    }, Math.min(hiddenUntil - Date.now() + 10, 2147483647));
  }

  restorePetBtn.addEventListener('click', () => {
    if (restorePetBtn.disabled || restoring) return;
    restoring = true;
    restoreNotice = '';
    const revision = hiddenRevision;
    renderRestorePet();
    chrome.storage.local.set({ petHiddenUntil: 0 }, () => {
      restoring = false;
      if (chrome.runtime.lastError) {
        restoreNotice = 'failed';
      } else {
        if (hiddenRevision === revision) hiddenUntil = 0;
        hiddenValueReceived = true;
        restoreNotice = hiddenUntil > Date.now() ? '' : 'restored';
      }
      renderRestorePet();
    });
  });

  function showLanguagePreference(value) {
    savedLanguage = PetLanguage.normalizePreference(value);
    languageSelect.value = savedLanguage;
    languageStatus.textContent = PetLanguage.resolve(savedLanguage) === 'ko'
      ? '펫이 한국어로 말해요.' : 'Your pet speaks English.';
    renderRestorePet();
  }

  languageSelect.addEventListener('change', () => {
    const preference = PetLanguage.normalizePreference(languageSelect.value);
    languageSelect.disabled = true;
    languageStatus.textContent = 'Saving… / 저장 중…';
    chrome.storage.local.set({ petLanguage: preference }, () => {
      languageSelect.disabled = false;
      if (chrome.runtime.lastError) {
        languageSelect.value = savedLanguage;
        languageStatus.textContent = 'Could not save. Please try again. / 저장하지 못했어요. 다시 시도해 주세요.';
        return;
      }
      languageValueReceived = true;
      showLanguagePreference(preference);
      chrome.tabs.query({}, (tabs) => {
        if (chrome.runtime.lastError || !tabs) return;
        tabs.forEach((tab) => {
          if (tab.id) chrome.tabs.sendMessage(tab.id, { type: 'CHANGE_LANGUAGE', language: preference }).catch(() => {});
        });
      });
    });
  });

  if (chrome.storage.onChanged) chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'local' && changes.petHiddenUntil) {
      hiddenValueReceived = true;
      hiddenLoaded = true;
      hiddenRevision++;
      hiddenUntil = Number.isFinite(changes.petHiddenUntil.newValue) ? changes.petHiddenUntil.newValue : 0;
      restoreNotice = '';
      renderRestorePet();
    }
    if (area === 'local' && changes.houseStyle) {
      const style = changes.houseStyle.newValue;
      currentHouse = window.HOUSE_STYLES[style] ? style : window.DEFAULT_HOUSE;
      renderHouseCards();
    }
    if (area === 'local' && changes.petLanguage) {
      languageValueReceived = true;
      showLanguagePreference(changes.petLanguage.newValue);
    }
  });

  // 저장된 값 불러와서 초기 렌더
  if (chrome && chrome.storage && chrome.storage.local) {
    chrome.storage.local.get(['pet', 'petName', 'theme', 'houseStyle', 'petLanguage', 'petHiddenUntil'], (result) => {
      if (chrome.runtime.lastError || !result) {
        if (!hiddenValueReceived) {
          hiddenLoaded = true;
          restoreNotice = 'loadError';
          renderRestorePet();
        }
        languageStatus.textContent = 'Could not load language. Reopen settings to retry.';
        renderThemeTabs();
        renderCards();
        renderHouseCards();
        return;
      }
      if (!hiddenValueReceived) {
        hiddenUntil = Number.isFinite(result.petHiddenUntil) ? result.petHiddenUntil : 0;
        hiddenLoaded = true;
      }
      if (!languageValueReceived) showLanguagePreference(result.petLanguage);
      renderRestorePet();
      languageSelect.disabled = false;
      if (result.pet) currentPet = result.pet;
      if (result.petName) nameInput.value = result.petName;
      if (result.theme && window.PET_THEMES[result.theme]) currentTheme = result.theme;
      if (result.houseStyle && window.HOUSE_STYLES[result.houseStyle]) currentHouse = result.houseStyle;
      renderThemeTabs();
      renderCards();
      renderHouseCards();
    });
  } else {
    renderThemeTabs();
    renderCards();
    renderHouseCards();
  }
})();
