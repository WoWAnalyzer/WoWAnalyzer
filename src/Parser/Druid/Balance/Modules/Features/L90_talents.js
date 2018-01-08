import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import { formatNumber } from 'common/format';
import Wrapper from 'common/Wrapper';

import Analyzer from 'Parser/Core/Analyzer';
import AbilityTracker from 'Parser/Core/Modules/AbilityTracker';
import Combatants from 'Parser/Core/Modules/Combatants';

import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

import AstralPowerTracker from '../ResourceTracker/AstralPowerTracker';

const SHOOTING_STARS_MULTIPLIER = 4 / 10;
const ASTRAL_COMMUNION_VALUE = 75;
const ASTRAL_COMMUNION_COOLDOWN = 80;
const BLESSING_OF_ELUNE_MULTIPLIER = 0.25;
const BLESSING_OF_ANSHE_VALUE = 2;
const BLESSING_OF_ANSHE_COOLDOWN = 3;

class L90_talents extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    abilityTracker: AbilityTracker,
    astralPowerTracker: AstralPowerTracker,
  };

  getAbility = spellId => this.abilityTracker.getAbility(spellId);
  activeTalent;
  dotTicks = 0;
  solarWrathCasts = 0;
  lunarStrikeCasts = 0;
  totalHaste = 0;
  lastHasteChangedTimestamp = 0;

  on_initialized() {
    if (this.combatants.selected.hasTalent(SPELLS.SHOOTING_STARS_TALENT.id)){
      this.activeTalent = SPELLS.SHOOTING_STARS_TALENT.id;
    }
    if (this.combatants.selected.hasTalent(SPELLS.ASTRAL_COMMUNION_TALENT.id)){
      this.activeTalent = SPELLS.ASTRAL_COMMUNION_TALENT.id;
    }
    if (this.combatants.selected.hasTalent(SPELLS.BLESSING_OF_THE_ANCIENTS_TALENT.id)){
      this.activeTalent = SPELLS.BLESSING_OF_THE_ANCIENTS_TALENT.id;
    }
  }

  on_byPlayer_damage(event) {
    if ( (event.ability.guid === SPELLS.MOONFIRE_BEAR.id || event.ability.guid === SPELLS.SUNFIRE.id ) && event.tick === true) {
      this.dotTicks++;
    }
    if (event.ability.guid === SPELLS.SOLAR_WRATH_MOONKIN.id){
      this.solarWrathCasts++;
    }
    if (event.ability.guid === SPELLS.LUNAR_STRIKE.id){
      this.lunarStrikeCasts++;
    }       
  }

  on_changehaste(event){
    if(this.lastHasteChangedTimestamp !== 0){
      this.totalHaste += (event.timestamp - this.lastHasteChangedTimestamp) * event.oldHaste;
    }
    this.lastHasteChangedTimestamp = event.timestamp;
  }

  get averageHaste(){
    return this.totalHaste / this.owner.fightDuration;
  }

  getGenerated(spellId){
    const generator = this.astralPowerTracker.buildersObj[spellId] || 0;
    if(generator){
      return generator.generated;
    }
    return 0;
  }

  getBonus(value, increase){
    if(this.activeTalent === SPELLS.BLESSING_OF_THE_ANCIENTS_TALENT.id){
      return value - (value / (1 + increase));
    }
    return value * increase;
  }

  get shootingStarsValue(){ 
    return this.dotTicks * SHOOTING_STARS_MULTIPLIER;
  }

  get astralCommunionValue(){
    return (1 + Math.floor(this.owner.fightDuration / 1000 / ASTRAL_COMMUNION_COOLDOWN)) * ASTRAL_COMMUNION_VALUE;
  }

  get BlessingOfAnsheValue(){
    return (1 + Math.floor(this.owner.fightDuration / 1000 / (BLESSING_OF_ANSHE_COOLDOWN / (1 + this.averageHaste)))) * BLESSING_OF_ANSHE_VALUE;
  }

  get BlessingOfEluneValue(){
    const generated = this.getGenerated(SPELLS.LUNAR_STRIKE.id) + this.getGenerated(SPELLS.SOLAR_WRATH_MOONKIN.id);
    return this.getBonus(generated, BLESSING_OF_ELUNE_MULTIPLIER);
  }

  statistic() {
    return (
      <StatisticBox
        alignIcon='flex-start'
        icon={<SpellIcon id={this.activeTalent} />}
        value={(
          <Wrapper>
            <SpellIcon
              id={SPELLS.SHOOTING_STARS_TALENT.id}
              style={{
                height: '1.3em',
                marginTop: '-.1em',
              }}
            />
            {' '}
            {formatNumber(this.shootingStarsValue)}
            {' '}
            <SpellIcon
              id={SPELLS.ASTRAL_COMMUNION_TALENT.id}
              style={{
                height: '1.3em',
                marginTop: '-.1em',
              }}
            />
            {' '}
            {formatNumber(this.astralCommunionValue)}
            <br />
            <SpellIcon
              id={SPELLS.BLESSING_OF_ANSHE.id}
              style={{
                height: '1.3em',
                marginTop: '-.1em',
              }}
            />
            {' '}
            {formatNumber(this.BlessingOfAnsheValue)}
            {' '}
            <SpellIcon
              id={SPELLS.BLESSING_OF_ELUNE.id}
              style={{
                height: '1.3em',
                marginTop: '-.1em',
              }}
            />
            {' '}
            {formatNumber(this.BlessingOfEluneValue)}
          </Wrapper>
        )}
        label="L90 talents potential Astral Power gains"
        tooltip={`
          This is the average amount of Astral Power that each of the talents would have given you during the encounter. Keep in mind that this does not translate directly to damage as the way the generation is distributed can affect the damage.`}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.OPTIONAL(75);
}

export default L90_talents;
