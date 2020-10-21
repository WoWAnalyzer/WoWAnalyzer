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
import Combatant from 'parser/core/Combatant';
import Events, { HealEvent } from 'parser/core/Events';
import { ThresholdStyle } from 'parser/core/ParseResults';
import calculateEffectiveHealing from 'parser/core/calculateEffectiveHealing';
import Combatants from 'parser/shared/modules/Combatants';
import { Trans } from '@lingui/macro';

import { HEALING_ABILITIES_AMPED_BY_EARTH_SHIELD } from '../constants';

const EARTHSHIELD_HEALING_INCREASE = 0.20; // TODO add conduit

class EarthShield extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  protected combatants!: Combatants;

  healing = 0;
  buffHealing = 0;
  category = STATISTIC_CATEGORY.TALENTS;

  constructor(options: Options) {
    super(options);
    const isRsham = this.selectedCombatant.specId === SPECS.RESTORATION_SHAMAN.id;
    this.active = isRsham || this.selectedCombatant.hasTalent(SPELLS.EARTH_SHIELD.id);

    if (isRsham) {
      this.category = STATISTIC_CATEGORY.GENERAL;
    }

    // event listener for direct heals when taking damage with earth shield
    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(SPELLS.EARTH_SHIELD_HEAL), this.onEarthShieldHeal);

    const HEALING_ABILITIES_AMPED_BY_EARTH_SHIELD_FILTERED = HEALING_ABILITIES_AMPED_BY_EARTH_SHIELD.filter(p => p !== SPELLS.EARTH_SHIELD_HEAL);
    // event listener for healing being buffed by having earth shield on the target
    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(HEALING_ABILITIES_AMPED_BY_EARTH_SHIELD_FILTERED), this.onEarthShieldAmpSpellHeal);
  }

  get uptime() {
    return Object.values((this.combatants.players as Combatant[])).reduce((uptime: number, player: Combatant) => uptime + player.getBuffUptime(SPELLS.EARTH_SHIELD.id, this.owner.playerId), 0);
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
    if (combatant && combatant.hasBuff(SPELLS.EARTH_SHIELD.id, event.timestamp)) {
      this.buffHealing += calculateEffectiveHealing(event, EARTHSHIELD_HEALING_INCREASE);
    }
  }

  // gets overriden by the rshaman module
  getFeeding() {
    return 0;
  }

  statistic() {
    return (
      <StatisticBox
        label={<SpellLink id={SPELLS.EARTH_SHIELD.id} />}
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
