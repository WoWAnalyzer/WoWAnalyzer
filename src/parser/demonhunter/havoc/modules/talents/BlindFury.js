import React from 'react';
import SPELLS from 'common/SPELLS';
import TalentStatisticBox from 'interface/others/TalentStatisticBox';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import Events from 'parser/core/Events';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';

/**
 * Example Report: https://www.warcraftlogs.com/reports/GdDhNAZgp2X3PbVC#fight=31&type=summary&source=10
 */
const MAX_FURY = 120;
class BlindFury extends Analyzer{

  gained = 0;
  badCast = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.BLIND_FURY_TALENT.id);
    if (!this.active) {
      return;
    }
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.EYE_BEAM), this.onEyeBeamsCast);
  }

  onEyeBeamsCast(event) {
    this.gained += (MAX_FURY - (event.classResources[0].amount - event.classResources[0].cost));
    if(event.classResources[0].amount >= 50 ){
      this.badCast += 1;
    }
  }

  get furyPerMin() {
    return (this.gained / (this.owner.fightDuration/60000)).toFixed(2);
  }

  get suggestionThresholds() {
    return {
      actual: this.badCast,
      isGreaterThan: {
        minor: 0,
        average: 0,
        major: 1,
      },
      style: 'number',
    };
  }

  suggestions(when) {
    when(this.suggestionThresholds)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<>Try to cast <SpellLink id={SPELLS.EYE_BEAM.id} /> at 30 to 50 fury. Having more than 50 fury at cast leads to to much fury wasted and a dps loss.</>)
          .icon(SPELLS.BLIND_FURY_TALENT.icon)
          .actual(`${actual} bad casts`)
          .recommended(`${formatPercentage(recommended)}% is recommended.`);
      });
  }


  statistic(){
    return (
      <TalentStatisticBox
        talent={SPELLS.BLIND_FURY_TALENT.id}
        position={STATISTIC_ORDER.OPTIONAL(6)}
        value={`${this.furyPerMin} fury per min`}
        tooltip={`Since this will always max out your fury on cast, wasted and totals do not matter. Only the amount effectively gained. <br />
                  A bad cast is when you cast Eye Beam with more than 50 fury. At that point you are wasting enough fury gained for it to be a dps loss. <br /><br />
                  ${this.gained} Effective fury gained<br />
                  ${this.badCast} Bad casts
        `}
      />
    );
  }
}
export default BlindFury;
