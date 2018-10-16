import React from 'react';
import Analyzer from 'parser/core/Analyzer';
import TraitStatisticBox, { STATISTIC_ORDER } from 'interface/others/TraitStatisticBox';

import SPELLS from 'common/SPELLS';
import { calculateAzeriteEffects } from 'common/stats';
import EchoOfLight from 'parser/priest/holy/modules/core/EchoOfLight_Mastery';
import { formatThousands } from 'common/format';
import ItemHealingDone from 'interface/others/ItemHealingDone';

// Example Log: https://www.warcraftlogs.com/reports/nWVBjGLrDQvahH7M#fight=15&type=healing
class BlessedSanctuary extends Analyzer {
  static dependencies = {
    echoOfLight: EchoOfLight,
  };

  blessedSanctuaryProcAmount = 0;
  blessedSanctuaryProcCount = 0;

  get rawHealing() {
    return this.blessedSanctuaryProcAmount * this.blessedSanctuaryProcCount;
  }

  get overHealing() {
    const overhealPercent = this.echoOfLight.effectiveOverhealDist[SPELLS.HOLY_WORD_SANCTIFY.id] / (this.echoOfLight.effectiveOverhealDist[SPELLS.HOLY_WORD_SANCTIFY.id] + this.echoOfLight.effectiveHealDist[SPELLS.HOLY_WORD_SANCTIFY.id]);
    return this.rawHealing * overhealPercent;
  }

  get effectiveHealing() {
    const effectivehealPercent = this.echoOfLight.effectiveHealDist[SPELLS.HOLY_WORD_SANCTIFY.id] / (this.echoOfLight.effectiveOverhealDist[SPELLS.HOLY_WORD_SANCTIFY.id] + this.echoOfLight.effectiveHealDist[SPELLS.HOLY_WORD_SANCTIFY.id]);
    return this.rawHealing * effectivehealPercent;
  }

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrait(SPELLS.BLESSED_SANCTUARY.id);
    this.ranks = this.selectedCombatant.traitRanks(SPELLS.BLESSED_SANCTUARY.id) || [];

    this.blessedSanctuaryProcAmount = this.ranks.map((rank) => calculateAzeriteEffects(SPELLS.BLESSED_SANCTUARY.id, rank)[0]).reduce((total, bonus) => total + bonus, 0);
  }

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;

    if (spellId === SPELLS.HOLY_WORD_SANCTIFY.id) {
      this.blessedSanctuaryProcCount++;
    }
  }

  statistic() {
    return (
      <TraitStatisticBox
        position={STATISTIC_ORDER.OPTIONAL()}
        trait={SPELLS.BLESSED_SANCTUARY.id}
        value={(
          <>
            <ItemHealingDone amount={this.effectiveHealing} /><br />
          </>
        )}
        tooltip={`
          ${formatThousands(this.effectiveHealing)} Total Healing
        `}
      />
    );
  }
}

export default BlessedSanctuary;
