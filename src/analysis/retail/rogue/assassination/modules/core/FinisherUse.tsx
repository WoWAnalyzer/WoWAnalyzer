import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import { BadColor, GoodColor, OkColor } from 'interface/guide';
import { ResourceLink, SpellLink } from 'interface';
import DonutChart from 'parser/ui/DonutChart';
import Statistic from 'parser/ui/Statistic';
import { STATISTIC_ORDER } from 'parser/ui/StatisticBox';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import getResourceSpent from 'parser/core/getResourceSpent';
import SPELLS from 'common/SPELLS/rogue';
import TALENTS from 'common/TALENTS/rogue';

import { FINISHERS, getMaxComboPoints } from '../../constants';
import { formatDurationMillisMinSec } from 'common/format';

const OPENER_MAX_DURATION_MS = 15000;

export default class FinisherUse extends Analyzer {
  totalFinisherCasts = 0;
  animachargedCasts = 0;
  lowCpFinisherCasts = 0;
  openerLowCpFinisherCasts = 0;

  constructor(options: Options) {
    super(options);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(FINISHERS), this.onCast);
  }

  get maxCpFinishers() {
    return (
      this.totalFinisherCasts -
      this.animachargedCasts -
      this.lowCpFinisherCasts -
      this.openerLowCpFinisherCasts
    );
  }

  get chart() {
    const items = [
      {
        color: GoodColor,
        label: 'Max CP Finishers',
        value: this.maxCpFinishers,
        tooltip: (
          <>This includes finishers cast at {getMaxComboPoints(this.selectedCombatant) - 1} CPs.</>
        ),
      },
      {
        color: OkColor,
        label: 'Low CP Opener Finishers',
        value: this.openerLowCpFinisherCasts,
        tooltip: (
          <>
            This includes low CP finisher casts in the first{' '}
            {formatDurationMillisMinSec(OPENER_MAX_DURATION_MS)} of an encounter.
          </>
        ),
      },
      {
        color: BadColor,
        label: 'Low CP Finishers',
        value: this.lowCpFinisherCasts,
      },
    ];

    if (this.selectedCombatant.hasTalent(TALENTS.ECHOING_REPRIMAND_TALENT)) {
      items.push({
        color: '#40DDF9',
        label: 'Animacharged Finishers',
        value: this.animachargedCasts,
        tooltip: (
          <>
            This includes finishers cast using an Animacharged CP from{' '}
            <SpellLink id={TALENTS.ECHOING_REPRIMAND_TALENT} />.
          </>
        ),
      });
    }

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

  private onCast(event: CastEvent) {
    const cpsSpent = getResourceSpent(event, RESOURCE_TYPES.COMBO_POINTS);
    if (cpsSpent === 0) {
      return;
    }

    const hasAnimacharged2CP = this.selectedCombatant.hasBuff(
      SPELLS.ANIMACHARGED_CP2.id,
      event.timestamp,
    );
    const hasAnimacharged3CP = this.selectedCombatant.hasBuff(
      SPELLS.ANIMACHARGED_CP3.id,
      event.timestamp,
    );
    const hasAnimacharged4CP = this.selectedCombatant.hasBuff(
      SPELLS.ANIMACHARGED_CP4.id,
      event.timestamp,
    );
    const timeIntoEncounter = event.timestamp - this.owner.fight.start_time;
    const isInOpener = timeIntoEncounter <= OPENER_MAX_DURATION_MS;

    this.totalFinisherCasts += 1;
    if (hasAnimacharged2CP && cpsSpent === 2) {
      this.animachargedCasts += 1;
    } else if (hasAnimacharged3CP && cpsSpent === 3) {
      this.animachargedCasts += 1;
    } else if (hasAnimacharged4CP && cpsSpent === 4) {
      this.animachargedCasts += 1;
    } else if (cpsSpent < getMaxComboPoints(this.selectedCombatant) - 1) {
      if (isInOpener) {
        this.openerLowCpFinisherCasts += 1;
      } else {
        this.lowCpFinisherCasts += 1;
      }
    }
  }
}
