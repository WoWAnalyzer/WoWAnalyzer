import React from 'react';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import { formatNumber, formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS/index';
import TraitStatisticBox, { STATISTIC_ORDER } from 'interface/others/TraitStatisticBox';
import ItemHealingDone from 'interface/ItemHealingDone';
import Events from 'parser/core/Events';

import BeaconHealSource from '../beacons/BeaconHealSource.js';

/**
 * Radiant Incandescence
 * Your Holy Shock criticals deal an additional 1725 damage, or an additional 2715 healing, over 3 sec.
 * Example Log: https://www.warcraftlogs.com/reports/vGfw7dYhM1m6n3J4#fight=8&type=healing&source=13&ability=278147&view=events
 */
class RadiantIncandescence extends Analyzer {
  static dependencies = {
    beaconHealSource: BeaconHealSource,
  };

  healing = 0;
  healingTransfered = 0;
  casts = 0;
  crits = 0;
  damage = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrait(SPELLS.RADIANT_INCANDESCENCE_TRAIT.id);
    if (!this.active) {
      return;
    }
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.HOLY_SHOCK_CAST),
      this.onCast,
    );
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.RADIANT_INCANDESCENCE),
      this.onCrit,
    );
    this.addEventListener(
      Events.applydebuff.by(SELECTED_PLAYER).spell(SPELLS.RADIANT_INCANDESCENCE_DAMAGE),
      this.onCrit,
    );
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.RADIANT_INCANDESCENCE),
      this.onHeal,
    );
    this.addEventListener(
      this.beaconHealSource.beacontransfer.by(SELECTED_PLAYER),
      this.onBeaconTransfer,
    );
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.RADIANT_INCANDESCENCE_DAMAGE),
      this.onDamage,
    );
  }

  onCast(event) {
    this.casts += 1;
  }

  onCrit(event) {
    this.crits += 1;
  }

  onHeal(event) {
    this.healing += event.amount + (event.absorbed || 0);
    this.targetsHit += 1;
  }

  onBeaconTransfer(event) {
    const spellId = event.originalHeal.ability.guid;
    if (spellId !== SPELLS.RADIANT_INCANDESCENCE.id) {
      return;
    }
    this.healingTransfered += event.amount + (event.absorbed || 0);
  }

  onDamage(event) {
    this.damage += event.amount + (event.absorbed || 0);
  }

  get critRate() {
    return this.crits / this.casts || 0;
  }
  get totalHealing() {
    return this.healing + this.healingTransfered;
  }

  statistic() {
    return (
      <TraitStatisticBox
        position={STATISTIC_ORDER.OPTIONAL()}
        trait={SPELLS.RADIANT_INCANDESCENCE.id}
        value={
          <>
            <ItemHealingDone amount={this.totalHealing} />
            <br />
            {formatPercentage(this.critRate)}% Crit Rate
          </>
        }
        tooltip={
          <>
            Damage Done: <b>{formatNumber(this.damage)}</b>
            <br />
            Beacon healing transfered: <b>{formatNumber(this.healingTransfered)}</b>
            <br />
          </>
        }
      />
    );
  }
}

export default RadiantIncandescence;
