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
    // Heart of Wind Trinket (primary)
    // https://www.wowhead.com/item=250256/heart-of-wind
    const heartOfWind = (itemLevel) => calculatePrimaryStat(214, 59, itemLevel);

    expect(heartOfWind(230)).toBeWithin(68, 1); // Adventurer
    expect(heartOfWind(246)).toBeWithin(79, 1); // Champion
    expect(heartOfWind(272)).toBeWithin(101, 1); // Mythic

    // Vaelgor's Final Stare Trinket (primary)
    // https://www.wowhead.com/item=249346/vaelgors-final-stare
    const vaelgors = (ilvl) => calculatePrimaryStat(240, 75, ilvl);

    expect(vaelgors(253)).toBeWithin(84, 1); // Normal
    expect(vaelgors(266)).toBeWithin(95, 1); // Heroic
    expect(vaelgors(279)).toBeWithin(107, 1); // Mythic
  });
  it('scales secondary stat correctly', () => {
    // Heart of Wind (passive)
    // https://www.wowhead.com/item=250256/heart-of-wind
    const heartOfWindHaste = (itemLevel) => calculateSecondaryStatDefault(214, 164, itemLevel);

    expect(heartOfWindHaste(230)).toBeWithinPct(187, 0.01); // Adventurer
    expect(heartOfWindHaste(246)).toBeWithinPct(208, 0.01); // Champion
    expect(heartOfWindHaste(272)).toBeWithinPct(242, 0.01); // Myth Track

    // Vaelgor's Final Stare Trinket (on-use)
    // https://www.wowhead.com/item=249346/vaelgors-final-stare
    const valegorsMastery = (itemLevel) => calculateSecondaryStatDefault(240, 1027, itemLevel);

    expect(valegorsMastery(253)).toBeWithin(1114, 1); // Normal
    expect(valegorsMastery(266)).toBeWithin(1200, 1); // Heroic
    expect(valegorsMastery(279)).toBeWithin(1287, 1); // Mythic
  });
  it('scales secondary stat for Jewelry correctly', () => {
    // Raid Item
    // Neck https://www.wowhead.com/item=250247/amulet-of-the-abyssal-hymn
    const amuletAbyssalHymnHaste = (itemLevel) => calculateSecondaryStatJewelry(246, 29, itemLevel);

    expect(amuletAbyssalHymnHaste(233)).toBeWithin(25, 1); // LFR
    expect(amuletAbyssalHymnHaste(259)).toBeWithin(34, 1); // Heroic
    expect(amuletAbyssalHymnHaste(272)).toBeWithin(38, 1); // Mythic

    const amuletAbyssalHymnMastery = (itemLevel) =>
      calculateSecondaryStatJewelry(246, 176, itemLevel);

    expect(amuletAbyssalHymnMastery(233)).toBeWithin(151, 1); // LFR
    expect(amuletAbyssalHymnMastery(259)).toBeWithin(201, 1); // Heroic
    expect(amuletAbyssalHymnMastery(272)).toBeWithin(227, 1); // Mythic

    // Dungeon Item
    // Finger https://www.wowhead.com/item=251217/occlusion-of-void
    const occlusionVoidCrit = (ilvl) => calculateSecondaryStatJewelry(214, 110, ilvl);

    expect(occlusionVoidCrit(230)).toBeWithin(118, 1);
    expect(occlusionVoidCrit(246)).toBeWithin(144, 1);
    expect(occlusionVoidCrit(259)).toBeWithin(164, 1);
  });
});
