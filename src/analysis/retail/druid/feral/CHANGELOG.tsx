import { change, date } from 'common/changelog';
import { Sref } from 'CONTRIBUTORS';
import { SpellLink } from 'interface';
import SPELLS from 'common/SPELLS';
import { TALENTS_DRUID } from 'common/TALENTS/druid';

export default [
  change(date(2022, 11, 13), <>Added cast efficiency numbers to Guide cooldown bars. Fixed a bug where per-Rake cast evaluation wasn't showing.</>, Sref),
  change(date(2022, 11, 6), <>Added per-cast breakdowns for <SpellLink id={TALENTS_DRUID.CONVOKE_THE_SPIRITS_TALENT.id} /> and <SpellLink id={TALENTS_DRUID.FERAL_FRENZY_TALENT.id} /> to Guide.</>, Sref),
  change(date(2022, 11, 5), <>Added <SpellLink id={TALENTS_DRUID.OMEN_OF_CLARITY_FERAL_TALENT.id} /> and <SpellLink id={TALENTS_DRUID.MOMENT_OF_CLARITY_TALENT.id} /> statistics.</>, Sref),
  change(date(2022, 11, 1), <>Added <SpellLink id={TALENTS_DRUID.BRUTAL_SLASH_TALENT.id} /> subsection to Guide.</>, Sref),
  change(date(2022, 10, 25), <>Fixed a bug where <SpellLink id={TALENTS_DRUID.LIONS_STRENGTH_TALENT.id} /> statistic was showing at the wrong times.</>, Sref),
  change(date(2022, 10, 25), <>Added statistic for <SpellLink id={TALENTS_DRUID.CARNIVOROUS_INSTINCT_TALENT.id} />. Updated handling of energy cost modifying talents.</>, Sref),
  change(date(2022, 10, 19), <>Added statistic for <SpellLink id={TALENTS_DRUID.LIONS_STRENGTH_TALENT.id} /></>, Sref),
  change(date(2022, 10, 19), <>Rearranged Guide's 'Core Rotation' section for improved readability</>, Sref),
  change(date(2022, 10, 17), <>Fixed a bug where Apex procs were counting as 0 CP bites when tallied by the <SpellLink id={TALENTS_DRUID.SABERTOOTH_TALENT.id} /> statistic.</>, Sref),
  change(date(2022, 10, 17), <>Filled out Guide's 'Core Rotation' section</>, Sref),
  change(date(2022, 10, 16), <>Added statistics for <SpellLink id={TALENTS_DRUID.RAGING_FURY_TALENT.id} /> and <SpellLink id={TALENTS_DRUID.TASTE_FOR_BLOOD_TALENT.id} /></>, Sref),
  change(date(2022, 10, 15), <>Overhauled Guide's 'Resource Use' section, including adding graphs for energy and CP usage.</>, Sref),
  change(date(2022, 10, 16), <>Added statistics for <SpellLink id={TALENTS_DRUID.DOUBLE_CLAWED_RAKE_TALENT.id} />, <SpellLink id={TALENTS_DRUID.SABERTOOTH_TALENT.id} />, and <SpellLink id={TALENTS_DRUID.SUDDEN_AMBUSH_TALENT.id} /></>, Sref),
  change(date(2022, 10, 12), <><SpellLink id={TALENTS_DRUID.BLOODTALONS_TALENT.id} /> - updated Statistic and added Guide section.</>, Sref),
  change(date(2022, 10, 9), <>Added statistic for <SpellLink id={TALENTS_DRUID.RAMPANT_FEROCITY_TALENT.id} />. <SpellLink id={TALENTS_DRUID.APEX_PREDATORS_CRAVING_TALENT.id} /> and <SpellLink id={TALENTS_DRUID.CONVOKE_THE_SPIRITS_TALENT.id} /> now account for Rampant Ferocity hits procced by them. Updated modules to to account for balance changes in Beta build 45969.</>, Sref),
  change(date(2022, 10, 8), <>Made Guide default (Checklist removed), and filled in sections for <SpellLink id={SPELLS.RAKE.id} /> and <SpellLink id={SPELLS.RIP.id} />. Fixed duration tracking for DoTs when <SpellLink id={TALENTS_DRUID.CIRCLE_OF_LIFE_AND_DEATH_TALENT.id} /> or <SpellLink id={TALENTS_DRUID.VEINRIPPER_TALENT.id} /> is talented.</>, Sref),
  change(date(2022, 10, 1), <>Fixed inaccuracies in Energy cap tracking. Added rough outline for Guide.</>, Sref),
  change(date(2022, 9, 23), <>Updates for this week's Beta build.</>, Sref),
  change(date(2022, 9, 16), <>Initial updates for Dragonflight Talent system.</>, Sref),
];
