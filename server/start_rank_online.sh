#!/bin/bash
# ランク戦サーバーをこの Mac で動かして、インターネットに公開する
#   使い方:  bash server/start_rank_online.sh
#   止める:  Ctrl + C（サーバーと公開の両方が止まり、ゲームは CPU の相手に戻る）
#
# Cloudflare の無料トンネル（アカウント不要）を使う。起動するたびに URL が変わるので、
# その URL を GitHub の server ブランチの server.json に書き込み、ゲームはそこを見てつなぐ。
# Mac がスリープしたり、このスクリプトを止めたりすると、ランク戦は CPU の相手だけになる。

cd "$(dirname "$0")/.."
PORT=${PORT:-8766}
REPO=xlwsp/mononokatari
LOG=server/cloudflared.log

# 道具（前のゲーム MyGame のものがあれば使う）
CF=$(command -v cloudflared || echo "$HOME/MyGame/tools/bin/cloudflared")
GH=$(command -v gh || echo "$HOME/MyGame/tools/bin/gh")
[ -x "$CF" ] || { echo "cloudflared が見つかりません"; exit 1; }
[ -x "$GH" ] || { echo "gh（GitHub CLI）が見つかりません"; exit 1; }

set_url() {  # server.json に {"api": "<URL>"} を書く（空なら止まっている扱い）
  local JSON CONTENT SHA
  JSON=$(printf '{"api":"%s","updated":"%s"}\n' "$1" "$(date '+%Y-%m-%d %H:%M:%S')")
  CONTENT=$(printf '%s' "$JSON" | base64 | tr -d '\n')
  if ! "$GH" api "repos/$REPO/git/ref/heads/server" >/dev/null 2>&1; then
    MAIN=$("$GH" api "repos/$REPO/git/ref/heads/main" --jq .object.sha)
    "$GH" api -X POST "repos/$REPO/git/refs" -f ref=refs/heads/server -f sha="$MAIN" >/dev/null
  fi
  SHA=$("$GH" api "repos/$REPO/contents/server.json?ref=server" --jq .sha 2>/dev/null)
  "$GH" api -X PUT "repos/$REPO/contents/server.json" -f message="ランク戦サーバーのURLを更新" \
    -f content="$CONTENT" -f branch=server ${SHA:+-f sha="$SHA"} >/dev/null && echo "GitHub にURLを書き込みました: ${1:-（停止）}"
}

cleanup() {
  echo; echo "止めています…"
  kill $SERVER_PID $CF_PID 2>/dev/null
  set_url ""
  exit 0
}
trap cleanup INT TERM

python3 server/rank_server.py $PORT &
SERVER_PID=$!
sleep 1

: > "$LOG"
"$CF" tunnel --url "http://127.0.0.1:$PORT" --no-autoupdate >"$LOG" 2>&1 &
CF_PID=$!

URL=""
for _ in $(seq 1 60); do
  URL=$(grep -oE 'https://[a-z0-9-]+\.trycloudflare\.com' "$LOG" | head -1)
  [ -n "$URL" ] && break
  sleep 1
done
[ -n "$URL" ] || { echo "公開URLが取れませんでした（$LOG を見てね）"; cleanup; }

echo "公開しました: $URL"
set_url "$URL"
echo "ランク戦が本物のプレイヤーどうしでできる状態です。止めるときは Ctrl + C"
wait $SERVER_PID
