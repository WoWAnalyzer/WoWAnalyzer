import { calculateOverhealing, OffensivePenanceBoltEstimation, SmiteEstimation } from './SpellCalculations';

const mockStatTracker = (intellect = 100, vers = 0, mastery = 0) => ({
  currentIntellectRating: intellect,
  currentVersatilityPercentage: vers,
  currentMasteryPercentage: mastery,
});

describe('Overhealing Calculations', () => {
  it('Calculates overhealing when the estimated amount is greater', () => {
    const overheal = calculateOverhealing(150, 50, 50);

    expect(overheal).toBe(100);
  });

  it('Calculates overhealing when the estimated amount is less than the effective healing', () => {
    const overheal = calculateOverhealing(20, 50, 50);

    expect(overheal).toBe(0);
  });

  it('Calculates overhealing when the estimated amount is the same as the original', () => {
    const overheal = calculateOverhealing(100, 50, 50);

    expect(overheal).toBe(50);
  });
});

describe('[PENANCE] Spell Calculations', () => {
  it('Estimates Offensive Penance Bolts Correctly', () => {
    const boltEstimator = OffensivePenanceBoltEstimation(mockStatTracker());

    expect(boltEstimator()).toEqual({
      boltDamage: 40,
      boltHealing: 16,
    });
  });

  it('Estimates Offensive Penance Bolts Correctly with Versatility', () => {
    const boltEstimator = OffensivePenanceBoltEstimation(mockStatTracker(100, .25));

    expect(boltEstimator()).toEqual({
      boltDamage: 50,
      boltHealing: 20,
    });
  });
});

describe('[SMITE] Spell Calculations', () => {
  it('Estimates Smites Correctly', () => {
    const smiteEstimator = SmiteEstimation(mockStatTracker());

    expect(smiteEstimator()).toEqual({
      smiteDamage: 84,
      smiteHealing: 34,
    });
  });

  it('Estimates Smites Correctly with Versatility', () => {
    const smiteEstimator = SmiteEstimation(mockStatTracker(100, .25));

    expect(smiteEstimator()).toEqual({
      smiteDamage: 105,
      smiteHealing: 42,
    });
  });
});
