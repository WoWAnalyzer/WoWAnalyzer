import { formatNumber, formatPercentage } from 'common/format';
import { SpellIcon } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
import EventFilter from 'parser/core/EventFilter';
import { DamageEvent, EventType } from 'parser/core/Events';
import BoringValueText from 'parser/ui/BoringValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { STATISTIC_ORDER } from 'parser/ui/StatisticBox';
import TALENTS from 'common/TALENTS/warrior';

const AVATAR_DAMAGE_INCREASE = 0.2;

class Avatar extends Analyzer {
  bonusDmg = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.AVATAR_TALENT);
    if (!this.active) {
      return;
    }
    this.addEventListener(new EventFilter(EventType.Damage).by(SELECTED_PLAYER), this.handleDamage);
  }

  get uptime() {
    return (
      this.selectedCombatant.getBuffUptime(TALENTS.AVATAR_TALENT.id) / this.owner.fightDuration
    );
  }

  handleDamage(event: DamageEvent) {
    if (!this.selectedCombatant.hasBuff(TALENTS.AVATAR_TALENT.id)) {
      return;
    }

    this.bonusDmg += calculateEffectiveDamage(event, AVATAR_DAMAGE_INCREASE);
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(25)}
        size="flexible"
        category={STATISTIC_CATEGORY.GENERAL}
        tooltip={
          <>
            Avatar contributed {formatNumber(this.bonusDmg)} total damage (
            {formatPercentage(this.owner.getPercentageOfTotalDamageDone(this.bonusDmg))}%). <br />
            Uptime was {formatPercentage(this.uptime)}%
          </>
        }
      >
        <BoringValueText
          label={
            <>
              <SpellIcon spell={TALENTS.AVATAR_TALENT} /> Damage Contributed
            </>
          }
        >
          <ItemDamageDone amount={this.bonusDmg} />
        </BoringValueText>
      </Statistic>
    );
  }
}

export default Avatar;
