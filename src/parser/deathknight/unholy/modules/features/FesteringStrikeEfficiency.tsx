import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';

import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import { When, ThresholdStyle } from 'parser/core/ParseResults';
import { encodeTargetString } from 'parser/shared/modules/EnemyInstances';

import StatisticBox, { STATISTIC_ORDER } from 'interface/others/StatisticBox';

import WoundTracker from './WoundTracker';

const SAFE_WOUND_COUNT = 3;

class FesteringStrikeEfficiency extends Analyzer {
  static dependencies = {
    woundTracker: WoundTracker,
  };

  protected woundTracker!: WoundTracker;

  constructor(options: Options) {
    super(options);

    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.FESTERING_STRIKE), this.onCast);
  }

  totalFesteringStrikeCasts = 0;
  festeringStrikeCastsOverSafeCount = 0;

  onCast(event: CastEvent){
    this.totalFesteringStrikeCasts += 1;
    const targetString = encodeTargetString(event.targetID, event.targetInstance);

    if(this.woundTracker.targets[targetString]){
      const currentTargetWounds = this.woundTracker.targets[targetString];
      if(currentTargetWounds > SAFE_WOUND_COUNT){
        this.festeringStrikeCastsOverSafeCount += 1;
      }
    }
  }

  get strikeEfficiency(): number {
    return 1 - (this.festeringStrikeCastsOverSafeCount / this.totalFesteringStrikeCasts);
  }

  get suggestionThresholds() {
    return {
      actual: this.strikeEfficiency,
      isLessThan: {
        minor: .80,
        average: .70,
        major: .60,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  suggestions(when: When) {
    when(this.suggestionThresholds)
      .addSuggestion((suggest, actual, recommended) => suggest(<span>You are casting <SpellLink id={SPELLS.FESTERING_STRIKE.id} /> too often.  When spending runes remember to cast <SpellLink id={SPELLS.SCOURGE_STRIKE.id} /> instead on targets with more than three stacks of <SpellLink id={SPELLS.FESTERING_WOUND.id} /></span>)
      .icon(SPELLS.FESTERING_STRIKE.icon)
      .actual(`${formatPercentage(actual)}% of Festering Strikes did not risk overcapping Festering Wounds`)
      .recommended(`>${formatPercentage(recommended)}% is recommended`));
  }

  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.FESTERING_STRIKE.id} />}
        value={`${formatPercentage(this.strikeEfficiency)} %`}
        label="Festering Strike Efficiency"
        tooltip={`${this.festeringStrikeCastsOverSafeCount} of out ${this.totalFesteringStrikeCasts} Festering Strikes were cast on a target with more than three stacks of Festering Wounds.`}
        position={STATISTIC_ORDER.CORE(4)}
      />
    );
  }
}

export default FesteringStrikeEfficiency;
