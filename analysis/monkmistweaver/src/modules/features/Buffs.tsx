import SPELLS from 'common/SPELLS';
import BLOODLUST_BUFFS from 'game/BLOODLUST_BUFFS';
import COVENANTS from 'game/shadowlands/COVENANTS';
import CoreAuras from 'parser/core/modules/Auras';

class Buffs extends CoreAuras {
  auras() {
    const combatant = this.selectedCombatant;

    // This should include ALL buffs that can be applied by your spec.
    // This data can be used by various kinds of modules to improve their results, and modules added in the future may rely on buffs that aren't used today.
    return [
      {
        spellId: SPELLS.THUNDER_FOCUS_TEA.id,
      },
      {
        spellId: [SPELLS.LIFECYCLES_VIVIFY_BUFF.id, SPELLS.LIFECYCLES_ENVELOPING_MIST_BUFF.id],
        enabled: combatant.hasTalent(SPELLS.LIFECYCLES_TALENT),
      },
      {
        spellId: SPELLS.TEACHINGS_OF_THE_MONASTERY.id,
      },
      {
        spellId: SPELLS.REFRESHING_JADE_WIND_TALENT.id,
        enabled: combatant.hasTalent(SPELLS.REFRESHING_JADE_WIND_TALENT),
        timelineHighlight: true,
      },
      {
        spellId: SPELLS.INVOKE_CHIJI_THE_RED_CRANE_BUFF.id,
        enabled: combatant.hasTalent(SPELLS.INVOKE_CHI_JI_THE_RED_CRANE_TALENT),
      },
      // Throughput Cooldown
      {
        spellId: SPELLS.MANA_TEA_TALENT.id,
        enabled: combatant.hasTalent(SPELLS.MANA_TEA_TALENT),
        timelineHighlight: true,
      },

      //Covenants
      {
        spellId: SPELLS.WEAPONS_OF_ORDER_BUFF_AND_HEAL.id,
        enabled: combatant.hasCovenant(COVENANTS.VENTHYR.id),
        timelineHighlight: true,
      },
      {
        spellId: SPELLS.BONEDUST_BREW_CAST.id,
        enabled: combatant.hasCovenant(COVENANTS.VENTHYR.id),
        timelineHighlight: true,
      },
      {
        spellId: SPELLS.FALLEN_ORDER_CAST.id,
        enabled: combatant.hasCovenant(COVENANTS.VENTHYR.id),
        timelineHighlight: true,
      },

      // Utility
      {
        spellId: SPELLS.TIGERS_LUST_TALENT.id,
        enabled: combatant.hasTalent(SPELLS.TIGERS_LUST_TALENT),
      },
      {
        spellId: SPELLS.DIFFUSE_MAGIC_TALENT.id,
        enabled: combatant.hasTalent(SPELLS.DIFFUSE_MAGIC_TALENT),
      },
      {
        spellId: SPELLS.DAMPEN_HARM_TALENT.id,
        enabled: combatant.hasTalent(SPELLS.DAMPEN_HARM_TALENT),
      },
      {
        spellId: SPELLS.FORTIFYING_BREW.id,
      },
      {
        spellId: Object.keys(BLOODLUST_BUFFS).map((item) => Number(item)),
        timelineHighlight: true,
      },
    ];
  }
}

export default Buffs;
