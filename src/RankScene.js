import { W, H, STAGES, stageBg } from './backgrounds.js';
import { UNITS } from './data.js';
import { loadSave, writeSave } from './save.js';
import { text, button, INK } from './ui.js';
import { tierOf, tierProgress, seasonLabel, rollSeason, botPool, pickOpponents } from './rank.js';
import { sendPlayer, fetchOpponents, fetchRanking } from './rankApi.js';

const INK_HEX = 0x3a2416;
const BGS = ['bamboo', 'riverside', 'temple', 'festival'];

export class RankScene extends Phaser.Scene {
  constructor() {
    super('rank');
  }

  create() {
    this.save = loadSave();
    const seasonMsg = rollSeason(this.save);
    writeSave(this.save);
    const r = this.save.rank;

    stageBg(this, STAGES[2], false);
    this.add.rectangle(W / 2, H / 2, W, H, 0x1b1530, 0.45);
    text(this, 24, 16, '⚔ ランク戦', 38, '#ffffff', { stroke: INK, strokeThickness: 8, fontStyle: 'bold' });
    text(this, 250, 30, seasonLabel(r.season), 22, '#ffd36a', { stroke: INK, strokeThickness: 5 });
    button(this, W - 100, 40, 170, 56, 'もどる', () => this.scene.start('menu'), { size: 22 });

    this.drawMyCard();
    this.status = text(this, 880, 108, '', 18, '#ffffff', { stroke: INK, strokeThickness: 4 }).setOrigin(0.5);
    this.oppLayer = this.add.container(0, 0);
    button(this, 760, 668, 250, 60, '相手を変える', () => this.loadOpponents(), { size: 22 });
    button(this, 1040, 668, 250, 60, '🏆 ランキング', () => this.showRanking(), { size: 22 });

    this.loadOpponents();
    sendPlayer(r, this.save.team);
    if (seasonMsg) this.popup('新しいシーズン！', seasonMsg);
  }

  panel(x, y, w, h) {
    const g = this.add.graphics();
    g.fillStyle(INK_HEX, 1).fillRoundedRect(x - 4, y - 4, w + 8, h + 8, 20);
    g.fillStyle(0xfff4dc, 1).fillRoundedRect(x, y, w, h, 18);
    return g;
  }

  drawMyCard() {
    const r = this.save.rank;
    const tier = tierOf(r.rating);
    const { ratio, next } = tierProgress(r.rating);
    this.panel(24, 90, 440, 610);
    this.nameText = text(this, 244, 130, r.name, 26, INK, { fontStyle: 'bold' }).setOrigin(0.5);
    button(this, 244, 172, 200, 40, '名前を変える', () => this.rename(), { size: 16 });
    text(this, 244, 250, tier.name, 64, tier.color, { fontStyle: 'bold', stroke: INK, strokeThickness: 6 }).setOrigin(0.5);
    text(this, 244, 315, `レート ${r.rating}`, 30).setOrigin(0.5);
    const g = this.add.graphics();
    g.fillStyle(INK_HEX, 1).fillRoundedRect(74, 345, 340, 22, 11);
    g.fillStyle(0xffd36a, 1).fillRoundedRect(77, 348, Math.max(16, 334 * ratio), 16, 8);
    text(this, 244, 385, next ? `次の「${next.name}」まで あと ${next.min - r.rating}` : '最高ランク！', 18, '#6a4a36').setOrigin(0.5);
    text(this, 244, 425, `${r.wins}勝 ${r.losses}敗　最高 ${tierOf(r.best).name}（${r.best}）`, 20).setOrigin(0.5);

    text(this, 244, 480, 'あなたの防衛編成', 22, INK, { fontStyle: 'bold' }).setOrigin(0.5);
    this.iconRow(this.save.team, 244, 545, 78);
    text(this, 244, 610, '今の編成が、ほかの人と戦うときの\n相手側の編成（防衛編成）になります。\n編成はメニューで変えられます。', 15, '#6a4a36', { align: 'center' }).setOrigin(0.5);
  }

  iconRow(team, cx, y, size, parent) {
    const gap = size + 4;
    team.forEach((k, i) => {
      const img = this.add.image(cx + (i - (team.length - 1) / 2) * gap, y, k);
      img.setScale(Math.min(size / img.height, size / img.width));
      parent?.add(img);
    });
  }

  async loadOpponents() {
    const r = this.save.rank;
    this.status.setText('相手をさがしています…');
    this.oppLayer.removeAll(true);
    const online = await fetchOpponents(r);
    let opps = Array.isArray(online?.players) ? online.players.filter((p) => p.team?.every((k) => UNITS[k])) : [];
    if (opps.length) this.status.setText('🌐 オンライン：本物のプレイヤーの防衛編成と戦います');
    else this.status.setText('CPUのライバルと戦います（サーバーにつながっていません）');
    // 本物のプレイヤーが3人いなければCPUでうめる
    if (opps.length < 3) opps = [...opps, ...pickOpponents(botPool(r.season), r.rating, r.id).slice(0, 3 - opps.length)];
    if (!this.scene.isActive()) return;
    opps.forEach((o, i) => this.oppCard(o, 490, 140 + i * 172));
  }

  oppCard(o, x, y) {
    const c = this.add.container(0, 0);
    this.oppLayer.add(c);
    const g = this.add.graphics();
    g.fillStyle(INK_HEX, 1).fillRoundedRect(x - 4, y - 4, 778, 160, 18);
    g.fillStyle(0xfffaf0, 1).fillRoundedRect(x, y, 770, 152, 16);
    c.add(g);
    const tier = tierOf(o.rating);
    c.add(text(this, x + 24, y + 18, o.name + (o.bot ? '' : '  🌐'), 26, INK, { fontStyle: 'bold' }));
    c.add(text(this, x + 24, y + 58, tier.name, 30, tier.color, { fontStyle: 'bold', stroke: INK, strokeThickness: 4 }));
    c.add(text(this, x + 24, y + 100, `レート ${o.rating}`, 22));
    this.iconRow(o.team, x + 420, y + 76, 70, c);
    c.add(button(this, x + 690, y + 76, 130, 70, '挑む', () => this.challenge(o), { size: 28, fill: 0xffd36a }));
  }

  challenge(o) {
    if (!this.save.team.length) return;
    const bg = BGS[Math.floor(Math.random() * BGS.length)];
    this.scene.start('battle', { stage: 0, team: [...this.save.team], rank: { name: o.name, rating: o.rating, team: o.team, bg } });
  }

  rename() {
    const name = window.prompt('名前（12文字まで）', this.save.rank.name);
    if (!name) return;
    this.save.rank.name = name.trim().slice(0, 12) || this.save.rank.name;
    writeSave(this.save);
    this.nameText.setText(this.save.rank.name);
    sendPlayer(this.save.rank, this.save.team);
  }

  async showRanking() {
    const r = this.save.rank;
    const online = await fetchRanking(r.season);
    let list = Array.isArray(online?.players) ? online.players : null;
    const title = list ? '🏆 ランキング（オンライン）' : '🏆 ランキング（CPUのライバルとあなた）';
    if (!list) list = [...botPool(r.season), { id: r.id, name: r.name, rating: r.rating }];
    if (!list.some((p) => p.id === r.id)) list.push({ id: r.id, name: r.name, rating: r.rating });
    list.sort((a, b) => b.rating - a.rating);
    const myPlace = list.findIndex((p) => p.id === r.id);
    // 上位10人＋自分のまわり
    const shown = list.slice(0, 10);
    if (myPlace >= 10) shown.push(null, list[myPlace]);

    const parts = [];
    const add = (o) => (parts.push(o.setDepth(500)), o);
    add(this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.6).setInteractive());
    add(this.panel(W / 2 - 330, 40, 660, 640));
    add(text(this, W / 2, 80, title, 28, INK, { fontStyle: 'bold' }).setOrigin(0.5));
    shown.forEach((p, i) => {
      const y = 130 + i * 40;
      if (!p) return add(text(this, W / 2, y, '…', 22).setOrigin(0.5));
      const place = list.indexOf(p) + 1;
      const me = p.id === r.id;
      const color = me ? '#d9412b' : INK;
      add(text(this, W / 2 - 290, y, `${place}位`, 22, color).setOrigin(0, 0.5));
      add(text(this, W / 2 - 200, y, p.name + (me ? '（あなた）' : ''), 22, color, { fontStyle: me ? 'bold' : 'normal' }).setOrigin(0, 0.5));
      const t = tierOf(p.rating);
      add(text(this, W / 2 + 150, y, t.name, 20, t.color, { fontStyle: 'bold' }).setOrigin(0, 0.5));
      add(text(this, W / 2 + 290, y, `${p.rating}`, 22, color).setOrigin(1, 0.5));
    });
    add(button(this, W / 2, 640, 200, 56, '閉じる', () => parts.forEach((p) => p.destroy()), { size: 22 }));
  }

  popup(title, msg) {
    const parts = [];
    const add = (o) => (parts.push(o.setDepth(600)), o);
    add(this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.6).setInteractive());
    add(this.panel(W / 2 - 300, 220, 600, 260));
    add(text(this, W / 2, 270, title, 34, '#d9412b', { fontStyle: 'bold' }).setOrigin(0.5));
    add(text(this, W / 2, 335, msg, 20, INK, { align: 'center', wordWrap: { width: 540 } }).setOrigin(0.5));
    add(button(this, W / 2, 420, 180, 56, 'OK', () => parts.forEach((p) => p.destroy()), { size: 24 }));
  }
}
