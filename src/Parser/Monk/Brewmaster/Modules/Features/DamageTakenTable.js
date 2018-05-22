import React from 'react';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import DamageTakenTableComponent, { MITIGATED_MAGICAL, MITIGATED_PHYSICAL, MITIGATED_UNKNOWN } from 'Main/DamageTakenTable';
import Tab from 'Main/Tab';
import SPELLS from 'common/SPELLS';
import SPECS from 'common/SPECS';
import SpellLink from 'common/SpellLink';

import HighTolerance from '../Spells/HighTolerance';
import DamageTaken from '../Core/DamageTaken';

const MIN_CLASSIFICATION_AMOUNT = 100;

class DamageTakenTable extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    ht: HighTolerance,
    dmg: DamageTaken,
  };

  // additive increase of 5% while isb is up
  _has2pcT19 = false;
  abilityData = {}; // contains `ability` and `mitigatedAs`

  get tableData() {
    const vals = Object.values(this.abilityData)
      .map(raw => {
        const value = this.dmg.byAbility(raw.ability.guid);
        const staggered = this.dmg.staggeredByAbility(raw.ability.guid);
        // console.log(staggered);
        return { totalDmg: value.effective + staggered, largestSpike: value.largestHit, ...raw };
      });
    vals.sort((a, b) => b.largestSpike - a.largestSpike);
    return vals;
  }

  on_initialized() {
    this._has2pcT19 = this.combatants.selected.hasBuff(SPELLS.T19_2_PIECE_BUFF_BRM.id);
  }

  on_toPlayer_damage(event) {
    if (event.ability.guid === SPELLS.STAGGER_TAKEN.id) {
      return;
    }
    if (event.amount === 0) {
      return;
    }
    const mitigatedAs = this._classifyMitigation(event);
    this._addToAbility(event.ability, mitigatedAs);
  }

  _addToAbility(ability, mitigationType) {
    const spellId = ability.guid;
    if (!this.abilityData[spellId]) {
      this.abilityData[spellId] = {
        mitigatedAs: mitigationType,
        ability: ability,
      };
      return;
    }

    const curMitAs = this.abilityData[spellId].mitigatedAs;
    this.abilityData[spellId].mitigatedAs = this._minMitigationType(curMitAs, mitigationType);
  }

  _minMitigationType(a, b) {
    return Math.min(a, b);
  }

  _classifyMitigation(event) {
    if (event.absorbed + event.amount <= MIN_CLASSIFICATION_AMOUNT) {
      return MITIGATED_UNKNOWN;
    }
    // additive increase of 35%
    const isbActive = this.combatants.selected.hasBuff(SPELLS.IRONSKIN_BREW_BUFF.id);
    // additive increase of 10%
    const fbActive = this.combatants.selected.hasBuff(SPELLS.FORTIFYING_BREW_BRM.id);
    // additive increase of 10%
    const hasHT = this.ht.active;

    const physicalStaggerPct = 0.4 + hasHT * 0.1 + isbActive * 0.35 + isbActive * this._has2pcT19 * 0.05 + fbActive * 0.1;
    const actualPct = event.absorbed / (event.absorbed + event.amount);

    // multiply by 0.95 to allow for minor floating-point / integer
    // division error
    if (actualPct >= physicalStaggerPct * 0.95) {
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
        <Tab>
          <DamageTakenTableComponent
            data={this.tableData}
            spec={SPECS[this.combatants.selected.specId]}
            total={this.dmg.total.effective} />
          <div style={{ padding: '10px' }}>
            <strong>Note:</strong> Damage taken includes all damage put into the <SpellLink id={SPELLS.STAGGER_TAKEN.id} /> pool.
          </div>
        </Tab>
      ),
    };
  }
}

export default DamageTakenTable;
