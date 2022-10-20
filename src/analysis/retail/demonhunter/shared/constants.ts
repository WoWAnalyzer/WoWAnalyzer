import Combatant from 'parser/core/Combatant';
import Spell from 'common/SPELLS/Spell';
import SPELLS from 'common/SPELLS/demonhunter';
import { TALENTS_DEMON_HUNTER } from 'common/TALENTS/demonhunter';

export const SHATTERED_RESTORATION_SCALING = [0, 5, 10];

export const UNRESTRAINED_FURY_SCALING = [0, 10, 20];

export const WILL_OF_THE_ILLIDARI_SCALING = [0, 2, 4];

export const ILLIDARI_KNOWLEDGE_SCALING = [0, 2, 4];

export const SOUL_RENDING_SCALING = [0, 5, 10];

export const SOUL_RENDING_ADDITIONAL_METAMORPHOSIS_SCALING = [0, 10, 20];

export const INFERNAL_ARMOR_SCALING = [0, 10, 20];

export const EXTENDED_SIGILS_SCALING = [0, 1, 2];

export const ERRATIC_FELHEART_SCALING = [0, 0.1, 0.2];

export const PITCH_BLACK_SCALING = [0, 120];

export const MASTER_OF_THE_GLAIVE_SCALING = [0, 1];

export const RUSH_OF_CHAOS_SCALING = [0, 60];

export const DEMONIC_ORIGINS_CDR_SCALING = [0, 60];

export const DEMONIC_DURATION = 6000;

export function getElysianDecreeSpell(c: Combatant): Spell {
  if (c.hasTalent(TALENTS_DEMON_HUNTER.CONCENTRATED_SIGILS_TALENT)) {
    return SPELLS.ELYSIAN_DECREE_CONCENTRATED;
  }
  if (c.hasTalent(TALENTS_DEMON_HUNTER.PRECISE_SIGILS_TALENT)) {
    return SPELLS.ELYSIAN_DECREE_PRECISE;
  }
  return TALENTS_DEMON_HUNTER.ELYSIAN_DECREE_TALENT;
}
