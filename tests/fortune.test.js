const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = (name) => fs.readFileSync(path.join(__dirname, '..', name), 'utf8');
const plain = (value) => JSON.parse(JSON.stringify(value));
const eventSource = () => {
  const listeners = [];
  return { addListener(fn) { listeners.push(fn); }, fire(...args) { return listeners.map((fn) => fn(...args)); } };
};

function fortuneWorker(initial = {}) {
  let now = new Date(2026, 9, 22, 9).getTime();
  let activeTab = 1;
  let failWrite = false;
  let failRead = false;
  const stored = plain(initial);
  const writes = [];
  class Clock extends Date {
    constructor(...args) { super(...(args.length ? args : [now])); }
    static now() { return now; }
  }
  const chrome = {
    runtime: { onMessage: eventSource(), onInstalled: eventSource(), onStartup: eventSource() },
    tabs: {
      onActivated: eventSource(), onRemoved: eventSource(),
      query(query, callback) { queueMicrotask(() => callback(query.active ? [{ id: activeTab, active: true, windowId: 1 }] : [{ id: 1 }, { id: 2 }])); },
      sendMessage() { return Promise.resolve(); },
    },
    windows: {
      onFocusChanged: eventSource(), onRemoved: eventSource(),
      getLastFocused(query, callback) { queueMicrotask(() => callback({ id: 1, focused: true })); },
    },
    storage: { local: {
      get(keys, callback) {
        queueMicrotask(() => {
          if (failRead) {
            failRead = false;
            chrome.runtime.lastError = { message: 'read unavailable' };
            callback(undefined);
            delete chrome.runtime.lastError;
          } else callback(plain(stored));
        });
      },
      set(patch, callback) {
        queueMicrotask(() => {
          if (failWrite) {
            failWrite = false;
            chrome.runtime.lastError = { message: 'write unavailable' };
            callback();
            delete chrome.runtime.lastError;
          } else {
            writes.push(plain(patch));
            Object.assign(stored, plain(patch));
            callback();
          }
        });
      },
    } },
  };
  const context = vm.createContext({ chrome, Date: Clock, console, crypto: require('node:crypto').webcrypto });
  const load = (name) => vm.runInContext(source(name), context, { filename: name });
  context.importScripts = (...names) => names.forEach(load);
  load('background.js');
  return {
    api: context.PetFortune, stored, writes,
    at(value) { now = value.getTime(); },
    activate(tabId) { activeTab = tabId; },
    failNextWrite() { failWrite = true; },
    failNextRead() { failRead = true; },
    send(action, extra = {}, tabId = 1) {
      return new Promise((resolve, reject) => {
        const message = { type: 'PET_FORTUNE', action, date: context.PetFortune.day(new Clock()), ...extra };
        const handled = chrome.runtime.onMessage.fire(message, { tab: { id: tabId, active: activeTab === tabId, windowId: 1 } }, (value) => resolve(plain(value)));
        if (!handled.includes(true)) reject(new Error(`No async handler for ${action}`));
      });
    },
  };
}

test('타로 22장에는 두 언어의 이름·행운 아이템·해석이 있고 제안은 서로 다른 세 장이다', () => {
  const context = vm.createContext({});
  vm.runInContext(source('fortune.js'), context);
  const api = context.PetFortune;
  assert.equal(api.cards.length, 22);
  assert.equal(new Set(api.cards.map((card) => card.id)).size, 22);
  for (const card of api.cards) {
    for (const locale of ['en', 'ko']) {
      assert.ok(card[locale].name);
      assert.ok(card[locale].item);
      assert.ok(card[locale].reading.length > 20);
      assert.ok(card.reversed[locale].item);
      assert.ok(card.reversed[locale].reading.length > 20);
      assert.notEqual(card.reversed[locale].reading, card[locale].reading);
    }
    assert.ok(card.min >= 0 && card.max <= 100 && card.min <= card.max);
    assert.ok(card.reversed.min >= 0 && card.reversed.max <= 100 && card.reversed.min <= card.reversed.max);
    const daily = { date: '2026-10-22', offer: [card.id, card.id, card.id], result: null };
    for (const random of [() => 0, () => 0.999999]) {
      const result = api.draw(daily, 1, random).result;
      assert.equal(result.cardId, card.id);
      assert.equal(api.validResult(result, '2026-10-22'), true);
    }
  }
  for (const random of [() => 0, () => 0.5, () => 0.999999]) assert.equal(new Set(api.offer(random)).size, 3);
  assert.equal(api.isMorning(new Date(2026, 9, 22, 5, 59)), false);
  assert.equal(api.isMorning(new Date(2026, 9, 22, 6)), true);
  assert.equal(api.isMorning(new Date(2026, 9, 22, 11, 59)), true);
  assert.equal(api.isMorning(new Date(2026, 9, 22, 12)), false);
});

test('도트 타로 22장의 숫자와 11종 심볼은 폰트와 곡선 없이 정수 격자로 그려진다', () => {
  const context = vm.createContext({});
  vm.runInContext(source('fortune.js'), context);
  const api = context.PetFortune;
  const artworkBySymbol = new Map();
  const fronts = new Set();
  for (const card of api.cards) {
    const svg = api.cardSVG(card.id, 'pixel');
    fronts.add(svg);
    assert.match(svg, /shape-rendering="crispEdges"/);
    assert.doesNotMatch(svg, /<(?:text|circle|ellipse)\b|font-family|\bNaN\b|\bundefined\b/);
    for (const [, commands] of svg.matchAll(/<path d="([^"]+)"/g)) assert.doesNotMatch(commands, /[acqlst]/i);
    for (const [, x, y, width, height] of svg.matchAll(/<rect x="([^"]+)" y="([^"]+)" width="([^"]+)" height="([^"]+)"/g)) {
      const values = [x, y, width, height].map(Number);
      assert.ok(values.every(Number.isInteger));
      assert.ok(values[0] >= 0 && values[1] >= 0 && values[2] > 0 && values[3] > 0);
      assert.ok(values[0] + values[2] <= 80 && values[1] + values[3] <= 112);
    }
    const emblem = svg.match(/<g data-pixel-symbol="([^"]+)">(.+?)<\/g>/);
    assert.equal(emblem[1], card.symbol);
    if (artworkBySymbol.has(card.symbol)) assert.equal(emblem[2], artworkBySymbol.get(card.symbol));
    artworkBySymbol.set(card.symbol, emblem[2]);
  }
  assert.equal(fronts.size, 22);
  assert.equal(artworkBySymbol.size, 11);
  assert.equal(new Set(artworkBySymbol.values()).size, 11);
  const back = api.cardSVG(null, 'pixel');
  assert.doesNotMatch(back, /<text\b|<circle\b|data-pixel-symbol/);
  assert.equal(fronts.has(back), false);
  assert.match(back, /shape-rendering="crispEdges"/);
  assert.match(api.cardSVG('sun', 'normal'), /<text\b/);
  assert.match(api.cardSVG('sun', 'normal'), /<circle\b/);
});

test('아침 자동 제안은 활성 탭에만 예약되고 표시 확정 후 하루 한 번으로 고정된다', async () => {
  const app = fortuneWorker();
  const inactive = await app.send('claim', {}, 2);
  assert.notEqual(inactive.available, true);
  const claim = await app.send('claim');
  assert.equal(claim.ok, true);
  assert.equal(claim.available, true);
  assert.ok(claim.token);
  assert.notEqual(app.stored.fortuneDaily?.autoShown, true);
  const shown = await app.send('shown', { token: claim.token });
  assert.equal(shown.ok, true);
  assert.equal(app.stored.fortuneDaily.autoShown, true);
  assert.notEqual((await app.send('claim')).available, true);
  const restarted = fortuneWorker(app.stored);
  assert.notEqual((await restarted.send('claim')).available, true);
});

test('방향은 0.5, 점수 구간은 0.6과 0.9 경계로 선택하고 구간 양 끝 점수를 생성한다', () => {
  const api = fortuneWorker().api;
  for (const selected of api.cards) {
    const daily = { date: '2026-10-22', offer: [selected.id, selected.id, selected.id], result: null };
    for (const [directionSample, reversed] of [[0, true], [0.499999, true], [0.5, false], [0.999999, false]]) {
      for (const [bandSample, min, max] of [[0, 75, 100], [0.599999, 75, 100], [0.6, 45, 74], [0.899999, 45, 74], [0.9, 15, 44], [0.999999, 15, 44]]) {
        for (const scoreSample of [0, 0.999999]) {
          const samples = [directionSample, bandSample, scoreSample];
          const drawn = api.draw(daily, 0, () => samples.shift());
          assert.equal(drawn.result.reversed, reversed);
          assert.equal(drawn.result.score, scoreSample === 0 ? min : max);
          assert.equal(drawn.result.scoreVersion, 2);
          assert.equal(api.validResult(drawn.result, daily.date), true);
          assert.equal(samples.length, 0);
          assert.equal(api.draw(drawn, 2, () => { throw new Error('already drawn'); }).result, drawn.result);
        }
      }
    }
  }
});

test('균등한 난수 구간의 점수 비율은 카드와 방향에 무관하게 상60·중30·하10이다', () => {
  const api = fortuneWorker().api;
  for (const cardId of ['sun', 'devil']) {
    const counts = { high: 0, middle: 0, low: 0 };
    const directionCounts = { upright: 0, reversed: 0 };
    const daily = { date: '2026-10-22', offer: [cardId, 'moon', 'world'], result: null };
    // Fixed midpoints partition [0, 1) into 1,000 equal cells; no random/flaky sampling.
    for (let index = 0; index < 1000; index++) {
      const samples = [index % 2 ? 0.75 : 0.25, (index + 0.5) / 1000, 0.5];
      const result = api.draw(daily, 0, () => samples.shift()).result;
      counts[result.score >= 75 ? 'high' : result.score >= 45 ? 'middle' : 'low']++;
      directionCounts[result.reversed ? 'reversed' : 'upright']++;
    }
    assert.deepEqual(counts, { high: 600, middle: 300, low: 100 });
    assert.deepEqual(directionCounts, { upright: 500, reversed: 500 });
  }
});

test('새 점수 버전은 15~100 정수만 허용하고 기존 결과에는 원래 카드별 범위를 유지한다', () => {
  const api = fortuneWorker().api;
  const legacy = { date: '2026-10-22', cardId: 'sun', score: 95, slot: 0, reversed: false };
  assert.equal(api.validResult(legacy, legacy.date), true);
  assert.equal(api.validResult({ ...legacy, score: 15 }, legacy.date), false);
  assert.equal(api.validResult({ ...legacy, score: 15, scoreVersion: 2 }, legacy.date), true);
  assert.equal(api.validResult({ ...legacy, cardId: 'devil', score: 100 }, legacy.date), false);
  assert.equal(api.validResult({ ...legacy, cardId: 'devil', score: 100, scoreVersion: 2 }, legacy.date), true);
  for (const invalid of [-1, 0, 14, 101, 55.5, '80', null, undefined]) {
    assert.equal(api.validResult({ ...legacy, score: invalid, scoreVersion: 2 }, legacy.date), false);
  }
  for (const scoreVersion of [null, undefined, 0, 1, 3, '2', {}, []]) {
    assert.equal(api.validResult({ ...legacy, scoreVersion }, legacy.date), false);
  }
});

test('방향 필드가 없는 기존 결과는 카드·점수·해석을 보존하고 정방향으로 한 번만 저장된다', async () => {
  const original = { date: '2026-10-22', cardId: 'sun', score: 100, slot: 1 };
  const app = fortuneWorker({ fortuneDaily: { date: original.date, offer: ['moon', 'sun', 'star'], autoShown: true, result: original } });
  const read = await app.send('load');
  assert.equal(read.ok, true);
  assert.deepEqual(read.result, { ...original, reversed: false });
  assert.equal(app.writes.length, 1);
  assert.equal(app.api.validResult(read.result, original.date), true, 'upright maximum stays valid even if reversed maximum is lower');
  assert.deepEqual((await app.send('draw', { slot: 2 })).result, read.result);
  assert.deepEqual((await app.send('load')).result, read.result);
  assert.equal(app.writes.length, 1);
  const restarted = fortuneWorker(app.stored);
  assert.deepEqual((await restarted.send('load')).result, read.result);
  assert.equal(restarted.writes.length, 0);
});

test('정방향·역방향 저장결과는 각 범위로 검증하고 잘못된 방향 타입은 거절한다', async () => {
  const api = fortuneWorker().api;
  const legacy = { date: '2026-10-22', cardId: 'hermit', score: 85, slot: 0 };
  assert.equal(api.validResult(legacy, legacy.date), true);
  for (const invalid of [null, 0, 1, 'true', 'false', undefined, {}, []]) {
    assert.equal(api.validResult({ ...legacy, reversed: invalid }, legacy.date), false);
  }
  assert.equal(api.validResult({ ...legacy, score: 95, reversed: true }, legacy.date), true);
  assert.equal(api.validResult({ ...legacy, score: 95, reversed: false }, legacy.date), false);
  for (const reversed of [false, true]) {
    const result = { ...legacy, reversed };
    const saved = { fortuneDaily: { date: legacy.date, offer: ['hermit', 'sun', 'moon'], autoShown: true, result } };
    const app = fortuneWorker(saved);
    const [first, second] = await Promise.all([app.send('draw', { slot: 1 }), app.send('draw', { slot: 2 }, 2)]);
    assert.deepEqual(first.result, result);
    assert.deepEqual(second.result, result);
    assert.equal(app.writes.length, 0);
    assert.deepEqual((await fortuneWorker(app.stored).send('load')).result, result);
  }
});

test('표시 전에 예약을 놓으면 다시 제안할 수 있고 오후에는 수동 뽑기만 가능하다', async () => {
  const app = fortuneWorker();
  const first = await app.send('claim');
  await app.send('release', { token: first.token });
  const next = await app.send('claim');
  assert.equal(next.available, true);
  await app.send('release', { token: next.token });
  app.at(new Date(2026, 9, 22, 14));
  assert.notEqual((await app.send('claim')).available, true);
  assert.equal((await app.send('load')).ok, true);
  assert.equal((await app.send('draw', { slot: 2 })).ok, true);
});

test('예약 중 다른 탭이 활성화되거나 예약 시간이 지나면 자동 표시 기회를 소비하지 않는다', async () => {
  const app = fortuneWorker();
  const claim = await app.send('claim');
  app.activate(2);
  const inactive = await app.send('shown', { token: claim.token });
  assert.equal(inactive.ok, false);
  assert.equal(inactive.error, 'NOT_ACTIVE');
  assert.notEqual(app.stored.fortuneDaily?.autoShown, true);
  app.activate(1);
  app.at(new Date(2026, 9, 22, 9, 0, 16));
  const expired = await app.send('shown', { token: claim.token });
  assert.equal(expired.ok, false);
  assert.equal(expired.error, 'CLAIM_EXPIRED');
  assert.equal((await app.send('claim')).available, true);
});

test('자동 표시 저장에 실패해도 재시도하여 그날의 표시를 확정할 수 있다', async () => {
  const app = fortuneWorker();
  const claim = await app.send('claim');
  app.failNextWrite();
  const failed = await app.send('shown', { token: claim.token });
  assert.equal(failed.ok, false);
  assert.equal(failed.error, 'STORAGE_ERROR');
  assert.notEqual(app.stored.fortuneDaily?.autoShown, true);
  assert.equal((await app.send('shown', { token: claim.token })).ok, true);
  assert.equal(app.stored.fortuneDaily.autoShown, true);
});

test('여러 탭의 동시 선택은 첫 결과 하나로 고정되고 재시작과 언어 선택에 무관하다', async () => {
  const app = fortuneWorker();
  await app.send('load');
  const [first, second] = await Promise.all([app.send('draw', { slot: 0 }), app.send('draw', { slot: 2 }, 2)]);
  assert.equal(first.ok, true);
  assert.equal(second.ok, true);
  assert.deepEqual(first.result, second.result);
  const reread = await app.send('load');
  assert.deepEqual(reread.result, first.result);
  const restarted = fortuneWorker({ ...app.stored, petLanguage: 'ko' });
  assert.deepEqual((await restarted.send('load')).result, first.result);
  assert.deepEqual(Object.keys(first.result).sort(), ['cardId', 'date', 'reversed', 'score', 'scoreVersion', 'slot']);
  assert.equal(typeof first.result.reversed, 'boolean');
  assert.equal(first.result.scoreVersion, 2);
});

test('자정 이후 오래된 카드 선택을 거절하고 새 날짜에는 다시 뽑을 수 있다', async () => {
  const app = fortuneWorker();
  const yesterday = await app.send('draw', { slot: 0 });
  app.at(new Date(2026, 9, 23, 9));
  const stale = await app.send('draw', { slot: 1, date: '2026-10-22' });
  assert.equal(stale.ok, false);
  assert.equal(stale.error, 'STALE_DATE');
  const today = await app.send('load');
  assert.equal(today.result, null);
  assert.equal(today.autoShown, false);
  const draw = await app.send('draw', { slot: 1 });
  assert.equal(draw.result.date, '2026-10-23');
  assert.notEqual(draw.result.date, yesterday.result.date);
});

test('잘못된 선택과 저장·조회 실패는 성공 결과를 만들지 않으며 재시도할 수 있다', async () => {
  const app = fortuneWorker();
  await app.send('load');
  for (const slot of [-1, 3, 0.5, '0']) {
    const response = await app.send('draw', { slot });
    assert.equal(response.ok, false);
    assert.equal(response.error, 'INVALID_SLOT');
    assert.equal(app.stored.fortuneDaily.result, null);
  }
  app.failNextWrite();
  const failed = await app.send('draw', { slot: 1 });
  assert.equal(failed.ok, false);
  assert.equal(failed.error, 'STORAGE_ERROR');
  assert.equal(app.stored.fortuneDaily.result, null);
  assert.equal((await app.send('draw', { slot: 1 })).ok, true);
  app.failNextRead();
  const readFailed = await app.send('load');
  assert.equal(readFailed.ok, false);
  assert.equal(readFailed.error, 'STORAGE_ERROR');
  assert.equal((await app.send('load')).ok, true);
});
