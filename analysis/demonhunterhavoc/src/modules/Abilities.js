import SPELLS from 'common/SPELLS';
import COVENANTS from 'game/shadowlands/COVENANTS';
import { SpellLink } from 'interface';
import CoreAbilities from 'parser/core/modules/Abilities';

import { FEL_DEFENDER_COOLDOWN_REDUCTION } from '@wowanalyzer/demonhunter';

class Abilities extends CoreAbilities {
  spellbook() {
    const combatant = this.selectedCombatant;
    return [
      //Rotation Spells
      {
        spell: SPELLS.DEMONS_BITE.id,
        enabled: !combatant.hasTalent(SPELLS.DEMON_BLADES_TALENT.id),
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.CHAOS_STRIKE.id,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.ANNIHILATION.id, //During meta chaos strike becomes this.
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: [SPELLS.BLADE_DANCE.id, SPELLS.DEATH_SWEEP.id],
        category: combatant.hasTalent(SPELLS.FIRST_BLOOD_TALENT.id)
          ? Abilities.SPELL_CATEGORIES.ROTATIONAL
          : Abilities.SPELL_CATEGORIES.ROTATIONAL_AOE,
        cooldown: (haste) =>
          combatant.hasBuff(SPELLS.METAMORPHOSIS_HAVOC_BUFF.id)
            ? 9 / (1 + haste)
            : 15 / (1 + haste),
        //Blade dance = 15s cd
        //Death Sweep = 9s cd
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion:
            combatant.hasTalent(SPELLS.FIRST_BLOOD_TALENT.id) ||
            combatant.hasTalent(SPELLS.TRAIL_OF_RUIN_TALENT.id),
          recommendedEfficiency: 0.95,
          extraSuggestion: (
            <>
              This should be part of your single target rotation due to using{' '}
              <SpellLink id={SPELLS.FIRST_BLOOD_TALENT.id} /> or{' '}
              <SpellLink id={SPELLS.TRAIL_OF_RUIN_TALENT.id} />. This includes the{' '}
              <SpellLink id={SPELLS.DEATH_SWEEP.id} /> casts since they are the same ability and
              share their cooldowns.
            </>
          ),
        },
      },
      {
        spell: SPELLS.FELBLADE_TALENT.id,
        enabled: combatant.hasTalent(SPELLS.FELBLADE_TALENT.id),
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        // Felblade cooldown can be reset by Demon Bite. But it's CD reset is not any event, so can't track if it resets or not.
        cooldown: (haste) => 15 / (1 + haste),
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.95,
          extraSuggestion:
            'This is an important Fury generator spell. Try to always cast on cooldown, but beware to not waste the Fury generation it provides. And also it can be used to charge to the desired target, making it very strong movement spell.',
        },
      },
      {
        spell: SPELLS.IMMOLATION_AURA.id,
        // IMMOLATION_AURA is the ID for cast and the buff. But damage is done from IMMOLATION_AURA_INITIAL_HIT_DAMAGE and IMMOLATION_AURA_BUFF_DAMAGE
        buffSpellId: SPELLS.IMMOLATION_AURA.id,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: (haste) => 30 / (1 + haste),
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.95,
          extraSuggestion:
            'This is an important Fury generator spell. Try to always cast on cooldown, but beware to not waste the Fury generation it provides.',
        },
      },
      {
        spell: SPELLS.ESSENCE_BREAK_TALENT.id,
        enabled: combatant.hasTalent(SPELLS.ESSENCE_BREAK_TALENT.id),
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 20,
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.95,
          extraSuggestion: (
            <>
              Pool your Fury before hand to maximizing casting{' '}
              <SpellLink id={SPELLS.CHAOS_STRIKE.id} /> / <SpellLink id={SPELLS.ANNIHILATION.id} />{' '}
              during its buff window.
            </>
          ),
        },
      },
      {
        spell: SPELLS.THROW_GLAIVE_HAVOC.id,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: (haste) => 9 / (1 + haste),
        gcd: {
          base: 1500,
        },
      },

      //Movement
      {
        spell: SPELLS.FEL_RUSH_CAST.id, //Becomes a rotational ability with the Momentum talent
        category: combatant.hasTalent(SPELLS.MOMENTUM_TALENT.id)
          ? Abilities.SPELL_CATEGORIES.ROTATIONAL
          : Abilities.SPELL_CATEGORIES.UTILITY,
        charges: 2,
        cooldown: 10,
        gcd: {
          static: 250,
        },
        castEfficiency: {
          suggestion: combatant.hasTalent(SPELLS.MOMENTUM_TALENT.id),
          recommendedEfficiency: 0.95,
          extraSuggestion: (
            <>
              Use it to keep your <SpellLink id={SPELLS.MOMENTUM_TALENT.id} /> buff going.
            </>
          ),
        },
      },
      {
        spell: SPELLS.VENGEFUL_RETREAT.id, //Becomes a rotational ability with the Momentum talent
        category: combatant.hasTalent(SPELLS.MOMENTUM_TALENT.id)
          ? Abilities.SPELL_CATEGORIES.ROTATIONAL
          : Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: combatant.hasTalent(SPELLS.MOMENTUM_TALENT.id) ? 20 : 25,
        // Not actually on the GCD but blocks all spells during its animation for 1 second. The issue is you can follow up any ability on the GCD with Vengeful Retreat, so it can still cause overlap.
        gcd: null,
        castEfficiency: {
          suggestion: combatant.hasTalent(SPELLS.MOMENTUM_TALENT.id),
          recommendedEfficiency: 0.95,
          extraSuggestion: (
            <>
              Use it to generate Fury due to the <SpellLink id={SPELLS.MOMENTUM_TALENT.id} />{' '}
              talent.
            </>
          ),
        },
      },
      {
        spell: SPELLS.GLIDE.id,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 1.5,
        gcd: null,
      },

      // CC, interupts, and utility
      {
        spell: SPELLS.FEL_ERUPTION_TALENT.id,
        enabled: combatant.hasTalent(SPELLS.FEL_ERUPTION_TALENT.id),
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 30,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.CHAOS_NOVA.id,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: combatant.hasTalent(SPELLS.UNLEASHED_POWER_TALENT.id) ? 40 : 60,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.DISRUPT.id,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 15,
        gcd: null,
      },
      {
        spell: SPELLS.CONSUME_MAGIC.id,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 10,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.TORMENT.id,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 8,
        gcd: null,
      },
      {
        spell: SPELLS.IMPRISON.id,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 45,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.SPECTRAL_SIGHT.id,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 30,
        gcd: {
          base: 1500,
        },
      },

      // DPS Cooldowns
      {
        spell: SPELLS.EYE_BEAM.id,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 30,
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: combatant.hasCovenant(COVENANTS.VENTHYR.id),
          recommendedEfficiency: 0.95,
          extraSuggestion: (
            <>
              The only times you should delay casting <SpellLink id={SPELLS.EYE_BEAM.id} /> is when
              you're expecting adds to spawn soon or your <SpellLink id={SPELLS.SINFUL_BRAND.id} />{' '}
              is about to fall off.
            </>
          ),
        },
      },
      {
        spell: SPELLS.FEL_BARRAGE_TALENT.id,
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
      {
        spell: SPELLS.GLAIVE_TEMPEST_TALENT.id,
        enabled: combatant.hasTalent(SPELLS.GLAIVE_TEMPEST_TALENT.id),
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: (haste) => 20 / (1 + haste),
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.95,
          extraSuggestion: (
            <>
              The only time you should delay casting{' '}
              <SpellLink id={SPELLS.GLAIVE_TEMPEST_TALENT.id} /> is when you're expecting adds to
              spawn soon.
            </>
          ),
        },
      },
      //Covenant
      {
        spell: SPELLS.SINFUL_BRAND.id,
        enabled: combatant.hasCovenant(COVENANTS.VENTHYR.id),
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 60,
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          // You should only cast Sinful Brand if your primary target does
          // not already have it applied if you're using the legendary,
          // as otherwise it overwrites it.
          suggestion: !combatant.hasLegendary(SPELLS.AGONY_GAZE),
          recommendedEfficiency: 0.95,
          extraSuggestion: `This should be part of your single target rotation.`,
        },
      },
      {
        spell: [SPELLS.ELYSIAN_DECREE.id, SPELLS.ELYSIAN_DECREE_REPEAT_DECREE.id],
        enabled: combatant.hasCovenant(COVENANTS.KYRIAN.id),
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 60,
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
          extraSuggestion: (
            <>
              The only time you should delay casting <SpellLink id={SPELLS.ELYSIAN_DECREE.id} /> is
              when you're expecting adds to spawn soon.
            </>
          ),
        },
      },
      {
        spell: SPELLS.FODDER_TO_THE_FLAME.id,
        enabled: combatant.hasCovenant(COVENANTS.NECROLORD.id),
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 120,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.THE_HUNT.id,
        enabled: combatant.hasCovenant(COVENANTS.NIGHT_FAE.id),
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 90,
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.8,
          extraSuggestion: (
            <>
              The only time you should delay casting <SpellLink id={SPELLS.THE_HUNT.id} /> is when
              you're expecting adds to spawn soon or for an upcoming haste buff.
            </>
          ),
        },
      },
      {
        spell: SPELLS.DOOR_OF_SHADOWS.id,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 60,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasCovenant(COVENANTS.VENTHYR.id),
      },
      {
        spell: SPELLS.FLESHCRAFT.id,
        category: Abilities.SPELL_CATEGORIES.DEFENSIVE,
        cooldown: 120,
        enabled: combatant.hasCovenant(COVENANTS.NECROLORD.id),
      },
      {
        spell: SPELLS.SOULSHAPE.id,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 30,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasCovenant(COVENANTS.NIGHT_FAE.id),
      },
      // Big DPS Cooldowns
      {
        spell: SPELLS.METAMORPHOSIS_HAVOC.id,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        buffSpellId: SPELLS.METAMORPHOSIS_HAVOC_BUFF.id,
        cooldown: 300,
        gcd: null, // Logs track the "landing" spell which is not on GCD
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.8, //5 minute cd. You want some leeway in when to burn it.
        },
      },

      // Defensives
      {
        spell: SPELLS.BLUR.id,
        buffSpellId: SPELLS.BLUR.id,
        category: Abilities.SPELL_CATEGORIES.DEFENSIVE,
        cooldown: combatant.hasConduitBySpellID(SPELLS.FEL_DEFENDER.id)
          ? 60 -
            FEL_DEFENDER_COOLDOWN_REDUCTION[combatant.conduitRankBySpellID(SPELLS.FEL_DEFENDER.id)]
          : 60,
      },
      {
        spell: SPELLS.DARKNESS.id,
        buffSpellId: SPELLS.DARKNESS.id,
        category: Abilities.SPELL_CATEGORIES.DEFENSIVE,
        cooldown: 180,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.NETHERWALK_TALENT.id,
        enabled: combatant.hasTalent(SPELLS.NETHERWALK_TALENT.id),
        category: Abilities.SPELL_CATEGORIES.DEFENSIVE,
        cooldown: 180,
        gcd: {
          base: 1500,
        },
      },
    ];
  }
}

export default Abilities;
