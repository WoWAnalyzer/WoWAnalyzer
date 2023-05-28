import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  AbsorbedEvent,
  ApplyBuffEvent,
  DamageEvent,
  RefreshBuffEvent,
  RemoveBuffEvent,
} from 'parser/core/Events';

/**
 * IP wasted due to it expiring.
 * Ignore Pain (IP) grants a buff that is a shield. If the buff expires you just lose all the shield. This just tracks that
 */
class IgnorePainTracker extends Analyzer {
  totalIgnorePainGained: number = 0;
  currentIgnorePain: number = 0;

  constructor(options: Options) {
    super(options);

    this.addEventListener(Events.damage.to(SELECTED_PLAYER), this.tookDamage);

    this.addEventListener(
      Events.absorbed.to(SELECTED_PLAYER).spell(SPELLS.IGNORE_PAIN),
      this.absorbedDamage,
    );

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.IGNORE_PAIN),
      this.ignorePainGained,
    );

    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.IGNORE_PAIN),
      this.ignorePainedRefreshed,
    );

    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.IGNORE_PAIN),
      this.ignorePainExpired,
    );
  }

  tookDamage(event: DamageEvent) {
    this.handleDamageTaken(event.absorbed || 0);
  }

  absorbedDamage(event: AbsorbedEvent) {
    this.handleDamageTaken(event.amount || 0);
  }

  handleDamageTaken(damageToIP: number) {
    // If this is zero we assume we don't have IP
    if (damageToIP === 0) {
      return;
    }
    // Make sure its not another absorb
    if (this.currentIgnorePain > 0) {
      this.currentIgnorePain -= damageToIP;
      this.currentIgnorePain = Math.max(this.currentIgnorePain, 0);
    }
  }

  ignorePainGained(event: ApplyBuffEvent) {
    this.currentIgnorePain = event.absorb || 0;
    this.totalIgnorePainGained += event.absorb || 0;
  }

  ignorePainedRefreshed(event: RefreshBuffEvent) {
    const absorbGained = (event.absorb || 0) - this.currentIgnorePain;
    this.totalIgnorePainGained += absorbGained;
    this.currentIgnorePain = event.absorb || 0;
  }

  ignorePainExpired(event: RemoveBuffEvent) {
    this.currentIgnorePain = 0;
  }
}

export default IgnorePainTracker;
