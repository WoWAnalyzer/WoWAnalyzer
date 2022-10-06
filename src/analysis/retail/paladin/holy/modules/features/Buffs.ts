import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/paladin';
import BLOODLUST_BUFFS from 'game/BLOODLUST_BUFFS';
import CoreAuras from 'parser/core/modules/Auras';

class Buffs extends CoreAuras {
  auras() {
    const combatant = this.selectedCombatant;

    // This should include ALL buffs that can be applied by your spec.
    // This data can be used by various kinds of modules to improve their results, and modules added in the future may rely on buffs that aren't used today.
    return [
      {
        spellId: TALENTS.BESTOW_FAITH_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.BESTOW_FAITH_TALENT),
      },
      {
        spellId: SPELLS.INFUSION_OF_LIGHT.id,
        triggeredBySpellId: SPELLS.HOLY_SHOCK_CAST.id,
        timelineHighlight: true,
      },
      {
        spellId: TALENTS.RULE_OF_LAW_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.RULE_OF_LAW_TALENT),
      },
      {
        spellId: TALENTS.DIVINE_PURPOSE_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.DIVINE_PURPOSE_TALENT),
        timelineHighlight: true,
      },
      // Throughput cooldowns
      {
        spellId: SPELLS.AVENGING_CRUSADER_TALENT.id,
        enabled: combatant.hasTalent(SPELLS.AVENGING_CRUSADER_TALENT),
        timelineHighlight: true,
        triggeredBySpellId: SPELLS.AVENGING_CRUSADER_TALENT.id,
      },
      {
        spellId: SPELLS.AVENGING_WRATH.id,
        enabled: !combatant.hasTalent(SPELLS.AVENGING_CRUSADER_TALENT),
        timelineHighlight: true,
        triggeredBySpellId: SPELLS.AVENGING_WRATH.id,
      },
      {
        spellId: TALENTS.HOLY_AVENGER_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.HOLY_AVENGER_TALENT),
        timelineHighlight: true,
      },
      // Beacons
      {
        spellId: SPELLS.BEACON_OF_LIGHT_CAST_AND_BUFF.id,
        // TODO: recommendedUptime: 1.0,
      },
      {
        spellId: TALENTS.BEACON_OF_FAITH_TALENT.id,
        // TODO: recommendedUptime: 1.0,
        enabled: combatant.hasTalent(TALENTS.BEACON_OF_FAITH_TALENT),
      },
      {
        spellId: TALENTS.BEACON_OF_FAITH_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.BEACON_OF_FAITH_TALENT),
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
        spellId: Object.keys(BLOODLUST_BUFFS).map((item) => Number(item)),
        timelineHighlight: true,
      },
    ];
  }
}

export default Buffs;
