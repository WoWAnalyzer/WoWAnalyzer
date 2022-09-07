import SPELLS from 'common/SPELLS';
import EventLinkNormalizer, { EventLink } from 'parser/core/EventLinkNormalizer';
import {
  AbilityEvent,
  AnyEvent,
  ApplyBuffEvent,
  EventType,
  GetRelatedEvents,
  HasAbility,
  HealEvent,
  RefreshBuffEvent,
  RemoveBuffEvent,
} from 'parser/core/Events';
import { Options } from 'parser/core/Module';

export const BUFFED_BY_SOTF = 'BuffedBySotf';
export const SOTF_BUFFS_HEAL = 'BuffsHeal';

const SOTF_BUFFER_MS = 50;

/** Additional condition for rejuv requires the SotF to be buffing nothing else */
const REJUV_CONDITION = (linkingEvent: AnyEvent, referencedEvent: AnyEvent) =>
  !referencedEvent._linkedEvents ||
  !referencedEvent._linkedEvents.find((link) => link.relation === SOTF_BUFFS_HEAL);

/** Additional condition for regrowth requires the SotF to be buffing only the direct heal and the buff application */
const REGROWTH_CONDITION = (linkingEvent: AnyEvent, referencedEvent: AnyEvent) => {
  if (linkingEvent.type === EventType.Heal && (linkingEvent as HealEvent).tick) {
    return false;
  }
  return (
    !referencedEvent._linkedEvents ||
    !referencedEvent._linkedEvents.find(
      (link) =>
        link.relation === SOTF_BUFFS_HEAL &&
        (link.event.type === linkingEvent.type ||
          (link.event as AbilityEvent<any>).ability.guid !==
            (linkingEvent as AbilityEvent<any>).ability.guid),
    )
  );
};

/** Additional condition for wild growth requires the SotF to only be buffing other wild growths */
const WG_CONDITION = (linkingEvent: AnyEvent, referencedEvent: AnyEvent) =>
  !referencedEvent._linkedEvents ||
  !referencedEvent._linkedEvents.find(
    (link) =>
      link.relation === SOTF_BUFFS_HEAL &&
      (link.event as AbilityEvent<any>).ability.guid !==
        (linkingEvent as AbilityEvent<any>).ability.guid,
  );

const EVENT_LINKS: EventLink[] = [
  {
    linkRelation: BUFFED_BY_SOTF,
    linkingEventId: [SPELLS.REJUVENATION.id, SPELLS.REJUVENATION_GERMINATION.id],
    linkingEventType: [EventType.ApplyBuff, EventType.RefreshBuff],
    referencedEventId: SPELLS.SOUL_OF_THE_FOREST_BUFF.id,
    referencedEventType: EventType.RemoveBuff,
    forwardBufferMs: SOTF_BUFFER_MS,
    backwardBufferMs: SOTF_BUFFER_MS,
    anyTarget: true,
    additionalCondition: REJUV_CONDITION,
    reverseLinkRelation: SOTF_BUFFS_HEAL,
  },
  {
    linkRelation: BUFFED_BY_SOTF,
    linkingEventId: SPELLS.REGROWTH.id,
    linkingEventType: [EventType.ApplyBuff, EventType.RefreshBuff, EventType.Heal],
    referencedEventId: SPELLS.SOUL_OF_THE_FOREST_BUFF.id,
    referencedEventType: EventType.RemoveBuff,
    forwardBufferMs: SOTF_BUFFER_MS,
    backwardBufferMs: SOTF_BUFFER_MS,
    anyTarget: true,
    additionalCondition: REGROWTH_CONDITION,
    reverseLinkRelation: SOTF_BUFFS_HEAL,
  },
  {
    linkRelation: BUFFED_BY_SOTF,
    linkingEventId: SPELLS.WILD_GROWTH.id,
    linkingEventType: [EventType.ApplyBuff, EventType.RefreshBuff],
    referencedEventId: SPELLS.SOUL_OF_THE_FOREST_BUFF.id,
    referencedEventType: EventType.RemoveBuff,
    forwardBufferMs: SOTF_BUFFER_MS,
    backwardBufferMs: SOTF_BUFFER_MS,
    anyTarget: true,
    additionalCondition: WG_CONDITION,
    reverseLinkRelation: SOTF_BUFFS_HEAL,
  },
];

/**
 * A variety of timing oddities makes it difficult to determine which HoTs benefit from
 * Soul of the Forest while in-order analyzing. This normalizer helps by pre-determining
 * which buffs benefit and making event links between them.
 */
class SoulOfTheForestLinkNormalizer extends EventLinkNormalizer {
  constructor(options: Options) {
    super(options, EVENT_LINKS);
  }
}

export function getSotfBuffs(event: RemoveBuffEvent): Array<AbilityEvent<any>> {
  const buffedHeals = GetRelatedEvents(event, SOTF_BUFFS_HEAL);
  return buffedHeals.filter((e): e is AbilityEvent<any> => HasAbility(e));
}

export function buffedBySotf(
  event: ApplyBuffEvent | RefreshBuffEvent | HealEvent,
): RemoveBuffEvent | undefined {
  const sotfs: AnyEvent[] = GetRelatedEvents(event, BUFFED_BY_SOTF);
  if (sotfs.length === 0) {
    return undefined;
  } else {
    return sotfs[0] as RemoveBuffEvent;
  }
}

export default SoulOfTheForestLinkNormalizer;
