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
