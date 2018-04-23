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
    return <React.Fragment>Avoid wasting combo points when casting <SpellLink id={spell.id}  /> </React.Fragment>;
  }


  suggestions(when) {    
    resourceSuggest(when,  this.comboPointTracker, {
      spell: SPELLS.BACKSTAB,
      minor: 0.05,
      avg: 0.10, 
      major: 0.15,
      extraSuggestion: this.makeExtraSuggestion(SPELLS.BACKSTAB),
    }); 
    resourceSuggest(when,  this.comboPointTracker, {
      spell: SPELLS.GLOOMBLADE_TALENT,
      minor: 0.05,
      avg: 0.10, 
      major: 0.15,      
      extraSuggestion: this.makeExtraSuggestion(SPELLS.GLOOMBLADE_TALENT),
    });
    resourceSuggest(when,  this.comboPointTracker, {
      spell: SPELLS.SHADOWSTRIKE,
      minor: 0.05,
      avg: 0.10, 
      major: 0.15,
      extraSuggestion: this.makeExtraSuggestion(SPELLS.SHADOWSTRIKE),
    });
    resourceSuggest(when,  this.comboPointTracker, {
      spell: SPELLS.SHURIKEN_STORM,
      minor: 0.1,
      avg: 0.2, 
      major: 0.3,
      extraSuggestion: this.makeExtraSuggestion(SPELLS.SHURIKEN_STORM),
    });
    resourceSuggest(when,  this.comboPointTracker, {
      spell: SPELLS.SHADOW_TECHNIQUES,
      minor: 0.1,
      avg: 0.2, 
      major: 0.3,
      extraSuggestion: <span> Use a weak Aura to track <SpellLink id={SPELLS.SHADOW_TECHNIQUES.id}/>. This is an advanced suggestion and should not be addressed first. </span>,
    });
    resourceSuggest(when,  this.comboPointTracker, {
      spell: SPELLS.GOREMAWS_BITE_ENERGY,
      minor: 0.05,
      avg: 0.1, 
      major: 0.15,
      extraSuggestion: <span> Cast <SpellLink id={SPELLS.GOREMAWS_BITE.id}/> when you are on or below 3 combo points </span>,
    });
    }
}

export default ComboPoints;
