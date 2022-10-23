import { t } from '@lingui/macro';
import SPELLS from 'common/SPELLS';
import TALENTS, { TALENTS_SHAMAN } from 'common/TALENTS/shaman';
import COVENANTS from 'game/shadowlands/COVENANTS';
import ISSUE_IMPORTANCE from 'parser/core/ISSUE_IMPORTANCE';
import CoreAbilities from 'parser/core/modules/Abilities';
import { SpellbookAbility } from 'parser/core/modules/Ability';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';

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
        spell: SPELLS.RIPTIDE.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        charges: combatant.hasTalent(SPELLS.ECHO_OF_THE_ELEMENTS_TALENT_SHARED.id) ? 2 : 1,
        cooldown: 6,
        timelineSortIndex: 11,
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: combatant.hasTalent(SPELLS.ECHO_OF_THE_ELEMENTS_TALENT_SHARED.id)
            ? 0.75
            : 0.6,
        },
      },
      {
        spell: SPELLS.HEALING_STREAM_TOTEM_CAST.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        charges: combatant.hasTalent(SPELLS.ECHO_OF_THE_ELEMENTS_TALENT_SHARED.id) ? 2 : 1,
        timelineSortIndex: 18,
        enabled: !combatant.hasTalent(SPELLS.CLOUDBURST_TOTEM_TALENT.id),
        gcd: {
          static: totemGCD,
        },
        cooldown: 30,
        castEfficiency: {
          suggestion: true,
          majorIssueEfficiency: 0.5,
          averageIssueEfficiency: 0.7,
          recommendedEfficiency: 0.9,
        },
        healSpellIds: [SPELLS.HEALING_STREAM_TOTEM_HEAL.id],
      },
      {
        spell: SPELLS.ASTRAL_SHIFT.id,
        buffSpellId: SPELLS.ASTRAL_SHIFT.id,
        category: SPELL_CATEGORY.DEFENSIVE,
        timelineSortIndex: 82,
        cooldown: 90,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.6,
          importance: ISSUE_IMPORTANCE.MINOR,
        },
      },
      {
        spell: SPELLS.HEALING_RAIN_CAST.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: 10,
        timelineSortIndex: 17,
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          majorIssueEfficiency: 0.3,
          averageIssueEfficiency: 0.5,
          recommendedEfficiency: 0.7,
        },
        healSpellIds: [SPELLS.HEALING_RAIN_HEAL.id],
      },
      {
        spell: SPELLS.WELLSPRING_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: 20,
        timelineSortIndex: 20,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(SPELLS.WELLSPRING_TALENT.id),
        castEfficiency: {
          suggestion: true,
          majorIssueEfficiency: 0.3,
          averageIssueEfficiency: 0.5,
          recommendedEfficiency: 0.7,
        },
        healSpellIds: [SPELLS.WELLSPRING_HEAL.id],
      },
      {
        spell: SPELLS.CLOUDBURST_TOTEM_TALENT.id,
        buffSpellId: SPELLS.CLOUDBURST_TOTEM_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        charges: combatant.hasTalent(SPELLS.ECHO_OF_THE_ELEMENTS_TALENT_SHARED.id) ? 2 : 1,
        cooldown: 30,
        timelineSortIndex: 16,
        gcd: {
          static: totemGCD,
        },
        enabled: combatant.hasTalent(SPELLS.CLOUDBURST_TOTEM_TALENT.id),
        castEfficiency: {
          suggestion: true,
          majorIssueEfficiency: 0.5,
          averageIssueEfficiency: 0.7,
          recommendedEfficiency: 0.9,
        },
        healSpellIds: [SPELLS.CLOUDBURST_TOTEM_HEAL.id],
      },
      {
        spell: SPELLS.EARTHEN_WALL_TOTEM_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: 60,
        timelineSortIndex: 20,
        gcd: {
          static: totemGCD,
        },
        enabled: combatant.hasTalent(SPELLS.EARTHEN_WALL_TOTEM_TALENT.id),
        castEfficiency: {
          suggestion: true,
          majorIssueEfficiency: 0.5,
          averageIssueEfficiency: 0.7,
          recommendedEfficiency: 0.9,
        },
        healSpellIds: [SPELLS.EARTHEN_WALL_TOTEM_ABSORB.id],
      },
      {
        spell: SPELLS.UNLEASH_LIFE_TALENT.id,
        buffSpellId: SPELLS.UNLEASH_LIFE_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: 15,
        timelineSortIndex: 5,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(SPELLS.UNLEASH_LIFE_TALENT.id),
        castEfficiency: {
          suggestion: true,
          majorIssueEfficiency: 0.5,
          averageIssueEfficiency: 0.7,
          recommendedEfficiency: 0.9,
        },
      },
      {
        spell: SPELLS.ASCENDANCE_TALENT_RESTORATION.id,
        buffSpellId: SPELLS.ASCENDANCE_TALENT_RESTORATION.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 180,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(SPELLS.ASCENDANCE_TALENT_RESTORATION.id),
        castEfficiency: {
          suggestion: true,
          majorIssueEfficiency: 0.2,
          averageIssueEfficiency: 0.5,
          recommendedEfficiency: 0.8,
        },
        healSpellIds: [SPELLS.ASCENDANCE_HEAL.id, SPELLS.ASCENDANCE_INITIAL_HEAL.id],
      },
      {
        spell: TALENTS_SHAMAN.HEALING_TIDE_TOTEM_TALENT.id,
        enabled: combatant.hasTalent(TALENTS_SHAMAN.HEALING_TIDE_TOTEM_TALENT.id),
        buffSpellId: TALENTS_SHAMAN.HEALING_TIDE_TOTEM_TALENT.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 180,
        gcd: {
          static: totemGCD,
        },
        castEfficiency: {
          suggestion: true,
          majorIssueEfficiency: 0.2,
          averageIssueEfficiency: 0.5,
          recommendedEfficiency: 0.7,
        },
        healSpellIds: [SPELLS.HEALING_TIDE_TOTEM_HEAL.id],
      },
      {
        spell: TALENTS_SHAMAN.SPIRIT_LINK_TOTEM_TALENT.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 180,
        gcd: {
          static: totemGCD,
        },
        castEfficiency: {
          suggestion: true,
          majorIssueEfficiency: 0.2,
          averageIssueEfficiency: 0.4,
          recommendedEfficiency: 0.6,
        },
      },
      {
        spell: SPELLS.MANA_TIDE_TOTEM_CAST.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 180,
        gcd: {
          static: totemGCD,
        },
        castEfficiency: {
          suggestion: true,
          majorIssueEfficiency: 0.2,
          averageIssueEfficiency: 0.4,
          recommendedEfficiency: 0.6,
        },
      },
      {
        spell: SPELLS.HEALING_WAVE.id,
        timelineSortIndex: 13,
        gcd: {
          base: 1500,
        },
        category: SPELL_CATEGORY.OTHERS,
        castEfficiency: {
          casts: (castCount) => castCount.casts - (castCount.healingTwHits || 0),
        },
      },
      {
        spell: SPELLS.HEALING_WAVE.id,
        name: t({
          id: 'shaman.restoration.abilities.buffedByTidalWave',
          message: `Tidal Waved ${SPELLS.HEALING_WAVE.name}`,
        }),
        timelineSortIndex: 13,
        gcd: {
          base: 1500,
        },
        category: SPELL_CATEGORY.OTHERS,
        castEfficiency: {
          casts: (castCount) => castCount.healingTwHits || 0,
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
        name: t({
          id: 'shaman.restoration.abilities.buffedByTidalWave',
          message: `Tidal Waved ${SPELLS.HEALING_SURGE.name}`,
        }),
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
        spell: SPELLS.CHAIN_HEAL.id,
        buffSpellId: SPELLS.HIGH_TIDE_BUFF.id,
        category: SPELL_CATEGORY.OTHERS,
        timelineSortIndex: 12,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.CHAIN_HARVEST.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        timelineSortIndex: 12,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasCovenant(COVENANTS.VENTHYR.id),
        cooldown: 90, // reduced by crits
      },
      {
        spell: SPELLS.DOOR_OF_SHADOWS.id, //TODO: add charges based on soulbind trait
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 60,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasCovenant(COVENANTS.VENTHYR.id),
      },
      {
        spell: SPELLS.PRIMORDIAL_WAVE_CAST.id,
        buffSpellId: SPELLS.PRIMORDIAL_WAVE_BUFF.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        timelineSortIndex: 12,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasCovenant(COVENANTS.NECROLORD.id),
        cooldown: 45,
        healSpellIds: [SPELLS.PRIMORDIAL_WAVE_HEAL.id],
      },
      {
        spell: SPELLS.FLESHCRAFT.id,
        category: SPELL_CATEGORY.DEFENSIVE,
        cooldown: 120,
        enabled: combatant.hasCovenant(COVENANTS.NECROLORD.id),
      },
      {
        spell: SPELLS.SOULSHAPE.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 30,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasCovenant(COVENANTS.NIGHT_FAE.id),
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
        buffSpellId: SPELLS.LAVA_SURGE.id,
        category: SPELL_CATEGORY.HEALER_DAMAGING_SPELL,
        charges: combatant.hasTalent(SPELLS.ECHO_OF_THE_ELEMENTS_TALENT_SHARED.id) ? 2 : 1,
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
        spell: SPELLS.CHAIN_LIGHTNING.id,
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
        spell: SPELLS.SPIRITWALKERS_GRACE.id,
        buffSpellId: SPELLS.SPIRITWALKERS_GRACE.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: combatant.hasTalent(SPELLS.GRACEFUL_SPIRIT_TALENT.id) ? 60 : 120,
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
        spell: SPELLS.PURGE.id,
        category: SPELL_CATEGORY.UTILITY,
        timelineSortIndex: 80,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.CAPACITOR_TOTEM.id,
        category: SPELL_CATEGORY.UTILITY,
        timelineSortIndex: 80,
        gcd: {
          static: totemGCD,
        },
        cooldown: 60,
      },
      {
        spell: SPELLS.WIND_RUSH_TOTEM_TALENT.id,
        category: SPELL_CATEGORY.UTILITY,
        timelineSortIndex: 80,
        gcd: {
          static: totemGCD,
        },
        enabled: combatant.hasTalent(SPELLS.WIND_RUSH_TOTEM_TALENT.id),
        cooldown: 120,
      },
      {
        spell: SPELLS.EARTHGRAB_TOTEM_TALENT.id,
        category: SPELL_CATEGORY.UTILITY,
        timelineSortIndex: 80,
        gcd: {
          static: totemGCD,
        },
        enabled: combatant.hasTalent(SPELLS.EARTHGRAB_TOTEM_TALENT.id),
        cooldown: 30,
      },
      {
        spell: SPELLS.ANCESTRAL_PROTECTION_TOTEM_TALENT.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        gcd: {
          static: totemGCD,
        },
        enabled: combatant.hasTalent(SPELLS.ANCESTRAL_PROTECTION_TOTEM_TALENT.id),
        cooldown: 300,
      },
      {
        spell: SPELLS.REINCARNATION.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 1800,
      },
      {
        spell: SPELLS.WIND_SHEAR.id,
        category: SPELL_CATEGORY.UTILITY,
        timelineSortIndex: 80,
        cooldown: 12,
        gcd: null,
      },
      {
        // had to remove SPELLS.HEX_SKELETAL since the Blizzard API doesn't think it exists, causing issues. Please add it again if it's encountered in a log, and if so leave a comment with the log
        spell: [
          SPELLS.HEX.id,
          SPELLS.HEX_RAPTOR.id,
          SPELLS.HEX_SNAKE.id,
          SPELLS.HEX_SPIDER.id,
          SPELLS.HEX_COCKROACH.id,
        ],
        buffSpellId: [
          SPELLS.HEX.id,
          SPELLS.HEX_RAPTOR.id,
          SPELLS.HEX_SNAKE.id,
          SPELLS.HEX_SPIDER.id,
          SPELLS.HEX_COCKROACH.id,
        ],
        category: SPELL_CATEGORY.UTILITY,
        gcd: {
          base: 1500,
        },
        timelineSortIndex: 80,
        cooldown: 30,
      },
      {
        spell: SPELLS.EARTH_SHIELD_TALENT.id,
        category: SPELL_CATEGORY.OTHERS,
        gcd: {
          base: 1500,
        },
        timelineSortIndex: 80,
        healSpellIds: [SPELLS.EARTH_SHIELD_HEAL.id],
      },
      {
        spell: SPELLS.TREMOR_TOTEM.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 60,
        gcd: {
          base: totemGCD, // totem GCD but affected by Haste for some reason
        },
        timelineSortIndex: 80,
      },
      {
        spell: SPELLS.DOWNPOUR_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: 35, // CD changes depending on amount of effective targets hit (0 = 5s, 6 = 35s)
        gcd: {
          base: 1500,
        },
        timelineSortIndex: 20,
        enabled: combatant.hasTalent(SPELLS.DOWNPOUR_TALENT.id),
        castEfficiency: {
          suggestion: true,
          majorIssueEfficiency: 0.2,
          averageIssueEfficiency: 0.4,
          recommendedEfficiency: 0.6,
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
        spell: SPELLS.EARTH_ELEMENTAL.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 300,
        gcd: {
          base: 1500,
        },
        timelineSortIndex: 80,
      },
      {
        spell: SPELLS.NATURES_GUARDIAN_TALENT.id,
        category: SPELL_CATEGORY.DEFENSIVE,
        cooldown: 45,
        enabled: combatant.hasTalent(SPELLS.NATURES_GUARDIAN_TALENT.id),
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
        spell: SPELLS.FROST_SHOCK.id,
        category: SPELL_CATEGORY.HEALER_DAMAGING_SPELL,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.SURGE_OF_EARTH_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL, // Rotational? CD? idk, is there a "useless" category?
        cooldown: 20,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(SPELLS.SURGE_OF_EARTH_TALENT.id),
        healSpellIds: [SPELLS.SURGE_OF_EARTH_HEAL.id],
        castEfficiency: {
          suggestion: true,
          majorIssueEfficiency: 0.4,
          averageIssueEfficiency: 0.6,
          recommendedEfficiency: 0.8,
        },
      },
    ];
  }
}

export default Abilities;
