import EventOrderNormalizer, { EventOrder } from 'parser/core/EventOrderNormalizer';
import { Options } from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import { EventType } from 'parser/core/Events';
import { TALENTS_DRUID } from 'common/TALENTS';

const BUFFER_MS = 50;

const EVENT_ORDERS: EventOrder[] = [
  {
    beforeEventId: SPELLS.WILD_GROWTH.id,
    beforeEventType: [EventType.ApplyBuff, EventType.RefreshBuff],
    afterEventId: [SPELLS.CONVOKE_SPIRITS.id, TALENTS_DRUID.FLOURISH_TALENT.id],
    afterEventType: [EventType.ApplyBuff, EventType.RefreshBuff],
    bufferMs: BUFFER_MS,
    anyTarget: true,
  },
];

/**
 * When player does the common cast sequence Wild Growth -> Flourish or Wild Growth -> Convoke,
 * the HoT applications can sometimes end up after the buff application of Flourish / Convoke.
 *
 * This normalizer reorders the HoT application to always come before, which should improve
 * detection of which HoTs are extended and which are procced by Convoke, etc.
 */
export default class WildGrowthPrecastOrderNormalizer extends EventOrderNormalizer {
  constructor(options: Options) {
    super(options, EVENT_ORDERS);
  }
}
