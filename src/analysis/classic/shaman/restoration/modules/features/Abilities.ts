import SPELLS from 'common/SPELLS/classic';
import CoreAbilities from 'parser/core/modules/Abilities';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';
import { SpellbookAbility } from 'parser/core/modules/Ability';

class Abilities extends CoreAbilities {
  spellbook(): SpellbookAbility[] {
    return [
      // Rotational
      {
        spell: [SPELLS.RIP_TIDE.id],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { base: 1500 },
        cooldown: 6,
      },
      {
        spell: [SPELLS.HEALING_WAVE.id],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { base: 1500 },
        castEfficiency: {
          casts: (ability, parser) => {
            const healingWave: number[] = [SPELLS.HEALING_WAVE.id];
            return healingWave.reduce((casts, spell) => {
              casts += this.abilityTracker.getAbility(spell).casts;
              return casts;
            }, 0);
          },
        },
      },
      {
        spell: [SPELLS.EARTH_SHIELD.id],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { base: 1500 },
      },
      // Rotational AOE
      {
        spell: [SPELLS.CHAIN_HEAL.id],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { base: 1500 },
        castEfficiency: {
          casts: (ability, parser) => {
            const chainHeals: number[] = [SPELLS.CHAIN_HEAL.id];
            return chainHeals.reduce((casts, spell) => {
              casts += this.abilityTracker.getAbility(spell).casts;
              return casts;
            }, 0);
          },
        },
      },
      // Cooldowns
      {
        spell: [SPELLS.NATURES_SWIFTNESS.id],
        category: SPELL_CATEGORY.COOLDOWNS,
        gcd: { base: 1500 },
        cooldown: 180,
      },
      {
        spell: [SPELLS.MANA_TIDE_TOTEM.id],
        category: SPELL_CATEGORY.COOLDOWNS,
        gcd: { base: 1000 },
        cooldown: 300,
      },
      {
        spell: [SPELLS.BLOODLUST.id],
        category: SPELL_CATEGORY.COOLDOWNS,
        gcd: { base: 1500 },
        isUndetectable: true,
      },
      {
        spell: [SPELLS.HEROISM.id],
        category: SPELL_CATEGORY.COOLDOWNS,
        gcd: { base: 1500 },
        isUndetectable: true,
      },
      {
        spell: [SPELLS.FIRE_ELEMENTAL_TOTEM.id],
        category: SPELL_CATEGORY.COOLDOWNS,
        gcd: { base: 1000 },
      },
      {
        spell: [SPELLS.EARTH_ELEMENTAL_TOTEM.id],
        category: SPELL_CATEGORY.COOLDOWNS,
        gcd: { base: 1000 },
      },
      {
        spell: [SPELLS.REINCARNATION.id],
        category: SPELL_CATEGORY.COOLDOWNS,
        gcd: { base: 1500 },
      },

      // Defensive

      // Other spells (not apart of the normal rotation)
      {
        spell: [SPELLS.LIGHTNING_BOLT.id],
        category: SPELL_CATEGORY.HEALER_DAMAGING_SPELL,
        gcd: { base: 1500 },
      },
      {
        spell: [SPELLS.CHAIN_LIGHTNING.id],
        category: SPELL_CATEGORY.HEALER_DAMAGING_SPELL,
        gcd: { base: 1500 },
      },
      {
        spell: [SPELLS.LAVA_BURST.id],
        category: SPELL_CATEGORY.HEALER_DAMAGING_SPELL,
        gcd: { base: 1500 },
      },
      {
        spell: [SPELLS.FLAME_SHOCK.id],
        category: SPELL_CATEGORY.HEALER_DAMAGING_SPELL,
        gcd: { base: 1500 },
      },
      {
        spell: [SPELLS.EARTH_SHOCK.id],
        category: SPELL_CATEGORY.HEALER_DAMAGING_SPELL,
        gcd: { base: 1500 },
      },
      {
        spell: [SPELLS.SEARING_TOTEM.id],
        category: SPELL_CATEGORY.HEALER_DAMAGING_SPELL,
        gcd: { base: 1000 },
      },
      {
        spell: [SPELLS.FIRE_NOVA.id],
        category: SPELL_CATEGORY.HEALER_DAMAGING_SPELL,
        gcd: { base: 1500 },
      },
      {
        spell: [SPELLS.MAGMA_TOTEM.id],
        category: SPELL_CATEGORY.HEALER_DAMAGING_SPELL,
        gcd: { base: 1000 },
      },

      // Utility
      {
        spell: [SPELLS.CLEANSE_SPIRIT.id],
        category: SPELL_CATEGORY.UTILITY,
        gcd: { base: 1500 },
      },
      {
        spell: [SPELLS.FROST_SHOCK.id],
        category: SPELL_CATEGORY.UTILITY,
        gcd: { base: 1500 },
      },
      {
        spell: [SPELLS.CALL_OF_THE_ANCESTORS.id],
        category: SPELL_CATEGORY.UTILITY,
        gcd: { base: 1000 },
      },
      {
        spell: [SPELLS.CALL_OF_THE_ELEMENTS.id],
        category: SPELL_CATEGORY.UTILITY,
        gcd: { base: 1000 },
      },
      {
        spell: [SPELLS.CALL_OF_THE_SPIRITS.id],
        category: SPELL_CATEGORY.UTILITY,
        gcd: { base: 1000 },
      },
      {
        spell: [SPELLS.EARTHBIND_TOTEM.id],
        category: SPELL_CATEGORY.UTILITY,
        gcd: { base: 1000 },
      },
      {
        spell: [SPELLS.FLAMETONGUE_TOTEM.id],
        category: SPELL_CATEGORY.UTILITY,
        gcd: { base: 1000 },
      },
      {
        spell: [SPELLS.GROUNDING_TOTEM.id],
        category: SPELL_CATEGORY.UTILITY,
        gcd: { base: 1000 },
      },
      {
        spell: [SPELLS.HEALING_STREAM_TOTEM.id],
        category: SPELL_CATEGORY.UTILITY,
        gcd: { base: 1000 },
      },
      {
        spell: [SPELLS.LIGHTNING_SHIELD.id],
        category: SPELL_CATEGORY.UTILITY,
        gcd: { base: 1500 },
      },
      {
        spell: [SPELLS.MANA_SPRING_TOTEM.id],
        category: SPELL_CATEGORY.UTILITY,
        gcd: { base: 1000 },
      },
      {
        spell: [SPELLS.PURGE.id],
        category: SPELL_CATEGORY.UTILITY,
        gcd: { base: 1500 },
      },
      {
        spell: [SPELLS.STONECLAW_TOTEM.id],
        category: SPELL_CATEGORY.UTILITY,
        gcd: { base: 1000 },
      },
      {
        spell: [SPELLS.STONESKIN_TOTEM.id],
        category: SPELL_CATEGORY.UTILITY,
        gcd: { base: 1000 },
      },
      {
        spell: [SPELLS.STRENGTH_OF_EARTH_TOTEM.id],
        category: SPELL_CATEGORY.UTILITY,
        gcd: { base: 1000 },
      },
      {
        spell: [SPELLS.TOTEMIC_RECALL.id],
        category: SPELL_CATEGORY.UTILITY,
        gcd: { base: 1500 },
      },
      {
        spell: [SPELLS.TREMOR_TOTEM.id],
        category: SPELL_CATEGORY.UTILITY,
        gcd: { base: 1000 },
      },
      {
        spell: [SPELLS.WATER_SHIELD.id],
        category: SPELL_CATEGORY.UTILITY,
        gcd: { base: 1500 },
      },
      {
        spell: [SPELLS.WINDFURY_TOTEM.id],
        category: SPELL_CATEGORY.UTILITY,
        gcd: { base: 1000 },
      },
      {
        spell: [SPELLS.WRATH_OF_AIR_TOTEM.id],
        category: SPELL_CATEGORY.UTILITY,
        gcd: { base: 1000 },
      },

      // Pet Related

      // Consumable
    ];
  }
}

export default Abilities;
