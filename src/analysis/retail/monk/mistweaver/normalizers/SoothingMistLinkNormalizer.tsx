import SPELLS from 'common/SPELLS';
import { TALENTS_MONK } from 'common/TALENTS';
import { Options } from 'parser/core/Analyzer';
import EventsNormalizer from 'parser/core/EventsNormalizer';
import {
  AnyEvent,
  CastEvent,
  RemoveBuffEvent,
  ApplyBuffEvent,
  EventType,
  AddRelatedEvent,
  HasAbility,
  HasSource,
  HasTarget,
} from 'parser/core/Events';
import {
  SOOTHING_MIST_CHANNEL_START,
  SOOTHING_MIST_CHANNEL_END,
} from './EventLinks/EventLinkConstants';

const REAPPLY_BUFFER = 10; // ms

class SoothingMistLinkNormalizer extends EventsNormalizer {
  constructor(options: Options) {
    super(options);
  }

  normalize(events: AnyEvent[]): AnyEvent[] {
    const castEvents: CastEvent[] = [];
    const removeBuffEvents: RemoveBuffEvent[] = [];
    const applyBuffEvents: ApplyBuffEvent[] = [];

    for (const event of events) {
      if (!this.isPlayerSoothingMist(event)) {
        continue;
      }

      if (event.type === EventType.Cast) {
        castEvents.push(event);
      } else if (event.type === EventType.RemoveBuff || event.type === EventType.ApplyBuff) {
        if (!HasTarget(event) || event.targetID !== this.selectedCombatant.id) {
          continue;
        }

        if (event.type === EventType.RemoveBuff) {
          removeBuffEvents.push(event);
        } else {
          applyBuffEvents.push(event);
        }
      }
    }

    this.linkChannelStartToEnd(castEvents, removeBuffEvents, applyBuffEvents);

    return events;
  }

  private isPlayerSoothingMist(event: AnyEvent): boolean {
    return (
      HasAbility(event) &&
      event.ability.guid === TALENTS_MONK.SOOTHING_MIST_TALENT.id &&
      HasSource(event) &&
      event.sourceID === this.selectedCombatant.id
    );
  }

  private linkChannelStartToEnd(
    castEvents: CastEvent[],
    removeBuffEvents: RemoveBuffEvent[],
    applyBuffEvents: ApplyBuffEvent[],
  ): void {
    castEvents.forEach((castEvent) => {
      const candidateRemoves = removeBuffEvents.filter(
        (remove) => remove.timestamp >= castEvent.timestamp,
      );

      for (const removeEvent of candidateRemoves) {
        // reapplications are target swaps
        const reapplication = applyBuffEvents.some(
          (apply) =>
            apply.timestamp >= removeEvent.timestamp &&
            apply.timestamp <= removeEvent.timestamp + REAPPLY_BUFFER,
        );

        if (reapplication) {
          continue;
        }

        // no reapplication event, so this is the actual end of the channel
        this.createLink(castEvent, removeEvent);
        break;
      }
    });
  }

  private createLink(castEvent: CastEvent, removeEvent: RemoveBuffEvent): void {
    AddRelatedEvent(castEvent, SOOTHING_MIST_CHANNEL_END, removeEvent);
    AddRelatedEvent(removeEvent, SOOTHING_MIST_CHANNEL_START, castEvent);
  }
}

export default SoothingMistLinkNormalizer;
