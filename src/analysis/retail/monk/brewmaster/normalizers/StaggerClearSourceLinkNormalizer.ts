import EventLinkNormalizer, { EventLink, linkHelper } from 'parser/core/EventLinkNormalizer';
import SPELLS from '../spell-list_Monk_Brewmaster.retail';
import { AnyEvent, EventType } from 'parser/core/Events';
import { Options } from 'parser/core/Module';
import { GIFT_OF_THE_OX_SPELL_IDS } from '../constants';

const CLEAR_LINK_RELATIONS = new Set<string>();

// shared settings for mutually-exclusive stagger clear linking.
const COMMON_CLEAR_LINK = {
  referencedEventId: null,
  referencedEventType: EventType.StaggerClear as const,
  anyTarget: true,
  anySource: false,
  additionalCondition(_linkingEvent: AnyEvent, referencedEvent: AnyEvent) {
    if (referencedEvent?._linkedEvents) {
      return referencedEvent._linkedEvents.every(
        (link) => !CLEAR_LINK_RELATIONS.has(link.relation),
      );
    }
    return true;
  },
};

const purifyLink = {
  linkRelation: 'purifying-brew-clear',
  reverseLinkRelation: 'purifying-brew-clear',
  linkingEventId: SPELLS.PURIFYING_BREW_TALENT.id,
  linkingEventType: EventType.Cast,
  // while most of these links are forward, PB logs `staggerclear` *then* the `cast`
  backwardBufferMs: 100,
  maximumLinks: 1,
  ...COMMON_CLEAR_LINK,
} satisfies EventLink;

const quickSipLink = {
  linkRelation: 'quick-sip-clear',
  reverseLinkRelation: 'quick-sip-clear',
  // quick sip triggers on shuffle, but shuffle refreshes are not logged so we look for
  // damage from shuffle-applying spells instead
  linkingEventId: [
    SPELLS.SPINNING_CRANE_KICK_HIDDEN.id,
    SPELLS.KEG_SMASH_TALENT.id,
    SPELLS.BLACKOUT_KICK.id,
  ],
  linkingEventType: EventType.Damage,
  forwardBufferMs: 100,
  maximumLinks: 1,
  isActive(combatant) {
    return combatant.hasTalent(SPELLS.QUICK_SIP_TALENT);
  },
  ...COMMON_CLEAR_LINK,
} satisfies EventLink;

const staggeringStrikesLink = {
  linkRelation: 'staggering-strikes-clear',
  reverseLinkRelation: 'staggering-strikes-clear',
  linkingEventId: SPELLS.BLACKOUT_KICK.id,
  linkingEventType: EventType.Damage,
  forwardBufferMs: 100,
  maximumLinks: 1,
  isActive(combatant) {
    return combatant.hasTalent(SPELLS.STAGGERING_STRIKES_TALENT);
  },
  ...COMMON_CLEAR_LINK,
} satisfies EventLink;

const touchOfDeathLink = {
  linkRelation: 'touch-of-death-clear',
  reverseLinkRelation: 'touch-of-death-clear',
  linkingEventId: SPELLS.TOUCH_OF_DEATH.id,
  linkingEventType: EventType.Damage,
  forwardBufferMs: 100,
  maximumLinks: 1,
  ...COMMON_CLEAR_LINK,
} satisfies EventLink;

const tranquilSpiritLink = {
  linkRelation: 'tranquil-spirit-clear',
  reverseLinkRelation: 'tranquil-spirit-clear',
  linkingEventId: [...GIFT_OF_THE_OX_SPELL_IDS, SPELLS.EXPEL_HARM.id],
  linkingEventType: EventType.Heal,
  // usually before, sometimes exactly matching, rarely a few ms after
  backwardBufferMs: 100,
  forwardBufferMs: 10,
  maximumLinks: 1,
  isActive(combatant) {
    return combatant.hasTalent(SPELLS.TRANQUIL_SPIRIT_TALENT);
  },
  ...COMMON_CLEAR_LINK,
} satisfies EventLink;

const CLEAR_LINKS = [
  purifyLink,
  quickSipLink,
  staggeringStrikesLink,
  touchOfDeathLink,
  tranquilSpiritLink,
];

CLEAR_LINKS.forEach((link) => CLEAR_LINK_RELATIONS.add(link.linkRelation));

export default class StaggerClearSourceLinkNormalizer extends EventLinkNormalizer {
  constructor(options: Options) {
    super(options, CLEAR_LINKS);
  }
}

export const purifyingBrewClear = linkHelper(purifyLink);
export const quickSipClear = linkHelper(quickSipLink);
export const staggeringStrikesClear = linkHelper(staggeringStrikesLink);
export const touchOfDeathClear = linkHelper(touchOfDeathLink);
export const tranquilSpiritClear = linkHelper(tranquilSpiritLink);
