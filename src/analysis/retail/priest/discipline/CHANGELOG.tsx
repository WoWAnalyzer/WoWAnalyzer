import { change, date } from 'common/changelog';
import { TALENTS_PRIEST } from 'common/TALENTS';
import { Hana } from 'CONTRIBUTORS';
import { SpellLink } from 'interface';


export default [
  change(date(2022, 10, 8), <>Added <SpellLink id={TALENTS_PRIEST.AEGIS_OF_WRATH_TALENT.id}/>.</>, Hana),
  change(date(2022, 10, 3), <>Added <SpellLink id={TALENTS_PRIEST.EXPIATION_TALENT.id}/>.</>, Hana),
  change(date(2022, 10, 3), <>Added <SpellLink id={TALENTS_PRIEST.INDEMNITY_TALENT.id}/>.</>, Hana),
  change(date(2022, 10, 3), <>Dragonflight Clean up.</>, Hana),
];
