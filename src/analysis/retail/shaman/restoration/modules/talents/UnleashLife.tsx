import { Trans } from '@lingui/macro';
import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/shaman';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { calculateEffectiveHealing } from 'parser/core/EventCalculateLib';
import Events, { CastEvent, HealEvent, RemoveBuffEvent } from 'parser/core/Events';
import DonutChart from 'parser/ui/DonutChart';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import StatisticListBoxItem from 'parser/ui/StatisticListBoxItem';
import { STATISTIC_ORDER } from 'parser/ui/StatisticsListBox';

import { RESTORATION_COLORS } from '../../constants';
import CooldownThroughputTracker from '../features/CooldownThroughputTracker';

const UNLEASH_LIFE_HEALING_INCREASE = 0.35;
const BUFFER_MS = 200;
const UNLEASH_LIFE_DURATION = 10000;
const debug = false;

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

  healing = 0;
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

  unleashLifeCasts = 0;
  unleashLifeRemaining = false;
  unleashLifeHealRemaining = 0;

  buffedChainHealTimestamp: number = Number.MIN_SAFE_INTEGER;
  lastUnleashLifeTimestamp: number = Number.MAX_SAFE_INTEGER;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.UNLEASH_LIFE_TALENT);

    const spellFilter = [
      TALENTS.UNLEASH_LIFE_TALENT,
      TALENTS.RIPTIDE_TALENT,
      TALENTS.CHAIN_HEAL_TALENT,
      TALENTS.HEALING_WAVE_TALENT,
      SPELLS.HEALING_SURGE,
      TALENTS.WELLSPRING_TALENT,
      TALENTS.HEALING_RAIN_TALENT,
      TALENTS.DOWNPOUR_TALENT,
    ]; // TODO ADD CHAIN HARVEST
    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(spellFilter), this._onHeal);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(spellFilter), this._onCast);
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(TALENTS.RIPTIDE_TALENT),
      this._onRiptideRemoval,
    );
  }

  _onHeal(event: HealEvent) {
    const spellId = event.ability.guid;

    if (spellId === TALENTS.UNLEASH_LIFE_TALENT.id) {
      this.unleashLifeHealRemaining = 1;
      this.lastUnleashLifeTimestamp = event.timestamp;
      this.healing += event.amount + (event.absorbed || 0);
    }

    if (
      this.unleashLifeHealRemaining > 0 &&
      this.lastUnleashLifeTimestamp + UNLEASH_LIFE_DURATION <= event.timestamp
    ) {
      debug && console.log('Heal Timed out', event.timestamp);
      this.unleashLifeHealRemaining = 0;
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
      } else if (!event.tick && !this.unleashLifeHealRemaining) {
        (this.healingBuff[spellId] as HealingBuffHot).playersActive.splice(
          (this.healingBuff[spellId] as HealingBuffHot).playersActive.indexOf(event.targetID),
          1,
        );
      }
    }

    // These 3 heals only have 1 event and are handled easily
    if (
      this.unleashLifeHealRemaining > 0 &&
      (spellId === TALENTS.HEALING_WAVE_TALENT.id ||
        spellId === SPELLS.HEALING_SURGE.id ||
        (spellId === TALENTS.RIPTIDE_TALENT.id && !event.tick))
    ) {
      this.healingBuff[spellId].healing += calculateEffectiveHealing(
        event,
        UNLEASH_LIFE_HEALING_INCREASE,
      );
      this.unleashLifeHealRemaining = 0;
      debug && console.log('Heal:', spellId);

      // I had to move the HoT application to the heal event as the buffapply event had too many false positives
      if (spellId === TALENTS.RIPTIDE_TALENT.id) {
        (this.healingBuff[spellId] as HealingBuffHot).playersActive.push(event.targetID);
        debug && console.log('HoT Applied:', spellId, event.targetID);
      }

      // Chain heal has up to 4 events, setting the variable to -1 to indicate that there might be more events coming
    } else if (
      spellId === TALENTS.CHAIN_HEAL_TALENT.id &&
      (this.unleashLifeHealRemaining > 0 ||
        (this.unleashLifeHealRemaining < 0 &&
          this.buffedChainHealTimestamp + BUFFER_MS > event.timestamp))
    ) {
      this.healingBuff[spellId].healing += calculateEffectiveHealing(
        event,
        UNLEASH_LIFE_HEALING_INCREASE,
      );
      this.unleashLifeHealRemaining = -1;
      this.buffedChainHealTimestamp = event.timestamp;
      debug && console.log('Heal:', spellId);
    }
  }

  _onCast(event: CastEvent) {
    const spellId = event.ability.guid;

    if (spellId === TALENTS.UNLEASH_LIFE_TALENT.id) {
      this.unleashLifeCasts += 1;
      this.unleashLifeRemaining = true;
      this.lastUnleashLifeTimestamp = event.timestamp;
      debug && console.log('New Unleash', event.timestamp);
    }

    if (
      this.unleashLifeRemaining &&
      this.lastUnleashLifeTimestamp + UNLEASH_LIFE_DURATION <= event.timestamp
    ) {
      this.unleashLifeRemaining = false;
      debug && console.log('Cast Timed out', event.timestamp);
      return;
    }

    if (this.unleashLifeRemaining) {
      if (this.healingBuff[spellId]) {
        this.healingBuff[spellId].castAmount += 1;
        this.unleashLifeRemaining = false;
        debug && console.log('Cast:', spellId);
      }
    }
  }

  _onRiptideRemoval(event: RemoveBuffEvent) {
    const spellId = event.ability.guid;
    if (!(this.healingBuff[spellId] as HealingBuffHot).playersActive.includes(event.targetID)) {
      return;
    }

    (this.healingBuff[spellId] as HealingBuffHot).playersActive.splice(
      (this.healingBuff[spellId] as HealingBuffHot).playersActive.indexOf(event.targetID),
      1,
    );
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
        color: RESTORATION_COLORS.CHAIN_HEAL,
        label: <Trans id="shaman.restoration.spell.chainHeal">Chain Heal</Trans>,
        spellId: TALENTS.CHAIN_HEAL_TALENT.id,
        value: this.healingBuff[TALENTS.CHAIN_HEAL_TALENT.id].castAmount,
      },
      {
        color: RESTORATION_COLORS.HEALING_WAVE,
        label: <Trans id="shaman.restoration.spell.healingWave">Healing Wave</Trans>,
        spellId: TALENTS.HEALING_WAVE_TALENT.id,
        value: this.healingBuff[TALENTS.HEALING_WAVE_TALENT.id].castAmount,
      },
      {
        color: RESTORATION_COLORS.HEALING_SURGE,
        label: <Trans id="shaman.restoration.spell.healingSurge">Healing Surge</Trans>,
        spellId: SPELLS.HEALING_SURGE.id,
        value: this.healingBuff[SPELLS.HEALING_SURGE.id].castAmount,
      },
      {
        color: RESTORATION_COLORS.RIPTIDE,
        label: <Trans id="shaman.restoration.spell.riptide">Riptide</Trans>,
        spellId: TALENTS.RIPTIDE_TALENT.id,
        value: this.healingBuff[TALENTS.RIPTIDE_TALENT.id].castAmount,
      },
      {
        color: RESTORATION_COLORS.HEALING_RAIN,
        label: <Trans id="shaman.restoration.spell.healing_rain">Healing Rain</Trans>,
        spellId: TALENTS.HEALING_RAIN_TALENT.id,
        value: this.healingBuff[TALENTS.HEALING_RAIN_TALENT.id].castAmount,
      },
      {
        color: RESTORATION_COLORS.WELLSPRING,
        label: <Trans id="shaman.restoration.spell.wellspring">Wellspring</Trans>,
        spellId: TALENTS.WELLSPRING_TALENT.id,
        value: this.healingBuff[TALENTS.WELLSPRING_TALENT.id].castAmount,
      },
      {
        color: RESTORATION_COLORS.DOWNPOUR,
        label: <Trans id="shaman.restoration.spell.downpour">Downpour</Trans>,
        spellId: TALENTS.DOWNPOUR_TALENT.id,
        value: this.healingBuff[TALENTS.DOWNPOUR_TALENT.id].castAmount,
      },
      {
        color: RESTORATION_COLORS.UNUSED,
        label: <Trans id="shaman.restoration.unleashLife.chart.unused.label">Unused Buffs</Trans>,
        tooltip: (
          <Trans id="shaman.restoration.unleashLife.chart.unused.label.tooltip">
            The amount of Unleash Life buffs you did not use out of the total available. You cast{' '}
            {this.unleashLifeCasts} Unleash Lifes, of which you used {this.totalUses}.
          </Trans>
        ),
        value: unusedUL,
      },
    ];

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
        </div>
      </Statistic>
    );
  }

  subStatistic() {
    return (
      <StatisticListBoxItem
        title={<SpellLink id={TALENTS.UNLEASH_LIFE_TALENT.id} />}
        value={`${formatPercentage(
          this.owner.getPercentageOfTotalHealingDone(this.healing + this.totalBuffedHealing),
        )} %`}
        valueTooltip={
          <Trans id="shaman.restoration.unleashLife.statistic.tooltip">
            {formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.healing))}% from
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
