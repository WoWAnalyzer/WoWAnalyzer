import React from 'react';

import SPELLS from 'common/SPELLS/index';
import { formatNumber } from 'common/format';
import SpellLink from 'common/SpellLink';
import { calculateAzeriteEffects, calculateSecondaryStatDefault } from 'common/stats';

import StatIcon from 'interface/icons/PrimaryStat';
import ItemHealingDone from 'interface/others/ItemHealingDone';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import ItemStatistic from 'interface/statistics/ItemStatistic';
import StatisticGroup from 'interface/statistics/StatisticGroup';
import EventsIcon from 'interface/icons/Events';

import Analyzer, { SELECTED_PLAYER, SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import Abilities from 'parser/core/modules/Abilities';
import Buffs from 'parser/core/modules/Buffs';
import StatTracker from 'parser/shared/modules/StatTracker';

const HTT_DURATION = 10500;
const HTT_BASE_COOLDOWN = 180000;

// Provided by Blizzard, used to calculate the cooldown reduction of Strive for Perfection
const VISION_MAGIC_NUMBER = 2896;
// This will work for any cooldown and should probably be in a shared/common folder
// Requires cooldown in seconds and returns cooldown in seconds
const calculateCooldown = (ilvl, cooldown) => {
  let reductionPercentage = ((calculateAzeriteEffects(SPELLS.STRIVE_FOR_PERFECTION.id, ilvl)[0] + VISION_MAGIC_NUMBER) / -100);
  // Clamped to 10% - 25%
  reductionPercentage = Math.max(10, Math.min(25, reductionPercentage));
  return cooldown * (1 - reductionPercentage / 100);
};

class VisionOfPerfection extends Analyzer {
  static dependencies = {
    abilities: Abilities,
    statTracker: StatTracker,
    buffs: Buffs,
  };
  majorHealing = 0;
  majorHaste = 0;
  minorHealing = 0;
  minorSavedTime = 0;
  minorVersatility = 0;
  summons = 0;
  castTimestamp = null;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasEssence(SPELLS.VISION_OF_PERFECTION.traitId);
    if (!this.active) {
      return;
    }

    this.hasMajor = this.selectedCombatant.hasMajor(SPELLS.VISION_OF_PERFECTION.traitId);
    this.minorVersatility = calculateSecondaryStatDefault(420,45,this.selectedCombatant.neck.itemLevel);
    // Below was way inaccurate, should revisit it when Rank 3 is available to find out why.
    // Currently scales backwards on the tooltip on live servers (45 vers at neck 55, 43 vers at neck 57, 42 vers at neck 61)
    // this.minorVersatility = calculateAzeriteEffects(SPELLS.STRIVE_FOR_PERFECTION_VERSATILITY.id, this.selectedCombatant.neck.itemLevel)[0];
    this.majorHaste = calculateAzeriteEffects(SPELLS.VISION_OF_PERFECTION_HASTE.id, this.selectedCombatant.neck.itemLevel, null,true)[0];

    if (this.hasMajor) {
      this.buffs.add({
        spellId: SPELLS.VISION_OF_PERFECTION_HASTE.id,
        triggeredBySpellId: SPELLS.VISION_OF_PERFECTION_HASTE.id,
        timelineHightlight: true,
      });
    }
    // This will be inaccurate if you get the buff off of somebody else
    this.statTracker.add(SPELLS.VISION_OF_PERFECTION_HASTE.id, {
      haste: this.majorHaste,
    });
    this.statTracker.add(SPELLS.STRIVE_FOR_PERFECTION_VERSATILITY.id, {
      versatility: this.minorVersatility,
    });

    this.addEventListener(Events.summon.by(SELECTED_PLAYER).spell(SPELLS.HEALING_TIDE_TOTEM_CAST), this._newHTT);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.HEALING_TIDE_TOTEM_CAST), this._realHTT);
    this.addEventListener(Events.heal.by(SELECTED_PLAYER_PET).spell(SPELLS.HEALING_TIDE_TOTEM_HEAL), this._HTTheal);
    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(SPELLS.STRIVE_FOR_PERFECTION_HEAL), this._minorHeal);
  }

  _minorHeal(event) {
    this.minorHealing += event.amount + (event.absorbed || 0);
  }

  _newHTT() {
    this.summons += 1;
  }

  _realHTT(event) {
    if (event.timestamp - this.castTimestamp < HTT_BASE_COOLDOWN) {
      this.minorSavedTime += HTT_BASE_COOLDOWN - (event.timestamp - this.castTimestamp);
    }
    this.summons -= 1;
    this.castTimestamp = event.timestamp;
  }

  _HTTheal(event) {
    if (event.timestamp < this.castTimestamp + HTT_DURATION) {
      return;
    }
    this.majorHealing += event.amount + (event.absorbed || 0);
  }

  get majorHasteGain() {
    return this.selectedCombatant.getBuffUptime(SPELLS.VISION_OF_PERFECTION_HASTE.id, this.selectedCombatant.id) / this.owner.fightDuration * this.majorHaste;
  }

  statistic() {
    const rank = this.selectedCombatant.essenceRank(SPELLS.VISION_OF_PERFECTION.traitId);
    return (
      <StatisticGroup category={STATISTIC_CATEGORY.ITEMS}>
        <ItemStatistic
          ultrawide
          size="flexible"
        >
          <div className="pad">
            <label><SpellLink id={SPELLS.STRIVE_FOR_PERFECTION.id} /> - Minor Rank {rank}</label>
            <div className="value">
              <StatIcon stat={"haste"} /> {(this.minorSavedTime / HTT_BASE_COOLDOWN).toFixed(2)} <small>extra casts gained</small><br />
              {rank > 1 && (<><ItemHealingDone amount={this.minorHealing} /><br /></>)}
              {rank > 2 && (<><StatIcon stat={"versatility"} /> {formatNumber(this.minorVersatility)} <small>Versatility gained</small><br /></>)}
            </div>
          </div>
        </ItemStatistic>
        {this.hasMajor && (
          <ItemStatistic
            ultrawide
            size="flexible"
          >
            <div className="pad">
              <label><SpellLink id={SPELLS.VISION_OF_PERFECTION.id} /> - Major Rank {rank}</label>
              <div className="value">
                <ItemHealingDone amount={this.majorHealing} /><br />
                <EventsIcon /> {this.summons} <small>procs</small><br />
                {rank > 2 && (<><StatIcon stat={"haste"} /> {formatNumber(this.majorHasteGain)} <small>average Haste gained</small><br /></>)}
              </div>
            </div>
          </ItemStatistic>
        )}
      </StatisticGroup>
    );
  }
}

export { VisionOfPerfection as default, calculateCooldown };
