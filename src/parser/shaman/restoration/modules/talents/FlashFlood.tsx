import React from 'react';

import SpellLink from 'common/SpellLink';
import SPELLS from 'common/SPELLS';
import { TooltipElement } from 'common/Tooltip';

import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import GlobalCooldown from 'parser/shared/modules/GlobalCooldown';
import { STATISTIC_ORDER } from 'interface/others/StatisticsListBox';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import Statistic from 'interface/statistics/Statistic';
import DonutChart from 'interface/statistics/components/DonutChart';
import Events, { BeginCastEvent, CastEvent } from 'parser/core/Events';
import { Trans } from '@lingui/macro';
import { RESTORATION_COLORS } from 'parser/shaman/restoration/constants';

const FLASH_FLOOD_HASTE = 0.2;
const BUFFER_MS = 50;

interface FlashFloodInfo {
  [SpellID: number]: FlashFloodSpell
}

interface FlashFloodSpell {
  timesBuffed: number,
  timeSaved: number,
  timeWasted: number
}

class FlashFlood extends Analyzer {
  static dependencies = {
    globalCooldown: GlobalCooldown,
  };

  protected globalCooldown!: GlobalCooldown;

  beginCastTimestamp = 0;
  beginCastGlobalCooldown = 0;

  spellsConsumingFlashFlood: FlashFloodInfo = {
    [SPELLS.HEALING_WAVE.id]: {
      timesBuffed: 0,
      timeSaved: 0,
      timeWasted: 0,
    },
    [SPELLS.CHAIN_HEAL.id]: {
      timesBuffed: 0,
      timeSaved: 0,
      timeWasted: 0,
    },
    [SPELLS.HEALING_SURGE.id]: { //-- always below GCD
      timesBuffed: 0,
      timeSaved: 0,
      timeWasted: 0,
    },
    [SPELLS.HEALING_RAIN_CAST.id]: {
      timesBuffed: 0,
      timeSaved: 0,
      timeWasted: 0,
    },
  };

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.FLASH_FLOOD_TALENT.id);

    if (this.selectedCombatant.hasTalent(SPELLS.WELLSPRING_TALENT.id)) { //-- always below GCD
      this.spellsConsumingFlashFlood[SPELLS.WELLSPRING_TALENT.id] = {
        timesBuffed: 0,
        timeSaved: 0,
        timeWasted: 0,
      };
    }

    const spellFilter = [SPELLS.HEALING_WAVE, SPELLS.CHAIN_HEAL, SPELLS.HEALING_SURGE, SPELLS.HEALING_RAIN_CAST, SPELLS.WELLSPRING_TALENT];
    this.addEventListener(Events.begincast.by(SELECTED_PLAYER).spell(spellFilter), this._onBeginCast);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(spellFilter), this._onCast);
  }

  _onBeginCast(event: BeginCastEvent) {
    if (event.isCancelled) {
      return;
    }

    const spellId = event.ability.guid;
    this.beginCastTimestamp = event.timestamp;
    this.beginCastGlobalCooldown = this.globalCooldown.getGlobalCooldownDuration(spellId);
  }

  _onCast(event: CastEvent) {
    if (!this.beginCastTimestamp) {
      return;
    }

    const hasFlashFlood = this.selectedCombatant.hasBuff(SPELLS.FLASH_FLOOD_BUFF.id, this.beginCastTimestamp + BUFFER_MS);
    if (!hasFlashFlood) {
      return;
    }

    const spellId = event.ability.guid;
    this.spellsConsumingFlashFlood[spellId].timesBuffed += 1;
    const castTime = event.timestamp - this.beginCastTimestamp;
    this.beginCastTimestamp = 0;
    if (castTime <= this.beginCastGlobalCooldown) {
      // The next 2 lines together add up to the total reduction, but everything below the GCD is discarded
      this.spellsConsumingFlashFlood[spellId].timeWasted += this.beginCastGlobalCooldown - castTime;
      this.spellsConsumingFlashFlood[spellId].timeSaved += Math.max((castTime) / (1 - FLASH_FLOOD_HASTE) - this.beginCastGlobalCooldown, 0);
      return;
    }

    this.spellsConsumingFlashFlood[spellId].timeSaved += castTime / (1 - FLASH_FLOOD_HASTE) * FLASH_FLOOD_HASTE;
  }

  get totalTimeSaved() {
    return Object.values(this.spellsConsumingFlashFlood).reduce((sum, spell) => sum + spell.timeSaved, 0);
  }

  get totalTimeWasted() {
    return Object.values(this.spellsConsumingFlashFlood).reduce((sum, spell) => sum + spell.timeWasted, 0);
  }

  get flashFloodUsageRatioChart() {
    const makeTooltip = (value: FlashFloodSpell) => (
      <>
        <strong>{(value.timeSaved / 1000).toFixed(2)} seconds saved</strong> <br />
        {(value.timeWasted / 1000).toFixed(2)} seconds reduced below GCD <br />
        You buffed this spell <strong>{value.timesBuffed}</strong> times.
      </>
    );
    const items: Array<{color: string, label: JSX.Element, spellId: number, value: number, valueTooltip: JSX.Element}> = [
      {
        color: RESTORATION_COLORS.CHAIN_HEAL,
        label: <Trans id="shaman.restoration.spell.chainHeal">Chain Heal</Trans>,
        spellId: SPELLS.CHAIN_HEAL.id,
        value: this.spellsConsumingFlashFlood[SPELLS.CHAIN_HEAL.id].timeSaved,
        valueTooltip: makeTooltip(this.spellsConsumingFlashFlood[SPELLS.CHAIN_HEAL.id]),
      },
      {
        color: RESTORATION_COLORS.HEALING_WAVE,
        label: <Trans id="shaman.restoration.spell.healingWave">Healing Wave</Trans>,
        spellId: SPELLS.HEALING_WAVE.id,
        value: this.spellsConsumingFlashFlood[SPELLS.HEALING_WAVE.id].timeSaved,
        valueTooltip: makeTooltip(this.spellsConsumingFlashFlood[SPELLS.HEALING_WAVE.id]),
      },
      {
        color: RESTORATION_COLORS.HEALING_SURGE,
        label: <Trans id="shaman.restoration.spell.healingSurge">Healing Surge</Trans>,
        spellId: SPELLS.HEALING_SURGE.id,
        value: this.spellsConsumingFlashFlood[SPELLS.HEALING_SURGE.id].timeSaved,
        valueTooltip: makeTooltip(this.spellsConsumingFlashFlood[SPELLS.HEALING_SURGE.id]),
      },
      {
        color: RESTORATION_COLORS.RIPTIDE,
        label: <Trans id="shaman.restoration.spell.healingRain">Healing Rain</Trans>,
        spellId: SPELLS.HEALING_RAIN_CAST.id,
        value: this.spellsConsumingFlashFlood[SPELLS.HEALING_RAIN_CAST.id].timeSaved,
        valueTooltip: makeTooltip(this.spellsConsumingFlashFlood[SPELLS.HEALING_RAIN_CAST.id]),
      },
    ];

    if (this.spellsConsumingFlashFlood[SPELLS.WELLSPRING_TALENT.id]) {
      const wellspring: {color: string, label: JSX.Element, spellId: number, value: number, valueTooltip: JSX.Element} = {
        color: '#FEFEFE',
        label: <Trans id="shaman.restoration.spell.wellspring">Wellspring</Trans>,
        spellId: SPELLS.WELLSPRING_TALENT.id,
        value: this.spellsConsumingFlashFlood[SPELLS.WELLSPRING_TALENT.id].timeSaved,
        valueTooltip: makeTooltip(this.spellsConsumingFlashFlood[SPELLS.WELLSPRING_TALENT.id]),
      };
      items.splice(4, 0, wellspring);
    }

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
        position={STATISTIC_ORDER.OPTIONAL(90)}
        size="flexible"
      >
        <div className="pad">
          <label><Trans id="shaman.restoration.flashFlood.statistic.label"><SpellLink id={SPELLS.FLASH_FLOOD_TALENT.id} /> usage</Trans></label>
          <div className="flex">
            <div className="flex-main">
              <Trans id="shaman.restoration.flashFlood.statistic.title">Total Cast Time Saved</Trans>
            </div>
            <div className="flex-sub text-right">
              <TooltipElement
                content={(
                  <Trans id="shaman.restoration.flashFlood.statistic.description.tooltip">
                    Cast time saved by Flash Flood. <br />
                    {(this.totalTimeWasted / 1000).toFixed(2)} seconds 'saved' on reductions below GCD.
                  </Trans>
                )}
              >
                <Trans id="shaman.restoration.flashFlood.statistic.description">{(this.totalTimeSaved / 1000).toFixed(2)} seconds</Trans>
              </TooltipElement>
            </div>
          </div>
          {this.flashFloodUsageRatioChart}
        </div>
      </Statistic>
    );
  }

}

export default FlashFlood;
