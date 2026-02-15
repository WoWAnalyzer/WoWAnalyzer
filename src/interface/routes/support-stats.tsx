import { Aggregate, ServerMetrics, loadServerMetrics } from 'common/server-metrics';
import { type Spec } from 'game/SPECS';
import LanguageSwitcher from 'interface/LanguageSwitcher';
import NavigationBar from 'interface/NavigationBar';
import { useEffect, useMemo, useState, type JSX } from 'react';
import { SpecIcon, Tooltip, TooltipElement } from '..';
import { getConfigForSpec } from 'parser/getConfig';
import GameBranch from 'game/GameBranch';
import { SupportLevel, configName } from 'parser/Config';
import { i18n } from '@lingui/core';
import styled from '@emotion/styled/macro';
import {
  BadMark,
  GoodMark,
  OkMark,
  PerfectMark,
  qualitativePerformanceToColor,
} from 'interface/guide';
import { formatPercentage } from 'common/format';
import {
  QualitativePerformanceThreshold,
  evaluateQualitativePerformanceByThreshold,
} from 'parser/ui/QualitativePerformance';
import Changelog from 'interface/Changelog';

export function Component(): JSX.Element {
  const [data, setData] = useState<Array<[Spec, Partial<ServerMetrics<Aggregate>>]>>();

  useEffect(() => {
    let canceled = false;

    loadServerMetrics().then((data) => {
      if (!canceled) {
        setData(data);
      }
    });
    return () => {
      canceled = true;
    };
  }, []);

  return (
    <div className="home-page">
      <NavigationBar>
        <LanguageSwitcher />
      </NavigationBar>
      <main className="container">{data && <StatsTable data={data} />}</main>
    </div>
  );
}

function StatsTable({
  data,
}: {
  data: Array<[Spec, Partial<ServerMetrics<Aggregate>>]>;
}): JSX.Element {
  return (
    <>
      <Table>
        <caption>Retail</caption>
        <StatsTableHeader />
        <tbody>
          {data
            .filter(([spec]) => spec.branch === GameBranch.Retail)
            .map(([spec, data]) => (
              <StatsTableRow spec={spec} metrics={data} key={configName(spec)} />
            ))}
        </tbody>
      </Table>
      <Table>
        <caption>Classic</caption>
        <StatsTableHeader />
        <tbody>
          {data
            .filter(([spec]) => spec.branch === GameBranch.Classic)
            .map(([spec, data]) => (
              <StatsTableRow spec={spec} metrics={data} key={configName(spec)} />
            ))}
        </tbody>
      </Table>
    </>
  );
}

const Table = styled.table`
  th,
  td {
    padding: 0.25em 1em;
    white-space: nowrap;
    text-align: right;
  }

  & .left {
    text-align: left;
  }

  caption {
    color: white;
    font-size: large;
  }
`;

function StatsTableHeader() {
  return (
    <thead>
      <tr>
        <th className="left">Spec</th>
        <th className="left">Support Level</th>
        <th>Last Change</th>
        <th>Patch</th>
        <th>Active Time</th>
        <th>CD Errors (per 1m)</th>
        <th>GCD Errors (per 1m)</th>
        <th>Unk. Abilities (per 1m)</th>
      </tr>
    </thead>
  );
}

function StatsTableRow({
  spec,
  metrics,
}: {
  metrics: Partial<ServerMetrics<Aggregate>>;
  spec: Spec;
}): JSX.Element {
  const config = useMemo(() => getConfigForSpec(spec), [spec]);
  const latestChangelogEntry = useMemo(() => {
    const initial = config?.changelog?.[0];

    if (!initial) {
      return undefined;
    }

    let current = initial;
    for (const entry of config!.changelog!) {
      if (Number(entry.date) > Number(current.date)) {
        current = entry;
      }
    }

    return current;
  }, [config]);
  return (
    <tr>
      <td className="left">
        <SpecIcon spec={spec} />{' '}
        <span className={spec.wclClassName}>
          {spec.specName ? i18n._(spec.specName) : spec.wclSpecName} {i18n._(spec.className)}
        </span>
      </td>
      <td className="left">
        {config?.supportLevel ? (
          <SupportLevelLabel level={config.supportLevel} />
        ) : (
          <em>Unknown</em>
        )}
      </td>
      <td>
        <TooltipElement
          content={
            config?.changelog ? (
              <Changelog changelog={config.changelog} includeCore={false} limit={5} />
            ) : null
          }
        >
          {latestChangelogEntry?.date.toDateString()}
        </TooltipElement>
      </td>
      <td>{config?.patchCompatibility}</td>
      <td>
        <StatsTableEntry
          value={metrics.activeTimeRatio}
          type={'percentage'}
          threshold={activeTimePerformance}
        />
      </td>
      <td>
        <StatsTableEntry value={metrics.cooldownErrorRate} threshold={errorRatePerformance} />
      </td>

      <td>
        <StatsTableEntry value={metrics.gcdErrorRate} threshold={errorRatePerformance} />
      </td>

      <td>
        <StatsTableEntry value={metrics.unknownAbilityErrorRate} threshold={errorRatePerformance} />
      </td>
    </tr>
  );
}

function StatsTableEntry({
  value,
  ...props
}: {
  value: Aggregate | undefined;
  type?: 'percentage' | 'absolute';
  threshold: IncompleteThreshold;
}): JSX.Element {
  if (!value) {
    return <em>No Data</em>;
  }

  const formatValue =
    props.type === 'percentage'
      ? (value: number) => `${formatPercentage(value)}%`
      : (value: number) => value.toFixed(2);

  const perf = evaluateQualitativePerformanceByThreshold({
    ...props.threshold,
    actual: value.avg,
  } as QualitativePerformanceThreshold);

  return (
    <Tooltip
      content={
        <>
          The average is <strong>{formatValue(value.avg)}</strong>, and the data ranges from a min
          of <strong>{formatValue(value.min)}</strong> to a max of{' '}
          <strong>{formatValue(value.max)}</strong>
        </>
      }
    >
      <div style={{ cursor: 'pointer', color: qualitativePerformanceToColor(perf) }}>
        {formatValue(value.avg)}
      </div>
    </Tooltip>
  );
}

function SupportLevelLabel({ level }: { level: SupportLevel }): JSX.Element {
  switch (level) {
    case SupportLevel.Foundation:
      return (
        <>
          <OkMark /> Foundation
        </>
      );
    case SupportLevel.MaintainedFull:
      return (
        <>
          <PerfectMark /> Maintained (Full)
        </>
      );
    case SupportLevel.MaintainedPartial:
      return (
        <>
          <GoodMark /> Maintained (Partial)
        </>
      );
    case SupportLevel.Unmaintained:
      return (
        <>
          <BadMark /> Unmaintained
        </>
      );
  }
}

type IncompleteThreshold = Omit<QualitativePerformanceThreshold, 'actual'>;

const activeTimePerformance: IncompleteThreshold = {
  isGreaterThan: {
    ok: 0.5,
    good: 0.7,
  },
};

const errorRatePerformance: IncompleteThreshold = {
  isLessThan: {
    perfect: 0.1,
    good: 2,
    ok: 5,
    fail: 10,
  },
};
