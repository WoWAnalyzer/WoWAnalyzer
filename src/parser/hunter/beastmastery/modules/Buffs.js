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
        spellId: SPELLS.ASPECT_OF_THE_WILD.id,
        duration: BuffDuration.STATIC(20000),
        timelineHightlight: true,
      },
      {
        spellId: SPELLS.ASPECT_OF_THE_TURTLE.id,
        duration: BuffDuration.STATIC(20000),
        timelineHightlight: true, // showing because it's relevant to know when we couldn't attack (this could explain some downtime)
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
