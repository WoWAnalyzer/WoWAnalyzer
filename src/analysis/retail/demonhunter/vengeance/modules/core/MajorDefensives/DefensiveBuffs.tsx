import SPELLS from 'common/SPELLS/demonhunter';
import Spell from 'common/SPELLS/Spell';
import Auras from 'parser/core/modules/Auras';

export const MAJOR_DEFENSIVES: Array<[Spell, Spell | null, boolean]> = [
  [SPELLS.METAMORPHOSIS_TANK, null, true],
  [SPELLS.DEMON_SPIKES, SPELLS.DEMON_SPIKES_BUFF, true],
  // [TALENTS.FIERY_BRAND_TALENT, SPELLS.FIERY_BRAND_DOT, false],
  // [TALENTS.VOID_REAVER_TALENT, SPELLS.FRAILTY, false],
];

export const buffId = ([talent, spell]: [Spell, Spell | null, boolean]): number =>
  spell?.id ?? talent.id;

export default class DefensiveBuffs extends Auras {
  auras() {
    return MAJOR_DEFENSIVES.map((data) => ({ spellId: buffId(data), timelineHighlight: true }));
  }
}
