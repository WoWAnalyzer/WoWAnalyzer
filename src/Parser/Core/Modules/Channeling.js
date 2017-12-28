import Analyzer from 'Parser/Core/Analyzer';
import { formatMilliseconds } from 'common/format';

class Channeling extends Analyzer {
  _currentChannel = null;

  beginChannel(event) {
    this._currentChannel = event;
    this.owner.triggerEvent('beginchannel', {
      type: 'beginchannel',
      timestamp: event.timestamp,
      ability: event.ability,
      reason: event,
    });
  }
  endChannel(event) {
    const start = this._currentChannel ? this._currentChannel.timestamp : this.owner.fight.start_time;
    if (!this._currentChannel) {
      const fightDuration = formatMilliseconds(start - this.owner.fight.start_time);
      console.warn(fightDuration, 'Channeling', event.ability.name, '`endChannel` was called while we weren\'t channeling, assuming it was a pre-combat channel.');
    }
    const duration = event.timestamp - start;
    this._currentChannel = null;
    this.owner.triggerEvent('endchannel', {
      type: 'endchannel',
      timestamp: event.timestamp,
      ability: event.ability,
      duration: duration,
      start,
      reason: event,
    });
  }
  cancelChannel(event, ability) {
    this.owner.triggerEvent('cancelchannel', {
      type: 'cancelchannel',
      ability,
      timestamp: null, // unknown, we can only know when the next cast started so passing the timestamp would be a poor guess
      reason: event,
    });
  }

  on_byPlayer_begincast(event) {
    if (this._currentChannel) {
      this.cancelChannel(event, this._currentChannel.ability);
    }
    this.beginChannel(event);
  }
  on_byPlayer_cast(event) {
    // TODO: Account for pre-pull `begincast`
    const isChanneling = !!this._currentChannel;
    if (!isChanneling) {
      return;
    }
    const isSameSpell = this._currentChannel.ability.guid === event.ability.guid;
    if (!isSameSpell) {
      this.cancelChannel(event, this._currentChannel.ability);
    } else {
      this.endChannel(event);
    }
  }

  // TODO: Move this to SpellTimeline, it's only used for that so it should track it itself
  history = [];
  on_endchannel(event) {
    this.history.push(event);
  }

  // TODO: Re-implement below
  /**
   * Can be used to determine the accuracy of the Haste tracking. This does not work properly on abilities that can get reduced channel times from other effects such as talents or traits.
   */
  // _verifyChannel(spellId, defaultCastTime, begincast, cast) {
  //   if (cast.ability.guid === spellId) {
  //     if (!begincast) {
  //       console.error('Missing begin cast for channeled ability:', cast);
  //       return;
  //     }
  //
  //     const actualCastTime = cast.timestamp - begincast.timestamp;
  //     const expectedCastTime = Math.round(defaultCastTime / (1 + this.haste.current));
  //     if (!this.constructor.inRange(actualCastTime, expectedCastTime, 50)) { // cast times seem to fluctuate by 50ms, not sure if it depends on player latency, in that case it could be a lot more flexible
  //       console.warn(`ABC: ${SPELLS[spellId].name} channel: Expected actual ${actualCastTime}ms to be expected ${expectedCastTime}ms ± 50ms @ ${formatMilliseconds(cast.timestamp - this.owner.fight.start_time)}`, this.combatants.selected.activeBuffs());
  //     }
  //   }
  // }
}

export default Channeling;
