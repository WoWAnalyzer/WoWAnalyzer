import SPELLS from 'common/SPELLS/deathknight';
import talents from 'common/TALENTS/deathknight';
import CoreAbilities from 'parser/core/modules/Abilities';
import { SpellbookAbility } from 'parser/core/modules/Ability';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';
import SpellLink from 'interface/SpellLink';

class Abilities extends CoreAbilities {
  spellbook(): SpellbookAbility[] {
    const combatant = this.selectedCombatant;
    return [
      // roational
      {
        spell: SPELLS.FESTERING_STRIKE.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1500,
        },
      },

      {
        spell: SPELLS.SCOURGE_STRIKE.id,
        enabled: !combatant.hasTalent(talents.CLAWING_SHADOWS_TALENT),
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1500,
        },
      },

      {
        spell: talents.CLAWING_SHADOWS_TALENT.id,
        enabled: combatant.hasTalent(talents.CLAWING_SHADOWS_TALENT),
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1500,
        },
      },

      {
        spell: SPELLS.DEATH_COIL.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1500,
        },
      },

      {
        spell: SPELLS.CHAINS_OF_ICE.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: combatant.hasTalent(talents.ICE_PRISON_TALENT) ? 12 : 0,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: talents.DARK_TRANSFORMATION_TALENT.id,
        enabled: combatant.hasTalent(talents.DARK_TRANSFORMATION_TALENT),
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 45,
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
        },
      },
      {
        spell: SPELLS.OUTBREAK.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.EPIDEMIC.id,
        category: SPELL_CATEGORY.ROTATIONAL_AOE,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.DEATH_AND_DECAY.id,
        enabled: !combatant.hasTalent(talents.DEFILE_TALENT),
        category: SPELL_CATEGORY.ROTATIONAL_AOE,
        cooldown: 30,
        charges: combatant.hasTalent(talents.DEATHS_ECHO_TALENT) ? 2 : 1,
        gcd: {
          base: 1500,
        },
      },

      // cooldowns
      {
        spell: talents.APOCALYPSE_TALENT.id,
        enabled: combatant.hasTalent(talents.APOCALYPSE_TALENT),
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 45,
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
          extraSuggestion: (
            <span>
              Making sure to use <SpellLink spell={SPELLS.APOCALYPSE} /> immediately after it's
              cooldown is up is important, try to plan for it's use as it is coming off cooldown.
            </span>
          ),
        },
      },

      {
        spell: [talents.SUMMON_GARGOYLE_TALENT.id, SPELLS.DARK_ARBITER_TALENT_GLYPH.id],
        enabled: combatant.hasTalent(talents.SUMMON_GARGOYLE_TALENT),
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 180,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
        },
      },

      {
        spell: SPELLS.ARMY_OF_THE_DEAD.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 180,
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
        },
      },
      {
        spell: SPELLS.EMPOWER_RUNE_WEAPON.id,
        enabled: combatant.hasTalent(talents.EMPOWER_RUNE_WEAPON_TALENT),
        category: SPELL_CATEGORY.COOLDOWNS,
        gcd: null,
        cooldown: 120,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: combatant.hasTalent(talents.SUMMON_GARGOYLE_TALENT) ? 0.65 : 0.9,
          extraSuggestion: (
            <>
              You should use this with every <SpellLink spell={talents.SUMMON_GARGOYLE_TALENT} /> if
              it is talented. Otherwise use it with your other cooldowns when it is available.
            </>
          ),
        },
        timelineSortIndex: 1,
      },
      // defensives
      {
        spell: talents.SACRIFICIAL_PACT_TALENT.id,
        category: SPELL_CATEGORY.DEFENSIVE,
        cooldown: 120,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: talents.ICEBOUND_FORTITUDE_TALENT.id,
        category: SPELL_CATEGORY.DEFENSIVE,
        cooldown: 120,
        gcd: null,
      },
      {
        spell: talents.ANTI_MAGIC_ZONE_TALENT.id,
        category: SPELL_CATEGORY.DEFENSIVE,
        cooldown: combatant.hasTalent(talents.ASSIMILATION_TALENT) ? 90 : 120,
        gcd: {
          base: 1500,
        },
        isDefensive: true,
      },
      {
        spell: SPELLS.ANTI_MAGIC_SHELL.id,
        category: SPELL_CATEGORY.DEFENSIVE,
        cooldown: combatant.hasTalent(talents.ANTI_MAGIC_BARRIER_TALENT)
          ? combatant.hasTalent(talents.UNYIELDING_WILL_TALENT)
            ? 60
            : 40
          : combatant.hasTalent(talents.UNYIELDING_WILL_TALENT)
            ? 80
            : 60,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.LICHBORNE.id,
        category: SPELL_CATEGORY.DEFENSIVE,
        cooldown: 120,
        gcd: null,
      },
      {
        spell: talents.DEFILE_TALENT.id,
        enabled: combatant.hasTalent(talents.DEFILE_TALENT),
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: 20,
        charges: 1,
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
        },
      },
      {
        spell: talents.UNHOLY_ASSAULT_TALENT.id,
        enabled: combatant.hasTalent(talents.UNHOLY_ASSAULT_TALENT),
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 90,
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
        },
      },
      {
        spell: talents.UNHOLY_BLIGHT_TALENT.id,
        enabled: combatant.hasTalent(talents.UNHOLY_BLIGHT_TALENT),
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 45,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: talents.DEATH_STRIKE_TALENT.id,
        enabled: combatant.hasTalent(talents.DEATH_STRIKE_TALENT),
        category: SPELL_CATEGORY.DEFENSIVE,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: talents.ASPHYXIATE_TALENT.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 45,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: talents.WRAITH_WALK_TALENT.id,
        enabled: combatant.hasTalent(talents.WRAITH_WALK_TALENT),
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 60,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.DEATHS_ADVANCE.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 45,
        charges: combatant.hasTalent(talents.DEATHS_ECHO_TALENT) ? 2 : 1,
        gcd: null,
      },
      // utility
      {
        spell: SPELLS.RAISE_DEAD_UNHOLY.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 30,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: talents.CONTROL_UNDEAD_TALENT.id,
        category: SPELL_CATEGORY.UTILITY,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.RAISE_ALLY.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 600,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.DEATH_GRIP.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 25,
        charges: combatant.hasTalent(talents.DEATHS_ECHO_TALENT) ? 2 : 1,
        gcd: {
          static: 500,
        },
      },
      {
        spell: talents.MIND_FREEZE_TALENT.id,
        category: SPELL_CATEGORY.UTILITY,
        gcd: null,
        cooldown: 15,
      },
      {
        spell: SPELLS.DARK_COMMAND.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 8,
        gcd: null,
      },
      {
        spell: SPELLS.RUNE_1.id,
        category: SPELL_CATEGORY.HIDDEN,
        cooldown: (haste) => {
          const multiplier = combatant.hasBuff(SPELLS.RUNIC_CORRUPTION.id) ? 1 : 0;
          return 10 / (1 + haste) / (1 + multiplier);
        },
        charges: 2,
      },

      {
        spell: SPELLS.RUNE_2.id,
        category: SPELL_CATEGORY.HIDDEN,
        cooldown: (haste) => {
          const multiplier = combatant.hasBuff(SPELLS.RUNIC_CORRUPTION.id) ? 1 : 0;
          return 10 / (1 + haste) / (1 + multiplier);
        },
        charges: 2,
      },
      {
        spell: SPELLS.RUNE_3.id,
        category: SPELL_CATEGORY.HIDDEN,
        cooldown: (haste) => {
          const multiplier = combatant.hasBuff(SPELLS.RUNIC_CORRUPTION.id) ? 1 : 0;
          return 10 / (1 + haste) / (1 + multiplier);
        },
        charges: 2,
      },
      {
        spell: talents.ABOMINATION_LIMB_TALENT.id,
        enabled: combatant.hasTalent(talents.ABOMINATION_LIMB_TALENT),
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 120,
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
        },
      },
      {
        spell: talents.RAISE_ABOMINATION_TALENT.id,
        enabled: combatant.hasTalent(talents.RAISE_ABOMINATION_TALENT),
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 90,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.DEATH_CHARGE.id,
        enabled: combatant.hasTalent(talents.DEATH_CHARGE_TALENT),
        category: SPELL_CATEGORY.UTILITY,
        charges: 1,
        cooldown: 45,
        gcd: null,
      },
      {
        spell: talents.BLINDING_SLEET_TALENT.id,
        enabled: combatant.hasTalent(talents.BLINDING_SLEET_TALENT),
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 60,
        gcd: {
          base: 1500,
        },
      },
    ];
  }
}

export default Abilities;
