import React from 'react';

import SPELLS from 'common/SPELLS';
import { formatPercentage } from 'common/format';
import SpellLink from 'common/SpellLink';

import StatisticBox, { STATISTIC_ORDER } from 'interface/others/StatisticBox';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import ItemHealingDone from 'interface/ItemHealingDone';
import UptimeIcon from 'interface/icons/Uptime';
import SPECS from 'game/SPECS';

import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { HealEvent } from 'parser/core/Events';
import { ThresholdStyle } from 'parser/core/ParseResults';
import calculateEffectiveHealing from 'parser/core/calculateEffectiveHealing';
import Combatants from 'parser/shared/modules/Combatants';
import { Trans } from '@lingui/macro';

import { HEALING_ABILITIES_AMPED_BY_EARTH_SHIELD } from 'parser/shaman/shared/constants';
import { EMBRACE_OF_EARTH_RANKS } from 'parser/shaman/restoration/constants';

export const EARTHSHIELD_HEALING_INCREASE = 0.20;

class EarthShield extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  protected combatants!: Combatants;

  healing = 0;
  buffHealing = 0;
  earthShieldHealingIncrease = EARTHSHIELD_HEALING_INCREASE;
  category = STATISTIC_CATEGORY.TALENTS;

  constructor(options: Options) {
    super(options);
    const isRsham = this.selectedCombatant.specId === SPECS.RESTORATION_SHAMAN.id;
    this.active = isRsham || this.selectedCombatant.hasTalent(SPELLS.EARTH_SHIELD_HEAL.id);

    if (isRsham) {
      this.category = STATISTIC_CATEGORY.GENERAL;
    }

    const conduitRank = this.selectedCombatant.conduitRankBySpellID(SPELLS.EMBRACE_OF_EARTH.id);
    if (conduitRank) {
      this.earthShieldHealingIncrease += EMBRACE_OF_EARTH_RANKS[conduitRank] / 100;
    }

    // event listener for direct heals when taking damage with earth shield
    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(SPELLS.EARTH_SHIELD_HEAL), this.onEarthShieldHeal);

    const HEALING_ABILITIES_AMPED_BY_EARTH_SHIELD_FILTERED = HEALING_ABILITIES_AMPED_BY_EARTH_SHIELD.filter(p => p !== SPELLS.EARTH_SHIELD_HEAL);
    // event listener for healing being buffed by having earth shield on the target
    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(HEALING_ABILITIES_AMPED_BY_EARTH_SHIELD_FILTERED), this.onEarthShieldAmpSpellHeal);
  }

  get uptime() {
    return Object.values((this.combatants.players)).reduce((uptime, player) => uptime + player.getBuffUptime(SPELLS.EARTH_SHIELD_HEAL.id, this.owner.playerId), 0);
  }

  get uptimePercent() {
    return this.uptime / this.owner.fightDuration;
  }

  get suggestionThresholds() {
    return {
      actual: this.uptimePercent,
      isLessThan: {
        minor: 0.95,
        average: 0.90,
        major: 0.80,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  onEarthShieldHeal(event: HealEvent) {
    this.healing += (event.amount + (event.absorbed || 0));
  }

  onEarthShieldAmpSpellHeal(event: HealEvent) {
    const combatant = this.combatants.getEntity(event);
    if (combatant && combatant.hasBuff(SPELLS.EARTH_SHIELD_HEAL.id, event.timestamp)) {
      this.buffHealing += calculateEffectiveHealing(event, this.earthShieldHealingIncrease);
    }
  }

  // gets overriden by the rshaman module
  getFeeding() {
    return 0;
  }

  statistic() {
    return (
      <StatisticBox
        label={<SpellLink id={SPELLS.EARTH_SHIELD_HEAL.id} />}
        category={this.category}
        position={STATISTIC_ORDER.OPTIONAL(45)}
        tooltip={<Trans id="shaman.shared.earthShield.statistic.tooltip">{formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.healing))}% from the HoT and {formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.buffHealing))}% from the healing increase.</Trans>}
        value={
          (
            <div>
              <UptimeIcon /> {formatPercentage(this.uptimePercent)}% <small>uptime</small><br />
              <ItemHealingDone amount={this.healing + this.buffHealing + this.getFeeding()} />
            </div>
          )
        }
      />
    );
  }
}

export default EarthShield;
