import React from 'react';
import SPELLS from 'common/SPELLS';
import Analyzer from 'parser/core/Analyzer';
import TraitStatisticBox from 'interface/others/TraitStatisticBox';
import { calculateAzeriteEffects } from 'common/stats';
import { formatNumber, formatPercentage } from 'common/format';
import GrandCrusader from '../../core/GrandCrusader';
import SpellUsable from '../../features/SpellUsable';

function inspiringVanguardStrength(combatant) {
  if(!combatant.hasTrait(SPELLS.INSPIRING_VANGUARD.id)) {
    return 0;
  }

  const traits = combatant.traitsBySpellId[SPELLS.INSPIRING_VANGUARD.id];
  return traits.reduce((sum, ilvl) => sum + calculateAzeriteEffects(SPELLS.INSPIRING_VANGUARD.id, ilvl)[0], 0);
}

// TODO: figure out how to get the stats to the stat tracker without
// crashing the whole thing.
//
// something is causing a dependency look via SpellUsable
export const INSPIRING_VANGUARD_STATS = {
  strength: inspiringVanguardStrength,
};

class InspiringVanguard extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
    gc: GrandCrusader,
  };
  
  _strength = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrait(SPELLS.INSPIRING_VANGUARD.id);

    if(!this.active) {
      return;
    }

    this._strength = inspiringVanguardStrength(this.selectedCombatant);
  }

  get avgStrength() {
    return this._strength * this.buffUptimePct;
  }

  get buffUptimePct() {
    return this.selectedCombatant.getBuffUptime(SPELLS.INSPIRING_VANGUARD_BUFF.id) / this.owner.fightDuration;
  }

  on_toPlayer_applybuff(event) {
    this._handleBuff(event);
  }

  on_toPlayer_refreshbuff(event) {
    this._handleBuff(event);
  }

  _handleBuff(event) {
    if(event.ability.guid !== SPELLS.INSPIRING_VANGUARD_BUFF.id) {
      return;
    }

    this.gc.triggerExactReset(event);

    // reset AS cd
    if(this.spellUsable.isOnCooldown(SPELLS.AVENGERS_SHIELD.id)) {
      this.spellUsable.endCooldown(SPELLS.AVENGERS_SHIELD.id);
    }

    // reset Judgment CD if the CJ talent is selected
    if(this.selectedCombatant.hasTalent(SPELLS.CRUSADERS_JUDGMENT_TALENT.id) && this.spellUsable.isOnCooldown(SPELLS.JUDGMENT_CAST_PROTECTION.id)) {
      this.spellUsable.endCooldown(SPELLS.JUDGMENT_CAST_PROTECTION.id);
    }
  }

  statistic() {
    return ( 
      <TraitStatisticBox
        trait={SPELLS.INSPIRING_VANGUARD.id}
        value={`${formatNumber(this.avgStrength)} Avg. Strength`}
        tooltip={`Inspiring Vanguard was up for <b>${formatPercentage(this.buffUptimePct)}%</b> of the fight.`}
        /> 
    );
  }
}

export default InspiringVanguard;
