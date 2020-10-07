import {
  calculateOverhealing,
  OffensivePenanceBoltEstimation,
  SmiteEstimation,
} from './SpellCalculations';

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
      boltHealing: 20,
    });
  });

  it('Estimates Offensive Penance Bolts Correctly with Versatility', () => {
    const boltEstimator = OffensivePenanceBoltEstimation(
      mockStatTracker(100, 0.25),
    );

    expect(boltEstimator()).toEqual({
      boltDamage: 50,
      boltHealing: 25,
    });
  });
});

describe('[SMITE] Spell Calculations', () => {
  const fixtures = [
    {
      sins: 0,
      int: 100,
      vers: 0,
      expected: {
        smiteDamage: 71,
        smiteHealing: 36,
      },
    },
    {
      sins: 0,
      int: 100,
      vers: 0.25,
      expected: {
        smiteDamage: 88,
        smiteHealing: 44,
      },
    },
    {
      sins: 0,
      int: 100,
      vers: 0,
      expected: {
        smiteDamage: 71,
        smiteHealing: 36,
      },
    },
    {
      sins: 0,
      int: 100,
      vers: 0,
      expected: {
        smiteDamage: 71,
        smiteHealing: 36,
      },
    },
    {
      sins: 0.08,
      int: 100,
      vers: 0.25,
      expected: {
        smiteDamage: 95,
        smiteHealing: 48,
      },
    },
  ];

  fixtures.forEach((fixture, i) => {
    it(`Estimates Smite Correctly #${i}`, () => {
      const smiteEstimator = SmiteEstimation(
        mockStatTracker(fixture.int, fixture.vers),
        { currentBonus: fixture.sins },
      );

      expect(smiteEstimator()).toEqual(fixture.expected);
    });
  });
});
