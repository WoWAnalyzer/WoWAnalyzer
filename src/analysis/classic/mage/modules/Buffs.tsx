import SPELLS from 'common/SPELLS/classic/mage';
import BLOODLUST_BUFFS from 'game/BLOODLUST_BUFFS';
import CoreAuras from 'parser/core/modules/Auras';

class Buffs extends CoreAuras {
  auras() {
    return [
      {
        spellId: SPELLS.ARCANE_POWER.id,
        timelineHighlight: true,
      },
      {
        spellId: SPELLS.PRESENCE_OF_MIND.id,
        timelineHighlight: true,
      },
      {
        spellId: SPELLS.ICY_VEINS.id,
        timelineHighlight: true,
      },
      {
        spellId: SPELLS.ARCANE_BLAST_DEBUFF.id,
        timelineHighlight: true,
      },
      {
        spellId: SPELLS.MAGE_ARMOR.id,
        timelineHighlight: true,
      },
      {
        spellId: SPELLS.MOLTEN_ARMOR.id,
        timelineHighlight: true,
      },
      {
        spellId: SPELLS.ICE_ARMOR.id,
        timelineHighlight: true,
      },
      {
        spellId: SPELLS.FROST_ARMOR.id,
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
