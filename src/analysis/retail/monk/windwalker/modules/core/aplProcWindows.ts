import { maybeGetSpell } from 'common/SPELLS';
import type { CastInSequence } from 'interface/guide/components/CastSequence';
import {
  type ApplyBuffStackEvent,
  type CastEvent,
  EventType,
  type RemoveBuffEvent,
  type RemoveBuffStackEvent,
} from 'parser/core/Events';
import { AplChecker, type InternalRule } from 'parser/shared/metrics/apl';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';

// Shared helper for Windwalker proc timing sections that compare proc spends against the live APL.
// It tracks one window per active buff stack, records the reported casts that happened inside each
// window, and snapshots the APL both before and after every event so the UI can show when the
// spender first became top priority. The current implementation is intentionally generic for
// stack-based proc windows, but it still assumes a single spender/buff pair per invocation.
export interface AplExpectedSpell {
  id: number;
  name: string;
  icon: string;
}

export interface AplProcSequenceCast extends CastInSequence {
  // Expected APL state immediately before and after this cast was processed.
  aplExpectedBefore: AplExpectedSpell[];
  aplExpectedAfter: AplExpectedSpell[];
}

export interface AplProcWindow {
  start: number;
  end: number;
  readyAt?: number;
  resolvedAt: number;
  performance: QualitativePerformance;
  outcome: string;
  blockers: string[];
  higherPriorityAtSpend: AplExpectedSpell[];
  higherPriorityRule?: InternalRule;
  sequence: AplProcSequenceCast[];
  resolution: 'consumed' | 'expired' | 'overcapped';
  spentAt?: number;
  spentCastAt?: number;
  spentWhenReady?: boolean;
  resolveExpected: AplExpectedSpell[];
}

interface ActiveAplProcWindow {
  start: number;
  // Timestamp where the spender first reached the top APL slot within this window.
  readyAt?: number;
  // Repeated recommended casts we made before the spender became top priority.
  blockers: string[];
  // Reportable casts captured for the detail sequence UI.
  sequence: AplProcSequenceCast[];
}

interface PendingConsumeCast {
  timestamp: number;
  // Whether the spender was already top priority at the cast that consumed the buff.
  expected: boolean;
  // APL spells that still ranked above the spender at the actual spend.
  higherPriorityAtSpend: AplExpectedSpell[];
  higherPriorityRule?: InternalRule;
  // Full expected list captured at the spend so the resolved window can explain the grade.
  spendExpected: AplExpectedSpell[];
}

interface BuildAplProcWindowsOptions {
  apl: ConstructorParameters<typeof AplChecker>[0];
  info: ConstructorParameters<typeof AplChecker>[1];
  events: NonNullable<ConstructorParameters<typeof AplChecker>[2]>;
  selectedCombatantId: number;
  // Buff that opens the proc window.
  buffSpellId: number;
  // Spender that marks the window as ready once it reaches the top of the APL.
  readySpellId: number;
  maxStacks: number;
  shouldReportCast: (event: CastEvent) => boolean;
  isConsumeCast: (event: CastEvent) => boolean;
  isConsumedByEvent: (event: RemoveBuffEvent | RemoveBuffStackEvent) => boolean;
}

const toExpectedSpellsWithIcons = (expected: { id: number; name: string }[] | undefined) =>
  (expected ?? []).map((spell) => ({
    id: spell.id,
    name: spell.name,
    icon: maybeGetSpell(spell.id)?.icon ?? 'inv_misc_questionmark',
  }));

// Keep only the spells that outranked the spender at the moment it was pressed.
const toHigherPrioritySpells = (
  expected: { id: number; name: string }[] | undefined,
  readySpellId: number,
) =>
  (expected ?? [])
    .slice(
      0,
      (() => {
        const readySpellIndex = (expected ?? []).findIndex((spell) => spell.id === readySpellId);
        return readySpellIndex === -1 ? (expected ?? []).length : readySpellIndex;
      })(),
    )
    .map((spell) => ({
      id: spell.id,
      name: spell.name,
      icon: maybeGetSpell(spell.id)?.icon ?? 'inv_misc_questionmark',
    }));

const recordBlocker = (
  blockers: string[],
  expected: { id: number; name: string }[] | undefined,
  cast: CastEvent,
) => {
  // Only record casts that the APL itself wanted; this highlights "the right idea, too early"
  // without cluttering the window with every irrelevant filler cast.
  if (!expected?.some((spell) => spell.id === cast.ability.guid)) {
    return;
  }

  if (blockers[blockers.length - 1] !== cast.ability.name) {
    blockers.push(cast.ability.name);
  }
};

export function buildAplProcWindows({
  apl,
  info,
  events,
  selectedCombatantId,
  buffSpellId,
  readySpellId,
  maxStacks,
  shouldReportCast,
  isConsumeCast,
  isConsumedByEvent,
}: BuildAplProcWindowsOptions): AplProcWindow[] {
  const checker = new AplChecker(apl, info, events);
  const activeWindows: ActiveAplProcWindow[] = [];
  const windows: AplProcWindow[] = [];
  let currentExpected = checker.expectedCast();
  let pendingConsumeCast: PendingConsumeCast | null = null;

  const isReady = (expected: { id: number; name: string }[] | undefined) =>
    expected?.[0]?.id === readySpellId;

  const generateProcs = (count: number, timestamp: number) => {
    // Open one active window per gained stack and emit synthetic failed windows for overflow.
    const gained = Math.min(count, maxStacks - activeWindows.length);
    const wasted = count - gained;

    for (let i = 0; i < gained; i += 1) {
      activeWindows.push({
        start: timestamp,
        blockers: [],
        sequence: [],
      });
    }

    for (let i = 0; i < wasted; i += 1) {
      const wastedWindow: AplProcWindow = {
        start: timestamp,
        end: timestamp,
        resolvedAt: timestamp,
        performance: QualitativePerformance.Fail,
        outcome: 'Overcapped before use',
        blockers: [],
        higherPriorityAtSpend: [],
        sequence: [],
        resolution: 'overcapped',
        resolveExpected: [],
      };
      windows.push(wastedWindow);
    }
  };

  const closeWindows = (
    count: number,
    resolution: 'consumed' | 'expired',
    timestamp: number,
    spentWhenReady?: boolean,
    higherPriorityAtSpend: AplExpectedSpell[] = [],
    higherPriorityRule?: InternalRule,
    spendExpected: AplExpectedSpell[] = [],
    spentCastAt?: number,
  ) => {
    // Buff removals resolve the oldest active windows first, matching how we queue gained stacks.
    for (let i = 0; i < count; i += 1) {
      const window = activeWindows.shift();
      if (!window) {
        return;
      }

      let performance: QualitativePerformance;
      let outcome: string;

      if (resolution === 'expired') {
        if (window.readyAt !== undefined) {
          performance = QualitativePerformance.Fail;
          outcome = 'Expired after becoming ready';
        } else {
          performance = QualitativePerformance.Ok;
          outcome = 'Expired before it became ready';
        }
      } else if (!spentWhenReady || window.readyAt === undefined) {
        performance = QualitativePerformance.Fail;
        outcome = 'Spent before it became ready';
      } else {
        performance = QualitativePerformance.Good;
        outcome = 'Spent when it became ready';
      }

      const resolvedWindow: AplProcWindow = {
        start: window.start,
        end: timestamp,
        readyAt: window.readyAt,
        resolvedAt: timestamp,
        performance,
        outcome,
        blockers: window.blockers,
        higherPriorityAtSpend,
        higherPriorityRule,
        sequence: window.sequence,
        resolution,
        spentAt: resolution === 'consumed' ? timestamp : undefined,
        spentCastAt: resolution === 'consumed' ? spentCastAt : undefined,
        spentWhenReady: resolution === 'consumed' ? spentWhenReady : undefined,
        resolveExpected: [...spendExpected],
      };
      windows.push(resolvedWindow);
    }
  };

  events.forEach((event, eventIndex) => {
    // Capture the APL state before this event mutates it. The detail view needs both sides of the
    // event boundary so it can show what the APL expected before a cast and what changed after.
    const expectedBefore = currentExpected;

    if (
      event.type === EventType.Cast &&
      event.sourceID === selectedCombatantId &&
      isConsumeCast(event) &&
      activeWindows.length > 0
    ) {
      // The buff removal event can land shortly after the consuming cast, so stash the spend
      // context here and attach it when the remove event closes the window.
      pendingConsumeCast = {
        timestamp: event.timestamp,
        expected: isReady(expectedBefore),
        higherPriorityAtSpend: toHigherPrioritySpells(expectedBefore, readySpellId),
        higherPriorityRule: undefined,
        spendExpected: toExpectedSpellsWithIcons(expectedBefore),
      };
    }

    const reportableCast =
      event.type === EventType.Cast &&
      event.sourceID === selectedCombatantId &&
      shouldReportCast(event)
        ? event
        : null;

    if (reportableCast) {
      activeWindows.forEach((window) => {
        if (window.readyAt === undefined) {
          recordBlocker(window.blockers, expectedBefore, reportableCast);
        }
      });
    }

    checker.processEvent(event, eventIndex);
    currentExpected = checker.expectedCast();
    const expectedAfter = currentExpected;

    if (reportableCast) {
      const icon = reportableCast.ability.abilityIcon.replace('.jpg', '');
      const aplExpectedBefore = toExpectedSpellsWithIcons(expectedBefore);
      const aplExpectedAfter = toExpectedSpellsWithIcons(expectedAfter);
      activeWindows.forEach((window) =>
        window.sequence.push({
          timestamp: reportableCast.timestamp,
          spellId: reportableCast.ability.guid,
          spellName: reportableCast.ability.name,
          icon,
          aplExpectedBefore,
          aplExpectedAfter,
        }),
      );
    }

    if (
      'sourceID' in event &&
      'ability' in event &&
      event.sourceID === selectedCombatantId &&
      event.ability.guid === buffSpellId
    ) {
      // Resolve proc windows from buff-state transitions instead of guessing from casts alone.
      switch (event.type) {
        case EventType.ApplyBuff:
        case EventType.RefreshBuff:
          generateProcs(1, event.timestamp);
          break;
        case EventType.ApplyBuffStack:
          generateProcs(
            Math.max(0, (event as ApplyBuffStackEvent).stack - activeWindows.length),
            event.timestamp,
          );
          break;
        case EventType.RemoveBuffStack: {
          const removeEvent = event as RemoveBuffStackEvent;
          closeWindows(
            Math.max(0, activeWindows.length - removeEvent.stack),
            isConsumedByEvent(removeEvent) ? 'consumed' : 'expired',
            removeEvent.timestamp,
            pendingConsumeCast?.expected,
            pendingConsumeCast?.higherPriorityAtSpend,
            pendingConsumeCast?.higherPriorityRule,
            pendingConsumeCast?.spendExpected,
            pendingConsumeCast?.timestamp,
          );
          break;
        }
        case EventType.RemoveBuff: {
          const removeEvent = event as RemoveBuffEvent;
          closeWindows(
            activeWindows.length,
            isConsumedByEvent(removeEvent) ? 'consumed' : 'expired',
            removeEvent.timestamp,
            pendingConsumeCast?.expected,
            pendingConsumeCast?.higherPriorityAtSpend,
            pendingConsumeCast?.higherPriorityRule,
            pendingConsumeCast?.spendExpected,
            pendingConsumeCast?.timestamp,
          );
          break;
        }
      }
    }

    activeWindows.forEach((window) => {
      if (window.readyAt !== undefined) {
        return;
      }
      // Mark the first event boundary where the spender became the top recommendation.
      if (isReady(expectedAfter)) {
        window.readyAt = event.timestamp;
      }
    });

    if (
      pendingConsumeCast &&
      event.timestamp > pendingConsumeCast.timestamp &&
      event.timestamp - pendingConsumeCast.timestamp > 100
    ) {
      // If no matching buff removal showed up right after the cast, drop the cached spend context.
      pendingConsumeCast = null;
    }
  });

  return windows.sort((a, b) => a.start - b.start);
}
