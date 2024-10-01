import SPELLS from 'common/SPELLS';
import BLOODLUST_BUFFS from 'game/BLOODLUST_BUFFS';
import CoreAuras from 'parser/core/modules/Auras';

class Buffs extends CoreAuras {
  auras() {
    return [
      {
        spellId: SPELLS.STORM_EARTH_AND_FIRE_CAST.id,
        timelineHighlight: true,
      },
      {
        spellId: SPELLS.WEAPONS_OF_ORDER_BUFF_AND_HEAL.id,
        timelineHighlight: true,
      },
      // {
      //   spellId: SPELLS.WEAPONS_OF_ORDER_CHI_DISCOUNT.id,
      //   timelineHighlight: true,
      // },
      {
        spellId: SPELLS.TOUCH_OF_KARMA_CAST.id,
        timelineHighlight: true,
      },
      {
        spellId: SPELLS.DANCE_OF_CHI_JI_BUFF.id,
        timelineHighlight: true,
      },
      {
        spellId: SPELLS.COMBO_BREAKER_BUFF.id,
        timelineHighlight: true,
      },
      {
        spellId: Object.keys(BLOODLUST_BUFFS).map((item) => Number(item)),
        timelineHighlight: true,
      },
      {
        spellId: SPELLS.PRIMORDIAL_POWER_BUFF.id,
        timelineHighlight: true,
      },
    ];
  }
}

export default Buffs;
