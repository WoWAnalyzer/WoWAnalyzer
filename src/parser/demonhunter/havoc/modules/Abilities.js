import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import Haste from 'parser/shared/modules/Haste';

import CoreAbilities from 'parser/shared/modules/Abilities';


class Abilities extends CoreAbilities {
  static dependencies = {
    abilityTracker: AbilityTracker,
    haste: Haste,
  };

  spellbook() {
    const combatant = this.selectedCombatant;
    return [
      {
        spell: SPELLS.METAMORPHOSIS_HAVOC,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 240,
        gcd: null, // Logs track the "landing" spell which is not on GCD
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.95,
        },
      },
      {
        spell: SPELLS.NEMESIS_TALENT,
        enabled: combatant.hasTalent(SPELLS.NEMESIS_TALENT.id),
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 120,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.95,
          extraSuggestion: 'This is your main damage increase buff. You should use it as much as you can to maximize your damage output.',
        },
      },
      {
        spell: SPELLS.FEL_ERUPTION_TALENT,
        enabled: combatant.hasTalent(SPELLS.FEL_ERUPTION_TALENT.id),
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 30,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.FEL_BARRAGE_TALENT,
        enabled: combatant.hasTalent(SPELLS.FEL_BARRAGE_TALENT.id),
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 60,
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.85,
          extraSuggestion: `This is a great AoE damage spell, but also does a great damage on single target. You should cast it as soon as it gets off cooldown. The only moment you can delay it's cast is if you already expect an add wave to maximize it's efficiency and damage output.`,
        },
      },
      {
        spell: SPELLS.FELBLADE_TALENT,
        enabled: combatant.hasTalent(SPELLS.FELBLADE_TALENT.id),
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
         // Felblade cooldown can be reset by Shear or Demon Blades (when talented). But it's CD reset is not any event, so can't track if it resets or not.
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.85,
          extraSuggestion: 'This is your main Fury filler spell. Try to always cast on cooldown, but beware to not waste the Fury generation it provides. So use it when you have 30 or more Fury missing. And also it can be used to charge to the desired target, making it very strong movement spell.',
        },
      },
      {
        spell: SPELLS.EYE_BEAM,
        enabled: !combatant.hasTalent(SPELLS.DEMONIC_TALENT.id) && !combatant.hasBuff(SPELLS.HAVOC_T21_4PC_BONUS.id),
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 30,
        gcd: {
          base: 1500,
        },
      },
      //T21 Eye Beam
      {
        spell: SPELLS.EYE_BEAM,
        enabled: combatant.hasTalent(SPELLS.DEMONIC_TALENT.id) || combatant.hasBuff(SPELLS.HAVOC_T21_4PC_BONUS.id),
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 30,
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: .9,
          extraSuggestion: <>With <SpellLink id={SPELLS.DEMONIC_TALENT.id} icon /> or <SpellLink id={SPELLS.HAVOC_T21_4PC_BONUS.id} icon /> you should be using <SpellLink id={SPELLS.EYE_BEAM.id} icon /> as much as possible to have high uptime on <SpellLink id={SPELLS.METAMORPHOSIS_HAVOC.id} icon /> and/or <SpellLink id={SPELLS.HAVOC_T21_4PC_BUFF.id} icon />.</>,
        },
      },
      {
        spell: SPELLS.DEMONS_BITE,
        enabled: !combatant.hasTalent(SPELLS.DEMON_BLADES_TALENT.id),
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.CHAOS_STRIKE,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.ANNIHILATION,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.BLADE_DANCE,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: haste => 9 / (1 + haste),
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.DEATH_SWEEP,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: haste => 9 / (1 + haste),
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.THROW_GLAIVE_HAVOC,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        charges: combatant.hasTalent(SPELLS.MASTER_OF_THE_GLAIVE_TALENT.id) ? 2 : 1,
        cooldown: haste => 10 / (1 + haste),
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.FEL_RUSH,
        category: combatant.hasTalent(SPELLS.MOMENTUM_TALENT.id) ? Abilities.SPELL_CATEGORIES.ROTATIONAL : Abilities.SPELL_CATEGORIES.UTILITY,
        charges: 2,
        cooldown: 10,
        gcd: {
          static: 250,
        },
      },
      {
        spell: SPELLS.VENGEFUL_RETREAT,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 25,
        // Not actually on the GCD but blocks all spells during its animation for 1 second. The issue is you can follow up any ability on the GCD with Vengeful Retreat, so it can still cause overlap.
        gcd: null,
      },
      {
        spell: SPELLS.BLUR,
        buffSpellId: SPELLS.BLUR.id,
        category: Abilities.SPELL_CATEGORIES.DEFENSIVE,
        cooldown: 60,
      },
      {
        spell: SPELLS.DARKNESS,
        buffSpellId: SPELLS.DARKNESS.id,
        category: Abilities.SPELL_CATEGORIES.DEFENSIVE,
        cooldown: 180,
      },
      {
        spell: SPELLS.CHAOS_NOVA,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: combatant.hasTalent(SPELLS.UNLEASHED_POWER_TALENT.id) ? 40 : 60,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.NETHERWALK_TALENT,
        enabled: combatant.hasTalent(SPELLS.NETHERWALK_TALENT.id),
        category: Abilities.SPELL_CATEGORIES.DEFENSIVE,
        cooldown: 120,
      },
      {
        spell: SPELLS.IMMOLATION_AURA_TALENT,
        // IMMOLATION_AURA_TALENT is the ID for cast and the buff. But damage is done from IMMOLATION_AURA_FIRST_STRIKE_DPS and IMMOLATION_AURA_BUFF_DPS
        buffSpellId: SPELLS.IMMOLATION_AURA_TALENT.id,
        enabled: combatant.hasTalent(SPELLS.IMMOLATION_AURA_TALENT.id),
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: 30,
        gcd: {
          base: 1500,
        },
      },
	    {
        spell: SPELLS.DISRUPT,
		    category: Abilities.SPELL_CATEGORIES.UTILITY,
		    cooldown: 15,
		    gcd: null,
      },
      {
        spell: SPELLS.GLIDE,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 1.5,
        gcd: null,
	    },
    ];
  }
}

export default Abilities;
