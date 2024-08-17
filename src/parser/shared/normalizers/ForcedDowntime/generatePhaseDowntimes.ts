import { AnyEvent, EventType } from 'parser/core/Events';
import { DowntimeWindow } from 'parser/shared/normalizers/ForcedDowntime/index';

/**
 * Generates downtime windows correspondoing to a 'downtime phase' - a phase that is all or almost all forced downtime.
 * Ex. Tindral Intermission, Shriekwing Intermission
 */
export default function generatePhaseDowntimes(
  spec: PhaseDowntimeSpec,
): (events: AnyEvent[], reason: string) => DowntimeWindow[] {
  return (events, reason) => {
    const windows: DowntimeWindow[] = [];
    const matchingPhaseEvents = events.filter(
      (e) =>
        (e.type === EventType.PhaseStart || e.type === EventType.PhaseEnd) &&
        e.phase.key === spec.downtimePhaseKey,
    );
    let prevStart: number | null = null;
    matchingPhaseEvents.forEach((e) => {
      if (e.type === EventType.PhaseStart) {
        prevStart = e.timestamp + (spec.downtimeStartOffset || 0);
      }
      if (e.type === EventType.PhaseEnd && prevStart !== null) {
        windows.push({
          start: prevStart,
          end: e.timestamp + (spec.downtimeEndOffset || 0),
          reason,
        });
        prevStart = null;
      }
    });
    return windows;
  };
}

/** Defines parameters of a phase downtime */
export interface PhaseDowntimeSpec {
  /** The downtime phase key */
  downtimePhaseKey: string;
  /** Offset from phase start at which the downtime starts, in milliseconds.
   *  Positive means downtime border is after phase border, negative means downtime border is before phase border. */
  downtimeStartOffset?: number;
  /** Offset from phase end at which the downtime ends, in milliseconds.
   *  Positive means downtime border is after phase border, negative means downtime border is before phase border. */
  downtimeEndOffset?: number;
}
