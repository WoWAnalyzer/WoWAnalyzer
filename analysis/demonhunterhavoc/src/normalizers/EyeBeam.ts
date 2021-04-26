import SPELLS from 'common/SPELLS';
import EventOrderNormalizer, { EventOrder } from 'parser/core/EventOrderNormalizer';
import { EventType } from 'parser/core/Events';
import { Options } from 'parser/core/Module';

const EVENT_ORDERS: EventOrder[] = [
  {
    beforeEventId: SPELLS.EYE_BEAM.id,
    beforeEventType: EventType.ApplyBuff,
    afterEventId: SPELLS.METAMORPHOSIS_HAVOC_BUFF,
    afterEventType: EventType.ApplyBuff,
    bufferMs: 50,
  },
];

/**
 * The applybuff from demonic is logged before the cast of Eye Beam.
 * This normalizes events so that the Eye Beam applybuff always comes before the Meta Havoc buff
 **/
class EyeBeam extends EventOrderNormalizer {
  constructor(options: Options) {
    super(options, EVENT_ORDERS);
  }
}

export default EyeBeam;
