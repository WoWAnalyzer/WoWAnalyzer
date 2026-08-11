import SPELLS from 'common/SPELLS';
import { EventLink } from 'parser/core/EventLinkNormalizer';
import {
  ApplyBuffEvent,
  CastEvent,
  EventType,
  GetRelatedEvent,
  HasRelatedEvent,
  RefreshBuffEvent,
  RemoveBuffEvent,
} from 'parser/core/Events';
import {
  CAST_BUFFER_MS,
  FROM_RAPID_DIFFUSION,
  MID_S2_4PC_CONSUME,
  MID_S2_4PC_TRIGGER,
  S2_4PC_TRIGGER_BUFFER_MS,
} from './EventLinkConstants';
import { TIERS } from 'game/TIERS';
import { TALENTS_MONK } from 'common/TALENTS';

export const MID_S1 = 'TFT_Rem';

const RSK_CAST_IDS = [
  TALENTS_MONK.RISING_SUN_KICK_TALENT.id,
  TALENTS_MONK.RUSHING_WIND_KICK_MISTWEAVER_TALENT.id,
];

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
  {
    linkRelation: MID_S2_4PC_TRIGGER,
    reverseLinkRelation: MID_S2_4PC_TRIGGER,
    linkingEventId: [SPELLS.MW_S2_4PC_BUFF.id],
    linkingEventType: [EventType.ApplyBuff],
    referencedEventId: RSK_CAST_IDS,
    referencedEventType: [EventType.Cast],
    backwardBufferMs: S2_4PC_TRIGGER_BUFFER_MS,
    anyTarget: true,
    maximumLinks: 1,
    isActive(c) {
      return c.has4PieceByTier(TIERS.MID2);
    },
  },
  {
    linkRelation: MID_S2_4PC_CONSUME,
    reverseLinkRelation: MID_S2_4PC_CONSUME,
    linkingEventId: [SPELLS.MW_S2_4PC_BUFF.id],
    linkingEventType: [EventType.RemoveBuff],
    referencedEventId: RSK_CAST_IDS,
    referencedEventType: [EventType.Cast],
    backwardBufferMs: CAST_BUFFER_MS,
    anyTarget: true,
    maximumLinks: 1,
    isActive(c) {
      return c.has4PieceByTier(TIERS.MID2);
    },
  },
];

export function isFromTFT(event: ApplyBuffEvent | RefreshBuffEvent): boolean {
  return HasRelatedEvent(event, MID_S1);
}

export function getS2FourPieceConsumingCast(event: RemoveBuffEvent): CastEvent | undefined {
  return GetRelatedEvent<CastEvent>(event, MID_S2_4PC_CONSUME);
}

export function isS2FourPieceConsumingCast(event: CastEvent): boolean {
  return HasRelatedEvent(event, MID_S2_4PC_CONSUME);
}

export function isFromS2FourPiece(event: ApplyBuffEvent | RefreshBuffEvent): boolean {
  const cast = GetRelatedEvent<CastEvent>(event, FROM_RAPID_DIFFUSION);
  return (
    cast !== undefined &&
    RSK_CAST_IDS.includes(cast.ability.guid) &&
    isS2FourPieceConsumingCast(cast)
  );
}
