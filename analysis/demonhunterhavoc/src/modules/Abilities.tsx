import DH_SPELLS from 'common/SPELLS/demonhunter';
import DH_CONDUITS from 'common/SPELLS/shadowlands/conduits/demonhunter';
import DH_COVENANTS from 'common/SPELLS/shadowlands/covenants/demonhunter';
import GENERAL_COVENANTS from 'common/SPELLS/shadowlands/covenants/general';
import DH_LEGENDARIES from 'common/SPELLS/shadowlands/legendaries/demonhunter';
import DH_TALENTS from 'common/SPELLS/talents/demonhunter';
import COVENANTS from 'game/shadowlands/COVENANTS';
import { SpellLink } from 'interface';
import CoreAbilities from 'parser/core/modules/Abilities';
import { SpellbookAbility } from 'parser/core/modules/Ability';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';

import {
  FEL_DEFENDER_COOLDOWN_REDUCTION,
  INCREASED_SCRUTINY_SCALING,
} from '@wowanalyzer/demonhunter';

class Abilities extends CoreAbilities {
  spellbook(): SpellbookAbility[] {
    const combatant = this.selectedCombatant;
    return [
      //Rotation Spells
      {
        spell: DH_SPELLS.DEMONS_BITE.id,
        enabled: !combatant.hasTalent(DH_TALENTS.DEMON_BLADES_TALENT.id),
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: DH_SPELLS.CHAOS_STRIKE.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: DH_SPELLS.ANNIHILATION.id, //During meta chaos strike becomes this.
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: [DH_SPELLS.BLADE_DANCE.id, DH_SPELLS.DEATH_SWEEP.id],
        category: combatant.hasTalent(DH_TALENTS.FIRST_BLOOD_TALENT.id)
          ? SPELL_CATEGORY.ROTATIONAL
          : SPELL_CATEGORY.ROTATIONAL_AOE,
        cooldown: (haste) =>
          combatant.hasBuff(DH_SPELLS.METAMORPHOSIS_HAVOC_BUFF.id)
            ? 9 / (1 + haste)
            : 15 / (1 + haste),
        //Blade dance = 15s cd
        //Death Sweep = 9s cd
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion:
            combatant.hasTalent(DH_TALENTS.FIRST_BLOOD_TALENT.id) ||
            combatant.hasTalent(DH_TALENTS.TRAIL_OF_RUIN_TALENT.id),
          recommendedEfficiency: 0.95,
          extraSuggestion: (
            <>
              This should be part of your single target rotation due to using{' '}
              <SpellLink id={DH_TALENTS.FIRST_BLOOD_TALENT.id} /> or{' '}
              <SpellLink id={DH_TALENTS.TRAIL_OF_RUIN_TALENT.id} />. This includes the{' '}
              <SpellLink id={DH_SPELLS.DEATH_SWEEP.id} /> casts since they are the same ability and
              share their cooldowns.
            </>
          ),
        },
      },
      {
        spell: DH_TALENTS.FELBLADE_TALENT.id,
        enabled: combatant.hasTalent(DH_TALENTS.FELBLADE_TALENT.id),
        category: SPELL_CATEGORY.ROTATIONAL,
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
        spell: DH_SPELLS.IMMOLATION_AURA.id,
        // IMMOLATION_AURA is the ID for cast and the buff. But damage is done from IMMOLATION_AURA_INITIAL_HIT_DAMAGE and IMMOLATION_AURA_BUFF_DAMAGE
        buffSpellId: DH_SPELLS.IMMOLATION_AURA.id,
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
        spell: DH_TALENTS.ESSENCE_BREAK_TALENT.id,
        enabled: combatant.hasTalent(DH_TALENTS.ESSENCE_BREAK_TALENT.id),
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
              <SpellLink id={DH_SPELLS.CHAOS_STRIKE.id} /> /{' '}
              <SpellLink id={DH_SPELLS.ANNIHILATION.id} /> during its buff window.
            </>
          ),
        },
      },
      {
        spell: DH_SPELLS.THROW_GLAIVE_HAVOC.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: (haste) => 9 / (1 + haste),
        gcd: {
          base: 1500,
        },
      },

      //Movement
      {
        spell: DH_SPELLS.FEL_RUSH_CAST.id, //Becomes a rotational ability with the Momentum talent
        category: combatant.hasTalent(DH_TALENTS.MOMENTUM_TALENT.id)
          ? SPELL_CATEGORY.ROTATIONAL
          : SPELL_CATEGORY.UTILITY,
        charges: 2,
        cooldown: 10,
        gcd: {
          static: 250,
        },
        castEfficiency: {
          suggestion: combatant.hasTalent(DH_TALENTS.MOMENTUM_TALENT.id),
          recommendedEfficiency: 0.95,
          extraSuggestion: (
            <>
              Use it to keep your <SpellLink id={DH_TALENTS.MOMENTUM_TALENT.id} /> buff going.
            </>
          ),
        },
      },
      {
        spell: DH_SPELLS.VENGEFUL_RETREAT.id, //Becomes a rotational ability with the Momentum talent
        category: combatant.hasTalent(DH_TALENTS.MOMENTUM_TALENT.id)
          ? SPELL_CATEGORY.ROTATIONAL
          : SPELL_CATEGORY.UTILITY,
        cooldown: combatant.hasTalent(DH_TALENTS.MOMENTUM_TALENT.id) ? 20 : 25,
        // Not actually on the GCD but blocks all spells during its animation for 1 second. The issue is you can follow up any ability on the GCD with Vengeful Retreat, so it can still cause overlap.
        gcd: null,
        castEfficiency: {
          suggestion: combatant.hasTalent(DH_TALENTS.MOMENTUM_TALENT.id),
          recommendedEfficiency: 0.95,
          extraSuggestion: (
            <>
              Use it to generate Fury due to the <SpellLink id={DH_TALENTS.MOMENTUM_TALENT.id} />{' '}
              talent.
            </>
          ),
        },
      },
      {
        spell: DH_SPELLS.GLIDE.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 1.5,
        gcd: null,
      },

      // CC, interupts, and utility
      {
        spell: DH_TALENTS.FEL_ERUPTION_TALENT.id,
        enabled: combatant.hasTalent(DH_TALENTS.FEL_ERUPTION_TALENT.id),
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 30,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: DH_SPELLS.CHAOS_NOVA.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: combatant.hasTalent(DH_TALENTS.UNLEASHED_POWER_TALENT.id) ? 40 : 60,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: DH_SPELLS.DISRUPT.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 15,
        gcd: null,
      },
      {
        spell: DH_SPELLS.CONSUME_MAGIC.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 10,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: DH_SPELLS.TORMENT.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 8,
        gcd: null,
      },
      {
        spell: DH_SPELLS.IMPRISON.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 45,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: DH_SPELLS.SPECTRAL_SIGHT.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 30,
        gcd: {
          base: 1500,
        },
      },

      // DPS Cooldowns
      {
        spell: DH_SPELLS.EYE_BEAM.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 30,
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: combatant.hasCovenant(COVENANTS.VENTHYR.id),
          recommendedEfficiency: 0.95,
          extraSuggestion: (
            <>
              The only times you should delay casting <SpellLink id={DH_SPELLS.EYE_BEAM.id} /> is
              when you're expecting adds to spawn soon or your{' '}
              <SpellLink id={DH_COVENANTS.SINFUL_BRAND.id} /> is about to fall off.
            </>
          ),
        },
      },
      {
        spell: DH_TALENTS.FEL_BARRAGE_TALENT.id,
        enabled: combatant.hasTalent(DH_TALENTS.FEL_BARRAGE_TALENT.id),
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
        spell: DH_TALENTS.GLAIVE_TEMPEST_TALENT.id,
        enabled: combatant.hasTalent(DH_TALENTS.GLAIVE_TEMPEST_TALENT.id),
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
              <SpellLink id={DH_TALENTS.GLAIVE_TEMPEST_TALENT.id} /> is when you're expecting adds
              to spawn soon.
            </>
          ),
        },
      },
      //Covenant
      {
        spell: DH_COVENANTS.SINFUL_BRAND.id,
        enabled: combatant.hasCovenant(COVENANTS.VENTHYR.id),
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: combatant.hasConduitBySpellID(DH_CONDUITS.INCREASED_SCRUTINY.id)
          ? 45 -
            INCREASED_SCRUTINY_SCALING[
              combatant.conduitRankBySpellID(DH_CONDUITS.INCREASED_SCRUTINY.id)
            ]
          : 45,
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          // You should only cast Sinful Brand if your primary target does
          // not already have it applied if you're using the legendary,
          // as otherwise it overwrites it.
          suggestion: !combatant.hasLegendary(DH_LEGENDARIES.AGONY_GAZE),
          recommendedEfficiency: 0.95,
          extraSuggestion: `This should be part of your single target rotation.`,
        },
      },
      {
        spell: [DH_COVENANTS.ELYSIAN_DECREE.id, DH_COVENANTS.ELYSIAN_DECREE_REPEAT_DECREE.id],
        enabled: combatant.hasCovenant(COVENANTS.KYRIAN.id),
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
              <SpellLink id={DH_COVENANTS.ELYSIAN_DECREE.id} /> is when you're expecting adds to
              spawn soon.
            </>
          ),
        },
      },
      {
        spell: DH_COVENANTS.THE_HUNT.id,
        enabled: combatant.hasCovenant(COVENANTS.NIGHT_FAE.id),
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
              The only time you should delay casting <SpellLink id={DH_COVENANTS.THE_HUNT.id} /> is
              when you're expecting adds to spawn soon or for an upcoming haste buff.
            </>
          ),
        },
      },
      {
        spell: GENERAL_COVENANTS.DOOR_OF_SHADOWS.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 60,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasCovenant(COVENANTS.VENTHYR.id),
      },
      {
        spell: GENERAL_COVENANTS.FLESHCRAFT.id,
        category: SPELL_CATEGORY.DEFENSIVE,
        cooldown: 120,
        enabled: combatant.hasCovenant(COVENANTS.NECROLORD.id),
      },
      {
        spell: GENERAL_COVENANTS.SOULSHAPE.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 30,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasCovenant(COVENANTS.NIGHT_FAE.id),
      },
      // Big DPS Cooldowns
      {
        spell: DH_SPELLS.METAMORPHOSIS_HAVOC.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        buffSpellId: DH_SPELLS.METAMORPHOSIS_HAVOC_BUFF.id,
        cooldown: 300,
        gcd: null, // Logs track the "landing" spell which is not on GCD
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.8, //5 minute cd. You want some leeway in when to burn it.
        },
      },

      // Defensives
      {
        spell: DH_SPELLS.BLUR.id,
        buffSpellId: DH_SPELLS.BLUR.id,
        category: SPELL_CATEGORY.DEFENSIVE,
        cooldown: combatant.hasConduitBySpellID(DH_CONDUITS.FEL_DEFENDER.id)
          ? 60 -
            FEL_DEFENDER_COOLDOWN_REDUCTION[
              combatant.conduitRankBySpellID(DH_CONDUITS.FEL_DEFENDER.id)
            ]
          : 60,
      },
      {
        spell: DH_SPELLS.DARKNESS.id,
        buffSpellId: DH_SPELLS.DARKNESS.id,
        category: SPELL_CATEGORY.DEFENSIVE,
        cooldown: 180,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: DH_TALENTS.NETHERWALK_TALENT.id,
        enabled: combatant.hasTalent(DH_TALENTS.NETHERWALK_TALENT.id),
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
