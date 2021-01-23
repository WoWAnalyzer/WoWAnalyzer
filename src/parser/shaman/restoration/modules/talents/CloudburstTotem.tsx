import React from 'react';

import { SpellLink } from 'interface';
import SPELLS from 'common/SPELLS';
import { formatPercentage } from 'common/format';

import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent, CastEvent, EventType, HealEvent, RemoveBuffEvent } from 'parser/core/Events';
import EventEmitter from 'parser/core/modules/EventEmitter';
import StatisticListBoxItem from 'parser/ui/StatisticListBoxItem';

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

  protected eventEmitter!: EventEmitter;
  protected cooldownThroughputTracker!: CooldownThroughputTracker;


  healing = 0;
  cbtActive = false;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.CLOUDBURST_TOTEM_TALENT.id);

    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(SPELLS.CLOUDBURST_TOTEM_HEAL), this._onHeal);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.CLOUDBURST_TOTEM_TALENT), this._onCast);
  }

  _onHeal(event: HealEvent) {
    if (this.cbtActive) {
      this._createFabricatedEvent(event, EventType.RemoveBuff, event.timestamp);
      this.cbtActive = false;
    }

    this.healing += event.amount + (event.absorbed || 0);
  }

  _onCast(event: CastEvent) {
    // Patch 7.3.5 added a buffer before CBT can collect healing after casting,
    // this turns out to be around 200ms and causes it to not collect healing from
    // spells casted right before it, essentially removing pre-feeding.
    // This adds those 200ms to it so you can visually see that the feeding starts later.
    const timestamp = event.timestamp + DELAY_MS;
    this._createFabricatedEvent(event, EventType.ApplyBuff, timestamp);
    this.cbtActive = true;
  }

  _createFabricatedEvent(event: CastEvent | HealEvent, type: EventType.ApplyBuff | EventType.RemoveBuff, timestamp: number) {
    const fabricatedEvent: ApplyBuffEvent | RemoveBuffEvent = {
      ability: {
        ...event.ability,
        guid: SPELLS.CLOUDBURST_TOTEM_TALENT.id,
      },
      sourceID: event.sourceID,
      targetID: event.sourceID,
      sourceIsFriendly: event.sourceIsFriendly,
      targetIsFriendly: event.targetIsFriendly,
      timestamp: timestamp,
      type: type,
    };

    this.eventEmitter.fabricateEvent(fabricatedEvent, event);
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
