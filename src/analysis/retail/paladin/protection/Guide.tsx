import { GuideProps, Section, SubSection, useInfo } from 'interface/guide';
import { AlertWarning, ResourceLink, SpellLink } from 'interface';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import CombatLogParser from 'analysis/retail/paladin/protection/CombatLogParser';
import { RoundedPanel, SideBySidePanels } from 'interface/guide/components/GuideDivs';
import PreparationSection from 'interface/guide/components/Preparation/PreparationSection';

import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import PerformancePercentage from 'analysis/retail/demonhunter/shared/guide/PerformancePercentage';

import MajorDefensives from './modules/core/Defensives';
import ActiveMitgation from './modules/core/Defensives/ActiveMitigation';
import { FoundationDowntimeSection } from 'interface/guide/foundation/FoundationDowntimeSection';
import { FoundationCooldownSection } from 'interface/guide/foundation/FoundationCooldownSection';
import { AplSectionData } from 'interface/guide/components/Apl';
import { apl, check } from './modules/core/AplCheck';
import talents from 'common/TALENTS/paladin';
import SPELLS from 'common/SPELLS/paladin';
import { formatDuration } from 'common/format';

export default function Guide({ modules, events, info }: GuideProps<typeof CombatLogParser>) {
  return (
    <>
      <Section title="Core Skills">
        <FoundationDowntimeSection />
        <FoundationCooldownSection />
      </Section>
      <ResourceUsageSection modules={modules} events={events} info={info} />
      <Section title="Rotation">
        {info.combatant.hasTalent(talents.LIGHTS_GUIDANCE_TALENT) && (
          <AlertWarning>
            Rotational analysis for{' '}
            <SpellLink spell={talents.LIGHTS_GUIDANCE_TALENT}>Templar</SpellLink> is untested.
          </AlertWarning>
        )}
        <AplSectionData checker={check} apl={apl} />
      </Section>
      {modules.gloryOfTheVanguard.active && (
        <GloryOfTheVanguardSection modules={modules} events={events} info={info} />
      )}
      <MitigationSection />
      <ActiveMitigationSection />
      <PreparationSection />
    </>
  );
}

const PERFECT_HOLY_POWER_WASTE = 0.05;
const GOOD_HOLY_POWER_WASTE = 0.1;
const OK_HOLY_POWER_WASTE = 0.2;
function ResourceUsageSection({ modules, info }: GuideProps<typeof CombatLogParser>) {
  const percentHolyPowerWasted = modules.holyPowerTracker.percentWasted;
  let percentHolyPowerWastedPerformance = QualitativePerformance.Fail;
  if (percentHolyPowerWasted <= PERFECT_HOLY_POWER_WASTE) {
    percentHolyPowerWastedPerformance = QualitativePerformance.Perfect;
  } else if (percentHolyPowerWasted <= GOOD_HOLY_POWER_WASTE) {
    percentHolyPowerWastedPerformance = QualitativePerformance.Good;
  } else if (percentHolyPowerWasted <= OK_HOLY_POWER_WASTE) {
    percentHolyPowerWastedPerformance = QualitativePerformance.Ok;
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
                performance={percentHolyPowerWastedPerformance}
                perfectPercentage={PERFECT_HOLY_POWER_WASTE}
                goodPercentage={GOOD_HOLY_POWER_WASTE}
                okPercentage={OK_HOLY_POWER_WASTE}
                percentage={percentHolyPowerWasted}
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

const PERFECT_VANGUARD_LOST = 0;
const GOOD_VANGUARD_LOST = 0.05;
const OK_VANGUARD_LOST = 0.1;
function GloryOfTheVanguardSection({ modules, info }: GuideProps<typeof CombatLogParser>) {
  const { gained, used, lostInWings, lost, lostCount } = modules.gloryOfTheVanguard;
  const percentLost = gained === 0 ? 0 : lostCount / gained;
  let percentLostPerformance = QualitativePerformance.Fail;
  if (percentLost <= PERFECT_VANGUARD_LOST) {
    percentLostPerformance = QualitativePerformance.Perfect;
  } else if (percentLost <= GOOD_VANGUARD_LOST) {
    percentLostPerformance = QualitativePerformance.Good;
  } else if (percentLost <= OK_VANGUARD_LOST) {
    percentLostPerformance = QualitativePerformance.Ok;
  }

  return (
    <Section title="Glory of the Vanguard">
      <SubSection title="Vanguard">
        <p>
          Spend every <SpellLink spell={SPELLS.VANGUARD_BUFF} /> proc on{' '}
          <SpellLink spell={talents.AVENGERS_SHIELD_TALENT} /> before it runs out. Procs that were
          up at any point during your wings aren't counted, even if they drop after your wings end.
        </p>
        <RoundedPanel>
          <strong>
            <SpellLink spell={SPELLS.VANGUARD_BUFF} /> procs
          </strong>
          <p>
            You lost{' '}
            <PerformancePercentage
              performance={percentLostPerformance}
              perfectPercentage={PERFECT_VANGUARD_LOST}
              goodPercentage={GOOD_VANGUARD_LOST}
              okPercentage={OK_VANGUARD_LOST}
              percentage={percentLost}
              flatAmount={lostCount}
            />{' '}
            of your {gained} procs. {used} were spent on{' '}
            <SpellLink spell={talents.AVENGERS_SHIELD_TALENT} />
            {lostInWings > 0 && <>, and {lostInWings} dropped during or after wings</>}.
          </p>
          {lost.length > 0 && (
            <p>
              <small>
                Lost at{' '}
                {lost
                  .map(
                    ({ timestamp, count }) =>
                      formatDuration(timestamp - info.fightStart) +
                      (count > 1 ? ` (${count})` : ''),
                  )
                  .join(', ')}
              </small>
            </p>
          )}
        </RoundedPanel>
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
