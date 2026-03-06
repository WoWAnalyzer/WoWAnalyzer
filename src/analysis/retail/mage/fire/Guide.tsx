import { Section, GuideProps, SubSection } from 'interface/guide';
import CombatLogParser from './CombatLogParser';
import Explanation from 'interface/guide/components/Explanation';
import PerformanceStrong from 'interface/PerformanceStrong';
import { formatPercentage } from 'common/format';
import ActiveTimeGraph from 'parser/ui/ActiveTimeGraph';
import CastEfficiencyBar from 'parser/ui/CastEfficiencyBar';
import { GapHighlight } from 'parser/ui/CooldownBar';
import { SpellLink } from 'interface';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/mage';
import PreparationSection from 'interface/guide/components/Preparation/PreparationSection';
import MajorDefensives from 'src/analysis/retail/mage/shared/defensives/DefensivesGuide';

export const GUIDE_CORE_EXPLANATION_PERCENT = 50;

export default function Guide({ modules, events, info }: GuideProps<typeof CombatLogParser>) {
  const alwaysBeCastingSubsection = (
    <SubSection title="Active Time">
      <Explanation>
        <>
          Any time you are not casting something, that is damage that is lost. You should always
          pre-plan your movement to decrease downtime, but can also lean on abilties like
          {info.combatant.hasTalent(TALENTS.SHIMMER_TALENT) ? (
            <SpellLink spell={TALENTS.SHIMMER_TALENT} />
          ) : (
            <SpellLink spell={SPELLS.BLINK} />
          )}
          to move faster or <SpellLink spell={TALENTS.SCORCH_TALENT} /> to continue casting while
          you move. While some encounters have forced downtime, which WoWAnalyzer does not account
          for, anything you can do to minimize your downtime will help your damage; even casting
          against a target taking 99% reduced damage is an opportunity to fish for procs.
          Additionally, to better contextualize your downtime, we recommend comparing your downtime
          to another Fire Mage that did better than you on the same encounter with roughly the same
          kill time. If you have less downtime than them, then maybe there is something you can do
          to improve.
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

  return (
    <>
      <Section title="Preface & Disclaimers">
        <>
          The analysis in this guide is provided in collaboration with Degenhours and the rest of
          the staff of the <a href="https://discord.gg/makGfZA">Altered Time</a> Mage Discord. When
          reviewing this information, keep in mind that WoWAnalyzer is limited to the information
          that is present in your combat log. As a result, we have no way of knowing if you were
          intentionally doing something suboptimal because the fight or strat required it (such as
          Forced Downtime or holding cooldowns for a burn phase). Because of this, we recommend
          comparing your analysis against a top 100 log for the same boss.
          <br />
          <br />
          For additional assistance in improving your gameplay, or to have someone look more in
          depth at your combat logs, please visit the{' '}
          <a href="https://discord.gg/makGfZA">Altered Time</a> discord.
          <br />
          <br />
          If you notice any issues or errors in this analysis ... or if there is additional analysis
          you would like added, please ping <code>@Sharrq</code> in the{' '}
          <a href="https://discord.gg/makGfZA">Altered Time</a> discord.
        </>
      </Section>
      <Section title="Core">{alwaysBeCastingSubsection}</Section>
      <Section title="Heating Up & Hot Streak">
        <>
          As a Fire Mage, the vast majority of your rotation revolves around generating, managing,
          and spending your <SpellLink spell={SPELLS.HEATING_UP} /> and{' '}
          <SpellLink spell={SPELLS.HOT_STREAK} /> procs. Regardless of whether{' '}
          <SpellLink spell={TALENTS.COMBUSTION_TALENT} /> is active or not, learning to properly
          utilize your procs will go a long way towards increasing your damage.
        </>
        {modules.heatingUpGuide.guideSubsection}
        {modules.hotStreakGuide.guideSubsection}
      </Section>

      <Section title="Buffs & Procs">
        <>
          Fire Mage has several buffs and procs that need to be managed properly in order to get the
          most out of them and maximize your damage. <SpellLink spell={SPELLS.HOT_STREAK} /> and
          <SpellLink spell={SPELLS.HEATING_UP} /> are your most important procs, but others such as
          <SpellLink spell={TALENTS.HEAT_SHIMMER_TALENT} /> will also increase your damage in other
          ways which will play a large part in maximizing your overall and burst damage.
        </>
        {info.combatant.hasTalent(TALENTS.HEAT_SHIMMER_TALENT) &&
          modules.heatShimmerGuide.guideSubsection}
      </Section>

      <Section title="Cooldowns">
        <>
          As is the case with most damage specs, properly utilizing your damage cooldowns will go a
          long way towards improving your overall damage, especially{' '}
          <SpellLink spell={TALENTS.COMBUSTION_TALENT} />.
        </>
        {info.combatant.hasTalent(TALENTS.COMBUSTION_TALENT) &&
          modules.combustionGuide.guideSubsection}
      </Section>

      <Section title="Talents">
        {info.combatant.hasTalent(TALENTS.METEOR_TALENT) && modules.meteorGuide.guideSubsection}
      </Section>

      <SubSection title="Cast Efficiency"></SubSection>
      {info.combatant.hasTalent(TALENTS.COMBUSTION_TALENT) && (
        <CastEfficiencyBar
          spell={TALENTS.COMBUSTION_TALENT}
          gapHighlightMode={GapHighlight.FullCooldown}
          useThresholds
        />
      )}
      {info.combatant.hasTalent(TALENTS.METEOR_TALENT) && (
        <CastEfficiencyBar
          spell={TALENTS.METEOR_TALENT}
          gapHighlightMode={GapHighlight.FullCooldown}
          useThresholds
        />
      )}
      <MajorDefensives />
      <PreparationSection />
    </>
  );
}
