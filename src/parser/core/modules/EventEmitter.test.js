import TestCombatLogParser from 'parser/core/tests/TestCombatLogParser';

import EventEmitter from './EventEmitter';

describe('Core/EventEmitter', () => {
  const ACTIVE_MODULE = { active: true };
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

      expect.assertions(1);
      return new Promise((resolve, reject) => {
        eventEmitter.addEventListener(EventEmitter.catchAll, event => {
          expect(event.timestamp).toBe(timestamp);
          resolve();
        }, ACTIVE_MODULE);
        eventEmitter.fabricateEvent({
          type: 'test',
        });
      });
    });
  });
});
