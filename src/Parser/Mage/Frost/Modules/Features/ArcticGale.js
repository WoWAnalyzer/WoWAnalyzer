import React from 'react';
import Wrapper from 'common/Wrapper';
import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import Combatants from 'Parser/Core/Modules/Combatants';
import Analyzer from 'Parser/Core/Analyzer';
import calculateEffectiveDamage from 'Parser/Core/calculateEffectiveDamage';

const DAMAGE_BONUS = 0.3;

class ArcticGale extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  damage = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasTalent(SPELLS.ARCTIC_GALE_TALENT.id);
  }

  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.BLIZZARD_DAMAGE.id) {
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
        icon={<SpellIcon id={SPELLS.ARCTIC_GALE_TALENT.id} />}
        value={`${formatPercentage(this.damagePercent)} %`}
        label="Arctic Gale damage"
        tooltip="This is the portion of your total damage attributable to Arctic Gale. This number only considers the damage bonus to Blizzard, and does not factor in extra targets you may have hit due to the increased area of effect."
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.OPTIONAL(10);

  // TODO suggest when Arctic Gale damage is very low but non-zero?
  suggestions(when) {
    when(this.suggestionThresholds).addSuggestion(suggest => {
      return suggest(<Wrapper>You took <SpellLink id={SPELLS.ARCTIC_GALE_TALENT.id} /> but never used <SpellLink id={SPELLS.BLIZZARD.id} />. Consider taking a different talent.</Wrapper>)
        .icon(SPELLS.ARCTIC_GALE_TALENT.icon);
    });
  }
}

export default ArcticGale;
