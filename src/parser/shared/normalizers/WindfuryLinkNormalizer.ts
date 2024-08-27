import SPELLS from 'common/SPELLS';
import EventLinkNormalizer, { EventLink } from 'parser/core/EventLinkNormalizer';
import { CastEvent, EventType, ExtraAttacksEvent, GetRelatedEvents } from 'parser/core/Events';
import { Options } from 'parser/core/Module';

const TRIGGERED_WINDFURY = 'TriggeredWindfury';
const WINDFURY_TRIGGERED_BY = 'WindfuryTriggeredBy';

const TRIGGERED_BY_WINDFURY = 'TriggeredByWindfury';
const WINDFURY_TRIGGERED = 'WindfuryTriggered';

const EVENT_LINKS: EventLink[] = [
  {
    linkRelation: TRIGGERED_WINDFURY,
    reverseLinkRelation: WINDFURY_TRIGGERED_BY,
    linkingEventId: SPELLS.MELEE.id,
    linkingEventType: EventType.Cast,
    referencedEventId: [SPELLS.WINDFURY_EXTRA_ATTACK_MH.id, SPELLS.WINDFURY_EXTRA_ATTACK_OH.id],
    referencedEventType: EventType.ExtraAttacks,
    maximumLinks: 1,
    // The extra attack has player as target
    anyTarget: true,
  },
  {
    linkRelation: TRIGGERED_BY_WINDFURY,
    reverseLinkRelation: WINDFURY_TRIGGERED,
    linkingEventId: [SPELLS.WINDFURY_EXTRA_ATTACK_MH.id, SPELLS.WINDFURY_EXTRA_ATTACK_OH.id],
    linkingEventType: EventType.ExtraAttacks,
    referencedEventId: SPELLS.MELEE.id,
    referencedEventType: EventType.Cast,
    forwardBufferMs: 200,
    maximumLinks: 1,
    // The extra attack has player as target
    anyTarget: true,
  },
];

/**
 * Helper to track attacks caused by the "Windfury" effect of the Skyfury raid buff.
 *
 * Links Melee hits that trigger Windfury with the WindFury "Extra Attacks" event.
 * And also the Windfury "Extra Attacks" event with the new Melee cast.
 */
class WindfuryLinkNormalizer extends EventLinkNormalizer {
  constructor(options: Options) {
    super(options, EVENT_LINKS);
  }
}

export default WindfuryLinkNormalizer;

/**
 * Each Windfury proc connects a chain of 3 events:
 *
 * 1. The Melee attack that **_trigger_** the Windfury proc
 * 2. The **_Windfury_** "Extra Attacks" event
 * 3. The new Melee attack that was **_triggered_** by the Windfury proc
 *
 * This function returns **Windfury** (2) from the **Trigger** (1)
 */
export function getWindfuryFromTrigger(event: CastEvent): ExtraAttacksEvent | undefined {
  const relatedEvent = GetRelatedEvents(event, TRIGGERED_WINDFURY)[0];

  if (!relatedEvent) {
    return undefined;
  }

  if (relatedEvent.type !== EventType.ExtraAttacks) {
    throw new Error('Somehow linked to non-extra attack event');
  }

  return relatedEvent;
}

/**
 * Each Windfury proc connects a chain of 3 events:
 *
 * 1. The Melee attack that **_trigger_** the Windfury proc
 * 2. The **_Windfury_** "Extra Attacks" event
 * 3. The new Melee attack that was **_triggered_** by the Windfury proc
 *
 * This function returns **Windfury** (2) from the **Triggered** (3)
 */
export function getWindfuryFromTriggered(event: CastEvent): ExtraAttacksEvent | undefined {
  const relatedEvent = GetRelatedEvents(event, WINDFURY_TRIGGERED)[0];

  if (!relatedEvent) {
    return undefined;
  }

  if (relatedEvent.type !== EventType.ExtraAttacks) {
    throw new Error('Somehow linked to non-extra attack event');
  }

  return relatedEvent;
}
