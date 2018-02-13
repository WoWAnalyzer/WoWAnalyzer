import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import Wrapper from 'common/Wrapper';
import resourceSuggest from 'Parser/Core/Modules/ResourceTracker/ResourceSuggest';

import ComboPointTracker from '../../../Common/Resources/ComboPointTracker';


class ComboPoints extends Analyzer {
  static dependencies = {
    comboPointTracker: ComboPointTracker,
  };
  

  makeExtraSuggestion(spell) {
    return <Wrapper>Avoid wasting combo points when casting <SpellLink id={spell.id}  />. </Wrapper>;
  }

  suggestions(when) {    
    resourceSuggest(when,  this.comboPointTracker, {
      spell: SPELLS.SABER_SLASH,
      minor: 0,
      avg: 0.05, 
      major: 0.1,
      //TODO - Combine with the bonus Saber slashes
      extraSuggestion: this.makeExtraSuggestion(SPELLS.SABER_SLASH),
    });
    resourceSuggest(when,  this.comboPointTracker, {
      spell: SPELLS.AMBUSH,
      minor: 0,
      avg: 0.1, 
      major: 0.2,
      extraSuggestion: this.makeExtraSuggestion(SPELLS.AMBUSH),
    });
    }
}

export default ComboPoints;
