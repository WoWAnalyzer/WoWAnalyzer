import {
  calculatePrimaryStat,
  calculateSecondaryStatDefault,
  calculateSecondaryStatJewelry,
} from './stats';

//!! IMPORTANT !!//
// Wowhead tooltips should NOT be used for these values. ONLY USE in-game values.
// Wowhead values can be incorrect, especially for old gear.

function toBeWithin(received, expected, maxDeviation) {
  const pass = expected >= received - maxDeviation && expected <= received + maxDeviation;
  if (pass) {
    return {
      message: () =>
        `expected ${received} not to be within ${maxDeviation} of expected ${expected}`,
      pass: true,
    };
  } else {
    return {
      message: () => `expected ${received} to be within ${maxDeviation} of expected ${expected}`,
      pass: false,
    };
  }
}

describe('stats', () => {
  expect.extend({
    toBeWithinPct(received, expected, pct) {
      return toBeWithin(received, expected, expected * pct);
    },
    toBeWithin,
  });

  it('scales primary stat correctly', () => {
    // Trinket https://www.wowhead.com/item=188270/elegy-of-the-eternals?bonus=6805
    const elegyOfTheEternals = (itemLevel) => calculatePrimaryStat(239, 52, itemLevel);

    expect(elegyOfTheEternals(252)).toBeWithin(66, 1); // Normal
    expect(elegyOfTheEternals(265)).toBeWithin(84, 1); // Heroic
    expect(elegyOfTheEternals(278)).toBeWithin(108, 1); // Mythic

    const ceaselessSwarmgland = (ilvl) => calculatePrimaryStat(593, 2350, ilvl);

    expect(ceaselessSwarmgland(593)).toBeWithin(2350, 1);
    expect(ceaselessSwarmgland(554)).toBeWithin(1634, 1);
    expect(ceaselessSwarmgland(580)).toBeWithin(2082, 1);
    expect(ceaselessSwarmgland(597)).toBeWithin(2439, 1);
  });
  it('scales secondary stat correctly', () => {
    // Spoils of Neltharus
    // https://www.wowhead.com/item=193773/spoils-of-neltharus
    const spoilsOfNeltharus = (itemLevel) => calculateSecondaryStatDefault(250, 482, itemLevel);

    expect(spoilsOfNeltharus(382)).toBeWithinPct(2209, 0.001); // Normal
    expect(spoilsOfNeltharus(402)).toBeWithinPct(2514, 0.001); // Mythic+
    expect(spoilsOfNeltharus(441)).toBeWithinPct(3108, 0.001); // Max upgrade Mythic+
    expect(spoilsOfNeltharus(447)).toBeWithinPct(3199, 0.001); // Vault
    expect(spoilsOfNeltharus(460)).toBeWithinPct(3397, 0.001); // S4 Normal
    expect(spoilsOfNeltharus(476)).toBeWithinPct(3640, 0.001); // S4 Heroic
    expect(spoilsOfNeltharus(493)).toBeWithinPct(3899, 0.001); // S4 M0

    // Vessel of Searing Shadows
    // https://www.wowhead.com/item=202615/vessel-of-searing-shadow
    const unstableFlames = (itemLevel) => calculateSecondaryStatDefault(415, 89.99989, itemLevel);

    expect(unstableFlames(402)).toBeWithin(84, 1); // LFR
    expect(unstableFlames(428)).toBeWithin(96, 1); // Heroic
    expect(unstableFlames(441)).toBeWithin(102, 1); // Mythic
  });
  it('scales secondary stat for Jewelry correctly', () => {
    // Raid Item
    // Neck https://www.wowhead.com/item=204397/magmoraxs-fourth-collar
    const magmoraxCollarVers = (itemLevel) => calculateSecondaryStatJewelry(421, 380, itemLevel);

    expect(magmoraxCollarVers(408)).toBeWithin(342, 1); // LFR
    expect(magmoraxCollarVers(434)).toBeWithin(417, 1); // Heroic
    expect(magmoraxCollarVers(447)).toBeWithin(455, 1); // Mythic

    const magmoraxCollarMastery = (itemLevel) =>
      calculateSecondaryStatJewelry(421, 1184, itemLevel);

    expect(magmoraxCollarMastery(408)).toBeWithin(1067, 1); // LFR
    expect(magmoraxCollarMastery(434)).toBeWithin(1301, 1); // Heroic
    expect(magmoraxCollarMastery(447)).toBeWithin(1418, 1); // Mythic

    const devoutZealotCrit = (ilvl) => calculateSecondaryStatJewelry(554, 2117, ilvl);

    expect(devoutZealotCrit(580)).toBeWithin(2487, 1);
    expect(devoutZealotCrit(593)).toBeWithin(2865, 1);
    expect(devoutZealotCrit(597)).toBeWithin(2982, 1);
  });
});
