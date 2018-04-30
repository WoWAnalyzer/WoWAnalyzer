import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import ISSUE_IMPORTANCE from 'Parser/Core/ISSUE_IMPORTANCE';
import CoreAbilities from 'Parser/Core/Modules/Abilities';

class Abilities extends CoreAbilities {
  spellbook() {
    const combatant = this.combatants.selected;
    return [
      // Riptide with EotE
      {
        spell: SPELLS.RIPTIDE,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        charges: 2,
        cooldown: 6,
        enabled: combatant.hasTalent(SPELLS.ECHO_OF_THE_ELEMENTS_TALENT.id),
        timelineSortIndex: 15,
        isOnGCD: true,
        castEfficiency: {
          suggestion: true,
          majorIssueEfficiency: 0.50,
          averageIssueEfficiency: 0.70,
          recommendedEfficiency: 0.90,
        },
      },
      // Riptide without EotE
      {
        spell: SPELLS.RIPTIDE,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: 6,
        enabled: !(combatant.hasTalent(SPELLS.ECHO_OF_THE_ELEMENTS_TALENT.id)),
        timelineSortIndex: 15,
        isOnGCD: true,
        castEfficiency: {
          suggestion: true,
          majorIssueEfficiency: 0.30,
          averageIssueEfficiency: 0.50,
          recommendedEfficiency: 0.70,
        },
      },
      {
        spell: SPELLS.HEALING_STREAM_TOTEM_CAST,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        charges: combatant.hasTalent(SPELLS.ECHO_OF_THE_ELEMENTS_TALENT.id) ? 2 : 1,
        timelineSortIndex: 18,
        enabled: !combatant.hasTalent(SPELLS.CLOUDBURST_TOTEM_TALENT.id),
        isOnGCD: true,
        cooldown: 30,
        castEfficiency: {
          suggestion: true,
          majorIssueEfficiency: 0.50,
          averageIssueEfficiency: 0.70,
          recommendedEfficiency: 0.90,
        },
      },
      {
        spell: SPELLS.ASTRAL_SHIFT,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
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
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 10,
        timelineSortIndex: 20,
        isOnGCD: true,
        castEfficiency: {
          suggestion: true,
          majorIssueEfficiency: 0.30,
          averageIssueEfficiency: 0.50,
          recommendedEfficiency: 0.70,
        },
      },
      {
        spell: SPELLS.WELLSPRING_TALENT,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 20,
        timelineSortIndex: 20,
        isOnGCD: true,
        enabled: combatant.lv100Talent === SPELLS.WELLSPRING_TALENT.id,
        castEfficiency: {
          suggestion: true,
          majorIssueEfficiency: 0.30,
          averageIssueEfficiency: 0.50,
          recommendedEfficiency: 0.70,
        },
      },
      {
        spell: SPELLS.CLOUDBURST_TOTEM_TALENT,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        charges: combatant.hasTalent(SPELLS.ECHO_OF_THE_ELEMENTS_TALENT.id) ? 2 : 1, // Possible with the Soul ring in prepatch unless they fix it
        cooldown: 30,
        timelineSortIndex: 20,
        isOnGCD: true,
        enabled: combatant.hasTalent(SPELLS.CLOUDBURST_TOTEM_TALENT.id) || combatant.hasFinger(ITEMS.SOUL_OF_THE_FARSEER.id),
        castEfficiency: {
          suggestion: true,
          majorIssueEfficiency: 0.50,
          averageIssueEfficiency: 0.70,
          recommendedEfficiency: 0.90,
        },
      },
      {
        spell: SPELLS.EARTHEN_SHIELD_TOTEM_TALENT,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 60,
        timelineSortIndex: 20,
        isOnGCD: true,
        enabled: combatant.hasTalent(SPELLS.EARTHEN_SHIELD_TOTEM_TALENT.id),
        castEfficiency: {
          suggestion: true,
          majorIssueEfficiency: 0.50,
          averageIssueEfficiency: 0.70,
          recommendedEfficiency: 0.90,
        },
      },
      {
        spell: SPELLS.UNLEASH_LIFE_TALENT,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 15,
        timelineSortIndex: 20,
        isOnGCD: true,
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
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 180,
        enabled: combatant.lv100Talent === SPELLS.ASCENDANCE_TALENT_RESTORATION.id,
        castEfficiency: {
          suggestion: true,
          majorIssueEfficiency: 0.2,
          averageIssueEfficiency: 0.5,
          recommendedEfficiency: 0.8,
        },
      },
      {
        spell: SPELLS.HEALING_TIDE_TOTEM_CAST,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 180,
        isOnGCD: true,
        castEfficiency: {
          suggestion: true,
          majorIssueEfficiency: 0.2,
          averageIssueEfficiency: 0.5,
          recommendedEfficiency: 0.8,
        },
      },
      {
        spell: SPELLS.SPIRIT_LINK_TOTEM,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 180,
        isOnGCD: true,
        castEfficiency: {
          suggestion: true,
          majorIssueEfficiency: 0.2,
          averageIssueEfficiency: 0.4,
          recommendedEfficiency: 0.6,
        },
      },
      {
        spell: SPELLS.HEALING_WAVE,
        timelineSortIndex: 41,
        isOnGCD: true,
        category: Abilities.SPELL_CATEGORIES.OTHERS,
        castEfficiency: {
          casts: castCount => (castCount.casts || 0) - (castCount.healingTwHits || 0),
        },
      },
      {
        spell: SPELLS.HEALING_WAVE,
        name: `Tidal Waved ${SPELLS.HEALING_WAVE.name}`,
        timelineSortIndex: 42,
        isOnGCD: true,
        category: Abilities.SPELL_CATEGORIES.OTHERS,
        castEfficiency: {
          casts: castCount => castCount.healingTwHits || 0,
        },
      },
      {
        spell: SPELLS.HEALING_SURGE_RESTORATION,
        timelineSortIndex: 43,
        isOnGCD: true,
        category: Abilities.SPELL_CATEGORIES.OTHERS,
        castEfficiency: {
          casts: castCount => (castCount.casts || 0) - (castCount.healingTwHits || 0),
        },
      },
      {
        spell: SPELLS.HEALING_SURGE_RESTORATION,
        name: `Tidal Waved ${SPELLS.HEALING_SURGE_RESTORATION.name}`,
        timelineSortIndex: 44,
        isOnGCD: true,
        category: Abilities.SPELL_CATEGORIES.OTHERS,
        castEfficiency: {
          casts: castCount => castCount.healingTwHits || 0,
        },
      },
      {
        spell: SPELLS.CHAIN_HEAL,
        category: Abilities.SPELL_CATEGORIES.OTHERS,
        timelineSortIndex: 40,
        isOnGCD: true,
      },
      {
        spell: SPELLS.PURIFY_SPIRIT,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        timelineSortIndex: 80,
        cooldown: 8,
        isOnGCD: true,
      },
      {
        spell: SPELLS.FLAME_SHOCK_RESTORATION,
        category: Abilities.SPELL_CATEGORIES.HEALER_DAMAGING_SPELL,
        timelineSortIndex: 60,
        cooldown: 6,
        isOnGCD: true,
      },
      {
        spell: SPELLS.LAVA_BURST,
        category: Abilities.SPELL_CATEGORIES.HEALER_DAMAGING_SPELL,
        charges: combatant.hasTalent(SPELLS.ECHO_OF_THE_ELEMENTS_TALENT.id) ? 2 : 1,
        timelineSortIndex: 60,
        cooldown: 8,
        isOnGCD: true,
      },
      {
        spell: SPELLS.LIGHTNING_BOLT_RESTORATION,
        category: Abilities.SPELL_CATEGORIES.HEALER_DAMAGING_SPELL,
        isOnGCD: true,
        timelineSortIndex: 60,
      },
      {
        spell: SPELLS.GHOST_WOLF,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        timelineSortIndex: 80,
        isOnGCD: true,
      },
      {
        spell: SPELLS.SPIRITWALKERS_GRACE,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: combatant.hasTalent(SPELLS.GRACEFUL_SPIRIT_TALENT.id) ? 60 : 120,
        timelineSortIndex: 81,
      },
      {
        spell: SPELLS.EARTHBIND_TOTEM,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        timelineSortIndex: 80,
        isOnGCD: true,
        cooldown: 30,
      },
      {
        spell: SPELLS.PURGE,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        timelineSortIndex: 80,
        isOnGCD: true,
      },
      {
        spell: SPELLS.LIGHTNING_SURGE_TOTEM_TALENT,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        timelineSortIndex: 80,
        isOnGCD: true,
        //enabled: combatant.hasTalent(SPELLS.LIGHTNING_SURGE_TOTEM_TALENT.id) TODO: reduce CD depending on amount of targets hit
        cooldown: 60,
      },
      {
        spell: SPELLS.WIND_RUSH_TOTEM_TALENT,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        timelineSortIndex: 80,
        isOnGCD: true,
        enabled: combatant.hasTalent(SPELLS.WIND_RUSH_TOTEM_TALENT.id),
        cooldown: 120,
      }, 
      {
        spell: SPELLS.EARTHGRAB_TOTEM_TALENT,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        timelineSortIndex: 80,
        isOnGCD: true,
        enabled: combatant.hasTalent(SPELLS.EARTHGRAB_TOTEM_TALENT.id),
        cooldown: 30,
      }, 
      {
        spell: SPELLS.ANCESTRAL_PROTECTION_TOTEM_TALENT,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        isOnGCD: true,
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
        spell: [SPELLS.HEX, SPELLS.HEX_RAPTOR, SPELLS.HEX_SNAKE, SPELLS.HEX_SPIDER, SPELLS.HEX_COCKROACH, SPELLS.HEX_SKELETAL],
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        isOnGCD: true,
        timelineSortIndex: 80,
        cooldown: 30,
      },
      {
        spell: SPELLS.EARTH_SHIELD_TALENT, 
        category: Abilities.SPELL_CATEGORIES.OTHERS,
        isOnGCD: true,
        enabled: combatant.hasTalent(SPELLS.EARTH_SHIELD_TALENT.id),
        timelineSortIndex: 80,
      },
      {
        spell: SPELLS.TREMOR_TOTEM, 
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 60,
        isOnGCD: true,
        timelineSortIndex: 80,
      },
      {
        spell: SPELLS.DOWNPOUR_TALENT,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 5, // TODO: change CD depending on amount of effective targets hit (0 = 5s, 6 = 35s)
        isOnGCD: true,
        timelineSortIndex: 20,
        enabled: combatant.hasTalent(SPELLS.DOWNPOUR_TALENT.id),
        castEfficiency: {
          suggestion: true,
          majorIssueEfficiency: 0.50,
          averageIssueEfficiency: 0.70,
          recommendedEfficiency: 0.90,
        },
      },
    ];
  }
}

export default Abilities;
