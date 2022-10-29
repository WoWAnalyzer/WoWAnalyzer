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
        timelineHighlight: true,
      },
      {
        spellId: SPELLS.HOT_STREAK.id,
        timelineHighlight: true,
      },
      {
        spellId: SPELLS.INFERNAL_CASCADE_BUFF.id,
        timelineHighlight: true,
      },
      {
        spellId: TALENTS.COMBUSTION_TALENT.id,
        triggeredBySpellId: TALENTS.COMBUSTION_TALENT.id,
        timelineHighlight: true,
      },
      {
        spellId: SPELLS.RUNE_OF_POWER_BUFF.id,
        enabled: combatant.hasTalent(TALENTS.RUNE_OF_POWER_TALENT),
        timelineHighlight: true,
      },
      {
        spellId: TALENTS.BLAZING_BARRIER_TALENT.id,
        triggeredBySpellId: TALENTS.BLAZING_BARRIER_TALENT.id,
        timelineHighlight: true,
      },
      {
        spellId: TALENTS.ICE_BLOCK_TALENT.id,
        triggeredBySpellId: TALENTS.ICE_BLOCK_TALENT.id,
        timelineHighlight: true,
      },
      {
        spellId: SPELLS.FIRESTORM_BUFF.id,
        timelineHighlight: true,
      },
      {
        spellId: SPELLS.DISCIPLINARY_COMMAND_BUFF.id,
        timelineHighlight: true,
      },
      {
        spellId: SPELLS.SUN_KINGS_BLESSING_BUFF.id,
        timelineHighlight: true,
      },
      {
        spellId: SPELLS.MIRROR_IMAGE.id,
        triggeredBySpellId: SPELLS.MIRROR_IMAGE.id,
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
