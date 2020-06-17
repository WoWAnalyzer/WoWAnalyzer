import React from 'react';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS/index';
import TraitStatisticBox, { STATISTIC_ORDER } from 'interface/others/TraitStatisticBox';
import ItemHealingDone from 'interface/ItemHealingDone';
import Events from 'parser/core/Events';

import BeaconHealSource from '../beacons/BeaconHealSource.js';

/**
 * Grace of the Justicar
 * Judging a foe heals up to 10 allies within 8 yards of that enemy for 899. (@iLvl 400)
 * Example Log: https://www.warcraftlogs.com/reports/kMbVanmJwCg7WrAz#fight=last&type=summary&source=2
 */
class GraceOfTheJusticar extends Analyzer {
  static dependencies = {
    beaconHealSource: BeaconHealSource,
  };

  healing = 0;
  targetsHit = 0;
  healingTransfered = 0;
  casts = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrait(SPELLS.GRACE_OF_THE_JUSTICAR_TRAIT.id);
    if (!this.active) {
      return;
    }
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.JUDGMENT_CAST_HOLY),
      this.onCast,
    );
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.GRACE_OF_THE_JUSTICAR),
      this.onHeal,
    );
    this.addEventListener(
      this.beaconHealSource.beacontransfer.by(SELECTED_PLAYER),
      this.onBeaconTransfer,
    );
  }

  onBeaconTransfer(event) {
    const spellId = event.originalHeal.ability.guid;
    if (spellId !== SPELLS.GRACE_OF_THE_JUSTICAR.id) {
      return;
    }
    this.healingTransfered += event.amount + (event.absorbed || 0);
  }

  onCast(event) {
    this.casts += 1;
  }

  onHeal(event) {
    this.healing += event.amount + (event.absorbed || 0);
    this.targetsHit += 1;
  }

  get playersHitPerCast() {
    return this.targetsHit / this.casts || 0;
  }
  get totalHealing() {
    return this.healing + this.healingTransfered;
  }

  statistic() {
    return (
      <TraitStatisticBox
        position={STATISTIC_ORDER.OPTIONAL()}
        trait={SPELLS.GRACE_OF_THE_JUSTICAR.id}
        value={
          <>
            <ItemHealingDone amount={this.totalHealing} />
            <br />
            {this.playersHitPerCast.toFixed(1)} Hit/Cast
          </>
        }
        tooltip={
          <>
            Total healing done: <b>{formatNumber(this.totalHealing)}</b>
            <br />
            Beacon healing transfered: <b>{formatNumber(this.healingTransfered)}</b>
            <br />
          </>
        }
      />
    );
  }
}

export default GraceOfTheJusticar;
