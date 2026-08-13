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
import SPELLS from 'common/SPELLS';
import { formatDuration, formatNumber, formatPercentage } from 'common/format';
import { PerformanceMark } from 'interface/guide';
import PerformanceStrongWithTooltip from 'interface/PerformanceStrongWithTooltip';
import { MAX_VANGUARD_STACKS } from './modules/talents/Vanguard';

export default function Guide({ modules, events, info }: GuideProps<typeof CombatLogParser>) {
  return (
    <>
      <Section title="Core Skills">
        <FoundationDowntimeSection />
        <FoundationCooldownSection />
      </Section>
      <ResourceUsageSection modules={modules} events={events} info={info} />
      <Section title="Rotation">
        {!info.combatant.hasTalent(talents.LIGHTS_GUIDANCE_TALENT) && (
          <AlertWarning>
            Rotational analysis for{' '}
            <SpellLink spell={talents.HOLY_ARMAMENTS_PROTECTION_TALENT}>Lightsmith</SpellLink> is
            not implemented at this time.
          </AlertWarning>
        )}
        <AplSectionData checker={check} apl={apl} />
      </Section>
      <MitigationSection />
      <ActiveMitigationSection />
      <PreparationSection />
    </>
  );
}

const PERFECT_HOLY_POWER_CAP = 0.1;
const GOOD_HOLY_POWER_CAP = 0.15;
const OK_HOLY_POWER_CAP = 0.2;
function ResourceUsageSection({ modules, events, info }: GuideProps<typeof CombatLogParser>) {
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
        <WingsHolyPowerPanels modules={modules} events={events} info={info} />
      </SubSection>
      <SacredWeaponCoverageSubSection modules={modules} events={events} info={info} />
      <VanguardSubSection modules={modules} events={events} info={info} />
    </Section>
  );
}

const PERFECT_WINGS_HP_WASTE = 0.05;
const GOOD_WINGS_HP_WASTE = 0.1;
const OK_WINGS_HP_WASTE = 0.15;

function gradeWaste(pct: number) {
  if (pct <= PERFECT_WINGS_HP_WASTE) {
    return QualitativePerformance.Perfect;
  }
  if (pct <= GOOD_WINGS_HP_WASTE) {
    return QualitativePerformance.Good;
  }
  if (pct <= OK_WINGS_HP_WASTE) {
    return QualitativePerformance.Ok;
  }
  return QualitativePerformance.Fail;
}

/**
 * Holy Power waste split by whether the damage cooldown was up. Rendered as a pair of
 * panels inside the Holy Power subsection so the two rates sit next to each other -
 * during wings Hammer of Wrath replaces Judgment and floods generation, so the in-window
 * rate is a much harder target than the out-of-window one and the two are not comparable
 * to a single overall figure.
 */
function WingsHolyPowerPanels({ modules }: GuideProps<typeof CombatLogParser>) {
  const wings = modules.wingsHolyPower;
  if (!wings.active || !wings.wingsSpell || wings.generatedInWings === 0) {
    return null;
  }
  const wingsSpell = wings.wingsSpell;

  return (
    <SideBySidePanels>
      <RoundedPanel>
        <strong>
          Inside <SpellLink spell={wingsSpell} />
        </strong>
        <p>
          You wasted{' '}
          <PerformancePercentage
            performance={gradeWaste(wings.percentWastedInWings)}
            perfectPercentage={PERFECT_WINGS_HP_WASTE}
            goodPercentage={GOOD_WINGS_HP_WASTE}
            okPercentage={OK_WINGS_HP_WASTE}
            percentage={wings.percentWastedInWings}
            flatAmount={wings.wastedInWings}
          />{' '}
          of the {wings.generatedInWings} <ResourceLink id={RESOURCE_TYPES.HOLY_POWER.id} />{' '}
          generated during <SpellLink spell={wingsSpell} />.
        </p>
        <small>
          <SpellLink spell={SPELLS.HAMMER_OF_WRATH_PROTECTION} /> replaces{' '}
          <SpellLink spell={SPELLS.JUDGMENT_CAST_PROTECTION} /> here, so generation is much faster
          and overcapping is easier.
        </small>
      </RoundedPanel>
      <RoundedPanel>
        <strong>
          Outside <SpellLink spell={wingsSpell} />
        </strong>
        <p>
          You wasted{' '}
          <PerformancePercentage
            performance={gradeWaste(wings.percentWastedOutsideWings)}
            perfectPercentage={PERFECT_WINGS_HP_WASTE}
            goodPercentage={GOOD_WINGS_HP_WASTE}
            okPercentage={OK_WINGS_HP_WASTE}
            percentage={wings.percentWastedOutsideWings}
            flatAmount={wings.wastedOutsideWings}
          />{' '}
          of the {wings.generatedOutsideWings} <ResourceLink id={RESOURCE_TYPES.HOLY_POWER.id} />{' '}
          generated in the normal rotation.
        </p>
        <small>
          {formatPercentage(wings.shareOfWasteInWings, 0)}% of all your wasted{' '}
          <ResourceLink id={RESOURCE_TYPES.HOLY_POWER.id} /> happened inside{' '}
          <SpellLink spell={wingsSpell} />.
        </small>
      </RoundedPanel>
    </SideBySidePanels>
  );
}

const PERFECT_SW_COVERAGE = 1;
const GOOD_SW_COVERAGE = 0.95;
const OK_SW_COVERAGE = 0.85;
function SacredWeaponCoverageSubSection({ modules, info }: GuideProps<typeof CombatLogParser>) {
  const sw = modules.sacredWeaponCoverage;
  if (!sw.active || !sw.wingsSpell || sw.totalWingsDuration === 0) {
    return null;
  }

  const pct = sw.percentCovered;
  let performance = QualitativePerformance.Fail;
  if (pct >= PERFECT_SW_COVERAGE) {
    performance = QualitativePerformance.Perfect;
  } else if (pct >= GOOD_SW_COVERAGE) {
    performance = QualitativePerformance.Good;
  } else if (pct >= OK_SW_COVERAGE) {
    performance = QualitativePerformance.Ok;
  }

  const uncovered = sw.uncoveredWindows;

  return (
    <SubSection title="Sacred Weapon during Cooldowns">
      <p>
        Keeping <SpellLink spell={SPELLS.SACRED_WEAPON_BUFF} /> up across{' '}
        <SpellLink spell={sw.wingsSpell} /> is worth more than raw uptime elsewhere, so it is
        measured against those windows specifically.
      </p>
      <SideBySidePanels>
        <RoundedPanel>
          <strong>
            <SpellLink spell={sw.wingsSpell} /> Coverage
          </strong>
          <p>
            <PerformanceStrongWithTooltip
              performance={performance}
              tooltip={
                <>
                  <PerformanceMark perf={QualitativePerformance.Perfect} /> Perfect &gt;= 100%
                  <br />
                  <PerformanceMark perf={QualitativePerformance.Good} /> Good &gt;= 95%
                  <br />
                  <PerformanceMark perf={QualitativePerformance.Ok} /> OK &gt;= 85%
                </>
              }
            >
              {formatPercentage(pct, 1)}%
            </PerformanceStrongWithTooltip>{' '}
            of your {sw.windows.length} <SpellLink spell={sw.wingsSpell} /> window
            {sw.windows.length === 1 ? '' : 's'} had <SpellLink spell={SPELLS.SACRED_WEAPON_BUFF} />{' '}
            active.
          </p>
        </RoundedPanel>
        <RoundedPanel>
          <strong>Windows with gaps</strong>
          {uncovered.length === 0 ? (
            <p>
              Every <SpellLink spell={sw.wingsSpell} /> window was fully covered.
            </p>
          ) : (
            <ul>
              {uncovered.map((w, i) => (
                <li key={i}>
                  {formatDuration(w.start - (info?.fightStart ?? w.start))} &mdash;{' '}
                  {formatPercentage(w.covered / (w.end - w.start), 0)}% covered (
                  {formatNumber((w.end - w.start - w.covered) / 1000)}s uncovered)
                </li>
              ))}
            </ul>
          )}
        </RoundedPanel>
      </SideBySidePanels>
    </SubSection>
  );
}

const PERFECT_VANGUARD_WASTE = 0.05;
const GOOD_VANGUARD_WASTE = 0.1;
const OK_VANGUARD_WASTE = 0.2;
function VanguardSubSection({ modules, info }: GuideProps<typeof CombatLogParser>) {
  const vanguard = modules.vanguard;
  if (!vanguard.active) {
    return null;
  }

  const percentWasted = vanguard.percentWasted;
  let performance = QualitativePerformance.Fail;
  if (percentWasted <= PERFECT_VANGUARD_WASTE) {
    performance = QualitativePerformance.Perfect;
  } else if (percentWasted <= GOOD_VANGUARD_WASTE) {
    performance = QualitativePerformance.Good;
  } else if (percentWasted <= OK_VANGUARD_WASTE) {
    performance = QualitativePerformance.Ok;
  }

  return (
    <SubSection title="Vanguard Procs">
      <p>
        <SpellLink spell={talents.GLORY_OF_THE_VANGUARD_1_PROTECTION_TALENT} /> gives{' '}
        <SpellLink spell={SPELLS.JUDGMENT_CAST_PROTECTION} /> a chance to grant{' '}
        <SpellLink spell={SPELLS.VANGUARD_BUFF} />, empowering your next{' '}
        <SpellLink spell={talents.AVENGERS_SHIELD_TALENT} />. It stacks up to {MAX_VANGUARD_STACKS},
        so you can bank a second proc — but a third arriving before you spend one is lost. Spend
        stacks with <SpellLink spell={talents.AVENGERS_SHIELD_TALENT} /> rather than sitting at{' '}
        {MAX_VANGUARD_STACKS}.
      </p>
      <SideBySidePanels>
        <RoundedPanel>
          <strong>
            <SpellLink spell={SPELLS.VANGUARD_BUFF} /> Waste
          </strong>
          <p>
            You wasted{' '}
            <PerformancePercentage
              performance={performance}
              perfectPercentage={PERFECT_VANGUARD_WASTE}
              goodPercentage={GOOD_VANGUARD_WASTE}
              okPercentage={OK_VANGUARD_WASTE}
              percentage={percentWasted}
              flatAmount={vanguard.wasted}
            />{' '}
            of your <SpellLink spell={SPELLS.VANGUARD_BUFF} /> procs.
          </p>
        </RoundedPanel>
        <RoundedPanel>
          <strong>
            <SpellLink spell={SPELLS.VANGUARD_BUFF} /> Breakdown
          </strong>
          <ul>
            <li>
              <strong>{vanguard.generated}</strong> generated
            </li>
            <li>
              <strong>{vanguard.consumed}</strong> consumed by{' '}
              <SpellLink spell={talents.AVENGERS_SHIELD_TALENT} />
            </li>
            <li>
              <strong>{vanguard.overcapped}</strong> lost to overcapping (procced at{' '}
              {MAX_VANGUARD_STACKS} stacks)
            </li>
            <li>
              <strong>{vanguard.expired}</strong> expired unused
            </li>
            {vanguard.unresolved > 0 && (
              <li>
                <strong>{vanguard.unresolved}</strong> still active when the fight ended
              </li>
            )}
          </ul>
          {info.combatant.hasTalent(talents.AVENGING_WRATH_TALENT) && (
            <small>
              During <SpellLink spell={talents.AVENGING_WRATH_TALENT} /> every{' '}
              <SpellLink spell={talents.AVENGERS_SHIELD_TALENT} /> benefits from{' '}
              <SpellLink spell={SPELLS.VANGUARD_BUFF} /> regardless of procs, so overwrites inside
              that window matter less than the raw count suggests.
            </small>
          )}
        </RoundedPanel>
      </SideBySidePanels>
    </SubSection>
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
