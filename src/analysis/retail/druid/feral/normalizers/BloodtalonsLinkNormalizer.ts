import EventLinkNormalizer, { EventLink } from 'parser/core/EventLinkNormalizer';
import { Options } from 'parser/core/Module';
import SPELLS from 'common/SPELLS';
import {
  AnyEvent,
  CastEvent,
  EventType,
  GetRelatedEvents,
  HasAbility,
  HasRelatedEvent,
} from 'parser/core/Events';
import { CP_GENERATORS } from 'analysis/retail/druid/feral/constants';
import { TALENTS_DRUID } from 'common/TALENTS';

/** Link from BT application to the casts that procced it */
const PROCCED_BY = 'BloodtalonsProccedBy';
/** Link from cast to the BT application it contributed to */
const PROCCED_BLOODTALONS = 'ProccedBloodtalons';

/** Buff after the bloodtalons buff in case cast placed slightly after */
const CAST_BUFFER_MS = 50;
/** Bloodtalons can be procced by spells cast up to 4 seconds beforehand */
const BLOODTALONS_BUFFER_MS = 4050;
/** Condition to ensure spells attributed to causing the proc are 3 unique spells */
const THREE_UNIQUE_SPELLS_CONDITION = (linkingEvent: AnyEvent, referencedEvent: AnyEvent) => {
  const spellsSoFar = GetRelatedEvents(linkingEvent, PROCCED_BY);
  if (spellsSoFar.length >= 3) {
    return false;
  }
  const sameIdLinked = spellsSoFar.find(
    (e) =>
      HasAbility(e) &&
      HasAbility(referencedEvent) &&
      e.ability.guid === referencedEvent.ability.guid,
  );
  return !sameIdLinked;
};

const EVENT_LINKS: EventLink[] = [
  {
    linkRelation: PROCCED_BY,
    reverseLinkRelation: PROCCED_BLOODTALONS,
    linkingEventId: SPELLS.BLOODTALONS_BUFF.id,
    linkingEventType: [EventType.ApplyBuff, EventType.RefreshBuff],
    referencedEventId: CP_GENERATORS.map((s) => s.id),
    referencedEventType: EventType.Cast,
    forwardBufferMs: CAST_BUFFER_MS,
    backwardBufferMs: BLOODTALONS_BUFFER_MS,
    anyTarget: true,
    additionalCondition: THREE_UNIQUE_SPELLS_CONDITION,
  },
];

/**
 * Bloodtalons is procced by 3 CP builders being cast in 4 seconds.
 * This normalizer links each Bloodtalons buff application to the 3 spells that procced it.
 */
class BloodtalonsLinkNormalizer extends EventLinkNormalizer {
  constructor(options: Options) {
    super(options, EVENT_LINKS);
    this.active = this.selectedCombatant.hasTalent(TALENTS_DRUID.BLOODTALONS_TALENT);
  }
}

export function proccedBloodtalons(event: CastEvent): boolean {
  return HasRelatedEvent(event, PROCCED_BLOODTALONS);
}

export default BloodtalonsLinkNormalizer;
