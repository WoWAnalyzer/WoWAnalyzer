import SPELLS from 'common/SPELLS';
import CoreAbilities from 'Parser/Core/Modules/Abilities';
import ISSUE_IMPORTANCE from 'Parser/Core/ISSUE_IMPORTANCE';

/* eslint-disable no-unused-vars */

class Abilities extends CoreAbilities {
  static ABILITIES = [
    {
      spell: SPELLS.VANISH,
      category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: haste => 90,
      // Vanish is often delayed.
      // TODO: Add suggestions for usage based on gear and talents 
      recommendedEfficiency: 0.90,
      noSuggestion: true,
      noCanBeImproved: true,
    },
    {
      spell: SPELLS.SHADOW_BLADES, // TODO: Reduced by Convergence of Fates
      category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: haste => 180,
      recommendedEfficiency: 1.0,
      extraSuggestion: "In most cases should be used on cooldown", 
    },
    {
      spell: SPELLS.SYMBOLS_OF_DEATH,
      category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: (haste, combatant) => (30 - (combatant.hasBuff(SPELLS.SUB_ROGUE_T20_4SET_BONUS.id) ? 5 : 0)), 
      recommendedEfficiency: 0.95,
      importance: ISSUE_IMPORTANCE.MAJOR,
      extraSuggestion: "This is the most important rotational ability, try to always use it on cooldown.",      
    },
    {
      spell: SPELLS.SHADOW_DANCE,
      category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => 60, 
      charges: 3,
      recommendedEfficiency: 0.95,
      importance: ISSUE_IMPORTANCE.MAJOR,
      isActive: combatant => combatant.hasTalent(SPELLS.ENVELOPING_SHADOWS_TALENT.id),
      extraSuggestion: "Use Shadow Dance before it reaches maximum charges.",     
    },
    {
      spell: SPELLS.SHADOW_DANCE,
      category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => 60, 
      charges: 2,
      recommendedEfficiency: 0.95,
      importance: ISSUE_IMPORTANCE.MAJOR,
      isActive: combatant => !combatant.hasTalent(SPELLS.ENVELOPING_SHADOWS_TALENT.id),
      extraSuggestion: "Use Shadow Dance before it reaches maximum charges.",     
    },
    {
      spell: SPELLS.GOREMAWS_BITE,
      category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: haste => 60,
      recommendedEfficiency: 0.9,
      // TODO: Track usage separately, not during Dance and with at least 50 energy missing. 
      extraSuggestion: "Use as often as possible without wasting Combo Points and Energy.", 
    },   
    //No recommendations 
    {      
      spell: SPELLS.DEATH_FROM_ABOVE_TALENT,
      category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      // TODO: Track separately!
      // This should be used only with Symbols. 
      getCooldown: haste => 20,
      noSuggestion: true,
      noCanBeImproved: true,
    },    
    {
      spell: SPELLS.NIGHTBLADE,
      category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => null,
    },    
    {
      spell: SPELLS.EVISCERATE,
      category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => null,
    },    
    {
      spell: SPELLS.BACKSTAB,
      category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      isActive: combatant => !combatant.hasTalent(SPELLS.GLOOMBLADE_TALENT.id),
      getCooldown: haste => null,
    },       
    {
      spell: SPELLS.GLOOMBLADE_TALENT,
      category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      isActive: combatant => combatant.hasTalent(SPELLS.GLOOMBLADE_TALENT.id),
      getCooldown: haste => null,
    }, 
    {
      spell: SPELLS.SHADOWSTRIKE,
      category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => null,
    }, 
    {
      spell: SPELLS.SHURIKEN_STORM,
      category: Abilities.SPELL_CATEGORIES.ROTATIONAL_AOE,
      getCooldown: haste => null,
    },
    {
      spell: SPELLS.SHURIKEN_TOSS,
      category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => null,
    },    
    {
      spell: SPELLS.MARKED_FOR_DEATH_TALENT,
      category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      isActive: combatant => combatant.hasTalent(SPELLS.MARKED_FOR_DEATH_TALENT.id),
      getCooldown: haste => null,
    },
  ];
}

export default Abilities;
