import React from 'react';

import Analyzer from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import resourceSuggest from 'parser/shared/modules/resources/resourcetracker/ResourceSuggest';

import { When } from 'parser/core/ParseResults';

import ComboPointTracker from '../../../shared/resources/ComboPointTracker';

class ComboPoints extends Analyzer {
  static dependencies = {
    comboPointTracker: ComboPointTracker,
  };

  protected comboPointTracker!: ComboPointTracker;

  makeExtraSuggestion(spellId: number) {
    return (
      <>
        Avoid wasting combo points when casting <SpellLink id={spellId} />. Combo points for Seal
        Fate are not considered.{' '}
      </>
    );
  }

  suggestions(when: When) {
    resourceSuggest(when, this.comboPointTracker, {
      spell: SPELLS.MARKED_FOR_DEATH_TALENT, // 5 CP
      minor: 0,
      avg: 0.05,
      major: 0.1,
      extraSuggestion: this.makeExtraSuggestion(SPELLS.MARKED_FOR_DEATH_TALENT.id),
    });
    resourceSuggest(when, this.comboPointTracker, {
      spell: SPELLS.MUTILATE, // 2 CP
      minor: 0,
      avg: 0.05,
      major: 0.1,
      extraSuggestion: this.makeExtraSuggestion(SPELLS.MUTILATE.id),
    });
    resourceSuggest(when, this.comboPointTracker, {
      spell: SPELLS.GARROTE, // 1 CP
      minor: 0,
      avg: 0.1,
      major: 0.2,
      extraSuggestion: this.makeExtraSuggestion(SPELLS.GARROTE.id),
    });
    resourceSuggest(when, this.comboPointTracker, {
      spell: SPELLS.FAN_OF_KNIVES, // 1 CP
      minor: 0,
      avg: 0.05,
      major: 0.1,
      extraSuggestion: this.makeExtraSuggestion(SPELLS.FAN_OF_KNIVES.id),
    });
    resourceSuggest(when, this.comboPointTracker, {
      spell: SPELLS.BLINDSIDE_TALENT, // 1 CP
      minor: 0,
      avg: 0.05,
      major: 0.1,
      extraSuggestion: this.makeExtraSuggestion(SPELLS.BLINDSIDE_TALENT.id),
    });
    resourceSuggest(when, this.comboPointTracker, {
      spell: SPELLS.POISONED_KNIFE, // 1 CP
      minor: 0,
      avg: 0.05,
      major: 0.1,
      extraSuggestion: this.makeExtraSuggestion(SPELLS.POISONED_KNIFE.id),
    });
    resourceSuggest(when, this.comboPointTracker, {
      spell: SPELLS.CHEAP_SHOT, // 2 CP
      minor: 0,
      avg: 0.1,
      major: 0.2,
      extraSuggestion: this.makeExtraSuggestion(SPELLS.CHEAP_SHOT.id),
    });
  }
}

export default ComboPoints;
