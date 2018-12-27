import React from 'react';
import Events from 'parser/core/Events';
import Analyzer, { SELECTED_PLAYER_PET, SELECTED_PLAYER } from 'parser/core/Analyzer';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import SPELLS from 'common/SPELLS';
import TraitStatisticBox, { STATISTIC_ORDER } from 'interface/others/TraitStatisticBox';
// import { formatNumber } from 'common/format';

// const MAX_STACKS = 67;

/**
 * Your Combo Strikes grant a stacking 2% chance for your next Fists of Fury to grant 768 Haste and invoke Xuen, The White Tiger for 8 sec.
 * The tooltip is rounded up and it actually gives 1.5% per stack
 */
class FuryOfXuen extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
  };
  damageDone = 0;
  furyXuens = [];
  stacksGained = 0;
  stacksWasted = 0;
  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrait(SPELLS.FURY_OF_XUEN.id);
    if (!this.active) {
      return;
    }
    this.addEventListener(Events.damage.by(SELECTED_PLAYER_PET), this.onPetDamage);
    this.addEventListener(Events.summon.by(SELECTED_PLAYER), this.onPlayerSummon);
  }
  
  onPlayerSummon(event) {
    const spellId = event.ability.guid;
    if (SPELLS.FURY_OF_XUEN_SUMMON.id !== spellId) {
      return;
    }
    const furyXuen = {targetID: event.targetID, targetInstance: event.targetInstance};
    this.furyXuens.push(furyXuen);
  }

  onPetDamage(event) {
    const xuen = {sourceID: event.sourceID, targetInstance: event.targetInstance};
    if (!this._isSummonedByFury(xuen)) {
      return;
    }
    this.damageDone = this.damageDone + event.amount + (event.absorbed || 0);
  }

  _isSummonedByFury(xuen) {
    let summonedByFury = false;
    this.furyXuens.forEach((furyXuen) => {
      if (furyXuen.targetInstance === xuen.targetInstance && furyXuen.targetID === xuen.sourceID) {
        summonedByFury = true;
      }
    });
    return summonedByFury;
  }

  statistic() {
    return (
      <TraitStatisticBox
        position={STATISTIC_ORDER.OPTIONAL()}
        trait={SPELLS.FURY_OF_XUEN.id}
        value={(
          <>
            {this.owner.formatItemDamageDone(this.damageDone)} <br />
            {this.furyXuens.length} procs
          </>
        )}
        tooltip={``}
      />
    );
  }
}



export default FuryOfXuen;