import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/mage';
import HIT_TYPES from 'game/HIT_TYPES';
import UptimeIcon from 'interface/icons/Uptime';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DamageEvent } from 'parser/core/Events';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';

class FeveredIncantation extends Analyzer {
  damageEvents: DamageEvent[] = [];

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.FEVERED_INCANTATION_TALENT);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER), this.onDamage);
  }

  onDamage(event: DamageEvent) {
    if (
      !this.selectedCombatant.hasBuff(SPELLS.FEVERED_INCANTATION_BUFF.id) ||
      event.hitType !== HIT_TYPES.CRIT
    ) {
      return;
    }
    this.damageEvents.push(event);
  }

  damageDuringBuff = () => {
    const DAMAGE_BONUS_PER_STACK =
      0.02 * this.selectedCombatant.getTalentRank(TALENTS.FEVERED_INCANTATION_TALENT);

    //Calculate Bonus Damage
    let bonusDamage = 0;
    this.damageEvents.forEach((d) => {
      const buff = this.selectedCombatant.getBuff(SPELLS.FEVERED_INCANTATION_BUFF.id, d.timestamp);
      if (buff && buff.stacks) {
        bonusDamage += calculateEffectiveDamage(d, DAMAGE_BONUS_PER_STACK * buff.stacks);
      }
    });
    return bonusDamage;
  };

  get buffUptime() {
    return (
      this.selectedCombatant.getBuffUptime(SPELLS.FEVERED_INCANTATION_BUFF.id) /
      this.owner.fightDuration
    );
  }

  statistic() {
    return (
      <Statistic category={STATISTIC_CATEGORY.TALENTS} size="flexible">
        <BoringSpellValueText spell={TALENTS.FEVERED_INCANTATION_TALENT}>
          <ItemDamageDone amount={this.damageDuringBuff()} />
          <br />
          <UptimeIcon /> {formatPercentage(this.buffUptime)}% <small>Buff uptime</small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default FeveredIncantation;
