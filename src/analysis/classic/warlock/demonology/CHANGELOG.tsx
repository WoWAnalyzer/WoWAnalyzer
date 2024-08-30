import { change, date } from 'common/changelog';
import { jazminite, Bhahlou } from 'CONTRIBUTORS';
import SpellLink from 'interface/SpellLink';
import SPELLS from 'common/SPELLS/classic/warlock';

export default [
  change(date(2024, 7, 6), 'Resolve various Haste / GCD issues and set guide to foundation status', jazminite),
  change(date(2024, 7, 15), <>Now supports prepull <SpellLink spell={SPELLS.METAMORPHOSIS} /> and <SpellLink spell={SPELLS.DEMON_SOUL_FELGUARD_BUFF} /> in cooldown section.</>, Bhahlou),
  change(date(2024, 7, 6), 'Add Always Be Casting module.', jazminite),
  change(date(2024, 7, 3), 'Add foundation guide for Cata Classic Warlock Demonology spec.', jazminite),
];
