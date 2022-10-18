import { change, date } from 'common/changelog';
import SPELLS from 'common/SPELLS';
import { Sharrq, Zeboot, ToppleTheNun, Jonfanz } from 'CONTRIBUTORS';
import { SpellLink } from 'interface';

export default [
  change(date(2022, 10, 18), 'Update spec for Dragonflight', Jonfanz),
  change(date(2022, 7, 22), <>Add tracker for number of <SpellLink id={SPELLS.DEMONIC_CIRCLE_SUMMON.id} /> created.</>, ToppleTheNun),
  change(date(2020, 10, 18), 'Converted legacy listeners to new event filters', Zeboot),
  change(date(2020, 10, 15), 'Updated Spellbook and added Conduit, Legendary, and Covenant Spell IDs', Sharrq),
  change(date(2020, 10, 2), 'Deleted Azerite Traits, Updated Statistic Boxes and added Integration Tests.', Sharrq),
];
