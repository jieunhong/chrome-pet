#!/bin/sh
# 스토어 자산을 PNG 로 굽는다. Chrome 헤드리스가 실제 styles.css 를 물려야 하므로
# 로컬 http 서버를 잠깐 띄운다 (file:// 은 하위 리소스 로딩이 막힌다).
set -e
cd "$(dirname "$0")/.."

CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
PORT=8799

node store/build.js >/dev/null
mkdir -p store/out

python3 -m http.server "$PORT" --bind 127.0.0.1 >/dev/null 2>&1 &
SERVER=$!
trap 'kill $SERVER 2>/dev/null' EXIT
until curl -sf -o /dev/null "http://127.0.0.1:$PORT/store/build/tile.html"; do sleep 0.2; done

render() {
  "$CHROME" --headless --disable-gpu --hide-scrollbars \
    --default-background-color=00000000 --force-device-scale-factor=1 \
    --window-size="$2,$3" --screenshot="store/out/$1.png" \
    "http://127.0.0.1:$PORT/store/build/$1.html" >/dev/null 2>&1
  printf '  %-10s %s\n' "$1.png" "$(sips -g pixelWidth -g pixelHeight "store/out/$1.png" | tr -d ' \n' | sed 's/.*pixelWidth:\([0-9]*\)pixelHeight:\([0-9]*\)/\1x\2/')"
}

for sz in 128 48 16; do render "icon$sz" "$sz" "$sz"; done
for i in 1 2 3 4; do render "shot-$i" 1280 800; done
render tile 440 280
