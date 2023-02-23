import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/rogue';
import { SpellLink } from 'interface';
import Combatant from 'parser/core/Combatant';
import ISSUE_IMPORTANCE from 'parser/core/ISSUE_IMPORTANCE';
import CoreAbilities from 'parser/core/modules/Abilities';
import { SpellbookAbility } from 'parser/core/modules/Ability';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';

class Abilities extends CoreAbilities {
  spellbook(): SpellbookAbility[] {
    const combatant = this.selectedCombatant;

    const standardGcd = (combatant: Combatant) =>
      1000 * (1 - (combatant.hasBuff(TALENTS.ADRENALINE_RUSH_TALENT.id) ? 0.2 : 0));

    return [
      // // Base class resource
      {
        spell: SPELLS.COMBO_POINT.id,
        category: SPELL_CATEGORY.HIDDEN,
      },
      // Rotational
      {
        spell: SPELLS.AMBUSH.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          static: standardGcd,
        },
      },
      {
        spell: SPELLS.DISPATCH.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          static: standardGcd,
        },
      },
      {
        spell: TALENTS.ROLL_THE_BONES_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          static: standardGcd,
        },
      },
      {
        spell: SPELLS.SLICE_AND_DICE.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          static: standardGcd,
        },
      },
      {
        spell: SPELLS.SINISTER_STRIKE.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          static: standardGcd,
        },
      },
      {
        spell: TALENTS.MARKED_FOR_DEATH_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: 60,
        gcd: null,
        castEfficiency: {
          suggestion: true,
        },
        enabled: combatant.hasTalent(TALENTS.MARKED_FOR_DEATH_TALENT),
      },
      {
        spell: TALENTS.GHOSTLY_STRIKE_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: 35,
        gcd: {
          static: standardGcd,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.95,
        },
        enabled: combatant.hasTalent(TALENTS.GHOSTLY_STRIKE_TALENT),
      },
      {
        spell: SPELLS.BETWEEN_THE_EYES.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: 45,
        gcd: {
          static: standardGcd,
        },
      },
      {
        spell: SPELLS.PISTOL_SHOT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          static: standardGcd,
        },
      },
      // Rotational (AOE)
      {
        spell: TALENTS.BLADE_FLURRY_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL_AOE,
        cooldown: 30,
        gcd: {
          static: standardGcd,
        },
      },
      // Cooldowns
      {
        spell: TALENTS.DREADBLADES_TALENT.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 120,
        gcd: {
          static: standardGcd,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
          extraSuggestion: `Using Dreadblades on cooldown is very important and should only be delayed when you know you won't be able to attack for the majority of it's duration.`,
        },
        enabled: combatant.hasTalent(TALENTS.DREADBLADES_TALENT),
      },
      {
        spell: TALENTS.ADRENALINE_RUSH_TALENT.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 180,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
          extraSuggestion: `Using Adrenaline Rush on cooldown is very important and should only be delayed when you know you won't be able to attack for the majority of it's duration.`,
        },
      },
      {
        spell: TALENTS.SHADOW_DANCE_TALENT.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 60,
        enabled: combatant.hasTalent(TALENTS.SHADOW_DANCE_TALENT),
      },
      {
        spell: TALENTS.THISTLE_TEA_TALENT.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 1,
        charges: 3,
        enabled: combatant.hasTalent(TALENTS.THISTLE_TEA_TALENT),
      },
      {
        spell: TALENTS.COLD_BLOOD_TALENT.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 45,
        enabled: combatant.hasTalent(TALENTS.COLD_BLOOD_TALENT),
      },
      {
        spell: TALENTS.BLADE_RUSH_TALENT.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 30,
        gcd: {
          static: standardGcd,
        },
        castEfficiency: {
          suggestion: true,
          extraSuggestion: (
            <>
              You should delay using it to line it up with{' '}
              <SpellLink id={TALENTS.BLADE_FLURRY_TALENT.id} icon /> in AoE scenarios.
            </>
          ),
        },
        enabled: combatant.hasTalent(TALENTS.BLADE_RUSH_TALENT),
      },
      {
        spell: TALENTS.KILLING_SPREE_TALENT.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 120,
        gcd: {
          static: standardGcd,
        },
        castEfficiency: {
          suggestion: true,
          extraSuggestion: (
            <>
              You should delay using it to line it up with{' '}
              <SpellLink id={TALENTS.BLADE_FLURRY_TALENT.id} icon /> in AoE scenarios.
            </>
          ),
        },
        enabled: combatant.hasTalent(TALENTS.KILLING_SPREE_TALENT),
      },
      // Defensive
      {
        spell: TALENTS.CLOAK_OF_SHADOWS_TALENT.id,
        category: SPELL_CATEGORY.DEFENSIVE,
        cooldown: 120,
        gcd: null,
      },
      {
        spell: SPELLS.CRIMSON_VIAL.id,
        category: SPELL_CATEGORY.DEFENSIVE,
        cooldown: 30,
        gcd: {
          base: 1000, // Adrenaline Rush doesn't decrease this, but Haste does
        },
      },
      {
        spell: SPELLS.FEINT.id,
        category: SPELL_CATEGORY.DEFENSIVE,
        buffSpellId: SPELLS.FEINT.id,
        cooldown: 15,
        gcd: {
          static: standardGcd,
        },
      },
      {
        spell: SPELLS.RIPOSTE.id,
        category: SPELL_CATEGORY.DEFENSIVE,
        buffSpellId: SPELLS.RIPOSTE.id,
        cooldown: 120,
        gcd: null,
      },
      // Others
      {
        spell: SPELLS.PICK_LOCK.id,
        category: SPELL_CATEGORY.OTHERS,
      },
      {
        spell: SPELLS.PICK_POCKET.id,
        category: SPELL_CATEGORY.OTHERS,
        // While this actually has a 0.5s CD, it shows up weird in the Abilities tab if we set that
      },
      // Utility
      {
        spell: SPELLS.VANISH.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 120,
        gcd: null,
        castEfficiency: {
          suggestion: true,
          extraSuggestion: (
            <>
              In most fights this can be used on cooldown for an{' '}
              <SpellLink id={SPELLS.AMBUSH.id} icon />, but it's perfectly fine to save this for a{' '}
              <SpellLink id={SPELLS.CHEAP_SHOT.id} icon /> on adds, especially when talented for{' '}
              <SpellLink id={TALENTS.PREY_ON_THE_WEAK_TALENT.id} icon />.
            </>
          ),
          importance: ISSUE_IMPORTANCE.MINOR,
        },
      },
      {
        spell: TALENTS.GRAPPLING_HOOK_TALENT.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 60 - (combatant.hasTalent(TALENTS.RETRACTABLE_HOOK_TALENT) ? 30 : 0),
        gcd: null,
      },
      {
        spell: SPELLS.SPRINT.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 60,
        gcd: null,
      },
      {
        spell: TALENTS.TRICKS_OF_THE_TRADE_TALENT.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 30,
        gcd: null,
      },
      {
        spell: SPELLS.STEALTH.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 2,
        gcd: null,
      },
      {
        spell: SPELLS.KICK.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 15,
        gcd: null,
      },
      {
        spell: TALENTS.BLIND_TALENT.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 120 - (combatant.hasTalent(TALENTS.BLINDING_POWDER_TALENT) ? 30 : 0),
        gcd: {
          static: standardGcd,
        },
      },
      {
        spell: SPELLS.CHEAP_SHOT.id,
        category: SPELL_CATEGORY.UTILITY,
        gcd: {
          static: standardGcd,
        },
      },
      {
        spell: SPELLS.DISTRACT.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 30,
        gcd: {
          static: standardGcd,
        },
      },
      {
        spell: SPELLS.GOUGE.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 15,
        gcd: {
          static: standardGcd,
        },
      },
      {
        spell: SPELLS.SHROUD_OF_CONCEALMENT.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 6 * 60,
        gcd: {
          base: 1000,
        },
      },
      {
        spell: SPELLS.SAP.id,
        category: SPELL_CATEGORY.UTILITY,
      },
      // Covenant Abilities
      {
        spell: TALENTS.SERRATED_BONE_SPIKE_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        enabled: false,
        charges: 3,
        cooldown: 30,
        gcd: {
          static: standardGcd,
        },
      },
      {
        spell: TALENTS.SEPSIS_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        enabled: false,
        cooldown: 90,
        gcd: {
          static: standardGcd,
        },
        castEfficiency: {
          suggestion: true,
        },
      },
      {
        spell: TALENTS.ECHOING_REPRIMAND_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        enabled: false,
        gcd: {
          static: standardGcd,
        },
      },
      {
        spell: TALENTS.FLAGELLATION_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        enabled: false,
        gcd: {
          static: standardGcd,
        },
      },
    ];
  }
}

export default Abilities;
