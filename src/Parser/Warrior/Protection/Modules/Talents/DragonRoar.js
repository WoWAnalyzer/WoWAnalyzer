import React from 'react';
import Analyzer from 'Parser/Core/Analyzer';
import Enemies from 'Parser/Core/Modules/Enemies';
import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import calculateMaxCasts from 'Parser/Core/calculateMaxCasts';
import Abilities from 'Parser/Core/Modules/Abilities';
import SpellLink from 'common/SpellLink';

import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import Combatants from 'Parser/Core/Modules/Combatants';
import { formatNumber, formatPercentage } from 'common/format';

const ABILITY = SPELLS.DRAGON_ROAR_TALENT;
class DragonRoar extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    enemies: Enemies,
    abilities: Abilities,
  };

  bonusDmg = 0;
  bonusHits = 0;
  maxCasts = 0;
  goodDelays = 0;
  totalHits = 0;

  currentHits = 0;
  lastCast = 0;
  spellCooldown = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasTalent(ABILITY.id);
    this.spellCooldown = this.abilities.abilities.find(e => e.spell.id === ABILITY.id)._cooldown;
    this.lastCast = this.owner.currentTimestamp;
  }

  on_byPlayer_cast(event) {
    if (event.ability.guid !== ABILITY.id) {
      return;
    }

    //if last cast had multiple hits & wasn't delayed for more than one cooldown
    if (this.currentHits > 1 && event.timestamp - this.lastCast - (this.spellCooldown * 1000) <= this.lastCast) {
      this.goodDelays += 1;
    }

    this.lastCast = event.timestamp;
    this.currentHits = 0;
  }

  on_byPlayer_damage(event) {
    if (event.ability.guid !== ABILITY.id) {
      return;
    }

    this.bonusDmg += event.amount + (event.absorbed || 0);
    this.totalHits += 1;

    this.currentHits += 1;
    if (this.currentHits > 1) {
      this.bonusHits += 1;
    }
  }

  on_finished(event) {
    //if last cast had multiple hits & wasn't delayed for more than one cooldown
    if (this.currentHits > 1 && event.timestamp - (this.spellCooldown * 1000) <= this.lastCast ) {
      this.goodDelays += 1;
    }
  }

  get possibleHits() {
    return this.maxCasts - this.goodDelays + this.bonusHits;
  }

  get hitSuggestionThreshold() {
    return {
      actual: this.totalHits / this.possibleHits,
      isLessThan: {
        minor: 0.95,
        average: 0.9,
        major: .8,
      },
      style: 'percentage',
    };
  }

  suggestions(when) {
    when(this.hitSuggestionThreshold)
        .addSuggestion((suggest, actual, recommended) => {
          return suggest(<React.Fragment>It's benefitial to delay <SpellLink id={ABILITY.id} /> to hit multiple targets, but don't delay it too long or you'll miss out on casts and possible hits.</React.Fragment>)
            .icon(ABILITY.icon)
            .actual(`${this.totalHits} total hits`)
            .recommended(`${this.possibleHits} or more hits were possible`);
        });
  }

  statistic() {
    this.maxCasts = Math.ceil(calculateMaxCasts(this.spellCooldown, this.owner.fightDuration));

    return (
      <StatisticBox
        icon={<SpellIcon id={ABILITY.id} />}
        value={`${formatNumber(this.bonusDmg / this.owner.fightDuration * 1000)} DPS`}
        label="Damage contributed"
        tooltip={`
          ${ABILITY.name} added a total of ${formatNumber(this.bonusDmg)} damage (${formatPercentage(this.owner.getPercentageOfTotalDamageDone(this.bonusDmg))}%). </br>
        `}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(5);
}

export default DragonRoar;
