import { GuideProps, Section, SubSection, useInfo } from 'interface/guide';
import { ResourceLink } from 'interface';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import CombatLogParser from 'analysis/retail/paladin/protection/CombatLogParser';
import { RoundedPanel, SideBySidePanels } from 'interface/guide/components/GuideDivs';
import PreparationSection from 'interface/guide/components/Preparation/PreparationSection';
import HideExplanationsToggle from 'interface/guide/components/HideExplanationsToggle';
import HideGoodCastsToggle from 'interface/guide/components/HideGoodCastsToggle';
import CooldownGraphSubsection, {
  Cooldown,
} from 'interface/guide/components/CooldownGraphSubSection';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import PerformancePercentage from 'analysis/retail/demonhunter/shared/guide/PerformancePercentage';
import TALENTS from 'common/TALENTS/paladin';
import SPELLS from 'common/SPELLS/paladin';
import SpellLink from 'interface/SpellLink';
import MajorDefensives from './modules/core/Defensives';
import ActiveMitgation from './modules/core/Defensives/ActiveMitigation';

export default function Guide({ modules, events, info }: GuideProps<typeof CombatLogParser>) {
  return (
    <>
      <ResourceUsageSection modules={modules} events={events} info={info} />
      <CooldownSection />
      <MitigationSection />
      <ActiveMitigationSection />
      <PreparationSection />
    </>
  );
}

const PERFECT_HOLY_POWER_CAP = 0.1;
const GOOD_HOLY_POWER_CAP = 0.15;
const OK_HOLY_POWER_CAP = 0.2;
function ResourceUsageSection({ modules, info }: GuideProps<typeof CombatLogParser>) {
  const percentAtHolyPowerCap = modules.holyPowerTracker.percentAtCap;
  let percentAtHolyPowerCapPerformance = QualitativePerformance.Fail;
  if (percentAtHolyPowerCap <= PERFECT_HOLY_POWER_CAP) {
    percentAtHolyPowerCapPerformance = QualitativePerformance.Perfect;
  } else if (percentAtHolyPowerCap <= GOOD_HOLY_POWER_CAP) {
    percentAtHolyPowerCapPerformance = QualitativePerformance.Good;
  } else if (percentAtHolyPowerCap <= OK_HOLY_POWER_CAP) {
    percentAtHolyPowerCapPerformance = QualitativePerformance.Ok;
  }
  const holyPowerWasted = modules.holyPowerTracker.wasted;

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
                performance={percentAtHolyPowerCapPerformance}
                perfectPercentage={PERFECT_HOLY_POWER_CAP}
                goodPercentage={GOOD_HOLY_POWER_CAP}
                okPercentage={OK_HOLY_POWER_CAP}
                percentage={percentAtHolyPowerCap}
                flatAmount={holyPowerWasted}
              />{' '}
              of your <ResourceLink id={RESOURCE_TYPES.HOLY_POWER.id} />.
            </p>
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

function MitigationSection() {
  const info = useInfo();
  if (!info) {
    return null;
  }

  return (
    <Section title="Defensive Cooldowns">
      <MajorDefensives />
    </Section>
  );
}

function ActiveMitigationSection() {
  const info = useInfo();
  if (!info) {
    return null;
  }

  return (
    <Section title="Active Mitigation">
      <ActiveMitgation />
    </Section>
  );
}

const cooldowns: Cooldown[] = [
  {
    spell: TALENTS.AVENGING_WRATH_MIGHT_TALENT,
    isActive: (c) =>
      c.hasTalent(TALENTS.AVENGING_WRATH_TALENT) && !c.hasTalent(TALENTS.SENTINEL_TALENT),
  },
  {
    spell: TALENTS.SENTINEL_TALENT,
    isActive: (c) => c.hasTalent(TALENTS.SENTINEL_TALENT),
  },
  {
    spell: TALENTS.GUARDIAN_OF_ANCIENT_KINGS_TALENT,
    isActive: (c) => c.hasTalent(TALENTS.GUARDIAN_OF_ANCIENT_KINGS_TALENT),
  },
  {
    spell: TALENTS.ARDENT_DEFENDER_TALENT,
    isActive: (c) => c.hasTalent(TALENTS.ARDENT_DEFENDER_TALENT),
  },
  {
    spell: SPELLS.DIVINE_SHIELD,
    isActive: (c) => c.hasTalent(TALENTS.FINAL_STAND_TALENT),
  },
  {
    spell: TALENTS.MOMENT_OF_GLORY_TALENT,
    isActive: (c) => c.hasTalent(TALENTS.MOMENT_OF_GLORY_TALENT),
  },
  {
    spell: TALENTS.EYE_OF_TYR_TALENT,
    isActive: (c) => c.hasTalent(TALENTS.EYE_OF_TYR_TALENT),
  },
];

function CooldownSection() {
  return (
    <Section title="Cooldowns">
      <p>
        Protection has access to many cooldowns to mitigate damage and to increase their damage,{' '}
        <SpellLink spell={TALENTS.AVENGING_WRATH_TALENT} />/{' '}
        <SpellLink spell={TALENTS.SENTINEL_TALENT} />,{' '}
        <SpellLink spell={TALENTS.GUARDIAN_OF_ANCIENT_KINGS_TALENT} />,{' '}
        <SpellLink spell={TALENTS.ARDENT_DEFENDER_TALENT} />,{' '}
        <SpellLink spell={SPELLS.DIVINE_SHIELD} />.
      </p>
      <p>
        As well as tools to reduce their cooldown,{' '}
        <SpellLink spell={TALENTS.RIGHTEOUS_PROTECTOR_TALENT} />,{' '}
        <SpellLink spell={TALENTS.RESOLUTE_DEFENDER_TALENT} />, and{' '}
        <SpellLink spell={TALENTS.GIFT_OF_THE_GOLDEN_VALKYR_TALENT} />.
      </p>
      <HideExplanationsToggle id="hide-explanations-rotation" />
      <HideGoodCastsToggle id="hide-good-casts-rotation" />
      <CooldownGraphSubsection cooldowns={cooldowns} />
    </Section>
  );
}
