import React from 'react';
import SPELLS from 'common/SPELLS';
import TalentStatisticBox from 'interface/others/TalentStatisticBox';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import Events from 'parser/core/Events';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import SpellLink from 'common/SpellLink';

/**
 * Example Report: https://www.warcraftlogs.com/reports/23dHWCrT18qhaJbz/#fight=1&source=16
 */

const META_BUFF_DURATION_EYEBEAM = 10000;

class Demonic extends Analyzer {

  get suggestionThresholds() {
    return {
      actual: this.badCasts,
      isGreaterThan: {
        minor: 0,
        average: 0,
        major: 1,
      },
      style: 'number',
    };
  }

  eyeBeamCasts = 0;
  goodDeathSweep = 0;
  eyeBeamTimeStamp = undefined;
  deathsweepsInMetaCounter = undefined;
  badCasts = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.DEMONIC_TALENT.id);
    if (!this.active) {
      return;
    }
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.EYE_BEAM), this.onEyeBeamCast);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.DEATH_SWEEP), this.onDeathSweepCast);
  }

  onEyeBeamCast(event) {
    const hasMetaBuff = this.selectedCombatant.hasBuff(SPELLS.METAMORPHOSIS_HAVOC_BUFF.id, event.timestamp - 1000);

    if (hasMetaBuff) {
      return;
    }
    this.eyeBeamCasts += 1;
    this.eyeBeamTimeStamp = event.timestamp;

    if (this.deathsweepsInMetaCounter === undefined) {
      this.deathsweepsInMetaCounter = 0;
      return;
    }

    if (this.deathsweepsInMetaCounter < 2) {
      this.badCasts += 1;
    }

    this.deathsweepsInMetaCounter = 0;
  }

  onDeathSweepCast(event) {
    if (this.eyeBeamTimeStamp !== undefined && (event.timestamp - this.eyeBeamTimeStamp) < META_BUFF_DURATION_EYEBEAM) {
      this.goodDeathSweep += 1;
      this.deathsweepsInMetaCounter += 1;
    }
  }

  suggestions(when) {
    when(this.suggestionThresholds)
      .addSuggestion((suggest, actual, recommended) => suggest(<>Try to have <SpellLink id={SPELLS.BLADE_DANCE.id} /> almost off cooldown before casting <SpellLink id={SPELLS.EYE_BEAM.id} />. This will allow for two casts of <SpellLink id={SPELLS.DEATH_SWEEP.id} /> during the <SpellLink id={SPELLS.METAMORPHOSIS_HAVOC.id} /> buff you get from the <SpellLink id={SPELLS.DEMONIC_TALENT.id} /> talent.</>)
        .icon(SPELLS.DEMONIC_TALENT.icon)
        .actual(<>{actual} time(s) during <SpellLink id={SPELLS.METAMORPHOSIS_HAVOC.id} /> <SpellLink id={SPELLS.DEATH_SWEEP.id} /> wasn't casted twice.</>)
        .recommended(`No bad casts is recommended.`));
  }

  statistic() {
    return (
      <TalentStatisticBox
        talent={SPELLS.DEMONIC_TALENT.id}
        position={STATISTIC_ORDER.OPTIONAL(6)}
        value={(
          <>
            {this.badCasts} <small>Bad casts</small><br />
          </>
        )}
        tooltip={`A bad cast is triggered when you don't do atleast 2 Death Sweep casts inside
                  the Metamorphosis window you get from Eye Beam due to the Demonic talent.`}
      />
    );
  }
}

export default Demonic;
