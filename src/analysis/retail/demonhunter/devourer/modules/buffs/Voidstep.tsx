import type { JSX } from 'react';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { ExplanationAndDataSubSection } from 'interface/guide/components/ExplanationRow';
import { RoundedPanel } from 'interface/guide/components/GuideDivs';
import { TALENTS_DEMON_HUNTER } from 'common/TALENTS';
import Events from 'parser/core/Events';
import SPELLS from 'common/SPELLS';
import { TooltipElement } from 'interface/Tooltip';
import { formatPercentage } from 'common/format';
import SpellIcon from 'interface/SpellIcon';
import SpellLink from 'interface/SpellLink';
import { GUIDE_CORE_EXPLANATION_PERCENT } from '../../Guide';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { qualitativePerformanceToColor } from 'interface/guide';

class Voidstep extends Analyzer {
  totalProcs = 0;
  consumedProcs = 0;
  voidstepRefreshes = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_DEMON_HUNTER.HUNGERING_SLASH_TALENT);

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.VOIDSTEP),
      this.onApplyBuff,
    );

    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.VOIDSTEP),
      this.onRefreshBuff,
    );

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS_DEMON_HUNTER.VENGEFUL_RETREAT_TALENT),
      this.onVengefulRetreatCast,
    );
  }

  onApplyBuff() {
    this.totalProcs += 1;
  }

  onRefreshBuff() {
    this.totalProcs += 1;
    this.voidstepRefreshes += 1;
  }

  onVengefulRetreatCast() {
    if (this.selectedCombatant.hasBuff(SPELLS.VOIDSTEP)) {
      this.consumedProcs += 1;
    }
  }

  get expiredProcs() {
    return this.totalProcs - this.consumedProcs - this.voidstepRefreshes;
  }

  get expiredProcsPercentage() {
    return this.expiredProcs / this.totalProcs;
  }

  get overwrittenProcsPercentage() {
    return this.voidstepRefreshes / this.totalProcs;
  }

  get consumedProcsPercentage() {
    return this.consumedProcs / this.totalProcs;
  }

  get expiredPerformance() {
    let performance = QualitativePerformance.Fail;

    if (this.expiredProcsPercentage > 0.25) {
      performance = QualitativePerformance.Fail;
    } else if (this.expiredProcsPercentage > 0.1) {
      performance = QualitativePerformance.Ok;
    } else if (this.expiredProcsPercentage > 0) {
      performance = QualitativePerformance.Good;
    } else if (this.expiredProcsPercentage === 0) {
      performance = QualitativePerformance.Perfect;
    }

    return performance;
  }

  get overwrittenPerformance() {
    let performance = QualitativePerformance.Fail;

    if (this.overwrittenProcsPercentage > 0.25) {
      performance = QualitativePerformance.Fail;
    } else if (this.overwrittenProcsPercentage > 0.1) {
      performance = QualitativePerformance.Ok;
    } else if (this.overwrittenProcsPercentage > 0) {
      performance = QualitativePerformance.Good;
    } else if (this.overwrittenProcsPercentage === 0) {
      performance = QualitativePerformance.Perfect;
    }

    return performance;
  }

  get consumedPerformance() {
    let performance = QualitativePerformance.Fail;

    if (this.consumedProcsPercentage < 0.75) {
      performance = QualitativePerformance.Fail;
    } else if (this.consumedProcsPercentage < 0.9) {
      performance = QualitativePerformance.Ok;
    } else if (this.consumedProcsPercentage < 1) {
      performance = QualitativePerformance.Good;
    } else if (this.consumedProcsPercentage === 1) {
      performance = QualitativePerformance.Perfect;
    }

    return performance;
  }

  guideSubsection(): JSX.Element {
    const explanation = (
      <>
        <p>
          After each <SpellLink spell={SPELLS.HUNGERING_SLASH_CAST} /> and{' '}
          <SpellLink spell={SPELLS.REAPERS_TOLL} /> casts, you are granted a temporary
          <SpellLink spell={TALENTS_DEMON_HUNTER.VENGEFUL_RETREAT_TALENT} /> charge that deals
          increased AoE damage. You should aim to consume this proc everytime, as it is free damage.
        </p>
      </>
    );

    const consumedTooltip = (
      <>
        {this.consumedProcs}/{this.totalProcs} procs consumed
      </>
    );

    const expiredTooltip = (
      <>
        {this.expiredProcs}/{this.totalProcs} procs expired
      </>
    );

    const overwrittenTooltip = (
      <>
        {this.voidstepRefreshes}/{this.totalProcs} procs overwritten
      </>
    );

    const data = (
      <RoundedPanel
        style={{
          display: 'flex',
          justifyContent: 'space-evenly',
        }}
      >
        <div
          style={{
            fontSize: '20px',
            color: qualitativePerformanceToColor(this.consumedPerformance),
          }}
        >
          <SpellIcon spell={SPELLS.VOIDSTEP} />{' '}
          <TooltipElement content={consumedTooltip}>
            {formatPercentage(this.consumedProcs / this.totalProcs, 0)} % <small>consumed</small>
          </TooltipElement>
        </div>

        <div
          style={{
            fontSize: '20px',
            color: qualitativePerformanceToColor(this.overwrittenPerformance),
          }}
        >
          <SpellIcon spell={SPELLS.VOIDSTEP} />{' '}
          <TooltipElement content={overwrittenTooltip}>
            {formatPercentage(this.voidstepRefreshes / this.totalProcs, 0)} %{' '}
            <small>overwritten</small>
          </TooltipElement>
        </div>

        <div
          style={{
            fontSize: '20px',
            color: qualitativePerformanceToColor(this.expiredPerformance),
          }}
        >
          <SpellIcon spell={SPELLS.VOIDSTEP} />{' '}
          <TooltipElement content={expiredTooltip}>
            {formatPercentage(this.expiredProcs / this.totalProcs, 0)} % <small>expired</small>
          </TooltipElement>
        </div>
      </RoundedPanel>
    );

    return (
      <ExplanationAndDataSubSection
        explanation={explanation}
        data={data}
        explanationPercent={GUIDE_CORE_EXPLANATION_PERCENT}
        title="Voidstep"
      />
    );
  }
}

export default Voidstep;
