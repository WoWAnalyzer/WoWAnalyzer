import BLOODLUST_BUFFS from 'game/BLOODLUST_BUFFS';
import CoreBuffs from 'parser/core/modules/Buffs';

import * as SPELLS from '@wowanalyzer/tbc-mage/src/SPELLS';

class Buffs extends CoreBuffs {
  buffs() {
    return [
      {
        spellId: SPELLS.ARCANE_POWER,
        timelineHighlight: true,
      },
      {
        spellId: SPELLS.PRESENCE_OF_MIND,
        timelineHighlight: true,
      },
      {
        spellId: SPELLS.ICY_VEINS,
        timelineHighlight: true,
      },
      {
        spellId: SPELLS.ARCANE_BLAST_DEBUFF,
        timelineHighlight: true,
      },
      {
        spellId: SPELLS.MAGE_ARMOR,
        timelineHighlight: true,
      },
      {
        spellId: SPELLS.MOLTEN_ARMOR,
        timelineHighlight: true,
      },
      {
        spellId: SPELLS.ICE_ARMOR,
        timelineHighlight: true,
      },
      {
        spellId: SPELLS.FROST_ARMOR,
        timelineHighlight: true,
      },
      {
        spellId: Object.keys(BLOODLUST_BUFFS).map((item) => Number(item)),
        timelineHighlight: true,
      },
    ];
  }
}

export default Buffs;
