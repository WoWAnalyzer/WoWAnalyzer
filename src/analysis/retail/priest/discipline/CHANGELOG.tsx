import { change, date } from 'common/changelog';
import { TALENTS_PRIEST } from 'common/TALENTS';
import SPELLS  from 'common/SPELLS'
import { Hana } from 'CONTRIBUTORS';
import { SpellLink } from 'interface';


export default [
  change(date(2022, 10, 29), <>Hid tier bonus when not using it</>, Hana),
  change(date(2022, 10, 29), <>Added line break in <SpellLink id={TALENTS_PRIEST.TWIST_OF_FATE_TALENT}/> module.</>, Hana),
  change(date(2022, 10, 23), <>Updated abilities file with new spells, updated mana costs of spells.</>, Hana),
  change(date(2022, 10, 23), <>Updated list of spells which are effected by healing increases.</>, Hana),
  change(date(2022, 10, 23), <>Updated <SpellLink id={TALENTS_PRIEST.PURGE_THE_WICKED_TALENT.id}/> section to the Guide.</>, Hana),
  change(date(2022, 10, 22), <>Added <SpellLink id={TALENTS_PRIEST.PURGE_THE_WICKED_TALENT.id}/> section to the Guide.</>, Hana),
  change(date(2022, 10, 22), <>Initial guide/suggestion revamp implementation, including section for <SpellLink id={TALENTS_PRIEST.POWER_WORD_RADIANCE_TALENT.id}/></>, Hana),
  change(date(2022, 10, 22), <>Added <SpellLink id={TALENTS_PRIEST.MALICIOUS_INTENT_TALENT}/>.</>, Hana),
  change(date(2022, 10, 16), <>Added <SpellLink id={TALENTS_PRIEST.PAIN_AND_SUFFERING_TALENT.id}/> and <SpellLink id={TALENTS_PRIEST.THROES_OF_PAIN_TALENT}/>.</>, Hana),
  change(date(2022, 10, 16), <>Added <SpellLink id={TALENTS_PRIEST.POWER_WORD_RADIANCE_TALENT.id}/> module.</>, Hana),
  change(date(2022, 10, 16), <>Fixed <SpellLink id={TALENTS_PRIEST.CONTRITION_TALENT.id}/>.</>, Hana),
  change(date(2022, 10, 15), <>Reorganised talents display</>, Hana),
  change(date(2022, 10, 15), <><SpellLink id={SPELLS.POWER_WORD_SHIELD.id}/> bugfixes. </>, Hana),
  change(date(2022, 10, 15), <>Added <SpellLink id={TALENTS_PRIEST.STOLEN_PSYCHE_TALENT.id}/>.</>, Hana),
  change(date(2022, 10, 11), <>Added <SpellLink id={TALENTS_PRIEST.CRYSTALLINE_REFLECTION_TALENT.id}/> module showing it's damage breakdown.</>, Hana),
  change(date(2022, 10, 10), <>Added generic <SpellLink id={SPELLS.POWER_WORD_SHIELD.id}/> module which handles attribution of it's amplifiers</>, Hana),
  change(date(2022, 10, 8), <>Added <SpellLink id={TALENTS_PRIEST.AEGIS_OF_WRATH_TALENT.id}/>.</>, Hana),
  change(date(2022, 10, 3), <>Added <SpellLink id={TALENTS_PRIEST.EXPIATION_TALENT.id}/>.</>, Hana),
  change(date(2022, 10, 3), <>Added <SpellLink id={TALENTS_PRIEST.INDEMNITY_TALENT.id}/>.</>, Hana),
  change(date(2022, 10, 3), <>Dragonflight Clean up.</>, Hana),
];
