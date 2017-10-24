import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import Analyzer from 'Parser/Core/Analyzer';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

import SecondSunrise from '../Traits/SecondSunrise';

class LightOfDawn extends Analyzer {
  static dependencies = {
    secondSunrise: SecondSunrise,
  };

  /**
   * when you cast Light of Dawn and you yourself are one of the targets the heal event will be in the events log before the cast event. This can make parsing certain things rather hard, so we need to swap them around.
   * @param {Array} events
   * @returns {Array}
   */
  reorderEvents(events) {
    const fixedEvents = [];
    events.forEach((event, eventIndex) => {
      fixedEvents.push(event);

      if (event.type === 'cast' && event.ability.guid === SPELLS.LIGHT_OF_DAWN_CAST.id) {
        const castTimestamp = event.timestamp;

        // Loop through the event history in reverse to detect if there was a `heal` event on the same player that was the result of this cast and thus misordered
        for (let previousEventIndex = eventIndex; previousEventIndex >= 0; previousEventIndex -= 1) {
          const previousEvent = fixedEvents[previousEventIndex];
          if ((castTimestamp - previousEvent.timestamp) > 50) { // the max delay between the heal and cast events never looks to be more than this.
            break;
          }
          if (previousEvent.type === 'heal' && previousEvent.ability.guid === SPELLS.LIGHT_OF_DAWN_HEAL.id && previousEvent.sourceID === event.sourceID) {
            fixedEvents.splice(previousEventIndex, 1);
            fixedEvents.push(previousEvent);
            previousEvent.__modified = true;
            break; // I haven't seen a log with multiple `heal` events before the `cast` yet
          }
        }
      }
    });

    return fixedEvents;
  }

  _lightOfDawnHealIndex = 0;
  casts = 0;
  heals = 0;

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.LIGHT_OF_DAWN_CAST.id) {
      return;
    }

    this._lightOfDawnHealIndex = 0;
    this.casts += 1;
  }

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.LIGHT_OF_DAWN_HEAL.id) {
      return;
    }

    event.lightOfDawnHealIndex = this._lightOfDawnHealIndex;
    this._lightOfDawnHealIndex += 1;
    this.heals += 1;
  }
  statistic() {
    const totalCastsIncludingDp = this.casts + this.secondSunrise.procs;
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.LIGHT_OF_DAWN_CAST.id} />}
        value={`${((this.heals / totalCastsIncludingDp) || 0).toFixed(2)} players`}
        label="Average hits per cast"
        tooltip="This considers Second Sunrise procs as additional casts so that the resulting number does not fluctuate based on your luck. You should consider the delay of Second Sunrise whenever you cast Light of Dawn and keep your aim on point."
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(60);
}

export default LightOfDawn;
