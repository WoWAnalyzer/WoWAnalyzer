import { FocusTracker } from 'analysis/retail/hunter/shared';
import SPELLS from 'common/SPELLS';
import { TALENTS_HUNTER } from 'common/TALENTS';
import { SpellLink } from 'interface';
import Analyzer from 'parser/core/Analyzer';
import { When } from 'parser/core/ParseResults';
import resourceSuggest from 'parser/shared/modules/resources/resourcetracker/ResourceSuggest';

class Focus extends Analyzer {
  static dependencies = {
    focusTracker: FocusTracker,
  };

  protected focusTracker!: FocusTracker;

  suggestions(when: When) {
    const mmFocusExtraSuggestion = (
      <>
        Try to keep focus below max by using <SpellLink spell={TALENTS_HUNTER.AIMED_SHOT_TALENT} />,{' '}
        <SpellLink spell={SPELLS.ARCANE_SHOT} /> and <SpellLink spell={SPELLS.MULTISHOT_MM} />.
      </>
    );
    resourceSuggest(when, this.focusTracker, {
      spell: SPELLS.STEADY_SHOT_FOCUS,
      minor: 0.05,
      avg: 0.075,
      major: 0.125,
      extraSuggestion: mmFocusExtraSuggestion,
    });
    resourceSuggest(when, this.focusTracker, {
      spell: SPELLS.RAPID_FIRE_FOCUS,
      minor: 0.05,
      avg: 0.075,
      major: 0.125,
      extraSuggestion: mmFocusExtraSuggestion,
    });
  }
}

export default Focus;
