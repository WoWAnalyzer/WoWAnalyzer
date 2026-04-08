import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/mage';
import EventLinkNormalizer from 'parser/core/EventLinkNormalizer';
import {
  ApplyBuffEvent,
  BeginCastEvent,
  CastEvent,
  DamageEvent,
  EventType,
  GetRelatedEvents,
  RemoveBuffEvent,
} from 'parser/core/Events';
import { Options } from 'parser/core/Module';
import { createEventLinks, link } from '../../shared';

/**
 * Fire Mage Cast Link Normalizer
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

const CAST_BUFFER_MS = 100;

const CustomType = {
  PRECAST: 'precast',
  CONSUME: 'consume',
  LAST_BUFF_REFRESH: 'lastBuffRefresh',
};

const EVENT_LINKS = createEventLinks(
  {
    spell: SPELLS.FIREBALL.id,
    parentType: EventType.Cast,
    links: [
      link(EventType.BeginCast, { backwardBuffer: 3000, maxLinks: 1, anyTarget: true }),
      link(EventType.Damage, { forwardBuffer: 1000, maxLinks: 1 }),
    ],
  },
  {
    spell: TALENTS.FROSTFIRE_BOLT_TALENT.id,
    parentType: EventType.Cast,
    links: [
      link(EventType.BeginCast, { backwardBuffer: 3000, maxLinks: 1, anyTarget: true }),
      link(EventType.Damage, { forwardBuffer: 1000, maxLinks: 1 }),
    ],
  },
  {
    spell: TALENTS.PYROBLAST_TALENT.id,
    parentType: EventType.Cast,
    links: [
      link(EventType.BeginCast, { backwardBuffer: 3000, maxLinks: 1, anyTarget: true }),
      link(EventType.Damage, { forwardBuffer: 2000, maxLinks: 1 }),
    ],
  },
  {
    spell: TALENTS.SCORCH_TALENT.id,
    parentType: EventType.Cast,
    links: [
      link(EventType.BeginCast, { maxLinks: 1, anyTarget: true }),
      link(EventType.Damage, { maxLinks: 1 }),
    ],
  },
  {
    spell: SPELLS.FIRE_BLAST.id,
    parentType: EventType.Cast,
    links: [
      link(EventType.BeginCast, { maxLinks: 1, anyTarget: true }),
      link(EventType.Damage, { maxLinks: 1 }),
      link(CustomType.LAST_BUFF_REFRESH, {
        id: SPELLS.FEEL_THE_BURN_BUFF.id,
        type: [EventType.ApplyBuff, EventType.ApplyBuffStack, EventType.RefreshBuff],
        anyTarget: true,
        maxLinks: 1,
        backwardBuffer: 4000,
        forwardBuffer: -10,
      }),
    ],
  },
  {
    spell: TALENTS.FLAMESTRIKE_1_FIRE_TALENT.id,
    parentType: EventType.Cast,
    links: [
      link(EventType.BeginCast, { backwardBuffer: 2000, maxLinks: 1, anyTarget: true }),
      link(EventType.Damage, { forwardBuffer: 1000, anyTarget: true }),
    ],
  },
  {
    spell: TALENTS.FLAMESTRIKE_2_FIRE_TALENT.id,
    parentType: EventType.Cast,
    links: [
      link(EventType.BeginCast, { backwardBuffer: 2000, maxLinks: 1, anyTarget: true }),
      link(EventType.Damage, { forwardBuffer: 1000, anyTarget: true }),
    ],
  },
  {
    spell: TALENTS.METEOR_TALENT.id,
    parentType: EventType.Cast,
    links: [
      link(EventType.BeginCast, { maxLinks: 1, anyTarget: true }),
      link(EventType.Damage, { id: SPELLS.METEOR_DAMAGE.id, forwardBuffer: 5000, anyTarget: true }),
    ],
  },
  {
    spell: TALENTS.COMBUSTION_TALENT.id,
    parentType: EventType.Cast,
    links: [
      link(EventType.ApplyBuff, { maxLinks: 1, anyTarget: true }),
      link(EventType.RemoveBuff, { forwardBuffer: 20000, maxLinks: 1, anyTarget: true }),
      link(CustomType.PRECAST, {
        id: [
          SPELLS.FIREBALL.id,
          TALENTS.PYROBLAST_TALENT.id,
          SPELLS.SCORCH.id,
          TALENTS.FLAMESTRIKE_1_FIRE_TALENT.id,
          TALENTS.FLAMESTRIKE_2_FIRE_TALENT.id,
          TALENTS.FROSTFIRE_BOLT_TALENT.id,
        ],
        type: EventType.Cast,
        anyTarget: true,
        maxLinks: 1,
        forwardBuffer: 3000,
        condition: (linkingEvent, referencedEvent) => {
          return !isInstantCast(referencedEvent as CastEvent);
        },
      }),
      link(EventType.Cast, {
        id: [
          TALENTS.PYROBLAST_TALENT.id,
          TALENTS.FLAMESTRIKE_1_FIRE_TALENT.id,
          TALENTS.FLAMESTRIKE_2_FIRE_TALENT.id,
        ],
        forwardBuffer: 20000,
        backwardBuffer: 2500,
        anyTarget: true,
        condition: (linkingEvent, referencedEvent) => {
          // Looking for the Pyroblast and Flamestrike casts that occurred immediately before Combustion
          // as well as the ones that were potentially cast during Combustion. Then looking to see if the
          // associated damage events landed during Combustion.
          const buffApply = GetRelatedEvents<ApplyBuffEvent>(
            linkingEvent as CastEvent,
            EventType.ApplyBuff,
          )[0];
          const buffRemove = GetRelatedEvents<RemoveBuffEvent>(
            linkingEvent as CastEvent,
            EventType.RemoveBuff,
          )[0];
          const damage = GetRelatedEvents<DamageEvent>(
            referencedEvent as CastEvent,
            EventType.Damage,
          )[0];
          if (!damage || !buffApply || !buffRemove) return false;
          return damage.timestamp >= buffApply.timestamp && damage.timestamp < buffRemove.timestamp;
        },
      }),
    ],
  },
  {
    spell: TALENTS.COMBUSTION_TALENT.id,
    parentType: EventType.ApplyBuff,
    links: [link(EventType.RemoveBuff, { forwardBuffer: 20_000, maxLinks: 1, anyTarget: true })],
  },
  {
    spell: SPELLS.HOT_STREAK.id,
    parentType: EventType.ApplyBuff,
    links: [link(EventType.RemoveBuff, { forwardBuffer: 16_000, maxLinks: 1 })],
  },
  {
    spell: SPELLS.HOT_STREAK.id,
    parentType: EventType.RemoveBuff,
    links: [
      link(CustomType.CONSUME, {
        id: [
          TALENTS.PYROBLAST_TALENT.id,
          TALENTS.FLAMESTRIKE_1_FIRE_TALENT.id,
          TALENTS.FLAMESTRIKE_2_FIRE_TALENT.id,
        ],
        type: EventType.Cast,
        maxLinks: 1,
        anyTarget: true,
        backwardBuffer: 150,
        forwardBuffer: 150,
        condition: (linkingEvent, referencedEvent) => {
          if ((referencedEvent as CastEvent).ability.guid === TALENTS.PYROBLAST_TALENT.id) {
            return isInstantCast(referencedEvent as CastEvent);
          }
          return true;
        },
      }),
      link(CustomType.PRECAST, {
        id: [SPELLS.FIREBALL.id, TALENTS.FROSTFIRE_BOLT_TALENT.id],
        type: EventType.Cast,
        maxLinks: 1,
        anyTarget: true,
        backwardBuffer: 150,
      }),
    ],
  },
  {
    spell: SPELLS.FEEL_THE_BURN_BUFF.id,
    parentType: [EventType.ApplyBuff, EventType.ApplyBuffStack, EventType.RefreshBuff],
    links: [link(EventType.RemoveBuff, { forwardBuffer: 600_000, maxLinks: 1 })],
  },
  {
    spell: SPELLS.HEAT_SHIMMER_BUFF.id,
    parentType: EventType.RemoveBuff,
    links: [
      link(EventType.ApplyBuff, { backwardBuffer: 15_000, maxLinks: 1 }),
      link(CustomType.CONSUME, {
        id: TALENTS.SCORCH_TALENT.id,
        type: EventType.Cast,
        maxLinks: 1,
        anyTarget: true,
      }),
    ],
  },
);

// Leaving the below here because i cant figure out right now why i needed to connect
// ApplyBuffStack to ApplyBuff, but i dont want to get rid of it and then realize i need it.
// const EVENT_LINKS: EventLink[] = [
//   {
//     linkingEventId: SPELLS.FEEL_THE_BURN_BUFF.id,
//     linkingEventType: EventType.ApplyBuffStack,
//     linkRelation: BUFF_APPLY,
//     referencedEventId: SPELLS.FEEL_THE_BURN_BUFF.id,
//     referencedEventType: EventType.ApplyBuff,
//     maximumLinks: 1,
//     forwardBufferMs: CAST_BUFFER_MS,
//     backwardBufferMs: 600_000, //If you manage your charges, you can keep the buff up pretty much the whole fight, so 10min just in case.
//   },
// ];

/**
 * When a spell is cast on a target, the ordering of the Cast and ApplyBuff/RefreshBuff/(direct)Heal
 * can be semi-arbitrary, making analysis difficult.
 *
 * This normalizer adds a _linkedEvent to the ApplyBuff/RefreshBuff/Heal linking back to the Cast event
 * that caused it (if one can be found).
 *
 */
class CastLinkNormalizer extends EventLinkNormalizer {
  constructor(options: Options) {
    super(options, EVENT_LINKS);
  }
}

function isInstantCast(event: CastEvent): boolean {
  const beginCast = GetRelatedEvents<BeginCastEvent>(event, EventType.BeginCast)[0];
  return !beginCast || event.timestamp - beginCast.timestamp <= CAST_BUFFER_MS;
}

export default CastLinkNormalizer;
