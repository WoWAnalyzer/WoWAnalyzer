import EventLinkNormalizer, { EventLink } from 'parser/core/EventLinkNormalizer';
import { Options } from 'parser/core/Module';
import {
  ApplyDebuffEvent,
  CastEvent,
  DamageEvent,
  EventType,
  GetRelatedEvent,
  HasRelatedEvent,
  RefreshDebuffEvent,
  RemoveBuffEvent,
  RemoveBuffStackEvent,
  ResourceChangeEvent,
} from 'parser/core/Events';
import SPELLS from 'common/SPELLS/rogue';
import TALENTS from 'common/TALENTS/rogue';

const CAST_BUFFER_MS = 400;

const FROM_HARDCAST = 'FromHardcast';
const HIT_TARGET = 'HitTarget';
const OPPORTUNITY_CONSUME = 'OpportunityConsume';
const AUDACITY_CONSUME = 'AudacityConsume';
const IMPROVED_ADRENALINE_RUSH = 'ImprovedAdrenalineRush';

const EVENT_LINKS: EventLink[] = [
  {
    linkRelation: FROM_HARDCAST,
    reverseLinkRelation: HIT_TARGET,
    linkingEventId: SPELLS.BETWEEN_THE_EYES.id,
    linkingEventType: [EventType.ApplyDebuff, EventType.RefreshDebuff],
    referencedEventId: SPELLS.BETWEEN_THE_EYES.id,
    referencedEventType: EventType.Cast,
    forwardBufferMs: CAST_BUFFER_MS,
    backwardBufferMs: CAST_BUFFER_MS,
  },
  {
    linkRelation: FROM_HARDCAST,
    reverseLinkRelation: HIT_TARGET,
    linkingEventId: SPELLS.SLICE_AND_DICE.id,
    linkingEventType: [EventType.ApplyDebuff, EventType.RefreshDebuff],
    referencedEventId: SPELLS.SLICE_AND_DICE.id,
    referencedEventType: EventType.Cast,
    forwardBufferMs: CAST_BUFFER_MS,
    backwardBufferMs: CAST_BUFFER_MS,
  },
  {
    linkRelation: OPPORTUNITY_CONSUME,
    reverseLinkRelation: OPPORTUNITY_CONSUME,
    linkingEventId: SPELLS.PISTOL_SHOT.id,
    linkingEventType: EventType.Cast,
    referencedEventId: SPELLS.OPPORTUNITY.id,
    referencedEventType: [EventType.RemoveBuff, EventType.RemoveBuffStack],
    forwardBufferMs: CAST_BUFFER_MS,
    backwardBufferMs: CAST_BUFFER_MS,
    maximumLinks: 1,
    anyTarget: true,
  },
  {
    linkRelation: AUDACITY_CONSUME,
    reverseLinkRelation: AUDACITY_CONSUME,
    linkingEventId: [SPELLS.AMBUSH.id, SPELLS.AMBUSH_PROC.id],
    linkingEventType: EventType.Cast,
    referencedEventId: SPELLS.AUDACITY_TALENT_BUFF.id,
    referencedEventType: EventType.RemoveBuff,
    forwardBufferMs: CAST_BUFFER_MS,
    backwardBufferMs: CAST_BUFFER_MS,
    maximumLinks: 1,
    anyTarget: true,
  },
  {
    linkRelation: IMPROVED_ADRENALINE_RUSH,
    reverseLinkRelation: IMPROVED_ADRENALINE_RUSH,
    linkingEventId: TALENTS.ADRENALINE_RUSH_TALENT.id,
    linkingEventType: EventType.Cast,
    referencedEventId: SPELLS.IMPROVED_ADRENALINE_RUSH_RESOURCE.id,
    referencedEventType: EventType.ResourceChange,
    backwardBufferMs: CAST_BUFFER_MS,
    maximumLinks: 1,
    anyTarget: true,
  },
];

/**
 * When a DoT spell is cast on a target, the ordering of the Cast and ApplyDebuff/RefreshDebuff/(direct)Damage
 * can be semi-arbitrary, making analysis difficult.
 *
 * This normalizer adds a _linkedEvent to the ApplyDebuff/RefreshDebuff/Damage linking back to the Cast event
 * that caused it (if one can be found).
 *
 * Also adds a 'hit target' link from Cast events that AoE, allowing an easy count of number of hits.
 */
export default class CastLinkNormalizer extends EventLinkNormalizer {
  constructor(options: Options) {
    super(options, EVENT_LINKS);
  }
}

export function getHardcast(
  event: ApplyDebuffEvent | RefreshDebuffEvent | DamageEvent,
): CastEvent | undefined {
  return GetRelatedEvent(event, FROM_HARDCAST);
}

export function consumedOpportunity(
  event: CastEvent | RemoveBuffEvent | RemoveBuffStackEvent,
): boolean {
  return HasRelatedEvent(event, OPPORTUNITY_CONSUME);
}

export function consumedAudacity(event: CastEvent | RemoveBuffEvent): boolean {
  return HasRelatedEvent(event, AUDACITY_CONSUME);
}

export function getGeneratedAdrenalineRushComboPoints(event: CastEvent): number {
  const resourceEvent = GetRelatedEvent<ResourceChangeEvent>(event, IMPROVED_ADRENALINE_RUSH);
  if (!resourceEvent) {
    return 0;
  }

  return resourceEvent.resourceChange - resourceEvent.waste;
}
