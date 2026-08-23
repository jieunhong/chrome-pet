/*
 * 스토어 자산(아이콘 128x128, 소개 이미지 1280x800) 소스 HTML 생성기.
 *
 * 실제 pets.js / pets-pixel.js / styles.css 를 그대로 물려서 그린다.
 * 손으로 다시 그리면 스프라이트를 고칠 때마다 스토어 이미지와 실물이 어긋난다.
 *
 * 사용: store/make.sh (node build.js -> Chrome 헤드리스로 PNG 굽기)
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');
const BUILD = path.join(__dirname, 'build');

const assets = {};
const ctx = vm.createContext({ self: assets });
for (const f of ['pets.js', 'pets-pixel.js']) {
  vm.runInContext(
    fs.readFileSync(path.join(ROOT, f), 'utf8')
      .replace("typeof window !== 'undefined' ? window : self", 'self'),
    ctx,
  );
}

const petSvg = (theme, pet) => assets.PET_THEMES[theme].pets[pet];
const houseSvg = (theme) => assets.PET_THEMES[theme].house;

// ============ 공통 조각 ============

// 실제 확장과 같은 CSS 를 쓰려고 id="screen-pet" 을 그대로 단다.
// 한 페이지에 여러 개라 id 가 중복되지만 CSS 는 전부에 적용되고, 여기서 getElementById 는 쓰지 않는다.
const STAGE_CSS = `
  .pet {
    position: relative;
    width: var(--w, 80px);
    height: var(--w, 80px);
  }
  .pet #screen-pet {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    transform: none;
    cursor: default;
    --facing: 1;
  }
  /* 스크린샷은 한 프레임만 찍히므로 애니메이션을 0% 에서 멈춰 결과를 고정한다 */
  #screen-pet *, #screen-pet {
    animation-play-state: paused !important;
  }
`;

const pet = ({ theme = 'normal', name = 'cat', state = 'idle', size = 160, facing = 1, label = '' }) => `
  <div class="pet" style="--w:${size}px">
    <div id="screen-pet" data-pet="${name}" data-theme="${theme}" data-state="${state}"
         style="--facing:${facing}">
      <div class="pet-inner">${petSvg(theme, name)}${label ? `<div class="pet-name">${label}</div>` : ''}</div>
    </div>
  </div>`;

const house = ({ theme = 'normal', size = 200 }) => `
  <div class="pet" style="--w:${size}px">
    <div id="pet-house" data-theme="${theme}"
         style="position:absolute;inset:0;width:100%;height:100%;left:auto;bottom:auto">
      ${houseSvg(theme)}
    </div>
  </div>`;

/*
 * content.js 의 petHomeX/petHomeY 와 같은 배치.
 * CUSHION 100x100, PET 80x80 기준으로 펫은 방석 왼쪽 끝에서 시작하고 위에서 5 만큼 내려온다.
 * 눈대중으로 얹으면 스토어 이미지에서만 펫이 방석 위에 떠 있게 된다.
 */
const petOnBed = ({ theme = 'normal', name = 'cat', bed = 240 }) => {
  const k = bed / 100;
  return `
  <div style="position:relative; width:${bed}px; height:${bed}px">
    <div id="pet-house" data-theme="${theme}"
         style="position:absolute; inset:0; left:0; bottom:auto; width:100%; height:100%">
      ${houseSvg(theme)}
    </div>
    <div style="position:absolute; left:0; top:${5 * k}px">
      ${pet({ theme, name, size: 80 * k, state: 'sleeping' })}
    </div>
  </div>`;
};

const page = ({ w, h, css, body }) => `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<link rel="stylesheet" href="/styles.css">
<style>
  html, body { margin: 0; padding: 0; }
  body {
    width: ${w}px;
    height: ${h}px;
    overflow: hidden;
    font-family: -apple-system, "Pretendard", "Noto Sans KR", system-ui, sans-serif;
  }
  ${STAGE_CSS}
  ${css}
</style>
</head>
<body>${body}</body>
</html>`;

// ============ 아이콘 후보 (128x128) ============

const iconPage = (body) => page({
  w: 128, h: 128,
  css: '.icon { width: 128px; height: 128px; display: block; }',
  body: `<svg class="icon" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">${body}</svg>`,
});

const CREAM = '#ffe8d6';

// 아이콘 주인공. 바꾸려면 여기만 고치면 B/C/D 가 따라간다 (A 는 손으로 그린 얼굴이라 별도).
const ICON_PET = 'hamster';

// 스프라이트에서 머리 그룹만 떼어낸다 (얼굴 클로즈업용)
const headGroup = (theme, name) => {
  const svg = petSvg(theme, name);
  return svg.slice(svg.indexOf('<g class="pet-head">'), svg.lastIndexOf('</g>') + 4);
};

// A. 햄스터 얼굴 클로즈업 — 16px 로 줄여도 형태가 남도록 이목구비를 크게 다시 그렸다
const iconA = iconPage(`
  <circle cx="64" cy="64" r="63" fill="${CREAM}"/>
  <circle cx="35" cy="35" r="14" fill="#c89668"/>
  <circle cx="93" cy="35" r="14" fill="#c89668"/>
  <circle cx="35" cy="36" r="7.5" fill="#ff9a9a"/>
  <circle cx="93" cy="36" r="7.5" fill="#ff9a9a"/>
  <circle cx="64" cy="68" r="41" fill="#f4d19b"/>
  <ellipse cx="32" cy="78" rx="14" ry="11" fill="#e8c89a"/>
  <ellipse cx="96" cy="78" rx="14" ry="11" fill="#e8c89a"/>
  <ellipse cx="51" cy="63" rx="5.5" ry="7" fill="#1a0e08"/>
  <ellipse cx="77" cy="63" rx="5.5" ry="7" fill="#1a0e08"/>
  <circle cx="52.8" cy="60" r="2" fill="#fff"/>
  <circle cx="78.8" cy="60" r="2" fill="#fff"/>
  <ellipse cx="64" cy="79" rx="4.5" ry="3.2" fill="#7a2d2d"/>
  <rect x="59" y="84" width="10" height="10" rx="1.6" fill="#fff" stroke="#d4b088" stroke-width="1.2"/>
  <line x1="64" y1="84" x2="64" y2="94" stroke="#d4b088" stroke-width="1.2"/>
`);

// B. 방석 위에 웅크린 고양이 — 확장의 시그니처 조합
const iconB = iconPage(`
  <circle cx="64" cy="64" r="63" fill="${CREAM}"/>
  <g transform="translate(64 78) scale(0.66) translate(-50 -50)">${houseSvg('normal')}</g>
  <g transform="translate(64 56) scale(1.9) translate(-60 -42)">${headGroup('normal', ICON_PET)}</g>
  <text x="92" y="40" font-size="24" font-family="system-ui" fill="#a98a6e" font-weight="800">z</text>
  <text x="104" y="24" font-size="16" font-family="system-ui" fill="#c0a288" font-weight="800">z</text>
`);

// C. 도트 고양이 얼굴 — 실제 도트 테마 격자를 그대로 확대
const catDef = assets.PIXEL_PET_DEFS[ICON_PET];
// 머리 격자 크기에서 칸 크기와 여백을 역산한다. 격자 칸수를 상수로 박으면 스프라이트를 고칠 때 잘린다.
const HEAD_W = Math.max(...catDef.head.rows.map((r) => r.length));
const HEAD_H = catDef.head.rows.length;
const CELL = (128 - 24) / Math.max(HEAD_W, HEAD_H);
const PAD_X = (128 - HEAD_W * CELL) / 2;
const PAD_Y = (128 - HEAD_H * CELL) / 2;
const px = (gx) => PAD_X + (gx - catDef.head.x) * CELL;
const py = (gy) => PAD_Y + (gy - catDef.head.y) * CELL;
const pixelRects = (part, palette) => part.rows.map((row, ry) =>
  [...row].map((ch, rx) => ch === '.' ? '' :
    `<rect x="${px(part.x + rx)}" y="${py(part.y + ry)}" width="${CELL}" height="${CELL}" fill="${palette[ch]}"/>`,
  ).join(''),
).join('');
const iconC = iconPage(`
  <rect width="128" height="128" rx="26" fill="${CREAM}"/>
  ${pixelRects(catDef.head, catDef.palette)}
  ${pixelRects(catDef.face, catDef.palette)}
  ${catDef.eyes.map(([x, y]) =>
  `<rect x="${px(x)}" y="${py(y)}" width="${CELL}" height="${CELL}" fill="${catDef.palette.e}"/>`).join('')}
`);

// D. 배경 없이 고양이 전신 — 툴바에서 배경 원 없이 뜨는 쪽
const iconD = iconPage(`
  <g transform="translate(64 64) scale(2) translate(-46.5 -50.5)">
    ${petSvg('normal', ICON_PET).replace(/<\/?svg[^>]*>/g, '')}
  </g>
`);

// ============ 소개 이미지 (1280x800) ============

const SHOT_CSS = `
  .shot {
    width: 1280px;
    height: 800px;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 68px 0 60px;
    box-sizing: border-box;
  }
  /* 그림 영역이 남는 높이를 다 먹고 그 안에서 가운데 정렬된다. 아래쪽 빈 공간이 생기지 않는다 */
  .art {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
  }
  h1 {
    margin: 0;
    font-size: 54px;
    font-weight: 800;
    letter-spacing: -0.02em;
    color: #4a3020;
  }
  h2 {
    margin: 14px 0 0;
    font-size: 24px;
    font-weight: 500;
    color: #96775f;
  }
  .row {
    display: flex;
    align-items: flex-end;
    justify-content: center;
    gap: 40px;
  }
  .cap {
    margin-top: 18px;
    text-align: center;
    font-size: 19px;
    font-weight: 700;
    color: #6d5240;
  }
  .cap span { display: block; font-weight: 400; font-size: 15px; color: #9c806a; margin-top: 3px; }
  .bubble {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    bottom: calc(100% + 10px);
    background: #fff;
    border-radius: 16px;
    padding: 7px 15px;
    font-size: 17px;
    font-weight: 600;
    color: #2c1810;
    white-space: nowrap;
    box-shadow: 0 3px 10px rgba(0,0,0,.14);
  }
  .bubble::after {
    content: "";
    position: absolute;
    bottom: -5px; left: 50%;
    width: 11px; height: 11px;
    background: #fff;
    transform: translateX(-50%) rotate(45deg);
  }
`;

const shotPage = (bg, body, css = '') => page({
  w: 1280, h: 800,
  css: `body { background: ${bg}; } ${SHOT_CSS} ${css}`,
  body: `<div class="shot">${body}</div>`,
});

const PETS = assets.PET_LIST;

// 1) 다섯 마리 소개
const shot1 = shotPage(
  'linear-gradient(170deg, #fff6ea 0%, #ffe6d2 100%)',
  `<h1>Five little friends. Pick yours.</h1>
   <h2>They live on every tab, quietly keeping you company.</h2>
   <div class="art">
     <div class="row" style="gap:34px">
       ${PETS.map((p) => `
         <div style="text-align:center">
           ${pet({ name: p, size: 184 })}
           <div class="cap">${assets.PET_NAMES[p]}</div>
         </div>`).join('')}
     </div>
   </div>`,
);

// 2) 두 가지 아트 스타일
const shot2 = shotPage(
  'linear-gradient(170deg, #f3f0ff 0%, #ffe9f0 100%)',
  `<h1>Soft or pixel — your call.</h1>
   <h2>One tap swaps every pet and its bed. All the animations come along.</h2>
   <div class="art">
     ${['normal', 'pixel'].map((t) => `
       <div class="styleRow">
         <div class="styleName">${assets.PET_THEME_NAMES[t]}</div>
         <div class="row" style="gap:22px">
           ${PETS.map((p) => pet({ theme: t, name: p, size: 148 })).join('')}
         </div>
       </div>`).join('')}
   </div>`,
  `.styleRow {
     display: flex;
     align-items: center;
     gap: 26px;
   }
   .styleRow + .styleRow { margin-top: 34px; }
   .styleName {
     width: 96px;
     text-align: right;
     font-size: 23px;
     font-weight: 800;
     color: #6d5240;
   }`,
);

// 3) 방석 — 옮기고, 재우고
const shot3 = shotPage(
  'linear-gradient(170deg, #fff8ec 0%, #ffeede 100%)',
  `<h1>Move the bed. Tuck them in.</h1>
   <h2>Drag the Flower Donut Bed anywhere along the bottom — it stays put on every tab.</h2>
   <div class="art">
     <div class="track">
       <div class="ghost" style="left:0">${houseSvg('normal')}</div>
       <div class="ghost" style="left:330px">${houseSvg('normal')}</div>
       <div style="position:absolute; right:0; top:0">${petOnBed({ bed: 260 })}</div>
       <div class="arrow"></div>
       <div class="trackCap">drag it anywhere along the bottom</div>
     </div>
   </div>`,
  `.track {
     position: relative;
     width: 920px;
     height: 340px;
   }
   .ghost {
     position: absolute;
     top: 0;
     width: 260px;
     height: 260px;
     opacity: 0.28;
   }
   .ghost svg { width: 100%; height: 100%; display: block; }
   .arrow {
     position: absolute;
     left: 70px;
     right: 70px;
     top: 268px;
     height: 3px;
     background: repeating-linear-gradient(90deg, #c8a98d 0 14px, transparent 14px 28px);
   }
   .trackCap {
     position: absolute;
     left: 0;
     right: 0;
     top: 296px;
     text-align: center;
     font-size: 20px;
     font-weight: 600;
     color: #9c806a;
   }`,
);

// 4) 시간대별 인사
const shot4 = shotPage(
  'linear-gradient(170deg, #eef3ff 0%, #f6ecff 100%)',
  `<h1>They know what time it is.</h1>
   <h2>Greetings follow your own clock — morning, lunch, and the small hours.</h2>
   <div class="art">
     <div class="row" style="gap:110px">
       ${[
    ['dog', 'good morning! ☀️'],
    ['hamster', 'lunch time? 🍜'],
    ['cat', 'still up? 🌙'],
  ].map(([p, text]) => `
         <div style="position:relative">
           <div class="bubble">${text}</div>
           ${pet({ name: p, size: 196 })}
         </div>`).join('')}
     </div>
   </div>`,
);

// ============ 작은 프로모션 타일 (440x280) ============
// 스토어 목록에서 작게 뜨므로 글자를 크게 두고 요소를 적게 쓴다.

const tile = page({
  w: 440, h: 280,
  css: `
    body { background: linear-gradient(150deg, #fff4e4 0%, #ffdcc4 100%); }
    .tile { width: 440px; height: 280px; position: relative; overflow: hidden; }
    .wordmark {
      position: absolute; left: 34px; top: 62px;
      font-size: 46px; font-weight: 800; letter-spacing: -0.02em;
      line-height: 1.05; color: #4a3020;
    }
    .tagline {
      position: absolute; left: 36px; top: 176px;
      font-size: 17px; font-weight: 600; color: #96775f;
    }
  `,
  body: `
    <div class="tile">
      <div class="wordmark">Screen<br>Pet</div>
      <div class="tagline">a friend on every tab</div>
      <div style="position:absolute; right:6px; bottom:2px">${house({ size: 150 })}</div>
      <div style="position:absolute; right:128px; bottom:26px">
        ${pet({ name: 'cat', size: 130, facing: -1 })}
      </div>
      <div style="position:absolute; right:44px; bottom:138px">
        ${pet({ name: 'hamster', size: 92 })}
      </div>
    </div>`,
});

// ============ 파일 쓰기 ============

fs.rmSync(BUILD, { recursive: true, force: true });
fs.mkdirSync(BUILD, { recursive: true });

const pages = {
  'icon-a': iconA, 'icon-b': iconB, 'icon-c': iconC, 'icon-d': iconD,
  'shot-1': shot1, 'shot-2': shot2, 'shot-3': shot3, 'shot-4': shot4,
  'tile': tile,
};
for (const [name, html] of Object.entries(pages)) {
  fs.writeFileSync(path.join(BUILD, `${name}.html`), html);
}
console.log(Object.keys(pages).join(' '));
