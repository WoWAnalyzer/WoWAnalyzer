import { formatPercentage, formatThousands } from 'common/format';
import SPELLS from 'common/SPELLS';
import { SpellIcon } from 'interface';
import { TrackedHit } from 'interface/guide/components/DamageTakenPointChart';
import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent, DamageEvent, RemoveBuffEvent } from 'parser/core/Events';
import { ThresholdStyle } from 'parser/core/ParseResults';
import { isArmorMitigated } from 'parser/retail/modules/isArmorMitigated';
import Enemies from 'parser/shared/modules/Enemies';
import { shouldIgnore } from 'parser/shared/modules/hit-tracking/utilities';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import StatisticBox, { STATISTIC_ORDER } from 'parser/ui/StatisticBox';
import { Uptime } from 'parser/ui/UptimeBar';

class ShieldOfTheRighteous extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };

  protected enemies!: Enemies;

  totalHits = 0;
  sotrHits = 0;
  totalDamageTaken = 0;
  sotrDamageTaken = 0;

  /** Per-hit record for the damage taken chart. */
  hits: TrackedHit[] = [];
  /** Buff windows for the uptime bar. */
  uptime: Uptime[] = [];

  constructor(options: Options) {
    super(options);
    // M+ doesn't have a boss prop
    this.addEventListener(Events.damage.to(SELECTED_PLAYER), this.trackHits);
    this.addEventListener(
      Events.applybuff.to(SELECTED_PLAYER).spell(SPELLS.SHIELD_OF_THE_RIGHTEOUS_BUFF),
      this.onApplyBuff,
    );
    this.addEventListener(
      Events.removebuff.to(SELECTED_PLAYER).spell(SPELLS.SHIELD_OF_THE_RIGHTEOUS_BUFF),
      this.onRemoveBuff,
    );
    this.addEventListener(Events.fightend, this.finalize);
  }

  private onApplyBuff(event: ApplyBuffEvent) {
    this.uptime.push({ start: event.timestamp, end: event.timestamp });
  }

  private onRemoveBuff(event: RemoveBuffEvent) {
    const current = this.uptime[this.uptime.length - 1];
    if (!current) {
      this.uptime.push({ start: this.owner.fight.start_time, end: event.timestamp });
    } else {
      current.end = event.timestamp;
    }
  }

  private finalize() {
    const current = this.uptime[this.uptime.length - 1];
    if (!current || current.end !== current.start) {
      return;
    }
    current.end = this.owner.fight.end_time;
  }

  trackHits(event: DamageEvent) {
    // Shield of the Righteous is an armor buff, so only damage that armor actually applies
    // to is relevant. That is physical, non-periodic damage. Zero-damage events are
    // typically dodges/parries and are not mitigated by armor either.
    const amount = event.amount + (event.absorbed || 0) + (event.overkill || 0);
    if (amount === 0 || !isArmorMitigated(event) || shouldIgnore(this.enemies, event)) {
      return;
    }

    const covered = this.selectedCombatant.hasBuff(SPELLS.SHIELD_OF_THE_RIGHTEOUS_BUFF.id);

    this.totalHits += 1;
    this.totalDamageTaken += amount;
    if (covered) {
      this.sotrHits += 1;
      this.sotrDamageTaken += amount;
    }

    // Shield of the Righteous extends its own duration rather than stacking, so coverage
    // is all-or-nothing - there is no equivalent of Ironfur's multi-stack tier.
    this.hits.push({
      event,
      mitigated: covered ? QualitativePerformance.Good : QualitativePerformance.Fail,
    });
  }

  get uncoveredHits() {
    return this.totalHits - this.sotrHits;
  }

  get uncoveredDamageTaken() {
    return this.totalDamageTaken - this.sotrDamageTaken;
  }

  get percentHitsCovered() {
    return this.totalHits === 0 ? 0 : this.sotrHits / this.totalHits;
  }

  get hitsMitigatedThreshold() {
    return {
      actual: this.percentHitsCovered,
      isLessThan: {
        minor: 0.95,
        average: 0.9,
        major: 0.85,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  statistic() {
    return (
      <StatisticBox
        position={STATISTIC_ORDER.CORE(10)}
        icon={<SpellIcon spell={SPELLS.SHIELD_OF_THE_RIGHTEOUS} />}
        value={`${formatPercentage(this.percentHitsCovered)}%`}
        label="Physical Hits Mitigated"
        tooltip={
          <>
            Shield of the Righteous usage breakdown:
            <ul>
              <li>
                You were hit <strong>{this.sotrHits}</strong> times with your Shield of the
                Righteous buff (<strong>{formatThousands(this.sotrDamageTaken)}</strong> damage).
              </li>
              <li>
                You were hit <strong>{this.uncoveredHits}</strong> times{' '}
                <strong>
                  <em>without</em>
                </strong>{' '}
                your Shield of the Righteous buff (
                <strong>{formatThousands(this.uncoveredDamageTaken)}</strong> damage).
              </li>
            </ul>
            <strong>{formatPercentage(this.percentHitsCovered)}%</strong> of physical attacks were
            mitigated with Shield of the Righteous.
            {/* oxlint-disable-next-line wowanalyzer/no-br -- matches surrounding style */}
            <br />
          </>
        }
      />
    );
  }
}

export default ShieldOfTheRighteous;
