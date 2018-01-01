import SPELLS from 'common/SPELLS';
import CoreAbilities from 'Parser/Core/Modules/Abilities';
import ISSUE_IMPORTANCE from 'Parser/Core/ISSUE_IMPORTANCE';

class Abilities extends CoreAbilities {
  spellbook() { // TODO: Migrate
    const combatant = this.combatants.selected;
    return [
      {
        spell: SPELLS.VANISH,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 90,
      },
      {
        spell: SPELLS.SHADOW_BLADES, // TODO: Reduced by Convergence of Fates
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 180,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 1.0,
          extraSuggestion: 'In most cases should be used on cooldown',
        },
      },
      {
        spell: SPELLS.SYMBOLS_OF_DEATH,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: (haste, combatant) => (30 - (combatant.hasBuff(SPELLS.SUB_ROGUE_T20_4SET_BONUS.id) ? 5 : 0)),
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.95,
          importance: ISSUE_IMPORTANCE.MAJOR,
          extraSuggestion: 'This is the most important rotational ability, try to always use it on cooldown.',
        },
      },
      {
        spell: SPELLS.SHADOW_DANCE,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: 60,
        charges: 3,
        enabled: combatant.hasTalent(SPELLS.ENVELOPING_SHADOWS_TALENT.id),
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.95,
          importance: ISSUE_IMPORTANCE.MAJOR,
          extraSuggestion: 'Use Shadow Dance before it reaches maximum charges.',
        },
      },
      {
        spell: SPELLS.SHADOW_DANCE,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: 60,
        charges: 2,
        enabled: !combatant.hasTalent(SPELLS.ENVELOPING_SHADOWS_TALENT.id),
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.95,
          importance: ISSUE_IMPORTANCE.MAJOR,
          extraSuggestion: 'Use Shadow Dance before it reaches maximum charges.',
        },
      },
      {
        spell: SPELLS.GOREMAWS_BITE,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 60,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
          // TODO: Track usage separately, not during Dance and with at least 50 energy missing.
          extraSuggestion: 'Use as often as possible without wasting Combo Points and Energy.',
        },
      },
      //No recommendations
      {
        spell: SPELLS.DEATH_FROM_ABOVE_TALENT,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        // TODO: Track separately!
        // This should be used only with Symbols. 
        cooldown: 20,
      },
      {
        spell: SPELLS.NIGHTBLADE,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      },
      {
        spell: SPELLS.EVISCERATE,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      },
      {
        spell: SPELLS.BACKSTAB,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        enabled: !combatant.hasTalent(SPELLS.GLOOMBLADE_TALENT.id),
      },
      {
        spell: SPELLS.GLOOMBLADE_TALENT,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        enabled: combatant.hasTalent(SPELLS.GLOOMBLADE_TALENT.id),
      },
      {
        spell: SPELLS.SHADOWSTRIKE,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      },
      {
        spell: SPELLS.SHURIKEN_STORM,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL_AOE,
      },
      {
        spell: SPELLS.SHURIKEN_TOSS,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      },
      {
        spell: SPELLS.MARKED_FOR_DEATH_TALENT,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        enabled: combatant.hasTalent(SPELLS.MARKED_FOR_DEATH_TALENT.id),
      },
    ];
  }
}

export default Abilities;
