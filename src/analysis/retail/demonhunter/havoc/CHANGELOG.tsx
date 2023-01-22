import { change, date } from 'common/changelog';
import { ToppleTheNun } from 'CONTRIBUTORS';
import SpellLink from 'interface/SpellLink';
import TALENTS from 'common/TALENTS/demonhunter';
import SHARED_CHANGELOG from 'analysis/retail/demonhunter/shared/CHANGELOG';

// prettier-ignore
export default [
  change(date(2023, 1, 15), 'Update Fury waste recommendations and Guide.', ToppleTheNun),
  change(date(2022, 12, 15), 'Fix Guide crashing.', ToppleTheNun),
  change(date(2022, 12, 5), 'Add very basic APL.', ToppleTheNun),
  change(date(2022, 11, 30), 'Clean up and internationalize Guide.', ToppleTheNun),
  change(date(2022, 11, 21), <>Fix degradation of <SpellLink id={TALENTS.THE_HUNT_TALENT} /> due to pre-casts.</>, ToppleTheNun),
  change(date(2022, 11, 14), <>Add <SpellLink id={TALENTS.THE_HUNT_TALENT}/> cast breakdown to the Guide.</>, ToppleTheNun),
  change(date(2022, 11, 10), <>Prevent <SpellLink id={TALENTS.SIGIL_OF_MISERY_TALENT}/> and <SpellLink id={TALENTS.SIGIL_OF_SILENCE_TALENT}/> from appearing in statistics if untalented.</>, ToppleTheNun),
  change(date(2022, 11, 10), <>Remove Fury overcapping suggestions from <SpellLink id={TALENTS.DISRUPTING_FURY_TALENT}/> and <SpellLink id={TALENTS.SWALLOWED_ANGER_TALENT}/>.</>, ToppleTheNun),
  change(date(2022, 11, 8), 'Move some spells to a shared spellbook.', ToppleTheNun),
  change(date(2022, 10, 31), 'Update talent-based statistics to show talent rank.', ToppleTheNun),
  change(date(2022, 10, 31), <>Remove misleading <SpellLink id={TALENTS.SIGIL_OF_FLAME_TALENT}/> statistic.</>, ToppleTheNun),
  change(date(2022, 10, 23), 'Setup initial version of Guide.', ToppleTheNun),
  change(date(2022, 10, 22), <>Don't show <SpellLink id={TALENTS.FURIOUS_GAZE_TALENT}/> statistic if not talented.</>, ToppleTheNun),
  change(date(2022, 10, 16), <>Add support for <SpellLink id={TALENTS.DISRUPTING_FURY_TALENT}/>.</>, ToppleTheNun),
  change(date(2022, 10, 15), <>Add support for <SpellLink id={TALENTS.FLAMES_OF_FURY_TALENT}/>.</>, ToppleTheNun),
  change(date(2022, 10, 15), <>Add support for <SpellLink id={TALENTS.UNNATURAL_MALICE_TALENT}/>.</>, ToppleTheNun),
  change(date(2022, 10, 15), <>Correct detection of <SpellLink id={TALENTS.ELYSIAN_DECREE_TALENT}/> damage.</>, ToppleTheNun),
  change(date(2022, 10, 15), <>Add support for <SpellLink id={TALENTS.SWALLOWED_ANGER_TALENT}/>.</>, ToppleTheNun),
  change(date(2022, 10, 14), 'Correct some spell cooldowns.', ToppleTheNun),
  change(date(2022, 10, 13), 'Standardize Fury tracking across Havoc and Vengeance.', ToppleTheNun),
  change(date(2022, 10, 11), <>Improve <SpellLink id={TALENTS.ESSENCE_BREAK_TALENT} /> bad cast detection.</>, ToppleTheNun),
  change(date(2022, 9, 22), 'Update to latest Havoc patch from 9/21/2022.', ToppleTheNun),
  change(date(2022, 9, 7), 'Begin working on support for Dragonflight.', ToppleTheNun),
  ...SHARED_CHANGELOG,
];
