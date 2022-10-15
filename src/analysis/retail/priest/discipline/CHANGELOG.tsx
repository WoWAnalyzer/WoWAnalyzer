import { change, date } from 'common/changelog';
import { TALENTS_PRIEST } from 'common/TALENTS';
import SPELLS  from 'common/SPELLS'
import { Hana } from 'CONTRIBUTORS';
import { SpellLink } from 'interface';


export default [
  change(date(2022, 10,11), <>Added <SpellLink id={TALENTS_PRIEST.CRYSTALLINE_REFLECTION_TALENT.id}/> module showing it's damage breakdown.</>, Hana),
  change(date (2022,10,10), <>Added generic <SpellLink id={SPELLS.POWER_WORD_SHIELD.id}/> module which handles attribution of it's amplifiers</>, Hana),
  change(date(2022, 10, 8), <>Added <SpellLink id={TALENTS_PRIEST.AEGIS_OF_WRATH_TALENT.id}/>.</>, Hana),
  change(date(2022, 10, 3), <>Added <SpellLink id={TALENTS_PRIEST.EXPIATION_TALENT.id}/>.</>, Hana),
  change(date(2022, 10, 3), <>Added <SpellLink id={TALENTS_PRIEST.INDEMNITY_TALENT.id}/>.</>, Hana),
  change(date(2022, 10, 3), <>Dragonflight Clean up.</>, Hana),
];
