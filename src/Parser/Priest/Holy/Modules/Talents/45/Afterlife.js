import React from 'react';
import TraitStatisticBox, { STATISTIC_ORDER } from 'Interface/Others/TraitStatisticBox';
import SpellIcon from 'common/SpellIcon';

import SPELLS from 'common/SPELLS/index';
import Analyzer from 'Parser/Core/Analyzer';
import STATISTIC_CATEGORY from 'Interface/Others/STATISTIC_CATEGORY';
import ItemHealingDone from 'Interface/Others/ItemHealingDone';

const SPIRIT_OF_REDEMPTION_DURATION = 15000;

// Example Log: /report/zCMpvAPYW16k3bQr/33-Normal+G'huun+-+Wipe+12+(8:24)/60-Кеонна
class Afterlife extends Analyzer {
  spiritOfRedemptionCount = 0;
  spiritOfRedemptionTotalTime = 0;
  spiritOfRedemptionBonusTime = 0;
  spiritOfRedemptionStartTime = 0;

  inSpiritOfRedemption = false;

  healingInAfterlife = 0;

  get extraTimeInSoR() {
    return this.timeInSoR - (SPIRIT_OF_REDEMPTION_DURATION * this.sorCount);
  }

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.AFTERLIFE_TALENT.id);
  }

  on_byPlayer_applybuff(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.SPIRIT_OF_REDEMPTION_BUFF.id) {
      this.inSpiritOfRedemption = true;
      this.spiritOfRedemptionStartTime = event.timestamp;
      this.sorCount++;
    }
  }

  on_byPlayer_removebuff(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.SPIRIT_OF_REDEMPTION_BUFF.id) {
      this.inSpiritOfRedemption = false;
      const timeInSpiritOfRedemption = event.timestamp - this.spiritOfRedemptionStartTime;
      this.spiritOfRedemptionTotalTime += timeInSpiritOfRedemption;
      const spiritOfRedemptionBonusTime = timeInSpiritOfRedemption - SPIRIT_OF_REDEMPTION_DURATION;
      if (spiritOfRedemptionBonusTime > 0) {
        this.spiritOfRedemptionBonusTime += spiritOfRedemptionBonusTime;
      }
    }
  }

  on_byPlayer_heal(event) {
    if (this.inSpiritOfRedemption && event.timestamp - this.spiritOfRedemptionStartTime > SPIRIT_OF_REDEMPTION_DURATION) {
      this.healingInAfterlife += event.amount || 0;
    }
  }

  statistic() {
    return (

      <TraitStatisticBox
        category={STATISTIC_CATEGORY.TALENTS}
        icon={<SpellIcon id={SPELLS.AFTERLIFE_TALENT.id} />}
        value={(
            <ItemHealingDone amount={this.healingInAfterlife} />
        )}
        label="Afterlife"
        tooltip={`Extra Spirit of Redemption time: ${Math.floor(this.spiritOfRedemptionBonusTime / 1000)}s`}
      />

    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(3);
}

export default Afterlife;
