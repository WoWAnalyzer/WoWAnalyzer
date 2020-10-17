import React from 'react';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import StatisticBox, { STATISTIC_ORDER } from 'interface/others/StatisticBox';

import { i18n } from '@lingui/core';
import { t } from '@lingui/macro';

import SpellUsable from '../features/SpellUsable';
import Abilities from '../Abilities';
import Events from 'parser/core/Events';

class Predator extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
    abilities: Abilities,
  };

  totalCasts = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.PREDATOR_TALENT.id);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.TIGERS_FURY), this.onCast);
  }

  onCast(event) {
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
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) => suggest(
        <>
          You're not gaining much benefit from <SpellLink id={SPELLS.PREDATOR_TALENT.id} />. If the fight has adds make sure they have bleeds on them when they die, and make use of your <SpellLink id={SPELLS.TIGERS_FURY.id} /> cooldown being reset. If the fight doesn't have adds it would be a good idea to switch to another talent.
        </>,
      )
        .icon(SPELLS.PREDATOR_TALENT.icon)
        .actual(i18n._(t('druid.feral.suggestions.predator.efficiency')`${actual.toFixed(1)} extra casts of Tiger's Fury per minute.`))
        .recommended(`>${recommended.toFixed(1)} is recommended`));
  }

  statistic() {
    // There may be early casts without any extra casts overall
    const earlyCastsComment = <><br />Thanks to Predator <strong>{this.earlyCasts}</strong> of your Tiger's Fury casts {this.earlyCasts !== 1 ? 'were' : 'was'} before when the cooldown would have been ready.</>;
    const hadExtraCasts = <>Your Predator talent allowed you to use Tiger's Fury at least <strong>{this.extraCasts}</strong> extra time{this.extraCasts !== 1 ? 's' : ''}. Without it you would have had time for <strong>{this.baseCasts}</strong> cast{this.baseCasts !== 1 ? 's' : ''} but with it you were able to use Tiger's Fury <strong>{this.totalCasts}</strong> time{this.totalCasts !== 1 ? 's' : ''}.{this.earlyCasts > 0 && earlyCastsComment}</>;
    const noExtraCasts = <>Your Predator talent didn't allow you to cast more Tiger's Fury overall than you would have been able to without it, with the fight lasting long enough for all <strong>{this.totalCasts}</strong> of your cast{this.totalCasts !== 1 ? 's' : ''}. Either there were no enemies dying with your bleeds on them during this fight or you didn't make use of Tiger's Fury when it came off cooldown.{this.earlyCasts > 0 && earlyCastsComment}</>;
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.PREDATOR_TALENT.id} />}
        value={this.extraCastsPerMinute.toFixed(2)}
        label="Extra Tiger's Fury casts per minute"
        tooltip={this.extraCasts > 0 ? hadExtraCasts : noExtraCasts}
        positon={STATISTIC_ORDER.OPTIONAL(3)}
      />
    );
  }
}

export default Predator;
