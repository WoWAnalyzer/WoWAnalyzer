import React from 'react';

import { Yajinni, Mamtooth, Torothin } from 'CONTRIBUTORS';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import { change, date } from 'common/changelog';

export default [
  change(date(2020, 3, 20), <>Added <SpellLink id={SPELLS.REVEL_IN_PAIN.id} /> azerite trait.</>, [Torothin]),
  change(date(2020, 3, 13), <>Added <SpellLink id={SPELLS.INFERNAL_ARMOR.id} /> azerite trait.</>, [Torothin]),
  change(date(2018, 11, 15), <>Improved tracking of <SpellLink id={SPELLS.FEED_THE_DEMON_TALENT.id} /> talent.</>, [Yajinni]),
  change(date(2018, 8, 5), <>Added stat box for <SpellLink id={SPELLS.FEED_THE_DEMON_TALENT.id} /> showing amount of CD reduction it provides.</>, [Yajinni]),
  change(date(2018, 8, 5), <>Added stat box for <SpellLink id={SPELLS.GLUTTONY_TALENT.id} /> showing number of procs.</>, [Yajinni]),
  change(date(2018, 8, 4), <>Big update to the checklist and suggestions threshholds to support it.</>, [Yajinni]),
  change(date(2018, 8, 3), <>Added stat box for <SpellLink id={SPELLS.AGONIZING_FLAMES_TALENT.id} /> to show the extra dps it provides.</>, [Yajinni]),
  change(date(2018, 8, 3), <><SpellLink id={SPELLS.THROW_GLAIVE.id} /> CD is now reduced by haste and being properly treated.</>, [Mamtooth]),
  change(date(2018, 8, 3), <>Removed <SpellLink id={SPELLS.DEMON_SPIKES.id} /> checklist and cast efficiency suggestion if <SpellLink id={SPELLS.FEED_THE_DEMON_TALENT.id} /> is selected. Each time a Soul Fragment is consumed, the Demon Spikes CD is reduced by 0.5s, so when this talent was chosen, it was breaking the CD tracker, usage suggestions (it was casted more than suggested casts) and timeline was warning about CD not properly treated.</>, [Mamtooth]),
  change(date(2018, 8, 3), <>Removed tier 20 suggestions and modules (ToS tier).</>, [Mamtooth]),
  change(date(2018, 8, 3), <>Added suggestion for <SpellLink id={SPELLS.VOID_REAVER_DEBUFF.id} /> and showed its uptime.</>, [Yajinni]),
  change(date(2018, 8, 1), <>Implemented Checklist feature.</>, [Mamtooth]),
  change(date(2018, 8, 1), <>Added suggestion for <SpellLink id={SPELLS.SOUL_CLEAVE.id} />.</>, [Yajinni]),
  change(date(2018, 7, 30), <>Updated code for <SpellLink id={SPELLS.FRACTURE_TALENT.id} /> to reflect it replaces <SpellLink id={SPELLS.SHEAR.id} />.</>, [Yajinni]),
  change(date(2018, 7, 29), <>Updated code for all sigils. They have different spell ids depending on if you take <SpellLink id={SPELLS.QUICKENED_SIGILS_TALENT.id} /> or <SpellLink id={SPELLS.CONCENTRATED_SIGILS_TALENT.id} />.</>, [Yajinni]),
  change(date(2018, 7, 28), <>Added module to show how many <SpellLink id={SPELLS.SPIRIT_BOMB_TALENT.id} /> casts were good.</>, [Yajinni]),
  change(date(2018, 7, 28), <>Added new spells and talents.</>, [Mamtooth]),
  change(date(2018, 7, 25), <>Reworked soul fragment tracking code to make it more versatile. Added a consumed souls module that shows how/what spells were used to consume souls.</>, [Yajinni]),
  change(date(2018, 7, 23), <>Updated the wasted soul fragments tracker. Its now sould fragments inefficienctly used and it's info is clearer.</>, [Yajinni]),
  change(date(2018, 7, 23), <>Added <SpellLink id={SPELLS.FRACTURE_TALENT.id} /> casts to suggestions.</>, [Yajinni]),
  change(date(2018, 7, 22), <>Reworked <SpellLink id={SPELLS.DEMON_SPIKES.id} /> module to show stats/suggestion based on the physical hits you mitgated instead of cast efficiency.</>, [Yajinni]),
  change(date(2018, 7, 21), <>Cleaned up spells and traits. Removed old/outdated ones and updated the changed ones. No longer crashes due to prepatch.</>, [Yajinni]),
];
