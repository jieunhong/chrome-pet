const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');

function languageApi(environment = {}) {
  const context = vm.createContext(environment);
  vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'language.js'), 'utf8'), context);
  return context.PetLanguage;
}

test('자동 언어는 한국어 태그만 한국어로 선택하고 나머지는 영어로 선택한다', () => {
  const api = languageApi();
  for (const value of ['ko', 'ko-KR', 'ko-kp', 'KO-KR']) assert.equal(api.resolve('auto', value), 'ko');
  for (const value of ['en-US', 'ja', 'fr', '', undefined, null, 'korean']) assert.equal(api.resolve('auto', value), 'en');
  assert.equal(api.resolve(undefined, 'ko-KR'), 'ko');
  assert.equal(api.resolve('unknown', 'ko-KR'), 'ko');
  assert.equal(api.resolve('en', 'ko-KR'), 'en');
  assert.equal(api.resolve('ko', 'en-US'), 'ko');
});

test('브라우저 UI 언어가 우선이고 API가 없거나 끊겼으면 navigator와 영어 기본값을 사용한다', () => {
  assert.equal(languageApi({ chrome: { i18n: { getUILanguage: () => 'ko-KR' } }, navigator: { language: 'en-US' } }).resolve('auto'), 'ko');
  assert.equal(languageApi({ navigator: { language: 'ko-KR' } }).resolve('auto'), 'ko');
  assert.equal(languageApi({ chrome: { i18n: { getUILanguage() { throw new Error('disconnected'); } } }, navigator: { language: 'ko' } }).resolve('auto'), 'ko');
  assert.equal(languageApi().resolve('auto'), 'en');
});

test('모든 펫과 시간대의 한국어 대사는 영문 대사 없이 이모지를 유지한다', () => {
  const api = languageApi();
  for (const pet of ['cat', 'dog', 'maltese_white', 'hamster', 'dino', 'harp_seal']) {
    for (const category of ['idle', 'click', 'chase', 'dance']) {
      const english = api.thoughts(pet, category, 'en');
      const korean = api.thoughts(pet, category, 'ko');
      assert.equal(english.length, korean.length);
      assert.equal(korean.some((line) => /[a-z]/i.test(line)), false, `${pet}/${category}`);
      english.forEach((line, index) => {
        if (!/[a-z]/i.test(line)) assert.equal(korean[index], line);
      });
    }
  }
  for (const slot of ['lateNight', 'morning', 'noon', 'afternoon', 'evening', 'night']) {
    assert.equal(api.timeThoughts(slot, 'ko').some((line) => /[a-z]/i.test(line)), false, slot);
    assert.match(api.greeting(slot, 'ko'), /[가-힣]/);
  }
  assert.equal(api.text('nom nom', 'ko'), '냠냠');
  assert.equal(api.text('Could not hide. Try again.', 'ko'), '숨기지 못했어. 다시 해 줘.');
  assert.equal(api.text('nom nom', 'en'), 'nom nom');
});
