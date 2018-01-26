import React from 'react';
import Wrapper from 'common/Wrapper';
import ITEMS from 'common/ITEMS';
import ItemLink from 'common/ItemLink';
import { Hewhosmites, Mamtooth } from 'MAINTAINERS';


export default [
	{	
		date: new Date('2018-1-22'),
		changes: <Wrapper>Added in <ItemLink id={ITEMS.DELUSIONS_OF_GRANDEUR.id} icon/></Wrapper>,
		contributors: [Hewhosmites],
	},
	{
		date: new Date('2018-1-22'),
		changes: 'Added in a fury usage tab',
		contributors: [Hewhosmites],
	},
	{
		date: new Date('2018-1-20'),
		changes: 'Changed some Cast Efficiency values, Updated ABC, and added the haste from meta and T21 to get the correct downtime',
		contributors: [Hewhosmites],
	},
	{
		date: new Date('2017-09-09'),
		changes: `Some nearly unused abilities and/or no CD abilities now doesn't show 'can be improved' in Cast Efficiency tab`,
		contributors: [Mamtooth],
	},
	{
		date: new Date('2017-07-09'),
		changes: 'Abilities now trigger mouseover tooltips on statistic boxes.',
		contributors: [Mamtooth],
	},
	{
		date: new Date('2017-07-09'),
		changes: 'Cast Efficiency is now more complete and with more spells tracking.',
		contributors: [Mamtooth],
	},
	{
		date: new Date('2017-07-09'),
		changes: 'Dead GCD Time calculation changed to get more abilities.',
		contributors: [Mamtooth],
	},
	{
		date: new Date('2017-07-09'),
		changes: 'Changed the timer appearance on the statistic boxes.',
		contributors: [Mamtooth],
	},
	{
		date: new Date('2017-06-09'),
		changes: 'Added spell suggestions and statistic boxes.',
		contributors: [Mamtooth],
	},
	{
		date: new Date('2017-06-09'),
		changes: <Wrapper>Added <span class="DemonHunter">Havoc Demon Hunter</span> support</Wrapper>,
		contributors: [Mamtooth],
	},
];
