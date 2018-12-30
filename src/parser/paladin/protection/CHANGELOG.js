import React from 'react';
import { emallson } from 'CONTRIBUTORS';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';

export default [
  {
    date: new Date('29 December 2018'),
    contributors: [emallson],
    changes: <>Moved <SpellLink id={SPELLS.ARDENT_DEFENDER.id} /> to the damage mitigation checklist item. Removed the "Use your defensive cooldowns" checklist item.</>,
  },
  {
    date: new Date('11 November 2018'),
    contributors: [emallson],
    changes: <>Added <SpellLink id={SPELLS.LIGHT_OF_THE_PROTECTOR.id} /> / <SpellLink id={SPELLS.HAND_OF_THE_PROTECTOR_TALENT.id} /> delay and overheal tracking.</>,
  },
  {
    date: new Date('30 October 2018'),
    contributors: [emallson],
    changes: <>Added <SpellLink id={SPELLS.SHIELD_OF_THE_RIGHTEOUS.id} /> cooldown reduction statistic.</>,
  },
  {
    date: new Date('28 October 2018'),
    contributors: [emallson],
    changes: <>Converted <SpellLink id={SPELLS.CONSECRATION_CAST.id} /> from buff uptime to hit tracking.</>,
  },
  {
    date: new Date('10 October 2018'),
    contributors: [emallson],
    changes: <>Added tracking for which <SpellLink id={SPELLS.SHIELD_OF_THE_RIGHTEOUS.id} /> casts are effective.</>,
  },
  {
    date: new Date('6 October 2018'),
    contributors: [emallson],
    changes: <>Added support for <SpellLink id={SPELLS.INSPIRING_VANGUARD.id} />, including the ability to exactly detect <SpellLink id={SPELLS.GRAND_CRUSADER.id} /> resets when this trait is taken.</>,
  },
];
