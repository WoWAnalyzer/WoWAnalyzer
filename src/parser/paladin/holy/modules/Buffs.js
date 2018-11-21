import SPELLS from 'common/SPELLS';
import CoreBuffs, { BuffDuration } from 'parser/core/modules/Buffs';

class Buffs extends CoreBuffs {
  buffs() {
    const combatant = this.selectedCombatant;

    // This should include ALL buffs that can be applied by your spec.
    // This data can be used by various kinds of modules to improve their results, and modules added in the future may rely on buffs that aren't used today.
    return [
      {
        spell: SPELLS.BESTOW_FAITH_TALENT,
        duration: BuffDuration.STATIC(5000),
        enabled: combatant.hasTalent(SPELLS.BESTOW_FAITH_TALENT),
      },
      {
        spell: SPELLS.INFUSION_OF_LIGHT,
        duration: BuffDuration.AT_MOST(15000),
        triggeredBy: SPELLS.HOLY_SHOCK_CAST,
      },
      {
        spell: SPELLS.RULE_OF_LAW_TALENT,
        duration: BuffDuration.STATIC(10000),
        enabled: combatant.hasTalent(SPELLS.RULE_OF_LAW_TALENT),
      },
      // Throughput cooldowns
      {
        spell: SPELLS.AVENGING_CRUSADER_TALENT,
        duration: BuffDuration.STATIC(20000),
        enabled: combatant.hasTalent(SPELLS.AVENGING_CRUSADER_TALENT),
        timelineHightlight: true,
      },
      {
        spell: SPELLS.AVENGING_WRATH,
        duration: BuffDuration.STATIC(20000 * (combatant.hasTalent(SPELLS.SANCTIFIED_WRATH_TALENT) ? 1.25 : 1)),
        enabled: !combatant.hasTalent(SPELLS.AVENGING_CRUSADER_TALENT),
        timelineHightlight: true,
      },
      {
        spell: SPELLS.HOLY_AVENGER_TALENT,
        duration: BuffDuration.STATIC(20000),
        enabled: combatant.hasTalent(SPELLS.HOLY_AVENGER_TALENT),
        timelineHightlight: true,
      },
      // Beacons
      {
        spell: SPELLS.BEACON_OF_LIGHT_CAST_AND_BUFF,
        duration: BuffDuration.PERMANENT(),
        // TODO: recommendedUptime: 1.0,
      },
      {
        spell: SPELLS.BEACON_OF_FAITH_TALENT,
        duration: BuffDuration.PERMANENT(),
        // TODO: recommendedUptime: 1.0,
        enabled: combatant.hasTalent(SPELLS.BEACON_OF_FAITH_TALENT),
      },
      {
        spell: SPELLS.BEACON_OF_VIRTUE_TALENT,
        duration: BuffDuration.PERMANENT(),
        enabled: combatant.hasTalent(SPELLS.BEACON_OF_VIRTUE_TALENT),
      },
      // Utility
      {
        spell: [SPELLS.DIVINE_STEED_BUFF, SPELLS.DIVINE_STEED_BUFF_ALT, SPELLS.DIVINE_STEED_BUFF_ALT_2, SPELLS.DIVINE_STEED_BUFF_ALT_3],
        duration: BuffDuration.STATIC(3000),
        triggeredBy: SPELLS.DIVINE_STEED,
      },
      {
        spell: SPELLS.DIVINE_PROTECTION,
        duration: BuffDuration.STATIC(8000),
      },
      {
        spell: SPELLS.DIVINE_SHIELD,
        duration: BuffDuration.STATIC(8000),
      },
      {
        spell: SPELLS.AURA_MASTERY,
        duration: BuffDuration.STATIC(8000),
      },
      {
        spell: SPELLS.BLESSING_OF_FREEDOM,
        duration: BuffDuration.STATIC(8000),
      },
      {
        spell: SPELLS.BLESSING_OF_PROTECTION,
        duration: BuffDuration.STATIC(10000),
      },
      {
        spell: SPELLS.BLESSING_OF_SACRIFICE,
        duration: BuffDuration.AT_MOST(12000),
      },
    ];
  }
}

export default Buffs;
