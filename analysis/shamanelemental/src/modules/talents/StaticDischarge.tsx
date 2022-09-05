import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, DamageEvent } from 'parser/core/Events';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import { STATISTIC_ORDER } from 'parser/ui/StatisticBox';

class StaticDischarge extends Analyzer {
  damageDone = 0;
  ticks = 0;
  casts = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.STATIC_DISCHARGE_TALENT.id);
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.STATIC_DISCHARGE_TALENT),
      this.onSDDamage,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.STATIC_DISCHARGE_TALENT),
      this.onSDCast,
    );
  }

  get efficientcy() {
    return this.ticks / (6 * this.casts) || 1;
  }

  get suggestionThresholds() {
    return {
      actual: this.ticks / (6 * this.casts),
      isLessThan: {
        minor: 1,
        major: 0.85,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  onSDDamage(event: DamageEvent) {
    this.ticks += 1;
    this.damageDone += event.amount + (event.absorbed || 0);
  }

  onSDCast(event: CastEvent) {
    this.casts += 1;
  }

  suggestions(when: When) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <span>
          You missed ${formatPercentage(1 - actual)}% of the ticks of your{' '}
          <SpellLink id={SPELLS.STATIC_DISCHARGE_TALENT.id} />. Try to maximize the ticks by only
          using it while Flame Shock is active on an enemy in range.
        </span>,
      )
        .icon(SPELLS.STATIC_DISCHARGE_TALENT.icon)
        .actual(
          `${actual}% of possible ticks with ${(
            <SpellLink id={SPELLS.STATIC_DISCHARGE_TALENT.id} />
          )}`,
        )
        .recommended(`${formatPercentage(recommended)}% is recommended`),
    );
  }

  statistic() {
    return (
      <Statistic position={STATISTIC_ORDER.OPTIONAL()} size="flexible">
        <BoringSpellValueText spellId={SPELLS.STATIC_DISCHARGE_TALENT.id}>
          <>
            <ItemDamageDone amount={this.damageDone} />
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default StaticDischarge;
