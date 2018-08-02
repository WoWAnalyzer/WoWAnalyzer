import React from 'react';
import Analyzer from 'Parser/Core/Analyzer';
import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import StatisticBox, { STATISTIC_ORDER } from 'Interface/Others/StatisticBox';
import SpellUsable from '../Features/SpellUsable';
import Abilities from '../Abilities';

class Predator extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
    abilities: Abilities,
  };

  totalCasts = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.PREDATOR_TALENT.id);
  }

  on_byPlayer_cast(event) {
    if (SPELLS.TIGERS_FURY.id !== event.ability.guid) {
      return;
    }
    this.totalCasts += 1;
  }

  get baseCasts() {
    const tigersFury = this.abilities.getAbility(SPELLS.TIGERS_FURY.id);
    return 1 + Math.floor(this.owner.fightDuration / (tigersFury.cooldown * 1000));
  }

  get earlyCasts() {
    return this.spellUsable.earlyCastsOfTigersFury;
  }

  get extraCasts() {
    return Math.max(0, this.totalCasts - this.baseCasts);
  }
  get extraCastsPerMinute() {
    return (this.extraCasts / this.owner.fightDuration) * 1000 * 60;
  }

  get suggestionThresholds() {
    return {
      actual: this.extraCastsPerMinute,
      isLessThan: {
        minor: 1.0,
        average: 0.5,
        major: 0.2,
      },
      style: 'number',
    };
  }

  suggestions(when) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) => {
      return suggest(
        <React.Fragment>
          You're not gaining much benefit from <SpellLink id={SPELLS.PREDATOR_TALENT.id} />. If the fight has adds make sure they have bleeds on them when they die, and make use of your <SpellLink id={SPELLS.TIGERS_FURY.id} /> cooldown being reset. If the fight doesn't have adds it would be a good idea to switch to another talent.
        </React.Fragment>
      )
        .icon(SPELLS.PREDATOR_TALENT.icon)
        .actual(`${actual.toFixed(1)} extra casts of Tiger's Fury per minute.`)
        .recommended(`>${recommended.toFixed(1)} is recommended`);
    });
  }

  statistic() {
    // There may be early casts without any extra casts overall
    const earlyCastsComment = this.earlyCasts > 0 ? `<br/>Thanks to Predator <b>${this.earlyCasts}</b> of your Tiger's Fury casts ${this.earlyCasts !== 1 ? 'were' : 'was'} before when the cooldown would have been ready.` : '';
    const hadExtraCasts = `Your Predator talent allowed you to use Tiger's Fury at least <b>${this.extraCasts}</b> extra time${this.extraCasts !== 1 ? 's' : ''}. Without it you would have had time for <b>${this.baseCasts}</b> cast${this.baseCasts !== 1 ? 's' : ''} but with it you were able to use Tiger's Fury <b>${this.totalCasts}</b> time${this.totalCasts !== 1 ? 's' : ''}.${earlyCastsComment}`;
    const noExtraCasts = `Your Predator talent didn't allow you to cast more Tiger's Fury overall than you would have been able to without it, with the fight lasting long enough for all <b>${this.totalCasts}</b> of your cast${this.totalCasts !== 1 ? 's' : ''}. Either there were no enemies dying with your bleeds on them during this fight or you didn't make use of Tiger's Fury when it came off cooldown.${earlyCastsComment}`;
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.PREDATOR_TALENT.id} />}
        value={this.extraCastsPerMinute.toFixed(2)}
        label="Extra Tiger's Fury casts per minute"
        tooltip={this.extraCasts > 0 ? hadExtraCasts : noExtraCasts}
      />
    );
  }

  statisticOrder = STATISTIC_ORDER.OPTIONAL(3);
}

export default Predator;
