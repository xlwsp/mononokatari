# 背景の生成プロンプト（Gemini 用）

## 使い方
1. **昼の絵を先に作る** →「共通の指定」＋各ステージの「昼」をまとめて貼り付ける。
2. 気に入った昼の絵ができたら、**その絵を Gemini に渡したまま**「夜にする」プロンプトを送る。
   → 同じ構図のまま夜になるので、バトル中の昼夜切り替えで背景がズレない。
3. 保存するファイル名：`images/bg/bamboo_day.png` / `bamboo_night.png` のようにする（下の各見出しに書いてあります）。
4. 横長（**16:9**）で出してもらう。もっと横長にできるなら 21:9 でもOK。

### うまくいかないときに足す一言
- キャラや人が描かれてしまう →「生き物・人・妖怪は一切描かないでください」
- 文字が入る →「文字・看板の字・ロゴは入れないでください」
- 地面が斜め・でこぼこ →「下の1/4は平らで横にまっすぐな道にしてください」
- 絵柄が写実的すぎる →「太い焦げ茶の線と平塗りの、ゆるい2Dイラストにしてください」

---

## 共通の指定（毎回いちばん最初に貼る）

```
Background art for a 2D side-scrolling Japanese yokai battle game, viewed straight from the side.
Art style: cute flat 2D illustration with thick dark-brown outlines (about 6px), flat cel shading with only one soft shadow tone, slightly muted warm colors, hand-drawn Japanese folklore feel. It must match chunky, round, sticker-like chibi yokai characters that will be placed on top.
Composition rules:
- Wide 16:9 landscape, camera straight from the side, no perspective tilt.
- The bottom 25% of the image is a flat, straight, horizontal dirt path running from the left edge to the right edge. Characters will walk on this path, so keep it simple, low-detail and uncluttered.
- Keep the far left 15% and far right 15% fairly empty (game bases will be placed there).
- Main scenery in the middle and upper area, with 2–3 depth layers (far, middle, near) so it reads clearly behind characters.
- Background must be lower in contrast and saturation than the characters so they stand out.
- NO characters, NO people, NO animals, NO yokai, NO text, NO letters, NO logos, NO UI.
```

---

## 1. 竹やぶ（ステージ1）

### 昼 → `bamboo_day.png`
```
Scene: a quiet bamboo grove on a sunny afternoon. Tall green bamboo stalks in layers, lighter and paler in the distance, darker green in front. Soft sunbeams falling between the leaves. A few small stone lanterns and a low wooden fence along the back of the path. Fallen bamboo leaves on the dirt path. Gentle, peaceful mood, light blue sky peeking through the top.
```

### 夜（昼の絵を渡して）→ `bamboo_night.png`
```
Turn this exact image into night. Keep the composition, every object, and the line art exactly the same. Change only lighting and colors: deep indigo and navy sky, a large pale full moon showing between the bamboo at the top, bamboo in dark blue-green tones, the stone lanterns glowing warm orange, a few small floating blue-white will-o'-wisp lights (hitodama) drifting among the stalks. Mysterious but cute mood, not scary. No characters, no text.
```

---

## 2. 川辺の村（ステージ2）

### 昼 → `riverside_day.png`
```
Scene: a small old Japanese riverside village in the daytime. A gentle river runs behind the path, with a small red arched wooden bridge in the middle distance. Thatched-roof houses and a water wheel on the far bank, green hills and fluffy clouds behind. Reeds and round stones along the riverbank near the path. Warm, sunny, peaceful countryside mood.
```

### 夜（昼の絵を渡して）→ `riverside_night.png`
```
Turn this exact image into night. Keep the composition, every object, and the line art exactly the same. Change only lighting and colors: dark blue sky with stars and a crescent moon, the river reflecting the moon with soft shimmering light, warm yellow light glowing from the house windows, fireflies floating over the reeds, a few paper lanterns lit on the red bridge. Calm, magical night mood. No characters, no text.
```

---

## 3. 山寺（ステージ3）

### 昼 → `temple_day.png`
```
Scene: an old mountain temple in early autumn daytime. Stone steps and a weathered wooden temple hall with a curved tiled roof in the middle distance, a large bronze bell hanging in a small bell tower, tall cedar trees, and distant layered blue mountains with mist. Some red and orange maple trees. Moss on the stones. Calm, solemn, slightly mysterious mood.
```

### 夜（昼の絵を渡して）→ `temple_night.png`
```
Turn this exact image into night. Keep the composition, every object, and the line art exactly the same. Change only lighting and colors: deep purple-blue night sky with thin drifting clouds and a full moon behind the temple roof, mountains as dark silhouettes, cold blue mist around the cedars, a few tall stone lanterns glowing orange, faint purple ghostly flames floating near the temple roof as a sign of enemy yokai nearby. Eerie but cute, not horror. No characters, no text.
```

---

## 4. 夜祭りの通り（ステージ4・九尾のボス戦）

### 昼 → `festival_day.png`
```
Scene: a Japanese shrine festival street in the late afternoon, before the festival starts. Rows of wooden festival stalls with cloth awnings (no readable text on them), strings of unlit red and white paper lanterns hanging across the street, a large red torii gate in the middle distance, a shrine roof and big trees behind it. Paper streamers and small pinwheels. Lively, festive, warm sunset-orange sky.
```

### 夜（昼の絵を渡して）→ `festival_night.png`
```
Turn this exact image into night. Keep the composition, every object, and the line art exactly the same. Change only lighting and colors: dark navy and purple sky, all the paper lanterns now glowing bright red-orange, the stalls lit with warm light, the torii gate lit from below, a few fireworks blooming small in the sky, and swirling purple ghost flames creeping in from the left side of the image (the enemy yokai procession is approaching). Exciting climax mood, festive and mysterious. No characters, no text.
```

---

## おまけ：陣地（あとで使う）
背景とは別に、**透明背景（または真っ白の背景）**で作ってもらう。

### 自陣 → `base_player.png`
```
A single game object on a plain white background: a small cute Shinto shrine used as the player's base in a 2D yokai battle game, seen from the side, facing left (it stands at the right edge of the screen). Red torii in front, wooden shrine with a thatched roof, a hanging bell rope and paper charms, a few warm cream-colored smoke wisps around it. Same art style: thick dark-brown outlines, flat cel shading, chunky and round. No characters, no text.
```

### 敵陣 → `base_enemy.png`
```
A single game object on a plain white background: an ominous but cute haunted gate used as the enemy base in a 2D yokai battle game, seen from the side, facing right (it stands at the left edge of the screen). Black-lacquered wooden gate with a dark tiled roof, hanging red paper lanterns with red swirl patterns, paper talismans, surrounded by swirling purple ghost flames. Same art style: thick dark-brown outlines, flat cel shading, chunky and round. No characters, no text.
```
