import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/warrior';
import { formatDurationMillisMinSec, formatNumber, formatPercentage } from 'common/format';
import HIT_TYPES from 'game/HIT_TYPES';
import { SpellLink } from 'interface';
import { DamageIcon, UptimeIcon } from 'interface/icons';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
import Events, { CastEvent, DamageEvent } from 'parser/core/Events';
import { Options } from 'parser/core/Module';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import BoringValue from 'parser/ui/BoringValueText';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import Statistic from 'parser/ui/Statistic';

/** Default duration is 4 seconds, Elysian Might increases by 2 seconds */
const SPEAR_DURATION = (4 + 2) * 1000;
const CRIT_DAMAGE_INCREASE = 0.25;

class ElysianMight extends Analyzer {
  private _numberOfCasts: number = 0;
  /**
   * The "theoretical" maximum uptime. Meaning that you stand in the spear
   * from the moment it is thrown until it disappears, every cast throughout the fight.
   */
  private _maximumBuffUptime: number = 0;
  /**
   * The actual uptime of the Elysian Might buff.
   */
  private _actualBuffUptime: number = 0;
  private _numberOfCrits: number = 0;
  private _increasedCritDamage: number = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.ELYSIAN_MIGHT_TALENT);

    if (!this.active) {
      return;
    }

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.SPEAR_OF_BASTION),
      this.onCast,
    );
    this.addEventListener(Events.damage.by(SELECTED_PLAYER), this.onDamage);
    this.addEventListener(Events.fightend, this.onFightEnd);
  }

  private onCast(event: CastEvent) {
    this._numberOfCasts += 1;
    this._maximumBuffUptime += Math.min(
      this.owner.fight.end_time - event.timestamp,
      SPEAR_DURATION,
    );
  }

  private onDamage(event: DamageEvent) {
    if (
      this.selectedCombatant.getBuff(SPELLS.ELYSIAN_MIGHT_BUFF.id) &&
      event.hitType === HIT_TYPES.CRIT
    ) {
      this._numberOfCrits += 1;
      this._increasedCritDamage += calculateEffectiveDamage(event, CRIT_DAMAGE_INCREASE);
    }
  }

  private onFightEnd() {
    this._actualBuffUptime = this.selectedCombatant.getBuffUptime(SPELLS.ELYSIAN_MIGHT_BUFF.id);
  }

  private uptimeSuggestionThreshold() {
    return {
      actual: this.uptimePercentage(),
      isLessThan: {
        minor: 0.95,
        average: 0.87,
        major: 0.78,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  public uptimePercentage() {
    return this._actualBuffUptime / this._maximumBuffUptime;
  }

  public increasedCritDamage() {
    return this._increasedCritDamage;
  }

  suggestions(when: When) {
    when(this.uptimeSuggestionThreshold()).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          To gain the full benefit of <SpellLink spell={SPELLS.SPEAR_OF_BASTION} /> and{' '}
          <SpellLink spell={TALENTS.ELYSIAN_MIGHT_TALENT} />, you must stand at the spear for the
          duration. If you cannot stand in the Spear for most of the duration, you might be better
          of with another talent, such as <SpellLink spell={TALENTS.THUNDEROUS_ROAR_TALENT} />.
        </>,
      )
        .icon(TALENTS.ELYSIAN_MIGHT_TALENT.icon)
        .actual(
          `You stood in the spear for a total of ${formatDurationMillisMinSec(
            this._actualBuffUptime,
          )} out of a possible ${formatDurationMillisMinSec(
            this._maximumBuffUptime,
          )} (${formatPercentage(actual, 1)}%)`,
        )
        .recommended(`${formatPercentage(recommended, 0)}%> uptime is recommended`),
    );
  }

  statistic() {
    return (
      <Statistic
        category={STATISTIC_CATEGORY.TALENTS}
        position={STATISTIC_ORDER.OPTIONAL(2)}
        size="flexible"
        tooltip={
          <>
            <p>
              To gain the benefit of <SpellLink spell={TALENTS.ELYSIAN_MIGHT_TALENT} />, you must
              stand in the Spear for the duration. Out of the theoretically possible{' '}
              {formatDurationMillisMinSec(this._maximumBuffUptime)}, you had an uptime of{' '}
              {formatDurationMillisMinSec(this._actualBuffUptime)}
            </p>
            <p>
              A total of {this._numberOfCrits} crits were increased by{' '}
              {formatPercentage(CRIT_DAMAGE_INCREASE, 0)}% to for a total of{' '}
              {formatNumber(this._increasedCritDamage)} damage.
            </p>
          </>
        }
      >
        <BoringSpellValueText spell={TALENTS.ELYSIAN_MIGHT_TALENT}>
          <UptimeIcon /> {formatPercentage(this.uptimePercentage(), 1)}% <small>uptime</small>
        </BoringSpellValueText>
        <BoringValue label="">
          <DamageIcon /> {formatNumber(this.owner.getPerSecond(this._increasedCritDamage))} DPS
        </BoringValue>
      </Statistic>
    );
  }
}

export default ElysianMight;
