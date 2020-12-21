import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import CoreAbilities from 'parser/core/modules/Abilities';
import ISSUE_IMPORTANCE from 'parser/core/ISSUE_IMPORTANCE';
import COVENANTS from 'game/shadowlands/COVENANTS';

class Abilities extends CoreAbilities {
  spellbook() {
    const combatant = this.selectedCombatant;

    const standardGcd = combatant => 1000 * (1 - (combatant.hasBuff(SPELLS.ADRENALINE_RUSH.id) ? 0.2 : 0));

    return [
      // // Base class resource
      {
        spell: SPELLS.COMBO_POINT,
        category: Abilities.SPELL_CATEGORIES.HIDDEN,
      },
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
      },
      {
        spell: SPELLS.SLICE_AND_DICE,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: {
          static: standardGcd,
        },
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
          recommendedEfficiency: 0.95,
        },
        enabled: combatant.hasTalent(SPELLS.GHOSTLY_STRIKE_TALENT.id),
      },
      {
        spell: SPELLS.BETWEEN_THE_EYES,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: 45,
        gcd: {
          static: standardGcd,
        },
      },
      {
        spell: SPELLS.PISTOL_SHOT,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: {
          static: standardGcd,
        },
      },
      // Rotational (AOE)
      {
        spell: SPELLS.BLADE_FLURRY,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL_AOE,
        cooldown: 30,
        gcd: {
          static: standardGcd,
        },
      },
      // Cooldowns
      {
        spell: SPELLS.DREADBLADES_TALENT,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 90,
        gcd: {
          static: standardGcd,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
          extraSuggestion: `Using Dreadblades on cooldown is very important and should only be delayed when you know you won't be able to attack for the majority of it's duration.`,
        },
      },
      {
        spell: SPELLS.ADRENALINE_RUSH,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 180,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
          extraSuggestion: `Using Adrenaline Rush on cooldown is very important and should only be delayed when you know you won't be able to attack for the majority of it's duration.`,
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
          extraSuggestion: <>You should delay using it to line it up with <SpellLink id={SPELLS.BLADE_FLURRY.id} icon /> in AoE scenarios.</>,
        },
        enabled: combatant.hasTalent(SPELLS.BLADE_RUSH_TALENT.id),
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
          extraSuggestion: <>You should delay using it to line it up with <SpellLink id={SPELLS.BLADE_FLURRY.id} icon /> in AoE scenarios.</>,
        },
        enabled: combatant.hasTalent(SPELLS.KILLING_SPREE_TALENT.id),
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
          base: 1000, // Adrenaline Rush doesn't decrease this, but Haste does
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
        spell: SPELLS.PICK_LOCK,
        category: Abilities.SPELL_CATEGORIES.OTHERS,
      },
      {
        spell: SPELLS.PICK_POCKET,
        category: Abilities.SPELL_CATEGORIES.OTHERS,
        // While this actually has a 0.5s CD, it shows up weird in the Abilities tab if we set that
      },
      // Utility
      {
        spell: SPELLS.VANISH,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 120,
        gcd: null,
        castEfficiency: {
          suggestion: true,
          extraSuggestion: <>In most fights this can be used on cooldown for an <SpellLink id={SPELLS.AMBUSH.id} icon />, but it's perfectly fine to save this for a <SpellLink id={SPELLS.CHEAP_SHOT.id} icon /> on adds, especially when talented for <SpellLink id={SPELLS.PREY_ON_THE_WEAK_TALENT.id} icon />.</>,
          importance: ISSUE_IMPORTANCE.MINOR,
        },
      },
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
        spell: SPELLS.SHROUD_OF_CONCEALMENT,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 6 * 60,
        gcd: {
          base: 1000,
        },
      },
      {
        spell: SPELLS.SAP,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
      },
      // Covenant Abilities
      {
        spell: SPELLS.SERRATED_BONE_SPIKE,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        enabled: combatant.hasCovenant(COVENANTS.NECROLORD.id),
        charges: 3,
        cooldown: 30,
        gcd: {
          static: standardGcd,
        },
      },
      {
        spell: SPELLS.SEPSIS,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        enabled: combatant.hasCovenant(COVENANTS.NIGHT_FAE.id),
        gcd: {
          static: standardGcd,
        },
      },
      {
        spell: SPELLS.ECHOING_REPRIMAND,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        enabled: combatant.hasCovenant(COVENANTS.KYRIAN.id),
        gcd: {
          static: standardGcd,
        },
      },
      {
        spell: SPELLS.FLAGELLATION,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        enabled: combatant.hasCovenant(COVENANTS.VENTHYR.id),
        gcd: {
          static: standardGcd,
        },
      },
    ];
  }
}

export default Abilities;
