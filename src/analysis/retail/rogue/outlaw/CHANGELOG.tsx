import { change, date } from 'common/changelog';
import { Anty, zac } from 'CONTRIBUTORS';
import SpellLink from 'interface/SpellLink';
import TALENTS from 'common/TALENTS/rogue';
import SHARED_CHANGELOG from 'analysis/retail/rogue/shared/CHANGELOG';
import SPELLS from 'common/SPELLS';

export default [
  change(date(2023, 2, 22), <>Add Fan the hammer normalizer to ignore subsequents <SpellLink id={SPELLS.PISTOL_SHOT}/> fake casts events.</>, zac),
  change(date(2023, 2, 20), <>First implementation of <SpellLink id={TALENTS.AUDACITY_TALENT} />.</>, zac),
  change(date(2022,11, 3), <>Enabling Spec for Dragonflight.</>, Anty),
  ...SHARED_CHANGELOG,
];
