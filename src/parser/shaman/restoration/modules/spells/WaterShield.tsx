import React from 'react';

import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent, EnergizeEvent } from 'parser/core/Events';

import SpellLink from 'common/SpellLink';
import SPELLS from 'common/SPELLS';
import { formatNumber } from 'common/format';

import { Trans } from '@lingui/macro';

import Statistic from 'interface/statistics/Statistic';
import BoringValue from 'interface/statistics/components/BoringValueText';
import ManaIcon from 'interface/icons/Mana';
// just gonna steal my mtt formatting
import './ManaTideTotem.scss'
import { TooltipElement } from 'common/Tooltip';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import { ThresholdStyle } from 'parser/core/ParseResults';

const WATER_SHIELD_MANA_REGEN_PER_SECOND = 50 / 5;

class WaterShield extends Analyzer {
  manaGain = 0;
  prepullApplication = false;

  constructor(options: Options) {
    super(options);
    // Disable Water Shield because its just fucking broken
    this.active = false;

    this.addEventListener(Events.energize.by(SELECTED_PLAYER).spell(SPELLS.WATER_SHIELD_ENERGIZE), this.waterShield);
    this.addEventListener(Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.WATER_SHIELD), this.waterShieldPrepullCheck);
  }

  waterShield(event: EnergizeEvent) {
    this.manaGain += event.resourceChange;
  }

  waterShieldPrepullCheck(event: ApplyBuffEvent) {
    if (event.prepull) {
      this.prepullApplication = true;
    }
  }

  get regenOnPlayer() {
    let uptime = this.selectedCombatant.getBuffUptime(SPELLS.WATER_SHIELD.id) / this.owner.fightDuration;
    if (uptime === 0) {
      uptime = 1; // quick fix for water shield not being in logs
    }

    return (this.owner.fightDuration / 1000) * WATER_SHIELD_MANA_REGEN_PER_SECOND * uptime;
  };

  get uptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.WATER_SHIELD.id);
  }

  get uptimePercent() {
    return this.uptime / this.owner.fightDuration;
  }

  get suggestionThresholds() {
    return {
      actual: this.uptimePercent,
      isLessThan: {
        minor: 0.95,
        average: 0.90,
        major: 0.85,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  get suggestionThresholdsPrepull() {
    return {
      actual: this.prepullApplication,
      isEqual: false,
      style: ThresholdStyle.BOOLEAN,
    };
  }

  statistic() {
    return (
      <Statistic
        size='flexible'
        position={STATISTIC_ORDER.UNIMPORTANT(88)}
      >
        <BoringValue label={<SpellLink id={SPELLS.WATER_SHIELD.id} />}>
          <div className="flex mtt-value">
            <div className="flex-sub icon">
              <ManaIcon />
            </div>
            <div className="flex-main value">
              {formatNumber(this.regenOnPlayer + this.manaGain)}
              <br />
              <small>
                <TooltipElement content={<Trans id="shaman.restoration.waterShield.statistic.tooltip">{formatNumber(this.regenOnPlayer)} mana from the passive regen and {this.manaGain} from getting hit</Trans>}>
                  <Trans id="shaman.restoration.manaTideTotem.statistic.manaRestored">Mana restored</Trans>
                </TooltipElement>
              </small>
            </div>
          </div>
        </BoringValue>
      </Statistic>
    );
  }
}

export default WaterShield;
