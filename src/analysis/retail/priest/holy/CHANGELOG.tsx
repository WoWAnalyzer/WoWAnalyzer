import { change, date } from 'common/changelog';
import TALENTS, { TALENTS_PRIEST } from 'common/TALENTS/priest';
import { Hana, Litena, Squided, ToppleTheNun, Trevor } from 'CONTRIBUTORS';
import { SpellLink } from 'interface';

export default [
  change(date(2023, 7, 3), 'Update SpellLink usage.', ToppleTheNun),
  change(
    date(2023, 5, 11),
    <>Fix crash in Holy Priest T30 module</>,
    Trevor
  ),
  change(
    date(2023, 4, 26),
    <>Restyle Surge of Light and import it for Discipline</>,
    Hana
  ),
  change(
    date(2023, 4, 20),
    <>Add support for Aberrus, the Shadowed Crucible tier set.</>,
    Squided
  ),
  change(
    date(2023, 3, 27),
    <>Fix bugs in <SpellLink spell={TALENTS_PRIEST.DIVINE_IMAGE_TALENT}/> and <SpellLink spell={TALENTS_PRIEST.ENLIGHTENMENT_TALENT}/>t modules.</>,
    Squided
  ),
  change(
    date(2023, 3, 21),
    <>Updated for patch 10.0.7. Temporarily disabled <SpellLink spell={TALENTS_PRIEST.DIVINE_IMAGE_TALENT}/> module due to combat log issues. Fix <SpellLink spell={TALENTS_PRIEST.DIVINE_WORD_TALENT}/> module.</>,
    Squided
  ),
  change(
    date(2023, 1, 24),
    <>Updated for patch 10.0.5.</>,
    Squided
  ),
  change(
    date(2023, 1, 24),
    <>Added support for <SpellLink spell={TALENTS_PRIEST.PRAYERFUL_LITANY_TALENT}/>. </>,
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
      <SpellLink spell={TALENTS_PRIEST.PONTIFEX_TALENT}/>, <SpellLink spell={TALENTS_PRIEST.RAPID_RECOVERY_TALENT}/>, {' '}
      <SpellLink spell={TALENTS_PRIEST.EMPOWERED_RENEW_TALENT}/>, and <SpellLink spell={TALENTS_PRIEST.MIRACLE_WORKER_TALENT}/>.
    </>,
    Squided
  ),
  change(
    date(2022, 11, 26),
    <>
      Updated <SpellLink spell={TALENTS.DIVINE_WORD_TALENT} /> to new hotfix value.
    </>,
    Litena
  ),
  change(
    date(2022, 11, 10),
    <>
      Added support for
      <SpellLink spell={TALENTS_PRIEST.SANCTIFIED_PRAYERS_TALENT}/>, <SpellLink spell={TALENTS_PRIEST.EVERLASTING_LIGHT_TALENT}/>,
      and <SpellLink spell={TALENTS_PRIEST.BURNING_VEHEMENCE_TALENT}/>.
    </>,
    Squided
  ),
  change(
    date(2022, 11, 7),
    <>
      <SpellLink spell={TALENTS_PRIEST.PROTECTIVE_LIGHT_TALENT} /> support added.
    </>,
    Hana
  ),
  change(
    date(2022, 11, 3),
    <>
      Added support for <SpellLink spell={TALENTS.DIVINE_WORD_TALENT} /> and <SpellLink spell={TALENTS.SEARING_LIGHT_TALENT} />.
    </>,
    Litena
  ),
  change(
    date(2022, 10, 22),
    <>
      Updated 'Mana efficiency tab' and added support for <SpellLink spell={TALENTS.REVITALIZING_PRAYERS_TALENT} />.
    </>,
    Litena
  ),
  change(date(2022, 10, 15), <> Implemented current version of tier. </>, Litena),
  change(
    date(2022, 10, 12),
    <>
      Cooldown view now shows <SpellLink spell={TALENTS.HOLY_WORD_SALVATION_TALENT} /> and <SpellLink spell={TALENTS.APOTHEOSIS_TALENT} /> also
      added support for <SpellLink spell={TALENTS.HEALING_CHORUS_TALENT} />.
    </>,
    Litena
  ),
  change(date(2022, 10, 12), <> Updated holy word functionality for Dragonflight and added support for <SpellLink spell={TALENTS.LIGHTWEAVER_TALENT} />. </>, Litena),
  change(date(2022, 10, 9), <> New talent file structure and support for <SpellLink spell={TALENTS.DESPERATE_TIMES_TALENT}/> and <SpellLink spell={TALENTS.ANSWERED_PRAYERS_TALENT }/>. </>, Litena),
  change(date(2022,10,7), <> Updated for Dragonflight although not feature complete. </>, Litena),
];
