import { defineMessage } from '@lingui/macro';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/shaman';
// import ISSUE_IMPORTANCE from 'parser/core/ISSUE_IMPORTANCE';
import CoreAbilities from 'parser/core/modules/Abilities';
import { SpellbookAbility } from 'parser/core/modules/Ability';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';
import { i18n } from '@lingui/core';

import { ABILITIES_AFFECTED_BY_HEALING_INCREASES } from '../constants';
import { TrackedRestoShamanAbility } from './core/RestorationAbilityTracker';

const totemGCD = 1000;

class Abilities extends CoreAbilities {
  constructor(...args: ConstructorParameters<typeof CoreAbilities>) {
    super(...args);
    this.abilitiesAffectedByHealingIncreases = ABILITIES_AFFECTED_BY_HEALING_INCREASES.map(
      (spell) => spell.id,
    );
  }

  spellbook(): Array<SpellbookAbility<TrackedRestoShamanAbility>> {
    const combatant = this.selectedCombatant;
    return [
      {
        spell: TALENTS.RIPTIDE_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        enabled: combatant.hasTalent(TALENTS.RIPTIDE_TALENT),
        charges: combatant.hasTalent(TALENTS.ECHO_OF_THE_ELEMENTS_TALENT) ? 2 : 1,
        cooldown: 6,
        timelineSortIndex: 11,
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: false,
          // recommendedEfficiency: combatant.hasTalent(TALENTS.ECHO_OF_THE_ELEMENTS_TALENT)
          //   ? 0.75
          //   : 0.6,
        },
      },
      {
        spell: [SPELLS.HEALING_STREAM_TOTEM.id],
        category: SPELL_CATEGORY.ROTATIONAL,
        charges: combatant.getMultipleTalentRanks(
          TALENTS.HEALING_STREAM_TOTEM_SHARED_TALENT,
          TALENTS.HEALING_STREAM_TOTEM_RESTORATION_TALENT,
        ),
        timelineSortIndex: 18,
        enabled:
          !combatant.hasTalent(TALENTS.CLOUDBURST_TOTEM_TALENT) &&
          (combatant.hasTalent(TALENTS.HEALING_STREAM_TOTEM_SHARED_TALENT) ||
            combatant.hasTalent(TALENTS.HEALING_STREAM_TOTEM_RESTORATION_TALENT)),
        gcd: {
          static: totemGCD,
        },
        cooldown: 30,
        castEfficiency: {
          suggestion: false,
          // majorIssueEfficiency: 0.5,
          // averageIssueEfficiency: 0.7,
          // recommendedEfficiency: 0.9,
        },
        healSpellIds: [SPELLS.HEALING_STREAM_TOTEM_HEAL.id],
      },
      {
        spell: TALENTS.ASTRAL_SHIFT_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.ASTRAL_SHIFT_TALENT),
        buffSpellId: TALENTS.ASTRAL_SHIFT_TALENT.id,
        category: SPELL_CATEGORY.DEFENSIVE,
        timelineSortIndex: 82,
        cooldown: 90,
        castEfficiency: {
          suggestion: false,
          // recommendedEfficiency: 0.6,
          // importance: ISSUE_IMPORTANCE.MINOR,
        },
      },
      {
        spell: TALENTS.HEALING_RAIN_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.HEALING_RAIN_TALENT),
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: 10,
        timelineSortIndex: 17,
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: false,
          // majorIssueEfficiency: 0.3,
          // averageIssueEfficiency: 0.5,
          // recommendedEfficiency: 0.7,
        },
        healSpellIds: [SPELLS.HEALING_RAIN_HEAL.id],
      },
      {
        spell: SPELLS.HEALING_RAIN_TOTEMIC.id,
        enabled: combatant.hasTalent(TALENTS.SURGING_TOTEM_TALENT),
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: combatant.hasTalent(TALENTS.TOTEMIC_SURGE_TALENT) ? 24 : 30,
        timelineSortIndex: 17,
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: false,
          // majorIssueEfficiency: 0.3,
          // averageIssueEfficiency: 0.5,
          // recommendedEfficiency: 0.7,
        },
        healSpellIds: [SPELLS.HEALING_RAIN_HEAL.id],
      },
      {
        spell: TALENTS.WELLSPRING_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.WELLSPRING_TALENT),
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: 20,
        timelineSortIndex: 20,
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: false,
          // majorIssueEfficiency: 0.3,
          // averageIssueEfficiency: 0.5,
          // recommendedEfficiency: 0.7,
        },
        healSpellIds: [SPELLS.WELLSPRING_HEAL.id],
      },
      {
        spell: TALENTS.CLOUDBURST_TOTEM_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.CLOUDBURST_TOTEM_TALENT),
        buffSpellId: TALENTS.CLOUDBURST_TOTEM_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        charges: combatant.hasTalent(TALENTS.ECHO_OF_THE_ELEMENTS_TALENT) ? 2 : 1,
        cooldown: 30,
        timelineSortIndex: 16,
        gcd: {
          static: totemGCD,
        },
        castEfficiency: {
          suggestion: false,
          // majorIssueEfficiency: 0.5,
          // averageIssueEfficiency: 0.7,
          // recommendedEfficiency: 0.9,
        },
        healSpellIds: [SPELLS.CLOUDBURST_TOTEM_HEAL.id],
      },
      {
        spell: TALENTS.EARTHEN_WALL_TOTEM_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.EARTHEN_WALL_TOTEM_TALENT),
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: 60,
        timelineSortIndex: 20,
        gcd: {
          static: totemGCD,
        },
        castEfficiency: {
          suggestion: false,
          // majorIssueEfficiency: 0.5,
          // averageIssueEfficiency: 0.7,
          // recommendedEfficiency: 0.9,
        },
        healSpellIds: [SPELLS.EARTHEN_WALL_TOTEM_ABSORB.id],
      },
      {
        spell: TALENTS.UNLEASH_LIFE_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.UNLEASH_LIFE_TALENT),
        buffSpellId: TALENTS.UNLEASH_LIFE_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: 15,
        timelineSortIndex: 5,
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: false,
          // majorIssueEfficiency: 0.5,
          // averageIssueEfficiency: 0.7,
          // recommendedEfficiency: 0.9,
        },
      },
      {
        spell: TALENTS.ASCENDANCE_RESTORATION_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.ASCENDANCE_RESTORATION_TALENT),
        buffSpellId: TALENTS.ASCENDANCE_RESTORATION_TALENT.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 180,
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: false,
          // majorIssueEfficiency: 0.2,
          // averageIssueEfficiency: 0.5,
          // recommendedEfficiency: 0.8,
        },
        healSpellIds: [SPELLS.ASCENDANCE_HEAL.id, SPELLS.ASCENDANCE_INITIAL_HEAL.id],
      },
      {
        spell: TALENTS.HEALING_TIDE_TOTEM_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.HEALING_TIDE_TOTEM_TALENT),
        buffSpellId: TALENTS.HEALING_TIDE_TOTEM_TALENT.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 180,
        gcd: {
          static: totemGCD,
        },
        castEfficiency: {
          suggestion: false,
          // majorIssueEfficiency: 0.2,
          // averageIssueEfficiency: 0.5,
          // recommendedEfficiency: 0.7,
        },
        healSpellIds: [SPELLS.HEALING_TIDE_TOTEM_HEAL.id],
      },
      {
        spell: TALENTS.SPIRIT_LINK_TOTEM_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.SPIRIT_LINK_TOTEM_TALENT),
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 180,
        gcd: {
          static: totemGCD,
        },
        castEfficiency: {
          suggestion: false,
          // majorIssueEfficiency: 0.2,
          // averageIssueEfficiency: 0.4,
          // recommendedEfficiency: 0.6,
        },
      },
      {
        spell: TALENTS.MANA_TIDE_TOTEM_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.MANA_TIDE_TOTEM_TALENT),
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 180,
        gcd: {
          static: totemGCD,
        },
        castEfficiency: {
          suggestion: false,
          // majorIssueEfficiency: 0.2,
          // averageIssueEfficiency: 0.4,
          // recommendedEfficiency: 0.6,
        },
      },
      {
        spell: TALENTS.HEALING_WAVE_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.HEALING_WAVE_TALENT),
        timelineSortIndex: 13,
        gcd: {
          base: 1500,
        },
        category: SPELL_CATEGORY.OTHERS,
        castEfficiency: {
          suggestion: false,
          // casts: (castCount) => castCount.casts - (castCount.healingTwHits || 0),
        },
      },
      {
        spell: TALENTS.HEALING_WAVE_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.HEALING_WAVE_TALENT),
        name: i18n._(
          defineMessage({
            id: 'shaman.restoration.abilities.buffedByTidalWave',
            message: `Tidal Waved ${TALENTS.HEALING_WAVE_TALENT.name}`,
          }),
        ),
        timelineSortIndex: 13,
        gcd: {
          base: 1500,
        },
        category: SPELL_CATEGORY.OTHERS,
        castEfficiency: {
          suggestion: false,
          // casts: (castCount) => castCount.healingTwHits || 0,
        },
      },
      {
        spell: SPELLS.HEALING_SURGE.id,
        timelineSortIndex: 14,
        gcd: {
          base: 1500,
        },
        category: SPELL_CATEGORY.OTHERS,
        castEfficiency: {
          casts: (castCount) => castCount.casts - (castCount.healingTwHits || 0),
        },
      },
      {
        spell: SPELLS.HEALING_SURGE.id,
        name: i18n._(
          defineMessage({
            id: 'shaman.restoration.abilities.buffedByTidalWave',
            message: `Tidal Waved ${SPELLS.HEALING_SURGE.name}`,
          }),
        ),
        timelineSortIndex: 14,
        gcd: {
          base: 1500,
        },
        category: SPELL_CATEGORY.OTHERS,
        castEfficiency: {
          casts: (castCount) => castCount.healingTwHits || 0,
        },
      },
      {
        spell: TALENTS.CHAIN_HEAL_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.CHAIN_HEAL_TALENT),
        buffSpellId: SPELLS.HIGH_TIDE_BUFF.id,
        category: SPELL_CATEGORY.OTHERS,
        timelineSortIndex: 12,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: TALENTS.PRIMORDIAL_WAVE_RESTORATION_TALENT.id,
        buffSpellId: SPELLS.PRIMORDIAL_WAVE_BUFF.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        timelineSortIndex: 12,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(TALENTS.PRIMORDIAL_WAVE_RESTORATION_TALENT),
        cooldown: 45,
        // Cannot find any logs with the heal
        // healSpellIds: [SPELLS.PRIMORDIAL_WAVE_HEAL.id],
      },
      {
        spell: SPELLS.PURIFY_SPIRIT.id,
        category: SPELL_CATEGORY.UTILITY,
        timelineSortIndex: 80,
        cooldown: 8,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.FLAME_SHOCK.id,
        buffSpellId: SPELLS.FLAME_SHOCK.id,
        category: SPELL_CATEGORY.HEALER_DAMAGING_SPELL,
        timelineSortIndex: 60,
        cooldown: 6,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: TALENTS.LAVA_BURST_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.LAVA_BURST_TALENT),
        buffSpellId: SPELLS.LAVA_SURGE.id,
        category: SPELL_CATEGORY.HEALER_DAMAGING_SPELL,
        charges: combatant.hasTalent(TALENTS.ECHO_OF_THE_ELEMENTS_TALENT) ? 2 : 1,
        timelineSortIndex: 60,
        cooldown: 8,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.LIGHTNING_BOLT.id,
        category: SPELL_CATEGORY.HEALER_DAMAGING_SPELL,
        gcd: {
          base: 1500,
        },
        timelineSortIndex: 60,
      },
      {
        spell: TALENTS.CHAIN_LIGHTNING_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.CHAIN_LIGHTNING_TALENT),
        category: SPELL_CATEGORY.HEALER_DAMAGING_SPELL,
        gcd: {
          base: 1500,
        },
        timelineSortIndex: 60,
      },
      {
        spell: SPELLS.GHOST_WOLF.id,
        buffSpellId: SPELLS.GHOST_WOLF.id,
        category: SPELL_CATEGORY.UTILITY,
        timelineSortIndex: 80,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: TALENTS.SPIRITWALKERS_GRACE_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.SPIRITWALKERS_GRACE_TALENT),
        buffSpellId: TALENTS.SPIRITWALKERS_GRACE_TALENT.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: combatant.hasTalent(TALENTS.GRACEFUL_SPIRIT_TALENT) ? 60 : 120,
        timelineSortIndex: 81,
      },
      {
        spell: SPELLS.EARTHBIND_TOTEM.id,
        category: SPELL_CATEGORY.UTILITY,
        timelineSortIndex: 80,
        gcd: {
          base: totemGCD, // totem GCD but affected by Haste for some reason
        },
        cooldown: 30,
      },
      {
        spell: TALENTS.PURGE_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.PURGE_TALENT),
        category: SPELL_CATEGORY.UTILITY,
        timelineSortIndex: 80,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: TALENTS.CAPACITOR_TOTEM_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.CAPACITOR_TOTEM_TALENT),
        category: SPELL_CATEGORY.UTILITY,
        timelineSortIndex: 80,
        gcd: {
          static: totemGCD,
        },
        cooldown: 60,
      },
      {
        spell: TALENTS.WIND_RUSH_TOTEM_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.WIND_RUSH_TOTEM_TALENT),
        category: SPELL_CATEGORY.UTILITY,
        timelineSortIndex: 80,
        gcd: {
          static: totemGCD,
        },
        cooldown: 120,
      },
      {
        spell: TALENTS.EARTHGRAB_TOTEM_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.EARTHGRAB_TOTEM_TALENT),
        category: SPELL_CATEGORY.UTILITY,
        timelineSortIndex: 80,
        gcd: {
          static: totemGCD,
        },
        cooldown: 30,
      },
      {
        spell: TALENTS.ANCESTRAL_PROTECTION_TOTEM_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.ANCESTRAL_PROTECTION_TOTEM_TALENT),
        category: SPELL_CATEGORY.COOLDOWNS,
        gcd: {
          static: totemGCD,
        },
        cooldown: 300,
      },
      {
        spell: SPELLS.REINCARNATION.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 1800,
      },
      {
        spell: TALENTS.WIND_SHEAR_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.WIND_SHEAR_TALENT),
        category: SPELL_CATEGORY.UTILITY,
        timelineSortIndex: 80,
        cooldown: 12,
        gcd: null,
      },
      {
        // had to remove SPELLS.HEX_SKELETAL since the Blizzard API doesn't think it exists, causing issues. Please add it again if it's encountered in a log, and if so leave a comment with the log
        spell: [
          TALENTS.HEX_TALENT.id,
          SPELLS.HEX_RAPTOR.id,
          SPELLS.HEX_SNAKE.id,
          SPELLS.HEX_SPIDER.id,
          SPELLS.HEX_COCKROACH.id,
        ],
        buffSpellId: [
          TALENTS.HEX_TALENT.id,
          SPELLS.HEX_RAPTOR.id,
          SPELLS.HEX_SNAKE.id,
          SPELLS.HEX_SPIDER.id,
          SPELLS.HEX_COCKROACH.id,
        ],
        enabled: combatant.hasTalent(TALENTS.HEX_TALENT),
        category: SPELL_CATEGORY.UTILITY,
        gcd: {
          base: 1500,
        },
        timelineSortIndex: 80,
        cooldown: 30,
      },
      {
        spell: TALENTS.EARTH_SHIELD_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.EARTH_SHIELD_TALENT),
        category: SPELL_CATEGORY.OTHERS,
        gcd: {
          base: 1500,
        },
        timelineSortIndex: 80,
        healSpellIds: [SPELLS.EARTH_SHIELD_HEAL.id],
      },
      {
        spell: TALENTS.TREMOR_TOTEM_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.TREMOR_TOTEM_TALENT),
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 60,
        gcd: {
          base: totemGCD, // totem GCD but affected by Haste for some reason
        },
        timelineSortIndex: 80,
      },
      {
        spell: TALENTS.DOWNPOUR_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.DOWNPOUR_TALENT),
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: 35, // CD changes depending on amount of effective targets hit (0 = 5s, 6 = 35s)
        gcd: {
          base: 1500,
        },
        timelineSortIndex: 20,
        castEfficiency: {
          suggestion: false,
          // majorIssueEfficiency: 0.2,
          // averageIssueEfficiency: 0.4,
          // recommendedEfficiency: 0.6,
        },
      },
      {
        spell: SPELLS.BERSERKING.id,
        buffSpellId: SPELLS.BERSERKING.id,
        category: SPELL_CATEGORY.COOLDOWNS,
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
        spell: TALENTS.EARTH_ELEMENTAL_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.EARTH_ELEMENTAL_TALENT),
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 300,
        gcd: {
          base: 1500,
        },
        timelineSortIndex: 80,
      },
      {
        spell: TALENTS.NATURES_GUARDIAN_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.NATURES_GUARDIAN_TALENT),
        category: SPELL_CATEGORY.DEFENSIVE,
        cooldown: 45,
        healSpellIds: [SPELLS.NATURES_GUARDIAN_HEAL.id],
      },
      {
        spell: SPELLS.ROCKET_JUMP.id,
        category: SPELL_CATEGORY.UTILITY,
        timelineSortIndex: 80,
        cooldown: 90,
        gcd: {
          base: 1500,
        },
        isUndetectable: true,
      },
      {
        spell: SPELLS.WATER_SHIELD.id,
        category: SPELL_CATEGORY.UTILITY,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.LIGHTNING_SHIELD.id,
        category: SPELL_CATEGORY.UTILITY,
        gcd: {
          base: 1500,
        },
        isUndetectable: true, // its not but, why.
      },
      {
        spell: TALENTS.FROST_SHOCK_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.FROST_SHOCK_TALENT),
        category: SPELL_CATEGORY.HEALER_DAMAGING_SPELL,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: TALENTS.TOTEMIC_RECALL_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.TOTEMIC_RECALL_TALENT),
        category: SPELL_CATEGORY.UTILITY,
        gcd: {
          base: 1500,
        },
        cooldown: 180,
      },
      {
        spell: TALENTS.ANCESTRAL_GUIDANCE_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.ANCESTRAL_GUIDANCE_TALENT),
        category: SPELL_CATEGORY.COOLDOWNS,
        gcd: null,
        cooldown: 120,
      },
      {
        spell: TALENTS.NATURES_SWIFTNESS_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.NATURES_SWIFTNESS_TALENT),
        category: SPELL_CATEGORY.UTILITY,
        gcd: null,
        cooldown: 60,
      },
    ];
  }
}

export default Abilities;
