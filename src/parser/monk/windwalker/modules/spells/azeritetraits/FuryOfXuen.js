import React from 'react';
import Events from 'parser/core/Events';
import Analyzer, { SELECTED_PLAYER_PET, SELECTED_PLAYER } from 'parser/core/Analyzer';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import {calculateAzeriteEffects} from 'common/stats';
import SPELLS from 'common/SPELLS';
import TraitStatisticBox, { STATISTIC_ORDER } from 'interface/others/TraitStatisticBox';
import { formatNumber, formatPercentage } from 'common/format';

const furyOfXuenStats = traits => Object.values(traits).reduce((obj, rank) => {
  const [haste] = calculateAzeriteEffects(SPELLS.FURY_OF_XUEN.id, rank);
  obj.haste += haste;
  return obj;
}, {
  haste: 0,
});

export const STAT_TRACKER = {
  haste: combatant => furyOfXuenStats(combatant.traitsBySpellId[SPELLS.FURY_OF_XUEN.id]).haste,
};

/**
 * Your Combo Strikes grant a stacking 2% chance for your next Fists of Fury to grant 768 Haste and invoke Xuen, The White Tiger for 8 sec.
 * 
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
    const {haste} = furyOfXuenStats(this.selectedCombatant.traitsBySpellId[SPELLS.FURY_OF_XUEN.id]);
    this.haste = haste;

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

  get uptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.FURY_OF_XUEN_SUMMON.id) / this.owner.fightDuration;
  }

  get avgHaste() {
    return this.uptime * this.haste;
  }

  statistic() {
    return (
      <TraitStatisticBox
        position={STATISTIC_ORDER.OPTIONAL()}
        trait={SPELLS.FURY_OF_XUEN.id}
        value={(
          <>
            {this.owner.formatItemDamageDone(this.damageDone)} <br />
            {formatNumber(this.avgHaste)} Average Haste
          </>
        )}
        tooltip={`You procced Fury of Xuen <b>${this.furyXuens.length}</b> times and had <b>${this.haste}</b> extra haste for <b>${formatPercentage(this.uptime)}%</b> of the fight`}
      />
    );
  }
}



export default FuryOfXuen;