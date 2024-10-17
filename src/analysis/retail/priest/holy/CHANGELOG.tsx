import { change, date } from 'common/changelog';
import SPELLS from 'common/SPELLS';
import TALENTS, { TALENTS_PRIEST } from 'common/TALENTS/priest';
import { Arlie, Hana, Litena, Liavre, Squided, ToppleTheNun, Trevor, Saeldur, xizbow, fel1ne} from 'CONTRIBUTORS';
import { SpellLink } from 'interface';

export default [
  change(date(2024, 10, 17), <>Fixed an issue where <SpellLink spell={SPELLS.LIGHTWEAVER_TALENT_BUFF}/> buffed heals were incorrectly flagged as a bad cast if the buff was not consumed due to a bug. </>, fel1ne),
  change(date(2024, 10, 11), <>Fixed Prayer of Healing in the Guide section to not give bad advice.</>, Liavre),
  change(date(2024, 10, 7), <>Properly hide Circle of Healing analysis if it isn't talented.</>, xizbow),
  change(date(2024, 9, 21), <>Changed tooltips, added crisis management, and added prismatic echoes </>, Liavre),
  change(date(2024, 9, 16), <>Implemented TWW S1 4pc </>, Liavre),
  change(date(2024, 9, 11), <>Split Divine Hymn/GS into proper attributions, fixed mana costs,
  and added talent check on holy word CDR. </>, Liavre),
  change(date(2024, 9, 11), <>Fixed Salvation, Divine Star, Halo to include absorbed healing as effective healing. </>, Liavre),
  change(date(2024, 9, 10), <>Added cast number and minor fixes to CDR module. </>, Liavre),
  change(date(2024, 9, 10), <>Fixed lightwell and trail modules </>, Liavre),
  change(date(2024, 9, 9), <>Implemented Echo of Light module/attribution into every other module </>, Liavre),
  change(date(2024, 9, 6), <>Implemented 2pc, rewrote back end for Holy Word CDR and remove old modules. </>, Liavre),
  change(date(2024, 9, 6), <>Moved all spell constants to constants file for ease of maintenance </>, Liavre),
  change(date(2024, 8, 31), <>Implemented an Echo of Light per heal/amp attributor </>, Liavre),
  change(date(2024, 8, 20), <>Implemented/pushed Archon </>, Liavre),
  change(date(2024, 8, 24), <>Added Cast time hps component to lightweaver and other statistic display improvements </>, Liavre),
  change(date(2024, 8, 20), <>Implemented both Oracle and Archon + minor fixes </>, Liavre),
  change(date(2024, 8, 13), <>Deleted references to Mindgames (old talent) </>, Liavre),
  change(date(2024, 4, 20), <>Fix cooldown of <SpellLink spell={SPELLS.DESPERATE_PRAYER} /> when using <SpellLink spell={TALENTS_PRIEST.ANGELS_MERCY_TALENT} />.</>, Arlie),
  change(
    date(2024, 4, 18),
    <>
      Partially updated for patch 10.2.6. Implementation still may be lacking. {' '}
      Update <SpellLink spell={TALENTS_PRIEST.PONTIFEX_TALENT} />, {' '}
      Implement <SpellLink spell={TALENTS_PRIEST.LIGHTWELL_TALENT} />, {' '}
      Update <SpellLink spell={TALENTS_PRIEST.HOLY_WORD_SALVATION_TALENT} /> to better claim Renew healing, {' '}
      Update <SpellLink spell={TALENTS_PRIEST.BENEVOLENCE_TALENT} /> to better claim Renew healing, {' '}
      Update <SpellLink spell={TALENTS_PRIEST.RESONANT_WORDS_TALENT} />, {' '}
      Update <SpellLink spell={TALENTS_PRIEST.DIVINE_WORD_TALENT} />, {' '}
      Update <SpellLink spell={TALENTS_PRIEST.HEALING_CHORUS_TALENT} />, and{' '}
      Update <SpellLink spell={TALENTS_PRIEST.PRAYERFUL_LITANY_TALENT} />
    </>,
    Saeldur,
  ),
  change(date(2023, 8, 1), <>Add <SpellLink spell={TALENTS_PRIEST.BENEVOLENCE_TALENT}/></>, Hana),
  change(date(2023, 7, 3), 'Update SpellLink usage.', ToppleTheNun),
  change(date(2023, 5, 11), <>Fix crash in Holy Priest T30 module</>, Trevor),
  change(date(2023, 4, 26), <>Restyle Surge of Light and import it for Discipline</>, Hana),
  change(date(2023, 4, 20), <>Add support for Aberrus, the Shadowed Crucible tier set.</>, Squided),
  change(
    date(2023, 3, 27),
    <>
      Fix bugs in <SpellLink spell={TALENTS_PRIEST.DIVINE_IMAGE_TALENT} /> and{' '}
      <SpellLink spell={TALENTS_PRIEST.ENLIGHTENMENT_TALENT} />t modules.
    </>,
    Squided,
  ),
  change(
    date(2023, 3, 21),
    <>
      Updated for patch 10.0.7. Temporarily disabled{' '}
      <SpellLink spell={TALENTS_PRIEST.DIVINE_IMAGE_TALENT} /> module due to combat log issues. Fix{' '}
      <SpellLink spell={TALENTS_PRIEST.DIVINE_WORD_TALENT} /> module.
    </>,
    Squided,
  ),
  change(date(2023, 1, 24), <>Updated for patch 10.0.5.</>, Squided),
  change(
    date(2023, 1, 24),
    <>
      Added support for <SpellLink spell={TALENTS_PRIEST.PRAYERFUL_LITANY_TALENT} />.{' '}
    </>,
    Squided,
  ),
  change(date(2022, 12, 18), <>Added initial holy priest guide for 10.0.</>, Squided),
  change(
    date(2022, 11, 28),
    <>
      Added support for <SpellLink spell={TALENTS_PRIEST.PONTIFEX_TALENT} />,{' '}
      Rapid Recovery,{' '}
      Empowered Renew, and{' '}
      <SpellLink spell={TALENTS_PRIEST.MIRACLE_WORKER_TALENT} />.
    </>,
    Squided,
  ),
  change(
    date(2022, 11, 26),
    <>
      Updated <SpellLink spell={TALENTS.DIVINE_WORD_TALENT} /> to new hotfix value.
    </>,
    Litena,
  ),
  change(
    date(2022, 11, 10),
    <>
      Added support for
      <SpellLink spell={TALENTS_PRIEST.SANCTIFIED_PRAYERS_TALENT} />,{' '}
      <SpellLink spell={TALENTS_PRIEST.EVERLASTING_LIGHT_TALENT} />, and{' '}
      <SpellLink spell={TALENTS_PRIEST.BURNING_VEHEMENCE_TALENT} />.
    </>,
    Squided,
  ),
  change(
    date(2022, 11, 7),
    <>
      <SpellLink spell={TALENTS_PRIEST.PROTECTIVE_LIGHT_TALENT} /> support added.
    </>,
    Hana,
  ),
  change(
    date(2022, 11, 3),
    <>
      Added support for <SpellLink spell={TALENTS.DIVINE_WORD_TALENT} /> and Searing Light.
    </>,
    Litena,
  ),
  change(
    date(2022, 10, 22),
    <>
      Updated 'Mana efficiency tab' and added support for{' '}
      <SpellLink spell={TALENTS.REVITALIZING_PRAYERS_TALENT} />.
    </>,
    Litena,
  ),
  change(date(2022, 10, 15), <> Implemented current version of tier. </>, Litena),
  change(
    date(2022, 10, 12),
    <>
      Cooldown view now shows <SpellLink spell={TALENTS.HOLY_WORD_SALVATION_TALENT} /> and{' '}
      <SpellLink spell={TALENTS.APOTHEOSIS_TALENT} /> also added support for{' '}
      <SpellLink spell={TALENTS.HEALING_CHORUS_TALENT} />.
    </>,
    Litena,
  ),
  change(
    date(2022, 10, 12),
    <>
      {' '}
      Updated holy word functionality for Dragonflight and added support for{' '}
      <SpellLink spell={TALENTS.LIGHTWEAVER_TALENT} />.{' '}
    </>,
    Litena,
  ),
  change(
    date(2022, 10, 9),
    <>
      {' '}
      New talent file structure and support for <SpellLink
        spell={TALENTS.DESPERATE_TIMES_TALENT}
      />{' '}
      and <SpellLink spell={TALENTS.ANSWERED_PRAYERS_TALENT} />.{' '}
    </>,
    Litena,
  ),
  change(date(2022, 10, 7), <> Updated for Dragonflight although not feature complete. </>, Litena),
];
