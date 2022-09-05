import * as SPELLS from 'analysis/classic/mage/SPELLS';
import BLOODLUST_BUFFS from 'game/BLOODLUST_BUFFS';
import CoreAuras from 'parser/core/modules/Auras';

class Buffs extends CoreAuras {
  auras() {
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
