import SPELLS from 'common/SPELLS/demonhunter';
import EventOrderNormalizer, { EventOrder } from 'parser/core/EventOrderNormalizer';
import { EventType } from 'parser/core/Events';
import { Options } from 'parser/core/Module';
import TALENTS from 'common/TALENTS/demonhunter';

const EVENT_ORDERS: EventOrder[] = [
  {
    beforeEventId: TALENTS.EYE_BEAM_TALENT.id,
    beforeEventType: EventType.Cast,
    afterEventId: SPELLS.METAMORPHOSIS_HAVOC_BUFF.id,
    afterEventType: EventType.ApplyBuff,
    bufferMs: 50,
    anyTarget: true,
    updateTimestamp: true,
  },
  {
    beforeEventId: TALENTS.EYE_BEAM_TALENT.id,
    beforeEventType: EventType.Cast,
    afterEventId: TALENTS.EYE_BEAM_TALENT.id,
    afterEventType: EventType.ApplyBuff,
    bufferMs: 50,
    anyTarget: true,
    updateTimestamp: true,
  },
  {
    beforeEventId: TALENTS.EYE_BEAM_TALENT.id,
    beforeEventType: EventType.ApplyBuff,
    afterEventId: SPELLS.METAMORPHOSIS_HAVOC_BUFF.id,
    afterEventType: EventType.ApplyBuff,
    bufferMs: 50,
    updateTimestamp: true,
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
