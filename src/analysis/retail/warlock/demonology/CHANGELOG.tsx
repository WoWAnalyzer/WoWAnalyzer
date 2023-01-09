import { change, date } from 'common/changelog';
import SPELLS from 'common/SPELLS';
import { Sharrq, Zeboot, ToppleTheNun, Jonfanz, Mae } from 'CONTRIBUTORS';
import { SpellLink } from 'interface';

export default [
  change(date(2023, 1, 4), "Add support for Shadow's Bite and Dread Calling talents", Mae),
  change(date(2022, 12, 29), 'Add support for Fel Covenant and 4 piece set bonus', Mae),
  change(date(2022, 12, 15), 'Fix crash caused by no Power Siphon casts being present in a log.', ToppleTheNun),
  change(date(2022, 10, 18), 'Update spec for Dragonflight', Jonfanz),
  change(date(2022, 7, 22), <>Add tracker for number of <SpellLink id={SPELLS.DEMONIC_CIRCLE_SUMMON.id} /> created.</>, ToppleTheNun),
  change(date(2020, 10, 18), 'Converted legacy listeners to new event filters', Zeboot),
  change(date(2020, 10, 15), 'Updated Spellbook and added Conduit, Legendary, and Covenant Spell IDs', Sharrq),
  change(date(2020, 10, 2), 'Deleted Azerite Traits, Updated Statistic Boxes and added Integration Tests.', Sharrq),
];
