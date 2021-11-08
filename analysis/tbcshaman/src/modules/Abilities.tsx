import CoreAbilities from 'parser/core/modules/Abilities';
import { SpellbookAbility } from 'parser/core/modules/Ability';

import { Build } from '../CONFIG';
import lowRankSpells from '../lowRankSpells';
import * as SPELL_EFFECTS from '../SPELL_EFFECTS';
import * as SPELLS from '../SPELLS';

class Abilities extends CoreAbilities {
  spellbook(): SpellbookAbility[] {
    const baseSpells: SpellbookAbility[] = [
      // Rotational Abilities
      // Resto
      {
        spell: [SPELLS.CHAIN_HEAL, ...lowRankSpells[SPELLS.CHAIN_HEAL]],
        category:
          this.owner.build === Build.DEFAULT
            ? Abilities.SPELL_CATEGORIES.ROTATIONAL
            : Abilities.SPELL_CATEGORIES.OTHERS,
        gcd: { static: 1500 },
        castEfficiency: {
          casts: (ability, parser) => {
            const chainHeals: number[] = [SPELLS.CHAIN_HEAL, ...lowRankSpells[SPELLS.CHAIN_HEAL]];
            return chainHeals.reduce((casts, spell) => {
              casts += this.abilityTracker.getAbility(spell).casts;

              return casts;
            }, 0);
          },
        },
      },
      {
        spell: [SPELLS.HEALING_WAVE, ...lowRankSpells[SPELLS.HEALING_WAVE]],
        category:
          this.owner.build === Build.DEFAULT
            ? Abilities.SPELL_CATEGORIES.ROTATIONAL
            : Abilities.SPELL_CATEGORIES.OTHERS,
        gcd: { static: 1500 },
        castEfficiency: {
          casts: (ability, parser) => {
            const healingWave: number[] = [
              SPELLS.HEALING_WAVE,
              ...lowRankSpells[SPELLS.HEALING_WAVE],
            ];
            return healingWave.reduce((casts, spell) => {
              casts += this.abilityTracker.getAbility(spell).casts;

              return casts;
            }, 0);
          },
        },
      },
      {
        spell: [SPELLS.LESSER_HEALING_WAVE, ...lowRankSpells[SPELLS.LESSER_HEALING_WAVE]],
        category:
          this.owner.build === Build.DEFAULT
            ? Abilities.SPELL_CATEGORIES.ROTATIONAL
            : Abilities.SPELL_CATEGORIES.OTHERS,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.EARTH_SHIELD, ...lowRankSpells[SPELLS.EARTH_SHIELD]],
        enabled: this.owner.build === Build.DEFAULT,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: { static: 1500 },
      },

      // Ele
      {
        spell: [SPELLS.LIGHTNING_BOLT, ...lowRankSpells[SPELLS.LIGHTNING_BOLT]],
        category:
          this.owner.build === Build.ELEMENTAL
            ? Abilities.SPELL_CATEGORIES.ROTATIONAL
            : Abilities.SPELL_CATEGORIES.HEALER_DAMAGING_SPELL,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.CHAIN_LIGHTNING, ...lowRankSpells[SPELLS.CHAIN_LIGHTNING]],
        category:
          this.owner.build === Build.ELEMENTAL
            ? Abilities.SPELL_CATEGORIES.ROTATIONAL
            : Abilities.SPELL_CATEGORIES.HEALER_DAMAGING_SPELL,
        gcd: { static: 1500 },
        cooldown: 6,
      },

      // Enhancement
      {
        spell: [SPELLS.STORMSTRIKE],
        enabled: this.owner.build === Build.ENHANCEMENT,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: { static: 1000 },
        cooldown: 10,
        damageSpellIds: [SPELL_EFFECTS.STORMSTRIKE_MAIN_HAND, SPELL_EFFECTS.STORMSTRIKE_OFF_HAND],
      },
      {
        spell: [SPELLS.FLAME_SHOCK, ...lowRankSpells[SPELLS.FLAME_SHOCK]],
        category:
          this.owner.build === Build.ENHANCEMENT
            ? Abilities.SPELL_CATEGORIES.ROTATIONAL
            : Abilities.SPELL_CATEGORIES.HEALER_DAMAGING_SPELL,
        gcd: { static: 1500 },
        cooldown: 6,
      },
      {
        spell: [SPELLS.EARTH_SHOCK, ...lowRankSpells[SPELLS.EARTH_SHOCK]],
        category:
          this.owner.build === Build.ENHANCEMENT
            ? Abilities.SPELL_CATEGORIES.ROTATIONAL
            : Abilities.SPELL_CATEGORIES.HEALER_DAMAGING_SPELL,
        gcd: { static: 1500 },
        cooldown: 6,
      },
      {
        spell: [SPELLS.WINDFURY_TOTEM, ...lowRankSpells[SPELLS.WINDFURY_TOTEM]],
        category:
          this.owner.build === Build.ENHANCEMENT
            ? Abilities.SPELL_CATEGORIES.ROTATIONAL
            : Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: { static: 1000 },
      },
      {
        spell: [SPELLS.GRACE_OF_AIR_TOTEM, ...lowRankSpells[SPELLS.GRACE_OF_AIR_TOTEM]],
        category:
          this.owner.build === Build.ENHANCEMENT
            ? Abilities.SPELL_CATEGORIES.ROTATIONAL
            : Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: { static: 1000 },
      },

      // Cooldowns
      {
        spell: [SPELLS.BLOODLUST],
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        gcd: { static: 1500 },
        cooldown: 600,
        isUndetectable: true,
      },
      {
        spell: [SPELLS.HEROISM],
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        gcd: { static: 1500 },
        cooldown: 600,
        isUndetectable: true,
      },
      {
        spell: [SPELLS.MANA_TIDE_TOTEM],
        enabled: this.owner.build === Build.DEFAULT,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        gcd: { static: 1000 },
        cooldown: 300,
      },
      {
        spell: [SPELLS.NATURES_SWIFTNESS],
        enabled: this.owner.build === Build.DEFAULT,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        gcd: { static: 1500 },
        cooldown: 180,
      },
      {
        spell: [SPELLS.ELEMENTAL_MASTERY],
        enabled: this.owner.build === Build.ELEMENTAL,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        gcd: null,
        cooldown: 180,
      },
      {
        spell: [SPELLS.SHAMANISTIC_RAGE],
        enabled: this.owner.build === Build.ENHANCEMENT,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        gcd: { static: 1000 },
        cooldown: 120,
      },
      {
        spell: [SPELLS.REINCARNATION],
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        gcd: { static: 1500 },
        cooldown: 3600,
      },

      // Other spells
      {
        spell: [SPELLS.ASTRAL_RECALL],
        category: Abilities.SPELL_CATEGORIES.OTHERS,
        gcd: { static: 1500 },
        cooldown: 900,
      },
      {
        spell: [SPELLS.CURE_DISEASE],
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.CURE_POISON],
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.DISEASE_CLEANSING_TOTEM],
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: { static: 1000 },
      },
      {
        spell: [SPELLS.EARTH_ELEMENTAL_TOTEM],
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: { static: 1000 },
        cooldown: 1200,
      },

      {
        spell: [SPELLS.EARTHBIND_TOTEM],
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: { static: 1000 },
      },
      {
        spell: [SPELLS.FIRE_ELEMENTAL_TOTEM],
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: { static: 1000 },
        cooldown: 1200,
      },
      {
        spell: [SPELLS.FIRE_NOVA_TOTEM, ...lowRankSpells[SPELLS.FIRE_NOVA_TOTEM]],
        category: Abilities.SPELL_CATEGORIES.HEALER_DAMAGING_SPELL,
        gcd: { static: 1000 },
        cooldown: 15,
      },
      {
        spell: [SPELLS.FIRE_RESISTANCE_TOTEM, ...lowRankSpells[SPELLS.FIRE_RESISTANCE_TOTEM]],
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: { static: 1000 },
      },

      {
        spell: [SPELLS.FLAMETONGUE_TOTEM, ...lowRankSpells[SPELLS.FLAMETONGUE_TOTEM]],
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: { static: 1000 },
      },
      {
        spell: [SPELLS.FROST_RESISTANCE_TOTEM, ...lowRankSpells[SPELLS.FROST_RESISTANCE_TOTEM]],
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: { static: 1000 },
      },
      {
        spell: [SPELLS.FROST_SHOCK, ...lowRankSpells[SPELLS.FROST_SHOCK]],
        category: Abilities.SPELL_CATEGORIES.HEALER_DAMAGING_SPELL,
        gcd: { static: 1500 },
        cooldown: 6,
      },
      {
        spell: [SPELLS.GROUNDING_TOTEM],
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: { static: 1000 },
      },
      {
        spell: [SPELLS.HEALING_STREAM_TOTEM, ...lowRankSpells[SPELLS.HEALING_STREAM_TOTEM]],
        category: Abilities.SPELL_CATEGORIES.OTHERS,
        gcd: { static: 1000 },
      },
      {
        spell: [SPELLS.LIGHTNING_SHIELD, ...lowRankSpells[SPELLS.LIGHTNING_SHIELD]],
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.MAGMA_TOTEM, ...lowRankSpells[SPELLS.MAGMA_TOTEM]],
        category: Abilities.SPELL_CATEGORIES.HEALER_DAMAGING_SPELL,
        gcd: { static: 1000 },
      },
      {
        spell: [SPELLS.MANA_SPRING_TOTEM, ...lowRankSpells[SPELLS.MANA_SPRING_TOTEM]],
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: { static: 1000 },
      },

      {
        spell: [SPELLS.NATURE_RESISTANCE_TOTEM, ...lowRankSpells[SPELLS.NATURE_RESISTANCE_TOTEM]],
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: { static: 1000 },
      },

      {
        spell: [SPELLS.POISON_CLEANSING_TOTEM],
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: { static: 1000 },
      },
      {
        spell: [SPELLS.PURGE, ...lowRankSpells[SPELLS.PURGE]],
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.SEARING_TOTEM, ...lowRankSpells[SPELLS.SEARING_TOTEM]],
        category: Abilities.SPELL_CATEGORIES.HEALER_DAMAGING_SPELL,
        gcd: { static: 1000 },
      },
      {
        spell: [SPELLS.STONECLAW_TOTEM, ...lowRankSpells[SPELLS.STONECLAW_TOTEM]],
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: { static: 1000 },
      },
      {
        spell: [SPELLS.STONESKIN_TOTEM, ...lowRankSpells[SPELLS.STONESKIN_TOTEM]],
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: { static: 1000 },
      },
      {
        spell: [SPELLS.STRENGTH_OF_EARTH_TOTEM, ...lowRankSpells[SPELLS.STRENGTH_OF_EARTH_TOTEM]],
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: { static: 1000 },
      },
      {
        spell: [SPELLS.TOTEMIC_CALL],
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.TOTEM_OF_WRATH],
        enabled: this.owner.build === Build.ELEMENTAL,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: { static: 1000 },
      },
      {
        spell: [SPELLS.TRANQUIL_AIR_TOTEM],
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: { static: 1000 },
      },
      {
        spell: [SPELLS.TREMOR_TOTEM],
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: { static: 1000 },
      },
      {
        spell: [SPELLS.WATER_BREATHING],
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: { static: 1000 },
      },
      {
        spell: [SPELLS.WATER_SHIELD, ...lowRankSpells[SPELLS.WATER_SHIELD]],
        category: Abilities.SPELL_CATEGORIES.OTHERS,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.WATER_WALKING],
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: { static: 1500 },
      },

      {
        spell: [SPELLS.WINDFURY_WEAPON, ...lowRankSpells[SPELLS.WINDFURY_WEAPON]],
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.WINDWALL_TOTEM, ...lowRankSpells[SPELLS.WINDWALL_TOTEM]],
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: { static: 1000 },
      },
      {
        spell: [SPELLS.WRATH_OF_AIR_TOTEM],
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: { static: 1000 },
      },
    ];

    return baseSpells;
  }
}

export default Abilities;
