import { Section, GuideProps, SubSection } from 'interface/guide';
import CombatLogParser from './CombatLogParser';
import Explanation from 'interface/guide/components/Explanation';
import PerformanceStrong from 'interface/PerformanceStrong';
import { formatPercentage } from 'common/format';
import ActiveTimeGraph from 'parser/ui/ActiveTimeGraph';
import { SpellLink } from 'interface';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/mage';
import PreparationSection from 'interface/guide/components/Preparation/PreparationSection';

import { GapHighlight } from 'parser/ui/CooldownBar';
import CastEfficiencyBar from 'parser/ui/CastEfficiencyBar';
import MajorDefensives from 'src/analysis/retail/mage/shared/defensives/DefensivesGuide';

export const GUIDE_CORE_EXPLANATION_PERCENT = 50;

export default function Guide({ modules, events, info }: GuideProps<typeof CombatLogParser>) {
  const alwaysBeCastingSubsection = (
    <SubSection title="Active Time">
      <Explanation>
        <>
          Any time you are not casting something, that is damage that is lost. Mage has many ways to
          decrease downtime, such as using <SpellLink spell={SPELLS.BLINK} /> to get somewhere
          faster so you can continue casting or using{' '}
          <SpellLink spell={TALENTS.SLIPSTREAM_TALENT} /> to cast/channel{' '}
          <SpellLink spell={TALENTS.ARCANE_MISSILES_TALENT} /> or{' '}
          <SpellLink spell={TALENTS.EVOCATION_TALENT} /> while you are moving; even phases where the
          only target is taking 99% reduced damage is an opportunity to fish for{' '}
          <SpellLink spell={SPELLS.CLEARCASTING_BUFF} /> procs. While some encounters have forced
          downtime, which WoWAnalyzer does not account for, anything you can do to minimize your
          downtime will help your damage. Additionally, to better contextualize your downtime, we
          recommend comparing your downtime to another Arcane Mage that did better than you on the
          same encounter with roughly the same kill time. If you have less downtime than them, then
          maybe there is something you can do to improve.
        </>
      </Explanation>
      <p>
        Active Time:{' '}
        <PerformanceStrong performance={modules.alwaysBeCasting.DowntimePerformance}>
          {formatPercentage(modules.alwaysBeCasting.activeTimePercentage, 1)}%
        </PerformanceStrong>{' '}
        Cancelled Casts:{' '}
        <PerformanceStrong performance={modules.cancelledCasts.CancelledPerformance}>
          {formatPercentage(modules.cancelledCasts.cancelledPercentage, 1)}%
        </PerformanceStrong>{' '}
      </p>
      <ActiveTimeGraph
        activeTimeSegments={modules.alwaysBeCasting.activeTimeSegments}
        fightStart={info.fightStart}
        fightEnd={info.fightEnd}
      />
    </SubSection>
  );

  const manaLevelSubsection = modules.manaChart.guideSubsection;

  return (
    <>
      <Section title="Preface & Disclaimers">
        <p>
          The analysis in this guide is provided in collaboration with Porom and the rest of the
          staff of the <a href="https://discord.gg/makGfZA">Altered Time</a> Mage Discord. When
          reviewing this information, keep in mind that WoWAnalyzer is limited to the information
          that is present in your combat log. As a result, we have no way of knowing if you were
          intentionally doing something suboptimal because the fight or strat required it (such as
          Forced Downtime or holding cooldowns for a burn phase). Because of this, we recommend
          comparing your analysis against a top 100 log for the same boss.
        </p>
        <p>
          For additional assistance in improving your gameplay, or to have someone look more in
          depth at your combat logs, please visit the{' '}
          <a href="https://discord.gg/makGfZA">Altered Time</a> discord.
        </p>
        <p>
          If you notice any issues or errors in this analysis ... or if there is additional analysis
          you would like added, please ping <code>@Sharrq</code> in the{' '}
          <a href="https://discord.gg/makGfZA">Altered Time</a> discord.
        </p>
      </Section>
      <Section title="Core">
        {alwaysBeCastingSubsection}
        {manaLevelSubsection}
      </Section>

      <Section title="Burn Phase">
        <>
          The Arcane Mage rotation is largely built around the balance between your burn phases and
          your conserve phases. The burn phases will occur every 45 seconds, alternating between a
          minor burn phase with only <SpellLink spell={TALENTS.TOUCH_OF_THE_MAGI_TALENT} /> and a
          major burn phase with both <SpellLink spell={TALENTS.TOUCH_OF_THE_MAGI_TALENT} /> and
          <SpellLink spell={TALENTS.ARCANE_SURGE_TALENT} />. In order to get the most out of those
          burn phases, you should stack as many damage amplifiers as you can into those burn phases,
          the major burn phase in particular. Additionally the 45 second cooldown on
          <SpellLink spell={TALENTS.TOUCH_OF_THE_MAGI_TALENT} /> and the 90 second cooldown on
          <SpellLink spell={TALENTS.ARCANE_SURGE_TALENT} /> will mean that it is very important that
          you are using those two cooldowns as quickly as possible to prevent them from getting
          offset.
        </>

        {info.combatant.hasTalent(TALENTS.ARCANE_SURGE_TALENT) &&
          modules.arcaneSurgeGuide.guideSubsection}
        {info.combatant.hasTalent(TALENTS.TOUCH_OF_THE_MAGI_TALENT) &&
          modules.touchOfTheMagiGuide.guideSubsection}
      </Section>
      <Section title="Rotational Abilities">
        <>
          Arcane Mage generally revolves around your major and minor burn phases, but your other
          rotational abilities also contribute to your damage and, in most cases, help set you up
          for your burn phases so you can get the most out of them.
        </>
        {modules.arcaneMissilesGuide.guideSubsection}
        {modules.prismaticBoltGuide.guideSubsection}
        {modules.arcaneBarrageGuide.guideSubsection}
        {modules.arcaneOrbGuide.guideSubsection}
        {info.combatant.hasTalent(TALENTS.PRESENCE_OF_MIND_TALENT) &&
          modules.presenceOfMindGuide.guideSubsection}
      </Section>
      <Section title="Cooldowns">
        <>
          As is the case with most damage specs, properly utilizing your damage cooldowns will go a
          long way towards improving your overall damage, especially{' '}
          <SpellLink spell={TALENTS.ARCANE_SURGE_TALENT} />.
        </>
        <CastEfficiencyBar
          spell={TALENTS.ARCANE_SURGE_TALENT}
          gapHighlightMode={GapHighlight.FullCooldown}
          useThresholds
        />
        <CastEfficiencyBar
          spell={TALENTS.TOUCH_OF_THE_MAGI_TALENT}
          gapHighlightMode={GapHighlight.FullCooldown}
          useThresholds
        />
        {info.combatant.hasTalent(TALENTS.ARCANE_ORB_TALENT) && (
          <CastEfficiencyBar
            spell={SPELLS.ARCANE_ORB}
            gapHighlightMode={GapHighlight.FullCooldown}
            minimizeIcons
            showExplanation
          />
        )}
        {info.combatant.hasTalent(TALENTS.PRESENCE_OF_MIND_TALENT) && (
          <CastEfficiencyBar
            spell={TALENTS.PRESENCE_OF_MIND_TALENT}
            gapHighlightMode={GapHighlight.FullCooldown}
            useThresholds
          />
        )}
        {info.combatant.hasTalent(TALENTS.EVOCATION_TALENT) && (
          <CastEfficiencyBar
            spell={TALENTS.EVOCATION_TALENT}
            gapHighlightMode={GapHighlight.FullCooldown}
            useThresholds
          />
        )}
      </Section>
      <MajorDefensives />
      <PreparationSection />
    </>
  );
}
