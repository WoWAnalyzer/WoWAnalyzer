import { defineMessage } from '@lingui/macro';
import { formatNumber, formatThousands } from 'common/format';
import TALENTS from 'common/TALENTS/warrior';
import { SpellIcon } from 'interface';
import { SpellLink } from 'interface';
import { Tooltip } from 'interface';
import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import Events, { DamageEvent } from 'parser/core/Events';
import StatisticBox, { STATISTIC_ORDER } from 'parser/ui/StatisticBox';
import { When } from 'parser/core/ParseResults';

/**
 * A defensive combat state that reduces all damage you take by 15%,
 * and all damage you deal by 10%. Lasts 0 sec.
 */

// TODO: Add a suggestion regarding having this up too little

const DEFENSIVE_STANCE_DR = 0.15; //has been nerfed because of prot warrior, who never uses it
const DEFENSIVE_STANCE_DL = 0.1;
const MAX_WIDTH = 0.9;

class DefensiveStance extends Analyzer {
  get drps() {
    return this.perSecond(this.totalDamageMitigated);
  }

  get dlps() {
    return this.perSecond(this.totalDamageLost);
  }

  totalDamageMitigated = 0;
  totalDamageLost = 0;

  constructor(options: Options) {
    super(options);
    // -- NOTE: defensive stance will be baseline as of 10.0.5. no talent check anymore.
    this.active = this.selectedCombatant.hasTalent(TALENTS.DEFENSIVE_STANCE_TALENT);
    this.addEventListener(Events.damage.to(SELECTED_PLAYER), this._onDamageTaken);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER), this._onDamageDealt);
  }

  perSecond(amount: number) {
    return (amount / this.owner.fightDuration) * 1000;
  }

  damageTradeoff() {
    let tradeoff = this.totalDamageMitigated / (this.totalDamageLost + this.totalDamageMitigated);
    if (tradeoff > MAX_WIDTH) {
      tradeoff = MAX_WIDTH;
    } else if (tradeoff < 1 - MAX_WIDTH) {
      tradeoff = 1 - MAX_WIDTH;
    }
    return tradeoff;
  }

  _onDamageTaken(event: DamageEvent) {
    if (this.selectedCombatant.hasBuff(TALENTS.DEFENSIVE_STANCE_TALENT.id)) {
      const preMitigatedDefensiveStance =
        (event.amount + (event.absorbed || 0)) / (1 - DEFENSIVE_STANCE_DR);
      this.totalDamageMitigated += preMitigatedDefensiveStance * DEFENSIVE_STANCE_DR;
    }
  }

  _onDamageDealt(event: DamageEvent) {
    if (this.selectedCombatant.hasBuff(TALENTS.DEFENSIVE_STANCE_TALENT.id)) {
      const damageDone = event.amount / (1 - DEFENSIVE_STANCE_DL);
      this.totalDamageLost += damageDone * DEFENSIVE_STANCE_DL;
    }
  }

  statistic() {
    const footer = (
      <div className="statistic-box-bar">
        <Tooltip
          content={`You effectively reduced damage taken by a total of ${formatThousands(
            this.totalDamageMitigated,
          )} damage (${formatThousands(this.perSecond(this.totalDamageMitigated))} DRPS).`}
        >
          <div className="stat-health-bg" style={{ width: `${this.damageTradeoff() * 100}%` }}>
            <img src="/img/shield.png" alt="Damage reduced" />
          </div>
        </Tooltip>
        <Tooltip
          content={`You lost ${formatThousands(
            this.totalDamageLost,
          )} damage through the use of Defensive Stance. (${formatThousands(
            this.perSecond(this.totalDamageLost),
          )} DLPS).`}
        >
          <div className="remainder DeathKnight-bg">
            <img src="/img/sword.png" alt="Damage lost" />
          </div>
        </Tooltip>
      </div>
    );

    return (
      <StatisticBox
        position={STATISTIC_ORDER.CORE(5)}
        icon={<SpellIcon spell={TALENTS.DEFENSIVE_STANCE_TALENT} />}
        value={`≈${formatNumber(this.drps)} DRPS, ${formatNumber(this.dlps)} DLPS`}
        label="Damage reduced & lost"
        tooltip={
          <>
            <strong>Total:</strong>
            <br />
            Effective damage reduction: {formatThousands(this.totalDamageMitigated)} damage (
            {formatThousands(this.perSecond(this.totalDamageMitigated))} DRPS)
            <br />
            Effective damage lost: {formatThousands(this.totalDamageLost)} damage (
            {formatThousands(this.perSecond(this.totalDamageLost))} DLPS)
          </>
        }
        footer={footer}
      />
    );
  }

  suggestions(when: When) {
    when(this.totalDamageLost)
      .isGreaterThan(this.totalDamageMitigated)
      .addSuggestion((suggest, dl, dr) =>
        suggest(
          'While Defensive Stance was up, your damage done was reduced by more than the damage you mitigated. Ensure that you are only using Defensive Stance when you are about to take a lot of damage and that you cancel it quickly to minimize the time spent dealing less damage.',
        )
          .icon(TALENTS.DEFENSIVE_STANCE_TALENT.icon)
          .actual(
            defineMessage({
              id: 'warrior.arms.suggestions.defensiveStance',
              message: `A total of ${formatNumber(
                dl,
              )} of your damage has been reduced compared to ${formatNumber(
                dr,
              )} of the damage from the boss.`,
            }),
          )
          .recommended('Reduced damage taken should be higher than your reduced damage.'),
      );
    when(this.totalDamageMitigated)
      .isLessThan(1)
      .addSuggestion((suggest) =>
        suggest(
          <>
            {' '}
            You never used <SpellLink spell={TALENTS.DEFENSIVE_STANCE_TALENT} />. Try to use it to
            reduce incoming damage or use another talent that would be more useful. Hint: A macro to
            easily switch between stances can be useful!
          </>,
        ).icon(TALENTS.DEFENSIVE_STANCE_TALENT.icon),
      );
  }
}

export default DefensiveStance;
