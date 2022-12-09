import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/priest';
import BLOODLUST_BUFFS from 'game/BLOODLUST_BUFFS';
import CoreAuras from 'parser/core/modules/Auras';

class Buffs extends CoreAuras {
  auras() {
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
        spellId: SPELLS.SHADOWY_INSIGHT_BUFF.id,
        //triggeredBySpellId: SPELLS.SHADOWY_INSIGHT.id, // If the log starts with the buff active, having this active causes "no ability available" error in PrePullCooldowns.
        timelineHighlight: true,
      },
      {
        spellId: SPELLS.DARK_EVANGELISM_TALENT_BUFF.id,
        triggeredBySpellId: SPELLS.MIND_FLAY.id,
        enabled: combatant.hasTalent(TALENTS.DARK_EVANGELISM_TALENT.id),
        timelineHighlight: false,
      },
      {
        spellId: SPELLS.UNFURLING_DARKNESS_BUFF.id,
        triggeredBySpellId: SPELLS.VAMPIRIC_TOUCH.id,
        enabled: combatant.hasTalent(TALENTS.UNFURLING_DARKNESS_TALENT.id),
        timelineHighlight: true,
      },
      {
        spellId: SPELLS.DEATH_AND_MADNESS_BUFF.id,
        triggeredBySpellId: TALENTS.SHADOW_WORD_DEATH_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.DEATH_AND_MADNESS_TALENT.id),
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
        spellId: Object.keys(BLOODLUST_BUFFS).map((item) => Number(item)),
        timelineHighlight: true,
      },
    ];
  }
}

export default Buffs;
