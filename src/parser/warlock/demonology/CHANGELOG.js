import React from 'react';

import { Chizu } from 'CONTRIBUTORS';
import SpellLink from 'common/SpellLink';
import SPELLS from 'common/SPELLS';

export default [
  {
    date: new Date('2018-12-23'),
    changes: <>Added support for <SpellLink id={SPELLS.BALEFUL_INVOCATION.id} /> trait. Also fixed <SpellLink id={SPELLS.DEMONBOLT.id} /> icon in Soul Shard tab. </>,
    contributors: [Chizu],
  },
  {
    date: new Date('2018-12-23'),
    changes: 'Changed display of damage in various places. Now shows % of total damage done and DPS with raw values in tooltip.',
    contributors: [Chizu],
  },
  {
    date: new Date('2018-12-10'),
    changes: 'Updated for patch 8.1 changes.',
    contributors: [Chizu],
  },
  {
    date: new Date('2018-11-23'),
    changes: <>Fixed <SpellLink id={SPELLS.GRIMOIRE_FELGUARD_TALENT.id} /> cooldown</>,
    contributors: [Chizu],
  },
  {
    date: new Date('2018-11-19'),
    changes: 'Consolidated various talent boxes into one Talents statistic box.',
    contributors: [Chizu],
  },
  {
    date: new Date('2018-11-16'),
    changes: <>Added <SpellLink id={SPELLS.SACRIFICED_SOULS_TALENT.id} />, <SpellLink id={SPELLS.DEMONIC_CONSUMPTION_TALENT.id} /> and <SpellLink id={SPELLS.NETHER_PORTAL_TALENT.id} /> modules.</>,
    contributors: [Chizu],
  },
  {
    date: new Date('2018-11-16'),
    changes: <>Added <SpellLink id={SPELLS.SOUL_CONDUIT_TALENT.id} /> and <SpellLink id={SPELLS.INNER_DEMONS_TALENT.id} /> modules. Fixed the Pet Timeline if it encounters an unknown pet.</>,
    contributors: [Chizu],
  },
  {
    date: new Date('2018-11-16'),
    changes: <>Added talent modules for <SpellLink id={SPELLS.FROM_THE_SHADOWS_TALENT.id} />, <SpellLink id={SPELLS.SOUL_STRIKE_TALENT.id} /> and <SpellLink id={SPELLS.SUMMON_VILEFIEND_TALENT.id} />.</>,
    contributors: [Chizu],
  },
  {
    date: new Date('2018-11-15'),
    changes: <>Added <SpellLink id={SPELLS.POWER_SIPHON_TALENT.id} /> talent module and modified <SpellLink id={SPELLS.DOOM_TALENT.id} /> module to also show damage done by the talent.</>,
    contributors: [Chizu],
  },
  {
    date: new Date('2018-11-15'),
    changes: <>Updated Checklist rules and added talent modules for the first row - <SpellLink id={SPELLS.DREADLASH_TALENT.id} />, <SpellLink id={SPELLS.DEMONIC_STRENGTH_TALENT.id} /> and <SpellLink id={SPELLS.BILESCOURGE_BOMBERS_TALENT.id} /></>,
    contributors: [Chizu],
  },
  {
    date: new Date('2018-11-15'),
    changes: <>Fixed <SpellLink id={SPELLS.DEMONIC_CALLING_TALENT.id} /> and <SpellLink id={SPELLS.GRIMOIRE_FELGUARD_TALENT.id} /> modules.</>,
    contributors: [Chizu],
  },
  {
    date: new Date('2018-11-12'),
    changes: 'Certain buffs or debuffs now show in timeline.',
    contributors: [Chizu],
  },
  {
    date: new Date('2018-11-10'),
    changes: <>Added a Pet Timeline tab, allowing you to see your demons' lifespans and highlighting important casts, such as <SpellLink id={SPELLS.NETHER_PORTAL_TALENT.id} />, <SpellLink id={SPELLS.SUMMON_DEMONIC_TYRANT.id} /> and <SpellLink id={SPELLS.IMPLOSION_CAST.id} />.</>,
    contributors: [Chizu],
  },
  {
    date: new Date('2018-11-08'),
    changes: <>Reworked pet tracking system, fixed <SpellLink id={SPELLS.GRIMOIRE_FELGUARD_TALENT.id} /> talent module.</>,
    contributors: [Chizu],
  },
  {
    date: new Date('2018-09-21'),
    changes: 'Removed all legendaries and tier set modules.',
    contributors: [Chizu],
  },
];
