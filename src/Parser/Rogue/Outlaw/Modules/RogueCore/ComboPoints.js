import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/SPELLS/TALENTS';
import SpellLink from 'common/SpellLink';
import Wrapper from 'common/Wrapper';
import resourceSuggest from 'Parser/Core/Modules/ResourceTracker/ResourceSuggest';

import ComboPointTracker from '../../../Common/Resources/ComboPointTracker';


class ComboPoints extends Analyzer {
  static dependencies = {
    comboPointTracker: ComboPointTracker,
  };
  

  makeExtraSuggestion(spell) {
    return <Wrapper>Avoid wasting combo points when casting <SpellLink id={spell.id}  />. Note that some combo point wastage is unavoidable due to second saber slash procs during the duration of <SpellLink id={193356}  />.  </Wrapper>;
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
  	resourceSuggest(when,  this.comboPointTracker, {
      spell: SPELLS.PISTOL_SHOT,
      minor: 0,
      avg: 0.1, 
      major: 0.2,
      extraSuggestion: this.makeExtraSuggestion(SPELLS.PISTOL_SHOT),
    });
  	resourceSuggest(when,  this.comboPointTracker, {
      spell: SPELLS.BLUNDERBUSS,
      minor: 0,
      avg: 0.1, 
      major: 0.2,
      extraSuggestion: this.makeExtraSuggestion(SPELLS.BLUNDERBUSS),
    });
    resourceSuggest(when,  this.comboPointTracker, {
      spell: TALENTS.GHOSTLY_STRIKE_TALENT,
      minor: 0,
      avg: 0.1, 
      major: 0.2,
      extraSuggestion: this.makeExtraSuggestion(TALENTS.GHOSTLY_STRIKE_TALENT),
    });
    }
}

export default ComboPoints;
