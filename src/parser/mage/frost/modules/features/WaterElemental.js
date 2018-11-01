import React from 'react';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import SpellIcon from 'common/SpellIcon';
import Icon from 'common/Icon';
import { formatPercentage, formatNumber, formatThousands, formatDuration } from 'common/format';
import StatisticBox, { STATISTIC_ORDER } from 'interface/others/StatisticBox';
import Analyzer from 'parser/core/Analyzer';
import DamageValue from 'parser/shared/modules/DamageValue';

import GlobalCooldown from 'parser/shared/modules/GlobalCooldown';
import Abilities from 'parser/shared/modules/Abilities';
import Channeling from 'parser/shared/modules/Channeling';
import Haste from 'parser/shared/modules/Haste';

class WaterElemental extends Analyzer {
  static dependencies = {
    haste: Haste,
    abilities: Abilities,
    globalCooldown: GlobalCooldown, // triggers the globalcooldown event
    channeling: Channeling, // triggers the channeling-related events
  };
  
  constructor(...args) {
    super(...args);
    this.active = !this.selectedCombatant.hasTalent(SPELLS.LONELY_WINTER_TALENT.id);
  }
  
  _waterboltsCancelled = 0;
  _waterboltsCastStarts = 0;
  _waterboltHits = 0;
  wasCastStarted;
  petActiveTime = 0;
  beginCastSpell = 0;
  _timestampLastFinish = 0;
  _timestampLastCast = 0;
  _timestampFirstCast = 0;
  _byPet = {};
  
  on_byPlayerPet_begincast(event) {
    if (event.ability.guid === SPELLS.WATERBOLT.id) {
      if (this.wasCastStarted) {
        this._waterboltsCancelled += 1;
      }
      if (this._waterboltHits === 0 && this._timestampFirstCast === 0) {
        this._timestampFirstCast = event.timestamp;
      }
      this.beginCastSpell = event.ability;
      this.wasCastStarted = true;
      this._timestampLastCast = event.timestamp;
    }
  }
  
  on_byPlayerPet_cast(event) {
    if (event.ability.guid !== SPELLS.WATERBOLT.id) {
      return;
    }
    else {
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
        if (this._waterboltHits === 0 && this._timestampFirstCast === 0) {
          this._timestampFirstCast = event.timestamp;
        }
        this.petActiveTime += this._timestampLastFinish - this._timestampLastCast;
      }
      this.wasCastStarted = false;
    }
  }
  
  on_byPlayerPet_damage(event) {
    if (event.ability.guid !== SPELLS.WATERBOLT.id) {
      return;
    }
    else if (!event.targetIsFriendly) {
      const petId = event.sourceID;
      this._byPet[petId] = this.byPet(petId).add(event.amount, event.absorbed, event.blocked, event.overkill);
      if (event.ability.guid === SPELLS.WATERBOLT.id) {
        if (this._waterboltHits === 0 && this._timestampFirstCast === 0) {
          this._timestampFirstCast = event.timestamp;
        }
        this._waterboltHits += 1;
      }
    }
  }

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
  
  // Next lines are copied from AlwaysBeCasting.js, to get downtime from player
  get playerActiveTimePercentage() {
    return this.playerActiveTime / this.owner.fightDuration;
  }
  
  playerActiveTime = 0;
  _lastGlobalCooldownDuration = 0;
  on_globalcooldown(event) {
    this._lastGlobalCooldownDuration = event.duration;
    if (event.trigger.type === 'beginchannel') {
      // Only add active time for this channel, we do this when the channel is finished and use the highest of the GCD and channel time
      return false;
    }
    this.playerActiveTime += event.duration;
    return true;
  }
  on_endchannel(event) {
    // If the channel was shorter than the GCD then use the GCD as active time
    let amount = event.duration;
    if (this.globalCooldown.isOnGlobalCooldown(event.ability.guid)) {
      amount = Math.max(amount, this._lastGlobalCooldownDuration);
    }
    this.playerActiveTime += amount;
    return true;
  }
  // end of AlwaysBeCasting.js copy
  
  
  get petDowntimePercentage() {
    return 1 - this.petActiveTimePercentage;
  }
  
  get petActiveTimePercentage() {
    return this.petActiveTime / this.owner.fightDuration;
  }
  
  get prepullSummonCheck() {
    return this._timestampFirstCast - this.owner.fight.start_time;
  }
  
  get petTotalCasts() {
    return this._waterboltsCancelled + this._waterboltsCastStarts;
  }
  
  
  //checks for difference between player and pet uptime
  get suggestionThresholds() {
    return {
      actual: this.petActiveTimePercentage,
      isLessThan: {
        minor: this.playerActiveTimePercentage - 0.10, // eg. player has 83% so the pet can have 73%
        average: this.playerActiveTimePercentage - 0.25,
        major: this.playerActiveTimePercentage -0.30,
      },
      style: 'percentage',
    };
  }

  //checks for the time between pull and first action (begin cast/cast/damage) from pet
  get prePullSuggestionThresholds() { 
    return {
      actual: this.prepullSummonCheck,
      isLessThan: {
        minor: 100,
        average: 7500, // 100ms - 7.5 seconds after pull should give the pet time for mythrax-like pulls
        major: 10000, // everything after 10 seconds
      },
      style: 'number',
    };
  }
  
  suggestions(when) {
    when(this.suggestionThresholds)
    .addSuggestion((suggest, actual, recommended) => {
      return suggest(<>
                      Your <SpellLink id={SPELLS.SUMMON_WATER_ELEMENTAL.id} /> uptime can be improved.
                      The uptime of your Water Elemental should more or less mirror your own uptime, more is better.
                      Ensure you have your Water Elemental summoned pre-pull, in range of the target and try to keep downtime from movement low.
                      </>)
          .icon(SPELLS.SUMMON_WATER_ELEMENTAL.icon)
          .actual(`${formatPercentage(this.petActiveTimePercentage)}% uptime`)
          .recommended(`Mirroring your own uptime (in this fight: ${formatPercentage(this.playerActiveTimePercentage)}%) or more is recommended`);
      });
    when(this.prePullSuggestionThresholds)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<>
                      Your Water Elemental should be able to cast Waterbolt right when the fight starts. Therefore, cast <SpellLink id={SPELLS.SUMMON_WATER_ELEMENTAL.id} /> before the fight.
                      </>)
          .icon(SPELLS.WATERBOLT.icon)
          .actual(`${(this._timestampFirstCast === 0 ? 'Never attacked' : 'First attack: ' + formatDuration((this._timestampFirstCast - this.owner.fight.start_time)/1000) + ' into the fight')}`)
          .recommended(`Summoning pre-fight is recommended`);
    });
  }

  statistic() {
    return (
      <StatisticBox
        position={STATISTIC_ORDER.CORE(15)}
        icon={<SpellIcon id={SPELLS.SUMMON_WATER_ELEMENTAL.id} />}
        value={(
          <>
            <Icon
              icon="spell_mage_altertime"
              style={{
                height: '1.2em',
                marginBottom: '.15em',
              }}
            />
            {`${formatPercentage(this.petActiveTimePercentage)} %`}
            <br />
            <SpellIcon
              id={SPELLS.WATERBOLT.id}
              style={{
                height: '1.2em',
                marginBottom: '.15em',
              }}
            />
            {`${formatNumber(this.totalByPets.effective / (this.owner.fightDuration / 1000))} DPS`}
          </>
        )}
        label="Water Elemental utilization"
        tooltip={`Water Elemental was casting for ${formatPercentage(this.petActiveTimePercentage)} % of the fight (Downtime: ${formatPercentage(this.petDowntimePercentage)} %).<br>
                Your Water Elemental began casting ${this.petTotalCasts} times.<br>
                <ul>
                  <li>${this._waterboltHits} casts dealt a total damage of ${formatThousands(this.totalByPets.effective)}.</li>
                  <li>${this._waterboltsCancelled} casts were cancelled.</li>
                  <li>${this.petTotalCasts - this._waterboltsCancelled - this._waterboltHits} did not hit a target in time.</li>
                </ul>
    `}
      />
    );
  }
}

export default WaterElemental;
