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
      spell: SPELLS.EXPLODING_KEG,
      category: SPELL_CATEGORY.ROTATIONAL,
      getCooldown: haste => 75,
      extraSuggestion: 'You need to use this ability as close to on cooldown as possible. Get in the habbit of using this ability as it is our only \'cast on cooldown\' ability.',
    },
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
      spell: SPELLS.TIGER_PALM,
      category: SPELL_CATEGORY.ROTATIONAL,
      getCooldown: haste => 3,
    },
    {
      spell: SPELLS.BREATH_OF_FIRE,
      category: SPELL_CATEGORY.ROTATIONAL,
      getCooldown: haste => 15,
    },
    // Cooldowns
    {
      spell: SPELLS.IRONSKIN_BREW,
      category: SPELL_CATEGORY.COOLDOWNS,
      // Has a 21s CD modified by haste but then this is further reduced by additional time when using other abilities
      getCooldown: haste => null,      
      charges:3,
    },
  ];
  static SPELL_CATEGORIES = SPELL_CATEGORY;
}

export default CastEfficiency;
