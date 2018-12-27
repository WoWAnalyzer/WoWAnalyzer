import React from 'react';

import Events from 'parser/core/Events';
import { encodeTargetString } from 'parser/shared/modules/EnemyInstances';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';

import SPELLS from 'common/SPELLS';
import { formatThousands } from 'common/format';
import SpellLink from 'common/SpellLink';

import StatisticListBoxItem from 'interface/others/StatisticListBoxItem';

import { getDotDurations, UNSTABLE_AFFLICTION_DEBUFFS } from '../../constants';

const PANDEMIC_WINDOW = 0.3;
const DOT_DEBUFFS = [
  SPELLS.AGONY,
  SPELLS.CORRUPTION_DEBUFF,
  SPELLS.SIPHON_LIFE_TALENT,
  ...UNSTABLE_AFFLICTION_DEBUFFS,
  SPELLS.PHANTOM_SINGULARITY_TALENT,
];
const PANDEMIC_DOTS = [
  SPELLS.AGONY.id,
  SPELLS.CORRUPTION_DEBUFF.id,
  SPELLS.SIPHON_LIFE_TALENT.id,
];

class Deathbolt extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
  };

  _hasAC = false;
  _dotDurations = {};
  // track application of dots on targets so we know their remaining duration when Deathbolt is cast
  _dots = {
    /*
    [target string]: {
      [dot id]: {
        start: number,
        end: number,
      }
     */
  };

  remainingDotDurations = {
    /*
    [dot id]: [number]
     */
  };

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.DEATHBOLT_TALENT.id);
    this._dotDurations = getDotDurations(this.selectedCombatant.hasTalent(SPELLS.CREEPING_DEATH_TALENT.id));
    this._hasAC = this.selectedCombatant.hasTalent(SPELLS.ABSOLUTE_CORRUPTION_TALENT.id);
    if (this._hasAC) {
      this._dotDurations[SPELLS.CORRUPTION_DEBUFF.id] = Infinity;
    }

    this.addEventListener(Events.applydebuff.by(SELECTED_PLAYER).spell(DOT_DEBUFFS), this.onDotApply);
    this.addEventListener(Events.refreshdebuff.by(SELECTED_PLAYER).spell(DOT_DEBUFFS), this.onDotApply);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.DEATHBOLT_TALENT), this.onDeathboltCast);
  }

  onDotApply(event) {
    const target = encodeTargetString(event.targetID, event.targetInstance);
    const spellId = event.ability.guid;
    this._dots[target] = this._dots[target] || {};
    const dot = this._dots[target][spellId];

    if (dot && event.timestamp < dot.end && PANDEMIC_DOTS.includes(spellId)) {
      // ignore Corruption if player has Absolute Corruption
      if (spellId === SPELLS.CORRUPTION_DEBUFF.id && this._hasAC) {
        return;
      }
      // refresh of the dot, check for pandemic
      const remainingDuration = dot.end - event.timestamp;
      const maxDuration = (1 + PANDEMIC_WINDOW) * this._dotDurations[spellId];
      const newDuration = remainingDuration + this._dotDurations[spellId];
      const resultDuration = Math.min(newDuration, maxDuration);

      this._dots[target][spellId] = {
        start: event.timestamp,
        end: event.timestamp + resultDuration,
      };
    } else {
      // new application
      this._dots[target][spellId] = {
        start: event.timestamp,
        end: event.timestamp + this._dotDurations[spellId],
      };
    }
  }

  onDeathboltCast(event) {
    const timestamp = event.timestamp;
    const target = encodeTargetString(event.targetID, event.targetInstance);

    // get currently active dots on target from this._dots, add their remaining duration to the remainingDotDurations arrays
    // ignore Corruption if player has Absolute Corruption
    Object.entries(this._dots[target]).forEach(([dotId, dotInfo]) => {
      if (Number(dotId) === SPELLS.CORRUPTION_DEBUFF.id && this._hasAC) {
        return;
      }
      if (timestamp > dotInfo.end) {
        return;
      }
      let id = dotId;
      if (UNSTABLE_AFFLICTION_DEBUFFS.some(spell => spell.id === Number(dotId))) {
        // group Unstable Affliction debuffs into one entry
        id = SPELLS.UNSTABLE_AFFLICTION_CAST.id;
      }
      this.remainingDotDurations[id] = this.remainingDotDurations[id] || [];
      this.remainingDotDurations[id].push(dotInfo.end - timestamp);
    });
  }

  get averageRemainingDotLengths() {
    const result = {};
    const allDurations = [];
    Object.entries(this.remainingDotDurations).forEach(([dotId, durations]) => {
      result[dotId] = (durations.reduce((total, current) => total + current, 0) / durations.length) || 0;
      allDurations.push(...durations);
    });
    result.total = (allDurations.reduce((total, current) => total + current, 0) / allDurations.length) || 0;
    return result;
  }

  subStatistic() {
    const deathbolt = this.abilityTracker.getAbility(SPELLS.DEATHBOLT_TALENT.id);
    const total = deathbolt.damageEffective || 0;
    const avg = total / (deathbolt.casts || 1);

    const avgDotLengths = this.averageRemainingDotLengths;
    let tooltip = 'Average remaining DoT durations on Deathbolt cast:<br /><br />';
    Object.entries(avgDotLengths).forEach(([key, value]) => {
      if (key === 'total') {
        return;
      }
      tooltip += `${SPELLS[key].name}: ${(value / 1000).toFixed(2)} seconds<br />`;
    });

    return (
      <>
        <StatisticListBoxItem
          title={<>Average <SpellLink id={SPELLS.DEATHBOLT_TALENT.id} /> damage</>}
          value={formatThousands(avg)}
          valueTooltip={`Total damage done with Deathbolt: ${formatThousands(total)} (${this.owner.formatItemDamageDone(total)})`}
        />
        <StatisticListBoxItem
          title={<>Average DoT length on <SpellLink id={SPELLS.DEATHBOLT_TALENT.id} /> cast</>}
          value={`${(avgDotLengths.total / 1000).toFixed(2)} s`}
          valueTooltip={tooltip}
        />
      </>
    );
  }
}

export default Deathbolt;
