import SPELLS from 'common/SPELLS/demonhunter';
import { TALENTS_DEMON_HUNTER } from 'common/TALENTS/demonhunter';
import { SpellLink } from 'interface';
import CoreAbilities from 'parser/core/modules/Abilities';
import { SpellbookAbility } from 'parser/core/modules/Ability';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';
import { PITCH_BLACK_SCALING } from 'analysis/retail/demonhunter/shared';

class Abilities extends CoreAbilities {
  spellbook(): SpellbookAbility[] {
    const combatant = this.selectedCombatant;
    return [
      //Rotation Spells
      {
        spell: SPELLS.DEMONS_BITE.id,
        enabled: !combatant.hasTalent(TALENTS_DEMON_HUNTER.DEMON_BLADES_HAVOC_TALENT.id),
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
        category: combatant.hasTalent(TALENTS_DEMON_HUNTER.FIRST_BLOOD_HAVOC_TALENT.id)
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
            combatant.hasTalent(TALENTS_DEMON_HUNTER.FIRST_BLOOD_HAVOC_TALENT.id) ||
            combatant.hasTalent(TALENTS_DEMON_HUNTER.TRAIL_OF_RUIN_HAVOC_TALENT.id),
          recommendedEfficiency: 0.95,
          extraSuggestion: (
            <>
              This should be part of your single target rotation due to using{' '}
              <SpellLink id={TALENTS_DEMON_HUNTER.FIRST_BLOOD_HAVOC_TALENT.id} /> or{' '}
              <SpellLink id={TALENTS_DEMON_HUNTER.TRAIL_OF_RUIN_HAVOC_TALENT.id} />. This includes
              the <SpellLink id={SPELLS.DEATH_SWEEP.id} /> casts since they are the same ability and
              share their cooldowns.
            </>
          ),
        },
      },
      {
        spell: TALENTS_DEMON_HUNTER.FELBLADE_TALENT.id,
        enabled: combatant.hasTalent(TALENTS_DEMON_HUNTER.FELBLADE_TALENT.id),
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
        // IMMOLATION_AURA is the ID for cast and the buff. But damage is done from IMMOLATION_AURA_INITIAL_HIT_DAMAGE and IMMOLATION_AURA_BUFF_DAMAGE
        spell: SPELLS.IMMOLATION_AURA.id,
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
        spell: TALENTS_DEMON_HUNTER.ESSENCE_BREAK_HAVOC_TALENT.id,
        enabled: combatant.hasTalent(TALENTS_DEMON_HUNTER.ESSENCE_BREAK_HAVOC_TALENT.id),
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
        category: combatant.hasTalent(TALENTS_DEMON_HUNTER.MOMENTUM_HAVOC_TALENT.id)
          ? SPELL_CATEGORY.ROTATIONAL
          : SPELL_CATEGORY.UTILITY,
        charges: 1 + (combatant.hasTalent(TALENTS_DEMON_HUNTER.HOT_FEET_TALENT.id) ? 1 : 0),
        cooldown: 10,
        gcd: {
          static: 250,
        },
        castEfficiency: {
          suggestion: combatant.hasTalent(TALENTS_DEMON_HUNTER.MOMENTUM_HAVOC_TALENT.id),
          recommendedEfficiency: 0.95,
          extraSuggestion: (
            <>
              Use it to keep your <SpellLink id={TALENTS_DEMON_HUNTER.MOMENTUM_HAVOC_TALENT.id} />{' '}
              buff going.
            </>
          ),
        },
      },
      {
        spell: TALENTS_DEMON_HUNTER.VENGEFUL_RETREAT_TALENT.id, // Becomes a rotational ability with the Momentum talent
        category: combatant.hasTalent(TALENTS_DEMON_HUNTER.MOMENTUM_HAVOC_TALENT.id)
          ? SPELL_CATEGORY.ROTATIONAL
          : SPELL_CATEGORY.UTILITY,
        cooldown: combatant.hasTalent(TALENTS_DEMON_HUNTER.TACTICAL_RETREAT_HAVOC_TALENT.id)
          ? 20
          : 25,
        // Not actually on the GCD but blocks all spells during its animation for 1 second. The issue is you can follow up any ability on the GCD with Vengeful Retreat, so it can still cause overlap.
        gcd: null,
        castEfficiency: {
          suggestion: combatant.hasTalent(TALENTS_DEMON_HUNTER.TACTICAL_RETREAT_HAVOC_TALENT.id),
          recommendedEfficiency: 0.95,
          extraSuggestion: (
            <>
              Use it to generate Fury due to the{' '}
              <SpellLink id={TALENTS_DEMON_HUNTER.TACTICAL_RETREAT_HAVOC_TALENT.id} /> talent.
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

      // Sigils
      {
        spell: [
          SPELLS.SIGIL_OF_SILENCE_CONCENTRATED.id,
          TALENTS_DEMON_HUNTER.SIGIL_OF_SILENCE_TALENT.id,
          SPELLS.SIGIL_OF_SILENCE_PRECISE.id,
        ],
        category: SPELL_CATEGORY.UTILITY,
        cooldown:
          60 *
          (1 - (combatant.hasTalent(TALENTS_DEMON_HUNTER.QUICKENED_SIGILS_TALENT.id) ? 0.2 : 0)),
        gcd: {
          base: 1500,
        },
      },
      {
        spell: [
          SPELLS.SIGIL_OF_MISERY_CONCENTRATED.id,
          TALENTS_DEMON_HUNTER.SIGIL_OF_MISERY_TALENT.id,
          SPELLS.SIGIL_OF_MISERY_PRECISE.id,
        ],
        category: SPELL_CATEGORY.UTILITY,
        cooldown:
          60 *
          (1 - (combatant.hasTalent(TALENTS_DEMON_HUNTER.QUICKENED_SIGILS_TALENT.id) ? 0.2 : 0)),
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: combatant.hasTalent(TALENTS_DEMON_HUNTER.MISERY_IN_DEFEAT_TALENT.id),
          recommendedEfficiency: 0.9,
          extraSuggestion: `Cast on cooldown for a dps increase.`,
        },
      },
      {
        spell: [
          SPELLS.SIGIL_OF_FLAME_CONCENTRATED.id,
          TALENTS_DEMON_HUNTER.SIGIL_OF_FLAME_TALENT.id,
          SPELLS.SIGIL_OF_FLAME_PRECISE.id,
        ],
        category: SPELL_CATEGORY.ROTATIONAL_AOE,
        cooldown:
          30 *
          (1 - (combatant.hasTalent(TALENTS_DEMON_HUNTER.QUICKENED_SIGILS_TALENT.id) ? 0.2 : 0)),
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
          extraSuggestion: `Cast on cooldown for a dps increase.`,
        },
      },

      // CC, interupts, and utility
      {
        spell: TALENTS_DEMON_HUNTER.FEL_ERUPTION_HAVOC_TALENT.id,
        enabled: combatant.hasTalent(TALENTS_DEMON_HUNTER.FEL_ERUPTION_HAVOC_TALENT.id),
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 30,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: TALENTS_DEMON_HUNTER.CHAOS_NOVA_TALENT.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: combatant.hasTalent(TALENTS_DEMON_HUNTER.UNLEASHED_POWER_TALENT.id) ? 40 : 60,
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
        spell: TALENTS_DEMON_HUNTER.IMPRISON_TALENT.id,
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
        spell: TALENTS_DEMON_HUNTER.EYE_BEAM_HAVOC_TALENT.id,
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
              The only times you should delay casting{' '}
              <SpellLink id={TALENTS_DEMON_HUNTER.EYE_BEAM_HAVOC_TALENT.id} /> is when you're
              expecting adds to spawn soon.
            </>
          ),
        },
      },
      {
        spell: TALENTS_DEMON_HUNTER.FEL_BARRAGE_HAVOC_TALENT.id,
        enabled: combatant.hasTalent(TALENTS_DEMON_HUNTER.FEL_BARRAGE_HAVOC_TALENT.id),
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
        spell: TALENTS_DEMON_HUNTER.GLAIVE_TEMPEST_HAVOC_TALENT.id,
        enabled: combatant.hasTalent(TALENTS_DEMON_HUNTER.GLAIVE_TEMPEST_HAVOC_TALENT.id),
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
              <SpellLink id={TALENTS_DEMON_HUNTER.GLAIVE_TEMPEST_HAVOC_TALENT.id} /> is when you're
              expecting adds to spawn soon.
            </>
          ),
        },
      },
      //Covenant
      {
        spell: SPELLS.ELYSIAN_DECREE.id,
        enabled: combatant.hasTalent(TALENTS_DEMON_HUNTER.ELYSIAN_DECREE_HAVOC_TALENT.id),
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
              <SpellLink id={TALENTS_DEMON_HUNTER.ELYSIAN_DECREE_HAVOC_TALENT.id} /> is when you're
              expecting adds to spawn soon.
            </>
          ),
        },
      },
      {
        spell: SPELLS.THE_HUNT.id,
        enabled: combatant.hasTalent(TALENTS_DEMON_HUNTER.THE_HUNT_TALENT.id),
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
        cooldown: 300,
        gcd: null, // Logs track the "landing" spell which is not on GCD
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.8, //5 minute cd. You want some leeway in when to burn it.
        },
      },

      // Defensives
      {
        spell: TALENTS_DEMON_HUNTER.BLUR_TALENT.id,
        enabled: combatant.hasTalent(TALENTS_DEMON_HUNTER.BLUR_TALENT.id),
        category: SPELL_CATEGORY.DEFENSIVE,
        cooldown: 60,
      },
      {
        spell: TALENTS_DEMON_HUNTER.DARKNESS_TALENT.id,
        enabled: combatant.hasTalent(TALENTS_DEMON_HUNTER.BLUR_TALENT.id),
        category: SPELL_CATEGORY.DEFENSIVE,
        cooldown:
          300 -
          PITCH_BLACK_SCALING[combatant.getTalentRank(TALENTS_DEMON_HUNTER.PITCH_BLACK_TALENT.id)],
        gcd: {
          base: 1500,
        },
      },
      {
        spell: TALENTS_DEMON_HUNTER.NETHERWALK_HAVOC_TALENT.id,
        enabled: combatant.hasTalent(TALENTS_DEMON_HUNTER.NETHERWALK_HAVOC_TALENT.id),
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
