import TALENTS from 'common/TALENTS/mage';
import { SpellLink, SpellIcon, TooltipElement } from 'interface';
import Analyzer from 'parser/core/Analyzer';
import { RoundedPanel } from 'interface/guide/components/GuideDivs';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { PassFailCheckmark, qualitativePerformanceToColor } from 'interface/guide';
import { GUIDE_CORE_EXPLANATION_PERCENT } from 'analysis/retail/mage/arcane/Guide';

import CooldownExpandable, {
  CooldownExpandableItem,
} from 'interface/guide/components/CooldownExpandable';
import { UNERRING_PROFICIENCY_MAX_STACKS } from '../../shared';
import Supernova, { SupernovaCast } from '../../shared/Supernova';

const AOE_THRESHOLD = 4;
const TOUCH_DURATION_THRESHOLD = 3000;

class SupernovaGuide extends Analyzer {
  static dependencies = {
    supernova: Supernova,
  };

  protected supernova!: Supernova;

  hasTouchOfTheMagi: boolean = this.selectedCombatant.hasTalent(TALENTS.TOUCH_OF_THE_MAGI_TALENT);
  hasUnerringProficiency: boolean = this.selectedCombatant.hasTalent(
    TALENTS.UNERRING_PROFICIENCY_TALENT,
  );

  private perCastBreakdown(cast: SupernovaCast): React.ReactNode {
    const header = (
      <>
        @ {this.owner.formatTimestamp(cast.timestamp)} &mdash;{' '}
        <SpellLink spell={TALENTS.SUPERNOVA_TALENT} />
      </>
    );

    const checklistItems: CooldownExpandableItem[] = [];

    checklistItems.push({
      label: <>Targets Hit</>,
      details: <>{cast.targetsHit}</>,
    });

    if (this.hasTouchOfTheMagi) {
      const touchRemaining =
        cast.touchRemaining && cast.touchRemaining < TOUCH_DURATION_THRESHOLD ? true : false;
      checklistItems.push({
        label: (
          <>
            <SpellLink spell={TALENTS.TOUCH_OF_THE_MAGI_TALENT} /> Duration Remaining
          </>
        ),
        result: <PassFailCheckmark pass={touchRemaining} />,
        details: <>{cast.unerringStacks ? cast.unerringStacks : `Buff Missing`}</>,
      });
    }

    if (this.hasUnerringProficiency) {
      const unerringStacks = cast.unerringStacks === UNERRING_PROFICIENCY_MAX_STACKS;
      checklistItems.push({
        label: (
          <>
            <SpellLink spell={TALENTS.UNERRING_PROFICIENCY_TALENT} /> Stacks
          </>
        ),
        result: <PassFailCheckmark pass={unerringStacks} />,
        details: <>{cast.unerringStacks ? cast.unerringStacks : `Buff Missing`}</>,
      });
    }

    const ST = cast.targetsHit < AOE_THRESHOLD;
    const AOE = cast.targetsHit >= AOE_THRESHOLD;

    const overallPerf =
      (ST && cast.touchRemaining && cast.touchRemaining < TOUCH_DURATION_THRESHOLD) ||
      (this.hasUnerringProficiency &&
        AOE &&
        cast.unerringStacks === UNERRING_PROFICIENCY_MAX_STACKS)
        ? QualitativePerformance.Good
        : QualitativePerformance.Fail;

    return (
      <CooldownExpandable
        header={header}
        checklistItems={checklistItems}
        perf={overallPerf}
        key={cast.ordinal}
      />
    );
  }

  get guideSubsection(): JSX.Element {
    const supernova = <SpellLink spell={TALENTS.SUPERNOVA_TALENT} />;
    const touchOfTheMagi = <SpellLink spell={TALENTS.TOUCH_OF_THE_MAGI_TALENT} />;
    const unerringProficiency = <SpellLink spell={TALENTS.UNERRING_PROFICIENCY_TALENT} />;
    const supernovaIcon = <SpellIcon spell={TALENTS.SUPERNOVA_TALENT} />;

    const explanation = (
      <>
        <div>
          When used in some specific niche circumstances <b>{supernova}</b> does provide a benefit
          to your overall damage, but can also be used as a way to interrupt non-boss enemies by
          forcing them up into the air, making it very valuable in dungeons especially. For raid
          encounters, and boss fights, refer to the guidelines below to get the most damage out of
          the ability.
          <ul>
            <li>
              On Single Target, {supernova} can be used right at the end of {touchOfTheMagi} to get
              some extra damage in before the debuff expires.
            </li>
            <li>
              For Spellslingers, use {supernova} when you have {UNERRING_PROFICIENCY_MAX_STACKS}{' '}
              stacks of {unerringProficiency} and {supernova} will hit {AOE_THRESHOLD} or more
              targets.
            </li>
          </ul>
        </div>
      </>
    );
    const supernovaTooltip = (
      <>{this.supernova.averageTargetsHit.toFixed(2)} average targets hit per cast.</>
    );
    const data =
      this.supernova.casts.length > 0 ? (
        <div>
          <RoundedPanel>
            <div
              style={{
                color: qualitativePerformanceToColor(QualitativePerformance.Good),
                fontSize: '20px',
              }}
            >
              {supernovaIcon}{' '}
              <TooltipElement content={supernovaTooltip}>
                {this.supernova.averageTargetsHit.toFixed(2)} <small>Average Targets Hit</small>
              </TooltipElement>
            </div>
            <div>
              <p>
                <strong>Per-Cast Breakdown</strong>
                <small> - click to expand</small>
                {this.supernova.casts.map((cast) => this.perCastBreakdown(cast))}
              </p>
            </div>
          </RoundedPanel>
        </div>
      ) : (
        <RoundedPanel>
          <div style={{ textAlign: 'center', fontSize: '20px' }}>
            <p>
              <strong>Player did not cast {supernova}</strong>
            </p>
          </div>
        </RoundedPanel>
      );

    return explanationAndDataSubsection(
      explanation,
      data,
      GUIDE_CORE_EXPLANATION_PERCENT,
      'Supernova',
    );
  }
}

export default SupernovaGuide;
