import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import Spell from 'common/SPELLS/Spell';
import { TALENTS_MONK } from 'common/TALENTS';
import { SpellLink, TooltipElement } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent, CastEvent, HealEvent, RefreshBuffEvent } from 'parser/core/Events';
import DonutChart from 'parser/ui/DonutChart';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import StatisticListBoxItem from 'parser/ui/StatisticListBoxItem';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import TalentAggregateBars from 'parser/ui/TalentAggregateStatistic';
import TalentAggregateStatisticContainer from 'parser/ui/TalentAggregateStatisticContainer';
import { SPELL_COLORS } from '../../constants';
import { isBounceTick, isFromMistyPeaks } from '../../normalizers/CastLinkNormalizer';
import HotTrackerMW from '../core/HotTrackerMW';
import Vivify from './Vivify';

class DancingMists extends Analyzer {
  static dependencies = {
    hotTracker: HotTrackerMW,
    vivify: Vivify,
  };

  protected vivify!: Vivify;
  hotTracker!: HotTrackerMW;
  //totals
  casts: number = 0;
  overhealTicks: number = 0;
  bounceTicks: number = 0;
  remApplyCount: number = 0;
  dancingMistCount: number = 0;
  dancingMistReMHealing: number = 0;
  dancingMistOverhealing: number = 0;
  extraVivCleaves: number = 0;
  extraMistyPeaksProcs: number = 0;
  countedMainVivifyHit: boolean = false;
  dancingMistVivifyHealing: number = 0;
  zenPulseHits: number = 0;
  dancingMistZenPulseHealing: number = 0;
  extraVivOverhealing: number = 0;
  mistyPeaksHealingFromDancingMist: number = 0;
  //rapid diffusion
  dancingMistRapidDiffusionCount: number = 0;
  vivHealingFromRD: number = 0;
  mpHealingFromRD: number = 0;
  remHealingFromRD: number = 0;
  zpHealingFromRD: number = 0;
  //hard casts
  dancingMistHardCastCount: number = 0;
  vivHealingFromHardcast: number = 0;
  mpHealingFromHardcast: number = 0;
  remHealingFromHardcast: number = 0;
  zpHealingFromHardcast: number = 0;
  //mists of life
  dancingMistMistsOfLifeCount: number = 0;
  vivHealingFromMoL: number = 0;
  mpHealingFromMoL: number = 0;
  remHealingFromMol: number = 0;
  zpHealingFromMol: number = 0;

  get dancingMistItems() {
    return [
      {
        spell: TALENTS_MONK.MISTY_PEAKS_TALENT,
        amount: this.mistyPeaksHealingFromDancingMist,
        color: SPELL_COLORS.MISTY_PEAKS,
        tooltip: this.getBarTooltip(TALENTS_MONK.MISTY_PEAKS_TALENT),
      },
      {
        spell: SPELLS.VIVIFY,
        amount: this.dancingMistVivifyHealing,
        color: SPELL_COLORS.VIVIFY,
        tooltip: this.getBarTooltip(SPELLS.VIVIFY),
        subSpecs: [
          {
            spell: TALENTS_MONK.ZEN_PULSE_TALENT,
            amount: this.dancingMistZenPulseHealing,
            color: SPELL_COLORS.ZEN_PULSE,
            tooltip: this.getBarTooltip(TALENTS_MONK.ZEN_PULSE_TALENT),
          },
        ],
      },
      {
        spell: TALENTS_MONK.RENEWING_MIST_TALENT,
        amount: this.dancingMistReMHealing,
        color: SPELL_COLORS.RENEWING_MIST,
        tooltip: this.getBarTooltip(TALENTS_MONK.RENEWING_MIST_TALENT),
      },
    ];
  }

  get totalHealing() {
    return (
      this.dancingMistReMHealing +
      this.dancingMistVivifyHealing +
      this.mistyPeaksHealingFromDancingMist +
      this.dancingMistZenPulseHealing
    );
  }

  get bounceProcs() {
    return (
      this.dancingMistCount -
      this.dancingMistHardCastCount -
      this.dancingMistRapidDiffusionCount -
      this.dancingMistMistsOfLifeCount
    );
  }

  get eligiblePercentageOfTicks() {
    return this.bounceTicks / (this.bounceTicks + this.overhealTicks);
  }

  get dancingMistProcRate() {
    return this.dancingMistCount / this.remApplyCount;
  }

  get sourceDataItems() {
    return [
      {
        color: SPELL_COLORS.RENEWING_MIST,
        label: 'Hardcast',
        spellId: TALENTS_MONK.RENEWING_MIST_TALENT.id,
        value: this.dancingMistHardCastCount,
        valuePercent: false,
      },
      {
        color: SPELL_COLORS.RAPID_DIFFUSION,
        label: TALENTS_MONK.RAPID_DIFFUSION_TALENT.name,
        spellId: TALENTS_MONK.RAPID_DIFFUSION_TALENT.id,
        value: this.dancingMistRapidDiffusionCount,
        valuePercent: false,
      },
      {
        color: SPELL_COLORS.ENVELOPING_MIST,
        label: TALENTS_MONK.MISTS_OF_LIFE_TALENT.name,
        spellId: TALENTS_MONK.MISTS_OF_LIFE_TALENT.id,
        value: this.dancingMistMistsOfLifeCount,
        valuePercent: false,
      },
      {
        color: SPELL_COLORS.DANCING_MISTS,
        label: 'Bounces',
        spellId: TALENTS_MONK.RENEWING_MIST_TALENT.id,
        value: this.bounceProcs,
        valuePercent: false,
      },
    ].filter((item) => {
      return item.value > 0;
    });
  }

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_MONK.DANCING_MISTS_TALENT);
    if (!this.active) {
      return;
    }
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.RENEWING_MIST_HEAL),
      this.onApplyRem,
    );
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.RENEWING_MIST_HEAL),
      this.onReMHeal,
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
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS_MONK.RENEWING_MIST_TALENT),
      this.onRemCast,
    );
  }

  getBarTooltip(spell: Spell) {
    let rdSourceHealing = 0;
    let hardcastSourceHealing = 0;
    let molSourceHealing = 0;
    let bounceHealing = 0;
    let procs = 0;
    switch (spell.id) {
      case TALENTS_MONK.RENEWING_MIST_TALENT.id:
        rdSourceHealing = this.remHealingFromRD;
        hardcastSourceHealing = this.remHealingFromHardcast;
        molSourceHealing = this.remHealingFromMol;
        bounceHealing =
          this.dancingMistReMHealing -
          this.remHealingFromRD -
          this.remHealingFromHardcast -
          this.remHealingFromMol;
        procs = this.dancingMistCount;
        break;
      case TALENTS_MONK.MISTY_PEAKS_TALENT.id:
        rdSourceHealing = this.mpHealingFromRD;
        hardcastSourceHealing = this.mpHealingFromHardcast;
        molSourceHealing = this.mpHealingFromMoL;
        bounceHealing =
          this.mistyPeaksHealingFromDancingMist -
          this.mpHealingFromHardcast -
          this.mpHealingFromRD -
          this.mpHealingFromMoL;
        procs = this.extraMistyPeaksProcs;
        break;
      case SPELLS.VIVIFY.id:
        rdSourceHealing = this.vivHealingFromRD;
        hardcastSourceHealing = this.vivHealingFromHardcast;
        molSourceHealing = this.vivHealingFromMoL;
        bounceHealing =
          this.dancingMistVivifyHealing -
          this.vivHealingFromHardcast -
          this.vivHealingFromMoL -
          this.vivHealingFromRD;
        procs = this.extraVivCleaves;
        break;
      case TALENTS_MONK.ZEN_PULSE_TALENT.id:
        rdSourceHealing = this.zpHealingFromRD;
        hardcastSourceHealing = this.zpHealingFromHardcast;
        molSourceHealing = this.zpHealingFromMol;
        bounceHealing =
          this.dancingMistZenPulseHealing -
          this.zpHealingFromHardcast -
          this.zpHealingFromMol -
          this.zpHealingFromRD;
        procs = this.zenPulseHits;
        break;
    }
    const items = [
      {
        color: SPELL_COLORS.RAPID_DIFFUSION,
        label: TALENTS_MONK.RAPID_DIFFUSION_TALENT.name,
        spellId: TALENTS_MONK.RAPID_DIFFUSION_TALENT.id,
        value: rdSourceHealing,
        valuePercent: false,
      },
      {
        color: SPELL_COLORS.RENEWING_MIST,
        label: 'Hardcast',
        spellId: TALENTS_MONK.RENEWING_MIST_TALENT.id,
        value: hardcastSourceHealing,
        valuePercent: false,
      },
      {
        color: SPELL_COLORS.ENVELOPING_MIST,
        label: TALENTS_MONK.MISTS_OF_LIFE_TALENT.name,
        spellId: TALENTS_MONK.MISTS_OF_LIFE_TALENT.id,
        value: molSourceHealing,
        valuePercent: false,
      },
      {
        color: SPELL_COLORS.DANCING_MIST,
        label: 'Bounces',
        spellId: TALENTS_MONK.RENEWING_MIST_TALENT.id,
        value: bounceHealing,
        valuePercent: false,
      },
    ].filter((item) => {
      return item.value > 0;
    });

    return (
      <>
        <strong>{procs}</strong> additional <SpellLink spell={spell} />{' '}
        {spell.id === SPELLS.VIVIFY.id ? <>cleaves</> : <>procs</>} from <br />
        <SpellLink spell={TALENTS_MONK.DANCING_MISTS_TALENT} /> by duplication source:
        <hr />
        <DonutChart items={items} />
      </>
    );
  }

  onRemCast(event: CastEvent) {
    this.casts += 1;
  }

  onApplyRem(event: ApplyBuffEvent) {
    if (!event.prepull) {
      this.remApplyCount += 1;
    }

    const playerId = event.targetID;
    if (
      !this.hotTracker.hots[playerId] ||
      !this.hotTracker.hots[playerId][SPELLS.RENEWING_MIST_HEAL.id]
    ) {
      return;
    }
    const hot = this.hotTracker.hots[playerId][SPELLS.RENEWING_MIST_HEAL.id];
    if (this.hotTracker.fromDancingMists(hot) && !this.hotTracker.fromBounce(hot)) {
      this.dancingMistHardCastCount += this.hotTracker.fromDancingMistHardCast(hot) ? 1 : 0;
      this.dancingMistRapidDiffusionCount += this.hotTracker.fromDancingMistRapidDiffusion(hot)
        ? 1
        : 0;
      this.dancingMistMistsOfLifeCount += this.hotTracker.fromDancingMistMistsOfLife(hot) ? 1 : 0;
      this.dancingMistCount += 1;
    }
  }

  onReMHeal(event: HealEvent) {
    const playerId = event.targetID;
    if (
      !this.hotTracker.hots[playerId] ||
      !this.hotTracker.hots[playerId][SPELLS.RENEWING_MIST_HEAL.id]
    ) {
      return;
    }
    const hot = this.hotTracker.hots[playerId][SPELLS.RENEWING_MIST_HEAL.id];
    if (this.hotTracker.fromDancingMists(hot)) {
      if (this.hotTracker.fromDancingMistRapidDiffusion(hot)) {
        this.remHealingFromRD += event.amount + (event.absorbed || 0);
      } else if (this.hotTracker.fromDancingMistHardCast(hot)) {
        this.remHealingFromHardcast += event.amount + (event.absorbed || 0);
      } else if (this.hotTracker.fromDancingMistMistsOfLife(hot)) {
        this.remHealingFromMol += event.amount + (event.absorbed || 0);
      }
      this.dancingMistReMHealing += event.amount + (event.absorbed || 0);
      this.dancingMistOverhealing += event.overheal || 0;
    }
    if (event.overheal && event.overheal !== 0) {
      if (isBounceTick(event) && hot.end > event.timestamp) {
        this.bounceTicks += 1;
      } else {
        this.overhealTicks += 1;
      }
    }
  }

  handleVivify(event: HealEvent) {
    const spellId = SPELLS.RENEWING_MIST_HEAL.id;
    const targetId = event.targetID;
    if (!this.hotTracker.hasHot(event, spellId)) {
      return;
    }
    const hot = this.hotTracker.hots[targetId][spellId];
    if (this.hotTracker.fromDancingMists(hot)) {
      if (this.hotTracker.fromDancingMistRapidDiffusion(hot)) {
        this.vivHealingFromRD += event.amount + (event.absorbed || 0);
      } else if (this.hotTracker.fromDancingMistHardCast(hot)) {
        this.vivHealingFromHardcast += event.amount + (event.absorbed || 0);
      } else if (this.hotTracker.fromDancingMistMistsOfLife(hot)) {
        this.vivHealingFromMoL += event.amount + (event.absorbed || 0);
      }
      this.extraVivCleaves += 1;
      this.extraVivOverhealing += event.overheal || 0;
      this.dancingMistVivifyHealing += event.amount + (event.absorbed || 0);
    }
  }

  handleZenPulse(event: HealEvent) {
    const targetId = event.targetID;
    const spellId = SPELLS.RENEWING_MIST_HEAL.id;
    if (!this.hotTracker.hasHot(event, spellId)) {
      return;
    }
    const hot = this.hotTracker.hots[targetId][spellId];
    if (this.hotTracker.fromDancingMists(hot)) {
      if (this.hotTracker.fromDancingMistRapidDiffusion(hot)) {
        this.zpHealingFromRD += event.amount + (event.absorbed || 0);
      } else if (this.hotTracker.fromDancingMistHardCast(hot)) {
        this.zpHealingFromHardcast += event.amount + (event.absorbed || 0);
      } else if (this.hotTracker.fromDancingMistMistsOfLife(hot)) {
        this.zpHealingFromMol += event.amount + (event.absorbed || 0);
      }
      this.zenPulseHits += 1;
      this.dancingMistZenPulseHealing += event.amount + (event.absorbed || 0);
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
    if (this.hotTracker.fromDancingMists(remHot)) {
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
    if (this.hotTracker.fromDancingMists(remHot)) {
      if (
        !this.hotTracker.hots[playerId] ||
        !this.hotTracker.hots[playerId][TALENTS_MONK.ENVELOPING_MIST_TALENT.id]
      ) {
        return;
      }
      const hot = this.hotTracker.hots[playerId][TALENTS_MONK.ENVELOPING_MIST_TALENT.id];
      if (this.hotTracker.fromMistyPeaks(hot)) {
        if (this.hotTracker.fromDancingMistRapidDiffusion(remHot)) {
          this.mpHealingFromRD += event.amount + (event.absorbed || 0);
        } else if (this.hotTracker.fromDancingMistHardCast(remHot)) {
          this.mpHealingFromHardcast += event.amount + (event.absorbed || 0);
        } else if (this.hotTracker.fromDancingMistMistsOfLife(remHot)) {
          this.mpHealingFromMoL += event.amount + (event.absorbed || 0);
        }
        this.mistyPeaksHealingFromDancingMist += event.amount + (event.absorbed || 0);
      }
    }
  }

  subStatistic() {
    return (
      <StatisticListBoxItem
        title={<SpellLink spell={TALENTS_MONK.DANCING_MISTS_TALENT} />}
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
            <SpellLink spell={TALENTS_MONK.DANCING_MISTS_TALENT} /> -{' '}
            <ItemHealingDone amount={this.totalHealing} displayPercentage={false} />
          </>
        }
        tooltip={
          <>
            <ul>
              <li>
                Bounces from overheal: <b>{this.bounceTicks}</b>
              </li>
              <li>
                Overheal ticks that did not bounce: <b>{this.overhealTicks}</b>
              </li>
              <li>
                Percentage of <SpellLink spell={SPELLS.RENEWING_MIST_HEAL} /> overheal ticks that
                could actually proc <SpellLink spell={TALENTS_MONK.DANCING_MISTS_TALENT} />:{' '}
                <b>{formatPercentage(this.eligiblePercentageOfTicks)}%</b>
              </li>
              <li>
                Actual <SpellLink spell={TALENTS_MONK.DANCING_MISTS_TALENT} /> proc rate:{' '}
                <b>{formatPercentage(this.dancingMistProcRate)}%</b>
              </li>
            </ul>
          </>
        }
        category={STATISTIC_CATEGORY.TALENTS}
        position={STATISTIC_ORDER.CORE(3)}
        smallFooter
        footer={
          <TooltipElement
            content={
              <>
                The number of additional <SpellLink spell={TALENTS_MONK.RENEWING_MIST_TALENT} />
                <br />
                procced on casts and bounces:
                <hr />
                <DonutChart items={this.sourceDataItems} />
              </>
            }
          >
            {this.dancingMistCount}{' '}
            <small>
              duplicated <SpellLink spell={TALENTS_MONK.RENEWING_MIST_TALENT} />
            </small>
          </TooltipElement>
        }
      >
        <TalentAggregateBars bars={this.dancingMistItems} />
      </TalentAggregateStatisticContainer>
    );
  }
}

export default DancingMists;
