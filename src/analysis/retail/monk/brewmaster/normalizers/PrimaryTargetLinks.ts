import EventLinkNormalizer from 'parser/core/EventLinkNormalizer';
import SPELLS from '../spell-list_Monk_Brewmaster.retail';
import { EventType } from 'parser/core/Events';

// these links use an "inverted" link pattern with max links = 1. this means that every
// damage event has at most 1 link back to a cast event, but the cast event may have reverse links to
// many damage events.

export const { linkHelper: kegSmashPrimaryTarget, normalizer: KegSmashPrimaryTargetNormalizer } =
  EventLinkNormalizer.build({
    reverseLinkRelation: 'ks-damage',
    linkRelation: 'ks-cast',
    linkingEventId: SPELLS.KEG_SMASH_TALENT.id,
    linkingEventType: EventType.Damage,
    referencedEventId: SPELLS.KEG_SMASH_TALENT.id,
    referencedEventType: EventType.Cast,
    anySource: false,
    anyTarget: true,
    maximumLinks: 1,
    // Keg Smash has a potentially long travel time
    backwardBufferMs: 2000,
  });

export const {
  linkHelper: blackoutKickPrimaryTarget,
  normalizer: BlackoutKickPrimaryTargetNormalizer,
} = EventLinkNormalizer.build({
  reverseLinkRelation: 'bok-damage',
  linkRelation: 'bok-cast',
  linkingEventId: SPELLS.BLACKOUT_KICK.id,
  linkingEventType: EventType.Damage,
  referencedEventId: SPELLS.BLACKOUT_KICK.id,
  referencedEventType: EventType.Cast,
  anySource: false,
  anyTarget: true,
  maximumLinks: 1,
  backwardBufferMs: 100,
});

export const { linkHelper: spinningCraneKickTick, normalizer: SpinningCraneKickTickNormalizer } =
  EventLinkNormalizer.build({
    linkRelation: 'sck-damage',
    reverseLinkRelation: 'sck-tick-group',
    linkingEventId: SPELLS.SPINNING_CRANE_KICK.channel.triggeredSpells[0].spell,
    linkingEventType: EventType.Damage,
    referencedEventId: SPELLS.SPINNING_CRANE_KICK.id,
    referencedEventType: EventType.Cast,
    anyTarget: true,
    backwardBufferMs: 1600,
    maximumLinks: 1,
  });
