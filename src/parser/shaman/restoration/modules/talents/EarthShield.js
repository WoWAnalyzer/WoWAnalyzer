import React from 'react';

import SPELLS from 'common/SPELLS';
import { formatPercentage } from 'common/format';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';

import calculateEffectiveHealing from 'parser/core/calculateEffectiveHealing';

import StatisticListBoxItem from 'interface/others/StatisticListBoxItem';
import StatisticBox, { STATISTIC_ORDER } from 'interface/others/StatisticBox';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';

import EarthShieldCore from '../../../shared/talents/EarthShield';

import CooldownThroughputTracker from '../features/CooldownThroughputTracker';
import { ABILITIES_AFFECTED_BY_HEALING_INCREASES } from '../../constants';

const EARTHSHIELD_HEALING_INCREASE = 0.10;

class EarthShield extends EarthShieldCore {
  static dependencies = {
    ...EarthShieldCore.dependencies,
    cooldownThroughputTracker: CooldownThroughputTracker,
  };

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;

    if (spellId === SPELLS.EARTH_SHIELD_HEAL.id) {
      this.healing += event.amount + (event.absorbed || 0);
      return;
    }

    if (!ABILITIES_AFFECTED_BY_HEALING_INCREASES.includes(spellId)) {
      return;
    }

    const combatant = this.combatants.players[event.targetID];
    if (!combatant) {
      return;
    }
    
    const hasBuff = combatant.hasBuff(SPELLS.EARTH_SHIELD_TALENT.id, event.timestamp);
    if (!hasBuff) {
      return;
    }

    this.buffHealing += calculateEffectiveHealing(event, EARTHSHIELD_HEALING_INCREASE);
  }

  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.EARTH_SHIELD_TALENT.id} />}
        value={`${formatPercentage(this.uptimePercent)} %`}
        label="Earth Shield Uptime"
        category={STATISTIC_CATEGORY.TALENTS}
        position={STATISTIC_ORDER.OPTIONAL(30)}
      />
    );
  }

  subStatistic() {
    const feeding = this.cooldownThroughputTracker.getIndirectHealing(SPELLS.EARTH_SHIELD_HEAL.id);
    return (
      <StatisticListBoxItem
        title={<SpellLink id={SPELLS.EARTH_SHIELD_TALENT.id} />}
        value={`${formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.healing + this.buffHealing + feeding))} %`}
        valueTooltip={`${formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.healing + feeding))}% from the HoT and ${formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.buffHealing))}% from the healing buff.`}
      />
    );
  }

}

export default EarthShield;
