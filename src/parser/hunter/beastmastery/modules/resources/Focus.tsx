import React from 'react';

import Analyzer from 'parser/core/Analyzer';
import { When } from 'parser/core/ParseResults';
import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import resourceSuggest from 'parser/shared/modules/resources/resourcetracker/ResourceSuggest';
import FocusTracker from 'parser/hunter/shared/modules/resources/FocusTracker';

import { BARBED_SHOT_FOCUS_REGEN_BUFFS, FOCUS_THRESHOLD_AVG, FOCUS_THRESHOLD_MAJOR, FOCUS_THRESHOLD_MINOR } from '../../constants';

class Focus extends Analyzer {
  static dependencies = {
    focusTracker: FocusTracker,
  };

  protected focusTracker!: FocusTracker;

  suggestions(when: When) {
    const bmFocusExtraSuggestion = <>Try to keep focus below max by using <SpellLink id={SPELLS.COBRA_SHOT.id} /> and <SpellLink id={SPELLS.KILL_COMMAND_CAST_BM.id} />.</>;
    resourceSuggest(when, this.focusTracker, {
      spell: SPELLS.ASPECT_OF_THE_WILD,
      minor: FOCUS_THRESHOLD_MINOR,
      avg: FOCUS_THRESHOLD_AVG,
      major: FOCUS_THRESHOLD_MAJOR,
      extraSuggestion: bmFocusExtraSuggestion,
    });
    resourceSuggest(when, this.focusTracker, {
      spell: BARBED_SHOT_FOCUS_REGEN_BUFFS,
      minor: FOCUS_THRESHOLD_MINOR,
      avg: FOCUS_THRESHOLD_AVG,
      major: FOCUS_THRESHOLD_MAJOR,
      extraSuggestion: bmFocusExtraSuggestion,
    });
  }
}

export default Focus;
