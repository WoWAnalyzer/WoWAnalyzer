import React from 'react';

import SpellLink from 'common/SpellLink';
import SPELLS from 'common/SPELLS';
import { formatPercentage } from 'common/format';

import Analyzer from 'parser/core/Analyzer';
import { EventType } from 'parser/core/Events';
import EventEmitter from 'parser/core/modules/EventEmitter';
import StatisticListBoxItem from 'interface/others/StatisticListBoxItem';

import CooldownThroughputTracker from '../features/CooldownThroughputTracker';

const DELAY_MS = 200;

/**
 * Cloudburst Totem has no buff events in the combatlog, so we're fabricating it on cast and
 * removing it when its done, so we can track the buff and have it show up on the timeline.
 *
 * Also sums up the healing it does and feeds for the Talents module.
 */

class CloudburstTotem extends Analyzer {
  static dependencies = {
    eventEmitter: EventEmitter,
    cooldownThroughputTracker: CooldownThroughputTracker,
  };
  healing = 0;
  cbtActive = false;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.CLOUDBURST_TOTEM_TALENT.id);
  }

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;

    if (spellId !== SPELLS.CLOUDBURST_TOTEM_HEAL.id) {
      return;
    }
    if(this.cbtActive) {
      this._createFabricatedEvent(event, EventType.RemoveBuff);
      this.cbtActive = false;
    }

    this.healing += event.amount + (event.absorbed || 0);
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;

    if (spellId !== SPELLS.CLOUDBURST_TOTEM_TALENT.id) {
      return;
    }

    // Patch 7.3.5 added a buffer before CBT can collect healing after casting,
    // this turns out to be around 200ms and causes it to not collect healing from
    // spells casted right before it, essentially removing pre-feeding.
    // This adds those 200ms to it so you can visually see that the feeding starts later.
    const manipulatedEvent = {...event};
    manipulatedEvent.timestamp = manipulatedEvent.timestamp + DELAY_MS;

    this._createFabricatedEvent(manipulatedEvent, EventType.ApplyBuff);
    this.cbtActive = true;
  }

  _createFabricatedEvent(event, type) {
    this.eventEmitter.fabricateEvent({
      ...event,
      ability: {
        ...event.ability,
        guid: SPELLS.CLOUDBURST_TOTEM_TALENT.id,
      },
      type: type,
      targetID: event.sourceID,
      targetIsFriendly: event.sourceIsFriendly,
    }, event);
  }

  subStatistic() {
    const feeding = this.cooldownThroughputTracker.getIndirectHealing(SPELLS.CLOUDBURST_TOTEM_HEAL.id);
    return (
      <StatisticListBoxItem
        title={<SpellLink id={SPELLS.CLOUDBURST_TOTEM_TALENT.id} />}
        value={`${formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.healing + feeding))} %`}
      />
    );
  }

}

export default CloudburstTotem;
