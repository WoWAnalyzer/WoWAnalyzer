import React from 'react';
import StatisticBox, { STATISTIC_ORDER } from 'interface/others/StatisticBox';
import SpellIcon from 'common/SpellIcon';

import SPELLS from 'common/SPELLS';
import Analyzer from 'parser/core/Analyzer';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import HealingDone from 'parser/shared/modules/HealingDone';
import ItemHealingDone from 'interface/others/ItemHealingDone';
import { formatNumber, formatPercentage } from 'common/format';
import { ABILITIES_THAT_TRIGGER_MASTERY } from '../../constants';

const DEBUG = false;

class EchoOfLight_Mastery extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
    healingDone: HealingDone,
  };

  // All healing done by spells that can proc mastery
  masteryHealingBySpell = {};
  // The eol pools currently on a target
  targetMasteryPool = {};
  // The test value so we can see how accurate our EoL values are
  testValues = {
    effectiveHealing: 0,
    overhealing: 0,
    rawHealing: 0,
  };

  get effectiveHealing() {
    return this.abilityTracker.getAbility(SPELLS.ECHO_OF_LIGHT.id).healingEffective + this.abilityTracker.getAbility(SPELLS.ECHO_OF_LIGHT.id).healingAbsorbed;
  }

  get overHealing() {
    return this.abilityTracker.getAbility(SPELLS.ECHO_OF_LIGHT.id).healingOverheal;
  }

  get overHealingPercent() {
    return this.overHealing / this.rawHealing;
  }

  get rawHealing() {
    return this.effectiveHealing + this.overHealing;
  }

  getPercentOfTotalMasteryBySpell(spellId) {
    return this.masteryHealingBySpell[spellId].rawHealing / this.rawHealing;
  }

  getPercentOfTotalHealingBySpell(spellId) {
    return this.masteryHealingBySpell[spellId].effectiveHealing / this.healingDone.total.effective;
  }

  getMasteryOverhealPercentBySpell(spellId) {
    return this.masteryHealingBySpell[spellId].overHealing / this.masteryHealingBySpell[spellId].rawHealing;
  }

  get accuracy() {
    const effectiveAccuracy = Math.abs(this.testValues.effectiveHealing - this.effectiveHealing) / this.effectiveHealing;
    const overhealingAccuracy = Math.abs(this.testValues.overhealing - this.overHealing) / this.overHealing;
    const rawAccuracy = Math.abs(this.testValues.rawHealing - this.rawHealing) / this.rawHealing;
    return 1 - Math.max(effectiveAccuracy, overhealingAccuracy, rawAccuracy);
  }

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.ECHO_OF_LIGHT.id) {
      this.handleEolTick(event);
    }
    if (ABILITIES_THAT_TRIGGER_MASTERY.includes(spellId)) {
      this.handleEolApplication(event);
    }
  }

  handleEolApplication(event) {
    const spellId = event.ability.guid;
    const targetId = event.targetID;
    if (spellId === SPELLS.RENEW.id && event.tick) {
      return;
    }

    if (!this.targetMasteryPool[targetId]) {
      this.targetMasteryPool[targetId] = {
        pendingHealingTotal: 0,
        pendingHealingBySpell: {},
      };
    }

    const rawHealing = event.amount + (event.absorbed || 0) + (event.overheal || 0);
    this.targetMasteryPool[targetId].pendingHealingTotal += rawHealing;
    if (!this.targetMasteryPool[targetId].pendingHealingBySpell[spellId]) {
      this.targetMasteryPool[targetId].pendingHealingBySpell[spellId] = 0;
    }
    this.targetMasteryPool[targetId].pendingHealingBySpell[spellId] += rawHealing;
  }

  handleEolTick(event) {
    const targetId = event.targetID;

    // As far as I can tell, this happens when the combat log is out of order. You shouldn't receive a tick of EoL without a target having a buff apply event.
    if (!this.targetMasteryPool[targetId] || this.targetMasteryPool[targetId].remainingTicks < 1) {
      if (DEBUG) {
        console.warn(`There was a mastery tick for ${event.amount + (event.absorbed || 0)} (${event.overheal || 0} OH) for a target that doesn't have a mastery pool!`);
      }
      return;
    }

    const tickEffectiveHealing = event.amount + (event.absorbed || 0);
    const tickOverhealing = (event.overheal || 0);

    // The percentage of the total pool to be drained
    const poolDrainPercent = 1 / this.targetMasteryPool[targetId].remainingTicks;
    // The total amount that should be drained from the pool
    const poolDrainTotal = this.targetMasteryPool[targetId].pendingHealingTotal * poolDrainPercent;

    for (const spellId in this.targetMasteryPool[targetId].pendingHealingBySpell) {
      // The percent of the pool that should be drained by this spell
      const tickHealingBySpell = this.targetMasteryPool[targetId].pendingHealingBySpell[spellId] * poolDrainPercent;
      const spellContributionPercent = tickHealingBySpell / poolDrainTotal;

      // Make sure the values are initialized
      if (!this.masteryHealingBySpell[spellId]) {
        this.masteryHealingBySpell[spellId] = {
          effectiveHealing: 0,
          overHealing: 0,
          rawHealing: 0,
        };
      }

      const effectiveHealing = tickEffectiveHealing * spellContributionPercent;
      const overHealing = tickOverhealing * spellContributionPercent;

      this.masteryHealingBySpell[spellId].effectiveHealing += effectiveHealing;
      this.masteryHealingBySpell[spellId].overHealing += overHealing;
      this.masteryHealingBySpell[spellId].rawHealing += effectiveHealing + overHealing;

      this.testValues.effectiveHealing += effectiveHealing;
      this.testValues.overhealing += overHealing;
      this.testValues.rawHealing += effectiveHealing + overHealing;
    }

    this.targetMasteryPool[targetId].remainingTicks -= 1;
  }

  on_byPlayer_applybuff(event) {
    const spellId = event.ability.guid;
    const targetId = event.targetID;
    if (spellId === SPELLS.ECHO_OF_LIGHT.id) {
      if (!this.targetMasteryPool[targetId]) {
        this.targetMasteryPool[targetId] = {
          pendingHealingTotal: 0,
          pendingHealingBySpell: {},
        };
      }

      this.targetMasteryPool[targetId].remainingTicks = 2;
    }
  }

  on_byPlayer_refreshbuff(event) {
    const spellId = event.ability.guid;
    const targetId = event.targetID;
    if (spellId === SPELLS.ECHO_OF_LIGHT.id) {
      this.targetMasteryPool[targetId].remainingTicks = 3;
    }
  }

  masteryTable = () => {
    const spellDetails = Object.keys(this.masteryHealingBySpell).map((key) => {
      return {
        spellId: key,
        ...this.masteryHealingBySpell[key],
      };
    }).sort((a, b) => b.effectiveHealing - a.effectiveHealing);

    const rows = [];

    for (let i = 0; i < spellDetails.length; i++) {
      rows.push(
        <tr key={'mastery_' + spellDetails[i].spellId}>
          <td><SpellIcon id={Number(spellDetails[i].spellId)} style={{ height: '2.4em' }} /></td>
          <td>{formatNumber(spellDetails[i].effectiveHealing)}</td>
          <td>{formatPercentage(this.getPercentOfTotalHealingBySpell(spellDetails[i].spellId))}%</td>
          <td>{formatPercentage(this.getMasteryOverhealPercentBySpell(spellDetails[i].spellId))}%</td>
        </tr>
      );
    }

    return rows;
  };

  statistic() {
    return (
      <StatisticBox
        position={STATISTIC_ORDER.CORE(2)}
        icon={<SpellIcon id={SPELLS.ECHO_OF_LIGHT.id} />}
        value={(
          <dfn
            data-tip={`Total Healing: ${formatNumber(this.effectiveHealing)} (${formatPercentage(this.overHealingPercent)}% OH)`}
          >
            <ItemHealingDone amount={this.effectiveHealing} />
          </dfn>
        )}
        label={(
          <dfn
            data-tip={`Echo of Light healing breakdown. As our mastery is often very finicky, this could end up wrong in various situations. Please report any logs that seem strange to @Khadaj on the WoWAnalyzer discord.<br/><br/>
            <strong>Please do note this is not 100% accurate.</strong> It is probably around ${formatPercentage(this.accuracy)}% accurate. <br/><br/>
            Also, a mastery value can be more than just "healing done times mastery percent" because Echo of Light is based off raw healing. If the heal itself overheals, but the mastery does not, it can surpass that assumed "limit". Don't use this as a reason for a "strange log" unless something is absurdly higher than its effective healing.`}
          >
            Echo of Light
          </dfn>
        )}
      >
        <table className="table table-condensed">
          <thead>
            <tr>
              <th>Spell</th>
              <th>Amount</th>
              <th>% of Total</th>
              <th>% OH</th>
            </tr>
          </thead>
          <tbody>
            <this.masteryTable />
          </tbody>
        </table>
      </StatisticBox>
    );
  }
}

export default EchoOfLight_Mastery;
