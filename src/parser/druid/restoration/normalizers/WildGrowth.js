import SPELLS from 'common/SPELLS';

import EventsNormalizer from 'parser/core/EventsNormalizer';
import { EventType } from 'parser/core/Events';

const MS_BUFFER=100;
class WildGrowth extends EventsNormalizer {
  /**
   * when you cast WG and you yourself are one of the targets the applybuff event will be in the events log before the cast event
   * this can make parsing certain things rather hard, so we need to swap them
   * @param events
   * @returns {Array}
   */
  normalize(events) {
    let _events = [];
    let _newEvents = [];

    events.forEach((event, idx) => {
      _events.push(event);

      // for WG cast events we look backwards through the events and any applybuff events we push forward
      if (event.type === EventType.Cast && event.ability.guid === SPELLS.WILD_GROWTH.id) {
        for (let _idx = idx - 1; _idx >= 0; _idx -= 1) {
          const _event = _events[_idx];

          if (Math.abs(_event.timestamp - event.timestamp) > MS_BUFFER) {
            _newEvents.reverse();
            _events = _events.concat(_newEvents);
            _newEvents = [];
            break;
          }

          if (_event.type === EventType.ApplyBuff && _event.ability.guid === SPELLS.WILD_GROWTH.id && _event.targetID === this.owner.playerId) {
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

      if (event.type === EventType.Cast && event.ability.guid === SPELLS.REJUVENATION.id) {
        for (let _idx = idx - 1; _idx >= 0; _idx -= 1) {
          const _event = _events[_idx];

          if (_event.timestamp !== event.timestamp) {
            _newEvents.reverse();
            _events = _events.concat(_newEvents);
            _newEvents = [];
            break;
          }

          if (_event.type === EventType.ApplyBuff
            && [SPELLS.REJUVENATION.id, SPELLS.REJUVENATION_GERMINATION.id].includes(_event.ability.guid)
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
      // for WG apply buff events we look backwards through the events and any events of flourish we push forward
      if (event.type === EventType.ApplyBuff && event.ability.guid === SPELLS.WILD_GROWTH.id) {
        for (let _idx = idx - 1; _idx >= 0; _idx -= 1) {
          const _event = _events[_idx];

          if (Math.abs(_event.timestamp - event.timestamp) > MS_BUFFER) {
            _newEvents.reverse();
            _events = _events.concat(_newEvents);
            _newEvents = [];
            break;
          }

          if ((_event.type === EventType.ApplyBuff || _event.type === EventType.Cast) && _event.ability.guid === SPELLS.FLOURISH_TALENT.id) {
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
}

export default WildGrowth;
