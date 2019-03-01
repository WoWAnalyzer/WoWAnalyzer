import SPELLS from 'common/SPELLS';
import BLOODLUST_BUFFS from 'game/BLOODLUST_BUFFS';
import CoreBuffs, { BuffDuration } from 'parser/core/modules/Buffs';

class Buffs extends CoreBuffs {
  buffs() {
    // const combatant = this.selectedCombatant;

    return [
      {
        spellId: SPELLS.BESTIAL_WRATH.id,
        duration: BuffDuration.STATIC(15000),
        timelineHightlight: true,
      },
      {
        spellId: SPELLS.DIRE_BEAST_BUFF.id,
        duration: BuffDuration.STATIC(8000),
        timelineHightlight: true,
      },
      {
        //shows pet buff, since that is what is interesting to see and the player buff is 5 different spellIDs
        spellId: SPELLS.BARBED_SHOT_PET_BUFF.id,
        duration: BuffDuration.STATIC(8000),
        timelineHightlight: true,
      },
      {
        spellId: SPELLS.BEAST_CLEAVE_BUFF.id,
        duration: BuffDuration.STATIC(4000),
        timelineHightlight: true,
      },
      {
        spellId: SPELLS.ASPECT_OF_THE_WILD.id,
        duration: BuffDuration.STATIC(20000),
        timelineHightlight: true,
      },
      {
        spellId: SPELLS.ASPECT_OF_THE_TURTLE.id,
        duration: BuffDuration.AT_MOST(8000),
        timelineHightlight: true, // showing because it's relevant to know when we couldn't attack (this could explain some downtime)
      },
      {
        spellId: SPELLS.BERSERKING.id,
        duration: BuffDuration.AT_MOST(12000),
        timelineHightlight: true,
      },
      {
        spellId: Object.keys(BLOODLUST_BUFFS).map(item => Number(item)),
        duration: BuffDuration.STATIC(40000),
        timelineHightlight: true,
      },
    ];
  }
}

export default Buffs;
