import styled from '@emotion/styled';
import { formatNumber } from 'common/format';
import * as MAGIC_SCHOOLS from 'game/MAGIC_SCHOOLS';
import { color } from 'game/MAGIC_SCHOOLS';
import { SpellLink, TooltipElement } from 'interface';
import {
  BadColor,
  OkColor,
  PerformanceMark,
  SubSection,
  useAnalyzer,
  useAnalyzers,
} from 'interface/guide';
import Explanation from 'interface/guide/components/Explanation';
import ExplanationRow from 'interface/guide/components/ExplanationRow';
import PassFailBar from 'interface/guide/components/PassFailBar';
import { PerformanceBoxRow } from 'interface/guide/components/PerformanceBoxRow';
import { AbilityEvent, EventType, HasAbility, HasSource, SourcedEvent } from 'parser/core/Events';
import CastEfficiency from 'parser/shared/modules/CastEfficiency';
import Enemies, { encodeTargetString } from 'parser/shared/modules/Enemies';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { useCallback, useMemo, useState, CSSProperties } from 'react';
import { MAJOR_ANALYZERS } from '../config';
import {
  MajorDefensive,
  MitigatedEvent,
  Mitigation,
  MitigationTooltipSegment,
  PerformanceUsageRow,
} from '../core';
import { useMaxMitigationValue } from './Timeline';
import TooltipProvider from 'interface/TooltipProvider';

const MissingCastBoxEntry = {
  value: QualitativePerformance.Fail,
  tooltip: (
    <PerformanceUsageRow>
      <PerformanceMark perf={QualitativePerformance.Fail} /> Potential cast went unused
    </PerformanceUsageRow>
  ),
};

const PossibleMissingCastBoxEntry = {
  value: QualitativePerformance.Ok,
  tooltip: (
    <PerformanceUsageRow>
      <PerformanceMark perf={QualitativePerformance.Ok} /> Potential cast went unused, but may have
      been intentionally saved to handle a mechanic.
    </PerformanceUsageRow>
  ),
};

const NoData = styled.div`
  color: #999;
`;

const CooldownUsageDetailsContainer = styled.div`
  display: grid;
  grid-template-rows: max-content max-content 1fr;

  & .performance-block.selected {
    height: 1em;
  }
`;

const TableSegmentContainer = styled.td`
  line-height: 1em;
  height: 1em;
  min-width: 100px;

  ${MitigationTooltipSegment} {
    margin-top: 0.1em;
  }
`;

const SmallPassFailBar = styled(PassFailBar)`
  width: 100px;
  min-width: 100px;
`;

const NumericColumn = styled.td`
  text-align: right;
`;

const CooldownDetailsContainer = styled.div`
  display: grid;
  margin-top: 1rem;
  grid-template-areas: 'talent source';
  grid-template-columns: 40% 1fr;

  gap: 1rem;
  height: 100%;
  align-items: start;

  ${NoData} {
    justify-self: center;
    align-self: center;
    grid-column: 1 / -1;
  }

  & > table {
    width: 100%;
  }
  & > table td {
    padding-right: 1rem;
  }
`;

export const Highlight = styled.span<{ color: string; textColor?: string }>`
  background-color: ${(props) => props.color};
  padding: 0 3px;
  ${(props) => (props.textColor ? `color: ${props.textColor};` : '')}
`;

export function damageBreakdown<T>(
  data: T[],
  selectSpellId: (datum: T) => number,
  selectSource: (datum: T) => string,
): Map<number, Map<string, T[]>> {
  const bySpell = new Map();
  for (const datum of data) {
    const ability = selectSpellId(datum);
    let bySource = bySpell.get(ability);
    if (!bySource) {
      bySource = new Map();
      bySpell.set(ability, bySource);
    }

    const source = selectSource(datum);
    let hits = bySource.get(source);
    if (!hits) {
      hits = [];
      bySource.set(source, hits);
    }

    hits.push(datum);
  }

  return bySpell;
}

const damageSourceStyle: CSSProperties = {
  overflowX: 'hidden',
  textOverflow: 'ellipsis',
  maxWidth: '100%',
  whiteSpace: 'nowrap',
};

export function DamageSourceLink({
  event,
  showSourceName,
}: {
  event: AbilityEvent<any> & Partial<SourcedEvent<any>>;
  showSourceName?: boolean;
}): JSX.Element | null {
  const enemies = useAnalyzer(Enemies);

  const ability = event.ability;
  const color = MAGIC_SCHOOLS.color(ability.type);

  // this prevents unneeded re-renders of child components due to object identity differences
  const style = useMemo(() => ({ ...damageSourceStyle, color }), [color]);

  if (showSourceName) {
    const enemy = enemies?.getSourceEntity(event);
    return (
      <a href={TooltipProvider.npc(enemy?.guid ?? 0)} style={style}>
        {enemy?.name ?? 'Unknown'} ({ability.name})
      </a>
    );
  } else {
    return (
      <SpellLink id={ability.guid} style={style}>
        {ability.name}
      </SpellLink>
    );
  }
}

const CooldownDetails = <ApplyEventType extends EventType, RemoveEventType extends EventType>({
  analyzer,
  mit,
}: {
  analyzer: MajorDefensive<ApplyEventType, RemoveEventType>;
  mit?: Mitigation<ApplyEventType, RemoveEventType>;
}) => {
  if (!mit) {
    return (
      <CooldownDetailsContainer>
        <NoData>Click on a box in the cast breakdown to view details.</NoData>
      </CooldownDetailsContainer>
    );
  }

  const segments = analyzer.mitigationSegments(mit);

  const damageTakenBreakdown = damageBreakdown(
    mit.mitigated,
    (event) => (HasAbility(event.event) ? event.event.ability.guid : 0),
    (event) => (HasSource(event.event) ? encodeTargetString(event.event.sourceID) : '0'),
  );

  const splitMelees = (damageTakenBreakdown.get(1)?.size ?? 0) > 1;
  const damageTakenRows = Array.from(damageTakenBreakdown.entries())
    .flatMap(([id, bySource]): [number, MitigatedEvent[]][] => {
      if (id === 1 && splitMelees) {
        // make each melee source its own row
        return Array.from(bySource.values()).map((events) => [id, events]);
      } else {
        // put all the events into a single list.
        return [[id, Array.from(bySource.values()).flat()]];
      }
    })
    .sort(([, eventsA], [, eventsB]) => {
      const totalA = eventsA.reduce((a, b) => a + b.mitigatedAmount, 0);
      const totalB = eventsB.reduce((a, b) => a + b.mitigatedAmount, 0);

      return totalB - totalA;
    })
    // limit to top 5 damage sources
    .slice(0, 5);

  const maxDamageTaken = Math.max.apply(
    null,
    damageTakenRows.map(([, events]) => events.reduce((a, b) => a + b.mitigatedAmount, 0)),
  );

  const maxValue = Math.max(analyzer.firstSeenMaxHp, mit.amount);

  return (
    <CooldownDetailsContainer>
      <table>
        <tbody>
          <tr>
            <td>Total Mitigated</td>
            <NumericColumn>{formatNumber(mit.amount)}</NumericColumn>
            <td>
              <SmallPassFailBar
                pass={mit.amount}
                total={analyzer.firstSeenMaxHp}
                passTooltip="Amount of damage mitigated, relative to your maximum health"
              />
            </td>
          </tr>
          <tr>
            <td colSpan={3}>
              <strong>Mitigation by Talent</strong>
            </td>
          </tr>
          {segments.map((seg, ix) => (
            <tr key={ix}>
              <td style={{ width: '100%' }}>{seg.tooltip}</td>
              <NumericColumn>{formatNumber(seg.amount)}</NumericColumn>
              <TableSegmentContainer>
                {ix > 0 && (
                  <MitigationTooltipSegment
                    color="rgba(255, 255, 255, 0.05)"
                    width={segments.slice(0, ix).reduce((a, b) => a + b.amount, 0) / maxValue}
                  />
                )}
                <MitigationTooltipSegment color={seg.color} width={seg.amount / maxValue} />
                {ix < segments.length - 1 && (
                  <MitigationTooltipSegment
                    color="rgba(255, 255, 255, 0.05)"
                    width={segments.slice(ix + 1).reduce((a, b) => a + b.amount, 0) / maxValue}
                  />
                )}
              </TableSegmentContainer>
            </tr>
          ))}
        </tbody>
      </table>
      <table>
        <tbody>
          <tr>
            <td colSpan={3}>
              <strong>Mitigation by Damage Source</strong>
            </td>
          </tr>
          {damageTakenRows.map(([spellId, events], ix) => {
            // FIXME: this is unchecked. possible undefined error
            const keyEvent = events.find(({ event }) => HasAbility(event))!
              .event as AbilityEvent<any>;
            const rowColor = color(keyEvent.ability.type);

            const mitigatedAmount = events.reduce((a, b) => a + b.mitigatedAmount, 0);

            return (
              <tr key={ix}>
                <td style={{ width: '1%' }}>
                  <DamageSourceLink
                    showSourceName={spellId === 1 && splitMelees}
                    event={keyEvent}
                  />
                </td>
                <NumericColumn>{formatNumber(mitigatedAmount)}</NumericColumn>
                <TableSegmentContainer>
                  <MitigationTooltipSegment
                    color={rowColor}
                    width={mitigatedAmount / maxDamageTaken}
                  />
                </TableSegmentContainer>
              </tr>
            );
          })}
        </tbody>
      </table>
    </CooldownDetailsContainer>
  );
};

const CooldownUsage = <ApplyEventType extends EventType, RemoveEventType extends EventType>({
  analyzer,
}: {
  analyzer: MajorDefensive<ApplyEventType, RemoveEventType>;
}) => {
  const [selectedMit, setSelectedMit] = useState<number | undefined>();
  const maxValue = useMaxMitigationValue();
  const castEfficiency = useAnalyzer(CastEfficiency)?.getCastEfficiencyForSpell(analyzer.spell);
  const possibleUses = castEfficiency?.maxCasts ?? 0;
  const performance = analyzer.mitigationPerformance(maxValue);
  const actualCasts = performance.length;

  if (actualCasts === 0 && possibleUses > 1) {
    // if they didn't cast it and could have multiple times, we call all possible uses bad
    //
    // the possibleUses > 1 check excludes this from happening on very short fights (such as early wipes)
    for (let i = 0; i < possibleUses; i += 1) {
      performance.push(MissingCastBoxEntry);
    }
  } else {
    // if they cast it at least once, have some forgiveness. up to half (rounded up)
    // of possible casts get a yellow color. any beyond that are red.
    for (let i = possibleUses; i > actualCasts; i -= 1) {
      if (i > possibleUses / 2) {
        performance.push(PossibleMissingCastBoxEntry);
      } else {
        performance.push(MissingCastBoxEntry);
      }
    }
  }

  const mitigations = analyzer.mitigations;

  const onClickBox = useCallback(
    (index) => {
      if (index >= mitigations.length) {
        setSelectedMit(undefined);
      } else {
        setSelectedMit(index);
      }
    },
    [mitigations.length],
  );

  return (
    <SubSection>
      <ExplanationRow>
        <Explanation>{analyzer.description()}</Explanation>
        <CooldownUsageDetailsContainer>
          <div>
            <strong>Cast Breakdown</strong>{' '}
            <small>
              - These boxes each cast, colored by how much damage was mitigated. Missed casts are
              also shown in{' '}
              <TooltipElement content="Used for casts that may have been skipped in order to cover major damage events.">
                <Highlight color={OkColor} textColor="black">
                  yellow
                </Highlight>
              </TooltipElement>{' '}
              or{' '}
              <TooltipElement content="Used for casts that could have been used without impacting your other usage.">
                <Highlight color={BadColor} textColor="white">
                  red
                </Highlight>
              </TooltipElement>
              .
            </small>
          </div>
          <PerformanceBoxRow
            values={performance.map((p, ix) =>
              ix === selectedMit ? { ...p, className: 'selected' } : p,
            )}
            onClickBox={onClickBox}
          />
          <CooldownDetails
            mit={selectedMit !== undefined ? mitigations[selectedMit] : undefined}
            analyzer={analyzer}
          />
        </CooldownUsageDetailsContainer>
      </ExplanationRow>
    </SubSection>
  );
};

const AllCooldownUsageList = () => {
  const analyzers = useAnalyzers(MAJOR_ANALYZERS);

  return (
    <div>
      {analyzers
        .filter((analyzer) => analyzer.active)
        .map((analyzer) => (
          <CooldownUsage key={analyzer.constructor.name} analyzer={analyzer} />
        ))}
    </div>
  );
};

export default AllCooldownUsageList;
