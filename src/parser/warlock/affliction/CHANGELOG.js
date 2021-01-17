import { Dambroda, Sharrq, Maleficien, Akhtal } from 'CONTRIBUTORS';
import { change, date } from 'common/changelog';

export default [
  change(date(2021, 1, 9), 'Update Darkglare damage calculations to support Vile Taint, finish Typescript conversion', Akhtal),
  change(date(2020, 12, 30), 'Add support for Shadow Embrace and Haunt in debuff uptime, convert most analyzer to Typescript', Akhtal),
  change(date(2020, 12, 10), 'Updated spells for Shadowlands, added Night Fae spells, fix uptime bug for debuffs cast during pre-pull.', Maleficien),
  change(date(2020, 10, 15), 'Updated Spellbook and added Conduit, Legendary, and Covenant Spell IDs', Sharrq),
  change(date(2020, 10, 15), 'Fixed a crash in prepatch related to Unstable Affliction changes.', Dambroda),
  change(date(2020, 10, 2), 'Deleted Azerite Traits, Updated Statistic Boxes and added Integration Tests.', Sharrq),
];
