import SPELLS from 'common/SPELLS/demonhunter';
import TALENTS from 'common/TALENTS/demonhunter';
import {
  ApplyBuffEvent,
  CastEvent,
  EventType,
  GetRelatedEvent,
  RefreshBuffEvent,
} from 'parser/core/Events';
import { Options } from 'parser/core/Module';
import EventLinkNormalizer, { EventLink } from 'parser/core/EventLinkNormalizer';

const EYE_BEAM_FURIOUS_GAZE_BUFFER = 2500;
const EYE_BEAM_FURIOUS_GAZE = 'EyeBeamFuriousGaze';

const EVENT_LINKS: EventLink[] = [
  {
    linkRelation: EYE_BEAM_FURIOUS_GAZE,
    referencedEventId: SPELLS.FURIOUS_GAZE.id,
    referencedEventType: [EventType.ApplyBuff, EventType.RefreshBuff],
    linkingEventId: TALENTS.EYE_BEAM_TALENT.id,
    linkingEventType: EventType.Cast,
    forwardBufferMs: EYE_BEAM_FURIOUS_GAZE_BUFFER,
    backwardBufferMs: 0,
    anyTarget: true,
  },
];

export default class FuriousGazeNormalizer extends EventLinkNormalizer {
  constructor(options: Options) {
    super(options, EVENT_LINKS);
  }
}

export function getFuriousGazeBuffApplication(
  event: CastEvent,
): ApplyBuffEvent | RefreshBuffEvent | undefined {
  return GetRelatedEvent<ApplyBuffEvent | RefreshBuffEvent>(event, EYE_BEAM_FURIOUS_GAZE);
}
