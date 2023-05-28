import { t } from '@lingui/macro';
import { formatPercentage, formatThousands, formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS/classic/warlock';
import { SpellIcon, SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
import Events, { DamageEvent } from 'parser/core/Events';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import Enemies from 'parser/shared/modules/Enemies';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import UptimeBar from 'parser/ui/UptimeBar';

const HAUNT_DAMAGE_BONUS = 0.2;

class Haunt extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };
  protected enemies!: Enemies;

  get uptime() {
    return this.enemies.getBuffUptime(SPELLS.HAUNT.id) / this.owner.fightDuration;
  }

  get dps() {
    return (this.bonusDmg / this.owner.fightDuration) * 1000;
  }

  get suggestionThresholds() {
    return {
      actual: this.uptime,
      isLessThan: {
        minor: 0.9,
        average: 0.85,
        major: 0.75,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  bonusDmg = 0;
  totalTicks = 0;
  buffedTicks = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.talentPoints[0] >= 50;
    this.addEventListener(Events.damage.by(SELECTED_PLAYER), this.onDamage);
  }

  onDamage(event: DamageEvent) {
    const target = this.enemies.getEntity(event);
    if (!target) {
      return;
    }

    const hasHaunt = target.hasBuff(SPELLS.HAUNT.id, event.timestamp);

    if (hasHaunt) {
      this.bonusDmg += calculateEffectiveDamage(event, HAUNT_DAMAGE_BONUS);
    }
  }

  suggestions(when: When) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          Your <SpellLink id={SPELLS.HAUNT.id} /> debuff uptime is too low. While it's usually not
          possible to get 100% uptime due to travel and cast time, you should aim for as much uptime
          on the debuff as possible.
        </>,
      )
        .icon(SPELLS.HAUNT.icon)
        .actual(
          t({
            id: 'warlock.affliction.suggestions.haunt.uptime',
            message: `${formatPercentage(actual)}% Haunt uptime.`,
          }),
        )
        .recommended(`> ${formatPercentage(recommended)}% is recommended`),
    );
  }

  statistic() {
    return (
      <Statistic
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
        tooltip={
          <>
            {formatThousands(this.bonusDmg)} bonus damage
            <br />
          </>
        }
      >
        <BoringSpellValueText spellId={SPELLS.HAUNT.id}>
          {formatPercentage(this.uptime)} % <small>uptime</small>
          <br />
          {formatNumber(this.dps)} DPS{' '}
          <small>
            {formatPercentage(this.owner.getPercentageOfTotalDamageDone(this.bonusDmg))} % of total
          </small>
        </BoringSpellValueText>
      </Statistic>
    );
  }

  subStatistic() {
    const history = this.enemies.getDebuffHistory(SPELLS.HAUNT.id);
    return (
      <div className="flex">
        <div className="flex-sub icon">
          <SpellIcon id={SPELLS.HAUNT.id} />
        </div>
        <div className="flex-sub value" style={{ width: 140 }}>
          {formatPercentage(this.uptime, 0)} % <small>uptime</small>
        </div>
        <div className="flex-main chart" style={{ padding: 15 }}>
          <UptimeBar
            uptimeHistory={history}
            start={this.owner.fight.start_time}
            end={this.owner.fight.end_time}
          />
        </div>
      </div>
    );
  }
}

export default Haunt;
