import SPELLS from 'common/SPELLS';
import CoreAuras from 'parser/core/modules/Auras';

export class Buffs extends CoreAuras {
  auras() {
    return [
      {
        spellId: SPELLS.VOID_METAMORPHOSIS_BUFF.id,
        timelineHighlight: true,
        triggeredBySpellId: SPELLS.VOID_METAMORPHOSIS_CAST.id,
      },
    ];
  }
}
