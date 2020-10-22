// eslint-disable-next-line no-unused-vars
import React from 'react';

import { Khazak } from 'CONTRIBUTORS';
import { change, date } from 'common/changelog';
import SPELLS from 'common/SPELLS'
import SpellLink from 'common/SpellLink';

export default [
  change(date(2020, 10, 13), <>Updated  <SpellLink id={SPELLS.FESTERING_WOUND.id} /> tracking to be more accurate for <SpellLink id={SPELLS.SCOURGE_STRIKE.id}/> and <SpellLink id={SPELLS.FESTERING_STRIKE.id} /> modules</>, [Khazak]),
  change(date(2020, 10, 11), 'Converted modules to Typescript', [Khazak]),
  change(date(2020, 8, 4), 'Behind the scenes clean up to prep for better support in Shadowlands', [Khazak]),
  change(date(2018, 8, 30), 'Removed Legion modules and updated basic analysis for BFA', [Khazak]),
];
