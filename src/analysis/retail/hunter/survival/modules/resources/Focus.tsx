import { FocusTracker } from 'analysis/retail/hunter/shared';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/hunter';
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
    resourceSuggest(when, this.focusTracker, {
      spell: SPELLS.KILL_COMMAND_CAST_SV,
      minor: 0.025,
      avg: 0.05,
      major: 0.1,
      extraSuggestion: (
        <>
          Try to keep focus below max by using <SpellLink id={SPELLS.SERPENT_STING_SV.id} />,{' '}
          <SpellLink id={TALENTS.MONGOOSE_BITE_TALENT.id} /> or{' '}
          <SpellLink id={SPELLS.RAPTOR_STRIKE.id} />.
        </>
      ),
    });
  }
}

export default Focus;
