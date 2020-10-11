import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';

import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import Events, { ApplyDebuffStackEvent, RemoveDebuffStackEvent, RemoveDebuffEvent, CastEvent } from 'parser/core/Events';
import Enemies from 'parser/shared/modules/Enemies';
import { encodeTargetString } from 'parser/shared/modules/EnemyInstances';
import StatisticBox, { STATISTIC_ORDER } from 'interface/others/StatisticBox';
import { When } from 'parser/core/ParseResults';

class FesteringStrikeEfficiency extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };

  protected enemies!: Enemies;

  constructor(options: Options) {
    super(options);
    this.activeSpell = this.selectedCombatant.hasTalent(SPELLS.CLAWING_SHADOWS_TALENT.id) ? SPELLS.CLAWING_SHADOWS_TALENT : SPELLS.SCOURGE_STRIKE;

    this.addEventListener(Events.applydebuffstack.by(SELECTED_PLAYER).spell(SPELLS.FESTERING_WOUND), this.onWoundApply);
    this.addEventListener(Events.removedebuffstack.by(SELECTED_PLAYER).spell(SPELLS.FESTERING_WOUND), this.onWoundRemove);
    this.addEventListener(Events.removedebuff.by(SELECTED_PLAYER).spell(SPELLS.FESTERING_WOUND), this.onAllWoundRemove);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(this.activeSpell), this.onCast);
  }

  activeSpell: any;
  // used to track how many stacks a target has
  targets: { [key: string]: number } = {};
  totalCasts = 0;
  zeroWoundCasts = 0;

  onWoundApply(event: ApplyDebuffStackEvent){
		this.targets[encodeTargetString(event.targetID, undefined)] = event.stack;
  }

  onWoundRemove(event: RemoveDebuffStackEvent){
		this.targets[encodeTargetString(event.targetID, undefined)] = event.stack;
  }

  onAllWoundRemove(event: RemoveDebuffEvent){
    this.targets[encodeTargetString(event.targetID, event.targetInstance)] = 0;
  }

  onCast(event: CastEvent){
    this.totalCasts += 1;
    if(this.targets[encodeTargetString(event.targetID, event.targetInstance)]){
      const currentTargetWounds = this.targets[encodeTargetString(event.targetID, event.targetInstance)];
      if(currentTargetWounds < 1){
        this.zeroWoundCasts += 1;
      }
    } else {
    this.zeroWoundCasts += 1;
    }
  }

  suggestions(when: When) {
    const percentCastZeroWounds = this.zeroWoundCasts/this.totalCasts;
    const strikeEfficiency = 1 - percentCastZeroWounds;
    when(strikeEfficiency).isLessThan(0.80)
        .addSuggestion((suggest, actual, recommended) => suggest(<span>You are casting <SpellLink id={this.activeSpell.id} /> too often.  When spending runes remember to cast <SpellLink id={this.activeSpell.id} /> instead on targets with no stacks of <SpellLink id={this.activeSpell.id} /></span>)
            .icon(this.activeSpell.icon)
            .actual(`${formatPercentage(actual)}% of ${this.activeSpell.name} were used with Wounds on the target`)
            .recommended(`>${formatPercentage(recommended)}% is recommended`)
            .regular(recommended - 0.20).major(recommended - 0.40));
  }

  statistic() {
    const percentCastZeroWounds = this.zeroWoundCasts/this.totalCasts;
    const strikeEfficiency = 1 - percentCastZeroWounds;
    return (
      <StatisticBox
        icon={<SpellIcon id={this.activeSpell.id} />}
        value={`${formatPercentage(strikeEfficiency)} %`}
        label={`${this.activeSpell.name} Efficiency`}
        tooltip={`${this.zeroWoundCasts} out of ${this.totalCasts} ${this.activeSpell.name} were used with no Festering Wounds on the target.`}
        position={STATISTIC_ORDER.CORE(3)}
      />
    );
  }
}

export default FesteringStrikeEfficiency;
