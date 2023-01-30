import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/shaman';
import BLOODLUST_BUFFS from 'game/BLOODLUST_BUFFS';
import CoreAuras from 'parser/core/modules/Auras';

class Buffs extends CoreAuras {
  auras() {
    const combatant = this.selectedCombatant;

    // This should include ALL buffs that can be applied by your spec.
    // This data can be used by various kinds of modules to improve their results, and modules added in the future may rely on buffs that aren't used today.
    return [
      {
        spellId: TALENTS.ICEFURY_TALENT.id,
        timelineHighlight: true,
      },
      {
        spellId: TALENTS.FIRE_ELEMENTAL_TALENT.id,
        timelineHighlight: true,
      },
      {
        spellId: SPELLS.MASTER_OF_THE_ELEMENTS_BUFF.id,
        enabled: combatant.hasTalent(TALENTS.MASTER_OF_THE_ELEMENTS_TALENT),
        timelineHighlight: true,
      },
      {
        spellId: SPELLS.SURGE_OF_POWER_BUFF.id,
        enabled: combatant.hasTalent(TALENTS.SURGE_OF_POWER_TALENT),
        timelineHighlight: true,
      },
      {
        spellId: TALENTS.STORMKEEPER_1_ELEMENTAL_TALENT.id,
        triggeredBySpellId: TALENTS.STORMKEEPER_1_ELEMENTAL_TALENT.id,
        timelineHighlight: true,
      },
      {
        spellId: Object.keys(BLOODLUST_BUFFS).map((item) => Number(item)),
        timelineHighlight: true,
      },
    ];
  }
}

export default Buffs;
