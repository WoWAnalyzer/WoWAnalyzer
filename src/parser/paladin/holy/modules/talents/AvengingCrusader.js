import React from 'react';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import { formatNumber, formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS/index';
import TraitStatisticBox, { STATISTIC_ORDER } from 'interface/others/TraitStatisticBox';
import ItemHealingDone from 'interface/ItemHealingDone';
import Events from 'parser/core/Events';

import BeaconHealSource from '../beacons/BeaconHealSource.js';

/**
 * Avenging Crusader
 *
 *  You become the ultimate crusader of light, increasing your Crusader Strike, Judgment, and auto-attack damage by 30%.
 *  Crusader Strike and Judgment cool down 30% faster and heal up to 3 injured allies for 250% of the damage they deal. Lasts 20 sec.
 *  Example Log: https://www.warcraftlogs.com/reports/QNJxrchLwB3WtXqP#fight=last&type=healing&source=7
 */
class AvengingCrusader extends Analyzer {
  static dependencies = {
    beaconHealSource: BeaconHealSource,
  };

  healing = 0;
  healingTransfered = 0;
  hits = 0;
  crits = 0;
  overHealing = 0;
  beaconOverhealing = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.AVENGING_CRUSADER_TALENT.id);
    if (!this.active) {
      return;
    }
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.AVENGING_CRUSADER_HEAL_NORMAL),
      this.onHit,
    );
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.AVENGING_CRUSADER_HEAL_CRIT),
      this.onCrit,
    );
    this.addEventListener(
      this.beaconHealSource.beacontransfer.by(SELECTED_PLAYER),
      this.onBeaconTransfer,
    );
  }

  onHit(event) {
    this.hits += 1;
    this.healing += event.amount + (event.absorbed || 0);
    this.overHealing += event.overheal || 0;
  }

  onCrit(event) {
    this.crits += 1;
    this.onHit(event);
  }

  onBeaconTransfer(event) {
    const spellId = event.originalHeal.ability.guid;
    if (
      spellId !== SPELLS.AVENGING_CRUSADER_HEAL_NORMAL.id &&
      spellId !== SPELLS.AVENGING_CRUSADER_HEAL_CRIT.id
    ) {
      return;
    }
    this.healingTransfered += event.amount + (event.absorbed || 0);
    this.beaconOverhealing += event.overheal || 0;
  }

  get critRate() {
    return this.crits / this.hits || 0;
  }
  get totalHealing() {
    return this.healing + this.healingTransfered;
  }

  statistic() {
    return (
      <TraitStatisticBox
        position={STATISTIC_ORDER.OPTIONAL()}
        trait={SPELLS.AVENGING_CRUSADER_TALENT.id}
        value={
          <>
            <ItemHealingDone amount={this.totalHealing} />
            <br />
            {formatPercentage(this.critRate)}% Crit Rate
          </>
        }
        tooltip={
          <>
            Hits: <b>{this.hits}</b> Crits: <b>{this.crits}</b>
            <br />
            Overhealed:{' '}
            <b>{formatPercentage(this.overHealing / (this.healing + this.overHealing))}%</b>
            <br />
            Beacon healing: <b>{formatNumber(this.healingTransfered)}</b>
            <br />
            Beacon overhealed:{' '}
            <b>
              {formatPercentage(
                this.beaconOverhealing / (this.beaconOverhealing + this.healingTransfered),
              )}
              %
            </b>
            <br />
          </>
        }
      />
    );
  }
}

export default AvengingCrusader;
