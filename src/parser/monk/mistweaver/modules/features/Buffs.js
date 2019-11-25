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
        timelineHightlight: true,
      },
      // Throughput Cooldown
      {
        spellId: SPELLS.MANA_TEA_TALENT.id,
        enabled: combatant.hasTalent(SPELLS.MANA_TEA_TALENT),
        timelineHightlight: true,
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
        spellId: Object.keys(BLOODLUST_BUFFS).map(item => Number(item)),
        timelineHightlight: true,
      },

      //SI buffs
      {
        spellId: SPELLS.SECRET_INFUSION_MASTERY.id,
        timelineHightlight: true,
        //TODO: check for azerite
      },
      {
        spellId: SPELLS.SECRET_INFUSION_HASTE.id,
        timelineHightlight: true,
        //TODO: check for azerite
      },
      {
        spellId: SPELLS.SECRET_INFUSION_CRIT.id,
        timelineHightlight: true,
        //TODO: check for azerite
      },
      {
        spellId: SPELLS.SECRET_INFUSION_VERSATILITY.id,
        timelineHightlight: true,
        //TODO: check for azerite
      },
    ];
  }
}

export default Buffs;
