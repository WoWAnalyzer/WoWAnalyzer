import React from 'react';

import { Putro } from 'CONTRIBUTORS';
import SpellLink from 'common/SpellLink';
import SPELLS from 'common/SPELLS';

export default [
  {
    date: new Date('2018-09-20'),
    changes: <>Added two azerite trait modules, one for <SpellLink id={SPELLS.PRIMAL_INSTINCTS.id} /> and an initial version for <SpellLink id={SPELLS.FEEDING_FRENZY.id} /></>,
    contributors: [Putro],
  },
  {
    date: new Date('2018-08-12'),
    changes: <>Updated the <SpellLink id={SPELLS.BARBED_SHOT.id} /> statistic to be an expandable statistic box, to showcase uptime of 0->3 stacks separately.</>,
    contributors: [Putro],
  },
  {
    date: new Date('2018-08-12'),
    changes: 'Removed all legendaries and tier gear in preparation for Battle for Azeroth launch',
    contributors: [Putro],
  },
  {
    date: new Date('2018-08-06'),
    changes: <> Adds buff indicators to relevant spells in the timeline, adjusted placement of statistic boxes, added example logs to everything BFA related and added statistics for <SpellLink id={SPELLS.CHIMAERA_SHOT_TALENT.id} />, <SpellLink id={SPELLS.DIRE_BEAST_TALENT.id} />, <SpellLink id={SPELLS.KILLER_COBRA_TALENT.id} />, <SpellLink id={SPELLS.STAMPEDE_TALENT.id} /> and <SpellLink id={SPELLS.STOMP_TALENT.id} />. </>,
    contributors: [Putro],
  },
  {
    date: new Date('2018-07-26'),
    changes: <>Updated the BM module to 8.0.1, and added a <SpellLink id={SPELLS.BARBED_SHOT.id} /> statistic and acoompanying suggestions, also updated downtime module to be accurate with Aspect of the Wilds reduced GCD. </>,
    contributors: [Putro],
  },
];
