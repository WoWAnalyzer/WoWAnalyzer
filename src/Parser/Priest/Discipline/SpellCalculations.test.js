import { OffensivePenanceBoltEstimation } from './SpellCalculations';

const mockStatTracker = (intellect = 100, vers = 0, mastery = 0) => ({
  currentIntellectRating: intellect,
  currentVersatilityPercentage: vers,
  currentMasteryPercentage: mastery,
});

describe('Spell Calculations', () => {
  it('Estimates Offensive Penance Bolts Correctly', () => {
    const boltEstimator = OffensivePenanceBoltEstimation(mockStatTracker());

    expect(boltEstimator()).toEqual({
      damage: 40,
      healing: 16,
    });
  });

  it('Estimates Offensive Penance Bolts Correctly with Versatility', () => {
    const boltEstimator = OffensivePenanceBoltEstimation(mockStatTracker(100, .25));

    expect(boltEstimator()).toEqual({
      damage: 50,
      healing: 20,
    });
  });

  it('Estimates Offensive Penance Bolts Correctly with Mastery', () => {
    const boltEstimator = OffensivePenanceBoltEstimation(mockStatTracker(100, 0, .25));

    expect(boltEstimator()).toEqual({
      damage: 50,
      healing: 20,
    });
  });

  it('Estimates Offensive Penance Bolts Correctly with Versatility and Mastery', () => {
    const boltEstimator = OffensivePenanceBoltEstimation(mockStatTracker(100, .25, .25));

    expect(boltEstimator()).toEqual({
      damage: 63,
      healing: 25,
    });
  });

});
