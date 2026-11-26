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
  zako_ghost: { name: '傘幽霊', hp: 90, atk: 8, range: 40, rate: 1.1, speed: 36, kb: 1, time: 'night', float: true, reward: 20, size: 80 },
  zako_lantern: { name: '提灯', hp: 120, atk: 10, range: 40, rate: 1.3, speed: 32, kb: 1, time: 'night', float: true, reward: 25, size: 85 },
  oni_mask: { name: '鬼面', hp: 260, atk: 24, range: 50, rate: 1.3, speed: 36, kb: 2, time: 'night', reward: 50 },
  kasa: { name: 'からかさ', hp: 140, atk: 16, range: 45, rate: 0.9, speed: 85, kb: 2, time: null, reward: 40 },
  boss1: { name: '大提灯', hp: 1600, atk: 45, range: 90, rate: 2.2, speed: 18, kb: 5, time: 'night', area: true, float: true, reward: 300, size: 170, boss: true },
  fox: { name: '狐', hp: 260, atk: 24, range: 100, rate: 1.7, speed: 46, kb: 2, time: 'night', reward: 65 },
  tanuki: { name: '狸', hp: 750, atk: 16, range: 45, rate: 1.6, speed: 24, kb: 3, time: null, reward: 75, size: 110 },
  boss2: { name: '大蛇', hp: 2000, atk: 45, range: 120, rate: 2.2, speed: 16, kb: 5, time: 'night', area: true, reward: 500, size: 190, boss: true },
  red_oni: { name: '赤鬼', hp: 1200, atk: 65, range: 70, rate: 1.9, speed: 24, kb: 3, time: 'night', area: true, reward: 160, size: 140 },
  big_tanuki: { name: '大狸', hp: 1600, atk: 32, range: 50, rate: 1.7, speed: 20, kb: 3, time: null, reward: 160, size: 140 },
  boss3: { name: '獅子', hp: 4500, atk: 70, range: 110, rate: 2.2, speed: 18, kb: 6, time: 'night', area: true, reward: 800, size: 200, boss: true },
};

// spawns: start 秒から every 秒ごとに出る
// boss: 敵陣のHPが bossAt 以下になったら1回だけ出る
// unlock: クリアすると仲間になる妖怪
export const BATTLE_STAGES = [
  {
    name: 'はじめての戦い', bg: 'bamboo', baseHp: 500, reward: 50, tutorial: true, unlock: 'maimai',
    spawns: [{ key: 'zako_ghost', start: 14, every: 11 }],
  },
  {
    name: '竹やぶ', bg: 'bamboo', baseHp: 2500, reward: 150, unlock: 'rangyo',
    spawns: [
      { key: 'zako_ghost', start: 3, every: 8 },
      { key: 'zako_lantern', start: 20, every: 12 },
      { key: 'kasa', start: 60, every: 25 },
      { key: 'oni_mask', start: 90, every: 30 },
    ],
    boss: 'boss1', bossAt: 0.5,
  },
  {
    name: '川辺の村', bg: 'riverside', baseHp: 4000, reward: 250, unlock: 'kohaku',
    spawns: [
      { key: 'zako_ghost', start: 3, every: 7 },
      { key: 'zako_lantern', start: 10, every: 11 },
      { key: 'kasa', start: 30, every: 20 },
      { key: 'fox', start: 50, every: 30 },
      { key: 'tanuki', start: 75, every: 32 },
    ],
    boss: 'boss2', bossAt: 0.5,
  },
  {
    name: '山寺', bg: 'temple', baseHp: 5500, reward: 400, unlock: 'gekomaru',
    spawns: [
      { key: 'zako_lantern', start: 3, every: 7 },
      { key: 'oni_mask', start: 15, every: 15 },
      { key: 'fox', start: 30, every: 18 },
      { key: 'tanuki', start: 45, every: 26 },
      { key: 'red_oni', start: 100, every: 45 },
      { key: 'big_tanuki', start: 130, every: 50 },
    ],
    boss: 'boss3', bossAt: 0.5,
  },
];

// 最初からいる仲間。ほかはステージクリア（BATTLE_STAGES の unlock）か小判で仲間にする
export const STARTER_UNITS = ['suzune', 'hakua'];
export const SHOP_PRICES = { kodama: 150, uroko: 300, kuroro: 350, komori: 400, sinonome: 450, nejimaru: 600 };

export const RULES = {
  playerBaseHp: 3000,
  baseDamage: 0.5, // 陣地へのダメージは半分（陣地は固い）
  timeLimit: 300, // 5分
  dayNightSeconds: 60, // 昼夜が入れ替わる間隔
  favored: { atk: 1.2, speed: 1.1 }, // 得意な時間帯
  unfavored: { atk: 0.9, speed: 1 }, // 苦手な時間帯
  wallet: (lv) => ({ max: 500 + 250 * (lv - 1), rate: 20 + 7 * (lv - 1), next: 60 * lv }),
  walletMax: 8,
  cooldown: (cost) => 2 + cost / 70, // 再召喚までの秒
};
