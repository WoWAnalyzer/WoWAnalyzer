import SPELLS from 'common/SPELLS';
import BLOODLUST_BUFFS from 'game/BLOODLUST_BUFFS';
import CoreBuffs from 'parser/core/modules/Buffs';

class Buffs extends CoreBuffs {
  buffs() {
    return [
      {
        spellId: SPELLS.TRUESHOT.id,
        timelineHightlight: true,
        triggeredBySpellId: SPELLS.TRUESHOT.id,
      },
      {
        spellId: SPELLS.PRECISE_SHOTS.id,
        timelineHightlight: true,
        triggeredBySpellId: SPELLS.AIMED_SHOT.id,
      },
      {
        spellId: SPELLS.ASPECT_OF_THE_TURTLE.id,
        timelineHightlight: true, // showing because it's relevant to know when we couldn't attack (this could explain some downtime)
        triggeredBySpellId: SPELLS.ASPECT_OF_THE_TURTLE.id,
      },
      {
        spellId: Object.keys(BLOODLUST_BUFFS).map(item => Number(item)),
        timelineHightlight: true,
      },
    ];
  }
}

export default Buffs;
