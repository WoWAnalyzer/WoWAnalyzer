import React from 'react';

import SPELLS from 'common/SPELLS';
import { formatPercentage } from 'common/format';
import { SpellLink } from 'interface';

import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Combatants from 'parser/shared/modules/Combatants';
import calculateEffectiveHealing from 'parser/core/calculateEffectiveHealing';
import Events, { HealEvent, BeginCastEvent } from 'parser/core/Events';

import StatisticListBoxItem from 'parser/ui/StatisticListBoxItem';

import HealingRainLocation from '../core/HealingRainLocation';

const DELUGE_HEALING_INCREASE = 0.20;

/**
 * Chain Heal heals for an additional 20% on targets within your Healing Rain or affected by your Riptide.
 */
class Deluge extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    healingRainLocation: HealingRainLocation,
  };
  protected combatants!: Combatants;
  protected healingRainLocation!: HealingRainLocation;

  healing = 0;
  eventsDuringRain: HealEvent[] = [];

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.DELUGE_TALENT.id);

    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell([SPELLS.CHAIN_HEAL, SPELLS.HEALING_WAVE, SPELLS.HEALING_SURGE]), this._onHeal);
    this.addEventListener(Events.begincast.by(SELECTED_PLAYER).spell(SPELLS.HEALING_RAIN_CAST), this._onHealingRainBegincast);
    this.addEventListener(Events.fightend, this._onFightend);
  }

  _onHeal(event: HealEvent) {
    const combatant = this.combatants.getEntity(event);
    if (!combatant) {
      // Pet healing
      this.eventsDuringRain.push(event);
      return;
    }

    const hasBuff = combatant.hasBuff(SPELLS.RIPTIDE.id, event.timestamp, undefined, undefined, this.owner.playerId);
    if (!hasBuff) {
      // We add events for the Healing Rain here, so that it doesn't double dip on targets with Riptide
      this.eventsDuringRain.push(event);
      return;
    }

    this.healing += calculateEffectiveHealing(event, DELUGE_HEALING_INCREASE);
  }

  // Due to the nature of having to wait until rain is over, to be able to find out its position,
  // we only start processing the healing contribution on the next cast of Healing Rain or at the end of combat.
  _onHealingRainBegincast(event: BeginCastEvent) {
    if (event.isCancelled) {
      return;
    }

    this.recordHealing();
    this.eventsDuringRain.length = 0;
  }

  _onFightend() {
    this.recordHealing();
  }

  recordHealing() {
    // filters out the first cast in combat if there was no pre-cast, or if there were no Chain Heal casts anyway.
    if (this.eventsDuringRain.length === 0) {
      return;
    }

    this.healing += this.healingRainLocation.processHealingRain(this.eventsDuringRain, DELUGE_HEALING_INCREASE);
  }

  subStatistic() {
    return (
      <StatisticListBoxItem
        title={<SpellLink id={SPELLS.DELUGE_TALENT.id} />}
        value={`${formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.healing))} %`}
      />
    );
  }

}

export default Deluge;
