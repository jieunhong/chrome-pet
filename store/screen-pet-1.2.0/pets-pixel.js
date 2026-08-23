/*
 * 도트 테마 펫 SVG (공유 파일)
 * - pets.js 다음에 로드되어야 한다 (PET_SVGS / HOUSE_SVG 를 읽어 테마 목록을 만든다)
 * - 20x20 격자를 문자열로 정의하고 빌더가 <rect> 로 펼친다.
 *   픽셀당 rect 를 손으로 쓰면 펫 하나에 400개가 되므로, 가로로 이어진 같은 색은 rect 하나로 합친다.
 * - 파츠 클래스(pet-tail / pet-body-shape / pet-leg-* / pet-head / pet-eye)는 일반 테마와 동일하게 유지한다.
 *   styles.css 의 동작 애니메이션이 전부 CSS transform 기반이라 그대로 재사용된다.
 * - 해부학적 위치(꼬리 밑동, 다리 x, 머리 중심)도 일반 테마에 맞췄다.
 *   CSS 에 [data-pet="hamster"] .pet-tail { transform-origin: 22px 54px } 같은 좌표 고정 규칙이 있기 때문이다.
 */
(function (global) {
  const GRID = 20;
  const PET_CELL = 80 / GRID; // 펫 viewBox 는 80x80
  const HOUSE_CELL = 100 / GRID; // 방석 viewBox 는 100x100

  function rect(cellX, cellY, cellW, cellH, fill, cell, className) {
    const cls = className ? ` class="${className}"` : '';
    return `<rect${cls} x="${cellX * cell}" y="${cellY * cell}"` +
      ` width="${cellW * cell}" height="${cellH * cell}" fill="${fill}"/>`;
  }

  // 한 행에서 같은 색이 연속되면 rect 하나로 합쳐서 노드 수를 줄인다
  function rectsFromRows(part, palette, cell) {
    const out = [];
    part.rows.forEach((row, rowIndex) => {
      let runChar = null;
      let runStart = 0;
      for (let col = 0; col <= row.length; col++) {
        const ch = col < row.length && row[col] !== '.' ? row[col] : null;
        if (ch === runChar) continue;
        if (runChar) {
          out.push(rect(part.x + runStart, part.y + rowIndex, col - runStart, 1, palette[runChar], cell));
        }
        runChar = ch;
        runStart = col;
      }
    });
    return out.join('');
  }

  const layer = (className, part, palette) =>
    `<g class="${className}">${rectsFromRows(part, palette, PET_CELL)}</g>`;

  const LEG_CLASSES = ['pet-leg-back-1', 'pet-leg-back-2', 'pet-leg-front-1', 'pet-leg-front-2'];

  function buildPet(def) {
    const p = def.palette;
    const legClasses = def.legClasses || LEG_CLASSES;
    const legs = def.legs
      .map((leg, i) => layer(`pet-leg ${legClasses[i]}`, leg, p))
      .join('');
    const face = def.face ? rectsFromRows(def.face, p, PET_CELL) : '';
    const eyes = def.eyes
      .map(([cx, cy, w = 1, h = 1], i) => rect(cx, cy, w, h, p.e, PET_CELL,
        `pet-eye ${i === 0 ? 'pet-eye-left' : 'pet-eye-right'}`))
      .join('');

    return `
    <svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">
      ${layer('pet-tail', def.tail, p)}
      ${layer('pet-body-shape', def.body, p)}
      ${legs}
      <g class="pet-head">
        ${rectsFromRows(def.head, p, PET_CELL)}
        ${face}
        ${eyes}
      </g>
    </svg>`;
  }

  const DEFS = {};

  function definePet(name, def) {
    DEFS[name] = def;
    return buildPet(def);
  }

  // 네 다리가 같은 크기의 단색 덩어리인 펫들이 공유하는 형태
  const solidLegs = (positions, colors, w, h) =>
    positions.map(([x, y], i) => ({
      x, y,
      rows: Array.from({ length: h }, () => colors[i % colors.length].repeat(w)),
    }));

  const CAT = definePet('cat', {
    palette: { o: '#e89072', d: '#c8663d', k: '#b55432', p: '#ffc4a8', b: '#ff9a9a', e: '#1a0e08', n: '#7a2d2d' },
    tail: {
      x: 3, y: 9, rows: [
        '.dd',
        '.dd',
        'dd.',
        'dd.',
        '.dd',
      ],
    },
    body: {
      x: 5, y: 8, rows: [
        '...ooooo...',
        '..ooooooo..',
        '.ooooooooo.',
        'ooooooooooo',
        'ooooooooooo',
        '.ooooooooo.',
        '..ddddddd..',
      ],
    },
    legs: solidLegs([[7, 15], [9, 15], [12, 15], [14, 15]], ['d', 'k'], 2, 3),
    head: {
      x: 11, y: 4, rows: [
        'd.....d',
        'dp...pd',
        'ooooooo',
        'ooooooo',
        'ooooooo',
        'ooooooo',
        '.ooooo.',
        '..ddd..',
      ],
    },
    face: { x: 11, y: 9, rows: ['b..n..b'] },
    eyes: [[12, 7], [16, 7]],
  });

  const DOG = definePet('dog', {
    palette: { o: '#e8c090', d: '#7d5a44', k: '#6a4a35', m: '#f5d4af', e: '#3a2a20', t: '#ec407a' },
    tail: {
      x: 3, y: 10, rows: [
        'dd',
        'dd',
        'dd',
        'dd',
      ],
    },
    body: {
      x: 5, y: 9, rows: [
        '...ooooo...',
        '..ooooooo..',
        '.ooooooooo.',
        'ooooooooooo',
        'ooooooooooo',
        '.ooooooooo.',
        '..ddddddd..',
      ],
    },
    legs: solidLegs([[7, 16], [9, 16], [12, 16], [14, 16]], ['d', 'k'], 2, 2),
    // 얼굴 코어는 7칸(홀수). 짝수면 정중앙 칸이 없어 코가 늘 2px 틀어진다.
    head: {
      x: 9, y: 6, rows: [
        '...ooooo...',
        '..ooooooo..',
        'ddooooooodd',
        'ddommmmmodd',
        'ddommmmmodd',
        'dd.mmmmm.dd',
        '.d.......d.',
      ],
    },
    // 코(위)와 혀(아래) 사이를 한 칸 띄운다
    face: {
      x: 9, y: 9, rows: [
        '.....e.....',
        '...........',
        '.....t.....',
      ],
    },
    eyes: [[12, 8], [16, 8]],
  });

  // 흰 몸에 흰 파츠라 형태가 안 읽힌다. f 로 처진 귀를, s 로 아래쪽 음영을 준다
  const MALTESE_WHITE = definePet('maltese_white', {
    palette: { w: '#ffffff', f: '#f0e9f0', s: '#e3dbe3', p: '#ffccd5', b: '#ffd9e0', e: '#111111', n: '#000000' },
    tail: {
      x: 4, y: 12, rows: [
        '.ww',
        'www',
        '.ss',
      ],
    },
    body: {
      x: 6, y: 10, rows: [
        '..wwwwww..',
        '.wwwwwwww.',
        'wwwwwwwwww',
        'wwwwwwwwww',
        '.wwwwwwww.',
        '..ssssss..',
      ],
    },
    // 일반 테마와 동일하게 앞다리 두 개만 둔다
    legClasses: ['pet-leg-front-1', 'pet-leg-front-2'],
    legs: [
      { x: 8, y: 16, rows: ['ww', 'pp'] },
      { x: 11, y: 16, rows: ['ww', 'pp'] },
    ],
    head: {
      x: 5, y: 5, rows: [
        '..wwwwwww..',
        '.fwwwwwwwf.',
        'ffwwwwwwwff',
        'ffwwwwwwwff',
        '.fwwwwwwwf.',
        '..sssssss..',
      ],
    },
    face: { x: 5, y: 8, rows: ['..b..n..b..'] },
    eyes: [[8, 7], [12, 7]],
  });

  const HAMSTER = definePet('hamster', {
    palette: { o: '#f4d19b', d: '#e8c89a', k: '#d4a574', c: '#c89668', p: '#ff9a9a', l: '#fff0d4', e: '#1a0e08', n: '#7a2d2d' },
    tail: { x: 5, y: 13, rows: ['d'] },
    body: {
      x: 6, y: 9, rows: [
        '....oooo....',
        '..oooooooo..',
        '.oooooooooo.',
        'oooooooooooo',
        'oooooooooooo',
        '.llllllllll.',
        '..kkkkkkkk..',
      ],
    },
    legs: solidLegs([[8, 16], [10, 16], [13, 16], [15, 16]], ['d', 'k'], 2, 2),
    head: {
      x: 11, y: 5, rows: [
        '.c.....c.',
        'ccc...ccc',
        'cpc...cpc',
        '.ooooooo.',
        'ooooooooo',
        'ooooooooo',
        'ooooooooo',
        '.ddddddd.',
        '..ooooo..',
      ],
    },
    face: { x: 11, y: 11, rows: ['..p.n.p..'] },
    eyes: [[13, 10], [17, 10]],
  });

  // 목이 머리 그룹에 포함된다 (일반 테마도 목 path 가 .pet-head 안에 있다)
  const DINO = definePet('dino', {
    palette: { g: '#6ab04c', d: '#5a9a3c', k: '#4a8a32', l: '#88d068', p: '#ff9a9a', e: '#1a1a1a' },
    tail: {
      x: 0, y: 14, rows: [
        '...gg',
        'ggg..',
      ],
    },
    body: {
      x: 5, y: 9, rows: [
        '...ggggg...',
        '..gkggkgg..',
        '.ggggkgggg.',
        'gggkgggggkg',
        'ggggggggggg',
        '.lllllllll.',
        '..kkkkkkk..',
      ],
    },
    legs: solidLegs([[6, 16], [9, 16], [11, 16], [14, 16]], ['d', 'k'], 2, 2),
    head: {
      x: 12, y: 2, rows: [
        '....gggg',
        '...ggggg',
        '...ggggg',
        '...ggggg',
        '....gggg',
        '...ggg..',
        '..ggg...',
        '..ggg...',
        '.ggg....',
        '.ggg....',
        'ggg.....',
        'ggg.....',
      ],
    },
    face: { x: 16, y: 5, rows: ['p.k'] },
    // 옆모습이라 일반 테마와 마찬가지로 눈은 하나
    eyes: [[17, 4]],
  });

  const CUSHION = `
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">
      ${rectsFromRows(
    {
      x: 2, y: 11, rows: [
        '....cccccccc....',
        '..cccccccccccc..',
        '.cccccccccccccc.',
        'cccccwwwwwwccccc',
        'cccwwwwwwwwwwccc',
        'cccwwwwwwwwwwccc',
        '.ccccwwwwwwcccc.',
        '..ssssssssssss..',
      ],
    },
    { c: '#fff5e6', w: '#ffffff', s: '#f3e0c0' },
    HOUSE_CELL,
  )}
    </svg>`;

  const PET_SVGS_PIXEL = {
    cat: CAT,
    dog: DOG,
    maltese_white: MALTESE_WHITE,
    hamster: HAMSTER,
    dino: DINO,
  };

  global.PET_SVGS_PIXEL = PET_SVGS_PIXEL;
  // 미리보기에서 머리 시안을 갈아끼워 보기 위해 정의와 빌더를 노출한다
  global.PIXEL_PET_DEFS = DEFS;
  global.buildPixelPet = buildPet;
  global.HOUSE_SVG_PIXEL = CUSHION;

  global.PET_THEMES = {
    normal: { pets: global.PET_SVGS, house: global.HOUSE_SVG },
    pixel: { pets: PET_SVGS_PIXEL, house: CUSHION },
  };
  global.PET_THEME_LIST = ['normal', 'pixel'];
  global.PET_THEME_NAMES = { normal: 'Normal', pixel: 'Pixel' };
  global.DEFAULT_THEME = 'normal';
})(typeof window !== 'undefined' ? window : self);
