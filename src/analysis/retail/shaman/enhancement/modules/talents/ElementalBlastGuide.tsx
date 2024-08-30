import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  ApplyBuffEvent,
  CastEvent,
  DamageEvent,
  RemoveBuffEvent,
  UpdateSpellUsableEvent,
  UpdateSpellUsableType,
} from 'parser/core/Events';
import TALENTS from 'common/TALENTS/shaman';
import SPELLS from 'common/SPELLS/shaman';
import Spell from 'common/SPELLS/Spell';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { ChecklistUsageInfo, SpellUse, UsageInfo } from 'parser/core/SpellUsage/core';
import { SpellLink } from 'interface';
import { plural } from '@lingui/macro';
import { formatPercentage, formatThousands } from 'common/format';
import MajorCooldown, { CooldownTrigger } from 'parser/core/MajorCooldowns/MajorCooldown';
import CooldownUsage from 'parser/core/MajorCooldowns/CooldownUsage';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
import { DamageIcon } from 'interface/icons';
import RESOURCE_TYPES, { getResource } from 'game/RESOURCE_TYPES';

const ELEMENTAL_SPIRIT_BUFFS: Spell[] = [
  SPELLS.ELEMENTAL_SPIRITS_BUFF_MOLTEN_WEAPON,
  SPELLS.ELEMENTAL_SPIRITS_BUFF_ICY_EDGE,
  SPELLS.ELEMENTAL_SPIRITS_BUFF_CRACKLING_SURGE,
];

interface ElementalBlastCastDetails extends CooldownTrigger<CastEvent> {
  event: CastEvent;
  chargesBeforeCast: number;
  elementalSpiritsActive: number;
  maelstromUsed: number;
  bonusDamage: number;
}

class ElementalBlastGuide extends MajorCooldown<ElementalBlastCastDetails> {
  static dependencies = {
    ...MajorCooldown.dependencies,
  };

  private readonly elementalSpritsActive: Record<number, number> = {};
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

    this.elementalSpritsActive = ELEMENTAL_SPIRIT_BUFFS.reduce(
      (rec: Record<number, number>, spell: Spell) => {
        rec[spell.id] = 0;
        return rec;
      },
      {},
    );

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
      Events.applybuff.spell(ELEMENTAL_SPIRIT_BUFFS),
      this.onApplyElementalSpiritBuff,
    );
    this.addEventListener(
      Events.removebuff.spell(ELEMENTAL_SPIRIT_BUFFS),
      this.onRemoveElementalSpiritBuff,
    );
    this.addEventListener(
      Events.UpdateSpellUsable.to(SELECTED_PLAYER).spell(TALENTS.ELEMENTAL_BLAST_ELEMENTAL_TALENT),
      this.onUpdateSpellUsable,
    );
  }

  onDamage(event: DamageEvent) {
    this.cast!.bonusDamage = calculateEffectiveDamage(
      event,
      Math.pow(1.2, this.cast?.elementalSpiritsActive ?? 0),
    );
    this.recordCooldown(this.cast!);
    this.cast = null;
  }

  onCast(event: CastEvent) {
    const cr = getResource(event.classResources, RESOURCE_TYPES.MAELSTROM_WEAPON.id);
    this.cast = {
      chargesBeforeCast: this.currentCharges,
      elementalSpiritsActive: this.activeElementalSpirits,
      maelstromUsed: cr?.cost ?? 0,
      event: event,
      bonusDamage: 0,
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

  onApplyElementalSpiritBuff(event: ApplyBuffEvent) {
    this.elementalSpritsActive[event.ability.guid] += 1;
  }

  onRemoveElementalSpiritBuff(event: RemoveBuffEvent) {
    this.elementalSpritsActive[event.ability.guid] -= 1;
    if (this.elementalSpritsActive[event.ability.guid] < 0) {
      this.elementalSpritsActive[event.ability.guid] = 0;
    }
  }

  get activeElementalSpirits(): number {
    return Object.keys(this.elementalSpritsActive).reduce(
      (total: number, buffId: string) => (total += this.elementalSpritsActive[Number(buffId)]),
      0,
    );
  }

  getOverallCastPerformance(cast: ElementalBlastCastDetails) {
    if (cast.chargesBeforeCast === 2 && cast.maelstromUsed >= 5) {
      return QualitativePerformance.Perfect;
    } else {
      switch (cast.elementalSpiritsActive) {
        case 0:
          /** elemental blast should not be cast without elemental spirits if uncapped on charges */
          return QualitativePerformance.Fail;
        case 1:
          return cast.maelstromUsed === 10
            ? QualitativePerformance.Good
            : QualitativePerformance.Ok;
        default:
          return cast.maelstromUsed >= 8
            ? QualitativePerformance.Perfect
            : QualitativePerformance.Good;
      }
    }
  }

  description(): JSX.Element {
    return (
      <>
        <SpellLink spell={TALENTS.ELEMENTAL_BLAST_ELEMENTAL_TALENT} /> damage is multiplicatively
        increased for each <SpellLink spell={TALENTS.ELEMENTAL_SPIRITS_TALENT} /> that is currently
        active.
      </>
    );
  }

  maelstromPerformance(cast: ElementalBlastCastDetails): UsageInfo {
    return {
      performance:
        cast.maelstromUsed === 10
          ? QualitativePerformance.Perfect
          : cast.maelstromUsed >= 8
            ? QualitativePerformance.Good
            : cast.maelstromUsed >= 5
              ? QualitativePerformance.Ok
              : QualitativePerformance.Fail,
      summary: (
        <div>
          {cast.maelstromUsed} <SpellLink spell={SPELLS.MAELSTROM_WEAPON_BUFF} /> used
        </div>
      ),
      details: null,
    };
  }

  elementalSpiritPerformance(cast: ElementalBlastCastDetails): UsageInfo {
    return {
      performance:
        cast.elementalSpiritsActive >= 3
          ? QualitativePerformance.Perfect
          : cast.elementalSpiritsActive >= 2
            ? QualitativePerformance.Good
            : cast.elementalSpiritsActive >= 1
              ? QualitativePerformance.Ok
              : QualitativePerformance.Fail,
      summary: (
        <div>
          {cast.elementalSpiritsActive === 0 ? 'No' : cast.elementalSpiritsActive}{' '}
          <SpellLink spell={TALENTS.ELEMENTAL_SPIRITS_TALENT} /> active
        </div>
      ),
      details: (
        <div>
          You had <strong>{cast.elementalSpiritsActive}</strong>{' '}
          <SpellLink spell={TALENTS.ELEMENTAL_SPIRITS_TALENT} /> active, gaining <DamageIcon />{' '}
          {formatThousands(cast.bonusDamage)} extra damage (
          <i>{formatPercentage(Math.pow(1.2, cast.elementalSpiritsActive) - 1, 0)}% more</i>)
        </div>
      ),
    };
  }

  chargePerformance(cast: ElementalBlastCastDetails): UsageInfo {
    let performance = QualitativePerformance.Fail;
    if (cast.maelstromUsed < 5) {
      performance = QualitativePerformance.Fail;
    }
    if (cast.chargesBeforeCast === 2) {
      performance = QualitativePerformance.Perfect;
    }
    if (cast.elementalSpiritsActive > 0) {
      performance =
        cast.elementalSpiritsActive >= 2
          ? QualitativePerformance.Perfect
          : cast.elementalSpiritsActive >= 1
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
      <CooldownUsage
        analyzer={this}
        title={
          <>
            <SpellLink spell={TALENTS.ELEMENTAL_BLAST_ENHANCEMENT_TALENT} /> cast breakdown
          </>
        }
        hidePotentialMissedCasts
      />
    );
  }

  getCastPerformance(cast: ElementalBlastCastDetails): QualitativePerformance {
    if (cast.chargesBeforeCast === 2 && cast.maelstromUsed >= 5) {
      return QualitativePerformance.Perfect;
    }

    if (cast.elementalSpiritsActive > 0) {
      return cast.maelstromUsed >= 8
        ? cast.elementalSpiritsActive > 1
          ? QualitativePerformance.Perfect
          : QualitativePerformance.Good
        : cast.maelstromUsed >= 5
          ? cast.elementalSpiritsActive > 1
            ? QualitativePerformance.Good
            : QualitativePerformance.Ok
          : QualitativePerformance.Fail;
    }

    return cast.maelstromUsed >= 5 ? QualitativePerformance.Ok : QualitativePerformance.Fail;
  }
}

export default ElementalBlastGuide;
