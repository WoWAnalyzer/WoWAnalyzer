import SPELLS from 'common/SPELLS';
import BLOODLUST_BUFFS from 'game/BLOODLUST_BUFFS';
import CoreBuffs, { BuffDuration } from 'parser/core/modules/Buffs';

class Buffs extends CoreBuffs {
  buffs() {
    const combatant = this.selectedCombatant;

    // Documentation:
    return [
      {
        spell: SPELLS.BESTIAL_WRATH,
        duration: BuffDuration.STATIC(15000),
        timelineHightlight: true,
      },
      {
        spell: SPELLS.ASPECT_OF_THE_WILD,
        duration: BuffDuration.STATIC(20000),
        timelineHightlight: true,
      },
      {
        spell: SPELLS.ASPECT_OF_THE_TURTLE,
        duration: BuffDuration.STATIC(20000),
        timelineHightlight: true, // showing because it's relevant to know when we couldn't attack (this could explain some downtime)
      },
      {
        spell: Object.keys(BLOODLUST_BUFFS).map(spellId => SPELLS[spellId]),
        duration: BuffDuration.STATIC(40000),
        timelineHightlight: true,
      },
    ];
  }
}

export default Buffs;
