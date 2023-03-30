import { change, date } from 'common/changelog';
import talents from 'common/TALENTS/mage';
import { Sharrq, emallson, SyncSubaru } from 'CONTRIBUTORS';
import { SpellLink } from 'interface';

export default [
  change(date(2023, 3, 26), <>Renamed old <SpellLink id={talents.ARCANE_POWER_TALENT} /> into <SpellLink id={talents.ARCANE_SURGE_TALENT} /> in preparation for new analysis modules.</>, SyncSubaru),
  change(date(2023, 3, 25), <><SpellLink id={talents.ARCANE_SURGE_TALENT} /> now shows on the timeline when active.</>, SyncSubaru),
  change(date(2023, 3, 19), <>Created anaylser for <SpellLink id={talents.RADIANT_SPARK_TALENT} /> ramp phases.</>, SyncSubaru),
  change(date(2023, 3, 14), <><SpellLink id={talents.ARCANE_HARMONY_TALENT} /> now shows Bonus Damage under Statistics.</>, SyncSubaru),
  change(date(2023, 3, 13), <>Updated bonus damage multiplier of <SpellLink id={talents.ARCANE_HARMONY_TALENT} />.</>, SyncSubaru),
  change(date(2023, 1, 17), <>Fixed outdated reference to the Shadowlands version of <SpellLink id={talents.RADIANT_SPARK_TALENT} />.</>, emallson),
  change(date(2022, 10, 30), `Update Dragonflight SPELLS, Abilities, and Buffs`, Sharrq),
  change(date(2022, 9, 29), 'Initial Dragonflight support', Sharrq),
];
