import { change, date } from 'common/changelog';
import SPELLS from 'common/SPELLS';
import { Kettlepaw, Zeboot, g3neral, Tiboonn, Buudha, Sref } from 'CONTRIBUTORS';
import { SpellLink } from 'interface';
import React from 'react';

export default [
  change(date(2021, 7, 22), <>Fixed an issue causing the <SpellLink id={SPELLS.CONVOKE_SPIRITS.id} /> to crash.</>, Sref),
  change(date(2021, 7, 2), <>Add a basic statistic box for <SpellLink id={SPELLS.CONVOKE_SPIRITS.id} /></>, Kettlepaw),
  change(date(2021, 5, 15), <>Improved cast detection for <SpellLink id={SPELLS.CONVOKE_SPIRITS.id} /></>, Sref),
  change(date(2021, 4, 10), 'Updated class syntax to re-enable AntiFillerSpam info', Kettlepaw),
  change(date(2021, 4, 7), 'Correct reporting for Earthwarden absorb events', Kettlepaw),
  change(date(2021, 3, 25), 'Added basic checklist section to be expanded on, and upgraded touched files to Typescript', Buudha),
  change(date(2021, 2, 20), 'Updated the Stats page to use the new Statistics modules', Buudha),
  change(date(2021, 2, 20), 'Added spell info for conduits, Venthyr soulbind\'s and some Kyrain SB\'s as well as legendary data', Buudha),
  change(date(2021, 1, 16), 'Added spell information for conduits', Tiboonn),
  change(date(2020, 12, 21), 'Ironfur GCD and cooldown values', g3neral),
  change(date(2020, 12, 18), 'Fixed compiler errors affecting FrenziedRegen and AntiFillerSpam', Kettlepaw),
  change(date(2020, 10, 18), 'Converted legacy listeners to new event filters', Zeboot),
];
