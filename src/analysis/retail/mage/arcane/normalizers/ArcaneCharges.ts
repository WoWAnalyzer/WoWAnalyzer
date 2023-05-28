import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/mage';
import EventOrderNormalizer, { EventOrder } from 'parser/core/EventOrderNormalizer';
import { EventType } from 'parser/core/Events';
import { Options } from 'parser/core/Module';

const EVENT_ORDERS: EventOrder[] = [
  {
    beforeEventId: [
      SPELLS.ARCANE_BLAST.id,
      SPELLS.ARCANE_EXPLOSION.id,
      TALENTS.TOUCH_OF_THE_MAGI_TALENT.id,
    ],
    beforeEventType: EventType.Cast,
    afterEventId: null, // FIXME could this be acccidentally matching other kinds of energizes?
    afterEventType: EventType.ResourceChange,
    bufferMs: 50,
  },
];

/**
 * Ensures that the Energize events to give the player Arcane Charges is always after the Cast event if they happen at the same time.
 * This is primarily because when the cast completes it calculates damage based on the charges the player had when the spell completed,
 * not including the one that they just gained (even though they happen at the same timestamp). Therefore the energize needs to happen
 * after the cast and not before it.
 */
class ArcaneCharges extends EventOrderNormalizer {
  constructor(options: Options) {
    super(options, EVENT_ORDERS);
  }
}

export default ArcaneCharges;
