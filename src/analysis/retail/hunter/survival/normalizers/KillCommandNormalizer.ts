import TALENTS from 'common/TALENTS/hunter';
import EventLinkNormalizer, { EventLink } from 'parser/core/EventLinkNormalizer';
import { EventType, HasAbility } from 'parser/core/Events';
import { Options } from 'parser/core/Module';

export const KC_FOCUS_LINK = 'kill-command-cast-focus';
export const KC_NEXT_CAST = 'kill-command-next-cast';

const EVENT_LINKS: EventLink[] = [
  // Link Kill Command cast to its focus resourcechange event
  {
    linkRelation: KC_FOCUS_LINK,
    linkingEventId: TALENTS.KILL_COMMAND_SURVIVAL_TALENT.id,
    linkingEventType: EventType.Cast,
    referencedEventId: TALENTS.KILL_COMMAND_SURVIVAL_TALENT.id,
    referencedEventType: EventType.ResourceChange,
    forwardBufferMs: 50,
    backwardBufferMs: 50,
    anyTarget: true,
    maximumLinks: 1,
  },
  // Link Kill Command cast to the next player cast (used to check if Takedown follows)
  {
    linkRelation: KC_NEXT_CAST,
    linkingEventId: TALENTS.KILL_COMMAND_SURVIVAL_TALENT.id,
    linkingEventType: EventType.Cast,
    referencedEventId: null,
    referencedEventType: [EventType.Cast, EventType.BeginCast],
    forwardBufferMs: 3000,
    anyTarget: true,
    maximumLinks: 1,
    // Exclude melee and exclude Kill Command itself
    additionalCondition: (linkingEvent, referencedEvent) => {
      if (!HasAbility(referencedEvent)) {
        return false;
      }
      const guid = referencedEvent.ability.guid;
      return guid !== 1 && guid !== TALENTS.KILL_COMMAND_SURVIVAL_TALENT.id;
    },
  },
];

class KillCommandNormalizer extends EventLinkNormalizer {
  constructor(options: Options) {
    super(options, EVENT_LINKS);
  }
}

export default KillCommandNormalizer;
