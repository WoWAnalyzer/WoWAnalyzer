import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import type { JSX } from 'react';
import { TALENTS_PALADIN } from 'common/TALENTS';
import SPELLS from 'common/SPELLS';
import Events from 'parser/core/Events';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { RoundedPanel } from 'interface/guide/components/GuideDivs';
import { TooltipElement } from 'interface/Tooltip';
import { formatPercentage } from 'common/format';
import SpellIcon from 'interface/SpellIcon';
import SpellLink from 'interface/SpellLink';
import { qualitativePerformanceToColor } from 'interface/guide';
import ResourceLink from 'interface/ResourceLink';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import Spell from 'common/SPELLS/Spell';
import { Talent } from 'common/TALENTS/types';

type ArtOfWarSpender = Spell | Talent;

class ArtOfWar extends Analyzer {
  #artOfWarSpenders: ArtOfWarSpender[] = [TALENTS_PALADIN.BLADE_OF_JUSTICE_TALENT];

  #totalProcs = 0;
  #consumedProcs = 0;
  #artOfWarOvercaps = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_PALADIN.ART_OF_WAR_TALENT);

    if (this.selectedCombatant.hasTalent(TALENTS_PALADIN.WALK_INTO_LIGHT_TALENT))
      this.#artOfWarSpenders.push(SPELLS.HAMMER_OF_WRATH_RET);

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.ART_OF_WAR),
      this.#onApplyBuff,
    );

    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.ART_OF_WAR),
      this.#onRefreshBuff,
    );

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(this.#artOfWarSpenders),
      this.#onArtOfWarSpenderCast,
    );
  }

  #onApplyBuff() {
    this.#totalProcs += 1;
  }

  #onRefreshBuff() {
    this.#totalProcs += 1;
    if ((this.selectedCombatant.getBuff(SPELLS.ART_OF_WAR)?.stacks || 0) == 2) {
      this.#artOfWarOvercaps += 1;
    }
  }

  #onArtOfWarSpenderCast() {
    if (!this.selectedCombatant.hasBuff(SPELLS.ART_OF_WAR)) {
      return;
    }

    this.#consumedProcs += 1;
  }

  get expiredProcs() {
    return this.#totalProcs - this.#consumedProcs - this.#artOfWarOvercaps;
  }

  get expiredProcsPercentage() {
    return this.expiredProcs / this.#totalProcs;
  }

  get overwrittenProcsPercentage() {
    return this.#artOfWarOvercaps / this.#totalProcs;
  }

  get consumedProcsPercentage() {
    return this.#consumedProcs / this.#totalProcs;
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

  get guideSubsection(): JSX.Element {
    const heraldTooltipExplanation = (
      <>
        As Herald of The Sun, <SpellLink spell={TALENTS_PALADIN.WALK_INTO_LIGHT_TALENT} /> makes{' '}
        <SpellLink spell={TALENTS_PALADIN.HAMMER_OF_WRATH_TALENT} /> fire a free{' '}
        <SpellLink spell={TALENTS_PALADIN.BLADE_OF_JUSTICE_TALENT} />.
      </>
    );

    const explanation = (
      <>
        <p>
          <SpellLink spell={SPELLS.ART_OF_WAR} /> plays into you apex talents{' '}
          <SpellLink spell={TALENTS_PALADIN.LIGHT_WITHIN_3_RETRIBUTION_TALENT} /> that further
          empowers <SpellLink spell={TALENTS_PALADIN.BLADE_OF_JUSTICE_TALENT} /> and deals AoE
          damage in a cone in front of you.
        </p>
        <p>
          <SpellLink spell={SPELLS.ART_OF_WAR} /> now stacks to 2 times. When at two charges, spend
          ASAP using <SpellLink spell={TALENTS_PALADIN.BLADE_OF_JUSTICE_TALENT} />
          {this.selectedCombatant.hasTalent(TALENTS_PALADIN.WALK_INTO_LIGHT_TALENT) && (
            <>
              {' '}
              (or <SpellLink spell={TALENTS_PALADIN.HAMMER_OF_WRATH_TALENT} /> during{' '}
              <SpellLink spell={TALENTS_PALADIN.AVENGING_WRATH_TALENT} />{' '}
              <TooltipElement content={heraldTooltipExplanation}>
                when playing Herald of The Sun
              </TooltipElement>
              )
            </>
          )}
          , always with less than 5 <ResourceLink id={RESOURCE_TYPES.HOLY_POWER.id} />.
        </p>
      </>
    );

    const consumedTooltip = (
      <>
        {this.#consumedProcs}/{this.#totalProcs} procs consumed
      </>
    );

    const expiredTooltip = (
      <>
        {this.expiredProcs}/{this.#totalProcs} procs expired
      </>
    );

    const overwrittenTooltip = (
      <>
        {this.#artOfWarOvercaps}/{this.#totalProcs} procs overwritten
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
          <SpellIcon spell={SPELLS.ART_OF_WAR} />{' '}
          <TooltipElement content={consumedTooltip}>
            {formatPercentage(this.#consumedProcs / this.#totalProcs, 0)} % <small>consumed</small>
          </TooltipElement>
        </div>

        <div
          style={{
            fontSize: '20px',
            color: qualitativePerformanceToColor(this.overwrittenPerformance),
          }}
        >
          <SpellIcon spell={SPELLS.ART_OF_WAR} />{' '}
          <TooltipElement content={overwrittenTooltip}>
            {formatPercentage(this.#artOfWarOvercaps / this.#totalProcs, 0)} %{' '}
            <small>overwritten</small>
          </TooltipElement>
        </div>

        <div
          style={{
            fontSize: '20px',
            color: qualitativePerformanceToColor(this.expiredPerformance),
          }}
        >
          <SpellIcon spell={SPELLS.ART_OF_WAR} />{' '}
          <TooltipElement content={expiredTooltip}>
            {formatPercentage(this.expiredProcs / this.#totalProcs, 0)} % <small>expired</small>
          </TooltipElement>
        </div>
      </RoundedPanel>
    );

    return explanationAndDataSubsection(explanation, data, 50, 'Art of War');
  }
}

export default ArtOfWar;
