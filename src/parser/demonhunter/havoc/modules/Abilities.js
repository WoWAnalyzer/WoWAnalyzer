import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import CoreAbilities from 'parser/core/modules/Abilities';

class Abilities extends CoreAbilities {
  spellbook() {
    const combatant = this.selectedCombatant;
    return [
      //Rotation Spells
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
        spell: SPELLS.ANNIHILATION, //During meta chaos strike becomes this.
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: [SPELLS.BLADE_DANCE, SPELLS.DEATH_SWEEP],
        category: combatant.hasTalent(SPELLS.FIRST_BLOOD_TALENT.id) ? Abilities.SPELL_CATEGORIES.ROTATIONAL : Abilities.SPELL_CATEGORIES.ROTATIONAL_AOE,
        cooldown: haste => 9 / (1 + haste),
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: combatant.hasTalent(SPELLS.FIRST_BLOOD_TALENT.id),
          recommendedEfficiency: 0.95,
          extraSuggestion: <>This should be part of your single target rotation due to the <SpellLink id={SPELLS.FIRST_BLOOD_TALENT.id} /> talent. This includes the <SpellLink id={SPELLS.DEATH_SWEEP.id} /> casts since they are the same ability and share their cooldowns.</>,
        },
      },
      {
        spell: SPELLS.FELBLADE_TALENT,
        enabled: combatant.hasTalent(SPELLS.FELBLADE_TALENT.id),
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        // Felblade cooldown can be reset by Shear or Demon Blades (when talented). But it's CD reset is not any event, so can't track if it resets or not.
        cooldown: haste => 15 / (1 + haste),
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.95,
          extraSuggestion: 'This is an important Fury generator spell. Try to always cast on cooldown, but beware to not waste the Fury generation it provides. And also it can be used to charge to the desired target, making it very strong movement spell.',
        },
      },
      {
        spell: SPELLS.IMMOLATION_AURA,
        // IMMOLATION_AURA is the ID for cast and the buff. But damage is done from IMMOLATION_AURA_FIRST_STRIKE_DPS and IMMOLATION_AURA_BUFF_DPS
        buffSpellId: SPELLS.IMMOLATION_AURA.id,
        enabled: combatant.hasTalent(SPELLS.IMMOLATION_AURA.id),
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: haste => 30 / (1 + haste),
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.95,
          extraSuggestion: 'This is an important Fury generator spell. Try to always cast on cooldown, but beware to not waste the Fury generation it provides.',
        },
      },
      {
        spell: SPELLS.DARK_SLASH_TALENT,
        enabled: combatant.hasTalent(SPELLS.DARK_SLASH_TALENT.id),
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 20,
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.95,
          extraSuggestion: <>Pool your Fury before hand to maximizing casting <SpellLink id={SPELLS.CHAOS_STRIKE.id} /> / <SpellLink id={SPELLS.ANNIHILATION.id} /> during its buff window.</>,
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

      //Movement
      {
        spell: SPELLS.FEL_RUSH_CAST, //Becomes a rotational ability with the Momentum talent
        category: combatant.hasTalent(SPELLS.MOMENTUM_TALENT.id) ? Abilities.SPELL_CATEGORIES.ROTATIONAL : Abilities.SPELL_CATEGORIES.UTILITY,
        charges: 2,
        cooldown: 10,
        gcd: {
          static: 250,
        },
        castEfficiency: {
          suggestion: combatant.hasTalent(SPELLS.MOMENTUM_TALENT.id),
          recommendedEfficiency: 0.95,
          extraSuggestion: <>Use it to keep your <SpellLink id={SPELLS.MOMENTUM_TALENT.id} /> buff going.</>,
        },
      },
      {
        spell: SPELLS.VENGEFUL_RETREAT, //Becomes a rotational ability with the Momentum talent
        category: combatant.hasTalent(SPELLS.MOMENTUM_TALENT.id) ? Abilities.SPELL_CATEGORIES.ROTATIONAL : Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: combatant.hasTalent(SPELLS.MOMENTUM_TALENT.id) ? 20 : 25,
        // Not actually on the GCD but blocks all spells during its animation for 1 second. The issue is you can follow up any ability on the GCD with Vengeful Retreat, so it can still cause overlap.
        gcd: null,
        castEfficiency: {
          suggestion: combatant.hasTalent(SPELLS.MOMENTUM_TALENT.id),
          recommendedEfficiency: 0.95,
          extraSuggestion: <>Use it to generate Fury due to the <SpellLink id={SPELLS.MOMENTUM_TALENT.id} /> talent.</>,
        },
      },
      {
        spell: SPELLS.GLIDE,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 1.5,
        gcd: null,
      },

      // CC, interupts, and utility
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
        spell: SPELLS.CHAOS_NOVA,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: combatant.hasTalent(SPELLS.UNLEASHED_POWER_TALENT.id) ? 40 : 60,
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
        spell: SPELLS.CONSUME_MAGIC,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 10,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.TORMENT,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 8,
        gcd: null,
      },
      {
        spell: SPELLS.IMPRISON,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 45,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.SPECTRAL_SIGHT,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 30,
        gcd: {
          base: 1500,
        },
      },

      // DPS Cooldowns
      {
        spell: SPELLS.EYE_BEAM,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
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
          recommendedEfficiency: 0.95,
          extraSuggestion: `This is a great AoE damage spell, but also does a great damage on single target. You should cast it as soon as it gets off cooldown. The only moment you can delay it's cast is if you already expect an add wave to maximize it's efficiency and damage output.`,
        },
      },

      // Big DPS Cooldowns
      {
        spell: SPELLS.METAMORPHOSIS_HAVOC,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        buffSpellId: SPELLS.METAMORPHOSIS_HAVOC_BUFF.id,
        cooldown: 240,
        gcd: null, // Logs track the "landing" spell which is not on GCD
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.80, //4 minute cd. You want some leeway in when to burn it.
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

      // Defensives
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
        spell: SPELLS.NETHERWALK_TALENT,
        enabled: combatant.hasTalent(SPELLS.NETHERWALK_TALENT.id),
        category: Abilities.SPELL_CATEGORIES.DEFENSIVE,
        cooldown: 120,
      },
    ];
  }
}

export default Abilities;
