import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import Enemies from 'parser/shared/modules/Enemies';

import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import StatisticBox, { STATISTIC_ORDER } from 'interface/others/StatisticBox';
import { encodeTargetString } from 'parser/shared/modules/EnemyInstances';

class VirulentPlagueEfficiency extends Analyzer {
  static dependencies = {
	  enemies: Enemies,
  };

  constructor(...args){
    super(...args);

    this.addEventListener(Events.refreshdebuff.by(SELECTED_PLAYER).spell(SPELLS.VIRULENT_PLAGUE), this.onRefresh);
    this.addEventListener(Events.applydebuff.by(SELECTED_PLAYER).spell(SPELLS.VIRULENT_PLAGUE), this.onApply);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.OUTBREAK), this.onCastOutbreak);
  }

  targets = {};

  totalOutBreakCasts = 0;
  totalTimeWasted = 0;

  get VirulentDuration(){
    return this.selectedCombatant.hasTalent(SPELLS.EBON_FEVER_TALENT.id) ? 13.65 : 27.3;
  }

  onRefresh(event) {
    this.targets[encodeTargetString(event.targetID, event.targetInstance)] = event.timestamp + 1000 * this.VirulentDuration;
  }

  onApply(event) {
    this.targets[encodeTargetString(event.targetID, event.targetInstance)] = event.timestamp + 1000 * this.VirulentDuration - 1000 * 0.3 * this.VirulentDuration;
    //Removing 3.15 seconds when buff is only applied. This is for cases when the target does not benefit from the epidemic effect (Dots spreading to adds not staying by target for instance.)    
  }

  onCastOutbreak(event) {
    this.totalOutBreakCasts += 1;
    if (this.targets[encodeTargetString(event.targetID, event.targetInstance)]) {
      //We subtract 6 seconds from the total duration since this is the time left after Outbreak finishes.
      if (((this.targets[encodeTargetString(event.targetID, event.targetInstance)]) - event.timestamp) >= 0) {
        this.totalTimeWasted += ((this.targets[encodeTargetString(event.targetID, event.targetInstance)]) - event.timestamp) / 1000;
      }
    }    
  }

  get averageTimeWasted() {
    return (this.totalTimeWasted / this.totalOutBreakCasts);
  }

  get suggestionThresholds() {
    return {
      actual: this.averageTimeWasted,
      isGreaterThan: {
        minor: (1),
        average: (3),
        major: (5),
      },
      style: 'number',
      suffix: 'Average',
    };
  }

  suggestions(when) {
    when(this.suggestionThresholds)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<> You are casting <SpellLink id={SPELLS.VIRULENT_PLAGUE.id} /> too often. Try to cast <SpellLink id={SPELLS.VIRULENT_PLAGUE.id} /> as close to it falling off as possible.</>)
          .icon(SPELLS.VIRULENT_PLAGUE.icon)
          .actual(`${(this.averageTimeWasted).toFixed(1)} seconds of Virulent Plague uptime was wasted on average for each cast of Outbreak`)
          .recommended(`<${recommended} is recommended`);
      });
  }

  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.VIRULENT_PLAGUE.id} />}
        value={`${(this.averageTimeWasted).toFixed(1)} seconds`}
        label="Average Virulent Plague Duration Waste"
        tooltip={`A total amount of ${this.totalTimeWasted.toFixed(1)} seconds of Virulent Plague uptime was wasted with an average amount of ${(this.averageTimeWasted).toFixed(1)} seconds per cast`}
        position={STATISTIC_ORDER.CORE(7)}
      />
    );
  }
}

export default VirulentPlagueEfficiency;
