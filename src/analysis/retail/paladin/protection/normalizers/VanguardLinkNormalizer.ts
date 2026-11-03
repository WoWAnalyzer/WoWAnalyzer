import { Options } from 'parser/core/Analyzer';
import EventLinkNormalizer, { EventLink } from 'parser/core/EventLinkNormalizer';
import { EventType } from 'parser/core/Events';
import SPELLS from 'common/SPELLS/paladin';
import TALENTS from 'common/TALENTS/paladin';

const VANGUARD_CONSUMED_WINDOW_MS = 100;

export const VANGUARD_CONSUMED_BY = 'VanguardConsumedBy';

const EVENT_LINKS: EventLink[] = [
  {
    linkRelation: VANGUARD_CONSUMED_BY,
    linkingEventId: SPELLS.VANGUARD_BUFF.id,
    linkingEventType: EventType.RemoveBuff,
    referencedEventId: TALENTS.AVENGERS_SHIELD_TALENT.id,
    referencedEventType: EventType.Cast,
    forwardBufferMs: VANGUARD_CONSUMED_WINDOW_MS,
    backwardBufferMs: VANGUARD_CONSUMED_WINDOW_MS,
    anyTarget: true,
    maximumLinks: 1,
  },
];

export default class VanguardLinkNormalizer extends EventLinkNormalizer {
  constructor(options: Options) {
    super(options, EVENT_LINKS);
    this.active = this.selectedCombatant.hasTalent(
      TALENTS.GLORY_OF_THE_VANGUARD_1_PROTECTION_TALENT,
    );
  }
}
