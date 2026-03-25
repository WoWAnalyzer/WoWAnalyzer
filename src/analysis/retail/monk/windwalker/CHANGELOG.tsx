import { change, date } from 'common/changelog';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/monk';
import { Durpn } from 'CONTRIBUTORS';
import SpellLink from 'interface/SpellLink';

export default [
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
