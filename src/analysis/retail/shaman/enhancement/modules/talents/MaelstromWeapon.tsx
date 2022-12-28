import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import Spell from 'common/SPELLS/Spell';
import UptimeIcon from 'interface/icons/Uptime';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  ApplyBuffEvent,
  ApplyBuffStackEvent,
  CastEvent,
  RefreshBuffEvent,
  RemoveBuffEvent,
  RemoveBuffStackEvent,
} from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

import { Intervals } from '../core/Intervals';
import { TALENTS_SHAMAN } from 'common/TALENTS';

const MAX_STACKS = 10;
const MAX_STACKS_SPENT_PER_CAST = 5;
const MAELSTROM_WEAPON_SPENDERS: Spell[] = [
  SPELLS.HEALING_SURGE,
  SPELLS.LIGHTNING_BOLT,
  // TODO: Enable talent as spell
  // TALENTS_SHAMAN.CHAIN_HEAL_TALENT,
  // TALENTS_SHAMAN.CHAIN_LIGHTNING_TALENT,
  // TALENTS_SHAMAN.ELEMENTAL_BLAST_ENHANCEMENT_TALENT,
];
const debug = false;

class MaelstromWeapon extends Analyzer {
  protected stacksGained = 0;
  protected stacksUsed = 0;
  protected stacksExpired = 0;

  protected currentStacks = 0;

  protected lastTimestamp = 0;
  protected hasApplyBuffInThisTimestamp = false;

  protected cappedIntervals: Intervals = new Intervals();

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS_SHAMAN.MAELSTROM_WEAPON_TALENT);

    if (!this.active) {
      return;
    }

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

    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.MAELSTROM_WEAPON_BUFF),
      this.refreshStacks,
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
    const stacksUsed = Math.min(this.currentStacks, MAX_STACKS_SPENT_PER_CAST);

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
    if (event.timestamp !== this.lastTimestamp) {
      this.hasApplyBuffInThisTimestamp = false;
    }

    this.hasApplyBuffInThisTimestamp = true;

    this.currentStacks = 1;
    this.stacksGained += 1;

    this.lastTimestamp = event.timestamp;
  }

  gainSubsequentStack(event: ApplyBuffStackEvent) {
    if (event.timestamp !== this.lastTimestamp) {
      this.hasApplyBuffInThisTimestamp = false;
    }

    if (this.currentStacks + 1 !== event.stack) {
      debug &&
        console.error(
          'Maelstrom Weapon analyzer: stack mismatch in applybuffstack',
          event.timestamp,
          this.currentStacks,
          event.stack,
        );
    }

    this.hasApplyBuffInThisTimestamp = true;

    this.currentStacks = event.stack;
    this.stacksGained += 1;

    if (this.currentStacks === MAX_STACKS) {
      this.reachMaxStacks(event.timestamp);
    }

    this.lastTimestamp = event.timestamp;
  }

  refreshStacks(event: RefreshBuffEvent) {
    if (event.timestamp !== this.lastTimestamp) {
      this.hasApplyBuffInThisTimestamp = false;
    }

    if (this.hasApplyBuffInThisTimestamp) {
      return;
    }

    if (this.currentStacks < MAX_STACKS) {
      this.currentStacks += 1;
    }

    this.stacksGained += 1;

    this.lastTimestamp = event.timestamp;
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
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE()}
        size="flexible"
        tooltip={
          <>
            You gained {this.stacksGained} Maelstrom Weapon stacks and used {this.stacksUsed}
          </>
        }
      >
        <BoringSpellValueText spellId={SPELLS.MAELSTROM_WEAPON.id}>
          <UptimeIcon /> {formatPercentage(this.timePercentageSpentWithCappedStacks)}%{' '}
          <small>of fight with max stacks</small>
          <br />
          {formatPercentage(this.stacksUsed / this.stacksGained)}% <small>of stacks used</small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default MaelstromWeapon;
