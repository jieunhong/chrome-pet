#!/bin/sh
# 웹스토어 업로드용 zip 을 만든다.
#
# 폴더를 통째로 압축하지 않고 화이트리스트로 담는다.
# dev-harness.html / dev-preview.html / store/ / .DS_Store 가 섞여 들어가면
# 확장에 쓰이지 않는 파일이 배포본에 남는다.
set -e
cd "$(dirname "$0")/.."

FILES="manifest.json
popup.html
popup.js
content.js
pets.js
pets-pixel.js
styles.css
icons/icon16.png
icons/icon48.png
icons/icon128.png"

# manifest 가 참조하는데 목록에 없는 파일이 있으면 여기서 걸린다.
# (pets-pixel.js 를 추가하고 목록에 안 넣는 식의 실수를 막는다)
node -e '
const m = require("./manifest.json");
const referenced = new Set([
  m.action?.default_popup,
  ...Object.values(m.action?.default_icon || {}),
  ...Object.values(m.icons || {}),
  ...(m.content_scripts || []).flatMap((c) => [...(c.js || []), ...(c.css || [])]),
  ...(m.web_accessible_resources || []).flatMap((r) => r.resources || []),
  m.background?.service_worker,
].filter(Boolean));
const packaged = new Set(process.argv[1].split("\n"));
const missing = [...referenced].filter((f) => !packaged.has(f));
if (missing.length) {
  console.error("manifest 가 참조하지만 패키지 목록에 없음:\n  " + missing.join("\n  "));
  process.exit(1);
}
' "$FILES"

VERSION=$(node -p "require('./manifest.json').version")
OUT="store/screen-pet-$VERSION.zip"

for f in $FILES; do
  [ -f "$f" ] || { echo "파일 없음: $f" >&2; exit 1; }
done

rm -f "$OUT"
# -X: macOS 확장 속성/리소스 포크를 빼고 담는다
zip -q -X "$OUT" $FILES

echo "$OUT"
unzip -l "$OUT"
