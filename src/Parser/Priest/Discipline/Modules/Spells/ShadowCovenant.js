import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';

import DualStatisticBox, { STATISTIC_ORDER } from 'Main/DualStatisticBox';
import { formatPercentage, formatNumber } from 'common/format';
import Combatants from 'Parser/Core/Modules/Combatants';
import StatTracker from 'Parser/Core/Modules/StatTracker';
import Analyzer from 'Parser/Core/Analyzer';
import EventGrouper from 'Parser/Core/EventGrouper';

import { SmiteEstimation } from '../../SpellCalculations';
import Atonement from './Atonement';

/**
 *
 */
class ShadowCovenant extends Analyzer {
  static dependencies = {
    statTracker: StatTracker,
    combatants: Combatants,
    atonement: Atonement,
  };
  _rawHealing = 0;
  _netHealing = 0;
  _adjustedHealing = 0;

  smiteEstimation; // We subtract a smite cast for each scov
  eventGrouper = new EventGrouper(500);

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(
      SPELLS.SHADOW_COVENANT_TALENT.id
    );
    this.smiteEstimation = SmiteEstimation(this.statTracker);
  }

  /**
   * We use this to estimate the overhealing of the replacement smite cast.
   *
   * This isn't super accurate or anything but is better than assuming no
   * overhealing on the replacement smites.
   */
  get typicalOverhealing() {
    const flattenedEvents = [].concat(...this.eventGrouper);
    const overhealingRatio =
      flattenedEvents.reduce((ratio, event) => {
        const absorbed = event.absorbed || 0;
        const overheal = event.overheal || 0;
        const total = event.amount + absorbed + overheal;
        const overhealFraction = overheal / total;

        return ratio + overhealFraction;
      }, 0) / flattenedEvents.length;

    return overhealingRatio;
  }

  on_byPlayer_heal(event) {
    if (event.ability.guid !== SPELLS.SHADOW_COVENANT_TALENT.id) return;
    this.eventGrouper.processEvent(event);
    const heal = event.amount + (event.absorbed || 0);

    this._rawHealing += heal;
    this._netHealing += heal;
    this._adjustedHealing += heal;
  }

  on_byPlayer_applydebuff(event) {
    if (event.ability.guid !== SPELLS.SHADOW_COVENANT_TALENT_DEBUFF.id) return;

    this._netHealing -= event.absorb;
    this._adjustedHealing -= event.absorb;
  }

  on_byPlayer_cast(event) {
    if (event.ability.guid !== SPELLS.SHADOW_COVENANT_TALENT.id) return;
    this.adjustForSmite();
  }

  adjustForSmite() {
    const { smiteHealing } = this.smiteEstimation();
    const atonementCount = this.atonement.numAtonementsActive;

    this._adjustedHealing -=
      smiteHealing * atonementCount * (this.typicalOverhealing || 1);
  }

  statistic() {
    return (
      <DualStatisticBox
        icon={<SpellIcon id={SPELLS.SHADOW_COVENANT_TALENT.id} />}
        values={[
          `${formatNumber(
            (this._adjustedHealing / this.owner.fightDuration) * 1000
          )} eHPS`,
          `${formatNumber(
            (this._netHealing / this.owner.fightDuration) * 1000
          )} HPS`,
        ]}
        footer={
          (
<dfn
  data-tip={`
              Shadow Covenant effectively did ${formatPercentage(
                this.owner.getPercentageOfTotalHealingDone(this._netHealing)
              )}% of your healing.

              Factoring in lost smites with Atonement it did ${formatPercentage(
                this.owner.getPercentageOfTotalHealingDone(this._adjustedHealing)
              )}% of your healing.
            `}
          >
            Shadow Covenant Output Details
          </dfn>
)
        }
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.OPTIONAL();
}

export default ShadowCovenant;
