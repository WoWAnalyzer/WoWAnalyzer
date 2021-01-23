import React from 'react';

import { Tyndi, Zeboot, Putro, Hordehobbs } from 'CONTRIBUTORS';
import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import { change, date } from 'common/changelog';

export default [
  change(date(2021, 1, 23), "Add GeneratorFollowingVanish analyzer.", Hordehobbs),
  change(date(2021, 1, 23), "Update CastsInShadowDance analyzer for proper value of max possible casts.", Hordehobbs),
  change(date(2021, 1, 23), <>Remove <SpellLink id={SPELLS.VANISH.id} /> as an offensive CD from checklist. </>, Hordehobbs),
  change(date(2021, 1, 23), "Update DeepeningShadows analyzer for new CDR values.", Hordehobbs),
  change(date(2020, 12, 27), <>Added analyzer for tracking <SpellLink id={SPELLS.VANISH.id} /> usage in conjunction with refreshing <SpellLink id={SPELLS.FIND_WEAKNESS.id} />. </>, Hordehobbs),
  change(date(2020, 12, 21), 'Minor update to suggestions', Tyndi),
  change(date(2020, 12, 18), <> Fixed an issue where the analyzer couldn't reduce the cooldown of <SpellLink id={SPELLS.SERRATED_BONE_SPIKE.id} />. </>, Putro),
  change(date(2020, 10, 27), 'Converted modules to TypeScript; Updated Statistic Boxes', Tyndi),
  change(date(2020, 10, 20), <>Added <SpellLink id={SPELLS.INVIGORATING_SHADOWDUST.id} /> Legendary</>, Tyndi),
  change(date(2020, 10, 19), <>Added <SpellLink id={SPELLS.ESSENCE_OF_BLOODFANG.id} /> Legendary</>, Tyndi),
  change(date(2020, 10, 18), 'Converted legacy listeners to new event filters', Zeboot),
  change(date(2020, 10, 16), <>Added <SpellLink id={SPELLS.THE_ROTTEN.id} /> Legendary. And Removed Nightblade.</>, Tyndi),
  change(date(2020, 10, 2), 'Added Akaari\'s Soul Fragment Legendary', Tyndi),
];
