/*
 * 펫 SVG 정의 (공유 파일)
 * - content.js 와 popup.js 양쪽에서 사용
 * - 모든 펫은 viewBox="0 0 80 80" 기준으로 그림
 * - 애니메이션용 공통 클래스:
 *     .pet-tail, .pet-body-shape, .pet-head,
 *     .pet-leg-back-1 / .pet-leg-back-2 / .pet-leg-front-1 / .pet-leg-front-2,
 *     .pet-eye (.pet-eye-left, .pet-eye-right)
 */
(function (global) {
  const CAT = `
    <svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
      <path class="pet-tail" d="M18 52 Q6 48 10 32"
            stroke="#c8663d" stroke-width="6" fill="none" stroke-linecap="round"/>
      <ellipse class="pet-body-shape" cx="42" cy="52" rx="22" ry="16" fill="#e89072"/>
      <rect class="pet-leg pet-leg-back-1"  x="28" y="60" width="6" height="11" fill="#c8663d" rx="2"/>
      <rect class="pet-leg pet-leg-back-2"  x="36" y="60" width="6" height="11" fill="#b55432" rx="2"/>
      <rect class="pet-leg pet-leg-front-1" x="48" y="60" width="6" height="11" fill="#c8663d" rx="2"/>
      <rect class="pet-leg pet-leg-front-2" x="56" y="60" width="6" height="11" fill="#b55432" rx="2"/>
      <circle class="pet-head" cx="58" cy="38" r="14" fill="#e89072"/>
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
    </svg>
  `;

  const DOG = `
    <svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
      <!-- 살짝 말린 꼬리 -->
      <path class="pet-tail" d="M18 50 Q6 44 12 32 Q18 28 16 38"
            stroke="#8b5a2b" stroke-width="5" fill="none"
            stroke-linecap="round" stroke-linejoin="round"/>
      <!-- 몸통 -->
      <ellipse class="pet-body-shape" cx="42" cy="52" rx="24" ry="15" fill="#d4a574"/>
      <!-- 배 포인트 -->
      <ellipse cx="42" cy="58" rx="16" ry="5" fill="#f0d5a8" opacity="0.6"/>
      <!-- 다리 -->
      <rect class="pet-leg pet-leg-back-1"  x="26" y="60" width="7" height="12" fill="#8b5a2b" rx="2"/>
      <rect class="pet-leg pet-leg-back-2"  x="35" y="60" width="7" height="12" fill="#6d4420" rx="2"/>
      <rect class="pet-leg pet-leg-front-1" x="48" y="60" width="7" height="12" fill="#8b5a2b" rx="2"/>
      <rect class="pet-leg pet-leg-front-2" x="57" y="60" width="7" height="12" fill="#6d4420" rx="2"/>
      <!-- 발바닥 -->
      <rect x="26" y="70" width="7" height="2" fill="#4a2d15" rx="1"/>
      <rect x="35" y="70" width="7" height="2" fill="#4a2d15" rx="1"/>
      <rect x="48" y="70" width="7" height="2" fill="#4a2d15" rx="1"/>
      <rect x="57" y="70" width="7" height="2" fill="#4a2d15" rx="1"/>
      <!-- 머리 -->
      <ellipse class="pet-head" cx="58" cy="38" rx="15" ry="13" fill="#d4a574"/>
      <!-- 주둥이 -->
      <ellipse cx="70" cy="42" rx="8" ry="5.5" fill="#e8c89a"/>
      <!-- 늘어진 귀 -->
      <ellipse cx="49" cy="40" rx="4" ry="9" fill="#6d4420"
               transform="rotate(-20 49 32)"/>
      <ellipse cx="67" cy="40" rx="4" ry="9" fill="#6d4420"
               transform="rotate(20 67 32)"/>
      <!-- 눈 -->
      <ellipse class="pet-eye pet-eye-left"  cx="56" cy="37" rx="1.8" ry="2.3" fill="#1a0e08"/>
      <ellipse class="pet-eye pet-eye-right" cx="64" cy="37" rx="1.8" ry="2.3" fill="#1a0e08"/>
      <circle cx="56.3" cy="36.3" r="0.6" fill="#fff"/>
      <circle cx="64.3" cy="36.3" r="0.6" fill="#fff"/>
      <!-- 코 -->
      <ellipse cx="75" cy="41" rx="2" ry="1.5" fill="#1a0e08"/>
      <!-- 입 -->
      <path d="M75 42.5 Q73 46 70 45 M75 42.5 Q76 46 74 45"
            stroke="#1a0e08" stroke-width="0.7" fill="none" stroke-linecap="round"/>
      <!-- 혀 -->
      <ellipse cx="72" cy="46" rx="2" ry="1.3" fill="#ff7a8a" opacity="0.9"/>
    </svg>
  `;

  const HAMSTER = `
    <svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
      <!-- 동글동글한 작은 꼬리 -->
      <ellipse class="pet-tail" cx="22" cy="54" rx="3" ry="2.5" fill="#e8c89a"/>
      <!-- 둥근 몸통 -->
      <ellipse class="pet-body-shape" cx="48" cy="54" rx="22" ry="17" fill="#f4d19b"/>
      <!-- 배 하이라이트 -->
      <ellipse cx="48" cy="60" rx="15" ry="6" fill="#fff0d4" opacity="0.7"/>
      <!-- 짧은 다리 -->
      <rect class="pet-leg pet-leg-back-1"  x="34" y="65" width="5" height="7" fill="#e8c89a" rx="2"/>
      <rect class="pet-leg pet-leg-back-2"  x="41" y="65" width="5" height="7" fill="#d4a574" rx="2"/>
      <rect class="pet-leg pet-leg-front-1" x="52" y="65" width="5" height="7" fill="#e8c89a" rx="2"/>
      <rect class="pet-leg pet-leg-front-2" x="59" y="65" width="5" height="7" fill="#d4a574" rx="2"/>
      <!-- 머리 (몸통 위에) -->
      <circle class="pet-head" cx="60" cy="42" r="14" fill="#f4d19b"/>
      <!-- 통통한 볼살 -->
      <ellipse cx="53" cy="47" rx="5" ry="4" fill="#e8c89a"/>
      <ellipse cx="67" cy="47" rx="5" ry="4" fill="#e8c89a"/>
      <!-- 작고 둥근 귀 -->
      <circle cx="52" cy="32" r="3.5" fill="#c89668"/>
      <circle cx="68" cy="32" r="3.5" fill="#c89668"/>
      <circle cx="52" cy="33" r="2" fill="#ff9a9a"/>
      <circle cx="68" cy="33" r="2" fill="#ff9a9a"/>
      <!-- 큰 눈 -->
      <ellipse class="pet-eye pet-eye-left"  cx="55" cy="40" rx="2" ry="2.5" fill="#1a0e08"/>
      <ellipse class="pet-eye pet-eye-right" cx="65" cy="40" rx="2" ry="2.5" fill="#1a0e08"/>
      <circle cx="55.5" cy="39.2" r="0.7" fill="#fff"/>
      <circle cx="65.5" cy="39.2" r="0.7" fill="#fff"/>
      <!-- 작은 코 -->
      <ellipse cx="60" cy="45.5" rx="1.2" ry="0.9" fill="#7a2d2d"/>
      <!-- 입 -->
      <path d="M60 46.5 L60 48"
            stroke="#7a2d2d" stroke-width="0.7" fill="none" stroke-linecap="round"/>
      <!-- 앞니 -->
      <rect x="58.8" y="48" width="2.4" height="2.2" fill="#fff" rx="0.3" stroke="#d4b088" stroke-width="0.2"/>
      <line x1="60" y1="48" x2="60" y2="50.2" stroke="#d4b088" stroke-width="0.3"/>
      <!-- 볼터치 -->
      <circle cx="50" cy="45" r="2.2" fill="#ff9a9a" opacity="0.45"/>
      <circle cx="70" cy="45" r="2.2" fill="#ff9a9a" opacity="0.45"/>
    </svg>
  `;

  global.PET_SVGS = { cat: CAT, dog: DOG, hamster: HAMSTER };
  global.PET_NAMES = { cat: '고양이', dog: '강아지', hamster: '햄스터' };
  global.PET_LIST = ['cat', 'dog', 'hamster'];
  global.DEFAULT_PET = 'cat';
})(typeof window !== 'undefined' ? window : self);
