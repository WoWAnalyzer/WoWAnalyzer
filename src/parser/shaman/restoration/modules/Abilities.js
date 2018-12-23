import SPELLS from 'common/SPELLS';
import ISSUE_IMPORTANCE from 'parser/core/ISSUE_IMPORTANCE';
import CoreAbilities from 'parser/core/modules/Abilities';
import ITEMS from 'common/ITEMS';

class Abilities extends CoreAbilities {
  spellbook() {
    const combatant = this.selectedCombatant;
    return [
      {
        spell: SPELLS.RIPTIDE,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        charges: (combatant.hasTalent(SPELLS.ECHO_OF_THE_ELEMENTS_TALENT.id) || this.selectedCombatant.hasFinger(ITEMS.SOUL_OF_THE_FARSEER.id)) ? 2 : 1,
        cooldown: 6,
        timelineSortIndex: 11,
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: (combatant.hasTalent(SPELLS.ECHO_OF_THE_ELEMENTS_TALENT.id) || this.selectedCombatant.hasFinger(ITEMS.SOUL_OF_THE_FARSEER.id)) ? 0.90 : 0.70,
        },
        healSpellIds: [
          SPELLS.SURGING_TIDES_ABSORB.id,
        ],
      },
      {
        spell: SPELLS.HEALING_STREAM_TOTEM_CAST,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        charges: (combatant.hasTalent(SPELLS.ECHO_OF_THE_ELEMENTS_TALENT.id) || this.selectedCombatant.hasFinger(ITEMS.SOUL_OF_THE_FARSEER.id)) ? 2 : 1,
        timelineSortIndex: 18,
        enabled: !combatant.hasTalent(SPELLS.CLOUDBURST_TOTEM_TALENT.id),
        gcd: {
          static: 1000, // totem GCD
        },
        cooldown: 30,
        castEfficiency: {
          suggestion: true,
          majorIssueEfficiency: 0.50,
          averageIssueEfficiency: 0.70,
          recommendedEfficiency: 0.90,
        },
        healSpellIds: [
          SPELLS.HEALING_STREAM_TOTEM_HEAL.id,
          SPELLS.SWELLING_STREAM_HEAL.id,
        ],
      },
      {
        spell: SPELLS.ASTRAL_SHIFT,
        buffSpellId: SPELLS.ASTRAL_SHIFT.id,
        category: Abilities.SPELL_CATEGORIES.DEFENSIVE,
        timelineSortIndex: 82,
        cooldown: 90,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.6,
          importance: ISSUE_IMPORTANCE.MINOR,
        },
      },
      {
        spell: SPELLS.HEALING_RAIN_CAST,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: 10,
        timelineSortIndex: 17,
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          majorIssueEfficiency: 0.30,
          averageIssueEfficiency: 0.50,
          recommendedEfficiency: 0.70,
        },
        healSpellIds: [
          SPELLS.HEALING_RAIN_HEAL.id,
          SPELLS.OVERFLOWING_SHORES_HEAL.id,
        ],
      },
      {
        spell: SPELLS.WELLSPRING_TALENT,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: 20,
        timelineSortIndex: 20,
        gcd: {
          base: 1500,
        },
        enabled: combatant.lv100Talent === SPELLS.WELLSPRING_TALENT.id,
        castEfficiency: {
          suggestion: true,
          majorIssueEfficiency: 0.30,
          averageIssueEfficiency: 0.50,
          recommendedEfficiency: 0.70,
        },
        healSpellIds: [
          SPELLS.WELLSPRING_HEAL.id,
        ],
      },
      {
        spell: SPELLS.CLOUDBURST_TOTEM_TALENT,
        buffSpellId: SPELLS.CLOUDBURST_TOTEM_TALENT.id,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        charges: (combatant.hasTalent(SPELLS.ECHO_OF_THE_ELEMENTS_TALENT.id) || this.selectedCombatant.hasFinger(ITEMS.SOUL_OF_THE_FARSEER.id)) ? 2 : 1,
        cooldown: 30,
        timelineSortIndex: 16,
        gcd: {
          static: 1000, // totem GCD
        },
        enabled: combatant.hasTalent(SPELLS.CLOUDBURST_TOTEM_TALENT.id),
        castEfficiency: {
          suggestion: true,
          majorIssueEfficiency: 0.50,
          averageIssueEfficiency: 0.70,
          recommendedEfficiency: 0.90,
        },
        healSpellIds: [
          SPELLS.CLOUDBURST_TOTEM_HEAL.id,
          SPELLS.SWELLING_STREAM_HEAL.id,
        ],
      },
      {
        spell: SPELLS.EARTHEN_WALL_TOTEM_TALENT,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: 60,
        timelineSortIndex: 20,
        gcd: {
          static: 1000, // totem GCD
        },
        enabled: combatant.hasTalent(SPELLS.EARTHEN_WALL_TOTEM_TALENT.id),
        castEfficiency: {
          suggestion: true,
          majorIssueEfficiency: 0.50,
          averageIssueEfficiency: 0.70,
          recommendedEfficiency: 0.90,
        },
        healSpellIds: [
          SPELLS.EARTHEN_WALL_TOTEM_ABSORB.id,
        ],
      },
      {
        spell: SPELLS.UNLEASH_LIFE_TALENT,
        buffSpellId: SPELLS.UNLEASH_LIFE_TALENT.id,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: 15,
        timelineSortIndex: 5,
        gcd: {
          base: 1500,
        },
        enabled: combatant.lv15Talent === SPELLS.UNLEASH_LIFE_TALENT.id,
        castEfficiency: {
          suggestion: true,
          majorIssueEfficiency: 0.50,
          averageIssueEfficiency: 0.70,
          recommendedEfficiency: 0.90,
        },
      },
      {
        spell: SPELLS.ASCENDANCE_TALENT_RESTORATION,
        buffSpellId: SPELLS.ASCENDANCE_TALENT_RESTORATION.id,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 180,
        gcd: {
          base: 1500,
        },
        enabled: combatant.lv100Talent === SPELLS.ASCENDANCE_TALENT_RESTORATION.id,
        castEfficiency: {
          suggestion: true,
          majorIssueEfficiency: 0.2,
          averageIssueEfficiency: 0.5,
          recommendedEfficiency: 0.8,
        },
        healSpellIds: [
          SPELLS.ASCENDANCE_HEAL.id,
        ],
      },
      {
        spell: SPELLS.HEALING_TIDE_TOTEM_CAST,
        buffSpellId: SPELLS.HEALING_TIDE_TOTEM_CAST.id,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 180,
        gcd: {
          static: 1000, // totem GCD
        },
        castEfficiency: {
          suggestion: true,
          majorIssueEfficiency: 0.2,
          averageIssueEfficiency: 0.5,
          recommendedEfficiency: 0.7,
        },
        healSpellIds: [
          SPELLS.HEALING_TIDE_TOTEM_HEAL.id,
        ],
      },
      {
        spell: SPELLS.SPIRIT_LINK_TOTEM,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 180,
        gcd: {
          static: 1000, // totem GCD
        },
        castEfficiency: {
          suggestion: true,
          majorIssueEfficiency: 0.2,
          averageIssueEfficiency: 0.4,
          recommendedEfficiency: 0.6,
        },
        healSpellIds: [
          SPELLS.SPOUTING_SPIRITS_HEAL.id,
        ],
      },
      {
        spell: SPELLS.HEALING_WAVE,
        timelineSortIndex: 13,
        gcd: {
          base: 1500,
        },
        category: Abilities.SPELL_CATEGORIES.OTHERS,
        castEfficiency: {
          casts: castCount => (castCount.casts || 0) - (castCount.healingTwHits || 0),
        },
      },
      {
        spell: SPELLS.HEALING_WAVE,
        name: `Tidal Waved ${SPELLS.HEALING_WAVE.name}`,
        timelineSortIndex: 13,
        gcd: {
          base: 1500,
        },
        category: Abilities.SPELL_CATEGORIES.OTHERS,
        castEfficiency: {
          casts: castCount => castCount.healingTwHits || 0,
        },
      },
      {
        spell: SPELLS.HEALING_SURGE_RESTORATION,
        timelineSortIndex: 14,
        gcd: {
          base: 1500,
        },
        category: Abilities.SPELL_CATEGORIES.OTHERS,
        castEfficiency: {
          casts: castCount => (castCount.casts || 0) - (castCount.healingTwHits || 0),
        },
      },
      {
        spell: SPELLS.HEALING_SURGE_RESTORATION,
        name: `Tidal Waved ${SPELLS.HEALING_SURGE_RESTORATION.name}`,
        timelineSortIndex: 14,
        gcd: {
          base: 1500,
        },
        category: Abilities.SPELL_CATEGORIES.OTHERS,
        castEfficiency: {
          casts: castCount => castCount.healingTwHits || 0,
        },
      },
      {
        spell: SPELLS.CHAIN_HEAL,
        buffSpellId: SPELLS.HIGH_TIDE_BUFF.id,
        category: Abilities.SPELL_CATEGORIES.OTHERS,
        timelineSortIndex: 12,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.PURIFY_SPIRIT,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        timelineSortIndex: 80,
        cooldown: 8,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.FLAME_SHOCK_RESTORATION,
        buffSpellId: SPELLS.FLAME_SHOCK_RESTORATION.id,
        category: Abilities.SPELL_CATEGORIES.HEALER_DAMAGING_SPELL,
        timelineSortIndex: 60,
        cooldown: 6,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.LAVA_BURST,
        buffSpellId: SPELLS.LAVA_SURGE.id,
        category: Abilities.SPELL_CATEGORIES.HEALER_DAMAGING_SPELL,
        charges: (combatant.hasTalent(SPELLS.ECHO_OF_THE_ELEMENTS_TALENT.id) || this.selectedCombatant.hasFinger(ITEMS.SOUL_OF_THE_FARSEER.id)) ? 2 : 1,
        timelineSortIndex: 60,
        cooldown: 8,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.LIGHTNING_BOLT_RESTORATION,
        category: Abilities.SPELL_CATEGORIES.HEALER_DAMAGING_SPELL,
        gcd: {
          base: 1500,
        },
        timelineSortIndex: 60,
      },
      {
        spell: SPELLS.CHAIN_LIGHTNING_RESTORATION,
        category: Abilities.SPELL_CATEGORIES.HEALER_DAMAGING_SPELL,
        gcd: {
          base: 1500,
        },
        timelineSortIndex: 60,
      },
      {
        spell: SPELLS.GHOST_WOLF,
        buffSpellId: SPELLS.GHOST_WOLF.id,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        timelineSortIndex: 80,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.SPIRITWALKERS_GRACE,
        buffSpellId: SPELLS.SPIRITWALKERS_GRACE.id,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: combatant.hasTalent(SPELLS.GRACEFUL_SPIRIT_TALENT.id) ? 60 : 120,
        timelineSortIndex: 81,
      },
      {
        spell: SPELLS.EARTHBIND_TOTEM,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        timelineSortIndex: 80,
        gcd: {
          base: 1000, // totem GCD but affected by Haste for some reason
        },
        cooldown: 30,
      },
      {
        spell: SPELLS.PURGE,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        timelineSortIndex: 80,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.CAPACITOR_TOTEM,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        timelineSortIndex: 80,
        gcd: {
          static: 1000, // totem GCD
        },
        cooldown: 60,
      },
      {
        spell: SPELLS.WIND_RUSH_TOTEM_TALENT,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        timelineSortIndex: 80,
        gcd: {
          static: 1000, // totem GCD
        },
        enabled: combatant.hasTalent(SPELLS.WIND_RUSH_TOTEM_TALENT.id),
        cooldown: 120,
      },
      {
        spell: SPELLS.EARTHGRAB_TOTEM_TALENT,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        timelineSortIndex: 80,
        gcd: {
          static: 1000, // totem GCD
        },
        enabled: combatant.hasTalent(SPELLS.EARTHGRAB_TOTEM_TALENT.id),
        cooldown: 30,
      },
      {
        spell: SPELLS.ANCESTRAL_PROTECTION_TOTEM_TALENT,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        gcd: {
          static: 1000, // totem GCD
        },
        enabled: combatant.hasTalent(SPELLS.ANCESTRAL_PROTECTION_TOTEM_TALENT.id),
        cooldown: 300,
      },
      {
        spell: SPELLS.REINCARNATION,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 1800,
      },
      {
        spell: SPELLS.WIND_SHEAR,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        timelineSortIndex: 80,
        cooldown: 12,
      },
      {
        // had to remove SPELLS.HEX_SKELETAL since the Blizzard API doesn't think it exists, causing issues. Please add it again if it's encountered in a log, and if so leave a comment with the log
        spell: [SPELLS.HEX, SPELLS.HEX_RAPTOR, SPELLS.HEX_SNAKE, SPELLS.HEX_SPIDER, SPELLS.HEX_COCKROACH],
        buffSpellId: [SPELLS.HEX.id, SPELLS.HEX_RAPTOR.id, SPELLS.HEX_SNAKE.id, SPELLS.HEX_SPIDER.id, SPELLS.HEX_COCKROACH.id],
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: {
          base: 1500,
        },
        timelineSortIndex: 80,
        cooldown: 30,
      },
      {
        spell: SPELLS.EARTH_SHIELD_TALENT,
        category: Abilities.SPELL_CATEGORIES.OTHERS,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(SPELLS.EARTH_SHIELD_TALENT.id),
        timelineSortIndex: 80,
        healSpellIds: [
          SPELLS.EARTH_SHIELD_HEAL.id,
        ],
      },
      {
        spell: SPELLS.TREMOR_TOTEM,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 60,
        gcd: {
          base: 1000, // totem GCD but affected by Haste for some reason
        },
        timelineSortIndex: 80,
      },
      {
        spell: SPELLS.DOWNPOUR_TALENT,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: 35, // CD changes depending on amount of effective targets hit (0 = 5s, 6 = 35s)
        gcd: {
          base: 1500,
        },
        timelineSortIndex: 20,
        enabled: combatant.hasTalent(SPELLS.DOWNPOUR_TALENT.id),
        castEfficiency: {
          suggestion: true,
          majorIssueEfficiency: 0.20,
          averageIssueEfficiency: 0.40,
          recommendedEfficiency: 0.60,
        },
      },
      {
        spell: SPELLS.BERSERKING,
        buffSpellId: SPELLS.BERSERKING.id,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 180,
        isUndetectable: true,
        gcd: null,
        castEfficiency: {
          suggestion: true,
          majorIssueEfficiency: 0.2,
          averageIssueEfficiency: 0.5,
          recommendedEfficiency: 0.7,
        },
      },
      {
        spell: SPELLS.EARTH_ELEMENTAL,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 300,
        gcd: {
          base: 1500,
        },
        timelineSortIndex: 80,
      },
      {
        spell: SPELLS.NATURES_GUARDIAN_TALENT,
        category: Abilities.SPELL_CATEGORIES.DEFENSIVE,
        cooldown: 45,
        enabled: combatant.hasTalent(SPELLS.NATURES_GUARDIAN_TALENT.id),
        healSpellIds: [
          SPELLS.NATURES_GUARDIAN_HEAL.id,
        ],
      },
      {
        spell: SPELLS.ROCKET_JUMP,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        timelineSortIndex: 80,
        cooldown: 90,
        gcd: {
          base: 1500,
        },
        isUndetectable: true,
      },
    ];
  }
}

export default Abilities;
