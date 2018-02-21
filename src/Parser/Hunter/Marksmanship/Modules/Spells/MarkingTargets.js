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
 */
class MarkingTargets extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  overwrittenProcs = 0;
  _totalPossible = 0;
  usedProcs = 0;
  huntersMarkActive = false;
  huntersMarksOverriden = 0;

  on_toPlayer_applybuff(event) {
    const spellID = event.ability.guid;
    if (spellID !== SPELLS.MARKING_TARGETS.id) {
      return;
    }

    this._totalPossible++;
  }

  on_toPlayer_refreshbuff(event) {
    const spellID = event.ability.guid;
    if (spellID !== SPELLS.MARKING_TARGETS.id) {
      return;
    }
    this.overwrittenProcs++;
    this._totalPossible++;
  }

  on_byPlayer_cast(event) {
    const spellID = event.ability.guid;
    if (spellID !== SPELLS.ARCANE_SHOT.id && spellID !== SPELLS.SIDEWINDERS_CAST.id && spellID !== SPELLS.MULTISHOT.id) {
      return;
    }
    if (this.combatants.selected.hasBuff(SPELLS.MARKING_TARGETS.id)) {
      return;
    }
    this.usedProcs++;
  }

  on_byPlayer_applydebuff(event) {
    const spellID = event.ability.guid;
    if (spellID !== SPELLS.HUNTERS_MARK_DEBUFF.id) {
      return;
    }
    this.huntersMarkActive = true;
  }

  on_byPlayer_removedebuff(event) {
    const spellID = event.ability.guid;
    if (spellID !== SPELLS.HUNTERS_MARK_DEBUFF.id) {
      return;
    }
    this.huntersMarkActive = false;
  }

  on_byPlayer_refreshdebuff(event) {
    const spellID = event.ability.guid;
    if (spellID !== SPELLS.HUNTERS_MARK_DEBUFF.id) {
      return;
    }
    this.huntersMarksOverriden++;
  }

  statistic() {
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
            {'  '}
            {this.huntersMarksOverriden}{' '}
            <SpellIcon
              id={SPELLS.HUNTERS_MARK_DEBUFF.id}
              style={{
                height: '1.3em',
                marginTop: '-.1em',
              }}
            />
          </Wrapper>
        )}
        label="Marking Targets info"
        tooltip={`Information regarding your average Trueshot window:
        <ul>
          <li>You started your Trueshot windows with an average of ${this.averageFocus} focus.</li>
          <li> You hit an average of ${this.averageAimedShots} Aimed Shots inside each Trueshot window. </li>
          <li> Your Trueshot Aimed Shots had a crit rate of ${this.percentAimedCrits}%. </li>
          <li>Your overall crit rate during Trueshot was ${this.percentCastCrits}%. </li>
          <li>You spent an average of ${this.uptimePerCast} seconds in trueshot per cast of Trueshot.</li>
        </ul>`} />
    );
  }
}

export default MarkingTargets;
