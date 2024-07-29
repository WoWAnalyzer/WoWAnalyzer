import { ConvokeSpirits } from 'analysis/retail/druid/shared';
import SPELLS from 'common/SPELLS';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemPercentDamageDone from 'parser/ui/ItemPercentDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { SpellLink } from 'interface';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import CooldownExpandable, {
  CooldownExpandableItem,
} from 'interface/guide/components/CooldownExpandable';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { ApplyBuffEvent } from 'parser/core/Events';
import ComboPointTracker from 'analysis/retail/druid/feral/modules/core/combopoints/ComboPointTracker';
import { PassFailCheckmark, PerformanceMark } from 'interface/guide';

class ConvokeSpiritsFeral extends ConvokeSpirits {
  static dependencies = {
    ...ConvokeSpirits.dependencies,
    comboPointTracker: ComboPointTracker,
  };

  protected comboPointTracker!: ComboPointTracker;

  /** Mapping from convoke cast number to a tracker for that cast - note that index zero will always be empty */
  feralConvokeTracker: FeralConvokeCast[] = [];

  onConvoke(event: ApplyBuffEvent) {
    super.onConvoke(event);

    const tfOnCast = this.selectedCombatant.hasBuff(SPELLS.TIGERS_FURY.id);
    const cpsOnCast = this.comboPointTracker.current;

    this.feralConvokeTracker[this.cast] = {
      tfOnCast,
      cpsOnCast,
    };
  }

  // TODO also show energy and CP gained
  statistic() {
    return (
      <Statistic
        wide
        position={STATISTIC_ORDER.CORE()}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            <strong>
              Damage amount listed considers only the direct damage and non-refreshable DoT damage
              done by convoked abilities!{' '}
            </strong>
            (Non-refreshable DoTs are Starfall and Feral Frenzy) Refreshable DoTs, heals, and the
            energy and damage boost from Tiger's Fury are all not considered by this number, making
            it almost certainly an undercount of Convoke's true value.
            <br />
            <br />
            {this.baseTooltip}
          </>
        }
        dropdown={this.baseTable}
      >
        <BoringSpellValueText spell={SPELLS.CONVOKE_SPIRITS}>
          <ItemPercentDamageDone greaterThan amount={this.totalDamage} />
          <br />
        </BoringSpellValueText>
      </Statistic>
    );
  }

  /** Guide fragment showing a breakdown of each Convoke cast */
  get guideCastBreakdown() {
    const explanation = (
      <>
        <p>
          <strong>
            <SpellLink spell={SPELLS.CONVOKE_SPIRITS} />
          </strong>{' '}
          is a powerful but somewhat random burst of damage. It's best used immediately on cooldown.
          Always use with <SpellLink spell={SPELLS.TIGERS_FURY} /> active to benefit from the damage
          boost, and ideally use it at low combo points to benefit from the combo points it will
          generate.
        </p>
      </>
    );

    const data = (
      <div>
        <strong>Per-Cast Breakdown</strong>
        <small> - click to expand</small>
        {this.convokeTracker.map((cast, ix) => {
          const feralCast = this.feralConvokeTracker[ix];

          const header = (
            <>
              @ {this.owner.formatTimestamp(cast.timestamp)} &mdash;{' '}
              <SpellLink spell={SPELLS.CONVOKE_SPIRITS} />
            </>
          );

          let cpsPerf = QualitativePerformance.Good;
          if (feralCast.cpsOnCast > 2) {
            cpsPerf = QualitativePerformance.Fail;
          } else if (feralCast.cpsOnCast > 0) {
            cpsPerf = QualitativePerformance.Ok;
          }

          const overallPerf =
            feralCast.cpsOnCast <= 2 && feralCast.tfOnCast
              ? QualitativePerformance.Good
              : QualitativePerformance.Fail;

          const checklistItems: CooldownExpandableItem[] = [];
          checklistItems.push({
            label: (
              <>
                <SpellLink spell={SPELLS.TIGERS_FURY} /> active
              </>
            ),
            result: <PassFailCheckmark pass={feralCast.tfOnCast} />,
          });
          checklistItems.push({
            label: 'Combo Points on cast',
            result: <PerformanceMark perf={cpsPerf} />,
            details: <>({feralCast.cpsOnCast} CPs)</>,
          });

          return (
            <CooldownExpandable
              header={header}
              checklistItems={checklistItems}
              perf={overallPerf}
              key={ix}
            />
          );
        })}
      </div>
    );

    return explanationAndDataSubsection(explanation, data);
  }
}

/** A tracker for feral specific things that happen in a single Convoke cast */
interface FeralConvokeCast {
  tfOnCast: boolean;
  cpsOnCast: number;
}

export default ConvokeSpiritsFeral;
