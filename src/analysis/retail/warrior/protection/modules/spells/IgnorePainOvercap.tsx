import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import { SpellIcon } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  AbsorbedEvent,
  ApplyBuffEvent,
  DamageEvent,
  RefreshBuffEvent,
  RemoveBuffEvent,
} from 'parser/core/Events';
import BoringValueText from 'parser/ui/BoringValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

/**
 * IP wasted due to it being overcapped... roughly
 */
class IgnorePainOvercap extends Analyzer {
  overcappedIgnorePain: number = 0;
  currentIgnorePain: number = 0;

  assumedMax: number = -1;
  assumedGainedPerCast: number = -1;

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
    this.assumedMax = (event.absorb || 0) * 2;
    this.assumedGainedPerCast = event.absorb || 0;
  }

  ignorePainedRefreshed(event: RefreshBuffEvent) {
    if (this.assumedMax !== -1) {
      const assumedBeforeCast = this.currentIgnorePain + this.assumedGainedPerCast;
      const waste = assumedBeforeCast - this.assumedMax;
      const wasteButReal = Math.max(waste, 0);
      this.overcappedIgnorePain += wasteButReal;
    }

    this.currentIgnorePain = event.absorb || 0;
  }

  ignorePainExpired(event: RemoveBuffEvent) {
    this.currentIgnorePain = 0;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.GENERAL}
        tooltip={
          <>
            This is an assumed amount of wasted Ignore Pain Shield due to overcapping. The cap of
            Ignore Pain is 2x the value on the tooltip.
          </>
        }
      >
        <BoringValueText
          label={
            <>
              <SpellIcon spell={SPELLS.IGNORE_PAIN} /> Ignore Pain Overcapped
            </>
          }
        >
          {formatNumber(this.overcappedIgnorePain)}
          <br />
        </BoringValueText>
      </Statistic>
    );
  }
}

export default IgnorePainOvercap;
