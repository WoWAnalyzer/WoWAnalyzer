import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/mage';
import BLOODLUST_BUFFS from 'game/BLOODLUST_BUFFS';
import CoreAuras from 'parser/core/modules/Auras';

class Buffs extends CoreAuras {
  auras() {
    const combatant = this.selectedCombatant;

    // This should include ALL buffs that can be applied by your spec.
    // This data can be used by various kinds of modules to improve their results, and modules added in the future may rely on buffs that aren't used today.
    return [
      {
        spellId: SPELLS.HEATING_UP.id,
        timelineHighlight: false,
      },
      {
        spellId: SPELLS.HOT_STREAK.id,
        timelineHighlight: true,
      },
      {
        spellId: SPELLS.FEEL_THE_BURN_BUFF.id,
        enabled: combatant.hasTalent(TALENTS.FEEL_THE_BURN_TALENT),
        timelineHighlight: true,
      },
      {
        spellId: TALENTS.COMBUSTION_TALENT.id,
        triggeredBySpellId: TALENTS.COMBUSTION_TALENT.id,
        enabled:
          combatant.hasTalent(TALENTS.COMBUSTION_TALENT) ||
          combatant.hasTalent(TALENTS.SUN_KINGS_BLESSING_TALENT),
        timelineHighlight: true,
      },
      {
        spellId: TALENTS.BLAZING_BARRIER_TALENT.id,
        triggeredBySpellId: TALENTS.BLAZING_BARRIER_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.BLAZING_BARRIER_TALENT),
        timelineHighlight: true,
      },
      {
        spellId: TALENTS.ICE_BLOCK_TALENT.id,
        triggeredBySpellId: TALENTS.ICE_BLOCK_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.BLAZING_BARRIER_TALENT),
        timelineHighlight: true,
      },
      {
        spellId: TALENTS.HYPERTHERMIA_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.HYPERTHERMIA_TALENT),
        timelineHighlight: true,
      },
      {
        spellId: SPELLS.FURY_OF_THE_SUN_KING.id,
        enabled: combatant.hasTalent(TALENTS.SUN_KINGS_BLESSING_TALENT),
        timelineHighlight: true,
      },
      {
        spellId: TALENTS.MIRROR_IMAGE_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.MIRROR_IMAGE_TALENT),
        timelineHighlight: true,
      },
      {
        spellId: SPELLS.IMPROVED_SCORCH_BUFF.id,
        enabled: combatant.hasTalent(TALENTS.IMPROVED_SCORCH_TALENT),
        timelineHighlight: true,
      },
      {
        spellId: SPELLS.FLAME_ACCELERANT_BUFF.id,
        enabled: combatant.hasTalent(TALENTS.FLAME_ACCELERANT_TALENT),
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
