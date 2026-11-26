// ゲームの数値（仮）。遊びながらここを調整する。
// hp: 体力 / atk: 攻撃力 / range: 射程(px) / rate: 攻撃の間隔(秒) / speed: 移動(px/秒)
// kb: やられるまでに後ろに吹き飛ぶ回数 / area: 範囲攻撃 / time: 'day' 昼型・'night' 夜型・null どちらでもない
// skill: 'moon' 召喚すると夜にする・'sun' 召喚すると昼にする
// vsFloat: 浮いている敵に2倍 / slow: 当てた敵を2秒遅くする

export const TITLE = 'モノノカタリ';
export const SUBTITLE = '-天下統一-';

export const UNITS = {
  suzune: { name: 'スズネ', cost: 75, hp: 130, atk: 18, range: 40, rate: 0.8, speed: 75, kb: 2, time: 'day', note: '安い・速い' },
  kodama: { name: 'コダマ', cost: 100, hp: 240, atk: 38, range: 45, rate: 1.0, speed: 55, kb: 3, time: 'night', note: '近接アタッカー' },
  hakua: { name: 'ハクア', cost: 120, hp: 320, atk: 32, range: 50, rate: 1.0, speed: 48, kb: 3, time: 'day', note: 'バランス型' },
  maimai: { name: 'マイマイ', cost: 150, hp: 800, atk: 8, range: 40, rate: 1.5, speed: 22, kb: 4, time: null, note: '壁' },
  rangyo: { name: 'ランギョ', cost: 200, hp: 170, atk: 42, range: 230, rate: 1.6, speed: 38, kb: 2, time: 'day', note: '遠距離' },
  gekomaru: { name: 'ゲコマル', cost: 250, hp: 420, atk: 60, range: 110, rate: 1.8, speed: 36, kb: 3, time: null, area: true, note: '範囲・中距離' },
  uroko: { name: 'ウロコ', cost: 250, hp: 340, atk: 30, range: 60, rate: 1.0, speed: 46, kb: 3, time: 'night', slow: true, note: '敵を遅くする' },
  kuroro: { name: 'クロロ', cost: 280, hp: 260, atk: 50, range: 80, rate: 1.2, speed: 62, kb: 3, time: 'day', vsFloat: true, note: '浮いてる敵に強い' },
  komori: { name: 'コモリ', cost: 300, hp: 1400, atk: 18, range: 40, rate: 1.6, speed: 18, kb: 5, time: null, note: '重い壁' },
  kohaku: { name: 'コハク', cost: 350, hp: 300, atk: 60, range: 60, rate: 1.1, speed: 52, kb: 3, time: 'night', skill: 'moon', note: '月呼び（夜にする）' },
  sinonome: { name: 'シノノメ', cost: 350, hp: 360, atk: 55, range: 70, rate: 1.2, speed: 46, kb: 3, time: 'day', skill: 'sun', note: '日招き（昼にする）' },
  nejimaru: { name: 'ネジマル', cost: 400, hp: 460, atk: 85, range: 170, rate: 2.2, speed: 26, kb: 3, time: 'night', area: true, note: '範囲の大砲役' },
};

export const ENEMIES = {
  zako_ghost: { name: '傘幽霊', hp: 110, atk: 12, range: 40, rate: 1.0, speed: 40, kb: 1, time: 'night', float: true, reward: 15, size: 80 },
  zako_lantern: { name: '提灯', hp: 150, atk: 15, range: 40, rate: 1.2, speed: 34, kb: 1, time: 'night', float: true, reward: 20, size: 85 },
  oni_mask: { name: '鬼面', hp: 320, atk: 34, range: 50, rate: 1.2, speed: 40, kb: 2, time: 'night', reward: 45 },
  kasa: { name: 'からかさ', hp: 170, atk: 24, range: 45, rate: 0.8, speed: 95, kb: 2, time: null, reward: 35 },
  boss1: { name: '大提灯', hp: 2600, atk: 75, range: 90, rate: 2.0, speed: 20, kb: 5, time: 'night', area: true, float: true, reward: 300, size: 170, boss: true },
  fox: { name: '狐', hp: 360, atk: 48, range: 130, rate: 1.6, speed: 50, kb: 2, time: 'night', reward: 60 },
  tanuki: { name: '狸', hp: 950, atk: 24, range: 45, rate: 1.5, speed: 26, kb: 3, time: null, reward: 70, size: 110 },
  boss2: { name: '大蛇', hp: 5200, atk: 110, range: 120, rate: 2.0, speed: 18, kb: 5, time: 'night', area: true, reward: 500, size: 190, boss: true },
  red_oni: { name: '赤鬼', hp: 1600, atk: 100, range: 70, rate: 1.8, speed: 26, kb: 3, time: 'night', area: true, reward: 150, size: 140 },
  big_tanuki: { name: '大狸', hp: 2100, atk: 48, range: 50, rate: 1.6, speed: 22, kb: 3, time: null, reward: 150, size: 140 },
  boss3: { name: '獅子', hp: 9000, atk: 170, range: 110, rate: 2.0, speed: 20, kb: 6, time: 'night', area: true, reward: 800, size: 200, boss: true },
};

// spawns: start 秒から every 秒ごとに出る（from〜until はステージ経過秒）
// boss: 敵陣のHPが bossAt 以下になったら1回だけ出る
export const BATTLE_STAGES = [
  {
    name: '竹やぶ', bg: 'bamboo', baseHp: 1800, reward: 100,
    spawns: [
      { key: 'zako_ghost', start: 2, every: 6 },
      { key: 'zako_lantern', start: 15, every: 9 },
      { key: 'kasa', start: 40, every: 18 },
      { key: 'oni_mask', start: 70, every: 22 },
    ],
    boss: 'boss1', bossAt: 0.6,
  },
  {
    name: '川辺の村', bg: 'riverside', baseHp: 3000, reward: 200,
    spawns: [
      { key: 'zako_ghost', start: 2, every: 6 },
      { key: 'zako_lantern', start: 8, every: 9 },
      { key: 'kasa', start: 25, every: 16 },
      { key: 'fox', start: 40, every: 20 },
      { key: 'tanuki', start: 60, every: 28 },
    ],
    boss: 'boss2', bossAt: 0.6,
  },
  {
    name: '山寺', bg: 'temple', baseHp: 4500, reward: 350,
    spawns: [
      { key: 'zako_lantern', start: 2, every: 6 },
      { key: 'oni_mask', start: 12, every: 13 },
      { key: 'fox', start: 25, every: 16 },
      { key: 'tanuki', start: 40, every: 24 },
      { key: 'red_oni', start: 90, every: 40 },
      { key: 'big_tanuki', start: 120, every: 45 },
    ],
    boss: 'boss3', bossAt: 0.6,
  },
];

export const RULES = {
  playerBaseHp: 2500,
  timeLimit: 300, // 5分
  dayNightSeconds: 60, // 昼夜が入れ替わる間隔
  favored: { atk: 1.3, speed: 1.15 }, // 得意な時間帯
  unfavored: { atk: 0.85, speed: 0.95 }, // 苦手な時間帯
  cannonCharge: 22, // 大砲がたまるまでの秒
  cannonDamage: 160,
  wallet: (lv) => ({ max: 400 + 200 * (lv - 1), rate: 14 + 6 * (lv - 1), next: 60 * lv }),
  walletMax: 8,
  cooldown: (cost) => 2 + cost / 70, // 再召喚までの秒
};

export const DEFAULT_TEAM = ['suzune', 'hakua', 'maimai', 'rangyo', 'kohaku'];
