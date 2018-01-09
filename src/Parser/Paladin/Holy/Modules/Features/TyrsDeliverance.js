import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import { formatPercentage } from 'common/format';

import Analyzer from 'Parser/Core/Analyzer';
import calculateEffectiveHealing from 'Parser/Core/calculateEffectiveHealing';
import Combatants from 'Parser/Core/Modules/Combatants';

import SmallStatisticBox, { STATISTIC_ORDER } from 'Main/SmallStatisticBox';

import TyrsMunificence from '../Traits/TyrsMunificence';

const debug = true;

const TYRS_DELIVERANCE_BASE_HEALING_INCREASE = 0.2;
const TYRS_MUNIFICENCE_POINT_HEALING_INCREASE = 0.05;

class TyrsDeliverance extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    tyrsMunificence: TyrsMunificence,
  };

  healHealing = 0;
  buffFoLHLHealing = 0;

  get tyrsHealingIncrease() {
    return TYRS_DELIVERANCE_BASE_HEALING_INCREASE + this.tyrsMunificence.rank * TYRS_MUNIFICENCE_POINT_HEALING_INCREASE;
  }

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;
    switch (spellId) {
      case SPELLS.TYRS_DELIVERANCE_HEAL.id:
        this.healHealing += event.amount + (event.absorbed || 0);
        break;
      case SPELLS.FLASH_OF_LIGHT.id:
      case SPELLS.HOLY_LIGHT.id: {
        const combatant = this.combatants.players[event.targetID];
        if (!combatant) {
          // If combatant doesn't exist it's probably a pet.
          debug && console.log('Skipping event since combatant couldn\'t be found:', event);
          return;
        }
        if (!combatant.hasBuff(SPELLS.TYRS_DELIVERANCE_HEAL.id, event.timestamp)) {
          break;
        }

        this.buffFoLHLHealing += calculateEffectiveHealing(event, this.tyrsHealingIncrease);
        break;
      }
      default:
        break;
    }
  }
  on_beacon_heal(beaconTransferEvent, healEvent) {
    const spellId = healEvent.ability.guid;
    if (spellId !== SPELLS.FLASH_OF_LIGHT.id && spellId !== SPELLS.HOLY_LIGHT.id) {
      return;
    }
    const combatant = this.combatants.players[healEvent.targetID];
    if (!combatant) {
      // If combatant doesn't exist it's probably a pet.
      debug && console.log('Skipping beacon heal event since combatant couldn\'t be found:', beaconTransferEvent, 'for heal:', healEvent);
      return;
    }
    if (!combatant.hasBuff(SPELLS.TYRS_DELIVERANCE_HEAL.id, healEvent.timestamp)) {
      return;
    }

    this.buffFoLHLHealing += calculateEffectiveHealing(beaconTransferEvent, this.tyrsHealingIncrease);
  }

  statistic() {
    const tyrsDeliveranceHealHealingPercentage = this.owner.getPercentageOfTotalHealingDone(this.healHealing);
    const tyrsDeliveranceBuffFoLHLHealingPercentage = this.owner.getPercentageOfTotalHealingDone(this.buffFoLHLHealing);
    const tyrsDeliverancePercentage = tyrsDeliveranceHealHealingPercentage + tyrsDeliveranceBuffFoLHLHealingPercentage;

    return (
      <SmallStatisticBox
        icon={<SpellIcon id={SPELLS.TYRS_DELIVERANCE_CAST.id} />}
        value={`${formatPercentage(tyrsDeliverancePercentage)} %`}
        label="Tyr's Deliverance healing"
        tooltip={`The total actual effective healing contributed by Tyr's Deliverance. This includes the gains from the increase to healing by Flash of Light and Holy Light.<br /><br />The actual healing done by the effect was ${formatPercentage(tyrsDeliveranceHealHealingPercentage)}% of your healing done, and the healing contribution from the Flash of Light and Holy Light heal increase was ${formatPercentage(tyrsDeliveranceBuffFoLHLHealingPercentage)}% of your healing done.`}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.UNIMPORTANT();
}

export default TyrsDeliverance;
