import { change, date } from 'common/changelog';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/priest';
import { DoxAshe } from 'CONTRIBUTORS';
import { SpellLink } from 'interface';

export default [
  change(date(2022, 12, 29), <>Created statistics for <SpellLink id={TALENTS.IDOL_OF_CTHUN_TALENT}/>, <SpellLink id={TALENTS.IDOL_OF_NZOTH_TALENT}/>, <SpellLink id={TALENTS.IDOL_OF_YOGG_SARON_TALENT}/>, and <SpellLink id={TALENTS.IDOL_OF_YSHAARJ_TALENT}/> </>,DoxAshe),
  change(date(2022, 12, 20), <>Added <SpellLink id={TALENTS.MIND_FLAY_INSANITY_TALENT}/> to proc checklist</>,DoxAshe),
  change(date(2022, 12, 12), <>Improved tracking of buffs in timelines and added <SpellLink id={TALENTS.DARK_ASCENSION_TALENT}/> and <SpellLink id={SPELLS.VOIDFORM}/> to tracked cooldowns</>,DoxAshe),
  change(date(2022, 12, 7), <>Fixed error with <SpellLink id={TALENTS.DARK_EVANGELISM_TALENT}/> if the buff exists prepull</>,DoxAshe),
  change(date(2022, 11, 29), <>Improved proc checklist section and fixed some missing icons for the procs </>,DoxAshe),
  change(date(2022, 11, 24), <>Added checklist section and suggestions for using procs </>,DoxAshe),
  change(date(2022, 11, 15), <>Added support for new Dragonflight talents</>,DoxAshe),
  change(date(2022, 11, 6), <>Updated spells and talents for Dragonflight</>,DoxAshe),
];
