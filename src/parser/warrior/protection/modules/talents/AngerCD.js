import React from 'react';
import Analyzer from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import AngerManagement from './AngerManagement';

class AngerCD extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
    abilityTracker: AbilityTracker,
    angerManagement: AngerManagement,
  };

  actualFightTime = 0;
  DEMOSHOUTCD = 45000;
  AVATARCD = 90000;
  LASTSTANDCD = this.selectedCombatant.hasTalent(SPELLS.BOLSTER_TALENT.id) ? 180000 - 60000 : 180000;
  SHIELDWALLCD = 240000;

  hasAM = false;

  constructor(...args) {
    super(...args);
    this.hasAM = this.selectedCombatant.hasTalent(SPELLS.ANGER_MANAGEMENT_TALENT.id);
  }

  on_fightend(){
    if(this.hasAM){
      this.actualFightTime = (this.owner.fight.end_time - this.owner.fight.start_time) + this.angerManagement.effectiveReduction[SPELLS.DEMORALIZING_SHOUT.id] + this.angerManagement.wastedReduction[SPELLS.DEMORALIZING_SHOUT.id];
    }else{
      this.actualFightTime = (this.owner.fight.end_time - this.owner.fight.start_time);
    }
  }

  ratio(spellCD, spellid){
    const possibleCasts = Math.ceil(this.actualFightTime/spellCD) || 1;
    const actualCasts = this.abilityTracker.getAbility(spellid).casts || 0;
    return actualCasts / possibleCasts;
  }

  //KLUDGE
  get suggestionThresholdsDemoShout(){
    return {
      actual: this.ratio(this.DEMOSHOUTCD, SPELLS.DEMORALIZING_SHOUT.id),
      isLessThan: {
        minor: .90,
        average: .80,
        major: .70,
      },
      style: 'percentage',
    };
  }
  
  get suggestionThresholdsAvatar(){
    return {
      actual: this.ratio(this.AVATARCD, SPELLS.AVATAR_TALENT.id),
      isLessThan: {
        minor: .90,
        average: .80,
        major: .70,
      },
      style: 'percentage',
    };
  }

  get suggestionThresholdsLastStand(){
    return {
      actual: this.ratio(this.LASTSTANDCD, SPELLS.LAST_STAND.id),
      isLessThan: {
        minor: .80,
        average: .70,
        major: .60,
      },
      style: 'percentage',
    };
  }

  get suggestionThresholdsShieldWall(){
    return {
      actual: this.ratio(this.SHIELDWALLCD, SPELLS.SHIELD_WALL.id),
      isLessThan: {
        minor: .80,
        average: .70,
        major: .60,
      },
      style: 'percentage',
    };
  }

  suggestions(when) {

    when(this.suggestionThresholdsDemoShout).addSuggestion((suggest, actual, recommended) => {
      return suggest(
        <>
          Try to cast <SpellLink id={SPELLS.DEMORALIZING_SHOUT.id} /> more often. Cast <SpellLink id={SPELLS.DEMORALIZING_SHOUT.id} /> more liberally to maximize it's DPS boost unless you need it so survive a specific mechanic.
        </>
      )
        .icon(SPELLS.DEMORALIZING_SHOUT.icon)
        .actual(`${formatPercentage(actual)}% Demoralizing Shout`)
        .recommended(`${formatPercentage(recommended)}% casts recommended`);
    });

    when(this.suggestionThresholdsAvatar).addSuggestion((suggest, actual, recommended) => {
      return suggest(
        <>
          Try to cast <SpellLink id={SPELLS.AVATAR_TALENT.id} /> more often.
        </>
      )
        .icon(SPELLS.AVATAR_TALENT.icon)
        .actual(`${formatPercentage(actual)}% Avatar casts`)
        .recommended(`${formatPercentage(recommended)}% casts recommended`);
    });

    when(this.suggestionThresholdsLastStand).addSuggestion((suggest, actual, recommended) => {
      return suggest(
        <>
          Try to cast <SpellLink id={SPELLS.LAST_STAND.id} /> more often.
        </>
      )
        .icon(SPELLS.LAST_STAND.icon)
        .actual(`${formatPercentage(actual)}% Last Stand casts`)
        .recommended(`${formatPercentage(recommended)}% casts recommended`);
    });

    when(this.suggestionThresholdsShieldWall).addSuggestion((suggest, actual, recommended) => {
      return suggest(
        <>
          Try to cast <SpellLink id={SPELLS.SHIELD_WALL.id} /> more often.
        </>
      )
        .icon(SPELLS.SHIELD_WALL.icon)
        .actual(`${formatPercentage(actual)}% Shield Wall casts`)
        .recommended(`${formatPercentage(recommended)}% casts recommended`);
    });
  }
}

export default AngerCD;
