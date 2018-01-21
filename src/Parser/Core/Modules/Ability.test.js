import SPELLS from 'common/SPELLS';
import getParserMock from 'tests/getParserMock';

import Ability from './Ability';
import Abilities from './Abilities';

describe('Core/Modules/Ability', () => {
  let parserMock;
  let combatantsMock;
  let hasteMock;
  let abilitiesMock;
  beforeEach(() => {
    // Reset mocks:
    parserMock = getParserMock();
    combatantsMock = {
      selected: {

      },
    };
    hasteMock = {
      current: 0,
    };

    abilitiesMock = new Abilities(parserMock, {
      combatants: combatantsMock,
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
  it('provides the abilities module as this to the method', () => {
    let cooldownThis = null;
    const cooldown = jest.fn(function () {
      cooldownThis = this;
      return 41;
    });
    const instance = new Ability(abilitiesMock, {
      cooldown,
    });

    expect(instance.cooldown).toBe(41);
    expect(cooldownThis).toBe(abilitiesMock);
  });
});
