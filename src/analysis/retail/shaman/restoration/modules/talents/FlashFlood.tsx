import { Trans } from '@lingui/macro';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/shaman';
import { SpellLink } from 'interface';
import { TooltipElement } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { BeginCastEvent, CastEvent } from 'parser/core/Events';
import GlobalCooldown from 'parser/shared/modules/GlobalCooldown';
import DonutChart from 'parser/ui/DonutChart';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { STATISTIC_ORDER } from 'parser/ui/StatisticsListBox';

import { RESTORATION_COLORS, FLASH_FLOOD_CAST_SPEED_MODIFIER } from '../../constants';

const BUFFER_MS = 50;

interface FlashFloodInfo {
  [SpellID: number]: FlashFloodSpell;
}

interface FlashFloodSpell {
  timesBuffed: number;
  timeSaved: number;
  timeWasted: number;
}

class FlashFlood extends Analyzer {
  static dependencies = {
    globalCooldown: GlobalCooldown,
  };

  protected globalCooldown!: GlobalCooldown;

  beginCastTimestamp = 0;
  beginCastGlobalCooldown = 0;
  flashFloodHaste = 0;

  spellsConsumingFlashFlood: FlashFloodInfo = {
    [TALENTS.HEALING_WAVE_TALENT.id]: {
      timesBuffed: 0,
      timeSaved: 0,
      timeWasted: 0,
    },
    [TALENTS.CHAIN_HEAL_TALENT.id]: {
      timesBuffed: 0,
      timeSaved: 0,
      timeWasted: 0,
    },
    [SPELLS.HEALING_SURGE.id]: {
      //-- always below GCD
      timesBuffed: 0,
      timeSaved: 0,
      timeWasted: 0,
    },
    [TALENTS.HEALING_RAIN_TALENT.id]: {
      timesBuffed: 0,
      timeSaved: 0,
      timeWasted: 0,
    },
  };

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.FLASH_FLOOD_TALENT);
    this.flashFloodHaste =
      this.selectedCombatant.getTalentRank(TALENTS.FLASH_FLOOD_TALENT) *
      FLASH_FLOOD_CAST_SPEED_MODIFIER;

    if (this.selectedCombatant.hasTalent(TALENTS.WELLSPRING_TALENT)) {
      //-- always below GCD
      this.spellsConsumingFlashFlood[TALENTS.WELLSPRING_TALENT.id] = {
        timesBuffed: 0,
        timeSaved: 0,
        timeWasted: 0,
      };
    }

    const spellFilter = [
      TALENTS.HEALING_WAVE_TALENT,
      TALENTS.CHAIN_HEAL_TALENT,
      SPELLS.HEALING_SURGE,
      TALENTS.HEALING_RAIN_TALENT,
      TALENTS.WELLSPRING_TALENT,
    ];
    this.addEventListener(
      Events.begincast.by(SELECTED_PLAYER).spell(spellFilter),
      this._onBeginCast,
    );
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

    const hasFlashFlood = this.selectedCombatant.hasBuff(
      SPELLS.FLASH_FLOOD_BUFF.id,
      this.beginCastTimestamp + BUFFER_MS,
    );
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
      this.spellsConsumingFlashFlood[spellId].timeSaved += Math.max(
        castTime / (1 - this.flashFloodHaste) - this.beginCastGlobalCooldown,
        0,
      );
      return;
    }

    this.spellsConsumingFlashFlood[spellId].timeSaved +=
      (castTime / (1 - this.flashFloodHaste)) * this.flashFloodHaste;
  }

  get totalTimeSaved() {
    return Object.values(this.spellsConsumingFlashFlood).reduce(
      (sum, spell) => sum + spell.timeSaved,
      0,
    );
  }

  get totalTimeWasted() {
    return Object.values(this.spellsConsumingFlashFlood).reduce(
      (sum, spell) => sum + spell.timeWasted,
      0,
    );
  }

  get flashFloodUsageRatioChart() {
    const makeTooltip = (value: FlashFloodSpell) => (
      <>
        <strong>{(value.timeSaved / 1000).toFixed(2)} seconds saved</strong> <br />
        {(value.timeWasted / 1000).toFixed(2)} seconds reduced below GCD <br />
        You buffed this spell <strong>{value.timesBuffed}</strong> times.
      </>
    );
    const items = [
      {
        color: RESTORATION_COLORS.CHAIN_HEAL,
        label: <Trans id="shaman.restoration.spell.chainHeal">Chain Heal</Trans>,
        spellId: TALENTS.CHAIN_HEAL_TALENT.id,
        value: this.spellsConsumingFlashFlood[TALENTS.CHAIN_HEAL_TALENT.id].timeSaved,
        valueTooltip: makeTooltip(this.spellsConsumingFlashFlood[TALENTS.CHAIN_HEAL_TALENT.id]),
      },
      {
        color: RESTORATION_COLORS.HEALING_WAVE,
        label: <Trans id="shaman.restoration.spell.healingWave">Healing Wave</Trans>,
        spellId: TALENTS.HEALING_WAVE_TALENT.id,
        value: this.spellsConsumingFlashFlood[TALENTS.HEALING_WAVE_TALENT.id].timeSaved,
        valueTooltip: makeTooltip(this.spellsConsumingFlashFlood[TALENTS.HEALING_WAVE_TALENT.id]),
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
        spellId: TALENTS.HEALING_RAIN_TALENT.id,
        value: this.spellsConsumingFlashFlood[TALENTS.HEALING_RAIN_TALENT.id].timeSaved,
        valueTooltip: makeTooltip(this.spellsConsumingFlashFlood[TALENTS.HEALING_RAIN_TALENT.id]),
      },
    ];

    if (this.spellsConsumingFlashFlood[TALENTS.WELLSPRING_TALENT.id]) {
      const wellspring = {
        color: '#FEFEFE',
        label: <Trans id="shaman.restoration.spell.wellspring">Wellspring</Trans>,
        spellId: TALENTS.WELLSPRING_TALENT.id,
        value: this.spellsConsumingFlashFlood[TALENTS.WELLSPRING_TALENT.id].timeSaved,
        valueTooltip: makeTooltip(this.spellsConsumingFlashFlood[TALENTS.WELLSPRING_TALENT.id]),
      };
      items.splice(4, 0, wellspring);
    }

    return <DonutChart items={items} />;
  }

  statistic() {
    return (
      <Statistic
        category={STATISTIC_CATEGORY.TALENTS}
        position={STATISTIC_ORDER.OPTIONAL(90)}
        size="flexible"
      >
        <div className="pad">
          <label>
            <Trans id="shaman.restoration.flashFlood.statistic.label">
              <SpellLink id={TALENTS.FLASH_FLOOD_TALENT.id} /> usage
            </Trans>
          </label>
          <div className="flex">
            <div className="flex-main">
              <Trans id="shaman.restoration.flashFlood.statistic.title">
                Total Cast Time Saved
              </Trans>
            </div>
            <div className="flex-sub text-right">
              <TooltipElement
                content={
                  <Trans id="shaman.restoration.flashFlood.statistic.description.tooltip">
                    Cast time saved by Flash Flood. <br />
                    {(this.totalTimeWasted / 1000).toFixed(2)} seconds 'saved' on reductions below
                    GCD.
                  </Trans>
                }
              >
                <Trans id="shaman.restoration.flashFlood.statistic.description">
                  {(this.totalTimeSaved / 1000).toFixed(2)} seconds
                </Trans>
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
