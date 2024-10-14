import { GuideProps, Section } from 'interface/guide';
import CombatLogParser from './CombatLogParser';
import PreparationSection from 'interface/guide/components/Preparation/PreparationSection';
import MaelstromUsage from './modules/guide/MaelstromUsage';
import Rotation from './modules/guide/Rotation';
import Cooldowns from './modules/guide/Cooldowns';
import DefensiveAndUtility from '../shared/guide/DefensiveAndUtility';
import SpellLink from 'interface/SpellLink';
import SPELLS from 'common/SPELLS/shaman';
import TALENTS from 'common/TALENTS/shaman';
import Explanation from 'interface/guide/components/Explanation';
import PerformanceStrong from 'interface/PerformanceStrong';
import { formatPercentage } from 'common/format';
import ActiveTimeGraph from 'parser/ui/ActiveTimeGraph';
import { Seriousnes } from 'CONTRIBUTORS';
import Contributor from 'interface/ContributorButton';

export default function Guide(props: GuideProps<typeof CombatLogParser>) {
  const alwaysBeCastingSubsection = (
    <Section title="Active Time">
      <Explanation>
        <>
          <p>
            Time not spent active is lost damage. Despite being melee, Enhancement has many ways to
            continue to deal damage while out of melee range or moving, such as instant cast spells
            via <SpellLink spell={SPELLS.MAELSTROM_WEAPON_BUFF} />,{' '}
            <SpellLink spell={TALENTS.FROST_SHOCK_TALENT} />, or{' '}
            <SpellLink spell={SPELLS.FLAME_SHOCK} />. If you are stuck out of melee for an extended
            period of time, hard casting <SpellLink spell={SPELLS.LIGHTNING_BOLT} /> is a DPS gain
            over doing nothing.
          </p>
          <p>
            Enhancement has a number of movement abilities, such as
            <SpellLink spell={SPELLS.FERAL_LUNGE} />,{' '}
            <SpellLink spell={TALENTS.SPIRIT_WALK_TALENT} />
            , and <SpellLink spell={SPELLS.GHOST_WOLF} /> which can be used to quickly get back to
            your target.
          </p>
          <p>
            While some encounters have forced downtime, which WoWAnalyzer does not account for,
            anything you can do to minimize your downtime will help your damage. Additionally, to
            better contextualize your downtime, we recommend comparing your downtime to another
            Enhancement Shaman that did better than you on the same encounter with roughly the same
            kill time. If you have less downtime than them, then maybe there is something you can do
            to improve.
          </p>
        </>
      </Explanation>
      <p>
        Active Time:{' '}
        <PerformanceStrong performance={props.modules.alwaysBeCasting.DowntimePerformance}>
          {formatPercentage(props.modules.alwaysBeCasting.activeTimePercentage, 1)}%
        </PerformanceStrong>{' '}
      </p>
      <ActiveTimeGraph
        activeTimeSegments={props.modules.alwaysBeCasting.activeTimeSegments}
        fightStart={props.info.fightStart}
        fightEnd={props.info.fightEnd}
      />
    </Section>
  );

  return (
    <>
      <Section title="Preface & Disclaimers">
        <>
          The analysis in this guide is provided by <Contributor {...Seriousnes} /> in collaboration
          with the members and staff of the <a href="https://discord.gg/earthshrine">Earthshrine</a>{' '}
          Shaman discord. When reviewing this information, keep in mind that WoWAnalyzer is limited
          to the information that is present in your combat log. As a result, we have no way of
          knowing if you were intentionally doing something suboptimal because the fight or strat
          required it (such as Forced Downtime or holding cooldowns for a burn phase). Because of
          this, we recommend comparing your analysis against a top 100 log for the same boss.
          <br />
          <br />
          For additional assistance in improving your gameplay, or to have someone look more in
          depth at your combat logs, please visit the{' '}
          <a href="https://discord.gg/earthshrine">Earthshrine</a> discord.
          <br />
          <br />
          If you notice any issues or errors in this analysis or if there is additional analysis you
          would like added, please ping <code>@Seriousnes</code> in the{' '}
          <a href="https://discord.gg/earthshrine">Earthshrine</a> discord.
        </>
      </Section>
      {alwaysBeCastingSubsection}
      <Cooldowns {...props} />
      <Rotation {...props} />
      <MaelstromUsage {...props} />
      <DefensiveAndUtility />
      <PreparationSection />
    </>
  );
}
