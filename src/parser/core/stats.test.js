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
    // Spoils of Neltharus
    // https://www.wowhead.com/item=193773/spoils-of-neltharus
    const spoilsOfNeltharus = (itemLevel) => calculateSecondaryStatDefault(250, 547.57, itemLevel);

    expect(spoilsOfNeltharus(382)).toBeWithin(2253.943, 1); // Normal
    expect(spoilsOfNeltharus(402)).toBeWithin(2528.523, 1); // Mythic+
    expect(spoilsOfNeltharus(441)).toBeWithin(3063.954, 1); // Max upgrade Mythic+
    expect(spoilsOfNeltharus(447)).toBeWithin(3146.328, 1); // Vault

    // Vessel of Searing Shadows
    // https://www.wowhead.com/item=202615/vessel-of-searing-shadow
    const unstableFlames = (itemLevel) => calculateSecondaryStatDefault(415, 89.99989, itemLevel);

    expect(unstableFlames(402)).toBeWithin(84.06605, 1); // LFR
    expect(unstableFlames(428)).toBeWithin(95.93372, 1); // Heroic
    expect(unstableFlames(441)).toBeWithin(101.8676, 1); // Mythic
  });
  it('scales secondary stat for Jewelry correctly', () => {
    // Raid Item
    // Neck https://www.wowhead.com/item=204397/magmoraxs-fourth-collar
    const magmoraxCollarVers = (itemLevel) => calculateSecondaryStatJewelry(421, 294, itemLevel);

    expect(magmoraxCollarVers(408)).toBeWithin(267, 1); // LFR
    expect(magmoraxCollarVers(434)).toBeWithin(321, 1); // Heroic
    expect(magmoraxCollarVers(447)).toBeWithin(348, 1); // Mythic

    const magmoraxCollarMastery = (itemLevel) => calculateSecondaryStatJewelry(421, 916, itemLevel);

    expect(magmoraxCollarMastery(408)).toBeWithin(832, 1); // LFR
    expect(magmoraxCollarMastery(434)).toBeWithin(1001, 1); // Heroic
    expect(magmoraxCollarMastery(447)).toBeWithin(1085, 1); // Mythic

    // Dungeon Item
    // Ring https://www.wowhead.com/item=193768/scalebane-signet
    const scalebaneSignetCrit = (itemLevel) => calculateSecondaryStatJewelry(250, 76, itemLevel);

    expect(scalebaneSignetCrit(382)).toBeWithin(275, 1); // Normal
    expect(scalebaneSignetCrit(389)).toBeWithin(294, 1); // Heroic
    expect(scalebaneSignetCrit(398)).toBeWithin(318, 1); // Mythic
    expect(scalebaneSignetCrit(402)).toBeWithin(329, 1); // Mythic+

    const scalebaneSignetMastery = (itemLevel) =>
      calculateSecondaryStatJewelry(250, 167, itemLevel);

    expect(scalebaneSignetMastery(382)).toBeWithin(600, 1); // Normal
    expect(scalebaneSignetMastery(389)).toBeWithin(642, 1); // Heroic
    expect(scalebaneSignetMastery(398)).toBeWithin(695, 1); // Mythic
    expect(scalebaneSignetMastery(402)).toBeWithin(718, 1); // Mythic+
  });
});
