import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/shaman';
import CoreAuras from 'parser/core/modules/Auras';

class Buffs extends CoreAuras {
  auras() {
    const combatant = this.selectedCombatant;

    // This should include ALL buffs that can be applied by your spec.
    // This data can be used by various kinds of modules to improve their results, and modules added in the future may rely on buffs that aren't used today.
    return [
      {
        spellId: SPELLS.ICEFURY.id,
        enabled: combatant.hasTalent(TALENTS.ICEFURY_TALENT),
        timelineHighlight: true,
        triggeredBySpellId: SPELLS.ICEFURY.id,
      },
      {
        spellId: SPELLS.ICEFURY_CAST.id,
        enabled: combatant.hasTalent(TALENTS.ICEFURY_TALENT),
        timelineHighlight: true,
        triggeredBySpellId: TALENTS.LAVA_BURST_TALENT.id,
      },
      {
        spellId: TALENTS.FIRE_ELEMENTAL_TALENT.id,
        timelineHighlight: true,
      },
      {
        spellId: SPELLS.MASTER_OF_THE_ELEMENTS_BUFF.id,
        enabled: combatant.hasTalent(TALENTS.MASTER_OF_THE_ELEMENTS_ELEMENTAL_TALENT),
        timelineHighlight: true,
      },
      {
        spellId: SPELLS.SURGE_OF_POWER_BUFF.id,
        enabled: combatant.hasTalent(TALENTS.SURGE_OF_POWER_TALENT),
        timelineHighlight: true,
      },
      {
        spellId: SPELLS.STORMKEEPER_BUFF_AND_CAST.id,
        triggeredBySpellId: SPELLS.STORMKEEPER_BUFF_AND_CAST.id,
        enabled: combatant.hasTalent(TALENTS.STORMKEEPER_TALENT),
        timelineHighlight: true,
      },
      {
        spellId: TALENTS.ASCENDANCE_ELEMENTAL_TALENT.id,
        enabled:
          combatant.hasTalent(TALENTS.ASCENDANCE_ELEMENTAL_TALENT) ||
          combatant.hasTalent(TALENTS.DEEPLY_ROOTED_ELEMENTS_TALENT),
        timelineHighlight: true,
      },
      {
        spellId: SPELLS.LAVA_SURGE.id,
        enabled: true,
        timelineHighlight: true,
      },
    ];
  }
}

export default Buffs;
