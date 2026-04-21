# Screen Pet 🐾 - 화면 펫 확장프로그램 v1.1

브라우저 화면을 뛰어다니는 귀여운 동물 친구!
**고양이 🐱 / 강아지 🐶 / 햄스터 🐹** 중에서 고를 수 있어요.

## 설치 방법

1. 폴더 압축 해제 (이미 풀려있다면 OK)
2. 크롬 주소창에 `chrome://extensions` 입력
3. 우측 상단 **"개발자 모드"** 토글 ON
4. 좌측 상단 **"압축해제된 확장 프로그램을 로드합니다"** 클릭
5. 이 `screen-pet` 폴더 선택
6. 아무 웹페이지 열기 (기존에 열려 있던 탭은 새로고침)

## 펫 바꾸기

크롬 우측 상단 **확장프로그램 아이콘** 클릭 → 팝업에서 원하는 펫 카드 클릭
→ **모든 탭에 즉시 반영** (새로고침 불필요!)

## 조작법

| 동작 | 결과 |
|---|---|
| **드래그** | 펫을 집어서 원하는 위치로 이동 (놓으면 중력으로 떨어짐) |
| **더블클릭** | 점프하며 반가워함 ♡ |
| **우클릭** | 숨기기 / 다시 보이기 |
| **커서를 화면 하단에** | 펫이 커서를 쫓아옴 |

## 펫별 특징

- **🐱 고양이**: 긴 꼬리를 살랑살랑
- **🐶 강아지**: 꼬리 말고 있고 빠르게 살랑살랑, 혀 내밀고 있음
- **🐹 햄스터**: 볼살 빵빵, 앞니 뾰족, 꼬리 거의 없음 (앉아있을 때 살짝 씰룩)

## 파일 구조

```
screen-pet/
├── manifest.json     # 확장프로그램 설정
├── pets.js           # 3종 펫 SVG 공유 정의 (content & popup 양쪽 사용)
├── content.js        # 펫 동작 로직 (물리, 상태머신, 마우스 상호작용)
├── styles.css        # 스타일 및 애니메이션
├── popup.html        # 팝업 UI (펫 선택)
├── popup.js          # 팝업 로직 (선택 → chrome.storage.local 저장)
├── icons/            # 확장프로그램 아이콘
└── README.md
```

## 동작 원리

- `popup.js`가 `chrome.storage.local.set({pet: 'dog'})` 로 저장
- `content.js`가 `chrome.storage.onChanged` 리스너로 감지
- innerHTML을 새 SVG로 교체 → 모든 탭에서 즉시 바뀜

## 새 동물 추가하는 법

1. `pets.js`의 PET_SVGS 객체에 새 항목 추가:
   ```js
   const RABBIT = `<svg viewBox="0 0 80 80">...</svg>`;
   global.PET_SVGS = { cat: CAT, dog: DOG, hamster: HAMSTER, rabbit: RABBIT };
   global.PET_NAMES = { ..., rabbit: '토끼' };
   global.PET_LIST = ['cat', 'dog', 'hamster', 'rabbit'];
   ```
2. SVG에 필수 클래스를 꼭 포함:
   - `.pet-tail`, `.pet-body-shape`, `.pet-head`
   - `.pet-leg .pet-leg-back-1` / `pet-leg-back-2` / `pet-leg-front-1` / `pet-leg-front-2`
   - `.pet-eye .pet-eye-left` / `pet-eye-right`
3. 필요하면 `styles.css`에 `#screen-pet[data-pet="rabbit"] ...`로 개별 조정

## 커스터마이징 팁

- **속도**: `content.js`의 `vx = Math.sign(dx) * 1.8` (걷기) / `4.5` (뛰기) / `5.5` (추격)
- **크기**: `styles.css`의 `#screen-pet { width: 80px; height: 80px; }` + `content.js`의 `PET_W/PET_H`
- **특정 사이트 제외**: `manifest.json`의 `matches` 수정
