import { formatDurationMillisMinSec, formatPercentage } from 'common/format';
import { ReactNode } from 'react';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/mage';
import { SpellLink } from 'interface';
import Analyzer from 'parser/core/Analyzer';
import { RoundedPanel } from 'interface/guide/components/GuideDivs';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { PerformanceMark } from 'interface/guide';
import { GUIDE_CORE_EXPLANATION_PERCENT } from 'analysis/retail/mage/arcane/Guide';

import ArcaneBarrage, { ArcaneBarrageCast } from '../core/ArcaneBarrage';
import CooldownExpandable, {
  CooldownExpandableItem,
} from 'interface/guide/components/CooldownExpandable';
import { ARCANE_CHARGE_MAX_STACKS } from '../../shared';

const AOE_THRESHOLD = 4;
const TEMPO_REMAINING_THRESHOLD = 5000;
const NETHER_STACK_THRESHOLD = 1;
const TOUCH_CD_THRESHOLD = 6000;
const EVOCATION_CD_THRESHOLD = 45000;
const LOW_MANA_THRESHOLD = 0.7;
const NO_MANA_THRESHOLD = 0.1;

class ArcaneBarrageGuide extends Analyzer {
  static dependencies = {
    arcaneBarrage: ArcaneBarrage,
  };

  protected arcaneBarrage!: ArcaneBarrage;

  generateGuideTooltip(
    performance: QualitativePerformance,
    tooltipText: ReactNode,
    timestamp: number,
  ) {
    const tooltip = (
      <>
        <div>
          <b>@ {this.owner.formatTimestamp(timestamp)}</b>
        </div>
        <div>
          <PerformanceMark perf={performance} /> {performance}: {tooltipText}
        </div>
      </>
    );
    return tooltip;
  }

  private perCastBreakdown(cast: ArcaneBarrageCast): React.ReactNode {
    const header = (
      <>
        @ {this.owner.formatTimestamp(cast.cast)} &mdash;{' '}
        <SpellLink spell={SPELLS.ARCANE_BARRAGE} />
      </>
    );

    const checklistItems: CooldownExpandableItem[] = [];

    checklistItems.push({
      label: (
        <>
          <SpellLink spell={SPELLS.ARCANE_CHARGE} />s Before Barrage
        </>
      ),
      details: <>{cast.charges}</>,
    });

    checklistItems.push({
      label: <>Mana %</>,
      details: <>{formatPercentage(cast.mana || 0, 2)}%</>,
    });

    checklistItems.push({
      label: <>Targets Hit</>,
      details: <>{cast.targetsHit}</>,
    });

    if (this.selectedCombatant.hasTalent(TALENTS.ARCANE_TEMPO_TALENT)) {
      checklistItems.push({
        label: (
          <>
            Time until <SpellLink spell={TALENTS.ARCANE_TEMPO_TALENT} /> expires
          </>
        ),
        details: (
          <>
            {cast.tempoRemaining && cast.tempoRemaining !== 0
              ? formatDurationMillisMinSec(cast.tempoRemaining)
              : `Buff Missing`}
          </>
        ),
      });
    }

    if (this.selectedCombatant.hasTalent(TALENTS.TOUCH_OF_THE_MAGI_TALENT)) {
      checklistItems.push({
        label: (
          <>
            <SpellLink spell={TALENTS.TOUCH_OF_THE_MAGI_TALENT} /> Cooldown Remaining
          </>
        ),
        details: (
          <>
            {cast.touchCD && cast.touchCD > 0
              ? formatDurationMillisMinSec(cast.touchCD)
              : `Available`}
          </>
        ),
      });
    }

    if (this.selectedCombatant.hasTalent(TALENTS.EVOCATION_TALENT)) {
      checklistItems.push({
        label: (
          <>
            <SpellLink spell={TALENTS.EVOCATION_TALENT} /> Cooldown Remaining
          </>
        ),
        details: (
          <>
            {cast.evocationCD && cast.evocationCD > 0
              ? formatDurationMillisMinSec(cast.evocationCD)
              : `Available`}
          </>
        ),
      });
    }

    if (this.selectedCombatant.hasTalent(TALENTS.NETHER_PRECISION_TALENT)) {
      checklistItems.push({
        label: (
          <>
            <SpellLink spell={TALENTS.NETHER_PRECISION_TALENT} /> Stacks
          </>
        ),
        details: <>{cast.netherPrecisionStacks ? cast.netherPrecisionStacks : `Buff Missing`}</>,
      });
    }

    const ST = cast.targetsHit < AOE_THRESHOLD;
    const AOE = cast.targetsHit >= AOE_THRESHOLD;
    const maxCharges = cast.charges >= ARCANE_CHARGE_MAX_STACKS;
    const tempoExpiring =
      cast.tempoRemaining &&
      cast.tempoRemaining < TEMPO_REMAINING_THRESHOLD &&
      cast.tempoRemaining !== 0;
    const touchNotSoon = cast.touchCD && cast.touchCD > TOUCH_CD_THRESHOLD;
    const lowMana = cast.mana && cast.mana < LOW_MANA_THRESHOLD;
    const noMana = cast.mana && cast.mana < NO_MANA_THRESHOLD;
    const evocationNotSoon = cast.evocationCD && cast.evocationCD > EVOCATION_CD_THRESHOLD;
    const oneNPStack = cast.netherPrecisionStacks === NETHER_STACK_THRESHOLD;
    const arcaneOrbAvail = cast.arcaneOrbAvail;
    const clearcastingAvail = cast.clearcasting;

    const overallPerf =
      tempoExpiring ||
      (ST && lowMana && touchNotSoon && evocationNotSoon) ||
      (ST && maxCharges && oneNPStack && (arcaneOrbAvail || clearcastingAvail)) ||
      (ST && noMana) ||
      (AOE && maxCharges)
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
    const arcaneCharge = <SpellLink spell={SPELLS.ARCANE_CHARGE} />;
    const netherPrecision = <SpellLink spell={TALENTS.NETHER_PRECISION_TALENT} />;
    const arcaneTempo = <SpellLink spell={TALENTS.ARCANE_TEMPO_TALENT} />;
    const touchOfTheMagi = <SpellLink spell={TALENTS.TOUCH_OF_THE_MAGI_TALENT} />;
    const evocation = <SpellLink spell={TALENTS.EVOCATION_TALENT} />;
    const arcaneBlast = <SpellLink spell={SPELLS.ARCANE_BLAST} />;
    const arcaneBarrage = <SpellLink spell={SPELLS.ARCANE_BARRAGE} />;
    const clearcasting = <SpellLink spell={SPELLS.CLEARCASTING_ARCANE} />;
    const arcaneOrb = <SpellLink spell={SPELLS.ARCANE_ORB} />;

    const explanation = (
      <>
        <div>
          Casting <b>{arcaneBarrage}</b> spends your {arcaneCharge}s, removing the increased damage
          and mana cost of your arcane spells. Since clearing {arcaneCharge} reduces your damage,
          refer to the below rules for when you should cast {arcaneBarrage}:
        </div>
        <div>
          <ul>
            <li>
              If {arcaneTempo} is about to expire, cast {arcaneBarrage} to refresh the buff.
            </li>
            <li>
              Do not cast {arcaneBarrage} if {touchOfTheMagi} is less than 5-6 seconds away.
            </li>
            <li>
              On Single Target: Cast {arcaneBarrage} if below 70% mana and {evocation} is more than
              45s away.
            </li>
            <li>
              If all of the following are true, start casting {arcaneBlast} and queue up an{' '}
              {arcaneBarrage} at the very end of the {arcaneBlast} cast:
            </li>
            <ul>
              <li>You have 4 {arcaneCharge}s</li>
              <li>1 stack of {netherPrecision}</li>
              <li>
                Either a {clearcasting} proc or a charge of {arcaneOrb}
              </li>
            </ul>
            <li>If you run out of mana, cast {arcaneBarrage}</li>
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
              {this.arcaneBarrage.barrageCasts.map((cast) => this.perCastBreakdown(cast))}
            </p>
          </div>
        </RoundedPanel>
      </div>
    );

    return explanationAndDataSubsection(
      explanation,
      data,
      GUIDE_CORE_EXPLANATION_PERCENT,
      'Arcane Barrage',
    );
  }
}

export default ArcaneBarrageGuide;
