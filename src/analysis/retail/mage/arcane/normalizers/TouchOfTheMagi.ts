import TALENTS from 'common/TALENTS/mage';
import EventOrderNormalizer, { EventOrder } from 'parser/core/EventOrderNormalizer';
import { EventType } from 'parser/core/Events';
import { Options } from 'parser/core/Module';

const EVENT_ORDERS: EventOrder[] = [
  {
    beforeEventId: [TALENTS.TOUCH_OF_THE_MAGI_TALENT.id],
    beforeEventType: EventType.Cast,
    afterEventId: [TALENTS.TOUCH_OF_THE_MAGI_TALENT.id],
    afterEventType: EventType.ResourceChange,
    bufferMs: 50,
    anyTarget: true,
    updateTimestamp: true,
  },
];

/**
 * Ensures that the Energize events to give the player Arcane Charges is always after the Cast event if they happen at the same time.
 * This is primarily because when the cast completes it calculates damage based on the charges the player had when the spell completed,
 * not including the one that they just gained (even though they happen at the same timestamp). Therefore the energize needs to happen
 * after the cast and not before it.
 */
class TouchOfTheMagi extends EventOrderNormalizer {
  constructor(options: Options) {
    super(options, EVENT_ORDERS);
  }
}

export default TouchOfTheMagi;
