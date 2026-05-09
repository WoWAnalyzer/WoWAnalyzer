import SPELLS from 'common/SPELLS';
import { FROM_HARDCAST } from 'analysis/retail/druid/balance/normalizers/CastLinkNormalizer';
import {
  ApplyDebuffEvent,
  Buff,
  CastEvent,
  CombatantInfoEvent,
  EventType,
  Item,
  RefreshDebuffEvent,
  RemoveDebuffEvent,
} from 'parser/core/Events';
import {
  DEFAULT_CONFIG,
  DEFAULT_FIGHT,
  DEFAULT_PLAYER_INFO,
  DEFAULT_REPORT,
} from 'parser/core/tests/constants';
import DebuffTracker, {
  CastImpactType,
} from 'analysis/retail/druid/balance/modules/spells/DoTs/DebuffTracker';
import { Options } from 'parser/core/Analyzer';
import TestCombatLogParser from 'parser/core/tests/TestCombatLogParser';

const DEBUFF_DURATION = 18_000; // 18 seconds (Moonfire)
const TEST_SPELL = SPELLS.MOONFIRE_DEBUFF;
const LINKED_EVENT_RELATION = FROM_HARDCAST;

const DEFAULT_COMBATANT_INFO = {
  gear: [] as Item[],
  auras: [] as Buff[],
} as CombatantInfoEvent;

// Custom fight with proper duration for testing
const TEST_FIGHT = {
  ...DEFAULT_FIGHT,
  start_time: 0,
  end_time: 100_000, // 100s
};

// Test wrapper class to expose DebuffTracker for testing
class TestDebuffTracker extends DebuffTracker {
  constructor(options: Options) {
    super(TEST_SPELL, DEBUFF_DURATION, LINKED_EVENT_RELATION, options);
  }
}

describe('DebuffTracker', () => {
  let parser: TestCombatLogParser;
  let debuffTracker: TestDebuffTracker;

  beforeEach(() => {
    parser = new TestCombatLogParser(
      DEFAULT_CONFIG,
      DEFAULT_REPORT,
      DEFAULT_PLAYER_INFO,
      TEST_FIGHT,
      DEFAULT_COMBATANT_INFO,
    );

    // Load the TestDebuffTracker module
    debuffTracker = parser.loadModule(TestDebuffTracker, {
      priority: 0,
    }) as TestDebuffTracker;
  });

  describe('Basic Debuff Lifecycle', () => {
    it('should track a single debuff application and removal', () => {
      // Arrange
      const targetId = 100;
      const events = [applyDebuffEvent(0, targetId), removeDebuffEvent(10_000, targetId)];

      // Act
      parser.processEvents(events);

      // Assert
      const internalTargetId = targetId * 1_000_000; // targetInstance is undefined, so +0
      expect(debuffTracker.debuffHistoryPerTargetId[internalTargetId]).toBeDefined();
      expect(debuffTracker.debuffHistoryPerTargetId[internalTargetId].history).toHaveLength(1);
      expect(debuffTracker.debuffHistoryPerTargetId[internalTargetId].history[0]).toEqual({
        startTimeStamp: 0,
        endTimeStamp: 10_000,
      });
      expect(
        debuffTracker.debuffHistoryPerTargetId[internalTargetId].currentDebuff,
      ).toBeUndefined();

      // Verify uptime calculation
      const uptime = debuffTracker.getUptime();
      expect(uptime).toBe(10_000); // One 10s windows
    });

    it('should track multiple sequential debuffs on the same targert', () => {
      // Arrange
      const targetId = 100;
      const events = [
        applyDebuffEvent(0, targetId),
        removeDebuffEvent(10_000, targetId),
        applyDebuffEvent(20_000, targetId),
        removeDebuffEvent(30_000, targetId),
      ];

      // Act
      parser.processEvents(events);

      // Assert
      const internalTargetId = targetId * 1_000_000;
      expect(debuffTracker.debuffHistoryPerTargetId[internalTargetId]).toBeDefined();
      expect(debuffTracker.debuffHistoryPerTargetId[internalTargetId].history).toHaveLength(2);
      expect(debuffTracker.debuffHistoryPerTargetId[internalTargetId].history[0]).toEqual({
        startTimeStamp: 0,
        endTimeStamp: 10_000,
      });
      expect(debuffTracker.debuffHistoryPerTargetId[internalTargetId].history[1]).toEqual({
        startTimeStamp: 20_000,
        endTimeStamp: 30_000,
      });
      expect(
        debuffTracker.debuffHistoryPerTargetId[internalTargetId].currentDebuff,
      ).toBeUndefined();

      // Verify uptime calculation
      const uptime = debuffTracker.getUptime();
      expect(uptime).toBe(20_000); // Two 10s windows
    });

    it('should handle debuff lasting until end of fight (missing removeDebuffEvent)', () => {
      // Arrange
      const targetId = 100;
      const events = [
        applyDebuffEvent(0, targetId),
        // No remove event
      ];

      // Act
      parser.processEvents(events);

      // Assert
      const internalTargetId = targetId * 1_000_000;
      expect(debuffTracker.debuffHistoryPerTargetId[internalTargetId]).toBeDefined();
      expect(debuffTracker.debuffHistoryPerTargetId[internalTargetId].currentDebuff).toBeDefined();
      expect(debuffTracker.debuffHistoryPerTargetId[internalTargetId].currentDebuff).toEqual({
        startTimeStamp: 0,
        endTimeStamp: DEBUFF_DURATION, // Should expire at 18s
      });
      expect(debuffTracker.debuffHistoryPerTargetId[internalTargetId].history).toHaveLength(0);

      // Verify uptime calculation
      const uptime = debuffTracker.getUptime();
      // Debuff would naturally expire at 18s
      expect(uptime).toBe(DEBUFF_DURATION);
    });
  });

  describe('Multiple Targets Tracking', () => {
    it('should track debuffs on different targets independently', () => {
      // Arrange
      const target1 = 100;
      const target2 = 200;
      const events = [
        applyDebuffEvent(0, target1),
        applyDebuffEvent(5_000, target2),
        removeDebuffEvent(10_000, target1),
      ];

      // Act
      parser.processEvents(events);

      // Assert
      const internalTarget1 = target1 * 1_000_000;
      const internalTarget2 = target2 * 1_000_000;

      // Verify each target has its own debuff history
      expect(Object.keys(debuffTracker.debuffHistoryPerTargetId)).toHaveLength(2);

      // Verify target1's debuff has been removed
      expect(debuffTracker.debuffHistoryPerTargetId[internalTarget1]).toBeDefined();
      expect(debuffTracker.debuffHistoryPerTargetId[internalTarget1].history).toHaveLength(1);
      expect(debuffTracker.debuffHistoryPerTargetId[internalTarget1].history[0]).toEqual({
        startTimeStamp: 0,
        endTimeStamp: 10_000,
      });
      expect(debuffTracker.debuffHistoryPerTargetId[internalTarget1].currentDebuff).toBeUndefined();

      // Verify target2's debuff is present and expired
      expect(debuffTracker.debuffHistoryPerTargetId[internalTarget2]).toBeDefined();
      expect(debuffTracker.debuffHistoryPerTargetId[internalTarget2].currentDebuff).toEqual({
        startTimeStamp: 5_000,
        endTimeStamp: 5_000 + DEBUFF_DURATION,
      });
      expect(debuffTracker.debuffHistoryPerTargetId[internalTarget2].history).toHaveLength(0);
    });

    it('should distinguish between same targetID with different targetInstance', () => {
      // Arrange
      const targetId = 100;
      const events = [
        applyDebuffEvent(0, targetId, undefined), // instance undefined (target1)
        applyDebuffEvent(5_000, targetId, 1), // instance 1 (target2)
        applyDebuffEvent(10_000, targetId, 2), // instance 2 (target3)
        removeDebuffEvent(15_000, targetId, undefined), // target1 dies 15s later
        removeDebuffEvent(5_000 + DEBUFF_DURATION, targetId, 1), // target2's debuff expires after full duration
        removeDebuffEvent(20_000, targetId, 2), // target3 dies 10s later
      ];

      // Act
      parser.processEvents(events);

      // Assert
      const internalTarget1 = targetId * 1_000_000; // undefined becomes 0
      const internalTarget2 = targetId * 1_000_000 + 1;
      const internalTarget3 = targetId * 1_000_000 + 2;

      // Verify three separate debuff trackers exist
      expect(Object.keys(debuffTracker.debuffHistoryPerTargetId)).toHaveLength(3);

      expect(debuffTracker.debuffHistoryPerTargetId[internalTarget1]).toBeDefined();
      expect(debuffTracker.debuffHistoryPerTargetId[internalTarget1].history[0]).toEqual({
        startTimeStamp: 0,
        endTimeStamp: 15_000,
      });
      expect(debuffTracker.debuffHistoryPerTargetId[internalTarget1].currentDebuff).toBeUndefined();

      expect(debuffTracker.debuffHistoryPerTargetId[internalTarget2]).toBeDefined();
      expect(debuffTracker.debuffHistoryPerTargetId[internalTarget2].history[0]).toEqual({
        startTimeStamp: 5_000,
        endTimeStamp: 5_000 + DEBUFF_DURATION,
      });
      expect(debuffTracker.debuffHistoryPerTargetId[internalTarget2].currentDebuff).toBeUndefined();

      expect(debuffTracker.debuffHistoryPerTargetId[internalTarget3]).toBeDefined();
      expect(debuffTracker.debuffHistoryPerTargetId[internalTarget3].history[0]).toEqual({
        startTimeStamp: 10_000,
        endTimeStamp: 20_000,
      });
      expect(debuffTracker.debuffHistoryPerTargetId[internalTarget3].currentDebuff).toBeUndefined();
    });
  });

  describe('Pandemic Window Mechanics', () => {
    it('should classify as NewDebuff when no existing debuff', () => {
      // Arrange
      const targetId = 100;
      const cast = castEvent(0);
      const events = [cast, applyDebuffEvent(cast.timestamp, targetId, undefined, cast)];

      // Act
      parser.processEvents(events);

      // Assert
      const internalTargetId = targetId * 1_000_000;
      expect(debuffTracker.debuffHistoryPerTargetId[internalTargetId]).toBeDefined();

      // Verify cast impact type
      const castImpact = debuffTracker.castImpactsPerEvent[cast.timestamp];
      expect(castImpact).toBeDefined();
      expect(castImpact.castEvent).toEqual(cast);
      expect(castImpact.castImpactPerTargetId[internalTargetId]).toBeDefined();
      expect(castImpact.castImpactPerTargetId[internalTargetId].castImpactType).toBe(
        CastImpactType.NewDebuff,
      );
      expect(castImpact.castImpactPerTargetId[internalTargetId].remainingDurationBeforeCast).toBe(
        0,
      );
    });

    it('should classify as RefreshDuringPandemicWindow when within 30% threshold', () => {
      // Arrange
      const targetId = 100;
      const cast1 = castEvent(0);
      const cast2 = castEvent(14_000);
      const events = [
        cast1,
        // Add 120ms jitter to check that debuffs/casts are linked even with delay
        applyDebuffEvent(cast1.timestamp + 120, targetId, undefined, cast1), // Expires at 18,120
        cast2,
        refreshDebuffEvent(cast2.timestamp + 120, targetId, undefined, cast2), // 4s remaining, within 5.4s pandemic window
      ];

      // Act
      parser.processEvents(events);

      // Assert
      const internalTargetId = targetId * 1_000_000;
      expect(debuffTracker.debuffHistoryPerTargetId[internalTargetId]).toBeDefined();

      // Verify new end time: 14,120 + 18,000 + 4,000 = 36,120
      expect(debuffTracker.debuffHistoryPerTargetId[internalTargetId].currentDebuff).toEqual({
        startTimeStamp: 120,
        endTimeStamp: 36_120,
      });

      // Verify cast impact type
      const castImpact = debuffTracker.castImpactsPerEvent[cast2.timestamp];
      expect(castImpact).toBeDefined();
      expect(castImpact.castEvent).toEqual(cast2);
      expect(castImpact.castImpactPerTargetId[internalTargetId]).toBeDefined();
      expect(castImpact.castImpactPerTargetId[internalTargetId].castImpactType).toBe(
        CastImpactType.RefreshDuringPandemicWindow,
      );
      expect(castImpact.castImpactPerTargetId[internalTargetId].remainingDurationBeforeCast).toBe(
        4_000,
      );
    });

    it('should classify as Overwrite when outside Pandemic Window', () => {
      // Arrange
      const targetId = 100;
      const cast1 = castEvent(0);
      const cast2 = castEvent(8_000);
      const events = [
        cast1,
        // Add 120ms jitter to check that debuffs/casts are linked even with delay
        applyDebuffEvent(cast1.timestamp + 120, targetId, undefined, cast1), // Expires at 18,120
        cast2,
        refreshDebuffEvent(cast2.timestamp + 120, targetId, undefined, cast2), // 10s remaining, outside 5.4s pandemic window
      ];

      // Act
      parser.processEvents(events);

      // Assert
      const internalTargetId = targetId * 1_000_000;
      expect(debuffTracker.debuffHistoryPerTargetId[internalTargetId]).toBeDefined();

      // Verify old debuff moved to history with endTimestamp=8,120
      expect(debuffTracker.debuffHistoryPerTargetId[internalTargetId].history).toHaveLength(1);
      expect(debuffTracker.debuffHistoryPerTargetId[internalTargetId].history[0]).toEqual({
        startTimeStamp: 120,
        endTimeStamp: 8_120,
      });

      // Verify new debuff starts fresh: 8,120 to 26,120
      expect(debuffTracker.debuffHistoryPerTargetId[internalTargetId].currentDebuff).toEqual({
        startTimeStamp: 8_120,
        endTimeStamp: 26_120,
      });

      // Verify cast impact type
      const castImpact = debuffTracker.castImpactsPerEvent[cast2.timestamp];
      expect(castImpact).toBeDefined();
      expect(castImpact.castEvent).toEqual(cast2);
      expect(castImpact.castImpactPerTargetId[internalTargetId]).toBeDefined();
      expect(castImpact.castImpactPerTargetId[internalTargetId].castImpactType).toBe(
        CastImpactType.Overwrite,
      );
      expect(castImpact.castImpactPerTargetId[internalTargetId].remainingDurationBeforeCast).toBe(
        10_000,
      );
    });

    it('should handle expired debuff being reapplied', () => {
      // Arrange
      const targetId = 100;
      const cast1 = castEvent(0);
      const cast2 = castEvent(20_000);
      const events = [
        cast1,
        // Add 120ms jitter to check that debuffs/casts are linked even with delay
        applyDebuffEvent(cast1.timestamp + 120, targetId, undefined, cast1), // Expires at 18,120
        cast2,
        refreshDebuffEvent(cast2.timestamp + 120, targetId, undefined, cast2), // 2s after expiration
      ];

      // Act
      parser.processEvents(events);

      // Assert
      const internalTargetId = targetId * 1_000_000;
      expect(debuffTracker.debuffHistoryPerTargetId[internalTargetId]).toBeDefined();

      // Old debuff should be in history with its natural expiration time
      expect(debuffTracker.debuffHistoryPerTargetId[internalTargetId].history).toHaveLength(1);
      expect(debuffTracker.debuffHistoryPerTargetId[internalTargetId].history[0]).toEqual({
        startTimeStamp: 120,
        endTimeStamp: 18_120, // Natural expiration, not 20,120
      });

      // New debuff should start fresh
      expect(debuffTracker.debuffHistoryPerTargetId[internalTargetId].currentDebuff).toEqual({
        startTimeStamp: 20_120,
        endTimeStamp: 38_120,
      });

      // Verify cast impact type
      const castImpact = debuffTracker.castImpactsPerEvent[cast2.timestamp];
      expect(castImpact).toBeDefined();
      expect(castImpact.castEvent).toEqual(cast2);
      expect(castImpact.castImpactPerTargetId[internalTargetId]).toBeDefined();
      expect(castImpact.castImpactPerTargetId[internalTargetId].castImpactType).toBe(
        CastImpactType.NewDebuff,
      );
      expect(castImpact.castImpactPerTargetId[internalTargetId].remainingDurationBeforeCast).toBe(
        -2_000,
      );
    });
  });

  describe('Uptime Calculation', () => {
    it('should return 0 uptime when no debuffs applied', () => {
      // Arrange
      const events: never[] = [];

      // Act
      parser.processEvents(events);

      // Assert
      expect(debuffTracker.getUptime()).toBe(0);
      expect(debuffTracker.getUptimePercent()).toBe(0);
    });

    it('should caclulate uptime for single target, single application', () => {
      // Arrange
      const targetId = 100;
      const events = [
        applyDebuffEvent(10_000, targetId),
        removeDebuffEvent(10_000 + DEBUFF_DURATION, targetId),
      ];

      // Act
      parser.processEvents(events);

      // Assert
      const uptime = debuffTracker.getUptime();
      expect(uptime).toBe(DEBUFF_DURATION);
      const uptimePercent = debuffTracker.getUptimePercent();
      const fightDuration = TEST_FIGHT.end_time - TEST_FIGHT.start_time;
      expect(uptimePercent).toBe(DEBUFF_DURATION / fightDuration);
    });

    it('should merge overlapping debuffs on different targets', () => {
      // Arrange
      const target1 = 100;
      const target2 = 200;
      const events = [
        applyDebuffEvent(0, target1),
        applyDebuffEvent(10_000, target2),
        removeDebuffEvent(15_000, target1),
        removeDebuffEvent(25_000, target2),
      ];

      // Act
      parser.processEvents(events);

      // Assert
      // Target 1: 0 to 15,000
      // Target 2: 10,000 to 25,000
      // Merged: 0 to 25,000 (not 30,000 if we simply summed up all durations)
      const uptime = debuffTracker.getUptime();
      expect(uptime).toBe(25_000);
      const uptimePercent = debuffTracker.getUptimePercent();
      const fightDuration = TEST_FIGHT.end_time - TEST_FIGHT.start_time;
      expect(uptimePercent).toBe(25_000 / fightDuration);
    });

    it('should handle non-overlapping debuffs on multiple targets', () => {
      // Arrange
      const target1 = 100;
      const target2 = 200;
      const events = [
        applyDebuffEvent(0, target1),
        removeDebuffEvent(10_000, target1),
        applyDebuffEvent(20_000, target2),
        removeDebuffEvent(30_000, target2),
      ];

      // Act
      parser.processEvents(events);

      // Assert
      // Target 1: 0 to 10,000
      // Target 2: 20,000 to 30,000
      // Total uptime: 10,000 + 10,000 = 20,000
      const uptime = debuffTracker.getUptime();
      expect(uptime).toBe(20_000);
      const uptimePercent = debuffTracker.getUptimePercent();
      const fightDuration = TEST_FIGHT.end_time - TEST_FIGHT.start_time;
      expect(uptimePercent).toBe(20_000 / fightDuration);
    });

    it('should handle complex overlapping scenario', () => {
      // Arrange
      const target1 = 100;
      const target2 = 200;
      const target3 = 300;
      const target4 = 400;
      const events = [
        applyDebuffEvent(0, target1),
        applyDebuffEvent(5_000, target2),
        removeDebuffEvent(10_000, target1),
        applyDebuffEvent(12_000, target3),
        removeDebuffEvent(15_000, target2),
        removeDebuffEvent(20_000, target3),
        applyDebuffEvent(25_000, target4),
        removeDebuffEvent(30_000, target4),
      ];

      // Act
      parser.processEvents(events);

      // Assert
      // Target 1: 0 to 10,000
      // Target 2: 5,000 to 15,000
      // Target 3: 12,000 to 20,000
      // Target 4: 25,000 to 30,000
      // Merged: 0-20,000 (continuous overlapping) + 25,000-30,000(gap in-between) = 25,000
      const uptime = debuffTracker.getUptime();
      expect(uptime).toBe(25_000);
      const uptimePercent = debuffTracker.getUptimePercent();
      const fightDuration = TEST_FIGHT.end_time - TEST_FIGHT.start_time;
      expect(uptimePercent).toBe(25_000 / fightDuration);
    });

    it('should cap current debuffs at fight end time', () => {
      // Arrange
      const targetId = 100;
      const events = [
        applyDebuffEvent(90_000, targetId),
        // No remove event - debuff would naturally expire at 108,000 (90,000 + 18,000)
      ];

      // Act
      parser.processEvents(events);

      // Assert
      // Fight ends at 100,000, debuff would expire at 108,000
      // Uptime should only count to fight end: 100,000 - 90,000 = 10,000
      const uptime = debuffTracker.getUptime();
      expect(uptime).toBe(10_000);
      const uptimePercent = debuffTracker.getUptimePercent();
      const fightDuration = TEST_FIGHT.end_time - TEST_FIGHT.start_time;
      expect(uptimePercent).toBe(10_000 / fightDuration);
    });
  });

  describe('Cast Impact Tracking', () => {
    it('should link debuff application to corresponding cast event', () => {
      // Arrange
      const targetId = 100;
      const cast = castEvent(0);
      const events = [cast, applyDebuffEvent(cast.timestamp, targetId, undefined, cast)];

      // Act
      parser.processEvents(events);

      // Assert
      const internalTargetId = targetId * 1_000_000;

      // Verify the cast impact is defined and linked to the cast
      const castImpact = debuffTracker.castImpactsPerEvent[cast.timestamp];
      expect(castImpact).toBeDefined();
      expect(castImpact.castEvent).toEqual(cast);
      expect(castImpact.castImpactPerTargetId[internalTargetId]).toBeDefined();
      expect(castImpact.castImpactPerTargetId[internalTargetId].castImpactType).toBe(
        CastImpactType.NewDebuff,
      );
      expect(castImpact.castImpactPerTargetId[internalTargetId].remainingDurationBeforeCast).toBe(
        0,
      );
    });

    it('should track cast impacts for multi-target abilities', () => {
      // Arrange
      const target1 = 100;
      const target2 = 200;
      const target3 = 300;
      const cast = castEvent(1_000);
      const events = [
        cast,
        applyDebuffEvent(cast.timestamp, target1, undefined, cast),
        applyDebuffEvent(cast.timestamp, target2, undefined, cast),
        applyDebuffEvent(cast.timestamp, target3, undefined, cast),
      ];

      // Act
      parser.processEvents(events);

      // Assert
      const internalTarget1 = target1 * 1_000_000;
      const internalTarget2 = target2 * 1_000_000;
      const internalTarget3 = target3 * 1_000_000;

      // Verify single cast impact with 3 targets
      const castImpact = debuffTracker.castImpactsPerEvent[cast.timestamp];
      expect(castImpact).toBeDefined();
      expect(castImpact.castEvent).toEqual(cast);
      expect(Object.keys(castImpact.castImpactPerTargetId)).toHaveLength(3);

      // Verify each target has correct impact type
      expect(castImpact.castImpactPerTargetId[internalTarget1].castImpactType).toBe(
        CastImpactType.NewDebuff,
      );
      expect(castImpact.castImpactPerTargetId[internalTarget2].castImpactType).toBe(
        CastImpactType.NewDebuff,
      );
      expect(castImpact.castImpactPerTargetId[internalTarget3].castImpactType).toBe(
        CastImpactType.NewDebuff,
      );
    });

    it('should handle missing corresponding cast gracefully', () => {
      // Arrange
      const targetId = 100;
      const eventTimestamp = 1_000;
      const events = [
        applyDebuffEvent(eventTimestamp, targetId, undefined, undefined), // No linked cast
      ];

      // Act
      parser.processEvents(events);

      // Assert
      const internalTargetId = targetId * 1_000_000;

      // Should still track debuff history correctly
      expect(debuffTracker.debuffHistoryPerTargetId[internalTargetId]).toBeDefined();
      expect(debuffTracker.debuffHistoryPerTargetId[internalTargetId].currentDebuff).toBeDefined();

      // Should not have a cast impact (as there is no cast)
      expect(debuffTracker.castImpactsPerEvent[eventTimestamp]).toBeUndefined();
    });

    it('should store correct remaining duration for each target', () => {
      // Arrange
      const target1 = 100;
      const target2And3Id = 200;
      const target2Instance = 1;
      const target3Instance = 2;

      // Set up existing debuffs on target2 and target3
      const cast1 = castEvent(0);
      const cast2 = castEvent(2_000);
      const cast3 = castEvent(10_000);
      const events = [
        cast1,
        applyDebuffEvent(cast1.timestamp + 120, target2And3Id, target2Instance, cast1), // Expires at 18,120
        cast2,
        applyDebuffEvent(cast2.timestamp + 120, target2And3Id, target3Instance, cast2), // Expires at 20,120
        // At t=10,120
        // - Target 1: no existing debuff -> remaining=0
        // - Target 2: existing debuff expires at 18,120 -> remaining=8,000
        // - Target 3: existing debuff expires at 20,120 -> remaining=10,000
        cast3,
        refreshDebuffEvent(cast3.timestamp + 120, target1, undefined, cast3),
        refreshDebuffEvent(cast3.timestamp + 120, target2And3Id, target2Instance, cast3),
        refreshDebuffEvent(cast3.timestamp + 120, target2And3Id, target3Instance, cast3),
      ];

      // Act
      parser.processEvents(events);

      // Assert
      const internalTarget1 = target1 * 1_000_000;
      const internalTarget2 = target2And3Id * 1_000_000 + target2Instance;
      const internalTarget3 = target2And3Id * 1_000_000 + target3Instance;

      const castImpact = debuffTracker.castImpactsPerEvent[cast3.timestamp];
      expect(castImpact).toBeDefined();

      // Verify each target's impact has correct remaining duration
      expect(castImpact.castImpactPerTargetId[internalTarget1].remainingDurationBeforeCast).toBe(0);
      expect(castImpact.castImpactPerTargetId[internalTarget2].remainingDurationBeforeCast).toBe(
        8_000,
      );
      expect(castImpact.castImpactPerTargetId[internalTarget3].remainingDurationBeforeCast).toBe(
        10_000,
      );

      // Verify target 1 is a NewDebuff, others are Overwrite (outside Pandemic Window)
      expect(castImpact.castImpactPerTargetId[internalTarget1].castImpactType).toBe(
        CastImpactType.NewDebuff,
      );
      expect(castImpact.castImpactPerTargetId[internalTarget2].castImpactType).toBe(
        CastImpactType.Overwrite,
      );
      expect(castImpact.castImpactPerTargetId[internalTarget3].castImpactType).toBe(
        CastImpactType.Overwrite,
      );
    });
  });

  // Event Factory functions
  function applyDebuffEvent(
    timestamp: number,
    targetID: number,
    targetInstance?: number,
    linkedCast?: CastEvent,
  ): ApplyDebuffEvent {
    const event: ApplyDebuffEvent = {
      type: EventType.ApplyDebuff,
      ability: {
        guid: TEST_SPELL.id,
        name: TEST_SPELL.name,
        type: 1,
        abilityIcon: TEST_SPELL.icon,
      },
      sourceID: 1,
      sourceIsFriendly: true,
      targetID,
      targetInstance,
      targetIsFriendly: false,
      timestamp,
    } as ApplyDebuffEvent;

    if (linkedCast) {
      event._linkedEvents = [
        {
          relation: LINKED_EVENT_RELATION,
          event: linkedCast,
        },
      ];
    }

    return event;
  }

  function refreshDebuffEvent(
    timestamp: number,
    targetID: number,
    targetInstance?: number,
    linkedCast?: CastEvent,
  ): RefreshDebuffEvent {
    const event: RefreshDebuffEvent = {
      type: EventType.RefreshDebuff,
      ability: {
        guid: TEST_SPELL.id,
        name: TEST_SPELL.name,
        type: 1,
        abilityIcon: TEST_SPELL.icon,
      },
      sourceID: 1,
      sourceIsFriendly: true,
      targetID,
      targetInstance,
      targetIsFriendly: false,
      timestamp,
    } as RefreshDebuffEvent;

    if (linkedCast) {
      event._linkedEvents = [
        {
          relation: LINKED_EVENT_RELATION,
          event: linkedCast,
        },
      ];
    }

    return event;
  }

  function removeDebuffEvent(
    timestamp: number,
    targetID: number,
    targetInstance?: number,
  ): RemoveDebuffEvent {
    return {
      type: EventType.RemoveDebuff,
      ability: {
        guid: TEST_SPELL.id,
        name: TEST_SPELL.name,
        type: 1,
        abilityIcon: TEST_SPELL.icon,
      },
      sourceID: 1,
      sourceIsFriendly: true,
      targetID,
      targetInstance,
      targetIsFriendly: false,
      timestamp,
    } as RemoveDebuffEvent;
  }

  function castEvent(timestamp: number, sourceId = 1): CastEvent {
    return {
      type: EventType.Cast,
      ability: {
        guid: TEST_SPELL.id,
        name: TEST_SPELL.name,
        type: 1,
        abilityIcon: TEST_SPELL.icon,
      },
      sourceID: sourceId,
      sourceIsFriendly: true,
      targetID: 2,
      targetIsFriendly: false,
      timestamp,
    } as CastEvent;
  }
});
