import SPELLS from 'common/SPELLS';
import CoreAbilities from 'Parser/Core/Modules/Abilities';
import MasterAssassin from './Traits/MasterAssassin';

class Abilities extends CoreAbilities {
  static dependencies = {
    masterAssassin: MasterAssassin,
  };

  spellbook() {
    const combatant = this.selectedCombatant;
    return [
      {
        spell: SPELLS.VANISH,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 120,
      },
      {
        spell: SPELLS.VENDETTA, // TODO: Reduced by Convergence of Fates
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 120 - this.masterAssassin.traitCooldownReduction,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 1.0,
        },
      },
      {
        spell: SPELLS.TOXIC_BLADE_TALENT,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 25,
        gcd: {
          static: 1000,
        },
        enabled: combatant.hasTalent(SPELLS.TOXIC_BLADE_TALENT.id),
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.90,
          extraSuggestion: 'Use on cooldown, or delay for Vendetta if less then 10 seconds remain.',
        },
      },
      {
        spell: SPELLS.KINGSBANE,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 45,
        gcd: {
          static: 1000,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.95,
          extraSuggestion: 'Use on cooldown, to benefit from the cooldown reduction effects',
        },
      },
      //No recommendations
      {
        spell: SPELLS.DEATH_FROM_ABOVE_TALENT,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: 20,
        gcd: {
          static: 2000,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.95,
        },
        enabled: combatant.hasTalent(SPELLS.DEATH_FROM_ABOVE_TALENT.id),
      },
      {
        spell: SPELLS.RUPTURE,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: {
          static: 1000,
        },
      },
      {
        spell: SPELLS.ENVENOM,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: {
          static: 1000,
        },
      },
      {
        spell: SPELLS.MUTILATE,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: {
          static: 1000,
        },
      },
      {
        spell: SPELLS.POISONED_KNIFE,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: {
          static: 1000,
        },
      },
      {
        spell: SPELLS.FAN_OF_KNIVES,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL_AOE,
        gcd: {
          static: 1000,
        },
      },
      {
        spell: SPELLS.GARROTE,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: {
          static: 1000,
        },
      },
      {
        spell: SPELLS.MARKED_FOR_DEATH_TALENT,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        enabled: combatant.hasTalent(SPELLS.MARKED_FOR_DEATH_TALENT.id),
      },
      {
        spell: SPELLS.FEINT,
        buffSpellId: SPELLS.FEINT.id,
        category: Abilities.SPELL_CATEGORIES.DEFENSIVE,
        gcd: {
          static: 1000,
        },
      },
      {
        spell: SPELLS.CRIMSON_VIAL,
        cooldown: 30,
        gcd: {
          static: 1000,
        },
        category: Abilities.SPELL_CATEGORIES.DEFENSIVE,
      },
      {
        spell: SPELLS.EVASION,
        buffSpellId: SPELLS.EVASION.id,
        cooldown: 120,
        category: Abilities.SPELL_CATEGORIES.DEFENSIVE,
      },
      {
        spell: SPELLS.KIDNEY_SHOT,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 20,
        gcd: {
          static: 1000,
        },
      },
    ];
  }
}

export default Abilities;
