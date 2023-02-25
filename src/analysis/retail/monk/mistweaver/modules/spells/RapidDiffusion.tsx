import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { TALENTS_MONK } from 'common/TALENTS';
import SPELLS from 'common/SPELLS';
import Events, { ApplyBuffEvent, HealEvent, RefreshBuffEvent } from 'parser/core/Events';
import HotTrackerMW from '../core/HotTrackerMW';
import MistyPeaks from './MistyPeaks';
import Vivify from './Vivify';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import TalentSpellText from 'parser/ui/TalentSpellText';
import SpellLink from 'interface/SpellLink';
import Combatants from 'parser/shared/modules/Combatants';
import { formatNumber, formatPercentage } from 'common/format';
import { TooltipElement } from 'interface';
import { isFromMistyPeaks } from '../../normalizers/CastLinkNormalizer';
import StatisticListBoxItem from 'parser/ui/StatisticListBoxItem';

class RapidDiffusion extends Analyzer {
  get totalRemThroughput() {
    return this.remHealing + this.remAbsorbed;
  }

  get totalVivifyThroughput() {
    return this.extraVivHealing + this.extraVivAbsorbed;
  }

  get mistyPeaksHealingFromRapidDiffusion() {
    return this.extraMistyPeaksHealing + this.extraMistyPeaksAbsorb;
  }

  get totalHealing() {
    return this.totalRemThroughput + this.totalVivifyThroughput;
  }

  static dependencies = {
    hotTracker: HotTrackerMW,
    combatants: Combatants,
    mistyPeaks: MistyPeaks,
    vivify: Vivify,
  };
  hotTracker!: HotTrackerMW;
  combatants!: Combatants;
  mistyPeaks!: MistyPeaks;
  vivify!: Vivify;
  remCount: number = 0;
  remHealing: number = 0;
  remAbsorbed: number = 0;
  remOverHealing: number = 0;
  extraMistyPeaksProcs: number = 0;
  extraVivCleaves: number = 0;
  extraVivHealing: number = 0;
  extraVivOverhealing: number = 0;
  extraVivAbsorbed: number = 0;
  extraMistyPeaksHealing: number = 0;
  extraMistyPeaksAbsorb: number = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_MONK.RAPID_DIFFUSION_TALENT);
    if (!this.active) {
      return;
    }
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.RENEWING_MIST_HEAL),
      this.handleReMApply,
    );
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.RENEWING_MIST_HEAL),
      this.handleReMHeal,
    );
    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(SPELLS.VIVIFY), this.handleVivify);
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(TALENTS_MONK.ENVELOPING_MIST_TALENT),
      this.handleEnvApply,
    );
    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(TALENTS_MONK.ENVELOPING_MIST_TALENT),
      this.handleEnvApply,
    );
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(TALENTS_MONK.ENVELOPING_MIST_TALENT),
      this.onEnvHeal,
    );
  }

  handleReMApply(event: ApplyBuffEvent) {
    const playerId = event.targetID;
    if (
      !this.hotTracker.hots[playerId] ||
      !this.hotTracker.hots[playerId][SPELLS.RENEWING_MIST_HEAL.id]
    ) {
      return;
    }
    const hot = this.hotTracker.hots[playerId][SPELLS.RENEWING_MIST_HEAL.id];
    if (this.hotTracker.fromRapidDiffusion(hot) && !this.hotTracker.fromBounce(hot)) {
      this.remCount += 1;
    }
  }

  handleReMHeal(event: HealEvent) {
    const playerId = event.targetID;
    if (
      !this.hotTracker.hots[playerId] ||
      !this.hotTracker.hots[playerId][SPELLS.RENEWING_MIST_HEAL.id]
    ) {
      return;
    }
    const hot = this.hotTracker.hots[playerId][SPELLS.RENEWING_MIST_HEAL.id];
    if (this.hotTracker.fromRapidDiffusion(hot) && event.timestamp <= hot.originalEnd) {
      this.remHealing += event.amount || 0;
      this.remAbsorbed += event.absorbed || 0;
      this.remOverHealing += event.overheal || 0;
    }
  }

  handleVivify(event: HealEvent) {
    const targetId = event.targetID;
    //check for rem on the target
    if (
      !this.hotTracker.hots[targetId] ||
      !this.hotTracker.hots[targetId][SPELLS.RENEWING_MIST_HEAL.id]
    ) {
      return;
    }
    // only count cleave hit on main target
    if (this.vivify.lastCastTarget === targetId && this.vivify.mainTargetHitsToCount > 0) {
      return;
    }
    const hot = this.hotTracker.hots[targetId][SPELLS.RENEWING_MIST_HEAL.id];
    if (this.hotTracker.fromRapidDiffusion(hot)) {
      this.extraVivCleaves += 1;
      this.extraVivHealing += event.amount || 0;
      this.extraVivOverhealing += event.overheal || 0;
      this.extraVivAbsorbed += event.absorbed || 0;
    }
  }

  handleEnvApply(event: ApplyBuffEvent | RefreshBuffEvent) {
    const playerId = event.targetID;
    if (
      !this.hotTracker.hots[playerId] ||
      !this.hotTracker.hots[playerId][SPELLS.RENEWING_MIST_HEAL.id]
    ) {
      return;
    }
    const remHot = this.hotTracker.hots[playerId][SPELLS.RENEWING_MIST_HEAL.id];
    if (this.hotTracker.fromRapidDiffusion(remHot)) {
      if (isFromMistyPeaks(event)) {
        this.extraMistyPeaksProcs += 1;
      }
    }
  }
  onEnvHeal(event: HealEvent) {
    const playerId = event.targetID;
    if (
      !this.hotTracker.hots[playerId] ||
      !this.hotTracker.hots[playerId][SPELLS.RENEWING_MIST_HEAL.id]
    ) {
      return;
    }
    const remHot = this.hotTracker.hots[playerId][SPELLS.RENEWING_MIST_HEAL.id];
    if (this.hotTracker.fromRapidDiffusion(remHot)) {
      if (
        !this.hotTracker.hots[playerId] ||
        !this.hotTracker.hots[playerId][TALENTS_MONK.ENVELOPING_MIST_TALENT.id]
      ) {
        return;
      }
      const hot = this.hotTracker.hots[playerId][TALENTS_MONK.ENVELOPING_MIST_TALENT.id];
      if (this.hotTracker.fromMistyPeaks(hot)) {
        this.extraMistyPeaksHealing += event.amount || 0;
        this.extraMistyPeaksAbsorb += event.absorbed || 0;
      }
    }
  }

  subStatistic() {
    return (
      <StatisticListBoxItem
        title={<SpellLink id={TALENTS_MONK.RAPID_DIFFUSION_TALENT.id} />}
        value={`${formatPercentage(
          this.owner.getPercentageOfTotalHealingDone(this.totalHealing),
        )} %`}
      />
    );
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <ul>
            {this.selectedCombatant.hasTalent(TALENTS_MONK.MISTY_PEAKS_TALENT) && (
              <li>
                Extra <SpellLink id={TALENTS_MONK.MISTY_PEAKS_TALENT.id} /> procs:{' '}
                {formatNumber(this.extraMistyPeaksProcs)}
              </li>
            )}
            {this.selectedCombatant.hasTalent(TALENTS_MONK.MISTY_PEAKS_TALENT) && (
              <li>
                Extra <SpellLink id={TALENTS_MONK.MISTY_PEAKS_TALENT.id} /> healing:{' '}
                {formatNumber(this.mistyPeaksHealingFromRapidDiffusion)}
              </li>
            )}
            <li>
              Additional <SpellLink id={TALENTS_MONK.RENEWING_MIST_TALENT.id} /> Total Throughput:{' '}
              {formatNumber(this.totalRemThroughput)}
            </li>
            <li>Extra Vivify Cleaves: {this.extraVivCleaves}</li>
            <li>Extra Vivify Healing: {formatNumber(this.totalVivifyThroughput)}</li>
          </ul>
        }
      >
        <TalentSpellText talent={TALENTS_MONK.RAPID_DIFFUSION_TALENT}>
          <ItemHealingDone amount={this.totalHealing} />
          <br />
          <TooltipElement
            content={
              <>
                Rapid Diffusion has an internal cooldown of 0.25 seconds, so this number may be
                slightly lower than your total{' '}
                <SpellLink id={TALENTS_MONK.RISING_SUN_KICK_TALENT.id} /> and{' '}
                <SpellLink id={TALENTS_MONK.ENVELOPING_MIST_TALENT.id} /> casts.
              </>
            }
          >
            {this.remCount}{' '}
            <small>
              additional <SpellLink id={TALENTS_MONK.RENEWING_MIST_TALENT} />
            </small>
          </TooltipElement>
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default RapidDiffusion;
