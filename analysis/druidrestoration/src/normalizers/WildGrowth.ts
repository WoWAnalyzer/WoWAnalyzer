import SPELLS from 'common/SPELLS';
import { AnyEvent, EventType } from 'parser/core/Events';
import EventsNormalizer from 'parser/core/EventsNormalizer';
import { EventOrder } from 'parser/core/EventOrderNormalizer';

const MS_BUFFER = 100;

// TODO finish here - this is more complex than I first thought
const EVENT_ORDERS: EventOrder[] = [
  {
    beforeEventId: SPELLS.WILD_GROWTH.id,
    beforeEventType: EventType.Cast,
    afterEventId: SPELLS.METAMORPHOSIS_HAVOC_BUFF,
    afterEventType: EventType.ApplyBuff,
    bufferMs: 100,
  },
];

/**
 * when you cast WG and you yourself are one of the targets the applybuff event will be in the events log before the cast event
 * this can make parsing certain things rather hard, so we need to swap them
 */
class WildGrowth extends EventsNormalizer {
  /**
   * when you cast WG and you yourself are one of the targets the applybuff event will be in the events log before the cast event
   * this can make parsing certain things rather hard, so we need to swap them
   * @param events
   * @returns {Array}
   */
  normalize(events: AnyEvent[]) {
    let _events: AnyEvent[] = [];
    let _newEvents: AnyEvent[] = [];

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

          if (
            _event.type === EventType.ApplyBuff &&
            _event.ability.guid === SPELLS.WILD_GROWTH.id &&
            _event.targetID === this.owner.playerId
          ) {
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

          if (
            _event.type === EventType.ApplyBuff &&
            [SPELLS.REJUVENATION.id, SPELLS.REJUVENATION_GERMINATION.id].includes(
              _event.ability.guid,
            ) &&
            _event.targetID === event.targetID
          ) {
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

          if (
            (_event.type === EventType.ApplyBuff || _event.type === EventType.Cast) &&
            _event.ability.guid === SPELLS.FLOURISH_TALENT.id
          ) {
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
