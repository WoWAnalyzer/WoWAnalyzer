import { change, date } from 'common/changelog';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/monk';
import { Durpn, swirl, TastyArsenic } from 'CONTRIBUTORS';
import SpellLink from 'interface/SpellLink';

export default [
  change(
    date(2026, 9, 3),
    <>
      <SpellLink spell={TALENTS.ZENITH_STOMP_TALENT} /> is no longer suggested in the Shado-Pan APL
      unless <SpellLink spell={TALENTS.TIGEREYE_BREW_3_WINDWALKER_TALENT} /> is talented.
    </>,
    TastyArsenic,
  ),
  change(
    date(2026, 7, 22),
    <>
      Updated Shado-Pan and Conduit of the Celestials APL priorities for{' '}
      <SpellLink spell={TALENTS.WHIRLING_DRAGON_PUNCH_TALENT} />,{' '}
      <SpellLink spell={TALENTS.ZENITH_STOMP_TALENT} />, and{' '}
      <SpellLink spell={SPELLS.FISTS_OF_FURY_CAST} />, including Bloodlust-aware energy capping and
      <SpellLink spell={TALENTS.HARMONIC_COMBO_TALENT} /> Chi costs.
    </>,
    Durpn,
  ),
  change(
    date(2026, 6, 29), 
    <>
      Added <SpellLink spell={TALENTS.SAVE_THEM_ALL_TALENT} /> module.
    </>,
    swirl,
  ),
  change(
    date(2026, 5, 10),
    <>
      Added <SpellLink spell={TALENTS.ZENITH_STOMP_TALENT} /> to tracked rotational abilities and
      updated Windwalker patch compatibility to `12.0.5`.
    </>,
    Durpn,
  ),
  change(
    date(2026, 4, 30),
    <>
      Updated <SpellLink spell={TALENTS.ZENITH_TALENT} /> cooldown handling to a 90-second base
      cooldown with <SpellLink spell={TALENTS.EFFICIENT_TRAINING_TALENT} /> reducing it by 10
      seconds and <SpellLink spell={TALENTS.SPIRITUAL_FOCUS_TALENT} /> reducing it by 20 seconds,
      and removed the <SpellLink spell={TALENTS.ZENITH_STOMP_TALENT} /> Chi gain/waste breakdown
      from Zenith guide and statistic output pending further investigation.
    </>,
    Durpn,
  ),
  change(
    date(2026, 4, 12),
    <>
      Gated <SpellLink spell={SPELLS.RUSHING_WIND_KICK_CAST} /> priority and chi reservation on
      the proc buff actually being active in both Windwalker hero-spec APLs, and expanded the{' '}
      <SpellLink spell={SPELLS.FISTS_OF_FURY_CAST} /> guide to call out how{' '}
      <SpellLink spell={TALENTS.MOMENTUM_BOOST_TALENT} /> makes late ticks especially valuable.
    </>,
    Durpn,
  ),
  change(
    date(2026, 4, 3),
    <>
      Fixed cooldown availability for{' '}
      <SpellLink spell={TALENTS.WHIRLING_DRAGON_PUNCH_TALENT} />,{' '}
      <SpellLink spell={TALENTS.STRIKE_OF_THE_WINDLORD_TALENT} />,{' '}
      <SpellLink spell={SPELLS.FISTS_OF_FURY_CAST} />,{' '}
      <SpellLink spell={TALENTS.RISING_SUN_KICK_TALENT} />, and{' '}
      <SpellLink spell={TALENTS.ZENITH_TALENT} /> by correcting Midnight
      Season 1 set and <SpellLink spell={TALENTS.COMMUNION_WITH_WIND_TALENT} />{' '}
      cooldown updates, adding missing haste sources, counting{' '}
      <SpellLink spell={SPELLS.RUSHING_WIND_KICK_CAST} /> crits for{' '}
      <SpellLink spell={TALENTS.XUENS_BATTLEGEAR_TALENT} />, and inferring
      hidden <SpellLink spell={SPELLS.TEACHINGS_OF_THE_MONASTERY} />{' '}
      bonus-strike cooldown reduction.
    </>,
    Durpn,
  ),
  change(
    date(2026, 3, 29),
    <>
      Updated Windwalker statistics for current talents and cooldowns: fixed{' '}
      <SpellLink spell={SPELLS.FISTS_OF_FURY_CAST} /> tick handling for{' '}
      <SpellLink spell={TALENTS.CRASHING_FISTS_TALENT} />, added{' '}
      <SpellLink spell={TALENTS.GLORY_OF_THE_DAWN_TALENT} /> tracking, updated{' '}
      <SpellLink spell={TALENTS.XUENS_BATTLEGEAR_TALENT} /> cooldown reduction handling, and
      cleaned obsolete statistics and cooldown entries.
    </>,
    Durpn,
  ),
  change(
    date(2026, 3, 21),
    <>
      Reworked <SpellLink spell={SPELLS.COMBO_BREAKER_BUFF} />,{' '}
      <SpellLink spell={SPELLS.DANCE_OF_CHI_JI_BUFF} />, and{' '}
      <SpellLink spell={SPELLS.RUSHING_WIND_KICK_BUFF} /> into shared APL-based proc timing
      analysis, updated the Shado-Pan priority handling around{' '}
      <SpellLink spell={SPELLS.BLACKOUT_KICK} />, and fixed{' '}
      <SpellLink spell={SPELLS.FISTS_OF_FURY_CAST} /> clip analysis for{' '}
      <SpellLink spell={TALENTS.CRASHING_FISTS_TALENT} />.
    </>,
    Durpn,
  ),
  change(
    date(2026, 3, 10),
    'Add Zenith talent analysis/guide stats, gate Invoke Xuen, and add a Windwalker guide preface',
    Durpn,
  ),
  change(
    date(2026, 3, 6),
    <>
      Updated Windwalker priority recommendations, improved{' '}
      <SpellLink spell={SPELLS.COMBO_STRIKES} /> validation, and expanded the rotation guide for{' '}
      <SpellLink spell={TALENTS.INVOKE_XUEN_THE_WHITE_TIGER_TALENT} /> and{' '}
      <SpellLink spell={TALENTS.ZENITH_TALENT} /> windows.
    </>,
    Durpn,
  ),
  change(date(2026, 1, 28), 'Initial Midnight Integration, drop all old talents', Durpn),
];
