import { EnergyTracker } from 'analysis/retail/rogue/shared';
import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import Analyzer from 'parser/core/Analyzer';
import { When } from 'parser/core/ParseResults';
import resourceSuggest from 'parser/shared/modules/resources/resourcetracker/ResourceSuggest';
import TALENTS from 'common/TALENTS/rogue';

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
          Try to keep energy below max to avoid waisting <SpellLink spell={SPELLS.COMBAT_POTENCY} />{' '}
          procs.
        </>
      ),
    });

    if (this.selectedCombatant.hasTalent(TALENTS.BLADE_RUSH_TALENT)) {
      resourceSuggest(when, this.energyTracker, {
        spell: SPELLS.BLADE_RUSH_TALENT_BUFF,
        minor: 0.05,
        avg: 0.1,
        major: 0.15,
        extraSuggestion: (
          <>
            Try to keep energy below max to avoid waisting{' '}
            <SpellLink spell={TALENTS.BLADE_RUSH_TALENT} /> gains.
          </>
        ),
      });
    }
  }
}

export default Energy;
