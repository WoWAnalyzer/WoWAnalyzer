import React from 'react';

import Analyzer from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS/index';
import SpellLink from 'common/SpellLink';
import resourceSuggest from 'parser/core/modules/resourcetracker/ResourceSuggest';

import ComboPointTracker from '../../../shared/resources/ComboPointTracker';

class ComboPoints extends Analyzer {
  static dependencies = {
    comboPointTracker: ComboPointTracker,
  };

  makeExtraSuggestion(spell) {
    return <React.Fragment>Avoid wasting combo points when casting <SpellLink id={spell.id} /> </React.Fragment>;
  }
  
  get comboPointThresholds() {
    return {
      actual: this.comboPointTracker.wasted / this.comboPointTracker.generated,
      isGreaterThan: {
        minor: 0.05,
        average: 0.1,
        major: 0.15,
      },
      style: 'percentage',
    };
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
      spell: SPELLS.BACKSTAB, // 1 CP
      minor: 0.05,
      avg: 0.10,
      major: 0.15,
      extraSuggestion: this.makeExtraSuggestion(SPELLS.BACKSTAB),
    });
    resourceSuggest(when, this.comboPointTracker, {
      spell: SPELLS.GLOOMBLADE_TALENT, // 1 CP
      minor: 0.05,
      avg: 0.10,
      major: 0.15,
      extraSuggestion: this.makeExtraSuggestion(SPELLS.GLOOMBLADE_TALENT),
    });
    resourceSuggest(when, this.comboPointTracker, {
      spell: SPELLS.SHADOWSTRIKE, // 2 CP
      minor: 0.05,
      avg: 0.10,
      major: 0.15,
      extraSuggestion: this.makeExtraSuggestion(SPELLS.SHADOWSTRIKE),
    });
    resourceSuggest(when, this.comboPointTracker, {
      spell: SPELLS.SHURIKEN_STORM, // 1 CP per target hit
      minor: 0.1,
      avg: 0.2,
      major: 0.3,
      extraSuggestion: this.makeExtraSuggestion(SPELLS.SHURIKEN_STORM),
    });
    resourceSuggest(when, this.comboPointTracker, {
      spell: SPELLS.SHURIKEN_TOSS, // 1 CP
      minor: 0.05,
      avg: 0.10,
      major: 0.15,
      extraSuggestion: this.makeExtraSuggestion(SPELLS.SHURIKEN_TOSS),
    });
    resourceSuggest(when, this.comboPointTracker, {
      spell: SPELLS.SHADOW_TECHNIQUES,
      minor: 0.1,
      avg: 0.2,
      major: 0.3,
      extraSuggestion: <span> Use a weak Aura to track <SpellLink id={SPELLS.SHADOW_TECHNIQUES.id} />. This is an advanced suggestion and should not be addressed first. </span>,
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
