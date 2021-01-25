import SPELLS from 'common/SPELLS';
import CoreBuffs from 'parser/core/modules/Buffs';
import BLOODLUST_BUFFS from 'game/BLOODLUST_BUFFS';

class Buffs extends CoreBuffs {
  buffs() {
    const combatant = this.selectedCombatant;

    // This should include ALL buffs that can be applied by your spec.
    // This data can be used by various kinds of modules to improve their results, and modules added in the future may rely on buffs that aren't used today.
    return [
      {
        spellId: SPELLS.ICEFURY_TALENT.id,
        timelineHighlight: true,
      },
      {
        spellId: SPELLS.FIRE_ELEMENTAL.id,
        timelineHighlight: true,
      },
      {
        spellId: SPELLS.MASTER_OF_THE_ELEMENTS_BUFF.id,
        enabled: combatant.hasTalent(SPELLS.MASTER_OF_THE_ELEMENTS_TALENT.id),
        timelineHighlight: true,
      },
      {
        spellId: SPELLS.SURGE_OF_POWER_BUFF.id,
        enabled: combatant.hasTalent(SPELLS.SURGE_OF_POWER_TALENT.id),
        timelineHighlight: true,
      },
      {
        spellId: SPELLS.STORMKEEPER_TALENT_ELEMENTAL.id,
        triggeredBySpellId: SPELLS.STORMKEEPER_TALENT_ELEMENTAL.id,
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
