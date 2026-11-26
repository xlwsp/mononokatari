import { W, H, STAGES, drawStage, GROUND_Y } from './backgrounds.js';
import { TITLE, SUBTITLE } from './data.js';
import { text, INK } from './ui.js';

export class TitleScene extends Phaser.Scene {
  constructor() {
    super('title');
  }

  create() {
    drawStage(this, STAGES[3], true);
    const cast = ['kohaku', 'hakua', 'gekomaru', 'kodama', 'sinonome', 'kuroro'];
    cast.forEach((k, i) => {
      const img = this.add.image(260 + i * 160, GROUND_Y + 90, k).setOrigin(0.5, 1);
      img.setScale(120 / img.height);
      this.tweens.add({ targets: img, y: img.y - 12, duration: 500, yoyo: true, repeat: -1, delay: i * 120, ease: 'Sine.easeInOut' });
    });
    text(this, W / 2, 200, TITLE, 110, '#ffffff', { stroke: INK, strokeThickness: 14, fontStyle: 'bold' }).setOrigin(0.5);
    text(this, W / 2, 300, SUBTITLE, 52, '#ffd36a', { stroke: INK, strokeThickness: 10, fontStyle: 'bold' }).setOrigin(0.5);
    const tap = text(this, W / 2, 420, 'タップしてはじめる', 32, '#ffffff', { stroke: INK, strokeThickness: 7 }).setOrigin(0.5);
    this.tweens.add({ targets: tap, alpha: 0.2, duration: 700, yoyo: true, repeat: -1 });

    this.input.once('pointerdown', () => {
      // スマホでは全画面＆横向きにする（できる端末だけ）
      try {
        if (!this.scale.isFullscreen && this.sys.game.device.input.touch) this.scale.startFullscreen();
        screen.orientation?.lock?.('landscape').catch(() => {});
      } catch {}
      this.scene.start('menu');
    });
  }
}

export class BootScene extends Phaser.Scene {
  constructor() {
    super('boot');
  }

  preload() {
    const bar = this.add.rectangle(W / 2 - 300, H / 2, 0, 24, 0xffd36a).setOrigin(0, 0.5);
    this.load.on('progress', (p) => (bar.width = 600 * p));
    const sprites = [
      'suzune', 'kodama', 'hakua', 'maimai', 'rangyo', 'gekomaru', 'uroko', 'kuroro', 'komori', 'kohaku', 'sinonome', 'nejimaru',
      'zako_ghost', 'zako_lantern', 'oni_mask', 'kasa', 'boss1', 'fox', 'tanuki', 'boss2', 'red_oni', 'big_tanuki', 'boss3',
    ];
    for (const k of sprites) this.load.image(k, `images/sprites/${k}.png`);
    // 友達の背景が images/bg/ にあれば使う（無ければ図形の仮背景）
    this.load.on('loaderror', () => {});
    for (const s of STAGES) {
      this.load.image(`${s.key}_day`, `images/bg/${s.key}_day.png`);
      this.load.image(`${s.key}_night`, `images/bg/${s.key}_night.png`);
    }
  }

  create() {
    // 確認用：?battle=0 でステージ1にすぐ入る（&auto=1 で自動召喚）
    const q = new URLSearchParams(location.search);
    if (q.has('battle')) this.scene.start('battle', { stage: Number(q.get('battle')) || 0, team: ['suzune', 'hakua', 'maimai', 'rangyo', 'kohaku'], auto: q.get('auto') === '1' });
    else this.scene.start('title');
  }
}
