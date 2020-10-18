import SPELLS from 'common/SPELLS';
import Events, { ApplyDebuffEvent, CastEvent, RemoveDebuffEvent, RemoveBuffEvent } from 'parser/core/Events';
import Ability from 'parser/core/modules/Ability';
import CoreChanneling from 'parser/shared/modules/Channeling';
import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';

/**
 * Crackling Jade Lightning don't reveal in the combatlog when channeling begins and ends, this fabricates the required events so that ABC can handle it properly.
 * Combatlog event order is messy, it often looks like:
 * 1. applydebuff Crackling Jade Lightning
 * 2. begincast/cast new spell
 * 3. removedebuff Crackling Jade Lightning
 * To avoid Crackling Jade Lightning as being marked "canceled" when we start a new spell we mark it as ended instead on the begincast/cast.
 */
class Channeling extends CoreChanneling {

  constructor(options: Options){
    super(options);
    this.addEventListener(Events.applydebuff.by(SELECTED_PLAYER).spell(SPELLS.CRACKLING_JADE_LIGHTNING), this.onApplyDebuff);
    this.addEventListener(Events.removedebuff.by(SELECTED_PLAYER).spell(SPELLS.CRACKLING_JADE_LIGHTNING), this.onRemoveDebuff);
    this.addEventListener(Events.removebuff.by(SELECTED_PLAYER).spell([SPELLS.ESSENCE_FONT.id, SPELLS.SOOTHING_MIST]), this.onRemoveBuff);
  }

  onCast(event: CastEvent) {
    if (event.ability.guid === SPELLS.CRACKLING_JADE_LIGHTNING.id) {
      // We track Crackling Jade Lightning differently
      return;
    }
    if (event.ability.guid === SPELLS.ESSENCE_FONT.id || event.ability.guid === SPELLS.SOOTHING_MIST.id) {
      this.beginChannel(event);
      return;
    }
    super.onCast(event);
  }

  cancelChannel(event: CastEvent, ability: Ability) {
    if (this.isChannelingSpell(SPELLS.CRACKLING_JADE_LIGHTNING.id) || this.isChannelingSpell(SPELLS.ESSENCE_FONT.id) || this.isChannelingSpell(SPELLS.SOOTHING_MIST.id)) {
      // If a channeling spell is "canceled" it was actually just ended, so if it looks canceled then instead just mark it as ended
      this.log('Marking', this._currentChannel.ability.name, 'as ended since we started casting something else');
      this.endChannel(event);
    } else {
      super.cancelChannel(event, ability);
    }
  }

  onApplyDebuff(event: ApplyDebuffEvent) {
    this.beginChannel(event);
  }

  // Looking at `removebuff` will includes progress towards a tick that never happened. This progress could be considered downtime as it accounts for nothing.
  // If it's ever decided to consider the time between last tick and channel ending as downtime, just change the endchannel trigger.
  onRemoveDebuff(event: RemoveDebuffEvent) {
    if (!this.isChannelingSpell(SPELLS.CRACKLING_JADE_LIGHTNING.id)) {
      // This may be true if we did the event-order fix in begincast/cast and it was already ended there.
      return;
    }
    this.endChannel(event);
  }
  onRemoveBuff(event: RemoveBuffEvent) {
    if (!this.isChannelingSpell(SPELLS.ESSENCE_FONT.id) || !this.isChannelingSpell(SPELLS.SOOTHING_MIST.id)) {
      // This may be true if we did the event-order fix in begincast/cast and it was already ended there.
      return;
    }
    this.endChannel(event);
  }
}

export default Channeling;
