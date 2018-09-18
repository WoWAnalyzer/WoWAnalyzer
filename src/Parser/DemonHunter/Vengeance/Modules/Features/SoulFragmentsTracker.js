import Analyzer from 'Parser/Core/Analyzer';
import SPELLS from 'common/SPELLS/index';

const MAX_SOUL_FRAGMENTS = 5;

class SoulFragmentsTracker extends Analyzer {

  // includes wasted generation
  soulsGenerated = 0;

  // souls generated above the maximum 5 that can be held
  soulsWasted = 0;

  soulsSpent = 0;
  currentSouls = 0;

  soulsConsumedBySpell = [];

  on_byPlayer_changebuffstack(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.SOUL_FRAGMENT_STACK.id) {
      return;
    }

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
      this.soulsWasted += (event.newStacks - MAX_SOUL_FRAGMENTS);
    }
  }
}

export default SoulFragmentsTracker;
export { MAX_SOUL_FRAGMENTS };
