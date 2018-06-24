import SPELLS from 'common/SPELLS';
import CoreAbilities from 'Parser/Core/Modules/Abilities';

class Abilities extends CoreAbilities {
  spellbook() {
    const combatant = this.selectedCombatant;

    const standardGcd = combatant => 1000 * (1 - (combatant.hasBuff(SPELLS.ADRENALINE_RUSH.id) ? 0.2 : 0));

    return [
      // Rotational
      {
        spell: SPELLS.AMBUSH,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: {
          static: standardGcd,
        },
      },
      {
        spell: SPELLS.DISPATCH,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: {
          static: standardGcd,
        },
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
        spell: SPELLS.SLICE_AND_DICE_TALENT,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: {
          static: standardGcd,
        },
        enabled: combatant.hasTalent(SPELLS.SLICE_AND_DICE_TALENT.id),
      },
      {
        spell: SPELLS.SINISTER_STRIKE,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: {
          static: standardGcd,
        },
      },
      {
        spell: SPELLS.MARKED_FOR_DEATH_TALENT,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: 60,
        gcd: null,
        castEfficiency: {
          suggestion: true,
        },
        enabled: combatant.hasTalent(SPELLS.MARKED_FOR_DEATH_TALENT.id),
      },
      {
        spell: SPELLS.GHOSTLY_STRIKE_TALENT,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: 35,
        gcd: {
          static: standardGcd,
        },
        castEfficiency: {
          suggestion: true,
        },
        enabled: combatant.hasTalent(SPELLS.GHOSTLY_STRIKE_TALENT.id),
      },
      // Rotational (AOE)
      {
        spell: SPELLS.BLADE_FLURRY,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL_AOE,
        cooldown: 25,
        charges: 2,
        gcd: {
          static: standardGcd,
        },
      },
      // Cooldowns
      {
        spell: SPELLS.ADRENALINE_RUSH,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 180,
        gcd: {
          static: standardGcd,
        },
        castEfficiency: {
          suggestion: true,
        },
      },
      {
        spell: SPELLS.VANISH,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 120,
        gcd: null,
        castEfficiency: {
          suggestion: true,
        },
      },
      {
        spell: SPELLS.BLADE_RUSH_TALENT,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 45,
        gcd: {
          static: standardGcd,
        },
        castEfficiency: {
          suggestion: true,
        },
      },
      {
        spell: SPELLS.KILLING_SPREE_TALENT,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 120,
        gcd: {
          static: standardGcd,
        },
        castEfficiency: {
          suggestion: true,
        },
      },
      // Defensive
      {
        spell: SPELLS.CLOAK_OF_SHADOWS,
        category: Abilities.SPELL_CATEGORIES.DEFENSIVE,
        cooldown: 120,
        gcd: null,
      },
      {
        spell: SPELLS.CRIMSON_VIAL,
        category: Abilities.SPELL_CATEGORIES.DEFENSIVE,
        cooldown: 30,
        gcd: {
          static: standardGcd,
        },
      },
      {
        spell: SPELLS.FEINT,
        category: Abilities.SPELL_CATEGORIES.DEFENSIVE,
        buffSpellId: SPELLS.FEINT.id,
        cooldown: 15,
        gcd: {
          static: standardGcd,
        },
      },
      {
        spell: SPELLS.RIPOSTE,
        category: Abilities.SPELL_CATEGORIES.DEFENSIVE,
        buffSpellId: SPELLS.RIPOSTE.id,
        cooldown: 120,
        gcd: null,
      },
      // Others
      {
        spell: SPELLS.BETWEEN_THE_EYES,
        category: Abilities.SPELL_CATEGORIES.OTHERS,
        cooldown: 30,
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
      // Utility
      {
        spell: SPELLS.GRAPPLING_HOOK,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 60 - (combatant.hasTalent(SPELLS.RETRACTABLE_HOOK_TALENT.id) ? 30 : 0),
        gcd: null,
      },
      {
        spell: SPELLS.SPRINT,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 60,
        gcd: null,
      },
      {
        spell: SPELLS.TRICKS_OF_THE_TRADE,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 30,
        gcd: null,
      },
      {
        spell: SPELLS.STEALTH,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 2,
        gcd: null,
      },
      {
        spell: SPELLS.KICK,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 15,
        gcd: null,
      },
      {
        spell: SPELLS.BLIND,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 120 - (combatant.hasTalent(SPELLS.BLINDING_POWDER_TALENT.id) ? 30 : 0),
        gcd: {
          static: standardGcd,
        },
      },
      {
        spell: SPELLS.CHEAP_SHOT,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: {
          static: standardGcd,
        },
      },
      {
        spell: SPELLS.DISTRACT,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 30,
        gcd: {
          static: standardGcd,
        },
      },
      {
        spell: SPELLS.GOUGE,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 15,
        gcd: {
          static: standardGcd,
        },
      },
      {
        spell: SPELLS.SAP,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
      },
      {
        spell: SPELLS.SHROUD_OF_CONCEALMENT,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 6 * 60,
        gcd: {
          static: standardGcd,
        },
      },
      {
        spell: SPELLS.PICK_LOCK,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
      },
      {
        spell: SPELLS.PICK_POCKET,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 0.5,
      },
    ];
  }
}

export default Abilities;
