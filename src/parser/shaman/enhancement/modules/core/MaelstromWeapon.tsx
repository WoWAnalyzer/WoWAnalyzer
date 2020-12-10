import React from 'react';

import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent, ApplyBuffStackEvent, CastEvent, RemoveBuffEvent, RemoveBuffStackEvent } from 'parser/core/Events';
import SPELLS from 'common/SPELLS/index';
import UptimeIcon from 'interface/icons/Uptime';
import Spell from 'common/SPELLS/Spell';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import { formatPercentage } from 'common/format';

import { Intervals } from './Intervals';

const MAX_STACKS = 10;
const MAX_STACKS_SPENT_PER_CAST = 5;
const MAELSTROM_WEAPON_SPENDERS: Spell[] = [
  SPELLS.CHAIN_HEAL,
  SPELLS.CHAIN_LIGHTNING,
  SPELLS.HEALING_SURGE,
  SPELLS.LIGHTNING_BOLT,
];
const debug = false;

class MaelstromWeapon extends Analyzer {
  protected stacksGained = 0;
  protected stacksUsed = 0;
  protected stacksExpired = 0;

  protected currentStacks = 0;

  protected cappedIntervals: Intervals;

  constructor(options: Options) {
    super(options);

    this.cappedIntervals = new Intervals();

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.MAELSTROM_WEAPON_BUFF),
      this.gainFirstStack,
    );

    this.addEventListener(
      Events.applybuffstack.by(SELECTED_PLAYER).spell(SPELLS.MAELSTROM_WEAPON_BUFF),
      this.gainSubsequentStack,
    );

    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.MAELSTROM_WEAPON_BUFF),
      this.removeAllStacks,
    );

    // This only occurs when player casts a spender, because in case stacks expire, 'removebuff' event occurs.
    this.addEventListener(
      Events.removebuffstack.by(SELECTED_PLAYER).spell(SPELLS.MAELSTROM_WEAPON_BUFF),
      this.spendStacks,
    );

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(MAELSTROM_WEAPON_SPENDERS),
      this.castMaelstromWeaponSpender,
    );
  }

  get timePercentageSpentWithCappedStacks() {
    return this.cappedIntervals.totalDuration / this.owner.fightDuration;
  }

  reachMaxStacks(timestamp: number) {
    this.cappedIntervals.startInterval(timestamp);
  }

  stopHavingMaxStacks(timestamp: number) {
    this.cappedIntervals.endInterval(timestamp);
  }

  // this method is a helper for determining if removebuff event corresponds to stack expiration or spending
  castMaelstromWeaponSpender(event: CastEvent) {
    const stacksUsed = Math.min(
      this.currentStacks,
      MAX_STACKS_SPENT_PER_CAST,
    );

    if (stacksUsed === 0) {
      return;
    }

    this.stacksUsed += stacksUsed;

    if (this.currentStacks === MAX_STACKS) {
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
      debug && console.error('Maelstrom Weapon analyzer: stack mismatch in applybuffstack');
      return;
    }

    this.currentStacks = event.stack;
    this.stacksGained += 1;

    if (this.currentStacks === MAX_STACKS) {
      this.reachMaxStacks(event.timestamp);
    }
  }

  removeAllStacks(event: RemoveBuffEvent) {
    if (this.currentStacks === 0) {
      // stacks were spend on a spender spell
      return;
    }

    if (this.currentStacks === MAX_STACKS) {
      this.stopHavingMaxStacks(event.timestamp);
    }

    this.stacksExpired += this.currentStacks;
    this.currentStacks = 0;
  }

  spendStacks(event: RemoveBuffStackEvent) {
    if (this.currentStacks !== event.stack) {
      debug && console.error('Maelstrom Weapon analyzer: stack mismatch in spendStacks');
    }
    if (this.currentStacks === MAX_STACKS) {
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
    </Statistic>;
  }
}

export default MaelstromWeapon;
