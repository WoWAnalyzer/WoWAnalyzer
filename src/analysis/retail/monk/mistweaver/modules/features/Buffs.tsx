import SPELLS from 'common/SPELLS';
import { TALENTS_MONK } from 'common/TALENTS';
import BLOODLUST_BUFFS from 'game/BLOODLUST_BUFFS';
import CoreAuras from 'parser/core/modules/Auras';

class Buffs extends CoreAuras {
  auras() {
    const combatant = this.selectedCombatant;

    // This should include ALL buffs that can be applied by your spec.
    // This data can be used by various kinds of modules to improve their results, and modules added in the future may rely on buffs that aren't used today.
    return [
      {
        spellId: TALENTS_MONK.THUNDER_FOCUS_TEA_TALENT.id,
      },
      {
        spellId: [SPELLS.LIFECYCLES_VIVIFY_BUFF.id, SPELLS.LIFECYCLES_ENVELOPING_MIST_BUFF.id],
        enabled: combatant.hasTalent(TALENTS_MONK.LIFECYCLES_TALENT),
      },
      {
        spellId: SPELLS.TEACHINGS_OF_THE_MONASTERY.id,
      },
      {
        spellId: SPELLS.SECRET_INFUSION_HASTE_BUFF.id,
        enabled: combatant.hasTalent(TALENTS_MONK.SECRET_INFUSION_TALENT),
      },
      {
        spellId: TALENTS_MONK.REFRESHING_JADE_WIND_TALENT.id,
        enabled: combatant.hasTalent(TALENTS_MONK.REFRESHING_JADE_WIND_TALENT),
        timelineHighlight: true,
      },
      {
        spellId: SPELLS.INVOKE_CHIJI_THE_RED_CRANE_BUFF.id,
        enabled: combatant.hasTalent(TALENTS_MONK.INVOKE_CHI_JI_THE_RED_CRANE_TALENT),
      },
      // Throughput Cooldown
      {
        spellId: TALENTS_MONK.MANA_TEA_TALENT.id,
        enabled: combatant.hasTalent(TALENTS_MONK.MANA_TEA_TALENT),
        timelineHighlight: true,
      },

      //Covenants
      {
        spellId: SPELLS.WEAPONS_OF_ORDER_BUFF_AND_HEAL.id,
        enabled: false,
        timelineHighlight: true,
      },
      {
        spellId: TALENTS_MONK.BONEDUST_BREW_TALENT.id,
        enabled: combatant.hasTalent(TALENTS_MONK.BONEDUST_BREW_TALENT),
        timelineHighlight: true,
      },

      // Utility
      {
        spellId: TALENTS_MONK.TIGERS_LUST_TALENT.id,
        enabled: combatant.hasTalent(TALENTS_MONK.TIGERS_LUST_TALENT),
      },
      {
        spellId: TALENTS_MONK.DIFFUSE_MAGIC_TALENT.id,
        enabled: combatant.hasTalent(TALENTS_MONK.DIFFUSE_MAGIC_TALENT),
      },
      {
        spellId: TALENTS_MONK.DAMPEN_HARM_TALENT.id,
        enabled: combatant.hasTalent(TALENTS_MONK.DAMPEN_HARM_TALENT),
      },
      {
        spellId: TALENTS_MONK.FORTIFYING_BREW_TALENT.id,
      },
      {
        spellId: Object.keys(BLOODLUST_BUFFS).map((item) => Number(item)),
        timelineHighlight: true,
      },
    ];
  }
}

export default Buffs;
