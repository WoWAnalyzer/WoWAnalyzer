import React from 'react';

import Analyzer, { Options, SELECTED_PLAYER } from "parser/core/Analyzer";
import Events, { ApplyBuffEvent, ApplyBuffStackEvent, CastEvent, RemoveBuffEvent, RemoveBuffStackEvent } from "parser/core/Events";
import SPELLS from 'common/SPELLS/index';
import Spell from 'common/SPELLS/Spell';

class MaelstromWeapon extends Analyzer {
  protected stacksGained = 0;
  protected stacksUsed = 0;
  protected stacksExpired = 0;
  
  protected currentStacks = 0;

  protected cappedIntervals: Interval[] = []

  constructor(options: Options) {
    super(options);

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
    //
  }

  stopHavingMaxStacks(timestamps: number) {
    //
  }

  castMaelstromWeaponSpender() {
    //
  }

  gainFirstStack(event: ApplyBuffEvent) {
    //
  }

  gainSubsequentStack(event: ApplyBuffStackEvent) {
    //
  }

  removeAllStacks(event: RemoveBuffEvent) {
    //
  }


  spendStacks(event: RemoveBuffStackEvent) {
    //
  }

  statistic() {
    return <>Hello</>
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