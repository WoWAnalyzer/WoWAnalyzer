import SPELLS from 'common/SPELLS';
import talents from 'common/TALENTS/deathknight';
import { SpellLink } from 'interface';
import CoreAbilities from 'parser/core/modules/Abilities';
import { SpellbookAbility } from 'parser/core/modules/Ability';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';

class Abilities extends CoreAbilities {
  spellbook(): SpellbookAbility[] {
    const combatant = this.selectedCombatant;
    return [
      // COOLDOWNS
      {
        spell: talents.PILLAR_OF_FROST_TALENT.id,
        buffSpellId: talents.PILLAR_OF_FROST_TALENT.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        gcd: null,
        cooldown: 60,
        enabled: combatant.hasTalent(talents.PILLAR_OF_FROST_TALENT),
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.85,
          extraSuggestion: 'You should aim to use this off CD.',
        },
        timelineSortIndex: 0,
      },
      {
        spell: SPELLS.EMPOWER_RUNE_WEAPON.id,
        buffSpellId: SPELLS.EMPOWER_RUNE_WEAPON.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        gcd: null,
        cooldown: 120,
        charges:
          Number(combatant.hasTalent(talents.EMPOWER_RUNE_WEAPON_SHARED_TALENT)) +
          Number(combatant.hasTalent(talents.EMPOWER_RUNE_WEAPON_FROST_TALENT)),
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.8,
          extraSuggestion: (
            <>
              You should use this with every{' '}
              <SpellLink spell={talents.BREATH_OF_SINDRAGOSA_TALENT} /> if it is talented. Otherwise
              use it with <SpellLink spell={talents.PILLAR_OF_FROST_TALENT} />.
            </>
          ),
        },
        timelineSortIndex: 1,
        enabled:
          combatant.hasTalent(talents.EMPOWER_RUNE_WEAPON_SHARED_TALENT) ||
          combatant.hasTalent(talents.EMPOWER_RUNE_WEAPON_FROST_TALENT),
      },
      {
        spell: talents.HORN_OF_WINTER_TALENT.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        gcd: {
          base: 1500,
        },
        cooldown: 45,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
        },
        enabled: combatant.hasTalent(talents.HORN_OF_WINTER_TALENT),
      },
      {
        spell: talents.BREATH_OF_SINDRAGOSA_TALENT.id,
        buffSpellId: talents.BREATH_OF_SINDRAGOSA_TALENT.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        gcd: null,
        cooldown: 120,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
          extraSuggestion:
            'You should only save this if there is a mechanic you will need to deal with in the next 30 seconds or if you need to save it for a particular phase',
        },
        timelineSortIndex: 2,
        enabled: combatant.hasTalent(talents.BREATH_OF_SINDRAGOSA_TALENT),
      },
      {
        spell: talents.FROSTWYRMS_FURY_TALENT.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        gcd: {
          base: 1500,
        },
        cooldown: 180,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
          extraSuggestion: (
            <>
              Although you normally want to use this off CD, you can save it to line it up with{' '}
              <SpellLink spell={talents.PILLAR_OF_FROST_TALENT} icon />. You can also hold it if you
              know there will be an opportunity to hit many enemies.
            </>
          ),
        },
        enabled: combatant.hasTalent(talents.FROSTWYRMS_FURY_TALENT),
      },
      {
        spell: SPELLS.RAISE_DEAD_BLOOD_FROST.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        gcd: null,
        cooldown: 120,
      },
      {
        spell: talents.CHILL_STREAK_TALENT.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        gcd: {
          base: 1500,
        },
        cooldown: 45,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.8,
          extraSuggestion: (
            <>
              Although you normally want to use this off CD, you can save it to line it up with{' '}
              <SpellLink spell={talents.PILLAR_OF_FROST_TALENT} icon />. You can also save it if you
              only have one target and another will spawn within 45 seconds.
            </>
          ),
        },
        enabled: combatant.hasTalent(talents.CHILL_STREAK_TALENT),
      },
      {
        spell: talents.ABOMINATION_LIMB_TALENT.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        gcd: {
          base: 1500,
        },
        cooldown: 120,
        enabled: combatant.hasTalent(talents.ABOMINATION_LIMB_TALENT),
      },
      {
        spell: SPELLS.RAISE_DEAD_BLOOD_FROST.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        gcd: null,
        cooldown: 120,
      },
      // ROTATIONAL
      {
        spell: talents.OBLITERATE_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.REMORSELESS_WINTER.id,
        buffSpellId: SPELLS.REMORSELESS_WINTER.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1500,
        },
        cooldown: 20,
        castEfficiency: {
          suggestion: false,
          recommendedEfficiency: 0.9,
        },
      },
      {
        spell: talents.HOWLING_BLAST_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: talents.FROST_STRIKE_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: talents.FROSTSCYTHE_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL_AOE,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(talents.FROSTSCYTHE_TALENT),
      },
      {
        spell: talents.GLACIAL_ADVANCE_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(talents.GLACIAL_ADVANCE_TALENT),
      },
      {
        spell: talents.SACRIFICIAL_PACT_TALENT.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 120,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(talents.SACRIFICIAL_PACT_TALENT),
      },

      // DEFENSIVE
      {
        spell: talents.ANTI_MAGIC_SHELL_TALENT.id,
        buffSpellId: talents.ANTI_MAGIC_SHELL_TALENT.id,
        category: SPELL_CATEGORY.DEFENSIVE,
        gcd: null,
        cooldown: combatant.hasTalent(talents.ANTI_MAGIC_BARRIER_TALENT) ? 40 : 60,
        isDefensive: true,
        enabled: combatant.hasTalent(talents.ANTI_MAGIC_SHELL_TALENT),
      },
      {
        spell: talents.ICEBOUND_FORTITUDE_TALENT.id,
        buffSpellId: talents.ICEBOUND_FORTITUDE_TALENT.id,
        category: SPELL_CATEGORY.DEFENSIVE,
        gcd: null,
        cooldown: 180,
        isDefensive: true,
        enabled: combatant.hasTalent(talents.ICEBOUND_FORTITUDE_TALENT),
      },
      {
        spell: talents.DEATH_STRIKE_TALENT.id,
        category: SPELL_CATEGORY.DEFENSIVE,
        gcd: {
          base: 1500,
        },
        isDefensive: true,
      },
      {
        spell: talents.DEATH_STRIKE_TALENT.id,
        buffSpellId: talents.DEATH_STRIKE_TALENT.id,
        category: SPELL_CATEGORY.DEFENSIVE,
        gcd: null,
        cooldown: 120,
        isDefensive: true,
        enabled: combatant.hasTalent(talents.DEATH_STRIKE_TALENT),
      },
      {
        spell: talents.ANTI_MAGIC_ZONE_TALENT.id,
        buffSpellId: SPELLS.ANTI_MAGIC_ZONE_TALENT_BUFF.id,
        category: SPELL_CATEGORY.DEFENSIVE,
        gcd: null,
        cooldown: 120,
        isDefensive: true,
      },
      {
        spell: SPELLS.LICHBORNE.id,
        buffSpellId: SPELLS.LICHBORNE.id,
        category: SPELL_CATEGORY.DEFENSIVE,
        gcd: null,
        cooldown: 120,
        isDefensive: true,
      },
      // UTILITY
      {
        spell: SPELLS.DEATH_GRIP.id,
        category: SPELL_CATEGORY.UTILITY,
        gcd: {
          static: 500,
        },
        cooldown: 25,
      },
      {
        spell: talents.CHAINS_OF_ICE_TALENT.id,
        category: combatant.hasTalent(talents.COLD_HEART_TALENT)
          ? SPELL_CATEGORY.ROTATIONAL
          : SPELL_CATEGORY.UTILITY,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.DEATHS_ADVANCE.id,
        category: SPELL_CATEGORY.UTILITY,
        charges: combatant.hasTalent(talents.DEATHS_ECHO_TALENT) ? 2 : 1,
        gcd: null,
        cooldown: 45,
      },
      {
        spell: SPELLS.DARK_COMMAND.id,
        category: SPELL_CATEGORY.UTILITY,
        gcd: null,
        cooldown: 8,
      },
      {
        spell: SPELLS.RAISE_ALLY.id,
        category: SPELL_CATEGORY.UTILITY,
        gcd: {
          base: 1500,
        },
        cooldown: 600,
      },
      {
        spell: talents.MIND_FREEZE_TALENT.id,
        category: SPELL_CATEGORY.UTILITY,
        gcd: null,
        cooldown: 15,
      },
      {
        spell: SPELLS.PATH_OF_FROST.id,
        category: SPELL_CATEGORY.UTILITY,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: talents.ASPHYXIATE_TALENT.id,
        category: SPELL_CATEGORY.UTILITY,
        gcd: {
          base: 1500,
        },
        cooldown: 45,
      },
      {
        spell: talents.CONTROL_UNDEAD_TALENT.id,
        category: SPELL_CATEGORY.UTILITY,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: talents.BLINDING_SLEET_TALENT.id,
        category: SPELL_CATEGORY.UTILITY,
        gcd: {
          base: 1500,
        },
        cooldown: 60,
        enabled: combatant.hasTalent(talents.BLINDING_SLEET_TALENT),
      },
      {
        spell: talents.WRAITH_WALK_TALENT.id,
        category: SPELL_CATEGORY.UTILITY,
        gcd: {
          base: 1500,
        },
        cooldown: 60,
        enabled: combatant.hasTalent(talents.WRAITH_WALK_TALENT),
      },
      {
        spell: SPELLS.DEATH_AND_DECAY.id,
        category: SPELL_CATEGORY.UTILITY,
        charges: combatant.hasTalent(talents.DEATHS_ECHO_TALENT) ? 2 : 1,
        gcd: {
          base: 1500,
        },
        cooldown: 30,
        enabled: !false,
      },
      {
        spell: SPELLS.DEATH_COIL.id,
        category: SPELL_CATEGORY.UTILITY,
        gcd: {
          base: 1500,
        },
      },
      // RUNES
      {
        spell: SPELLS.RUNE_1.id,
        category: SPELL_CATEGORY.HIDDEN,
        cooldown: (haste) => 10 / (1 + haste),
        charges: 2,
      },

      {
        spell: SPELLS.RUNE_2.id,
        category: SPELL_CATEGORY.HIDDEN,
        cooldown: (haste) => 10 / (1 + haste),
        charges: 2,
      },

      {
        spell: SPELLS.RUNE_3.id,
        category: SPELL_CATEGORY.HIDDEN,
        cooldown: (haste) => 10 / (1 + haste),
        charges: 2,
      },
    ];
  }
}

export default Abilities;
