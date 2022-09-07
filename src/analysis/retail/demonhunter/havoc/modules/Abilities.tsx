import SPELLS from 'common/SPELLS/demonhunter';
import {
  DEMON_BLADES_HAVOC_TALENT,
  ELYSIAN_DECREE_HAVOC_TALENT,
  ESSENCE_BREAK_HAVOC_TALENT,
  FEL_BARRAGE_HAVOC_TALENT,
  FEL_ERUPTION_HAVOC_TALENT,
  FELBLADE_TALENT,
  FIRST_BLOOD_HAVOC_TALENT,
  GLAIVE_TEMPEST_HAVOC_TALENT,
  MOMENTUM_HAVOC_TALENT,
  NETHERWALK_HAVOC_TALENT,
  THE_HUNT_TALENT,
  TRAIL_OF_RUIN_HAVOC_TALENT,
  UNLEASHED_POWER_TALENT,
} from 'common/TALENTS/demonhunter';
import { SpellLink } from 'interface';
import CoreAbilities from 'parser/core/modules/Abilities';
import { SpellbookAbility } from 'parser/core/modules/Ability';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';

class Abilities extends CoreAbilities {
  spellbook(): SpellbookAbility[] {
    const combatant = this.selectedCombatant;
    return [
      //Rotation Spells
      {
        spell: SPELLS.DEMONS_BITE.id,
        enabled: !combatant.hasTalent(DEMON_BLADES_HAVOC_TALENT.id),
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.CHAOS_STRIKE.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.ANNIHILATION.id, //During meta chaos strike becomes this.
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: [SPELLS.BLADE_DANCE.id, SPELLS.DEATH_SWEEP.id],
        category: combatant.hasTalent(FIRST_BLOOD_HAVOC_TALENT.id)
          ? SPELL_CATEGORY.ROTATIONAL
          : SPELL_CATEGORY.ROTATIONAL_AOE,
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
            combatant.hasTalent(FIRST_BLOOD_HAVOC_TALENT.id) ||
            combatant.hasTalent(TRAIL_OF_RUIN_HAVOC_TALENT.id),
          recommendedEfficiency: 0.95,
          extraSuggestion: (
            <>
              This should be part of your single target rotation due to using{' '}
              <SpellLink id={FIRST_BLOOD_HAVOC_TALENT.id} /> or{' '}
              <SpellLink id={TRAIL_OF_RUIN_HAVOC_TALENT.id} />. This includes the{' '}
              <SpellLink id={SPELLS.DEATH_SWEEP.id} /> casts since they are the same ability and
              share their cooldowns.
            </>
          ),
        },
      },
      {
        spell: FELBLADE_TALENT.id,
        enabled: combatant.hasTalent(FELBLADE_TALENT.id),
        category: SPELL_CATEGORY.ROTATIONAL,
        // Felblade cooldown can be reset by Demon Bite. But its CD reset is not any event, so can't track if it resets or not.
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
        category: SPELL_CATEGORY.ROTATIONAL,
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
        spell: ESSENCE_BREAK_HAVOC_TALENT.id,
        enabled: combatant.hasTalent(ESSENCE_BREAK_HAVOC_TALENT.id),
        category: SPELL_CATEGORY.COOLDOWNS,
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
              /
              <SpellLink id={SPELLS.BLADE_DANCE.id} /> / <SpellLink id={SPELLS.DEATH_SWEEP.id} />{' '}
              during its buff window.
            </>
          ),
        },
      },
      {
        spell: SPELLS.THROW_GLAIVE_HAVOC.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: (haste) => 9 / (1 + haste),
        gcd: {
          base: 1500,
        },
      },

      //Movement
      {
        spell: SPELLS.FEL_RUSH_CAST.id, //Becomes a rotational ability with the Momentum talent
        category: combatant.hasTalent(MOMENTUM_HAVOC_TALENT.id)
          ? SPELL_CATEGORY.ROTATIONAL
          : SPELL_CATEGORY.UTILITY,
        charges: 2,
        cooldown: 10,
        gcd: {
          static: 250,
        },
        castEfficiency: {
          suggestion: combatant.hasTalent(MOMENTUM_HAVOC_TALENT.id),
          recommendedEfficiency: 0.95,
          extraSuggestion: (
            <>
              Use it to keep your <SpellLink id={MOMENTUM_HAVOC_TALENT.id} /> buff going.
            </>
          ),
        },
      },
      {
        spell: SPELLS.VENGEFUL_RETREAT.id, //Becomes a rotational ability with the Momentum talent
        category: combatant.hasTalent(MOMENTUM_HAVOC_TALENT.id)
          ? SPELL_CATEGORY.ROTATIONAL
          : SPELL_CATEGORY.UTILITY,
        cooldown: combatant.hasTalent(MOMENTUM_HAVOC_TALENT.id) ? 20 : 25,
        // Not actually on the GCD but blocks all spells during its animation for 1 second. The issue is you can follow up any ability on the GCD with Vengeful Retreat, so it can still cause overlap.
        gcd: null,
        castEfficiency: {
          suggestion: combatant.hasTalent(MOMENTUM_HAVOC_TALENT.id),
          recommendedEfficiency: 0.95,
          extraSuggestion: (
            <>
              Use it to generate Fury due to the <SpellLink id={MOMENTUM_HAVOC_TALENT.id} /> talent.
            </>
          ),
        },
      },
      {
        spell: SPELLS.GLIDE.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 1.5,
        gcd: null,
      },

      // CC, interupts, and utility
      {
        spell: FEL_ERUPTION_HAVOC_TALENT.id,
        enabled: combatant.hasTalent(FEL_ERUPTION_HAVOC_TALENT.id),
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 30,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.CHAOS_NOVA.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: combatant.hasTalent(UNLEASHED_POWER_TALENT.id) ? 40 : 60,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.DISRUPT.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 15,
        gcd: null,
      },
      {
        spell: SPELLS.CONSUME_MAGIC.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 10,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.TORMENT.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 8,
        gcd: null,
      },
      {
        spell: SPELLS.IMPRISON.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 45,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.SPECTRAL_SIGHT.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 30,
        gcd: {
          base: 1500,
        },
      },

      // DPS Cooldowns
      {
        spell: SPELLS.EYE_BEAM.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 30,
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.95,
          extraSuggestion: (
            <>
              The only times you should delay casting <SpellLink id={SPELLS.EYE_BEAM.id} /> is when
              you're expecting adds to spawn soon.
            </>
          ),
        },
      },
      {
        spell: FEL_BARRAGE_HAVOC_TALENT.id,
        enabled: combatant.hasTalent(FEL_BARRAGE_HAVOC_TALENT.id),
        category: SPELL_CATEGORY.COOLDOWNS,
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
        spell: GLAIVE_TEMPEST_HAVOC_TALENT.id,
        enabled: combatant.hasTalent(GLAIVE_TEMPEST_HAVOC_TALENT.id),
        category: SPELL_CATEGORY.COOLDOWNS,
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
              <SpellLink id={GLAIVE_TEMPEST_HAVOC_TALENT.id} /> is when you're expecting adds to
              spawn soon.
            </>
          ),
        },
      },
      //Covenant
      {
        spell: [SPELLS.ELYSIAN_DECREE.id, SPELLS.ELYSIAN_DECREE_REPEAT_DECREE.id],
        enabled: combatant.hasTalent(ELYSIAN_DECREE_HAVOC_TALENT),
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 60,
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
          extraSuggestion: (
            <>
              The only time you should delay casting{' '}
              <SpellLink id={ELYSIAN_DECREE_HAVOC_TALENT.id} /> is when you're expecting adds to
              spawn soon.
            </>
          ),
        },
      },
      {
        spell: SPELLS.THE_HUNT.id,
        enabled: combatant.hasTalent(THE_HUNT_TALENT),
        category: SPELL_CATEGORY.COOLDOWNS,
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
      // Big DPS Cooldowns
      {
        spell: SPELLS.METAMORPHOSIS_HAVOC.id,
        category: SPELL_CATEGORY.COOLDOWNS,
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
        category: SPELL_CATEGORY.DEFENSIVE,
        cooldown: 60,
      },
      {
        spell: SPELLS.DARKNESS.id,
        buffSpellId: SPELLS.DARKNESS.id,
        category: SPELL_CATEGORY.DEFENSIVE,
        cooldown: 180,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: NETHERWALK_HAVOC_TALENT.id,
        enabled: combatant.hasTalent(NETHERWALK_HAVOC_TALENT.id),
        category: SPELL_CATEGORY.DEFENSIVE,
        cooldown: 180,
        gcd: {
          base: 1500,
        },
      },
    ];
  }
}

export default Abilities;
