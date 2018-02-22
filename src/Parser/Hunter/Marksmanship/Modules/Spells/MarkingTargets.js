import React from 'react';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import SPELLS from 'common/SPELLS';
import Wrapper from 'common/Wrapper';
import StatisticBox from 'Main/StatisticBox';
import SpellIcon from 'common/SpellIcon';

/*
 * Your next Sidewinders, Arcane Shot or Multi-Shot will apply Hunter's Mark.
 * Hunter's Mark activates Marked Shot.
 *
 * Note: Trueshot causes Sidewinders, Arcane Shot and Multi-Shot to always apply Hunter's Mark.
 */

const MS_BUFFER = 500;

const MARKING_TARGETS_DURATION = 15000;

class MarkingTargets extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };
//event.ability && [185365, 223138].includes(event.ability.guid)
  overwrittenProcs = 0;
  _totalPossible = 0;
  usedProcs = 0;
  huntersMarkActiveCasts = 0;
  castTimeStamp = 0;
  specificCast = 0;
  totalHuntersMarkWasted = 0;
  trueshotHuntersMarkWasted = 0;
  lastTrueshotRefresh = 0;
  trueshotRefreshCasts = 0;
  trueshotApplication = 0;
  firstTrueshotCastChecked = false;
  expiredBuffs = 0;

  buffApplication = 0;

  wastedApplications = {};

  on_toPlayer_applybuff(event) {
    const spellID = event.ability.guid;
    if (spellID === SPELLS.TRUESHOT.id) {
      this.trueshotApplication = event.timestamp;
    }
    if (spellID !== SPELLS.MARKING_TARGETS.id || this.combatants.selected.hasBuff(SPELLS.TRUESHOT.id)) {
      return;
    }
    this.buffApplication = event.timestamp;
    this._totalPossible++;
  }

  on_toPlayer_refreshbuff(event) {
    const spellID = event.ability.guid;
    if (spellID !== SPELLS.MARKING_TARGETS.id || this.combatants.selected.hasBuff(SPELLS.TRUESHOT.id)) {
      return;
    }
    this.overwrittenProcs++;
    this._totalPossible++;
    this.buffApplication = event.timestamp;
  }

  on_toPlayer_removebuff(event) {
    const spellID = event.ability.guid;
    if (spellID !== SPELLS.MARKING_TARGETS.id || this.combatants.selected.hasBuff(SPELLS.TRUESHOT.id)) {
      return;
    }
    if (event.timestamp >= this.buffApplication + MARKING_TARGETS_DURATION) {
      this.expiredBuffs++;
    }
    this.buffApplication = null;
  }

  on_byPlayer_cast(event) {
    const spellID = event.ability.guid;
    if (spellID !== SPELLS.ARCANE_SHOT.id && spellID !== SPELLS.SIDEWINDERS_TALENT.id && spellID !== SPELLS.MULTISHOT.id) {
      return;
    }
    if (this.combatants.selected.hasBuff(SPELLS.TRUESHOT.id)) {
      if (this.buffApplication) {
        this._totalPossible--;
        this.buffApplication = null;
      } else if (this.buffApplicationRefresh) {
        this.overwrittenProcs--;
        this._totalPossible--;
        this.buffApplicationRefresh = null;
      }
      return;
    }
    if (!this.combatants.selected.hasBuff(SPELLS.MARKING_TARGETS.id)) {
      return;
    }
    this.specificCast = event.ability;
    this.castTimeStamp = event.timestamp;
    this.usedProcs++;

  }

  on_byPlayer_refreshdebuff(event) {
    const spellID = event.ability.guid;
    if (spellID !== SPELLS.HUNTERS_MARK_DEBUFF.id) {
      return;
    }
    if (this.combatants.selected.hasBuff(SPELLS.TRUESHOT.id)) {
      this.trueshotHuntersMarkWasted++; //counts any while under the effects of Trueshot
      if (event.timestamp > this.lastTrueshotRefresh + MS_BUFFER) {
        this.trueshotRefreshCasts++;
      }
      this.lastTrueshotRefresh = event.timestamp;
      return;
    }
    //counts AoE wasted applications (outside of trueshot)
    this.totalHuntersMarkWasted++;
    //counting only once per cast
    if (this.specificCast) {
      this.huntersMarkActiveCasts++;
      this.addWastedApplication(this.specificCast);
      this.specificCast = null;
    }
  }
  addWastedApplication(event) {
    if (!this.wastedApplications[event.guid]) {
      this.wastedApplications[event.guid] = {
        'spellName': event.name,
        'amount': 1,
      };
    } else {
      this.wastedApplications[event.guid].amount += 1;
    }
  }

  statistic() {
    const applicators = Object.keys(this.wastedApplications).map(wastedApplication =>
      `<li>
        ${this.wastedApplications[wastedApplication].spellName}: ${this.wastedApplications[wastedApplication].amount} times
      </li>`
    ).join(' ');
    const applicatorTooltipText = applicators.length > 0 ? `<li>You cast the following spells while the target(s) already had Hunter's Mark applied to them: </li><ul>  ${applicators} </ul>` : ``;
    return (
      <StatisticBox icon={<SpellIcon id={SPELLS.MARKING_TARGETS.id} />}
        value={(
          <Wrapper>
            {this.usedProcs + '/' + this._totalPossible}{' '}
            <SpellIcon
              id={SPELLS.MARKING_TARGETS.id}
              style={{
                height: '1.3em',
                marginTop: '-.1em',
              }}
            />
            {this.huntersMarkActiveCasts}{' '}
            <SpellIcon
              id={SPELLS.HUNTERS_MARK_DEBUFF.id}
              style={{
                height: '1.3em',
                marginTop: '-.1em',
                filter: 'grayscale(50%)',
              }}
            />
          </Wrapper>
        )}
        label="Marking Targets info"
        tooltip={`This module ignores Trueshot, but if you have any Hunter's Mark wasted during Trueshot, it'll show in the bottom of this tooltip. <br/> You had a Marking Targets proc while you already had the buff active ${this.overwrittenProcs} ${this.overwrittenProcs > 1 ? `times` : `time`}. </br>The Marking Targets buff expired ${this.expiredBuffs} ${this.expiredBuffs > 1 ? `times` : `time`}.
        <ul>
            ${applicatorTooltipText}
          ${this.totalHuntersMarkWasted > 0 ? <li>You reapplied Hunter's Mark to a target while it was already active on the target ${this.totalHuntersMarkWasted} ${this.totalHuntersMarkWasted > 1 ? `times` : `time`}. </li> : ``}
          ${this.trueshotHuntersMarkWasted > 0 ? <li>The above ignores Trueshot, but during Trueshot you reapplied Hunter's Mark a total of ${this.trueshotHuntersMarkWasted} ${this.trueshotHuntersMarkWasted > 1 ? `times` : `time`} over ${this.trueshotRefreshCasts} ${this.trueshotRefreshCasts > 1 ? `casts` : `cast`}. </li> : ``}
        </ul>`} />
    );
  }
}

export default MarkingTargets;
