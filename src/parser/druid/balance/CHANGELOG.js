import React from 'react';

import { Gebuz, Abelito75, Wing5wong, Viridis, Vetyst } from 'CONTRIBUTORS';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import { change, date } from 'common/changelog';

export default [
  change(date(2020, 4, 13), <>Added statistics for <SpellLink id={SPELLS.ARCANIC_PULSAR_TRAIT.id} /> azerite trait.</>, [Vetyst]),
  change(date(2019, 8, 15), <>Fixed damage calculations for <SpellLink id={SPELLS.STREAKING_STARS.id} />.</>, [Viridis]),
  change(date(2019, 8, 13), <>Added tracking for <SpellLink id={SPELLS.STREAKING_STARS.id} />.</>, [Viridis]),
  change(date(2019, 8, 12), 'Fixed an incorrect spell name on the suggestions for Balance Druids when using Stellar Flare.', Wing5wong),
  change(date(2019, 4, 30), 'Added High Noon and Power of the Moon azerite pieces to the statistics tab.', [Abelito75]),
  change(date(2019, 4, 27), 'Added DawningSun azerite piece to the statistics tab.', [Abelito75]),
  change(date(2018, 8, 26), 'Updated the empowerment tracker to use the new log format for the buff.', [Gebuz]),
  change(date(2018, 6, 21), <>Removed Stellar Empowerment and added haste tracker for <SpellLink id={SPELLS.STARLORD_TALENT.id} /></>, [Gebuz]),
];
