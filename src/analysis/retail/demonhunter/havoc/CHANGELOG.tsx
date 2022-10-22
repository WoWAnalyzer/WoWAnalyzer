import { change, date } from 'common/changelog';
import { ToppleTheNun } from 'CONTRIBUTORS';
import SpellLink from 'interface/SpellLink';
import TALENTS from 'common/TALENTS/demonhunter';

// prettier-ignore
export default [
  change(date(2022, 10, 22), <>Don't show <SpellLink id={TALENTS.FURIOUS_GAZE_TALENT}/> statistic if not talented.</>, ToppleTheNun),
  change(date(2022, 10, 16), <>Add support for <SpellLink id={TALENTS.DISRUPTING_FURY_TALENT.id}/>.</>, ToppleTheNun),
  change(date(2022, 10, 15), <>Add support for <SpellLink id={TALENTS.FLAMES_OF_FURY_TALENT.id}/>.</>, ToppleTheNun),
  change(date(2022, 10, 15), <>Add support for <SpellLink id={TALENTS.UNNATURAL_MALICE_TALENT.id}/>.</>, ToppleTheNun),
  change(date(2022, 10, 15), <>Correct detection of <SpellLink id={TALENTS.ELYSIAN_DECREE_TALENT.id}/> damage.</>, ToppleTheNun),
  change(date(2022, 10, 15), <>Add support for <SpellLink id={TALENTS.SWALLOWED_ANGER_TALENT.id}/>.</>, ToppleTheNun),
  change(date(2022, 10, 14), 'Correct some spell cooldowns.', ToppleTheNun),
  change(date(2022, 10, 13), 'Standardize Fury tracking across Havoc and Vengeance.', ToppleTheNun),
  change(date(2022, 10, 11), <>Improve <SpellLink id={TALENTS.ESSENCE_BREAK_TALENT.id} /> bad cast detection.</>, ToppleTheNun),
  change(date(2022, 9, 22), 'Update to latest Havoc patch from 9/21/2022.', ToppleTheNun),
  change(date(2022, 9, 7), 'Begin working on support for Dragonflight.', ToppleTheNun),
];
