import React from 'react';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import DamageTakenTableComponent, { MITIGATED_NONE, MITIGATED_PHYSICAL, MITIGATED_MAGICAL } from 'Main/DamageTakenTable';
import Tab from 'Main/Tab';
import SPELLS from 'common/SPELLS';

import HighTolerance from '../Spells/HighTolerance';

class DamageTakenTable extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    ht: HighTolerance,
  };

  // additive increase of 5% while isb is up
  _has2pcT19 = false;
  abilityData = {};

  get tableData() {
    const vals = Object.values(this.abilityData);
    vals.sort((a, b) => b.largestSpike - a.largestSpike);
    return vals;
  }

  on_initialized() {
    this._has2pcT19 = this.combatants.selected.hasBuff(SPELLS.T19_2_PIECE_BUFF_BRM.id);
  }

  on_toPlayer_damage(event) {
    if(event.ability.guid === SPELLS.STAGGER_TAKEN.id) {
      return;
    }
    if(event.amount === 0) {
      return;
    }
    // stagger always does *something* if an ability can be mitigated,
    // so we detect unmitigable abilities by checking if it did anything
    if(event.absorbed === 0) {
      this._addToAbility(event.ability.guid, event.ability.name, event.amount, MITIGATED_NONE);
      return;
    }

    const damage = event.amount;
    const mitigatedAs = this._classifyMitigation(event);
    this._addToAbility(event.ability, damage, mitigatedAs);
  }

  _addToAbility(ability, damage, mitigationType) {
    const spellId = ability.guid;
    if(!(spellId in this.abilityData)) {
      this.abilityData[spellId] = {
        totalDmg: damage,
        largestSpike: damage,
        mitigatedAs: mitigationType,
        ability: ability,
      };
      return;
    }
    this.abilityData[spellId].totalDmg += damage;
    this.abilityData[spellId].largestSpike = Math.max(this.abilityData[spellId].largestSpike, damage);

    const curMitAs = this.abilityData[spellId].mitigatedAs;
    if(curMitAs === MITIGATED_PHYSICAL) {
      // we *can* drop down, but not go up
      this.abilityData[spellId].mitigatedAs = this._minMitigationType(curMitAs, mitigationType);
    }
  }

  _minMitigationType(a, b) {
    return Math.min(a, b);
  }

  _classifyMitigation(event) {
    // additive increase of 35%
    const isbActive = this.combatants.selected.hasBuff(SPELLS.IRONSKIN_BREW_BUFF.id);
    // additive increase of 10%
    const fbActive = this.combatants.selected.hasBuff(SPELLS.FORTIFYING_BREW_BRM.id);
    // additive increase of 10%
    const hasHT = this.ht.active;
    // multiplicative increase of 40% for magic damage
    // const hasMV = this.combatants.selected.hasTalent(SPELLS.MYSTIC_VITALITY_TALENT.id) || this.combatants.selected.hasRing(ITEMS.SOUL_OF_THE_GRANDMASTER.id);

    const physicalStaggerPct = 0.4 + hasHT * 0.1 + isbActive * 0.35 + isbActive * this._has2pcT19 * 0.05 + fbActive * 0.1;
    // const magicalStaggerPct = physicalStaggerPct * 0.4 * (hasMV ? 1.4 : 1);

    const actualPct = event.absorbed / (event.absorbed + event.amount);
    console.log(actualPct, physicalStaggerPct, event, hasHT, isbActive, this._has2pcT19, fbActive);

    // multiply by 0.95 to allow for minor floating-point / integer
    // division error
    if(actualPct >= physicalStaggerPct * 0.95) {
      return MITIGATED_PHYSICAL;
    } else {
      return MITIGATED_MAGICAL;
    }
  }

  tab() {
    return {
      title: 'Damage Taken by Ability',
      url: 'damage-taken-by-ability',
      render: () => (
        <Tab title="Damage Taken by Ability">
          <DamageTakenTableComponent data={this.tableData} />
        </Tab>
      ),
    };
  }
}

export default DamageTakenTable;
