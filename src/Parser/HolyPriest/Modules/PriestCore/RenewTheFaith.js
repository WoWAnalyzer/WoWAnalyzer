import React from 'react';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import SpellIcon from 'common/SpellIcon';
import { formatPercentage, formatNumber } from 'common/format';

import SPELLS from 'common/SPELLS';
import Module from 'Parser/Core/Module';

class RenewTheFaith extends Module {
  _validPoMBefore = 0;
  poms = 0;
  healing = 0;
  overhealing = 0;

  on_initialized() {
    this._maxHymnDuration = 8 / (1 + this.owner.selectedCombatant.hastePercentage);
    this.active = this.owner.selectedCombatant.traitsBySpellId[SPELLS.RENEW_THE_FAITH_TRAIT.id] > 0;
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.DIVINE_HYMN_CAST.id) {
      this._validPoMBefore = event.timestamp + this._maxHymnDuration * 1000;
    }
  }

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.PRAYER_OF_MENDING_HEAL.id && spellId !== SPELLS.HOLY_MENDING_TRAIT.id) { return; }
    if (event.timestamp < this._validPoMBefore) {
      if (spellId === SPELLS.PRAYER_OF_MENDING_HEAL.id) { this.poms += 1; }
      this.healing += event.amount;
      this.overhealing += event.overheal || 0;
    }
  }

  statistic() {
    const rtfPercHPS = formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.healing));
    const rtfPercOH = formatPercentage(this.overhealing / (this.healing + this.overhealing));
    const rtfRelPercHPS = formatPercentage(this.healing / this.owner.modules.divineHymn.healing);

    //
    return this.active && (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.DIVINE_HYMN_CAST.id} />}
        value={`${formatNumber(this.healing)}`}
        label={(
          <dfn data-tip={`Benefit gained from Renew the Faith (does not include Benediction renews). Assumes that every Divine Hymn cast is fully channeled. This was ${rtfPercHPS}% of your healing, had ${rtfPercOH}% overhealing and increased your Divine Hymn healing by ${rtfRelPercHPS}%`}>
            Renew the Faith
          </dfn>
        )}
      />
    );
    //
  }

  statisticOrder = STATISTIC_ORDER.TRAITS(1);
}


export default RenewTheFaith;
