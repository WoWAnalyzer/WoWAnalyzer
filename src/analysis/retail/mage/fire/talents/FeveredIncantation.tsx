import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/mage';
import HIT_TYPES from 'game/HIT_TYPES';
import UptimeIcon from 'interface/icons/Uptime';
import Analyzer, { Options } from 'parser/core/Analyzer';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
import { EventType } from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import EventHistory from 'parser/shared/modules/EventHistory';

class FeveredIncantation extends Analyzer {
  static dependencies = {
    eventHistory: EventHistory,
  };
  protected eventHistory!: EventHistory;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.FEVERED_INCANTATION_TALENT);
  }

  damageDuringBuff = () => {
    const DAMAGE_BONUS_PER_STACK =
      0.01 * this.selectedCombatant.getTalentRank(TALENTS.FEVERED_INCANTATION_TALENT);
    let damageEvents = this.eventHistory.getEventsWithBuff(
      SPELLS.FEVERED_INCANTATION_BUFF,
      EventType.Damage,
    );

    //Filter out non crits
    damageEvents = damageEvents.filter((damage) => damage.hitType === HIT_TYPES.CRIT);

    //Calculate Bonus Damage
    let bonusDamage = 0;
    damageEvents.forEach((d) => {
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
      <Statistic category={STATISTIC_CATEGORY.ITEMS} size="flexible">
        <BoringSpellValueText spellId={TALENTS.FEVERED_INCANTATION_TALENT.id}>
          <ItemDamageDone amount={this.damageDuringBuff()} />
          <br />
          <UptimeIcon /> {formatPercentage(this.buffUptime)}% <small>Buff uptime</small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default FeveredIncantation;
