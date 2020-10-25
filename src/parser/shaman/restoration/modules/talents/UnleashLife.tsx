import React from 'react';

import SpellLink from 'common/SpellLink';
import SPELLS from 'common/SPELLS';
import { formatPercentage } from 'common/format';

import { STATISTIC_ORDER } from 'interface/others/StatisticsListBox';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import StatisticListBoxItem from 'interface/others/StatisticListBoxItem';
import Statistic from 'interface/statistics/Statistic';
import DonutChart from 'interface/statistics/components/DonutChart';

import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import calculateEffectiveHealing from 'parser/core/calculateEffectiveHealing';
import Events, { CastEvent, HealEvent, RemoveBuffEvent } from 'parser/core/Events';
import { Trans } from '@lingui/macro';

import CooldownThroughputTracker from '../features/CooldownThroughputTracker';

const UNLEASH_LIFE_HEALING_INCREASE = 0.35;
const BUFFER_MS = 200;
const UNLEASH_LIFE_DURATION = 10000;
const debug = false;

interface HealingBuffInfo {
  [SpellID: number]: HealingBuffHot | HealingBuff
}
interface HealingBuffHot {
  healing: number,
  castAmount: number,
  playersActive: number[]
}
interface HealingBuff {
  healing: number,
  castAmount: number
}

/**
 * Unleash Life:
 * Unleashes elemental forces of Life, healing a friendly target and increasing the effect of the Shaman's next direct heal.
 */

class UnleashLife extends Analyzer {
  static dependencies = {
    cooldownThroughputTracker: CooldownThroughputTracker,
  };

  protected cooldownThroughputTracker!: CooldownThroughputTracker;

  healing = 0;
  healingBuff: HealingBuffInfo = {
    [SPELLS.RIPTIDE.id]: {
      healing: 0,
      castAmount: 0,
      playersActive: [],
    },
    [SPELLS.CHAIN_HEAL.id]: {
      healing: 0,
      castAmount: 0,
    },
    [SPELLS.HEALING_WAVE.id]: {
      healing: 0,
      castAmount: 0,
    },
    [SPELLS.HEALING_SURGE_RESTORATION.id]: {
      healing: 0,
      castAmount: 0,
    },
  };

  unleashLifeCasts = 0;
  unleashLifeRemaining = false;
  unleashLifeHealRemaining = 0;

  buffedChainHealTimestamp: number = Number.MIN_SAFE_INTEGER;
  lastUnleashLifeTimestamp: number = Number.MAX_SAFE_INTEGER;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.UNLEASH_LIFE_TALENT.id);

    const spellFilter = [SPELLS.UNLEASH_LIFE_TALENT, SPELLS.RIPTIDE, SPELLS.CHAIN_HEAL, SPELLS.HEALING_WAVE, SPELLS.HEALING_SURGE_RESTORATION]; // TODO ADD CHAIN HARVEST
    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(spellFilter), this._onHeal);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(spellFilter), this._onCast);
    this.addEventListener(Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.RIPTIDE), this._onRiptideRemoval);
  }

  _onHeal(event: HealEvent) {
    const spellId = event.ability.guid;

    if (spellId === SPELLS.UNLEASH_LIFE_TALENT.id) {
      this.unleashLifeHealRemaining = 1;
      this.lastUnleashLifeTimestamp = event.timestamp;
      this.healing += event.amount + (event.absorbed || 0);
    }

    if (this.unleashLifeHealRemaining > 0 && (this.lastUnleashLifeTimestamp + UNLEASH_LIFE_DURATION) <= event.timestamp) {
      debug && console.log("Heal Timed out", event.timestamp);
      this.unleashLifeHealRemaining = 0;
    }

    // Riptide HoT handling, ticks on whoever its active
    if (spellId === SPELLS.RIPTIDE.id && (this.healingBuff[spellId] as HealingBuffHot).playersActive.includes(event.targetID)) {
      if (event.tick) {
        this.healingBuff[spellId].healing += calculateEffectiveHealing(event, UNLEASH_LIFE_HEALING_INCREASE);

        // Initial Riptide Heal without Unleash Life
        // casting an unbuffed Riptide on a target that already has a buffed Riptide, will completely negate the buff, so we remove that person
      } else if (!event.tick && !this.unleashLifeHealRemaining) {
        (this.healingBuff[spellId] as HealingBuffHot).playersActive.splice((this.healingBuff[spellId] as HealingBuffHot).playersActive.indexOf(event.targetID), 1);
      }
    }

    // These 3 heals only have 1 event and are handled easily
    if (this.unleashLifeHealRemaining > 0 && ((spellId === SPELLS.HEALING_WAVE.id) || (spellId === SPELLS.HEALING_SURGE_RESTORATION.id) || (spellId === SPELLS.RIPTIDE.id && !event.tick))) {
      this.healingBuff[spellId].healing += calculateEffectiveHealing(event, UNLEASH_LIFE_HEALING_INCREASE);
      this.unleashLifeHealRemaining = 0;
      debug && console.log("Heal:", spellId);

      // I had to move the HoT application to the heal event as the buffapply event had too many false positives
      if (spellId === SPELLS.RIPTIDE.id) {
        (this.healingBuff[spellId] as HealingBuffHot).playersActive.push(event.targetID);
        debug && console.log("HoT Applied:", spellId, event.targetID);
      }

      // Chain heal has up to 4 events, setting the variable to -1 to indicate that there might be more events coming
    } else if (spellId === SPELLS.CHAIN_HEAL.id && (this.unleashLifeHealRemaining > 0 || (this.unleashLifeHealRemaining < 0 && this.buffedChainHealTimestamp + BUFFER_MS > event.timestamp))) {
      this.healingBuff[spellId].healing += calculateEffectiveHealing(event, UNLEASH_LIFE_HEALING_INCREASE);
      this.unleashLifeHealRemaining = -1;
      this.buffedChainHealTimestamp = event.timestamp;
      debug && console.log("Heal:", spellId);
    }
  }


  _onCast(event: CastEvent) {
    const spellId = event.ability.guid;

    if (spellId === SPELLS.UNLEASH_LIFE_TALENT.id) {
      this.unleashLifeCasts += 1;
      this.unleashLifeRemaining = true;
      this.lastUnleashLifeTimestamp = event.timestamp;
      debug && console.log("New Unleash", event.timestamp);
    }

    if (this.unleashLifeRemaining && (this.lastUnleashLifeTimestamp + UNLEASH_LIFE_DURATION) <= event.timestamp) {
      this.unleashLifeRemaining = false;
      debug && console.log("Cast Timed out", event.timestamp);
      return;
    }

    if (this.unleashLifeRemaining) {
      if (this.healingBuff[spellId]) {
        this.healingBuff[spellId].castAmount += 1;
        this.unleashLifeRemaining = false;
        debug && console.log("Cast:", spellId);
      }
    }
  }

  _onRiptideRemoval(event: RemoveBuffEvent) {
    const spellId = event.ability.guid;
    if (!(this.healingBuff[spellId] as HealingBuffHot).playersActive.includes(event.targetID)) {
      return;
    }

    (this.healingBuff[spellId] as HealingBuffHot).playersActive.splice((this.healingBuff[spellId] as HealingBuffHot).playersActive.indexOf(event.targetID), 1);
  }

  get totalBuffedHealing() {
    return Object.values(this.healingBuff).reduce((sum, spell) => sum + spell.healing, 0);
  }

  get totalUses() {
    return Object.values(this.healingBuff).reduce((sum, spell) => sum + spell.castAmount, 0);
  }

  get unleashLifeCastRatioChart() {
    const unusedUL = this.unleashLifeCasts - this.totalUses;

    const items = [
      {
        color: SPELLS.CHAIN_HEAL.color,
        label: <Trans id="shaman.restoration.spell.chainHeal">Chain Heal</Trans>,
        spellId: SPELLS.CHAIN_HEAL.id,
        value: this.healingBuff[SPELLS.CHAIN_HEAL.id].castAmount,
      },
      {
        color: SPELLS.HEALING_WAVE.color,
        label: <Trans id="shaman.restoration.spell.healingWave">Healing Wave</Trans>,
        spellId: SPELLS.HEALING_WAVE.id,
        value: this.healingBuff[SPELLS.HEALING_WAVE.id].castAmount,
      },
      {
        color: SPELLS.HEALING_SURGE_RESTORATION.color,
        label: <Trans id="shaman.restoration.spell.healingSurge">Healing Surge</Trans>,
        spellId: SPELLS.HEALING_SURGE_RESTORATION.id,
        value: this.healingBuff[SPELLS.HEALING_SURGE_RESTORATION.id].castAmount,
      },
      {
        color: SPELLS.RIPTIDE.color,
        label: <Trans id="shaman.restoration.spell.riptide">Riptide</Trans>,
        spellId: SPELLS.RIPTIDE.id,
        value: this.healingBuff[SPELLS.RIPTIDE.id].castAmount,
      },
      {
        color: '#CC3D20',
        label: <Trans id="shaman.restoration.unleashLife.chart.unused.label">Unused Buffs</Trans>,
        tooltip: <Trans id="shaman.restoration.unleashLife.chart.unused.label.tooltip">The amount of Unleash Life buffs you did not use out of the total available. You cast {this.unleashLifeCasts} Unleash Lifes, of which you used {this.totalUses}.</Trans>,
        value: unusedUL,
      },
    ];

    return (
      <DonutChart
        items={items}
      />
    );
  }

  statistic() {
    return (
      <Statistic
        category={STATISTIC_CATEGORY.TALENTS}
        position={STATISTIC_ORDER.OPTIONAL(15)}
        size="flexible"
      >
        <div className="pad">
          <label><Trans id="shaman.restoration.unleashLife.statistic.label"><SpellLink id={SPELLS.UNLEASH_LIFE_TALENT.id} /> usage</Trans></label>
          {this.unleashLifeCastRatioChart}
        </div>
      </Statistic>
    );
  }

  subStatistic() {
    const feeding = this.cooldownThroughputTracker.getIndirectHealing(SPELLS.UNLEASH_LIFE_TALENT.id);
    return (
      <StatisticListBoxItem
        title={<SpellLink id={SPELLS.UNLEASH_LIFE_TALENT.id} />}
        value={`${formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.healing + this.totalBuffedHealing + feeding))} %`}
        valueTooltip={<Trans id="shaman.restoration.unleashLife.statistic.tooltip">{formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.healing + feeding))}% from Unleash Life and {formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.totalBuffedHealing))}% from the healing buff.</Trans>}
      />
    );
  }

}

export default UnleashLife;

