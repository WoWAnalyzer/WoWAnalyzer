import SPELLS from 'common/SPELLS/demonhunter';
import Auras from 'parser/core/modules/Auras';
import { buffId, MajorDefensiveSpellData } from 'interface/guide/components/MajorDefensives';

// This is separate from
export const MAJOR_DEFENSIVES: MajorDefensiveSpellData[] = [
  { triggerSpell: SPELLS.METAMORPHOSIS_TANK, isBuff: true, bufferMs: 26000 },
  // {triggerSpell: TALENTS.FIERY_BRAND_TALENT, appliedSpell: SPELLS.FIERY_BRAND_DOT, isBuff: false},
];

export default class DefensiveBuffs extends Auras {
  auras() {
    return MAJOR_DEFENSIVES.map((data) => ({ spellId: buffId(data), timelineHighlight: true }));
  }
}
