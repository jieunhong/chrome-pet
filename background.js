/*
 * background service worker.
 * - content script 는 chrome.action 을 쓸 수 없다. Settings 요청을 받아 여기서 팝업을 연다.
 * - 펫 단일 등장: 창을 여러 개 띄워도 "마지막으로 포커스된 창의 활성 탭" 한 곳에만 펫이 있도록
 *   탭/창 포커스가 바뀔 때마다 모든 탭에 presence 를 뿌린다.
 */

importScripts('birthday.js');
importScripts('fortune.js');

const fortuneService = PetFortune.createService({
  read: () => new Promise((resolve, reject) => {
    chrome.storage.local.get(['fortuneDaily'], (stored) => {
      if (chrome.runtime.lastError) reject(new Error(chrome.runtime.lastError.message));
      else resolve(stored.fortuneDaily);
    });
  }),
  write: (fortuneDaily) => new Promise((resolve, reject) => {
    chrome.storage.local.set({ fortuneDaily }, () => {
      if (chrome.runtime.lastError) reject(new Error(chrome.runtime.lastError.message));
      else resolve();
    });
  }),
  isActive: (sender) => new Promise((resolve) => {
    computeActiveTab((tabId) => resolve(!!(sender.tab && sender.tab.id === tabId)));
  }),
});

// Only the service worker initializes dates, including upgrades from older versions.
let birthdayInitialization;
function ensureBirthday() {
  if (!birthdayInitialization) {
    birthdayInitialization = new Promise((resolve, reject) => {
      chrome.storage.local.get(['installedOn', 'petBirthday'], (stored) => {
        if (chrome.runtime.lastError) return reject(new Error(chrome.runtime.lastError.message));
        const patch = PetBirthday.initialValues(stored);
        if (!Object.keys(patch).length) return resolve(stored);
        chrome.storage.local.set(patch, () => {
          if (chrome.runtime.lastError) return reject(new Error(chrome.runtime.lastError.message));
          resolve({ ...stored, ...patch });
        });
      });
    }).finally(() => { birthdayInitialization = null; });
  }
  return birthdayInitialization;
}

chrome.runtime.onInstalled.addListener(() => { ensureBirthday().catch(console.error); });
chrome.runtime.onStartup.addListener(() => { ensureBirthday().catch(console.error); });

function openPopupWindow() {
  chrome.windows.create({
    url: chrome.runtime.getURL('popup.html'),
    type: 'popup',
    width: 600,
    height: 700,
  });
}

// ============ 펫 단일 등장 (presence) ============
function computeActiveTab(callback) {
  chrome.windows.getLastFocused({ windowTypes: ['normal'] }, (win) => {
    if (chrome.runtime.lastError || !win) {
      callback(null);
      return;
    }
    chrome.tabs.query({ active: true, windowId: win.id }, (tabs) => {
      if (chrome.runtime.lastError) {
        callback(null);
        return;
      }
      callback(tabs && tabs[0] ? tabs[0].id : null);
    });
  });
}

function broadcastPresence() {
  computeActiveTab((activeId) => {
    if (activeId == null) return;
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach((tab) => {
        if (tab.id == null || tab.id < 0) return;
        chrome.tabs
          .sendMessage(tab.id, { type: 'PET_PRESENCE', present: tab.id === activeId })
          .catch(() => {
            // content script 가 없는 탭(chrome:// 등)은 무시
          });
      });
    });
  });
}

chrome.tabs.onActivated.addListener(broadcastPresence);
chrome.windows.onFocusChanged.addListener(broadcastPresence);
// 펫이 있던 탭/창이 닫힐 때 onActivated 가 오지 않는 순서도 있어서 직접 재방송한다
chrome.tabs.onRemoved.addListener(broadcastPresence);
chrome.windows.onRemoved.addListener(broadcastPresence);

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (!message) return undefined;

  if (message.type === 'PET_FORTUNE') {
    fortuneService.request(message, sender).then(sendResponse);
    return true;
  }

  if (message.type === 'ENSURE_BIRTHDAY') {
    ensureBirthday().then(sendResponse, () => sendResponse({ error: 'Birthday could not be loaded.' }));
    return true;
  }

  if (message.type === 'OPEN_POPUP') {
    // openPopup 은 Chrome 127 부터다. 없거나 거부되면 작은 창으로 대신 띄운다.
    if (chrome.action && chrome.action.openPopup) {
      chrome.action.openPopup().catch(openPopupWindow);
    } else {
      openPopupWindow();
    }
    return undefined;
  }

  if (message.type === 'PET_PRESENCE_QUERY') {
    computeActiveTab((activeId) => {
      // 활성 탭을 못 알아낸 경우(시작 직후 등)엔 전부 true 로 열어버리지 않고,
      // 최소한 "자기 창의 활성 탭"에게만 허용한다.
      const present = activeId != null
        ? !sender.tab || sender.tab.id === activeId
        : !!(sender.tab && sender.tab.active);
      sendResponse({ present });
    });
    return true; // 비동기 응답
  }

  return undefined;
});
