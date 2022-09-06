import { change, date } from 'common/changelog';
import DH_SPELLS from 'common/SPELLS/demonhunter';
import DH_CONDUITS from 'common/SPELLS/shadowlands/conduits/demonhunter';
import DH_COVENANTS from 'common/SPELLS/shadowlands/covenants/demonhunter';
import DH_LEGENDARIES from 'common/SPELLS/shadowlands/legendaries/demonhunter';
import DH_TALENTS from 'common/SPELLS/talents/demonhunter';
import { Elodiel, flurreN, LeoZhekov, ToppleTheNun } from 'CONTRIBUTORS';
import { SpellLink } from 'interface';

// prettier-ignore
export default [
  change(date(2022, 9, 5), <>Fix <SpellLink id={DH_TALENTS.ESSENCE_BREAK_TALENT.id} /> not supporting <SpellLink id={DH_SPELLS.BLADE_DANCE.id} /> and <SpellLink id={DH_SPELLS.DEATH_SWEEP.id} />.</>, ToppleTheNun),
  change(date(2022, 8, 22), 'Migrate to class/spec specific spell setup.', ToppleTheNun),
  change(date(2022, 8, 12), <>Add support for <SpellLink id={DH_COVENANTS.FODDER_TO_THE_FLAME_DAMAGE.id} />.</>, ToppleTheNun),
  change(date(2022, 7, 25), <>Add tracker for <SpellLink id={DH_SPELLS.FURIOUS_GAZE.id} />.</>, ToppleTheNun),
  change(date(2022, 7, 24), 'Remove talents that were removed in BFA/Shadowlands prepatch.', ToppleTheNun),
  change(date(2022, 7, 24), <>Correct <SpellLink id={DH_COVENANTS.SINFUL_BRAND.id} /> cooldown.</>, ToppleTheNun),
  change(date(2022, 7, 24), <>Correct spelling of <SpellLink id={DH_LEGENDARIES.FEL_DEVASTATION_DAMAGE.id} />.</>, ToppleTheNun),
  change(date(2022, 7, 14), <>Add <SpellLink id={DH_COVENANTS.SINFUL_BRAND.id} /> uptime tracking and change <SpellLink id={DH_COVENANTS.SINFUL_BRAND.id} /> cast recommendation.</>, ToppleTheNun),
  change(date(2021, 9, 26), <>Fixed the issue, that the Analyzer would show 0 uses of <SpellLink id={DH_COVENANTS.ELYSIAN_DECREE.id} /> in the suggestions and statistics instead of the actual number of uses.</>, Elodiel),
  change(date(2021, 2, 2), <>Added <SpellLink id={DH_CONDUITS.FEL_DEFENDER.id} /> to Statistics</>, flurreN),
  change(date(2021, 1, 28), <>Added <SpellLink id={DH_CONDUITS.GROWING_INFERNO.id} /> to Statistics</>, flurreN),
  change(date(2021, 1, 18), <>Suggestions for <SpellLink id={DH_TALENTS.DEMONIC_TALENT_HAVOC.id} />, <SpellLink id={DH_SPELLS.BLADE_DANCE.id} /> and <SpellLink id={DH_SPELLS.DEATH_SWEEP.id} /> have been updated</>, flurreN),
  change(date(2021, 1, 6), <>Added <SpellLink id={DH_COVENANTS.ELYSIAN_DECREE.id} /> to Statistics</>, flurreN),
  change(date(2020, 12, 30), <>Added <SpellLink id={DH_COVENANTS.SINFUL_BRAND.id} /> and <SpellLink id={DH_COVENANTS.THE_HUNT.id} /> to Statistics</>, flurreN),
  change(date(2020, 12, 29), <>Fixed bug where <SpellLink id={DH_TALENTS.DEMONIC_TALENT_HAVOC.id} /> were causing errors</>, flurreN),
  change(date(2020, 12, 28), <><SpellLink id={DH_LEGENDARIES.COLLECTIVE_ANGUISH.id} /> and <SpellLink id={DH_LEGENDARIES.CHAOS_THEORY.id} /> is added to Statistics</>, flurreN),
  change(date(2020, 12, 28), <><SpellLink id={DH_TALENTS.FELBLADE_TALENT.id} /> is now shown correctly in timeline and more information added to Statistic box</>, flurreN),
  change(date(2020, 12, 28), 'Legendary, Covenant and Conduits added for Havoc', flurreN),
  change(date(2020, 12, 28), <><SpellLink id={DH_SPELLS.EYE_BEAM.id} /> is now showed correct in the Timeline.</>, flurreN),
  change(date(2020, 12, 28), <>Added support for <SpellLink id={DH_TALENTS.GLAIVE_TEMPEST_TALENT.id} /> </>, flurreN),
  change(date(2020, 12, 26), <><SpellLink id={DH_TALENTS.GLAIVE_TEMPEST_TALENT.id} /> have correct cd, and <SpellLink id={DH_TALENTS.CYCLE_OF_HATRED_TALENT.id} /> is not reducing cooldown correctly on <SpellLink id={DH_SPELLS.EYE_BEAM.id} /></>, flurreN),
  change(date(2020, 12, 26), <><SpellLink id={DH_TALENTS.NETHERWALK_TALENT.id} /> and <SpellLink id={DH_SPELLS.DARKNESS.id} /> now have a correct gcd.</>, flurreN),
  change(date(2020, 12, 24), 'Updated CDs and baselines for SL', flurreN),
  change(date(2020, 12, 23), 'Updated spells and talents for SL', flurreN),
  change(date(2020, 10, 30), 'Updated the deprecated StatisticBox elements with the new Statistic ones.', LeoZhekov),
];
