import SPELLS from 'common/SPELLS';
import FlametongueRefresh from './FlametongueRefresh';

describe('Flametongue Refresh module', () => {
  it('should be disabled when Searing assault is taken', () => {
    const ownerWithSearingAssault = {
      selectedCombatant: {
        hasTalent: jest.fn(() => true),
      },
      addEventListener: jest.fn(),
    };

    const module = new FlametongueRefresh({ owner: ownerWithSearingAssault });
    expect(module.active).toBe(false);
    expect(ownerWithSearingAssault.selectedCombatant.hasTalent).toHaveBeenCalledWith(SPELLS.SEARING_ASSAULT_TALENT.id);
  });

  it('should be enabled when Searing assault is not taken', () => {
    const ownerWithSearingAssault = {
      selectedCombatant: {
        hasTalent: jest.fn(() => false),
      },
      addEventListener: jest.fn(),
    };

    const module = new FlametongueRefresh({ owner: ownerWithSearingAssault });
    expect(module.active).toBe(true);
    expect(ownerWithSearingAssault.selectedCombatant.hasTalent).toHaveBeenCalledWith(SPELLS.SEARING_ASSAULT_TALENT.id);
  });
});
