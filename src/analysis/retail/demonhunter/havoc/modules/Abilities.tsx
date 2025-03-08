import SPELLS from 'common/SPELLS/demonhunter';
import TALENTS from 'common/TALENTS/demonhunter';
import { SpellLink } from 'interface';
import SharedAbilities from 'analysis/retail/demonhunter/shared/modules/Abilities';
import { SpellbookAbility } from 'parser/core/modules/Ability';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';
import {
  CHAMPION_OF_THE_GLAIVE_SCALING,
  MASTER_OF_THE_GLAIVE_SCALING,
} from 'analysis/retail/demonhunter/shared';
import { getMetamorphosisCooldown } from 'analysis/retail/demonhunter/shared/modules/talents/MetamorphosisCooldown';
import { getFelRushCooldown } from 'analysis/retail/demonhunter/havoc/modules/spells/FelRush';

class Abilities extends SharedAbilities {
  spellbook(): SpellbookAbility[] {
    const combatant = this.selectedCombatant;
    return [
      //Rotation Spells
      {
        // IMMOLATION_AURA is the ID for cast and the buff. But damage is done from IMMOLATION_AURA_INITIAL_HIT_DAMAGE and IMMOLATION_AURA_BUFF_DAMAGE
        spell: [
          SPELLS.IMMOLATION_AURA.id,
          SPELLS.IMMOLATION_AURA_AFI_CAST.id,
          SPELLS.CONSUMING_FIRE_1.id,
        ],
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: (haste) => 30 / (1 + haste),
        charges: 1 + (combatant.hasTalent(TALENTS.A_FIRE_INSIDE_TALENT) ? 1 : 0),
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
          SPELLS.IMMOLATION_AURA_AFI_INITIAL_HIT_DAMAGE_1.id,
          SPELLS.IMMOLATION_AURA_AFI_INITIAL_HIT_DAMAGE_2.id,
          SPELLS.IMMOLATION_AURA_BUFF_DAMAGE.id,
          SPELLS.IMMOLATION_AURA_AFI_BUFF_DAMAGE_1.id,
          SPELLS.IMMOLATION_AURA_AFI_BUFF_DAMAGE_2.id,
        ],
      },
      {
        spell: SPELLS.DEMONS_BITE.id,
        enabled: !combatant.hasTalent(TALENTS.DEMON_BLADES_TALENT),
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: [SPELLS.CHAOS_STRIKE.id, SPELLS.ANNIHILATION.id],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: [SPELLS.BLADE_DANCE.id, SPELLS.DEATH_SWEEP.id],
        category: combatant.hasTalent(TALENTS.FIRST_BLOOD_TALENT)
          ? SPELL_CATEGORY.ROTATIONAL
          : SPELL_CATEGORY.ROTATIONAL_AOE,
        // Blade dance = 15s cd
        // Death Sweep = 9s cd
        cooldown: (haste) =>
          combatant.hasBuff(SPELLS.METAMORPHOSIS_HAVOC_BUFF.id)
            ? 9 / (1 + haste)
            : 15 / (1 + haste),
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.95,
        },
      },
      {
        spell: TALENTS.ESSENCE_BREAK_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.ESSENCE_BREAK_TALENT),
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
              <SpellLink spell={SPELLS.CHAOS_STRIKE} /> / <SpellLink spell={SPELLS.ANNIHILATION} />{' '}
              /
              <SpellLink spell={SPELLS.BLADE_DANCE} /> / <SpellLink spell={SPELLS.DEATH_SWEEP} />{' '}
              during its buff window.
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
            combatant.getTalentRank(TALENTS.MASTER_OF_THE_GLAIVE_TALENT)
          ] +
          CHAMPION_OF_THE_GLAIVE_SCALING[
            combatant.getTalentRank(TALENTS.CHAMPION_OF_THE_GLAIVE_TALENT)
          ],
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: combatant.hasTalent(TALENTS.SOULSCAR_TALENT),
          recommendedEfficiency: 0.95,
        },
      },

      // Movement
      {
        spell: SPELLS.FEL_RUSH_CAST.id,
        category: SPELL_CATEGORY.UTILITY,
        charges: 1 + (combatant.hasTalent(TALENTS.BLAZING_PATH_TALENT) ? 1 : 0),
        cooldown: getFelRushCooldown(combatant),
        gcd: {
          static: 500,
        },
      },
      {
        spell: TALENTS.VENGEFUL_RETREAT_TALENT.id, // Becomes a rotational ability with the Momentum talent
        category: combatant.hasTalent(TALENTS.EXERGY_TALENT)
          ? SPELL_CATEGORY.ROTATIONAL
          : SPELL_CATEGORY.UTILITY,
        cooldown: combatant.hasTalent(TALENTS.TACTICAL_RETREAT_TALENT) ? 20 : 25,
        // Not actually on the GCD but blocks all spells during its animation for 1 second. The issue is you can follow up any ability on the GCD with Vengeful Retreat, so it can still cause overlap.
        gcd: null,
        castEfficiency: {
          suggestion: combatant.hasTalent(TALENTS.TACTICAL_RETREAT_TALENT),
          recommendedEfficiency: 0.95,
          extraSuggestion: (
            <>
              Use it to generate Fury due to the{' '}
              <SpellLink spell={TALENTS.TACTICAL_RETREAT_TALENT} /> talent.
            </>
          ),
        },
      },

      // CC, interupts, and utility
      {
        spell: SPELLS.FEL_ERUPTION.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 30,
        gcd: {
          base: 1500,
        },
      },

      // DPS Cooldowns
      {
        spell: [TALENTS.EYE_BEAM_TALENT.id, SPELLS.ABYSSAL_GAZE.id],
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
              The only times you should delay casting <SpellLink spell={TALENTS.EYE_BEAM_TALENT} />{' '}
              is when you're expecting adds to spawn soon.
            </>
          ),
        },
      },
      {
        spell: TALENTS.FEL_BARRAGE_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.FEL_BARRAGE_TALENT),
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 90,
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
        spell: TALENTS.GLAIVE_TEMPEST_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.GLAIVE_TEMPEST_TALENT),
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: (haste) => 25 / (1 + haste),
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.95,
          extraSuggestion: (
            <>
              The only time you should delay casting{' '}
              <SpellLink spell={TALENTS.GLAIVE_TEMPEST_TALENT} /> is when you're expecting adds to
              spawn soon.
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
          recommendedEfficiency: 0.8, // 3 minute cd. You want some leeway in when to burn it.
        },
      },

      // Defensives
      {
        spell: SPELLS.BLUR.id,
        category: SPELL_CATEGORY.DEFENSIVE,
        cooldown: 60,
      },
      {
        spell: TALENTS.NETHERWALK_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.NETHERWALK_TALENT),
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
