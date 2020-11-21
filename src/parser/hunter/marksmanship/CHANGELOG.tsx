import { Putro, Zeboot } from 'CONTRIBUTORS';
import { change, date } from 'common/changelog';
import React from 'react';
import SpellLink from 'common/SpellLink';
import SPELLS from 'common/SPELLS';

export default [
  change(date(2020, 11, 7), <> Added support for the four Marksmanship specific legendaries <SpellLink id={SPELLS.SERPENTSTALKERS_TRICKERY_EFFECT.id} />, <SpellLink id={SPELLS.SURGING_SHOTS_EFFECT.id} />, <SpellLink id={SPELLS.SECRETS_OF_THE_UNBLINKING_VIGIL_EFFECT.id} />, and <SpellLink id={SPELLS.EAGLETALONS_TRUE_FOCUS_EFFECT.id} />.</>, Putro),
  change(date(2020, 10, 18), 'Moved catchall event listeners to new filter', Zeboot),
  change(date(2020, 10, 13), 'Updated all Marksmanship modules for Shadowlands prepatch as well as adding a checklist', Putro),
];
