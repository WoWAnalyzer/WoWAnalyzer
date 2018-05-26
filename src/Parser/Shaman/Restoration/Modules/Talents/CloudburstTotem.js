import React from 'react';

import SpellLink from 'common/SpellLink';
import SPELLS from 'common/SPELLS';
import { formatPercentage } from 'common/format';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';

import CooldownThroughputTracker from '../Features/CooldownThroughputTracker';

const DELAY_MS = 200;

class CloudburstTotem extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    cooldownThroughputTracker: CooldownThroughputTracker,
  };
  healing = 0;
  cbtActive = false;

  on_initialized() {
    this.active = this.combatants.selected.hasTalent(SPELLS.CLOUDBURST_TOTEM_TALENT.id);
  }

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;

    if (spellId !== SPELLS.CLOUDBURST_TOTEM_HEAL.id) {
      return;
    }
    if(this.cbtActive) {
      this._createFabricatedEvent(event, 'removebuff');
      this.cbtActive = false;
    }

    this.healing += event.amount;
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;

    if (spellId !== SPELLS.CLOUDBURST_TOTEM_TALENT.id) {
      return;
    }

    // Patch 7.3.5 added a buffer before CBT can collect healing after casting,
    // this turns out to be around 200ms and causes it to not collect healing from 
    // spells casted right before it, essentially removing pre-feeding.
    // I'm adding those 200ms here so you can visually see that the feeding starts later.
    const manipulatedEvent = {...event};
    manipulatedEvent.timestamp = manipulatedEvent.timestamp + DELAY_MS;

    this._createFabricatedEvent(manipulatedEvent, 'applybuff');
    this.cbtActive = true;
  }

  _createFabricatedEvent(event, type) {
    this.owner.fabricateEvent({
      ...event,
      ability: {
        ...event.ability,
        guid: SPELLS.CLOUDBURST_TOTEM_TALENT.id,
      },
      type: type,
      targetID: event.sourceID,
      targetIsFriendly: event.sourceIsFriendly,
      __fabricated: true,
    }, event);
  }

  subStatistic() {
    const feeding = this.cooldownThroughputTracker.getIndirectHealing(SPELLS.CLOUDBURST_TOTEM_HEAL.id);
    return (
      <div className="flex">
        <div className="flex-main">
          <SpellLink id={SPELLS.CLOUDBURST_TOTEM_TALENT.id} />
        </div>
        <div className="flex-sub text-right">
          {formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.healing + feeding))} %
        </div>
      </div>
    );
  }

}

export default CloudburstTotem;
