import { GuideProps, Section, SubSection } from 'interface/guide';
import { ResourceLink } from 'interface';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import CombatLogParser from 'analysis/retail/paladin/retribution/CombatLogParser';
import { RoundedPanel, SideBySidePanels } from 'interface/guide/components/GuideDivs';
import PreparationSection from 'interface/guide/components/Preparation/PreparationSection';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import PerformancePercentage from 'analysis/retail/demonhunter/shared/guide/PerformancePercentage';
import TALENTS from 'common/TALENTS/paladin';
import SpellLink from 'interface/SpellLink';
import CooldownGraphSubsection, {
  Cooldown,
} from 'interface/guide/components/CooldownGraphSubSection';
import CooldownUsage from 'parser/core/MajorCooldowns/CooldownUsage';
import { FoundationDowntimeSection } from 'interface/guide/foundation/FoundationDowntimeSection';

export default function Guide({ modules, events, info }: GuideProps<typeof CombatLogParser>) {
  return (
    <>
      <CoreSection modules={modules} events={events} info={info} />
      <CooldownSection modules={modules} events={events} info={info} />
      <PreparationSection />
    </>
  );
}

export const GUIDE_CORE_EXPLANATION_PERCENT = 40;

const PERFECT_HOLY_POWER_CAP = 0.1;
const GOOD_HOLY_POWER_CAP = 0.15;
const OK_HOLY_POWER_CAP = 0.2;

function CoreSection({ modules, info }: GuideProps<typeof CombatLogParser>) {
  const holyPowerWasted = modules.holyPowerTracker.wasted;
  const holyPowerTotal = modules.holyPowerTracker.wasted + modules.holyPowerTracker.generated;
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
    <Section title="Core">
      <FoundationDowntimeSection />
      <h4>
        <strong>Explanation</strong>
      </h4>
      <p>
        Although Retribution is a spec with some natural downtime, it needs to be auto-attacking as
        much as possible because of talents like{' '}
        <SpellLink spell={TALENTS.CRUSADING_STRIKES_TALENT} /> and{' '}
        <SpellLink spell={TALENTS.ART_OF_WAR_TALENT} />. Failing to maintain good melee uptime will
        likely result in a lower ability uptime because of lower{' '}
        <ResourceLink id={RESOURCE_TYPES.HOLY_POWER.id} /> generation.
      </p>

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
      {info.combatant.hasTalent(TALENTS.HOLY_FLAMES_TALENT) && (
        <SubSection title="Buffs and debuffs">{modules.expurgation.guideSubsection}</SubSection>
      )}
    </Section>
  );
}

const cooldowns: Cooldown[] = [
  {
    spell: TALENTS.AVENGING_WRATH_TALENT,
    isActive: (c) => !c.hasTalent(TALENTS.RADIANT_GLORY_TALENT),
  },
  {
    spell: TALENTS.WAKE_OF_ASHES_TALENT,
    isActive: (c) => c.hasTalent(TALENTS.WAKE_OF_ASHES_TALENT),
  },
  {
    spell: TALENTS.EXECUTION_SENTENCE_TALENT,
    isActive: (c) => c.hasTalent(TALENTS.EXECUTION_SENTENCE_TALENT),
  },
  {
    spell: TALENTS.DIVINE_TOLL_TALENT,
    isActive: (c) => c.hasTalent(TALENTS.DIVINE_TOLL_TALENT),
  },
];
function CooldownSection({ modules, info }: GuideProps<typeof CombatLogParser>) {
  return (
    <Section title="Cooldowns">
      <p>
        Retribution's cooldowns are decently powerful but should not be held on to for long. In
        order to maximize usages over the course of an encounter, you should aim to send the
        cooldown as soon as it becomes available (as long as it can do damage on target).
      </p>
      <CooldownGraphSubsection cooldowns={cooldowns} />
      {info.combatant.hasTalent(TALENTS.RADIANT_GLORY_TALENT) && (
        <CooldownUsage analyzer={modules.wakeofAshes} title="Wake of Ashes" />
      )}
    </Section>
  );
}
