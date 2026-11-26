// ランク戦サーバーとのやりとり。つながらないときは null を返し、呼ぶ側がCPUの相手に切り替える
import { RANK_SERVER, GITHUB_REPO } from './config.js';

// サーバーのURLを決める（1回だけ調べる）
let serverPromise = null;
function serverUrl() {
  if (RANK_SERVER) return Promise.resolve(RANK_SERVER);
  serverPromise ??= (async () => {
    const urls = [
      `https://api.github.com/repos/${GITHUB_REPO}/contents/server.json?ref=server&t=${Date.now()}`,
      `https://raw.githubusercontent.com/${GITHUB_REPO}/server/server.json?t=${Date.now()}`,
    ];
    for (const u of urls) {
      try {
        const res = await fetch(u, { cache: 'no-store' });
        if (!res.ok) continue;
        const j = await res.json();
        const d = j.content ? JSON.parse(atob(j.content.replace(/\n/g, ''))) : j;
        return d.api || null;
      } catch {}
    }
    return null;
  })();
  return serverPromise;
}

async function call(path, body) {
  const base = await serverUrl();
  if (!base) return null;
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 4000);
    const res = await fetch(base.replace(/\/$/, '') + path, {
      method: body ? 'POST' : 'GET',
      headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': '1' },
      body: body ? JSON.stringify(body) : undefined,
      signal: ctrl.signal,
    });
    clearTimeout(timer);
    return res.ok ? await res.json() : null;
  } catch {
    return null;
  }
}

/** 自分の情報と防衛編成をサーバーに登録 */
export const sendPlayer = (rank, team) =>
  call('/api/player', { id: rank.id, name: rank.name, rating: rank.rating, wins: rank.wins, losses: rank.losses, season: rank.season, team });

/** レートが近い本物のプレイヤー（最大3人） */
export const fetchOpponents = (rank) => call(`/api/opponents?id=${encodeURIComponent(rank.id)}&rating=${rank.rating}&season=${rank.season}`);

/** ランキング（上位50人） */
export const fetchRanking = (season) => call(`/api/ranking?season=${season}`);
