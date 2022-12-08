import { change, date } from 'common/changelog';
import SPELLS from 'common/SPELLS';
import TALENTS, { TALENTS_PRIEST } from 'common/TALENTS/priest';
import { Abelito75, Adoraci, acornellier, Khadaj, niseko, Zeboot, carglass, Hana, Vetyst, Litena, Squided } from 'CONTRIBUTORS';
import { SpellLink } from 'interface';

export default [
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
  change(date(2022, 8, 10), <>Implemented current version of <SpellLink id={TALENTS.BINDING_HEALS_TALENT.id}/>.</>, Vetyst),
  change(date(2022, 7, 19), <>Remove GCD trigger from <SpellLink id={SPELLS.FADE.id} />.</>, Vetyst),
  change(date(2022, 5, 19), <>Fixed Always be Healing.</>, Abelito75),
  change(date(2022, 5, 4), <>Implemented <SpellLink id={TALENTS.TRANSLUCENT_IMAGE_TALENT.id} /> damage reduction values.</>, Hana),
  change(date(2022, 3, 14), <>Fixed <b>ANY</b> crashing from the HarmoniousApparatus modules</>, Abelito75),
  change(date(2022, 3, 14), <>Fixed <b>ANY</b> crashing from the HolyWord modules</>, Abelito75),
  change(date(2021, 10, 1), <>Fixing Crash in Holy Priest Checklist</>, Khadaj),
  change(
    date(2021, 5, 28),
    <>
      Modified <SpellLink id={SPELLS.FLASH_CONCENTRATION.id} /> Analyzer to correctly take into
      account double procs of <SpellLink id={SPELLS.SURGE_OF_LIGHT_BUFF.id} /> usage
    </>,
    carglass,
  ),
  change(
    date(2021, 5, 26),
    <>
      Added <SpellLink id={SPELLS.FLASH_CONCENTRATION.id} /> Analysis, Statistics and Suggestions
    </>,
    carglass,
  ),
  change(
    date(2021, 4, 11),
    <>
      Updated <SpellLink id={SPELLS.GUARDIAN_FAERIE.id} /> damage reduction to 20% and corrected DR
      calculation.
    </>,
    Adoraci,
  ),
  change(
    date(2021, 3, 10),
    <>
      Updated <SpellLink id={SPELLS.DIVINE_HYMN_HEAL.id} /> appproxmiation
    </>,
    Khadaj,
  ),
  change(date(2021, 3, 3), <>Removed spreadsheet tab</>, acornellier),
  change(
    date(2021, 2, 26),
    <>
      Updating base mana value for <SpellLink id={TALENTS.ENLIGHTENMENT_TALENT.id} />.
    </>,
    Khadaj,
  ),
  change(
    date(2021, 1, 23),
    <>
      Added <SpellLink id={SPELLS.TWINS_OF_THE_SUN_PRIESTESS.id} /> legendary.
    </>,
    Adoraci,
  ),
  change(
    date(2020, 12, 28),
    <>
      Adding support for <SpellLink id={SPELLS.BOON_OF_THE_ASCENDED.id} />
    </>,
    Khadaj,
  ),
  change(
    date(2020, 12, 28),
    <>
      Adding support for <SpellLink id={TALENTS.MINDGAMES_TALENT.id} />
    </>,
    Khadaj,
  ),
  change(
    date(2020, 12, 28),
    <>
      Adding support for <SpellLink id={SPELLS.FAE_GUARDIANS.id} />
    </>,
    Khadaj,
  ),
  change(
    date(2020, 12, 28),
    <>
      Adding support for <SpellLink id={SPELLS.UNHOLY_NOVA.id} />
    </>,
    Khadaj,
  ),
  change(
    date(2020, 12, 21),
    <>
      Fixing bugs with <SpellLink id={SPELLS.HARMONIOUS_APPARATUS.id} /> and{' '}
      <SpellLink id={TALENTS.SURGE_OF_LIGHT_TALENT.id} />
    </>,
    Khadaj,
  ),
  change(
    date(2020, 12, 15),
    <>
      Adding card for <SpellLink id={SPELLS.DIVINE_IMAGE.id} />
    </>,
    Khadaj,
  ),
  change(
    date(2020, 12, 10),
    <>
      Adding card for <SpellLink id={SPELLS.HARMONIOUS_APPARATUS.id} />
    </>,
    Khadaj,
  ),
  change(
    date(2020, 12, 9),
    <>
      Adding <SpellLink id={TALENTS.RESONANT_WORDS_TALENT.id} /> module
    </>,
    Khadaj,
  ),
  change(date(2020, 12, 1), 'Updating Holy to 9.0.2', Khadaj),
  change(
    date(2020, 11, 30),
    <>
      Fixing a bug with <SpellLink id={TALENTS.PRAYER_OF_MENDING_TALENT.id} /> tracking
    </>,
    Khadaj,
  ),
  change(date(2020, 10, 18), 'Converted legacy listeners to new event filters', Zeboot),
  change(date(2020, 10, 2), `Removing Perseverance and adding BodyAndSoul.`, Khadaj),
  change(date(2020, 10, 1), `Making CoH baseline and adding Prayer Circle Talent.`, Khadaj),
  change(date(2020, 10, 1), `Removing Enduring Renewal and adding Renewed Faith.`, Khadaj),
  change(
    date(2020, 5, 1),
    `Fixed an issue with the stat weights module that caused Versatility to be undervalued.`,
    niseko,
  ),
  change(date(2019, 10, 25), <>Fixing Holy Nova bug.</>, Khadaj),
  change(date(2019, 10, 22), <>Adding holy priest stat weights module.</>, Khadaj),
  change(date(2019, 10, 20), <>Fixing echo of light crash.</>, Khadaj),
];
