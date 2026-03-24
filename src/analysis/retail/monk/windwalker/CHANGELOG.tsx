import { change, date } from 'common/changelog';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/monk';
import { Durpn } from 'CONTRIBUTORS';
import SpellLink from 'interface/SpellLink';

export default [
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
