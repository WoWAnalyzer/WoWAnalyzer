import SPELLS from 'common/SPELLS';
import CombatLogParser from './CombatLogParser';

describe('Warrior/Arms/CombatLogParser', () => {
  const reorderScenarios = [
    
  ];

  reorderScenarios.forEach((scenario) => {
    it(scenario.test, () => {
      const player = {
        id: 1,
      };
      const parser = new CombatLogParser({
        friendlies: [player],
      }, player);
      expect(parser.reorderEvents(scenario.events).map(event => event.testid)).toEqual(scenario.result);
    });
  });
});
