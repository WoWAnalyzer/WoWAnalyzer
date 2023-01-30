import talents from 'common/TALENTS/monk';
import Talent from 'common/TALENTS/types';

import RushingJadeWind from './RushingJadeWind';

const talentlessCombatant = {
  hasTalent: () => false,
};

const talentedCombatant = {
  hasTalent: (talent: Talent) =>
    talent.entryIds.filter((entryId) => talents.RUSHING_JADE_WIND_TALENT.entryIds.includes(entryId))
      .length > 0,
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
