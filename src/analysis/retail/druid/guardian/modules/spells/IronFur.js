import { t } from '@lingui/macro';
import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import SCHOOLS from 'game/MAGIC_SCHOOLS';
import { SpellLink } from 'interface';
import { SpellIcon } from 'interface';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import BoringValueText from 'parser/ui/BoringValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

const debug = false;

class IronFur extends Analyzer {
  get hitsMitigated() {
    return this._hitsPerStack.slice(1).reduce((sum, x) => sum + x, 0);
  }

  get hitsUnmitigated() {
    return this._hitsPerStack[0] || 0;
  }

  get ironfurStacksApplied() {
    return this._hitsPerStack.reduce((sum, x, i) => sum + x * i, 0);
  }

  get totalHitsTaken() {
    return this._hitsPerStack.reduce((sum, x) => sum + x, 0);
  }

  get overallIronfurUptime() {
    // Avoid NaN display errors
    if (this.totalHitsTaken === 0) {
      return 0;
    }

    return this.ironfurStacksApplied / this.totalHitsTaken;
  }

  get suggestionThresholds() {
    return {
      actual: this.overallIronfurUptime,
      isLessThan: {
        minor: 0.9,
        average: 0.8,
        major: 0.7,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  get percentOfHitsMitigated() {
    if (this.totalHitsTaken === 0) {
      return 0;
    }
    return this.hitsMitigated / this.totalHitsTaken;
  }

  _hitsPerStack = [];

  constructor(options) {
    super(options);
    this.addEventListener(Events.damage.to(SELECTED_PLAYER), this.onDamageTaken);
    this.addEventListener(Events.fightend, this.onFightend);
  }

  registerHit(stackCount) {
    if (!this._hitsPerStack[stackCount]) {
      this._hitsPerStack[stackCount] = 0;
    }

    this._hitsPerStack[stackCount] += 1;
  }

  onDamageTaken(event) {
    // Physical
    if (event.ability.type === SCHOOLS.ids.PHYSICAL) {
      const ironfur = this.selectedCombatant.getBuff(SPELLS.IRONFUR.id);
      this.registerHit(ironfur ? ironfur.stacks : 0);
    }
  }

  computeIronfurUptimeArray() {
    return this._hitsPerStack.map((hits) => hits / this.totalHitsTaken);
  }

  onFightend() {
    if (debug) {
      console.log(`Hits with ironfur ${this.hitsMitigated}`);
      console.log(`Hits without ironfur ${this.hitsUnmitigated}`);
      console.log('Ironfur uptimes:', this.computeIronfurUptimeArray());
    }
  }

  suggestions(when) {
    when(this.percentOfHitsMitigated)
      .isLessThan(0.9)
      .addSuggestion((suggest, actual, recommended) =>
        suggest(
          <span>
            You only had the <SpellLink id={SPELLS.IRONFUR.id} /> buff for{' '}
            {formatPercentage(actual)}% of physical damage taken. You should have the Ironfur buff
            up to mitigate as much physical damage as possible.
          </span>,
        )
          .icon(SPELLS.IRONFUR.icon)
          .actual(
            t({
              id: 'druid.guardian.suggestions.ironfur.uptime',
              message: `${formatPercentage(actual)}% was mitigated by Ironfur`,
            }),
          )
          .recommended(`${Math.round(formatPercentage(recommended))}% or more is recommended`)
          .regular(recommended - 0.1)
          .major(recommended - 0.2),
      );
  }

  statistic() {
    const totalIronFurTime = this.selectedCombatant.getBuffUptime(SPELLS.IRONFUR.id);
    const uptimes = this.computeIronfurUptimeArray().reduce(
      (str, uptime, stackCount) => (
        <>
          {str}
          <li>
            {stackCount} stack{stackCount !== 1 ? 's' : ''}: {formatPercentage(uptime)}%
          </li>
        </>
      ),
      null,
    );

    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(10)}
        size="flexible"
        tooltip={
          <>
            Ironfur usage breakdown:
            <ul>
              <li>
                You were hit <strong>{this.hitsMitigated}</strong> times with your Ironfur buff.
              </li>
              <li>
                You were hit <strong>{this.hitsUnmitigated}</strong> times{' '}
                <strong>
                  <em>without</em>
                </strong>{' '}
                your Ironfur buff.
              </li>
            </ul>
            <strong>Uptimes per stack: </strong>
            <ul>{uptimes}</ul>
            <strong>{formatPercentage(this.percentOfHitsMitigated)}%</strong> of physical attacks
            were mitigated with Ironfur, and your overall uptime was{' '}
            <strong>{formatPercentage(totalIronFurTime / this.owner.fightDuration)}%</strong>.
          </>
        }
      >
        <BoringValueText
          label={
            <>
              <SpellIcon id={SPELLS.IRONFUR.id} /> Hits mitigated with Ironfur / Average Stacks{' '}
            </>
          }
        >
          {`${formatPercentage(this.percentOfHitsMitigated)}%`}
        </BoringValueText>
      </Statistic>
    );
  }
}

export default IronFur;
