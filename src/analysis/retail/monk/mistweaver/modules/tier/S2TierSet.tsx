import type { ReactNode } from 'react';
import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { TIERS } from 'game/TIERS';
import SPELLS from 'common/SPELLS';
import Events, {
  ApplyBuffEvent,
  CastEvent,
  DamageEvent,
  GetRelatedEvents,
  HealEvent,
  RefreshBuffEvent,
  RemoveBuffEvent,
} from 'parser/core/Events';
import { TALENTS_MONK } from 'common/TALENTS';
import { calculateEffectiveDamage, calculateEffectiveHealing } from 'parser/core/EventCalculateLib';
import { effectiveDamage } from 'parser/shared/modules/DamageValue';
import { effectiveHealing } from 'parser/shared/modules/HealingValue';
import { formatNumber, formatPercentage } from 'common/format';
import SpellLink from 'interface/SpellLink';
import { MONK_MID2_ID } from 'common/ITEMS';
import TierSetAnalyzer from 'parser/ui/TierSetAnalyzer';
import { getCurrentRSKTalent } from '../../constants';
import {
  AT_RSK,
  RSK_CAST_LINK,
  RWK_DAMAGE_CAST_LINK,
  RUSHING_WIND_KICK,
} from '../../normalizers/EventLinks/EventLinkConstants';
import {
  getS2FourPieceConsumingCast,
  isFromS2FourPiece,
  isS2FourPieceConsumingCast,
} from '../../normalizers/EventLinks/TierEventLinks';
import { Talent } from 'common/TALENTS/types';
import Spell from 'common/SPELLS/Spell';
import HotTrackerMW from '../core/HotTrackerMW';
import { plotOneVariableBinomChart } from 'parser/shared/modules/helpers/Probability';
import { addEnhancedCastReason } from 'parser/core/EventMetaLib';

// tier specific constants
const TWO_PIECE_RSK_DAMAGE_INCREASE = 0.3;
const TWO_PIECE_RWK_HEAL_INCREASE = 1.0;
// actually 20% ingame but it cannot proc off of its self, rendering 15%
const FOUR_PIECE_PROC_CHANCE = 0.15;

interface FourPieceSource {
  spell: Spell | Talent;
  unit: string;
}

interface FourPieceSourceState extends FourPieceSource {
  count: number;
  healing: number;
}

const FOUR_PIECE_SOURCES: FourPieceSource[] = [
  { spell: SPELLS.RENEWING_MIST_HEAL, unit: 'applied' },
  { spell: SPELLS.INVIGORATING_MISTS_HEAL, unit: 'hits' },
  { spell: TALENTS_MONK.ZEN_PULSE_TALENT, unit: 'hits' },
  { spell: TALENTS_MONK.TEAR_OF_MORNING_TALENT, unit: 'hits' },
  { spell: TALENTS_MONK.MISTY_PEAKS_TALENT, unit: 'procs' },
];

class S2TierSet extends TierSetAnalyzer.withDependencies({
  hotTracker: HotTrackerMW,
}) {
  readonly setId = MONK_MID2_ID;
  readonly setTitle = 'Mistweaver Season 2 Tier Set';
  readonly tier = TIERS.MID2;

  fourPieceProcs = 0;
  wastedProcs = 0;
  procAttempts = 0;
  hasRWK = false;
  currentRSKTalent: Talent;
  freeCastHealing = 0;

  private readonly sources = new Map<number, FourPieceSourceState>(
    FOUR_PIECE_SOURCES.map((source) => [source.spell.id, { ...source, count: 0, healing: 0 }]),
  );

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.has2PieceByTier(TIERS.MID2);
    this.currentRSKTalent = getCurrentRSKTalent(this.selectedCombatant);
    this.hasRWK = this.currentRSKTalent === TALENTS_MONK.RUSHING_WIND_KICK_MISTWEAVER_TALENT;

    if (!this.hasRWK) {
      this.addEventListener(
        Events.damage.by(SELECTED_PLAYER).spell(SPELLS.RISING_SUN_KICK_DAMAGE),
        this.onRSKDamage,
      );
    } else {
      this.addEventListener(
        Events.heal.by(SELECTED_PLAYER).spell(SPELLS.RUSHING_WIND_KICK_HEAL),
        this.onRWKHeal,
      );
    }

    if (this.hasFourPiece) {
      this.addEventListener(
        Events.cast.by(SELECTED_PLAYER).spell(this.currentRSKTalent),
        this.onProcAttempt,
      );
      this.addEventListener(
        Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.MW_S2_4PC_BUFF),
        this.onFourPieceBuff,
      );
      this.addEventListener(
        Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.MW_S2_4PC_BUFF),
        this.onFourPieceRefresh,
      );
      this.addEventListener(
        Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.MW_S2_4PC_BUFF),
        this.onFourPieceConsumed,
      );
      this.addEventListener(
        Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.RENEWING_MIST_HEAL),
        this.onRemApply,
      );
      this.addEventListener(
        Events.heal.by(SELECTED_PLAYER).spell(SPELLS.RENEWING_MIST_HEAL),
        this.onRemHeal,
      );
      this.addEventListener(
        Events.heal.by(SELECTED_PLAYER).spell(TALENTS_MONK.ENVELOPING_MIST_TALENT),
        this.onEnvHeal,
      );
      this.addEventListener(
        Events.heal
          .by(SELECTED_PLAYER)
          .spell([SPELLS.ZEN_PULSE_HEAL, SPELLS.INVIGORATING_MISTS_HEAL]),
        this.onVivifyOrZenPulse,
      );
    }
  }

  private healingBreakdown(amount: number): string {
    return `${formatNumber(amount)} (${formatPercentage(
      this.owner.getPercentageOfTotalHealingDone(amount),
    )}% of total)`;
  }

  protected get tooltip2pcItems(): ReactNode {
    return this.hasRWK ? (
      <li>
        <strong>
          2pc <SpellLink spell={SPELLS.RUSHING_WIND_KICK_HEAL} /> Healing (
          {formatNumber(TWO_PIECE_RWK_HEAL_INCREASE * 100)}%):
        </strong>{' '}
        {this.healingBreakdown(this.twoPieceHealing)}
      </li>
    ) : (
      <>
        <li>
          <strong>
            2pc <SpellLink spell={TALENTS_MONK.RISING_SUN_KICK_TALENT} /> Damage (
            {formatNumber(TWO_PIECE_RSK_DAMAGE_INCREASE * 100)}%):
          </strong>{' '}
          {formatNumber(this.twoPieceDamage)}
        </li>
        <li>
          <strong>2pc Ancient Teachings Healing:</strong>{' '}
          {this.healingBreakdown(this.twoPieceHealing)}
        </li>
      </>
    );
  }

  protected get tooltip4pcItems(): ReactNode {
    return (
      <>
        <li>
          <strong>4pc procs:</strong> {this.fourPieceProcs} ({this.wastedProcs} wasted)
        </li>
        <li>
          <strong>4pc Healing:</strong> {this.healingBreakdown(this.fourPieceHealing)}
        </li>
        {!this.hasRWK && (
          <li>
            <strong>4pc Damage:</strong> {formatNumber(this.fourPieceDamage)}
          </li>
        )}
        <li>
          <strong>
            Free <SpellLink spell={this.currentRSKTalent} /> casts:
          </strong>{' '}
          {this.healingBreakdown(this.freeCastHealing)}
        </li>
        {[...this.sources.values()]
          .filter((source) => source.count > 0 || source.healing > 0)
          .map((source) => (
            <li key={source.spell.id}>
              <strong>
                <SpellLink spell={source.spell} /> ({source.count} {source.unit}):
              </strong>{' '}
              {this.healingBreakdown(source.healing)}
            </li>
          ))}
      </>
    );
  }

  protected get statisticChart(): ReactNode {
    if (!this.hasFourPiece) {
      return null;
    }
    return plotOneVariableBinomChart(
      this.fourPieceProcs,
      this.procAttempts,
      FOUR_PIECE_PROC_CHANCE,
    );
  }

  private onProcAttempt(event: CastEvent) {
    // free casts from the 4pc buff cannot re-proc it
    if (isS2FourPieceConsumingCast(event)) {
      return;
    }
    this.procAttempts += 1;
  }

  private onFourPieceBuff(_event: ApplyBuffEvent) {
    this.fourPieceProcs += 1;
  }

  private onFourPieceRefresh(_event: RefreshBuffEvent) {
    this.fourPieceProcs += 1;
    this.wastedProcs += 1;
  }

  private onFourPieceConsumed(event: RemoveBuffEvent) {
    const consumingCast = getS2FourPieceConsumingCast(event);
    if (!consumingCast) {
      this.wastedProcs += 1;
      return;
    }

    addEnhancedCastReason(
      consumingCast,
      <>
        This cast was made free by the <SpellLink spell={SPELLS.MW_S2_4PC_BUFF} /> 4-piece.
      </>,
    );
    this.attributeFreeCast(consumingCast);
  }

  private attributeFreeCast(cast: CastEvent) {
    if (this.hasRWK) {
      GetRelatedEvents<HealEvent>(cast, RUSHING_WIND_KICK).forEach((heal) => {
        this.attributeFreeCastHealing(effectiveHealing(heal));
      });
      GetRelatedEvents<DamageEvent>(cast, RWK_DAMAGE_CAST_LINK).forEach((damage) => {
        this.attributeFreeCastHealing(this.ancientTeachingsHealing(damage));
      });
    } else {
      GetRelatedEvents<DamageEvent>(cast, RSK_CAST_LINK).forEach((damage) => {
        this.fourPieceDamage += effectiveDamage(damage);
        this.attributeFreeCastHealing(this.ancientTeachingsHealing(damage));
      });
    }
  }

  private ancientTeachingsHealing(damage: DamageEvent): number {
    return GetRelatedEvents<HealEvent>(damage, AT_RSK).reduce(
      (total, heal) => total + effectiveHealing(heal),
      0,
    );
  }

  private attributeFreeCastHealing(amount: number) {
    this.freeCastHealing += amount;
    this.fourPieceHealing += amount;
  }

  private attributeHealing(spell: Spell | Talent, amount: number) {
    const source = this.sources.get(spell.id);
    if (!source) {
      return;
    }
    source.healing += amount;
    this.fourPieceHealing += amount;
  }

  private countHit(spell: Spell | Talent) {
    const source = this.sources.get(spell.id);
    if (source) {
      source.count += 1;
    }
  }

  private onRemApply(event: ApplyBuffEvent) {
    if (isFromS2FourPiece(event)) {
      this.countHit(SPELLS.RENEWING_MIST_HEAL);
    }
  }

  private onRemHeal(event: HealEvent) {
    const hot = this.deps.hotTracker.getHot(event, event.ability.guid);
    if (!hot || !this.deps.hotTracker.fromS2FourPiece(hot)) return;
    this.attributeHealing(SPELLS.RENEWING_MIST_HEAL, effectiveHealing(event));
  }

  private onEnvHeal(event: HealEvent) {
    const fourPieceRem = this.deps.hotTracker.getHot(event, SPELLS.RENEWING_MIST_HEAL.id);
    if (!fourPieceRem || !this.deps.hotTracker.fromS2FourPiece(fourPieceRem)) return;
    const healing = effectiveHealing(event);
    //tom proc on 4pc rem
    if (this.selectedCombatant.hasTalent(TALENTS_MONK.TEAR_OF_MORNING_TALENT) && !event.tick) {
      this.attributeHealing(TALENTS_MONK.TEAR_OF_MORNING_TALENT, healing);
      this.countHit(TALENTS_MONK.TEAR_OF_MORNING_TALENT);
    }
    //misty peak proc on 4pc rem
    const hot = this.deps.hotTracker.getHot(event, TALENTS_MONK.ENVELOPING_MIST_TALENT.id);
    if (hot && this.deps.hotTracker.fromMistyPeaks(hot)) {
      this.attributeHealing(TALENTS_MONK.MISTY_PEAKS_TALENT, healing);
      this.countHit(TALENTS_MONK.MISTY_PEAKS_TALENT);
    }
  }

  private onVivifyOrZenPulse(event: HealEvent) {
    const fourPieceRem = this.deps.hotTracker.getHot(event, SPELLS.RENEWING_MIST_HEAL.id);
    if (!fourPieceRem || !this.deps.hotTracker.fromS2FourPiece(fourPieceRem)) return;
    // the Zen Pulse row is keyed by its talent, so the heal's own spell id can't be used directly
    const source =
      event.ability.guid === SPELLS.ZEN_PULSE_HEAL.id
        ? TALENTS_MONK.ZEN_PULSE_TALENT
        : SPELLS.INVIGORATING_MISTS_HEAL;
    this.attributeHealing(source, effectiveHealing(event));
    this.countHit(source);
  }

  private onRSKDamage(event: DamageEvent) {
    this.twoPieceDamage += calculateEffectiveDamage(event, TWO_PIECE_RSK_DAMAGE_INCREASE);
    this.twoPieceHealing += GetRelatedEvents<HealEvent>(event, AT_RSK).reduce(
      (total, heal) => total + calculateEffectiveHealing(heal, TWO_PIECE_RSK_DAMAGE_INCREASE),
      0,
    );
  }

  private onRWKHeal(event: HealEvent) {
    this.twoPieceHealing += calculateEffectiveHealing(event, TWO_PIECE_RWK_HEAL_INCREASE);
  }
}

export default S2TierSet;
