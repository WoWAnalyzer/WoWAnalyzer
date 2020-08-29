import SPELLS from 'common/SPELLS';
import BLOODLUST_BUFFS from 'game/BLOODLUST_BUFFS';
import CoreBuffs from 'parser/core/modules/Buffs';

class Buffs extends CoreBuffs {
  buffs() {
    return [
      {
        spellId: SPELLS.BESTIAL_WRATH.id,
        timelineHightlight: true,
        triggeredBySpellId: SPELLS.BESTIAL_WRATH.id,
      },
      {
        spellId: SPELLS.DIRE_BEAST_BUFF.id,
        timelineHightlight: true,
        triggeredBySpellId: SPELLS.DIRE_BEAST_TALENT.id,
      },
      {
        //shows pet buff, since that is what is interesting to see and the player buff is 8 different spellIDs
        spellId: SPELLS.BARBED_SHOT_PET_BUFF.id,
        timelineHightlight: true,
        triggeredBySpellId: SPELLS.BARBED_SHOT.id,
      },
      {
        spellId: SPELLS.BEAST_CLEAVE_BUFF.id,
        timelineHightlight: true,
        triggeredBySpellId: SPELLS.MULTISHOT_BM.id,
      },
      {
        spellId: SPELLS.ASPECT_OF_THE_WILD.id,
        timelineHightlight: true,
        triggeredBySpellId: SPELLS.ASPECT_OF_THE_WILD.id,
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
