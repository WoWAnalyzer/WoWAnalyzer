import React from 'react';

import { Hewhosmites, Zerotorescue } from 'CONTRIBUTORS';
import Wrapper from 'common/Wrapper';
import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';
import ItemLink from 'common/ItemLink';
import SpellLink from 'common/SpellLink';

export default [
	{
		date: new Date('2018-03-22'),
		changes: <Wrapper>Marked <SpellLink id={SPELLS.BLESSED_HAMMER_TALENT.id} icon/> as being on the GCD.</Wrapper>,
		contributors: [Zerotorescue],
	},
	{
		date: new Date('2018-03-14'),
		changes: <Wrapper>Added <ItemLink id={ITEMS.TYELCA_FERREN_MARCUSS_STATURE.id} icon/></Wrapper>,
		contributors: [Hewhosmites],
	},
  {
    date: new Date('2018-03-15'),
    changes: <Wrapper>Implemented handling of <SpellLink id={SPELLS.GRAND_CRUSADER.id} /> that guesses where the cooldown reset. Because the combatlog doesn't reveal any cooldown information we have to do manual cooldown tracking. Unfortunately there's not a single event that shows random cooldown resets, so implementing effects like <SpellLink id={SPELLS.GRAND_CRUSADER.id} /> is nearly impossible. To work around this, the <SpellLink id={SPELLS.GRAND_CRUSADER.id} /> module will <i>guess</i> where it procced; whenever <SpellLink id={SPELLS.AVENGERS_SHIELD.id} /> is cast, it will check if it was supposed to still be on cooldown. If so, then it will mark the cooldown as ended on the last possible trigger. This should make the cooldown of this spell reasonable given you're using procs quickly.</Wrapper>,
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2018-03-15'),
    changes: <Wrapper>Implemented <SpellLink id={SPELLS.JUDGMENT_CAST.id} />'s cooldown reduction of <SpellLink id={SPELLS.SHIELD_OF_THE_RIGHTEOUS.id} />, making its cooldown indicator in the timeline accurate.</Wrapper>,
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2018-03-15'),
    changes: <Wrapper>Fixed <SpellLink id={SPELLS.JUDGMENT_CAST.id} />'s cooldown to the proper 6 seconds before Haste.</Wrapper>,
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2018-03-14'),
    changes: <Wrapper>Added missing abilities, fixed some cooldowns and implemented <SpellLink id={SPELLS.RIGHTEOUS_PROTECTOR_TALENT.id} />.</Wrapper>,
    contributors: [Zerotorescue, Hewhosmites],
  },
  {
    date: new Date('2018-03-03'),
    changes: <Wrapper>Added <ItemLink id={ITEMS.PILLARS_OF_INMOST_LIGHT.id} /></Wrapper>,
    contributors: [Hewhosmites],
  },
];
