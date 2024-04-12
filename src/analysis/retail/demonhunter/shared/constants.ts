import Combatant from 'parser/core/Combatant';
import Spell from 'common/SPELLS/Spell';
import SPELLS from 'common/SPELLS/demonhunter';
import { TALENTS_DEMON_HUNTER } from 'common/TALENTS/demonhunter';

export const SHATTERED_RESTORATION_SCALING = [0, 5, 10];

export const UNRESTRAINED_FURY_SCALING = [0, 10, 20];

export const ERRATIC_FELHEART_SCALING = [0, 0.1, 0.2];

export const PITCH_BLACK_SCALING = [0, 120];

export const MASTER_OF_THE_GLAIVE_SCALING = [0, 1];

export const CHAMPION_OF_THE_GLAIVE_SCALING = [0, 1];

export const RUSH_OF_CHAOS_SCALING = [0, 30, 60];

export const DEMONIC_DURATION = 6000;

export function getSigilOfFlameSpell(c: Combatant): Spell {
  if (c.hasTalent(TALENTS_DEMON_HUNTER.PRECISE_SIGILS_TALENT)) {
    return SPELLS.SIGIL_OF_FLAME_PRECISE;
  }
  return SPELLS.SIGIL_OF_FLAME;
}

export function getSigilOfMiserySpell(c: Combatant): Spell {
  if (c.hasTalent(TALENTS_DEMON_HUNTER.PRECISE_SIGILS_TALENT)) {
    return SPELLS.SIGIL_OF_MISERY_PRECISE;
  }
  return TALENTS_DEMON_HUNTER.SIGIL_OF_MISERY_TALENT;
}

export function getElysianDecreeSpell(c: Combatant): Spell {
  if (c.hasTalent(TALENTS_DEMON_HUNTER.PRECISE_SIGILS_TALENT)) {
    return SPELLS.ELYSIAN_DECREE_PRECISE;
  }
  return TALENTS_DEMON_HUNTER.ELYSIAN_DECREE_TALENT;
}

export function getSigilOfSilenceSpell(c: Combatant): Spell {
  if (c.hasTalent(TALENTS_DEMON_HUNTER.PRECISE_SIGILS_TALENT)) {
    return SPELLS.SIGIL_OF_SILENCE_PRECISE;
  }
  return TALENTS_DEMON_HUNTER.SIGIL_OF_SILENCE_TALENT;
}

export function getSigilOfChainsSpell(c: Combatant): Spell {
  if (c.hasTalent(TALENTS_DEMON_HUNTER.PRECISE_SIGILS_TALENT)) {
    return SPELLS.SIGIL_OF_CHAINS_PRECISE;
  }
  return TALENTS_DEMON_HUNTER.SIGIL_OF_CHAINS_TALENT;
}

// see effect #1 here: https://www.wowhead.com/spell=347765/demon-soul
// list of IDs pulled from simc's SpellDataDump
export const DEMON_SOUL_BUFF_ALLOWLIST = [
  162243, 179057, 185123, 189112, 192611, 198030, 198813, 199547, 199552, 200166, 200685, 201428,
  203782, 203796, 204021, 204157, 204598, 207407, 207771, 210153, 210155, 212105, 213243, 214743,
  222031, 225919, 225921, 227518, 228478, 247455, 258860, 258883, 258921, 258922, 258926, 273239,
  275148, 279450, 307046, 317009, 320334, 320341, 323802, 333110, 337819, 339893, 339894, 342857,
  345335, 346503, 346665, 370966, 370969, 389860, 390137, 391058, 391159, 391191, 391374, 391378,
  393054, 393055, 393834,
];

const SIGIL_OF_FLAME_SPELLS: Spell[] = [SPELLS.SIGIL_OF_FLAME, SPELLS.SIGIL_OF_FLAME_PRECISE];
export const SIGIL_OF_FLAME_SPELL_IDS = SIGIL_OF_FLAME_SPELLS.map((spell) => spell.id);

const SIGIL_OF_MISERY_SPELLS: Spell[] = [
  TALENTS_DEMON_HUNTER.SIGIL_OF_MISERY_TALENT,
  SPELLS.SIGIL_OF_MISERY_PRECISE,
];
export const SIGIL_OF_MISERY_SPELL_IDS = SIGIL_OF_MISERY_SPELLS.map((spell) => spell.id);

const ELYSIAN_DECREE_SPELLS: Spell[] = [
  TALENTS_DEMON_HUNTER.ELYSIAN_DECREE_TALENT,
  SPELLS.ELYSIAN_DECREE_PRECISE,
];
export const ELYSIAN_DECREE_SPELL_IDS = ELYSIAN_DECREE_SPELLS.map((spell) => spell.id);

const SIGIL_OF_SILENCE_SPELLS: Spell[] = [
  TALENTS_DEMON_HUNTER.SIGIL_OF_SILENCE_TALENT,
  SPELLS.SIGIL_OF_SILENCE_PRECISE,
];
export const SIGIL_OF_SILENCE_SPELL_IDS = SIGIL_OF_SILENCE_SPELLS.map((spell) => spell.id);

const SIGIL_OF_CHAINS_SPELLS: Spell[] = [
  TALENTS_DEMON_HUNTER.SIGIL_OF_CHAINS_TALENT,
  SPELLS.SIGIL_OF_CHAINS_PRECISE,
];
export const SIGIL_OF_CHAINS_SPELL_IDS = SIGIL_OF_CHAINS_SPELLS.map((spell) => spell.id);
