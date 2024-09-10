import { ApplyBuffEvent, EventType, GetRelatedEvent } from 'parser/core/Events';
import TALENTS from 'common/TALENTS/evoker';
import SPELLS from 'common/SPELLS/evoker';
import EventLinkNormalizer, { EventLink } from 'parser/core/EventLinkNormalizer';
import { Options } from 'parser/core/Module';

export const OBSIDIAN_SCALES = 'obsidianScales'; // links cast to buff apply
export const RENEWING_BLAZE = 'renewingBlaze'; // links cast to buff apply
export const RENEWING_BLAZE_HEAL = 'renewingBlazeHeal'; // links heal buff and healing
const TWIN_GUARDIAN_PARTNER = 'twinGuardianPartner'; // links external and personal buffs

const CAST_BUFFER = 25;
/** Heal buff can get applied immediately on use, and keeps getting refreshed on damage until
 * main acc buff runs out, so we set this high to make sure we catch all. */
const RENEWING_BLAZE_DURATION = 25_000;

const EVENT_LINKS: EventLink[] = [
  {
    linkRelation: OBSIDIAN_SCALES,
    reverseLinkRelation: OBSIDIAN_SCALES,
    linkingEventId: TALENTS.OBSIDIAN_SCALES_TALENT.id,
    linkingEventType: [EventType.ApplyBuff, EventType.RefreshBuff],
    referencedEventId: TALENTS.OBSIDIAN_SCALES_TALENT.id,
    referencedEventType: EventType.Cast,
    anyTarget: true,
    forwardBufferMs: CAST_BUFFER,
    backwardBufferMs: CAST_BUFFER,
  },
  {
    linkRelation: RENEWING_BLAZE,
    reverseLinkRelation: RENEWING_BLAZE,
    linkingEventId: TALENTS.RENEWING_BLAZE_TALENT.id,
    linkingEventType: EventType.ApplyBuff,
    referencedEventId: TALENTS.RENEWING_BLAZE_TALENT.id,
    referencedEventType: EventType.Cast,
    anyTarget: true,
    forwardBufferMs: CAST_BUFFER,
    backwardBufferMs: CAST_BUFFER,
  },
  {
    linkRelation: RENEWING_BLAZE_HEAL,
    reverseLinkRelation: RENEWING_BLAZE_HEAL,
    linkingEventId: TALENTS.RENEWING_BLAZE_TALENT.id,
    linkingEventType: EventType.ApplyBuff,
    referencedEventId: SPELLS.RENEWING_BLAZE_HEAL.id,
    referencedEventType: EventType.Heal,
    anyTarget: true,
    anySource: false, // We only want to be tracking our own Buffs, not any external ones
    forwardBufferMs: RENEWING_BLAZE_DURATION,
  },
  {
    linkRelation: TWIN_GUARDIAN_PARTNER,
    reverseLinkRelation: TWIN_GUARDIAN_PARTNER,
    linkingEventId: SPELLS.TWIN_GUARDIAN_SHIELD.id,
    linkingEventType: EventType.ApplyBuff,
    referencedEventId: SPELLS.TWIN_GUARDIAN_SHIELD.id,
    referencedEventType: EventType.ApplyBuff,
    anyTarget: true,
    forwardBufferMs: 1000,
  },
];

class DefensiveCastLinkNormalizer extends EventLinkNormalizer {
  constructor(options: Options) {
    super(options, EVENT_LINKS);
  }
}

export function getTwinGuardianPartner(event: ApplyBuffEvent): ApplyBuffEvent | undefined {
  return GetRelatedEvent(
    event,
    TWIN_GUARDIAN_PARTNER,
    (e): e is ApplyBuffEvent => e.type === EventType.ApplyBuff,
  );
}

export default DefensiveCastLinkNormalizer;
