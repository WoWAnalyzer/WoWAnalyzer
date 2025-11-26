import SPELLS from 'common/SPELLS';
import { EventLink } from 'parser/core/EventLinkNormalizer';
import { ApplyBuffEvent, EventType, HasRelatedEvent, RefreshBuffEvent } from 'parser/core/Events';
import { CAST_BUFFER_MS } from './EventLinkConstants';
import { TIERS } from 'game/TIERS';
import { TALENTS_MONK } from 'common/TALENTS';

export const MID_S1 = 'TFT_Rem';
export const TIER_EVENT_LINKS: EventLink[] = [
  {
    linkRelation: MID_S1,
    linkingEventId: [SPELLS.RENEWING_MIST_HEAL.id],
    reverseLinkRelation: MID_S1,
    linkingEventType: [EventType.ApplyBuff, EventType.RefreshBuff],
    referencedEventId: [TALENTS_MONK.THUNDER_FOCUS_TEA_TALENT.id],
    referencedEventType: [EventType.Cast],
    backwardBufferMs: CAST_BUFFER_MS,
    anyTarget: true,
    maximumLinks: 1,
    isActive(c) {
      return c.has4PieceByTier(TIERS.MID1);
    },
  },
];

export function isFromTFT(event: ApplyBuffEvent | RefreshBuffEvent): boolean {
  return HasRelatedEvent(event, MID_S1);
}
