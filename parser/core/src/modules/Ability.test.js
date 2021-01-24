import TestCombatLogParser from 'parser/core/tests/TestCombatLogParser';

import Ability from './Ability';
import Abilities from './Abilities';

describe('core/Modules/Ability', () => {
  let parserMock;
  let hasteMock;
  let abilitiesMock;
  beforeEach(() => {
    // Reset mocks:
    parserMock = new TestCombatLogParser();
    hasteMock = {
      current: 0,
    };

    abilitiesMock = parserMock.loadModule(Abilities, {
      haste: hasteMock,
    });
  });

  it('provides the current Haste to the cooldown property of an ability', () => {
    const cooldown = jest.fn(haste => haste);
    const instance = new Ability(abilitiesMock, {
      cooldown,
    });

    hasteMock.current = 0;
    expect(instance.cooldown).toBe(0);
    expect(cooldown.mock.calls[cooldown.mock.calls.length - 1][0]).toBe(0);
    hasteMock.current = 0.12;
    expect(instance.cooldown).toBe(0.12);
    expect(cooldown.mock.calls[cooldown.mock.calls.length - 1][0]).toBe(0.12);
    hasteMock.current = 0.5;
    expect(instance.cooldown).toBe(0.5);
    expect(cooldown.mock.calls[cooldown.mock.calls.length - 1][0]).toBe(0.5);
  });
});
