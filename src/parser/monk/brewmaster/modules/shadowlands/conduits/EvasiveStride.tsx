import React from 'react';

import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import Events, { DamageEvent, HealEvent } from 'parser/core/Events';

import Statistic from 'interface/statistics/Statistic';
import ConduitSpellText from 'interface/statistics/components/ConduitSpellText';
import ItemHealingDone from 'interface/ItemHealingDone'
import STATISTIC_ORDER  from 'interface/others/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import BaseChart from 'interface/others/BaseChart';
import { AutoSizer } from 'react-virtualized';
import { binomialPMF, setMinMaxProbabilities } from 'parser/shared/modules/helpers/Probability';
import { VisualizationSpec } from 'react-vega';
import { formatNumber } from 'common/format';
import SpellLink from 'common/SpellLink';

import StaggerFabricator from '../../core/StaggerFabricator';

const BASE_PROC_CHANCE = 0.025;
const BONUS_PROC_CHANCE = 0.0025;

export default class EvasiveStride extends Analyzer {
  static dependencies = {
    fab: StaggerFabricator,
  };

  fab!: StaggerFabricator;

  rank?: number;
  chance?: number;

  // this includes both ticks that didn't proc and ticks that did.
  procChances = 0;
  // ticks that would have been proc chances had Shuffle been up.
  wastedProcChances = 0;
  procs = 0;

  // does not include overheal
  healingDone = 0;
  overhealingDone = 0;
  // does *not* include overkill
  heavyDamageTaken = 0;

  constructor(options: Options) {
    super(options);

    this.rank = this.selectedCombatant.conduitRankBySpellID(SPELLS.EVASIVE_STRIDE.id);
    if(!this.rank) {
      this.active = false;
      return;
    }

    this.chance = BASE_PROC_CHANCE + (this.rank - 1) * BONUS_PROC_CHANCE;

    this.addEventListener(Events.damage.spell(SPELLS.STAGGER_TAKEN).to(SELECTED_PLAYER), this.staggerDamage);
    this.addEventListener(Events.heal.spell(SPELLS.EVASIVE_STRIDE_HEAL).to(SELECTED_PLAYER), this.heal);
  }

  private staggerDamage(event: DamageEvent) {
    if(!this.selectedCombatant.hasBuff(SPELLS.HEAVY_STAGGER_DEBUFF.id)) {
      return;
    }

    if(!this.selectedCombatant.hasBuff(SPELLS.SHUFFLE.id)) {
      this.wastedProcChances += 1;
    } else {
      this.procChances += 1;
      this.heavyDamageTaken += event.amount + (event.absorbed || 0);
    }
  }

  private heal(event: HealEvent) {
    this.procChances += 1;
    this.procs += 1;
    const amount = event.amount + (event.absorbed || 0);
    const overheal = event.overheal || 0;
    this.healingDone += amount;
    this.overhealingDone += overheal;

    // TODO: this may remove too much due to vers / healing amps. unsure
    this.fab.removeStagger(event, amount + overheal)
  }

  statistic() {
    const { procProbabilities, rangeMin, rangeMax } = setMinMaxProbabilities(this.procs, this.procChances, this.chance!);
    const actualProc = binomialPMF(this.procs, this.procChances, this.chance!);

    const avgTickDamage = this.heavyDamageTaken / (this.procChances - this.procs);
    const avgTickHps = avgTickDamage / this.owner.fightDuration * 1000;

    const actualHps = this.healingDone / this.owner.fightDuration * 1000;
    const absoluteHps = (this.healingDone + this.overhealingDone) / this.owner.fightDuration * 1000;

    const spec: VisualizationSpec = {
      encoding: {
        x: {
          field: 'hps',
          type: 'quantitative' as const,
          title: 'HPS',
          axis: {
            grid: false,
            format: '~k',
          },
        },
        y: {
          field: 'y',
          type: 'quantitative' as const,
          title: 'Likelihood',
          axis: {
            grid: false,
            format: '.0%',
          },
          scale: {
            domain: [0, 0.4],
          },
        },
      },
      layer: [
        {
          data: {
            name: 'probabilities',
          },
          transform: [
            { calculate: `datum.x * ${avgTickHps}`, as: 'hps'}
          ],
          mark: {
            type: 'area' as const,
            color: 'rgba(250, 183, 0, 0.15)',
            line: {
              color: '#fab700',
              strokeWidth: 1,
            },
          },
        },
        {
          data: {
            name: 'actual',
          },
          transform: [
            { calculate: `datum.x * ${avgTickHps}`, as: 'hps'}
          ],
          mark: {
            type: 'point' as const,
            filled: true,
            color: '#00ff96',
            size: 60,
          },
          encoding: {
            tooltip: [
              { field: 'actual', title: 'Actual HPS', format: '.3~s', type: 'quantitative' as const },
              { field: 'hps', title: 'Expected w/o Overheal', format: '.3~s', type: 'quantitative' as const },
            ],
          },
        },
      ],
    };
    const data = {
      actual: [{ x: this.procs, y: actualProc, actual: actualHps }],
      probabilities: procProbabilities.slice(rangeMin, rangeMax),
    };

    return (
      <Statistic
        category={STATISTIC_CATEGORY.ITEMS}
        size="flexible"
        position={STATISTIC_ORDER.OPTIONAL(0)}
        tooltip={<>Overhealing is excluded below. When included, Evasive Stride gave <strong>{formatNumber(absoluteHps)} HPS.</strong></>}
        dropdown={
          <div style={{ margin: '0 1em' }}>
            <AutoSizer disableHeight>
            {({ width }) => {
                if (width > 0) {
                return (
                    <BaseChart
                    width={width}
                    height={150}
                    data={data}
                    spec={spec}
                    />
                );
                }
                return null;
            }}
            </AutoSizer>
            <p style={{ textShadow: 'initial' }}>The amount of healing you can expect from <SpellLink id={SPELLS.EVASIVE_STRIDE.id} /> on average <em>without overhealing</em>.</p>
          </div>
        }
      >
      <ConduitSpellText spell={SPELLS.EVASIVE_STRIDE} rank={this.rank!}>
        <>
          <ItemHealingDone amount={this.healingDone} />
        </>
      </ConduitSpellText>
      </Statistic>
    );
  }
}
