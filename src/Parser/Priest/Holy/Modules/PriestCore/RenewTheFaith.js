import React from 'react';

import SpellIcon from 'common/SpellIcon';
import { formatNumber, formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import Haste from 'Parser/Core/Modules/Haste';
import DivineHymn from '../Spells/DivineHymn';

class RenewTheFaith extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    divineHymn: DivineHymn,
    haste: Haste,
  };

  _validPoMBefore = 0;
  poms = 0;
  healing = 0;
  overhealing = 0;

  on_initialized() {
    this._maxHymnDuration = 8 / (1 + this.haste.current);
    this.active = this.combatants.selected.traitsBySpellId[SPELLS.RENEW_THE_FAITH_TRAIT.id] > 0;
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.DIVINE_HYMN_CAST.id) {
      this._validPoMBefore = event.timestamp + this._maxHymnDuration * 1000;
    }
  }

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.PRAYER_OF_MENDING_HEAL.id && spellId !== SPELLS.HOLY_MENDING_TRAIT.id) {
      return;
    }
    if (event.timestamp < this._validPoMBefore) {
      if (spellId === SPELLS.PRAYER_OF_MENDING_HEAL.id) {
        this.poms += 1;
      }
      this.healing += event.amount;
      this.overhealing += event.overheal || 0;
    }
  }

  statistic() {
    const rtfPercHPS = formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.healing));
    const rtfPercOH = formatPercentage(this.overhealing / (this.healing + this.overhealing));
    const rtfRelPercHPS = formatPercentage(this.healing / this.divineHymn.healing);

    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.DIVINE_HYMN_CAST.id} />}
        value={formatNumber(this.healing)}
        tooltip={`Benefit gained from Renew the Faith (does not include Benediction renews). Assumes that every Divine Hymn cast is fully channeled. This was ${rtfPercHPS}% of your healing, had ${rtfPercOH}% overhealing and increased your Divine Hymn healing by ${rtfRelPercHPS}%`}
        label="Renew the Faith"
      />
    );
  }

  statisticOrder = STATISTIC_ORDER.UNIMPORTANT(1);
}

export default RenewTheFaith;
