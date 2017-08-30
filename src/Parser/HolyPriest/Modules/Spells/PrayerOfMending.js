import React from 'react';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import SpellIcon from 'common/SpellIcon';
import { formatPercentage, formatNumber } from 'common/format';

import SPELLS from 'common/SPELLS';
import Module from 'Parser/Core/Module';

class PrayerOfMending extends Module {
  _firstPoMCast = null;
  removed = 0;
  heals = 0;
  healing = 0;
  prePoM = false;

  on_byPlayer_removebuff(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.PRAYER_OF_MENDING_BUFF.id) {
      return;
    }
    this.removed += 1;
  }

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.PRAYER_OF_MENDING_HEAL.id) {
      return;
    }
    if (!this._firstPoMCast) {
      this.prePoM = true;
    }
    this.heals += 1;
    this.healing += event.amount || 0;
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.PRAYER_OF_MENDING_CAST.id) {
      return;
    }
    if (!event) {
      this._firstPoMCast = event;
    }
  }

  statistic() {
    const sypTrait = this.owner.selectedCombatant.traitsBySpellId[SPELLS.SAY_YOUR_PRAYERS_TRAIT.id];
    const percPomIncFromSYP = ((1 + (sypTrait * SPELLS.SAY_YOUR_PRAYERS_TRAIT.coeff)) / (1 - (sypTrait * SPELLS.SAY_YOUR_PRAYERS_TRAIT.coeff))) - 1;
    const sypValue = this.healing * percPomIncFromSYP / (1 + percPomIncFromSYP);
    const sypHPS = sypValue / this.owner.fightDuration * 1000;
    const sypPercHPSOverall = formatPercentage(sypValue / this.owner.totalHealing);
    const sypPercHPSPoM = formatPercentage(sypValue / this.healing);

    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.PRAYER_OF_MENDING_CAST.id} />}
        value={`${formatNumber(sypHPS)} HPS`}
        label="Say Your Prayers"
        tooltip={`Approximation of Say Your Prayers' value by viewing average stacks per PoM cast (does not include Benediction renews). This is ${sypPercHPSOverall}% of your healing and ≈${sypPercHPSPoM}% of your Prayer of Mending healing.`}
      />
    );
  }

  statisticOrder = STATISTIC_ORDER.TRAITS();
}

export default PrayerOfMending;
