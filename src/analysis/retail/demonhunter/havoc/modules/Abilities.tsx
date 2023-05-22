import SPELLS from 'common/SPELLS/demonhunter';
import { TALENTS_DEMON_HUNTER } from 'common/TALENTS/demonhunter';
import { SpellLink } from 'interface';
import SharedAbilities from 'analysis/retail/demonhunter/shared/modules/Abilities';
import { SpellbookAbility } from 'parser/core/modules/Ability';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';
import { MASTER_OF_THE_GLAIVE_SCALING } from 'analysis/retail/demonhunter/shared';
import { getMetamorphosisCooldown } from 'analysis/retail/demonhunter/shared/modules/talents/MetamorphosisCooldown';
import { getFelRushCooldown } from 'analysis/retail/demonhunter/havoc/modules/spells/FelRush';

class Abilities extends SharedAbilities {
  spellbook(): SpellbookAbility[] {
    const combatant = this.selectedCombatant;
    return [
      //Rotation Spells
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
        damageSpellIds: [
          SPELLS.IMMOLATION_AURA_INITIAL_HIT_DAMAGE.id,
          SPELLS.IMMOLATION_AURA_BUFF_DAMAGE.id,
        ],
      },
      {
        spell: SPELLS.DEMONS_BITE.id,
        enabled: !combatant.hasTalent(TALENTS_DEMON_HUNTER.DEMON_BLADES_TALENT),
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
        category: combatant.hasTalent(TALENTS_DEMON_HUNTER.FIRST_BLOOD_TALENT)
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
            combatant.hasTalent(TALENTS_DEMON_HUNTER.FIRST_BLOOD_TALENT) ||
            combatant.hasTalent(TALENTS_DEMON_HUNTER.TRAIL_OF_RUIN_TALENT),
          recommendedEfficiency: 0.95,
          extraSuggestion: (
            <>
              This should be part of your single target rotation due to using{' '}
              <SpellLink spell={TALENTS_DEMON_HUNTER.FIRST_BLOOD_TALENT.id} /> or{' '}
              <SpellLink spell={TALENTS_DEMON_HUNTER.TRAIL_OF_RUIN_TALENT.id} />. This includes the{' '}
              <SpellLink spell={SPELLS.DEATH_SWEEP.id} /> casts since they are the same ability and
              share their cooldowns.
            </>
          ),
        },
      },
      {
        spell: TALENTS_DEMON_HUNTER.ESSENCE_BREAK_TALENT.id,
        enabled: combatant.hasTalent(TALENTS_DEMON_HUNTER.ESSENCE_BREAK_TALENT),
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 40,
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.95,
          extraSuggestion: (
            <>
              Pool your Fury before hand to maximizing casting{' '}
              <SpellLink spell={SPELLS.CHAOS_STRIKE.id} /> /{' '}
              <SpellLink spell={SPELLS.ANNIHILATION.id} /> /
              <SpellLink spell={SPELLS.BLADE_DANCE.id} /> /{' '}
              <SpellLink spell={SPELLS.DEATH_SWEEP.id} /> during its buff window.
            </>
          ),
        },
      },
      {
        spell: SPELLS.THROW_GLAIVE_HAVOC.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: (haste) => 9 / (1 + haste),
        charges:
          1 +
          MASTER_OF_THE_GLAIVE_SCALING[
            combatant.getTalentRank(TALENTS_DEMON_HUNTER.MASTER_OF_THE_GLAIVE_TALENT)
          ],
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: combatant.hasTalent(TALENTS_DEMON_HUNTER.SOULREND_TALENT),
          recommendedEfficiency: 0.95,
        },
      },

      // Movement
      {
        spell: SPELLS.FEL_RUSH_CAST.id, //Becomes a rotational ability with the Momentum talent
        category: combatant.hasTalent(TALENTS_DEMON_HUNTER.MOMENTUM_TALENT)
          ? SPELL_CATEGORY.ROTATIONAL
          : SPELL_CATEGORY.UTILITY,
        charges: 1 + (combatant.hasTalent(TALENTS_DEMON_HUNTER.BLAZING_PATH_TALENT) ? 1 : 0),
        cooldown: getFelRushCooldown(combatant),
        gcd: {
          static: 250,
        },
        castEfficiency: {
          suggestion: combatant.hasTalent(TALENTS_DEMON_HUNTER.MOMENTUM_TALENT),
          recommendedEfficiency: 0.95,
          extraSuggestion: (
            <>
              Use it to keep your <SpellLink spell={TALENTS_DEMON_HUNTER.MOMENTUM_TALENT.id} /> buff
              going.
            </>
          ),
        },
      },
      {
        spell: TALENTS_DEMON_HUNTER.VENGEFUL_RETREAT_TALENT.id, // Becomes a rotational ability with the Momentum talent
        category: combatant.hasTalent(TALENTS_DEMON_HUNTER.MOMENTUM_TALENT)
          ? SPELL_CATEGORY.ROTATIONAL
          : SPELL_CATEGORY.UTILITY,
        cooldown: combatant.hasTalent(TALENTS_DEMON_HUNTER.TACTICAL_RETREAT_TALENT) ? 20 : 25,
        // Not actually on the GCD but blocks all spells during its animation for 1 second. The issue is you can follow up any ability on the GCD with Vengeful Retreat, so it can still cause overlap.
        gcd: null,
        castEfficiency: {
          suggestion: combatant.hasTalent(TALENTS_DEMON_HUNTER.TACTICAL_RETREAT_TALENT),
          recommendedEfficiency: 0.95,
          extraSuggestion: (
            <>
              Use it to generate Fury due to the{' '}
              <SpellLink spell={TALENTS_DEMON_HUNTER.TACTICAL_RETREAT_TALENT.id} /> talent.
            </>
          ),
        },
      },

      // CC, interupts, and utility
      {
        spell: TALENTS_DEMON_HUNTER.FEL_ERUPTION_TALENT.id,
        enabled: combatant.hasTalent(TALENTS_DEMON_HUNTER.FEL_ERUPTION_TALENT),
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 30,
        gcd: {
          base: 1500,
        },
      },

      // DPS Cooldowns
      {
        spell: TALENTS_DEMON_HUNTER.EYE_BEAM_TALENT.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 40,
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.95,
          extraSuggestion: (
            <>
              The only times you should delay casting{' '}
              <SpellLink spell={TALENTS_DEMON_HUNTER.EYE_BEAM_TALENT.id} /> is when you're expecting
              adds to spawn soon.
            </>
          ),
        },
      },
      {
        spell: TALENTS_DEMON_HUNTER.FEL_BARRAGE_TALENT.id,
        enabled: combatant.hasTalent(TALENTS_DEMON_HUNTER.FEL_BARRAGE_TALENT),
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
        spell: TALENTS_DEMON_HUNTER.GLAIVE_TEMPEST_TALENT.id,
        enabled: combatant.hasTalent(TALENTS_DEMON_HUNTER.GLAIVE_TEMPEST_TALENT),
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
              <SpellLink spell={TALENTS_DEMON_HUNTER.GLAIVE_TEMPEST_TALENT.id} /> is when you're
              expecting adds to spawn soon.
            </>
          ),
        },
      },

      // Big DPS Cooldowns
      {
        spell: SPELLS.METAMORPHOSIS_HAVOC.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: getMetamorphosisCooldown(combatant),
        gcd: null, // Logs track the "landing" spell which is not on GCD
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.8, //5 minute cd. You want some leeway in when to burn it.
        },
      },

      // Defensives
      {
        spell: SPELLS.BLUR.id,
        category: SPELL_CATEGORY.DEFENSIVE,
        cooldown: 60,
      },
      {
        spell: TALENTS_DEMON_HUNTER.NETHERWALK_TALENT.id,
        enabled: combatant.hasTalent(TALENTS_DEMON_HUNTER.NETHERWALK_TALENT),
        category: SPELL_CATEGORY.DEFENSIVE,
        cooldown: 180,
        gcd: {
          base: 1500,
        },
      },

      ...super.spellbook(),
    ];
  }
}

export default Abilities;
