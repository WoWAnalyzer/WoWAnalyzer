import SPELLS from 'common/SPELLS';
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
        spellId: SPELLS.COMBUSTION.id,
        triggeredBySpellId: SPELLS.COMBUSTION.id,
        timelineHighlight: true,
      },
      {
        spellId: SPELLS.RUNE_OF_POWER_BUFF.id,
        enabled: combatant.hasTalent(SPELLS.RUNE_OF_POWER_TALENT),
        timelineHighlight: true,
      },
      {
        spellId: SPELLS.BLAZING_BARRIER.id,
        triggeredBySpellId: SPELLS.BLAZING_BARRIER.id,
        timelineHighlight: true,
      },
      {
        spellId: SPELLS.ICE_BLOCK.id,
        triggeredBySpellId: SPELLS.ICE_BLOCK.id,
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
