export const FONT = 'Hiragino Maru Gothic ProN, Hiragino Sans, Noto Sans JP, sans-serif';
export const INK = '#3a2416';

export function text(scene, x, y, str, size = 24, color = INK, extra = {}) {
  return scene.add.text(x, y, str, { fontFamily: FONT, fontSize: `${size}px`, color, ...extra });
}

/** 角丸ボタン。返り値の .setEnabled(bool) .setLabel(str) が使える */
export function button(scene, x, y, w, h, label, onClick, opts = {}) {
  const c = scene.add.container(x, y);
  const g = scene.add.graphics();
  const fill = opts.fill ?? 0xfff4dc;
  const draw = (f) => {
    g.clear();
    g.fillStyle(0x3a2416, 1);
    g.fillRoundedRect(-w / 2 - 3, -h / 2 - 3, w + 6, h + 6, 16);
    g.fillStyle(f, 1);
    g.fillRoundedRect(-w / 2, -h / 2, w, h, 14);
  };
  draw(fill);
  const t = text(scene, 0, 0, label, opts.size ?? 26, opts.color ?? INK).setOrigin(0.5);
  c.add([g, t]);
  c.setSize(w, h).setInteractive({ useHandCursor: true });
  c.on('pointerdown', () => {
    if (c.enabled === false) return;
    scene.tweens.add({ targets: c, scale: 0.94, duration: 60, yoyo: true });
    onClick();
  });
  c.setEnabled = (v) => {
    c.enabled = v;
    c.setAlpha(v ? 1 : 0.45);
    return c;
  };
  c.setLabel = (s) => (t.setText(s), c);
  c.setFill = (f) => (draw(f), c);
  return c;
}
