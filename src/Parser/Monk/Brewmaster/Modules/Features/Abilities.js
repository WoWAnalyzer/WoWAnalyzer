import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import CoreAbilities from 'Parser/Core/Modules/Abilities';

class Abilities extends CoreAbilities {
  spellbook() {
    const combatant = this.combatants.selected;
    return [
      // Rotational Spells
      {
        spell: SPELLS.KEG_SMASH,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: haste => 8 / (1 + haste),
        enabled: !combatant.hasShoulder(ITEMS.STORMSTOUTS_LAST_GASP.id),
        castEfficiency: {
          suggestion: true,
        },
      },
      {
        spell: SPELLS.KEG_SMASH,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: haste => 8 / (1 + haste),
        charges: 2,
        enabled: combatant.hasShoulder(ITEMS.STORMSTOUTS_LAST_GASP.id),
        castEfficiency: {
          suggestion: true,
        },
      },
      {
        spell: SPELLS.BLACKOUT_STRIKE,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: 3,
        castEfficiency: {
          suggestion: true,
        },
      },
      {
        spell: SPELLS.BREATH_OF_FIRE,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: 15,
      },
      {
        spell: SPELLS.TIGER_PALM,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      },
      {
        spell: SPELLS.EXPLODING_KEG,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: 75,
        castEfficiency: {
          suggestion: true,
        },
      },
      {
        spell: SPELLS.RUSHING_JADE_WIND_TALENT,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: haste => 6 / (1 + haste),
        enabled: combatant.hasTalent(SPELLS.RUSHING_JADE_WIND_TALENT.id),
      },
      {
        spell: SPELLS.CRACKLING_JADE_LIGHTNING,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      },
      // Cooldowns
      {
        spell: SPELLS.IRONSKIN_BREW,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
      },
      {
        spell: SPELLS.PURIFYING_BREW,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
      },
      {
        spell: SPELLS.BLACK_OX_BREW_TALENT,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
      },
      {
        spell: SPELLS.EXPEL_HARM,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
      },
      {
        spell: SPELLS.FORTIFYING_BREW_BRM,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
      },
      {
        spell: SPELLS.HEALING_ELIXIR_TALENT,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 30,
        enabled: combatant.hasTalent(SPELLS.HEALING_ELIXIR_TALENT.id),
      },
      {
        spell: SPELLS.DAMPEN_HARM_TALENT,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 120,
        enabled: combatant.hasTalent(SPELLS.DAMPEN_HARM_TALENT.id),
      },
      {
        spell: SPELLS.ZEN_MEDITATION,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 300,
      },
      // Utility
      {
        spell: SPELLS.LEG_SWEEP_TALENT,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        enabled: combatant.hasTalent(SPELLS.LEG_SWEEP_TALENT.id),
      },
      {
        spell: SPELLS.RING_OF_PEACE_TALENT,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        enabled: combatant.hasTalent(SPELLS.RING_OF_PEACE_TALENT.id),
      },
      {
        spell: SPELLS.CHI_TORPEDO_TALENT,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        enabled: combatant.hasTalent(SPELLS.CHI_TORPEDO_TALENT.id),
      },
      {
        spell: SPELLS.ROLL,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        enabled: !combatant.hasTalent(SPELLS.CHI_TORPEDO_TALENT.id),
      },
      {
        spell: SPELLS.TRANSCENDENCE,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
      },
      {
        spell: SPELLS.TRANSCENDENCE_TRANSFER,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
      },
      {
        spell: SPELLS.INVOKE_NIUZAO_THE_BLACK_OX_TALENT,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        enabled: combatant.hasTalent(SPELLS.INVOKE_NIUZAO_THE_BLACK_OX_TALENT.id),
      },
      {
        spell: SPELLS.SUMMON_BLACK_OX_STATUE_TALENT,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        enabled: combatant.hasTalent(SPELLS.SUMMON_BLACK_OX_STATUE_TALENT.id),
      },
      {
        spell: SPELLS.PARALYSIS,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
      },
      // Its unlikely that these spells will ever be cast but if they are they will show.
      {
        spell: SPELLS.DETOX,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
      },
      {
        spell: SPELLS.EFFUSE,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
      },
      {
        spell: SPELLS.TIGERS_LUST_TALENT,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        enabled: combatant.hasTalent(SPELLS.TIGERS_LUST_TALENT.id),
      },
    ];
  }
}

export default Abilities;
