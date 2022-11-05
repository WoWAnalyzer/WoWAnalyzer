import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/hunter';
import BLOODLUST_BUFFS from 'game/BLOODLUST_BUFFS';
import CoreAuras from 'parser/core/modules/Auras';

class Buffs extends CoreAuras {
  auras() {
    return [
      {
        spellId: SPELLS.BESTIAL_WRATH.id,
        timelineHighlight: true,
        triggeredBySpellId: SPELLS.BESTIAL_WRATH.id,
      },
      {
        spellId: SPELLS.DIRE_BEAST_BUFF.id,
        timelineHighlight: true,
        triggeredBySpellId: TALENTS.DIRE_BEAST_TALENT.id,
      },
      {
        //shows pet buff, since that is what is interesting to see and the player buff is 8 different spellIDs
        spellId: SPELLS.BARBED_SHOT_PET_BUFF.id,
        timelineHighlight: true,
        triggeredBySpellId: SPELLS.BARBED_SHOT.id,
      },
      {
        spellId: SPELLS.BEAST_CLEAVE_BUFF.id,
        timelineHighlight: true,
        triggeredBySpellId: SPELLS.MULTISHOT_BM.id,
      },
      {
        spellId: SPELLS.ASPECT_OF_THE_WILD.id,
        timelineHighlight: true,
        triggeredBySpellId: SPELLS.ASPECT_OF_THE_WILD.id,
      },
      {
        spellId: SPELLS.ASPECT_OF_THE_TURTLE.id,
        timelineHighlight: true, // showing because it's relevant to know when we couldn't attack (this could explain some downtime)
        triggeredBySpellId: SPELLS.ASPECT_OF_THE_TURTLE.id,
      },
      {
        spellId: Object.keys(BLOODLUST_BUFFS).map((item) => Number(item)),
        timelineHighlight: true,
      },
    ];
  }
}

export default Buffs;
