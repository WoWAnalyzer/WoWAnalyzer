import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';

import SPELLS from 'common/SPELLS';
import Events, { CastEvent } from 'parser/core/Events';
import { STEADY_FOCUS_MAX_STACKS } from 'parser/hunter/marksmanship/constants';

/**
 * Using Steady Shot twice in a row increases your Haste by 7% for 10 sec.
 *
 * Example log:
 *
 * TODO: Add a statistic to this module and adjust for new version
 */

class SteadyFocus extends Analyzer {

  stacks = 0;

  constructor(options: any) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.STEADY_FOCUS_TALENT.id);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER), this.onCast);
  }

  get steadyFocusStacks() {
    return this.stacks;
  }

  onCast(event: CastEvent) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.STEADY_SHOT.id) {
      if (this.stacks < STEADY_FOCUS_MAX_STACKS) {
        this.stacks += 1;
      }
    } else {
      this.stacks = 0;
    }
  }
}

export default SteadyFocus;
