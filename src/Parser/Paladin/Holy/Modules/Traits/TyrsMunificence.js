import React from 'react';

import SPELLS from 'common/SPELLS';

import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';

import Analyzer from 'Parser/Core/Analyzer';
import calculateEffectiveHealing from 'Parser/Core/calculateEffectiveHealing';
import HealingValue from 'Parser/Core/Modules/HealingValue';
import Combatants from 'Parser/Core/Modules/Combatants';

const TYRS_DELIVERANCE_BASE_HEALING_INCREASE = 0.2;
const TYRS_MUNIFICENCE_POINT_HEALING_INCREASE = 0.05;
const debug = true;

/**
 * Tyr's Munificence (Artifact Trait)
 * Increases the range of Tyr's Deliverance by 2 yards, healing by 5%, and the healing bonus by 5%.
 */
class TyrsMunificence extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  rank = 0;
  healing = 0;

  on_initialized() {
    this.rank = this.combatants.selected.traitsBySpellId[SPELLS.TYRS_MUNIFICENCE.id];
    this.active = this.rank > 0;
  }

  get tyrsHealingIncrease() {
    return TYRS_DELIVERANCE_BASE_HEALING_INCREASE + this.rank * TYRS_MUNIFICENCE_POINT_HEALING_INCREASE;
  }

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;
    switch (spellId) {
      case SPELLS.TYRS_DELIVERANCE_HEAL.id:
        this.healing += calculateEffectiveHealing(event, TYRS_MUNIFICENCE_POINT_HEALING_INCREASE); // the passive healing gain from this is likely additive with itself (so 4 traits = 20%, not 21.55%), but testing this is hard and the difference is minimal. Just assuming multiplicative for simplicity sake, it might only be a tiny bit off, and maybe Blizzard actually tried with this trait and it's multiplicative after all.
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

        const heal = new HealingValue(event.amount, event.absorbed, event.overheal);
        const base = heal.raw / this.tyrsHealingIncrease;
        const rawContribution = base * TYRS_MUNIFICENCE_POINT_HEALING_INCREASE;

        this.healing += Math.max(0, rawContribution - heal.overheal);
        break;
      }
      default: break;
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

  subStatistic() {
    return (
      <div className="flex">
        <div className="flex-main">
          <SpellLink id={SPELLS.TYRS_MUNIFICENCE.id} />
        </div>
        <div className="flex-sub text-right">
          {formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.healing))} %
        </div>
      </div>
    );
  }
}

export default TyrsMunificence;
