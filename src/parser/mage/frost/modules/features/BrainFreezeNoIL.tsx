import React from 'react';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import { formatNumber, formatPercentage } from 'common/format';
import Statistic from 'interface/statistics/Statistic';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, ApplyBuffEvent, RefreshBuffEvent, RemoveBuffEvent } from 'parser/core/Events';
import { PROC_BUFFER } from '../../constants';

const debug = false;

class BrainFreezeNoIL extends Analyzer {

  hasGlacialSpike: boolean;
  hasEbonbolt: boolean;

  lastFlurryTimestamp = 0;
  overwrittenProcs = 0;
  okOverwrittenProcs = 0;
  expiredProcs = 0;
  totalProcs = 0;
  flurryWithoutProc = 0;

  // Tracks whether the last brain freeze generator to be cast was Ebonbolt or Frostbolt
  wasLastGeneratorEB = false;

  constructor(options: any) {
    super(options);
    this.active = !!this.owner.builds.NO_IL.active;
    this.hasGlacialSpike = this.selectedCombatant.hasTalent(SPELLS.GLACIAL_SPIKE_TALENT.id);
    this.hasEbonbolt = this.selectedCombatant.hasTalent(SPELLS.EBONBOLT_TALENT.id);

    this.addEventListener(Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.BRAIN_FREEZE), this.onBrainFreezeApplied);
    this.addEventListener(Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.BRAIN_FREEZE), this.onBrainFreezeRefreshed);
    this.addEventListener(Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.BRAIN_FREEZE), this.onBrainFreezeRemoved);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell([SPELLS.FROSTBOLT,SPELLS.EBONBOLT_TALENT,SPELLS.FLURRY]), this.onCast);
  }

  onBrainFreezeApplied(event: ApplyBuffEvent) {
    this.totalProcs += 1;
  }

  onBrainFreezeRefreshed(event: RefreshBuffEvent) {
    this.totalProcs += 1;

    if (!this.hasGlacialSpike || this.wasLastGeneratorEB) {
      this.overwrittenProcs += 1;
      debug && this.log("Brain Freeze proc overwritten w/o GS talented or by EB");
      return;
    } else {
      this.okOverwrittenProcs += 1;
      debug && this.log("Acceptable Brain Freeze proc overwritten w/ GS talented");
    }
  }

  onCast(event: CastEvent) {
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

  onBrainFreezeRemoved(event: RemoveBuffEvent) {
    if (!this.lastFlurryTimestamp || this.lastFlurryTimestamp + PROC_BUFFER < this.owner.currentTimestamp) {
      this.expiredProcs += 1; // it looks like Brain Freeze is always removed after the cast, and always on same timestamp
      debug && this.log("Brain Freeze proc expired");
    }
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

  get brainFreezeUtilizationThresholds() {
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
  get brainFreezeOverwritenThresholds() {
    return {
      actual: (this.overwrittenProcs / this.totalProcs) || 0,
      isGreaterThan: {
        minor: 0.00,
        average: 0.05,
        major: 0.10,
      },
      style: 'percentage',
    };
  }

  // there's almost never an excuse to let BF expire
  get brainFreezeExpiredThresholds() {
    return {
      actual: (this.expiredProcs / this.totalProcs) || 0,
      isGreaterThan: {
        minor: 0.00,
        average: 0.03,
        major: 0.06,
      },
      style: 'percentage',
    };
  }

  get flurryWithoutBrainFreezeThresholds() {
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

  suggestions(when: any) {
    when(this.brainFreezeOverwritenThresholds)
      .addSuggestion((suggest: any, actual: any, recommended: any) => {
        return suggest(<>You overwrote {formatPercentage(actual)}% of your <SpellLink id={SPELLS.BRAIN_FREEZE.id} /> procs. Try to use your procs as soon as {this.hasGlacialSpike ? <><SpellLink id={SPELLS.GLACIAL_SPIKE_TALENT.id} /> is available</> : 'possible'} to avoid this. {this.hasEbonbolt ? <>Additionally, avoid casting <SpellLink id={SPELLS.EBONBOLT_TALENT.id} /> when you already have a <SpellLink id={SPELLS.BRAIN_FREEZE.id} /> proc.</> : ''}</>)
          .icon(SPELLS.BRAIN_FREEZE.icon)
          .actual(`${formatPercentage(actual)}% overwritten`)
          .recommended(`Overwriting none is recommended`);
      });

    when(this.brainFreezeExpiredThresholds)
      .addSuggestion((suggest: any, actual: any, recommended: any) => {
        return suggest(<>You allowed {formatPercentage(actual)}% of your <SpellLink id={SPELLS.BRAIN_FREEZE.id} /> procs to expire. Try to use your procs as soon as possible to avoid this.</>)
          .icon(SPELLS.BRAIN_FREEZE.icon)
          .actual(`${formatPercentage(actual)}% expired`)
          .recommended(`Letting none expire is recommended`);
      });

    when(this.flurryWithoutBrainFreezeThresholds)
      .addSuggestion((suggest: any, actual: any, recommended: any) => {
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
