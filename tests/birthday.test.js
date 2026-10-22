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
    if (name.startsWith('data-')) this.dataset[name.slice(5)] = value;
    else this[name === 'class' ? 'className' : name] = value;
  }
  appendChild(child) { this.children.push(child); child.parentNode = this; return child; }
  remove() { if (this.parentNode) this.parentNode.children = this.parentNode.children.filter((child) => child !== this); }
  set innerHTML(html) {
    this.children = [];
    this.insertAdjacentHTML('beforeend', html);
  }
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
      const ownMatch = name[0] === '.' ? this.classList.contains(name.slice(1)) : name[0] === '#' ? this.id === name.slice(1) : this.tagName === name;
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
}

function contentHarness(stored = {}, initialTime = new Date(2026, 9, 22, 12).getTime()) {
  let now = initialTime;
  let timerId = 0;
  const timers = new Map();
  const frames = new Map();
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
    storage: { onChanged: eventSource(), local: {
      get(keys, callback) { schedule(() => callback({ ...stored })); },
      set(patch, callback) {
        const changes = Object.fromEntries(Object.entries(patch).map(([key, value]) => [key, { oldValue: stored[key], newValue: value }]));
        Object.assign(stored, patch);
        chrome.storage.onChanged.fire(changes, 'local');
        if (callback) callback();
      },
    } },
    runtime: { onMessage: eventSource(), sendMessage(message, callback) {
      schedule(() => callback && callback(message.type === 'ENSURE_BIRTHDAY' ? { ...stored } : { present: true }));
    } },
  };
  const windowEvents = new Element();
  const context = vm.createContext({
    document, chrome, Date: Clock, console,
    innerWidth: 1100, innerHeight: 800, outerWidth: 1100, outerHeight: 880,
    addEventListener: (...args) => windowEvents.addEventListener(...args),
    setTimeout: (fn, delay) => schedule(fn, delay), clearTimeout: (id) => timers.delete(id),
    setInterval: (fn, delay) => schedule(fn, delay, delay), clearInterval: (id) => timers.delete(id),
    requestAnimationFrame: (fn) => { const id = ++timerId; frames.set(id, fn); return id; },
    cancelAnimationFrame: (id) => frames.delete(id),
  });
  context.window = context;
  for (const name of ['pets.js', 'pets-pixel.js', 'birthday.js', 'content.js']) load(context, name);
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
  return { pet, document, chrome, advance, context,
    click() { pet.fire('mousedown'); document.fire('mouseup'); },
    frame() { const callbacks = [...frames.values()]; frames.clear(); callbacks.forEach((fn) => fn()); },
    save(patch) { chrome.storage.local.set(patch); },
    focusAt(time) { now = time; windowEvents.fire('focus'); },
  };
}

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

test('자는 펫도 축하 후 다시 잠들고 테마 변경과 숨김은 축하를 정리한다', () => {
  const app = contentHarness({ petBirthday: '2020-10-22', atHome: true });
  app.click();
  app.frame();
  assert.equal(app.pet.dataset.state, 'birthday');
  app.advance(3000);
  assert.equal(app.pet.dataset.state, 'sleeping');
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
  document.documentElement = new Element('html');
  document.createElement = (tag) => new Element(tag);
  document.getElementById = (id) => document.querySelector(`#${id}`);
  for (const id of ['board', 'variants', 'stateGroup', 'zoomGroup', 'bgGroup', 'birthdayToggle', 'birthdayPlay', 'birthdayPreviewStatus']) {
    const element = document.appendChild(new Element());
    element.id = id;
  }
  let timerId = 0;
  const timers = new Map();
  const context = vm.createContext({ document,
    setTimeout(fn, delay) { assert.equal(delay, 3000); timers.set(++timerId, fn); return timerId; },
    clearTimeout(id) { timers.delete(id); },
  });
  context.window = context;
  for (const name of ['pets.js', 'pets-pixel.js', 'birthday.js']) load(context, name);
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
  assert.equal(document.querySelectorAll('.birthday-scene').length, 1);
  [...timers.values()].forEach((fn) => fn());
  assert.equal(pets[0].dataset.state, 'sleeping');
  document.getElementById('birthdayToggle').fire('click');
  assert.equal(document.querySelectorAll('.birthday-hat').length, 0);
});

test('설정은 생일을 불러오고 유효한 저장값만 반영하며 미저장 입력은 탭에 전송하지 않는다', () => {
  const document = new Element('document');
  document.createElement = (tag) => new Element(tag);
  document.getElementById = (id) => document.querySelector(`#${id}`);
  for (const id of ['donate', 'grid', 'houseGrid', 'themeTabs', 'petNameInput', 'saveNameBtn', 'petBirthdayInput', 'saveBirthdayBtn', 'birthdayStatus']) {
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
  const context = vm.createContext({ document, chrome });
  context.window = context;
  for (const name of ['pets.js', 'pets-pixel.js', 'birthday.js', 'popup.js']) load(context, name);
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
