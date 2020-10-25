import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS/index';
import Events from 'parser/core/Events';

const MAX_SOUL_FRAGMENTS = 5;

class SoulFragmentsTracker extends Analyzer {

  // includes wasted generation
  soulsGenerated = 0;

  // souls generated above the maximum 5 that can be held
  overcap = 0;

  soulsSpent = 0;
  currentSouls = 0;

  constructor(options){
    super(options);
    this.addEventListener(Events.changebuffstack.by(SELECTED_PLAYER).spell(SPELLS.SOUL_FRAGMENT_STACK), this.onChangeBuffStack);
  }

  onChangeBuffStack(event) {
    this.currentSouls = event.newStacks;

    if (event.oldStacks > MAX_SOUL_FRAGMENTS) {
      // transitioning from above the max means this isn't souls being spent, but an excess being corrected
      return;
    }

    if (event.oldStacks > event.newStacks) {
      // souls are being spent
      const spent = event.oldStacks - event.newStacks;
      this.soulsSpent += spent;
      return;
    }

    // souls are being generated
    const gained = event.newStacks - event.oldStacks;
    this.soulsGenerated += gained;

    if (event.newStacks > MAX_SOUL_FRAGMENTS) {
      // generating souls above the max
      this.overcap += (event.newStacks - MAX_SOUL_FRAGMENTS);
    }
  }
}

export default SoulFragmentsTracker;
export { MAX_SOUL_FRAGMENTS };
