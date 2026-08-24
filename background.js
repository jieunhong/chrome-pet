/*
 * content script 는 chrome.action 을 쓸 수 없다.
 * 우클릭 메뉴의 Settings 요청을 받아 여기서 팝업을 연다.
 */
function openPopupWindow() {
  chrome.windows.create({
    url: chrome.runtime.getURL('popup.html'),
    type: 'popup',
    width: 300,
    height: 470,
  });
}

chrome.runtime.onMessage.addListener((message) => {
  if (!message || message.type !== 'OPEN_POPUP') return;

  // openPopup 은 Chrome 127 부터다. 없거나 거부되면 작은 창으로 대신 띄운다.
  if (chrome.action && chrome.action.openPopup) {
    chrome.action.openPopup().catch(openPopupWindow);
  } else {
    openPopupWindow();
  }
});
