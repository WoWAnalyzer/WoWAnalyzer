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

import ManaLevelGraph from './ManaChart/TabComponent/ManaLevelGraph';
import { GapHighlight } from 'parser/ui/CooldownBar';
import CastEfficiencyBar from 'parser/ui/CastEfficiencyBar';

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
          recommend comparing your downtime to another Fire Mage that did better than you on the
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

  const manaLevelSubsection = (
    <SubSection title="Mana">
      <Explanation>
        <>
          Unlike most other DPS specs, Arcane Mage revolves around and rewards managing your mana
          properly. This becomes especially important considering your other resource,{' '}
          <SpellLink spell={SPELLS.ARCANE_CHARGE} />, causes your spells to do more damage at the
          expense of an increased mana cost This makes it very easy to accidentally run out of mana
          without many options for easily recovering. While{' '}
          <SpellLink spell={TALENTS.EVOCATION_TALENT} /> will get you back up to max mana, it has a
          longer cooldown and needs to be used for your burn phases, so it could be quite a while
          before you can dig yourself out of that hole.
        </>
      </Explanation>
      <ManaLevelGraph
        reportCode={info.reportCode}
        actorId={info.playerId}
        start={info.fightStart}
        end={info.fightEnd}
        offsetTime={info.combatant.owner.fight.offset_time}
        manaUpdates={modules.manaValues.manaUpdates}
      />
    </SubSection>
  );

  return (
    <>
      <Section title="Preface & Disclaimers">
        <>
          The analysis in this guide is provided in collaboration with Porom and the rest of the
          staff of the <a href="https://discord.gg/makGfZA">Altered Time</a> Mage Discord. When
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
      <Section title="Core">
        {alwaysBeCastingSubsection}
        {manaLevelSubsection}
      </Section>

      <Section title="Burn Phase">
        <>
          The largest contribution to your overall damage is going to come from your major and minor
          burn phases. These burn phases happen roughly every 45s, alternating between your major
          burn and your minor burn, and typically revolve around stacking as much damage as possible
          into your <SpellLink spell={TALENTS.TOUCH_OF_THE_MAGI_TALENT} /> as possible. To do this,
          you will stack other buffs such as <SpellLink spell={SPELLS.SIPHON_STORM_BUFF} /> and{' '}
          <SpellLink spell={TALENTS.ARCANE_TEMPO_TALENT} /> to allow your other damaging abilities
          such as <SpellLink spell={SPELLS.ARCANE_BLAST} /> and{' '}
          <SpellLink spell={TALENTS.ARCANE_MISSILES_TALENT} /> (with{' '}
          <SpellLink spell={SPELLS.CLEARCASTING_ARCANE} />) to hit harder. As such, you want to make
          sure you are casting as much as possible during{' '}
          <SpellLink spell={TALENTS.TOUCH_OF_THE_MAGI_TALENT} /> and that you properly setup for
          that window ahead of time.
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
        {modules.arcaneBarrageGuide.guideSubsection}
        {modules.arcaneOrbGuide.guideSubsection}
        {info.combatant.hasTalent(TALENTS.PRESENCE_OF_MIND_TALENT) &&
          modules.presenceOfMindGuide.guideSubsection}
        {info.combatant.hasTalent(TALENTS.SHIFTING_POWER_TALENT) &&
          modules.shiftingPowerGuide.guideSubsection}
        {info.combatant.hasTalent(TALENTS.SUPERNOVA_TALENT) &&
          modules.supernovaGuide.guideSubsection}
      </Section>

      <Section title="Buffs & Procs">
        <>
          Arcane Mage has several buffs and procs that need to be managed properly in order to get
          the most out of them and maximize your damage. Ranging from things as simple as making
          sure you use all of your <SpellLink spell={SPELLS.CLEARCASTING_ARCANE} /> procs to more
          complex things like getting as much damage as possible into your burn phases and damage
          buff windows, these buffs are all important and will play a large part in maximizing your
          overall and burst damage.
        </>
        {modules.clearcastingGuide.guideSubsection}
        {info.combatant.hasTalent(TALENTS.NETHER_PRECISION_TALENT) &&
          modules.netherPrecisionGuide.guideSubsection}
        {info.combatant.hasTalent(TALENTS.ARCANE_TEMPO_TALENT) &&
          modules.arcaneTempoGuide.guideSubsection}
      </Section>
      <Section title="Cooldowns">
        <>
          As is the case with most damage specs, properly utilizing your damage cooldowns will go a
          long way towards improving your overall damage, especially{' '}
          <SpellLink spell={TALENTS.ARCANE_SURGE_TALENT} />.
        </>
        <CastEfficiencyBar
          spellId={TALENTS.ARCANE_SURGE_TALENT.id}
          gapHighlightMode={GapHighlight.FullCooldown}
          useThresholds
        />
        <CastEfficiencyBar
          spellId={TALENTS.TOUCH_OF_THE_MAGI_TALENT.id}
          gapHighlightMode={GapHighlight.FullCooldown}
          useThresholds
        />
        {info.combatant.hasTalent(TALENTS.PRESENCE_OF_MIND_TALENT) && (
          <CastEfficiencyBar
            spellId={TALENTS.PRESENCE_OF_MIND_TALENT.id}
            gapHighlightMode={GapHighlight.FullCooldown}
            useThresholds
          />
        )}
        {info.combatant.hasTalent(TALENTS.EVOCATION_TALENT) && (
          <CastEfficiencyBar
            spellId={TALENTS.EVOCATION_TALENT.id}
            gapHighlightMode={GapHighlight.FullCooldown}
            useThresholds
          />
        )}
        <CastEfficiencyBar
          spellId={TALENTS.SHIFTING_POWER_TALENT.id}
          gapHighlightMode={GapHighlight.FullCooldown}
        />
      </Section>
      <PreparationSection />
    </>
  );
}
