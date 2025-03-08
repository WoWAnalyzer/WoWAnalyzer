import { formatPercentage, formatThousands } from 'common/format';
import TALENTS from 'common/TALENTS/warrior';
import { SpellLink } from 'interface';
import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
import Events, { DamageEvent } from 'parser/core/Events';
import StatisticListBoxItem from 'parser/ui/StatisticListBoxItem';

/**
 * Transform into a colossus for 20 sec, causing you to deal 20% increased damage
 * and removing all roots and snares.
 */

const AVATAR_BONUS_DAMAGE = 0.2;

class Avatar extends Analyzer {
  get dps() {
    return (this.totalDamages / this.owner.fightDuration) * 1000;
  }

  totalDamages = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.AVATAR_TALENT);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER), this._onDamage);
  }

  _onDamage(event: DamageEvent) {
    if (
      event.targetIsFriendly ||
      !this.selectedCombatant.hasBuff(TALENTS.AVATAR_TALENT.id, event.timestamp)
    ) {
      return;
    }
    this.totalDamages += calculateEffectiveDamage(event, AVATAR_BONUS_DAMAGE);
  }

  subStatistic() {
    return (
      <StatisticListBoxItem
        title={
          <>
            <SpellLink spell={TALENTS.AVATAR_TALENT} /> bonus damage
          </>
        }
        value={`${formatThousands(this.dps)} DPS`}
        valueTooltip={
          <>
            Your Avatar contributed {formatThousands(this.totalDamages)} total damage (
            {formatPercentage(this.owner.getPercentageOfTotalDamageDone(this.totalDamages))} %).
            <br />
            This only accounts for the passive 20% increased damage of Avatar.
          </>
        }
      />
    );
  }
}

export default Avatar;
