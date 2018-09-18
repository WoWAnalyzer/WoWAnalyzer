import { calculatePrimaryStat, calculateSecondaryStatDefault, calculateSecondaryStatJewelry, calculateAzeriteEffects } from './stats';

describe('stats', () => {
  expect.extend({
    toBeWithin(received, expected, maxDeviation) {
      const pass = expected >= (received - maxDeviation) && expected <= (received + maxDeviation);
      if (pass) {
        return {
          message: () => `expected ${received} not to be within ${maxDeviation} of expected ${expected}`,
          pass: true,
        };
      } else {
        return {
          message: () => `expected ${received} to be within ${maxDeviation} of expected ${expected}`,
          pass: false,
        };
      }
    },
  });

  it('scales primary stat correctly', () => {
    // Trinket https://wowhead.com/item=160651/vigilants-bloodshaper&bonus=4800:1507
    const vigilantsBloodshaper = itemLevel => calculatePrimaryStat(355, 236, itemLevel);

    expect(vigilantsBloodshaper(340)).toBeWithin(205, 1); // LFG
    expect(vigilantsBloodshaper(355)).toBeWithin(236, 1); // Normal
    expect(vigilantsBloodshaper(370)).toBeWithin(271, 1); // Heroic
    expect(vigilantsBloodshaper(385)).toBeWithin(313, 1); // Mythic
    expect(vigilantsBloodshaper(400)).toBeWithin(359, 1); // Mythic+15
    expect(vigilantsBloodshaper(415)).toBeWithin(413, 1); // Mythic+30
    expect(vigilantsBloodshaper(430)).toBeWithin(475, 1); // Mythic+45

    // Helm
    const helmOfTheDefiledLaboratorium = itemLevel => calculatePrimaryStat(355, 472, itemLevel);

    expect(helmOfTheDefiledLaboratorium(340)).toBeWithin(411, 1); // LFG
    expect(helmOfTheDefiledLaboratorium(355)).toBeWithin(472, 1); // Normal
    expect(helmOfTheDefiledLaboratorium(370)).toBeWithin(543, 1); // Heroic
    expect(helmOfTheDefiledLaboratorium(385)).toBeWithin(625, 1); // Mythic
  });
  it('scales secondary stat correctly', () => {
    // Two handed Mace
    const khorHammerOfTheCorrupted = itemLevel => calculateSecondaryStatDefault(355, 124, itemLevel);

    expect(khorHammerOfTheCorrupted(340)).toBeWithin(115, 1); // LFG
    expect(khorHammerOfTheCorrupted(355)).toBeWithin(124, 1); // Normal
    expect(khorHammerOfTheCorrupted(370)).toBeWithin(133, 1); // Heroic
    expect(khorHammerOfTheCorrupted(385)).toBeWithin(142, 1); // Mythic

    // Cloak (Haste)
    const fetidHorrorsTanglecloak = itemLevel => calculateSecondaryStatDefault(355, 68, itemLevel);

    expect(fetidHorrorsTanglecloak(340)).toBeWithin(63, 1); // LFG
    expect(fetidHorrorsTanglecloak(355)).toBeWithin(68, 1); // Normal
    expect(fetidHorrorsTanglecloak(370)).toBeWithin(73, 1); // Heroic
    expect(fetidHorrorsTanglecloak(385)).toBeWithin(78, 1); // Mythic

    // Azurethos' Ruffling Plumage (Trinket Haste active)
    // https://wowhead.com/item=161377/azurethos-ruffling-plumage&bonus=4800:1507
    const azurethosRufflingPlumageHaste = itemLevel => calculateSecondaryStatDefault(355, 925, itemLevel);

    expect(azurethosRufflingPlumageHaste(340)).toBeWithin(860, 1); // LFG
    expect(azurethosRufflingPlumageHaste(355)).toBeWithin(925, 1); // Normal
    expect(azurethosRufflingPlumageHaste(370)).toBeWithin(990, 1); // Heroic
    expect(azurethosRufflingPlumageHaste(385)).toBeWithin(1055, 1); // Mythic
  });
  it('scales secondary stat for Jewelry correctly', () => {
    // Rot-Scour Ring (Crit)
    // https://wowhead.com/item=160645
    const rotScourRingCrit = itemLevel => calculateSecondaryStatJewelry(355, 108, itemLevel);

    expect(rotScourRingCrit(340)).toBeWithin(101, 1); // LFG
    expect(rotScourRingCrit(355)).toBeWithin(108, 1); // Normal
    expect(rotScourRingCrit(370)).toBeWithin(116, 1); // Heroic
    expect(rotScourRingCrit(385)).toBeWithin(123, 1); // Mythic

    // Rot-Scour Ring (Haste)
    const rotScourRingHaste = itemLevel => calculateSecondaryStatJewelry(355, 260, itemLevel);

    expect(rotScourRingHaste(340)).toBeWithin(241, 1); // LFG
    expect(rotScourRingHaste(355)).toBeWithin(260, 1); // Normal
    expect(rotScourRingHaste(370)).toBeWithin(278, 1); // Heroic
    expect(rotScourRingHaste(385)).toBeWithin(296, 1); // Mythic
  });

  describe('azerite powers', () => {
    const verifyAzeritePower = (spellId, values) => {
      Object.keys(values).forEach(itemLevel => {
        expect(calculateAzeriteEffects(spellId, itemLevel)).toEqual(values[itemLevel]);
      });
    };

    it('correct scales -1 scaling azerite powers', () => { // uses primary stat scaling formula
      // Elusive Footwork
      verifyAzeritePower(278571, {
        310: [331],
        315: [348],
        340: [438],
        355: [507],
        370: [580],
        385: [670],
      });
    });
    it('correct scales -7 scaling azerite powers', () => { // uses secondary stat scaling formula
      // Woundbinder
      verifyAzeritePower(267880, {
        340: [544],
        355: [584],
        370: [625],
        385: [666],
      });
    });
    it('correct scales -8 scaling azerite powers', () => { // uses a custom healing stat scaling formula
      // Moment of Repose
      verifyAzeritePower(272775, {
        280: [5693],
        310: [7558],
        325: [8736],
        340: [10012],
      });
    });
    it('correctly computes Gemhide armor but not avoidance', () => {
      // Gemhide --- nothing matches the new scaling for gemhide's
      // avoidance :shrug:
      //
      // this is a canary test -- it only exists to let us know if
      // something changes. it also conveniently lets us know that the
      // armor value is correct and usable
      const spellId = 268596;
      const values = {
        340: [111, 160],
        355: [120, 184],
        370: [128, 211],
        385: [136, 243],
      };
      Object.keys(values).forEach(itemLevel => {
        const [avoidance, armor] = calculateAzeriteEffects(spellId, itemLevel);
        expect(armor).toEqual(values[itemLevel][1]);
        expect(avoidance).not.toEqual(values[itemLevel][0]);
      });
    });
  });
});
