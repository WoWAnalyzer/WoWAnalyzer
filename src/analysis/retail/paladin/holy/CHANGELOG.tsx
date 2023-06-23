import { change, date } from 'common/changelog';
import TALENTS from 'common/TALENTS/paladin';
import { SpellLink } from 'interface';
import { CamClark, Tialyss, ToppleTheNun, xizbow, Trevor, Abelito75 } from 'CONTRIBUTORS';
import SPELLS from 'common/SPELLS/paladin';

export default [
  change(date(2023, 6, 23), <>Holy Prism Average Targets Hit.</>, Abelito75),
  change(date(2023, 6, 22), <>Updated Abilities.jpg.</>, Abelito75),
  change(date(2023, 6, 19), <>Imbued Infusions.png enabled.</>, Abelito75),
  change(date(2023, 6, 19), <>Divine Favor and Barrier of Faith Tracked.</>, Abelito75),
  change(date(2023, 6, 19), <>Judgment of light is 5 not 25.</>, Abelito75),
  change(date(2023, 6, 19), <>Divine Toll checklist item added.</>, Abelito75),
  change(date(2023, 6, 17), <>Devo Aura AM is 15%.</>, Abelito75),
  change(date(2023, 6, 17), <>Rule of Law doens't increase Mastery Range.</>, Abelito75),
  change(date(2023, 6, 16), <>Average Light of Dawn Distance.</>, Abelito75),
  change(date(2023, 5, 15), <>Bump to full support</>, Trevor),
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
