import React from 'react';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import SPELLS from 'common/SPELLS/index';
import SpellLink from 'common/SpellLink';
import SpellIcon from 'common/SpellIcon';
import { formatPercentage, formatNumber } from 'common/format';
import DamageTracker from 'Parser/Core/Modules/AbilityTracker';
import ExpandableStatisticBox from 'Main/ExpandableStatisticBox';
import ReactTooltip from 'react-tooltip';

const RPPERCHARGE = 6;
const MAXCHARGES = 5;

class Tombstone extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    damageTracker: DamageTracker,
  };

  tombstone = [];
  casts = 0;
  rpGained = 0;
  rpWasted = 0;
  absorbSize = 0;
  totalAbsorbed = 0;


  on_initialized() {
    this.active = this.combatants.selected.hasTalent(SPELLS.TOMBSTONE_TALENT.id);
  }

  get wastedCasts() {
    return this.tombstone.filter(e =>  e.charges < MAXCHARGES).length;
  }

  on_toPlayer_applybuff(event) {
    if (event.ability.guid !== SPELLS.TOMBSTONE_TALENT.id) {
      return;
    }
    this.casts+= 1;
    this.absorbSize= event.absorb;
  }

  on_toPlayer_energize(event) {
    if (event.ability.guid !== SPELLS.TOMBSTONE_TALENT.id) {
      return;
    }
    this.rpGained = event.resourceChange;
    this.rpWasted = event.waste;
  }

  on_toPlayer_absorbed(event) {
    if (event.ability.guid !== SPELLS.TOMBSTONE_TALENT.id) {
      return;
    }
    this.totalAbsorbed+= event.amount;
  }

  on_toPlayer_removebuff(event) {
    if (event.ability.guid !== SPELLS.TOMBSTONE_TALENT.id) {
      return;
    }
    this.tombstone.push({
      rpGained: this.rpGained,
      rpWasted: this.rpWasted,
      absorbSize: this.absorbSize,
      totalAbsorbed: this.totalAbsorbed,
      absorbedWasted: (this.absorbSize- this.totalAbsorbed),
      charges: (this.rpGained / RPPERCHARGE),
    });
    this.totalAbsorbed = 0;
  }

  get suggestionThresholdsEfficiency() {
    return {
      actual: 1 - this.wastedCasts / this.casts,
      isLessThan: {
        minor: 0.95,
        average: 0.9,
        major: .8,
      },
      style: 'percentage',
    };
  }

  suggestions(when) {
    when(this.suggestionThresholdsEfficiency)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<React.Fragment>You casted {this.wastedCasts} <SpellLink id={SPELLS.TOMBSTONE_TALENT.id} /> with less than 5 charges causing a reduced absorb shield.</React.Fragment>)
          .icon(SPELLS.TOMBSTONE_TALENT.icon)
          .actual(`${formatPercentage(actual)}% bad Tombstone casts`)
          .recommended(`<${formatPercentage(recommended)}% is recommended`);
      });
  }

  statistic() {
    return (
      <ExpandableStatisticBox
        icon={<SpellIcon id={SPELLS.TOMBSTONE_TALENT.id} />}
        value={`${this.wastedCasts}`}
        label="Bad Casts"
        tooltip={`Any cast without 5 charges is considered a wasted cast.`}
      >
        <table className="table table-condensed">
          <thead>
            <tr>
              <th>Charges</th>
              <th>RP Wasted</th>
              <th>Absorb Used (%)</th>
            </tr>
          </thead>
          <tbody>
            {Object.values(this.tombstone).map((e, i) =>
              <tr key={i}>
                <th>{this.tombstone[i].charges}</th>
                <td><dfn data-tip={`<strong>RP Generated:</strong> ${this.tombstone[i].rpGained-this.tombstone[i].rpWasted}`}>{this.tombstone[i].rpWasted}</dfn>
                  <ReactTooltip html place="bottom" /></td>
                <td><dfn data-tip={`<strong>Damage Absorbed:</strong> ${formatNumber(this.tombstone[i].totalAbsorbed)}</br>
                                   <strong>Absorb Shield: </strong>${formatNumber(this.tombstone[i].absorbSize)} </br>
                                   <strong>Healing: </strong>${this.owner.formatItemHealingDone(this.tombstone[i].totalAbsorbed)}
                                  `}>{formatPercentage(this.tombstone[i].totalAbsorbed / this.tombstone[i].absorbSize)}%</dfn>
                  <ReactTooltip html place="bottom" /></td>
              </tr>
            )}
          </tbody>
        </table>
      </ExpandableStatisticBox>

    );
  }

}

export default Tombstone;
