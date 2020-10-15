import SPELLS from 'common/SPELLS';
import BLOODLUST_BUFFS from 'game/BLOODLUST_BUFFS';
import CoreBuffs from 'parser/core/modules/Buffs';

class Buffs extends CoreBuffs {
  buffs() {
    return [
      {
        spellId: SPELLS.STORM_EARTH_AND_FIRE_CAST.id,
        timelineHighlight: true,
      },
      {
        spellId: SPELLS.SERENITY_TALENT.id,
        timelineHighlight: true,
      },
      {
        spellId: SPELLS.TOUCH_OF_KARMA_CAST.id,
        timelineHighlight: true,
      },
      {
        spellId: SPELLS.DANCE_OF_CHIJI_BUFF.id,
        timelineHighlight: true,
      },
      {
        spellId: SPELLS.COMBO_BREAKER_BUFF.id,
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
