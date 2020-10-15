import SPELLS from 'common/SPELLS';
import BLOODLUST_BUFFS from 'game/BLOODLUST_BUFFS';
import CoreBuffs from 'parser/core/modules/Buffs';

class Buffs extends CoreBuffs {
  buffs() {
    return [
      {
        spellId: SPELLS.FLAMETONGUE_BUFF.id,
        timelineHighlight: true,
      },
      {
        spellId: SPELLS.FROSTBRAND.id,
        timelineHighlight: true,
      },
      {
        spellId: SPELLS.FURY_OF_AIR_TALENT.id,
        timelineHighlight: true,
      },
      {
        spellId: SPELLS.ASCENDANCE_TALENT_ENHANCEMENT.id,
        timelineHighlight: true,
      },
      {
        spellId: SPELLS.STORMBRINGER_BUFF.id,
        timelineHighlight: true,
      },
      {
        spellId: SPELLS.BERSERKING.id,
        timelineHighlight: true,
      },
      {
        spellId: Object.keys(BLOODLUST_BUFFS).map(item => Number(item)),
        timelineHighlight: true,
      },
    ];
  }
}

export default Buffs;
