import EventOrderNormalizer, { EventOrder } from 'parser/core/EventOrderNormalizer';
import { EventType } from 'parser/core/Events';
import SPELLS from 'common/SPELLS/monk';
import { Options } from 'parser/core/Module';

const EVENT_ORDERS: EventOrder[] = [
  {
    beforeEventId: SPELLS.FISTS_OF_FURY_CAST.id,
    beforeEventType: EventType.BeginChannel,
    afterEventId: SPELLS.FISTS_OF_FURY_CAST.id,
    afterEventType: EventType.Cast,
    anyTarget: true,
  },
];

/**
 * Puts BeginChannel events fabricated for Fists of Fury before Cast events so the APL parses
 * things correctly.
 */
class FofAplNormalizer extends EventOrderNormalizer {
  isAplNormalizer = true;
  constructor(options: Options) {
    super(options, EVENT_ORDERS);
  }
}

export default FofAplNormalizer;
