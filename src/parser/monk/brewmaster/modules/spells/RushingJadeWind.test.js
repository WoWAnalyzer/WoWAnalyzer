import SPELLS from 'common/SPELLS';
import RushingJadeWind from './RushingJadeWind';

const talentless_combatant = {
  hasTalent: () => false,
};

const talented_combatant = {
  hasTalent: id => id === SPELLS.RUSHING_JADE_WIND_TALENT_BREWMASTER.id,
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
        selectedCombatant: talentless_combatant,
      },
    });
    expect(rjw.active).toBe(false);
  });

  it('should be active for a user with the talent', () => {
    const rjw = new RushingJadeWind({
      owner: {
        ...parser,
        selectedCombatant: talented_combatant,
      },
    });
    expect(rjw.active).toBe(true);
  });
});
