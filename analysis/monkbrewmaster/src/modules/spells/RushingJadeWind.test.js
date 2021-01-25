import SPELLS from 'common/SPELLS';

import RushingJadeWind from './RushingJadeWind';

const talentlessCombatant = {
  hasTalent: () => false,
};

const talentedCombatant = {
  hasTalent: id => id === SPELLS.RUSHING_JADE_WIND.id,
};
const parser = {
  byPlayer: () => true,
  toPlayer: () => true,
  byPlayerPet: () => false,
  toPlayerPet: () => false,
};

describe('Rushing Jade Wind', () => {
  it('should be inactive for a user without the talent', () => {
    const rjw = new RushingJadeWind({
      owner: {
        ...parser,
        selectedCombatant: talentlessCombatant,
      },
    });
    expect(rjw.active).toBe(false);
  });

  it('should be active for a user with the talent', () => {
    const rjw = new RushingJadeWind({
      owner: {
        ...parser,
        selectedCombatant: talentedCombatant,
      },
    });
    expect(rjw.active).toBe(true);
  });
});
