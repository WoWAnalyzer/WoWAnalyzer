import React from 'react';

import { Yajinni, Zeboot, LeoZhekov, TurianSniper, Geeii } from 'CONTRIBUTORS';
import { change, date } from 'common/changelog';
import SpellLink from 'common/SpellLink';
import SPELLS from 'common/SPELLS';

export default [
  change(date(2021, 1, 10), <> Added tracking of wasted soul generation by <SpellLink id={SPELLS.FRACTURE_TALENT.id} /> / <SpellLink id={SPELLS.SHEAR.id} />. Added to suggestions and checklist. </>, Yajinni),
  change(date(2021, 1, 10), <> Updated <SpellLink id={SPELLS.ELYSIAN_DECREE.id} /> to take into accoun the conduit <SpellLink id={SPELLS.REPEAT_DECREE.id} />.</>, Yajinni),
  change(date(2020, 12, 28), 'Updated Demonic Spikes, implemented Infernal Strikes (but disabling due to blizzard bug)', Geeii),
  change(date(2020, 12, 27), 'Updated to use Fury resource, instead of outdated Pain. Updated Soul Cleave reporting, updated ability tracking for Sigil of Flame for some cases', Geeii),
  change(date(2020, 12, 27), 'Initial SL update for talent changes and covenant abilities', TurianSniper),
  change(date(2020, 10, 30), 'Replaced the deprecated StatisticBox with the new Statistic', LeoZhekov),
  change(date(2020, 10, 18), 'Converted legacy listeners to new event filters', Zeboot),
];