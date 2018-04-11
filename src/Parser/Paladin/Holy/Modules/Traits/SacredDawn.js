import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import { formatPercentage } from 'common/format';

import Analyzer from 'Parser/Core/Analyzer';
import calculateEffectiveHealing from 'Parser/Core/calculateEffectiveHealing';
import Combatants from 'Parser/Core/Modules/Combatants';

import SmallStatisticBox, { STATISTIC_ORDER } from 'Main/SmallStatisticBox';

const debug = false;

const SACRED_DAWN_BUFF_SPELL_ID = 243174;
const SACRED_DAWN_HEALING_INCREASE = 0.1;

class SacredDawn extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  healing = 0;

  on_initialized() {
    this.active = this.combatants.selected.traitsBySpellId[SPELLS.SACRED_DAWN.id] === 1;
  }

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;
    if (this.owner.constructor.abilitiesAffectedByHealingIncreases.indexOf(spellId) === -1) {
      return;
    }
    if (spellId === SPELLS.BEACON_OF_LIGHT_CAST_AND_HEAL.id) {
      // Beacon transfer doesn't double dip, so it relies on the buff having been applied to original heal target so we need `on_beacon_heal` to calculate this. (so if a beacon target gets 10% increased healing from SD it won't increase the received beacon heals except indirectly).
      return;
    }
    const combatant = this.combatants.players[event.targetID];
    if (!combatant) {
      // If combatant doesn't exist it's probably a pet.
      debug && console.log('Skipping event since combatant couldn\'t be found:', event);
      return;
    }
    // When SD isn't up, a Light of Dawn applies Sacred Dawn to the players. Until 18/4/17 this sometimes happened BEFORE the heal was triggered, but the buff didn't increase the healing. While this should no longer happen, the below `minimalActiveTime` of 5ms should make sure that if it does still happen, the non existing healing gain isn't considered.
    const hasBuff = combatant.hasBuff(SACRED_DAWN_BUFF_SPELL_ID, event.timestamp, undefined, 5);

    if (debug && spellId === SPELLS.LIGHT_OF_DAWN_HEAL.id) {
      const secondsIntoFight = (event.timestamp - this.owner.fight.start_time) / 1000;
      console.log(secondsIntoFight.toFixed(3), event.timestamp, 'LoD heal on', combatant.name, 'Sacred Dawn:', hasBuff, 'event:', event);
    }

    if (!hasBuff) {
      return;
    }

    this.healing += calculateEffectiveHealing(event, SACRED_DAWN_HEALING_INCREASE);
  }
  on_beacon_heal(event) {
    const spellId = event.originalHeal.ability.guid;
    if (this.owner.constructor.abilitiesAffectedByHealingIncreases.indexOf(spellId) === -1) {
      return;
    }
    const combatant = this.combatants.players[event.originalHeal.targetID];
    if (!combatant) {
      // If combatant doesn't exist it's probably a pet.
      debug && console.log('Skipping beacon heal event since combatant couldn\'t be found:', event, 'for heal:', event.originalHeal);
      return;
    }
    if (!combatant.hasBuff(SACRED_DAWN_BUFF_SPELL_ID, event.originalHeal.timestamp)) {
      return;
    }

    this.healing += calculateEffectiveHealing(event, SACRED_DAWN_HEALING_INCREASE);
  }

  statistic() {
    return (
      <SmallStatisticBox
        icon={<SpellIcon id={SPELLS.SACRED_DAWN.id} />}
        label="Sacred Dawn contribution"
        value={`${formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.healing))} %`}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.UNIMPORTANT(10);
}

export default SacredDawn;
