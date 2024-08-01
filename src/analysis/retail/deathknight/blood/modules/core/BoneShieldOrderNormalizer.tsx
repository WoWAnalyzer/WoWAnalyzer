import SPELLS from 'common/SPELLS';
import talents from 'common/TALENTS/deathknight';
import { Options } from 'parser/core/Analyzer';
import EventOrderNormalizer from 'parser/core/EventOrderNormalizer';
import { EventType } from 'parser/core/Events';

export default class BoneShieldOrderNormalizer extends EventOrderNormalizer {
  constructor(options: Options) {
    super(options, [
      {
        beforeEventId: [talents.MARROWREND_TALENT.id, SPELLS.DEATHS_CARESS.id],
        beforeEventType: EventType.Cast,
        afterEventId: SPELLS.BONE_SHIELD.id,
        afterEventType: [EventType.ApplyBuff, EventType.ApplyBuffStack, EventType.RefreshBuff],
        anySource: false,
        anyTarget: true,
        maxMatches: 5,
      },
    ]);
  }
}
