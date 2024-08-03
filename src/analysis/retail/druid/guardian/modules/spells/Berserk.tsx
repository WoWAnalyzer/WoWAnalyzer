import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import { Options } from 'parser/core/Module';
import { TALENTS_DRUID } from 'common/TALENTS';
import Haste from 'parser/shared/modules/Haste';
import { cdDuration, cdSpell } from 'analysis/retail/druid/guardian/constants';
import Spell from 'common/SPELLS/Spell';
import Events, { CastEvent } from 'parser/core/Events';
import SpellLink from 'interface/SpellLink';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import CooldownExpandable, {
  CooldownExpandableItem,
} from 'interface/guide/components/CooldownExpandable';
import { getLowestPerf, QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { PerformanceMark } from 'interface/guide';
import { formatPercentage } from 'common/format';
import AlwaysBeCasting from 'analysis/retail/druid/guardian/modules/features/AlwaysBeCasting';
import RageTracker, {
  RAGE_SCALE_FACTOR,
  rageWasteToPerf,
} from 'analysis/retail/druid/guardian/modules/core/rage/RageTracker';
import { SegmentData } from 'parser/shared/modules/resources/resourcetracker/ResourceTracker';
import SPELLS from 'common/SPELLS';

const BUA_HASTE = 0.15;

const PERFECT_INCARN_ACTIVE = 0.95;
const GOOD_INCARN_ACTIVE = 0.9;
const OK_INCARN_ACTIVE = 0.8;
export function activePerf(activeTimePercentage: number): QualitativePerformance {
  if (activeTimePercentage >= PERFECT_INCARN_ACTIVE) {
    return QualitativePerformance.Perfect;
  } else if (activeTimePercentage >= GOOD_INCARN_ACTIVE) {
    return QualitativePerformance.Good;
  } else if (activeTimePercentage >= OK_INCARN_ACTIVE) {
    return QualitativePerformance.Ok;
  } else {
    return QualitativePerformance.Fail;
  }
}

/**
 * **Berserk: Ravage**
 * Spec Talent
 *
 * Go berserk for 15 sec, reducing the cooldowns of Mangle, Thrash, and Growl by 50%.
 *
 * **Berserk: Unchecked Aggression**
 * Spec Talent
 *
 * Go berserk for 15 sec, increasing haste by 15%, and reducing the rage cost of Maul by 50%.
 *
 * **Berserk: Persistence**
 * Spec Talent
 *
 * Go berserk for 15 sec, reducing the cooldown of Frenzied Regeneration by 100% and cost of Ironfur by 50%.
 *
 * **Incarnation: Guardian of Ursoc**
 * Spec Talent
 *
 * An improved Bear Form that grants the benefits of Berserk, causes Mangle to hit up to 3 targets,
 * and increases maximum health by 30%.
 * Lasts 30 sec. You may freely shapeshift in and out of this improved Bear Form for its duration.
 */
export default class Berserk extends Analyzer.withDependencies({
  spellUsable: SpellUsable,
  haste: Haste,
  alwaysBeCasting: AlwaysBeCasting,
  rageTracker: RageTracker,
}) {
  cdSpell: Spell;
  cdDuration: number;

  hasBRavage: boolean;
  hasBUa: boolean;
  hasBPersistence: boolean;
  hasIncarn: boolean;

  berserkTrackers: BerserkCast[] = [];

  constructor(options: Options) {
    super(options);

    this.hasBRavage = this.selectedCombatant.hasTalent(TALENTS_DRUID.BERSERK_RAVAGE_TALENT);
    this.hasBUa = this.selectedCombatant.hasTalent(
      TALENTS_DRUID.BERSERK_UNCHECKED_AGGRESSION_TALENT,
    );
    this.hasBPersistence = this.selectedCombatant.hasTalent(
      TALENTS_DRUID.BERSERK_PERSISTENCE_TALENT,
    );
    this.hasIncarn = this.selectedCombatant.hasTalent(
      TALENTS_DRUID.INCARNATION_GUARDIAN_OF_URSOC_TALENT,
    );
    this.active = this.hasBRavage || this.hasBUa || this.hasBPersistence || this.hasIncarn;

    this.cdSpell = cdSpell(this.selectedCombatant);
    this.cdDuration = cdDuration(this.selectedCombatant);

    if (this.hasBUa) {
      this.deps.haste.addHasteBuff(this.cdSpell.id, BUA_HASTE);
    }

    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(this.cdSpell), this.onCdUse);
  }

  onCdUse(event: CastEvent) {
    this.berserkTrackers.push({
      startTimestamp: event.timestamp,
      endTimestamp: Math.min(event.timestamp + this.cdDuration, this.owner.fight.end_time),
      activeTimePercentage: undefined,
      rageData: undefined,
      swipes: 0,
    });

    if (this.hasBPersistence) {
      this.deps.spellUsable.endCooldown(
        TALENTS_DRUID.FRENZIED_REGENERATION_TALENT.id,
        this.owner.currentTimestamp,
        true,
        true,
      );
    }
  }

  private fillCastInfos() {
    this.berserkTrackers.forEach((cast) => {
      if (cast.activeTimePercentage === undefined) {
        cast.activeTimePercentage = this.deps.alwaysBeCasting.getActiveTimePercentageInWindow(
          cast.startTimestamp,
          cast.endTimestamp,
        );
      }

      if (cast.rageData === undefined) {
        cast.rageData = this.deps.rageTracker.generateSegmentData(
          cast.startTimestamp,
          cast.endTimestamp,
        );
      }
    });
  }

  private perCastBreakdown(cast: BerserkCast): React.ReactNode {
    const header = (
      <>
        @ {this.owner.formatTimestamp(cast.startTimestamp)} &mdash;{' '}
        <SpellLink spell={this.cdSpell} />
      </>
    );

    const activeTimePercentage = cast.activeTimePercentage ?? 0;
    const percentActivePerf = activePerf(activeTimePercentage);

    const rageWastedPercentage = cast.rageData ? cast.rageData.percentWasted : 0;
    const rageSpendPerf = rageWasteToPerf(rageWastedPercentage);

    const swipesPerf =
      cast.swipes === 0 ? QualitativePerformance.Good : QualitativePerformance.Fail;

    const checklistItems: CooldownExpandableItem[] = [];
    checklistItems.push({
      label: <>Stay Active!</>,
      result: <PerformanceMark perf={percentActivePerf} />,
      details: <>({formatPercentage(cast.activeTimePercentage ?? 0, 0)}% active time)</>,
    });
    checklistItems.push({
      label: <>Spend your Rage</>,
      result: <PerformanceMark perf={rageSpendPerf} />,
      details: <>({formatPercentage(cast.rageWastedPercentage ?? 0, 0)}% rage wasted)</>,
    });
    checklistItems.push({
      label: <>Don't Swipe</>,
      result: <PerformanceMark perf={swipesPerf} />,
      details: <>({cast.swipes} swipes)</>,
    });
    const overallPerf = getLowestPerf([percentActivePerf, rageSpendPerf, swipesPerf]);

    const detailItems: CooldownExpandableItem[] = [];
    detailItems.push({
      label: <>Total Rage generated</>,
      details: <>{cast.rageData.builderGenerated * RAGE_SCALE_FACTOR} Rage</>,
    });
    detailItems.push({
      label: (
        <>
          Rage spent on <SpellLink spell={SPELLS.IRONFUR} />
        </>
      ),
      details: <>{cast.rageData.spentBySpell(SPELLS.IRONFUR.id) * RAGE_SCALE_FACTOR} Rage</>,
    });
    detailItems.push({
      label: (
        <>
          Rage spent on <SpellLink spell={SPELLS.MAUL} /> &{' '}
          <SpellLink spell={TALENTS_DRUID.RAZE_TALENT} />
        </>
      ),
      details: (
        <>
          {(cast.rageData.spentBySpell(SPELLS.MAUL.id) +
            cast.rageData.spentBySpell(TALENTS_DRUID.RAZE_TALENT.id)) *
            RAGE_SCALE_FACTOR}{' '}
          Rage
        </>
      ),
    });

    return (
      <CooldownExpandable
        header={header}
        checklistItems={checklistItems}
        detailItems={detailItems}
        perf={overallPerf}
        key={cast.startTimestamp}
      />
    );
  }

  get guideCastBreakdown(): React.ReactNode {
    this.fillCastInfos();

    const explanation = (
      <p>
        <strong>
          <SpellLink spell={this.cdSpell} />
        </strong>{' '}
        is our primary damage cooldown and also a very powerful defensive cooldown. It's
        particularly potent in AoE. You should maximize ability use while its active.
      </p>
    );

    const data = (
      <p>
        <strong>Per-Cast Breakdown</strong>
        <small> - click to expand</small>
        {this.berserkTrackers.map((cast) => this.perCastBreakdown(cast))}
      </p>
    );

    return explanationAndDataSubsection(explanation, data);
  }
}

interface BerserkCast {
  startTimestamp: number;
  endTimestamp: number;
  activeTimePercentage: number | undefined; // Fill in at end, only once for perf
  rageData: SegmentData | undefined; // Fill in at end, only once for perf
  swipes: number;
}
