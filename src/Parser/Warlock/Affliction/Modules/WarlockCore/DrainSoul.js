import SPELLS from 'common/SPELLS';
import Analyzer from 'Parser/Core/Analyzer';
import Channeling from 'Parser/Core/Modules/Channeling';

/**
 * DrainSoul doesn't reveal in the combatlog when channeling begins and ends, this fabricates the required events so that ABC can handle it properly.
 */
class DrainSoul extends Analyzer {
  static dependencies = {
    channeling: Channeling,
  };

  on_byPlayer_cast(event) {
    if (event.ability.guid !== SPELLS.DRAIN_SOUL.id) {
      return;
    }
    this.channeling.beginChannel(event);
  }

  // Looking at `removedebuff` will includes progress towards a tick that never happened. This progress could be considered downtime as it accounts for nothing.
  // Except with Malefic Grasp you are still increasing your DoT DPS. So maybe it's still valuable? How far progress into a tick is it more DPS to hold for the next tick before interrupting and casting a next spell?
  // If it's ever decided to consider the time between last tick and channel ending as downtime, just change the endchannel trigger.
  on_byPlayer_removedebuff(event) {
    if (event.ability.guid !== SPELLS.DRAIN_SOUL.id) {
      return;
    }
    this.channeling.endChannel(event);
  }
}

export default DrainSoul;
