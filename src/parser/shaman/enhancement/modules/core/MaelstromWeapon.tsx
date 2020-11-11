import React from 'react';

import Analyzer, { Options, SELECTED_PLAYER } from "parser/core/Analyzer";
import Events, { ApplyBuffEvent, ApplyBuffStackEvent, CastEvent, RemoveBuffEvent, RemoveBuffStackEvent } from "parser/core/Events";
import SPELLS from 'common/SPELLS/index';
import UptimeIcon from 'interface/icons/Uptime';
import Spell from 'common/SPELLS/Spell';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import { formatPercentage } from 'common/format';

class MaelstromWeapon extends Analyzer {
  protected stacksGained = 0;
  protected stacksUsed = 0;
  protected stacksExpired = 0;
  
  protected currentStacks = 0;

  protected cappedIntervals: Intervals;

  get MAX_STACKS_SPENT_PER_CAST() {
    return 5;
  }

  get MAX_STACKS() {
    return 10;
  }

  constructor(options: Options) {
    super(options);

    this.cappedIntervals = new Intervals();

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.MAELSTROM_WEAPON_BUFF),
      this.gainFirstStack
    );

    this.addEventListener(
      Events.applybuffstack.by(SELECTED_PLAYER).spell(SPELLS.MAELSTROM_WEAPON_BUFF),
      this.gainSubsequentStack
    );

    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.MAELSTROM_WEAPON_BUFF),
      this.removeAllStacks
    );

    // This only occurs when player casts a spender, because in case stacks expire, 'removebuff' event occurs.
    this.addEventListener(
      Events.removebuffstack.by(SELECTED_PLAYER).spell(SPELLS.MAELSTROM_WEAPON_BUFF),
      this.spendStacks
    );

    const MAELSTROM_WEAPON_SPENDERS: Spell[] = [
      SPELLS.CHAIN_HEAL,
      SPELLS.CHAIN_LIGHTNING,
      SPELLS.HEALING_SURGE,
      SPELLS.LIGHTNING_BOLT,
    ]

    MAELSTROM_WEAPON_SPENDERS.forEach(spell => {
      this.addEventListener(
        Events.cast.by(SELECTED_PLAYER).spell(spell),
        this.castMaelstromWeaponSpender
      )
    })
  }

  reachMaxStacks(timestamp: number) {
    this.cappedIntervals.startInterval(timestamp);
  }

  stopHavingMaxStacks(timestamp: number) {
    this.cappedIntervals.endInterval(timestamp);
  }

  get timePercentageSpentWithCappedStacks() {
    return this.cappedIntervals.totalDuration / this.owner.fightDuration;
  }

  // this method is a helper for determining if removebuff event corresponds to stack expiration or spending
  castMaelstromWeaponSpender(event: CastEvent) {
    const stacksUsed = Math.min(
      this.currentStacks,
      this.MAX_STACKS_SPENT_PER_CAST
    );

    if (stacksUsed === 0) {
      return;
    }

    this.stacksUsed += stacksUsed;

    if (this.currentStacks === this.MAX_STACKS) {
      this.stopHavingMaxStacks(event.timestamp);
    }

    this.currentStacks -= stacksUsed;
  }

  gainFirstStack(event: ApplyBuffEvent) {
    this.currentStacks = 1;
    this.stacksGained += 1;
  }

  gainSubsequentStack(event: ApplyBuffStackEvent) {
    if (this.currentStacks + 1 !== event.stack) {
      console.error('Maelstrom Weapon analyzer: stack mismatch in applybuffstack');
      return;
    }

    this.currentStacks = event.stack;
    this.stacksGained += 1;

    if (this.currentStacks === this.MAX_STACKS) {
      this.reachMaxStacks(event.timestamp)
    }
  }

  removeAllStacks(event: RemoveBuffEvent) {
    if (this.currentStacks === 0) {
      // stacks were spend on a spender spell
      return;
    }

    if (this.currentStacks === 10) {
      this.stopHavingMaxStacks(event.timestamp);
    }

    this.stacksExpired += this.currentStacks;
    this.currentStacks = 0;
  }


  spendStacks(event: RemoveBuffStackEvent) {
    if (this.currentStacks !== event.stack) {
      console.error('Maelstrom Weapon analyzer: stack mismatch in spendStacks')
    }
    if (this.currentStacks === this.MAX_STACKS) {
      this.stopHavingMaxStacks(event.timestamp);
    }

    this.currentStacks = event.stack;
  }

  statistic() {
    return <Statistic
      position={STATISTIC_ORDER.CORE()}
      size="flexible"
      tooltip={<>
        You gained {this.stacksGained} Maelstrom Weapon stacks and used {this.stacksUsed}
      </>}
    >
      <BoringSpellValueText spell={SPELLS.MAELSTROM_WEAPON}>
        <UptimeIcon /> {formatPercentage(this.timePercentageSpentWithCappedStacks)}% <small>of fight with max stacks</small><br />
        {formatPercentage(this.stacksUsed / this.stacksGained)}% <small>of stacks used</small>
      </BoringSpellValueText>
    </Statistic>
  }
}

/**
 * This is used to calculate the amount of time spent while having max number of Maelstrom Weapon stacks
 */
class Interval {
  protected startTime: number;
  protected endTime: number | undefined = undefined;

  constructor(timestamp: number) {
    this.startTime = timestamp;
  }

  end(timestamp: number) {
    this.endTime = timestamp;
  }

  get duration(): number {
    if (this.endTime === undefined) {
      console.error('Cannot calculate duration of an Interval with no endTime.');
      return 0;
    }
    return this.endTime - this.startTime;
  }

  get ended(): boolean {
    return this.endTime !== undefined;
  }
}

class Intervals {
  protected intervals: Interval[];

  constructor() {
    this.intervals = [];
  };

  startInterval(timestamp: number) {
    if (this.isLastIntervalInProgress) {
      console.log('Intervals: cannot start a new interval because one is already in progress.')
      return;
    }

    this.intervals.push(new Interval(timestamp));
  }

  endInterval(timestamp: number) {
    if (!this.isLastIntervalInProgress) {
      console.log('Intervals: cannot end an interval because none are in progress.')
      return;
    }

    this.intervals[this.intervals.length - 1].end(timestamp);
  }

  private get isLastIntervalInProgress() {
    const length = this.intervals.length;
    if (length === 0) {
      return false;
    }

    return !this.intervals[length - 1].ended
  }

  get totalDuration() {
    return this.intervals.reduce((acc, interval) => acc + interval.duration, 0)
  }
}

export default MaelstromWeapon;