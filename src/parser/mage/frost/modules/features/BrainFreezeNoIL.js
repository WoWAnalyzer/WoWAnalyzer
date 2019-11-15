import React from 'react';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import { formatNumber, formatPercentage } from 'common/format';
import Statistic from 'interface/statistics/Statistic';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';

const debug = false;

// Brain Freeze appears to always fall after Flurry cast, but not always on same timestamp. Giving a margin here.
const PROC_WINDOW_MS = 100;

class BrainFreezeNoIL extends Analyzer {
  lastFlurryTimestamp = null;

  overwrittenProcs = 0;
  okOverwrittenProcs = 0;
  expiredProcs = 0;
  totalProcs = 0;
  flurryWithoutProc = 0;

  // Tracks whether the last brain freeze generator to be cast was Ebonbolt or Frostbolt
  wasLastGeneratorEB = false;

  constructor(...args) {
    super(...args);
    this.active = this.owner.build === 'noil';
    this.glacialSpikeTalented = this.selectedCombatant.hasTalent(SPELLS.GLACIAL_SPIKE_TALENT.id);

    this.addEventListener(Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.BRAIN_FREEZE), this.onBrainFreezeApplied);
    this.addEventListener(Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.BRAIN_FREEZE), this.onBrainFreezeRefreshed);
    this.addEventListener(Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.BRAIN_FREEZE), this.onBrainFreezeRemoved);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell([SPELLS.FROSTBOLT,SPELLS.EBONBOLT_TALENT,SPELLS.FLURRY]), this.onCast);
  }

  onBrainFreezeApplied(event) {
    this.totalProcs += 1;
  }

  onBrainFreezeRefreshed(event) {
    this.totalProcs += 1;

    if (!this.glacialSpikeTalented || this.wasLastGeneratorEB) {
      this.overwrittenProcs += 1;
      debug && this.debug("Brain Freeze proc overwritten w/o GS talented or by EB");
      return;
    } else {
      this.okOverwrittenProcs += 1;
      debug && this.debug("Acceptable Brain Freeze proc overwritten w/ GS talented");
    }
  }

  onCast(event) {
    const spellId = event.ability.guid;
    if(spellId === SPELLS.FROSTBOLT.id || spellId === SPELLS.EBONBOLT_TALENT.id) {
      this.wasLastGeneratorEB = spellId === SPELLS.EBONBOLT_TALENT.id;
    } else if (spellId === SPELLS.FLURRY.id) {
      this.lastFlurryTimestamp = this.owner.currentTimestamp;
      if (!this.selectedCombatant.hasBuff(SPELLS.BRAIN_FREEZE.id)) {
        this.flurryWithoutProc += 1;
      }
    }
  }

  onBrainFreezeRemoved(event) {
    if (!this.lastFlurryTimestamp || this.lastFlurryTimestamp + PROC_WINDOW_MS < this.owner.currentTimestamp) {
      this.expiredProcs += 1; // it looks like Brain Freeze is always removed after the cast, and always on same timestamp
      debug && this.debug("Brain Freeze proc expired");
    }
  }

  get overwrittenPercent() {
    return (this.overwrittenProcs / this.totalProcs) || 0;
  }

  get expiredPercent() {
    return (this.expiredProcs / this.totalProcs) || 0;
  }

  get wastedProcs() {
    return this.overwrittenProcs + this.expiredProcs;
  }

  get wastedPercent() {
    return (this.wastedProcs / this.totalProcs) || 0;
  }

  get usedProcs() {
    // Even though okOverwrittenProcs do not count against the player, they are not used procs
    return this.totalProcs - this.wastedProcs - this.okOverwrittenProcs;
  }

  get utilPercent() {
    return 1 - this.wastedPercent;
  }

  get utilSuggestionThresholds() {
    return {
      actual: this.utilPercent,
      isLessThan: {
        minor: 0.95,
        average: 0.90,
        major: 0.80,
      },
      style: 'percentage',
    };
  }

  // Percentages lowered from .00, .08, .16; with the addition of the forgiveness window it is almost as bad as letting BF expire when you waste a proc
  get overwriteSuggestionThresholds() {
    return {
      actual: this.overwrittenPercent,
      isGreaterThan: {
        minor: 0.00,
        average: 0.05,
        major: 0.10,
      },
      style: 'percentage',
    };
  }

  // there's almost never an excuse to let BF expire
  get expiredSuggestionThresholds() {
    return {
      actual: this.expiredPercent,
      isGreaterThan: {
        minor: 0.00,
        average: 0.03,
        major: 0.06,
      },
      style: 'percentage',
    };
  }

  get flurryWithoutProcSuggestionThresholds() {
    return {
      actual: this.flurryWithoutProc,
      isGreaterThan: {
        minor: 0,
        average: 0,
        major: 3,
      },
      style: 'number',
    };
  }

  suggestions(when) {

    when(this.overwriteSuggestionThresholds)
      .addSuggestion((suggest, actual, recommended) => {
        let suggestBuilder;
        if (!this.glacialSpikeTalented) {
          suggestBuilder = suggest(<>You overwrote {formatPercentage(this.overwrittenPercent)}% of your <SpellLink id={SPELLS.BRAIN_FREEZE.id} /> procs. Try to use your procs as soon as possible to avoid this.</>);
        }
        return suggestBuilder.icon(SPELLS.BRAIN_FREEZE.icon)
          .actual(`${formatPercentage(this.overwrittenPercent)}% overwritten`)
          .recommended(`Overwriting none is recommended`);
      });

    when(this.expiredSuggestionThresholds)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<>You allowed {formatPercentage(this.expiredPercent)}% of your <SpellLink id={SPELLS.BRAIN_FREEZE.id} /> procs to expire. Try to use your procs as soon as possible to avoid this.</>)
          .icon(SPELLS.BRAIN_FREEZE.icon)
          .actual(`${formatPercentage(this.expiredPercent)}% expired`)
          .recommended(`Letting none expire is recommended`);
      });

    when(this.flurryWithoutProcSuggestionThresholds)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<>You cast <SpellLink id={SPELLS.FLURRY.id} /> without <SpellLink id={SPELLS.BRAIN_FREEZE.id} /> {this.flurryWithoutProc} times.</>)
          .icon(SPELLS.FLURRY.icon)
          .actual(`${formatNumber(this.flurryWithoutProc)} casts`)
          .recommended(`Casting none is recommended`);
      });
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(30)}
        size="flexible"
        tooltip={(
          <>
            You got {this.totalProcs} total procs.
            <ul>
              <li>{this.usedProcs} used</li>
              <li>{this.overwrittenProcs + this.okOverwrittenProcs} overwritten{this.okOverwrittenProcs > 0 && ` (${this.okOverwrittenProcs} of which were acceptable holds for Glacial Spike)`}</li>
              <li>{this.expiredProcs} expired</li>
            </ul>
          </>
        )}
      >
        <BoringSpellValueText spell={SPELLS.BRAIN_FREEZE}>
          {`${formatPercentage(this.utilPercent, 0)}%`} <small>Proc utilization</small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default BrainFreezeNoIL;
