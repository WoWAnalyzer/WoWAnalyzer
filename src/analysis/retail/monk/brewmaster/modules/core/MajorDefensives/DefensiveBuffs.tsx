import SPELLS from 'common/SPELLS';
import talents from 'common/TALENTS/monk';
import Auras from 'parser/core/modules/Auras';
import { buffId, MajorDefensiveSpellData } from 'interface/guide/components/MajorDefensives';

export const MAJOR_DEFENSIVES: MajorDefensiveSpellData[] = [
  {
    triggerSpell: talents.CELESTIAL_BREW_TALENT,
    isBuff: true,
  },
  {
    triggerSpell: talents.FORTIFYING_BREW_TALENT,
    appliedSpell: SPELLS.FORTIFYING_BREW_BRM_BUFF,
    isBuff: true,
  },
  {
    triggerSpell: talents.DAMPEN_HARM_TALENT,
    isBuff: true,
  },
  {
    triggerSpell: talents.DIFFUSE_MAGIC_TALENT,
    isBuff: true,
  },
  {
    triggerSpell: talents.ZEN_MEDITATION_TALENT,
    isBuff: true,
  },
];

export default class DefensiveBuffs extends Auras {
  auras() {
    return MAJOR_DEFENSIVES.map((data) => ({ spellId: buffId(data), timelineHighlight: true }));
  }
}
