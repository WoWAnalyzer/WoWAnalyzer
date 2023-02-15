import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/mage';
import EventOrderNormalizer, { EventOrder } from 'parser/core/EventOrderNormalizer';
import { EventType } from 'parser/core/Events';
import { Options } from 'parser/core/Module';

const EVENT_ORDERS: EventOrder[] = [
  {
    beforeEventId: [
      SPELLS.RUNE_OF_POWER_BUFF.id,
      TALENTS.RUNE_OF_POWER_TALENT.id,
      TALENTS.COMBUSTION_TALENT.id,
      TALENTS.ARCANE_SURGE_TALENT.id,
      TALENTS.ICY_VEINS_TALENT.id,
    ],
    beforeEventType: EventType.Cast,
    afterEventId: [SPELLS.RUNE_OF_POWER_BUFF.id, TALENTS.RUNE_OF_POWER_TALENT.id],
    afterEventType: [EventType.ApplyBuff, EventType.RemoveBuff, EventType.RefreshBuff],
    bufferMs: 50,
    anyTarget: true,
  },
];

/**
 * Ensures that the  ApplyBuff, RefreshBuff, and RemoveBuff events are not occuring before the pyroblast events... so the buff doesnt get applied, removed, or refreshed before the pyroblast actually casts
 */
class RuneOfPowerNormalizer extends EventOrderNormalizer {
  constructor(options: Options) {
    super(options, EVENT_ORDERS);
  }
}

export default RuneOfPowerNormalizer;
