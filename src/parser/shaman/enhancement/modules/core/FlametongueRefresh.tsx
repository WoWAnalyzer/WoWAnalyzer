import SPELLS from 'common/SPELLS';
import EarlyBuffRefreshes from 'parser/shared/modules/earlybuffrefreshes/EarlyBuffRefreshes';
import countSuggestion from 'parser/shared/modules/earlybuffrefreshes/EarlyBuffRefreshesCountSuggestion';
import { FLAMETONGUE_BUFF_DURATION_MS } from '../../constants';

class FlametongueRefresh extends EarlyBuffRefreshes {
  public spell = SPELLS.FLAMETONGUE;
  public buff = SPELLS.FLAMETONGUE_BUFF;
  protected duration = FLAMETONGUE_BUFF_DURATION_MS;

  constructor(options: any) {
    super(options);

    // If Searing Assult talent is chosen, the player will want to cast
    // Flametongue alot more often to maximie the talent. Making any
    // suggestions regarding Flametongue Refreshes unnecessary.
    if (this.selectedCombatant.hasTalent(SPELLS.SEARING_ASSAULT_TALENT.id)) {
      this.active = false;
      return;
    }
  }

  get flametongueEarlyRefreshThreshold() {
    return {
      actual: this.earlyRefreshes,
      isGreaterThan: {
        minor: 0,
        average: 3,
        major: 5,
      },
      style: 'number',
    };
  }

  suggestions(when: any) {
    countSuggestion(when, this.flametongueEarlyRefreshThreshold, this);
  }
}

export default FlametongueRefresh;
