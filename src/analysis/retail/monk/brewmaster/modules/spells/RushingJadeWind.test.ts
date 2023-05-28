import talents from 'common/TALENTS/monk';
import { Talent } from 'common/TALENTS/types';
import Combatant from 'parser/core/Combatant';
import CombatLogParser from 'parser/core/CombatLogParser';

import RushingJadeWind from './RushingJadeWind';

const talentlessCombatant = {
  hasTalent: () => false,
} as unknown as Combatant;

const talentedCombatant = {
  hasTalent: (talent: Talent) =>
    talent.entryIds.filter((entryId) => talents.RUSHING_JADE_WIND_TALENT.entryIds.includes(entryId))
      .length > 0,
} as unknown as Combatant;
const parser = {
  byPlayer: () => true,
  toPlayer: () => true,
  byPlayerPet: () => false,
  toPlayerPet: () => false,
};

describe('Rushing Jade Wind', () => {
  it('should be inactive for a user without the talent', () => {
    const rjw = new RushingJadeWind({
      priority: 1,
      owner: {
        ...parser,
        selectedCombatant: talentlessCombatant,
      } as unknown as CombatLogParser,
    });
    expect(rjw.active).toBe(false);
  });

  it('should be active for a user with the talent', () => {
    const rjw = new RushingJadeWind({
      priority: 1,
      owner: {
        ...parser,
        selectedCombatant: talentedCombatant,
      } as unknown as CombatLogParser,
    });
    expect(rjw.active).toBe(true);
  });
});
