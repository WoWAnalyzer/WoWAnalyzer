import React from 'react';


import { Aelexe, Zerotorescue, Sharrq, Matardarix } from 'CONTRIBUTORS';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';

export default [
  {
    date: new Date('2018-11-10'),
    changes: <>Modified <SpellLink id={SPELLS.MORTAL_STRIKE.id} /> analysis to get it more accurate with the execution phase.</>,
    contributors: [Matardarix],
  },
  {
    date: new Date('2018-11-07'),
    changes: <>Added Rage usage tab and suggestions on rage wast, removed the doughnut chart for rage usage</>,
    contributors: [Matardarix],
  },
  {
    date: new Date('2018-11-06'),
    changes: <>Added cooldown tracker tab</>,
    contributors: [Matardarix],
  },
  {
    date: new Date('2018-11-05'),
    changes: <>New:<ul><li>Checklist</li><li>Talents module</li><li><SpellLink id={SPELLS.EXECUTIONERS_PRECISION_TRAIT.id} /> module</li><li><SpellLink id={SPELLS.SEISMIC_WAVE.id} /> module</li><li><SpellLink id={SPELLS.TEST_OF_MIGHT.id} /> module</li><li>rage usage module</li><li>suggestions regarding <SpellLink id={SPELLS.DEFENSIVE_STANCE_TALENT.id} /></li></ul>Fixed:<ul><li><SpellLink id={SPELLS.ANGER_MANAGEMENT_TALENT.id} /> cooldown reduction calculation</li></ul></>,
    contributors: [Matardarix],
  },
  {
    date: new Date('2018-10-12'),
    changes: <>Fixed some spell IDs and ability information. Updated Config.</>,
    contributors: [Sharrq],
  },
  {
    date: new Date('2018-06-30'),
    changes: <>Update all abilities to new BFA values, removed incompatible modules and added an <SpellLink id={SPELLS.ANGER_MANAGEMENT_TALENT.id} /> statistic.</>,
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2018-06-16'),
    changes: <>Fixed a rare crash when casting <SpellLink id={SPELLS.EXECUTE.id} /> on a non-boss target.</>,
    contributors: [Aelexe],
  },
];
