import React from 'react';

import Analyzer from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import resourceSuggest from 'parser/shared/modules/resourcetracker/ResourceSuggest';
import FocusTracker from 'parser/hunter/shared/modules/resources/FocusTracker';
import { FOCUS_THRESHOLD_AVG, FOCUS_THRESHOLD_MAJOR, FOCUS_THRESHOLD_MINOR } from '../../constants';

class Focus extends Analyzer {
  static dependencies = {
    focusTracker: FocusTracker,
  };

  protected focusTracker!: FocusTracker;

  suggestions(when: any) {
    resourceSuggest(when, this.focusTracker, {
      spell: SPELLS.ASPECT_OF_THE_WILD,
      minor: FOCUS_THRESHOLD_MINOR,
      avg: FOCUS_THRESHOLD_AVG,
      major: FOCUS_THRESHOLD_MAJOR,
      extraSuggestion: <>Try to keep focus below max by using <SpellLink id={SPELLS.COBRA_SHOT.id} /> and <SpellLink id={SPELLS.KILL_COMMAND_CAST_BM.id} />.</>,
    });
    resourceSuggest(when, this.focusTracker, {
      spell: [
        SPELLS.BARBED_SHOT_BUFF,
        SPELLS.BARBED_SHOT_BUFF_STACK_2,
        SPELLS.BARBED_SHOT_BUFF_STACK_3,
        SPELLS.BARBED_SHOT_BUFF_STACK_4,
        SPELLS.BARBED_SHOT_BUFF_STACK_5,
        SPELLS.BARBED_SHOT_BUFF_STACK_6,
        SPELLS.BARBED_SHOT_BUFF_STACK_7,
        SPELLS.BARBED_SHOT_BUFF_STACK_8,
      ],
      minor: FOCUS_THRESHOLD_MINOR,
      avg: FOCUS_THRESHOLD_AVG,
      major: FOCUS_THRESHOLD_MAJOR,
      extraSuggestion: <>Try to keep focus below max by using <SpellLink id={SPELLS.COBRA_SHOT.id} /> and <SpellLink id={SPELLS.KILL_COMMAND_CAST_BM.id} />.</>,
    });
  }
}

export default Focus;
