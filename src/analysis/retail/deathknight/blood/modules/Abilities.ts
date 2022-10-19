import { t } from '@lingui/macro';
import SPELLS from 'common/SPELLS';
import talents from 'common/TALENTS/deathknight';
import COVENANTS from 'game/shadowlands/COVENANTS';
import ISSUE_IMPORTANCE from 'parser/core/ISSUE_IMPORTANCE';
import CoreAbilities from 'parser/core/modules/Abilities';
import { SpellbookAbility } from 'parser/core/modules/Ability';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';

class Abilities extends CoreAbilities {
  spellbook(): SpellbookAbility[] {
    const combatant = this.selectedCombatant;
    return [
      {
        spell: talents.ICEBOUND_FORTITUDE_TALENT.id,
        buffSpellId: talents.ICEBOUND_FORTITUDE_TALENT.id,
        category: SPELL_CATEGORY.DEFENSIVE,
        cooldown: 180,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.5,
          extraSuggestion: t({
            id: 'deathknight.blood.abilities.extraSuggestion.defensiveCd',
            message:
              'Defensive CDs like this are meant to be used smartly. Use it to smooth regular damage intake or to take the edge of big attacks.',
          }),
          importance: ISSUE_IMPORTANCE.MINOR,
        },
        timelineSortIndex: 10,
      },
      {
        spell: SPELLS.VAMPIRIC_BLOOD.id,
        buffSpellId: SPELLS.VAMPIRIC_BLOOD.id,
        category: SPELL_CATEGORY.DEFENSIVE,
        cooldown: 90,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.5,
          extraSuggestion: t({
            id: 'deathknight.blood.abilities.extraSuggestion.defensiveCd',
            message:
              'Defensive CDs like this are meant to be used smartly. Use it to smooth regular damage intake or to take the edge of big attacks.',
          }),
          importance: ISSUE_IMPORTANCE.MINOR,
        },
        timelineSortIndex: 10,
      },
      {
        spell: SPELLS.BLOOD_BOIL.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: (haste) => 7.5 / (1 + haste),
        gcd: {
          base: 1500,
        },
        charges: 2,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.85,
          extraSuggestion: t({
            id: 'deathknight.blood.abilities.extraSuggestion.bloodBoil',
            message: 'Should be casting it so you have at least one recharging.',
          }),
        },
        timelineSortIndex: 4,
      },
      {
        spell: SPELLS.CONSUMPTION_TALENT.id,
        category: SPELL_CATEGORY.SEMI_DEFENSIVE,
        enabled: combatant.hasTalent(SPELLS.CONSUMPTION_TALENT.id),
        cooldown: 45,
        gcd: {
          base: 1500,
        },
        timelineSortIndex: 5,
      },
      {
        spell: SPELLS.DANCING_RUNE_WEAPON.id,
        category: SPELL_CATEGORY.SEMI_DEFENSIVE,
        buffSpellId: SPELLS.DANCING_RUNE_WEAPON_BUFF.id,
        gcd: {
          base: 1500,
        },
        cooldown: 120,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
          extraSuggestion: t({
            id: 'deathknight.blood.abilities.extraSuggestion.dancingRuneWeapon',
            message: 'Should be used as an opener and used on CD for the dps boost.',
          }),
        },
        timelineSortIndex: 9,
      },
      {
        spell: SPELLS.BLOODDRINKER_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: 30,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(SPELLS.BLOODDRINKER_TALENT.id),
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
          extraSuggestion: t({
            id: 'deathknight.blood.abilities.extraSuggestion.blooddrinker',
            message: `Mostly used as a dps CD. Should be almost casted on CD. Good to use when you're running to the boss or can't melee them.`,
          }),
        },
        timelineSortIndex: 6,
      },
      {
        spell: talents.DEATH_STRIKE_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1500,
        },
        timelineSortIndex: 1,
      },
      {
        spell: SPELLS.DEATHS_CARESS.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1500,
        },
        timelineSortIndex: 7,
      },
      {
        spell: SPELLS.DEATH_AND_DECAY.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1500,
        },
        enabled:
          !combatant.hasCovenant(COVENANTS.NIGHT_FAE.id) &&
          combatant.hasTalent(SPELLS.RAPID_DECOMPOSITION_TALENT.id),
        cooldown: 15,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.8, //reduced because of proc resets
        },
        timelineSortIndex: 5,
      },
      //do not use cast efficiency for DnD without Rapid Decomposition.
      {
        spell: SPELLS.DEATH_AND_DECAY.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1500,
        },
        enabled:
          !combatant.hasCovenant(COVENANTS.NIGHT_FAE.id) &&
          !combatant.hasTalent(SPELLS.RAPID_DECOMPOSITION_TALENT.id),
        cooldown: 15,
        timelineSortIndex: 5,
      },
      {
        spell: SPELLS.HEART_STRIKE.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1500,
        },
        timelineSortIndex: 3,
      },
      {
        spell: SPELLS.MARROWREND.id,
        buffSpellId: SPELLS.BONE_SHIELD.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1500,
        },
        timelineSortIndex: 2,
      },
      {
        spell: talents.ANTI_MAGIC_SHELL_TALENT.id,
        buffSpellId: talents.ANTI_MAGIC_SHELL_TALENT.id,
        category: SPELL_CATEGORY.DEFENSIVE,
        cooldown: combatant.hasTalent(SPELLS.ANTI_MAGIC_BARRIER_TALENT.id) ? 60 - 15 : 60,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.5,
          extraSuggestion: t({
            id: 'deathknight.blood.abilities.extraSuggestion.defensiveCd',
            message:
              'Defensive CDs like this are meant to be used smartly. Use it to smooth regular damage intake or to take the edge of big attacks.',
          }),
          importance: ISSUE_IMPORTANCE.MINOR,
        },
        timelineSortIndex: 10,
      },
      {
        spell: talents.MIND_FREEZE_TALENT.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 15,
      },
      {
        spell: SPELLS.DARK_COMMAND.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 8,
      },
      {
        spell: SPELLS.DEATH_GRIP.id,
        category: SPELL_CATEGORY.UTILITY,
        gcd: {
          base: 500,
          minimum: 500,
        },
        cooldown: 15,
        timelineSortIndex: 14,
      },
      {
        spell: SPELLS.DEATHS_ADVANCE.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 45,
        timelineSortIndex: 14,
      },
      {
        spell: talents.WRAITH_WALK_TALENT.id,
        enabled: combatant.hasTalent(talents.WRAITH_WALK_TALENT.id),
        category: SPELL_CATEGORY.UTILITY,
        gcd: {
          base: 1500,
        },
        cooldown: 60,
        timelineSortIndex: 14,
      },
      {
        spell: SPELLS.GOREFIENDS_GRASP.id,
        category: SPELL_CATEGORY.UTILITY,
        gcd: {
          base: 1500,
        },
        cooldown: combatant.hasTalent(SPELLS.TIGHTENING_GRASP_TALENT.id) ? 90 : 120,
        timelineSortIndex: 11,
      },
      {
        spell: SPELLS.RAISE_ALLY.id,
        category: SPELL_CATEGORY.UTILITY,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.ASPHYXIATE.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 45,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: talents.CONTROL_UNDEAD_TALENTS.id,
        category: SPELL_CATEGORY.OTHERS,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.RAISE_DEAD_BLOOD_FROST.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 120,
      },
      {
        spell: talents.ANTI_MAGIC_ZONE_TALENT.id,
        buffSpellId: talents.ANTI_MAGIC_ZONE_TALENT_BUFF.id,
        category: SPELL_CATEGORY.DEFENSIVE,
        cooldown: 120,
        gcd: null,
        isDefensive: true,
      },
      {
        spell: SPELLS.MARK_OF_BLOOD_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        enabled: combatant.hasTalent(SPELLS.MARK_OF_BLOOD_TALENT),
        cooldown: 6,
        gcd: {
          base: 1500,
        },
        timelineSortIndex: 10,
      },
      {
        spell: SPELLS.TOMBSTONE_TALENT.id,
        category: SPELL_CATEGORY.DEFENSIVE,
        enabled: combatant.hasTalent(SPELLS.TOMBSTONE_TALENT.id),
        cooldown: 60,
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.5,
          extraSuggestion: t({
            id: 'deathknight.blood.abilities.extraSuggestion.defensiveCd',
            message:
              'Defensive CDs like this are meant to be used smartly. Use it to smooth regular damage intake or to take the edge of big attacks.',
          }),
          importance: ISSUE_IMPORTANCE.MINOR,
        },
        timelineSortIndex: 10,
      },
      {
        spell: SPELLS.RUNE_TAP.id,
        buffSpellId: SPELLS.RUNE_TAP.id,
        category: SPELL_CATEGORY.DEFENSIVE,
        cooldown: 25,
        charges: 2,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.5,
          extraSuggestion: t({
            id: 'deathknight.blood.abilities.extraSuggestion.defensiveCd',
            message:
              'Defensive CDs like this are meant to be used smartly. Use it to smooth regular damage intake or to take the edge of big attacks.',
          }),
          importance: ISSUE_IMPORTANCE.MINOR,
        },
        timelineSortIndex: 10,
      },
      {
        spell: SPELLS.BLOOD_TAP_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        enabled: combatant.hasTalent(SPELLS.BLOOD_TAP_TALENT.id),
        cooldown: 60,
        charges: 2,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.5,
          extraSuggestion: t({
            id: 'deathknight.blood.abilities.extraSuggestion.bloodTap',
            message: 'Use to generate extra runes at opportune times.',
          }),
          importance: ISSUE_IMPORTANCE.MINOR,
        },
        timelineSortIndex: 10,
      },
      {
        spell: SPELLS.BONESTORM_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL_AOE,
        enabled: combatant.hasTalent(SPELLS.BONESTORM_TALENT.id),
        cooldown: 60,
        gcd: {
          base: 1500,
        },
        timelineSortIndex: 9,
      },
      {
        spell: SPELLS.RUNE_1.id,
        category: SPELL_CATEGORY.HIDDEN,
        cooldown: (haste) => {
          const multiplier = combatant.hasBuff(SPELLS.CRIMSON_RUNE_WEAPON_BUFF.id) ? 0.4 : 0;
          return 10 / (1 + haste) / (1 + multiplier);
        },
        charges: 2,
      },
      {
        spell: SPELLS.RUNE_2.id,
        category: SPELL_CATEGORY.HIDDEN,
        cooldown: (haste) => {
          const multiplier = combatant.hasBuff(SPELLS.CRIMSON_RUNE_WEAPON_BUFF.id) ? 0.4 : 0;
          return 10 / (1 + haste) / (1 + multiplier);
        },
        charges: 2,
      },
      {
        spell: SPELLS.RUNE_3.id,
        category: SPELL_CATEGORY.HIDDEN,
        cooldown: (haste) => {
          const multiplier = combatant.hasBuff(SPELLS.CRIMSON_RUNE_WEAPON_BUFF.id) ? 0.4 : 0;
          return 10 / (1 + haste) / (1 + multiplier);
        },
        charges: 2,
      },

      // covenants
      {
        spell: SPELLS.SWARMING_MIST.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 60,
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
        },
        enabled: combatant.hasCovenant(COVENANTS.VENTHYR.id),
      },
      {
        spell: SPELLS.DOOR_OF_SHADOWS.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 60,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasCovenant(COVENANTS.VENTHYR.id),
      },
      {
        spell: SPELLS.ABOMINATION_LIMB.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 120,
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
        },
        enabled: combatant.hasCovenant(COVENANTS.NECROLORD.id),
      },
      {
        spell: SPELLS.FLESHCRAFT.id,
        category: SPELL_CATEGORY.DEFENSIVE,
        cooldown: 120,
        enabled: combatant.hasCovenant(COVENANTS.NECROLORD.id),
      },
      {
        spell: SPELLS.SHACKLE_THE_UNWORTHY.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 60,
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
        },
        enabled: combatant.hasCovenant(COVENANTS.KYRIAN.id),
      },
      {
        spell: SPELLS.DEATHS_DUE.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: 15,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasCovenant(COVENANTS.NIGHT_FAE.id),
      },
      {
        spell: SPELLS.SOULSHAPE.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 30,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasCovenant(COVENANTS.NIGHT_FAE.id),
      },
    ];
  }
}

export default Abilities;
