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
  const fixtures = [
    {sins: 0, int: 100, vers: 0, expected: {
        smiteDamage: 71,
        smiteHealing: 28,
      }},
    {sins: 0, int: 100, vers: .25, expected: {
        smiteDamage: 88,
        smiteHealing: 35,
      }},
    {sins: 0, int: 100, vers: 0, expected: {
        smiteDamage: 71,
        smiteHealing: 28,
      }},
    {sins: 0, int: 100, vers: 0, expected: {
        smiteDamage: 71,
        smiteHealing: 28,
      }},
    // DISABLED temporarily -- gifts got its scaling factor changed and
    // new data is needed
    /*
    {sins: 0, giftRanks: [300], giftActive: true, int: 100, vers: 0, expected: {
        smiteDamage: 458,
        smiteHealing: 183,
        giftDamage: 387,
        giftHealing: 155,
      }},
    {sins: 0, giftRanks: [300], giftActive: true, int: 100, vers: .25, expected: {
        smiteDamage: 572,
        smiteHealing: 229,
        giftDamage: 484,
        giftHealing: 194,
      }},
    {sins: .12, giftRanks: [300], giftActive: false, int: 100, vers: 0, expected: {
        smiteDamage: 79,
        smiteHealing: 32,
        giftDamage: 0,
        giftHealing: 0,
      }},
    {sins: .12, giftRanks: [300], giftActive: false, int: 100, vers: .25, expected: {
        smiteDamage: 99,
        smiteHealing: 40,
        giftDamage: 0,
        giftHealing: 0,
      }},
    */
    {sins: .08, int: 100, vers: .25, expected: {
        smiteDamage: 95,
        smiteHealing: 38,
      }},
    /*
    {sins: .12, giftRanks: [300], giftActive: true, int: 100, vers: .25, expected: {
        smiteDamage: 641,
        smiteHealing: 257,
        giftDamage: 542,
        giftHealing: 217,
      }},
    {sins: .08, giftRanks: [300], giftActive: true, int: 100, vers: .25, expected: {
        smiteDamage: 617,
        smiteHealing: 247,
        giftDamage: 522,
        giftHealing: 209,
      }},
    {sins: .08, giftRanks: [300, 290], giftActive: true, int: 100, vers: .25, expected: {
        smiteDamage: 1095,
        smiteHealing: 438,
        giftDamage: 1000,
        giftHealing: 400,
      }},
    {sins: .08, giftRanks: [300, 290, 280], giftActive: true, int: 100, vers: .25, expected: {
        smiteDamage: 1527,
        smiteHealing: 611,
        giftDamage: 1432,
        giftHealing: 573,
      }},
    */
  ];

  fixtures.forEach((fixture, i) => {
    it(`Estimates Smite Correctly #${i}`, () => {
      const smiteEstimator = SmiteEstimation(mockStatTracker(fixture.int, fixture.vers), {currentBonus: fixture.sins});

      expect(smiteEstimator()).toEqual(fixture.expected);
    });
  });
});
