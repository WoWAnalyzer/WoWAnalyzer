import { change, date } from 'common/changelog';
import TALENTS from 'common/TALENTS/shaman';
import {
  Seriousnes,
} from 'CONTRIBUTORS';
import SpellLink from 'interface/SpellLink';

// prettier-ignore
export default [
  change(date(2024, 9, 14), <>Updating <SpellLink spell={TALENTS.STORMKEEPER_TALENT} /> and spender window analysis, added support for <SpellLink spell={TALENTS.FLASH_OF_LIGHTNING_TALENT} /> </>, Seriousnes),
  change(date(2024, 9, 12), <><SpellLink spell={TALENTS.TEMPEST_TALENT} /> now stacks up to 2 times</>, Seriousnes),
  change(date(2024, 9, 3), <>Added hero tab for Stormbringer & <SpellLink spell={TALENTS.TEMPEST_TALENT} /></>, Seriousnes),
  change(date(2024, 7, 26), <>Initial update for The War Within.</>, Seriousnes),
];
