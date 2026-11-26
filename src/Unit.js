// バトル中の妖怪1体
export const LANE_Y = 600;

export class Unit {
  constructor(scene, key, def, side, x) {
    this.scene = scene;
    this.key = key;
    this.def = def;
    this.side = side; // 'player' | 'enemy'
    this.dir = side === 'player' ? -1 : 1; // 味方は左へ、敵は右へ進む
    this.maxHp = def.hp;
    this.hp = def.hp;
    this.x = x;
    this.y = LANE_Y + Phaser.Math.Between(-14, 10);
    this.cool = 0;
    this.stun = 0;
    this.slow = 0;
    this.kbDone = 0;
    this.fighting = false;
    this.dead = false;
    this.lunge = 0;
    this.t = Math.random() * 10;

    this.sprite = scene.add.image(x, this.y, key).setOrigin(0.5, 1).setDepth(10 + this.y / 10);
    const size = def.size ?? 95;
    this.baseScale = size / this.sprite.height;
    this.sprite.setScale(this.baseScale);
    this.halfW = this.sprite.displayWidth * 0.32;

    if (def.boss) {
      this.hpBar = scene.add.graphics().setDepth(200);
    }
    // 出てくるときにポンと出る
    this.sprite.setScale(0.01);
    scene.tweens.add({ targets: this.sprite, scale: this.baseScale, duration: 200, ease: 'Back.easeOut' });
  }

  get alive() {
    return !this.dead;
  }

  /** 自分の前方にいる相手との距離（負なら後ろ） */
  distTo(o) {
    return (o.x - this.x) * this.dir - o.halfW;
  }

  update(dt, opponents, enemyBase, mult) {
    if (this.dead) return;
    this.t += dt;
    if (this.slow > 0) this.slow -= dt;
    if (this.stun > 0) {
      this.stun -= dt;
      this.drawHp();
      return;
    }
    const range = this.def.range;
    const inRange = opponents.filter((o) => o.alive && this.distTo(o) <= range && this.distTo(o) > -o.halfW * 2 - 20);
    const baseInRange = this.distTo(enemyBase) <= range;

    if (inRange.length || baseInRange) {
      if (!this.fighting) {
        this.fighting = true;
        this.cool = Math.min(this.cool, 0.35);
      }
      this.cool -= dt;
      if (this.cool <= 0) {
        this.cool = this.def.rate;
        this.attack(inRange, baseInRange ? enemyBase : null, mult);
      }
      this.sprite.y = this.y;
      this.sprite.angle = 0;
    } else {
      this.fighting = false;
      this.cool = Math.max(this.cool - dt, 0);
      const sp = this.def.speed * mult.speed * (this.slow > 0 ? 0.5 : 1);
      this.x += this.dir * sp * dt;
      // 歩き：ぴょこぴょこ
      this.sprite.y = this.y - Math.abs(Math.sin(this.t * 9)) * 7;
      this.sprite.angle = Math.sin(this.t * 9) * 3;
    }
    this.sprite.x = this.x + this.dir * this.lunge;
    this.drawHp();
  }

  attack(units, base, mult) {
    const scene = this.scene;
    let targets;
    if (this.def.area) {
      targets = [...units];
      if (base) targets.push(base);
    } else {
      const nearest = units.sort((a, b) => this.distTo(a) - this.distTo(b))[0];
      targets = [nearest ?? base];
    }
    // 攻撃の動き：前に踏み込む
    scene.tweens.add({ targets: this, lunge: 16, duration: 70, yoyo: true });

    const ranged = this.def.range >= 100;
    for (const t of targets) {
      let dmg = this.def.atk * mult.atk;
      if (this.def.vsFloat && t.def?.float) dmg *= 2;
      if (ranged) scene.shot(this, t, this.def.area);
      t.takeDamage(dmg, this);
      if (this.def.slow && t.def) t.slow = 2;
    }
    if (this.def.area && !ranged) scene.burst(this.x + this.dir * (this.def.range * 0.6), this.y - 40, this.side);
  }

  takeDamage(dmg, from) {
    if (this.dead) return;
    this.hp -= dmg;
    this.sprite.setTint(0xff9090);
    this.scene.time.delayedCall(90, () => this.sprite?.clearTint());
    if (this.hp <= 0) {
      this.die(from);
      return;
    }
    // 体力が一定の割合を切るたびに吹き飛ぶ
    const next = this.maxHp * (1 - (this.kbDone + 1) / this.def.kb);
    if (this.hp <= next) {
      this.kbDone++;
      this.knockback();
    }
  }

  knockback(power = 1) {
    this.stun = 0.55;
    this.fighting = false;
    this.x -= this.dir * 70 * power;
    this.scene.tweens.add({ targets: this.sprite, x: this.x, duration: 300, ease: 'Quad.easeOut' });
    this.scene.tweens.add({ targets: this.sprite, y: this.y - 40, angle: -this.dir * 20, duration: 150, yoyo: true, ease: 'Quad.easeOut' });
  }

  die(from) {
    this.dead = true;
    this.hp = 0;
    this.hpBar?.destroy();
    this.scene.onUnitDied(this, from);
    this.x -= this.dir * 60;
    this.scene.tweens.add({
      targets: this.sprite,
      x: this.x,
      y: this.y - 60,
      alpha: 0,
      angle: -this.dir * 120,
      duration: 500,
      onComplete: () => this.sprite.destroy(),
    });
  }

  drawHp() {
    if (!this.hpBar) return;
    const w = 140;
    const x = this.x - w / 2;
    const y = this.y - this.sprite.displayHeight - 18;
    this.hpBar.clear();
    this.hpBar.fillStyle(0x3a2416, 1).fillRect(x - 3, y - 3, w + 6, 14);
    this.hpBar.fillStyle(0xb57aff, 1).fillRect(x, y, (w * this.hp) / this.maxHp, 8);
  }
}
