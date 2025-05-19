import SPELLS from 'common/SPELLS';
import { EventLink } from 'parser/core/EventLinkNormalizer';
import { EventType } from 'parser/core/Events';
import {
  SHORT_BUFFER_MS,
  INSURANCE,
  INSURANCE_DURATION,
  INSURANCE_FROM_DIVINE_TOLL,
} from './EventLinkConstants';
import { TIERS } from 'game/TIERS';

export const TIER_EVENT_LINKS: EventLink[] = [
  // Insurance from Divine Toll
  {
    linkRelation: INSURANCE_FROM_DIVINE_TOLL,
    linkingEventId: SPELLS.INSURANCE_HOT_PALADIN.id,
    linkingEventType: [EventType.ApplyBuff, EventType.RefreshBuff],
    referencedEventId: SPELLS.HOLY_SHOCK_HEAL.id,
    referencedEventType: [EventType.Heal],
    backwardBufferMs: SHORT_BUFFER_MS,
    forwardBufferMs: SHORT_BUFFER_MS,
    maximumLinks: 1,
    isActive: (c) => {
      return c.has4PieceByTier(TIERS.TWW2);
    },
  },
  // link insurance heal to apply
  {
    linkRelation: INSURANCE,
    linkingEventId: [SPELLS.INSURANCE_HOT_PALADIN.id, SPELLS.INSURANCE_PROC_PALADIN.id],
    linkingEventType: EventType.Heal,
    referencedEventId: SPELLS.INSURANCE_HOT_PALADIN.id,
    referencedEventType: [EventType.ApplyBuff, EventType.RefreshBuff],
    backwardBufferMs: INSURANCE_DURATION,
    maximumLinks: 1,
    isActive: (c) => {
      return c.has2PieceByTier(TIERS.TWW2);
    },
  },
];
