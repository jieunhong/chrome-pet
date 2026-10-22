const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');

const source = (name) => fs.readFileSync(path.join(__dirname, '..', name), 'utf8');
const plain = (value) => JSON.parse(JSON.stringify(value));
function load(context, name) { vm.runInContext(source(name), context, { filename: name }); }
function calendar() {
  const context = vm.createContext({});
  load(context, 'birthday.js');
  return context.PetBirthday;
}

test('설치 현지 날짜가 기본 생일이며 저장된 사용자 생일은 보존된다', () => {
  const api = calendar();
  const now = new Date(2026, 9, 22, 0, 5);
  assert.deepEqual(plain(api.initialValues({}, now)), { installedOn: '2026-10-22', petBirthday: '2026-10-22' });
  assert.deepEqual(plain(api.initialValues({ installedOn: '2025-01-12', petBirthday: '2000-05-03' }, now)), {});
  assert.deepEqual(plain(api.initialValues({ installedOn: '2025-01-12' }, now)), { petBirthday: '2025-01-12' });
  assert.deepEqual(plain(api.initialValues({ petBirthday: '2000-05-03' }, now)), { installedOn: '2026-10-22' });
});

test('유효한 윤년 날짜만 저장할 수 있고 생일은 매년 현지 월일로 판정한다', () => {
  const api = calendar();
  for (const value of ['2024-02-29', '2000-02-29', '0001-01-01', '9999-12-31']) assert.equal(api.isValidDate(value), true);
  for (const value of ['', null, '2026-02-29', '1900-02-29', '2026-04-31', '2026-00-01', '2026-13-01', '0000-01-01', '2026-1-01']) assert.equal(api.isValidDate(value), false);
  assert.equal(api.isBirthday('2020-10-22', new Date(2026, 9, 22, 23, 59)), true);
  assert.equal(api.isBirthday('2020-10-22', new Date(2026, 9, 23)), false);
  assert.equal(api.isBirthday('2024-02-29', new Date(2025, 1, 28)), false);
  assert.equal(api.isBirthday('2024-02-29', new Date(2028, 1, 29)), true);
});

function eventSource() {
  const listeners = [];
  return { addListener(fn) { listeners.push(fn); }, fire(...args) { return listeners.map((fn) => fn(...args)); } };
}

test('설치 이벤트와 동시 초기화 요청은 한 번만 저장하고 업데이트는 생일을 덮어쓰지 않는다', async () => {
  const stored = {};
  const pending = [];
  let writes = 0;
  const chrome = {
    runtime: { onInstalled: eventSource(), onStartup: eventSource(), onMessage: eventSource() },
    tabs: { onActivated: eventSource(), onRemoved: eventSource() },
    windows: { onFocusChanged: eventSource(), onRemoved: eventSource() },
    storage: { local: {
      get(keys, callback) { pending.push(() => callback({ ...stored })); },
      set(patch, callback) { writes++; Object.assign(stored, patch); callback(); },
    } },
  };
  const context = vm.createContext({ chrome, console });
  context.importScripts = (name) => load(context, name);
  load(context, 'background.js');
  chrome.runtime.onInstalled.fire({ reason: 'install' });
  const first = new Promise((resolve) => chrome.runtime.onMessage.fire({ type: 'ENSURE_BIRTHDAY' }, {}, resolve));
  const second = new Promise((resolve) => chrome.runtime.onMessage.fire({ type: 'ENSURE_BIRTHDAY' }, {}, resolve));
  assert.equal(pending.length, 1);
  pending.shift()();
  assert.deepEqual(await first, await second);
  assert.equal(writes, 1);
  assert.equal(stored.petBirthday, stored.installedOn);
  stored.petBirthday = '2001-04-05';
  chrome.runtime.onInstalled.fire({ reason: 'update' });
  pending.shift()();
  await Promise.resolve();
  assert.equal(writes, 1);
  assert.equal(stored.petBirthday, '2001-04-05');
});

// Small DOM/event double: tests execute the real content script and inspect its output.
// CSS layout and painting still need visual inspection in a browser.
class Element {
  constructor(tag = 'div') {
    this.tagName = tag;
    this.children = [];
    this.dataset = {};
    this.events = {};
    this.className = '';
    this.style = { setProperty(key, value) { this[key] = value; } };
    this.classList = {
      contains: (name) => this.className.split(/\s+/).includes(name),
      add: (...names) => { this.className = [...new Set([...this.className.split(/\s+/).filter(Boolean), ...names])].join(' '); },
      remove: (...names) => { this.className = this.className.split(/\s+/).filter((name) => !names.includes(name)).join(' '); },
      toggle: (name, force) => {
        const active = force === undefined ? !this.classList.contains(name) : force;
        this.classList[active ? 'add' : 'remove'](name);
        return active;
      },
    };
  }
  setAttribute(name, value) {
    if (name.startsWith('data-')) this.dataset[name.slice(5).replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())] = value;
    else this[name === 'class' ? 'className' : name] = value;
  }
  appendChild(child) { this.children.push(child); child.parentNode = this; return child; }
  remove() { if (this.parentNode) this.parentNode.children = this.parentNode.children.filter((child) => child !== this); }
  set innerHTML(html) {
    this.html = html;
    this.children = [];
    this.insertAdjacentHTML('beforeend', html);
  }
  get innerHTML() { return this.html || ''; }
  insertAdjacentHTML(position, html) {
    const stack = [this];
    for (const match of html.matchAll(/<\/?([\w-]+)\b([^>]*)>/g)) {
      if (match[0].startsWith('</')) { if (stack.length > 1) stack.pop(); continue; }
      const child = new Element(match[1]);
      for (const attr of match[2].matchAll(/([\w-]+)="([^"]*)"/g)) child.setAttribute(attr[1], attr[2]);
      stack.at(-1).appendChild(child);
      if (!match[0].endsWith('/>') && !['input', 'br', 'hr', 'img'].includes(match[1])) stack.push(child);
    }
  }
  matches(selector) {
    return selector.split(',').some((part) => {
      const parts = part.trim().split(/\s+/);
      const name = parts.pop();
      const attribute = name.match(/^\[([\w-]+)(?:="([^"]*)")?\]$/);
      const value = attribute && (attribute[1].startsWith('data-') ? this.dataset[attribute[1].slice(5).replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())] : this[attribute[1]]);
      const ownMatch = attribute ? value !== undefined && (attribute[2] === undefined || value === attribute[2]) : name[0] === '.' ? this.classList.contains(name.slice(1)) : name[0] === '#' ? this.id === name.slice(1) : this.tagName === name;
      return ownMatch && (!parts.length || !!this.parentNode?.closest(parts.join(' ')));
    });
  }
  closest(selector) { return this.matches(selector) ? this : this.parentNode?.closest(selector) || null; }
  querySelectorAll(selector) { return this.children.flatMap((child) => [...(child.matches(selector) ? [child] : []), ...child.querySelectorAll(selector)]); }
  querySelector(selector) { return this.querySelectorAll(selector)[0] || null; }
  addEventListener(type, fn) { (this.events[type] ||= []).push(fn); }
  fire(type, event = {}) {
    for (const fn of this.events[type] || []) fn({ button: 0, clientX: 900, clientY: 700, movementX: 0, movementY: 0, target: this, preventDefault() {}, stopPropagation() {}, ...event });
  }
  contains(node) { return node === this || this.children.some((child) => child.contains(node)); }
  getBoundingClientRect() { return { left: 100, top: 300, width: 208, height: 220 }; }
  focus() { this.focused = true; }
}

function contentHarness(stored = {}, initialTime = new Date(2026, 9, 22, 12).getTime(), options = {}) {
  let now = initialTime;
  let timerId = 0;
  const timers = new Map();
  const frames = new Map();
  const writes = [];
  const messages = [];
  let failNextWrite = false;
  let fortuneService = null;
  class Clock extends Date {
    constructor(...args) { super(...(args.length ? args : [now])); }
    static now() { return now; }
  }
  const schedule = (fn, delay = 0, interval = 0) => {
    const id = ++timerId;
    timers.set(id, { fn, time: now + delay, interval });
    return id;
  };
  const document = new Element('document');
  document.body = document.appendChild(new Element('body'));
  document.createElement = (tag) => new Element(tag);
  document.hidden = false;
  const chrome = {
    storage: { onChanged: options.storageChanges || eventSource(), local: {
      get(keys, callback) {
        const snapshot = { ...stored };
        schedule(() => callback(snapshot), options.initialReadDelay || 0);
      },
      set(patch, callback) {
        writes.push(plain(patch));
        if (failNextWrite) {
          failNextWrite = false;
          chrome.runtime.lastError = { message: 'Storage unavailable' };
          if (callback) callback();
          delete chrome.runtime.lastError;
          return;
        }
        const changes = Object.fromEntries(Object.entries(patch).map(([key, value]) => [key, { oldValue: stored[key], newValue: value }]));
        Object.assign(stored, patch);
        chrome.storage.onChanged.fire(changes, 'local');
        if (callback) callback();
      },
    } },
    runtime: { onMessage: eventSource(), sendMessage(message, callback) {
      messages.push(plain(message));
      if (message.type === 'PET_FORTUNE') {
        if (options.fortuneMessage) { options.fortuneMessage(message, callback); return; }
        if (!fortuneService) fortuneService = context.PetFortune.createService({
          read: async () => stored.fortuneDaily,
          write: (fortuneDaily) => new Promise((resolve, reject) => chrome.storage.local.set({ fortuneDaily }, () => {
            if (chrome.runtime.lastError) reject(new Error('storage unavailable'));
            else resolve();
          })),
          isActive: async () => options.active !== false,
          now: () => new Clock(),
        });
        fortuneService.request(message, { tab: { id: 1 } }).then((result) => callback && callback(result));
        return;
      }
      schedule(() => callback && callback(message.type === 'ENSURE_BIRTHDAY' ? { ...stored } : { present: options.active !== false }));
    } },
  };
  const windowEvents = new Element();
  const context = vm.createContext({
    document, chrome, Date: Clock, console, navigator: { language: options.browserLanguage || 'en-US' },
    innerWidth: 1100, innerHeight: 800, outerWidth: 1100, outerHeight: 880,
    addEventListener: (...args) => windowEvents.addEventListener(...args),
    setTimeout: (fn, delay) => schedule(fn, delay), clearTimeout: (id) => timers.delete(id),
    setInterval: (fn, delay) => schedule(fn, delay, delay), clearInterval: (id) => timers.delete(id),
    requestAnimationFrame: (fn) => { const id = ++timerId; frames.set(id, fn); return id; },
    cancelAnimationFrame: (id) => frames.delete(id),
  });
  context.window = context;
  for (const name of ['pets.js', 'pets-pixel.js', 'language.js', 'birthday.js', 'fortune.js', 'fortune-ui.js', 'content.js']) load(context, name);
  function advance(ms) {
    const end = now + ms;
    for (;;) {
      const next = [...timers.entries()].filter(([, timer]) => timer.time <= end).sort((a, b) => a[1].time - b[1].time)[0];
      if (!next) break;
      const [id, timer] = next;
      now = timer.time;
      timers.delete(id);
      if (timer.interval) timers.set(id, { ...timer, time: now + timer.interval });
      timer.fn();
    }
    now = end;
  }
  advance(0);
  const pet = document.querySelector('#screen-pet');
  return { pet, document, chrome, advance, context, writes, messages,
    async flush() { for (let i = 0; i < 30; i++) { advance(0); await Promise.resolve(); } },
    get pendingFrames() { return frames.size; },
    failNextWrite() { failNextWrite = true; },
    click() { pet.fire('mousedown'); document.fire('mouseup'); },
    frame() { const callbacks = [...frames.values()]; frames.clear(); callbacks.forEach((fn) => fn()); },
    save(patch) { chrome.storage.local.set(patch); },
    focusAt(time) { now = time; windowEvents.fire('focus'); },
    windowEvent(type) { windowEvents.fire(type); },
  };
}

function menuAction(app, action) {
  const menu = app.document.querySelector('#pet-menu');
  const item = menu.querySelector(`[data-action="${action}"]`);
  assert.ok(item, `menu action ${action}`);
  menu.fire('click', { target: item });
  return menu;
}

function restorePopup(app, stored, options = {}) {
  const document = new Element('document');
  document.createElement = (tag) => new Element(tag);
  document.getElementById = (id) => document.querySelector(`#${id}`);
  document.innerHTML = source('popup.html').split('<body>')[1].split('<script')[0];
  const reads = [];
  const writes = [];
  const chrome = {
    ...app.chrome,
    storage: { onChanged: app.chrome.storage.onChanged, local: {
      get(keys, callback) {
        const snapshot = { ...stored };
        if (options.deferRead) reads.push(() => callback(snapshot));
        else callback(snapshot);
      },
      set(patch, callback) {
        const write = () => app.chrome.storage.local.set(patch, callback);
        if (options.deferWrite) writes.push(write);
        else write();
      },
    } },
    tabs: { query(query, callback) { callback([]); } },
  };
  const context = vm.createContext({
    document, chrome, Date: app.context.Date, navigator: { language: 'ko-KR' },
    setTimeout: app.context.setTimeout, clearTimeout: app.context.clearTimeout,
  });
  context.window = context;
  for (const name of ['pets.js', 'pets-pixel.js', 'language.js', 'birthday.js', 'popup.js']) load(context, name);
  app.advance(0);
  return {
    button: document.getElementById('restorePetBtn'),
    status: document.getElementById('restorePetStatus'), reads, writes,
  };
}

test('설정의 즉시 복구는 숨김을 전탭에서 해제하고 활성 탭에만 펫을 다시 표시한다', () => {
  const start = new Date(2026, 9, 22, 12).getTime();
  const stored = { petHiddenUntil: start + 600000 };
  const storageChanges = eventSource();
  const active = contentHarness(stored, start, { storageChanges });
  const inactive = contentHarness(stored, start, { storageChanges, active: false });
  const popup = restorePopup(active, stored, { deferWrite: true });
  assert.equal(popup.button.textContent, '펫 즉시 복구');
  assert.equal(popup.button.disabled, false);
  popup.button.fire('click');
  popup.button.fire('click');
  assert.equal(popup.button.disabled, true);
  assert.equal(popup.writes.length, 1, '저장 중 중복 클릭은 무시한다');
  assert.equal(active.pet.classList.contains('hidden'), true);
  popup.writes.shift()();
  assert.equal(stored.petHiddenUntil, 0);
  assert.equal(active.pet.classList.contains('hidden'), false);
  assert.equal(inactive.pet.classList.contains('away'), true);
  assert.equal(inactive.pendingFrames, 0);
  inactive.chrome.runtime.onMessage.fire({ type: 'PET_PRESENCE', present: true });
  assert.equal(inactive.pet.classList.contains('hidden'), false);
  assert.equal(inactive.pet.classList.contains('away'), false);
  assert.equal(popup.button.disabled, true);
  assert.match(popup.status.textContent, /숨김을 해제/);
  assert.equal(contentHarness(stored, start).pet.classList.contains('hidden'), false);
  active.save({ petLanguage: 'en' });
  assert.equal(popup.button.textContent, 'Restore pet now');
  assert.match(popup.status.textContent, /Hiding cleared/);
});

test('즉시 복구 저장 실패는 기존 숨김을 유지하고 재시도로 복구할 수 있다', () => {
  const start = new Date(2026, 9, 22, 12).getTime();
  const stored = { petHiddenUntil: start + 1800000 };
  const app = contentHarness(stored, start);
  const popup = restorePopup(app, stored);
  app.failNextWrite();
  popup.button.fire('click');
  assert.equal(stored.petHiddenUntil, start + 1800000);
  assert.equal(app.pet.classList.contains('hidden'), true);
  assert.equal(popup.button.disabled, false);
  assert.match(popup.status.textContent, /복구하지 못/);
  popup.button.fire('click');
  assert.equal(stored.petHiddenUntil, 0);
  assert.equal(app.pet.classList.contains('hidden'), false);
  assert.equal(popup.button.disabled, true);
});

test('복구 설정은 늦은 초기 응답보다 최신 숨김 변경을 우선하고 만료되면 버튼을 비활성화한다', () => {
  const start = new Date(2026, 9, 22, 12).getTime();
  const stored = { petHiddenUntil: start + 600000 };
  const app = contentHarness(stored, start);
  const popup = restorePopup(app, stored, { deferRead: true });
  app.save({ petHiddenUntil: 0 });
  popup.reads.shift()();
  assert.equal(popup.button.disabled, true);
  app.save({ petHiddenUntil: start + 1000 });
  assert.equal(popup.button.disabled, false);
  app.advance(1010);
  assert.equal(popup.button.disabled, true);
  assert.match(popup.status.textContent, /숨김이 꺼져/);
});

function chooseHide(app, action = 'hide-10m') {
  app.pet.fire('contextmenu');
  menuAction(app, 'hide');
  return menuAction(app, action);
}

test('숨김 메뉴의 10분·30분·1시간·하루는 정확한 절대 만료 시간을 저장한다', () => {
  const start = new Date(2026, 9, 22, 23, 55).getTime();
  for (const [action, minutes] of [['hide-10m', 10], ['hide-30m', 30], ['hide-1h', 60], ['hide-1d', 1440]]) {
    const stored = {};
    const app = contentHarness(stored, start);
    const menu = chooseHide(app, action);
    const deadline = start + minutes * 60000;
    assert.equal(stored.petHiddenUntil, deadline);
    assert.equal(menu.classList.contains('show'), false);
    assert.equal(app.pet.classList.contains('hidden'), true);
    assert.equal(app.document.querySelector('#pet-house').classList.contains('hidden'), true);
    assert.equal(app.pendingFrames, 0);
    app.focusAt(deadline - 1);
    assert.equal(app.pet.classList.contains('hidden'), true);
    app.focusAt(deadline);
    assert.equal(app.pet.classList.contains('hidden'), false);
    assert.equal(app.pendingFrames, 1);
    assert.equal(stored.petHiddenUntil, deadline, 'expiry must not write back to storage');
    assert.equal(app.writes.length, 1);
  }
});

test('숨김은 탭 간 동기화와 새로고침 후 유지되고 이전 만료가 새 숨김을 덮어쓰지 않는다', () => {
  const start = new Date(2026, 9, 22, 12).getTime();
  const stored = {};
  const storageChanges = eventSource();
  const first = contentHarness(stored, start, { storageChanges });
  const second = contentHarness(stored, start, { storageChanges });
  chooseHide(first);
  assert.equal(second.pet.classList.contains('hidden'), true);
  const reloaded = contentHarness(stored, start + 1000);
  assert.equal(reloaded.pet.classList.contains('hidden'), true);
  second.save({ petHiddenUntil: start + 1800000 });
  first.focusAt(start + 600000);
  assert.equal(first.pet.classList.contains('hidden'), true);
  assert.equal(first.writes.length, 1);
  first.focusAt(start + 1800000);
  assert.equal(first.pet.classList.contains('hidden'), false);
  assert.equal(stored.petHiddenUntil, start + 1800000);
});

test('타이머 만료는 생일 소품을 복구하지 않고 활성 탭에서 수면 상태만 재개한다', () => {
  const app = contentHarness({ atHome: true, petBirthday: '2020-10-22' });
  app.click();
  app.click();
  assert.ok(app.pet.querySelector('.birthday-scene'));
  app.save({ atHome: true });
  chooseHide(app);
  assert.equal(app.pet.querySelector('.birthday-scene'), null);
  assert.equal(app.pet.dataset.state, 'sleeping');
  assert.equal(app.pendingFrames, 0);
  app.advance(600000);
  assert.equal(app.pet.classList.contains('hidden'), false);
  assert.equal(app.pet.dataset.state, 'sleeping');
  assert.equal(app.pet.querySelector('.birthday-scene'), null);
  assert.ok(app.pet.querySelector('.birthday-hat'));
  assert.equal(app.pendingFrames, 1);
});

test('숨김 만료는 비활성 탭·개발자도구·페이지 숨김의 표시 제한을 유지한다', () => {
  const start = new Date(2026, 9, 22, 12).getTime();
  const app = contentHarness({ petHiddenUntil: start + 1000 }, start);
  app.chrome.runtime.onMessage.fire({ type: 'PET_PRESENCE', present: false });
  app.advance(1000);
  assert.equal(app.pet.classList.contains('hidden'), false);
  assert.equal(app.pet.classList.contains('away'), true);
  assert.equal(app.pendingFrames, 0);
  app.chrome.runtime.onMessage.fire({ type: 'PET_PRESENCE', present: true });
  assert.equal(app.pendingFrames, 1);
  app.save({ petHiddenUntil: start + 2000 });
  app.context.outerHeight = 1200;
  app.windowEvent('resize');
  app.advance(1000);
  assert.equal(app.pet.classList.contains('devtools-hidden'), true);
  assert.equal(app.pendingFrames, 0);
  app.context.outerHeight = 880;
  app.windowEvent('resize');
  assert.equal(app.pendingFrames, 1);
  app.save({ petHiddenUntil: start + 3000 });
  app.document.hidden = true;
  app.document.fire('visibilitychange');
  app.advance(1000);
  assert.equal(app.pendingFrames, 0);
  app.document.hidden = false;
  app.document.fire('visibilitychange');
  assert.equal(app.pendingFrames, 1);
});

test('초기 저장값을 읽기 전에는 보이지 않고 늦은 초기 응답이 최신 숨김 변경을 덮지 않는다', () => {
  const start = new Date(2026, 9, 22, 12).getTime();
  const app = contentHarness({ petHiddenUntil: start + 1000 }, start, { initialReadDelay: 100 });
  assert.equal(app.pet.classList.contains('hidden'), true);
  assert.equal(app.document.querySelector('#pet-house').classList.contains('hidden'), true);
  assert.equal(app.pendingFrames, 0);
  app.save({ petHiddenUntil: start + 3600000 });
  app.advance(100);
  app.focusAt(start + 1000);
  assert.equal(app.pet.classList.contains('hidden'), true);
  app.focusAt(start + 3600000);
  assert.equal(app.pet.classList.contains('hidden'), false);
});

test('숨김 저장 실패는 표시 상태를 복구하고 메뉴는 뒤로·Esc·바깥 클릭을 지원한다', () => {
  const app = contentHarness();
  app.pet.fire('contextmenu', { clientX: 1099, clientY: 799 });
  let menu = menuAction(app, 'hide');
  assert.deepEqual(menu.children.map((item) => item.dataset.action), ['back', 'hide-10m', 'hide-30m', 'hide-1h', 'hide-1d']);
  assert.equal(menu.style.left, '884px');
  assert.equal(menu.style.top, '572px');
  assert.equal(menu.querySelector('button').focused, true);
  menuAction(app, 'back');
  assert.ok(menu.querySelector('[data-action="hide"]'));
  assert.equal(menu.querySelector('[data-action="remove"]'), null);
  menuAction(app, 'hide');
  app.document.fire('keydown', { key: 'Escape' });
  assert.equal(menu.classList.contains('show'), false);
  app.pet.fire('contextmenu');
  app.document.fire('mousedown', { target: app.document.body });
  assert.equal(menu.classList.contains('show'), false);
  app.failNextWrite();
  chooseHide(app);
  assert.equal(app.pet.classList.contains('hidden'), false);
  assert.equal(app.document.querySelector('#pet-house').classList.contains('hidden'), false);
  assert.equal(app.pendingFrames, 1);
});

test('숨김은 진행 중인 놀이·먹이·드래그·파티클을 정리하고 페이지 복귀에 만료를 재확인한다', () => {
  const start = new Date(2026, 9, 22, 12).getTime();
  for (const action of ['play', 'feed']) {
    const app = contentHarness({ pet: 'dog' }, start);
    app.pet.fire('contextmenu');
    menuAction(app, action);
    assert.ok(app.document.querySelector(action === 'play' ? '.pet-toy' : '.pet-food'));
    app.pet.fire('mousedown');
    assert.equal(app.pet.classList.contains('dragging'), true);
    const house = app.document.querySelector('#pet-house');
    house.fire('mousedown');
    for (const name of ['zzz-particle', 'heart-particle']) {
      const particle = app.document.createElement('div');
      particle.className = name;
      app.document.body.appendChild(particle);
    }
    app.save({ petHiddenUntil: start + 5000 });
    assert.equal(app.pet.classList.contains('dragging'), false);
    assert.equal(house.classList.contains('dragging'), false);
    assert.equal(app.document.querySelectorAll('.zzz-particle, .heart-particle').length, 0);
    assert.equal(app.document.querySelector('.pet-toy'), null);
    assert.equal(app.document.querySelector('.pet-food'), null);
    assert.equal(app.pet.dataset.state, 'idle');
    assert.equal(app.pendingFrames, 0);
    app.windowEvent('pagehide');
    app.advance(5000);
    assert.equal(app.pet.classList.contains('hidden'), true);
    app.windowEvent('pageshow');
    assert.equal(app.pet.classList.contains('hidden'), false);
    assert.equal(app.pendingFrames, 1);
  }
});

test('모든 펫과 테마에서 모자를 쓰고 클릭하면 케이크가 3초간 나타난다', () => {
  for (const theme of ['normal', 'pixel']) for (const pet of ['cat', 'dog', 'maltese_white', 'hamster', 'dino', 'harp_seal']) {
    const app = contentHarness({ petBirthday: '2020-10-22', pet, theme });
    assert.ok(app.pet.querySelector('.pet-head').querySelector('.birthday-hat'), `${theme}/${pet}`);
    app.click();
    assert.equal(app.pet.dataset.state, 'birthday');
    assert.equal(app.pet.querySelectorAll('.birthday-scene').length, 1);
    assert.equal(app.pet.querySelector('.birthday-scene').querySelector('svg')['shape-rendering'] === 'crispEdges', theme === 'pixel');
    app.advance(1000);
    app.click();
    app.pet.fire('dblclick');
    assert.equal(app.pet.querySelectorAll('.birthday-scene').length, 1);
    app.advance(1999);
    assert.ok(app.pet.querySelector('.birthday-scene'));
    app.advance(1);
    assert.equal(app.pet.querySelector('.birthday-scene'), null);
    assert.equal(app.pet.dataset.state, 'idle');
    assert.ok(app.pet.querySelector('.birthday-hat'));
    app.click();
    assert.ok(app.pet.querySelector('.birthday-scene'));
  }
});

test('해먹 저장값은 양쪽 테마와 탭에서 쿠션으로 표시되고 다른 침대 선택도 유지된다', () => {
  for (const theme of ['normal', 'pixel']) {
    const stored = { houseStyle: 'hammock', atHome: true, theme };
    const storageChanges = eventSource();
    const first = contentHarness(stored, undefined, { storageChanges });
    const second = contentHarness(stored, undefined, { storageChanges });
    for (const app of [first, second]) {
      app.frame();
      const house = app.document.querySelector('#pet-house');
      assert.equal(house.dataset.house, 'cushion');
      assert.equal(house.innerHTML, app.context.PET_THEMES[theme].houses.cushion);
      assert.equal(app.pet.style['--y'], '685px');
      assert.deepEqual(plain(app.context.HOUSE_STYLE_LIST), ['cushion', 'tower', 'basket']);
      assert.equal(app.context.PET_THEMES[theme].houses.hammock, undefined);
    }
    first.save({ houseStyle: 'tower' });
    assert.equal(second.document.querySelector('#pet-house').dataset.house, 'tower');
    first.save({ houseStyle: 'hammock' });
    assert.equal(second.document.querySelector('#pet-house').dataset.house, 'cushion');
    first.save({ houseStyle: 'basket' });
    const reloaded = contentHarness(stored);
    assert.equal(reloaded.document.querySelector('#pet-house').dataset.house, 'basket');
  }
});

test('설정에서 해먹을 제외한 침대 세 개만 표시하고 기존 해먹은 쿠션 선택으로 표시한다', () => {
  const document = new Element('document');
  document.createElement = (tag) => new Element(tag);
  document.getElementById = (id) => document.querySelector(`#${id}`);
  for (const id of ['donate', 'grid', 'houseGrid', 'themeTabs', 'petNameInput', 'saveNameBtn', 'petBirthdayInput', 'saveBirthdayBtn', 'birthdayStatus', 'petLanguageSelect', 'languageStatus', 'restorePetBtn', 'restorePetStatus']) {
    document.appendChild(new Element()).id = id;
  }
  const chrome = {
    runtime: { sendMessage(message, callback) { callback({ petBirthday: '2026-10-22' }); } },
    storage: { onChanged: eventSource(), local: {
      get(keys, callback) { callback({ houseStyle: 'hammock' }); },
      set(patch, callback) { callback(); },
    } },
    tabs: { query(query, callback) { callback([]); } },
  };
  const context = vm.createContext({ document, chrome, setTimeout: () => 0, clearTimeout() {} });
  context.window = context;
  for (const name of ['pets.js', 'pets-pixel.js', 'language.js', 'birthday.js', 'popup.js']) load(context, name);
  const houseGrid = document.getElementById('houseGrid');
  assert.deepEqual(houseGrid.children.map((card) => card.dataset.house), ['cushion', 'tower', 'basket']);
  assert.equal(houseGrid.querySelector('.selected').dataset.house, 'cushion');
  chrome.storage.onChanged.fire({ houseStyle: { newValue: 'tower' } }, 'local');
  assert.equal(houseGrid.querySelector('.selected').dataset.house, 'tower');
  chrome.storage.onChanged.fire({ houseStyle: { newValue: 'hammock' } }, 'local');
  assert.equal(houseGrid.querySelector('.selected').dataset.house, 'cushion');
  document.getElementById('themeTabs').children[1].fire('click');
  assert.equal(houseGrid.children.length, 3);
  assert.equal(houseGrid.querySelector('.selected').dataset.house, 'cushion');
  assert.equal(houseGrid.querySelector('svg')['shape-rendering'], 'crispEdges');
});

test('생일이 아니면 모자나 케이크가 없고 드래그도 축하를 시작하지 않는다', () => {
  const ordinary = contentHarness({ petBirthday: '2020-05-03' });
  ordinary.click();
  assert.equal(ordinary.pet.querySelector('.birthday-hat'), null);
  assert.equal(ordinary.pet.querySelector('.birthday-scene'), null);
  const birthday = contentHarness({ petBirthday: '2020-10-22' });
  birthday.pet.fire('mousedown');
  birthday.document.fire('mousemove', { clientX: 950, movementX: 50 });
  birthday.document.fire('mouseup', { clientX: 950 });
  assert.equal(birthday.pet.querySelector('.birthday-scene'), null);
});

test('생일에 자는 펫은 첫 클릭에 깨고 다음 클릭에 3초간 초를 분다', () => {
  for (const theme of ['normal', 'pixel']) {
    const stored = { petBirthday: '2020-10-22', atHome: true, theme };
    const storageChanges = eventSource();
    const app = contentHarness(stored, undefined, { storageChanges });
    const other = contentHarness(stored, undefined, { storageChanges });
    app.click();
    app.frame();
    other.frame();
    assert.equal(stored.atHome, false);
    assert.equal(app.pet.dataset.state, 'idle');
    assert.equal(other.pet.dataset.state, 'idle');
    assert.equal(app.pet.querySelector('.birthday-scene'), null);
    assert.equal(other.pet.querySelector('.birthday-scene'), null);
    app.click();
    assert.equal(app.pet.dataset.state, 'birthday');
    assert.ok(app.pet.querySelector('.birthday-scene'));
    app.advance(2999);
    assert.ok(app.pet.querySelector('.birthday-scene'));
    app.advance(1);
    assert.equal(app.pet.dataset.state, 'idle');
    assert.equal(app.pet.querySelector('.birthday-scene'), null);
  }
});

test('침대 밖에서 잠든 생일 펫도 첫 클릭에는 깨기만 하고 드래그에는 축하하지 않는다', () => {
  const app = contentHarness({ petBirthday: '2020-10-22' });
  vm.runInContext('Math.random = () => 0.85', app.context);
  for (let i = 0; i < 100; i++) app.frame();
  assert.equal(app.pet.dataset.state, 'sleeping');
  app.click();
  assert.equal(app.pet.dataset.state, 'idle');
  assert.equal(app.pet.querySelector('.birthday-scene'), null);
  app.click();
  assert.ok(app.pet.querySelector('.birthday-scene'));
  app.advance(3000);
  for (let i = 0; i < 100; i++) app.frame();
  assert.equal(app.pet.dataset.state, 'sleeping');
  app.pet.fire('mousedown');
  app.document.fire('mousemove', { clientX: 950, movementX: 50 });
  app.document.fire('mouseup', { clientX: 950 });
  app.frame();
  assert.equal(app.pet.querySelector('.birthday-scene'), null);
  assert.notEqual(app.pet.dataset.state, 'sleeping');
});

test('테마 변경과 숨김은 진행 중인 생일 축하를 정리한다', () => {
  const app = contentHarness({ petBirthday: '2020-10-22' });
  app.click();
  app.save({ theme: 'pixel' });
  assert.equal(app.pet.querySelector('.birthday-scene'), null);
  assert.ok(app.pet.querySelector('.birthday-hat'));
  app.click();
  app.chrome.runtime.onMessage.fire({ type: 'PET_PRESENCE', present: false });
  assert.equal(app.pet.querySelector('.birthday-scene'), null);
  app.chrome.runtime.onMessage.fire({ type: 'PET_PRESENCE', present: true });
  app.click();
  app.document.hidden = true;
  app.document.fire('visibilitychange');
  assert.equal(app.pet.querySelector('.birthday-scene'), null);
});

test('자정과 탭 복귀 시 날짜를 재판정하고 생일 수정은 즉시 반영된다', () => {
  const app = contentHarness({ petBirthday: '2020-10-22' }, new Date(2026, 9, 21, 23, 59, 59).getTime());
  assert.equal(app.pet.querySelector('.birthday-hat'), null);
  app.advance(1020);
  assert.ok(app.pet.querySelector('.birthday-hat'));
  app.click();
  app.save({ petBirthday: '2020-05-03' });
  assert.equal(app.pet.querySelector('.birthday-hat'), null);
  assert.equal(app.pet.querySelector('.birthday-scene'), null);
  app.save({ petBirthday: '2020-10-22' });
  assert.ok(app.pet.querySelector('.birthday-hat'));
  app.focusAt(new Date(2026, 9, 23).getTime());
  assert.equal(app.pet.querySelector('.birthday-hat'), null);
});

test('dev-preview에서 모자 토글과 전체·개별 3초 재생 및 상태 복귀가 동작한다', () => {
  const document = new Element('document');
  document.body = document;
  document.documentElement = new Element('html');
  document.createElement = (tag) => new Element(tag);
  document.getElementById = (id) => document.querySelector(`#${id}`);
  for (const id of ['board', 'variants', 'stateGroup', 'zoomGroup', 'bgGroup', 'birthdayToggle', 'birthdayPlay', 'birthdayPreviewStatus', 'fortunePreviewTheme', 'fortunePreviewLanguage', 'fortunePreviewOrientation', 'fortunePreviewOpen', 'fortunePreviewReset']) {
    const element = document.appendChild(new Element());
    element.id = id;
  }
  let timerId = 0;
  const timers = new Map();
  const context = vm.createContext({ document,
    innerWidth: 1100, innerHeight: 800, addEventListener() {},
    setTimeout(fn, delay) { assert.equal(delay, 3000); timers.set(++timerId, fn); return timerId; },
    clearTimeout(id) { timers.delete(id); },
  });
  context.window = context;
  for (const name of ['pets.js', 'pets-pixel.js', 'language.js', 'birthday.js', 'fortune.js', 'fortune-ui.js']) load(context, name);
  const scripts = [...source('dev-preview.html').matchAll(/<script>([\s\S]*?)<\/script>/g)];
  scripts.forEach((match) => vm.runInContext(match[1], context));
  const pets = document.querySelectorAll('.stage #screen-pet');
  assert.equal(document.getElementById('board').querySelectorAll('#screen-pet').length, 12);
  document.getElementById('birthdayToggle').fire('click');
  pets.forEach((pet) => assert.ok(pet.querySelector('.birthday-hat')));
  document.getElementById('birthdayPlay').fire('click');
  pets.forEach((pet) => {
    assert.equal(pet.dataset.state, 'birthday');
    assert.equal(pet.querySelector('.birthday-scene').querySelector('svg')['shape-rendering'] === 'crispEdges', pet.dataset.theme === 'pixel');
  });
  [...timers.values()].forEach((fn) => fn());
  pets.forEach((pet) => {
    assert.equal(pet.dataset.state, 'idle');
    assert.equal(pet.querySelector('.birthday-scene'), null);
    assert.ok(pet.querySelector('.birthday-hat'));
  });
  const sleeping = document.getElementById('stateGroup').children.find((button) => button.textContent === 'sleeping');
  sleeping.fire('click');
  pets[0].fire('click');
  assert.equal(pets[0].dataset.state, 'idle');
  assert.equal(document.querySelectorAll('.birthday-scene').length, 0);
  pets[0].fire('click');
  assert.equal(document.querySelectorAll('.birthday-scene').length, 1);
  [...timers.values()].forEach((fn) => fn());
  assert.equal(pets[0].dataset.state, 'idle');
  document.getElementById('birthdayToggle').fire('click');
  assert.equal(document.querySelectorAll('.birthday-hat').length, 0);
  document.getElementById('fortunePreviewOpen').fire('click');
  const panel = document.querySelector('.screen-pet-fortune');
  assert.equal(panel.querySelectorAll('.fortune-card').length, 3);
  panel.fire('click', { target: panel.querySelector('[data-fortune-slot="1"]') });
  assert.ok(panel.querySelector('.fortune-result'));
  document.getElementById('fortunePreviewTheme').value = 'pixel';
  document.getElementById('fortunePreviewTheme').fire('change');
  assert.equal(panel.querySelector('svg')['shape-rendering'], 'crispEdges');
  document.getElementById('fortunePreviewLanguage').value = 'ko';
  document.getElementById('fortunePreviewLanguage').fire('change');
  assert.match(panel.innerHTML, /오늘의 운세 점수/);
  document.getElementById('fortunePreviewReset').fire('click');
  assert.equal(panel.querySelectorAll('.fortune-card').length, 3);
  assert.equal(panel.querySelector('.fortune-orientation'), null);
  assert.equal(panel.querySelector('[data-reversed]'), null, 'face-down cards do not reveal a direction');
  const direction = document.getElementById('fortunePreviewOrientation');
  direction.value = 'reversed';
  panel.fire('click', { target: panel.querySelector('[data-fortune-slot="0"]') });
  assert.equal(panel.querySelector('.fortune-selected-card').dataset.reversed, 'true');
  assert.match(panel.innerHTML, /class="fortune-orientation">역방향/);
  const selectedResult = panel.innerHTML;
  direction.value = 'upright';
  direction.fire('change');
  document.getElementById('fortunePreviewOpen').fire('click');
  assert.equal(panel.innerHTML, selectedResult, 'changing the next draw option never rerolls the displayed result');
  document.getElementById('fortunePreviewReset').fire('click');
  panel.fire('click', { target: panel.querySelector('[data-fortune-slot="2"]') });
  assert.equal(panel.querySelector('.fortune-selected-card').dataset.reversed, 'false');
  assert.match(panel.innerHTML, /class="fortune-orientation">정방향/);
});

test('정방향·역방향 결과는 일반·도트와 한국어·영어에서 해당 해석 및 방향을 표시한다', async () => {
  for (const theme of ['normal', 'pixel']) for (const language of ['en', 'ko']) for (const reversed of [false, true]) {
    const result = { date: '2026-10-22', cardId: 'hermit', score: 85, slot: 1, reversed };
    const stored = { theme, petLanguage: language, fortuneDaily: { date: result.date, offer: ['sun', 'hermit', 'star'], autoShown: true, result } };
    const app = contentHarness(stored);
    app.pet.fire('contextmenu');
    menuAction(app, 'fortune');
    await app.flush();
    const panel = app.document.querySelector('.screen-pet-fortune');
    const selected = app.context.PetFortune.card(result.cardId);
    const interpretation = reversed ? selected.reversed[language] : selected[language];
    const direction = app.context.PetFortune.copy(language)[reversed ? 'reversed' : 'upright'];
    assert.equal(panel.querySelector('.fortune-selected-card').dataset.reversed, String(reversed));
    assert.match(panel.innerHTML, new RegExp(`class="fortune-orientation">${direction}`));
    assert.ok(panel.innerHTML.includes(interpretation.item));
    assert.ok(panel.innerHTML.includes(interpretation.reading));
    assert.equal(panel.querySelector('svg')['shape-rendering'] === 'crispEdges', theme === 'pixel');
    assert.deepEqual(plain(stored.fortuneDaily.result), result);
  }
  assert.match(source('fortune.css'), /\.fortune-selected-card\[data-reversed="true"\] svg\s*\{\s*transform:\s*rotate\(180deg\)/);
});

test('아침 운세는 세 장을 한 번만 제안하고 닫기·새로고침 후 자동으로 다시 펼치지 않는다', async () => {
  const morning = new Date(2026, 9, 22, 8).getTime();
  const stored = {};
  const app = contentHarness(stored, morning);
  await app.flush();
  const panel = app.document.querySelector('.screen-pet-fortune');
  assert.ok(panel);
  assert.equal(panel.querySelectorAll('.fortune-card').length, 3);
  assert.equal(stored.fortuneDaily.autoShown, true);
  assert.equal(stored.fortuneDaily.result, null);
  panel.fire('click', { target: panel.querySelector('[data-fortune-close]') });
  app.advance(30000);
  await app.flush();
  assert.equal(app.document.querySelector('.screen-pet-fortune'), null);
  const reload = contentHarness(stored, morning + 31000);
  await reload.flush();
  assert.equal(reload.document.querySelector('.screen-pet-fortune'), null);
  reload.pet.fire('contextmenu');
  menuAction(reload, 'fortune');
  await reload.flush();
  assert.equal(reload.document.querySelectorAll('.fortune-card').length, 3, 'manual draw remains available');
});

test('일반·도트 카드 선택은 점수·아이템·해석을 표시하고 언어 변경과 결과 재열람을 지원한다', async () => {
  for (const theme of ['normal', 'pixel']) {
    const stored = { theme, petLanguage: 'en', petBirthday: '2020-10-22' };
    const app = contentHarness(stored);
    app.pet.fire('contextmenu');
    menuAction(app, 'fortune');
    await app.flush();
    const panel = app.document.querySelector('.screen-pet-fortune');
    let stopped = 0;
    panel.fire('mousedown', { stopPropagation() { stopped++; } });
    panel.fire('mouseup', { stopPropagation() { stopped++; } });
    assert.equal(stopped, 2);
    assert.equal(app.pet.classList.contains('dragging'), false);
    panel.fire('click', { target: panel.querySelector('[data-fortune-slot="2"]') });
    await app.flush();
    const result = plain(stored.fortuneDaily.result);
    assert.equal(result.slot, 2);
    assert.ok(panel.querySelector('.fortune-result'));
    assert.ok(panel.querySelector('.fortune-score'));
    assert.ok(panel.querySelector('.fortune-item'));
    assert.ok(panel.querySelector('.fortune-reading'));
    assert.equal(panel.querySelector('svg')['shape-rendering'] === 'crispEdges', theme === 'pixel');
    assert.match(panel.innerHTML, /Lucky item/);
    assert.ok(app.pet.querySelector('.birthday-hat'));
    app.save({ petLanguage: 'ko' });
    assert.match(panel.innerHTML, /행운의 아이템/);
    assert.deepEqual(plain(stored.fortuneDaily.result), result);
    app.document.fire('keydown', { key: 'Escape' });
    assert.equal(app.document.querySelector('.screen-pet-fortune'), null);
    app.pet.fire('contextmenu');
    menuAction(app, 'fortune');
    await app.flush();
    assert.ok(app.document.querySelector('.fortune-result'));
    assert.deepEqual(plain(stored.fortuneDaily.result), result);
    app.save({ petHiddenUntil: new Date(2026, 9, 22, 13).getTime() });
    assert.equal(app.document.querySelector('.screen-pet-fortune'), null);
  }
});

test('숨김·비활성·개발자도구·생일 애니메이션 중에는 자동 제안 기회를 소모하지 않는다', async () => {
  const morning = new Date(2026, 9, 22, 8).getTime();
  const hidden = { petHiddenUntil: morning + 60000 };
  const app = contentHarness(hidden, morning);
  await app.flush();
  assert.equal(hidden.fortuneDaily, undefined);
  assert.equal(app.document.querySelector('.screen-pet-fortune'), null);
  app.advance(60000);
  await app.flush();
  assert.ok(app.document.querySelector('.screen-pet-fortune'));
  const inactive = {};
  const away = contentHarness(inactive, morning, { active: false });
  await away.flush();
  assert.equal(inactive.fortuneDaily, undefined);
  const devStored = {};
  const dev = contentHarness(devStored, morning);
  dev.context.outerHeight = 1200;
  dev.windowEvent('resize');
  await dev.flush();
  assert.equal(devStored.fortuneDaily, undefined);
  const birthdayStored = { petBirthday: '2020-10-22' };
  const birthday = contentHarness(birthdayStored, morning);
  birthday.click();
  await birthday.flush();
  assert.equal(birthdayStored.fortuneDaily, undefined);
  assert.ok(birthday.pet.querySelector('.birthday-scene'));
  birthday.advance(30000);
  await birthday.flush();
  assert.ok(birthday.document.querySelector('.screen-pet-fortune'));
});

test('운세 저장 실패는 오류와 재시도만 표시하고 다른 탭에서 확정한 결과를 반영한다', async () => {
  const stored = {};
  const app = contentHarness(stored);
  app.failNextWrite();
  app.pet.fire('contextmenu');
  menuAction(app, 'fortune');
  await app.flush();
  let panel = app.document.querySelector('.screen-pet-fortune');
  assert.ok(panel.querySelector('.fortune-error'));
  assert.equal(stored.fortuneDaily, undefined);
  panel.fire('click', { target: panel.querySelector('[data-fortune-retry]') });
  await app.flush();
  panel = app.document.querySelector('.screen-pet-fortune');
  assert.equal(panel.querySelectorAll('.fortune-card').length, 3);
  app.failNextWrite();
  panel.fire('click', { target: panel.querySelector('[data-fortune-slot="0"]') });
  await app.flush();
  assert.ok(panel.querySelector('.fortune-error'));
  assert.equal(stored.fortuneDaily.result, null);
  const confirmed = app.context.PetFortune.draw(stored.fortuneDaily, 1);
  app.save({ fortuneDaily: confirmed });
  assert.ok(panel.querySelector('.fortune-result'));
  assert.match(panel.innerHTML, new RegExp(String(confirmed.result.score)));
});

test('숨김 중 도착한 자동 예약은 해제하고 날짜가 바뀐 뒤 도착한 응답은 표시하지 않는다', async () => {
  const morning = new Date(2026, 9, 22, 8).getTime();
  const pending = [];
  const app = contentHarness({}, morning, { fortuneMessage(message, callback) {
    if (message.action === 'release') callback({ ok: true, date: message.date });
    else pending.push({ message, callback });
  } });
  assert.equal(pending[0].message.action, 'claim');
  app.save({ petHiddenUntil: morning + 60000 });
  pending.shift().callback({ ok: true, date: '2026-10-22', available: true, token: 'reservation' });
  await app.flush();
  assert.ok(app.messages.some((message) => message.action === 'release'));
  assert.equal(app.messages.some((message) => message.action === 'shown'), false);
  assert.equal(app.document.querySelector('.screen-pet-fortune'), null);

  const responses = [];
  const stale = contentHarness({}, new Date(2026, 9, 22, 23, 59).getTime(), { fortuneMessage(message, callback) { responses.push({ message, callback }); } });
  stale.pet.fire('contextmenu');
  menuAction(stale, 'fortune');
  stale.focusAt(new Date(2026, 9, 23, 12).getTime());
  responses[0].callback({ ok: true, date: '2026-10-22', result: { date: '2026-10-22', cardId: 'sun', score: 95, slot: 0 } });
  await stale.flush();
  assert.equal(stale.document.querySelector('.screen-pet-fortune'), null);
});

test('설정은 생일을 불러오고 유효한 저장값만 반영하며 미저장 입력은 탭에 전송하지 않는다', () => {
  const document = new Element('document');
  document.createElement = (tag) => new Element(tag);
  document.getElementById = (id) => document.querySelector(`#${id}`);
  for (const id of ['donate', 'grid', 'houseGrid', 'themeTabs', 'petNameInput', 'saveNameBtn', 'petBirthdayInput', 'saveBirthdayBtn', 'birthdayStatus', 'petLanguageSelect', 'languageStatus', 'restorePetBtn', 'restorePetStatus']) {
    const element = document.appendChild(new Element());
    element.id = id;
  }
  const input = document.getElementById('petBirthdayInput');
  input.checkValidity = () => true;
  input.reportValidity = () => {};
  const pending = [];
  const messages = [];
  const stored = { installedOn: '2026-10-22', petBirthday: '2026-10-22' };
  const chrome = {
    runtime: { sendMessage(message, callback) { callback({ ...stored }); } },
    storage: { local: {
      get(keys, callback) { callback({ ...stored }); },
      set(patch, callback) { pending.push(() => { Object.assign(stored, patch); callback(); }); },
    } },
    tabs: {
      query(query, callback) { pending.push(() => callback([{ id: 1 }])); },
      sendMessage(id, message) { messages.push(message); return Promise.resolve(); },
    },
  };
  const context = vm.createContext({ document, chrome, setTimeout: () => 0, clearTimeout() {} });
  context.window = context;
  for (const name of ['pets.js', 'pets-pixel.js', 'language.js', 'birthday.js', 'popup.js']) load(context, name);
  assert.equal(input.value, '2026-10-22');
  const save = document.getElementById('saveBirthdayBtn');
  input.value = '2026-02-29';
  save.fire('click');
  assert.equal(pending.length, 0);
  input.value = '2000-05-03';
  save.fire('click');
  input.value = '2000-06-04';
  pending.shift()();
  pending.shift()();
  assert.equal(stored.petBirthday, '2000-05-03');
  assert.equal(stored.installedOn, '2026-10-22');
  assert.equal(messages[0].birthday, '2000-05-03');
});

test('브라우저 한국어가 기본 대사에 적용되고 수동 선택은 전탭·새로고침에도 유지된다', () => {
  const stored = {};
  const storageChanges = eventSource();
  const start = new Date(2026, 9, 22, 9).getTime();
  const first = contentHarness(stored, start, { storageChanges, browserLanguage: 'ko-KR' });
  const second = contentHarness(stored, start, { storageChanges, browserLanguage: 'ko-KR' });
  first.advance(500);
  second.advance(500);
  assert.equal(first.pet.querySelector('.pet-thought').textContent, '좋은 아침! ☀️');
  assert.equal(second.pet.querySelector('.pet-thought').textContent, '좋은 아침! ☀️');
  assert.equal(stored.petLanguage, undefined, '자동 기본값을 불필요하게 저장하지 않는다');
  first.save({ petLanguage: 'en' });
  assert.equal(second.pet.querySelector('.pet-thought').classList.contains('show'), false);
  first.save({ atHome: true });
  first.save({ atHome: false });
  assert.equal(first.pet.querySelector('.pet-thought').textContent, 'good morning! ☀️');
  assert.equal(second.pet.querySelector('.pet-thought').textContent, 'good morning! ☀️');
  const reload = contentHarness(stored, start, { browserLanguage: 'ko-KR' });
  reload.advance(500);
  assert.equal(reload.pet.querySelector('.pet-thought').textContent, 'good morning! ☀️');
  first.save({ petLanguage: 'auto' });
  first.save({ atHome: true });
  first.save({ atHome: false });
  assert.equal(second.pet.querySelector('.pet-thought').textContent, '좋은 아침! ☀️');
});

test('초기 언어 응답보다 최신 저장변경을 우선하고 일본어 브라우저는 영어로 말한다', () => {
  const start = new Date(2026, 9, 22, 9).getTime();
  const app = contentHarness({ petLanguage: 'en' }, start, { initialReadDelay: 100, browserLanguage: 'ja' });
  app.save({ petLanguage: 'ko' });
  app.advance(500);
  assert.equal(app.pet.querySelector('.pet-thought').textContent, '좋은 아침! ☀️');
  app.save({ petLanguage: 'auto' });
  app.save({ atHome: true });
  app.save({ atHome: false });
  assert.equal(app.pet.querySelector('.pet-thought').textContent, 'good morning! ☀️');
});

test('언어 설정은 선택값을 저장·전송하고 실패하면 기존 선택을 유지한다', () => {
  const document = new Element('document');
  document.createElement = (tag) => new Element(tag);
  document.getElementById = (id) => document.querySelector(`#${id}`);
  for (const id of ['donate', 'grid', 'houseGrid', 'themeTabs', 'petNameInput', 'saveNameBtn', 'petBirthdayInput', 'saveBirthdayBtn', 'birthdayStatus', 'petLanguageSelect', 'languageStatus', 'restorePetBtn', 'restorePetStatus']) {
    const element = document.appendChild(new Element());
    element.id = id;
  }
  const stored = { petBirthday: '2026-10-22' };
  const pending = [];
  const messages = [];
  let failWrite = false;
  const chrome = {
    runtime: { sendMessage(message, callback) { callback({ ...stored }); } },
    storage: { onChanged: eventSource(), local: {
      get(keys, callback) { callback({ ...stored }); },
      set(patch, callback) {
        pending.push(() => {
          if (failWrite) chrome.runtime.lastError = { message: 'Storage unavailable' };
          else Object.assign(stored, patch);
          callback();
          delete chrome.runtime.lastError;
        });
      },
    } },
    tabs: {
      query(query, callback) { pending.push(() => callback([{ id: 1 }, { id: 2 }])); },
      sendMessage(id, message) { messages.push(message); return Promise.resolve(); },
    },
  };
  const context = vm.createContext({ document, chrome, navigator: { language: 'ko-KR' }, setTimeout: () => 0, clearTimeout() {} });
  context.window = context;
  for (const name of ['pets.js', 'pets-pixel.js', 'language.js', 'birthday.js', 'popup.js']) load(context, name);
  const select = document.getElementById('petLanguageSelect');
  const status = document.getElementById('languageStatus');
  assert.equal(select.value, 'auto');
  assert.equal(status.textContent, '펫이 한국어로 말해요.');
  select.value = 'en';
  select.fire('change');
  assert.equal(select.disabled, true);
  select.value = 'ko';
  pending.shift()();
  pending.shift()();
  assert.equal(stored.petLanguage, 'en');
  assert.equal(messages.length, 2);
  assert.equal(messages[0].language, 'en', '저장 완료 전 바뀐 입력이 아닌 캡처한 값을 전송한다');
  failWrite = true;
  select.value = 'ko';
  select.fire('change');
  pending.shift()();
  assert.equal(select.disabled, false);
  assert.equal(select.value, 'en');
  assert.equal(stored.petLanguage, 'en');
  assert.equal(messages.length, 2);
  assert.match(status.textContent, /Could not save/);
  chrome.storage.onChanged.fire({ petLanguage: { newValue: 'ko' } }, 'local');
  assert.equal(select.value, 'ko');
  assert.equal(status.textContent, '펫이 한국어로 말해요.');
});
