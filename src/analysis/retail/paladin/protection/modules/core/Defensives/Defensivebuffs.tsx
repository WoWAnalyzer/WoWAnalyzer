import SPELLS from 'common/SPELLS/paladin';
import TALENTS from 'common/TALENTS/paladin';
import Spell from 'common/SPELLS/Spell';
import Auras from 'parser/core/modules/Auras';

export const MAJOR_DEFENSIVES: [Spell, Spell | null, boolean][] = [
  [TALENTS.GUARDIAN_OF_ANCIENT_KINGS_TALENT, TALENTS.GUARDIAN_OF_ANCIENT_KINGS_TALENT, true],
  [SPELLS.SHIELD_OF_THE_RIGHTEOUS, SPELLS.SHIELD_OF_THE_RIGHTEOUS_BUFF, true],
  [TALENTS.ARDENT_DEFENDER_TALENT, TALENTS.ARDENT_DEFENDER_TALENT, false],
  [SPELLS.DIVINE_SHIELD, SPELLS.DIVINE_SHIELD, true],
];

export const buffId = ([talent, spell]: [Spell, Spell | null, boolean]): number =>
  spell?.id ?? talent.id;

export default class DefensiveBuffs extends Auras {
  auras() {
    return MAJOR_DEFENSIVES.map((data) => ({ spellId: buffId(data), timelineHighlight: true }));
  }
}
