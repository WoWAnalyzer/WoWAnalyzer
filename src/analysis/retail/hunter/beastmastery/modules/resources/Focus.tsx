import { FocusTracker } from 'analysis/retail/hunter/shared';
import TALENTS from 'common/TALENTS/hunter';
import { SpellLink } from 'interface';
import Analyzer from 'parser/core/Analyzer';
import { When } from 'parser/core/ParseResults';
import resourceSuggest from 'parser/shared/modules/resources/resourcetracker/ResourceSuggest';

import {
  BARBED_SHOT_FOCUS_REGEN_BUFFS,
  FOCUS_THRESHOLD_AVG,
  FOCUS_THRESHOLD_MAJOR,
  FOCUS_THRESHOLD_MINOR,
} from '../../constants';

class Focus extends Analyzer {
  static dependencies = {
    focusTracker: FocusTracker,
  };

  protected focusTracker!: FocusTracker;

  suggestions(when: When) {
    const bmFocusExtraSuggestion = (
      <>
        Try to keep focus below max by using{' '}
        <SpellLink spell={TALENTS.KILL_COMMAND_BEAST_MASTERY_TALENT} /> and{' '}
        <SpellLink spell={TALENTS.COBRA_SHOT_TALENT} />.
      </>
    );
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
