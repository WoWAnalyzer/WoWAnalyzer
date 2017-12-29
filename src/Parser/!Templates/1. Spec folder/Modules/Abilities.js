// import React from 'react';

// import SPELLS from 'common/SPELLS';
// import SpellLink from 'common/SpellLink';

// import ISSUE_IMPORTANCE from 'Parser/Core/ISSUE_IMPORTANCE';

import CoreAbilities from 'Parser/Core/Modules/Abilities';
import SPELLS from 'common/SPELLS';

class Abilities extends CoreAbilities {
  static ABILITIES = [
    ...CoreAbilities.ABILITIES, // this copies all default shared spells, such as for items
    // TODO: Define all abilities available to the spec here
    /**
     * Available properties:
     *
     * required spell {object or array of objects} The spell definition with { id, name and icon }, or an array of spell definitions with the same format. If an array of spell definitions is provided, the first element in the array will be what shows in suggestions / cast timeline. Multiple spell definitions in the same ability can be used to tie multiple cast / buff IDs together as the same ability (with a shared cooldown)
     * optional name {string} the name to use if it is different from the name provided by the `spell` object.
     * required category {string} The name of the category to place this spell in, you should usually use the SPELL_CATEGORIES enum for these values.
     * required getCooldown {func} A function to calculate the cooldown of a spell. Parameters provided: `hastePercentage`, `selectedCombatant`
     * optional isActive {func} Whether the spell is active (available to the player) and should be displayed. This should only be used for hiding spells that are unavailable, for example due to talents. If you have a spell behaving differently with a legendary for example, you can also add that spell twice and use this property to toggle the one applicable. Parameters provided: `selectedCombatant`
     * optional charges {number} The amount of charges the spell has by default.
     * optional recommendedEfficiency {number} The custom recommended cast efficiency. Default is 80% (0.8).
     * optional noCanBeImproved {bool} If this is set to `true`, the Cast Efficiency tab won't show a "can be improved" next to a spell.
     * optional noSuggestion {bool} If this is set to `true`, this spell will not trigger a suggestion.
     * optional extraSuggestion {string} Provide additional information in the suggestion.
     *
     * Rarely necessary:
     * optional isUndetectable {bool} A boolean to indicate it can not be detected whether the player his this spells. This makes it so the spell is hidden when there are 0 casts in the fight. This should only be used for spells that can't be detected if a player has access to them, like racials.
     * optional casts {func} A function to get the amount of casts done of a spell. Parameters provided: `castCount`, `parser`
     * optional maxCasts {func} A function to get the max amount of casts for a spell. Parameters provided: `cooldown`, `fightDuration`, `getAbility`, `parser`
     * optional importance {string} If set, this suggestion will get this static importance value. Use this ISSUE_IMPORTANCE enum for this.
     */
    // Most will look like this:
    {
      spell: SPELLS.JUDGMENT_CAST,
      category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => 12 / (1 + haste),
      isActive: combatant => combatant.hasTalent(SPELLS.JUDGMENT_OF_LIGHT_TALENT.id),
      recommendedEfficiency: 0.85,
      // extraSuggestion: <span>You should cast it whenever <SpellLink id={SPELLS.JUDGMENT_OF_LIGHT_TALENT.id} /> has dropped, which is usually on cooldown without delay. Alternatively you can ignore the debuff and just cast it whenever Judgment is available; there's nothing wrong with ignoring unimportant things to focus on important things.</span>,
    },
  ];
}

export default Abilities;
