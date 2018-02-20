import React from 'react';
import Wrapper from 'common/Wrapper';
import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import ItemLink from 'common/ItemLink';
import SpellLink from 'common/SpellLink';
import { Hewhosmites, Mamtooth } from 'MAINTAINERS';


export default [
	{
		date: new Date('2018-02-19'),
		changes: <Wrapper>Added <ItemLink id={ITEMS.ANGER_OF_THE_HALF_GIANTS.id} icon/></Wrapper>,
		contributors: [Hewhosmites],
	},
	{
		date: new Date('2018-01-27'),
		changes: <Wrapper>Added in <SpellLink id={SPELLS.HAVOC_T21_4PC_BONUS.id} icon/></Wrapper>,
		contributors: [Hewhosmites],
	},
	{
		date: new Date('2018-01-27'),
		changes: <Wrapper>Added cooldown reduction for <SpellLink id={SPELLS.EYE_BEAM.id} icon/>></Wrapper>,
		contributors: [Hewhosmites],
	},
	{
		date: new Date('2018-01-27'),
		changes: <Wrapper>Added a channeled bar to <SpellLink id={SPELLS.EYE_BEAM.id} icon/> in the timeline</Wrapper>,
		contributors: [Hewhosmites],
	},
	{
		date: new Date('2018-01-25'),
		changes: <Wrapper>Added in <SpellLink id={SPELLS.HAVOC_T21_2PC_BONUS.id} icon/></Wrapper>,
		contributors: [Hewhosmites],
	},
	{
		date: new Date('2018-01-24'),
		changes: <Wrapper>Added in <ItemLink id={ITEMS.RADDONS_CASCADING_EYES.id} icon/></Wrapper>,
		contributors: [Hewhosmites],
	},
	{	
		date: new Date('2018-01-22'),
		changes: <Wrapper>Added in <ItemLink id={ITEMS.DELUSIONS_OF_GRANDEUR.id} icon/></Wrapper>,
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
		changes: <Wrapper>Added <span class="DemonHunter">Havoc Demon Hunter</span> support</Wrapper>,
		contributors: [Mamtooth],
	},
];
