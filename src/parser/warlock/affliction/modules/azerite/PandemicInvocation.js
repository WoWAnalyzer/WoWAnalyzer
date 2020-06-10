import React from 'react';

import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import { encodeTargetString } from 'parser/shared/modules/EnemyInstances';
import Events from 'parser/core/Events';

import SPELLS from 'common/SPELLS';
import { formatPercentage, formatThousands, formatNumber } from 'common/format';

import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import AzeritePowerStatistic from 'interface/statistics/AzeritePowerStatistic';
import { findMax, binomialPMF } from 'parser/shared/modules/helpers/Probability';

import { getDotDurations } from '../../constants';
import SoulShardTracker from '../soulshards/SoulShardTracker';

const PROC_CHANCE = 0.0666;
const PROC_WINDOW = 5000;
const PANDEMIC_WINDOW = 0.3;
const PANDEMIC_DOTS = [
  SPELLS.AGONY,
  SPELLS.CORRUPTION_DEBUFF,
  SPELLS.SIPHON_LIFE_TALENT,
];

class PandemicInvocation extends Analyzer {
  static dependencies = {
    soulShardTracker: SoulShardTracker,
  };
  _dotDurations = {};
  _dots = {
    /*
    [target string]: {
      [dot id]: {
        start: number,
        end: number,
      },
    },
     */
  };
  damage = 0;
  opportunities = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrait(SPELLS.PANDEMIC_INVOCATION.id);
    if (!this.active) {
      return;
    }

    this._dotDurations = getDotDurations(this.selectedCombatant.hasTalent(SPELLS.CREEPING_DEATH_TALENT.id));
    const hasAC = this.selectedCombatant.hasTalent(SPELLS.ABSOLUTE_CORRUPTION_TALENT.id);
    if (hasAC) {
      // remove Corruption from the array if player has Absolute Corruption
      // this way it doesn't set up the listener (because with the talent, the debuff is permanent so it can't be refreshed with < 5 sec)
      PANDEMIC_DOTS.splice(1, 1);
    }

    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(PANDEMIC_DOTS), this.onDotCast);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.PANDEMIC_INVOCATION_DAMAGE), this.onPandemicInvocationDamage);
  }

  onDotCast(event) {
    const target = encodeTargetString(event.targetID, event.targetInstance);
    const spellId = event.ability.guid;
    this._dots[target] = this._dots[target] || {};
    const dot = this._dots[target][spellId];

    if (dot && event.timestamp < dot.end) {
      // dot refresh, pandemic handling, proc handling
      const remainingDuration = dot.end - event.timestamp;
      if (remainingDuration < PROC_WINDOW) {
        this.opportunities += 1;
      }
      const maxDuration = (1 + PANDEMIC_WINDOW) * this._dotDurations[spellId];
      const newDuration = remainingDuration + this._dotDurations[spellId];
      const resultDuration = Math.min(newDuration, maxDuration);

      this._dots[target][spellId] = {
        start: event.timestamp,
        end: event.timestamp + resultDuration,
      };
    } else {
      // new dot application
      this._dots[target][spellId] = {
        start: event.timestamp,
        end: event.timestamp + this._dotDurations[spellId],
      };
    }
  }

  onPandemicInvocationDamage(event) {
    this.damage += event.amount + (event.absorbed || 0);
  }

  get dps() {
    return this.damage / this.owner.fightDuration * 1000;
  }

  statistic() {
    const generated = this.soulShardTracker.getGeneratedBySpell(SPELLS.PANDEMIC_INVOCATION_ENERGIZE.id);
    const wasted = this.soulShardTracker.getWastedBySpell(SPELLS.PANDEMIC_INVOCATION_ENERGIZE.id);
    const { max } = findMax(this.opportunities, (k, n) => binomialPMF(k, n, PROC_CHANCE));
    return (
      <AzeritePowerStatistic
        size="small"
        tooltip={(
          <>
            Pandemic Invocation damage: {formatThousands(this.damage)}<br />
            You gained {generated} Soul Shards and wasted {wasted} Soul Shards with this trait,
            {max > 0 ? <>which is <strong>{formatPercentage(generated / max)}%</strong> of Shards you were most likely to get in this fight ({max} Shards).</> : 'while you were most likely to not get any Shards.'}
          </>
        )}
      >
        <BoringSpellValueText spell={SPELLS.PANDEMIC_INVOCATION}>
          {formatNumber(this.dps)} DPS <small>{formatPercentage(this.owner.getPercentageOfTotalDamageDone(this.damage))} % of total</small>
        </BoringSpellValueText>
      </AzeritePowerStatistic>
    );
  }
}

export default PandemicInvocation;
