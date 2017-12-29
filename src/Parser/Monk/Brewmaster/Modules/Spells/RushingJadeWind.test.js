import SPELLS from 'common/SPELLS';
import RushingJadeWind, { RUSHING_JADE_WIND_BUFF } from './RushingJadeWind';

const talentless_combatant = {
  hasTalent: (id) => false,
};

const talented_combatant = {
  hasTalent: (id) => id === SPELLS.RUSHING_JADE_WIND_TALENT.id,
};

describe("Rushing Jade Wind", () => {
  let rjw;
  beforeEach(() => {
    rjw = new RushingJadeWind({
      byPlayer: () => true,
      toPlayer: () => true,
      byPlayerPet: () => false,
      toPlayerPet: () => false,
    });
    rjw.combatants = {};
  });

  it("should be inactive for a user without the talent", () => {
    rjw.combatants.selected = talentless_combatant;
    rjw.triggerEvent("initialized");
    expect(rjw.active).toBe(false);
  });

  it("should be active for a user with the talent", () => {
    rjw.combatants.selected = talented_combatant;
    rjw.triggerEvent("initialized");
    expect(rjw.active).toBe(true);
  });
});
