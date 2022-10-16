import { change, date } from 'common/changelog';
import { ToppleTheNun } from 'CONTRIBUTORS';
import SpellLink from 'interface/SpellLink';
import SPELLS from 'common/SPELLS/demonhunter';
import TALENTS from 'common/TALENTS/demonhunter';

// prettier-ignore
export default [
  change(date(2022, 10, 16), <>Add support for <SpellLink id={TALENTS.DISRUPTING_FURY_TALENT.id}/>.</>, ToppleTheNun),
  change(date(2022, 10, 15), <>Add support for <SpellLink id={TALENTS.FLAMES_OF_FURY_TALENT.id}/>.</>, ToppleTheNun),
  change(date(2022, 10, 15), <>Add support for <SpellLink id={TALENTS.STOKE_THE_FLAMES_TALENT.id}/>.</>, ToppleTheNun),
  change(date(2022, 10, 15), <>Correct cooldown for <SpellLink id={TALENTS.FIERY_BRAND_TALENT.id}/> when <SpellLink id={TALENTS.DOWN_IN_FLAMES_TALENT.id}/> is talented.</>, ToppleTheNun),
  change(date(2022, 10, 15), <>Add support for <SpellLink id={TALENTS.UNNATURAL_MALICE_TALENT.id}/>.</>, ToppleTheNun),
  change(date(2022, 10, 15), <>Correct detection of <SpellLink id={TALENTS.ELYSIAN_DECREE_TALENT.id}/> damage.</>, ToppleTheNun),
  change(date(2022, 10, 15), <>Add support for <SpellLink id={TALENTS.SWALLOWED_ANGER_TALENT.id}/>.</>, ToppleTheNun),
  change(date(2022, 10, 14), 'Correct some spell cooldowns and add missing spells.', ToppleTheNun),
  change(date(2022, 10, 13), 'Standardize Fury tracking across Havoc and Vengeance.', ToppleTheNun),
  change(date(2022, 10, 10), <>Improve detection of bad <SpellLink id={SPELLS.SHEAR.id} /> and <SpellLink id={TALENTS.FRACTURE_TALENT.id}/> casts.</>, ToppleTheNun),
  change(date(2022, 9, 22), 'Update to latest Havoc patch from 9/21/2022.', ToppleTheNun),
  change(date(2022, 9, 7), 'Begin working on support for Dragonflight.', ToppleTheNun),
];
