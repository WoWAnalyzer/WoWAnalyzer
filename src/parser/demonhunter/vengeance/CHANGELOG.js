import React from 'react';

import { Yajinni, Mamtooth } from 'CONTRIBUTORS';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';

export default [
  {
    date: new Date('2018-08-5'),
    changes: <React.Fragment>Added stat box for <SpellLink id={SPELLS.FEED_THE_DEMON_TALENT.id} /> showing amount of CD reduction it provides.</React.Fragment>,
    contributors: [Yajinni],
  },
  {
    date: new Date('2018-08-5'),
    changes: <React.Fragment>Added stat box for <SpellLink id={SPELLS.GLUTTONY_TALENT.id} /> showing number of procs.</React.Fragment>,
    contributors: [Yajinni],
  },
  {
    date: new Date('2018-08-4'),
    changes: <React.Fragment>Big update to the checklist and suggestions threshholds to support it.</React.Fragment>,
    contributors: [Yajinni],
  },
  {
    date: new Date('2018-08-3'),
    changes: <React.Fragment>Added stat box for <SpellLink id={SPELLS.AGONIZING_FLAMES_TALENT.id} /> to show the extra dps it provides.</React.Fragment>,
    contributors: [Yajinni],
  },
  {
    date: new Date('2018-08-3'),
    changes: <React.Fragment><SpellLink id={SPELLS.THROW_GLAIVE.id} /> CD is now reduced by haste and being properly treated.</React.Fragment>,
    contributors: [Mamtooth],
  },
  {
    date: new Date('2018-08-3'),
    changes: <React.Fragment>Removed <SpellLink id={SPELLS.DEMON_SPIKES.id} /> checklist and cast efficiency suggestion if <SpellLink id={SPELLS.FEED_THE_DEMON_TALENT.id} /> is selected. Each time a Soul Fragment is consumed, the Demon Spikes CD is reduced by 0.5s, so when this talent was chosen, it was breaking the CD tracker, usage suggestions (it was casted more than suggested casts) and timeline was warning about CD not properly treated.</React.Fragment>,
    contributors: [Mamtooth],
  },
  {
    date: new Date('2018-08-3'),
    changes: <React.Fragment>Removed tier 20 suggestions and modules (ToS tier).</React.Fragment>,
    contributors: [Mamtooth],
  },
  {
    date: new Date('2018-08-3'),
    changes: <React.Fragment>Added suggestion for <SpellLink id={SPELLS.VOID_REAVER_DEBUFF.id} /> and showed its uptime.</React.Fragment>,
    contributors: [Yajinni],
  },
  {
    date: new Date('2018-08-01'),
    changes: <React.Fragment>Implemented Checklist feature.</React.Fragment>,
    contributors: [Mamtooth],
  },
  {
    date: new Date('2018-08-1'),
    changes: <React.Fragment>Added suggestion for <SpellLink id={SPELLS.SOUL_CLEAVE.id} />.</React.Fragment>,
    contributors: [Yajinni],
  },
  {
    date: new Date('2018-07-30'),
    changes: <React.Fragment>Updated code for <SpellLink id={SPELLS.FRACTURE_TALENT.id} /> to reflect it replaces <SpellLink id={SPELLS.SHEAR.id} />.</React.Fragment>,
    contributors: [Yajinni],
  },
  {
    date: new Date('2018-07-29'),
    changes: <React.Fragment>Updated code for all sigils. They have different spell ids depending on if you take <SpellLink id={SPELLS.QUICKENED_SIGILS_TALENT.id} /> or <SpellLink id={SPELLS.CONCENTRATED_SIGILS_TALENT.id} />.</React.Fragment>,
    contributors: [Yajinni],
  },
  {
    date: new Date('2018-07-28'),
    changes: <React.Fragment>Added module to show how many <SpellLink id={SPELLS.SPIRIT_BOMB_TALENT.id} /> casts were good.</React.Fragment>,
    contributors: [Yajinni],
  },
  {
    date: new Date('2018-07-28'),
    changes: <React.Fragment>Added new spells and talents.</React.Fragment>,
    contributors: [Mamtooth],
  },
  {
    date: new Date('2018-07-25'),
    changes: <React.Fragment>Reworked soul fragment tracking code to make it more versatile. Added a consumed souls module that shows how/what spells were used to consume souls.</React.Fragment>,
    contributors: [Yajinni],
  },
  {
    date: new Date('2018-07-23'),
    changes: <React.Fragment>Updated the wasted soul fragments tracker. Its now sould fragments inefficienctly used and it's info is clearer.</React.Fragment>,
    contributors: [Yajinni],
  },
  {
    date: new Date('2018-07-23'),
    changes: <React.Fragment>Added <SpellLink id={SPELLS.FRACTURE_TALENT.id} /> casts to suggestions.</React.Fragment>,
    contributors: [Yajinni],
  },
  {
    date: new Date('2018-07-22'),
    changes: <React.Fragment>Reworked <SpellLink id={SPELLS.DEMON_SPIKES.id} /> module to show stats/suggestion based on the physical hits you mitgated instead of cast efficiency.</React.Fragment>,
    contributors: [Yajinni],
  },
  {
    date: new Date('2018-07-21'),
    changes: <React.Fragment>Cleaned up spells and traits. Removed old/outdated ones and updated the changed ones. No longer crashes due to prepatch.</React.Fragment>,
    contributors: [Yajinni],
  },
];
