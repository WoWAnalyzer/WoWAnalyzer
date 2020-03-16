import React from 'react';

import SPELLS from 'common/SPELLS/index';
import { formatNumber } from 'common/format';
import SpellLink from 'common/SpellLink';
import { TooltipElement } from 'common/Tooltip';
import { calculateAzeriteEffects, calculateSecondaryStatDefault } from 'common/stats';

import StatIcon from 'interface/icons/PrimaryStat';
import ItemHealingDone from 'interface/ItemHealingDone';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import ItemStatistic from 'interface/statistics/ItemStatistic';
import StatisticGroup from 'interface/statistics/StatisticGroup';
import EventsIcon from 'interface/icons/Events';

import Analyzer, { SELECTED_PLAYER, SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import Abilities from 'parser/core/modules/Abilities';
import Buffs from 'parser/core/modules/Buffs';
import StatTracker from 'parser/shared/modules/StatTracker';
import Combatants from 'parser/shared/modules/Combatants';

const HTT_DURATION = 10500;
const HTT_BASE_COOLDOWN = 180000;

class VisionOfPerfection extends Analyzer {
  static dependencies = {
    abilities: Abilities,
    statTracker: StatTracker,
    buffs: Buffs,
    combatants: Combatants,
  };
  majorHealing = 0;
  majorPetHealing = 0;
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
    this.majorHaste = calculateAzeriteEffects(SPELLS.VISION_OF_PERFECTION_HASTE_CALC.id, this.selectedCombatant.neck.itemLevel)[0];

    this.statTracker.add(SPELLS.VISION_OF_PERFECTION_HASTE_BUFF_SELF.id, {
      haste: this.majorHaste,
    });
    if (this.rank > 2) {
      this.minorVersatility = calculateSecondaryStatDefault(420, 45, this.selectedCombatant.neck.itemLevel);
      this.statTracker.add(SPELLS.STRIVE_FOR_PERFECTION.id, {
        versatility: this.minorVersatility,
      });
    }

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
    if (!this.combatants.getEntity(event)) {
      this.majorPetHealing += event.amount + (event.absorbed || 0);
      return;
    }
    this.majorHealing += event.amount + (event.absorbed || 0);
  }

  get majorHasteGain() {
    return this.selectedCombatant.getBuffUptime(SPELLS.VISION_OF_PERFECTION_HASTE_BUFF_SELF.id, this.selectedCombatant.id) / this.owner.fightDuration * this.majorHaste;
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
                <TooltipElement content={(
                  <div>
                    Healing on Pets is filtered out.<br />
                    Unfiltered: <ItemHealingDone amount={this.majorHealing + this.majorPetHealing} />
                  </div>
                )}>
                  <ItemHealingDone amount={this.majorHealing} /></TooltipElement><br />
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

export { VisionOfPerfection as default };
