import { change, date } from 'common/changelog';
import TALENTS from 'common/TALENTS/mage';
import { SpellLink } from 'interface';
import { Sharrq } from 'CONTRIBUTORS';

export default [
  change(date(2022, 12, 13), <>Fixed timeline buff highlights for <SpellLink id={TALENTS.FINGERS_OF_FROST_TALENT} /> and <SpellLink id={TALENTS.BRAIN_FREEZE_TALENT} />.</>, Sharrq),
  change(date(2022, 12, 13), <>Updated <SpellLink id={TALENTS.SHIFTING_POWER_TALENT} /> CDR Spell List.</>, Sharrq),
  change(date(2022, 12, 13), <>Fixed <SpellLink id={TALENTS.ICY_PROPULSION_TALENT} /> CDR tracking.</>, Sharrq),
  change(date(2022, 12, 13), <>Fixed <SpellLink id={TALENTS.BRAIN_FREEZE_TALENT} /> proc usage tracking.</>, Sharrq),
  change(date(2022, 12, 13), <>Fixed <SpellLink id={TALENTS.FINGERS_OF_FROST_TALENT} /> munched proc tracking and used proc usage tracking.</>, Sharrq),
  change(date(2022, 12, 13), `General fixes for incorrect Spell IDs, leftover Shadowlands stuff, etc.`, Sharrq),
  change(date(2022, 10, 30), `Update Dragonflight SPELLS, Abilities, and Buffs`, Sharrq),
  change(date(2022, 9, 29), `Dragonflight initial cleanup`, Sharrq),
];
