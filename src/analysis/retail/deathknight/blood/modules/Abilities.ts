import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/deathknight';
import ISSUE_IMPORTANCE from 'parser/core/ISSUE_IMPORTANCE';
import CoreAbilities, { AbilityRange } from 'parser/core/modules/Abilities';
import { SpellbookAbility } from 'parser/core/modules/Ability';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';

class Abilities extends CoreAbilities {
  spellbook(): SpellbookAbility[] {
    const combatant = this.selectedCombatant;
    return [
      //Defensives
      {
        spell: TALENTS.ICEBOUND_FORTITUDE_TALENT.id,
        buffSpellId: TALENTS.ICEBOUND_FORTITUDE_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.ICEBOUND_FORTITUDE_TALENT),
        category: SPELL_CATEGORY.DEFENSIVE,
        cooldown: 120,
        timelineSortIndex: 10,
      },
      {
        spell: TALENTS.VAMPIRIC_BLOOD_TALENT.id,
        buffSpellId: TALENTS.VAMPIRIC_BLOOD_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.VAMPIRIC_BLOOD_TALENT),
        category: SPELL_CATEGORY.DEFENSIVE,
        cooldown: 90,
        timelineSortIndex: 10,
      },
      {
        spell: SPELLS.ANTI_MAGIC_SHELL.id,
        buffSpellId: SPELLS.ANTI_MAGIC_SHELL.id,
        category: SPELL_CATEGORY.DEFENSIVE,
        cooldown: combatant.hasTalent(TALENTS.ANTI_MAGIC_BARRIER_TALENT) ? 40 : 60,
        timelineSortIndex: 10,
      },
      {
        spell: TALENTS.ANTI_MAGIC_ZONE_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.ANTI_MAGIC_ZONE_TALENT),
        buffSpellId: SPELLS.ANTI_MAGIC_ZONE_TALENT_BUFF.id,
        category: SPELL_CATEGORY.DEFENSIVE,
        cooldown: 120,
        gcd: {
          base: 1500,
        },
        isDefensive: true,
      },
      {
        spell: TALENTS.SACRIFICIAL_PACT_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.SACRIFICIAL_PACT_TALENT),
        category: SPELL_CATEGORY.DEFENSIVE,
        cooldown: 120,
        gcd: null,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.5,
          extraSuggestion:
            'Defensive CDs like this are meant to be used smartly. Use it to smooth regular damage intake, to take the edge of big attacks, or heal up quickly after a large hit.',
          importance: ISSUE_IMPORTANCE.MINOR,
        },
        isDefensive: true,
      },
      {
        spell: TALENTS.DEATH_PACT_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.DEATH_PACT_TALENT),
        category: SPELL_CATEGORY.DEFENSIVE,
        cooldown: 120,
        gcd: null,
        isDefensive: true,
      },
      {
        spell: SPELLS.LICHBORNE.id,
        enabled: combatant.hasTalent(TALENTS.UNHOLY_ENDURANCE_TALENT), //Provides 15% DR if you take this talent
        category: SPELL_CATEGORY.DEFENSIVE,
        cooldown: 120 - combatant.getTalentRank(TALENTS.DEATHS_MESSENGER_TALENT) * 30,
        gcd: null,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.5,
          extraSuggestion:
            'Defensive CDs like this are meant to be used smartly. Use it to smooth regular damage intake, to take the edge of big attacks, or heal up quickly after a large hit.',
          importance: ISSUE_IMPORTANCE.MINOR,
        },
        isDefensive: true,
      },
      {
        spell: TALENTS.CONSUMPTION_TALENT.id,
        category: SPELL_CATEGORY.SEMI_DEFENSIVE,
        enabled: combatant.hasTalent(TALENTS.CONSUMPTION_TALENT),
        cooldown: 30,
        gcd: {
          base: 1500,
        },
        timelineSortIndex: 5,
      },
      {
        spell: TALENTS.RUNE_TAP_TALENT.id,
        buffSpellId: TALENTS.RUNE_TAP_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.RUNE_TAP_TALENT),
        category: SPELL_CATEGORY.DEFENSIVE,
        cooldown: 25,
        charges: 2,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.5,
          extraSuggestion:
            'Defensive CDs like this are meant to be used smartly. Use it to smooth regular damage intake, to take the edge of big attacks, or heal up quickly after a large hit.',
          importance: ISSUE_IMPORTANCE.MINOR,
        },
        timelineSortIndex: 10,
      },
      {
        spell: TALENTS.MARK_OF_BLOOD_TALENT.id,
        category: SPELL_CATEGORY.DEFENSIVE,
        enabled: combatant.hasTalent(TALENTS.MARK_OF_BLOOD_TALENT),
        cooldown: 6,
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
          extraSuggestion:
            'Defensive CDs like this are meant to be used smartly. Use it to smooth regular damage intake, to take the edge of big attacks, or heal up quickly after a large hit.',
        },
        timelineSortIndex: 10,
      },
      //Rotational
      {
        spell: TALENTS.ABOMINATION_LIMB_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.ABOMINATION_LIMB_TALENT),
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: 120,
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
          extraSuggestion:
            'Should be used on CD. You may delay it a little to not over cap on bone shield charges or if you need its pulling of mobs.',
        },
      },
      {
        spell: TALENTS.BLOOD_BOIL_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        enabled: combatant.hasTalent(TALENTS.BLOOD_BOIL_TALENT),
        cooldown: (haste) => 7.5 / (1 + haste),
        gcd: {
          base: 1500,
        },
        charges: 2,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.85,
          extraSuggestion: 'Should be casting it so you have at least one recharging.',
        },
        timelineSortIndex: 4,
      },
      {
        spell: TALENTS.DANCING_RUNE_WEAPON_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        buffSpellId: SPELLS.DANCING_RUNE_WEAPON_TALENT_BUFF.id,
        enabled: combatant.hasTalent(TALENTS.DANCING_RUNE_WEAPON_TALENT),
        gcd: {
          base: 1500,
        },
        cooldown: 120,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
          extraSuggestion:
            'Should be used as an opener and usally used on CD. You may delay it a little so as to not over cap bone charges to much or if you know there is a large pack of adds incoming.',
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
          extraSuggestion: `Mostly used as a dps CD. Should be almost casted on CD. Good to use when you're running to the boss or can't melee them.`,
        },
        timelineSortIndex: 6,
      },
      {
        spell: TALENTS.SOUL_REAPER_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.SOUL_REAPER_TALENT),
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1500,
        },
        timelineSortIndex: 7,
        range: AbilityRange.Melee,
      },
      {
        spell: TALENTS.DEATH_STRIKE_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1500,
        },
        timelineSortIndex: 1,
        range: AbilityRange.Melee,
      },
      {
        spell: SPELLS.DEATHS_CARESS.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1500,
        },
        timelineSortIndex: 7,
        range: 30,
      },
      {
        spell: SPELLS.DEATH_AND_DECAY.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1500,
        },
        cooldown: 15,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.8, //reduced because of proc resets
        },
        charges: combatant.hasTalent(TALENTS.DEATHS_ECHO_TALENT) ? 2 : 1,
        timelineSortIndex: 5,
      },
      {
        spell: TALENTS.HEART_STRIKE_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.HEART_STRIKE_TALENT),
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1500,
        },
        timelineSortIndex: 3,
        range: AbilityRange.Melee,
      },
      {
        spell: TALENTS.MARROWREND_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.MARROWREND_TALENT),
        buffSpellId: SPELLS.BONE_SHIELD.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1500,
        },
        timelineSortIndex: 2,
        range: AbilityRange.Melee,
      },
      {
        spell: TALENTS.RAISE_DEAD_SHARED_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.RAISE_DEAD_SHARED_TALENT),
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: 120 - combatant.getTalentRank(TALENTS.DEATHS_MESSENGER_TALENT) * 30,
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
          extraSuggestion: 'Use to generate extra runes at opportune times.',
          importance: ISSUE_IMPORTANCE.MINOR,
        },
        timelineSortIndex: 10,
      },
      {
        spell: TALENTS.TOMBSTONE_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        enabled: combatant.hasTalent(TALENTS.TOMBSTONE_TALENT),
        cooldown: 60,
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.5,
          extraSuggestion:
            'Use this on CD and try to only use it when it consumes 5 boneshield charges and can reduce 20 seconds off dancing rune weapon.',
        },
        timelineSortIndex: 10,
      },
      {
        spell: TALENTS.REAPERS_MARK_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        enabled: combatant.hasTalent(TALENTS.REAPERS_MARK_TALENT),
        cooldown: 45 - combatant.getTalentRank(TALENTS.SWIFT_END_TALENT) * 15,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: TALENTS.BONESTORM_TALENT.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        enabled: combatant.hasTalent(TALENTS.BONESTORM_TALENT),
        cooldown: 60,
        gcd: {
          base: 1500,
        },
        timelineSortIndex: 9,
      },
      //Utility
      {
        spell: TALENTS.MIND_FREEZE_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.MIND_FREEZE_TALENT),
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 15,
      },
      {
        spell: SPELLS.CHAINS_OF_ICE.id,
        category: SPELL_CATEGORY.UTILITY,
      },
      {
        spell: TALENTS.BLINDING_SLEET_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.BLINDING_SLEET_TALENT),
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 60,
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
        charges: combatant.hasTalent(TALENTS.DEATHS_ECHO_TALENT) ? 2 : 1,
        timelineSortIndex: 14,
      },
      {
        spell: SPELLS.DEATHS_ADVANCE.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 45,
        charges: combatant.hasTalent(TALENTS.DEATHS_ECHO_TALENT) ? 2 : 1,
        gcd: null,
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
        enabled: combatant.hasTalent(TALENTS.GOREFIENDS_GRASP_TALENT),
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
        enabled: combatant.hasTalent(TALENTS.ASPHYXIATE_TALENT),
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 45,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: TALENTS.CONTROL_UNDEAD_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.CONTROL_UNDEAD_TALENT),
        category: SPELL_CATEGORY.UTILITY,
        gcd: {
          base: 1500,
        },
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
    ];
  }
}

export default Abilities;
