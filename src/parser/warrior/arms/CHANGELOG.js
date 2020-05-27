import React from 'react';

import { Aelexe, Zerotorescue, Sharrq, Matardarix, Korebian, Torothin } from 'CONTRIBUTORS';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import { change, date } from 'common/changelog';

export default [

  change(date(2020, 3, 30), <>Added <SpellLink id={SPELLS.OVERPOWER.id} /> wasted statistic to the statisitcs tab</>, [Torothin]),
  change(date(2019, 2, 3), <>Added a suggestion to not use <SpellLink id={SPELLS.SWEEPING_STRIKES.id} /> during <SpellLink id={SPELLS.COLOSSUS_SMASH.id} /> / <SpellLink id={SPELLS.WARBREAKER_TALENT.id} />.</>, [Korebian]),
  change(date(2019, 2, 2), <>Added more information to the <SpellLink id={SPELLS.CRUSHING_ASSAULT_TRAIT.id} /> module. Added <SpellLink id={SPELLS.LORD_OF_WAR.id} /> module.</>, [Korebian]),
  change(date(2018, 12, 12), <>Updated for patch 8.1, <SpellLink id={SPELLS.CHARGE.id} /> is no longer on the GCD and <SpellLink id={SPELLS.EXECUTIONERS_PRECISION_TRAIT.id} /> have been replaced by <SpellLink id={SPELLS.STRIKING_THE_ANVIL.id} />.</>, [Matardarix]),
  change(date(2018, 11, 28), <>Added <SpellLink id={SPELLS.CRUSHING_ASSAULT_TRAIT.id} /> module.</>, [Matardarix]),
  change(date(2018, 11, 15), <>Fixed Overpower events where stacks were applied before casts</>, [Matardarix]),
  change(date(2018, 11, 14), <>Added a suggestion on using <SpellLink id={SPELLS.SLAM.id} /> while <SpellLink id={SPELLS.MORTAL_STRIKE.id} /> is available.</>, [Matardarix]),
  change(date(2018, 11, 12), <>Added <SpellLink id={SPELLS.FERVOR_OF_BATTLE_TALENT.id} /> in Talents module.</>, [Matardarix]),
  change(date(2018, 11, 10), <>Modified <SpellLink id={SPELLS.MORTAL_STRIKE.id} /> analysis to get it more accurate with the execution phase.</>, [Matardarix]),
  change(date(2018, 11, 7), <>Added Rage usage tab and suggestions on rage wast, removed the doughnut chart for rage usage</>, [Matardarix]),
  change(date(2018, 11, 6), <>Added cooldown tracker tab</>, [Matardarix]),
  change(date(2018, 11, 5), <>New:<ul><li>Checklist</li><li>Talents module</li><li><SpellLink id={SPELLS.EXECUTIONERS_PRECISION_TRAIT.id} /> module</li><li><SpellLink id={SPELLS.SEISMIC_WAVE.id} /> module</li><li><SpellLink id={SPELLS.TEST_OF_MIGHT.id} /> module</li><li>rage usage module</li><li>suggestions regarding <SpellLink id={SPELLS.DEFENSIVE_STANCE_TALENT.id} /></li></ul>Fixed:<ul><li><SpellLink id={SPELLS.ANGER_MANAGEMENT_TALENT.id} /> cooldown reduction calculation</li></ul></>, [Matardarix]),
  change(date(2018, 10, 12), <>Fixed some spell IDs and ability information. Updated Config.</>, [Sharrq]),
  change(date(2018, 6, 30), <>Update all abilities to new BFA values, removed incompatible modules and added an <SpellLink id={SPELLS.ANGER_MANAGEMENT_TALENT.id} /> statistic.</>, [Zerotorescue]),
  change(date(2018, 6, 16), <>Fixed a rare crash when casting <SpellLink id={SPELLS.EXECUTE.id} /> on a non-boss target.</>, [Aelexe]),
];
