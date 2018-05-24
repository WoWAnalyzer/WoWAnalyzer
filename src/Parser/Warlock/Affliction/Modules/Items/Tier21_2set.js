import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import { encodeTargetString } from 'Parser/Core/Modules/EnemyInstances';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import { formatNumber } from 'common/format';

import ItemDamageDone from 'Main/ItemDamageDone';

import { UNSTABLE_AFFLICTION_DEBUFF_IDS } from '../../Constants';

const TICKS_PER_UA = 4;
const debug = false;

// When Agony deals damage, there is a 8% chance to increase the duration of Unstable Affliction on the target by 2.0 sec
class Tier21_2set extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  // shows amount of currently passed Unstable Affliction ticks on respective enemies
  /*
    _debuffs = {
      [enemy1ID]: {
        UA_ID1: ticks/null,
        UA_ID2: ticks/null,
        ...
      },
      ...
  */
  _debuffs = {};
  _bonusTicks = 0;
  _bonusDamage = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasBuff(SPELLS.WARLOCK_AFFLI_T21_2P_BONUS.id);
  }

  on_byPlayer_applydebuff(event) {
    const id = event.ability.guid;
    if (!UNSTABLE_AFFLICTION_DEBUFF_IDS.includes(id)) {
      return;
    }
    const enemy = encodeTargetString(event.targetID, event.targetInstance);
    this._ensureEnemyExists(enemy);
    this._debuffs[enemy][id] = 0;
    debug && console.log(`${enemy} - apply ${id}`);
  }

  on_byPlayer_removedebuff(event) {
    const id = event.ability.guid;
    if (!UNSTABLE_AFFLICTION_DEBUFF_IDS.includes(id)) {
      return;
    }
    const enemy = encodeTargetString(event.targetID, event.targetInstance);
    this._ensureEnemyExists(enemy);
    this._debuffs[enemy][id] = null;
    debug && console.log(`${enemy} - remove  ${id}`);
  }

  on_byPlayer_refreshdebuff(event) {
    const id = event.ability.guid;
    if (!UNSTABLE_AFFLICTION_DEBUFF_IDS.includes(id)) {
      return;
    }
    const enemy = encodeTargetString(event.targetID, event.targetInstance);
    this._ensureEnemyExists(enemy);
    this._debuffs[enemy][id] = 0;
  }

  on_byPlayer_damage(event) {
    const id = event.ability.guid;
    if (!UNSTABLE_AFFLICTION_DEBUFF_IDS.includes(id)) {
      return;
    }
    const enemy = encodeTargetString(event.targetID, event.targetInstance);
    this._ensureEnemyExists(enemy);
    this._debuffs[enemy][id] += 1;
    debug && console.log(`${enemy} - damage - ${id}, now at ${this._debuffs[enemy][id]} ticks`);
    if (this._debuffs[enemy][id] > TICKS_PER_UA) {
      this._bonusDamage += event.amount + (event.absorbed || 0);
      this._bonusTicks += 1;
      debug && console.log(`EXTRA - currently ${this._bonusTicks} bonus ticks`);
    }
  }

  _ensureEnemyExists(enemy) {
    if (!this._debuffs[enemy]) {
      this._debuffs[enemy] = {};
      UNSTABLE_AFFLICTION_DEBUFF_IDS.forEach(id => {
        this._debuffs[enemy][id] = 0;
      });
    }
  }

  item() {
    return {
      id: `spell-${SPELLS.WARLOCK_AFFLI_T21_2P_BONUS.id}`,
      icon: <SpellIcon id={SPELLS.WARLOCK_AFFLI_T21_2P_BONUS.id} />,
      title: <SpellLink id={SPELLS.WARLOCK_AFFLI_T21_2P_BONUS.id} icon={false} />,
      result: (<React.Fragment>
        {this._bonusTicks} bonus <SpellLink id={SPELLS.UNSTABLE_AFFLICTION_CAST.id} /> ticks <br />
        <dfn data-tip={`${formatNumber(this._bonusDamage)} bonus damage`}>
          <ItemDamageDone amount={this._bonusDamage}/>
        </dfn>
      </React.Fragment>),
    };
  }
}

export default Tier21_2set;
