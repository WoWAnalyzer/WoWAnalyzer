import React from 'react';

import { Hewhosmites, Mamtooth } from 'CONTRIBUTORS';
import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import ItemLink from 'common/ItemLink';
import SpellLink from 'common/SpellLink';

export default [
	{
		date: new Date('2018-03-01'),
		changes: <React.Fragment>Added <SpellLink id ={SPELLS.BLIND_FURY_TALENT.id} icon/> to the fury tracker.</React.Fragment>,
		contributors: [Hewhosmites],
	},
	{
		date: new Date('2018-02-27'),
		changes: <React.Fragment>Added <ItemLink id={ITEMS.CHAOS_THEORY.id} icon/></React.Fragment>,
		contributors: [Hewhosmites],
	},
	{
		date: new Date('2018-02-20'),
		changes: <React.Fragment>Added <ItemLink id={ITEMS.MOARG_BIONIC_STABILIZERS.id} icon/></React.Fragment>,
    contributors: [Hewhosmites],
  },
  {
  	date: new Date('2018-02-20'),
		changes: <React.Fragment>Added <ItemLink id={ITEMS.SOUL_OF_THE_SLAYER.id} icon/></React.Fragment>,
		contributors: [Hewhosmites],
	},
	{
		date: new Date('2018-02-19'),
		changes: <React.Fragment>Added <ItemLink id={ITEMS.ANGER_OF_THE_HALF_GIANTS.id} icon/></React.Fragment>,
		contributors: [Hewhosmites],
	},
	{
		date: new Date('2018-01-27'),
		changes: <React.Fragment>Added in <SpellLink id={SPELLS.HAVOC_T21_4PC_BONUS.id} icon/></React.Fragment>,
		contributors: [Hewhosmites],
	},
	{
		date: new Date('2018-01-27'),
		changes: <React.Fragment>Added cooldown reduction for <SpellLink id={SPELLS.EYE_BEAM.id} icon/></React.Fragment>,
		contributors: [Hewhosmites],
	},
	{
		date: new Date('2018-01-27'),
		changes: <React.Fragment>Added a channeled bar to <SpellLink id={SPELLS.EYE_BEAM.id} icon/> in the timeline</React.Fragment>,
		contributors: [Hewhosmites],
	},
	{
		date: new Date('2018-01-25'),
		changes: <React.Fragment>Added in <SpellLink id={SPELLS.HAVOC_T21_2PC_BONUS.id} icon/></React.Fragment>,
		contributors: [Hewhosmites],
	},
	{
		date: new Date('2018-01-24'),
		changes: <React.Fragment>Added in <ItemLink id={ITEMS.RADDONS_CASCADING_EYES.id} icon/></React.Fragment>,
		contributors: [Hewhosmites],
	},
	{	
		date: new Date('2018-01-22'),
		changes: <React.Fragment>Added in <ItemLink id={ITEMS.DELUSIONS_OF_GRANDEUR.id} icon/></React.Fragment>,
		contributors: [Hewhosmites],
	},
	{
		date: new Date('2018-01-22'),
		changes: 'Added in a fury usage tab',
		contributors: [Hewhosmites],
	},
	{
		date: new Date('2018-01-20'),
		changes: 'Changed some Cast Efficiency values, Updated ABC, and added the haste from meta and T21 to get the correct downtime',
		contributors: [Hewhosmites],
	},
	{
		date: new Date('2017-09-09'),
		changes: `Some nearly unused abilities and/or no CD abilities now doesn't show 'can be improved' in Cast Efficiency tab`,
		contributors: [Mamtooth],
	},
	{
		date: new Date('2017-09-09'),
		changes: 'Abilities now trigger mouseover tooltips on statistic boxes.',
		contributors: [Mamtooth],
	},
	{
		date: new Date('2017-09-07'),
		changes: 'Cast Efficiency is now more complete and with more spells tracking.',
		contributors: [Mamtooth],
	},
	{
		date: new Date('2017-09-07'),
		changes: 'Dead GCD Time calculation changed to get more abilities.',
		contributors: [Mamtooth],
	},
	{
		date: new Date('2017-09-02'),
		changes: 'Changed the timer appearance on the statistic boxes.',
		contributors: [Mamtooth],
	},
	{
		date: new Date('2017-09-06'),
		changes: 'Added spell suggestions and statistic boxes.',
		contributors: [Mamtooth],
	},
	{
		date: new Date('2017-09-06'),
		changes: <React.Fragment>Added <span class="DemonHunter">Havoc Demon Hunter</span> support</React.Fragment>,
		contributors: [Mamtooth],
	},
];
