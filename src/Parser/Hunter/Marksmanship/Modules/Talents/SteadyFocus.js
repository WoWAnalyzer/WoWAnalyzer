import Analyzer from 'Parser/Core/Analyzer';

import SPELLS from 'common/SPELLS';

/**
 * Using Steady Shot reduces the cast time of Steady Shot by 20%, stacking up to 2 times.  Using any other shot removes this effect. *
 * Example log: https://www.warcraftlogs.com/reports/ChbVRqzQ8Z6najGB#fight=3&type=auras&source=3
 */
class SteadyFocus extends Analyzer {

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.STEADY_FOCUS_TALENT.id);
  }

  stacks = 0;

  getSteadyFocusStacks() {
    return this.stacks;
  }

  on_byPlayer_applybuff(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.STEADY_FOCUS_BUFF.id) {
      return;
    }
    this.stacks = 1;
  }
  on_byPlayer_applybuffstack(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.STEADY_FOCUS_BUFF.id) {
      return;
    }
    this.stacks = event.stack;
  }
  on_byPlayer_removebuff(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.STEADY_FOCUS_BUFF.id) {
      return;
    }
    this.stacks = 0;
  }
}

export default SteadyFocus;
