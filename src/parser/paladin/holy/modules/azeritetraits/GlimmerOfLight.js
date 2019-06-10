import React from 'react';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import TraitStatisticBox, { STATISTIC_ORDER } from 'interface/others/TraitStatisticBox';
import ItemHealingDone from 'interface/others/ItemHealingDone';
import Events from 'parser/core/Events';

import BeaconHealSource from '../beacons/BeaconHealSource.js';


/**
 * Glimmer of Light,	Azerite Power
 * Requires Paladin (Holy, Holy)
 * Holy Shock leaves a Glimmer of Light on the target for 30 sec.  
 * When you Holy Shock, all targets with Glimmer of Light are damaged for 1076 or healed for 1587. (at ilvl 400)
 * Example Log: https://www.warcraftlogs.com/reports/TX4nzPy8WwrfLv97#fight=19&type=auras&source=5&ability=287280
 */
class GlimmerOfLight extends Analyzer {
  static dependencies = {
    beaconHealSource: BeaconHealSource,
  };

  glimmerHeals = 0;
  healing = 0;
  wasted = 0;
  healingTransfered = 0;
  casts = 0;
  refresh = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrait(SPELLS.GLIMMER_OF_LIGHT_TRAIT.id);
    if (!this.active) {
      return;
    }
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.HOLY_SHOCK_CAST), this.onCast);
    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(SPELLS.GLIMMER_OF_LIGHT), this.onHeal);
    this.addEventListener(this.beaconHealSource.beacontransfer.by(SELECTED_PLAYER), this.onBeaconTransfer);
    this.addEventListener(Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.GLIMMER_OF_LIGHT_BUFF), this.onRefresh);
  }

  onBeaconTransfer(event) {
    const spellId = event.originalHeal.ability.guid;
    if (spellId !== SPELLS.GLIMMER_OF_LIGHT.id) {
      return;
    }
    this.healingTransfered += event.amount + (event.absorbed || 0);
  }

  onCast(event) {
    this.casts += 1;
  }

  onHeal(event) {
    this.healing += event.amount + (event.absorbed || 0);
    this.glimmerHeals += 1;
  }

  onRefresh(event){
    
    this.refresh += 1;
    this.wasted += event.remaining || 0;
  }

  get healsPerCast(){
    return this.glimmerHeals / this.casts; 
    }

  get holyShocksPerMinute(){
    return this.casts / (this.owner.fightDuration / 60000);
  }

  get totalHealing() {
    return this.healing + this.healingTransfered;
  }

  statistic() {
    return (
      <TraitStatisticBox
        position={STATISTIC_ORDER.OPTIONAL()}
        trait={SPELLS.GLIMMER_OF_LIGHT.id}
        value={(
          <>
            <ItemHealingDone amount={this.totalHealing} /><br />
            {this.healsPerCast.toFixed(1)} Heals/Cast
          </>
        )}
        tooltip={(
          <>
            Total healing done: <b>{formatNumber(this.totalHealing)}</b><br />
            Beacon healing transfered: <b>{formatNumber(this.healingTransfered)}</b><br />
            Holy Shocks/Minute: <b>{this.holyShocksPerMinute.toFixed(1)}</b><br />
            Early refresh(s): <b>{this.refresh}</b><br />
            Uptime wasted: <b>{this.wasted}</b><br />
          </>
        )}
      />
    );
  }
}

export default GlimmerOfLight;
