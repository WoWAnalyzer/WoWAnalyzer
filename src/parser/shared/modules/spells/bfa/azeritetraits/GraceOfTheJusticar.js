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
  healing = 0;
  procs = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrait(SPELLS.GRACE_OF_THE_JUSTICAR_TRAIT.id);
  }

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.GRACE_OF_THE_JUSTICAR.id) {
      return;
    }

    this.healing += event.amount + (event.absorbed || 0);
    this.procs += 1;
  }

  statistic() {
    return (
      <TraitStatisticBox
        position={STATISTIC_ORDER.OPTIONAL()}
        trait={SPELLS.GRACE_OF_THE_JUSTICAR.id}
        value={<ItemHealingDone amount={this.healing} />}
        tooltip={`
          Healing done: ${formatNumber(this.healing)}<br />
          Total heals: ${this.procs}
        `}
      />
    );
  }
}

export default GraceOfTheJusticar;
