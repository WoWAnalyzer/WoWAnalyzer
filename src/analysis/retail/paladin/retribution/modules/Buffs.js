import SPELLS from 'common/SPELLS';
import BLOODLUST_BUFFS from 'game/BLOODLUST_BUFFS';
import CoreAuras from 'parser/core/modules/Auras';
import TALENTS from 'common/TALENTS/paladin';

class Buffs extends CoreAuras {
  auras() {
    const combatant = this.selectedCombatant;
    return [
      {
        spellId: SPELLS.EMPYREAN_POWER_TALENT_BUFF.id,
        enabled: combatant.hasTalent(TALENTS.EMPYREAN_POWER_TALENT),
        timelineHighlight: true,
      },
      {
        spellId: SPELLS.DIVINE_PURPOSE_BUFF.id,
        enabled: combatant.hasTalent(TALENTS.DIVINE_PURPOSE_TALENT),
        timelineHighlight: true,
      },
      {
        spellId: SPELLS.FIRES_OF_JUSTICE_BUFF.id,
      },
      {
        spellId: SPELLS.RIGHTEOUS_VERDICT_BUFF.id,
      },
      // Throughput cooldowns
      {
        spellId: SPELLS.AVENGING_WRATH.id,
        enabled: !combatant.hasTalent(TALENTS.CRUSADE_TALENT),
        timelineHighlight: true,
      },
      {
        spellId: SPELLS.CRUSADE_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.CRUSADE_TALENT),
        timelineHighlight: true,
      },
      // Utility
      {
        spellId: [
          SPELLS.DIVINE_STEED_BUFF.id,
          SPELLS.DIVINE_STEED_BUFF_ALT.id,
          SPELLS.DIVINE_STEED_BUFF_ALT_2.id,
          SPELLS.DIVINE_STEED_BUFF_ALT_3.id,
        ],
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
        enabled: combatant.hasTalent(TALENTS.EYE_FOR_AN_EYE_TALENT),
      },
      {
        spellId: SPELLS.BLESSING_OF_FREEDOM_TALENT.id,
      },
      {
        spellId: SPELLS.BLESSING_OF_PROTECTION_TALENT.id,
      },
      {
        spellId: Object.keys(BLOODLUST_BUFFS).map((item) => Number(item)),
        timelineHighlight: true,
      },
    ];
  }
}

export default Buffs;
