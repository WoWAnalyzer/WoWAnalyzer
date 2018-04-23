import React from 'react';

import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import ItemLink from 'common/ItemLink';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import SUGGESTION_IMPORTANCE from 'Parser/Core/ISSUE_IMPORTANCE';

class StellarFlare extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  hasSoulOfTheArchdruid = false;

  on_initialized() {
    this.active = this.combatants.selected.hasTalent(SPELLS.STELLAR_FLARE_TALENT.id);
    this.hasSoulOfTheArchdruid = this.combatants.selected.hasFinger(ITEMS.SOUL_OF_THE_ARCHDRUID.id);
  }

  get suggestionThresholds() {
    return {
      actual: this.hasSoulOfTheArchdruid,
      isEqual: false,
      style: 'boolean',
    };
  }

  suggestions(when) {
    when(this.suggestionThresholds).isFalse().addSuggestion((suggest) => {
      return suggest(<React.Fragment>It is recommended that you always use <ItemLink id={ITEMS.SOUL_OF_THE_ARCHDRUID.id} /> when using <SpellLink id={SPELLS.STELLAR_FLARE_TALENT.id} />.</React.Fragment>)
        .icon(SPELLS.STELLAR_FLARE_TALENT.icon)
        .staticImportance(SUGGESTION_IMPORTANCE.MAJOR);
    });
  }
}

export default StellarFlare;
