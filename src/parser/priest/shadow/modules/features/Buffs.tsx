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
        spellId: SPELLS.VOIDFORM_BUFF.id,
        triggeredBySpellId: SPELLS.VOID_ERUPTION.id,
        timelineHighlight: true,
      },
      {
        spellId: SPELLS.DARK_THOUGHT_BUFF.id,
        triggeredBySpellId: SPELLS.DARK_THOUGHTS.id,
        timelineHighlight: true,
      },
      {
        spellId: SPELLS.UNFURLING_DARKNESS_BUFF.id,
        triggeredBySpellId: SPELLS.VAMPIRIC_TOUCH.id,
        enabled: combatant.hasTalent(SPELLS.UNFURLING_DARKNESS_TALENT.id),
        timelineHighlight: true,
      },
      {
        spellId: SPELLS.SURRENDER_TO_MADNESS_TALENT.id,
        enabled: combatant.hasTalent(SPELLS.SURRENDER_TO_MADNESS_TALENT.id),
        timelineHighlight: true,
      },
      {
        spellId: SPELLS.VAMPIRIC_EMBRACE.id,
        timelineHighlight: true,
      },
      {
        spellId: SPELLS.DISPERSION.id,
        timelineHighlight: true,
      },
      {
        spellId: SPELLS.POWER_WORD_SHIELD.id,
        triggeredBySpellId: SPELLS.POWER_WORD_SHIELD.id,
        timelineHighlight: true,
      },
      {
        spellId: SPELLS.FADE.id,
        timelineHighlight: true,
      },
      {
        spellId: SPELLS.DESPERATE_PRAYER.id,
        timelineHighlight: true,
      },
      {
        spellId: SPELLS.MIND_CONTROL.id,
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
