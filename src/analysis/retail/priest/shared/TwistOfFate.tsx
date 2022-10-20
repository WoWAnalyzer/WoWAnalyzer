import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import { TALENTS_PRIEST } from 'common/TALENTS';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import { calculateEffectiveHealing } from 'parser/core/EventCalculateLib';
import Events, { AbsorbedEvent, DamageEvent, HealEvent } from 'parser/core/Events';
import { Options } from 'parser/core/Module';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Statistic from 'parser/ui/Statistic';
import { STATISTIC_ORDER } from 'parser/ui/StatisticBox';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';

import { DISCIPLINE_ABILITIES_AFFECTED_BY_HEALING_INCREASES } from '../discipline/constants';
// The holy abilities can be imported once their talents are complete
// import { HOLY_ABILITIES_AFFECTED_BY_HEALING_INCREASES } from '../holy/constants'

class TwistOfFate extends Analyzer {
  healing = 0;
  damage = 0;
  twistOfFateIncrease = 0;

  constructor(options: Options) {
    super(options);
    this.twistOfFateIncrease =
      this.selectedCombatant.getTalentRank(TALENTS_PRIEST.TWIST_OF_FATE_TALENT.id) * 0.05;
    this.active = this.selectedCombatant.hasTalent(TALENTS_PRIEST.TWIST_OF_FATE_TALENT.id);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER), this.onDamage);
    this.addEventListener(Events.heal.by(SELECTED_PLAYER), this.onHeal);
    this.addEventListener(Events.absorbed.by(SELECTED_PLAYER), this.onAbsorb);
  }

  onDamage(event: DamageEvent) {
    if (!this.selectedCombatant.hasBuff(SPELLS.TWIST_OF_FATE_BUFF.id, event.timestamp)) {
      return;
    }

    const raw = event.amount + (event.absorbed || 0);
    this.damage += raw - raw / 1.2;
  }

  onHeal(event: HealEvent) {
    this.parseHeal(event);
  }

  onAbsorb(event: AbsorbedEvent) {
    this.parseHeal(event);
  }

  parseHeal(event: HealEvent | AbsorbedEvent) {
    const spellId = event.ability.guid;
    // TODO : Holy abilities need to go here
    if (!DISCIPLINE_ABILITIES_AFFECTED_BY_HEALING_INCREASES.includes(spellId)) {
      return;
    }
    if (!this.selectedCombatant.hasBuff(SPELLS.TWIST_OF_FATE_BUFF.id, event.timestamp)) {
      return;
    }

    this.healing += calculateEffectiveHealing(event, this.twistOfFateIncrease);
  }

  statistic() {
    if (!this.active) {
      return null;
    }

    const healing = this.healing || 0;
    const damage = this.damage || 0;
    const tofDamage = this.owner.getPercentageOfTotalDamageDone(damage);

    return (
      <Statistic
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        position={STATISTIC_ORDER.CORE(2)}
        tooltip={`The effective healing contributed by Twist of Fate was {formatPercentage(
                tofPercent,
              )}% of total healing done. Twist of Fate also contributed {formatNumber(
                (damage / this.owner.fightDuration) * 1000,
              )} DPS (${formatPercentage(
                tofDamage,
              )}% of total damage); the healing gain of this damage was included in the shown numbers.`}
      >
        <BoringSpellValueText spellId={TALENTS_PRIEST.TWIST_OF_FATE_TALENT.id}>
          <ItemHealingDone amount={healing} />
          <ItemDamageDone amount={damage} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default TwistOfFate;
