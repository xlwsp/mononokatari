import { W, STAGES, drawStage } from './backgrounds.js';
import { UNITS, BATTLE_STAGES, TITLE, SUBTITLE } from './data.js';
import { loadSave, writeSave } from './save.js';
import { text, button, INK } from './ui.js';

// ステージ選択と編成
export class MenuScene extends Phaser.Scene {
  constructor() {
    super('menu');
  }

  create() {
    this.save = loadSave();
    drawStage(this, STAGES[0], false);
    this.add.rectangle(W / 2, 360, W, 720, 0xfff4dc, 0.35);

    text(this, 24, 16, `${TITLE} ${SUBTITLE}`, 32, '#ffffff', { stroke: INK, strokeThickness: 7 });
    text(this, W - 24, 22, `小判 ${this.save.coins}`, 26, '#ffffff', { stroke: INK, strokeThickness: 6 }).setOrigin(1, 0);

    // ステージ
    text(this, 24, 78, 'ステージをえらぶ', 24, INK);
    BATTLE_STAGES.forEach((sd, i) => {
      const unlocked = i === 0 || this.save.cleared.includes(i - 1);
      const done = this.save.cleared.includes(i);
      const label = unlocked ? `${i + 1}. ${sd.name}${done ? '  ★' : ''}` : `${i + 1}. ？？？  🔒`;
      const b = button(this, 230 + i * 410, 160, 380, 90, label, () => this.start(i), { size: 30 });
      b.setEnabled(unlocked);
    });

    // 編成
    text(this, 24, 222, '編成（5体まで。タップで入れる／外す）', 24, INK);
    this.cells = Object.entries(UNITS).map(([key, def], i) => this.makeCell(key, def, 112 + (i % 6) * 211, 335 + Math.floor(i / 6) * 175));
    this.refresh();

    button(this, W - 110, 690, 190, 46, '背景を見る', () => this.scene.start('preview'), { size: 18 });
  }

  makeCell(key, def, x, y) {
    const c = this.add.container(x, y);
    const w = 196;
    const h = 160;
    const bg = this.add.graphics();
    const icon = this.add.image(0, -18, key);
    icon.setScale(Math.min(90 / icon.height, 150 / icon.width));
    const time = def.time === 'day' ? '☀' : def.time === 'night' ? '🌙' : '';
    const name = text(this, 0, 42, `${def.name} ${time}`, 20).setOrigin(0.5);
    const info = text(this, 0, 64, `${def.cost}  ${def.note}`, 14, '#6a4a36').setOrigin(0.5);
    const order = text(this, -w / 2 + 12, -h / 2 + 6, '', 26, '#d9412b', { fontStyle: 'bold' });
    c.add([bg, icon, name, info, order]);
    c.setSize(w, h).setInteractive({ useHandCursor: true });
    c.on('pointerdown', () => this.toggle(key));
    return { key, bg, order, w, h };
  }

  toggle(key) {
    const team = this.save.team;
    const i = team.indexOf(key);
    if (i >= 0) team.splice(i, 1);
    else if (team.length < 5) team.push(key);
    writeSave(this.save);
    this.refresh();
  }

  refresh() {
    for (const cell of this.cells) {
      const n = this.save.team.indexOf(cell.key);
      const { bg, w, h } = cell;
      bg.clear();
      bg.fillStyle(n >= 0 ? 0xd9412b : INK_HEX, 1).fillRoundedRect(-w / 2 - 4, -h / 2 - 4, w + 8, h + 8, 16);
      bg.fillStyle(n >= 0 ? 0xfff0c8 : 0xfffaf0, 1).fillRoundedRect(-w / 2, -h / 2, w, h, 14);
      cell.order.setText(n >= 0 ? `${n + 1}` : '');
    }
  }

  start(stage) {
    if (!this.save.team.length) return;
    this.scene.start('battle', { stage, team: [...this.save.team] });
  }
}

const INK_HEX = 0x3a2416;
