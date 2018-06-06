import React from 'react';
import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import Combatants from 'Parser/Core/Modules/Combatants';
import Analyzer from 'Parser/Core/Analyzer';
import calculateEffectiveDamage from 'Parser/Core/calculateEffectiveDamage';

const DAMAGE_BONUS = 0.35;

class FreezingRain extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  damage = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasTalent(SPELLS.FREEZING_RAIN_TALENT.id);
  }

  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.BLIZZARD_DAMAGE.id && this.combatants.selected.hasBuff(SPELLS.FREEZING_RAIN_BUFF.id)) {
      this.damage += calculateEffectiveDamage(event, DAMAGE_BONUS);
    }
  }


  get damagePercent() {
    return this.owner.getPercentageOfTotalDamageDone(this.damage);
  }

  get suggestionThresholds() {
    return {
      actual: this.damage,
      isEqual: 0,
      style: 'number',
    };
  }

  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.FREEZING_RAIN_TALENT.id} />}
        value={`${formatPercentage(this.damagePercent)} %`}
        label="Freezing Rain damage"
        tooltip="This is the portion of your total damage attributable to Freezing Rain. This number only considers the damage bonus to Blizzard, and does not factor in extra targets you may have hit due to the increased area of effect."
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.OPTIONAL(10);

  // TODO suggest when Freezing Rain damage is very low but non-zero?
  suggestions(when) {
    when(this.suggestionThresholds).addSuggestion(suggest => {
      return suggest(<React.Fragment>You took <SpellLink id={SPELLS.FREEZING_RAIN_TALENT.id} /> but never used <SpellLink id={SPELLS.BLIZZARD.id} />. Consider taking a different talent.</React.Fragment>)
        .icon(SPELLS.FREEZING_RAIN_TALENT.icon);
    });
  }
}

export default FreezingRain;
