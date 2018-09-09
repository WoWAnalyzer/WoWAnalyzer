import React from 'react';
import { STATISTIC_ORDER } from 'Interface/Others/StatisticBox';
import StatisticBox from 'Interface/Others/StatisticBox';
import { formatNumber, formatPercentage } from 'common/format';
import SpellIcon from 'common/SpellIcon';

import SPELLS from 'common/SPELLS';

import Analyzer from 'Parser/Core/Analyzer';
import AbilityTracker from 'Parser/Core/Modules/AbilityTracker';
import HotTracker from '../Core/HotTracker';

const debug = false;

const RISING_MIST_EXTENSION = 2000;

class RisingMist extends Analyzer {
  static dependencies = {
    hotTracker: HotTracker,
    abilityTracker: AbilityTracker,
  };

  risingMistCount = 0;
  risingMists = [];

  efsExtended = 0;

  remCount = 0;
  efCount = 0;
  evmCount = 0;

  targetCount = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.RISING_MIST_TALENT.id);
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (SPELLS.RISING_SUN_KICK.id !== spellId) {
      return;
    }

    this.risingMistCount += 1;
    debug && console.log(`risingMist cast #: ${this.risingMistCount}`);

    const newRisingMist = {
      name: `RisingMist #${this.risingMistCount}`,
      healing: 0,
      procs: 0,
      duration: 0,
    };
    this.risingMists.push(newRisingMist);

    let foundEf = false;
    let foundTarget = false;

    Object.keys(this.hotTracker.hots).forEach(playerId => {
      Object.keys(this.hotTracker.hots[playerId]).forEach(spellIdString => {
        const spellId = Number(spellIdString);

        const attribution = newRisingMist;
        this.hotTracker.addExtension(attribution, RISING_MIST_EXTENSION, playerId, spellId);

        if (spellId === SPELLS.ESSENCE_FONT_BUFF.id) {
          foundEf = true;
          foundTarget = true;
          this.efCount += 1;
        } else if (spellId === SPELLS.RENEWING_MIST_HEAL.id) {
          foundTarget = true;
          this.remCount += 1;
        } else if (spellId === SPELLS.ENVELOPING_MIST.id) {
          foundTarget = true;
          this.evmCount += 1;
        }
      });
    });

    if (foundEf) {
      this.efsExtended += 1;
    }
    if (foundTarget) {
      this.targetCount += 1;
    }
  }

  get averageExtension() {
    return this.risingMistCount === 0 ? 0 : (this.risingMists.reduce((acc, risingMist) => acc + risingMist.duration, 0) / this.risingMistCount) / 1000;
  }
  get hotHealing() {
    return this.risingMists.reduce((acc, risingMist) => acc + risingMist.healing, 0);
  }

  get directHealing() {
    return this.abilityTracker.getAbility(SPELLS.RISING_MIST_HEAL.id).healingEffective;
  }
  get totalHealing() {
    return this.hotHealing + this.directHealing;
  }

  get averageHealing() {
    return this.risingMistCount === 0 ? 0 : this.totalHealing / this.risingMistCount;
  }

  get averageTargetsPerRM() {
    return this.targetCount / this.risingMistCount || 0;
  }

  statistic() {
    return (
      <StatisticBox
        position={STATISTIC_ORDER.CORE(10)}
        icon={<SpellIcon id={SPELLS.RISING_MIST_TALENT.id} />}
        value={`${formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.totalHealing))}%`}
        label="Healing Contributed"
        tooltip={
          `Your ${this.risingMistCount} Rising Sun Kick casts contributed the following healing:
          <ul>
            <li>HoT Extension Healing: ${formatNumber(this.hotHealing)}</li>
            <li>Rising Mist Direct Healing: ${formatNumber(this.directHealing)}</li>
            <li>Average HoT Extension Seconds per cast: ${this.averageExtension.toFixed(2)}</li>
            <ul>
            <li>Essense Font HoTs Extended: ${this.efCount}</li>
            <li>Renewing Mist HoTs Extended: ${this.remCount}</li>
            <li>Enveloping Mist HoTs Extended: ${this.evmCount}</li>
            </ul>
          </ul>`
        }
      />
    );
  }
}

export default RisingMist;
