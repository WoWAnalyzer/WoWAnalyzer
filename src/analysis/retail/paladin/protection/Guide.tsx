import { GuideProps, PerformanceMark, Section, SubSection, useInfo } from 'interface/guide';
import { AlertWarning, ResourceLink, SpellLink, Tooltip } from 'interface';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import CombatLogParser from 'analysis/retail/paladin/protection/CombatLogParser';
import { RoundedPanel, SideBySidePanels } from 'interface/guide/components/GuideDivs';
import PreparationSection from 'interface/guide/components/Preparation/PreparationSection';

import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import PerformancePercentage from 'analysis/retail/demonhunter/shared/guide/PerformancePercentage';
import PerformanceStrongWithTooltip from 'interface/PerformanceStrongWithTooltip';

import MajorDefensives from './modules/core/Defensives';
import { FoundationDowntimeSection } from 'interface/guide/foundation/FoundationDowntimeSection';
import { FoundationCooldownSection } from 'interface/guide/foundation/FoundationCooldownSection';
import { AplSectionData } from 'interface/guide/components/Apl';
import { ExplanationAndDataSubSection } from 'interface/guide/components/ExplanationRow';
import {
  ApplyBuffEvent,
  EventType,
  RefreshBuffEvent,
  UpdateSpellUsableEvent,
} from 'parser/core/Events';
import { OK_HOLY_POWER } from './modules/talents/InstrumentOfTheDivine';
import { PerformanceBoxRow } from 'interface/guide/components/PerformanceBoxRow';
import { apl, check } from './modules/core/AplCheck';
import talents from 'common/TALENTS/paladin';
import SPELLS from 'common/SPELLS/paladin';
import { formatDuration, formatPercentage } from 'common/format';

export default function Guide({ modules, events, info }: GuideProps<typeof CombatLogParser>) {
  return (
    <>
      <Section title="Core Skills">
        <FoundationDowntimeSection />
        <FoundationCooldownSection />
      </Section>
      <ResourceUsageSection modules={modules} events={events} info={info} />
      <WingsSection modules={modules} events={events} info={info} />
      <Section title="Rotation">
        {info.combatant.hasTalent(talents.LIGHTS_GUIDANCE_TALENT) && (
          <AlertWarning>
            Rotational analysis for{' '}
            <SpellLink spell={talents.LIGHTS_GUIDANCE_TALENT}>Templar</SpellLink> is untested.
          </AlertWarning>
        )}
        <AplSectionData checker={check} apl={apl} />
        {modules.gloryOfTheVanguard.active && (
          <GloryOfTheVanguardSubSection modules={modules} events={events} info={info} />
        )}
        {modules.instrumentOfTheDivine.active && (
          <InstrumentOfTheDivineSubSection modules={modules} events={events} info={info} />
        )}
      </Section>
      <MitigationSection />
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

const GRADE_LABELS: Partial<Record<QualitativePerformance, string>> = {
  [QualitativePerformance.Perfect]: 'Perfect',
  [QualitativePerformance.Good]: 'Good',
  [QualitativePerformance.Ok]: 'OK',
  [QualitativePerformance.Fail]: 'Bad',
};
const HOLY_BULWARK_SAME_CAST_MS = 1000;
const HOLY_BULWARK_PERFECT_BEFORE = 2500;
const HOLY_BULWARK_GOOD_BEFORE = 5000;
const HOLY_BULWARK_OK_BEFORE = 8000;
const HOLY_BULWARK_OK_AFTER = 8000;
function holyBulwarkPerformance(
  before: number | undefined,
  after: number | undefined,
  atMaxCharges: boolean,
) {
  if (before !== undefined && before < HOLY_BULWARK_PERFECT_BEFORE) {
    return QualitativePerformance.Perfect;
  } else if ((before !== undefined && before < HOLY_BULWARK_GOOD_BEFORE) || atMaxCharges) {
    return QualitativePerformance.Good;
  } else if (
    (before !== undefined && before < HOLY_BULWARK_OK_BEFORE) ||
    (after !== undefined && after <= HOLY_BULWARK_OK_AFTER)
  ) {
    return QualitativePerformance.Ok;
  }
  return QualitativePerformance.Fail;
}
const RIGHTEOUS_PROTECTOR_WINGS_BASE = 12000;
const WINGS_BASE = 20000;
const WINGS_DURATION_RATIOS = { perfect: 20 / 12, good: 18 / 12, ok: 15 / 12 };
function wingsDurationPerformance(
  duration: number,
  thresholds: Record<keyof typeof WINGS_DURATION_RATIOS, number>,
) {
  if (duration >= thresholds.perfect) {
    return QualitativePerformance.Perfect;
  } else if (duration >= thresholds.good) {
    return QualitativePerformance.Good;
  } else if (duration >= thresholds.ok) {
    return QualitativePerformance.Ok;
  }
  return QualitativePerformance.Fail;
}

function WingsSection({ info, events }: GuideProps<typeof CombatLogParser>) {
  if (!info.combatant.hasTalent(talents.ZEALOTS_PARAGON_TALENT)) {
    return null;
  }
  const base = info.combatant.hasTalent(talents.RIGHTEOUS_PROTECTOR_TALENT)
    ? RIGHTEOUS_PROTECTOR_WINGS_BASE
    : WINGS_BASE;
  const extension =
    info.combatant.getTalentRank(talents.ZEALOTS_PARAGON_TALENT) /
    talents.ZEALOTS_PARAGON_TALENT.maxRanks;
  const threshold = (ratio: number) =>
    Math.round((base * (1 + (ratio - 1) * extension)) / 1000) * 1000;
  const thresholds = {
    perfect: threshold(WINGS_DURATION_RATIOS.perfect),
    good: threshold(WINGS_DURATION_RATIOS.good),
    ok: threshold(WINGS_DURATION_RATIOS.ok),
  };
  const thresholdsTooltip = (
    <>
      <div>
        <PerformanceMark perf={QualitativePerformance.Perfect} /> Perfect:{' '}
        {thresholds.perfect / 1000}+ sec
      </div>
      <div>
        <PerformanceMark perf={QualitativePerformance.Good} /> Good: {thresholds.good / 1000}+ sec
      </div>
      <div>
        <PerformanceMark perf={QualitativePerformance.Ok} /> OK: {thresholds.ok / 1000}+ sec
      </div>
      <div>
        <PerformanceMark perf={QualitativePerformance.Fail} /> Bad: below {thresholds.ok / 1000} sec
      </div>
    </>
  );
  const wingsSpell = info.combatant.hasTalent(talents.SENTINEL_TALENT)
    ? SPELLS.SENTINEL
    : talents.AVENGING_WRATH_TALENT;
  const wingsUptime = info.combatant.getBuffUptime(wingsSpell.id) / info.fightDuration;
  const isLightsmith = info.combatant.hasTalent(talents.HOLY_ARMAMENTS_PROTECTION_TALENT);
  const bulwarkTooltip = (
    <>
      <div>
        <PerformanceMark perf={QualitativePerformance.Perfect} /> Perfect: less than{' '}
        {HOLY_BULWARK_PERFECT_BEFORE / 1000} sec before wings
      </div>
      <div>
        <PerformanceMark perf={QualitativePerformance.Good} /> Good: less than{' '}
        {HOLY_BULWARK_GOOD_BEFORE / 1000} sec before wings, or cast at max charges
      </div>
      <div>
        <PerformanceMark perf={QualitativePerformance.Ok} /> OK: less than{' '}
        {HOLY_BULWARK_OK_BEFORE / 1000} sec before or up to {HOLY_BULWARK_OK_AFTER / 1000} sec after
        wings
      </div>
      <div>
        <PerformanceMark perf={QualitativePerformance.Fail} /> Bad: otherwise
      </div>
    </>
  );
  const bulwarkCasts = events
    .filter(
      (event): event is ApplyBuffEvent | RefreshBuffEvent =>
        (event.type === EventType.ApplyBuff || event.type === EventType.RefreshBuff) &&
        event.sourceID === info.playerId &&
        event.ability.guid === SPELLS.HOLY_BULWARK_BUFF.id,
    )
    .map((event) => event.timestamp)
    .filter(
      (timestamp, index, timestamps) =>
        index === 0 || timestamp - timestamps[index - 1] >= HOLY_BULWARK_SAME_CAST_MS,
    );
  const wingsBuffs = info.combatant.getBuffHistory(wingsSpell.id);
  const casts = wingsBuffs.map((buff) => {
    const end = buff.end ?? info.fightEnd;
    return { start: buff.start, duration: end - buff.start, fightEnded: end >= info.fightEnd };
  });
  const holyArmaments = info.abilities.find((ability) =>
    (Array.isArray(ability.spell) ? ability.spell : [ability.spell]).includes(
      talents.HOLY_ARMAMENTS_PROTECTION_TALENT.id,
    ),
  );
  const holyArmamentsUpdates = events.filter(
    (event): event is UpdateSpellUsableEvent =>
      event.type === EventType.UpdateSpellUsable &&
      event.ability.guid === holyArmaments?.primarySpell,
  );
  const wingsStarts = casts.map(({ start }) => start);
  const bulwarks = bulwarkCasts.map((timestamp) => {
    const nextWings = wingsStarts.find((start) => start >= timestamp);
    const previousWings = wingsStarts.findLast((start) => start < timestamp);
    const lastUpdate = holyArmamentsUpdates.findLast((update) => update.timestamp < timestamp);
    const before = nextWings === undefined ? undefined : nextWings - timestamp;
    const after = previousWings === undefined ? undefined : timestamp - previousWings;
    const atMaxCharges =
      lastUpdate === undefined || lastUpdate.chargesAvailable >= lastUpdate.maxCharges;
    return {
      timestamp,
      before,
      after,
      atMaxCharges,
      performance: holyBulwarkPerformance(before, after, atMaxCharges),
    };
  });
  const wingsWithPerfectBulwark = wingsStarts.filter((start) =>
    bulwarkCasts.some(
      (timestamp) => timestamp <= start && start - timestamp < HOLY_BULWARK_PERFECT_BEFORE,
    ),
  ).length;

  return (
    <Section title={wingsSpell.name}>
      <ExplanationAndDataSubSection
        explanation={
          <p>
            Our main cooldown, <SpellLink spell={talents.AVENGING_WRATH_TALENT} />/
            <SpellLink spell={SPELLS.SENTINEL} />, has a base duration of 20 sec (12 sec with{' '}
            <SpellLink spell={talents.RIGHTEOUS_PROTECTOR_TALENT} />
            ). With <SpellLink spell={talents.ZEALOTS_PARAGON_TALENT} />, each{' '}
            <SpellLink spell={SPELLS.HAMMER_OF_WRATH_PROTECTION} /> cast extends the active{' '}
            <SpellLink spell={talents.AVENGING_WRATH_TALENT} />/
            <SpellLink spell={SPELLS.SENTINEL} /> by 0.5 sec/1 sec. A big part of maximizing your
            damage is to ensure you play around this.
          </p>
        }
        data={
          <div>
            <p>
              <strong>
                <SpellLink spell={wingsSpell} /> uptime: {formatPercentage(wingsUptime)}%
              </strong>
            </p>
            <table className="table table-condensed">
              <thead>
                <tr>
                  <th>Cast</th>
                  <th>Duration</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {casts.map(({ start, duration, fightEnded }) => (
                  <tr key={start}>
                    <td>{formatDuration(start - info.fightStart)}</td>
                    <td>{(duration / 1000).toFixed(1)} sec</td>
                    <td>
                      {fightEnded ? (
                        <small>(fight ended)</small>
                      ) : (
                        <Tooltip content={thresholdsTooltip}>
                          <span>
                            <PerformanceMark
                              perf={wingsDurationPerformance(duration, thresholds)}
                            />
                          </span>
                        </Tooltip>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        }
      />
      {isLightsmith && (
        <ExplanationAndDataSubSection
          title="Holy Bulwark"
          explanation={
            <p>
              <SpellLink spell={talents.HOLY_ARMAMENTS_PROTECTION_TALENT}>Holy Bulwark</SpellLink>{' '}
              grants a lot of <SpellLink spell={talents.GRAND_CRUSADER_TALENT} /> procs through{' '}
              <SpellLink spell={talents.REFLECTION_OF_RADIANCE_TALENT} />. With{' '}
              <SpellLink spell={talents.CRUSADERS_JUDGMENT_TALENT} />, each of these reduces the
              cooldown of <SpellLink spell={SPELLS.HAMMER_OF_WRATH_PROTECTION} />, and each{' '}
              <SpellLink spell={SPELLS.HAMMER_OF_WRATH_PROTECTION} /> extends{' '}
              <SpellLink spell={wingsSpell} /> through{' '}
              <SpellLink spell={talents.ZEALOTS_PARAGON_TALENT} />. Therefore, you should cast{' '}
              <SpellLink spell={talents.HOLY_ARMAMENTS_PROTECTION_TALENT}>Holy Bulwark</SpellLink>{' '}
              immediately before <SpellLink spell={wingsSpell} /> to get the most out of it.
            </p>
          }
          data={
            <RoundedPanel>
              <strong>
                <SpellLink spell={talents.HOLY_ARMAMENTS_PROTECTION_TALENT}>Holy Bulwark</SpellLink>{' '}
                casts
              </strong>
              <PerformanceBoxRow
                values={bulwarks.map(({ timestamp, before, after, atMaxCharges, performance }) => ({
                  value: performance,
                  tooltip: (
                    <>
                      <div>
                        <PerformanceMark perf={performance} /> {GRADE_LABELS[performance]}:{' '}
                        {formatDuration(timestamp - info.fightStart)}
                      </div>
                      {before !== undefined && (
                        <div>{(before / 1000).toFixed(1)} sec before wings</div>
                      )}
                      {after !== undefined && (
                        <div>{(after / 1000).toFixed(1)} sec after wings started</div>
                      )}
                      {atMaxCharges && <div>Cast at max charges</div>}
                    </>
                  ),
                }))}
              />
              <p>
                {wingsWithPerfectBulwark} of your {wingsStarts.length} wings had{' '}
                <SpellLink spell={talents.HOLY_ARMAMENTS_PROTECTION_TALENT}>Holy Bulwark</SpellLink>{' '}
                less than {HOLY_BULWARK_PERFECT_BEFORE / 1000} sec before them.
              </p>
              <Tooltip content={bulwarkTooltip}>
                <small>Grading</small>
              </Tooltip>
            </RoundedPanel>
          }
        />
      )}
    </Section>
  );
}

const PERFECT_VALOR_AT_MAX = 0.9;
const GOOD_VALOR_AT_MAX = 0.8;
const OK_VALOR_AT_MAX = 0.7;
function InstrumentOfTheDivineSubSection({ modules, info }: GuideProps<typeof CombatLogParser>) {
  const { valorCasts, castsAtMax } = modules.instrumentOfTheDivine;
  const percentAtMax = valorCasts.length === 0 ? 1 : castsAtMax.length / valorCasts.length;
  let performance = QualitativePerformance.Fail;
  if (percentAtMax >= PERFECT_VALOR_AT_MAX) {
    performance = QualitativePerformance.Perfect;
  } else if (percentAtMax >= GOOD_VALOR_AT_MAX) {
    performance = QualitativePerformance.Good;
  } else if (percentAtMax >= OK_VALOR_AT_MAX) {
    performance = QualitativePerformance.Ok;
  }

  return (
    <ExplanationAndDataSubSection
      title="Instrument of the Divine"
      explanation={
        <>
          <p>
            With <SpellLink spell={talents.INSTRUMENT_OF_THE_DIVINE_TALENT} />, build to 5{' '}
            <ResourceLink id={RESOURCE_TYPES.HOLY_POWER.id} /> before casting{' '}
            <SpellLink spell={SPELLS.SHIELD_OF_THE_RIGHTEOUS} /> while you have{' '}
            <SpellLink spell={SPELLS.VALOR} />. You gain <SpellLink spell={SPELLS.VALOR} /> from
            consuming <SpellLink spell={SPELLS.VANGUARD_BUFF} />.
          </p>
          <p>
            At 5 <ResourceLink id={RESOURCE_TYPES.HOLY_POWER.id} />,{' '}
            <SpellLink spell={talents.INSTRUMENT_OF_THE_DIVINE_TALENT} /> increases the damage of{' '}
            <SpellLink spell={SPELLS.SHIELD_OF_THE_RIGHTEOUS} /> by 100%, and{' '}
            <SpellLink spell={SPELLS.VALOR} /> increases it by another 100%. These multiply, so{' '}
            <SpellLink spell={SPELLS.SHIELD_OF_THE_RIGHTEOUS} /> with{' '}
            <SpellLink spell={SPELLS.VALOR} /> deals 4 times its normal damage at 5{' '}
            <ResourceLink id={RESOURCE_TYPES.HOLY_POWER.id} />.
          </p>
        </>
      }
      data={
        <RoundedPanel>
          <strong>
            <SpellLink spell={SPELLS.SHIELD_OF_THE_RIGHTEOUS} /> casts with{' '}
            <SpellLink spell={SPELLS.VALOR} />
          </strong>
          <PerformanceBoxRow
            values={valorCasts.map(({ timestamp, holyPower, divinePurpose }) => {
              const [value, grade] =
                holyPower >= 5
                  ? [QualitativePerformance.Perfect, 'Perfect']
                  : holyPower >= OK_HOLY_POWER || divinePurpose
                    ? [QualitativePerformance.Ok, 'OK']
                    : [QualitativePerformance.Fail, 'Bad'];
              return {
                value,
                tooltip: (
                  <>
                    <PerformanceMark perf={value} /> {grade}:{' '}
                    {formatDuration(timestamp - info.fightStart)}, {holyPower}{' '}
                    <ResourceLink id={RESOURCE_TYPES.HOLY_POWER.id} />
                    {divinePurpose && (
                      <>
                        {' '}
                        with <SpellLink spell={SPELLS.DIVINE_PURPOSE_BUFF} />
                      </>
                    )}
                  </>
                ),
              };
            })}
          />
          <p>
            You consumed <SpellLink spell={SPELLS.VALOR} /> at 5{' '}
            <ResourceLink id={RESOURCE_TYPES.HOLY_POWER.id} /> on{' '}
            <PerformanceStrongWithTooltip
              performance={performance}
              tooltip={
                <>
                  <div>
                    <PerformanceMark perf={QualitativePerformance.Perfect} /> Perfect:{' '}
                    {formatPercentage(PERFECT_VALOR_AT_MAX, 0)}%+
                  </div>
                  <div>
                    <PerformanceMark perf={QualitativePerformance.Good} /> Good:{' '}
                    {formatPercentage(GOOD_VALOR_AT_MAX, 0)}%+
                  </div>
                  <div>
                    <PerformanceMark perf={QualitativePerformance.Ok} /> OK:{' '}
                    {formatPercentage(OK_VALOR_AT_MAX, 0)}%+
                  </div>
                  <div>
                    <PerformanceMark perf={QualitativePerformance.Fail} /> Bad: below{' '}
                    {formatPercentage(OK_VALOR_AT_MAX, 0)}%
                  </div>
                </>
              }
            >
              {formatPercentage(percentAtMax, 0)}%
            </PerformanceStrongWithTooltip>{' '}
            of your {valorCasts.length} casts.
          </p>
        </RoundedPanel>
      }
    />
  );
}

const PERFECT_VANGUARD_LOST = 0;
const GOOD_VANGUARD_LOST = 0.05;
const OK_VANGUARD_LOST = 0.1;
function GloryOfTheVanguardSubSection({ modules, info }: GuideProps<typeof CombatLogParser>) {
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
    <ExplanationAndDataSubSection
      title="Glory of the Vanguard"
      explanation={
        <p>
          Spend every <SpellLink spell={SPELLS.VANGUARD_BUFF} /> proc on{' '}
          <SpellLink spell={talents.AVENGERS_SHIELD_TALENT} /> before it runs out. Procs that were
          up at any point during your wings aren't counted, even if they drop after your wings end.
        </p>
      }
      data={
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
      }
    />
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
