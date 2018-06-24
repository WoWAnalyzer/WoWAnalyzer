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
    return <React.Fragment>Avoid wasting combo points when casting <SpellLink id={spell.id} />.</React.Fragment>;
  }

  makeExtraSuggestion_SS(spell) {
    return <React.Fragment>Avoid wasting combo points when casting <SpellLink id={spell.id} />. Note that some combo point wastage is unavoidable due to second <SpellLink id={SPELLS.SINISTER_STRIKE.id} /> procs during the duration of <SpellLink id={SPELLS.BROADSIDES.id} />.</React.Fragment>;
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
      spell: SPELLS.SINISTER_STRIKE, // 1 CP + 35% chance for another
      minor: 0,
      avg: 0.05,
      major: 0.1,
      //TODO - Combine with the bonus Saber slashes
      extraSuggestion: this.makeExtraSuggestion_SS(SPELLS.SINISTER_STRIKE),
    });
    resourceSuggest(when, this.comboPointTracker, {
      spell: SPELLS.AMBUSH, // 2 CP
      minor: 0,
      avg: 0.1,
      major: 0.2,
      extraSuggestion: this.makeExtraSuggestion(SPELLS.AMBUSH),
    });
    resourceSuggest(when, this.comboPointTracker, {
      spell: SPELLS.PISTOL_SHOT, // 1 CP
      minor: 0,
      avg: 0.1,
      major: 0.2,
      extraSuggestion: this.makeExtraSuggestion(SPELLS.PISTOL_SHOT),
    });
    resourceSuggest(when, this.comboPointTracker, {
      spell: SPELLS.GHOSTLY_STRIKE_TALENT, // 1 CP
      minor: 0,
      avg: 0.1,
      major: 0.2,
      extraSuggestion: this.makeExtraSuggestion(SPELLS.GHOSTLY_STRIKE_TALENT),
    });
    resourceSuggest(when, this.comboPointTracker, {
      spell: SPELLS.CHEAP_SHOT, // 2 CP
      minor: 0,
      avg: 0.1,
      major: 0.2,
      extraSuggestion: this.makeExtraSuggestion(SPELLS.CHEAP_SHOT),
    });
    resourceSuggest(when, this.comboPointTracker, {
      spell: SPELLS.GOUGE, // 1 CP
      minor: 0,
      avg: 0.1,
      major: 0.2,
      extraSuggestion: this.makeExtraSuggestion(SPELLS.GOUGE),
    });
  }
}

export default ComboPoints;
