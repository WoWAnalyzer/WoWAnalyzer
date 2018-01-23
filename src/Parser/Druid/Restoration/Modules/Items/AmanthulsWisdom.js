import React from 'react';

import Combatants from 'Parser/Core/Modules/Combatants';
import Analyzer from 'Parser/Core/Analyzer';
import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import { formatPercentage } from 'common/format';

import ItemHealingDone from 'Main/ItemHealingDone';

import HotTracker from '../Core/HotTracking/HotTracker';

const EXTENSION_AMOUNT = 3000;
const MAX_PROCS_PER_APPLICATION = 3;

/*
 * Aman'thul's Wisdom
 * Equip: When your Rejuvenation heals a full health target, its duration is increased by 3 sec, up to a maximum total increase of 9 sec per cast.
 */
class AmanthulsWisdom extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    hotTracker: HotTracker,
  };

  attribution = {
    name: "Aman'thul's Wisdom",
    healing: 0,
    masteryHealing: 0,
    dreamwalkerHealing: 0,
    procs: 0,
  };

  remainingProcs = {};

  rejuvApplications = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasShoulder(ITEMS.AMANTHULS_WISDOM.id);
  }

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.REJUVENATION.id && spellId !== SPELLS.REJUVENATION_GERMINATION.id) {
      return;
    }

    const targetId = event.targetID;
    if (!targetId) {
      return;
    }

    if (!this.remainingProcs[targetId] || !this.remainingProcs[targetId][spellId]) {
      return;
    }

    if (event.amount === 0 && (!event.absorbed || event.absorbed === 0) && this.remainingProcs[targetId][spellId] > 0) {
      this.hotTracker.addExtension(this.attribution, EXTENSION_AMOUNT, targetId, spellId);
      this.remainingProcs[targetId][spellId] -= 1;
    }
  }

  on_byPlayer_applybuff(event) {
    this._handleBuffApply(event);
  }

  on_byPlayer_refreshbuff(event) {
    this._handleBuffApply(event);
  }

  _handleBuffApply(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.REJUVENATION.id && spellId !== SPELLS.REJUVENATION_GERMINATION.id) {
      return;
    }

    const targetId = event.targetID;
    if (!targetId) {
      return;
    }

    this.rejuvApplications += 1;
    if (!this.remainingProcs[targetId]) {
      this.remainingProcs[targetId] = {};
    }
    this.remainingProcs[targetId][spellId] = MAX_PROCS_PER_APPLICATION;
  }

  get totalHealing() {
    return this.attribution.healing + this.attribution.masteryHealing + this.attribution.dreamwalkerHealing;
  }

  get extensionsPerApplication() {
    return this.rejuvApplications === 0 ? 0 : (this.attribution.procs / this.rejuvApplications);
  }

  item() {
    return {
      item: ITEMS.AMANTHULS_WISDOM,
      result: (
        <dfn data-tip={`You procced <b>${this.attribution.procs}</b> Rejuvenation extensions, which is <b>${this.extensionsPerApplication.toFixed(1)}</b> procs per rejuvenation. The healing that extra HoT time did can be broken down as follows:
          <ul>
          <li>Direct: <b>${formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.attribution.healing))}%</b></li>
          <li>Mastery: <b>${formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.attribution.masteryHealing))}%</b></li>
          <li>Dreamwalker: <b>${formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.attribution.dreamwalkerHealing))}%</b></li>
          </ul>
        `}>
          <ItemHealingDone amount={this.totalHealing} />
        </dfn>
      ),
    };
  }

}

export default AmanthulsWisdom;
