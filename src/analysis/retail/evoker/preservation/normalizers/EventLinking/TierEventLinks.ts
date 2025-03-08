import SPELLS from 'common/SPELLS';
import { EventLink } from 'parser/core/EventLinkNormalizer';
import { EventType } from 'parser/core/Events';
import {
  VERDANT_EMBRACE_INSURANCE,
  INSURANCE_MAX_DURATION,
  INSURANCE_APPLICATION,
} from './constants';

export const TIER_EVENT_LINKS: EventLink[] = [
  {
    linkRelation: VERDANT_EMBRACE_INSURANCE,
    linkingEventId: SPELLS.INSURANCE_HOT_EVOKER.id,
    linkingEventType: [EventType.ApplyBuff, EventType.RefreshBuff],
    referencedEventId: SPELLS.VERDANT_EMBRACE_HEAL.id,
    referencedEventType: EventType.Heal,
    reverseLinkRelation: VERDANT_EMBRACE_INSURANCE,
    backwardBufferMs: 10,
  },
  {
    linkRelation: INSURANCE_APPLICATION,
    linkingEventId: [SPELLS.INSURANCE_HOT_EVOKER.id, SPELLS.INSURANCE_PROC_EVOKER.id],
    linkingEventType: EventType.Heal,
    referencedEventId: SPELLS.INSURANCE_HOT_EVOKER.id,
    referencedEventType: [EventType.ApplyBuff, EventType.RefreshBuff],
    backwardBufferMs: INSURANCE_MAX_DURATION,
  },
];
