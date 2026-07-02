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
import { formatNumber } from 'common/format';
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
import { getS2FourPieceConsumingCast } from '../../normalizers/EventLinks/TierEventLinks';
import { Talent } from 'common/TALENTS/types';

const TWO_PIECE_RSK_DAMAGE_INCREASE = 0.3;
const TWO_PIECE_RWK_HEAL_INCREASE = 1.0;

class S2TierSet extends TierSetAnalyzer {
  readonly setId = MONK_MID2_ID;
  readonly setTitle = 'Mistweaver Season 2 Tier Set';
  readonly tier = TIERS.MID2;

  fourPieceProcs = 0;
  wastedProcs = 0;
  hasRWK = false;
  currentRSKTalent: Talent;

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
    }
  }

  protected get tooltip2pcItems(): ReactNode {
    return this.hasRWK ? (
      <li>
        <strong>
          2pc <SpellLink spell={SPELLS.RUSHING_WIND_KICK_HEAL} /> Healing (
          {formatNumber(TWO_PIECE_RWK_HEAL_INCREASE * 100)}%):
        </strong>{' '}
        {formatNumber(this.twoPieceHealing)}
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
          <strong>2pc Ancient Teachings Healing:</strong> {formatNumber(this.twoPieceHealing)}
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
          <strong>4pc Healing:</strong> {formatNumber(this.fourPieceHealing)}
        </li>
        {!this.hasRWK && (
          <li>
            <strong>4pc Damage:</strong> {formatNumber(this.fourPieceDamage)}
          </li>
        )}
      </>
    );
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

    if (!this.hasRWK) {
      this.attributeRSKFreeCast(consumingCast);
    } else {
      this.attributeRWKFreeCast(consumingCast);
    }
  }

  private attributeRSKFreeCast(cast: CastEvent) {
    GetRelatedEvents<DamageEvent>(cast, RSK_CAST_LINK).forEach((damage) => {
      this.fourPieceDamage += effectiveDamage(damage);
      this.fourPieceHealing += GetRelatedEvents<HealEvent>(damage, AT_RSK).reduce(
        (total, heal) => total + effectiveHealing(heal),
        0,
      );
    });
  }

  private attributeRWKFreeCast(cast: CastEvent) {
    GetRelatedEvents<HealEvent>(cast, RUSHING_WIND_KICK).forEach((heal) => {
      this.fourPieceHealing += effectiveHealing(heal);
    });
    GetRelatedEvents<DamageEvent>(cast, RWK_DAMAGE_CAST_LINK).forEach((damage) => {
      this.fourPieceHealing += GetRelatedEvents<HealEvent>(damage, AT_RSK).reduce(
        (total, heal) => total + effectiveHealing(heal),
        0,
      );
    });
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
