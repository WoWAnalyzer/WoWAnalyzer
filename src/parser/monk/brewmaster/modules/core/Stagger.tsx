import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import { formatNumber, formatPercentage, formatThousands } from 'common/format';
import Analyzer, { Options } from 'parser/core/Analyzer';
import Events, { EventType } from 'parser/core/Events';
import EventFilter from 'parser/core/EventFilter';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import Statistic from 'interface/statistics/Statistic';
import BoringValue from 'interface/statistics/components/BoringValueText';

import StaggerFabricator, { AddStaggerEvent, RemoveStaggerEvent } from './StaggerFabricator';

const debug = false;
const PHYSICAL_DAMAGE = 1;

class Stagger extends Analyzer {
  static dependencies = {
    fab: StaggerFabricator,
  };
  totalPhysicalStaggered = 0;
  totalMagicalStaggered = 0;
  totalStaggerTaken = 0;
  staggerMissingFromFight = 0;
  protected fab!: StaggerFabricator;

  constructor(options: Options) {
    super(options);

    this.addEventListener(new EventFilter(EventType.AddStagger), this._addstagger);
    this.addEventListener(new EventFilter(EventType.RemoveStagger), this._removestagger);
    this.addEventListener(Events.fightend, this._fightend);
  }

  get totalStaggered() {
    return this.totalPhysicalStaggered + this.totalMagicalStaggered;
  }

  get pctPurified() {
    return (this.totalStaggered - this.totalStaggerTaken) / this.totalStaggered;
  }

  statistic() {
    const damageAvoided = this.totalStaggered - this.totalStaggerTaken - this.staggerMissingFromFight;
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(2)}
        size="flexible"
        tooltip={(
          <>
            Incoming damage added to stagger:
            <ul>
              <li>Total physical damage added to stagger: {formatThousands(this.totalPhysicalStaggered)}</li>
              <li>Total magical damage added to stagger: {formatThousands(this.totalMagicalStaggered)}</li>
            </ul>
            Damage taken from stagger:
            <ul>
              <li>Total damage from stagger dot: {formatThousands(this.totalStaggerTaken)} ({formatPercentage(this.totalStaggerTaken / this.totalStaggered)}% of total staggered)</li>
              <li>Total damage removed from stagger dot before damaging you: {formatThousands(damageAvoided)} ({formatPercentage(damageAvoided / this.totalStaggered)}% of total staggered)</li>
            </ul>
          </>
        )}
      >
        <BoringValue label={<><SpellIcon id={SPELLS.STAGGER.id} /> Damage staggered</>}>
          <>
            {formatNumber(this.totalStaggered)}
          </>
        </BoringValue>
      </Statistic>
    );
  }

  private _addstagger(event: AddStaggerEvent) {
    if (event.trigger!.extraAbility.type === PHYSICAL_DAMAGE) {
      this.totalPhysicalStaggered += event.amount;
    } else {
      this.totalMagicalStaggered += event.amount;
    }
  }

  private _removestagger(event: RemoveStaggerEvent) {
    if (event.trigger!.ability && event.trigger!.ability.guid === SPELLS.STAGGER_TAKEN.id) {
      this.totalStaggerTaken += event.amount;
    }
  }

  private _fightend() {
    this.staggerMissingFromFight = this.fab.staggerPool;
    if (debug) {
      console.log(`Total physical staggered: ${formatNumber(this.totalPhysicalStaggered)}`);
      console.log(`Total magical staggered: ${formatNumber(this.totalMagicalStaggered)}`);
      console.log(`Total taken: ${formatNumber(this.totalStaggerTaken)}`);
      console.log(`Stagger taken after fight: ${formatNumber(this.staggerMissingFromFight)}`);
      console.log(`Damage avoided: ${formatNumber(this.totalPhysicalStaggered + this.totalMagicalStaggered - this.totalStaggerTaken)}`);
    }
  }
}

export default Stagger;
