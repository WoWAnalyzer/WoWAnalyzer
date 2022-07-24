import { change, date } from 'common/changelog';
import SPELLS from 'common/SPELLS';
import { Elodiel, flurreN, LeoZhekov, ToppleTheNun } from 'CONTRIBUTORS';
import { SpellLink } from 'interface';

export default [
  change(
    date(2022, 7, 24),
    'Remove talents that were removed in BFA/Shadowlands prepatch.',
    ToppleTheNun,
  ),
  change(
    date(2022, 7, 24),
    <>
      Correct spelling of <SpellLink id={SPELLS.FEL_DEVASTATION_DAMAGE.id} />.
    </>,
    ToppleTheNun,
  ),
  change(
    date(2022, 7, 14),
    <>
      Add <SpellLink id={SPELLS.SINFUL_BRAND.id} /> uptime tracking and change{' '}
      <SpellLink id={SPELLS.SINFUL_BRAND.id} /> cast recommendation.
    </>,
    ToppleTheNun,
  ),
  change(
    date(2021, 9, 26),
    <>
      Fixed the issue, that the Analyzer would show 0 uses of{' '}
      <SpellLink id={SPELLS.ELYSIAN_DECREE.id} /> in the suggestions and statistics instead of the
      actual number of uses.
    </>,
    Elodiel,
  ),
  change(
    date(2021, 2, 2),
    <>
      Added <SpellLink id={SPELLS.FEL_DEFENDER.id} /> to Statistics
    </>,
    flurreN,
  ),
  change(
    date(2021, 1, 28),
    <>
      Added <SpellLink id={SPELLS.GROWING_INFERNO.id} /> to Statistics
    </>,
    flurreN,
  ),
  change(
    date(2021, 1, 18),
    <>
      Suggestions for <SpellLink id={SPELLS.DEMONIC_TALENT_HAVOC.id} />,{' '}
      <SpellLink id={SPELLS.BLADE_DANCE.id} /> and <SpellLink id={SPELLS.DEATH_SWEEP.id} /> have
      been updated
    </>,
    flurreN,
  ),
  change(
    date(2021, 1, 6),
    <>
      Added <SpellLink id={SPELLS.ELYSIAN_DECREE.id} /> to Statistics
    </>,
    flurreN,
  ),
  change(
    date(2020, 12, 30),
    <>
      Added <SpellLink id={SPELLS.SINFUL_BRAND.id} /> and <SpellLink id={SPELLS.THE_HUNT.id} /> to
      Statistics
    </>,
    flurreN,
  ),
  change(
    date(2020, 12, 29),
    <>
      Fixed bug where <SpellLink id={SPELLS.DEMONIC_TALENT_HAVOC.id} /> were causing errors
    </>,
    flurreN,
  ),
  change(
    date(2020, 12, 28),
    <>
      <SpellLink id={SPELLS.COLLECTIVE_ANGUISH.id} /> and <SpellLink id={SPELLS.CHAOS_THEORY.id} />{' '}
      is added to Statistics
    </>,
    flurreN,
  ),
  change(
    date(2020, 12, 28),
    <>
      <SpellLink id={SPELLS.FELBLADE_TALENT.id} /> is now shown correctly in timeline and more
      information added to Statistic box
    </>,
    flurreN,
  ),
  change(date(2020, 12, 28), 'Legendary, Covenant and Conduits added for Havoc', flurreN),
  change(
    date(2020, 12, 28),
    <>
      <SpellLink id={SPELLS.EYE_BEAM.id} /> is now showed correct in the Timeline.
    </>,
    flurreN,
  ),
  change(
    date(2020, 12, 28),
    <>
      Added support for <SpellLink id={SPELLS.GLAIVE_TEMPEST_TALENT.id} />{' '}
    </>,
    flurreN,
  ),
  change(
    date(2020, 12, 26),
    <>
      <SpellLink id={SPELLS.GLAIVE_TEMPEST_TALENT.id} /> have correct cd, and{' '}
      <SpellLink id={SPELLS.CYCLE_OF_HATRED_TALENT.id} /> is not reducing cooldown correctly on{' '}
      <SpellLink id={SPELLS.EYE_BEAM.id} />
    </>,
    flurreN,
  ),
  change(
    date(2020, 12, 26),
    <>
      <SpellLink id={SPELLS.NETHERWALK_TALENT.id} /> and <SpellLink id={SPELLS.DARKNESS.id} /> now
      have a correct gcd.
    </>,
    flurreN,
  ),
  change(date(2020, 12, 24), 'Updated CDs and baselines for SL', flurreN),
  change(date(2020, 12, 23), 'Updated spells and talents for SL', flurreN),
  change(
    date(2020, 10, 30),
    'Updated the deprecated StatisticBox elements with the new Statistic ones.',
    LeoZhekov,
  ),
];
