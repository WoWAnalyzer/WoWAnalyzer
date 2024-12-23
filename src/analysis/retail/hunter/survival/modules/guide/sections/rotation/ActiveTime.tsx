import { GuideProps, Section } from 'interface/guide';
import CombatLogParser from 'analysis/retail/hunter/survival/CombatLogParser';
import TALENTS from 'common/TALENTS/hunter';
import SPELLS from 'common/SPELLS';
import SpellLink from 'interface/SpellLink';
import Explanation from 'interface/guide/components/Explanation';
import PerformanceStrong from 'interface/PerformanceStrong';
import { formatPercentage } from 'common/format';
import ActiveTimeGraph from 'parser/ui/ActiveTimeGraph';

export default function ActiveTime({ modules, events, info }: GuideProps<typeof CombatLogParser>) {
  return (
    <Section title="Active Time">
      <Explanation>
        <>
          <p>
            Time not spent active is lost damage. Despite being melee, Survival has many ways to
            continue to deal damage while out of melee range such as abilities like
            <SpellLink spell={TALENTS.KILL_COMMAND_SURVIVAL_TALENT} />,{' '}
            <SpellLink spell={TALENTS.KILL_SHOT_SURVIVAL_TALENT} />,{' '}
            <SpellLink spell={TALENTS.EXPLOSIVE_SHOT_TALENT} />, and{' '}
            <SpellLink spell={TALENTS.WILDFIRE_BOMB_TALENT} />.{' '}
          </p>
          <p>
            Hunter has a number of movement abilities, such as
            <SpellLink spell={SPELLS.ASPECT_OF_THE_CHEETAH} />,{' '}
            <SpellLink spell={SPELLS.DISENGAGE} />, and
            <SpellLink spell={SPELLS.HARPOON} />, , which can be used to quickly get back to your
            target.
          </p>
          <p>
            {' '}
            Survival also has a power short duration cooldown in
            <SpellLink spell={SPELLS.ASPECT_OF_THE_EAGLE} />, to be ranged for a 15 seconds,
            although this does not extend your auto-attacks for
            <SpellLink spell={TALENTS.LUNGE_TALENT} />, it does allow you to maintain good quality
            uptime.
          </p>
          <p>
            While some encounters have forced downtime, which WoWAnalyzer does not account for,
            anything you can do to minimize your downtime will help your damage. Additionally, to
            better contextualize your downtime, we recommend comparing your downtime to another
            Survival Hunter that did better than you on the same encounter with roughly the same
            kill time. If you have less downtime than them, then maybe there is something you can do
            to improve.
          </p>
        </>
      </Explanation>
      <p>
        Active Time:{' '}
        <PerformanceStrong performance={modules.alwaysBeCasting.DowntimePerformance}>
          {formatPercentage(modules.alwaysBeCasting.activeTimePercentage, 1)}%
        </PerformanceStrong>{' '}
      </p>
      <ActiveTimeGraph
        activeTimeSegments={modules.alwaysBeCasting.activeTimeSegments}
        fightStart={info.fightStart}
        fightEnd={info.fightEnd}
      />
    </Section>
  );
}
