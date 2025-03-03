import SPELLS from 'common/SPELLS';
import { TALENTS_MONK } from 'common/TALENTS';
import { EventLink } from 'parser/core/EventLinkNormalizer';
import { EventType } from 'parser/core/Events';
import {
  CAST_BUFFER_MS,
  INSURANCE,
  INSURANCE_DURATION,
  INSURANCE_FROM_REM,
} from './EventLinkConstants';
import { TIERS } from 'game/TIERS';

export const TIER_EVENT_LINKS: EventLink[] = [
  // Insurance from Rem hardcast
  {
    linkRelation: INSURANCE_FROM_REM,
    linkingEventId: SPELLS.INSURANCE_HOT_MONK.id,
    linkingEventType: [EventType.ApplyBuff, EventType.RefreshBuff],
    referencedEventId: TALENTS_MONK.RENEWING_MIST_TALENT.id,
    referencedEventType: [EventType.Cast],
    backwardBufferMs: CAST_BUFFER_MS,
    forwardBufferMs: CAST_BUFFER_MS,
    maximumLinks: 1,
    isActive: (c) => {
      return c.has4PieceByTier(TIERS.TWW2);
    },
  },
  // link insurance heal to apply
  {
    linkRelation: INSURANCE,
    linkingEventId: [SPELLS.INSURANCE_HOT_MONK.id, SPELLS.INSURANCE_PROC_MONK.id],
    linkingEventType: EventType.Heal,
    referencedEventId: SPELLS.INSURANCE_HOT_MONK.id,
    referencedEventType: [EventType.ApplyBuff, EventType.RefreshBuff],
    backwardBufferMs: INSURANCE_DURATION,
    maximumLinks: 1,
    isActive: (c) => {
      return c.has2PieceByTier(TIERS.TWW2);
    },
  },
];
