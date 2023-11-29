import BaseElementalBlast from '../../../shared/ElementalBlast';
import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  ApplyBuffEvent,
  CastEvent,
  RemoveBuffEvent,
  UpdateSpellUsableEvent,
  UpdateSpellUsableType,
} from 'parser/core/Events';
import TALENTS from 'common/TALENTS/shaman';
import SPELLS from 'common/SPELLS/shaman';
import Spell from 'common/SPELLS/Spell';
import { MaelstromWeaponTracker } from '../resourcetracker';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { ChecklistUsageInfo, SpellUse, spellUseToBoxRowEntry } from 'parser/core/SpellUsage/core';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { SpellLink } from 'interface';
import { PanelHeader } from 'interface/guide/components/GuideDivs';
import { PerformanceBoxRow } from 'interface/guide/components/PerformanceBoxRow';

const ELEMENTAL_SPIRIT_BUFFS: Spell[] = [
  SPELLS.ELEMENTAL_SPIRITS_BUFF_MOLTEN_WEAPON,
  SPELLS.ELEMENTAL_SPIRITS_BUFF_ICY_EDGE,
  SPELLS.ELEMENTAL_SPIRITS_BUFF_CRACKLING_SURGE,
];

interface ElementalBlastCastDetails {
  event: CastEvent;
  chargesBeforeCast: number;
  elementalSpiritsActive: number;
  maelstromUsed: number;
}

class ElementalBlast extends BaseElementalBlast {
  static dependencies = {
    ...BaseElementalBlast.dependencies,
    maelstromTracker: MaelstromWeaponTracker,
  };
  protected maelstromTracker!: MaelstromWeaponTracker;

  protected elementalSpritsActive: Record<number, number> = {};
  protected elementalBlastCasts: ElementalBlastCastDetails[] = [];
  protected maxCharges: number = 0;
  protected currentCharges: number = 0;

  protected guideActive: boolean = false;

  constructor(options: Options) {
    super(options);

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

  onCast(event: CastEvent) {
    this.elementalBlastCasts.push({
      chargesBeforeCast: this.currentCharges,
      elementalSpiritsActive: this.activeElementalSpirits,
      maelstromUsed: this.maelstromTracker.current,
      event: event,
    });
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
  }

  get activeElementalSpirits(): number {
    return Object.keys(this.elementalSpritsActive).reduce(
      (total: number, buffId: string) => (total += this.elementalSpritsActive[Number(buffId)]),
      0,
    );
  }

  getElementalSpiritsPerformance(cast: ElementalBlastCastDetails) {
    return cast.elementalSpiritsActive >= 3
      ? QualitativePerformance.Perfect
      : cast.elementalSpiritsActive >= 2
      ? QualitativePerformance.Good
      : cast.elementalSpiritsActive >= 1
      ? QualitativePerformance.Ok
      : QualitativePerformance.Fail;
  }

  getMaelstromUsagePerformance(cast: ElementalBlastCastDetails) {
    return cast.maelstromUsed === 10
      ? QualitativePerformance.Perfect
      : cast.maelstromUsed >= 8
      ? QualitativePerformance.Good
      : cast.maelstromUsed >= 5
      ? QualitativePerformance.Ok
      : QualitativePerformance.Fail;
  }

  getOverallCastPerformance(cast: ElementalBlastCastDetails) {
    if (cast.chargesBeforeCast === 2 && cast.maelstromUsed >= 5) {
      return QualitativePerformance.Perfect;
    } else if (cast.elementalSpiritsActive >= 1) {
      return cast.maelstromUsed >= 8
        ? QualitativePerformance.Perfect
        : cast.maelstromUsed >= 5
        ? QualitativePerformance.Ok
        : QualitativePerformance.Fail;
    }
    return QualitativePerformance.Fail;
  }

  get guideSubsection() {
    if (!this.guideActive) {
      return null;
    }

    const casts: SpellUse[] = this.elementalBlastCasts.map((cast) => {
      const checklistItems: ChecklistUsageInfo[] = [];

      const mswPerf = this.getMaelstromUsagePerformance(cast);
      checklistItems.push({
        check: 'elemental-blast-maelstrom',
        timestamp: cast.event.timestamp,
        performance: mswPerf,
        summary: (
          <>
            {cast.maelstromUsed} <SpellLink spell={SPELLS.MAELSTROM_WEAPON_BUFF} /> used
          </>
        ),
        details: <></>,
      });

      checklistItems.push({
        check: 'elemental-blast-elemental-spirits',
        timestamp: cast.event.timestamp,
        performance: this.getElementalSpiritsPerformance(cast),
        summary: (
          <>
            {cast.elementalSpiritsActive === 0 ? 'No' : cast.elementalSpiritsActive}{' '}
            <SpellLink spell={TALENTS.ELEMENTAL_SPIRITS_TALENT} /> active
          </>
        ),
        details: <></>,
      });

      cast.elementalSpiritsActive === 0 &&
        checklistItems.push({
          check: 'elemental-blast-charges',
          timestamp: cast.event.timestamp,
          performance:
            cast.chargesBeforeCast === 2 && cast.maelstromUsed >= 5
              ? QualitativePerformance.Perfect
              : QualitativePerformance.Fail,
          summary: (
            <>{cast.chargesBeforeCast === 2 ? 'Used at max charges' : 'Not at max charges'}</>
          ),
          details: <></>,
        });

      return {
        _key: `elemental-blast-${cast.event.timestamp}`,
        event: cast.event,
        performance: this.getOverallCastPerformance(cast), // performance box should be colored according to APL rules, not on checklists
        checklistItems: checklistItems,
      };
    });

    const performance = casts.map((cast) =>
      spellUseToBoxRowEntry(cast, this.owner.fight.start_time),
    );

    return explanationAndDataSubsection(
      // description
      <>
        <p>
          <SpellLink spell={TALENTS.ELEMENTAL_BLAST_ELEMENTAL_TALENT} /> damage is multiplicatively
          increased for each <SpellLink spell={TALENTS.ELEMENTAL_SPIRITS_TALENT} /> that is
          currently active, typically ranging from a 20% increase with one to 78% with three, and in
          rare cases up to nearly 250% with five{' '}
          <SpellLink spell={TALENTS.ELEMENTAL_SPIRITS_TALENT} />
        </p>
        <p>
          As such, you only want to use{' '}
          <SpellLink spell={TALENTS.ELEMENTAL_BLAST_ELEMENTAL_TALENT} /> when you have one or more{' '}
          <SpellLink spell={TALENTS.ELEMENTAL_SPIRITS_TALENT} /> active, or you have two charges.{' '}
          <SpellLink spell={TALENTS.ELEMENTAL_BLAST_ELEMENTAL_TALENT} /> is still your most
          efficient maelstrom spender, so sitting on two charges is a DPS loss.
        </p>
      </>,
      // details/data
      <>
        <div>
          <PanelHeader>
            <strong>Elemental Blast cast breakdown</strong> -{' '}
            <small>
              Proper usage of <SpellLink spell={TALENTS.ELEMENTAL_BLAST_ELEMENTAL_TALENT} /> with{' '}
              <SpellLink spell={TALENTS.ELEMENTAL_SPIRITS_TALENT} /> active is crucial
            </small>
          </PanelHeader>
          <PerformanceBoxRow values={performance} />
        </div>
      </>,
      undefined,
      'Elemental Blast',
    );
  }

  getCastPerformance(cast: ElementalBlastCastDetails): QualitativePerformance {
    if (cast.chargesBeforeCast === 2 && cast.maelstromUsed >= 5) {
      return QualitativePerformance.Perfect;
    }

    if (cast.elementalSpiritsActive > 0) {
      return cast.maelstromUsed >= 8
        ? QualitativePerformance.Perfect
        : cast.maelstromUsed >= 5
        ? QualitativePerformance.Good
        : QualitativePerformance.Fail;
    }

    return cast.maelstromUsed >= 5 ? QualitativePerformance.Ok : QualitativePerformance.Fail;
  }
}

export default ElementalBlast;
