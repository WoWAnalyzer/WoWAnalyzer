import SPELLS from 'common/SPELLS/deathknight';
import TALENTS from 'common/TALENTS/deathknight';
import CoreAbilities from 'parser/core/modules/Abilities';
import { SpellbookAbility } from 'parser/core/modules/Ability';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';
import { SpellLink } from 'interface';

class Abilities extends CoreAbilities {
  spellbook(): SpellbookAbility[] {
    const combatant = this.selectedCombatant;
    return [
      // roational
      {
        spell: SPELLS.DEATH_COIL.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: TALENTS.SCOURGE_STRIKE_TALENT.id,
        enabled: !combatant.hasTalent(TALENTS.CLAWING_SHADOWS_TALENT),
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: TALENTS.CLAWING_SHADOWS_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.CLAWING_SHADOWS_TALENT),
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: TALENTS.FESTERING_STRIKE_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.FESTERING_STRIKE_TALENT),
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.FESTERING_SCYTHE.id,
        enabled: combatant.hasTalent(TALENTS.FESTERING_SCYTHE_TALENT),
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1500,
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
        enabled: !combatant.hasTalent(TALENTS.DEFILE_TALENT),
        category: SPELL_CATEGORY.ROTATIONAL_AOE,
        cooldown: 30,
        charges: combatant.hasTalent(TALENTS.DEATHS_ECHO_TALENT) ? 2 : 1,
        gcd: {
          base: 1500,
        },
      },

      // cooldowns

      {
        spell: TALENTS.APOCALYPSE_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.APOCALYPSE_TALENT),
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
              Making sure to use <SpellLink spell={TALENTS.APOCALYPSE_TALENT} /> immediately after
              it's cooldown is up is important, try to plan for it's use as it is coming off
              cooldown.
            </span>
          ),
        },
      },

      {
        spell: TALENTS.DARK_TRANSFORMATION_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.DARK_TRANSFORMATION_TALENT),
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 45,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: TALENTS.UNHOLY_ASSAULT_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.UNHOLY_ASSAULT_TALENT),
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 90,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: [TALENTS.SUMMON_GARGOYLE_TALENT.id, SPELLS.DARK_ARBITER_TALENT_GLYPH.id],
        enabled: combatant.hasTalent(TALENTS.SUMMON_GARGOYLE_TALENT),
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 180,
      },
      {
        spell: TALENTS.ARMY_OF_THE_DEAD_TALENT.id,
        enabled:
          combatant.hasTalent(TALENTS.ARMY_OF_THE_DEAD_TALENT) &&
          !combatant.hasTalent(TALENTS.RAISE_ABOMINATION_TALENT),
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 180,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: TALENTS.RAISE_ABOMINATION_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.RAISE_ABOMINATION_TALENT),
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 90,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: TALENTS.ABOMINATION_LIMB_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.ABOMINATION_LIMB_TALENT),
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 120,
        gcd: {
          base: 1500,
        },
      },

      // defensives
      {
        spell: TALENTS.ICEBOUND_FORTITUDE_TALENT.id,
        category: SPELL_CATEGORY.DEFENSIVE,
        cooldown: 120,
        gcd: null,
      },
      {
        spell: SPELLS.ANTI_MAGIC_SHELL.id,
        category: SPELL_CATEGORY.DEFENSIVE,
        cooldown:
          60 -
          Number(combatant.hasTalent(TALENTS.ANTI_MAGIC_BARRIER_TALENT)) * 20 +
          Number(combatant.hasTalent(TALENTS.UNYIELDING_WILL_TALENT)) * 20,
        gcd: {
          static: 0,
        },
      },
      {
        spell: TALENTS.ANTI_MAGIC_ZONE_TALENT.id,
        category: SPELL_CATEGORY.DEFENSIVE,
        cooldown: combatant.hasTalent(TALENTS.ASSIMILATION_TALENT) ? 90 : 120,
        gcd: {
          base: 1500,
        },
        isDefensive: true,
      },
      {
        spell: TALENTS.SACRIFICIAL_PACT_TALENT.id,
        category: SPELL_CATEGORY.DEFENSIVE,
        cooldown: 120,
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
        spell: TALENTS.DEFILE_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.DEFILE_TALENT),
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: 20,
        charges: 1,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: TALENTS.DEATH_STRIKE_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.DEATH_STRIKE_TALENT),
        category: SPELL_CATEGORY.DEFENSIVE,
        gcd: {
          base: 1500,
        },
      },

      // utility
      {
        spell: SPELLS.DEATH_CHARGE.id,
        enabled: combatant.hasTalent(TALENTS.DEATH_CHARGE_TALENT),
        category: SPELL_CATEGORY.UTILITY,
        charges: 1,
        cooldown: 45,
        gcd: null,
      },
      {
        spell: TALENTS.MIND_FREEZE_TALENT.id,
        category: SPELL_CATEGORY.UTILITY,
        gcd: null,
        cooldown: 15,
      },
      {
        spell: SPELLS.DEATHS_ADVANCE.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 45,
        charges: combatant.hasTalent(TALENTS.DEATHS_ECHO_TALENT) ? 2 : 1,
        gcd: null,
      },
      {
        spell: TALENTS.WRAITH_WALK_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.WRAITH_WALK_TALENT),
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 60,
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
        spell: TALENTS.RAISE_DEAD_UNHOLY_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.RAISE_DEAD_UNHOLY_TALENT),
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 30,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.CHAINS_OF_ICE.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: combatant.hasTalent(TALENTS.ICE_PRISON_TALENT) ? 12 : 0,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: TALENTS.CONTROL_UNDEAD_TALENT.id,
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
        charges: combatant.hasTalent(TALENTS.DEATHS_ECHO_TALENT) ? 2 : 1,
        gcd: {
          static: 500,
        },
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
        spell: TALENTS.BLINDING_SLEET_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.BLINDING_SLEET_TALENT),
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
