import SPELLS from 'common/SPELLS';
import CoreAbilities from 'Parser/Core/Modules/Abilities';

class Abilities extends CoreAbilities {
  spellbook() {
    const combatant = this.selectedCombatant;

    const standardGcd = combatant => 800 * (1 - (combatant.hasBuff(SPELLS.ADRENALINE_RUSH.id) ? 0.2 : 0));

    return [
      {
        spell: SPELLS.VANISH,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 120,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.95,
        },
      },
      {
        spell: SPELLS.ADRENALINE_RUSH, // TODO: Reduced by Convergence of Fates
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 120,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.95,
        },
      },
      {
        spell: SPELLS.CURSE_OF_THE_DREADBLADES, 
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 120,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.95,
        },
      },
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
        spell: SPELLS.ROLL_THE_BONES,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: {
          static: standardGcd,
        },
        enabled: !combatant.hasTalent(SPELLS.SLICE_AND_DICE_TALENT.id),
      },
      {
        spell: SPELLS.RUN_THROUGH,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: {
          static: standardGcd,
        },
      },
      {
        spell: SPELLS.SABER_SLASH,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: {
          static: standardGcd,
        },
      },
      {
        spell: SPELLS.POISONED_KNIFE,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      },
      {
        spell: SPELLS.AMBUSH,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: {
          static: standardGcd,
        },
      },
      {
        spell: SPELLS.BLUNDERBUSS,
        category: Abilities.SPELL_CATEGORIES.OTHERS,
        gcd: {
          static: standardGcd,
        },
      },
      {
        spell: SPELLS.PISTOL_SHOT,
        category: Abilities.SPELL_CATEGORIES.OTHERS,
        gcd: {
          static: standardGcd,
        },
      },
      {
        spell: SPELLS.BETWEEN_THE_EYES,
        category: Abilities.SPELL_CATEGORIES.OTHERS,
        gcd: {
          static: standardGcd,
        },
      },
      {
        spell: SPELLS.BLADE_FLURRY,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL_AOE,
      },
      {
        spell: SPELLS.MARKED_FOR_DEATH_TALENT,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        enabled: combatant.hasTalent(SPELLS.MARKED_FOR_DEATH_TALENT.id),
      },
      {
        spell: SPELLS.SLICE_AND_DICE_TALENT,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: {
          static: standardGcd,
        },
        enabled: combatant.hasTalent(SPELLS.SLICE_AND_DICE_TALENT.id),
      },
      {
        spell: SPELLS.GHOSTLY_STRIKE_TALENT,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        enabled: combatant.hasTalent(SPELLS.GHOSTLY_STRIKE_TALENT.id),
      },
      {
        spell: SPELLS.FEINT,
        buffSpellId: SPELLS.FEINT.id,
        gcd: {
          static: standardGcd,
        },
        category: Abilities.SPELL_CATEGORIES.DEFENSIVE,
      },
      {
        spell: SPELLS.CRIMSON_VIAL,
        cooldown: 30,
        gcd: {
          static: standardGcd,
        },
        category: Abilities.SPELL_CATEGORIES.DEFENSIVE,
      },
      {
        spell: SPELLS.RIPOSTE,
        buffSpellId: SPELLS.RIPOSTE.id,
        cooldown: 120,
        category: Abilities.SPELL_CATEGORIES.DEFENSIVE,
      },
    ];
  }
}

export default Abilities;
