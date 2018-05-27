import SPELLS from 'common/SPELLS';
import CoreAbilities from 'Parser/Core/Modules/Abilities';
import Combatants from 'Parser/Core/Modules/Combatants';
import MasterAssassin from '../Traits/MasterAssassin';

class Abilities extends CoreAbilities {
  static dependencies = {
    masterAssassin: MasterAssassin,
    combatants: Combatants,
  }
  spellbook() {
    const combatant = this.combatants.selected;
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
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.95,
        },
        enabled: combatant.hasTalent(SPELLS.DEATH_FROM_ABOVE_TALENT.id),
      },
      {
        spell: SPELLS.RUPTURE,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      },
      {
        spell: SPELLS.ENVENOM,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      },
      {
        spell: SPELLS.MUTILATE,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      },
      {
        spell: SPELLS.POISONED_KNIFE,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      },
      {
        spell: SPELLS.FAN_OF_KNIVES,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL_AOE,
      },
      {
        spell: SPELLS.GARROTE,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
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
      },
      {
        spell: SPELLS.CRIMSON_VIAL,
        cooldown: 30,
        category: Abilities.SPELL_CATEGORIES.DEFENSIVE,
      },
      {
        spell: SPELLS.EVASION,
        buffSpellId: SPELLS.EVASION.id,
        cooldown: 120,
        category: Abilities.SPELL_CATEGORIES.DEFENSIVE,
      },
    ];
  }
}

export default Abilities;
