import React from 'react';

import SPELLS from 'common/SPELLS';
import Events from 'parser/core/Events';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';

import calculateEffectiveHealing from 'parser/core/calculateEffectiveHealing';

import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import ItemHealingDone from 'interface/ItemHealingDone';

class SwirlingCurrents extends Analyzer {

  healingBoost = 0;

  healing = 0;

  targetsWithBoostedRiptides = [];

  /**
   * Using Healing stream totem/Cloudburst totem increases the healing of your next 3 healing surges, healing waves or riptides by x%
   */
  constructor(...args) {
    super(...args);
    this.active = true;

    this.healingBoost = .2;//TODO Get from combat data when they EXPORT IT >:c

    if (!this.active) {
      return;
    }

    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell([SPELLS.HEALING_SURGE_RESTORATION, SPELLS.HEALING_WAVE, SPELLS.RIPTIDE]), this.normalizeBoost);

    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.RIPTIDE), this.trackRiptide);
    this.addEventListener(Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.RIPTIDE), this.addRiptide);
    this.addEventListener(Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.RIPTIDE), this.removeRiptide);
    this.addEventListener(Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.RIPTIDE), this.pandemicRiptide);
  }

  normalizeBoost(event){
    if (this.selectedCombatant.hasBuff(SPELLS.SWIRLING_CURRENTS_BUFF.id) || this.targetsWithBoostedRiptides[event.targetID]) {
      this.healing += calculateEffectiveHealing(event, this.healingBoost);
    }
  }

  addRiptide(event){
    const targetID = event.targetID;
    if (this.selectedCombatant.hasBuff(SPELLS.SWIRLING_CURRENTS_BUFF.id)) {
      this.targetsWithBoostedRiptides[targetID]=targetID;
    }
  }

  trackRiptide(event){
    const targetID = event.targetID;
    if (this.selectedCombatant.hasBuff(SPELLS.SWIRLING_CURRENTS_BUFF.id)) {
      this.targetsWithBoostedRiptides[targetID]=targetID;
    }else{
      delete this.targetsWithBoostedRiptides[targetID];
    }
  }

  removeRiptide(event){
    delete this.targetsWithBoostedRiptides[event.targetID];
  }

  pandemicRiptide(event){
    if (!this.selectedCombatant.hasBuff(SPELLS.SWIRLING_CURRENTS_BUFF.id)) {
     delete this.targetsWithBoostedRiptides[event.targetID];
    }
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.COVENANTS}
      >
        <BoringSpellValueText spell={SPELLS.SWIRLING_CURRENTS}>
          <ItemHealingDone amount={this.healing} /><br />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default SwirlingCurrents;