import SPELLS from 'common/SPELLS';
import CoreBuffs, { BuffDuration } from 'parser/core/modules/Buffs';
import BLOODLUST_BUFFS from 'game/BLOODLUST_BUFFS';

class Buffs extends CoreBuffs {
  buffs() {
    const combatant = this.selectedCombatant;

    // This should include ALL buffs that can be applied by your spec.
    // This data can be used by various kinds of modules to improve their results, and modules added in the future may rely on buffs that aren't used today.
    return [
      {
        spellId: SPELLS.BESTOW_FAITH_TALENT.id,
        duration: BuffDuration.STATIC(5000),
        enabled: combatant.hasTalent(SPELLS.BESTOW_FAITH_TALENT),
      },
      {
        spellId: SPELLS.INFUSION_OF_LIGHT.id,
        duration: BuffDuration.AT_MOST(15000),
        triggeredBySpellId: SPELLS.HOLY_SHOCK_CAST.id,
        timelineHightlight: true,
      },
      {
        spellId: SPELLS.RULE_OF_LAW_TALENT.id,
        duration: BuffDuration.STATIC(10000),
        enabled: combatant.hasTalent(SPELLS.RULE_OF_LAW_TALENT),
      },
      {
        spellId: SPELLS.DIVINE_PURPOSE_HOLY_SHOCK_BUFF.id,
        duration: BuffDuration.STATIC(10000),
        enabled: combatant.hasTalent(SPELLS.DIVINE_PURPOSE_TALENT_HOLY),
        timelineHightlight: true,
      },
      {
        spellId: SPELLS.DIVINE_PURPOSE_LIGHT_OF_DAWN_BUFF.id,
        duration: BuffDuration.STATIC(10000),
        enabled: combatant.hasTalent(SPELLS.DIVINE_PURPOSE_TALENT_HOLY),
        timelineHightlight: true,
      },
      // Throughput cooldowns
      {
        spellId: SPELLS.AVENGING_CRUSADER_TALENT.id,
        duration: BuffDuration.STATIC(20000),
        enabled: combatant.hasTalent(SPELLS.AVENGING_CRUSADER_TALENT),
        timelineHightlight: true,
      },
      {
        spellId: SPELLS.AVENGING_WRATH.id,
        duration: BuffDuration.STATIC(20000 * (combatant.hasTalent(SPELLS.SANCTIFIED_WRATH_TALENT) ? 1.25 : 1)),
        enabled: !combatant.hasTalent(SPELLS.AVENGING_CRUSADER_TALENT),
        timelineHightlight: true,
      },
      {
        spellId: SPELLS.HOLY_AVENGER_TALENT.id,
        duration: BuffDuration.STATIC(20000),
        enabled: combatant.hasTalent(SPELLS.HOLY_AVENGER_TALENT),
        timelineHightlight: true,
      },
      // Beacons
      {
        spellId: SPELLS.BEACON_OF_LIGHT_CAST_AND_BUFF.id,
        duration: BuffDuration.PERMANENT(),
        // TODO: recommendedUptime: 1.0,
      },
      {
        spellId: SPELLS.BEACON_OF_FAITH_TALENT.id,
        duration: BuffDuration.PERMANENT(),
        // TODO: recommendedUptime: 1.0,
        enabled: combatant.hasTalent(SPELLS.BEACON_OF_FAITH_TALENT),
      },
      {
        spellId: SPELLS.BEACON_OF_VIRTUE_TALENT.id,
        duration: BuffDuration.PERMANENT(),
        enabled: combatant.hasTalent(SPELLS.BEACON_OF_VIRTUE_TALENT),
      },
      // Utility
      {
        spellId: [SPELLS.DIVINE_STEED_BUFF.id, SPELLS.DIVINE_STEED_BUFF_ALT.id, SPELLS.DIVINE_STEED_BUFF_ALT_2.id, SPELLS.DIVINE_STEED_BUFF_ALT_3.id],
        duration: BuffDuration.STATIC(3000),
        triggeredBySpellId: SPELLS.DIVINE_STEED,
      },
      {
        spellId: SPELLS.DIVINE_PROTECTION.id,
        duration: BuffDuration.STATIC(8000),
      },
      {
        spellId: SPELLS.DIVINE_SHIELD.id,
        duration: BuffDuration.STATIC(8000),
      },
      {
        spellId: SPELLS.AURA_MASTERY.id,
        duration: BuffDuration.STATIC(8000),
      },
      {
        spellId: SPELLS.BLESSING_OF_FREEDOM.id,
        duration: BuffDuration.STATIC(8000),
      },
      {
        spellId: SPELLS.BLESSING_OF_PROTECTION.id,
        duration: BuffDuration.STATIC(10000),
      },
      {
        spellId: SPELLS.BLESSING_OF_SACRIFICE.id,
        duration: BuffDuration.AT_MOST(12000),
      },
      {
        spellId: Object.keys(BLOODLUST_BUFFS).map(item => Number(item)),
        duration: BuffDuration.STATIC(40000),
        timelineHightlight: true,
      },
    ];
  }
}

export default Buffs;
