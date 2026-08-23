import type { JSX } from 'react';
import { Trans } from '@lingui/react/macro';
import SPELLS from 'common/SPELLS';
import TALENTS, { TALENTS_SHAMAN } from 'common/TALENTS/shaman';
import { SpellIcon, SpellLink, TooltipElement } from 'interface';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { RoundedPanel } from 'interface/guide/components/GuideDivs';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, HealEvent } from 'parser/core/Events';
import { ThresholdStyle } from 'parser/core/ParseResults';
import Combatants from 'parser/shared/modules/Combatants';
import CastEfficiencyBar from 'parser/ui/CastEfficiencyBar';
import { GapHighlight } from 'parser/ui/CooldownBar';
import StatisticBox, { STATISTIC_ORDER } from 'parser/ui/StatisticBox';
import { GUIDE_CORE_EXPLANATION_PERCENT } from '../../Guide';
import { HEALING_RAIN_TARGETS } from '../../constants';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';

// 50 was too low, 100 was too high
// had no issues with 85ms
const BUFFER_MS = 85;
interface HealingRainTickInfo {
  timestamp: number;
  hits: number;
}

class HealingRain extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  protected combatants!: Combatants;

  healingRainTicks: HealingRainTickInfo[] = [];
  maxTargets = HEALING_RAIN_TARGETS;
  totalMaxTargets = 0;
  casts = 0;

  constructor(options: Options) {
    super(options);
    this.active =
      this.selectedCombatant.hasTalent(TALENTS.HEALING_RAIN_TALENT) &&
      !this.selectedCombatant.hasTalent(TALENTS.SURGING_TOTEM_TALENT);
    if (!this.active) {
      return;
    }

    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.HEALING_RAIN_HEAL),
      this.onHealingRainHeal,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS_SHAMAN.HEALING_RAIN_TALENT),
      this.onHealingRainCast,
    );
  }

  get averageMaxTargets() {
    return this.totalMaxTargets / this.casts;
  }

  get averageHitsPerTick() {
    const totalHits = this.healingRainTicks.reduce((total, tick) => total + tick.hits, 0);
    return totalHits / this.healingRainTicks.length;
  }

  get suggestionThreshold() {
    return {
      actual: this.averageHitsPerTick,
      isLessThan: {
        minor: 4,
        average: 3,
        major: 2,
      },
      style: ThresholdStyle.NUMBER,
    };
  }

  onHealingRainHeal(event: HealEvent) {
    // Filter out pets, but only if it fully overhealed as Rain will prioritize injured pets over non-injured players
    // fully overhealing guarantees that there are not enough players in the healing rain
    const combatant = this.combatants.getEntity(event);
    if (!combatant && event.overheal && event.amount === 0) {
      return;
    }

    const healingRainTick = this.healingRainTicks.find(
      (tick) => event.timestamp - BUFFER_MS <= tick.timestamp,
    );
    if (!healingRainTick) {
      this.healingRainTicks.push({
        timestamp: event.timestamp,
        hits: 1,
      });
    } else {
      // dirty fix for partial ticks happening at the same time as a real tick
      healingRainTick.hits = Math.min(this.maxTargets, healingRainTick.hits + 1);
    }
  }

  onHealingRainCast(event: CastEvent) {
    this.totalMaxTargets += HEALING_RAIN_TARGETS;
    this.casts += 1;
    this.maxTargets = HEALING_RAIN_TARGETS;
  }

  /** Guide subsection describing the proper usage of Healing Rain */
  get guideSubsection(): JSX.Element {
    const explanation = (
      <p>
        <b>
          <SpellLink spell={TALENTS_SHAMAN.HEALING_RAIN_TALENT} />
        </b>{' '}
        is one of your best sources of consistent throughput and can be augmented to do more healing
        through <SpellLink spell={TALENTS.OVERFLOWING_SHORES_TALENT} /> and more damage through{' '}
        <SpellLink spell={TALENTS.ACID_RAIN_TALENT} />. Aside from being strong throughput, this{' '}
        spell also buffs <SpellLink spell={SPELLS.HEALING_WAVE} /> and{' '}
        <SpellLink spell={TALENTS.CHAIN_HEAL_TALENT} /> through{' '}
        <SpellLink spell={TALENTS.DELUGE_TALENT} />
      </p>
    );

    const data = (
      <div>
        <RoundedPanel>
          <strong>
            <SpellLink spell={TALENTS_SHAMAN.HEALING_RAIN_TALENT} /> cast efficiency
          </strong>
          <div className="flex-main chart" style={{ padding: 15 }}>
            {this.subStatistic()}
          </div>
        </RoundedPanel>
      </div>
    );

    return explanationAndDataSubsection(explanation, data, GUIDE_CORE_EXPLANATION_PERCENT);
  }

  subStatistic() {
    return (
      <CastEfficiencyBar
        spell={TALENTS_SHAMAN.HEALING_RAIN_TALENT}
        gapHighlightMode={GapHighlight.FullCooldown}
        minimizeIcons
        useThresholds
      />
    );
  }

  statistic() {
    if (isNaN(this.averageHitsPerTick)) {
      return false;
    }

    return (
      <StatisticBox
        category={STATISTIC_CATEGORY.TALENTS}
        icon={<SpellIcon spell={SPELLS.HEALING_RAIN_HEAL} />}
        value={`${this.averageHitsPerTick.toFixed(2)}`}
        position={STATISTIC_ORDER.OPTIONAL()}
        label={
          <TooltipElement
            content={
              <Trans id="shaman.restoration.healingRain.averageTargets.label.tooltip">
                The average number of targets healed by Healing Rain out of the maximum amount of{' '}
                {HEALING_RAIN_TARGETS}
                targets.
              </Trans>
            }
          >
            <Trans id="shaman.restoration.healingRain.averageTargets.label">
              Average Healing Rain Targets
            </Trans>
          </TooltipElement>
        }
      />
    );
  }
}

export default HealingRain;
