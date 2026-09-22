import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/shaman';
import { TIERS } from 'game/TIERS';
import { SpellbookAura } from 'parser/core/modules/Aura';
import CoreAuras from '../../shared/Buffs';

class Buffs extends CoreAuras {
  auras(): SpellbookAura[] {
    const combatant = this.selectedCombatant;

    // This should include ALL buffs that can be applied by your spec.
    // This data can be used by various kinds of modules to improve their results, and modules added in the future may rely on buffs that aren't used today.
    const buffs = [
      ...super.auras(),
      {
        spellId: SPELLS.STORMKEEPER_BUFF_AND_CAST.id,
        triggeredBySpellId: SPELLS.STORMKEEPER_BUFF_AND_CAST.id,
        enabled: combatant.hasTalent(TALENTS.STORMKEEPER_TALENT),
        timelineHighlight: true,
      },
      {
        spellId: SPELLS.TEMPEST_BUFF.id,
        enabled: combatant.hasTalent(TALENTS.TEMPEST_TALENT),
        timelineHighlight: true,
      },
      {
        spellId: SPELLS.ASCENDANCE_ELEMENTAL_BUFF.id,
        enabled:
          combatant.hasTalent(TALENTS.ASCENDANCE_ELEMENTAL_TALENT) ||
          combatant.hasTalent(TALENTS.DEEPLY_ROOTED_ELEMENTS_TALENT),
        triggeredBySpellId: TALENTS.ASCENDANCE_ELEMENTAL_TALENT.id,
        timelineHighlight: true,
      },
      {
        spellId: SPELLS.LAVA_SURGE.id,
        enabled: true,
        timelineHighlight: true,
      },
      {
        spellId: SPELLS.MASTER_OF_THE_ELEMENTS_BUFF.id,
        enabled: combatant.hasTalent(TALENTS.MASTER_OF_THE_ELEMENTS_TALENT),
        triggeredBySpellId: TALENTS.LAVA_BURST_TALENT.id,
        timelineHighlight: true,
      },
      {
        spellId: SPELLS.PRIMAL_FIRE_ELEMENTAL.id,
        enabled: combatant.hasTalent(TALENTS.PRIMAL_ELEMENTALIST_TALENT),
        triggeredBySpellId: TALENTS.ASCENDANCE_ELEMENTAL_TALENT.id,
      },
      {
        spellId: SPELLS.ANCESTRAL_SWIFTNESS_CAST.id,
        enabled: combatant.hasTalent(TALENTS.ANCESTRAL_SWIFTNESS_TALENT),
        triggeredBySpellId: SPELLS.ANCESTRAL_SWIFTNESS_CAST.id,
      },
      {
        spellId: SPELLS.CALL_OF_THE_ANCESTORS_BUFF.id,
        enabled: combatant.hasTalent(TALENTS.CALL_OF_THE_ANCESTORS_TALENT),
        triggeredBySpellId: SPELLS.ANCESTRAL_SWIFTNESS_CAST.id,
        timelineHighlight: true,
      },
      {
        spellId: SPELLS.MIDNIGHT_S1_THUNDEROUS_VELOCITY_BUFF.id,
        enabled: combatant.has2PieceByTier(TIERS.MID1),
        triggeredBySpellId: SPELLS.STORMKEEPER_BUFF_AND_CAST.id,
      },
      {
        spellId: TALENTS.SPIRITWALKERS_GRACE_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.SPIRITWALKERS_GRACE_TALENT),
        triggeredBySpellId: TALENTS.SPIRITWALKERS_GRACE_TALENT.id,
      },
      {
        spellId: SPELLS.PURGING_FLAMES_BUFF.id,
        enabled: combatant.hasTalent(TALENTS.PURGING_FLAMES_TALENT),
        triggeredBySpellId: SPELLS.VOLTAIC_BLAZE_CAST.id,
        timelineHighlight: true,
      },
    ];

    const swg = buffs.find((buff) => buff.spellId === TALENTS.SPIRITWALKERS_GRACE_TALENT.id);
    if (swg) swg.timelineHighlight = true;
    return buffs;
  }
}

export default Buffs;
