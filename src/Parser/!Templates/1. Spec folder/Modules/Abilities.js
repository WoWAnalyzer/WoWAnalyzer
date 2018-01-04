// import React from 'react';

// import SPELLS from 'common/SPELLS';
// import SpellLink from 'common/SpellLink';

// import ISSUE_IMPORTANCE from 'Parser/Core/ISSUE_IMPORTANCE';

import CoreAbilities from 'Parser/Core/Modules/Abilities';
import SPELLS from 'common/SPELLS';

class Abilities extends CoreAbilities {
  spellbook() {
    const combatant = this.combatants.selected;
    return [
      // TODO: Define all abilities available to the spec here
      /**
       * For a list of avbailable properties see the Ability class.
       */
      // Most will look like this:
      {
        spell: SPELLS.JUDGMENT_CAST,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: haste => 12 / (1 + haste),
        enabled: combatant.hasTalent(SPELLS.JUDGMENT_OF_LIGHT_TALENT.id),
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.85,
          // extraSuggestion: <span>You should cast it whenever <SpellLink id={SPELLS.JUDGMENT_OF_LIGHT_TALENT.id} /> has dropped, which is usually on cooldown without delay. Alternatively you can ignore the debuff and just cast it whenever Judgment is available; there's nothing wrong with ignoring unimportant things to focus on important things.</span>,
        },
      },
    ];
  }
}

export default Abilities;
