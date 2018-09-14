import React from 'react';
import Analyzer from 'Parser/Core/Analyzer';
import TraitStatisticBox, { STATISTIC_ORDER } from 'Interface/Others/TraitStatisticBox';

import SPELLS from 'common/SPELLS';
import { calculateAzeriteEffects } from 'common/stats';
import EchoOfLight from 'Parser/Priest/Holy/Modules/PriestCore/EchoOfLight';
import { formatPercentage, formatThousands } from 'common/format';

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
          <React.Fragment>
            {formatThousands(this.effectiveHealing)} Bonus Healing<br />
            {formatPercentage(this.overHealing / this.rawHealing)}% OverHealing
          </React.Fragment>
        )}
      />
    );
  }
}

export default BlessedSanctuary;
