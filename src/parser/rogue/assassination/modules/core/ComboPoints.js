import React from 'react';

import Analyzer from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import resourceSuggest from 'parser/core/modules/resourcetracker/ResourceSuggest';

import ComboPointTracker from '../../../shared/resources/ComboPointTracker';

class ComboPoints extends Analyzer {
  static dependencies = {
    comboPointTracker: ComboPointTracker,
  };

  makeExtraSuggestion(spell) {
    return <React.Fragment>Avoid wasting combo points when casting <SpellLink id={spell.id} />. Combo points for Seal Fate are not considered. </React.Fragment>;
  }

  suggestions(when) {
    resourceSuggest(when, this.comboPointTracker, {
      spell: SPELLS.MARKED_FOR_DEATH_TALENT, // 5 CP
      minor: 0,
      avg: 0.05,
      major: 0.1,
      extraSuggestion: this.makeExtraSuggestion(SPELLS.MARKED_FOR_DEATH_TALENT),
    });
    resourceSuggest(when, this.comboPointTracker, {
      spell: SPELLS.MUTILATE, // 2 CP
      minor: 0,
      avg: 0.05,
      major: 0.1,
      extraSuggestion: this.makeExtraSuggestion(SPELLS.MUTILATE),
    });
    resourceSuggest(when, this.comboPointTracker, {
      spell: SPELLS.GARROTE, // 1 CP
      minor: 0,
      avg: 0.1,
      major: 0.2,
      extraSuggestion: this.makeExtraSuggestion(SPELLS.GARROTE),
    });
    resourceSuggest(when, this.comboPointTracker, {
      spell: SPELLS.FAN_OF_KNIVES, // 1 CP
      minor: 0,
      avg: 0.05,
      major: 0.1,
      extraSuggestion: this.makeExtraSuggestion(SPELLS.FAN_OF_KNIVES),
    });
    resourceSuggest(when, this.comboPointTracker, {
      spell: SPELLS.BLINDSIDE_TALENT, // 1 CP
      minor: 0,
      avg: 0.05,
      major: 0.1,
      extraSuggestion: this.makeExtraSuggestion(SPELLS.BLINDSIDE_TALENT),
    });
    resourceSuggest(when, this.comboPointTracker, {
      spell: SPELLS.POISONED_KNIFE, // 1 CP
      minor: 0,
      avg: 0.05,
      major: 0.1,
      extraSuggestion: this.makeExtraSuggestion(SPELLS.POISONED_KNIFE),
    });
    resourceSuggest(when, this.comboPointTracker, {
      spell: SPELLS.TOXIC_BLADE_TALENT, // 1 CP
      minor: 0,
      avg: 0.05,
      major: 0.1,
      extraSuggestion: this.makeExtraSuggestion(SPELLS.TOXIC_BLADE_TALENT),
    });
    resourceSuggest(when, this.comboPointTracker, {
      spell: SPELLS.CHEAP_SHOT, // 2 CP
      minor: 0,
      avg: 0.1,
      major: 0.2,
      extraSuggestion: this.makeExtraSuggestion(SPELLS.CHEAP_SHOT),
    });
  }
}

export default ComboPoints;
