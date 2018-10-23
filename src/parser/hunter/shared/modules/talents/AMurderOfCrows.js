import React from 'react';

import SPELLS from 'common/SPELLS';
import Analyzer from 'parser/core/Analyzer';

import SpellUsable from 'parser/shared/modules/SpellUsable';
import SpellLink from 'common/SpellLink';
import ItemDamageDone from 'interface/others/ItemDamageDone';
import StatisticListBoxItem from 'interface/others/StatisticListBoxItem';

/**
 * Summons a flock of crows to attack your target over the next 15 sec. If the target dies while under attack, A Murder of Crows' cooldown is reset.
 *
 * Example log: https://www.warcraftlogs.com/reports/8jJqDcrGK1xM3Wn6#fight=2&type=damage-done
 */

const CROWS_TICK_RATE = 1000;
const MS_BUFFER = 100;
const CROWS_DURATION = 15000;

class AMurderOfCrows extends Analyzer {

  static dependencies = {
    spellUsable: SpellUsable,
  };

  bonusDamage = 0;
  casts = 0;
  applicationTimestamp = null;
  lastDamageTick = null;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.A_MURDER_OF_CROWS_TALENT.id);
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.A_MURDER_OF_CROWS_TALENT.id) {
      return;
    }
    this.casts++;
    this.applicationTimestamp = null;
    this.lastDamageTick = null;
  }

  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;
    /**
     * Checks if we've had atleast 1 damage tick of the currently applied crows, and checks that crows is in fact on cooldown.
     * Then it checks whether the current damage event is less than the full duration of crows, followed by a check to see if more than 1 second has passed since last tick
     * If more than 1 second has passed, we can assume that crows has been reset, and thus we the CD.
     */
    if (this.lastDamageTick && this.spellUsable.isOnCooldown(SPELLS.A_MURDER_OF_CROWS_TALENT.id) && event.timestamp + MS_BUFFER < this.applicationTimestamp + CROWS_DURATION + MS_BUFFER && event.timestamp > this.lastDamageTick + CROWS_TICK_RATE + MS_BUFFER) {
      this.spellUsable.endCooldown(SPELLS.A_MURDER_OF_CROWS_TALENT.id, event.timestamp);
    }
    if (spellId !== SPELLS.A_MURDER_OF_CROWS_DEBUFF.id) {
      return;
    }
    if (this.casts === 0) {
      this.casts++;
      this.spellUsable.beginCooldown(SPELLS.A_MURDER_OF_CROWS_TALENT.id, this.owner.fight.start_time);
      this.applicationTimestamp = this.owner.fight.start_time;
    }
    //This accounts for the travel time of crows, since the first damage marks the time where the crows debuff is applied
    if (!this.lastDamageTick && !this.applicationTimestamp) {
      this.applicationTimestamp = event.timestamp;
    }
    this.lastDamageTick = event.timestamp;
    this.bonusDamage += event.amount + (event.absorbed || 0);
  }

  subStatistic() {
    return (
      <StatisticListBoxItem
        title={<SpellLink id={SPELLS.A_MURDER_OF_CROWS_TALENT.id} />}
        value={<ItemDamageDone amount={this.bonusDamage} />}
      />
    );
  }
}

export default AMurderOfCrows;
