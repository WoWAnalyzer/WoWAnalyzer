import { t } from '@lingui/macro';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/deathknight';
import ISSUE_IMPORTANCE from 'parser/core/ISSUE_IMPORTANCE';
import CoreAbilities from 'parser/core/modules/Abilities';
import { SpellbookAbility } from 'parser/core/modules/Ability';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';

class Abilities extends CoreAbilities {
  spellbook(): SpellbookAbility[] {
    const combatant = this.selectedCombatant;
    return [
      {
        spell: TALENTS.ICEBOUND_FORTITUDE_TALENT.id,
        buffSpellId: TALENTS.ICEBOUND_FORTITUDE_TALENT.id,
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
        spell: TALENTS.VAMPIRIC_BLOOD_TALENT.id,
        buffSpellId: TALENTS.VAMPIRIC_BLOOD_TALENT.id,
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
        spell: TALENTS.BLOOD_BOIL_TALENT.id,
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
        spell: TALENTS.CONSUMPTION_TALENT.id,
        category: SPELL_CATEGORY.SEMI_DEFENSIVE,
        enabled: combatant.hasTalent(TALENTS.CONSUMPTION_TALENT),
        cooldown: 45,
        gcd: {
          base: 1500,
        },
        timelineSortIndex: 5,
      },
      {
        spell: TALENTS.DANCING_RUNE_WEAPON_TALENT.id,
        category: SPELL_CATEGORY.SEMI_DEFENSIVE,
        buffSpellId: SPELLS.DANCING_RUNE_WEAPON_TALENT_BUFF.id,
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
        spell: TALENTS.BLOODDRINKER_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: 30,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(TALENTS.BLOODDRINKER_TALENT),
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
        spell: TALENTS.DEATH_STRIKE_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1500,
        },
        timelineSortIndex: 1,
      },
      {
        spell: TALENTS.DEATHS_CARESS_TALENT.id,
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
        enabled: combatant.hasTalent(TALENTS.RAPID_DECOMPOSITION_TALENT),
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
        enabled: !combatant.hasTalent(TALENTS.RAPID_DECOMPOSITION_TALENT),
        cooldown: 15,
        timelineSortIndex: 5,
      },
      {
        spell: TALENTS.HEART_STRIKE_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1500,
        },
        timelineSortIndex: 3,
      },
      {
        spell: TALENTS.MARROWREND_TALENT.id,
        buffSpellId: SPELLS.BONE_SHIELD.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1500,
        },
        timelineSortIndex: 2,
      },
      {
        spell: TALENTS.ANTI_MAGIC_SHELL_TALENT.id,
        buffSpellId: TALENTS.ANTI_MAGIC_SHELL_TALENT.id,
        category: SPELL_CATEGORY.DEFENSIVE,
        cooldown: combatant.hasTalent(TALENTS.ANTI_MAGIC_BARRIER_TALENT) ? 40 : 60,
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
        spell: TALENTS.MIND_FREEZE_TALENT.id,
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
        spell: TALENTS.WRAITH_WALK_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.WRAITH_WALK_TALENT),
        category: SPELL_CATEGORY.UTILITY,
        gcd: {
          base: 1500,
        },
        cooldown: 60,
        timelineSortIndex: 14,
      },
      {
        spell: TALENTS.GOREFIENDS_GRASP_TALENT.id,
        category: SPELL_CATEGORY.UTILITY,
        gcd: {
          base: 1500,
        },
        cooldown: combatant.hasTalent(TALENTS.TIGHTENING_GRASP_TALENT) ? 90 : 120,
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
        spell: TALENTS.ASPHYXIATE_TALENT.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 45,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: TALENTS.CONTROL_UNDEAD_TALENT.id,
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
        spell: TALENTS.ANTI_MAGIC_ZONE_TALENT.id,
        buffSpellId: SPELLS.ANTI_MAGIC_ZONE_TALENT_BUFF.id,
        category: SPELL_CATEGORY.DEFENSIVE,
        cooldown: 120,
        gcd: null,
        isDefensive: true,
      },
      {
        spell: TALENTS.MARK_OF_BLOOD_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        enabled: combatant.hasTalent(TALENTS.MARK_OF_BLOOD_TALENT),
        cooldown: 6,
        gcd: {
          base: 1500,
        },
        timelineSortIndex: 10,
      },
      {
        spell: TALENTS.TOMBSTONE_TALENT.id,
        category: SPELL_CATEGORY.DEFENSIVE,
        enabled: combatant.hasTalent(TALENTS.TOMBSTONE_TALENT),
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
        spell: TALENTS.RUNE_TAP_TALENT.id,
        buffSpellId: TALENTS.RUNE_TAP_TALENT.id,
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
        spell: TALENTS.BLOOD_TAP_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        enabled: combatant.hasTalent(TALENTS.BLOOD_TAP_TALENT),
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
        spell: TALENTS.BONESTORM_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL_AOE,
        enabled: combatant.hasTalent(TALENTS.BONESTORM_TALENT),
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
          const multiplier = 0;
          return 10 / (1 + haste) / (1 + multiplier);
        },
        charges: 2,
      },
      {
        spell: SPELLS.RUNE_2.id,
        category: SPELL_CATEGORY.HIDDEN,
        cooldown: (haste) => {
          const multiplier = 0;
          return 10 / (1 + haste) / (1 + multiplier);
        },
        charges: 2,
      },
      {
        spell: SPELLS.RUNE_3.id,
        category: SPELL_CATEGORY.HIDDEN,
        cooldown: (haste) => {
          const multiplier = 0;
          return 10 / (1 + haste) / (1 + multiplier);
        },
        charges: 2,
      },

      // covenants
      {
        spell: TALENTS.ABOMINATION_LIMB_TALENT.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 120,
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
        },
        enabled: false,
      },
    ];
  }
}

export default Abilities;
