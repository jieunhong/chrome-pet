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
      <!-- 꼬리 -->
      <path class="pet-tail" d="M18 52 Q12 48 14 42"
            stroke="#7d5a44" stroke-width="6" fill="none" stroke-linecap="round"/>

      <!-- 몸통 (둥근 타원형) -->
      <ellipse class="pet-body-shape" cx="42" cy="54" rx="22" ry="16" fill="#e8c090"/>
      
      <!-- 다리 -->
      <rect class="pet-leg pet-leg-back-1"  x="28" y="62" width="7" height="10" fill="#7d5a44" rx="3.5"/>
      <rect class="pet-leg pet-leg-back-2"  x="37" y="62" width="7" height="10" fill="#6a4a35" rx="3.5"/>
      <rect class="pet-leg pet-leg-front-1" x="47" y="62" width="7" height="10" fill="#7d5a44" rx="3.5"/>
      <rect class="pet-leg pet-leg-front-2" x="56" y="62" width="7" height="10" fill="#6a4a35" rx="3.5"/>

      <!-- 머리 (둥근 원형) -->
      <circle class="pet-head" cx="58" cy="38" r="16" fill="#e8c090"/>
      
      <!-- 귀 (진한 갈색, 옆으로 축 처진 Puppy 스타일) -->
      <ellipse cx="40" cy="33" rx="6" ry="8" fill="#7d5a44" transform="rotate(20 43 38)"/>
      <ellipse cx="76" cy="33" rx="6" ry="8" fill="#7d5a44" transform="rotate(-20 73 38)"/>

      <!-- 주둥이 영역 (밝은 베이지) -->
      <ellipse cx="58" cy="44" rx="10" ry="8" fill="#f5d4af"/>
      
      <!-- 눈 (검은색 점) -->
      <circle class="pet-eye pet-eye-left"  cx="52" cy="35" r="2.2" fill="#3a2a20"/>
      <circle class="pet-eye pet-eye-right" cx="64" cy="35" r="2.2" fill="#3a2a20"/>

      <!-- 코 (작은 역삼각형) -->
      <path d="M55 40 L61 40 L58 43 Z" fill="#3a2a20" stroke="#3a2a20" stroke-width="1" stroke-linejoin="round"/>
      
      <!-- 입과 혀 -->
      <path d="M55 45 Q58 52 61 45 Z" fill="#ec407a"/>
      <path d="M54 44.5 Q58 47 62 44.5" stroke="#3a2a20" stroke-width="0.8" fill="none" stroke-linecap="round"/>
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

  const DINO = `
    <svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
      <!-- 꼬리 -->
      <path class="pet-tail" d="M16 56 Q6 58 2 62"
            stroke="#6ab04c" stroke-width="8" fill="none"
            stroke-linecap="round"/>
      <!-- 몸통 -->
      <ellipse class="pet-body-shape" cx="40" cy="54" rx="22" ry="17" fill="#6ab04c"/>
      <!-- 배 -->
      <ellipse cx="42" cy="60" rx="14" ry="7" fill="#88d068" opacity="0.5"/>
      <!-- 등 무늬 -->
      <circle cx="34" cy="46" r="2.5" fill="#4a8a32" opacity="0.6"/>
      <circle cx="40" cy="44" r="2" fill="#4a8a32" opacity="0.5"/>
      <circle cx="32" cy="52" r="2" fill="#4a8a32" opacity="0.5"/>
      <circle cx="46" cy="48" r="1.8" fill="#4a8a32" opacity="0.4"/>
      <circle cx="38" cy="50" r="1.5" fill="#4a8a32" opacity="0.4"/>
      <!-- 다리 -->
      <rect class="pet-leg pet-leg-back-1"  x="26" y="63" width="8" height="10" fill="#5a9a3c" rx="3"/>
      <rect class="pet-leg pet-leg-back-2"  x="36" y="63" width="8" height="10" fill="#4a8a32" rx="3"/>
      <rect class="pet-leg pet-leg-front-1" x="46" y="63" width="8" height="10" fill="#5a9a3c" rx="3"/>
      <rect class="pet-leg pet-leg-front-2" x="56" y="63" width="8" height="10" fill="#4a8a32" rx="3"/>
      <!-- 길어진 목 -->
      <path d="M52 48 Q58 36 62 24 Q64 16 68 18"
            stroke="#6ab04c" stroke-width="12" fill="none"
            stroke-linecap="round" stroke-linejoin="round"/>
      <!-- 머리 -->
      <circle class="pet-head" cx="68" cy="18" r="10" fill="#6ab04c"/>
      <!-- 눈 -->
      <circle class="pet-eye pet-eye-left" cx="70" cy="16" r="2.2" fill="#1a1a1a"/>
      <circle cx="71" cy="15" r="0.8" fill="#fff"/>
      <!-- 콧구멍 -->
      <circle cx="75" cy="17" r="0.8" fill="#4a8a32"/>
      <!-- 입 -->
      <path d="M70 20 Q73 23 76 20"
            stroke="#4a8a32" stroke-width="0.8" fill="none" stroke-linecap="round"/>
      <!-- 볼터치 -->
      <circle cx="66" cy="20" r="2" fill="#ff9a9a" opacity="0.3"/>
    </svg>
  `;

  const HOUSE = `
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <!-- 바닥 그림자 -->
      <ellipse cx="50" cy="94" rx="42" ry="3" fill="rgba(0,0,0,0.18)"/>
      <!-- 본체 -->
      <rect x="14" y="42" width="72" height="48" fill="#e8c090" stroke="#6a4a35" stroke-width="2" rx="3"/>
      <!-- 본체 결 -->
      <line x1="14" y1="60" x2="86" y2="60" stroke="#c89668" stroke-width="0.8" opacity="0.5"/>
      <line x1="14" y1="76" x2="86" y2="76" stroke="#c89668" stroke-width="0.8" opacity="0.5"/>
      <!-- 지붕 -->
      <path d="M8 46 L50 12 L92 46 Z" fill="#7d5a44" stroke="#5a3a28" stroke-width="2" stroke-linejoin="round"/>
      <!-- 지붕 하이라이트 -->
      <path d="M14 44 L50 16 L86 44" fill="none" stroke="#9a7a60" stroke-width="1.2" opacity="0.6" stroke-linejoin="round"/>
      <!-- 굴뚝 -->
      <rect x="68" y="20" width="9" height="14" fill="#7d5a44" stroke="#5a3a28" stroke-width="1.5" rx="1"/>
      <rect x="66" y="18" width="13" height="4" fill="#5a3a28" rx="1"/>
      <!-- 출입구 (어두운 아치) -->
      <path d="M30 90 L30 64 Q30 52 50 52 Q70 52 70 64 L70 90 Z" fill="#3a2a20"/>
      <!-- 출입구 안쪽 테두리 -->
      <path d="M32 90 L32 64 Q32 54 50 54 Q68 54 68 64 L68 90"
            fill="none" stroke="#5a3a28" stroke-width="1.2"/>
      <!-- 하트 장식 -->
      <path d="M50 44 C48 41.5 44.5 41.5 44.5 45 C44.5 47.5 50 50.5 50 50.5 C50 50.5 55.5 47.5 55.5 45 C55.5 41.5 52 41.5 50 44 Z"
            fill="#ec407a" opacity="0.85"/>
    </svg>
  `;

  global.PET_SVGS = { cat: CAT, dog: DOG, hamster: HAMSTER, dino: DINO };
  global.PET_NAMES = { cat: 'Ginger Cat', dog: 'Maltese', hamster: 'Hamster', dino: 'Dino' };
  global.PET_LIST = ['cat', 'dog', 'hamster', 'dino'];
  global.DEFAULT_PET = 'cat';
  global.HOUSE_SVG = HOUSE;
})(typeof window !== 'undefined' ? window : self);
