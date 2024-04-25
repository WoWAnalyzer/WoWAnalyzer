import SPELLS from 'common/SPELLS/evoker';
import EventOrderNormalizer, { EventOrder } from 'parser/core/EventOrderNormalizer';
import { EventType } from 'parser/core/Events';
import { Options } from 'parser/core/Module';
import EssenceBurstCastLinkNormalizer, {
  EB_GENERATION_EVENT_TYPES,
} from '../../../shared/modules/normalizers/EssenceBurstCastLinkNormalizer';
import { EssenceBurstRefreshNormalizer } from 'analysis/retail/evoker/shared';

const EVENT_ORDERS: EventOrder[] = [
  {
    beforeEventId: SPELLS.SHATTERING_STAR.id,
    beforeEventType: EventType.Cast,
    afterEventId: SPELLS.ESSENCE_BURST_DEV_BUFF.id,
    afterEventType: EB_GENERATION_EVENT_TYPES,
    bufferMs: 50,
    anyTarget: true,
    updateTimestamp: true,
  },
];

/**
 * The applybuff from Arcane Vigor is logged before the cast of Shattering Star
 * This also happens to Living Flames cast with Burnout
 * This normalizes events so that the Shattering Star cast always comes before the EB buff
 *
 * EventOrderNormalizer only normalizes 1 instance per entry in the EventOrder array
 * which means that abilities that can generate multiple EB at once, eg. Living Flame cast with
 * Leaping Flames, will only have one event normalized, which can be non ideal. Therefore we will build
 * an array with all the different types to make sure we get them all normalized.
 * Specifically this messes with the APLCheck due to resources not being applied in the right order.
 **/
class EssenceBurstNormalizer extends EventOrderNormalizer {
  static dependencies = {
    ...EventOrderNormalizer.dependencies,
    // We need these dependency to ensure we don't mess up our other normalizers
    essenceBurstRefreshNormalizer: EssenceBurstRefreshNormalizer,
    essenceBurstCastLinkNormalizer: EssenceBurstCastLinkNormalizer,
  };
  constructor(options: Options) {
    super(options, EVENT_ORDERS);

    EB_GENERATION_EVENT_TYPES.forEach((ebApplyEventType) => {
      EVENT_ORDERS.push({
        beforeEventId: SPELLS.LIVING_FLAME_CAST.id,
        beforeEventType: EventType.Cast,
        afterEventId: SPELLS.ESSENCE_BURST_DEV_BUFF.id,
        afterEventType: ebApplyEventType,
        bufferMs: 50,
        anyTarget: true,
        updateTimestamp: true,
      });
    });
  }
}

export default EssenceBurstNormalizer;
