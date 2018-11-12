import React from 'react';

import Analyzer from 'parser/core/Analyzer';
import ISSUE_IMPORTANCE from 'parser/core/ISSUE_IMPORTANCE';

import SpellLink from 'common/SpellLink';
import { formatThousands } from 'common/format';
import SPELLS from 'common/SPELLS';

import HIT_TYPES from 'game/HIT_TYPES';

import StatisticListBoxItem from 'interface/others/StatisticListBoxItem';

const debug = false;
class FireAndBrimstone extends Analyzer {
  _primaryTargets = [];

  bonusFragments = 0;
  bonusDmg = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.FIRE_AND_BRIMSTONE_TALENT.id);
  }

  on_byPlayer_cast(event) {
    if (event.ability.guid !== SPELLS.INCINERATE.id) {
      return;
    }
    debug && this.log(`Storing Incinerate cast on ${event.targetID}, ${event.targetInstance}`);
    this._primaryTargets.push({
      timestamp: event.timestamp,
      targetID: event.targetID,
      targetInstance: event.targetInstance,
    });
  }

  on_byPlayer_damage(event) {
    if (event.ability.guid !== SPELLS.INCINERATE.id) {
      return;
    }
    // should find FIRST (oldest) Incinerate cast, so even though you can fire multiple Incinerates before the first hits, this should pair the events correctly even if they have the same ID and instance
    const primaryTargetEventIndex = this._primaryTargets.findIndex(primary => primary.targetID === event.targetID && primary.targetInstance === event.targetInstance);
    if (primaryTargetEventIndex !== -1) {
      debug && this.log(`Found Incinerate cast on ${event.targetID}, ${event.targetInstance}`);
      // it's a Incinerate damage on primary target, delete the event so it doesn't interfere with another casts
      this._primaryTargets.splice(primaryTargetEventIndex, 1);
      return;
    }
    debug && this.log(`Incinerate CLEAVE on ${event.targetID}, ${event.targetInstance}`);
    // should be cleaved damage
    this.bonusFragments += (event.hitType === HIT_TYPES.CRIT) ? 2 : 1;
    this.bonusDmg += event.amount + (event.absorbed || 0);
    debug && this.log(`Current bonus fragments: ${this.bonusFragments}`);
  }

  suggestions(when) {
    // this is incorrect in certain situations with pre-casted Incinerates, but there's very little I can do about it
    // example: pre-cast Incinerate -> *combat starts* -> hard cast Incinerate -> first Incinerate lands -> second Incinerate lands
    // but because the second Incinerate "technically" doesn't have a cast event to pair with, it's incorrectly recognized as cleaved
    when(this.bonusFragments).isEqual(0)
      .addSuggestion(suggest => {
        return suggest(<>Your <SpellLink id={SPELLS.FIRE_AND_BRIMSTONE_TALENT.id} icon /> talent didn't contribute any bonus fragments. When there are no adds to cleave onto, this talent is useless and you should switch to a different talent.</>)
          .icon(SPELLS.FIRE_AND_BRIMSTONE_TALENT.icon)
          .actual('No bonus Soul Shard Fragments generated')
          .recommended('Different talent is recommended')
          .staticImportance(ISSUE_IMPORTANCE.MAJOR);
      });
  }

  subStatistic() {
    return (
      <StatisticListBoxItem
        title={<><SpellLink id={SPELLS.FIRE_AND_BRIMSTONE_TALENT.id} /> bonus fragments</>}
        value={this.bonusFragments}
        valueTooltip={`Bonus cleave damage: ${formatThousands(this.bonusDmg)} (${this.owner.formatItemDamageDone(this.bonusDmg)}).`}
      />
    );
  }
}

export default FireAndBrimstone;
