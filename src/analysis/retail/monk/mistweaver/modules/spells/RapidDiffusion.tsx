import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { TALENTS_MONK } from 'common/TALENTS';
import SPELLS from 'common/SPELLS';
import Events, { ApplyBuffEvent, HealEvent, RefreshBuffEvent } from 'parser/core/Events';
import HotTrackerMW from '../core/HotTrackerMW';
import MistyPeaks from './MistyPeaks';
import Vivify from './Vivify';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import SpellLink from 'interface/SpellLink';
import Combatants from 'parser/shared/modules/Combatants';
import { formatPercentage } from 'common/format';
import { TooltipElement } from 'interface';
import { isFromMistyPeaks } from '../../normalizers/CastLinkNormalizer';
import StatisticListBoxItem from 'parser/ui/StatisticListBoxItem';
import TalentAggregateStatisticContainer from 'parser/ui/TalentAggregateStatisticContainer';
import TalentAggregateBars from 'parser/ui/TalentAggregateStatistic';
import { getCurrentRSKTalent, SPELL_COLORS } from '../../constants';
import DonutChart from 'parser/ui/DonutChart';
import Spell from 'common/SPELLS/Spell';
import { Talent } from 'common/TALENTS/types';

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
    return (
      this.totalRemThroughput +
      this.totalVivifyThroughput +
      this.mistyPeaksHealingFromRapidDiffusion +
      this.zpHealing
    );
  }

  get rapidDiffusionItems() {
    return [
      {
        spell: TALENTS_MONK.MISTY_PEAKS_TALENT,
        amount: this.mistyPeaksHealingFromRapidDiffusion,
        color: SPELL_COLORS.MISTY_PEAKS,
        tooltip: this.getBarTooltip(TALENTS_MONK.MISTY_PEAKS_TALENT),
      },
      {
        spell: SPELLS.VIVIFY,
        amount: this.totalVivifyThroughput,
        color: SPELL_COLORS.VIVIFY,
        tooltip: this.getBarTooltip(SPELLS.VIVIFY),
        subSpecs: [
          {
            spell: TALENTS_MONK.ZEN_PULSE_TALENT,
            amount: this.zpHealing,
            color: SPELL_COLORS.ZEN_PULSE,
            tooltip: this.getBarTooltip(TALENTS_MONK.ZEN_PULSE_TALENT),
          },
        ],
      },
      {
        spell: SPELLS.RENEWING_MIST_CAST,
        amount: this.totalRemThroughput,
        color: SPELL_COLORS.RENEWING_MIST,
        tooltip: this.getBarTooltip(SPELLS.RENEWING_MIST_CAST),
      },
    ];
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
  zpHits = 0;
  zpHealing = 0;
  zpOverhealing = 0;
  zpHealingFromRskRem = 0;
  zpHealingFromEnvRem = 0;
  remCount = 0;
  remHealing = 0;
  remHealingFromRSK = 0;
  remHealingFromEnv = 0;
  remAbsorbed = 0;
  remOverHealing = 0;
  extraMistyPeaksProcs = 0;
  extraVivCleaves = 0;
  extraVivHealing = 0;
  vivHealingFromRskRem = 0;
  vivHealingFromEnvRem = 0;
  extraVivOverhealing = 0;
  extraVivAbsorbed = 0;
  extraMistyPeaksHealing = 0;
  extraMistyPeaksAbsorb = 0;
  mistyPeakHealingFromRskRem = 0;
  mistyPeakHealingFromEnvRem = 0;
  currentRskTalent: Talent;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_MONK.RAPID_DIFFUSION_TALENT);
    this.currentRskTalent = getCurrentRSKTalent(this.selectedCombatant);
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
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell([SPELLS.INVIGORATING_MISTS_HEAL]),
      this.handleVivify,
    );
    if (this.selectedCombatant.hasTalent(TALENTS_MONK.ZEN_PULSE_TALENT)) {
      this.addEventListener(
        Events.heal.by(SELECTED_PLAYER).spell([SPELLS.ZEN_PULSE_HEAL]),
        this.handleZenPulse,
      );
    }
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

  getBarTooltip(spell: Spell) {
    let rskSourceHealing = 0;
    let envSourceHealing = 0;
    let procs = 0;
    switch (spell.id) {
      case SPELLS.RENEWING_MIST_CAST.id:
        rskSourceHealing = this.remHealingFromRSK;
        envSourceHealing = this.remHealingFromEnv;
        procs = this.remCount;
        break;
      case TALENTS_MONK.MISTY_PEAKS_TALENT.id:
        rskSourceHealing = this.mistyPeakHealingFromRskRem;
        envSourceHealing = this.mistyPeakHealingFromEnvRem;
        procs = this.extraMistyPeaksProcs;
        break;
      case SPELLS.VIVIFY.id:
        rskSourceHealing = this.vivHealingFromRskRem;
        envSourceHealing = this.vivHealingFromEnvRem;
        procs = this.extraVivCleaves;
        break;
      case TALENTS_MONK.ZEN_PULSE_TALENT.id:
        rskSourceHealing = this.zpHealingFromRskRem;
        envSourceHealing = this.zpHealingFromEnvRem;
        procs = this.zpHits;
        break;
    }
    const items = [
      {
        color: SPELL_COLORS.RISING_SUN_KICK,
        label: this.currentRskTalent.name,
        spellId: this.currentRskTalent.id,
        value: rskSourceHealing,
        valuePercent: false,
      },
      {
        color: SPELL_COLORS.ENVELOPING_MIST,
        label: TALENTS_MONK.ENVELOPING_MIST_TALENT.name,
        spellId: TALENTS_MONK.ENVELOPING_MIST_TALENT.id,
        value: envSourceHealing,
        valuePercent: false,
      },
    ];
    return (
      <>
        <strong>{procs}</strong> additional <SpellLink spell={spell} />{' '}
        {spell.id === SPELLS.VIVIFY.id ? <>cleaves</> : <>procs</>} from <br />
        <SpellLink spell={TALENTS_MONK.RAPID_DIFFUSION_TALENT} />{' '}
        {spell.id !== SPELLS.RENEWING_MIST_CAST.id && (
          <>
            <SpellLink spell={SPELLS.RENEWING_MIST_CAST} />s<br />
          </>
        )}{' '}
        by source ability:
        <hr />
        <DonutChart items={items} />
      </>
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
    if (this.hotTracker.fromRapidDiffusion(hot)) {
      if (this.hotTracker.fromRapidDiffusionRisingSunKick(hot)) {
        this.remHealingFromRSK += event.amount + (event.absorbed || 0);
      } else if (this.hotTracker.fromRapidDiffusionEnvelopingMist(hot)) {
        this.remHealingFromEnv += event.amount + (event.absorbed || 0);
      }
      this.remHealing += event.amount || 0;
      this.remAbsorbed += event.absorbed || 0;
      this.remOverHealing += event.overheal || 0;
    }
  }

  handleVivify(event: HealEvent) {
    const targetId = event.targetID;
    const spellId = SPELLS.RENEWING_MIST_HEAL.id;
    if (!this.hotTracker.hasHot(event, spellId)) {
      return;
    }
    const hot = this.hotTracker.hots[targetId][SPELLS.RENEWING_MIST_HEAL.id];
    if (this.hotTracker.fromRapidDiffusion(hot)) {
      if (this.hotTracker.fromRapidDiffusionRisingSunKick(hot)) {
        this.vivHealingFromRskRem += event.amount + (event.absorbed || 0);
      } else if (this.hotTracker.fromRapidDiffusionEnvelopingMist(hot)) {
        this.vivHealingFromEnvRem += event.amount + (event.absorbed || 0);
      }
      this.extraVivCleaves += 1;
      this.extraVivHealing += event.amount || 0;
      this.extraVivOverhealing += event.overheal || 0;
      this.extraVivAbsorbed += event.absorbed || 0;
    }
  }

  handleZenPulse(event: HealEvent) {
    const spellId = SPELLS.RENEWING_MIST_HEAL.id;
    if (!this.hotTracker.hasHot(event, spellId)) {
      return;
    }
    const hot = this.hotTracker.hots[event.targetID][spellId];
    if (hot.originalEnd < event.timestamp) {
      if (this.hotTracker.fromRapidDiffusion(hot)) {
        if (this.hotTracker.fromRapidDiffusionRisingSunKick(hot)) {
          this.zpHealingFromRskRem += event.amount + (event.absorbed || 0);
        } else if (this.hotTracker.fromRapidDiffusionEnvelopingMist(hot)) {
          this.zpHealingFromEnvRem += event.amount + (event.absorbed || 0);
        }
        this.zpHits += 1;
        this.zpHealing += event.amount + (event.absorbed || 0);
        this.zpOverhealing += event.overheal || 0;
      }
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
        if (this.hotTracker.fromRapidDiffusionRisingSunKick(remHot)) {
          this.mistyPeakHealingFromRskRem += event.amount + (event.absorbed || 0);
        } else if (this.hotTracker.fromRapidDiffusionEnvelopingMist(remHot)) {
          this.mistyPeakHealingFromEnvRem += event.amount + (event.absorbed || 0);
        }
        this.extraMistyPeaksHealing += event.amount || 0;
        this.extraMistyPeaksAbsorb += event.absorbed || 0;
      }
    }
  }

  subStatistic() {
    return (
      <StatisticListBoxItem
        title={<SpellLink spell={TALENTS_MONK.RAPID_DIFFUSION_TALENT} />}
        value={`${formatPercentage(
          this.owner.getPercentageOfTotalHealingDone(this.totalHealing),
        )} %`}
      />
    );
  }

  statistic() {
    return (
      <TalentAggregateStatisticContainer
        title={
          <>
            <SpellLink spell={TALENTS_MONK.RAPID_DIFFUSION_TALENT} /> -{' '}
            <ItemHealingDone amount={this.totalHealing} displayPercentage={false} />
          </>
        }
        category={STATISTIC_CATEGORY.TALENTS}
        position={STATISTIC_ORDER.CORE(2)}
        smallFooter
        footer={
          <TooltipElement
            content={
              <>
                Rapid Diffusion has an internal cooldown of 0.25 seconds, so this number may be
                slightly lower than your total <SpellLink spell={this.currentRskTalent} /> and{' '}
                <SpellLink spell={TALENTS_MONK.ENVELOPING_MIST_TALENT} /> casts.
              </>
            }
          >
            {this.remCount}{' '}
            <small>
              additional <SpellLink spell={SPELLS.RENEWING_MIST_CAST} />
            </small>
          </TooltipElement>
        }
      >
        <TalentAggregateBars bars={this.rapidDiffusionItems} />
      </TalentAggregateStatisticContainer>
    );
  }
}

export default RapidDiffusion;
