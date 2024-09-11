import { change, date } from 'common/changelog';
import TALENTS from 'common/TALENTS/shaman';
import {
  Seriousnes,
} from 'CONTRIBUTORS';
import SpellLink from 'interface/SpellLink';

// prettier-ignore
export default [
  change(date(2024, 9, 3), <>Added hero tab for Stormbringer & <SpellLink spell={TALENTS.TEMPEST_TALENT} /></>, Seriousnes),
  change(date(2024, 7, 26), <>Initial update for The War Within.</>, Seriousnes),
];
