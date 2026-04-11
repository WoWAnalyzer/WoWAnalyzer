import TALENTS from 'common/TALENTS/shaman';
import CoreAbilities from 'parser/core/modules/Abilities';
import { SpellbookAbility } from 'parser/core/modules/Ability';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';
import SPELLS from 'common/SPELLS';
import Faction from 'game/Faction';
import SPECS from 'game/SPECS';
import { Options } from 'parser/core/Analyzer';

class Abilities extends CoreAbilities {
  readonly totemicSurgeReduction: number = 0;

  constructor(options: Options) {
    super(options);

    this.totemicSurgeReduction = this.selectedCombatant.hasTalent(TALENTS.TOTEMIC_SURGE_TALENT)
      ? 5
      : 0;
  }

  spellbook(): SpellbookAbility[] {
    const combatant = this.selectedCombatant;
    const faction = combatant.faction;
    return [
      {
        spell: SPELLS.BLOODLUST.id,
        category: SPELL_CATEGORY.UTILITY,
        gcd: null,
        enabled: faction === Faction.Horde,
      },
      {
        spell: SPELLS.HEROISM.id,
        category: SPELL_CATEGORY.UTILITY,
        gcd: null,
        enabled: faction === Faction.Alliance,
      },
      {
        spell: SPELLS.SKYFURY.id,
        category: SPELL_CATEGORY.UTILITY,
        gcd: {
          base: 1000,
        },
      },
      {
        spell: SPELLS.LIGHTNING_SHIELD.id,
        category: SPELL_CATEGORY.OTHERS,
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0,
        },
      },
      {
        spell: SPELLS.FLAME_SHOCK.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: 6,
        gcd: {
          base: 1500,
        },
        range: 40,
        enabled: !combatant.hasTalent(TALENTS.VOLTAIC_BLAZE_TALENT),
      },
      {
        spell: SPELLS.GHOST_WOLF.id,
        category: SPELL_CATEGORY.UTILITY,
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: false,
        },
      },
      {
        spell: SPELLS.HEALING_SURGE.id,
        gcd: {
          base: 1500,
        },
        category: SPELL_CATEGORY.OTHERS,
      },
      {
        spell: TALENTS.ASTRAL_SHIFT_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.ASTRAL_SHIFT_TALENT),
        cooldown: 120 - combatant.getTalentRank(TALENTS.PLANES_TRAVELER_TALENT) * 30,
        category: SPELL_CATEGORY.DEFENSIVE,
      },
      {
        spell: TALENTS.CHAIN_LIGHTNING_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.CHAIN_LIGHTNING_TALENT),
        category: SPELL_CATEGORY.ROTATIONAL_AOE,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: TALENTS.FROST_SHOCK_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.FROST_SHOCK_TALENT),
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: (haste) => (combatant.spec === SPECS.ENHANCEMENT_SHAMAN ? 6 / (1 + haste) : 0),
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.LIGHTNING_BOLT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: TALENTS.LAVA_BURST_TALENT.id,
        charges: 1 + (combatant.hasTalent(TALENTS.ECHO_OF_THE_ELEMENTS_TALENT) ? 1 : 0),
        enabled: combatant.hasTalent(TALENTS.LAVA_BURST_TALENT),
        cooldown: 8,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.REINCARNATION.id,
        category: SPELL_CATEGORY.DEFENSIVE,
        gcd: undefined,
      },
      {
        spell: TALENTS.CHAIN_HEAL_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.CHAIN_HEAL_TALENT),
        category: SPELL_CATEGORY.OTHERS,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: TALENTS.EARTH_ELEMENTAL_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.EARTH_ELEMENTAL_TALENT),
        category: combatant.hasTalent(TALENTS.PRIMORDIAL_BOND_TALENT)
          ? SPELL_CATEGORY.DEFENSIVE
          : SPELL_CATEGORY.UTILITY,
        cooldown: 300,
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: false,
        },
      },
      {
        spell: TALENTS.WIND_SHEAR_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.WIND_SHEAR_TALENT),
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 12,
        gcd: null,
        castEfficiency: {
          suggestion: false,
        },
      },
      {
        spell: TALENTS.EARTH_SHIELD_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.EARTH_SHIELD_TALENT),
        category: SPELL_CATEGORY.OTHERS,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: TALENTS.CLEANSE_SPIRIT_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.CLEANSE_SPIRIT_TALENT),
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 8,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: TALENTS.SPIRITWALKERS_GRACE_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.SPIRITWALKERS_GRACE_TALENT),
        category: SPELL_CATEGORY.UTILITY,
        cooldown: combatant.hasTalent(TALENTS.GRACEFUL_SPIRIT_TALENT) ? 90 : 120,
        gcd: null,
      },
      {
        spell: TALENTS.PURGE_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.PURGE_TALENT),
        category: SPELL_CATEGORY.UTILITY,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: TALENTS.GREATER_PURGE_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.GREATER_PURGE_TALENT),
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 12,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: TALENTS.SPIRIT_WALK_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.SPIRIT_WALK_TALENT),
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 60,
        gcd: {
          static: 0,
        },
      },
      {
        spell: TALENTS.GUST_OF_WIND_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.GUST_OF_WIND_TALENT),
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 20,
        gcd: {
          static: 0,
        },
      },
      {
        spell: TALENTS.NATURES_SWIFTNESS_TALENT.id,
        enabled:
          combatant.hasTalent(TALENTS.NATURES_SWIFTNESS_TALENT) &&
          !combatant.hasTalent(TALENTS.ANCESTRAL_SWIFTNESS_TALENT),
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 60,
        gcd: {
          static: 0,
        },
      },
      {
        spell: TALENTS.HEX_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.HEX_TALENT),
        category: SPELL_CATEGORY.UTILITY,
        cooldown: combatant.hasTalent(TALENTS.VOODOO_MASTERY_TALENT) ? 15 : 30,
        gcd: {
          base: 1500,
        },
      },

      // Totems
      {
        spell: TALENTS.TOTEMIC_PROJECTION_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.TOTEMIC_PROJECTION_TALENT),
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 10,
        gcd: {
          static: 0,
        },
        castEfficiency: {
          suggestion: false,
        },
      },
      {
        spell: TALENTS.CAPACITOR_TOTEM_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.CAPACITOR_TOTEM_TALENT),
        category: SPELL_CATEGORY.UTILITY,
        cooldown:
          60 -
          this.totemicSurgeReduction -
          combatant.getTalentRank(TALENTS.STATIC_CHARGE_TALENT) * 10,
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: false,
        },
      },
      {
        spell: TALENTS.TREMOR_TOTEM_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.TREMOR_TOTEM_TALENT),
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 60 - this.totemicSurgeReduction,
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: false,
        },
      },
      {
        spell: TALENTS.WIND_RUSH_TOTEM_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.WIND_RUSH_TOTEM_TALENT),
        category: SPELL_CATEGORY.UTILITY,
        cooldown:
          120 -
          this.totemicSurgeReduction -
          (combatant.hasTalent(TALENTS.ASCENDING_AIR_TALENT) ? 30 : 0),
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: false,
        },
      },
      {
        spell: TALENTS.EARTHGRAB_TOTEM_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.EARTHGRAB_TOTEM_TALENT),
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 30 - this.totemicSurgeReduction,
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: false,
        },
      },
      {
        spell: TALENTS.HEALING_STREAM_TOTEM_SHARED_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.HEALING_STREAM_TOTEM_SHARED_TALENT),
        category: SPELL_CATEGORY.OTHERS,
        cooldown: 30 - this.totemicSurgeReduction,
        charges: 1,
        gcd: {
          static: 1000,
        },
        castEfficiency: {
          suggestion: false,
        },
      },
      {
        spell: TALENTS.POISON_CLEANSING_TOTEM_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.POISON_CLEANSING_TOTEM_TALENT),
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 45 - this.totemicSurgeReduction,
        gcd: {
          static: 1000,
        },
        castEfficiency: {
          suggestion: false,
        },
      },
      {
        spell: SPELLS.EARTHBIND_TOTEM.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 30 - this.totemicSurgeReduction,
        gcd: {
          base: 1000,
        },
        castEfficiency: {
          suggestion: false,
        },
      },
      {
        spell: SPELLS.VOLTAIC_BLAZE_CAST.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        enabled: combatant.hasTalent(TALENTS.VOLTAIC_BLAZE_TALENT),
        gcd: {
          base: 1500,
        },
        cooldown: 10 - (combatant.hasTalent(TALENTS.CRACKLING_FURY_TALENT) ? 3 : 0),
        range: 40,
      },

      /* Hero Talents */
      {
        spell: SPELLS.SURGING_TOTEM_RECALL.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 6,
        gcd: null,
        enabled: combatant.hasTalent(TALENTS.SURGING_TOTEM_TALENT),
      },

      /* Hidden Spells */
      {
        spell: SPELLS.LIGHTNING_SHIELD.id,
        category: SPELL_CATEGORY.HIDDEN,
      },
    ];
  }
}

export default Abilities;
