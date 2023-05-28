import SPELLS from 'common/SPELLS';
import EventOrderNormalizer, { EventOrder } from 'parser/core/EventOrderNormalizer';
import { EventType } from 'parser/core/Events';
import { Options } from 'parser/core/Module';

const CAST_WINDOW = 100;

const EVENT_ORDERS: EventOrder[] = [
  {
    beforeEventId: SPELLS.RAKE.id,
    beforeEventType: EventType.Cast,
    afterEventId: SPELLS.RAKE_BLEED.id,
    afterEventType: [EventType.ApplyDebuff, EventType.RefreshDebuff],
    bufferMs: CAST_WINDOW,
    updateTimestamp: true,
  },
  {
    beforeEventId: SPELLS.RAKE.id,
    beforeEventType: EventType.Cast,
    afterEventId: SPELLS.RAKE_BLEED.id,
    afterEventType: [EventType.ApplyDebuff, EventType.RefreshDebuff],
    bufferMs: CAST_WINDOW,
    updateTimestamp: true,
  },
];

// TODO use cast link normalizer instead for DF
/**
 * When used from stealth SPELLS.RAKE cast event often appears after the SPELLS.RAKE_BLEED
 * applydebuff event that it causes. (Possibly this misordering has something to do with Rake
 * from stealth also attempting to apply a stun debuff.)
 * This normalizes events so the bleed applydebuff always comes after cast.
 *
 * Example log: https://www.warcraftlogs.com/reports/bt2x7pkqJ6XBjPam#fight=last
 * Player Anatta at times: 0:00.900, 0:33.296, 3:35.127
 */
class RakeBleed extends EventOrderNormalizer {
  constructor(options: Options) {
    super(options, EVENT_ORDERS);
  }
}

export default RakeBleed;
