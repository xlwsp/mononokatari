import { W, H, STAGES, drawStage, drawPlayerBase, drawEnemyBase } from './backgrounds.js';
import { UNITS, ENEMIES, BATTLE_STAGES, RULES } from './data.js';
import { Unit, LANE_Y } from './Unit.js';
import { loadSave, writeSave } from './save.js';
import { text, button, FONT, INK } from './ui.js';

const ENEMY_BASE_X = 110;
const PLAYER_BASE_X = 1170;
const PANEL_Y = 628;

export class BattleScene extends Phaser.Scene {
  constructor() {
    super('battle');
  }

  init(data) {
    this.stageIndex = data.stage ?? 0;
    this.stageDef = BATTLE_STAGES[this.stageIndex];
    this.team = data.team;
    this.auto = data.auto;
  }

  create() {
    const sd = this.stageDef;
    this.elapsed = 0;
    this.over = false;
    this.speed = 1;
    this.night = false;
    this.dayTimer = RULES.dayNightSeconds;
    this.money = 0;
    this.walletLv = 1;
    this.cannon = 0;
    this.players = [];
    this.enemies = [];
    this.spawnNext = sd.spawns.map((s) => s.start);
    this.bossSpawned = false;
    this.tweens.timeScale = 1;
    this.time.timeScale = 1;

    // 背景（昼と夜を重ねて、夜の透明度で切り替える）
    const stage = STAGES.find((s) => s.key === sd.bg);
    this.dayBg = this.makeBg(stage, false).setDepth(0);
    this.nightBg = this.makeBg(stage, true).setDepth(0).setAlpha(0);

    // 陣地
    this.enemyBase = this.makeBase(drawEnemyBase(this, ENEMY_BASE_X), ENEMY_BASE_X, sd.baseHp, 'enemy');
    this.playerBase = this.makeBase(drawPlayerBase(this, PLAYER_BASE_X), PLAYER_BASE_X, RULES.playerBaseHp, 'player');

    this.makeUI();
    this.banner(`${sd.name}`, 'たたかい開始！');
  }

  makeBg(stage, night) {
    const key = `${stage.key}_${night ? 'night' : 'day'}`;
    if (this.textures.exists(key)) return this.add.image(W / 2, H / 2, key).setDisplaySize(W, H);
    return drawStage(this, stage, night);
  }

  makeBase(gfx, x, hp, side) {
    gfx.setDepth(5);
    const label = text(this, x, 345, '', 22, '#ffffff', { stroke: INK, strokeThickness: 5 }).setOrigin(0.5).setDepth(250);
    const base = {
      x,
      halfW: 55,
      hp,
      maxHp: hp,
      alive: true,
      side,
      takeDamage: (dmg) => {
        if (this.over) return;
        base.hp = Math.max(0, base.hp - dmg);
        gfx.x = Phaser.Math.Between(-4, 4);
        this.time.delayedCall(60, () => (gfx.x = 0));
        if (base.hp <= 0) this.finish(side === 'enemy');
      },
      label,
    };
    return base;
  }

  // ---------- UI ----------
  makeUI() {
    const D = 300;
    // 下のパネル
    const panel = this.add.graphics().setDepth(D);
    panel.fillStyle(0x2a1a10, 0.78).fillRect(0, PANEL_Y, W, H - PANEL_Y);
    panel.lineStyle(4, 0x3a2416).lineBetween(0, PANEL_Y, W, PANEL_Y);

    // 財布
    this.walletBtn = button(this, 95, 674, 170, 80, '', () => this.upgradeWallet(), { size: 20 }).setDepth(D + 1);
    // 大砲
    this.cannonBtn = button(this, 1185, 674, 170, 80, '', () => this.fireCannon(), { size: 22 }).setDepth(D + 1);

    // 召喚ボタン
    this.slots = this.team.map((key, i) => this.makeSlot(key, 335 + i * 152, 674));

    // 上：妖力・昼夜・残り時間
    this.moneyText = text(this, 20, 14, '', 30, '#ffffff', { stroke: INK, strokeThickness: 6 }).setDepth(D);
    this.dayText = text(this, W / 2, 14, '', 26, '#ffffff', { stroke: INK, strokeThickness: 6 }).setOrigin(0.5, 0).setDepth(D);
    this.timeText = text(this, W / 2, 50, '', 20, '#ffffff', { stroke: INK, strokeThickness: 5 }).setOrigin(0.5, 0).setDepth(D);
    this.speedBtn = button(this, 1060, 36, 110, 52, '速さ×1', () => this.toggleSpeed(), { size: 20 }).setDepth(D);
    button(this, 1200, 36, 130, 52, 'やめる', () => this.scene.start('menu'), { size: 20 }).setDepth(D);
  }

  makeSlot(key, x, y) {
    const def = UNITS[key];
    const c = this.add.container(x, y).setDepth(301);
    const w = 140;
    const h = 86;
    const bg = this.add.graphics();
    const icon = this.add.image(-22, 6, key).setOrigin(0.5);
    icon.setScale(64 / icon.height);
    const cost = text(this, 62, 28, `${def.cost}`, 20).setOrigin(1, 0.5);
    const timeMark = text(this, 62, -26, def.time === 'day' ? '☀' : def.time === 'night' ? '🌙' : '', 18).setOrigin(1, 0.5);
    const shade = this.add.graphics();
    c.add([bg, icon, cost, timeMark, shade]);
    c.setSize(w, h).setInteractive({ useHandCursor: true });
    const slot = { key, def, c, bg, shade, cd: 0, w, h };
    c.on('pointerdown', () => this.summon(slot));
    return slot;
  }

  drawSlot(s) {
    const { bg, shade, w, h, def } = s;
    const favored = def.time && (def.time === 'night') === this.night;
    bg.clear();
    bg.fillStyle(favored ? 0xffc94a : 0x3a2416, 1).fillRoundedRect(-w / 2 - 4, -h / 2 - 4, w + 8, h + 8, 14);
    bg.fillStyle(0xfff4dc, 1).fillRoundedRect(-w / 2, -h / 2, w, h, 12);
    shade.clear();
    if (this.money < def.cost) shade.fillStyle(0x000000, 0.45).fillRoundedRect(-w / 2, -h / 2, w, h, 12);
    if (s.cd > 0) {
      const ratio = s.cd / RULES.cooldown(def.cost);
      shade.fillStyle(0x000000, 0.55).fillRect(-w / 2, -h / 2, w, h * ratio);
    }
  }

  // ---------- 操作 ----------
  summon(slot) {
    if (this.over || slot.cd > 0 || this.money < slot.def.cost) return;
    this.money -= slot.def.cost;
    slot.cd = RULES.cooldown(slot.def.cost);
    this.tweens.add({ targets: slot.c, scale: 0.92, duration: 60, yoyo: true });
    this.players.push(new Unit(this, slot.key, slot.def, 'player', PLAYER_BASE_X - 60));
    if (slot.def.skill === 'moon') this.setNight(true, `${slot.def.name}の月呼び！`);
    if (slot.def.skill === 'sun') this.setNight(false, `${slot.def.name}の日招き！`);
  }

  upgradeWallet() {
    const w = RULES.wallet(this.walletLv);
    if (this.over || this.walletLv >= RULES.walletMax || this.money < w.next) return;
    this.money -= w.next;
    this.walletLv++;
  }

  fireCannon() {
    if (this.over || this.cannon < 1) return;
    this.cannon = 0;
    const wave = this.add.rectangle(PLAYER_BASE_X - 80, LANE_Y - 60, 60, 160, 0xfff2b0, 0.8).setDepth(150);
    this.tweens.add({ targets: wave, x: ENEMY_BASE_X + 60, duration: 600, ease: 'Quad.easeIn', onComplete: () => wave.destroy() });
    this.cameras.main.shake(250, 0.006);
    for (const e of this.enemies) {
      if (!e.alive) continue;
      const delay = ((PLAYER_BASE_X - e.x) / (PLAYER_BASE_X - ENEMY_BASE_X)) * 600;
      this.time.delayedCall(delay, () => {
        if (!e.alive) return;
        e.takeDamage(RULES.cannonDamage);
        if (e.alive && !e.def.boss) e.knockback(1.5);
      });
    }
  }

  toggleSpeed() {
    this.speed = this.speed === 1 ? 2 : 1;
    this.tweens.timeScale = this.speed;
    this.time.timeScale = this.speed;
    this.speedBtn.setLabel(`速さ×${this.speed}`);
  }

  setNight(night, reason) {
    const changed = this.night !== night;
    this.night = night;
    this.dayTimer = RULES.dayNightSeconds; // 切り替わったらそこから数え直し
    this.tweens.add({ targets: this.nightBg, alpha: night ? 1 : 0, duration: 1200 });
    if (changed || reason) this.banner(night ? '🌙 夜になった' : '☀ 昼になった', reason ?? (night ? '夜型の妖怪が強くなる' : '昼型の妖怪が強くなる'));
  }

  banner(title, sub = '') {
    const t1 = text(this, W / 2, 230, title, 54, '#ffffff', { stroke: INK, strokeThickness: 10 }).setOrigin(0.5).setDepth(400);
    const t2 = text(this, W / 2, 292, sub, 26, '#ffffff', { stroke: INK, strokeThickness: 6 }).setOrigin(0.5).setDepth(400);
    for (const t of [t1, t2]) {
      t.setAlpha(0);
      this.tweens.add({ targets: t, alpha: 1, duration: 200, hold: 1300, yoyo: true, onComplete: () => t.destroy() });
    }
  }

  // ---------- 演出 ----------
  shot(from, to, area) {
    const color = from.side === 'player' ? 0x8fe3ff : 0xc08aff;
    const b = this.add.circle(from.x + from.dir * 30, from.y - 50, area ? 12 : 8, color).setStrokeStyle(3, 0x3a2416).setDepth(150);
    this.tweens.add({ targets: b, x: to.x, y: (to.y ?? LANE_Y) - 40, duration: 180, onComplete: () => b.destroy() });
  }

  burst(x, y, side) {
    const c = this.add.circle(x, y, 20, side === 'player' ? 0xfff2b0 : 0xc08aff, 0.7).setDepth(150);
    this.tweens.add({ targets: c, scale: 3.5, alpha: 0, duration: 300, onComplete: () => c.destroy() });
  }

  onUnitDied(u) {
    if (u.side === 'enemy') {
      const max = RULES.wallet(this.walletLv).max;
      this.money = Math.min(max, this.money + (u.def.reward ?? 0));
    }
  }

  // ---------- 毎フレーム ----------
  update(_, deltaMs) {
    if (this.over) return;
    const dt = Math.min(deltaMs / 1000, 0.05) * this.speed;
    this.elapsed += dt;

    // 妖力
    const w = RULES.wallet(this.walletLv);
    this.money = Math.min(w.max, this.money + w.rate * dt);
    this.cannon = Math.min(1, this.cannon + dt / RULES.cannonCharge);

    // 昼夜
    this.dayTimer -= dt;
    if (this.dayTimer <= 0) this.setNight(!this.night);

    // 敵の出現
    this.spawnEnemies();

    // 妖怪の動き
    const mult = (def) => {
      if (!def.time) return { atk: 1, speed: 1 };
      return (def.time === 'night') === this.night ? RULES.favored : RULES.unfavored;
    };
    for (const u of this.players) u.update(dt, this.enemies, this.enemyBase, mult(u.def));
    for (const u of this.enemies) u.update(dt, this.players, this.playerBase, mult(u.def));
    this.players = this.players.filter((u) => u.alive);
    this.enemies = this.enemies.filter((u) => u.alive);
    for (const s of this.slots) s.cd = Math.max(0, s.cd - dt);
    if (this.auto) for (const s of this.slots) this.summon(s);

    // 時間切れ
    if (this.elapsed >= RULES.timeLimit) {
      const mine = this.playerBase.hp / this.playerBase.maxHp;
      const theirs = this.enemyBase.hp / this.enemyBase.maxHp;
      this.finish(mine > theirs, '時間切れ');
    }
    this.refreshUI();
  }

  spawnEnemies() {
    const sd = this.stageDef;
    const cap = 22;
    sd.spawns.forEach((s, i) => {
      if (this.elapsed >= this.spawnNext[i]) {
        // 時間がたつほど少しずつ間隔が短くなる
        const speedUp = Math.max(0.75, 1 - this.elapsed / 800);
        this.spawnNext[i] += s.every * speedUp;
        if (this.enemies.length < cap) this.spawnEnemy(s.key);
      }
    });
    if (!this.bossSpawned && this.enemyBase.hp / this.enemyBase.maxHp <= sd.bossAt) {
      this.bossSpawned = true;
      this.spawnEnemy(sd.boss);
      this.banner(`${ENEMIES[sd.boss].name} 出現！`, '敵陣から強い妖怪が出てきた');
      this.cameras.main.shake(400, 0.008);
    }
  }

  spawnEnemy(key) {
    this.enemies.push(new Unit(this, key, ENEMIES[key], 'enemy', ENEMY_BASE_X + 60));
  }

  refreshUI() {
    const w = RULES.wallet(this.walletLv);
    this.moneyText.setText(`妖力 ${Math.floor(this.money)} / ${w.max}`);
    const maxed = this.walletLv >= RULES.walletMax;
    this.walletBtn.setLabel(maxed ? `財布 Lv${this.walletLv}\nMAX` : `財布 Lv${this.walletLv}\n強化 ${w.next}`);
    this.walletBtn.setEnabled(!maxed && this.money >= w.next);
    const ready = this.cannon >= 1;
    this.cannonBtn.setLabel(ready ? '大砲\n発射！' : `大砲\n${Math.floor(this.cannon * 100)}%`);
    this.cannonBtn.setFill(ready ? 0xffc94a : 0xfff4dc);
    this.cannonBtn.setEnabled(ready);
    this.dayText.setText(`${this.night ? '🌙 夜' : '☀ 昼'}　あと${Math.ceil(this.dayTimer)}秒`);
    const left = Math.max(0, RULES.timeLimit - this.elapsed);
    this.timeText.setText(`残り ${Math.floor(left / 60)}:${String(Math.floor(left % 60)).padStart(2, '0')}`);
    for (const b of [this.enemyBase, this.playerBase]) b.label.setText(`${Math.ceil(b.hp)} / ${b.maxHp}`);
    for (const s of this.slots) this.drawSlot(s);
  }

  // ---------- 終わり ----------
  finish(win, reason = '') {
    if (this.over) return;
    this.over = true;
    this.refreshUI();
    const save = loadSave();
    const reward = win ? this.stageDef.reward : Math.floor(this.stageDef.reward * 0.2);
    save.coins += reward;
    if (win && !save.cleared.includes(this.stageIndex)) save.cleared.push(this.stageIndex);
    writeSave(save);

    const D = 500;
    this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.55).setDepth(D).setInteractive();
    const box = this.add.graphics().setDepth(D);
    box.fillStyle(0x3a2416, 1).fillRoundedRect(W / 2 - 304, 154, 608, 412, 24);
    box.fillStyle(0xfff4dc, 1).fillRoundedRect(W / 2 - 300, 158, 600, 404, 22);
    text(this, W / 2, 230, win ? '勝利！' : '敗北…', 72, win ? '#d9412b' : '#4a4a6a', { fontStyle: 'bold' }).setOrigin(0.5).setDepth(D);
    text(this, W / 2, 310, reason, 24).setOrigin(0.5).setDepth(D);
    text(this, W / 2, 360, `小判 +${reward}（所持 ${save.coins}）`, 30).setOrigin(0.5).setDepth(D);
    button(this, W / 2 - 140, 470, 240, 76, 'もう一度', () => this.scene.restart({ stage: this.stageIndex, team: this.team })).setDepth(D);
    button(this, W / 2 + 140, 470, 240, 76, 'ステージ選択', () => this.scene.start('menu'), { size: 24 }).setDepth(D);
  }
}
