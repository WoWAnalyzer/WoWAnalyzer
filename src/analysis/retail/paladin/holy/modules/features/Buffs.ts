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
        spellId: SPELLS.INFUSION_OF_LIGHT.id,
        triggeredBySpellId: TALENTS.HOLY_SHOCK_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.HOLY_SHOCK_TALENT),
        timelineHighlight: true,
      },

      {
        spellId: TALENTS.DIVINE_PURPOSE_SHARED_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.DIVINE_PURPOSE_SHARED_TALENT),
        timelineHighlight: true,
      },
      // Throughput cooldowns
      {
        spellId: TALENTS.AVENGING_CRUSADER_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.AVENGING_CRUSADER_TALENT),
        timelineHighlight: true,
        triggeredBySpellId: TALENTS.AVENGING_CRUSADER_TALENT.id,
      },
      {
        spellId: SPELLS.AVENGING_WRATH.id,
        // TODO: check other impacts there may be more enabled now
        enabled: !combatant.hasTalent(TALENTS.AVENGING_CRUSADER_TALENT),
        timelineHighlight: true,
        triggeredBySpellId: SPELLS.AVENGING_WRATH.id,
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
        triggeredBySpellId: TALENTS.DIVINE_STEED_TALENT.id,
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
        spellId: TALENTS.BLESSING_OF_FREEDOM_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.BLESSING_OF_FREEDOM_TALENT),
      },
      {
        spellId: TALENTS.BLESSING_OF_PROTECTION_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.BLESSING_OF_PROTECTION_TALENT),
      },
      {
        spellId: TALENTS.IMPROVED_BLESSING_OF_PROTECTION_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.IMPROVED_BLESSING_OF_PROTECTION_TALENT),
      },
      {
        spellId: TALENTS.BLESSING_OF_SACRIFICE_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.BLESSING_OF_SACRIFICE_TALENT),
      },
      {
        spellId: Object.keys(BLOODLUST_BUFFS).map((item) => Number(item)),
        timelineHighlight: true,
      },
    ];
  }
}

export default Buffs;
