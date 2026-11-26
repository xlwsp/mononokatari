import { W, H } from './backgrounds.js';
import { BootScene, TitleScene } from './TitleScene.js';
import { MenuScene } from './MenuScene.js';
import { BattleScene } from './BattleScene.js';
import { PreviewScene } from './PreviewScene.js';

new Phaser.Game({
  type: Phaser.AUTO,
  width: W,
  height: H,
  parent: 'game',
  backgroundColor: '#000000',
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  input: { activePointers: 3 },
  // 確認用（?auto=1）はタイマーで動かす（ヘッドレスのブラウザでも時間が進むように）
  fps: { forceSetTimeOut: new URLSearchParams(location.search).get('auto') === '1', target: 60 },
  scene: [BootScene, TitleScene, MenuScene, BattleScene, PreviewScene],
});
