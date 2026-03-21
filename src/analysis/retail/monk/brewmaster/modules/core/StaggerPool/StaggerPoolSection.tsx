import { SubSection, useAnalyzer, useAnalyzers } from 'interface/guide';
import { JSX, useMemo } from 'react';
import StaggerPoolGraph from '../../features/StaggerPoolGraph';
import StaggerPool from '../StaggerPool';
import Table from 'interface/Table/Table';
import {
  amountBar,
  literalNumberColumn,
  OTHER_SPECIAL_ID,
  spellName,
} from 'interface/Table/ThroughputTable';
import { EventType } from 'parser/core/Events';
import QuickSip from '../../talents/QuickSip';
import StaggeringStrikes from '../../talents/StaggeringStrikes';
import TranquilSpirit from '../../talents/TranquilSpirit';
import PurifyingBrew from '../../talents/PurifyingBrew';
import TouchOfDeathStagger from '../../spells/TouchOfDeathStagger';
import SPELLS from '../../../spell-list_Monk_Brewmaster.retail';
import styled from '@emotion/styled';
import * as design from 'interface/design-system';
import SpellLink from 'interface/SpellLink';
import Explanation from 'interface/guide/components/Explanation';
import { formatNumber } from 'common/format';
import InvokeNiuzaoStagger from '../../talents/InvokeNiuzao/InvokeNiuzaoStagger';
import Tooltip from 'interface/Tooltip';
import { InformationIcon } from 'interface/icons';
import AlertInfo from 'interface/AlertInfo';

const SideBySide = styled.div`
  margin-top: ${design.gaps.large};
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${design.gaps.large};

  align-items: start;

  & header {
    margin-bottom: ${design.gaps.medium};
  }
`;

const SummaryDL = styled.dl`
  display: grid;
  grid-template-columns: 1fr auto;
  gap: ${design.gaps.small} ${design.gaps.medium};
  width: max-content;

  font-size: 95%;

  & dt {
    font-weight: normal;
  }

  & dd {
    text-align: right;
  }
`;

export default function StaggerPoolSection(): JSX.Element | null {
  const graph = useAnalyzer(StaggerPoolGraph);
  const stagger = useAnalyzer(StaggerPool);
  if (!stagger) {
    return null;
  }

  const totalAbsorb = useMemo(() => {
    return stagger.totalDamageByAbility.values().reduce((total, v) => total + v, 0);
  }, [stagger]);

  return (
    <>
      <AlertInfo>
        <SpellLink spell={SPELLS.STAGGER_TALENT} /> tracking has received a major overhaul in
        Midnight to handle all of the new talents that purify or prevent Stagger. If you see errors,
        please contact <code>@emallson</code> on Discord.
      </AlertInfo>
      <SubSection title={<SpellLink spell={SPELLS.STAGGER_TALENT} />}>
        <SummaryDL>
          <dt>
            Total Damage Absorbed by <SpellLink spell={SPELLS.STAGGER_TALENT} />
          </dt>
          <dd>{formatNumber(totalAbsorb)}</dd>
          <dt>
            Total Damage Taken from <SpellLink spell={SPELLS.STAGGER_TALENT} /> (DoT)
          </dt>
          <dd>{formatNumber(stagger.totalTickDamageTaken)}</dd>
          <dt>
            Total Damage Purified&nbsp;
            <Tooltip
              content={
                <>
                  This may not exactly match the table below due to immunities or the fast Stagger
                  drain that occurs after several seconds without incoming damage taken.
                </>
              }
            >
              <span>
                <InformationIcon />
              </span>
            </Tooltip>
          </dt>
          <dd>{formatNumber(totalAbsorb - stagger.totalTickDamageTaken)} </dd>
        </SummaryDL>
        <Explanation>
          This chart shows the amount of damage in the <SpellLink spell={SPELLS.STAGGER_TALENT} />{' '}
          pool over time, with <SpellLink spell={SPELLS.PURIFYING_BREW_TALENT} /> casts highlighted.
        </Explanation>
        <div>{graph?.plot}</div>
        <SideBySide>
          <div>
            <header>
              <strong>
                Damage Added to <SpellLink spell={SPELLS.STAGGER_TALENT} />
              </strong>
              <Explanation>
                Part of damage taken from every hit is absorbed by{' '}
                <SpellLink spell={SPELLS.STAGGER_TALENT} />. This table shows the amount added by
                incoming damage sources.
              </Explanation>
            </header>
            <StaggerTakenTable />
          </div>
          <div>
            <header>
              <strong>
                Damage Removed from <SpellLink spell={SPELLS.STAGGER_TALENT} />
              </strong>
              <Explanation>
                Damage can be removed from the <SpellLink spell={SPELLS.STAGGER_TALENT} />{' '}
                <em>pool</em> before the <SpellLink spell={SPELLS.STAGGER_TALENT} /> DoT deals it as
                damage. This table shows the amount removed by different effects (including the
                DoT).
              </Explanation>
            </header>
            <StaggerPurifiedTable />
          </div>
        </SideBySide>
      </SubSection>
    </>
  );
}

const staggerSpellName: typeof spellName = {
  ...spellName,
  render({ spell, school, isPet }, ctx) {
    const spellId = typeof spell === 'object' ? spell.id : spell;
    if (spellId === SPELLS.STAGGER_TALENT.id) {
      return (
        <>
          <SpellLink spell={spell} />
          &nbsp;(DoT)
        </>
      );
    }

    return spellName.render({ spell, school, isPet }, ctx);
  },
};

const commonTableColumns = {
  staggerSpellName,
  amountBar: amountBar(EventType.Damage),
};

const damageTakenColumns = {
  ...commonTableColumns,
  hits: literalNumberColumn('Hits', 'hits'),
};

const MAX_DATA_ROWS = 5;

function StaggerTakenTable(): JSX.Element | null {
  const stagger = useAnalyzer(StaggerPool);

  const { rows, ctx } = useMemo(() => {
    if (!stagger) {
      return { rows: [], ctx: { max: 0, total: 0 } };
    }
    let rows = [];

    for (const [spellId, total] of stagger?.totalDamageByAbility) {
      rows.push({
        spell: spellId,
        school: stagger.observedSpellSchools.get(spellId) ?? 1,
        hits: stagger.hitsByAbility.get(spellId),
        amount: total,
      });
    }

    const total = rows.reduce((total, row) => row.amount + total, 0);
    const max = rows.reduce((max, row) => Math.max(row.amount, max), 0);

    rows.sort((a, b) => b.amount - a.amount);

    if (rows.length > MAX_DATA_ROWS) {
      rows = [
        ...rows.slice(0, MAX_DATA_ROWS),
        {
          spell: OTHER_SPECIAL_ID,
          type: 'Other',
          amount: rows.slice(MAX_DATA_ROWS).reduce((total, row) => row.amount + total, 0),
          hits: rows.slice(MAX_DATA_ROWS).reduce((total, row) => (row.hits ?? 0) + total, 0),
        },
      ];
    }

    return { rows, ctx: { total, max } };
  }, [stagger]);

  if (!stagger) {
    return null;
  }

  return <Table columns={damageTakenColumns} data={rows} ctx={ctx} />;
}

const PURIFICATION_SOURCES = [
  QuickSip,
  StaggeringStrikes,
  TranquilSpirit,
  PurifyingBrew,
  TouchOfDeathStagger,
  InvokeNiuzaoStagger,
] as const;

const purificationColumns = {
  ...commonTableColumns,
  triggers: literalNumberColumn('Triggers', 'count'),
};

function StaggerPurifiedTable(): JSX.Element | null {
  const analyzers = useAnalyzers(PURIFICATION_SOURCES);
  const stagger = useAnalyzer(StaggerPool);

  const { rows, ctx } = useMemo(() => {
    const rows = [];

    for (const analyzer of analyzers) {
      if (!analyzer.active) {
        continue;
      }

      rows.push({
        spell: analyzer.ability.id,
        amount: analyzer.amount,
        count: analyzer.count,
      });
    }

    const totalStaggerAbsorbed =
      stagger?.totalDamageByAbility.values().reduce((total, amount) => total + amount, 0) ?? 0;
    const totalKnown = rows.reduce((total, row) => row.amount + total, 0);
    const totalDoT = stagger?.totalTickDamageTaken ?? 0;

    rows.sort((a, b) => b.amount - a.amount);

    rows.push({
      spell: OTHER_SPECIAL_ID,
      type: 'Other',
      amount: totalStaggerAbsorbed - totalDoT - totalKnown,
    });

    rows.push({
      spell: SPELLS.STAGGER_TALENT.id,
      type: 'Other',
      amount: totalDoT,
    });

    const max = rows.reduce((max, row) => Math.max(row.amount, max), 0);

    return {
      rows,
      ctx: { max, total: totalStaggerAbsorbed },
    };
  }, [analyzers, stagger]);

  return <Table columns={purificationColumns} data={rows} ctx={ctx} />;
}
