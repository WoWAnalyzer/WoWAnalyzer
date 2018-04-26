import React from 'react';

import SPELLS from 'common/SPELLS';
import fetchWcl from 'common/fetchWcl';
import SpellIcon from 'common/SpellIcon';
import { formatThousands, formatNumber } from 'common/format';

import LazyLoadStatisticBox, { STATISTIC_ORDER } from 'Main/LazyLoadStatisticBox';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';

const DEVOTION_AURA_PASSIVE_DAMAGE_REDUCTION = 0.1;
const DEVOTION_AURA_ACTIVE_DAMAGE_REDUCTION = 0.2;

/**
 * Falling damage is considered "pure" or w/e damage meaning it doesn't get reduced by damage reductions. The ability description of such an event can look like this: {
		"name": "Falling",
		"guid": 3,
		"type": 1,
		"abilityIcon": "inv_axe_02.jpg"
	},
 * `type: 1` seems to only be used by Falling, but I was unable to verify this. I want to ignore this kind of damage taken. I figured the savest solution would be to filter by ability id instead of type, but if you find another such ability that needs to be ignored and it has `type: 1` while nothing else does, we may want to refactor this.
 */
// const THIS_MIGHT_BE_PURE_ABILITY_TYPE_ID = 1;
const FALLING_DAMAGE_ABILITY_ID = 3;

class DevotionAura extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  get auraMasteryDamageReduced() {
    return this.totalDamageTakenDuringAuraMastery / (1 - DEVOTION_AURA_ACTIVE_DAMAGE_REDUCTION) * DEVOTION_AURA_ACTIVE_DAMAGE_REDUCTION;
  }
  get auraMasteryDrps() {
    return this.auraMasteryDamageReduced / this.owner.fightDuration * 1000;
  }
  get passiveDamageReduced() {
    return this.totalDamageTakenOutsideAuraMastery / (1 - DEVOTION_AURA_PASSIVE_DAMAGE_REDUCTION) * DEVOTION_AURA_PASSIVE_DAMAGE_REDUCTION;
  }
  get passiveDrps() {
    return this.passiveDamageReduced / this.owner.fightDuration * 1000;
  }
  get damageReduced() {
    return this.auraMasteryDamageReduced + this.passiveDamageReduced;
  }
  get drps() {
    return this.damageReduced / this.owner.fightDuration * 1000;
  }

  totalDamageTakenDuringAuraMastery = 0;
  totalDamageTakenOutsideAuraMastery = 0;
  on_initialized() {
    this.active = this.combatants.selected.hasTalent(SPELLS.DEVOTION_AURA_TALENT.id);
  }

  on_toPlayer_damage(event) {
    const spellId = event.ability.guid;
    if (spellId === FALLING_DAMAGE_ABILITY_ID) {
      return;
    }

    const isAuraMasteryActive = this.combatants.selected.hasBuff(SPELLS.AURA_MASTERY.id, event.timestamp, 0, 0, this.owner.playerId);
    if (!isAuraMasteryActive) {
      this.totalDamageTakenOutsideAuraMastery = this.totalDamageTakenOutsideAuraMastery + event.amount + (event.absorbed || 0);
    }
  }

  load() {
    const buffHistory = this.combatants.selected.getBuffHistory(SPELLS.AURA_MASTERY.id, this.owner.playerId);
    if (buffHistory.length === 0) {
      return Promise.resolve();
    }
    // WCL's filter requires the timestamp to be relative to fight start
    const filter = buffHistory.map(buff => `(timestamp>=${buff.start - this.owner.fight.start_time} AND timestamp<=${buff.end - this.owner.fight.start_time})`).join(' OR ');

    return fetchWcl(`report/tables/damage-taken/${this.owner.report.code}`, {
      start: this.owner.fight.start_time,
      end: this.owner.fight.end_time,
      filter: filter,
    })
      .then(json => {
        console.log('Received AM damage taken', json);
        this.totalDamageTakenDuringAuraMastery = json.entries.reduce((damageTaken, entry) => damageTaken + entry.total, 0);
      });
  }

  statistic() {
    return (
      <LazyLoadStatisticBox
        loader={this.load.bind(this)}
        icon={<SpellIcon id={SPELLS.DEVOTION_AURA_TALENT.id} />}
        value={`≈${formatNumber(this.drps)} DRPS`}
        label="Estimated damage reduced"
        tooltip={`The total estimated damage reduced <b>by the passive</b> was ${formatThousands(this.passiveDamageReduced)} (${formatNumber(this.passiveDrps)} DRPS). This has high accuracy.<br />
          The total estimated damage reduced <b>during Aura Mastery</b> was ${formatThousands(this.auraMasteryDamageReduced)} (${formatNumber(this.auraMasteryDrps)} DRPS). This has a 99% accuracy.<br /><br />

          This is the lowest possible value. This value is pretty accurate for this log if you are looking at the actual gain over not having Devotion Aura bonus at all, but the gain may end up higher when taking interactions with other damage reductions into account.<br /><br />

          Calculating exact Devotion Aura damage reduced is very time and resource consuming. This gets the total damage taken during and outside Aura Mastery and calculates the damage reduced for those totals by taking 20% of the original damage taken during Aura Mastery and 20% of all damage you've taken outside Aura Mastery. Even though the 20% damage taken is split among other nearby players, using your personal damage taken should average it out very closely. More extensive tests that go over all damage events and that is aware of the exact Devotion Aura reduction at each event have shown that this is usually a close approximation.`}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.OPTIONAL(60);
}

export default DevotionAura;
