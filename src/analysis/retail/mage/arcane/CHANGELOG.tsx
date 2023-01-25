import { change, date } from 'common/changelog';
import talents from 'common/TALENTS/mage';
import { Sharrq, emallson } from 'CONTRIBUTORS';
import { SpellLink } from 'interface';

export default [
  change(date(2023, 1, 17), <>Fixed outdated reference to the Shadowlands version of <SpellLink id={talents.RADIANT_SPARK_TALENT} />.</>, emallson),
  change(date(2022, 10, 30), `Update Dragonflight SPELLS, Abilities, and Buffs`, Sharrq),
  change(date(2022, 9, 29), 'Initial Dragonflight support', Sharrq),
];
