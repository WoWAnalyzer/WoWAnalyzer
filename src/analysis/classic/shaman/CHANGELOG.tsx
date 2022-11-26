import { change, date } from 'common/changelog';
import { Arbixal, Khadaj, jazminite } from 'CONTRIBUTORS';

export default [
  change(date(2022, 11, 7), 'Update and re-org Classic Shaman spells.', jazminite),
  change(date(2022, 1, 2), 'Adding totem tracker and grounding totem module.', Khadaj),
  change(date(2021, 11, 8), 'Added very basic Elemental and Enhancement specs.', Arbixal),
  change(date(2021, 11, 5), 'Filled out ability info, added Earth Shield, Water Shield, Mana Tide, and Chain Heal stats.', Arbixal),
  change(date(2021, 10, 1), 'Stubbing out Resto Shaman Analyzer', Khadaj),
];
