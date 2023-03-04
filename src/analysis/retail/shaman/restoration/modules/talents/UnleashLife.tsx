import { Trans } from '@lingui/macro';
import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/shaman';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { calculateEffectiveHealing } from 'parser/core/EventCalculateLib';
import Events, { ApplyBuffEvent, CastEvent, HealEvent, RemoveBuffEvent } from 'parser/core/Events';
import DonutChart from 'parser/ui/DonutChart';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import StatisticListBoxItem from 'parser/ui/StatisticListBoxItem';
import { STATISTIC_ORDER } from 'parser/ui/StatisticsListBox';

import { RESTORATION_COLORS } from '../../constants';
import CooldownThroughputTracker from '../features/CooldownThroughputTracker';
import {
  isBuffedByUnleashLife,
  isHealingWaveFromPrimordialWave,
  wasUnleashLifeConsumed,
} from '../../normalizers/CastLinkNormalizer';
import { getUnleashLifeHealingWaves } from '../../normalizers/UnleashLifeNormalizer';

const UNLEASH_LIFE_HEALING_INCREASE = 0.35;
// const UNLEASH_LIFE_CHAIN_HEAL_INCREASE = 0.15;
// const BUFFER_MS = 200;
// const debug = false;

interface HealingBuffInfo {
  [SpellID: number]: HealingBuffHot | HealingBuff;
}

interface HealingBuffHot {
  healing: number;
  castAmount: number;
  playersActive: number[];
}

interface HealingBuff {
  healing: number;
  castAmount: number;
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

  wastedBuffs: number = 0;
  spellConsumptionMap = new Map<number, number>();
  //ul direct
  directHealing: number = 0;

  //healing wave
  healingWaveHealing: number = 0;
  pwaveActive: boolean;
  pwaveHealingWaveHealing: number = 0;
  totalHealingWaveHealing: number = 0;

  //healing surge
  healingSurgeHealing: number = 0;

  //riptide
  riptideHealing: number = 0;

  //healing rain
  healingRainHealing: number = 0;
  overflowingShoresActive: boolean;
  overflowingShoresHealing: number = 0;
  totalHealingRainHealing: number = 0;

  //downpour
  downpourHealing: number = 0;

  //wellspring
  wellspringHealing: number = 0;

  healingBuff: HealingBuffInfo = {
    [TALENTS.RIPTIDE_TALENT.id]: {
      healing: 0,
      castAmount: 0,
      playersActive: [],
    },
    [TALENTS.CHAIN_HEAL_TALENT.id]: {
      healing: 0,
      castAmount: 0,
    },
    [TALENTS.HEALING_WAVE_TALENT.id]: {
      healing: 0,
      castAmount: 0,
    },
    [SPELLS.HEALING_SURGE.id]: {
      healing: 0,
      castAmount: 0,
    },
    [TALENTS.WELLSPRING_TALENT.id]: {
      healing: 0,
      castAmount: 0,
    },
    [TALENTS.HEALING_RAIN_TALENT.id]: {
      healing: 0,
      castAmount: 0,
    },
    [TALENTS.DOWNPOUR_TALENT.id]: {
      healing: 0,
      castAmount: 0,
    },
  };

  unleashLifeCount = 0;
  buffedChainHealTimestamp: number = Number.MIN_SAFE_INTEGER;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.UNLEASH_LIFE_TALENT);
    this.pwaveActive = this.selectedCombatant.hasTalent(TALENTS.PRIMORDIAL_WAVE_TALENT);
    this.overflowingShoresActive = this.selectedCombatant.hasTalent(
      TALENTS.OVERFLOWING_SHORES_TALENT,
    );
    const spellFilter = [
      TALENTS.RIPTIDE_TALENT,
      TALENTS.CHAIN_HEAL_TALENT,
      TALENTS.HEALING_WAVE_TALENT,
      SPELLS.HEALING_SURGE,
      TALENTS.WELLSPRING_TALENT,
      SPELLS.WELLSPRING_UNLEASH_LIFE,
      TALENTS.HEALING_RAIN_TALENT,
      TALENTS.DOWNPOUR_TALENT,
    ];
    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(spellFilter), this._onHeal);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(spellFilter), this._onCast);
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(TALENTS.UNLEASH_LIFE_TALENT),
      this._onHealUL,
    );
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(TALENTS.UNLEASH_LIFE_TALENT),
      this._onApplyUL,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(TALENTS.UNLEASH_LIFE_TALENT),
      this._onRemoveUL,
    );
  }

  _onApplyUL(event: ApplyBuffEvent) {
    this.unleashLifeCount += 1;
  }

  _onHealUL(event: HealEvent) {
    this.directHealing += event.amount + (event.absorbed || 0);
  }

  _onHeal(event: HealEvent) {
    /*
    const spellId = event.ability.guid;
    switch(spellId){
      case(TALENTS.HEALING_WAVE_TALENT.id):
      //this._onHealingWave(event);
      break;
    }
    // Riptide HoT handling, ticks on whoever its active
    if (
      spellId === TALENTS.RIPTIDE_TALENT.id &&
      (this.healingBuff[spellId] as HealingBuffHot).playersActive.includes(event.targetID)
    ) {
      if (event.tick) {
        this.healingBuff[spellId].healing += calculateEffectiveHealing(
          event,
          UNLEASH_LIFE_HEALING_INCREASE,
        );

        // Initial Riptide Heal without Unleash Life
        // casting an unbuffed Riptide on a target that already has a buffed Riptide, will completely negate the buff, so we remove that person
      } else hot tracker riptide check here  {
        (this.healingBuff[spellId] as HealingBuffHot).playersActive.splice(
          (this.healingBuff[spellId] as HealingBuffHot).playersActive.indexOf(event.targetID),
          1,
        );
      }
    }

    // These 3 heals only have 1 event and are handled easily
    if (
      (spellId === SPELLS.HEALING_SURGE.id ||
        (spellId === TALENTS.RIPTIDE_TALENT.id && !event.tick))
    ) {
      this.healingBuff[spellId].healing += calculateEffectiveHealing(
        event,
        UNLEASH_LIFE_HEALING_INCREASE,
      );

      // I had to move the HoT application to the heal event as the buffapply event had too many false positives
      if (spellId === TALENTS.RIPTIDE_TALENT.id) {
        (this.healingBuff[spellId] as HealingBuffHot).playersActive.push(event.targetID);
        debug && console.log('HoT Applied:', spellId, event.targetID);
      }

      // Chain heal has up to 4 events, setting the variable to -1 to indicate that there might be more events coming
    } else if (
      spellId === TALENTS.CHAIN_HEAL_TALENT.id &&
      (this.buffedChainHealTimestamp + BUFFER_MS > event.timestamp)
    ) {
      this.healingBuff[spellId].healing += calculateEffectiveHealing(
        event,
        UNLEASH_LIFE_HEALING_INCREASE,
      );
      this.buffedChainHealTimestamp = event.timestamp;
      debug && console.log('Heal:', spellId);
    }*/
    return;
  }

  _onCast(event: CastEvent) {
    const spellId = event.ability.guid;
    if (isBuffedByUnleashLife(event)) {
      const newTotal = this.spellConsumptionMap.has(spellId)
        ? this.spellConsumptionMap.get(spellId)! + 1
        : 1;
      this.spellConsumptionMap.set(spellId, newTotal);
      if (spellId === TALENTS.HEALING_WAVE_TALENT.id) {
        this._onHealingWave(event);
      }
      return;
    }
  }

  _onRemoveUL(event: RemoveBuffEvent) {
    if (wasUnleashLifeConsumed(event)) {
      return;
    }
    this.wastedBuffs += 1;
  }

  private _onHealingWave(event: CastEvent) {
    const ulHealingWaves = getUnleashLifeHealingWaves(event);
    if (this.pwaveActive) {
      const pwHealingWaves = ulHealingWaves.filter((event) =>
        isHealingWaveFromPrimordialWave(event),
      );
      this.pwaveHealingWaveHealing += this._tallyHealing(
        pwHealingWaves,
        UNLEASH_LIFE_HEALING_INCREASE,
      );
      this.healingWaveHealing += this._tallyHealing(
        ulHealingWaves.filter((event) => !isHealingWaveFromPrimordialWave(event)),
        UNLEASH_LIFE_HEALING_INCREASE,
      );
    }
    this.totalHealingWaveHealing += this._tallyHealing(
      ulHealingWaves,
      UNLEASH_LIFE_HEALING_INCREASE,
    );
  }

  private _tallyHealing(events: HealEvent[], healIncrease: number) {
    return events.reduce(
      (amount, event) => amount + calculateEffectiveHealing(event, healIncrease),
      0,
    );
  }

  //DELETE -- FIX
  get totalBuffedHealing() {
    console.log(this.healingBuff[TALENTS.HEALING_WAVE_TALENT.id]);
    return Object.values(this.healingBuff).reduce((sum, spell) => sum + spell.healing, 0);
  }

  get unleashLifeCastRatioChart() {
    const items = [
      {
        color: RESTORATION_COLORS.CHAIN_HEAL,
        label: <Trans id="shaman.restoration.spell.chainHeal">Chain Heal</Trans>,
        spellId: TALENTS.CHAIN_HEAL_TALENT.id,
        value: this.spellConsumptionMap.get(TALENTS.CHAIN_HEAL_TALENT.id) ?? 0,
      },
      {
        color: RESTORATION_COLORS.HEALING_WAVE,
        label: <Trans id="shaman.restoration.spell.healingWave">Healing Wave</Trans>,
        spellId: TALENTS.HEALING_WAVE_TALENT.id,
        value: this.spellConsumptionMap.get(TALENTS.HEALING_WAVE_TALENT.id) ?? 0,
      },
      {
        color: RESTORATION_COLORS.HEALING_SURGE,
        label: <Trans id="shaman.restoration.spell.healingSurge">Healing Surge</Trans>,
        spellId: SPELLS.HEALING_SURGE.id,
        value: this.spellConsumptionMap.get(SPELLS.HEALING_SURGE.id) ?? 0,
      },
      {
        color: RESTORATION_COLORS.RIPTIDE,
        label: <Trans id="shaman.restoration.spell.riptide">Riptide</Trans>,
        spellId: TALENTS.RIPTIDE_TALENT.id,
        value: this.spellConsumptionMap.get(TALENTS.RIPTIDE_TALENT.id) ?? 0,
      },
      {
        color: RESTORATION_COLORS.HEALING_RAIN,
        label: <Trans id="shaman.restoration.spell.healing_rain">Healing Rain</Trans>,
        spellId: TALENTS.HEALING_RAIN_TALENT.id,
        value: this.spellConsumptionMap.get(TALENTS.HEALING_RAIN_TALENT.id) ?? 0,
      },
      {
        color: RESTORATION_COLORS.WELLSPRING,
        label: <Trans id="shaman.restoration.spell.wellspring">Wellspring</Trans>,
        spellId: TALENTS.WELLSPRING_TALENT.id,
        value: this.spellConsumptionMap.get(TALENTS.WELLSPRING_TALENT.id) ?? 0,
      },
      {
        color: RESTORATION_COLORS.DOWNPOUR,
        label: <Trans id="shaman.restoration.spell.downpour">Downpour</Trans>,
        spellId: TALENTS.DOWNPOUR_TALENT.id,
        value: this.spellConsumptionMap.get(TALENTS.DOWNPOUR_TALENT.id) ?? 0,
      },
      {
        color: RESTORATION_COLORS.UNUSED,
        label: <Trans id="shaman.restoration.unleashLife.chart.unused.label">Unused Buffs</Trans>,
        tooltip: (
          <Trans id="shaman.restoration.unleashLife.chart.unused.label.tooltip">
            The amount of Unleash Life buffs you did not use out of the total available. You cast{' '}
            {this.unleashLifeCount} Unleash Lifes, of which you used{' '}
            {this.unleashLifeCount - this.wastedBuffs}.
          </Trans>
        ),
        value: this.wastedBuffs,
      },
    ].filter((item) => item.value > 0);
    return <DonutChart items={items} />;
  }

  statistic() {
    return (
      <Statistic
        category={STATISTIC_CATEGORY.TALENTS}
        position={STATISTIC_ORDER.OPTIONAL(15)}
        size="flexible"
      >
        <div className="pad">
          <label>
            <Trans id="shaman.restoration.unleashLife.statistic.label">
              <SpellLink id={TALENTS.UNLEASH_LIFE_TALENT.id} /> usage
            </Trans>
          </label>
          {this.unleashLifeCastRatioChart}
          <small>
            {this.unleashLifeCount - this.wastedBuffs}/{this.unleashLifeCount} buffs used
          </small>
        </div>
      </Statistic>
    );
  }

  //FIX
  subStatistic() {
    return (
      <StatisticListBoxItem
        title={<SpellLink id={TALENTS.UNLEASH_LIFE_TALENT.id} />}
        value={`${formatPercentage(
          this.owner.getPercentageOfTotalHealingDone(this.directHealing + this.totalBuffedHealing),
        )} %`}
        valueTooltip={
          <Trans id="shaman.restoration.unleashLife.statistic.tooltip">
            {formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.directHealing))}% from
            Unleash Life and{' '}
            {formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.totalBuffedHealing))}%
            from the healing buff.
          </Trans>
        }
      />
    );
  }
}

export default UnleashLife;
