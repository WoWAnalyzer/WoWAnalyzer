import { Trans } from '@lingui/macro';
import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/shaman';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { calculateEffectiveHealing } from 'parser/core/EventCalculateLib';
import Events, {
  AbsorbedEvent,
  ApplyBuffEvent,
  CastEvent,
  HealEvent,
  RefreshBuffEvent,
  RemoveBuffEvent,
} from 'parser/core/Events';
import DonutChart from 'parser/ui/DonutChart';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { STATISTIC_ORDER } from 'parser/ui/StatisticsListBox';

import {
  CHAIN_HEAL_TARGETS,
  DOWNPOUR_TARGETS,
  HEALING_RAIN_TARGETS,
  RESTORATION_COLORS,
  UNLEASH_LIFE_CHAIN_HEAL_INCREASE,
  UNLEASH_LIFE_EXTRA_TARGETS,
  UNLEASH_LIFE_HEALING_INCREASE,
  UNLEASH_LIFE_REMOVE_MS,
} from '../../constants';
import CooldownThroughputTracker from '../features/CooldownThroughputTracker';
import {
  getHealingRainEvents,
  getHealingRainHealEventsForTick,
  getOverflowingShoresEvents,
  getDownPourEvents,
} from '../../normalizers/CastLinkNormalizer';
import {
  getCastEvent,
  getUnleashLifeHealingWaves,
  isBuffedByUnleashLife,
  wasUnleashLifeConsumed,
} from '../../normalizers/UnleashLifeNormalizer';
import RiptideTracker from '../core/RiptideTracker';
import ChainHealNormalizer from '../../normalizers/ChainHealNormalizer';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import TalentSpellText from 'parser/ui/TalentSpellText';
import WarningIcon from 'interface/icons/Warning';
import CheckmarkIcon from 'interface/icons/Checkmark';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { RoundedPanel } from 'interface/guide/components/GuideDivs';
import CastEfficiencyBar from 'parser/ui/CastEfficiencyBar';
import { GapHighlight } from 'parser/ui/CooldownBar';
import { GUIDE_CORE_EXPLANATION_PERCENT } from '../../Guide';
import { BoxRowEntry, PerformanceBoxRow } from 'interface/guide/components/PerformanceBoxRow';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';

const debug = false;

interface HealingMap {
  [spellId: number]: {
    amount: number;
    casts: number;
  };
}

interface TooltipData {
  spellId: number;
  amount: number;
  active: boolean;
  extraHits?: number;
  missedHits?: number;
}
/**
 * Unleash Life:
 * Unleashes elemental forces of Life, healing a friendly target and increasing the effect of the Shaman's next direct heal.
 */

class UnleashLife extends Analyzer {
  static dependencies = {
    cooldownThroughputTracker: CooldownThroughputTracker,
    riptideTracker: RiptideTracker,
    chainHealNormalizer: ChainHealNormalizer,
  };
  chainHealNormalizer!: ChainHealNormalizer;
  protected riptideTracker!: RiptideTracker;
  protected cooldownThroughputTracker!: CooldownThroughputTracker;

  wastedBuffs: number = 0;
  healingMap: HealingMap = {
    [TALENTS.RIPTIDE_TALENT.id]: {
      amount: 0,
      casts: 0,
    },
    [TALENTS.CHAIN_HEAL_TALENT.id]: {
      amount: 0,
      casts: 0,
    },
    [SPELLS.HEALING_WAVE.id]: {
      amount: 0,
      casts: 0,
    },
    [SPELLS.HEALING_SURGE.id]: {
      amount: 0,
      casts: 0,
    },
    [TALENTS.WELLSPRING_TALENT.id]: {
      amount: 0,
      casts: 0,
    },
    [TALENTS.HEALING_RAIN_TALENT.id]: {
      amount: 0,
      casts: 0,
    },
    [SPELLS.DOWNPOUR_ABILITY.id]: {
      amount: 0,
      casts: 0,
    },
  };
  //ul direct
  directHealing: number = 0;

  //healing wave
  healingWaveHealing: number = 0;

  //chain heal
  chainHealHealing: number = 0;
  missedJumps: number = 0;

  //healing rain
  healingRainHealing: number = 0;
  overflowingShoresActive: boolean;
  overflowingShoresHealing: number = 0;
  countedHealingRainEvents: Set<number> = new Set<number>();
  extraTicks: number = 0;
  missedTicks: number = 0;
  extraOSTicks: number = 0;
  missedOSTicks: number = 0;

  //downpour
  missedDownpourHits: number = 0;
  extraDownpourHits: number = 0;
  downpourActive: boolean;

  unleashLifeCount = 0;
  ulActive: boolean = false;
  lastUlSpellId: number = -1;
  lastRemoved: number = -1;

  //guide vars
  castEntries: BoxRowEntry[] = [];
  goodSpells: number[] = [];
  okSpells: number[] = [];

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.UNLEASH_LIFE_TALENT);

    this.overflowingShoresActive = this.selectedCombatant.hasTalent(
      TALENTS.OVERFLOWING_SHORES_TALENT,
    );
    this.downpourActive = this.selectedCombatant.hasTalent(TALENTS.DOWNPOUR_TALENT);
    const spellFilter = [
      TALENTS.CHAIN_HEAL_TALENT,
      SPELLS.HEALING_WAVE,
      SPELLS.HEALING_SURGE,
      TALENTS.WELLSPRING_TALENT,
      TALENTS.HEALING_RAIN_TALENT,
      SPELLS.DOWNPOUR_ABILITY,
    ];
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(spellFilter), this._onCast);
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(TALENTS.UNLEASH_LIFE_TALENT),
      this._onHealUL,
    );
    this.addEventListener(
      Events.absorbed.by(SELECTED_PLAYER).spell(SPELLS.WELLSPRING_UNLEASH_LIFE),
      this._onWellspring,
    );
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.HEALING_SURGE),
      this._onHealingSurge,
    );
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(TALENTS.RIPTIDE_TALENT),
      this._onRiptide,
    );
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(TALENTS.UNLEASH_LIFE_TALENT),
      this._onApplyUL,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(TALENTS.UNLEASH_LIFE_TALENT),
      this._onRemoveUL,
    );
    this.goodSpells.push(TALENTS.HEALING_RAIN_TALENT.id);

    if (this.selectedCombatant.hasTalent(TALENTS.HIGH_TIDE_TALENT)) {
      this.goodSpells.push(TALENTS.CHAIN_HEAL_TALENT.id);
    } else {
      this.okSpells.push(TALENTS.CHAIN_HEAL_TALENT.id);
    }
    if (this.downpourActive) {
      this.goodSpells.push(SPELLS.DOWNPOUR_ABILITY.id);
    }
  }
  //necessary because riptide can be spellqued into the spell that actually consumed UL and event linking will match both
  _wasAlreadyConsumed(event: CastEvent | HealEvent) {
    if (this.lastRemoved + UNLEASH_LIFE_REMOVE_MS < event.timestamp || this.ulActive) {
      this.ulActive = false;
      this.lastUlSpellId = event.ability.guid;
      return false;
    }
    return true;
  }

  _onApplyUL(event: ApplyBuffEvent) {
    this.unleashLifeCount += 1;
    this.ulActive = true;
  }

  _onHealUL(event: HealEvent) {
    this.directHealing += event.amount + (event.absorbed || 0);
  }

  _onCast(event: CastEvent) {
    const spellId = event.ability.guid;
    if (isBuffedByUnleashLife(event) && !this._wasAlreadyConsumed(event)) {
      this.healingMap[spellId].casts += 1;
      this.tallyCastEntry(spellId);
      debug &&
        console.log(
          'Unleash Life ' +
            event.ability.name +
            ' at ' +
            this.owner.formatTimestamp(event.timestamp, 3) +
            ' ',
          event,
        );
      switch (spellId) {
        case SPELLS.HEALING_WAVE.id:
          this._onHealingWave(event);
          break;
        case TALENTS.HEALING_RAIN_TALENT.id:
          this._onHealingRain(event);
          break;
        case TALENTS.CHAIN_HEAL_TALENT.id:
          this._onChainHeal(event);
          break;
        case SPELLS.DOWNPOUR_ABILITY.id:
          this._onDownpour(event);
          break;
        default:
          //riptide, healing surge, and wellspring are handled
          //with their own event listeners
          return;
      }
    }
  }

  _onRemoveUL(event: RemoveBuffEvent) {
    this.lastRemoved = event.timestamp;
    if (wasUnleashLifeConsumed(event)) {
      return;
    }
    this.wastedBuffs += 1;
    this.tallyCastEntry(-1);
  }

  private _onWellspring(event: AbsorbedEvent) {
    this.healingMap[TALENTS.WELLSPRING_TALENT.id].amount += event.amount;
  }

  private _onHealingSurge(event: HealEvent) {
    const castEvent = getCastEvent(event);
    if (castEvent && isBuffedByUnleashLife(castEvent)) {
      this.tallyCastEntry(event.ability.guid);
      this.healingMap[event.ability.guid].amount += calculateEffectiveHealing(
        event,
        UNLEASH_LIFE_HEALING_INCREASE,
      );
    }
  }

  private _onRiptide(event: HealEvent) {
    const spellId = event.ability.guid;
    const targetId = event.targetID;
    //hot ticks -- the hot tracker resets attributions on refresh buff, so if a UL Riptide gets overwritten it will be excluded here
    if (event.tick) {
      if (!this.riptideTracker.hots[targetId] || !this.riptideTracker.hots[targetId][spellId]) {
        return;
      }
      const riptide = this.riptideTracker.hots[targetId][spellId];
      if (this.riptideTracker.fromUnleashLife(riptide)) {
        debug && console.log('Unleash Life Riptide Tick: ', event);
        this.healingMap[spellId].amount += calculateEffectiveHealing(
          event,
          UNLEASH_LIFE_HEALING_INCREASE,
        );
      }
      return;
    }
    //we use initial hit heal event here instead of cast because primordial wave riptide can also consume UL
    if (isBuffedByUnleashLife(event) && !this._wasAlreadyConsumed(event)) {
      this.healingMap[spellId].casts += 1;
      this.tallyCastEntry(spellId);
      debug &&
        console.log(
          'Unleash Life ' +
            event.ability.name +
            ' at ' +
            this.owner.formatTimestamp(event.timestamp, 3) +
            ' ',
          event,
        );
      this.healingMap[spellId].amount += calculateEffectiveHealing(
        event,
        UNLEASH_LIFE_HEALING_INCREASE,
      );
    }
  }

  private _onHealingRain(event: CastEvent) {
    //get all the healing rain events related to this cast
    const healingRainEvents = getHealingRainEvents(event);
    healingRainEvents.forEach((event) => {
      //iterate through events grouped by tick to determine target hit count
      if (!this.countedHealingRainEvents.has(event.timestamp)) {
        this.countedHealingRainEvents.add(event.timestamp);
        const tickEvents = getHealingRainHealEventsForTick(event);
        const filteredTicks = tickEvents.splice(HEALING_RAIN_TARGETS);
        if (filteredTicks.length < UNLEASH_LIFE_EXTRA_TARGETS) {
          this.missedTicks += UNLEASH_LIFE_EXTRA_TARGETS - filteredTicks.length;
        }
        this.extraTicks += filteredTicks.length;
        this.healingRainHealing += this._tallyHealing(filteredTicks);
        this.healingMap[TALENTS.HEALING_RAIN_TALENT.id].amount += this._tallyHealing(filteredTicks);
      }
    });
    //tally additional hits from overflowing shores if talented
    if (this.overflowingShoresActive) {
      const overflowingShoresEvents = getOverflowingShoresEvents(event);
      const filteredhits = overflowingShoresEvents.splice(HEALING_RAIN_TARGETS);
      if (filteredhits.length < UNLEASH_LIFE_EXTRA_TARGETS) {
        this.missedOSTicks += UNLEASH_LIFE_EXTRA_TARGETS - filteredhits.length;
      }
      this.extraOSTicks += filteredhits.length;
      this.overflowingShoresHealing += this._tallyHealing(filteredhits);
      this.healingMap[TALENTS.HEALING_RAIN_TALENT.id].amount += this._tallyHealing(filteredhits);
    }
  }

  private _onHealingWave(event: CastEvent) {
    const spellId = event.ability.guid;
    const ulHealingWaves = getUnleashLifeHealingWaves(event);
    if (ulHealingWaves.length > 0) {
      this.healingMap[spellId].amount += this._tallyHealingIncrease(
        ulHealingWaves,
        UNLEASH_LIFE_HEALING_INCREASE,
      );
    }
  }

  private _onChainHeal(event: CastEvent) {
    const orderedChainHeal = this.chainHealNormalizer.normalizeChainHealOrder(event);
    if (orderedChainHeal.length > 0) {
      //target count check --- if less than 4 (5 w/ancestral reach), no extra hit
      if (
        orderedChainHeal.length >
        CHAIN_HEAL_TARGETS + this.selectedCombatant.getTalentRank(TALENTS.ANCESTRAL_REACH_TALENT)
      ) {
        const extraHit = orderedChainHeal.splice(orderedChainHeal.length - 1);
        this.healingMap[event.ability.guid].amount += this._tallyHealing(extraHit);
      } else {
        this.missedJumps += 1;
      }
      this.healingMap[event.ability.guid].amount += this._tallyHealingIncrease(
        orderedChainHeal,
        UNLEASH_LIFE_CHAIN_HEAL_INCREASE,
      );
    }
  }

  private _onDownpour(event: CastEvent) {
    const downpourEvents = getDownPourEvents(event);
    if (downpourEvents.length > 0) {
      const filteredhits = downpourEvents.splice(DOWNPOUR_TARGETS);
      if (filteredhits.length < UNLEASH_LIFE_EXTRA_TARGETS) {
        this.missedDownpourHits += UNLEASH_LIFE_EXTRA_TARGETS - filteredhits.length;
      }
      this.extraDownpourHits += filteredhits.length;
      this.healingMap[SPELLS.DOWNPOUR_ABILITY.id].amount += this._tallyHealing(filteredhits);
    }
  }

  private _tallyHealingIncrease(events: HealEvent[], healIncrease: number): number {
    if (events.length > 0) {
      return events.reduce(
        (amount, event) => amount + calculateEffectiveHealing(event, healIncrease),
        0,
      );
    }
    return 0;
  }

  private _tallyHealing(events: HealEvent[]): number {
    if (events.length > 0) {
      return events.reduce((amount, event) => amount + event.amount, 0);
    }
    return 0;
  }

  private _tooltip(primary: TooltipData, secondary?: TooltipData) {
    return (
      <>
        You used <SpellLink spell={TALENTS.UNLEASH_LIFE_TALENT} /> on{' '}
        <SpellLink spell={primary.spellId} />{' '}
        <strong>{this.healingMap[primary.spellId].casts} </strong>time
        {this.healingMap[primary.spellId].casts > 1 ? <>s</> : <></>}
        <hr />
        <ul>
          {secondary && secondary.active && (
            <li>
              <strong>{formatNumber(this.healingMap[primary.spellId].amount)}</strong> total healing
            </li>
          )}
          <li>
            <strong>{formatNumber(primary.amount)} </strong> extra{' '}
            <SpellLink spell={primary.spellId} /> healing
          </li>
          {primary && primary.extraHits && (
            <li>
              <strong>{primary.extraHits}</strong> extra hits{' '}
              {primary.missedHits! > 0 ? (
                <>
                  , <strong>{primary.missedHits}</strong> missed
                </>
              ) : (
                <></>
              )}
            </li>
          )}
          {secondary && secondary.active && (
            <li>
              <strong>{formatNumber(secondary.amount)}</strong> extra{' '}
              <SpellLink spell={secondary.spellId} /> healing
            </li>
          )}
          {secondary && secondary.active && secondary.extraHits && (
            <li>
              <strong>{secondary.extraHits}</strong> extra hits{' '}
              {secondary.missedHits! > 0 ? (
                <>
                  , <strong>{secondary.missedHits}</strong> missed
                </>
              ) : (
                <></>
              )}
            </li>
          )}
          <li>
            <strong>{formatNumber(this._getAveragePerCast(primary.spellId))} </strong> healing per
            use
          </li>
        </ul>
      </>
    );
  }

  private _getAveragePerCast(spellId: number): number {
    return this.healingMap[spellId].amount / this.healingMap[spellId].casts;
  }

  get totalBuffedHealing() {
    return Object.values(this.healingMap).reduce((sum, spell) => sum + spell.amount, 0);
  }

  get totalHealing() {
    return this.totalBuffedHealing + this.directHealing;
  }

  get buffIcon() {
    return this.wastedBuffs > 0 ? <WarningIcon /> : <CheckmarkIcon />;
  }

  get unleashLifeCastRatioChart() {
    debug && console.log(this.healingMap);
    const items = [
      {
        color: RESTORATION_COLORS.CHAIN_HEAL,
        label: <Trans id="shaman.restoration.spell.chainHeal">Chain Heal</Trans>,
        spellId: TALENTS.CHAIN_HEAL_TALENT.id,
        value: this.healingMap[TALENTS.CHAIN_HEAL_TALENT.id].amount,
        valueTooltip: this._tooltip({
          spellId: TALENTS.CHAIN_HEAL_TALENT.id,
          amount: this.healingMap[TALENTS.CHAIN_HEAL_TALENT.id].amount,
          active: this.selectedCombatant.hasTalent(TALENTS.CHAIN_HEAL_TALENT),
          extraHits: this.healingMap[TALENTS.CHAIN_HEAL_TALENT.id].casts - this.missedJumps,
          missedHits: this.missedJumps,
        }),
      },
      {
        color: RESTORATION_COLORS.DOWNPOUR,
        label: <Trans id="shaman.restoration.spell.downpour">Downpour</Trans>,
        spellId: TALENTS.DOWNPOUR_TALENT.id,
        value: this.healingMap[SPELLS.DOWNPOUR_ABILITY.id].amount,
        valueTooltip: this._tooltip({
          spellId: SPELLS.DOWNPOUR_ABILITY.id,
          amount: this.healingMap[SPELLS.DOWNPOUR_ABILITY.id].amount,
          active: this.selectedCombatant.hasTalent(TALENTS.DOWNPOUR_TALENT),
          extraHits: this.extraDownpourHits,
        }),
      },
      {
        color: RESTORATION_COLORS.HEALING_SURGE,
        label: <Trans id="shaman.restoration.spell.healingSurge">Healing Surge</Trans>,
        spellId: SPELLS.HEALING_SURGE.id,
        value: this.healingMap[SPELLS.HEALING_SURGE.id].amount,
        valueTooltip: this._tooltip({
          spellId: SPELLS.HEALING_SURGE.id,
          amount: this.healingMap[SPELLS.HEALING_SURGE.id].amount,
          active: true,
        }),
      },
      {
        color: RESTORATION_COLORS.HEALING_WAVE,
        label: <Trans id="shaman.restoration.spell.healingWave">Healing Wave</Trans>,
        spellId: SPELLS.HEALING_WAVE.id,
        value: this.healingMap[SPELLS.HEALING_WAVE.id].amount,
        valueTooltip: this._tooltip({
          spellId: SPELLS.HEALING_WAVE.id,
          amount: this.healingWaveHealing,
          active: true,
        }),
      },
      {
        color: RESTORATION_COLORS.HEALING_RAIN,
        label: <Trans id="shaman.restoration.spell.healing_rain">Healing Rain</Trans>,
        spellId: TALENTS.HEALING_RAIN_TALENT.id,
        value: this.healingMap[TALENTS.HEALING_RAIN_TALENT.id].amount,
        valueTooltip: this._tooltip(
          {
            spellId: TALENTS.HEALING_RAIN_TALENT.id,
            amount: this.healingRainHealing,
            active: true,
            extraHits: this.extraTicks,
            missedHits: this.missedTicks,
          },
          {
            spellId: TALENTS.OVERFLOWING_SHORES_TALENT.id,
            amount: this.overflowingShoresHealing,
            active: this.overflowingShoresActive,
            extraHits: this.extraOSTicks,
            missedHits: this.missedOSTicks,
          },
        ),
      },
      {
        color: RESTORATION_COLORS.RIPTIDE,
        label: <Trans id="shaman.restoration.spell.riptide">Riptide</Trans>,
        spellId: TALENTS.RIPTIDE_TALENT.id,
        value: this.healingMap[TALENTS.RIPTIDE_TALENT.id].amount,
        valueTooltip: this._tooltip({
          spellId: TALENTS.RIPTIDE_TALENT.id,
          amount: this.healingMap[TALENTS.RIPTIDE_TALENT.id].amount,
          active: true,
        }),
      },
      {
        color: RESTORATION_COLORS.WELLSPRING,
        label: <Trans id="shaman.restoration.spell.wellspring">Wellspring</Trans>,
        spellId: TALENTS.WELLSPRING_TALENT.id,
        value: this.healingMap[TALENTS.WELLSPRING_TALENT.id].amount,
        valueTooltip: this._tooltip({
          spellId: TALENTS.WELLSPRING_TALENT.id,
          amount: this.healingMap[TALENTS.WELLSPRING_TALENT.id].amount,
          active: this.selectedCombatant.hasTalent(TALENTS.WELLSPRING_TALENT),
        }),
      },
    ]
      .filter((item) => item.value > 0)
      .sort((a, b) => b.value - a.value);
    return <DonutChart items={items} />;
  }
  // external function for other modules that need  the additional checks here because of spellqueing
  _isBuffedByUnleashLife(event: CastEvent | HealEvent | ApplyBuffEvent | RefreshBuffEvent) {
    return (
      isBuffedByUnleashLife(event) &&
      this.lastRemoved <= event.timestamp &&
      this.lastUlSpellId === event.ability.guid
    );
  }

  statistic() {
    return (
      <Statistic
        category={STATISTIC_CATEGORY.TALENTS}
        position={STATISTIC_ORDER.CORE(3)}
        size="flexible"
      >
        <TalentSpellText talent={TALENTS.UNLEASH_LIFE_TALENT}>
          <ItemHealingDone amount={this.totalHealing} />
          <br />
          {this.buffIcon} {this.wastedBuffs} <small> wasted buffs</small>
        </TalentSpellText>
        <aside className="pad">
          <hr />
          <header>
            <label>Breakdown of Unleash Life Healing</label>
          </header>
          {this.unleashLifeCastRatioChart}
        </aside>
      </Statistic>
    );
  }

  /** Guide subsection describing the proper usage of Unleash Life */
  get guideSubsection(): JSX.Element {
    const explanation = (
      <p>
        <b>
          <SpellLink spell={TALENTS.UNLEASH_LIFE_TALENT} />
        </b>{' '}
        is a very efficient heal on a short cooldown, however the true power of this spell comes
        from the potent buff it provides that can be consumed by a number of different abilities.
        This spell is best used in preparation for incoming damage to combo with one of your
        stronger abilities like a <SpellLink spell={TALENTS.HIGH_TIDE_TALENT} />
        -buffed <SpellLink spell={TALENTS.CHAIN_HEAL_TALENT} />, or{' '}
        <SpellLink spell={TALENTS.HEALING_RAIN_TALENT} />
      </p>
    );

    const data = (
      <div>
        <RoundedPanel>
          <strong>
            <SpellLink spell={TALENTS.UNLEASH_LIFE_TALENT} /> cast efficiency
          </strong>
          <div className="flex-main chart" style={{ padding: 15 }}>
            {this.guideSubStatistic()} <br />
            <strong>Casts </strong>
            <small>
              - Green indicates a good use of the <SpellLink spell={TALENTS.UNLEASH_LIFE_TALENT} />{' '}
              buff, Yellow indicates an ok use, and Red is an incorrect use or the buff expired.
            </small>
            <PerformanceBoxRow values={this.castEntries} />
          </div>
        </RoundedPanel>
      </div>
    );

    return explanationAndDataSubsection(explanation, data, GUIDE_CORE_EXPLANATION_PERCENT);
  }

  guideSubStatistic() {
    return (
      <CastEfficiencyBar
        spellId={TALENTS.UNLEASH_LIFE_TALENT.id}
        gapHighlightMode={GapHighlight.FullCooldown}
        useThresholds
        minimizeIcons
      />
    );
  }

  tallyCastEntry(spellId: number) {
    let value = null;
    let tooltip = null;
    if (this.goodSpells.includes(spellId)) {
      value = QualitativePerformance.Good;
      tooltip = (
        <>
          Correct cast: buffed <SpellLink spell={spellId} />
        </>
      );
    } else if (this.okSpells.includes(spellId)) {
      value = QualitativePerformance.Ok;
      tooltip = (
        <>
          Ok cast: buffed <SpellLink spell={spellId} />
        </>
      );
    } else {
      value = QualitativePerformance.Fail;
      tooltip = (
        <>
          Incorrect cast:{' '}
          {spellId === -1 ? (
            <>Unused Buff!</>
          ) : (
            <>
              {' '}
              buffed <SpellLink spell={spellId} />
            </>
          )}
        </>
      );
    }
    this.castEntries.push({ value, tooltip });
  }
}

export default UnleashLife;
