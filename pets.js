/*
 * 펫 SVG 정의 (공유 파일)
 * - content.js 와 popup.js 양쪽에서 사용
 * - 모든 펫은 viewBox="0 0 80 80" 기준으로 그림
 */
(function (global) {
  const CAT = `
    <svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
      <path class="pet-tail" d="M18 52 Q6 48 10 32"
            stroke="#c8663d" stroke-width="6" fill="none" stroke-linecap="round"/>
      <ellipse class="pet-body-shape" cx="42" cy="52" rx="22" ry="18" fill="#e89072"/>
      <rect class="pet-leg pet-leg-back-1"  x="28" y="60" width="6" height="11" fill="#c8663d" rx="2"/>
      <rect class="pet-leg pet-leg-back-2"  x="36" y="60" width="6" height="11" fill="#b55432" rx="2"/>
      <rect class="pet-leg pet-leg-front-1" x="48" y="60" width="6" height="11" fill="#c8663d" rx="2"/>
      <rect class="pet-leg pet-leg-front-2" x="56" y="60" width="6" height="11" fill="#b55432" rx="2"/>
      <g class="pet-head">
        <circle cx="58" cy="38" r="14" fill="#e89072"/>
        <path d="M48 30 L50 20 L55 27 Z" fill="#c8663d"/>
        <path d="M62 27 L66 19 L68 29 Z" fill="#c8663d"/>
        <path d="M50 26 L51 22 L53 26 Z" fill="#ffc4a8"/>
        <path d="M64 25 L65 22 L66 27 Z" fill="#ffc4a8"/>
        <ellipse class="pet-eye pet-eye-left"  cx="54" cy="37" rx="1.8" ry="2.5" fill="#1a0e08"/>
        <ellipse class="pet-eye pet-eye-right" cx="62" cy="37" rx="1.8" ry="2.5" fill="#1a0e08"/>
        <circle cx="54.5" cy="36.3" r="0.6" fill="#fff"/>
        <circle cx="62.5" cy="36.3" r="0.6" fill="#fff"/>
        <path d="M57 41 L59 41 L58 42.5 Z" fill="#7a2d2d"/>
        <path d="M58 42.5 Q56 44 55 43 M58 42.5 Q60 44 61 43"
              stroke="#7a2d2d" stroke-width="0.8" fill="none" stroke-linecap="round"/>
        <circle cx="50" cy="42" r="2" fill="#ff9a9a" opacity="0.5"/>
        <circle cx="66" cy="42" r="2" fill="#ff9a9a" opacity="0.5"/>
      </g>
    </svg>
  `;

  const DOG = `
    <svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
      <path class="pet-tail" d="M18 52 Q12 48 14 42"
            stroke="#7d5a44" stroke-width="6" fill="none" stroke-linecap="round"/>
      <ellipse class="pet-body-shape" cx="42" cy="54" rx="22" ry="18" fill="#e8c090"/>
      <rect class="pet-leg pet-leg-back-1"  x="28" y="62" width="7" height="10" fill="#7d5a44" rx="3.5"/>
      <rect class="pet-leg pet-leg-back-2"  x="37" y="62" width="7" height="10" fill="#6a4a35" rx="3.5"/>
      <rect class="pet-leg pet-leg-front-1" x="47" y="62" width="7" height="10" fill="#7d5a44" rx="3.5"/>
      <rect class="pet-leg pet-leg-front-2" x="56" y="62" width="7" height="10" fill="#6a4a35" rx="3.5"/>
      <g class="pet-head">
        <circle cx="58" cy="38" r="16" fill="#e8c090"/>
        <ellipse cx="40" cy="33" rx="6" ry="8" fill="#7d5a44" transform="rotate(20 43 38)"/>
        <ellipse cx="76" cy="33" rx="6" ry="8" fill="#7d5a44" transform="rotate(-20 73 38)"/>
        <ellipse cx="58" cy="44" rx="10" ry="8" fill="#f5d4af"/>
        <circle class="pet-eye pet-eye-left"  cx="52" cy="35" r="2.2" fill="#3a2a20"/>
        <circle class="pet-eye pet-eye-right" cx="64" cy="35" r="2.2" fill="#3a2a20"/>
        <path d="M55 40 L61 40 L58 43 Z" fill="#3a2a20" stroke="#3a2a20" stroke-width="1" stroke-linejoin="round"/>
        <path d="M55 45 Q58 52 61 45 Z" fill="#ec407a"/>
        <path d="M54 44.5 Q58 47 62 44.5" stroke="#3a2a20" stroke-width="0.8" fill="none" stroke-linecap="round"/>
      </g>
    </svg>
  `;

  // 새로운 흰색 말티즈 추가 (더 몽글몽글하고 솜사탕 같은 버전)
  const MALTESE_WHITE = `
    <svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
      <!-- 솜사탕 같은 꼬리 -->
      <circle class="pet-tail" cx="22" cy="55" r="7" fill="#ffffff" />
      
      <!-- 위아래로 더 몽글몽글한 몸체 (크기 약간 축소) -->
      <g fill="#ffffff">
        <circle class="pet-body-shape" cx="42" cy="55" r="18"/> <!-- 몸 중심 -->
        <!-- 주변 털 몽글몽글 -->
        <circle cx="32" cy="48" r="8" fill="#ffffff"/>
        <circle cx="52" cy="48" r="8" fill="#ffffff"/>
        <circle cx="30" cy="62" r="8" fill="#ffffff"/>
        <circle cx="54" cy="62" r="8" fill="#ffffff"/>
      </g>
      
      <!-- 다리와 핑크 발바닥 -->
      <g class="pet-leg pet-leg-front-1">
        <circle cx="36" cy="68" r="5" fill="#ffffff"/>
        <circle cx="36" cy="69" r="2.2" fill="#ffccd5" opacity="0.8"/>
      </g>
      <g class="pet-leg pet-leg-front-2">
        <circle cx="48" cy="68" r="5" fill="#ffffff"/>
        <circle cx="48" cy="69" r="2.2" fill="#ffccd5" opacity="0.8"/>
      </g>
      
      <!-- 머리 그룹 (더 동그랗고 털 속에 파묻힌 느낌) -->
      <g class="pet-head">
        <circle cx="42" cy="37" r="16" fill="#ffffff"/> <!-- 머리 중심 -->
        <!-- 머리 털 굴곡 -->
        <circle cx="34" cy="30" r="8" fill="#ffffff"/>
        <circle cx="50" cy="30" r="8" fill="#ffffff"/>
        
        <!-- 눈 (반짝이는 검은 구슬) -->
        <circle class="pet-eye pet-eye-left" cx="35" cy="38" r="2.8" fill="#111111"/>
        <circle class="pet-eye pet-eye-right" cx="49" cy="38" r="2.8" fill="#111111"/>
        <circle cx="35.6" cy="37" r="0.8" fill="#ffffff" opacity="0.9"/>
        <circle cx="49.6" cy="37" r="0.8" fill="#ffffff" opacity="0.9"/>
        
        <!-- 코와 입 (작고 소중하게) -->
        <ellipse cx="42" cy="43" rx="2.2" ry="1.8" fill="#000000"/>
        <path d="M40 45.2 Q42 46.5 44 45.2" stroke="#444" stroke-width="0.7" fill="none" stroke-linecap="round"/>
        
        <!-- 볼터치 (아주 연하게) -->
        <circle cx="32" cy="43" r="3.5" fill="#ffebef" opacity="0.35"/>
        <circle cx="52" cy="43" r="3.5" fill="#ffebef" opacity="0.35"/>
      </g>
    </svg>
  `;

  const HAMSTER = `
    <svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
      <ellipse class="pet-tail" cx="22" cy="54" rx="3" ry="2.5" fill="#e8c89a"/>
      <ellipse class="pet-body-shape" cx="48" cy="54" rx="22" ry="19" fill="#f4d19b"/>
      <ellipse cx="48" cy="60" rx="15" ry="6" fill="#fff0d4" opacity="0.7"/>
      <rect class="pet-leg pet-leg-back-1"  x="34" y="65" width="5" height="7" fill="#e8c89a" rx="2"/>
      <rect class="pet-leg pet-leg-back-2"  x="41" y="65" width="5" height="7" fill="#d4a574" rx="2"/>
      <rect class="pet-leg pet-leg-front-1" x="52" y="65" width="5" height="7" fill="#e8c89a" rx="2"/>
      <rect class="pet-leg pet-leg-front-2" x="59" y="65" width="5" height="7" fill="#d4a574" rx="2"/>
      <g class="pet-head">
        <circle cx="60" cy="42" r="14" fill="#f4d19b"/>
        <ellipse cx="53" cy="47" rx="5" ry="4" fill="#e8c89a"/>
        <ellipse cx="67" cy="47" rx="5" ry="4" fill="#e8c89a"/>
        <circle cx="52" cy="32" r="3.5" fill="#c89668"/>
        <circle cx="68" cy="32" r="3.5" fill="#c89668"/>
        <circle cx="52" cy="33" r="2" fill="#ff9a9a"/>
        <circle cx="68" cy="33" r="2" fill="#ff9a9a"/>
        <ellipse class="pet-eye pet-eye-left"  cx="55" cy="40" rx="2" ry="2.5" fill="#1a0e08"/>
        <ellipse class="pet-eye pet-eye-right" cx="65" cy="40" rx="2" ry="2.5" fill="#1a0e08"/>
        <circle cx="55.5" cy="39.2" r="0.7" fill="#fff"/>
        <circle cx="65.5" cy="39.2" r="0.7" fill="#fff"/>
        <ellipse cx="60" cy="45.5" rx="1.2" ry="0.9" fill="#7a2d2d"/>
        <path d="M60 46.5 L60 48"
              stroke="#7a2d2d" stroke-width="0.7" fill="none" stroke-linecap="round"/>
        <rect x="58.8" y="48" width="2.4" height="2.2" fill="#fff" rx="0.3" stroke="#d4b088" stroke-width="0.2"/>
        <line x1="60" y1="48" x2="60" y2="50.2" stroke="#d4b088" stroke-width="0.3"/>
        <circle cx="50" cy="45" r="2.2" fill="#ff9a9a" opacity="0.45"/>
        <circle cx="70" cy="45" r="2.2" fill="#ff9a9a" opacity="0.45"/>
      </g>
    </svg>
  `;

  const DINO = `
    <svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
      <path class="pet-tail" d="M16 56 Q6 58 2 62"
            stroke="#6ab04c" stroke-width="8" fill="none"
            stroke-linecap="round"/>
      <ellipse class="pet-body-shape" cx="40" cy="54" rx="22" ry="19" fill="#6ab04c"/>
      <ellipse cx="42" cy="60" rx="14" ry="7" fill="#88d068" opacity="0.5"/>
      <circle cx="34" cy="46" r="2.5" fill="#4a8a32" opacity="0.6"/>
      <circle cx="40" cy="44" r="2" fill="#4a8a32" opacity="0.5"/>
      <circle cx="32" cy="52" r="2" fill="#4a8a32" opacity="0.5"/>
      <circle cx="46" cy="48" r="1.8" fill="#4a8a32" opacity="0.4"/>
      <circle cx="38" cy="50" r="1.5" fill="#4a8a32" opacity="0.4"/>
      <rect class="pet-leg pet-leg-back-1"  x="26" y="63" width="8" height="10" fill="#5a9a3c" rx="3"/>
      <rect class="pet-leg pet-leg-back-2"  x="36" y="63" width="8" height="10" fill="#4a8a32" rx="3"/>
      <rect class="pet-leg pet-leg-front-1" x="46" y="63" width="8" height="10" fill="#5a9a3c" rx="3"/>
      <rect class="pet-leg pet-leg-front-2" x="56" y="63" width="8" height="10" fill="#4a8a32" rx="3"/>
      <g class="pet-head">
        <path d="M52 48 Q58 36 62 24 Q64 16 68 18"
              stroke="#6ab04c" stroke-width="12" fill="none"
              stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="68" cy="18" r="10" fill="#6ab04c"/>
        <circle class="pet-eye pet-eye-left" cx="70" cy="16" r="2.2" fill="#1a1a1a"/>
        <circle cx="71" cy="15" r="0.8" fill="#fff"/>
        <circle cx="75" cy="17" r="0.8" fill="#4a8a32"/>
        <path d="M70 20 Q73 23 76 20"
              stroke="#4a8a32" stroke-width="0.8" fill="none" stroke-linecap="round"/>
        <circle cx="66" cy="20" r="2" fill="#ff9a9a" opacity="0.3"/>
      </g>
    </svg>
  `;

  const CUSHION = `
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="50" cy="92" rx="46" ry="6" fill="rgba(0,0,0,0.1)"/>
      <g fill="#fff5e6" stroke="#f3e0c0" stroke-width="0.5">
        <circle cx="50" cy="64" r="14"/>
        <circle cx="68" cy="68" r="14"/>
        <circle cx="82" cy="78" r="14"/>
        <circle cx="70" cy="88" r="14"/>
        <circle cx="50" cy="92" r="14"/>
        <circle cx="30" cy="88" r="14"/>
        <circle cx="18" cy="78" r="14"/>
        <circle cx="32" cy="68" r="14"/>
      </g>
      <ellipse cx="50" cy="78" rx="26" ry="14" fill="#ffffff"/>
      <ellipse cx="50" cy="78" rx="22" ry="11" fill="#fff9f0" opacity="0.6"/>
      <g opacity="0.2" fill="none" stroke="#d4b088" stroke-width="0.5" stroke-linecap="round">
        <path d="M42 66 Q50 64 58 66" />
        <path d="M70 72 Q76 78 72 84" />
        <path d="M30 72 Q24 78 28 84" />
      </g>
    </svg>
  `;

  global.PET_SVGS = { cat: CAT, dog: DOG, maltese_white: MALTESE_WHITE, hamster: HAMSTER, dino: DINO };
  global.PET_NAMES = {
    cat: 'Ginger Cat',
    dog: 'Maltese (Brown)',
    maltese_white: 'White Maltese',
    hamster: 'Hamster',
    dino: 'Dino'
  };
  global.PET_LIST = ['cat', 'dog', 'maltese_white', 'hamster', 'dino'];
  global.DEFAULT_PET = 'cat';
  global.HOUSE_SVG = CUSHION;
})(typeof window !== 'undefined' ? window : self);
