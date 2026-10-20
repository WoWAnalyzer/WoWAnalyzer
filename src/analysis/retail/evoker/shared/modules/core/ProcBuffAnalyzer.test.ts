import Spell from 'common/SPELLS/Spell';
import { Options } from 'parser/core/Analyzer';
import { AnyEvent, CastEvent, EventType, RemoveBuffEvent } from 'parser/core/Events';
import DebugAnnotations from 'parser/core/modules/DebugAnnotations';
import TestCombatLogParser from 'parser/core/tests/TestCombatLogParser';
import ProcBuffAnalyzer, {
  BuffGainEvent,
  BuffRemoveEvent,
  ProcBuffAnalyzerConfig,
} from './ProcBuffAnalyzer';

const BUFF: Spell = { id: 123456, name: 'Test Buff', icon: '' };

type TestConfig = Omit<ProcBuffAnalyzerConfig, 'buff'>;
/** Remove events carry their consume event directly, instead of relying on a normalizer */
type TestRemoveEvent = BuffRemoveEvent & { consumeEvent?: CastEvent };

class TestProcBuffAnalyzer extends ProcBuffAnalyzer<CastEvent> {
  gainedCalls: [gained: number, overcapped: number][] = [];
  consumedCalls: number[] = [];
  expiredCalls: number[] = [];

  constructor(options: Options) {
    super(options, { buff: BUFF, ...(options.procConfig as TestConfig) });
  }

  protected getConsumeEvent(event: BuffRemoveEvent) {
    return (event as TestRemoveEvent).consumeEvent;
  }

  protected onStacksGained(event: BuffGainEvent, gained: number, overcapped: number) {
    this.gainedCalls.push([gained, overcapped]);
  }
  protected onStacksConsumed(event: BuffRemoveEvent, consumeEvent: CastEvent, stacks: number) {
    this.consumedCalls.push(stacks);
  }
  protected onStacksExpired(event: RemoveBuffEvent, stacks: number) {
    this.expiredCalls.push(stacks);
  }
}

function buffEvent(type: EventType, timestamp: number, extra: object = {}): AnyEvent {
  return {
    type,
    timestamp,
    sourceID: 1,
    sourceIsFriendly: true,
    targetID: 1,
    targetIsFriendly: true,
    ability: { guid: BUFF.id, name: BUFF.name, type: 1, abilityIcon: '' },
    ...extra,
  } as AnyEvent;
}

function cast(timestamp: number): CastEvent {
  return {
    type: EventType.Cast,
    timestamp,
    sourceID: 1,
    sourceIsFriendly: true,
    targetID: 2,
    targetIsFriendly: false,
    ability: { guid: 1, name: 'Spender', type: 1, abilityIcon: '' },
  };
}

const applybuff = (timestamp: number, prepull = false) =>
  buffEvent(EventType.ApplyBuff, timestamp, prepull ? { prepull } : {});
const applybuffstack = (timestamp: number, stack: number) =>
  buffEvent(EventType.ApplyBuffStack, timestamp, { stack });
const refreshbuff = (timestamp: number) => buffEvent(EventType.RefreshBuff, timestamp);
const removebuffstack = (timestamp: number, stack: number, consumed = true) =>
  buffEvent(EventType.RemoveBuffStack, timestamp, {
    stack,
    consumeEvent: consumed ? cast(timestamp) : undefined,
  });
const removebuff = (timestamp: number, consumed = true) =>
  buffEvent(EventType.RemoveBuff, timestamp, {
    consumeEvent: consumed ? cast(timestamp) : undefined,
  });

function setup(config: TestConfig, events: AnyEvent[]) {
  const parser = new TestCombatLogParser();
  const analyzer = parser.loadModule(TestProcBuffAnalyzer, {
    priority: 0,
    procConfig: config,
  }) as TestProcBuffAnalyzer;
  parser.processEvents(events);

  // Only the amount matters, the contents are meant for humans
  const annotationCount = parser
    .getModule(DebugAnnotations)
    .getModuleAnnotations(analyzer)
    .annotations.flatMap(({ annotations }) => annotations).length;

  return { analyzer, annotationCount };
}

describe('ProcBuffAnalyzer', () => {
  describe('gaining stacks', () => {
    it('grants stacksPerProc stacks on applybuff', () => {
      const { analyzer } = setup({ stacksPerProc: 4, maxStacks: 8 }, [applybuff(0)]);

      expect(analyzer.activeStacks).toBe(4);
      expect(analyzer.stacksGenerated).toBe(4);
      expect(analyzer.gainedCalls).toEqual([[4, 0]]);
    });

    it('gains stacks on applybuffstack', () => {
      const { analyzer, annotationCount } = setup({ maxStacks: 2 }, [
        applybuff(0),
        applybuffstack(1000, 2),
      ]);

      expect(analyzer.activeStacks).toBe(2);
      expect(analyzer.stacksGenerated).toBe(2);
      expect(analyzer.stacksOvercapped).toBe(0);
      expect(analyzer.gainedCalls).toEqual([
        [1, 0],
        [1, 0],
      ]);
      expect(annotationCount).toBe(0);
    });

    it('counts overcap when a proc partially exceeds max stacks', () => {
      const { analyzer } = setup({ stacksPerProc: 2, maxStacks: 3 }, [
        applybuff(0),
        applybuffstack(1000, 3),
      ]);

      expect(analyzer.stacksGenerated).toBe(3);
      expect(analyzer.stacksOvercapped).toBe(1);
      expect(analyzer.gainedCalls).toEqual([
        [2, 0],
        [1, 1],
      ]);
    });

    it('counts a refresh at max stacks as overcap', () => {
      const { analyzer } = setup({ maxStacks: 2 }, [
        applybuff(0),
        applybuffstack(1000, 2),
        refreshbuff(2000),
      ]);

      expect(analyzer.activeStacks).toBe(2);
      expect(analyzer.stacksGenerated).toBe(2);
      expect(analyzer.stacksOvercapped).toBe(1);
      expect(analyzer.gainedCalls.at(-1)).toEqual([0, 1]);
    });

    it('ignores and annotates a refresh below max stacks', () => {
      const { analyzer, annotationCount } = setup({ maxStacks: 2 }, [
        applybuff(0),
        applybuffstack(500, 2),
        removebuffstack(1000, 1),
        refreshbuff(1010),
      ]);

      expect(analyzer.activeStacks).toBe(1);
      expect(analyzer.stacksGenerated).toBe(2);
      expect(analyzer.stacksConsumed).toBe(1);
      expect(analyzer.stacksOvercapped).toBe(0);
      expect(annotationCount).toBe(1);
    });

    it('ignores refreshes on the same timestamp as a stack change', () => {
      const { analyzer, annotationCount } = setup({ maxStacks: 2 }, [
        applybuff(0),
        applybuffstack(500, 2),
        refreshbuff(500),
        removebuffstack(1000, 1),
        refreshbuff(1000),
      ]);

      expect(analyzer.activeStacks).toBe(1);
      expect(analyzer.stacksGenerated).toBe(2);
      expect(analyzer.stacksConsumed).toBe(1);
      expect(analyzer.stacksOvercapped).toBe(0);
      expect(analyzer.gainedCalls).toHaveLength(2);
      expect(annotationCount).toBe(0);
    });

    it('annotates an unexpected stack gain instead of counting overcap', () => {
      const { analyzer, annotationCount } = setup({ stacksPerProc: 2, maxStacks: 4 }, [
        applybuff(0),
        applybuffstack(1000, 3),
      ]);

      expect(analyzer.activeStacks).toBe(3);
      expect(analyzer.stacksGenerated).toBe(3);
      expect(analyzer.stacksOvercapped).toBe(0);
      expect(annotationCount).toBe(1);
    });
  });

  describe('removing stacks', () => {
    it('consumes multiple stacks with a single removebuffstack', () => {
      const { analyzer } = setup({ stacksPerProc: 4, maxStacks: 4 }, [
        applybuff(0),
        removebuffstack(1000, 2),
      ]);

      expect(analyzer.activeStacks).toBe(2);
      expect(analyzer.stacksConsumed).toBe(2);
      expect(analyzer.consumedCalls).toEqual([2]);
    });

    it('counts a removebuff with a consume event as consumed', () => {
      const { analyzer } = setup({}, [applybuff(0), removebuff(1000)]);

      expect(analyzer.activeStacks).toBe(0);
      expect(analyzer.stacksConsumed).toBe(1);
      expect(analyzer.stacksExpired).toBe(0);
      expect(analyzer.consumedCalls).toEqual([1]);
    });

    it('counts a removebuff without a consume event as expired', () => {
      const { analyzer } = setup({ stacksPerProc: 2, maxStacks: 2 }, [
        applybuff(0),
        removebuff(1000, false),
      ]);

      expect(analyzer.stacksConsumed).toBe(0);
      expect(analyzer.stacksExpired).toBe(2);
      expect(analyzer.stacksWasted).toBe(2);
      expect(analyzer.expiredCalls).toEqual([2]);
    });

    it('counts a removebuffstack without a consume event as consumed and annotates it', () => {
      const { analyzer, annotationCount } = setup({ maxStacks: 2 }, [
        applybuff(0),
        applybuffstack(500, 2),
        removebuffstack(1000, 1, false),
      ]);

      expect(analyzer.stacksConsumed).toBe(1);
      expect(analyzer.stacksExpired).toBe(0);
      expect(analyzer.consumedCalls).toEqual([]);
      expect(annotationCount).toBe(1);
    });
  });

  describe('recovering from missing events', () => {
    it('does not count overcap right after a prepull applybuff', () => {
      const { analyzer, annotationCount } = setup({ stacksPerProc: 2, maxStacks: 3 }, [
        applybuff(0, true),
        applybuffstack(1000, 3),
      ]);

      expect(analyzer.activeStacks).toBe(3);
      expect(analyzer.stacksGenerated).toBe(3);
      expect(analyzer.stacksOvercapped).toBe(0);
      expect(annotationCount).toBe(0);
    });

    it('does not reduce the generated stacks when tracking more stacks than the buff has', () => {
      // Configured with 2 stacks per proc while the buff only grants 1
      const { analyzer, annotationCount } = setup({ stacksPerProc: 2, maxStacks: 4 }, [
        applybuff(0),
        applybuffstack(1000, 2),
      ]);

      expect(analyzer.activeStacks).toBe(2);
      expect(analyzer.stacksGenerated).toBe(2);
      expect(analyzer.stacksOvercapped).toBe(0);
      // Nothing was actually gained, so the hook isn't called
      expect(analyzer.gainedCalls).toHaveLength(1);
      expect(annotationCount).toBe(1);
    });

    it('recovers from a missing applybuff', () => {
      const { analyzer, annotationCount } = setup({ maxStacks: 3 }, [
        applybuffstack(1000, 2),
        removebuffstack(2000, 1),
      ]);

      expect(analyzer.activeStacks).toBe(1);
      expect(analyzer.stacksGenerated).toBe(2);
      expect(analyzer.stacksConsumed).toBe(1);
      expect(analyzer.stacksOvercapped).toBe(0);
      expect(annotationCount).toBe(0);
    });

    it('recovers stacks proven by a removebuffstack', () => {
      const { analyzer } = setup({ maxStacks: 3 }, [removebuffstack(1000, 1)]);

      expect(analyzer.activeStacks).toBe(1);
      expect(analyzer.stacksGenerated).toBe(2);
      expect(analyzer.stacksConsumed).toBe(1);
    });
  });
});
