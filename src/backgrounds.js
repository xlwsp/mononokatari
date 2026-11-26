// 仮の背景（図形で描く）。images/bg/<key>_day.png / _night.png があればそちらを優先して使う。
export const W = 1280;
export const H = 720;
export const GROUND_Y = 540; // ここから下が道（画面の下 1/4）

// 背景画像（images/bg/）。ここに無いものは図形の仮背景で描く
export const BG_FILES = {
  bamboo_day: 'bg01.jpeg', bamboo_night: 'bg02.jpeg',
  riverside_day: 'bg03.jpeg', riverside_night: 'bg04.jpeg',
  temple_day: 'bg05.jpeg', temple_night: 'bg06.jpeg',
  festival_day: 'bg07.jpeg', festival_night: 'bg08.jpeg',
};

/** 背景を置く：画像があれば画像、無ければ図形 */
export function stageBg(scene, stage, night) {
  const key = `${stage.key}_${night ? 'night' : 'day'}`;
  if (scene.textures.exists(key)) return scene.add.image(W / 2, H / 2, key).setDisplaySize(W, H);
  return drawStage(scene, stage, night);
}

const OUT = 0x3a2416; // キャラと同じ焦げ茶の線

export const STAGES = [
  { key: 'bamboo', name: '竹やぶ', draw: drawBamboo, seed: 11 },
  { key: 'riverside', name: '川辺の村', draw: drawRiverside, seed: 22 },
  { key: 'temple', name: '山寺', draw: drawTemple, seed: 33 },
  { key: 'festival', name: '夜祭り', draw: drawFestival, seed: 44 },
];

/** 背景を1枚描いた Graphics を返す。night=true で夜版。昼と夜で配置は同じ。 */
export function drawStage(scene, stage, night) {
  const g = scene.add.graphics();
  const r = rng(stage.seed); // 配置用（昼夜で同じ並び）
  const rx = rng(stage.seed + 7); // 夜だけの飾り用
  stage.draw(g, night, r, rx);
  return g;
}

// ---------- 道具 ----------
function rng(seed) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const pick = (n, day, night) => (n ? night : day);

function poly(g, pts, fill, lw = 5, alpha = 1) {
  const p = pts.map(([x, y]) => ({ x, y }));
  g.fillStyle(fill, alpha);
  g.fillPoints(p, true);
  if (lw) {
    g.lineStyle(lw, OUT, 1);
    g.strokePoints(p, true, true);
  }
}
function rect(g, x, y, w, h, fill, lw = 5) {
  g.fillStyle(fill, 1);
  g.fillRect(x, y, w, h);
  if (lw) {
    g.lineStyle(lw, OUT, 1);
    g.strokeRect(x, y, w, h);
  }
}
function circle(g, x, y, rad, fill, lw = 5) {
  g.fillStyle(fill, 1);
  g.fillCircle(x, y, rad);
  if (lw) {
    g.lineStyle(lw, OUT, 1);
    g.strokeCircle(x, y, rad);
  }
}
function glow(g, x, y, rad, color, strength = 0.3) {
  for (let i = 6; i >= 1; i--) {
    g.fillStyle(color, strength / 6);
    g.fillCircle(x, y, (rad * i) / 6);
  }
}
function sky(g, top, bottom) {
  g.fillGradientStyle(top, top, bottom, bottom, 1);
  g.fillRect(0, 0, W, GROUND_Y);
}
function stars(g, rx, count) {
  for (let i = 0; i < count; i++) {
    g.fillStyle(0xfff6d8, 0.5 + rx() * 0.5);
    g.fillCircle(rx() * W, rx() * 300, 1 + rx() * 2);
  }
}
function moon(g, x, y, rad) {
  glow(g, x, y, rad * 2.4, 0xfff2c0, 0.35);
  circle(g, x, y, rad, 0xfff4d6, 4);
}
function sun(g, x, y, rad) {
  glow(g, x, y, rad * 2.6, 0xfffbe0, 0.5);
  g.fillStyle(0xfff8e1, 1);
  g.fillCircle(x, y, rad);
}
function cloud(g, x, y, s, color) {
  g.fillStyle(color, 0.9);
  g.fillEllipse(x, y, 120 * s, 46 * s);
  g.fillEllipse(x - 40 * s, y + 6 * s, 80 * s, 36 * s);
  g.fillEllipse(x + 30 * s, y - 14 * s, 80 * s, 50 * s);
}
// 人魂・鬼火（しずく形）
function flame(g, x, y, s, color, withGlow = true) {
  if (withGlow) glow(g, x, y - s * 0.6, s * 3, color, 0.4);
  const pts = [];
  for (let i = 0; i <= 10; i++) {
    const a = (Math.PI * i) / 10;
    pts.push([x + s * Math.cos(a), y + s * Math.sin(a)]);
  }
  pts.push([x - s * 0.8, y - s * 1.1], [x - s * 0.1, y - s * 2.6], [x + s * 0.9, y - s * 0.9]);
  poly(g, pts, color, 3);
}
function ground(g, n, base, edge, r) {
  g.fillStyle(base, 1);
  g.fillRect(0, GROUND_Y, W, H - GROUND_Y);
  // 道の手前の影
  g.fillStyle(0x000000, 0.08);
  g.fillRect(0, H - 50, W, 50);
  // 小石
  for (let i = 0; i < 26; i++) {
    g.fillStyle(0x000000, 0.1);
    g.fillEllipse(r() * W, GROUND_Y + 30 + r() * 140, 10 + r() * 18, 5 + r() * 6);
  }
  // 道のふち（草）
  g.fillStyle(edge, 1);
  g.fillRect(0, GROUND_Y - 6, W, 16);
  for (let x = 0; x < W; x += 14 + r() * 10) {
    poly(g, [[x, GROUND_Y + 8], [x + 6, GROUND_Y - 12 - r() * 10], [x + 12, GROUND_Y + 8]], edge, 0);
  }
  g.lineStyle(5, OUT, 1);
  g.lineBetween(0, GROUND_Y + 10, W, GROUND_Y + 10);
}
function stoneLantern(g, x, baseY, n, s = 1) {
  const stone = pick(n, 0xb7b0a3, 0x5d5872);
  rect(g, x - 22 * s, baseY - 14 * s, 44 * s, 14 * s, stone, 4);
  rect(g, x - 8 * s, baseY - 60 * s, 16 * s, 46 * s, stone, 4);
  rect(g, x - 20 * s, baseY - 92 * s, 40 * s, 32 * s, stone, 4);
  const win = pick(n, 0x6e6a63, 0xffb347);
  if (n) glow(g, x, baseY - 76 * s, 60 * s, 0xffa040, 0.45);
  rect(g, x - 9 * s, baseY - 86 * s, 18 * s, 20 * s, win, 3);
  poly(g, [[x - 34 * s, baseY - 92 * s], [x, baseY - 118 * s], [x + 34 * s, baseY - 92 * s]], stone, 4);
}

// ---------- 1. 竹やぶ ----------
function drawBamboo(g, n, r, rx) {
  sky(g, pick(n, 0xa9dcee, 0x141c46), pick(n, 0xe8f4dc, 0x2e3c70));
  if (n) {
    stars(g, rx, 40);
    moon(g, 960, 120, 52);
  } else sun(g, 200, 90, 50);

  // 遠くの竹（線なし・淡い）
  const far = pick(n, 0xa8cf9a, 0x2c5450);
  for (let i = 0; i < 26; i++) {
    const x = r() * W;
    const w = 8 + r() * 8;
    g.fillStyle(far, 1);
    g.fillRect(x, 0, w, GROUND_Y);
    g.fillStyle(0xffffff, n ? 0.05 : 0.25);
    for (let y = 40 + r() * 40; y < GROUND_Y; y += 70) g.fillRect(x, y, w, 3);
  }
  // 霞
  g.fillStyle(n ? 0x8aa0ff : 0xffffff, n ? 0.08 : 0.25);
  g.fillRect(0, 300, W, 240);

  // 木もれ日
  if (!n) {
    for (let i = 0; i < 4; i++) {
      const x = 150 + i * 300 + r() * 60;
      g.fillStyle(0xfffbe0, 0.18);
      g.fillPoints([{ x, y: 0 }, { x: x + 60, y: 0 }, { x: x + 200, y: GROUND_Y }, { x: x + 90, y: GROUND_Y }], true);
    }
  } else for (let i = 0; i < 4; i++) r();

  // 柵
  const wood = pick(n, 0xb58a5a, 0x4a3d55);
  rect(g, 150, 482, 980, 12, wood, 4);
  rect(g, 150, 510, 980, 12, wood, 4);
  for (let x = 160; x <= 1120; x += 96) rect(g, x, 465, 14, 76, wood, 4);

  // 手前の竹
  const stalk = pick(n, 0x79b36a, 0x2f6b5c);
  const leaf = pick(n, 0x8cc76f, 0x356e5a);
  for (let i = 0; i < 9; i++) {
    const x = i * 150 + r() * 70 - 20;
    const w = 22 + r() * 10;
    rect(g, x, -10, w, GROUND_Y - 10 + 10, stalk, 5);
    g.lineStyle(4, OUT, 1);
    for (let y = 50 + r() * 50; y < GROUND_Y - 30; y += 80 + r() * 20) g.lineBetween(x, y, x + w, y);
    for (let j = 0; j < 4; j++) {
      const lx = x + w / 2;
      const ly = 30 + r() * 260;
      const dir = r() < 0.5 ? -1 : 1;
      poly(g, [[lx, ly], [lx + dir * (50 + r() * 20), ly - 14], [lx + dir * 14, ly + 14]], leaf, 4);
    }
  }

  stoneLantern(g, 330, 540, n);
  stoneLantern(g, 950, 540, n);

  ground(g, n, pick(n, 0xdcbf86, 0x4e4868), pick(n, 0x8cc26b, 0x2f5a52), r);
  // 落ち葉
  for (let i = 0; i < 18; i++) {
    const x = r() * W;
    const y = GROUND_Y + 30 + r() * 150;
    poly(g, [[x, y], [x + 18, y - 4], [x + 4, y + 5]], pick(n, 0xb7c46a, 0x5b6a5a), 0);
  }

  if (n) {
    for (let i = 0; i < 6; i++) flame(g, 100 + rx() * 1080, 150 + rx() * 250, 9 + rx() * 6, 0xbfe9ff);
  }
}

// ---------- 2. 川辺の村 ----------
function drawRiverside(g, n, r, rx) {
  sky(g, pick(n, 0x8fd0f0, 0x0f1538), pick(n, 0xf5f0d6, 0x2a2f62));
  if (n) {
    stars(g, rx, 60);
    moon(g, 1040, 110, 40);
    g.fillStyle(0x151b42, 1);
    g.fillCircle(1058, 98, 36); // 三日月にする
  } else {
    sun(g, 1060, 100, 46);
    cloud(g, 300, 110, 1.2, 0xffffff);
    cloud(g, 720, 70, 0.9, 0xffffff);
  }
  for (let i = 0; i < 3; i++) r();

  // 遠くの丘
  const hill1 = pick(n, 0xb3d69a, 0x26365e);
  const hill2 = pick(n, 0x93c47d, 0x1f2d50);
  g.lineStyle(4, OUT, 1);
  for (const [x, w, h, c] of [[200, 700, 260, hill1], [900, 800, 300, hill1], [550, 600, 200, hill2], [1200, 500, 220, hill2], [0, 500, 200, hill2]]) {
    g.fillStyle(c, 1);
    g.fillEllipse(x, 400, w, h * 2);
    g.strokeEllipse(x, 400, w, h * 2);
  }
  // 向こう岸
  rect(g, -10, 380, W + 20, 60, pick(n, 0x9cc77c, 0x2b3b5c), 4);

  // 家
  const wall = pick(n, 0xe8d2a6, 0x4b4466);
  const roof = pick(n, 0xb08a4e, 0x5b4a5e);
  const houses = [130, 300, 900, 1080];
  houses.forEach((x, i) => {
    const w = 120 + r() * 40;
    const h = 60 + r() * 20;
    rect(g, x - w / 2, 400 - h, w, h, wall, 5);
    poly(g, [[x - w / 2 - 25, 400 - h + 4], [x, 400 - h - 70], [x + w / 2 + 25, 400 - h + 4]], roof, 5);
    const winC = pick(n, 0x6b4f3a, 0xffd27a);
    if (n) glow(g, x, 400 - h / 2, 50, 0xffc860, 0.4);
    rect(g, x - 16, 400 - h + 18, 32, 24, winC, 4);
    if (i === 2) {
      // 水車
      const cx = x + w / 2 + 40;
      circle(g, cx, 400, 44, pick(n, 0x9a6b3e, 0x4a3a4c), 5);
      g.lineStyle(4, OUT, 1);
      for (let a = 0; a < 6; a++) {
        const t = (a * Math.PI) / 3;
        g.lineBetween(cx, 400, cx + 44 * Math.cos(t), 400 + 44 * Math.sin(t));
      }
    }
  });

  // 川
  rect(g, -10, 430, W + 20, 96, pick(n, 0x78c2dc, 0x223e78), 5);
  g.lineStyle(3, 0xffffff, n ? 0.25 : 0.6);
  for (let i = 0; i < 16; i++) {
    const x = r() * W;
    const y = 445 + r() * 70;
    g.lineBetween(x, y, x + 30 + r() * 30, y);
  }
  if (n) {
    for (let i = 0; i < 5; i++) {
      g.fillStyle(0xfff2c0, 0.5 - i * 0.08);
      g.fillEllipse(1040, 450 + i * 15, 70 - i * 10, 6);
    }
  }

  // 赤い橋
  const red = pick(n, 0xd8432f, 0xa8362f);
  g.lineStyle(26, OUT, 1);
  g.beginPath();
  g.arc(640, 640, 240, Math.PI + 0.6, -0.6);
  g.strokePath();
  g.lineStyle(16, red, 1);
  g.beginPath();
  g.arc(640, 640, 240, Math.PI + 0.6, -0.6);
  g.strokePath();
  for (let a = -0.5; a <= 0.5; a += 0.25) {
    const t = -Math.PI / 2 + a * 1.2;
    const x = 640 + 240 * Math.cos(t);
    const y = 640 + 240 * Math.sin(t);
    rect(g, x - 5, y - 40, 10, 40, red, 3);
    if (n && Math.abs(a) > 0.3) {
      glow(g, x, y - 52, 40, 0xff8a40, 0.5);
      circle(g, x, y - 52, 10, 0xff9a50, 3);
    }
  }

  // 葦と石
  for (let i = 0; i < 22; i++) {
    const x = r() * W;
    const h = 40 + r() * 50;
    g.lineStyle(4, pick(n, 0x6f9a4a, 0x2f4c3c), 1);
    g.lineBetween(x, GROUND_Y, x + 4, GROUND_Y - h);
    g.fillStyle(pick(n, 0xa0784a, 0x4a3f4a), 1);
    g.fillEllipse(x + 4, GROUND_Y - h, 7, 22);
  }
  for (let i = 0; i < 6; i++) {
    const x = r() * W;
    g.fillStyle(pick(n, 0xb5b0a5, 0x5a5670), 1);
    g.fillEllipse(x, GROUND_Y - 4, 40 + r() * 30, 26);
    g.lineStyle(4, OUT, 1);
    g.strokeEllipse(x, GROUND_Y - 4, 40, 26);
  }

  ground(g, n, pick(n, 0xd6b47c, 0x4a4565), pick(n, 0x9ccb6b, 0x2f4c50), r);

  if (n) {
    for (let i = 0; i < 18; i++) {
      const x = rx() * W;
      const y = 380 + rx() * 160;
      glow(g, x, y, 14, 0xe8ff80, 0.6);
      g.fillStyle(0xf4ffb0, 1);
      g.fillCircle(x, y, 2.5);
    }
  }
}

// ---------- 3. 山寺 ----------
function drawTemple(g, n, r, rx) {
  sky(g, pick(n, 0xc9e2ef, 0x1a1534), pick(n, 0xf7e6c8, 0x3d2c5e));
  if (n) {
    stars(g, rx, 35);
    moon(g, 700, 150, 70);
  } else cloud(g, 950, 90, 1.1, 0xffffff);

  // 山
  const m1 = pick(n, 0xa9bfd0, 0x2c2850);
  const m2 = pick(n, 0x8aa6bb, 0x231f40);
  [[-100, 460, 300], [250, 600, 380], [700, 560, 300], [1100, 600, 360]].forEach(([x, w, h]) =>
    poly(g, [[x, 420], [x + w / 2, 420 - h], [x + w, 420]], m1, 4)
  );
  [[0, 500, 220], [450, 500, 200], [900, 520, 240]].forEach(([x, w, h]) =>
    poly(g, [[x, 440], [x + w / 2, 440 - h], [x + w, 440]], m2, 4)
  );
  g.fillStyle(n ? 0x7a8cff : 0xffffff, n ? 0.12 : 0.45);
  g.fillRect(0, 330, W, 120);

  // 杉
  const cedar = pick(n, 0x3f7a4f, 0x1f3a3a);
  for (const x of [40, 140, 230, 1060, 1160, 1250]) {
    const h = 300 + r() * 80;
    rect(g, x - 8, GROUND_Y - 80, 16, 80, pick(n, 0x6b4a32, 0x3a2c36), 4);
    for (let k = 0; k < 4; k++) {
      const y = GROUND_Y - 60 - k * (h / 4.5);
      const w = 120 - k * 22;
      poly(g, [[x - w / 2, y], [x, y - h / 3], [x + w / 2, y]], cedar, 4);
    }
  }

  // 紅葉
  for (const x of [360, 920]) {
    rect(g, x - 9, 420, 18, 110, pick(n, 0x6b4a32, 0x3a2c36), 4);
    for (let k = 0; k < 6; k++) {
      circle(g, x - 50 + r() * 100, 360 + r() * 70, 38 + r() * 14, k % 2 ? pick(n, 0xe0602f, 0x7a3450) : pick(n, 0xf0943a, 0x8a4058), 4);
    }
  }

  // お堂
  const wall = pick(n, 0xf1e3c4, 0x5a4a6a);
  const pillar = pick(n, 0xb4442e, 0x6b2f3b);
  const roofC = pick(n, 0x5a5f6e, 0x2b2840);
  rect(g, 470, 410, 340, 22, pick(n, 0xb7ab95, 0x4a4560), 4);
  rect(g, 500, 300, 280, 110, wall, 5);
  for (let x = 510; x <= 760; x += 62) rect(g, x, 300, 14, 110, pillar, 4);
  if (n) glow(g, 640, 360, 90, 0xffb050, 0.25);
  rect(g, 600, 330, 80, 70, pick(n, 0x8a5a3a, 0xffc26a), 4);
  poly(g, [[440, 312], [470, 300], [520, 250], [640, 200], [760, 250], [810, 300], [840, 312], [790, 302], [640, 290], [490, 302]], roofC, 5);
  poly(g, [[530, 250], [640, 160], [750, 250]], roofC, 5);
  // 石段
  poly(g, [[560, 432], [720, 432], [770, GROUND_Y], [510, GROUND_Y]], pick(n, 0xc4b89f, 0x4f4a66), 5);
  g.lineStyle(4, OUT, 1);
  for (let y = 452; y < GROUND_Y; y += 22) g.lineBetween(560 - (y - 432) * 0.46, y, 720 + (y - 432) * 0.46, y);

  // 鐘楼
  rect(g, 965, 380, 12, 150, pick(n, 0x8a5a3a, 0x4a3a4c), 4);
  rect(g, 1043, 380, 12, 150, pick(n, 0x8a5a3a, 0x4a3a4c), 4);
  poly(g, [[940, 385], [1010, 340], [1080, 385]], roofC, 5);
  poly(g, [[990, 400], [1030, 400], [1036, 450], [984, 450]], pick(n, 0x9a7a3a, 0x6a5a3a), 4);

  stoneLantern(g, 430, 540, n, 1.1);
  stoneLantern(g, 850, 540, n, 1.1);

  ground(g, n, pick(n, 0xcdbb9a, 0x48425f), pick(n, 0x86b06a, 0x2e4a48), r);
  g.lineStyle(3, OUT, 0.25);
  for (let x = 0; x < W; x += 110) g.lineBetween(x + 30, GROUND_Y + 12, x, H);

  if (n) {
    for (let i = 0; i < 5; i++) flame(g, 480 + rx() * 320, 170 + rx() * 80, 10 + rx() * 6, 0xb57aff);
  }
}

// ---------- 4. 夜祭りの通り ----------
function drawFestival(g, n, r, rx) {
  sky(g, pick(n, 0xff9f6b, 0x130e30), pick(n, 0xffe1a8, 0x3b1d57));
  if (n) stars(g, rx, 30);
  else sun(g, 640, 330, 70);

  // 奥の森と社
  const tree = pick(n, 0x5a8a4a, 0x1d2a3a);
  for (let i = 0; i < 14; i++) circle(g, r() * W, 330 + r() * 60, 70 + r() * 40, tree, 4);
  poly(g, [[520, 330], [640, 260], [760, 330]], pick(n, 0x6a4a3a, 0x2a2238), 5);
  rect(g, 560, 330, 160, 80, pick(n, 0xe6cfa0, 0x4a3a50), 5);

  // 鳥居
  const red = pick(n, 0xd9412b, 0xd23b2b);
  if (n) glow(g, 640, 460, 220, 0xff6a30, 0.3);
  rect(g, 540, 300, 26, 240, red, 5);
  rect(g, 714, 300, 26, 240, red, 5);
  rect(g, 520, 330, 240, 20, red, 5);
  poly(g, [[480, 280], [520, 296], [760, 296], [800, 280], [790, 304], [490, 304]], pick(n, 0x2a2020, 0x1a1418), 5);
  rect(g, 500, 300, 280, 16, red, 4);

  // 屋台
  const stripeA = pick(n, 0xd9412b, 0xb83a3a);
  const stripeB = pick(n, 0xfff4e0, 0xd8cbb8);
  for (const x of [60, 300, 860, 1100]) {
    const w = 190;
    rect(g, x, 440, 10, 100, pick(n, 0x8a5a3a, 0x4a3a4c), 4);
    rect(g, x + w - 10, 440, 10, 100, pick(n, 0x8a5a3a, 0x4a3a4c), 4);
    if (n) glow(g, x + w / 2, 480, 110, 0xffb060, 0.35);
    rect(g, x - 5, 480, w + 10, 60, pick(n, 0xc49a6a, 0x6a5060), 5);
    for (let k = 0; k < 6; k++) {
      g.fillStyle(k % 2 ? stripeB : stripeA, 1);
      g.fillRect(x - 10 + (k * (w + 20)) / 6, 410, (w + 20) / 6 + 1, 36);
      g.fillCircle(x - 10 + (k + 0.5) * ((w + 20) / 6), 446, (w + 20) / 12);
    }
    g.lineStyle(5, OUT, 1);
    g.strokeRect(x - 10, 410, w + 20, 36);
  }
  for (let i = 0; i < 4; i++) r();

  // 提灯の列
  for (const [x0, x1, y, sag] of [[-20, 520, 170, 60], [760, 1300, 170, 60], [-20, 1300, 70, 90]]) {
    g.lineStyle(3, OUT, 1);
    const pts = [];
    for (let i = 0; i <= 20; i++) {
      const t = i / 20;
      pts.push({ x: x0 + (x1 - x0) * t, y: y + sag * (1 - (2 * t - 1) ** 2) });
    }
    g.strokePoints(pts);
    for (let i = 1; i < 20; i += 2) {
      const p = pts[i];
      if (n) glow(g, p.x, p.y + 16, 34, 0xff7a30, 0.5);
      g.fillStyle(i % 4 === 1 ? pick(n, 0xe8e0d0, 0xffc070) : pick(n, 0xc8402e, 0xff6a3a), 1);
      g.fillEllipse(p.x, p.y + 16, 22, 28);
      g.lineStyle(3, OUT, 1);
      g.strokeEllipse(p.x, p.y + 16, 22, 28);
    }
  }

  ground(g, n, pick(n, 0xd8b27a, 0x4b3c5e), pick(n, 0x9ab86a, 0x34304a), r);

  if (n) {
    for (const [x, y, c] of [[260, 200, 0xffd060], [1020, 180, 0x8fd0ff], [820, 120, 0xff8ac0]]) {
      const len = 40 + rx() * 20;
      g.lineStyle(3, c, 0.9);
      for (let a = 0; a < 16; a++) {
        const t = (a * Math.PI) / 8;
        g.lineBetween(x + 10 * Math.cos(t), y + 10 * Math.sin(t), x + len * Math.cos(t), y + len * Math.sin(t));
      }
    }
    // 敵の行列が来る（画面の左から）
    for (let i = 0; i < 10; i++) flame(g, rx() * 180, 200 + rx() * 320, 10 + rx() * 10, 0xb57aff);
  }
}

// ---------- 陣地（仮） ----------
/** 自陣：神社（右側） */
export function drawPlayerBase(scene, x) {
  const g = scene.add.graphics();
  const y = GROUND_Y + 40;
  rect(g, x - 70, y - 130, 140, 130, 0xe8d2a6, 5);
  poly(g, [[x - 100, y - 125], [x, y - 210], [x + 100, y - 125]], 0x9a7a4a, 5);
  rect(g, x - 25, y - 80, 50, 80, 0x8a5a3a, 4);
  // 鳥居
  rect(g, x - 130, y - 150, 14, 150, 0xd9412b, 4);
  rect(g, x - 160, y - 160, 74, 14, 0xd9412b, 4);
  return g;
}
/** 敵陣：鬼火の門（左側） */
export function drawEnemyBase(scene, x) {
  const g = scene.add.graphics();
  const y = GROUND_Y + 40;
  glow(g, x, y - 100, 140, 0xb57aff, 0.35);
  rect(g, x - 80, y - 150, 24, 150, 0x2a2030, 5);
  rect(g, x + 56, y - 150, 24, 150, 0x2a2030, 5);
  poly(g, [[x - 115, y - 145], [x, y - 210], [x + 115, y - 145]], 0x3a3040, 5);
  rect(g, x - 56, y - 140, 112, 140, 0x1a1420, 4);
  circle(g, x - 68, y - 110, 14, 0xd9412b, 4);
  circle(g, x + 68, y - 110, 14, 0xd9412b, 4);
  flame(g, x - 30, y - 180, 12, 0xb57aff, false);
  flame(g, x + 40, y - 190, 10, 0xb57aff, false);
  return g;
}
