(function () {
  const grid = document.getElementById('grid');
  let currentPet = window.DEFAULT_PET || 'cat';

  // 카드 생성
  function renderCards() {
    grid.innerHTML = '';
    window.PET_LIST.forEach((petType) => {
      const card = document.createElement('button');
      card.className = 'pet-card' + (petType === currentPet ? ' selected' : '');
      card.dataset.pet = petType;
      card.innerHTML = `
        <div class="check">✓</div>
        ${window.PET_SVGS[petType]}
        <div class="name">${window.PET_NAMES[petType]}</div>
      `;
      card.addEventListener('click', () => selectPet(petType));
      grid.appendChild(card);
    });
  }

  function selectPet(petType) {
    currentPet = petType;
    // UI 업데이트
    document.querySelectorAll('.pet-card').forEach((c) => {
      c.classList.toggle('selected', c.dataset.pet === petType);
    });
    // storage 저장 (content script 에서 onChanged 로 감지해서 실시간 반영)
    if (chrome && chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({ pet: petType }, () => {
        // 메시지로도 알림 (storage onChanged 가끔 안 뜨는 경우 대비)
        chrome.tabs.query({}, (tabs) => {
          tabs.forEach((tab) => {
            if (tab.id) {
              chrome.tabs.sendMessage(tab.id, { type: 'CHANGE_PET', petType }).catch(() => {
                // 특정 탭에서 에러나도 무시 (콘텐츠 스크립트가 없는 탭 등)
              });
            }
          });
        });
      });
    }
  }

  const nameInput = document.getElementById('petNameInput');
  const saveNameBtn = document.getElementById('saveNameBtn');

  function savePetName() {
    const name = nameInput.value.trim();
    if (chrome && chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({ petName: name }, () => {
        // 메시지로 이름 변경 알림
        chrome.tabs.query({}, (tabs) => {
          tabs.forEach((tab) => {
            if (tab.id) {
              chrome.tabs.sendMessage(tab.id, { type: 'CHANGE_NAME', name }).catch(() => { });
            }
          });
        });
        alert('이름이 저장되었습니다!');
      });
    }
  }

  saveNameBtn.addEventListener('click', savePetName);
  nameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') savePetName();
  });

  // 저장된 값 불러와서 초기 렌더
  if (chrome && chrome.storage && chrome.storage.local) {
    chrome.storage.local.get(['pet', 'petName'], (result) => {
      if (result.pet) currentPet = result.pet;
      if (result.petName) nameInput.value = result.petName;
      renderCards();
    });
  } else {
    renderCards();
  }
})();
