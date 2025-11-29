import type { JSX } from 'react';
import ROLES from 'game/ROLES';
import SpellLink from 'interface/SpellLink';
import { SubSection } from 'interface/guide';
import Analyzer, { Options } from 'parser/core/Analyzer';
import Events, { AnyEvent, HasSource, HasTarget, ResourceActor } from 'parser/core/Events';
import SPELLS from 'common/SPELLS/classic';
import Explanation from 'interface/guide/components/Explanation';
import { AutoSizer } from 'react-virtualized';
import BaseChart, { formatTime } from 'parser/ui/BaseChart';
import { VisualizationSpec } from 'react-vega';
import MAGIC_SCHOOLS, { color } from 'game/MAGIC_SCHOOLS';
import { formatNumber } from 'common/format';
import styled from '@emotion/styled';

interface AttackPowerEvent {
  attackPower: number;
  timestamp: number;
}

const StatList = styled.dl`
  margin-top: 1em;
  display: grid;
  grid-template-columns: repeat(2, max-content);
  gap: 0.25em;

  dt {
    justify-self: end;
    font-weight: normal;
  }
`;

export default class Vengeance extends Analyzer {
  protected attackPower: AttackPowerEvent[] = [];
  protected baseAttackPower: number;
  constructor(options: Options) {
    super(options);

    this.active = this.owner.config.spec.role === ROLES.TANK;

    this.baseAttackPower = this.computeBaseAttackPower();

    this.addEventListener(Events.any, this.recordAttackPower);
  }

  protected computeBaseAttackPower(): number {
    // prepull stats could shift this but not by much compared to vengeance
    const combatantinfo = this.selectedCombatant._combatantInfo;
    return 2 * Math.max(combatantinfo.strength, combatantinfo.agility);
  }

  protected recordAttackPower(event: AnyEvent) {
    if (!('attackPower' in event) || event.attackPower === undefined) {
      return;
    }

    if (
      HasSource(event) &&
      event.sourceID === this.owner.selectedCombatant.id &&
      event.resourceActor === ResourceActor.Source
    ) {
      this.attackPower.push({
        timestamp: event.timestamp,
        attackPower: event.attackPower,
      });
    } else if (
      HasTarget(event) &&
      event.targetID === this.owner.selectedCombatant.id &&
      event.resourceActor === ResourceActor.Target
    ) {
      this.attackPower.push({
        timestamp: event.timestamp,
        attackPower: event.attackPower,
      });
    }
  }

  protected get chartSpec(): VisualizationSpec {
    return {
      mark: {
        type: 'line',
        interpolate: 'monotone',
        color: color(MAGIC_SCHOOLS.ids.PHYSICAL),
      },
      data: {
        name: 'attackPower',
      },
      transform: [
        {
          calculate: `datum.timestamp - ${this.owner.fight.start_time}`,
          as: 'timestamp',
        },
        {
          calculate: `datum.attackPower / ${this.baseAttackPower}`,
          as: 'apRatio',
        },
      ],
      encoding: {
        x: {
          field: 'timestamp',
          type: 'quantitative',
          axis: {
            labelExpr: formatTime('datum.value'),
            grid: false,
          },
          title: null,
          scale: { zero: true, nice: false },
        },
        y: {
          field: 'apRatio',
          type: 'quantitative',
          axis: {
            labelExpr: 'if(datum.value == 1, "Base AP", toString(datum.value) + "x")',
            values: [1, 2.5, 5, 7.5, 10, 12.5],
          },
          scale: { domainMin: 1 },
          title: 'Attack Power',
        },
        tooltip: [{ title: 'Attack Power', field: 'attackPower', format: '~s' }],
      },
    };
  }

  avgAttackPower(): number {
    let previousAp = this.baseAttackPower;
    let totalAp = 0;
    let previousTime = this.owner.fight.start_time;
    for (const event of this.attackPower) {
      const duration = event.timestamp - previousTime;
      // go ahead and convert to seconds to help avoid numerical issues from multiplying very large numbers
      totalAp += (duration / 1000) * previousAp;

      previousTime = event.timestamp;
      previousAp = event.attackPower;
    }

    const duration = this.owner.fight.end_time - previousTime;
    totalAp += (duration / 1000) * previousAp;

    return totalAp / (this.owner.fightDuration / 1000);
  }

  get guideSubsection(): JSX.Element {
    const avg = this.avgAttackPower();
    const max = Math.max.apply(
      null,
      this.attackPower.map((event) => event.attackPower),
    );
    return (
      <SubSection title={<SpellLink spell={SPELLS.VENGEANCE_BUFF} />}>
        <Explanation>
          <SpellLink spell={SPELLS.VENGEANCE_BUFF} /> is a tank mechanic that <em>massively</em>{' '}
          increases your <strong>Attack Power</strong> based on damage taken. The amount of AP
          gained is often <strong>&gt;5x your base AP</strong>.
        </Explanation>
        <Explanation>
          To learn how to safely (or not) optimize <SpellLink spell={SPELLS.VENGEANCE_BUFF} /> on an
          encounter-by-encounter basis, you should check your{' '}
          <a href="https://www.wowhead.com/discord-servers">Community Discord</a>.
        </Explanation>
        <StatList>
          <dt>Average Attack Power:</dt>
          <dd>
            <strong>{formatNumber(avg)}</strong> ({(avg / this.baseAttackPower).toFixed(1)}x Base
            AP)
          </dd>
          <dt>Max Attack Power:</dt>{' '}
          <dd>
            <strong>{formatNumber(max)}</strong> ({(max / this.baseAttackPower).toFixed(1)}x Base
            AP)
          </dd>
        </StatList>
        <div>
          <AutoSizer disableHeight>
            {({ width }) => (
              <div style={{ width }}>
                <BaseChart
                  width={width}
                  height={200}
                  spec={this.chartSpec}
                  data={{ attackPower: this.attackPower }}
                />
              </div>
            )}
          </AutoSizer>
        </div>
      </SubSection>
    );
  }
}
