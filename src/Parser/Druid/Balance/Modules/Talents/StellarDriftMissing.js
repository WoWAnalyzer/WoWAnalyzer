import React from 'react';

import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import ItemLink from 'common/ItemLink';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import SUGGESTION_IMPORTANCE from 'Parser/Core/ISSUE_IMPORTANCE';

class StellarDriftMissing extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  hasStellarDrift = false;

  on_initialized() {
    this.active = this.combatants.selected.hasFinger(ITEMS.SOUL_OF_THE_ARCHDRUID.id) ||
      this.combatants.selected.hasTalent(SPELLS.STELLAR_FLARE_TALENT.id) ||
      this.combatants.selected.hasTalent(SPELLS.SOUL_OF_THE_FOREST_TALENT_BALANCE.id);
    this.hasStellarDrift = this.combatants.selected.hasTalent(SPELLS.STELLAR_DRIFT_TALENT.id);
  }

  get suggestionThresholds() {
    return {
      actual: this.hasStellarDrift,
      isEqual: false,
      style: 'boolean',
    };
  }

  suggestions(when) {
    when(this.suggestionThresholds).isFalse().addSuggestion((suggest) => {
      return suggest(<React.Fragment>When using <SpellLink id={SPELLS.SOUL_OF_THE_FOREST_TALENT_BALANCE.id} />, <SpellLink id={SPELLS.STELLAR_FLARE_TALENT.id} /> or <ItemLink id={ITEMS.SOUL_OF_THE_ARCHDRUID.id} /> it is recommended to always also use <SpellLink id={SPELLS.STELLAR_DRIFT_TALENT.id} />.</React.Fragment>)
        .icon(SPELLS.STELLAR_DRIFT_TALENT.icon)
        .staticImportance(SUGGESTION_IMPORTANCE.MAJOR);
    });
  }
}

export default StellarDriftMissing;
