
import { change, date } from 'common/changelog';
import TALENTS from 'common/TALENTS/paladin';
import { SpellLink } from 'interface';
import { CamClark } from 'CONTRIBUTORS';


export default [
  change(date(2022, 10, 16), <>Modify missed <SpellLink id={TALENTS.MARAADS_DYING_BREATH_TALENT.id} /> as was previously legendary</>, CamClark),
  change(date(2022, 10, 11), `Move shadowland legendaries to talents`, CamClark),
  change(date(2022, 10, 5), `Remove redundant spells replaced by talents`, CamClark),
  change(date(2022, 10, 2), `Dragonflight initial cleanup`, CamClark),
  ];


