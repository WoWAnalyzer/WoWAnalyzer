import React from 'react';
import Analyzer from 'parser/core/Analyzer';

import SPELLS from 'common/SPELLS';
import TraitStatisticBox, { STATISTIC_ORDER } from 'interface/others/TraitStatisticBox';
import { calculateAzeriteEffects } from 'common/stats';
import ItemHealingDone from 'interface/ItemHealingDone';
import { formatThousands } from 'common/format';

// Example Log: https://www.warcraftlogs.com/reports/Lv28aNzMQJhqx9H1#fight=1&type=healing
class PermeatingGlow extends Analyzer {
  permiatingGlowBuffs = {};
  permiatingGlowProcAmount = 0;
  permiatingGlowProcCount = 0;
  permiatingGlowTotalHealAmount = 0;
  permiatingGlowTotalOverHealAmount = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrait(SPELLS.PERMEATING_GLOW_TALENT.id);
    this.ranks = this.selectedCombatant.traitRanks(SPELLS.PERMEATING_GLOW_TALENT.id) || [];

    this.permiatingGlowProcAmount = this.ranks.map((rank) => calculateAzeriteEffects(SPELLS.PERMEATING_GLOW_TALENT.id, rank)[0]).reduce((total, bonus) => total + bonus, 0);
  }

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;

    if (spellId === SPELLS.FLASH_HEAL.id) {
      if (this.permiatingGlowBuffs[event.targetID.toString()]) {
        this.permiatingGlowProcCount += 1;
        let eventHealing = this.permiatingGlowProcAmount;
        let eventOverhealing = 0;

        if (event.overheal) {
          eventOverhealing = Math.min(this.permiatingGlowProcAmount, event.overheal);
          eventHealing -= eventOverhealing;
        }

        this.permiatingGlowTotalHealAmount += eventHealing;
        this.permiatingGlowTotalOverHealAmount += eventOverhealing;
      }
    }
  }

  on_byPlayer_applybuff(event) {
    const spellId = event.ability.guid;

    if (spellId === SPELLS.PERMEATING_GLOW_BUFF.id) {
      this.permiatingGlowBuffs[event.targetID.toString()] = event.timestamp;
    }
  }

  on_byPlayer_removebuff(event) {
    const spellId = event.ability.guid;

    if (spellId === SPELLS.PERMEATING_GLOW_BUFF.id) {
      delete(this.permiatingGlowBuffs[event.targetID.toString()]);
    }
  }

  statistic() {
    return (
      <TraitStatisticBox
        position={STATISTIC_ORDER.OPTIONAL()}
        trait={SPELLS.PERMEATING_GLOW_TALENT.id}
        value={<ItemHealingDone amount={this.permiatingGlowTotalHealAmount} />}
        tooltip={(
          <>
            {formatThousands(this.permiatingGlowTotalHealAmount)} Total Healing<br />
            {formatThousands(this.permiatingGlowProcCount)} Total Procs
          </>
        )}
      />
    );
  }
}

export default PermeatingGlow;
