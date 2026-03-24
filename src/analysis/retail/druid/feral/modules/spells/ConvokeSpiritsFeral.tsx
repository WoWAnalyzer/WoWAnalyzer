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
import { PassFailCheckmark, PerformanceMark } from 'interface/guide';
import { TALENTS_DRUID } from 'common/TALENTS';
import { cdSpell } from 'analysis/retail/druid/feral/constants';
import EnergyTracker from 'analysis/retail/druid/feral/modules/core/energy/EnergyTracker';

class ConvokeSpiritsFeral extends ConvokeSpirits {
  static dependencies = {
    ...ConvokeSpirits.dependencies,
    energyTracker: EnergyTracker,
  };

  protected energyTracker!: EnergyTracker;

  /** Mapping from convoke cast number to a tracker for that cast - note that index zero will always be empty */
  feralConvokeTracker: FeralConvokeCast[] = [];

  onConvoke(event: ApplyBuffEvent) {
    super.onConvoke(event);

    const tfOnCast = this.selectedCombatant.hasBuff(SPELLS.TIGERS_FURY.id);
    const berserkOnCast = this.selectedCombatant.hasBuff(cdSpell(this.selectedCombatant));
    const energyOnCast = this.energyTracker.current;

    this.feralConvokeTracker[this.cast] = {
      tfOnCast,
      berserkOnCast,
      energyOnCast,
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
    const hasHotL = this.selectedCombatant.hasTalent(
      TALENTS_DRUID.BERSERK_HEART_OF_THE_LION_TALENT,
    );
    const explanation = (
      <>
        <p>
          <strong>
            <SpellLink spell={SPELLS.CONVOKE_SPIRITS} />
          </strong>{' '}
          is a powerful but somewhat random burst of damage. It's best used immediately on cooldown.
          Always pair it with <SpellLink spell={SPELLS.TIGERS_FURY} />
          {hasHotL && (
            <>
              {' '}
              and <SpellLink spell={cdSpell(this.selectedCombatant)} />
            </>
          )}{' '}
          to benefit from the damage boost. If possible, spend down your energy before starting the
          channel (this may not be possible with abundant procs and/or high haste)
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

          let energyPerf = QualitativePerformance.Good;
          if (feralCast.energyOnCast >= 100) {
            energyPerf = QualitativePerformance.Fail;
          } else if (feralCast.energyOnCast >= 50) {
            energyPerf = QualitativePerformance.Ok;
          }

          let overallPerf = QualitativePerformance.Good;

          const checklistItems: CooldownExpandableItem[] = [];
          checklistItems.push({
            label: (
              <>
                <SpellLink spell={SPELLS.TIGERS_FURY} /> active
              </>
            ),
            result: <PassFailCheckmark pass={feralCast.tfOnCast} />,
          });
          if (!feralCast.tfOnCast) {
            overallPerf = QualitativePerformance.Fail;
          }

          if (hasHotL) {
            checklistItems.push({
              label: (
                <>
                  <SpellLink spell={cdSpell(this.selectedCombatant)} /> active
                </>
              ),
              result: <PassFailCheckmark pass={feralCast.berserkOnCast} />,
            });
            if (!feralCast.berserkOnCast) {
              overallPerf = QualitativePerformance.Fail;
            }
          }

          checklistItems.push({
            label: 'Energy on cast',
            result: <PerformanceMark perf={energyPerf} />,
            details: <>({feralCast.energyOnCast} Energy)</>,
          });
          overallPerf =
            overallPerf === QualitativePerformance.Good &&
            energyPerf !== QualitativePerformance.Good
              ? QualitativePerformance.Ok
              : overallPerf;

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
  berserkOnCast: boolean;
  energyOnCast: number;
}

export default ConvokeSpiritsFeral;
