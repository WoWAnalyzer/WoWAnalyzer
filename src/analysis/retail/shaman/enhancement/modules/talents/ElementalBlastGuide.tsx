import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  CastEvent,
  DamageEvent,
  UpdateSpellUsableEvent,
  UpdateSpellUsableType,
} from 'parser/core/Events';
import TALENTS from 'common/TALENTS/shaman';
import SPELLS from 'common/SPELLS';
import {
  evaluateQualitativePerformanceByThreshold,
  QualitativePerformance,
} from 'parser/ui/QualitativePerformance';
import { ChecklistUsageInfo, SpellUse, UsageInfo } from 'parser/core/SpellUsage/core';
import { SpellLink, Tooltip } from 'interface';
import { plural } from '@lingui/macro';
import { formatNumber, formatPercentage } from 'common/format';
import MajorCooldown, { CooldownTrigger } from 'parser/core/MajorCooldowns/MajorCooldown';
import CooldownUsage from 'parser/core/MajorCooldowns/CooldownUsage';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
import { DamageIcon } from 'interface/icons';
import RESOURCE_TYPES, { getResource } from 'game/RESOURCE_TYPES';
import ElementalSpirits from './ElementalSpirits';
import typedKeys from 'common/typedKeys';
import { maybeGetTalentOrSpell } from 'common/maybeGetTalentOrSpell';

interface ElementalBlastCastDetails extends CooldownTrigger<CastEvent> {
  event: CastEvent;
  chargesBeforeCast: number;
  elementalSpiritsActive: Record<number, number>;
  maelstromUsed: number;
  bonusDamage: number;
  baseDamage: number;
}

class ElementalBlastGuide extends MajorCooldown<ElementalBlastCastDetails> {
  static dependencies = {
    ...MajorCooldown.dependencies,
    elementalSpirits: ElementalSpirits,
  };

  protected elementalSpirits!: ElementalSpirits;
  private readonly maxCharges: number = 0;
  private cast: ElementalBlastCastDetails | null = null;
  private currentCharges: number = 0;

  protected guideActive: boolean = false;

  constructor(options: Options) {
    super({ spell: TALENTS.ELEMENTAL_BLAST_ELEMENTAL_TALENT }, options);

    this.active = this.selectedCombatant.hasTalent(TALENTS.ELEMENTAL_BLAST_ENHANCEMENT_TALENT);

    this.guideActive =
      this.active &&
      this.selectedCombatant.hasTalent(TALENTS.ELEMENTAL_BLAST_ENHANCEMENT_TALENT) &&
      this.selectedCombatant.hasTalent(TALENTS.ELEMENTAL_SPIRITS_TALENT);
    if (!this.guideActive) {
      return;
    }

    this.maxCharges = this.selectedCombatant.getMultipleTalentRanks(
      TALENTS.ELEMENTAL_BLAST_ENHANCEMENT_TALENT,
      TALENTS.LAVA_BURST_TALENT,
    );
    this.currentCharges = this.maxCharges;

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.ELEMENTAL_BLAST_ELEMENTAL_TALENT),
      this.onCast,
    );
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(TALENTS.ELEMENTAL_BLAST_ELEMENTAL_TALENT),
      this.onDamage,
    );
    this.addEventListener(
      Events.UpdateSpellUsable.to(SELECTED_PLAYER).spell(TALENTS.ELEMENTAL_BLAST_ELEMENTAL_TALENT),
      this.onUpdateSpellUsable,
    );
  }

  onDamage(event: DamageEvent) {
    if (this.cast) {
      const totalDamage = event.amount + (event.absorbed || 0);
      const activeSpirits = this.getActiveElementalSpirits(this.cast.elementalSpiritsActive);
      this.cast.bonusDamage = activeSpirits
        ? calculateEffectiveDamage(event, Math.pow(1.2, activeSpirits) - 1)
        : 0;
      this.cast.baseDamage = totalDamage - this.cast.bonusDamage;
      this.recordCooldown(this.cast!);
      this.cast = null;
    }
  }

  onCast(event: CastEvent) {
    const cr = getResource(event.classResources, RESOURCE_TYPES.MAELSTROM_WEAPON.id);
    this.cast = {
      chargesBeforeCast: this.currentCharges,
      elementalSpiritsActive: {
        [SPELLS.ELEMENTAL_SPIRITS_BUFF_MOLTEN_WEAPON.id]: this.elementalSpirits.moltenWeaponCount,
        [SPELLS.ELEMENTAL_SPIRITS_BUFF_CRACKLING_SURGE.id]:
          this.elementalSpirits.cracklingSurgeCount,
        [SPELLS.ELEMENTAL_SPIRITS_BUFF_ICY_EDGE.id]: this.elementalSpirits.icyEdgeCount,
      },
      maelstromUsed: cr?.cost ?? 0,
      event: event,
      bonusDamage: 0,
      baseDamage: 0,
    };
    this.currentCharges -= 1;
  }

  onUpdateSpellUsable(event: UpdateSpellUsableEvent) {
    if (
      event.updateType === UpdateSpellUsableType.RestoreCharge ||
      event.updateType === UpdateSpellUsableType.EndCooldown
    ) {
      this.currentCharges += 1;
    }
  }

  getActiveElementalSpirits(activeSpirits: Record<number, number>): number {
    return typedKeys(activeSpirits).reduce(
      (total: number, buffId: number) => (total += activeSpirits[buffId]),
      0,
    );
  }

  getOverallCastPerformance(cast: ElementalBlastCastDetails) {
    const activeSpirits = this.getActiveElementalSpirits(cast.elementalSpiritsActive);

    if (activeSpirits >= 4 && cast.maelstromUsed >= 6) {
      return QualitativePerformance.Perfect;
    }

    if (activeSpirits > 0 && cast.maelstromUsed >= 5) {
      return activeSpirits >= 3
        ? QualitativePerformance.Good
        : activeSpirits >= 2
          ? QualitativePerformance.Ok
          : QualitativePerformance.Fail;
    }

    return QualitativePerformance.Fail;
  }

  description(): JSX.Element {
    return (
      <>
        <p>
          <SpellLink spell={TALENTS.ELEMENTAL_BLAST_ELEMENTAL_TALENT} /> benefits from each{' '}
          <SpellLink spell={TALENTS.ELEMENTAL_SPIRITS_TALENT} />, making its damage scale very
          quickly the more wolves you have active.
        </p>
        <p>
          When you have <strong>4 or more</strong> of any{' '}
          <SpellLink spell={TALENTS.ELEMENTAL_SPIRITS_TALENT} /> active,{' '}
          <SpellLink spell={TALENTS.ELEMENTAL_BLAST_ELEMENTAL_TALENT} /> becomes your one of your
          most powerful <SpellLink spell={SPELLS.MAELSTROM_WEAPON_BUFF} /> spenders
          {this.selectedCombatant.hasTalent(TALENTS.TEMPEST_TALENT) ? (
            <>
              , only behind <SpellLink spell={TALENTS.TEMPEST_TALENT} />
            </>
          ) : null}
          .
        </p>
        {this.selectedCombatant.hasTalent(TALENTS.TEMPEST_TALENT) ? (
          <>
            <p>
              You should avoid casting{' '}
              <SpellLink spell={TALENTS.ELEMENTAL_BLAST_ENHANCEMENT_TALENT} /> with less than 4{' '}
              <SpellLink spell={TALENTS.ELEMENTAL_SPIRITS_TALENT} />. Prior to 4, the chance for{' '}
              <SpellLink spell={SPELLS.MAELSTROM_WEAPON_BUFF} /> refunds from
              <SpellLink spell={TALENTS.STATIC_ACCUMULATION_TALENT} /> and{' '}
              <SpellLink spell={TALENTS.SUPERCHARGE_TALENT} /> make{' '}
              <SpellLink spell={SPELLS.LIGHTNING_BOLT} /> a more efficent choice.
            </p>
          </>
        ) : null}
        <p>
          During high haste points, such as <SpellLink spell={SPELLS.HEROISM} />/
          <SpellLink spell={SPELLS.BLOODLUST} />, it is possible to have very high counts of{' '}
          <SpellLink spell={TALENTS.ELEMENTAL_SPIRITS_TALENT} /> active. With good planning, you can
          sometimes cast <strong>2 or 3</strong> extremely high damage{' '}
          <SpellLink spell={TALENTS.ELEMENTAL_BLAST_ENHANCEMENT_TALENT} />
        </p>
      </>
    );
  }

  maelstromPerformance(cast: ElementalBlastCastDetails): UsageInfo {
    return {
      performance: evaluateQualitativePerformanceByThreshold({
        actual: cast.maelstromUsed,
        isGreaterThanOrEqual: {
          perfect: 6,
          ok: 5,
        },
      }),
      summary: (
        <>
          {cast.maelstromUsed} <SpellLink spell={SPELLS.MAELSTROM_WEAPON_BUFF} /> used
        </>
      ),
      details: (
        <div>
          {cast.maelstromUsed} <SpellLink spell={SPELLS.MAELSTROM_WEAPON_BUFF} /> used.
          {cast.maelstromUsed < 5 ? (
            <>
              You should never cast your maelstrom spells with less than 5{' '}
              <SpellLink spell={SPELLS.MAELSTROM_WEAPON_BUFF} />
            </>
          ) : cast.maelstromUsed < 6 ? (
            <>
              Try to cast with <strong>6 or more</strong>{' '}
              <SpellLink spell={SPELLS.MAELSTROM_WEAPON_BUFF} />.
            </>
          ) : null}
        </div>
      ),
    };
  }

  elementalSpiritPerformance(cast: ElementalBlastCastDetails): UsageInfo {
    const totalElementalSpirits = this.getActiveElementalSpirits(cast.elementalSpiritsActive);

    const tooltip = (
      <>
        Active wolves:
        <ul>
          {typedKeys(cast.elementalSpiritsActive)
            .filter((spellId) => cast.elementalSpiritsActive[spellId] > 0)
            .map((spellId) => {
              const count = cast.elementalSpiritsActive[spellId];
              const spell = maybeGetTalentOrSpell(spellId)!;
              return (
                <li key={spellId}>
                  <strong>{count}</strong> <SpellLink spell={spell} />
                </li>
              );
            })}
        </ul>
        <hr />
        <div>
          <SpellLink spell={TALENTS.ELEMENTAL_BLAST_ENHANCEMENT_TALENT} /> damage increased from{' '}
          <DamageIcon /> {formatNumber(cast.baseDamage)} &rarr; <DamageIcon />{' '}
          {formatNumber(cast.bonusDamage + cast.baseDamage)}, for an increase of{' '}
          {formatPercentage(Math.pow(1.2, totalElementalSpirits) - 1, 0)}% (
          <i>
            <DamageIcon /> {formatNumber(cast.bonusDamage)} bonus damage
          </i>
          )
        </div>
      </>
    );

    const hadWolvesExplanation = (
      <>
        <div>
          You had{' '}
          <Tooltip content={<div>{tooltip}</div>} hoverable direction="up">
            <dfn>
              <strong>{totalElementalSpirits}</strong>
            </dfn>
          </Tooltip>{' '}
          <SpellLink spell={TALENTS.ELEMENTAL_SPIRITS_TALENT} /> active.
          {totalElementalSpirits < 4 ? (
            <>
              {' '}
              <SpellLink spell={TALENTS.ELEMENTAL_BLAST_ELEMENTAL_TALENT} /> should be cast with{' '}
              <strong>4 or more</strong> <SpellLink spell={TALENTS.ELEMENTAL_SPIRITS_TALENT} />{' '}
              active.
            </>
          ) : null}
        </div>
      </>
    );
    const noWolvesExplanation = (
      <>
        <div>
          You did not have any <SpellLink spell={TALENTS.ELEMENTAL_SPIRITS_TALENT} /> active.
        </div>
      </>
    );

    return {
      performance: evaluateQualitativePerformanceByThreshold({
        actual: totalElementalSpirits,
        isGreaterThanOrEqual: {
          perfect: 4,
          ok: 2,
        },
      }),
      summary: (
        <div>
          {totalElementalSpirits === 0 ? 'No' : totalElementalSpirits}{' '}
          <SpellLink spell={TALENTS.ELEMENTAL_SPIRITS_TALENT} /> active
        </div>
      ),
      details: <>{totalElementalSpirits > 0 ? hadWolvesExplanation : noWolvesExplanation}</>,
    };
  }

  chargePerformance(cast: ElementalBlastCastDetails): UsageInfo {
    const totalElementalSpirits = this.getActiveElementalSpirits(cast.elementalSpiritsActive);
    let performance = QualitativePerformance.Fail;
    if (cast.maelstromUsed < 5) {
      performance = QualitativePerformance.Fail;
    }
    if (cast.chargesBeforeCast === 2) {
      performance =
        totalElementalSpirits >= 4 ? QualitativePerformance.Perfect : QualitativePerformance.Fail;
    }
    if (totalElementalSpirits > 0) {
      performance =
        totalElementalSpirits >= 2
          ? QualitativePerformance.Perfect
          : totalElementalSpirits >= 1
            ? QualitativePerformance.Good
            : QualitativePerformance.Ok;
    }

    return {
      performance: performance,
      summary: (
        <div>
          {cast.chargesBeforeCast}{' '}
          {plural(cast.chargesBeforeCast, { one: 'charge', other: 'charges' })} of{' '}
          <SpellLink spell={TALENTS.ELEMENTAL_BLAST_ELEMENTAL_TALENT} />{' '}
          {plural(cast.chargesBeforeCast, { one: 'was', other: 'were' })} available
        </div>
      ),
      details: null,
    };
  }

  explainPerformance(cast: ElementalBlastCastDetails): SpellUse {
    const mswPerformance = this.maelstromPerformance(cast);
    const elementalSpiritPerformance = this.elementalSpiritPerformance(cast);
    const chargePerformance = this.chargePerformance(cast);

    const checklistItems: ChecklistUsageInfo[] = [
      {
        check: 'elemental-blast-maelstrom',
        timestamp: cast.event.timestamp,
        ...mswPerformance,
      },
      {
        check: 'elemental-blast-elemental-spirits',
        timestamp: cast.event.timestamp,
        ...elementalSpiritPerformance,
      },
      {
        check: 'elemental-blast-charges',
        timestamp: cast.event.timestamp,
        ...chargePerformance,
      },
    ];

    return {
      event: cast.event,
      performance: this.getOverallCastPerformance(cast), // performance box should be colored according to APL rules, not on checklists
      checklistItems: checklistItems,
    };
  }

  get guideSubsection() {
    if (!this.guideActive) {
      return null;
    }

    return (
      <>
        <CooldownUsage
          analyzer={this}
          title={
            <>
              <SpellLink spell={TALENTS.ELEMENTAL_BLAST_ENHANCEMENT_TALENT} />
            </>
          }
          hidePotentialMissedCasts
        />
        {this.elementalSpirits.graph}
      </>
    );
  }
}

export default ElementalBlastGuide;
