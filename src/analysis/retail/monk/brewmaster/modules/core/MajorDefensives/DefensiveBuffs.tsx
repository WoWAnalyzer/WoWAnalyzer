import SPELLS from 'common/SPELLS';
import Spell from 'common/SPELLS/Spell';
import talents from 'common/TALENTS/monk';
import { Talent } from 'common/TALENTS/types';
import Auras from 'parser/core/modules/Auras';

export const MAJOR_DEFENSIVES: Array<[Talent, Spell | null]> = [
  [talents.CELESTIAL_BREW_TALENT, null],
  [talents.FORTIFYING_BREW_TALENT, SPELLS.FORTIFYING_BREW_BRM_BUFF],
  [talents.DAMPEN_HARM_TALENT, null],
  [talents.DIFFUSE_MAGIC_TALENT, null],
  [talents.ZEN_MEDITATION_TALENT, null],
];

export const buffId = ([talent, spell]: [Talent, Spell | null]): number => spell?.id ?? talent.id;

export default class DefensiveBuffs extends Auras {
  auras() {
    return MAJOR_DEFENSIVES.map((data) => ({ spellId: buffId(data), timelineHighlight: true }));
  }
}
