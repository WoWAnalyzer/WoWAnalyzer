import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import { Juko8, Skeletor, Abelito75 } from 'CONTRIBUTORS';
import { change, date } from 'common/changelog';

export default [
  change(date(2020, 3, 7), 'Inquisition Statistic updated to show holy power used per cast and overlap on cast.', Abelito75),
  change(date(2020, 1, 15), 'Marked as up to date for 8.3', Juko8),
  change(date(2019, 11, 18), <>Added timeline highlights of bad <SpellLink id={SPELLS.INQUISITION_TALENT.id} icon /> casts during <SpellLink id={SPELLS.EXECUTION_SENTENCE_TALENT.id} icon />. </>, Juko8),
  change(date(2019, 11, 8), <>Updated cooldown calculations for <SpellLink id={SPELLS.AVENGING_WRATH.id} icon /> and <SpellLink id={SPELLS.CRUSADE_TALENT.id} icon /> when using <SpellLink id={SPELLS.STRIVE_FOR_PERFECTION.id} icon />.</>, Juko8),
  change(date(2019, 9, 12), <>Added <SpellLink id={SPELLS.EXECUTION_SENTENCE_TALENT.id} icon />. </>, Juko8),
  change(date(2019, 7, 24), <>Updated <SpellLink id={SPELLS.JUDGMENT_CAST.id} icon /> module to display <SpellLink id={SPELLS.EXECUTION_SENTENCE_TALENT.id} icon /> consumptions.</>, Skeletor),
  change(date(2019, 3, 11), <>Updated <SpellLink id={SPELLS.DIVINE_PURPOSE_TALENT_RETRIBUTION.id} icon /> module with tooltip displaying what spells the procs were used for and longest chain of procs.</>, Juko8),
  change(date(2019, 3, 8), <> Updated <SpellLink id={SPELLS.CONSECRATION_TALENT.id} icon /> module to display average targets hit.</>, Skeletor),
  change(date(2019, 3, 7), <> Added module to display <SpellLink id={SPELLS.INDOMITABLE_JUSTICE.id} icon /> benefit.</>, Skeletor),
  change(date(2019, 3, 5), 'Added Holy Power wastage highlights on timeline.', Skeletor),
  change(date(2019, 3, 3), <> Added module for <SpellLink id={SPELLS.WAKE_OF_ASHES_TALENT.id} icon />.</>, Skeletor),
  change(date(2019, 3, 2), 'Added spec buffs to the timeline.', Skeletor),
  change(date(2018, 10, 4), 'Added Divine Right.', Juko8),
  change(date(2018, 9, 20), <> Added <SpellLink id={SPELLS.RELENTLESS_INQUISITOR.id} />.</>, Juko8),
  change(date(2018, 9, 17), <> Added <SpellLink id={SPELLS.SHIELD_OF_VENGEANCE.id} />.</>, Juko8),
  change(date(2018, 6, 25), <>Added modules for <SpellLink id={SPELLS.RIGHTEOUS_VERDICT_TALENT.id} icon /> and <SpellLink id={SPELLS.INQUISITION_TALENT.id} icon />.</>, Juko8),
  change(date(2018, 6, 24), <>Updated modules for <SpellLink id={SPELLS.ART_OF_WAR.id} icon /> and <SpellLink id={SPELLS.JUDGMENT_CAST.id} icon />.</>, Juko8),
  change(date(2018, 6, 21), 'Talents and abilities updated for 8.0. Artifact traits and related analysis removed.', Juko8),
];
