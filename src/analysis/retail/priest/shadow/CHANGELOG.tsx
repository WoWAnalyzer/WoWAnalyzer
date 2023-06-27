import { change, date } from 'common/changelog';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/priest';
import { DoxAshe, Havoc } from 'CONTRIBUTORS';
import { SpellLink } from 'interface';

export default [
  change(date(2023, 6, 27), <>Add <SpellLink id={TALENTS.SHADOWFIEND_TALENT}/> cooldown tracking to guide view</>,DoxAshe),
  change(date(2023, 6, 22), <>Track <SpellLink id={SPELLS.VOIDFORM}/> duration extension</>,DoxAshe),
  change(date(2023, 6, 7), <>Fix <SpellLink id={SPELLS.VOID_BOLT}/> cooldown tracking</>,DoxAshe),
  change(date(2023, 5, 29), <>Added <SpellLink id={TALENTS.MANIPULATION_TALENT}/> cooldown reduction</>,DoxAshe),
  change(date(2023, 5, 24), <>Added <SpellLink id={TALENTS.INSIDIOUS_IRE_TALENT}/> efficiency and damage</>,Havoc),
  change(date(2023, 5, 20), <>Updated <SpellLink id={TALENTS.VOID_TORRENT_TALENT}/> insanity waste</>,DoxAshe),
  change(date(2023, 5, 9), <>Fixed <SpellLink id={TALENTS.AUSPICIOUS_SPIRITS_TALENT}/>,  <SpellLink id={TALENTS.DEATH_AND_MADNESS_TALENT}/>, <SpellLink id={TALENTS.DEATHSPEAKER_TALENT}/>,  <SpellLink id={TALENTS.SHADOWY_INSIGHT_TALENT}/>,  <SpellLink id={TALENTS.IDOL_OF_CTHUN_TALENT}/>, and <SpellLink id={TALENTS.IDOL_OF_YOGG_SARON_TALENT}/> </>,DoxAshe),
  change(date(2023, 5, 4), <>Added <SpellLink id={TALENTS.SURGE_OF_INSANITY_TALENT}/></>,DoxAshe),
  change(date(2023, 5, 3), <>Updated Shadow Priest Talents and Abilites for 10.1</>,DoxAshe),
  change(date(2023, 4, 21), <>Increased the accuracy of <SpellLink id={SPELLS.VOID_BOLT}/> cooldown tracking</>,DoxAshe),
  change(date(2023, 2, 15), <>Added additional information to cooldowns in guide view</>,DoxAshe),
  change(date(2023, 2, 10), <>Track <SpellLink id={TALENTS.SHADOW_CRASH_TALENT}/> when cast prepull</>,DoxAshe),
  change(date(2023, 2, 8), <>Added Mind Sear Talent and <SpellLink id={SPELLS.VOID_BOLT}/> to guide and removed <SpellLink id={TALENTS.SHADOW_WORD_DEATH_TALENT}/> suggestions</>,DoxAshe),
  change(date(2023, 1, 23), <>Added statistic for T29 four piece and fixed <SpellLink id={SPELLS.MIND_BLAST}/> maximum casts with <SpellLink id={TALENTS.SHADOWY_INSIGHT_TALENT}/> talented</>,DoxAshe),
  change(date(2023, 1, 8), <>Setup an initial version of Guide </>,DoxAshe),
  change(date(2022, 12, 29), <>Created statistics for <SpellLink id={TALENTS.IDOL_OF_CTHUN_TALENT}/>, <SpellLink id={TALENTS.IDOL_OF_NZOTH_TALENT}/>, <SpellLink id={TALENTS.IDOL_OF_YOGG_SARON_TALENT}/>, and <SpellLink id={TALENTS.IDOL_OF_YSHAARJ_TALENT}/> </>,DoxAshe),
  change(date(2022, 12, 20), <>Added Mind Flay Insanity Talent to proc checklist</>,DoxAshe),
  change(date(2022, 12, 12), <>Improved tracking of buffs in timelines and added <SpellLink id={TALENTS.DARK_ASCENSION_TALENT}/> and <SpellLink id={SPELLS.VOIDFORM}/> to tracked cooldowns</>,DoxAshe),
  change(date(2022, 12, 7), <>Fixed error with <SpellLink id={TALENTS.DARK_EVANGELISM_TALENT}/> if the buff exists prepull</>,DoxAshe),
  change(date(2022, 11, 29), <>Improved proc checklist section and fixed some missing icons for the procs </>,DoxAshe),
  change(date(2022, 11, 24), <>Added checklist section and suggestions for using procs </>,DoxAshe),
  change(date(2022, 11, 15), <>Added support for new Dragonflight talents</>,DoxAshe),
  change(date(2022, 11, 6), <>Updated spells and talents for Dragonflight</>,DoxAshe),
];
