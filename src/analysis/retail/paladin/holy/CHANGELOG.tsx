import { change, date } from 'common/changelog';
import TALENTS from 'common/TALENTS/paladin';
import { SpellLink } from 'interface';
import { CamClark, Tialyss, ToppleTheNun, xizbow, Trevor } from 'CONTRIBUTORS';
import SPELLS from 'common/SPELLS/paladin';

export default [
  change(date(2023, 4, 28), <>Add module for T30 Tier set</>, Trevor),
  change(date(2023, 3, 30), <>Update icons for <SpellLink id={SPELLS.BLESSING_OF_SUMMER_TALENT} />, <SpellLink id={SPELLS.BLESSING_OF_AUTUMN_TALENT} />, <SpellLink id={SPELLS.BLESSING_OF_WINTER_TALENT} />, and <SpellLink id={SPELLS.BLESSING_OF_SPRING_TALENT} />.</>, ToppleTheNun),
  change(date(2023, 1, 26), <>Implement CDR from <SpellLink id={TALENTS.SEAL_OF_ORDER_TALENT} />,
  {' '}<SpellLink id={TALENTS.AVENGING_CRUSADER_TALENT} />,
  and <SpellLink id={SPELLS.BLESSING_OF_AUTUMN_TALENT} /></>, Tialyss),
  change(date(2023, 1, 7), <>Beacon refactoring and better <SpellLink id={TALENTS.BEACON_OF_VIRTUE_TALENT} /> support.</>, Tialyss),
  change(date(2022, 12, 23), 'Remove myself from Holy Paladin maintainer list.', xizbow),
  change(date(2022, 12, 21), <>Correct <SpellLink id={TALENTS.BEACON_OF_FAITH_TALENT} /> uptime tracking.</>, ToppleTheNun),
  change(date(2022, 10, 16), <>Modify missed <SpellLink id={TALENTS.MARAADS_DYING_BREATH_TALENT} /> as was previously legendary</>, CamClark),
  change(date(2022, 10, 11), `Move shadowland legendaries to talents`, CamClark),
  change(date(2022, 10, 5), `Remove redundant spells replaced by talents`, CamClark),
  change(date(2022, 10, 2), `Dragonflight initial cleanup`, CamClark),
];
