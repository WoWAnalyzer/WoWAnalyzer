import { change, date } from 'common/changelog';
import TALENTS, { TALENTS_PRIEST } from 'common/TALENTS/priest';
import { Hana, Litena, Squided } from 'CONTRIBUTORS';
import { SpellLink } from 'interface';

export default [
  change(
    date(2023, 1, 24),
    <>Updated for patch 10.0.5.</>,
    Squided
  ),
  change(
    date(2023, 1, 24),
    <>Added support for <SpellLink id={TALENTS_PRIEST.PRAYERFUL_LITANY_TALENT.id}/>. </>,
    Squided
  ),
  change(
    date(2022, 12, 18),
    <>Added initial holy priest guide for 10.0.</>,
    Squided
  ),
  change(
    date(2022, 11, 28),
    <>
      Added support for {' '}
      <SpellLink id={TALENTS_PRIEST.PONTIFEX_TALENT.id}/>, <SpellLink id={TALENTS_PRIEST.RAPID_RECOVERY_TALENT.id}/>, {' '}
      <SpellLink id={TALENTS_PRIEST.EMPOWERED_RENEW_TALENT.id}/>, and <SpellLink id={TALENTS_PRIEST.MIRACLE_WORKER_TALENT.id}/>.
    </>,
    Squided
  ),
  change(
    date(2022, 11, 26),
    <>
      Updated <SpellLink id={TALENTS.DIVINE_WORD_TALENT.id} /> to new hotfix value.
    </>,
    Litena
  ),
  change(
    date(2022, 11, 10),
    <>
      Added support for
      <SpellLink id={TALENTS_PRIEST.SANCTIFIED_PRAYERS_TALENT.id}/>, <SpellLink id={TALENTS_PRIEST.EVERLASTING_LIGHT_TALENT.id}/>,
      and <SpellLink id={TALENTS_PRIEST.BURNING_VEHEMENCE_TALENT.id}/>.
    </>,
    Squided
  ),
  change(
    date(2022, 11, 7),
    <>
      <SpellLink id={TALENTS_PRIEST.PROTECTIVE_LIGHT_TALENT.id} /> support added.
    </>,
    Hana
  ),
  change(
    date(2022, 11, 3),
    <>
      Added support for <SpellLink id={TALENTS.DIVINE_WORD_TALENT.id} /> and <SpellLink id={TALENTS.SEARING_LIGHT_TALENT.id} />.
    </>,
    Litena
  ),
  change(
    date(2022, 10, 22),
    <>
      Updated 'Mana efficiency tab' and added support for <SpellLink id={TALENTS.REVITALIZING_PRAYERS_TALENT.id} />.
    </>,
    Litena
  ),
  change(date(2022, 10, 15), <> Implemented current version of tier. </>, Litena),
  change(
    date(2022, 10, 12),
    <>
      Cooldown view now shows <SpellLink id={TALENTS.HOLY_WORD_SALVATION_TALENT.id} /> and <SpellLink id={TALENTS.APOTHEOSIS_TALENT.id} /> also
      added support for <SpellLink id={TALENTS.HEALING_CHORUS_TALENT.id} />.
    </>,
    Litena
  ),
  change(date(2022, 10, 12), <> Updated holy word functionality for Dragonflight and added support for <SpellLink id={TALENTS.LIGHTWEAVER_TALENT.id} />. </>, Litena),
  change(date(2022, 10, 9), <> New talent file structure and support for <SpellLink id={TALENTS.DESPERATE_TIMES_TALENT.id}/> and <SpellLink id={TALENTS.ANSWERED_PRAYERS_TALENT.id }/>. </>, Litena),
  change(date(2022,10,7), <> Updated for Dragonflight although not feature complete. </>, Litena),
];
