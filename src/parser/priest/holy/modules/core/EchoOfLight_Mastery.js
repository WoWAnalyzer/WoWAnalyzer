import React from 'react';
import StatisticBox, { STATISTIC_ORDER } from 'interface/others/StatisticBox';
import SpellIcon from 'common/SpellIcon';

import SPELLS from 'common/SPELLS';
import Analyzer from 'parser/core/Analyzer';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import { ABILITIES_THAT_TRIGGER_MASTERY } from '../../constants';
import ItemHealingDone from 'interface/others/ItemHealingDone';
import { formatNumber, formatPercentage } from 'common/format';

class EchoOfLight_Mastery extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
  };

  // All healing done by spells that can proc mastery
  rawHealingFromSpellsThatProcMastery = {};
  totalRawHealingFromSpellsThatProcMastery = 0;

  get effectiveHealing() {
    return this.abilityTracker.getAbility(SPELLS.ECHO_OF_LIGHT.id).healingEffective;
  }

  get overHealing() {
    return this.abilityTracker.getAbility(SPELLS.ECHO_OF_LIGHT.id).healingOverheal;
  }

  // Get the percentage of the total mastery pool that was added by a specific spell
  getMasteryContributionPercentBySpell(spellId) {
    return this.rawHealingFromSpellsThatProcMastery[spellId] / this.totalRawHealingFromSpellsThatProcMastery;
  }

  getMasteryEffectiveHealingBySpell(spellId) {
    return this.getMasteryContributionPercentBySpell(spellId) * this.effectiveHealing;
  }

  getMasteryOverHealingBySpell(spellId) {
    return this.getMasteryContributionPercentBySpell(spellId) * this.overHealing;
  }

  getMasteryRawHealingBySpell(spellId) {
    return this.getMasteryEffectiveHealingBySpell(spellId) + this.getMasteryOverHealingBySpell(spellId);
  }

  getMasteryOverHealingPercentageBySpell(spellId) {
    return this.getMasteryOverHealingBySpell(spellId) / this.getMasteryRawHealingBySpell(spellId);
  }

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;
    if (ABILITIES_THAT_TRIGGER_MASTERY.includes(spellId)) {
      this.handleEolApplication(event);
    }
  }

  handleEolApplication(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.RENEW.id && event.tick) {
      return;
    }

    if (!this.rawHealingFromSpellsThatProcMastery[spellId]) {
      this.rawHealingFromSpellsThatProcMastery[spellId] = 0;
    }

    const rawHealing = event.amount + (event.absorbed || 0) + (event.overheal || 0);
    this.rawHealingFromSpellsThatProcMastery[spellId] += rawHealing;
    this.totalRawHealingFromSpellsThatProcMastery += rawHealing;
  }

  masteryTable = () => {
    const rows = [];

    for (const spellId in this.rawHealingFromSpellsThatProcMastery) {
      rows.push(
        <tr key={'mastery_' + spellId}>
          <td><SpellIcon id={spellId} /></td>
          <td>{formatNumber(this.getMasteryEffectiveHealingBySpell(spellId))}</td>
          <td>{formatPercentage(this.getMasteryContributionPercentBySpell(spellId))}</td>
          <td>{formatPercentage(this.getMasteryOverHealingPercentageBySpell(spellId))}</td>
        </tr>
      );
    }

    return rows;
  };

  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.ECHO_OF_LIGHT.id} />}
        value={<ItemHealingDone amount={this.effectiveHealing} />}
        label={(
          <dfn
            data-tip={`Echo of Light healing breakdown. As our mastery is often very finicky, this could end up wrong in various situations. Please report any logs that seem strange to @enragednuke on the WoWAnalyzer discord.<br/><br/>
            <strong>Please do note this is not 100% accurate.</strong> It is probably around 90% accurate. <br/><br/>
            Also, a mastery value can be more than just "healing done times mastery percent" because Echo of Light is based off raw healing. If the heal itself overheals, but the mastery does not, it can surpass that assumed "limit". Don't use this as a reason for a "strange log" unless something is absurdly higher than its effective healing.`}
          >
            Echo of Light
          </dfn>
        )}
      >
        <div>
          Values under 1% of total are omitted.
        </div>
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

  statisticOrder = STATISTIC_ORDER.CORE(2);
}

export default EchoOfLight_Mastery;
