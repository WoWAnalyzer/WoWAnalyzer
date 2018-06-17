import React from 'react';

import ItemLink from 'common/ItemLink';
import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';

import { Chizu } from 'CONTRIBUTORS';

export default [
  {
    date: new Date('2017-09-30'),
    changes: <React.Fragment>Added <ItemLink id={ITEMS.KAZZAKS_FINAL_CURSE.id} icon /> and <ItemLink id={ITEMS.WILFREDS_SIGIL_OF_SUPERIOR_SUMMONING.id} icon /> modules.</React.Fragment>,
    contributors: [Chizu],
  },
  {
    date: new Date('2017-09-30'),
    changes: <React.Fragment>Added <ItemLink id={ITEMS.WAKENERS_LOYALTY.id} icon />, <ItemLink id={ITEMS.RECURRENT_RITUAL.id} icon />, <ItemLink id={ITEMS.SINDOREI_SPITE.id} icon /> modules.</React.Fragment>,
    contributors: [Chizu],
  },
  {
    date: new Date('2017-09-29'),
    changes: 'Added T20 set bonuses.',
    contributors: [Chizu],
  },
  {
    date: new Date('2017-09-25'),
    changes: 'Added rest of the talent modules - Hand of Doom, Grimoire of Sacrifice, Grimoire of Synergy, Summon Darkglare and Demonbolt.',
    contributors: [Chizu],
  },
  {
    date: new Date('2017-09-23'),
    changes: <React.Fragment>Added second talent row modules - Impending Doom, Improved Dreadstalkers and <SpellLink id={SPELLS.IMPLOSION_CAST.id} icon />.</React.Fragment>,
    contributors: [Chizu],
  },
  {
    date: new Date('2017-09-19'),
    changes: <React.Fragment>Added first talent row modules - Shadowy Inspiration, Shadowflame and <SpellLink id={SPELLS.DEMONIC_CALLING_TALENT.id} icon />.</React.Fragment>,
    contributors: [Chizu],
  },
  {
    date: new Date('2017-09-19'),
    changes: 'Added the Soul Shard tracker.',
    contributors: [Chizu],
  },
];
