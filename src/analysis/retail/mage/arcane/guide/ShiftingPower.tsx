import TALENTS from 'common/TALENTS/mage';
import { SpellLink } from 'interface';
import Analyzer from 'parser/core/Analyzer';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { PassFailCheckmark } from 'interface/guide';
import { GUIDE_CORE_EXPLANATION_PERCENT } from 'analysis/retail/mage/arcane/Guide';

import ShiftingPowerArcane, { MAX_TICKS, ShiftingPowerCast } from '../talents/ShiftingPower';
import CooldownExpandable, {
  CooldownExpandableItem,
} from 'interface/guide/components/CooldownExpandable';
import SPELLS from 'common/SPELLS';

class ShiftingPowerGuide extends Analyzer {
  static dependencies = {
    shiftingPower: ShiftingPowerArcane,
  };

  protected shiftingPower!: ShiftingPowerArcane;

  private perCastBreakdown(cast: ShiftingPowerCast): React.ReactNode {
    const header = (
      <>
        @ {this.owner.formatTimestamp(cast.timestamp)} &mdash;{' '}
        <SpellLink spell={TALENTS.SHIFTING_POWER_TALENT} />
      </>
    );

    const maxTicks = cast.ticks >= MAX_TICKS;
    const checklistItems: CooldownExpandableItem[] = [];
    checklistItems.push({
      label: 'Channeled full duration',
      result: <PassFailCheckmark pass={maxTicks} />,
      details: (
        <>
          ({cast.ticks} / {MAX_TICKS} ticks)
        </>
      ),
    });

    checklistItems.push({
      label: (
        <>
          <SpellLink spell={TALENTS.ARCANE_SURGE_TALENT} />{' '}
          {!cast.spellsReduced.arcaneSurge && 'NOT'} on CD
        </>
      ),
      result: <PassFailCheckmark pass={cast.spellsReduced.arcaneSurge} />,
    });
    checklistItems.push({
      label: (
        <>
          <SpellLink spell={TALENTS.TOUCH_OF_THE_MAGI_TALENT} />{' '}
          {!cast.spellsReduced.touchOfTheMagi && 'NOT'} on CD
        </>
      ),
      result: <PassFailCheckmark pass={cast.spellsReduced.touchOfTheMagi} />,
    });
    checklistItems.push({
      label: (
        <>
          <SpellLink spell={TALENTS.EVOCATION_TALENT} /> {!cast.spellsReduced.evocation && 'NOT'} on
          CD
        </>
      ),
      result: <PassFailCheckmark pass={cast.spellsReduced.evocation} />,
    });

    const inConservePhase =
      !cast.cdsActive.arcaneSurge && !cast.cdsActive.touchOfTheMagi && !cast.cdsActive.siphonStorm;
    if (inConservePhase) {
      checklistItems.push({
        label: 'In Conserve phase',
        result: <PassFailCheckmark pass={inConservePhase} />,
      });
    }
    if (cast.cdsActive.arcaneSurge) {
      checklistItems.push({
        label: (
          <>
            <SpellLink spell={TALENTS.ARCANE_SURGE_TALENT} /> active!
          </>
        ),
        result: <PassFailCheckmark pass={false} />,
      });
    }
    if (cast.cdsActive.touchOfTheMagi) {
      checklistItems.push({
        label: (
          <>
            <SpellLink spell={TALENTS.TOUCH_OF_THE_MAGI_TALENT} /> active!
          </>
        ),
        result: <PassFailCheckmark pass={false} />,
      });
    }
    if (cast.cdsActive.siphonStorm) {
      checklistItems.push({
        label: (
          <>
            <SpellLink spell={SPELLS.SIPHON_STORM_BUFF} /> active!
          </>
        ),
        result: <PassFailCheckmark pass={false} />,
      });
    }

    const overallPerf =
      maxTicks &&
      cast.spellsReduced.arcaneSurge &&
      cast.spellsReduced.touchOfTheMagi &&
      cast.spellsReduced.evocation &&
      inConservePhase
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
    const shiftingPower = <SpellLink spell={TALENTS.SHIFTING_POWER_TALENT} />;
    const evocation = <SpellLink spell={TALENTS.EVOCATION_TALENT} />;
    const arcaneSurge = <SpellLink spell={TALENTS.ARCANE_SURGE_TALENT} />;
    const touchOfTheMagi = <SpellLink spell={TALENTS.TOUCH_OF_THE_MAGI_TALENT} />;

    const explanation = (
      <>
        <div>
          <strong>{shiftingPower}</strong> reduces your active cooldowns while you channel. Use it
          when your major abilites ({arcaneSurge}, {touchOfTheMagi}, and {evocation}) are all on
          cooldown, after the burn phase is concluded. Do not clip ticks.
        </div>
      </>
    );

    const data = (
      <div>
        <p>
          <strong>Per-Cast Breakdown</strong>
          <small> - click to expand</small>
          {this.shiftingPower.casts.map((cast) => this.perCastBreakdown(cast))}
        </p>
      </div>
    );

    return explanationAndDataSubsection(
      explanation,
      data,
      GUIDE_CORE_EXPLANATION_PERCENT,
      'Shifting Power',
    );
  }
}

export default ShiftingPowerGuide;
