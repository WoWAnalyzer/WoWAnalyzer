import SPELLS from 'common/SPELLS';
import BLOODLUST_BUFFS from 'game/BLOODLUST_BUFFS';
import CoreBuffs from 'parser/core/modules/Buffs';

class Buffs extends CoreBuffs {
  buffs() {
    return [
      {
        spellId: SPELLS.FLAMETONGUE_BUFF.id,
        timelineHightlight: true,
      },
      {
        spellId: SPELLS.FROSTBRAND.id,
        timelineHightlight: true,
      },
      {
        spellId: SPELLS.FURY_OF_AIR_TALENT.id,
        timelineHightlight: true,
      },
      {
        spellId: SPELLS.ASCENDANCE_TALENT_ENHANCEMENT.id,
        timelineHightlight: true,
      },
      {
        spellId: SPELLS.STORMBRINGER_BUFF.id,
        timelineHightlight: true,
      },
      {
        spellId: SPELLS.BERSERKING.id,
        timelineHightlight: true,
      },
      {
        spellId: Object.keys(BLOODLUST_BUFFS).map(item => Number(item)),
        timelineHightlight: true,
      },
    ];
  }
}

export default Buffs;
