import SPELLS from 'common/SPELLS';
import BLOODLUST_BUFFS from 'game/BLOODLUST_BUFFS';
import CoreBuffs from 'parser/core/modules/Buffs';

class Buffs extends CoreBuffs {
  buffs() {
    return [
      {
        spellId: SPELLS.BESTIAL_WRATH.id,
        timelineHightlight: true,
      },
      {
        spellId: SPELLS.DIRE_BEAST_BUFF.id,
        timelineHightlight: true,
      },
      {
        //shows pet buff, since that is what is interesting to see and the
        // player buff is 5 different spellIDs
        spellId: SPELLS.BARBED_SHOT_PET_BUFF.id,
        timelineHightlight: true,
      },
      {
        spellId: SPELLS.BEAST_CLEAVE_BUFF.id,
        timelineHightlight: true,
      },
      {
        spellId: SPELLS.ASPECT_OF_THE_WILD.id,
        timelineHightlight: true,
      },
      {
        spellId: SPELLS.ASPECT_OF_THE_TURTLE.id,
        timelineHightlight: true, // showing because it's relevant to know when
                                  // we couldn't attack (this could explain
                                  // some downtime)
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
