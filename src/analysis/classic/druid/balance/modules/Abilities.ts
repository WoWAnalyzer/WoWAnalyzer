import SPELLS from 'common/SPELLS/classic/druid';
import CoreAbilities from 'parser/core/modules/Abilities';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';

class Abilities extends CoreAbilities {
  spellbook() {
    return [
      // Rotational
      {
        spell: SPELLS.INSECT_SWARM.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { base: 1500 },
      },
      {
        spell: [SPELLS.MOONFIRE.id, SPELLS.SUNFIRE.id],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { base: 1500 },
      },
      {
        spell: SPELLS.STARFIRE.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { base: 1500 },
      },
      {
        spell: SPELLS.STARSURGE.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { base: 1500 },
        cooldown: 15,
      },
      {
        spell: SPELLS.WRATH.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { base: 1500 },
      },
      // Rotational AOE
      {
        spell: SPELLS.HURRICANE.id,
        category: SPELL_CATEGORY.ROTATIONAL_AOE,
        gcd: { base: 1500 },
      },
      {
        spell: SPELLS.WILD_MUSHROOM.id,
        category: SPELL_CATEGORY.ROTATIONAL_AOE,
        gcd: { base: 1000 },
      },
      {
        spell: SPELLS.WILD_MUSHROOM_DETONATE.id,
        category: SPELL_CATEGORY.ROTATIONAL_AOE,
        gcd: null,
        cooldown: 10,
      },
      // Cooldowns
      {
        spell: [SPELLS.FORCE_OF_NATURE.id],
        category: SPELL_CATEGORY.COOLDOWNS,
        gcd: { base: 1500 },
        cooldown: 180,
      },
      {
        spell: [SPELLS.INNERVATE.id],
        category: SPELL_CATEGORY.COOLDOWNS,
        gcd: { base: 1500 },
        cooldown: 180,
      },
      {
        spell: SPELLS.STARFALL.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        gcd: { base: 1500 },
        cooldown: 60, // with Glyph of Starfall
      },
      // Defensive
      {
        spell: [SPELLS.BARKSKIN.id],
        category: SPELL_CATEGORY.DEFENSIVE,
        gcd: null,
        cooldown: 60,
      },
      {
        spell: SPELLS.DASH.id,
        category: SPELL_CATEGORY.DEFENSIVE,
        gcd: { base: 1500 },
        cooldown: 180,
      },
      {
        spell: [SPELLS.NATURES_GRASP.id],
        category: SPELL_CATEGORY.DEFENSIVE,
        gcd: { base: 1500 },
        cooldown: 60,
      },
      {
        spell: [SPELLS.SOLAR_BEAM.id],
        category: SPELL_CATEGORY.DEFENSIVE,
        gcd: null,
        cooldown: 60,
      },
      {
        spell: [SPELLS.TYPHOON.id],
        category: SPELL_CATEGORY.DEFENSIVE,
        gcd: { base: 1500 },
        cooldown: 20,
      },
      // OTHER SPELLS (not apart of the normal rotation)
      {
        spell: SPELLS.HEALING_TOUCH.id,
        category: SPELL_CATEGORY.OTHERS,
        gcd: { base: 1500 },
      },
      {
        spell: SPELLS.LIFEBLOOM.id,
        category: SPELL_CATEGORY.OTHERS,
        gcd: { base: 1500 },
      },
      {
        spell: SPELLS.NOURISH.id,
        category: SPELL_CATEGORY.OTHERS,
        gcd: { base: 1500 },
      },
      {
        spell: SPELLS.REGROWTH.id,
        category: SPELL_CATEGORY.OTHERS,
        gcd: { base: 1500 },
      },
      {
        spell: SPELLS.REJUVENATION.id,
        category: SPELL_CATEGORY.OTHERS,
        gcd: { base: 1500 },
      },
      {
        spell: SPELLS.TRANQUILITY.id,
        category: SPELL_CATEGORY.OTHERS,
        gcd: { base: 1500 },
        cooldown: 480,
      },
      // Utility
      {
        spell: [SPELLS.BEAR_FORM.id],
        category: SPELL_CATEGORY.UTILITY,
        gcd: { base: 1500 },
      },
      {
        spell: [SPELLS.CAT_FORM.id],
        category: SPELL_CATEGORY.UTILITY,
        gcd: { base: 1500 },
      },
      {
        spell: [SPELLS.CYCLONE.id],
        category: SPELL_CATEGORY.UTILITY,
        gcd: { base: 1500 },
      },
      {
        spell: [SPELLS.ENTANGLING_ROOTS.id],
        category: SPELL_CATEGORY.UTILITY,
        gcd: { base: 1500 },
      },
      {
        spell: [SPELLS.FAERIE_FIRE.id],
        category: SPELL_CATEGORY.UTILITY,
        gcd: { base: 1500 },
      },
      {
        spell: [SPELLS.HIBERNATE.id],
        category: SPELL_CATEGORY.UTILITY,
        gcd: { base: 1500 },
      },
      {
        spell: [SPELLS.MARK_OF_THE_WILD.id],
        category: SPELL_CATEGORY.UTILITY,
        gcd: { base: 1500 },
      },
      {
        spell: [SPELLS.MOONKIN_FORM.id],
        category: SPELL_CATEGORY.UTILITY,
        gcd: { base: 1500 },
      },
      {
        spell: SPELLS.REBIRTH.id,
        category: SPELL_CATEGORY.UTILITY,
        gcd: { base: 1500 },
      },
      {
        spell: [SPELLS.REMOVE_CORRUPTION.id],
        category: SPELL_CATEGORY.UTILITY,
        gcd: { base: 1500 },
      },
      {
        spell: [SPELLS.SOOTHE.id],
        category: SPELL_CATEGORY.UTILITY,
        gcd: { base: 1500 },
      },
      {
        spell: [SPELLS.THORNS.id],
        category: SPELL_CATEGORY.UTILITY,
        gcd: { base: 1500 },
        cooldown: 45,
      },
      // Pet Related

      // Consumable
    ];
  }
}

export default Abilities;
