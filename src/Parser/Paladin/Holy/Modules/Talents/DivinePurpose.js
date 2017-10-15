import React from 'react';

import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import SpellIcon from 'common/SpellIcon';
import { formatPercentage } from 'common/format';

import Module from 'Parser/Core/Module';
import AbilityTracker from 'Parser/Core/Modules/AbilityTracker';
import Combatants from 'Parser/Core/Modules/Combatants';
import SpellUsable from 'Parser/Core/Modules/SpellUsable';

import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

class DivinePurpose extends Module {
  static dependencies = {
    combatants: Combatants,
    abilityTracker: AbilityTracker,
    spellUsable: SpellUsable,
  };

  on_initialized() {
    const hasDivinePurpose = this.combatants.selected.hasTalent(SPELLS.DIVINE_PURPOSE_TALENT_HOLY.id);
    const hasSoulOfTheHighlord = this.combatants.selected.hasFinger(ITEMS.SOUL_OF_THE_HIGHLORD.id);
    this.active = hasDivinePurpose || hasSoulOfTheHighlord;
  }

  holyShockProcs = 0;
  lightOfDawnProcs = 0;
  on_toPlayer_applybuff(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.DIVINE_PURPOSE_HOLY_SHOCK_BUFF.id) {
      this.holyShockProcs += 1;
      if (this.spellUsable.isOnCooldown(SPELLS.HOLY_SHOCK_CAST.id)) {
        this.spellUsable.endCooldown(SPELLS.HOLY_SHOCK_CAST.id);
      }
    }
    if (spellId === SPELLS.DIVINE_PURPOSE_LIGHT_OF_DAWN_BUFF.id) {
      this.lightOfDawnProcs += 1;
      if (this.spellUsable.isOnCooldown(SPELLS.LIGHT_OF_DAWN_CAST.id)) {
        this.spellUsable.endCooldown(SPELLS.LIGHT_OF_DAWN_CAST.id);
      }
    }
  }

  /**
   * Divine Purpose procs sometimes are logged before the related cast. This makes dealing with it harder, so reorder it.
   * @param {Array} events
   * @returns {Array}
   */
  reorderEvents(events) {
    const fixedEvents = [];
    events.forEach((event, eventIndex) => {
      fixedEvents.push(event);

      if (event.type === 'cast' && event.ability.guid === SPELLS.HOLY_SHOCK_CAST.id) {
        const castTimestamp = event.timestamp;

        // Loop through the event history in reverse to detect if there was a `applybuff` event on the same player that was the result of this cast and thus misordered
        for (let previousEventIndex = eventIndex; previousEventIndex >= 0; previousEventIndex -= 1) {
          const previousEvent = fixedEvents[previousEventIndex];
          if ((castTimestamp - previousEvent.timestamp) > 50) { // the max delay between the heal and cast events never looks to be more than this.
            break;
          }
          if (previousEvent.type === 'applybuff' && previousEvent.ability.guid === SPELLS.DIVINE_PURPOSE_HOLY_SHOCK_BUFF.id && previousEvent.sourceID === event.sourceID) {
            fixedEvents.splice(previousEventIndex, 1);
            fixedEvents.push(previousEvent);
            previousEvent.__modified = true;
            break;
          }
        }
      }
    });

    return fixedEvents;
  }

  statistic() {
    const abilityTracker = this.abilityTracker;
    const getAbility = spellId => abilityTracker.getAbility(spellId);

    const lightOfDawnCast = getAbility(SPELLS.LIGHT_OF_DAWN_CAST.id);
    const holyShockHeal = getAbility(SPELLS.HOLY_SHOCK_HEAL.id);

    const lightOfDawnHeals = lightOfDawnCast.casts || 0;
    const holyShockHeals = holyShockHeal.healingHits || 0;

    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.DIVINE_PURPOSE_TALENT_HOLY.id} />}
        value={(
          <span>
            {this.holyShockProcs}{' '}
            <SpellIcon
              id={SPELLS.HOLY_SHOCK_CAST.id}
              style={{
                height: '1.3em',
                marginTop: '-.1em',
              }}
            />
            {' '}
            {this.lightOfDawnProcs}{' '}
            <SpellIcon
              id={SPELLS.LIGHT_OF_DAWN_CAST.id}
              style={{
                height: '1.3em',
                marginTop: '-.1em',
              }}
            />
          </span>
        )}
        label="Divine Purpose procs"
        tooltip={`Your Divine Purpose proc rate for Holy Shock was ${formatPercentage(this.holyShockProcs / (holyShockHeals - this.holyShockProcs))}%.<br />Your Divine Purpose proc rate for Light of Dawn was ${formatPercentage(this.lightOfDawnProcs / (lightOfDawnHeals - this.lightOfDawnProcs))}%`}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.OPTIONAL(75);
}

export default DivinePurpose;
