import EventsNormalizer from 'parser/core/EventsNormalizer';
import {
  AnyEvent,
  EventType,
  ForcedDowntimeEndEvent,
  ForcedDowntimeStartEvent,
} from 'parser/core/Events';
import { amidrassil_downtime_specs } from 'parser/shared/normalizers/ForcedDowntime/raids/Amidrassil';
import { Difficulty } from 'game/DIFFICULTIES';
import { vault_of_the_incarnates_downtime_specs } from 'parser/shared/normalizers/ForcedDowntime/raids/VaultOfTheIncarnates';
import { aberrus_downtime_specs } from 'parser/shared/normalizers/ForcedDowntime/raids/Aberrus';

/**
 * Base interface for defining the boundaries of a forced downtime period.
 */
export interface DowntimeSpec {
  /** Encounter ID this spec applies to. All downtime specs are encounter specific */
  encounterId: number;
  /**
   * What roles this downtime applies to. If omitted, this spec applies to all roles.
   *  'DamageOnly' means there are no damagable targets, but still healing to be done -
   *  meaning this will only show as forced downtime for players analyzing a DPS or Tank spec
   *  Ex. Painsmith Intermission
   *  'HealingOnly' means there is no incoming damage, but still targets to be attacked -
   *  meaning this will only show as forced downtime for players analyzing a Healing spec
   *  Ex. no modern examples I could think of...
   */
  applicableRoles?: 'DamageOnly' | 'HealingOnly';
  /**
   * What difficulties this downtime applies to. If omitted, this spec applies to all difficulties.
   * This field may be used for some fights that have differing phase transition behavior on different difficulties,
   * for example there is not between phase downtime in Forgotten Experiments Mythic, but there is on other difficulties.
   */
  applicableDifficulties?: Difficulty[];
  /** Human readable reason for the downtime (modules may display this to the user) */
  reason: string;
  /** Function that generates downtime windows with the given reason based on the event stream */
  generateWindows: (events: AnyEvent[], reason: string) => DowntimeWindow[];
}

/**
 * A downtime window within an encounter
 */
export interface DowntimeWindow {
  /** Timestamp the window starts */
  start: number;
  /** Timestamp the window ends */
  end: number;
  /** Reason for the window, for display to the user */
  reason: string;
}

const DOWNTIME_SPECS: DowntimeSpec[] = [
  ...vault_of_the_incarnates_downtime_specs,
  ...aberrus_downtime_specs,
  ...amidrassil_downtime_specs,
];

/**
 * Events normalizer inserts 'forced downtime' events, marking when the selected player was unable to heal or do damage
 * due to encounter specific events (like phase transitions, boss immunes, etc.)
 *
 * This normalizer merely fabricates the events, it is up to other modules to consume them and change output based on them.
 */
export default class ForcedDowntime extends EventsNormalizer {
  normalize(events: AnyEvent[]): AnyEvent[] {
    // generate all relevant downtime events and sort them in ascending timestamp order
    const sortedDowntimeEvents: AnyEvent[] = DOWNTIME_SPECS.filter(
      (s) => s.encounterId === this.owner.boss?.id,
    )
      // TODO filter on applicableRoles
      // TODO filter on applicableDifficulties
      .flatMap((s) => s.generateWindows(events, s.reason))
      .flatMap((w) => {
        const windowStartEvent = _fabricateForcedDowntimeStartEvent(w.start, w.reason);
        const windowEndEvent = _fabricateForcedDowntimeEndEvent(w.end, windowStartEvent);
        return [windowStartEvent, windowEndEvent];
      })
      .sort((a, b) => a.timestamp - b.timestamp);

    // use O(n) 'zipper merge' to fold sorted downtime events into the event stream
    const updatedEvents: AnyEvent[] = [];
    let downtimeIndex = 0;
    events.forEach((e) => {
      if (
        downtimeIndex < sortedDowntimeEvents.length &&
        sortedDowntimeEvents[downtimeIndex].timestamp < e.timestamp
      ) {
        updatedEvents.push(sortedDowntimeEvents[downtimeIndex]);
        downtimeIndex += 1;
      }
      updatedEvents.push(e);
    });
    while (downtimeIndex < sortedDowntimeEvents.length) {
      updatedEvents.push(sortedDowntimeEvents[downtimeIndex]);
      downtimeIndex += 1;
    }

    return updatedEvents;
  }
}

function _fabricateForcedDowntimeStartEvent(
  timestamp: number,
  reason: string,
): ForcedDowntimeStartEvent {
  return {
    type: EventType.ForcedDowntimeStart,
    timestamp,
    reason,
    __fabricated: true,
  };
}

function _fabricateForcedDowntimeEndEvent(
  timestamp: number,
  start: ForcedDowntimeStartEvent,
): ForcedDowntimeEndEvent {
  return {
    type: EventType.ForcedDowntimeEnd,
    start,
    timestamp,
    __fabricated: true,
  };
}
