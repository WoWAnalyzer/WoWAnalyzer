import React from 'react';

import SPELLS from 'common/SPELLS';

import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';

import { STATISTIC_ORDER } from 'interface/others/StatisticBox';
import Events, { CastEvent, DamageEvent } from 'parser/core/Events';
import Statistic from 'interface/statistics/Statistic';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import ItemDamageDone from 'interface/ItemDamageDone';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import SpellLink from 'common/SpellLink';

class StaticDischarge extends Analyzer {
  damageDone = 0;
  ticks = 0;
  casts = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.STATIC_DISCHARGE_TALENT.id);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.STATIC_DISCHARGE_TALENT),
      this.onSDDamage);
  }

  onSDDamage(event: DamageEvent) {
    this.ticks += 1;
    this.damageDone += event.amount + (event.absorbed || 0);
  }

  onSDCast(event: CastEvent) {
    this.casts += 1;
  }

  get suggestionThresholds() {
    return {
      actual: this.ticks/(6*this.casts),
      isLessThan: {
        minor: 1,
        major: 0.85,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  suggestions(when: When) {
    when(this.suggestionThresholds)
      .addSuggestion((suggest, actual, recommended) =>
        suggest(<span>Maximize your damage with Static Discharge by only using it with Flame Shock active.</span>)
        .icon(SPELLS.STATIC_DISCHARGE_TALENT.icon)
        .actual(`${actual}% of possible ticks with ${<SpellLink id={SPELLS.STATIC_DISCHARGE_TALENT.id}/>}`)
          .recommended(<span>Only cast ${<SpellLink id={SPELLS.STATIC_DISCHARGE_TALENT.id} />} while <SpellLink id={SPELLS.FLAME_SHOCK.id}/> is up.</span>));
  };

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL()}
        size="flexible"
      >
        <BoringSpellValueText spell={SPELLS.STATIC_DISCHARGE_TALENT}>
          <>
            <ItemDamageDone amount={this.damageDone} />
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default StaticDischarge;
