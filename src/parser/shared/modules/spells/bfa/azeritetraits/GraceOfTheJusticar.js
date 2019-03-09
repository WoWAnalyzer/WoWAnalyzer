import React from 'react';
import Analyzer from 'parser/core/Analyzer';
import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS/index';
import TraitStatisticBox, { STATISTIC_ORDER } from 'interface/others/TraitStatisticBox';
import ItemHealingDone from 'interface/others/ItemHealingDone';

/**
 * Grace of the Justicar
 * Judging a foe heals up to 10 allies within 8 yards of that enemy for 899. (@iLvl 400)
 * Example Log: https://www.warcraftlogs.com/reports/kMbVanmJwCg7WrAz#fight=last&type=summary&source=2
 */
class GraceOfTheJusticar extends Analyzer {
  graceHealing = 0;
  targetsHit = 0;
  beaconTransfer = 0;
  casts = 0;
  justJudged = false;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrait(SPELLS.GRACE_OF_THE_JUSTICAR_TRAIT.id);
  }

  on_byPlayer_cast(event) {
    if (event.ability.guid === SPELLS.JUDGMENT_CAST_ALT.id) {
      this.justJudged = true;
      this.casts += 1;
    }
    else {
      this.justJudged = false;
    }
  }

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.GRACE_OF_THE_JUSTICAR.id) {
      this.graceHealing += event.amount + (event.absorbed || 0);
      this.targetsHit += 1;
      return;
    }
    if (spellId === SPELLS.BEACON_OF_LIGHT_HEAL.id && this.justJudged) {
      this.beaconTransfer += event.amount + (event.absorbed || 0);
    }
  }

  get playersHitPerCast() {
    return (this.targetsHit / this.casts) || 0;
  }
  get totalHealing() {
    return this.graceHealing + this.beaconTransfer;
  }

  statistic() {
    return (
      <TraitStatisticBox
        position={STATISTIC_ORDER.OPTIONAL()}
        trait={SPELLS.GRACE_OF_THE_JUSTICAR.id}
        value={<ItemHealingDone amount={this.totalHealing} />}
        tooltip={`
          Total healing done: ${formatNumber(this.totalHealing)}<br />
          Players hit per cast: ${this.playersHitPerCast.toFixed(2)}
        `}
      />
    );
  }
}

export default GraceOfTheJusticar;
