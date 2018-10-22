import React from 'react';

import { Yajinni, Mamtooth } from 'CONTRIBUTORS';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';

export default [
  {
    date: new Date('2018-08-5'),
    changes: <>Added stat box for <SpellLink id={SPELLS.FEED_THE_DEMON_TALENT.id} /> showing amount of CD reduction it provides.</>,
    contributors: [Yajinni],
    clIndex: 'Vengeance20180805.2',
  },
  {
    date: new Date('2018-08-5'),
    changes: <>Added stat box for <SpellLink id={SPELLS.GLUTTONY_TALENT.id} /> showing number of procs.</>,
    contributors: [Yajinni],
    clIndex: 'Vengeance20180805.1',
  },
  {
    date: new Date('2018-08-4'),
    changes: <>Big update to the checklist and suggestions threshholds to support it.</>,
    contributors: [Yajinni],
    clIndex: 'Vengeance20180804.1',
  },
  {
    date: new Date('2018-08-3'),
    changes: <>Added stat box for <SpellLink id={SPELLS.AGONIZING_FLAMES_TALENT.id} /> to show the extra dps it provides.</>,
    contributors: [Yajinni],
    clIndex: 'Vengeance20180803.5',
  },
  {
    date: new Date('2018-08-3'),
    changes: <><SpellLink id={SPELLS.THROW_GLAIVE.id} /> CD is now reduced by haste and being properly treated.</>,
    contributors: [Mamtooth],
    clIndex: 'Vengeance20180804.4',
  },
  {
    date: new Date('2018-08-3'),
    changes: <>Removed <SpellLink id={SPELLS.DEMON_SPIKES.id} /> checklist and cast efficiency suggestion if <SpellLink id={SPELLS.FEED_THE_DEMON_TALENT.id} /> is selected. Each time a Soul Fragment is consumed, the Demon Spikes CD is reduced by 0.5s, so when this talent was chosen, it was breaking the CD tracker, usage suggestions (it was casted more than suggested casts) and timeline was warning about CD not properly treated.</>,
    contributors: [Mamtooth],
    clIndex: 'Vengeance20180803.3',
  },
  {
    date: new Date('2018-08-3'),
    changes: <>Removed tier 20 suggestions and modules (ToS tier).</>,
    contributors: [Mamtooth],
    clIndex: 'Vengeance20180803.2',
  },
  {
    date: new Date('2018-08-3'),
    changes: <>Added suggestion for <SpellLink id={SPELLS.VOID_REAVER_DEBUFF.id} /> and showed its uptime.</>,
    contributors: [Yajinni],
    clIndex: 'Vengeance20180803.1',
  },
  {
    date: new Date('2018-08-01'),
    changes: <>Implemented Checklist feature.</>,
    contributors: [Mamtooth],
    clIndex: 'Vengeance20180801.1',
  },
  {
    date: new Date('2018-08-1'),
    changes: <>Added suggestion for <SpellLink id={SPELLS.SOUL_CLEAVE.id} />.</>,
    contributors: [Yajinni],
    clIndex: 'Vengeance20180801.1',
  },
  {
    date: new Date('2018-07-30'),
    changes: <>Updated code for <SpellLink id={SPELLS.FRACTURE_TALENT.id} /> to reflect it replaces <SpellLink id={SPELLS.SHEAR.id} />.</>,
    contributors: [Yajinni],
    clIndex: 'Vengeance20180730.1',
  },
  {
    date: new Date('2018-07-29'),
    changes: <>Updated code for all sigils. They have different spell ids depending on if you take <SpellLink id={SPELLS.QUICKENED_SIGILS_TALENT.id} /> or <SpellLink id={SPELLS.CONCENTRATED_SIGILS_TALENT.id} />.</>,
    contributors: [Yajinni],
    clIndex: 'Vengeance20180729.1',
  },
  {
    date: new Date('2018-07-28'),
    changes: <>Added module to show how many <SpellLink id={SPELLS.SPIRIT_BOMB_TALENT.id} /> casts were good.</>,
    contributors: [Yajinni],
    clIndex: 'Vengeance20180728.2',
  },
  {
    date: new Date('2018-07-28'),
    changes: <>Added new spells and talents.</>,
    contributors: [Mamtooth],
    clIndex: 'Vengeance20180728.1',
  },
  {
    date: new Date('2018-07-25'),
    changes: <>Reworked soul fragment tracking code to make it more versatile. Added a consumed souls module that shows how/what spells were used to consume souls.</>,
    contributors: [Yajinni],
    clIndex: 'Vengeance20180725.1',
  },
  {
    date: new Date('2018-07-23'),
    changes: <>Updated the wasted soul fragments tracker. Its now sould fragments inefficienctly used and it's info is clearer.</>,
    contributors: [Yajinni],
    clIndex: 'Vengeance20180721.2',
  },
  {
    date: new Date('2018-07-23'),
    changes: <>Added <SpellLink id={SPELLS.FRACTURE_TALENT.id} /> casts to suggestions.</>,
    contributors: [Yajinni],
    clIndex: 'Vengeance20180723.1',
  },
  {
    date: new Date('2018-07-22'),
    changes: <>Reworked <SpellLink id={SPELLS.DEMON_SPIKES.id} /> module to show stats/suggestion based on the physical hits you mitgated instead of cast efficiency.</>,
    contributors: [Yajinni],
    clIndex: 'Vengeance20180722.1',
  },
  {
    date: new Date('2018-07-21'),
    changes: <>Cleaned up spells and traits. Removed old/outdated ones and updated the changed ones. No longer crashes due to prepatch.</>,
    contributors: [Yajinni],
    clIndex: 'Vengeance20180721.1',
  },
];
