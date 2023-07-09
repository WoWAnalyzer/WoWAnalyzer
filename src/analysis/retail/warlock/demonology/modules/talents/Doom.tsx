import { t } from '@lingui/macro';
import { formatPercentage, formatThousands } from 'common/format';
import TALENTS from 'common/TALENTS/warlock';
import { SpellLink } from 'interface';
import UptimeIcon from 'interface/icons/Uptime';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DamageEvent } from 'parser/core/Events';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import Enemies from 'parser/shared/modules/Enemies';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';

class Doom extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };
  enemies!: Enemies;
  damage = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.DOOM_TALENT);
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(TALENTS.DOOM_TALENT),
      this.handleDoomDamage,
    );
  }

  handleDoomDamage(event: DamageEvent) {
    this.damage += event.amount + (event.absorbed || 0);
  }
  get uptime() {
    return this.enemies.getBuffUptime(TALENTS.DOOM_TALENT.id) / this.owner.fightDuration;
  }

  get suggestionThresholds() {
    return {
      actual: this.uptime,
      isLessThan: {
        minor: 0.95,
        average: 0.9,
        major: 0.8,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  suggestions(when: When) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          Your <SpellLink spell={TALENTS.DOOM_TALENT} /> uptime can be improved. Try to pay more
          attention to your Doom on the boss, as it is one of your Soul Shard generators.
        </>,
      )
        .icon(TALENTS.DOOM_TALENT.icon)
        .actual(
          t({
            id: 'warlock.demonology.suggestions.doom.uptime',
            message: `${formatPercentage(actual)}% Doom uptime`,
          }),
        )
        .recommended(`>${formatPercentage(recommended)}% is recommended`),
    );
  }

  statistic() {
    return (
      <Statistic
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
        tooltip={`${formatThousands(this.damage)} damage`}
      >
        <BoringSpellValueText spell={TALENTS.DOOM_TALENT}>
          <ItemDamageDone amount={this.damage} />
          <br />
          <UptimeIcon /> {formatPercentage(this.uptime)}% <small>Uptime</small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default Doom;
