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
        spellId: SPELLS.BESTOW_FAITH_TALENT.id,
        enabled: combatant.hasTalent(SPELLS.BESTOW_FAITH_TALENT),
      },
      {
        spellId: SPELLS.INFUSION_OF_LIGHT.id,
        triggeredBySpellId: SPELLS.HOLY_SHOCK_CAST.id,
        timelineHightlight: true,
      },
      {
        spellId: SPELLS.RULE_OF_LAW_TALENT.id,
        enabled: combatant.hasTalent(SPELLS.RULE_OF_LAW_TALENT),
      },
      {
        spellId: SPELLS.DIVINE_PURPOSE_HOLY_SHOCK_BUFF.id,
        enabled: combatant.hasTalent(SPELLS.DIVINE_PURPOSE_TALENT_HOLY),
        timelineHightlight: true,
      },
      {
        spellId: SPELLS.DIVINE_PURPOSE_LIGHT_OF_DAWN_BUFF.id,
        enabled: combatant.hasTalent(SPELLS.DIVINE_PURPOSE_TALENT_HOLY),
        timelineHightlight: true,
      },
      // Throughput cooldowns
      {
        spellId: SPELLS.AVENGING_CRUSADER_TALENT.id,
        enabled: combatant.hasTalent(SPELLS.AVENGING_CRUSADER_TALENT),
        timelineHightlight: true,
        triggeredBySpellId: SPELLS.AVENGING_CRUSADER_TALENT.id,
      },
      {
        spellId: SPELLS.AVENGING_WRATH.id,
        enabled: !combatant.hasTalent(SPELLS.AVENGING_CRUSADER_TALENT),
        timelineHightlight: true,
        triggeredBySpellId: SPELLS.AVENGING_WRATH.id,
      },
      {
        spellId: SPELLS.HOLY_AVENGER_TALENT.id,
        enabled: combatant.hasTalent(SPELLS.HOLY_AVENGER_TALENT),
        timelineHightlight: true,
      },
      // Beacons
      {
        spellId: SPELLS.BEACON_OF_LIGHT_CAST_AND_BUFF.id,
        // TODO: recommendedUptime: 1.0,
      },
      {
        spellId: SPELLS.BEACON_OF_FAITH_TALENT.id,
        // TODO: recommendedUptime: 1.0,
        enabled: combatant.hasTalent(SPELLS.BEACON_OF_FAITH_TALENT),
      },
      {
        spellId: SPELLS.BEACON_OF_VIRTUE_TALENT.id,
        enabled: combatant.hasTalent(SPELLS.BEACON_OF_VIRTUE_TALENT),
      },
      // Utility
      {
        spellId: [SPELLS.DIVINE_STEED_BUFF.id, SPELLS.DIVINE_STEED_BUFF_ALT.id, SPELLS.DIVINE_STEED_BUFF_ALT_2.id, SPELLS.DIVINE_STEED_BUFF_ALT_3.id],
        triggeredBySpellId: SPELLS.DIVINE_STEED.id,
      },
      {
        spellId: SPELLS.DIVINE_PROTECTION.id,
      },
      {
        spellId: SPELLS.DIVINE_SHIELD.id,
      },
      {
        spellId: SPELLS.AURA_MASTERY.id,
      },
      {
        spellId: SPELLS.BLESSING_OF_FREEDOM.id,
      },
      {
        spellId: SPELLS.BLESSING_OF_PROTECTION.id,
      },
      {
        spellId: SPELLS.BLESSING_OF_SACRIFICE.id,
      },
      {
        spellId: Object.keys(BLOODLUST_BUFFS).map(item => Number(item)),
        timelineHightlight: true,
      },
    ];
  }
}

export default Buffs;
