import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/mage';
import { SpellLink } from 'interface';
import Analyzer from 'parser/core/Analyzer';
import { RoundedPanel } from 'interface/guide/components/GuideDivs';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { PassFailCheckmark } from 'interface/guide';
import { GUIDE_CORE_EXPLANATION_PERCENT } from 'analysis/retail/mage/arcane/Guide';

import CooldownExpandable, {
  CooldownExpandableItem,
} from 'interface/guide/components/CooldownExpandable';
import PresenceOfMind, { PresenceOfMindCast } from '../talents/PresenceOfMind';

const TOUCH_DELAY_THRESHOLD = 500;
const AOE_THRESHOLD = 4;

class PresenceOfMindGuide extends Analyzer {
  static dependencies = {
    presenceOfMind: PresenceOfMind,
  };

  protected presenceOfMind!: PresenceOfMind;

  private perCastBreakdown(cast: PresenceOfMindCast): React.ReactNode {
    const header = (
      <>
        @ {this.owner.formatTimestamp(cast.cast.timestamp)} &mdash;{' '}
        <SpellLink spell={TALENTS.PRESENCE_OF_MIND_TALENT} />
      </>
    );

    const checklistItems: CooldownExpandableItem[] = [];

    checklistItems.push({
      label: (
        <>
          <SpellLink spell={SPELLS.ARCANE_CHARGE} />s
        </>
      ),
      details: <>{cast.charges}</>,
    });

    checklistItems.push({
      label: <>Targets Hit (Next Barrage)</>,
      details: <>{cast.targets ? cast.targets : `Unknown`}</>,
    });

    checklistItems.push({
      label: <>Stacks Used</>,
      details: <>{cast.stacksUsed}</>,
    });

    if (cast.targets && cast.targets < AOE_THRESHOLD) {
      const touchAtEnd = cast.usedTouchEnd ? true : false;
      checklistItems.push({
        label: (
          <>
            Used at end of <SpellLink spell={TALENTS.TOUCH_OF_THE_MAGI_TALENT} />
          </>
        ),
        result: <PassFailCheckmark pass={touchAtEnd} />,
        details: <>{touchAtEnd ? `Yes` : `No`}</>,
      });
    }

    if (cast.touchCancelDelay) {
      checklistItems.push({
        label: <>Channel Clipped Before/After GCD</>,
        result: <PassFailCheckmark pass={cast.touchCancelDelay > TOUCH_DELAY_THRESHOLD} />,
        details: <>`{cast.touchCancelDelay.toFixed(2)}ms</>,
      });
    }

    const ST = cast.targets && cast.targets < AOE_THRESHOLD;
    const AOE = cast.targets && cast.targets >= AOE_THRESHOLD;
    const touchDelay = cast.touchCancelDelay;
    const touchAtEnd = cast.usedTouchEnd;
    const aoeCharges = cast.charges === 2 || cast.charges === 3;

    const overallPerf =
      (ST && touchAtEnd && !touchDelay) ||
      (ST && touchAtEnd && touchDelay && touchDelay < TOUCH_DELAY_THRESHOLD) ||
      (AOE && aoeCharges)
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
    const presenceOfMind = <SpellLink spell={TALENTS.PRESENCE_OF_MIND_TALENT} />;
    const arcaneBlast = <SpellLink spell={SPELLS.ARCANE_BLAST} />;
    const touchOfTheMagi = <SpellLink spell={TALENTS.TOUCH_OF_THE_MAGI_TALENT} />;
    const arcaneCharge = <SpellLink spell={SPELLS.ARCANE_CHARGE} />;
    const arcaneBarrage = <SpellLink spell={SPELLS.ARCANE_BARRAGE} />;

    const explanation = (
      <>
        <div>
          <b>{presenceOfMind}</b> is a simple ability whos primary benefit is squeezing a couple
          extra casts into a tight buff window or getting to a harder hitting ability faster. So
          while it itself is not a major damage ability, it can help you get a little bit more out
          of your other abilities. Use the below guidelines to add these benefits to your rotation.
          <ul>
            <li>
              In Single Target, you should use {presenceOfMind} to squeeze a couple extra casts into
              the final couple seconds of {touchOfTheMagi}
            </li>
            <li>
              If you are unable to finish both {arcaneBlast} casts before {touchOfTheMagi} ends,
              cancel the {presenceOfMind} buff so it's cooldown stays in sync with {touchOfTheMagi}
            </li>
            <li>
              In AOE, you can use {presenceOfMind} at 2 or 3 {arcaneCharge}s to get to{' '}
              {arcaneBarrage} (with 4 {arcaneCharge}s) faster.
            </li>
          </ul>
        </div>
      </>
    );
    const data = (
      <div>
        <RoundedPanel>
          <div>
            <p>
              <strong>Per-Cast Breakdown</strong>
              <small> - click to expand</small>
              {this.presenceOfMind.pomCasts.map((cast) => this.perCastBreakdown(cast))}
            </p>
          </div>
        </RoundedPanel>
      </div>
    );

    return explanationAndDataSubsection(
      explanation,
      data,
      GUIDE_CORE_EXPLANATION_PERCENT,
      'Presence of Mind',
    );
  }
}

export default PresenceOfMindGuide;
