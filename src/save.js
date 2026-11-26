import { DEFAULT_TEAM, UNITS } from './data.js';

const KEY = 'mononokatari_save_v1';

export function loadSave() {
  try {
    const s = JSON.parse(localStorage.getItem(KEY)) || {};
    const team = (s.team || DEFAULT_TEAM).filter((k) => UNITS[k]).slice(0, 5);
    return { coins: s.coins || 0, cleared: s.cleared || [], team: team.length ? team : [...DEFAULT_TEAM] };
  } catch {
    return { coins: 0, cleared: [], team: [...DEFAULT_TEAM] };
  }
}

export function writeSave(save) {
  localStorage.setItem(KEY, JSON.stringify(save));
}
