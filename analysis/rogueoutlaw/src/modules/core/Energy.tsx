import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import Analyzer from 'parser/core/Analyzer';
import { When } from 'parser/core/ParseResults';
import resourceSuggest from 'parser/shared/modules/resources/resourcetracker/ResourceSuggest';
import React from 'react';

import { EnergyTracker } from '@wowanalyzer/rogue';

class Energy extends Analyzer {
  static dependencies = {
    energyTracker: EnergyTracker,
  };
  protected energyTracker!: EnergyTracker;

  suggestions(when: When) {
    resourceSuggest(when, this.energyTracker, {
      spell: SPELLS.COMBAT_POTENCY,
      minor: 0.05,
      avg: 0.1,
      major: 0.15,
      extraSuggestion: (
        <>
          Try to keep energy below max to avoid waisting <SpellLink id={SPELLS.COMBAT_POTENCY.id} />{' '}
          procs.
        </>
      ),
    });

    if (this.selectedCombatant.hasTalent(SPELLS.BLADE_RUSH_TALENT.id)) {
      resourceSuggest(when, this.energyTracker, {
        spell: SPELLS.BLADE_RUSH_TALENT_BUFF,
        minor: 0.05,
        avg: 0.1,
        major: 0.15,
        extraSuggestion: (
          <>
            Try to keep energy below max to avoid waisting{' '}
            <SpellLink id={SPELLS.BLADE_RUSH_TALENT.id} /> gains.
          </>
        ),
      });
    }
  }
}

export default Energy;
