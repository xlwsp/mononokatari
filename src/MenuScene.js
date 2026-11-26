import { W, STAGES, stageBg } from './backgrounds.js';
import { UNITS, BATTLE_STAGES, TITLE, SUBTITLE, SHOP_PRICES } from './data.js';
import { loadSave, writeSave, addUnit, exportCode, importCode, resetSave } from './save.js';
import { text, button, INK } from './ui.js';
import { RANK_UNLOCK_STAGE, tierOf } from './rank.js';

const INK_HEX = 0x3a2416;

// ステージ選択と編成
export class MenuScene extends Phaser.Scene {
  constructor() {
    super('menu');
  }

  create() {
    this.save = loadSave();
    stageBg(this, STAGES[0], false);
    this.add.rectangle(W / 2, 360, W, 720, 0xfff4dc, 0.35);

    text(this, 24, 16, `${TITLE} ${SUBTITLE}`, 32, '#ffffff', { stroke: INK, strokeThickness: 7 });
    this.coinText = text(this, W - 24, 22, '', 26, '#ffffff', { stroke: INK, strokeThickness: 6 }).setOrigin(1, 0);

    // ステージ
    text(this, 24, 70, 'ステージをえらぶ（押すとバトル開始）', 24, INK);
    BATTLE_STAGES.forEach((sd, i) => {
      const unlocked = i === 0 || this.save.cleared.includes(i - 1);
      const done = this.save.cleared.includes(i);
      const label = unlocked ? `${sd.name}${done ? ' ★' : ''}` : '？？？ 🔒';
      const b = button(this, 165 + i * 317, 145, 295, 80, label, () => this.start(i), { size: 26 });
      b.setEnabled(unlocked);
    });

    // 編成
    text(this, 24, 205, '編成（5体まで。タップで入れる／外す）', 24, INK);
    this.cells = Object.entries(UNITS).map(([key, def], i) => this.makeCell(key, def, 112 + (i % 6) * 211, 320 + Math.floor(i / 6) * 175));
    this.toast = text(this, W / 2, 628, '', 24, '#ffffff', { stroke: INK, strokeThickness: 6 }).setOrigin(0.5);
    this.refresh();

    button(this, W - 110, 690, 190, 46, '背景を見る', () => this.scene.start('preview'), { size: 18 });
    button(this, 110, 690, 190, 46, '💾 セーブ', () => this.openSavePanel(), { size: 20 });
    const rankOpen = this.save.cleared.includes(RANK_UNLOCK_STAGE);
    const tier = tierOf(this.save.rank.rating);
    const rankBtn = button(this, W / 2, 682, 360, 62, rankOpen ? `⚔ ランク戦（${tier.name}）` : '⚔ ランク戦 🔒', () => {
      if (!rankOpen) return this.say(`「${BATTLE_STAGES[RANK_UNLOCK_STAGE].name}」をクリアすると遊べるよ`);
      if (!this.save.team.length) return this.say('編成に1体以上入れてね');
      this.scene.start('rank');
    }, { size: 24, fill: rankOpen ? 0xffd36a : 0xd8cbb8 });
  }

  // ---------- セーブ画面 ----------
  openSavePanel() {
    const D = 500;
    const parts = [];
    const add = (o) => (parts.push(o.setDepth(D)), o);
    const close = () => parts.forEach((p) => p.destroy());
    add(this.add.rectangle(W / 2, 360, W, 720, 0x000000, 0.55).setInteractive());
    const g = add(this.add.graphics());
    g.fillStyle(INK_HEX, 1).fillRoundedRect(W / 2 - 364, 64, 728, 592, 24);
    g.fillStyle(0xfff4dc, 1).fillRoundedRect(W / 2 - 360, 68, 720, 584, 22);
    add(text(this, W / 2, 112, '💾 セーブ', 40, INK, { fontStyle: 'bold' }).setOrigin(0.5));
    add(text(this, W / 2, 168, '進み具合はこの端末に自動で保存されています。\n別の端末で遊ぶときやバックアップには、セーブコードを使ってね。', 20, '#6a4a36', { align: 'center' }).setOrigin(0.5));

    add(button(this, W / 2 - 170, 260, 310, 70, 'セーブコードをコピー', () => this.copyCode(), { size: 22 }));
    add(button(this, W / 2 + 170, 260, 310, 70, 'セーブコードで読み込む', () => this.loadCode(), { size: 22 }));
    add(button(this, W / 2 - 170, 350, 310, 70, 'ファイルに保存', () => this.downloadSave(), { size: 22 }));
    add(button(this, W / 2 + 170, 350, 310, 70, 'ファイルから読み込む', () => this.uploadSave(), { size: 22 }));
    add(button(this, W / 2, 450, 310, 60, 'はじめからやり直す', () => this.resetAll(), { size: 20, color: '#d9412b' }));
    this.saveMsg = add(text(this, W / 2, 525, '', 22, '#d9412b').setOrigin(0.5));
    add(button(this, W / 2, 595, 220, 64, '閉じる', close, { size: 24 }));
  }

  copyCode() {
    const code = exportCode(this.save);
    const done = () => this.saveMsg.setText('コピーしたよ！メモ帳などに貼って残してね');
    if (navigator.clipboard?.writeText) navigator.clipboard.writeText(code).then(done, () => window.prompt('このコードをコピーしてね', code));
    else window.prompt('このコードをコピーしてね', code);
  }

  loadCode() {
    const code = window.prompt('セーブコードを貼りつけてね（今のデータは上書きされます）');
    if (!code) return;
    this.applyLoaded(importCode(code));
  }

  applyLoaded(save) {
    if (!save) return this.saveMsg.setText('コードが正しくないみたい…');
    this.scene.restart();
  }

  downloadSave() {
    const blob = new Blob([exportCode(this.save)], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `mononokatari_save_${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(a.href);
    this.saveMsg.setText('ファイルに保存したよ');
  }

  uploadSave() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.txt,text/plain';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (file) this.applyLoaded(importCode(await file.text()));
    };
    input.click();
  }

  resetAll() {
    if (!window.confirm('本当にはじめからやり直す？（小判・仲間・クリアが全部消えます）')) return;
    resetSave();
    this.scene.start('title');
  }

  makeCell(key, def, x, y) {
    const c = this.add.container(x, y);
    const w = 196;
    const h = 160;
    const bg = this.add.graphics();
    const icon = this.add.image(0, -18, key);
    icon.setScale(Math.min(90 / icon.height, 150 / icon.width));
    const time = def.time === 'day' ? '☀' : def.time === 'night' ? '🌙' : '';
    const name = text(this, 0, 42, '', 20).setOrigin(0.5);
    const info = text(this, 0, 64, '', 14, '#6a4a36').setOrigin(0.5);
    const order = text(this, -w / 2 + 12, -h / 2 + 6, '', 26, '#d9412b', { fontStyle: 'bold' });
    c.add([bg, icon, name, info, order]);
    c.setSize(w, h).setInteractive({ useHandCursor: true });
    c.on('pointerdown', () => this.tap(key));
    return { key, def, bg, icon, name, info, order, w, h, time };
  }

  /** 仲間にする方法の説明 */
  howToGet(key) {
    const i = BATTLE_STAGES.findIndex((s) => s.unlock === key);
    if (i >= 0) return `「${BATTLE_STAGES[i].name}」クリアで仲間に`;
    if (SHOP_PRICES[key]) return `小判 ${SHOP_PRICES[key]} で仲間にする`;
    return '？？？';
  }

  tap(key) {
    const save = this.save;
    if (!save.owned.includes(key)) {
      const price = SHOP_PRICES[key];
      if (!price) return this.say(this.howToGet(key));
      if (save.coins < price) return this.say(`小判が足りない（あと ${price - save.coins}）`);
      save.coins -= price;
      addUnit(save, key);
      this.say(`${UNITS[key].name}が仲間になった！`);
    } else {
      const i = save.team.indexOf(key);
      if (i >= 0) save.team.splice(i, 1);
      else if (save.team.length < 5) save.team.push(key);
      else return this.say('編成は5体まで。先にだれかを外してね');
    }
    writeSave(save);
    this.refresh();
  }

  say(msg) {
    this.toast.setText(msg).setAlpha(1);
    this.tweens.killTweensOf(this.toast);
    this.tweens.add({ targets: this.toast, alpha: 0, delay: 1800, duration: 400 });
  }

  refresh() {
    this.coinText.setText(`小判 ${this.save.coins}`);
    for (const cell of this.cells) {
      const owned = this.save.owned.includes(cell.key);
      const n = this.save.team.indexOf(cell.key);
      const { bg, w, h } = cell;
      bg.clear();
      bg.fillStyle(n >= 0 ? 0xd9412b : INK_HEX, 1).fillRoundedRect(-w / 2 - 4, -h / 2 - 4, w + 8, h + 8, 16);
      bg.fillStyle(n >= 0 ? 0xfff0c8 : owned ? 0xfffaf0 : 0xb8ada0, 1).fillRoundedRect(-w / 2, -h / 2, w, h, 14);
      cell.order.setText(n >= 0 ? `${n + 1}` : '');
      if (owned) {
        cell.icon.clearTint().setAlpha(1);
        cell.name.setText(`${cell.def.name} ${cell.time}`);
        cell.info.setText(`${cell.def.cost}  ${cell.def.note}`);
      } else {
        cell.icon.setTint(0x222222).setAlpha(0.6); // シルエット
        cell.name.setText('🔒 ？？？');
        cell.info.setText(this.howToGet(cell.key));
      }
    }
  }

  start(stage) {
    if (!this.save.team.length) return this.say('編成に1体以上入れてね');
    this.scene.start('battle', { stage, team: [...this.save.team] });
  }
}
