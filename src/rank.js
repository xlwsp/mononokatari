// ランク戦：ランク帯・レート計算・シーズン・CPUのライバル
import { UNITS } from './data.js';

export const START_RATING = 1000;
export const RANK_UNLOCK_STAGE = 1; // 「竹やぶ」をクリアすると解放

export const TIERS = [
  { name: 'ブロンズ', min: 0, color: '#b0703a', reward: 50 },
  { name: 'シルバー', min: 1100, color: '#8a9aa8', reward: 100 },
  { name: 'ゴールド', min: 1250, color: '#d9a400', reward: 200 },
  { name: 'プラチナ', min: 1400, color: '#3aa8a0', reward: 300 },
  { name: 'ダイヤ', min: 1550, color: '#5a7aff', reward: 500 },
  { name: '天下人', min: 1700, color: '#d9412b', reward: 800 },
];

export function tierOf(rating) {
  let t = TIERS[0];
  for (const x of TIERS) if (rating >= x.min) t = x;
  return t;
}

/** 次のランク帯までの進み具合（0〜1）と次の帯 */
export function tierProgress(rating) {
  const i = TIERS.indexOf(tierOf(rating));
  const next = TIERS[i + 1];
  if (!next) return { ratio: 1, next: null };
  const lo = i === 0 ? 900 : TIERS[i].min;
  return { ratio: Math.max(0, Math.min(1, (rating - lo) / (next.min - lo))), next };
}

/** 勝ち負けでレートがいくつ動くか（イロレーティング） */
export function ratingDelta(me, opp, win) {
  const expected = 1 / (1 + 10 ** ((opp - me) / 400));
  const d = Math.round(32 * ((win ? 1 : 0) - expected));
  return win ? Math.max(5, d) : Math.min(-5, d);
}

export function currentSeason(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}
export function seasonLabel(season) {
  const [y, m] = season.split('-');
  return `${y}年${Number(m)}月シーズン`;
}

export function newRankData() {
  return {
    id: Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4),
    name: '名無しの妖怪使い',
    rating: START_RATING,
    wins: 0,
    losses: 0,
    best: START_RATING,
    season: currentSeason(),
  };
}

/** シーズンが変わっていたら、報酬を渡してレートを半分戻す。報酬メッセージを返す */
export function rollSeason(save) {
  const r = save.rank;
  const now = currentSeason();
  if (r.season === now) return null;
  const played = r.wins + r.losses > 0;
  const tier = tierOf(r.best);
  const msg = played ? `${seasonLabel(r.season)}の報酬：最高ランク「${tier.name}」で小判 +${tier.reward}` : null;
  if (played) save.coins += tier.reward;
  r.rating = Math.round(START_RATING + (r.rating - START_RATING) / 2);
  r.best = r.rating;
  r.wins = 0;
  r.losses = 0;
  r.season = now;
  return msg;
}

// ---------- CPU のライバル（サーバーにつながらないときの相手） ----------
const BOT_NAMES = [
  '狐火の太郎', 'やまびこ', '月見うさぎ', '河童の川流れ', '提灯小僧', '鬼灯', 'ぬらりひょん丸', '座敷わらし子',
  '雪見だいふく', 'かまいたち', '豆だぬき', '天狗の鼻', 'からかさ番長', '竹取りの翁', 'ろくろ首長', 'のっぺら坊や',
  '一つ目小僧', 'こなきじじい', '猫又みけ', '夜行さん', '烏天狗', '雷獣ピカ', '火車', '木霊の森', '白蛇さま',
  '鈴の音', '山寺の和尚', '百目', '大入道', '影法師',
];
const ALL = Object.keys(UNITS);

function seeded(seed) {
  return () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}

/** シーズンごとに決まった顔ぶれのCPU。レートは 880〜1850 にばらける */
export function botPool(season = currentSeason()) {
  const r = seeded([...season].reduce((a, c) => a * 31 + c.charCodeAt(0), 7));
  return BOT_NAMES.map((name, i) => {
    const rating = Math.round(880 + (970 * i) / (BOT_NAMES.length - 1) + (r() - 0.5) * 60);
    const team = [];
    const pool = [...ALL];
    // レートが高いCPUほど高コストの妖怪をまぜる
    pool.sort((a, b) => UNITS[a].cost * (0.5 + r()) - UNITS[b].cost * (0.5 + r()));
    const strong = Math.min(4, Math.floor((rating - 880) / 240));
    team.push(...pool.slice(0, 5 - strong), ...pool.slice(-strong || pool.length));
    return { id: `bot${i}`, name, rating, team: [...new Set(team)].slice(0, 5), bot: true };
  });
}

/** 自分のレートに近い相手を3人えらぶ */
export function pickOpponents(pool, rating, myId) {
  const near = pool.filter((p) => p.id !== myId).sort((a, b) => Math.abs(a.rating - rating) - Math.abs(b.rating - rating)).slice(0, 8);
  for (let i = near.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [near[i], near[j]] = [near[j], near[i]];
  }
  return near.slice(0, 3).sort((a, b) => a.rating - b.rating);
}

/** 相手のレートから、相手側AIのうまさ（0〜1） */
export function aiSkill(rating) {
  return Math.max(0, Math.min(1, (rating - 850) / 1000));
}
