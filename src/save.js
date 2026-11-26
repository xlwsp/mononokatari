import { STARTER_UNITS, UNITS } from './data.js';

const KEY = 'mononokatari_save_v2';

export function loadSave() {
  let s = {};
  try {
    s = JSON.parse(localStorage.getItem(KEY)) || {};
  } catch {}
  const owned = [...new Set([...STARTER_UNITS, ...(s.owned || [])])].filter((k) => UNITS[k]);
  const team = (s.team || owned).filter((k) => owned.includes(k)).slice(0, 5);
  return { coins: s.coins || 0, cleared: s.cleared || [], owned, team: team.length ? team : owned.slice(0, 5) };
}

export function writeSave(save) {
  localStorage.setItem(KEY, JSON.stringify(save));
}

/** 仲間を増やす。編成に空きがあれば入れる */
export function addUnit(save, key) {
  if (save.owned.includes(key)) return false;
  save.owned.push(key);
  if (save.team.length < 5) save.team.push(key);
  return true;
}

// ---------- セーブコード（別の端末に引っ越し・バックアップ用） ----------
const CODE_PREFIX = 'MONO1-';

export function exportCode(save) {
  const data = { c: save.coins, cl: save.cleared, o: save.owned, t: save.team };
  return CODE_PREFIX + btoa(JSON.stringify(data));
}

/** コードを読み込んでセーブデータを返す。おかしなコードなら null */
export function importCode(code) {
  try {
    const raw = code.trim();
    if (!raw.startsWith(CODE_PREFIX)) return null;
    const d = JSON.parse(atob(raw.slice(CODE_PREFIX.length)));
    if (typeof d.c !== 'number' || !Array.isArray(d.cl) || !Array.isArray(d.o) || !Array.isArray(d.t)) return null;
    localStorage.setItem(KEY, JSON.stringify({ coins: d.c, cleared: d.cl, owned: d.o, team: d.t }));
    return loadSave();
  } catch {
    return null;
  }
}

export function resetSave() {
  localStorage.removeItem(KEY);
}
