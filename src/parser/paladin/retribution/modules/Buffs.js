import SPELLS from 'common/SPELLS';
import CoreBuffs from 'parser/core/modules/Buffs';
import BLOODLUST_BUFFS from 'game/BLOODLUST_BUFFS';

class Buffs extends CoreBuffs {
  buffs() {
    const combatant = this.selectedCombatant;
    return [
      {
        spellId: SPELLS.EMPYREAN_POWER_BUFF.id,
        enabled: combatant.hasTalent(SPELLS.EMPYREAN_POWER_TALENT.id),
        timelineHightlight: true,
      },
      {
        spellId: SPELLS.DIVINE_PURPOSE_BUFF.id,
        enabled: combatant.hasTalent(SPELLS.DIVINE_PURPOSE_TALENT_RETRIBUTION),
        timelineHightlight: true,
      },
      {
        spellId: SPELLS.THE_FIRES_OF_JUSTICE_BUFF.id,
      },
      {
        spellId: SPELLS.RIGHTEOUS_VERDICT_BUFF.id,
      },
      // Throughput cooldowns
      {
        spellId: SPELLS.AVENGING_WRATH.id,
        enabled: !combatant.hasTalent(SPELLS.CRUSADE_TALENT),
        timelineHightlight: true,
      },
      {
        spellId: SPELLS.CRUSADE_TALENT.id,
        enabled: combatant.hasTalent(SPELLS.CRUSADE_TALENT),
        timelineHightlight: true,
      },
      // Utility
      {
        spellId: [SPELLS.DIVINE_STEED_BUFF.id, SPELLS.DIVINE_STEED_BUFF_ALT.id, SPELLS.DIVINE_STEED_BUFF_ALT_2.id, SPELLS.DIVINE_STEED_BUFF_ALT_3.id],
        triggeredBySpellId: SPELLS.DIVINE_STEED.id,
      },
      {
        spellId: SPELLS.DIVINE_SHIELD.id,
      },
      {
        spellId: SPELLS.SHIELD_OF_VENGEANCE.id,
      },
      {
        spellId: SPELLS.EYE_FOR_AN_EYE_TALENT.id,
        enabled: combatant.hasTalent(SPELLS.EYE_FOR_AN_EYE_TALENT),
      },
      {
        spellId: SPELLS.BLESSING_OF_FREEDOM.id,
      },
      {
        spellId: SPELLS.BLESSING_OF_PROTECTION.id,
      },
      {
        spellId: SPELLS.GREATER_BLESSING_OF_KINGS.id,
      },
      {
        spellId: SPELLS.GREATER_BLESSING_OF_WISDOM.id,
      },
      {
        spellId: Object.keys(BLOODLUST_BUFFS).map(item => Number(item)),
        timelineHightlight: true,
      },
    ];
  }
}

export default Buffs;
