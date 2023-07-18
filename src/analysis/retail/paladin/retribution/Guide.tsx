import { GuideProps, Section, SubSection } from 'interface/guide';
import { ResourceLink } from 'interface';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import CombatLogParser from 'analysis/retail/paladin/retribution/CombatLogParser';
import { RoundedPanel, SideBySidePanels } from 'interface/guide/components/GuideDivs';
import PreparationSection from 'interface/guide/components/Preparation/PreparationSection';
import HideExplanationsToggle from 'interface/guide/components/HideExplanationsToggle';
import HideGoodCastsToggle from 'interface/guide/components/HideGoodCastsToggle';
import CooldownGraphSubsection from 'analysis/retail/paladin/retribution/guide/CooldownGraphSubsection';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import PerformancePercentage from 'analysis/retail/demonhunter/shared/guide/PerformancePercentage';
import TALENTS from 'common/TALENTS/paladin';
import SpellLink from 'interface/SpellLink';

export default function Guide({ modules, events, info }: GuideProps<typeof CombatLogParser>) {
  return (
    <>
      <ResourceUsageSection modules={modules} events={events} info={info} />
      <CooldownSection />
      <PreparationSection />
    </>
  );
}

const PERFECT_HOLY_POWER_CAP = 0.1;
const GOOD_HOLY_POWER_CAP = 0.15;
const OK_HOLY_POWER_CAP = 0.2;
function ResourceUsageSection({ modules, info }: GuideProps<typeof CombatLogParser>) {
  const holyPowerWasted = modules.holyPowerTracker.wasted;
  const holyPowerTotal = modules.holyPowerTracker.generated;
  const wastedHolyPowerPercentage = holyPowerWasted / holyPowerTotal;
  let wastedHolyPowerPercentagePerformance = QualitativePerformance.Fail;
  if (wastedHolyPowerPercentage <= PERFECT_HOLY_POWER_CAP) {
    wastedHolyPowerPercentagePerformance = QualitativePerformance.Perfect;
  } else if (wastedHolyPowerPercentage <= GOOD_HOLY_POWER_CAP) {
    wastedHolyPowerPercentagePerformance = QualitativePerformance.Good;
  } else if (wastedHolyPowerPercentage <= OK_HOLY_POWER_CAP) {
    wastedHolyPowerPercentagePerformance = QualitativePerformance.Ok;
  }

  return (
    <Section title="Resource Use">
      <SubSection title="Holy Power">
        <p>
          Most of your rotational abilities either <strong>build</strong> or <strong>spend</strong>{' '}
          <ResourceLink id={RESOURCE_TYPES.HOLY_POWER.id} />. Never use a builder at max{' '}
          <ResourceLink id={RESOURCE_TYPES.HOLY_POWER.id} /> or when doing so will cause you to
          overcap on <ResourceLink id={RESOURCE_TYPES.HOLY_POWER.id} />.
        </p>
        <SideBySidePanels>
          <RoundedPanel>
            <strong>
              <ResourceLink id={RESOURCE_TYPES.HOLY_POWER.id} /> Waste
            </strong>
            <p>
              You wasted{' '}
              <PerformancePercentage
                performance={wastedHolyPowerPercentagePerformance}
                perfectPercentage={PERFECT_HOLY_POWER_CAP}
                goodPercentage={GOOD_HOLY_POWER_CAP}
                okPercentage={OK_HOLY_POWER_CAP}
                percentage={wastedHolyPowerPercentage}
                flatAmount={holyPowerWasted}
              />{' '}
              of your <ResourceLink id={RESOURCE_TYPES.HOLY_POWER.id} />.
            </p>
            {info.combatant.hasTalent(TALENTS.CRUSADING_STRIKES_TALENT) ? (
              <p>
                Because you're taking <SpellLink spell={TALENTS.CRUSADING_STRIKES_TALENT} />, you
                need to be extra careful about how you time your abilities that build{' '}
                <ResourceLink id={RESOURCE_TYPES.HOLY_POWER.id} /> so that you don't overcap.
              </p>
            ) : null}
            {info.combatant.hasTalent(TALENTS.DIVINE_TOLL_TALENT) &&
            wastedHolyPowerPercentage > PERFECT_HOLY_POWER_CAP ? (
              <p>
                Some of this might be attributable to the Judgments from{' '}
                <SpellLink spell={TALENTS.DIVINE_TOLL_TALENT} />.
              </p>
            ) : null}
            {info.combatant.hasTalent(TALENTS.DIVINE_RESONANCE_RETRIBUTION_TALENT) &&
            wastedHolyPowerPercentage > PERFECT_HOLY_POWER_CAP ? (
              <p>
                Some of this might be attributable to the free Judgments from{' '}
                <SpellLink spell={TALENTS.DIVINE_RESONANCE_RETRIBUTION_TALENT} />.
              </p>
            ) : null}
          </RoundedPanel>
          <RoundedPanel>
            <strong>
              <ResourceLink id={RESOURCE_TYPES.HOLY_POWER.id} /> Builder Effectiveness
            </strong>
            {modules.builderUse.chart}
          </RoundedPanel>
        </SideBySidePanels>
      </SubSection>
    </Section>
  );
}

function CooldownSection() {
  return (
    <Section title="Cooldowns">
      <p>
        Retribution's cooldowns are decently powerful but should not be held on to for long. In
        order to maximize usages over the course of an encounter, you should aim to send the
        cooldown as soon as it becomes available (as long as it can do damage on target).
      </p>
      <HideExplanationsToggle id="hide-explanations-rotation" />
      <HideGoodCastsToggle id="hide-good-casts-rotation" />
      <CooldownGraphSubsection />
    </Section>
  );
}
