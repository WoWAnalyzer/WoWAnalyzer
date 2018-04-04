import Tier21_2set from 'Parser/Priest/Discipline/Modules/Items/Tier21_2set';

import processEvents from '../../Fixtures/processEvents';
import { RadianceCast1, RadianceCast2 } from '../../Fixtures/TestingEvents';

describe('DisciplinePriest.Reordering', () => {
  let tier21_2set;

  beforeEach(() => {
    tier21_2set = new Tier21_2set({
      reorder: () => true,
      toPlayer: () => true,
      byPlayer: () => true,
      toPlayerPet: () => false,
      byPlayerPet: () => false,
      fight: { end_time: 0 },
    });
  });

  it('If 1 radiance is cast at t=0 and fight ends at t=15, gross time saved should be 3', () => {
    RadianceCast1.timestamp = 0;
    tier21_2set.owner.fight = { end_time: 15000 };

    const events = [
      RadianceCast1,
    ];

    processEvents(events, tier21_2set);
    expect(tier21_2set.grossTimeSaved).toBe(3000);
  });

  it('If 1 radiance is cast at t=0 and fight ends at t=14, gross time saved should be 0', () => {
    RadianceCast1.timestamp = 0;
    tier21_2set.owner.fight = { end_time: 14000 };

    const events = [
      RadianceCast1,
    ];

    processEvents(events, tier21_2set);
    expect(tier21_2set.grossTimeSaved).toBe(0);
  });

  it('If 1 radiance cast at t=0, 1 radiance cast a t=2 and fight ends at t=17, gross time saved should be 6', () => {
    RadianceCast1.timestamp = 0;
    RadianceCast2.timestamp = 2000;
    tier21_2set.owner.fight = { end_time: 17000 };

    const events = [
      RadianceCast1,
      RadianceCast2,
    ];

    processEvents(events, tier21_2set);
    expect(tier21_2set.grossTimeSaved).toBe(6000);
  });
});
