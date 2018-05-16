import { calculatePrimaryStat, calculateSecondaryStatDefault, calculateSecondaryStatJewelry } from './stats';

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
    // Trinket
    const vigilantsBloodshaper = itemLevel => calculatePrimaryStat(355, 235, itemLevel);

    expect(vigilantsBloodshaper(340)).toBeWithin(205, 2); // LFG
    expect(vigilantsBloodshaper(355)).toBeWithin(236, 2); // Normal
    expect(vigilantsBloodshaper(370)).toBeWithin(271, 2); // Heroic
    expect(vigilantsBloodshaper(385)).toBeWithin(313, 2); // Mythic
    expect(vigilantsBloodshaper(400)).toBeWithin(359, 2); // Mythic+15
    expect(vigilantsBloodshaper(415)).toBeWithin(413, 2); // Mythic+30
    expect(vigilantsBloodshaper(430)).toBeWithin(475, 2); // Mythic+45

    // Helm
    const helmOfTheDefiledLaboratorium = itemLevel => calculatePrimaryStat(355, 472, itemLevel);

    expect(helmOfTheDefiledLaboratorium(340)).toBeWithin(411, 2); // LFG
    expect(helmOfTheDefiledLaboratorium(355)).toBeWithin(472, 2); // Normal
    expect(helmOfTheDefiledLaboratorium(370)).toBeWithin(543, 2); // Heroic
    expect(helmOfTheDefiledLaboratorium(385)).toBeWithin(625, 2); // Mythic
  });
  it('scales secondary stat correctly', () => {
    // Two handed Mace
    const khorHammerOfTheCorrupted = itemLevel => calculateSecondaryStatDefault(355, 124, itemLevel);

    expect(khorHammerOfTheCorrupted(340)).toBeWithin(115, 2); // LFG
    expect(khorHammerOfTheCorrupted(355)).toBeWithin(124, 2); // Normal
    expect(khorHammerOfTheCorrupted(370)).toBeWithin(133, 2); // Heroic
    expect(khorHammerOfTheCorrupted(385)).toBeWithin(142, 2); // Mythic

    // Cloak (Haste)
    const fetidHorrorsTanglecloak = itemLevel => calculateSecondaryStatDefault(355, 68, itemLevel);

    expect(fetidHorrorsTanglecloak(340)).toBeWithin(63, 2); // LFG
    expect(fetidHorrorsTanglecloak(355)).toBeWithin(68, 2); // Normal
    expect(fetidHorrorsTanglecloak(370)).toBeWithin(73, 2); // Heroic
    expect(fetidHorrorsTanglecloak(385)).toBeWithin(78, 2); // Mythic
  });
  it('scales secondary stat for Jewelry correctly', () => {
    // Rot-Scour Ring (Crit)
    const rotScourRingCrit = itemLevel => calculateSecondaryStatJewelry(355, 108, itemLevel);

    expect(rotScourRingCrit(340)).toBeWithin(101, 2); // LFG
    expect(rotScourRingCrit(355)).toBeWithin(108, 2); // Normal
    expect(rotScourRingCrit(370)).toBeWithin(116, 2); // Heroic
    expect(rotScourRingCrit(385)).toBeWithin(123, 2); // Mythic
    // Rot-Scour Ring (Haste)
    const rotScourRingHaste = itemLevel => calculateSecondaryStatJewelry(355, 260, itemLevel);

    expect(rotScourRingHaste(340)).toBeWithin(241, 2); // LFG
    expect(rotScourRingHaste(355)).toBeWithin(260, 2); // Normal
    expect(rotScourRingHaste(370)).toBeWithin(278, 2); // Heroic
    expect(rotScourRingHaste(385)).toBeWithin(296, 2); // Mythic

    // Azurethos' Ruffling Plumage (Trinket Haste active)
    // https://bfa.wowhead.com/item=161377/azurethos-ruffling-plumage&bonus=4800:1507
    const azurethosRufflingPlumageHaste = itemLevel => calculateSecondaryStatJewelry(355, 925, itemLevel);

    expect(azurethosRufflingPlumageHaste(340)).toBeWithin(860, 2); // LFG
    expect(azurethosRufflingPlumageHaste(355)).toBeWithin(925, 2); // Normal
    expect(azurethosRufflingPlumageHaste(370)).toBeWithin(990, 2); // Heroic
    expect(azurethosRufflingPlumageHaste(385)).toBeWithin(1055, 2); // Mythic
  });
});
