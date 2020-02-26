import SPELLS from 'common/SPELLS';
import CoreBuffs from 'parser/core/modules/Buffs';
import BLOODLUST_BUFFS from 'game/BLOODLUST_BUFFS';

class Buffs extends CoreBuffs {
  buffs() {
    //const combatant = this.selectedCombatant;

    // This should include ALL buffs that can be applied by your spec.
    // This data can be used by various kinds of modules to improve their results, and modules added in the future may rely on buffs that aren't used today.
    return [
      {
        spellId: Object.keys(BLOODLUST_BUFFS).map(item => Number(item)),
        timelineHightlight: true,
      },
      {
        spellId: SPELLS.ENRAGE.id,
        timelineHightlight: true,
      },
      {
        spellId: SPELLS.RECKLESSNESS.id,
        timelineHightlight: true,
      },
      {
        spellId: SPELLS.SIEGEBREAKER_TALENT.id,
        timelineHightlight: true,
      },
    ];
  }
}

export default Buffs;
