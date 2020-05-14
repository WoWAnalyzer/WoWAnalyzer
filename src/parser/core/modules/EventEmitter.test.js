import { EventType } from 'parser/core/Events';
import TestCombatLogParser from 'parser/core/tests/TestCombatLogParser';

import EventEmitter from './EventEmitter';

describe('Core/EventEmitter', () => {
  let parser;
  let eventEmitter;
  beforeEach(() => {
    parser = new TestCombatLogParser();
    eventEmitter = parser.getModule(EventEmitter);
  });
  describe('fabricateEvent', () => {
    it('includes the current timestamp', () => {
      const timestamp = 421098;
      parser.currentTimestamp = timestamp;

      const fabricatedEvent = eventEmitter.fabricateEvent({
        type: EventType.Test,
      });
      expect(fabricatedEvent.timestamp).toBe(timestamp);
    });
  });
});
