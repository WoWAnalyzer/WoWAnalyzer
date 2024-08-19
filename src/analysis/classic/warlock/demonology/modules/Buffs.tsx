import CoreAuras from 'parser/core/modules/Auras';
import BLOODLUST_BUFFS from 'game/BLOODLUST_BUFFS';
import ITEM_BUFFS from 'game/classic/ITEM_BUFFS';
import SPELLS from 'common/SPELLS/classic';

class Buffs extends CoreAuras {
  auras() {
    return [
      {
        spellId: SPELLS.DECIMATION.id,
        timelineHighlight: true,
      },
      {
        spellId: SPELLS.DEMON_SOUL_FELGUARD_BUFF.id,
        timelineHighlight: true,
        triggeredBySpellId: SPELLS.DEMON_SOUL.id,
      },
      {
        spellId: SPELLS.METAMORPHOSIS.id,
        timelineHighlight: true,
        triggeredBySpellId: SPELLS.METAMORPHOSIS.id,
      },
      {
        spellId: SPELLS.MOLTEN_CORE_BUFF.id,
        timelineHighlight: true,
      },
      {
        spellId: SPELLS.CORRUPTION_ABSOLUTE.id,
        timelineHighlight: true,
      },
      {
        spellId: Object.keys(BLOODLUST_BUFFS).map((item) => Number(item)),
        timelineHighlight: true,
      },
      {
        spellId: Object.keys(ITEM_BUFFS).map((item) => Number(item)),
        timelineHighlight: true,
      },
    ];
  }
}

export default Buffs;
