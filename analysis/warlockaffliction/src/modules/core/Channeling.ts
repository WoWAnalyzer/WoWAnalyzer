import SPELLS from 'common/SPELLS';
import CoreChanneling from 'parser/shared/modules/Channeling';
import Events, { CastEvent, EndChannelEvent, RemoveDebuffEvent } from 'parser/core/Events';
import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Ability from 'parser/core/modules/Ability';

/**
 * Drain Soul don't reveal in the combatlog when channeling begins and ends, this fabricates the required events so that ABC can handle it properly.
 * Combatlog event order is messy, it often looks like:
 * 1. applydebuff Crackling Jade Lightning
 * 2. begincast/cast new spell
 * 3. removedebuff Crackling Jade Lightning
 * To avoid Drain Soul as being marked "canceled" when we start a new spell we mark it as ended instead on the begincast/cast.
 */
class Channeling extends CoreChanneling {
  constructor(options: Options) {
    super(options);
    this.addEventListener(
      Events.removedebuff.by(SELECTED_PLAYER).spell(SPELLS.DRAIN_SOUL_TALENT),
      this.onRemoveDebuff,
    );
  }

  // TODO: add shared module tracking Drain Life similarly, make this class extend that one instead
  onCast(event: CastEvent) {
    if (event.ability.guid === SPELLS.DRAIN_SOUL_TALENT.id) {
      this.beginChannel(event);
      return;
    }
    super.onCast(event);
  }

  cancelChannel(event: EndChannelEvent, ability: Ability) {
    if (this.isChannelingSpell(SPELLS.DRAIN_SOUL_TALENT.id)) {
      // If a channeling spell is "canceled" it was actually just ended, so if it looks canceled then instead just mark it as ended
      this.log(
        'Marking',
        this._currentChannel.ability.name,
        'as ended since we started casting something else',
      );
      this.endChannel(event);
    } else {
      super.cancelChannel(event, ability);
    }
  }

  // Looking at `removedebuff` will includes progress towards a tick that never happened. This progress could be considered downtime as it accounts for nothing.
  // Except with Malefic Grasp you are still increasing your DoT DPS. So maybe it's still valuable? How far progress into a tick is it more DPS to hold for the next tick before interrupting and casting a next spell?
  // If it's ever decided to consider the time between last tick and channel ending as downtime, just change the endchannel trigger.
  onRemoveDebuff(event: RemoveDebuffEvent) {
    if (!this.isChannelingSpell(SPELLS.DRAIN_SOUL_TALENT.id)) {
      // This may be true if we did the event-order fix in begincast/cast and it was already ended there.
      return;
    }
    this.endChannel(event);
  }
}

export default Channeling;
