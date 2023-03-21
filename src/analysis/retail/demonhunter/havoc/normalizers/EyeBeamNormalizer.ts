import SPELLS from 'common/SPELLS/demonhunter';
import EventOrderNormalizer, { EventOrder } from 'parser/core/EventOrderNormalizer';
import { EventType } from 'parser/core/Events';
import { Options } from 'parser/core/Module';
import { TALENTS_DEMON_HUNTER } from 'common/TALENTS';

const EVENT_ORDERS: EventOrder[] = [
  {
    beforeEventId: TALENTS_DEMON_HUNTER.EYE_BEAM_TALENT.id,
    beforeEventType: EventType.ApplyBuff,
    afterEventId: SPELLS.METAMORPHOSIS_HAVOC_BUFF.id,
    afterEventType: EventType.ApplyBuff,
    bufferMs: 50,
  },
];

/**
 * The applybuff from demonic is logged before the cast of Eye Beam.
 * This normalizes events so that the Eye Beam applybuff always comes before the Meta Havoc buff
 **/
class EyeBeamNormalizer extends EventOrderNormalizer {
  constructor(options: Options) {
    super(options, EVENT_ORDERS);
  }
}

export default EyeBeamNormalizer;
