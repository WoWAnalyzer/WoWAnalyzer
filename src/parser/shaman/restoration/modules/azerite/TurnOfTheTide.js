import React from 'react';

import { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import { formatNumber, formatMilliseconds } from 'common/format';

import SPELLS from 'common/SPELLS';
import StatTracker from 'parser/shared/modules/StatTracker';
import Haste from 'parser/shared/modules/Haste';
import BaseHealerAzerite from './BaseHealerAzerite';

const TIDAL_WAVE_HASTE = 0.3;
const TURN_BONUS = 0.05;

/**
 * Turn of the Tide:
 * Both bonuses of Tidal Waves are increased by 5%, and spells affected by it heal for an additional 601.
 */

class TurnOfTheTide extends BaseHealerAzerite {
  static dependencies = {
    statTracker: StatTracker,
    haste: Haste,
  };
  static TRAIT = SPELLS.TURN_OF_THE_TIDE_TRAIT;
  static HEAL = SPELLS.TURN_OF_THE_TIDE_TRAIT;

  traitRawHealing = 0;
  currentCoefficient = 0;
  critBonusEstimation = 0;
  timeSaved = 0;

  constructor(...args) {
    super(...args);
    this.active = this.hasTrait;
    if (!this.active) {
      return;
    }
    this.traitRawHealing = this.azerite.reduce((total, trait) => total + trait.rawHealing, 0);

    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(SPELLS.HEALING_WAVE), this.onHealingWave);
    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(SPELLS.HEALING_SURGE_RESTORATION), this.onHealingSurge);
    this.addEventListener(Events.fightend, this.fightend);
  }

  fightend() {
    this.moreInformation = (
      <>
        The Tidal Wave bonus percentage does not stack and is only factored into the 1st trait.<br /> Only the Healing Surge Tidal Wave bonus is converted to HPS.<br /><br />
        <strong>Healing Surge</strong>: This bonus is estimated to be {formatNumber(this.critBonusEstimation)} worth of extra healing.<br />
        <strong>Healing Wave</strong>: {formatMilliseconds(this.timeSaved * 1000)} cast time saved.
      </>
    );
  }

  onHealingWave(event) {
    const hasTidalWave = this.selectedCombatant.hasBuff(SPELLS.TIDAL_WAVES_BUFF.id, event.timestamp, -1);
    if (!hasTidalWave) {
      return;
    }
    this.currentCoefficient = SPELLS.HEALING_WAVE.coefficient;
    const currentHaste = 1 + this.haste.current;
    this.timeSaved += (SPELLS.HEALING_WAVE.castTime / (currentHaste + TIDAL_WAVE_HASTE)) - (SPELLS.HEALING_WAVE.castTime / (currentHaste + TIDAL_WAVE_HASTE + TURN_BONUS));
    this._processHealing(event, this.traitComponent); // Haste is odd to calculate for a healer so it is left out for now
  }

  onHealingSurge(event) {
    const hasTidalWave = this.selectedCombatant.hasBuff(SPELLS.TIDAL_WAVES_BUFF.id, event.timestamp, -1);
    if (!hasTidalWave) {
      return;
    }
    this.currentCoefficient = SPELLS.HEALING_SURGE_RESTORATION.coefficient;

    // calculating the 5% bonus on the tidal wave effect, but only adding it to the "first" trait as it doesn't stack
    const tidalWaveHealing = (event.amount || 0 + event.overheal || 0 + event.absorbed || 0) * TURN_BONUS;
    const actualHealing = Math.max(0, tidalWaveHealing - (event.overheal || 0));
    const overHealing = tidalWaveHealing - actualHealing;
    this.azerite[this.azerite.length - 1].actualHealing += actualHealing;
    this.azerite[this.azerite.length - 1].overhealing += overHealing;
    this.critBonusEstimation += actualHealing;

    this._processHealing(event, this.traitComponent);
  }

  get traitComponent() {
    const currentIntellect = this.statTracker.currentIntellectRating;
    const spellHeal = this.currentCoefficient * currentIntellect;
    return this.traitRawHealing / (spellHeal + this.traitRawHealing);
  }
}

export default TurnOfTheTide;
