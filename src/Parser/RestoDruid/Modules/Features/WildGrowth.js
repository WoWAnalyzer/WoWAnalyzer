import React from 'react';
import { formatPercentage } from 'common/format';
import SpellLink from 'common/SpellLink';

import SPELLS from 'common/SPELLS';
import Analyzer from 'Parser/Core/Analyzer';

import SuggestionThresholds from '../../SuggestionThresholds';

class WildGrowth extends Analyzer {

  /**
   * when you cast WG and you yourself are one of the targets the applybuff event will be in the events log before the cast event
   * this can make parsing certain things rather hard, so we need to swap them
   * @param events
   * @returns {Array}
   */
  reorderEvents(events) {
    let _events = [];
    let _newEvents = [];

    events.forEach((event, idx) => {
      _events.push(event);

      // for WG cast events we look backwards through the events and any applybuff events we push forward
      if (event.type === 'cast' && event.ability.guid === SPELLS.WILD_GROWTH.id) {
        for (let _idx = idx - 1; _idx >= 0; _idx -= 1) {
          const _event = _events[_idx];

          if (_event.timestamp !== event.timestamp) {
            _newEvents.reverse();
            _events = _events.concat(_newEvents);
            _newEvents = [];
            break;
          }

          if (_event.type === 'applybuff' && _event.ability.guid === SPELLS.WILD_GROWTH.id && _event.targetID === this.owner.playerId) {
            _events.splice(_idx, 1);
            _newEvents.push(_event);
          }
        }

        if (_newEvents.length) {
          _newEvents.reverse();
          _events = _events.concat(_newEvents);
          _newEvents = [];
        }
      }

      if (event.type === 'cast' && event.ability.guid === SPELLS.REJUVENATION.id) {
        for (let _idx = idx - 1; _idx >= 0; _idx -= 1) {
          const _event = _events[_idx];

          if (_event.timestamp !== event.timestamp) {
            _newEvents.reverse();
            _events = _events.concat(_newEvents);
            _newEvents = [];
            break;
          }

          if (_event.type === 'applybuff'
            && [SPELLS.REJUVENATION.id, SPELLS.REJUVENATION_GERMINATION.id].indexOf(_event.ability.guid) !== -1
            && _event.targetID === event.targetID) {
            _events.splice(_idx, 1);
            _newEvents.push(_event);
          }
        }

        if (_newEvents.length) {
          _newEvents.reverse();
          _events = _events.concat(_newEvents);
          _newEvents = [];
        }
      }
    });

    return _events;
  }


  suggestions(when) {
    const abilityTracker = this.owner.modules.abilityTracker;
    const rejuvs = abilityTracker.getAbility(SPELLS.REJUVENATION.id).casts || 0;
    const wgs = abilityTracker.getAbility(SPELLS.WILD_GROWTH.id).casts || 0;
    const wgsPerRejuv = (wgs / rejuvs) || 0;

    when(wgsPerRejuv).isLessThan(SuggestionThresholds.WGS_PER_REJUV.minor)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<span>Your <SpellLink id={SPELLS.WILD_GROWTH.id} /> to rejuv ratio can be improved, try to cast more wild growths if possible as it is usually more efficient.</span>,)
          .icon(SPELLS.WILD_GROWTH.icon)
          .actual(`${wgs} WGs / ${rejuvs} rejuvs`)
          .recommended(`>${Math.round(formatPercentage(recommended))}% is recommended`)
          .regular(SuggestionThresholds.WGS_PER_REJUV.regular).major(SuggestionThresholds.WGS_PER_REJUV.major);
      });
  }


}

export default WildGrowth;
