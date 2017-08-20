import SPELLS from 'common/SPELLS';
import CoreCastEfficiency from 'Parser/Core/Modules/CastEfficiency';

const SPELL_CATEGORY = {
  ROTATIONAL: 'Rotational Spell',
  COOLDOWNS: 'Cooldown',
  UTILITY: 'Utility',
};

class CastEfficiency extends CoreCastEfficiency {
  static CPM_ABILITIES = [
    // Rotational Spells
    {
      spell: SPELLS.KEG_SMASH,
      category: SPELL_CATEGORY.ROTATIONAL,
      getCooldown: haste => 8 / (1 + haste),
    },
    {
      spell: SPELLS.BLACKOUT_STRIKE,
      category: SPELL_CATEGORY.ROTATIONAL,
      getCooldown: haste => 3,
    },
    {
      spell: SPELLS.BREATH_OF_FIRE,
      category: SPELL_CATEGORY.ROTATIONAL,
      getCooldown: haste => 15,
    },
    {
      spell: SPELLS.TIGER_PALM,
      category: SPELL_CATEGORY.ROTATIONAL,
      getCooldown: haste => null,
    },
    {
      spell: SPELLS.EXPLODING_KEG,
      category: SPELL_CATEGORY.ROTATIONAL,
      getCooldown: haste => 75,
      extraSuggestion: 'You need to use this ability as close to on cooldown as possible. Get in the habbit of using this ability as it is our only \'cast on cooldown\' ability.',
    },
    {
      spell: SPELLS.RUSHING_JADE_WIND_TALENT,
      category: SPELL_CATEGORY.ROTATIONAL,
      getCooldown: haste => 6 / (1 + haste),
    },
    // Cooldowns
    {
      spell: SPELLS.IRONSKIN_BREW,
      category: SPELL_CATEGORY.COOLDOWNS,
      getCooldown: haste => null,      
      charges:3,
    },
    // Utility
    {
      spell: SPELLS.LEG_SWEEP_TALENT,
      category: SPELL_CATEGORY.UTILITY,
      getCooldown: haste => null,      
      charges:1,
      isActive: combatant => combatant.hasTalent(SPELLS.LEG_SWEEP_TALENT.id),
      noSuggestion: true,
    },
   
  ];
  static SPELL_CATEGORIES = SPELL_CATEGORY;
}

export default CastEfficiency;
