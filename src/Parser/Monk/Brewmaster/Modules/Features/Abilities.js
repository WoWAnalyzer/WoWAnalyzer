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
        isOnGCD: true,
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
        isOnGCD: true,
      },
      {
        spell: SPELLS.BLACKOUT_STRIKE,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: 3,
        castEfficiency: {
          suggestion: true,
        },
        isOnGCD: true,
      },
      {
        spell: SPELLS.BREATH_OF_FIRE,
        isDefensive: true,
        buffSpellId: SPELLS.BREATH_OF_FIRE_DEBUFF.id,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: 15,
        isOnGCD: true,
      },
      {
        spell: SPELLS.TIGER_PALM,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        isOnGCD: true,
      },
      {
        spell: SPELLS.RUSHING_JADE_WIND_TALENT,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: haste => 6 / (1 + haste),
        enabled: combatant.hasTalent(SPELLS.RUSHING_JADE_WIND_TALENT.id),
        isOnGCD: true,
      },
      {
        spell: SPELLS.CRACKLING_JADE_LIGHTNING,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        isOnGCD: true,
      },
      // Cooldowns
      {
        // it is possible to refer to the shared CD using *either* spell
        // id
        spell: [SPELLS.IRONSKIN_BREW, SPELLS.PURIFYING_BREW],
        buffSpellId: SPELLS.IRONSKIN_BREW_BUFF.id,
        category: Abilities.SPELL_CATEGORIES.DEFENSIVE,
        cooldown: haste => 14 / (1 + haste),
        charges: 3,
        isOnGCD: false,
      },
      {
        spell: SPELLS.BLACK_OX_BREW_TALENT,
        category: Abilities.SPELL_CATEGORIES.DEFENSIVE,
        cooldown: 120,
        castEfficiency: {
          suggestion: false,
          recommendedEfficiency: 0.7,
        },
        enabled: combatant.hasTalent(SPELLS.BLACK_OX_BREW_TALENT.id),
        isOnGCD: false,
      },
      {
        spell: SPELLS.GUARD_TALENT,
        category: Abilities.SPELL_CATEGORIES.DEFENSIVE,
        cooldown: 30,
        castEfficiency: {
          suggestion: false,
          recommendedEfficiency: 0.7,
        },
        enabled: combatant.hasTalent(SPELLS.GUARD_TALENT.id),
        isOnGCD: true,
      },
      {
        spell: SPELLS.EXPEL_HARM,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        isOnGCD: true,
      },
      {
        spell: SPELLS.FORTIFYING_BREW_BRM,
        buffSpellId: SPELLS.FORTIFYING_BREW_BRM_BUFF.id,
        category: Abilities.SPELL_CATEGORIES.DEFENSIVE,
        cooldown: 420,
        isOnGCD: false,
      },
      {
        spell: SPELLS.HEALING_ELIXIR_TALENT,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 30,
        enabled: combatant.hasTalent(SPELLS.HEALING_ELIXIR_TALENT.id),
        isOnGCD: true,
      },
      {
        spell: SPELLS.DAMPEN_HARM_TALENT,
        buffSpellId: SPELLS.DAMPEN_HARM_TALENT.id,
        category: Abilities.SPELL_CATEGORIES.DEFENSIVE,
        cooldown: 120,
        enabled: combatant.hasTalent(SPELLS.DAMPEN_HARM_TALENT.id),
        isOnGCD: false,
      },
      {
        spell: SPELLS.ZEN_MEDITATION,
        buffSpellId: SPELLS.ZEN_MEDITATION.id,
        category: Abilities.SPELL_CATEGORIES.DEFENSIVE,
        cooldown: 300,
        isOnGCD: false,
      },
      // Utility
      {
        spell: SPELLS.LEG_SWEEP_TALENT,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        enabled: combatant.hasTalent(SPELLS.LEG_SWEEP_TALENT.id),
        isOnGCD: true,
      },
      {
        spell: SPELLS.RING_OF_PEACE_TALENT,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        enabled: combatant.hasTalent(SPELLS.RING_OF_PEACE_TALENT.id),
        isOnGCD: true,
      },
      {
        spell: SPELLS.CHI_TORPEDO_TALENT,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        enabled: combatant.hasTalent(SPELLS.CHI_TORPEDO_TALENT.id),
        isOnGCD: true,
      },
      {
        spell: SPELLS.ROLL,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        enabled: !combatant.hasTalent(SPELLS.CHI_TORPEDO_TALENT.id),
        isOnGCD: true,
      },
      {
        spell: SPELLS.TRANSCENDENCE,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        isOnGCD: true,
      },
      {
        spell: SPELLS.TRANSCENDENCE_TRANSFER,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        isOnGCD: true,
      },
      {
        spell: SPELLS.INVOKE_NIUZAO_THE_BLACK_OX_TALENT,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        enabled: combatant.hasTalent(SPELLS.INVOKE_NIUZAO_THE_BLACK_OX_TALENT.id),
        cooldown: 180,
        isOnGCD: false,
      },
      {
        spell: SPELLS.SUMMON_BLACK_OX_STATUE_TALENT,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        enabled: combatant.hasTalent(SPELLS.SUMMON_BLACK_OX_STATUE_TALENT.id),
        isOnGCD: true,
      },
      {
        spell: SPELLS.PARALYSIS,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        isOnGCD: true,
      },
      // Its unlikely that these spells will ever be cast but if they are they will show.
      {
        spell: SPELLS.DETOX,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        isOnGCD: true,
      },
      {
        spell: SPELLS.VIVIFY, // don't know if the vivify spell has been updated to the new ID yet
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        isOnGCD: true,
      },
      {
        spell: SPELLS.TIGERS_LUST_TALENT,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        enabled: combatant.hasTalent(SPELLS.TIGERS_LUST_TALENT.id),
        isOnGCD: true,
      },
    ];
  }
}

export default Abilities;
