import { change, date } from 'common/changelog';
import { Sref, emallson, ToppleTheNun } from 'CONTRIBUTORS';
import { SpellLink } from 'interface';
import SPELLS from 'common/SPELLS';
import { TALENTS_DRUID } from 'common/TALENTS/druid';

export default [
  change(date(2023, 6, 21), <>Fixed an issue where parried <SpellLink spell={SPELLS.FEROCIOUS_BITE}/> casts were counted as 0 CP casts.</>, Sref),
  change(date(2023, 6, 20), 'Update SpellLink usage.', ToppleTheNun),
  change(date(2023, 6, 6), <>Fixed an issue where the analyzer was overstating the amount of cooldown reduction from <SpellLink spell={TALENTS_DRUID.BERSERK_HEART_OF_THE_LION_TALENT}/></>, Sref),
  change(date(2023, 5, 17), <>Fixed an issue where the <SpellLink spell={TALENTS_DRUID.RELENTLESS_PREDATOR_TALENT}/> value wasn't updated for 10.1</>, Sref),
  change(date(2023, 5, 4), <>Updated <SpellLink spell={SPELLS.THRASH_FERAL} /> handling for new spell ID</>, Sref),
  change(date(2023, 5, 2), <>Updated Guide logic to support 10.1 changes.</>, Sref),
  change(date(2023, 4, 15), <>Update to indicate support for 10.0.7, and updates to cast evaluation logic in Guide view.</>, Sref),
  change(date(2023, 3, 14), <>Updated CP check logic to allow 4 CP finishers when not specced for Bloodtalons.</>, Sref),
  change(date(2023, 1, 25), <>Updated numbers for 10.0.5 changes.</>, Sref),
  change(date(2023, 1, 20), <>Fixed a bug where the Guide could crash when Berserk is pre-cast.</>, Sref),
  change(date(2023, 1, 8), <>Added statistics for VotI tier set</>, Sref),
  change(date(2023, 1, 8), <>Fixed a bug where <SpellLink spell={TALENTS_DRUID.CONVOKE_THE_SPIRITS_TALENT} /> would show in the Statistic / Details cooldown bar even when it wasn't talented, and where <SpellLink spell={TALENTS_DRUID.ADAPTIVE_SWARM_TALENT} /> would never show.</>, Sref),
  change(date(2022, 12, 14), <>Added Preparation Section to Guide.</>, Sref),
  change(date(2022, 12, 14), <>Bumped patch compatibility to 10.0.2.</>, emallson),
  change(date(2022, 11, 19), <>Added per-Berserk breakdown to Guide, and fixed an issue where Berserk CDR was being applied even when player wasn't talented for <SpellLink spell={TALENTS_DRUID.BERSERK_HEART_OF_THE_LION_TALENT} /></>, Sref),
  change(date(2022, 11, 13), <>Added cast efficiency numbers to Guide cooldown bars. Fixed a bug where per-Rake cast evaluation wasn't showing.</>, Sref),
  change(date(2022, 11, 6), <>Added per-cast breakdowns for <SpellLink spell={TALENTS_DRUID.CONVOKE_THE_SPIRITS_TALENT} /> and <SpellLink spell={TALENTS_DRUID.FERAL_FRENZY_TALENT} /> to Guide.</>, Sref),
  change(date(2022, 11, 5), <>Added <SpellLink spell={TALENTS_DRUID.OMEN_OF_CLARITY_FERAL_TALENT} /> and <SpellLink spell={TALENTS_DRUID.MOMENT_OF_CLARITY_TALENT} /> statistics.</>, Sref),
  change(date(2022, 11, 1), <>Added <SpellLink spell={TALENTS_DRUID.BRUTAL_SLASH_TALENT} /> subsection to Guide.</>, Sref),
  change(date(2022, 10, 25), <>Fixed a bug where <SpellLink spell={TALENTS_DRUID.LIONS_STRENGTH_TALENT} /> statistic was showing at the wrong times.</>, Sref),
  change(date(2022, 10, 25), <>Added statistic for <SpellLink spell={TALENTS_DRUID.CARNIVOROUS_INSTINCT_TALENT} />. Updated handling of energy cost modifying talents.</>, Sref),
  change(date(2022, 10, 19), <>Added statistic for <SpellLink spell={TALENTS_DRUID.LIONS_STRENGTH_TALENT} /></>, Sref),
  change(date(2022, 10, 19), <>Rearranged Guide's 'Core Rotation' section for improved readability</>, Sref),
  change(date(2022, 10, 17), <>Fixed a bug where Apex procs were counting as 0 CP bites when tallied by the <SpellLink spell={TALENTS_DRUID.SABERTOOTH_TALENT} /> statistic.</>, Sref),
  change(date(2022, 10, 17), <>Filled out Guide's 'Core Rotation' section</>, Sref),
  change(date(2022, 10, 16), <>Added statistics for <SpellLink spell={TALENTS_DRUID.RAGING_FURY_TALENT} /> and <SpellLink spell={TALENTS_DRUID.TASTE_FOR_BLOOD_TALENT} /></>, Sref),
  change(date(2022, 10, 15), <>Overhauled Guide's 'Resource Use' section, including adding graphs for energy and CP usage.</>, Sref),
  change(date(2022, 10, 16), <>Added statistics for <SpellLink spell={TALENTS_DRUID.DOUBLE_CLAWED_RAKE_TALENT} />, <SpellLink spell={TALENTS_DRUID.SABERTOOTH_TALENT} />, and <SpellLink spell={TALENTS_DRUID.SUDDEN_AMBUSH_TALENT} /></>, Sref),
  change(date(2022, 10, 12), <><SpellLink spell={TALENTS_DRUID.BLOODTALONS_TALENT} /> - updated Statistic and added Guide section.</>, Sref),
  change(date(2022, 10, 9), <>Added statistic for <SpellLink spell={TALENTS_DRUID.RAMPANT_FEROCITY_TALENT} />. <SpellLink spell={TALENTS_DRUID.APEX_PREDATORS_CRAVING_TALENT} /> and <SpellLink spell={TALENTS_DRUID.CONVOKE_THE_SPIRITS_TALENT} /> now account for Rampant Ferocity hits procced by them. Updated modules to to account for balance changes in Beta build 45969.</>, Sref),
  change(date(2022, 10, 8), <>Made Guide default (Checklist removed), and filled in sections for <SpellLink spell={SPELLS.RAKE} /> and <SpellLink spell={SPELLS.RIP} />. Fixed duration tracking for DoTs when <SpellLink spell={TALENTS_DRUID.CIRCLE_OF_LIFE_AND_DEATH_FERAL_TALENT} /> or <SpellLink spell={TALENTS_DRUID.VEINRIPPER_TALENT} /> is talented.</>, Sref),
  change(date(2022, 10, 1), <>Fixed inaccuracies in Energy cap tracking. Added rough outline for Guide.</>, Sref),
  change(date(2022, 9, 23), <>Updates for this week's Beta build.</>, Sref),
  change(date(2022, 9, 16), <>Initial updates for Dragonflight Talent system.</>, Sref),
];
