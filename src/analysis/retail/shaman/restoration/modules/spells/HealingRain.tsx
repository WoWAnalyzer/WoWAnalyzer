import { defineMessage, Trans } from '@lingui/macro';
import SPELLS from 'common/SPELLS';
import TALENTS, { TALENTS_SHAMAN } from 'common/TALENTS/shaman';
import { SpellIcon } from 'interface';
import { SpellLink } from 'interface';
import { TooltipElement } from 'interface';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { RoundedPanel } from 'interface/guide/components/GuideDivs';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { HealEvent, CastEvent } from 'parser/core/Events';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import Combatants from 'parser/shared/modules/Combatants';
import CastEfficiencyBar from 'parser/ui/CastEfficiencyBar';
import { GapHighlight } from 'parser/ui/CooldownBar';
import StatisticBox, { STATISTIC_ORDER } from 'parser/ui/StatisticBox';
import { GUIDE_CORE_EXPLANATION_PERCENT } from '../../Guide';
import { HEALING_RAIN_TARGETS } from '../../constants';

// 50 was too low, 100 was too high
// had no issues with 85ms
const BUFFER_MS = 85;
const UNLEASH_LIFE_DURATION = 100;
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
  unleashLifeRemaining = false;
  lastUnleashLifeTimestamp: number = Number.MAX_SAFE_INTEGER;
  casts = 0;

  unleashLifeSpells = {
    [TALENTS.RIPTIDE_TALENT.id]: {},
    [TALENTS.CHAIN_HEAL_TALENT.id]: {},
    [TALENTS.HEALING_WAVE_TALENT.id]: {},
    [SPELLS.HEALING_SURGE.id]: {},
    [TALENTS.WELLSPRING_TALENT.id]: {},
    [TALENTS.HEALING_RAIN_TALENT.id]: {},
    [TALENTS.DOWNPOUR_TALENT.id]: {},
  };

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.HEALING_RAIN_TALENT);

    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.HEALING_RAIN_HEAL),
      this.onHealingRainHeal,
    );
    this.addEventListener(Events.cast.by(SELECTED_PLAYER), this._onCast);
  }

  get averageMaxTargets() {
    return this.totalMaxTargets / this.casts;
  }

  get averageHitsPerTick() {
    const totalHits = this.healingRainTicks.reduce((total, tick) => total + tick.hits, 0);
    return totalHits / this.healingRainTicks.length;
  }

  suggestions(when: When) {
    const suggestionThreshold = this.suggestionThreshold;
    when(suggestionThreshold.actual)
      .isLessThan(suggestionThreshold.isLessThan.minor)
      .addSuggestion((suggest, actual, recommended) =>
        suggest(
          <span>
            Try to always cast <SpellLink spell={TALENTS.HEALING_RAIN_TALENT} /> in areas where
            players stack. This allows the spell to consitantly hit all possible targets.
          </span>,
        )
          .icon(TALENTS.HEALING_RAIN_TALENT.icon)
          .actual(
            defineMessage({
              id: 'shaman.restoration.suggestions.healingRain.averageTargets',
              message: `${suggestionThreshold.actual.toFixed(2)} average targets healed`,
            }),
          )
          .recommended(
            `${suggestionThreshold.isLessThan.minor} average targets healed is recommended`,
          )
          .regular(suggestionThreshold.isLessThan.average)
          .major(suggestionThreshold.isLessThan.average),
      );
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

  _onCast(event: CastEvent) {
    const spellId = event.ability.guid;

    if (spellId === TALENTS.HEALING_RAIN_TALENT.id) {
      this.totalMaxTargets += HEALING_RAIN_TARGETS;
      this.casts += 1;
      this.maxTargets = HEALING_RAIN_TARGETS;
      if (this.unleashLifeRemaining === true) {
        this.maxTargets += 2;
        this.totalMaxTargets += 2;
      }
    }

    if (spellId === TALENTS.UNLEASH_LIFE_TALENT.id) {
      this.unleashLifeRemaining = true;
      this.lastUnleashLifeTimestamp = event.timestamp;
    }

    if (
      this.unleashLifeRemaining &&
      this.lastUnleashLifeTimestamp + UNLEASH_LIFE_DURATION <= event.timestamp
    ) {
      this.unleashLifeRemaining = false;
      return;
    }

    if (this.unleashLifeRemaining) {
      if (this.unleashLifeSpells[spellId]) {
        this.unleashLifeRemaining = false;
      }
    }
  }

  /** Guide subsection describing the proper usage of Healing Rain */
  get guideSubsection(): JSX.Element {
    const explanation = (
      <p>
        <b>
          <SpellLink spell={TALENTS_SHAMAN.HEALING_RAIN_TALENT} />
        </b>{' '}
        is one of your best sources of consistent throughput and can be augmented to do more healing
        through <SpellLink spell={TALENTS.OVERFLOWING_SHORES_TALENT} />, more damage through{' '}
        <SpellLink spell={TALENTS.ACID_RAIN_TALENT} />, and can hit additional targets through{' '}
        <SpellLink spell={TALENTS.UNLEASH_LIFE_TALENT} />. Aside from being strong throughput, this{' '}
        spell also buffs <SpellLink spell={TALENTS.HEALING_WAVE_TALENT} />,{' '}
        <SpellLink spell={SPELLS.HEALING_SURGE} /> and{' '}
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
        spellId={TALENTS_SHAMAN.HEALING_RAIN_TALENT.id}
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
