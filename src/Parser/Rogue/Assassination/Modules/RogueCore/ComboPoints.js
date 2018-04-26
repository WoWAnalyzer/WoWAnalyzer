import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import resourceSuggest from 'Parser/Core/Modules/ResourceTracker/ResourceSuggest';

import ComboPointTracker from '../../../Common/Resources/ComboPointTracker';


class ComboPoints extends Analyzer {
  static dependencies = {
    comboPointTracker: ComboPointTracker,
  };
  

  makeExtraSuggestion(spell) {
    return <React.Fragment>Avoid wasting combo points when casting <SpellLink id={spell.id}  />. Combo points for Seal Fate are not considered. </React.Fragment>;
  }

  suggestions(when) {    
    resourceSuggest(when,  this.comboPointTracker, {
      spell: SPELLS.MUTILATE,
      minor: 0,
      avg: 0.05, 
      major: 0.1,
      extraSuggestion: this.makeExtraSuggestion(SPELLS.MUTILATE),
    });
    resourceSuggest(when,  this.comboPointTracker, {
      spell: SPELLS.GARROTE,
      minor: 0,
      avg: 0.1, 
      major: 0.2,
      extraSuggestion: this.makeExtraSuggestion(SPELLS.GARROTE),
    });
    resourceSuggest(when,  this.comboPointTracker, {
      spell: SPELLS.FAN_OF_KNIVES,
      minor: 0,
      avg: 0.05, 
      major: 0.1,
      extraSuggestion: this.makeExtraSuggestion(SPELLS.FAN_OF_KNIVES),
    });
    }
}

export default ComboPoints;
