import { W, H, GROUND_Y, STAGES, stageBg, drawPlayerBase, drawEnemyBase } from './backgrounds.js';

// 背景の確認用画面：ステージ切り替え・昼夜切り替え・自動切り替え（なめらかに変わる）
const PLAYERS = ['hakua', 'kodama', 'suzune', 'gekomaru'];
const ENEMIES = ['zako_ghost', 'zako_lantern', 'oni_mask'];
const AUTO_MS = 6000; // 確認用なので短め（本番は60秒前後）

export class PreviewScene extends Phaser.Scene {
  constructor() {
    super('preview');
    this.stageIndex = 0;
    this.night = false;
    this.auto = false;
  }

  create() {
    this.bgLayer = this.add.container(0, 0);
    this.baseLayer = this.add.container(0, 0);
    this.baseLayer.add(drawEnemyBase(this, 110));
    this.baseLayer.add(drawPlayerBase(this, 1170));
    this.makeUnits();
    this.makeUI();
    // ?stage=2&night=1 で直接開ける
    const q = new URLSearchParams(location.search);
    this.night = q.get('night') === '1';
    this.showStage(Math.min(Number(q.get('stage')) || 0, STAGES.length - 1));
  }

  showStage(i) {
    this.stageIndex = i;
    this.bgLayer.removeAll(true);
    const stage = STAGES[i];
    this.dayBg = stageBg(this, stage, false);
    this.nightBg = stageBg(this, stage, true);
    this.bgLayer.add([this.dayBg, this.nightBg]);
    this.nightBg.setAlpha(this.night ? 1 : 0);
    this.refreshLabels();
  }

  setNight(night, smooth = true) {
    this.night = night;
    this.tweens.killTweensOf(this.nightBg);
    if (smooth) this.tweens.add({ targets: this.nightBg, alpha: night ? 1 : 0, duration: 1500, ease: 'Sine.easeInOut' });
    else this.nightBg.setAlpha(night ? 1 : 0);
    this.refreshLabels();
  }

  makeUnits() {
    const lane = GROUND_Y + 110;
    const place = (key, x, flip) => {
      const img = this.add.image(x, lane, key).setOrigin(0.5, 1);
      img.setScale(130 / img.height).setFlipX(flip);
      this.tweens.add({ targets: img, scaleY: img.scaleY * 0.94, duration: 380, yoyo: true, repeat: -1, delay: Math.random() * 300 });
      return img;
    };
    // 味方の絵は左向きなので、自陣は右・敵は左から来る
    PLAYERS.forEach((k, i) => place(k, 1020 - i * 120, false));
    ENEMIES.forEach((k, i) => place(k, 260 + i * 120, false));
  }

  makeUI() {
    const btn = (x, label, onClick) => {
      const t = this.add
        .text(x, 24, label, { fontFamily: 'Hiragino Maru Gothic ProN, Hiragino Sans, sans-serif', fontSize: '24px', color: '#3a2416', backgroundColor: '#fff4dccc', padding: { x: 14, y: 8 } })
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', onClick);
      return t;
    };
    this.stageBtns = STAGES.map((s, i) => btn(20 + i * 150, s.name, () => this.showStage(i)));
    this.nightBtn = btn(640, '', () => this.setNight(!this.night));
    this.autoBtn = btn(790, '', () => {
      this.auto = !this.auto;
      if (this.autoTimer) this.autoTimer.remove();
      if (this.auto) this.autoTimer = this.time.addEvent({ delay: AUTO_MS, loop: true, callback: () => this.setNight(!this.night) });
      this.refreshLabels();
    });
    btn(940, 'もどる', () => this.scene.start('menu'));
    this.add.text(W - 20, 30, '背景の確認', { fontSize: '18px', color: '#ffffff', stroke: '#3a2416', strokeThickness: 4 }).setOrigin(1, 0);
  }

  refreshLabels() {
    if (!this.nightBtn) return;
    this.stageBtns.forEach((b, i) => b.setColor(i === this.stageIndex ? '#d9412b' : '#3a2416'));
    this.nightBtn.setText(this.night ? '🌙 夜' : '☀️ 昼');
    this.autoBtn.setText(this.auto ? '自動 ON' : '自動 OFF');
  }
}
