import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/mage';
import EventLinkNormalizer from 'parser/core/EventLinkNormalizer';
import {
  AnyEvent,
  CastEvent,
  EventType,
  GetRelatedEvent,
  GetRelatedEvents,
  HasRelatedEvent,
} from 'parser/core/Events';
import { Options } from 'parser/core/Module';
import { createEventLinks, link } from 'analysis/retail/mage/shared/helpers/castLinkHelpers';

/**
 * Arcane Mage Cast Link Normalizer
 *
 * DEFAULTS (can be overridden per-link):
 * - forwardBuffer: 75ms (CAST_BUFFER_MS)
 * - backwardBuffer: 75ms (CAST_BUFFER_MS)
 * - maxLinks: unlimited
 * - anyTarget: false (links only to same target)
 * - anySource: false (links only to same source)
 * - id: parent spell ID (defaults to the same spell ID as the cast being linked)
 * - reverseRelation: 'auto' (creates bidirectional link using parent EventType)
 *
 */

const CustomType = {
  PRECAST: 'precast',
  CONSUME: 'consume',
  TICK: 'tick',
  BARRAGE_CAST: 'barrageCast',
  REFUND_BUFF: 'refundBuff',
  PREVIOUS_CAST: 'previousCast',
  TOUCH_DEBUFF: 'touchDebuff',
  SURGE_BUFF: 'surgeBuff',
};

const EVENT_LINKS = createEventLinks(
  {
    spell: SPELLS.ARCANE_EXPLOSION.id,
    parentType: EventType.Cast,
    links: [link(EventType.Damage, { anyTarget: true })],
  },

  {
    spell: TALENTS.ARCANE_MISSILES_TALENT.id,
    parentType: EventType.Cast,
    links: [
      link(EventType.Damage, {
        id: SPELLS.ARCANE_MISSILES_DAMAGE.id,
        forwardBuffer: 2600,
        maxLinks: 8,
        anyTarget: true,
      }),
    ],
  },

  {
    spell: SPELLS.ARCANE_ORB.id,
    parentType: EventType.Cast,
    links: [
      link(EventType.Damage, {
        id: SPELLS.ARCANE_ORB_DAMAGE.id,
        forwardBuffer: 1000,
        anyTarget: true,
        condition: (linking, referenced) => !HasRelatedEvent(referenced, EventType.Cast),
      }),
      link(EventType.ResourceChange, {
        id: [SPELLS.ARCANE_ORB.id, SPELLS.ARCANE_ORB_DAMAGE.id],
        anyTarget: true,
        forwardBuffer: 2500,
      }),
      link(CustomType.PREVIOUS_CAST, {
        type: EventType.Cast,
        id: SPELLS.ARCANE_BARRAGE.id,
        anyTarget: true,
        backwardBuffer: 2000,
        maxLinks: 1,
      }),
    ],
  },

  {
    spell: TALENTS.ARCANE_SURGE_TALENT.id,
    parentType: EventType.Cast,
    links: [
      link(EventType.Damage, { maxLinks: 1, anyTarget: true }),
      link(EventType.ApplyBuff, { id: SPELLS.ARCANE_SURGE_BUFF.id, maxLinks: 1, anyTarget: true }),
    ],
  },
  {
    spell: SPELLS.ARCANE_SURGE_BUFF.id,
    parentType: EventType.ApplyBuff,
    links: [
      link(EventType.RemoveBuff, {
        id: SPELLS.ARCANE_SURGE_BUFF.id,
        maxLinks: 1,
        anyTarget: true,
        forwardBuffer: 20000,
      }),
    ],
  },

  {
    spell: TALENTS.TOUCH_OF_THE_MAGI_TALENT.id,
    parentType: EventType.Cast,
    links: [
      link(EventType.ApplyDebuff, {
        id: SPELLS.TOUCH_OF_THE_MAGI_DEBUFF.id,
        maxLinks: 1,
        anyTarget: true,
      }),
      link(EventType.RemoveDebuff, {
        id: SPELLS.TOUCH_OF_THE_MAGI_DEBUFF.id,
        forwardBuffer: 14000,
        maxLinks: 1,
        anyTarget: true,
      }),
      link(EventType.Damage, {
        id: SPELLS.ARCANE_ECHO_DAMAGE.id,
        forwardBuffer: 14000,
        anyTarget: true,
      }),
    ],
  },

  {
    spell: SPELLS.TOUCH_OF_THE_MAGI_DEBUFF.id,
    parentType: EventType.ApplyDebuff,
    links: [
      link(EventType.RemoveDebuff, { forwardBuffer: 15000, maxLinks: 1, anyTarget: true }),
      link(EventType.ResourceChange, { id: TALENTS.TOUCH_OF_THE_MAGI_TALENT.id, anyTarget: true }),
      {
        relation: EventType.Damage,
        type: EventType.Damage,
        id: [
          SPELLS.ARCANE_BLAST.id,
          SPELLS.ARCANE_MISSILES_DAMAGE.id,
          SPELLS.ARCANE_BARRAGE.id,
          SPELLS.ARCANE_EXPLOSION.id,
        ],
        anyTarget: true,
        forwardBuffer: 15000,
        condition: (linkingEvent, referencedEvent) => {
          const debuffEnd = GetRelatedEvent(linkingEvent, EventType.RemoveDebuff);
          return debuffEnd ? referencedEvent.timestamp < debuffEnd.timestamp : false;
        },
      },
      link(CustomType.BARRAGE_CAST, {
        type: EventType.Cast,
        id: SPELLS.ARCANE_BARRAGE.id,
        maxLinks: 1,
        anyTarget: true,
        forwardBuffer: 1500,
        backwardBuffer: 1500,
      }),
    ],
  },
  {
    spell: SPELLS.ARCANE_BARRAGE.id,
    parentType: EventType.Cast,
    links: [
      link(EventType.Damage, { forwardBuffer: 2000, anyTarget: true }),
      link(CustomType.TOUCH_DEBUFF, {
        type: EventType.ApplyDebuff,
        id: SPELLS.TOUCH_OF_THE_MAGI_DEBUFF.id,
        maxLinks: 1,
        anyTarget: true,
        backwardBuffer: 13000,
        condition: isDebuffActive,
      }),
      link(CustomType.SURGE_BUFF, {
        type: EventType.ApplyBuff,
        id: SPELLS.ARCANE_SURGE_BUFF.id,
        maxLinks: 1,
        anyTarget: true,
        backwardBuffer: 16000,
        condition: isBuffActive,
      }),
    ],
  },
  {
    spell: SPELLS.PRISMATIC_BOLT_BUFF.id,
    parentType: [EventType.ApplyBuff, EventType.RefreshBuff],
    links: [
      link(EventType.RefreshBuff, {
        maxLinks: 1,
        forwardBuffer: 60_000,
        condition: (linkingEvent, referencedEvent) => linkingEvent !== referencedEvent,
      }),
      link(EventType.RemoveBuff, {
        maxLinks: 1,
        forwardBuffer: 60_000,
        condition: (linkingEvent, referencedEvent) => {
          const refresh = GetRelatedEvent(linkingEvent, EventType.RefreshBuff);
          return !refresh || referencedEvent.timestamp < refresh.timestamp;
        },
      }),
      link(EventType.BeginCast, { maxLinks: 1, backwardBuffer: 2500 }),
      link(EventType.Cast, {
        id: SPELLS.PRISMATIC_BOLT.id,
        maxLinks: 1,
        anyTarget: true,
        forwardBuffer: 60_000,
        condition: (linkingEvent, referencedEvent) => {
          const buffEnd = GetRelatedEvent(linkingEvent, EventType.RemoveBuff);
          const buffRefresh = GetRelatedEvent(linkingEvent, EventType.RefreshBuff);
          const end =
            buffEnd && buffRefresh
              ? Math.min(buffEnd.timestamp, buffRefresh.timestamp)
              : buffEnd?.timestamp || buffRefresh?.timestamp;
          return end && referencedEvent.timestamp < end + 10 ? true : false;
        },
      }),
      link(EventType.Damage, {
        id: SPELLS.PRISMATIC_BOLT.id,
        anyTarget: true,
        forwardBuffer: 60_000,
        condition: (linkingEvent, referencedEvent) => {
          const buffEnd = GetRelatedEvent(linkingEvent, EventType.RemoveBuff);
          const buffRefresh = GetRelatedEvent(linkingEvent, EventType.RefreshBuff);
          const end =
            buffEnd && buffRefresh
              ? Math.min(buffEnd.timestamp, buffRefresh.timestamp)
              : buffEnd?.timestamp || buffRefresh?.timestamp;
          return end && referencedEvent.timestamp < end + 2000 ? true : false;
        },
      }),
    ],
  },
  {
    spell: SPELLS.CLEARCASTING_ARCANE.id,
    parentType: [EventType.ApplyBuff, EventType.ApplyBuffStack],
    reverseRelation: EventType.ApplyBuff,
    links: [
      link(EventType.RemoveBuff, {
        forwardBuffer: 21000,
        maxLinks: 1,
        anyTarget: true,
        condition: (linking, referenced) => !HasRelatedEvent(referenced, EventType.ApplyBuff),
      }),
      link(CustomType.CONSUME, {
        id: [TALENTS.ARCANE_MISSILES_TALENT.id, SPELLS.ARCANE_EXPLOSION.id],
        forwardBuffer: 21000,
        maxLinks: 1,
        anyTarget: true,
        type: EventType.Cast,
        condition: (linking, referenced) => !HasRelatedEvent(referenced, EventType.Cast),
      }),
    ],
  },

  {
    spell: TALENTS.PRESENCE_OF_MIND_TALENT.id,
    parentType: EventType.Cast,
    links: [
      link(EventType.ApplyBuff),
      link(CustomType.CONSUME, {
        id: SPELLS.ARCANE_BLAST.id,
        maxLinks: 2,
        anyTarget: true,
        forwardBuffer: 15000,
        type: EventType.Cast,
      }),
    ],
  },

  {
    spell: TALENTS.PRESENCE_OF_MIND_TALENT.id,
    parentType: EventType.RemoveBuff,
    links: [
      link(EventType.RemoveDebuff, {
        id: SPELLS.TOUCH_OF_THE_MAGI_DEBUFF.id,
        forwardBuffer: 5000,
        backwardBuffer: 5000,
        maxLinks: 1,
        anyTarget: true,
      }),
    ],
  },

  {
    spell: SPELLS.BURDEN_OF_POWER_BUFF.id,
    parentType: EventType.RemoveBuff,
    links: [
      link(CustomType.CONSUME, {
        id: [SPELLS.ARCANE_BLAST.id, SPELLS.ARCANE_BARRAGE.id],
        maxLinks: 1,
        anyTarget: true,
        type: EventType.Cast,
      }),
    ],
  },
);

/**
 * Links the damage events for spells to their cast event. This allows for more
 * easily accessing the related events in spec modules instead of looking at the
 * events separately.
 */
class CastLinkNormalizer extends EventLinkNormalizer {
  combatant = this.owner.selectedCombatant;
  constructor(options: Options) {
    super(options, EVENT_LINKS);
  }
}

export function getHitCount(aoeCastEvent: CastEvent): number {
  return GetRelatedEvents(aoeCastEvent, EventType.Damage).length;
}

/** Returns true if the debuff on `referencedEvent` (an ApplyDebuff) was still active at the time of `linkingEvent`. */
export function isDebuffActive(linkingEvent: AnyEvent, referencedEvent: AnyEvent): boolean {
  const debuffEnd = GetRelatedEvent(referencedEvent, EventType.RemoveDebuff);
  return !debuffEnd || debuffEnd.timestamp >= linkingEvent.timestamp;
}

/** Returns true if the buff on `referencedEvent` (an ApplyBuff) was still active at the time of `linkingEvent`. */
export function isBuffActive(linkingEvent: AnyEvent, referencedEvent: AnyEvent): boolean {
  const buffEnd = GetRelatedEvent(referencedEvent, EventType.RemoveBuff);
  return !buffEnd || buffEnd.timestamp >= linkingEvent.timestamp;
}

export default CastLinkNormalizer;
