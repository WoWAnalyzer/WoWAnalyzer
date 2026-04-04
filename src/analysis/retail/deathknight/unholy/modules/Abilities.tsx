import SPELLS from 'common/SPELLS/deathknight';
import TALENTS from 'common/TALENTS/deathknight';
import CoreAbilities, { AbilityRange } from 'parser/core/modules/Abilities';
import { SpellbookAbility } from 'parser/core/modules/Ability';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';

class Abilities extends CoreAbilities {
  spellbook(): SpellbookAbility[] {
    const combatant = this.selectedCombatant;
    return [
      // region Rotational
      {
        spell: SPELLS.DEATH_COIL.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1500,
        },
        range: 30,
      },
      {
        spell: TALENTS.SCOURGE_STRIKE_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1500,
        },
        range: 30,
      },
      {
        spell: SPELLS.VAMPIRIC_STRIKE.id,
        enabled: combatant.hasTalent(TALENTS.VAMPIRIC_STRIKE_TALENT),
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1500,
        },
        range: 30,
      },
      {
        spell: SPELLS.FESTERING_SCYTHE.id,
        enabled: combatant.hasTalent(TALENTS.FESTERING_SCYTHE_TALENT),
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1500,
        },
        range: 100,
      },
      {
        spell: SPELLS.OUTBREAK.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1500,
        },
        range: 30,
      },
      {
        spell: SPELLS.EPIDEMIC.id,
        category: SPELL_CATEGORY.ROTATIONAL_AOE,
        gcd: {
          base: 1500,
        },
        range: 30,
      },
      {
        spell: SPELLS.DEATH_AND_DECAY.id,
        enabled: !combatant.hasTalent(TALENTS.SCYTHE_OF_DECAY_TALENT),
        category: SPELL_CATEGORY.ROTATIONAL_AOE,
        cooldown: 30,
        gcd: {
          base: 1500,
        },
        range: 30,
      },
      {
        spell: SPELLS.FESTERING_STRIKE.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        // If Festering Scythe is talented, there is a -500ms GCD reduction
        gcd: {
          base: combatant.hasTalent(TALENTS.FESTERING_SCYTHE_TALENT) ? 1000 : 1500,
        },
        range: AbilityRange.Melee,
      },
      {
        spell: TALENTS.PUTREFY_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.PUTREFY_TALENT),
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 30,
        charges: combatant.hasTalent(TALENTS.PUTRID_ECHOES_TALENT) ? 2 : 1,
        gcd: {
          base: 1500,
        },
        range: 40,
      },

      // region Cooldowns
      {
        spell: TALENTS.DARK_TRANSFORMATION_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.DARK_TRANSFORMATION_TALENT),
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 45,
        gcd: null,
        range: 100,
      },
      {
        spell: TALENTS.ARMY_OF_THE_DEAD_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.ARMY_OF_THE_DEAD_TALENT),
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 90,
        gcd: {
          base: 1500,
        },
      },

      // region Defensives
      {
        spell: TALENTS.ICEBOUND_FORTITUDE_TALENT.id,
        category: SPELL_CATEGORY.DEFENSIVE,
        cooldown: 120,
        gcd: null,
      },
      {
        spell: SPELLS.ANTI_MAGIC_SHELL.id,
        category: SPELL_CATEGORY.DEFENSIVE,
        cooldown: combatant.hasTalent(TALENTS.ANTI_MAGIC_BARRIER_TALENT) ? 40 : 60,
        gcd: null,
      },
      {
        spell: TALENTS.ANTI_MAGIC_ZONE_TALENT.id,
        buffSpellId: SPELLS.ANTI_MAGIC_ZONE_TALENT_BUFF.id,
        category: SPELL_CATEGORY.DEFENSIVE,
        gcd: {
          base: 1500,
        },
        cooldown: combatant.hasTalent(TALENTS.ASSIMILATION_TALENT) ? 180 : 240,
        isDefensive: true,
        enabled: combatant.hasTalent(TALENTS.ANTI_MAGIC_ZONE_TALENT),
      },
      {
        spell: SPELLS.LICHBORNE.id,
        category: SPELL_CATEGORY.DEFENSIVE,
        cooldown: 120,
        gcd: null,
      },
      {
        spell: TALENTS.DEATH_STRIKE_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.DEATH_STRIKE_TALENT),
        category: SPELL_CATEGORY.DEFENSIVE,
        gcd: {
          base: 1500,
        },
        range: AbilityRange.Melee,
      },
      {
        spell: TALENTS.DEATH_PACT_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.DEATH_PACT_TALENT),
        category: SPELL_CATEGORY.DEFENSIVE,
        cooldown: 120,
        gcd: null,
      },

      // region Utility
      {
        spell: SPELLS.DEATH_CHARGE.id,
        enabled: combatant.hasTalent(TALENTS.DEATH_CHARGE_TALENT),
        category: SPELL_CATEGORY.UTILITY,
        charges: combatant.hasTalent(TALENTS.DEATHS_ECHO_TALENT) ? 2 : 1,
        cooldown: 45,
        gcd: null,
      },
      {
        spell: TALENTS.MIND_FREEZE_TALENT.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 15,
        gcd: null,
        range: 15,
      },
      {
        spell: SPELLS.DEATHS_ADVANCE.id,
        category: SPELL_CATEGORY.UTILITY,
        charges: combatant.hasTalent(TALENTS.DEATHS_ECHO_TALENT) ? 2 : 1,
        cooldown: 45,
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
        range: 20,
      },
      {
        spell: SPELLS.CHAINS_OF_ICE.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: combatant.hasTalent(TALENTS.ICE_PRISON_TALENT) ? 12 : 0,
        gcd: {
          base: 1500,
        },
        range: 30,
      },
      {
        spell: TALENTS.CONTROL_UNDEAD_TALENT.id,
        category: SPELL_CATEGORY.UTILITY,
        gcd: {
          base: 1500,
        },
        range: 30,
      },
      {
        spell: SPELLS.RAISE_ALLY.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 600,
        gcd: {
          base: 1500,
        },
        range: 40,
      },
      {
        spell: SPELLS.DEATH_GRIP.id,
        category: SPELL_CATEGORY.UTILITY,
        charges: combatant.hasTalent(TALENTS.DEATHS_ECHO_TALENT) ? 2 : 1,
        cooldown: 25,
        gcd: {
          static: 500,
        },
        range: 30,
      },
      {
        spell: SPELLS.DARK_COMMAND.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 8,
        gcd: null,
        range: 30,
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
      /*
      Rune cooldown is base 10s reduced by haste. Runic Corruption's regeneration acceleration is handled in the RuneTracker via onApplybuff/onRemovebuff.
      Do not add RC logic here to avoid double-counting.
      */
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
