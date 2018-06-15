import React from 'react';

import { Sharrq, sref, Fyruna } from 'CONTRIBUTORS';
import ItemLink from 'common/ItemLink';
import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';

export default [
  {
    date: new Date('2018-2-25'),
    changes: <React.Fragment>Added Support for <ItemLink id={ITEMS.KORALONS_BURNING_TOUCH.id} />.</React.Fragment>,
    contributors: [Sharrq],
  },
  {
    date: new Date('2018-1-25'),
    changes: 'Added Checklist.',
    contributors: [Sharrq],
  },
  {
    date: new Date('2018-1-21'),
    changes: 'Added Combustion Checks for Firestarter, Banked Charges, Spell Usage, and Marquee Bindings Procs (Adds full Combustion Usage Support).',
    contributors: [Sharrq],
  },
  {
    date: new Date('2018-1-13'),
    changes: 'Added support for Cinderstorm.',
    contributors: [Sharrq],
  },
  {
    date: new Date('2018-01-06'),
    changes: <React.Fragment>Added analysis for <SpellLink id={SPELLS.HOT_STREAK.id} /> to determine if there was a hard cast before SpellLink id={SPELLS.HOT_STREAK.id} /> was used and also to check for direct damage crits while SpellLink id={SPELLS.HOT_STREAK.id} /> is up.</React.Fragment>,
    contributors: [Sharrq],
  },
  {
    date: new Date('2018-01-03'),
    changes: <React.Fragment>Added support for <ItemLink id={ITEMS.MARQUEE_BINDINGS_OF_THE_SUN_KING.id} /></React.Fragment>,
    contributors: [Sharrq],
  },
  {
    date: new Date('2018-01-02'),
    changes: <React.Fragment>Added Suggestion for <SpellLink id={SPELLS.PHOENIX_FLAMES_TALENT.id} /> Charge Count before <SpellLink id={SPELLS.COMBUSTION.id} /></React.Fragment>,
    contributors: [Sharrq],
  },
  {
    date: new Date('2018-01-02'),
    changes: <React.Fragment>Added <SpellLink id={SPELLS.HEATING_UP.id} /> Module</React.Fragment>,
    contributors: [Sharrq],
  },
  {
    date: new Date('2018-01-02'),
    changes: 'Added Warning regarding spec completeness',
    contributors: [Sharrq],
  },
  {
    date: new Date('2017-12-27'),
    changes: 'Converted Changelog to new format',
    contributors: [Sharrq],
  },
  {
    date: new Date('2017-12-02'),
    changes: <React.Fragment>Added <SpellLink id={SPELLS.HOT_STREAK.id} /> module</React.Fragment>,
    contributors: [Sharrq],
  },
  {
    date: new Date('2017-11-23'),
    changes: <React.Fragment>Added Cooldown Reduction for <SpellLink id={SPELLS.PHOENIX_FLAMES_TALENT.id} /></React.Fragment>,
    contributors: [Sharrq],
  },
  {
    date: new Date('2017-11-23'),
    changes: <React.Fragment>Added support for <ItemLink id={ITEMS.DARCKLIS_DRAGONFIRE_DIADEM.id} />, <ItemLink id={ITEMS.CONTAINED_INFERNAL_CORE.id} />, and <ItemLink id={ITEMS.PYROTEX_IGNITION_CLOTH.id} /></React.Fragment>,
    contributors: [Sharrq],
  },
  {
    date: new Date('2017-11-22'),
    changes: <React.Fragment>Added Cooldown Reduction for <SpellLink id={SPELLS.COMBUSTION.id} /></React.Fragment>,
    contributors: [Sharrq],
  },
  {
    date: new Date('2017-10-17'),
    changes: <React.Fragment>Added Unstable Magic module</React.Fragment>,
    contributors: [sref],
  },
  {
    date: new Date('2017-10-17'),
    changes: <React.Fragment>Added <SpellLink id={SPELLS.MIRROR_IMAGE_SUMMON.id} /> module</React.Fragment>,
    contributors: [sref],
  },
  {
    date: new Date('2017-10-14'),
    changes: 'Added Spec',
    contributors: [Fyruna],
  },
];
