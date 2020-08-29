import React from 'react';

import Analyzer from 'parser/core/Analyzer';
import StatisticBox, { STATISTIC_ORDER } from 'interface/others/StatisticBox';
import { formatNumber, formatPercentage } from 'common/format';
import SpellIcon from 'common/SpellIcon';
import SPELLS from 'common/SPELLS';
import calculateEffectiveDamage from 'parser/core/calculateEffectiveDamage';
import SpellLink from 'common/SpellLink';
import { SELECTED_PLAYER } from 'parser/core/EventFilter';
import Events from 'parser/core/Events';
import SUGGESTION_IMPORTANCE from 'parser/core/ISSUE_IMPORTANCE';

const MASTER_OF_THE_ELEMENTS = {
  INCREASE: 0.2,
  DURATION: 15000,
  WINDOW_DURATION: 500,
  AFFECTED_DAMAGE: [
    SPELLS.ICEFURY_TALENT,
    SPELLS.ICEFURY_OVERLOAD,
    SPELLS.FROST_SHOCK,
    SPELLS.LIGHTNING_BOLT,
    SPELLS.LIGHTNING_BOLT_OVERLOAD,
    SPELLS.CHAIN_LIGHTNING,
    SPELLS.CHAIN_LIGHTNING_OVERLOAD,
    SPELLS.ELEMENTAL_BLAST_TALENT,
    SPELLS.ELEMENTAL_BLAST_OVERLOAD,
    SPELLS.EARTH_SHOCK,
  ],
  AFFECTED_CASTS: [
    SPELLS.EARTHQUAKE,
    SPELLS.ICEFURY_TALENT,
    SPELLS.FROST_SHOCK,
    SPELLS.ELEMENTAL_BLAST_TALENT,
    SPELLS.CHAIN_LIGHTNING,
    SPELLS.EARTH_SHOCK,
    SPELLS.LIGHTNING_BOLT,
  ],
  TALENTS: [
    SPELLS.ICEFURY_TALENT.id,
    SPELLS.ELEMENTAL_BLAST_TALENT.id,
  ],
};

class MasterOfTheElements extends Analyzer {
  moteBuffedAbilities = {};
  moteActivationTimestamp = null;
  moteConsumptionTimestamp = null;
  damageGained = 0;
  bugCheckNecessary = false;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.MASTER_OF_THE_ELEMENTS_TALENT.id);

    for (const key in MASTER_OF_THE_ELEMENTS.AFFECTED_CASTS) {
      const spellid = MASTER_OF_THE_ELEMENTS.AFFECTED_CASTS[key].id;
      if((this.selectedCombatant.hasTalent(spellid)) || (!MASTER_OF_THE_ELEMENTS.TALENTS.includes(spellid))) {
        this.moteBuffedAbilities[spellid] = 0;
      }
    }

    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(MASTER_OF_THE_ELEMENTS.AFFECTED_CASTS), this._onCast);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.LAVA_BURST), this._onLvBCast);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(MASTER_OF_THE_ELEMENTS.AFFECTED_DAMAGE), this._onDamage);
  }

  _onCast(event){
    if(this.moteActivationTimestamp===null){ //the buff is a clusterfuck so we just track it manually
      return;
    }
    this.moteConsumptionTimestamp=event.timestamp;
    this.moteActivationTimestamp=null;
    event.meta = event.meta || {};
    event.meta.isEnhancedCast = true;
    this.moteBuffedAbilities[event.ability.guid] += 1;

  }

  _onLvBCast(event){
    this.moteActivationTimestamp = event.timestamp;
    this.bugCheckNecessary = true;
  }

  _onDamage(event){
    if (event.timestamp<this.moteConsumptionTimestamp || event.timestamp>this.moteConsumptionTimestamp+MASTER_OF_THE_ELEMENTS.WINDOW_DURATION){
      return;
    }
    this.damageGained += calculateEffectiveDamage(event, MASTER_OF_THE_ELEMENTS.INCREASE);
  }

  get damagePercent() {
    return this.owner.getPercentageOfTotalDamageDone(this.damageGained);
  }

  get damagePerSecond() {
    return this.damageGained / (this.owner.fightDuration / 1000);
  }

  get isBugged() {
    return this.bugCheckNecessary && (this.selectedCombatant.getBuffUptime(SPELLS.MASTER_OF_THE_ELEMENTS_BUFF.id) || 0) === 0;
  }

  get suggestionThresholds() {
    return {
      actual: this.isBugged,
      isEqual: true,
      style: 'boolean',
    };
  }

  reverseEffectiveDamageDonePerSecond(number, increase){
    return number*(1 + increase)/this.owner.fightDuration*1000;
  }

  suggestions(when){
    when(this.suggestionThresholds)
      .addSuggestion((suggest) => {
        return suggest(<>Master Of the Elements bugged out and you lost out on at least {formatNumber(this.reverseEffectiveDamageDonePerSecond(this.damageGained,MASTER_OF_THE_ELEMENTS.INCREASE))} DPS.
          Consider getting this weakaura: <a href="https://wago.io/motecheck">MotE-Checker</a> to be notified when MotE goes belly up again.</>)
          .icon(SPELLS.MASTER_OF_THE_ELEMENTS_TALENT.icon)
          .staticImportance(SUGGESTION_IMPORTANCE.MAJOR);
      });
  }

  statistic() {
    let value = `${formatPercentage(this.damagePercent)} %`;
    let label = `Contributed ${formatNumber(this.damagePerSecond)} DPS (${formatNumber(this.damageGained)} total damage, excluding EQ).`;
    if (this.isBugged) {
      value = `BUGGED`;
      label = `Master Of The Elements can bug out and not work sometimes. Check the Suggestions for more information.`;
    }
    return (
      <StatisticBox
        position={STATISTIC_ORDER.OPTIONAL()}
        icon={<SpellIcon id={SPELLS.MASTER_OF_THE_ELEMENTS_TALENT.id} />}
        value={value}
        label={label}
      >
        <table className="table table-condensed">
          <thead>
            <tr>
              <th>Ability</th>
              <th>Number of Buffed Casts</th>
            </tr>
          </thead>
          <tbody>
            {Object.keys(this.moteBuffedAbilities).map((e) => (
              <tr key={e}>
                <th><SpellLink id={Number(e)} /></th>
                <td>{this.moteBuffedAbilities[e]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </StatisticBox>
    );
  }
}

export default MasterOfTheElements;
