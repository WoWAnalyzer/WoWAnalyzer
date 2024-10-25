import { Section, GuideProps, SubSection } from 'interface/guide';
import CombatLogParser from './CombatLogParser';
import Explanation from 'interface/guide/components/Explanation';
import PerformanceStrong from 'interface/PerformanceStrong';
import { formatPercentage } from 'common/format';
import ActiveTimeGraph from 'parser/ui/ActiveTimeGraph';
import { SpellLink } from 'interface';
import TALENTS from 'common/TALENTS/mage';
import PreparationSection from 'interface/guide/components/Preparation/PreparationSection';
import { HideExplanationsToggle } from 'interface/guide/components/HideExplanationsToggle';
import { AplSectionData } from 'interface/guide/components/Apl';
import * as ssApl from 'src/analysis/retail/mage/frost/apl/SpellslingerAplCheck';
import { GapHighlight } from 'parser/ui/CooldownBar';
import CastEfficiencyBar from 'parser/ui/CastEfficiencyBar';

export const GUIDE_CORE_EXPLANATION_PERCENT = 50;

export default function Guide({ modules, events, info }: GuideProps<typeof CombatLogParser>) {
  const alwaysBeCastingSubsection = (
    <SubSection title="Active Time">
      <Explanation>
        <b>
          Continuously casting throughout an encounter is the single most important thing for
          achieving good DPS as a caster.
        </b>
        <p>
          As mages we have <SpellLink spell={TALENTS.ICE_FLOES_TALENT} /> or{' '}
          <SpellLink spell={TALENTS.SHIMMER_TALENT} /> to continue casting while dealing with
          mechanics that require movement.
        </p>
        <p>
          Some fights have unavoidable downtime, so in these cases 0% downtime will not be possible.
          In encounters with long downtime you can compare your Active Time with some of the top
          logs to see if you can improve.
        </p>
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
      <Section title="Core">
        <HideExplanationsToggle id="hide-explanations-core" />
        <SubSection title="Action Priority List (APL)">
          {info.combatant.hasTalent(TALENTS.SPLINTERSTORM_TALENT) && (
            <AplSectionData checker={ssApl.spellslingerCheck} apl={ssApl.spellslingerApl} />
          )}
        </SubSection>
        {alwaysBeCastingSubsection}
        {modules.wintersChill.guideSubsection}
        {modules.flurry.guideSubsection}
        {info.combatant.hasTalent(TALENTS.GLACIAL_SPIKE_TALENT) &&
          modules.glacialSpike.guideSubsection}
      </Section>
      <Section title="Rotational Abilities">
        <>
          Frost Mage generally revolves around using your procs to shatter your spells and do extra
          damage, but your other rotational abilities also contribute to your damage and, in some
          cases, help generate more procs for you to use.
        </>
        {info.combatant.hasTalent(TALENTS.FROZEN_ORB_TALENT) &&
          modules.frozenOrbGuide.guideSubsection}
        {info.combatant.hasTalent(TALENTS.COMET_STORM_TALENT) &&
          modules.cometStormGuide.guideSubsection}
      </Section>
      <Section title="Procs">
        <HideExplanationsToggle id="hide-explanations-procs" />
        {info.combatant.hasTalent(TALENTS.BRAIN_FREEZE_TALENT) &&
          modules.brainFreeze.guideSubsection}
        {info.combatant.hasTalent(TALENTS.FINGERS_OF_FROST_TALENT) &&
          modules.fingersOfFrost.guideSubsection}
      </Section>
      <Section title="Cooldowns">
        <>
          As is the case with most damage specs, properly utilizing your damage cooldowns will go a
          long way towards improving your overall damage, especially{' '}
          <SpellLink spell={TALENTS.ICY_VEINS_TALENT} />.
        </>
        {info.combatant.hasTalent(TALENTS.ICY_VEINS_TALENT) && (
          <CastEfficiencyBar
            spellId={TALENTS.ICY_VEINS_TALENT.id}
            gapHighlightMode={GapHighlight.FullCooldown}
            useThresholds
          />
        )}
        {info.combatant.hasTalent(TALENTS.FROZEN_ORB_TALENT) && (
          <CastEfficiencyBar
            spellId={TALENTS.FROZEN_ORB_TALENT.id}
            gapHighlightMode={GapHighlight.FullCooldown}
            useThresholds
          />
        )}
        {info.combatant.hasTalent(TALENTS.COMET_STORM_TALENT) && (
          <CastEfficiencyBar
            spellId={TALENTS.COMET_STORM_TALENT.id}
            gapHighlightMode={GapHighlight.FullCooldown}
            useThresholds
          />
        )}
        {info.combatant.hasTalent(TALENTS.RAY_OF_FROST_TALENT) && (
          <CastEfficiencyBar
            spellId={TALENTS.RAY_OF_FROST_TALENT.id}
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
