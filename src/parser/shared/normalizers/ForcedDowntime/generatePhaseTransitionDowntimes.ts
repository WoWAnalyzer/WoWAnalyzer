import { AnyEvent, EventType } from 'parser/core/Events';
import { DowntimeWindow } from 'parser/shared/normalizers/ForcedDowntime/index';

/**
 * Generates downtime windows corresponding to 'phase transition downtime' - a period of time during a phase transition that is forced downtime.
 * Ex. Raszageth P1->I1 and I2->P3, Sarkareth P1->P2
 */
export default function generatePhaseTransitionDowntimes(
  spec: PhaseTransitionDowntimeSpec,
): (events: AnyEvent[], reason: string) => DowntimeWindow[] {
  return (events, reason) => {
    return events
      .filter((e) => e.type === EventType.PhaseEnd && e.phase.key === spec.downtimeEndingPhaseKey)
      .map((e) => {
        return {
          start: e.timestamp + spec.downtimeStartOffset,
          end: e.timestamp + spec.downtimeEndOffset,
          reason,
        };
      });
  };
}

/** Defines parameters of a phase transition downtime */
export interface PhaseTransitionDowntimeSpec {
  /** Phase key for the ending phase when this downtime happens
   *  For example if there is downtime between phase 2 and 3, specify '2' here. */
  downtimeEndingPhaseKey: string;
  /** Offset from the transition at which the downtime starts, in milliseconds.
   *  Positive means downtime border is after phase border, negative means downtime border is before phase border. */
  downtimeStartOffset: number;
  /** Offset from the transition at which the downtime ends, in milliseconds.
   *  Positive means downtime border is after phase border, negative means downtime border is before phase border. */
  downtimeEndOffset: number;
}
