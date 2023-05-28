import {
  calculatePrimaryStat,
  calculateSecondaryStatDefault,
  calculateSecondaryStatJewelry,
} from './stats';

describe('stats', () => {
  expect.extend({
    toBeWithin(received, expected, maxDeviation) {
      const pass = expected >= received - maxDeviation && expected <= received + maxDeviation;
      if (pass) {
        return {
          message: () =>
            `expected ${received} not to be within ${maxDeviation} of expected ${expected}`,
          pass: true,
        };
      } else {
        return {
          message: () =>
            `expected ${received} to be within ${maxDeviation} of expected ${expected}`,
          pass: false,
        };
      }
    },
  });

  it('scales primary stat correctly', () => {
    // Trinket https://www.wowhead.com/item=188270/elegy-of-the-eternals?bonus=6805
    const elegyOfTheEternals = (itemLevel) => calculatePrimaryStat(226, 73, itemLevel);

    expect(elegyOfTheEternals(239)).toBeWithin(83, 1); // LFR
    expect(elegyOfTheEternals(252)).toBeWithin(93, 1); // Normal
    expect(elegyOfTheEternals(265)).toBeWithin(105, 1); // Heroic
    expect(elegyOfTheEternals(278)).toBeWithin(119, 1); // Mythic

    // Helm https://www.wowhead.com/item=189787/dausegnes-dissonant-halo?bonus=6805
    const dausegnesDissonantHalo = (itemLevel) => calculatePrimaryStat(226, 81, itemLevel);

    expect(dausegnesDissonantHalo(239)).toBeWithin(92, 1); // LFR
    expect(dausegnesDissonantHalo(252)).toBeWithin(104, 1); // Normal
    expect(dausegnesDissonantHalo(265)).toBeWithin(117, 1); // Heroic
    expect(dausegnesDissonantHalo(278)).toBeWithin(132, 1); // Mythic

    // Weapon https://www.wowhead.com/item=189853/astral-verdict?bonus=6805
    const astralVerdict = (itemLevel) => calculatePrimaryStat(233, 87, itemLevel);

    expect(astralVerdict(246)).toBeWithin(98, 1); // LFR
    expect(astralVerdict(259)).toBeWithin(111, 1); // Normal
    expect(astralVerdict(272)).toBeWithin(125, 1); // Heroic
    expect(astralVerdict(285)).toBeWithin(141, 1); // Mythic

    // Dungeon Item
    // Back https://www.wowhead.com/item=185781/drape-of-titanic-dreams?bonus=6805
    const drapeOfTitanicDreams = (itemLevel) => calculatePrimaryStat(155, 24, itemLevel);

    expect(drapeOfTitanicDreams(210)).toBeWithin(39, 1); // Normal
    expect(drapeOfTitanicDreams(223)).toBeWithin(44, 1); // Heroic
    expect(drapeOfTitanicDreams(236)).toBeWithin(50, 1); // Mythic 0
    expect(drapeOfTitanicDreams(246)).toBeWithin(55, 1); // Mythic +5
    expect(drapeOfTitanicDreams(255)).toBeWithin(60, 1); // Mythic +10
    expect(drapeOfTitanicDreams(262)).toBeWithin(64, 1); // Mythic +15
    expect(drapeOfTitanicDreams(278)).toBeWithin(74, 1); // Mythic +15 Vault
  });
  it('scales secondary stat correctly', () => {
    // The First Sigil (Trinket Versatility active)
    // https://www.wowhead.com/item=188271/the-first-sigil?bonus=6805
    const theFirstSigil = (itemLevel) => calculateSecondaryStatDefault(226, 1037, itemLevel);

    expect(theFirstSigil(239)).toBeWithin(1105, 1); // LFG
    expect(theFirstSigil(252)).toBeWithin(1174, 1); // Normal
    expect(theFirstSigil(265)).toBeWithin(1242, 1); // Heroic
    expect(theFirstSigil(278)).toBeWithin(1311, 1); // Mythic

    // Dungeon Item
    // Back https://www.wowhead.com/item=185781/drape-of-titanic-dreams?bonus=6805
    const drapeOfTitanicDreamsHaste = (itemLevel) =>
      calculateSecondaryStatDefault(155, 16, itemLevel);

    expect(drapeOfTitanicDreamsHaste(210)).toBeWithin(24, 1); // Normal
    expect(drapeOfTitanicDreamsHaste(223)).toBeWithin(26, 1); // Heroic
    expect(drapeOfTitanicDreamsHaste(236)).toBeWithin(28, 1); // Mythic 0
    expect(drapeOfTitanicDreamsHaste(246)).toBeWithin(29, 1); // Mythic +5
    expect(drapeOfTitanicDreamsHaste(255)).toBeWithin(30, 1); // Mythic +10
    expect(drapeOfTitanicDreamsHaste(262)).toBeWithin(31, 1); // Mythic +15
    expect(drapeOfTitanicDreamsHaste(278)).toBeWithin(33, 1); // Mythic +15 Vault

    const drapeOfTitanicDreamsMastery = (itemLevel) =>
      calculateSecondaryStatDefault(155, 33, itemLevel);

    expect(drapeOfTitanicDreamsMastery(210)).toBeWithin(49, 1); // Normal
    expect(drapeOfTitanicDreamsMastery(223)).toBeWithin(53, 1); // Heroic
    expect(drapeOfTitanicDreamsMastery(236)).toBeWithin(56, 1); // Mythic 0
    expect(drapeOfTitanicDreamsMastery(246)).toBeWithin(59, 1); // Mythic +5
    expect(drapeOfTitanicDreamsMastery(255)).toBeWithin(61, 1); // Mythic +10
    expect(drapeOfTitanicDreamsMastery(262)).toBeWithin(63, 1); // Mythic +15
    expect(drapeOfTitanicDreamsMastery(278)).toBeWithin(68, 1); // Mythic +15 Vault
  });
  it('scales secondary stat for Jewelry correctly', () => {
    // Raid Item
    // Neck https://www.wowhead.com/item=189838/beacon-of-stormwind?bonus=6805
    const beaconOfStormwindCrit = (itemLevel) => calculateSecondaryStatJewelry(226, 172, itemLevel);

    expect(beaconOfStormwindCrit(239)).toBeWithin(189, 1); // LFR
    expect(beaconOfStormwindCrit(252)).toBeWithin(206, 1); // Normal
    expect(beaconOfStormwindCrit(265)).toBeWithin(223, 1); // Heroic
    expect(beaconOfStormwindCrit(278)).toBeWithin(240, 1); // Mythic

    const beaconOfStormwindMastery = (itemLevel) =>
      calculateSecondaryStatJewelry(226, 43, itemLevel);

    expect(beaconOfStormwindMastery(239)).toBeWithin(47, 1); // LFR
    expect(beaconOfStormwindMastery(252)).toBeWithin(51, 1); // Normal
    expect(beaconOfStormwindMastery(265)).toBeWithin(56, 1); // Heroic
    expect(beaconOfStormwindMastery(278)).toBeWithin(60, 1); // Mythic

    // Dungeon Item
    // Ring https://www.wowhead.com/item=185813/signet-of-collapsing-stars?bonus=6805
    const signetOfCollapsingStarHaste = (itemLevel) =>
      calculateSecondaryStatJewelry(155, 47, itemLevel);

    expect(signetOfCollapsingStarHaste(210)).toBeWithin(87, 1); // Normal
    expect(signetOfCollapsingStarHaste(223)).toBeWithin(96, 1); // Heroic
    expect(signetOfCollapsingStarHaste(236)).toBeWithin(106, 1); // Mythic 0
    expect(signetOfCollapsingStarHaste(246)).toBeWithin(113, 1); // Mythic +5
    expect(signetOfCollapsingStarHaste(255)).toBeWithin(120, 1); // Mythic +10
    expect(signetOfCollapsingStarHaste(262)).toBeWithin(125, 1); // Mythic +15
    expect(signetOfCollapsingStarHaste(278)).toBeWithin(137, 1); // Mythic +15 Vault

    const signetOfCollapsingStarVers = (itemLevel) =>
      calculateSecondaryStatJewelry(155, 56, itemLevel);

    expect(signetOfCollapsingStarVers(210)).toBeWithin(103, 1); // Normal
    expect(signetOfCollapsingStarVers(223)).toBeWithin(114, 1); // Heroic
    expect(signetOfCollapsingStarVers(236)).toBeWithin(126, 1); // Mythic 0
    expect(signetOfCollapsingStarVers(246)).toBeWithin(134, 1); // Mythic +5
    expect(signetOfCollapsingStarVers(255)).toBeWithin(142, 1); // Mythic +10
    expect(signetOfCollapsingStarVers(262)).toBeWithin(149, 1); // Mythic +15
    expect(signetOfCollapsingStarVers(278)).toBeWithin(163, 1); // Mythic +15 Vault
  });
});
