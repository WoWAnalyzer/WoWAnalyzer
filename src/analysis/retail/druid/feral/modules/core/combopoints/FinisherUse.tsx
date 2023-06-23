import SPELLS from 'common/SPELLS';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { ResourceLink, SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, EventType } from 'parser/core/Events';
import Statistic from 'parser/ui/Statistic';
import { STATISTIC_ORDER } from 'parser/ui/StatisticBox';

import { FINISHERS, getAcceptableCps } from 'analysis/retail/druid/feral/constants';
import getResourceSpent from 'parser/core/getResourceSpent';
import { TALENTS_DRUID } from 'common/TALENTS';
import { getHits } from 'analysis/retail/druid/feral/normalizers/CastLinkNormalizer';
import DonutChart from 'parser/ui/DonutChart';
import { BadColor, GoodColor, OkColor } from 'interface/guide';

/**
 * Although all finishers are most efficient at 5 combo points, in some situations use at fewer combo points
 * will be a damage increase compared to waiting for the full 5.
 *
 * Situations where <5 combo point use of an ability is fine:
 *  Fresh Rip on a target which doesn't yet have it.
 */
class FinisherUse extends Analyzer {
  /** Total hardcast (non-free) finishers */
  totalFinisherCasts = 0;
  /** Low CP Rip casts that are fresh application */
  lowCpRipApplies = 0;
  /** Low CP Rips that refresh, or any other finisher */
  badLowCpFinisherCasts = 0;

  constructor(options: Options) {
    super(options);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(FINISHERS), this.onFinisher);
  }

  onFinisher(event: CastEvent) {
    const cpsSpent = getResourceSpent(event, RESOURCE_TYPES.COMBO_POINTS);
    if (cpsSpent === 0) {
      return; // only way this happens is Apex Predator's Craving proc, which we won't count here
    }

    this.totalFinisherCasts += 1;

    if (cpsSpent < getAcceptableCps(this.selectedCombatant)) {
      if (
        event.ability.guid === SPELLS.RIP.id ||
        event.ability.guid === TALENTS_DRUID.PRIMAL_WRATH_TALENT.id
      ) {
        const dotsApplied = getHits(event);
        const freshApply = dotsApplied.find((e) => e.type === EventType.ApplyDebuff);
        if (freshApply) {
          this.lowCpRipApplies += 1;
        } else {
          this.badLowCpFinisherCasts += 1;
        }
      } else {
        this.badLowCpFinisherCasts += 1;
      }
    }
  }

  get maxCpFinishers() {
    return this.totalFinisherCasts - this.lowCpRipApplies - this.badLowCpFinisherCasts;
  }

  get chart() {
    const items = [
      {
        color: GoodColor,
        label: 'High CP Finishers',
        value: this.maxCpFinishers,
        tooltip: (
          <>
            This only counts casts that actually spent CPs -{' '}
            <SpellLink spell={TALENTS_DRUID.APEX_PREDATORS_CRAVING_TALENT} /> and{' '}
            <SpellLink spell={TALENTS_DRUID.CONVOKE_THE_SPIRITS_TALENT} /> procs are omitted.
          </>
        ),
      },
      {
        color: OkColor,
        label: 'Low CP Intial Rips',
        value: this.lowCpRipApplies,
        tooltip: (
          <>
            When <SpellLink spell={SPELLS.RIP} /> is missing from a target, it's better to apply it
            at low CPs than wait for max - but ideally you refresh before it drops at all.
          </>
        ),
      },
      {
        color: BadColor,
        label: 'Low CP Bite / Refresh Finishers',
        value: this.badLowCpFinisherCasts,
      },
    ];

    return <DonutChart items={items} />;
  }

  statistic() {
    return (
      <Statistic position={STATISTIC_ORDER.CORE(6)}>
        <div className="pad">
          <label>
            <ResourceLink id={RESOURCE_TYPES.COMBO_POINTS.id} /> spender usage
          </label>
          {this.chart}
        </div>
      </Statistic>
    );
  }
}

export default FinisherUse;
