import React from 'react';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import SpellIcon from 'common/SpellIcon';
import Icon from 'common/Icon';
import { formatPercentage, formatNumber, formatThousands } from 'common/format';
import StatisticBox, { STATISTIC_ORDER } from 'interface/others/StatisticBox';
import Analyzer from 'parser/core/Analyzer';
import DamageValue from 'parser/shared/modules/DamageValue';

class Waterbolt extends Analyzer {
  
  constructor(...args) {
    super(...args);
    this.active = !this.selectedCombatant.hasTalent(SPELLS.LONELY_WINTER_TALENT.id);
  }

  get suggestionThresholds() {
    return {
      actual: this.activeTimePercentage,
      isLessThan: {
        minor: 0.95,
        average: 0.75,
        major: 0.50,
      },
      style: 'percentage',
    };
  }
  
  get downtimePercentage() {
    return 1 - this.activeTimePercentage;
  }

  get activeTimePercentage() {
    return this.activeTime / this.owner.fightDuration;
  }

  _waterboltsCancelled = 0;
  _waterboltsCastStarts = 0;
  _waterboltHits = 0;
  wasCastStarted;
  activeTime = 0;
  _lastCastTimestamp = 0;
  beginCastSpell = 0;
  _timestampLastFinish = 0;
  _timestampLastCast = 0;

  _byPet = {};
  byPet(petId) {
    if (!this._byPet[petId]) {
      return new DamageValue();
    }
    return this._byPet[petId];
  }

  get totalByPets() {
    return Object.keys(this._byPet)
      .map(petId => this._byPet[petId])
      .reduce((total, damageValue) => total.add(damageValue.regular, damageValue.absorbed, damageValue.blocked, damageValue.overkill), new DamageValue());
  }

  on_byPlayerPet_damage(event) {
    if (!event.targetIsFriendly) {
      const petId = event.sourceID;
      this._byPet[petId] = this.byPet(petId).add(event.amount, event.absorbed, event.blocked, event.overkill);
      if(event.ability.guid === SPELLS.WATERBOLT.id) {
        this._waterboltHits += 1;
      }
    }
  }

  on_byPlayerPet_cast(event) {
    if (event.ability.guid === SPELLS.WATERBOLT.id) {
      this._lastCastTimestamp = event.timestamp;
      
      if (this.beginCastSpell.guid !== event.ability.guid && this.wasCastStarted) {
        this._waterboltsCancelled += 1;
      }
      else {
        this._waterboltsCastStarts += 1;
        this._timestampLastFinish = event.timestamp;
        if (this._timestampLastCast === 0) {
          //in case casting was started before going infight
          this._timestampLastCast = this.owner.fight.start_time;
        }
        this.activeTime += this._timestampLastFinish - this._timestampLastCast;
      }
      this.wasCastStarted = false;
    }
  }

  get totalCasts() {
    return this._waterboltsCancelled + this._waterboltsCastStarts;
  }

  on_byPlayerPet_begincast(event) {
    if (event.ability.guid === SPELLS.WATERBOLT.id) {
      if (this.wasCastStarted) {
        this._waterboltsCancelled += 1;
      }
    }
    this.beginCastSpell = event.ability;
    this.wasCastStarted = true;
    this._timestampLastCast = event.timestamp;
  }


  suggestions(when) {
		when(this.suggestionThresholds)
			.addSuggestion((suggest, actual, recommended) => {
				return suggest(<>Your <SpellLink id={SPELLS.SUMMON_WATER_ELEMENTAL.id} /> was up and casting for {formatPercentage(this.activeTimePercentage)}% of the fight. 
                      Ensure you have your Water Elemental summoned, in range and try to keep downtime from movement low.</>)
					.icon(SPELLS.SUMMON_WATER_ELEMENTAL.icon)
					.actual(`${formatPercentage(this.activeTimePercentage)}% Uptime`)
					.recommended(`${formatPercentage(recommended)}% is recommended`);
			});
	}

	statistic() {
    return (
			<StatisticBox
  position={STATISTIC_ORDER.CORE(15)}
  icon={<SpellIcon id={SPELLS.SUMMON_WATER_ELEMENTAL.id} />}
  value={(
    <span>
      <Icon
        icon="spell_mage_altertime"
        style={{
          height: '1.2em',
          marginBottom: '.15em',
        }}
       />
      {' '}{formatPercentage(this.activeTimePercentage)}{' %'}
      <br />
      <SpellIcon
        id={SPELLS.WATERBOLT.id}
        style={{
          height: '1.2em',
          marginBottom: '.15em',
        }}
      />
  {' '}{formatNumber(this.totalByPets.effective / (this.owner.fightDuration / 1000))}{' DPS'}
    </span>
  )}
  label="Water Elemental Utilization"
  tooltip={`Water Elemental was casting for ${formatPercentage(this.activeTimePercentage)} % of the fight (Downtime: ${formatPercentage(this.downtimePercentage)} %).<br>
  Your Water Elemental began casting ${this.totalCasts} times.<br>
  <ul>
    <li>${this._waterboltHits} casts dealt a total damage of ${formatThousands(this.totalByPets.effective)}.</li>
    <li>${this._waterboltsCancelled} casts were cancelled.</li>
    <li>${this.totalCasts - this._waterboltsCancelled - this._waterboltHits} did not hit a target in time.</li>
  </ul>
    `}
			/>
		);
	}
}

export default Waterbolt;
