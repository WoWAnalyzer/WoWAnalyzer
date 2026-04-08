import SPELLS from 'common/SPELLS';
import { Options } from 'parser/core/Analyzer';
import EventLinkNormalizer, { EventLink } from 'parser/core/EventLinkNormalizer';
import { CastEvent, DamageEvent, EventType, GetRelatedEvents } from 'parser/core/Events';

const XUENS_BATTLEGEAR_FOF_TRIGGER = 'xuens-battlegear-fof-trigger';
const XUENS_BATTLEGEAR_BUFFER_MS = 500;

const EVENT_LINKS: EventLink[] = [
  {
    linkRelation: XUENS_BATTLEGEAR_FOF_TRIGGER,
    reverseLinkRelation: XUENS_BATTLEGEAR_FOF_TRIGGER,
    linkingEventId: SPELLS.FISTS_OF_FURY_CAST.id,
    linkingEventType: EventType.Cast,
    referencedEventId: [
      SPELLS.RISING_SUN_KICK_DAMAGE.id,
      SPELLS.RUSHING_WIND_KICK_DAMAGE.id,
      SPELLS.GLORY_OF_THE_DAWN_DAMAGE.id,
    ],
    referencedEventType: EventType.Damage,
    forwardBufferMs: XUENS_BATTLEGEAR_BUFFER_MS,
    backwardBufferMs: XUENS_BATTLEGEAR_BUFFER_MS,
    anyTarget: true,
  },
];

/**
 * RSK / RWK / Glory of the Dawn damage can be logged just after a nearby Fists of Fury cast.
 * Link those late hits back to the FoF cast so SpellUsable can apply any Xuen's Battlegear
 * reduction before validating the cast's cooldown availability.
 */
class XuensBattlegearNormalizer extends EventLinkNormalizer {
  constructor(options: Options) {
    super(options, EVENT_LINKS);
  }
}

export function getLateXuensBattlegearTriggers(event: CastEvent): DamageEvent[] {
  return GetRelatedEvents<DamageEvent>(event, XUENS_BATTLEGEAR_FOF_TRIGGER);
}

export default XuensBattlegearNormalizer;
