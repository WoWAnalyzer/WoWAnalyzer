import { defineMessage, Trans } from '@lingui/macro';
import SPELLS from 'common/SPELLS';
import TALENTS, { TALENTS_SHAMAN } from 'common/TALENTS/shaman';
import { SpellIcon } from 'interface';
import { SpellLink } from 'interface';
import { TooltipElement } from 'interface';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { RoundedPanel } from 'interface/guide/components/GuideDivs';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { HealEvent, CastEvent, RemoveBuffEvent } from 'parser/core/Events';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import Combatants from 'parser/shared/modules/Combatants';
import CastEfficiencyBar from 'parser/ui/CastEfficiencyBar';
import { GapHighlight } from 'parser/ui/CooldownBar';
import StatisticBox, { STATISTIC_ORDER } from 'parser/ui/StatisticBox';
import { GUIDE_CORE_EXPLANATION_PERCENT } from '../../../Guide';
import { BoxRowEntry } from 'interface/guide/components/PerformanceBoxRow';
import { didMoteExpire } from '../../../normalizers/CastLinkNormalizer';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import CastSummaryAndBreakdown from 'interface/guide/components/CastSummaryAndBreakdown';
import { HEALING_RAIN_TARGETS } from '../../../constants';

// 50 was too low, 100 was too high
// had no issues with 85ms
const BUFFER_MS = 85;
const WHIRLING_AIR_ID = SPELLS.WHIRLING_AIR.id;
const WHIRLING_EARTH_ID = SPELLS.WHIRLING_EARTH.id;
const WHIRLING_WATER_ID = SPELLS.WHIRLING_WATER.id;

interface HealingRainTickInfo {
  timestamp: number;
  hits: number;
}

type SurgingTotemCast = {
  timestamp: number;
  WHIRLING_AIR_ID: number;
  WHIRLING_EARTH_ID: number;
  WHIRLING_WATER_ID: number;
};

class SurgingTotem extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  protected combatants!: Combatants;

  healingRainTicks: HealingRainTickInfo[] = [];
  maxTargets = HEALING_RAIN_TARGETS;
  totalMaxTargets = 0;
  casts = 0;

  //SurgingTotemCasts: Cast[] = [];
  SurgingTotemCasts: SurgingTotemCast[] = [];
  castEntries: BoxRowEntry[] = [];

  whirlingMotesConsumed: Record<number, number> = {
    [SPELLS.WHIRLING_AIR.id]: 0,
    [SPELLS.WHIRLING_EARTH.id]: 0,
    [SPELLS.WHIRLING_WATER.id]: 0,
  };

  whirlingMotesExpired: Record<number, number> = {
    [SPELLS.WHIRLING_AIR.id]: 0,
    [SPELLS.WHIRLING_EARTH.id]: 0,
    [SPELLS.WHIRLING_WATER.id]: 0,
  };

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.SURGING_TOTEM_TALENT);

    const whirlingMotes = [SPELLS.WHIRLING_AIR, SPELLS.WHIRLING_EARTH, SPELLS.WHIRLING_WATER];

    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.HEALING_RAIN_TOTEMIC),
      this.onHealingRainHeal,
    );
    this.addEventListener(Events.cast.by(SELECTED_PLAYER), this._onCast);
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(whirlingMotes),
      this._onRemoveBuff,
    );
    this.addEventListener(Events.fightend, this._onFightEnd);
  }

  _onFightEnd() {
    this._rateCasts(this.SurgingTotemCasts);
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
            Try to always cast <SpellLink spell={SPELLS.HEALING_RAIN_TOTEMIC} /> in areas where
            players stack. This allows the spell to consistently hit all possible targets. You can{' '}
            {!this.selectedCombatant.hasTalent(TALENTS_SHAMAN.TOTEMIC_PROJECTION_TALENT) ? (
              <>talent into </>
            ) : (
              <>use </>
            )}
            <SpellLink spell={TALENTS_SHAMAN.TOTEMIC_PROJECTION_TALENT} /> to reposition it every 10
            seconds.
          </span>,
        )
          .icon(SPELLS.HEALING_RAIN_TOTEMIC.icon)
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

    if (spellId === SPELLS.SURGING_TOTEM.id) {
      this.SurgingTotemCasts.push({
        timestamp: event.timestamp,
        WHIRLING_AIR_ID: 0,
        WHIRLING_EARTH_ID: 0,
        WHIRLING_WATER_ID: 0,
      });
    }

    if (spellId === SPELLS.HEALING_RAIN_TOTEMIC.id) {
      this.totalMaxTargets += HEALING_RAIN_TARGETS;
      this.casts += 1;
      this.maxTargets = HEALING_RAIN_TARGETS;
    }
  }

  _onRemoveBuff(event: RemoveBuffEvent) {
    const spellId = event.ability.guid;
    if (didMoteExpire(event)) {
      this.whirlingMotesExpired[spellId] += 1;
    } else {
      this.whirlingMotesConsumed[spellId] += 1;
      switch (event.ability.guid) {
        case WHIRLING_AIR_ID: {
          this.SurgingTotemCasts[this.SurgingTotemCasts.length - 1].WHIRLING_AIR_ID = 1;
          break;
        }
        case WHIRLING_EARTH_ID: {
          this.SurgingTotemCasts[this.SurgingTotemCasts.length - 1].WHIRLING_EARTH_ID = 1;
          break;
        }
        case WHIRLING_WATER_ID: {
          this.SurgingTotemCasts[this.SurgingTotemCasts.length - 1].WHIRLING_WATER_ID = 1;
          break;
        }
        default:
          break;
      }
    }
  }

  /** Guide subsection describing the proper usage of Surging Totem */
  get guideSubsection(): JSX.Element {
    const explanation = (
      <>
        <p>
          <b>
            <SpellLink spell={SPELLS.SURGING_TOTEM} />
          </b>{' '}
          is central to your gameplay as a Totemic Shaman. It should be active at all times as it
          casts a longer and more potent version of{' '}
          <SpellLink spell={SPELLS.HEALING_RAIN_TOTEMIC} />. You can{' '}
          {!this.selectedCombatant.hasTalent(TALENTS_SHAMAN.TOTEMIC_PROJECTION_TALENT) ? (
            <>talent into </>
          ) : (
            <>use </>
          )}
          <SpellLink spell={TALENTS_SHAMAN.TOTEMIC_PROJECTION_TALENT} /> to reposition it every 10
          seconds.
        </p>
        <p>
          It can be augmented to do more healing through{' '}
          <SpellLink spell={TALENTS.OVERFLOWING_SHORES_TALENT} /> and more damage through{' '}
          <SpellLink spell={TALENTS.ACID_RAIN_TALENT} />. Aside from being strong throughput, this
          spell also buffs <SpellLink spell={TALENTS.HEALING_WAVE_TALENT} />,{' '}
          <SpellLink spell={SPELLS.HEALING_SURGE} /> and{' '}
          <SpellLink spell={TALENTS.CHAIN_HEAL_TALENT} /> through{' '}
          <SpellLink spell={TALENTS.DELUGE_TALENT} />.
        </p>
        {this.selectedCombatant.hasTalent(TALENTS_SHAMAN.WHIRLING_ELEMENTS_TALENT) && (
          <p>
            Through <SpellLink spell={TALENTS_SHAMAN.WHIRLING_ELEMENTS_TALENT} />, every cast
            produces three motes, each offering a powerful buff :{' '}
            <SpellLink spell={SPELLS.WHIRLING_AIR} />, <SpellLink spell={SPELLS.WHIRLING_EARTH} />{' '}
            and <SpellLink spell={SPELLS.WHIRLING_WATER} />. You should always try and consume these
            buffs.
          </p>
        )}
      </>
    );

    // TODO add cast breakdown
    const data = (
      <div>
        <RoundedPanel>
          <strong>
            <SpellLink spell={SPELLS.SURGING_TOTEM} /> cast efficiency
          </strong>
          <div className="flex-main chart" style={{ padding: 15 }}>
            {this.subStatistic()}
          </div>
          {this.selectedCombatant.hasTalent(TALENTS.SURGING_TOTEM_TALENT) &&
            this.guideCastBreakdown()}
        </RoundedPanel>
      </div>
    );

    return explanationAndDataSubsection(explanation, data, GUIDE_CORE_EXPLANATION_PERCENT);
  }

  subStatistic() {
    return (
      <CastEfficiencyBar
        spellId={SPELLS.HEALING_RAIN_TOTEMIC.id}
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
              <Trans id="shaman.restoration.healingRainTotemic.averageTargets.label.tooltip">
                The average number of targets healed by Healing Rain out of the maximum amount of{' '}
                {HEALING_RAIN_TARGETS}
                targets.
              </Trans>
            }
          >
            <Trans id="shaman.restoration.healingRainTotemic.averageTargets.label">
              Average Healing Rain Targets
            </Trans>
          </TooltipElement>
        }
      />
    );
  }
  //<PerformanceBoxRow values={this.castEntries} />
  guideCastBreakdown() {
    return (
      <>
        <div>
          Over the course of the fight, you cast <strong>{this.SurgingTotemCasts.length}</strong>{' '}
          <SpellLink spell={TALENTS.SURGING_TOTEM_TALENT} /> and consumed{' '}
          <strong>{this.whirlingMotesConsumed[SPELLS.WHIRLING_AIR.id]}</strong>{' '}
          <SpellLink spell={SPELLS.WHIRLING_AIR} />,{' '}
          <strong>{this.whirlingMotesConsumed[SPELLS.WHIRLING_EARTH.id]}</strong>{' '}
          <SpellLink spell={SPELLS.WHIRLING_EARTH} />, and{' '}
          <strong>{this.whirlingMotesConsumed[SPELLS.WHIRLING_WATER.id]}</strong>{' '}
          <SpellLink spell={SPELLS.WHIRLING_WATER} />. The following breakdown represents your usage
          of the elemental motes.
        </div>

        <CastSummaryAndBreakdown
          spell={SPELLS.SURGING_TOTEM}
          castEntries={this.castEntries}
          perfectExtraExplanation="all 3 motes consumed"
          goodExtraExplanation="2 motes consumed"
          okExtraExplanation="1 mote consumed"
          badExtraExplanation="all motes wasted"
        />
      </>
    );
  }

  _rateCasts(casts: SurgingTotemCast[]) {
    casts.forEach((SurgingTotemCast) => {
      let value = null;

      switch (
        SurgingTotemCast.WHIRLING_AIR_ID +
        SurgingTotemCast.WHIRLING_EARTH_ID +
        SurgingTotemCast.WHIRLING_WATER_ID
      ) {
        case 3:
          value = QualitativePerformance.Perfect;
          break;
        case 2:
          value = QualitativePerformance.Good;
          break;
        case 1:
          value = QualitativePerformance.Ok;
          break;
        default:
          value = QualitativePerformance.Fail;
      }

      const tooltip = (
        <>
          <div>
            <strong>@ {this.owner.formatTimestamp(SurgingTotemCast.timestamp)}</strong>
          </div>
          {!SurgingTotemCast.WHIRLING_AIR_ID && (
            <div>
              <SpellLink spell={SPELLS.WHIRLING_AIR} /> not consumed.
            </div>
          )}
          {!SurgingTotemCast.WHIRLING_EARTH_ID && (
            <div>
              <SpellLink spell={SPELLS.WHIRLING_EARTH} /> not consumed.
            </div>
          )}
          {!SurgingTotemCast.WHIRLING_WATER_ID && (
            <div>
              <SpellLink spell={SPELLS.WHIRLING_WATER} /> not consumed.
            </div>
          )}
          {value === QualitativePerformance.Perfect && <div>All motes consumed ✅</div>}
        </>
      );

      this.castEntries.push({ value, tooltip });
    });
  }
}

export default SurgingTotem;
