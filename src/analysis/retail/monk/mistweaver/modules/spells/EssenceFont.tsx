import { Trans } from '@lingui/macro';
import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { EndChannelEvent, HealEvent } from 'parser/core/Events';
import Combatants from 'parser/shared/modules/Combatants';
import BoringValueText from 'parser/ui/BoringValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { STATISTIC_ORDER } from 'parser/ui/StatisticBox';
import { TALENTS_MONK } from 'common/TALENTS';
import { formatNumber } from 'common/format';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import { RoundedPanel } from 'interface/guide/components/GuideDivs';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import CastEfficiencyBar from 'parser/ui/CastEfficiencyBar';
import { GapHighlight } from 'parser/ui/CooldownBar';
import { GUIDE_CORE_EXPLANATION_PERCENT } from '../../Guide';
import EssenceFontTargetsHit from './EssenceFontTargetsHit';
import EssenceFontCancelled from './EssenceFontCancelled';
import EssenceFontUniqueTargets from './EssenceFontUniqueTargets';
import { BoxRowEntry, PerformanceBoxRow } from 'interface/guide/components/PerformanceBoxRow';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';

class EssenceFont extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    efTargetsHit: EssenceFontTargetsHit,
    efCancelled: EssenceFontCancelled,
    efUnique: EssenceFontUniqueTargets,
  };
  protected combatants!: Combatants;
  protected efCancelled!: EssenceFontCancelled;
  protected efTargetsHit!: EssenceFontTargetsHit;
  protected efUnique!: EssenceFontUniqueTargets;

  boltHealing: number = 0;
  boltOverhealing: number = 0;
  hotHealing: number = 0;
  hotOverhealing: number = 0;
  gomHealing: number = 0;
  gomOverhealing: number = 0;
  gomEFHits: number = 0;
  gomEFEvent: boolean = false;
  castEntries: BoxRowEntry[] = [];
  chijiActive: boolean = false;
  chijiGomHealing: number = 0;
  chijiGomOverhealing: number = 0;
  chijiGomEFHits: number = 0;

  totalHealing: number = 0;
  totalOverhealing: number = 0;

  constructor(options: Options) {
    super(options);
    this.chijiActive = this.selectedCombatant.hasTalent(
      TALENTS_MONK.INVOKE_CHI_JI_THE_RED_CRANE_TALENT,
    );
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.ESSENCE_FONT_BUFF),
      this.handleEssenceFontHealing,
    );
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.GUSTS_OF_MISTS),
      this.gustHealing,
    );
    this.addEventListener(
      Events.EndChannel.by(SELECTED_PLAYER).spell(TALENTS_MONK.ESSENCE_FONT_TALENT),
      this.handleEndChannel,
    );
    if (this.chijiActive) {
      this.addEventListener(
        Events.heal.by(SELECTED_PLAYER).spell(SPELLS.GUST_OF_MISTS_CHIJI),
        this.chijiGustHealing,
      );
    }
  }

  isValidEFEvent(event: HealEvent) {
    const combatant = this.combatants.players[event.targetID];
    if (!combatant) {
      return false;
    }

    let targetHasEFHot = combatant.hasBuff(
      SPELLS.ESSENCE_FONT_BUFF.id,
      event.timestamp,
      0,
      0,
      event.sourceID,
    );
    //Essence font and FLS Essence font only ever proc one addtional mastery event, so we only need to check for FLS EF whenever EF is not present
    if (!targetHasEFHot && this.selectedCombatant.hasTalent(TALENTS_MONK.FAELINE_STOMP_TALENT)) {
      targetHasEFHot = combatant.hasBuff(
        SPELLS.FAELINE_STOMP_ESSENCE_FONT.id,
        event.timestamp,
        0,
        0,
        event.sourceID,
      );
    }

    // if no EF buff die
    if (!targetHasEFHot) {
      this.gomEFEvent = false;
      return false;
    }
    return true;
  }

  chijiGustHealing(event: HealEvent) {
    if (!this.isValidEFEvent(event)) {
      return;
    }

    if (!this.gomEFEvent) {
      this.gomEFEvent = true;
      return;
    }
    // Chi-Ji GoM healing
    this.gomEFEvent = false;
    this.chijiGomEFHits += 1;
    this.chijiGomHealing += event.amount + (event.absorbed || 0);
    this.chijiGomOverhealing += event.overheal || 0;
  }

  gustHealing(event: HealEvent) {
    if (!this.isValidEFEvent(event)) {
      return;
    }

    if (!this.gomEFEvent) {
      this.gomEFEvent = true;
      return;
    }
    // GoM healing
    this.gomEFEvent = false;
    this.gomEFHits += 1;
    this.gomHealing += event.amount + (event.absorbed || 0);
    this.gomOverhealing += event.overheal || 0;

    // Total healing
    this.totalHealing += event.amount + (event.absorbed || 0);
    this.totalOverhealing += event.overheal || 0;
  }

  handleEssenceFontHealing(event: HealEvent) {
    //tick vs bolt hit
    if (event.tick) {
      this.hotHealing += event.amount + (event.absorbed || 0);
      this.hotOverhealing += event.overheal || 0;
    } else {
      this.boltHealing += event.amount + (event.absorbed || 0);
      this.boltOverhealing += event.overheal || 0;
    }

    // total healing
    this.totalHealing += event.amount + (event.absorbed || 0);
    this.totalOverhealing += event.overheal || 0;
  }

  chijitooltip() {
    if (this.chijiActive) {
      return (
        <>
          Chi-Ji:
          <ul>
            <li>{this.chijiGomEFHits} additional Chi-Ji hits</li>
            <li>{formatNumber(this.chijiGomHealing)} addtional Chi-Ji healing</li>
          </ul>
        </>
      );
    } else {
      return <></>;
    }
  }

  handleEndChannel(event: EndChannelEvent) {
    const totalHit = this.efCancelled.numBoltHits;
    const cancelled = this.efCancelled.handleEndChannel(event);

    let tooltip = null;
    let value = QualitativePerformance.Perfect;
    if (cancelled) {
      value = QualitativePerformance.Fail;
      tooltip = (
        <>
          Cast @ {this.owner.formatTimestamp(this.efCancelled.lastEf!.timestamp)}: You cancelled{' '}
          <SpellLink id={TALENTS_MONK.ESSENCE_FONT_TALENT.id} /> early and only had {totalHit} out
          of {this.efCancelled.expectedNumBolts} possible bolts hit
        </>
      );
    } else {
      value = this.efCancelled.getPerformance(totalHit);
      tooltip = (
        <>
          Cast @ {this.owner.formatTimestamp(this.efCancelled.lastEf!.timestamp)}: You hit{' '}
          {totalHit} out of {this.efCancelled.expectedNumBolts} possible bolts
        </>
      );
    }
    this.castEntries.push({ value, tooltip });
  }

  /** Guide subsection describing the proper usage of EF */
  get guideSubsection(): JSX.Element {
    const explanation = (
      <p>
        <b>
          <SpellLink id={TALENTS_MONK.ESSENCE_FONT_TALENT.id} />
        </b>{' '}
        is your core AoE heal and used to activate{' '}
        <SpellLink id={TALENTS_MONK.ANCIENT_TEACHINGS_TALENT} />. You should aim to avoid cancelling
        it at all costs and you should only use it with{' '}
        <SpellLink id={TALENTS_MONK.THUNDER_FOCUS_TEA_TALENT} /> (if talented into{' '}
        <SpellLink id={TALENTS_MONK.UPWELLING_TALENT} />) and on CD otherwise.
      </p>
    );

    const data = (
      <div>
        <RoundedPanel>
          <strong>
            <SpellLink id={TALENTS_MONK.ESSENCE_FONT_TALENT} /> cast efficiency
          </strong>
          {this.efficSubStatistic()} <br />
          {this.castUsageStatistic()}
        </RoundedPanel>
      </div>
    );

    return explanationAndDataSubsection(explanation, data, GUIDE_CORE_EXPLANATION_PERCENT);
  }

  /** Guide subsection describing the proper usage of Rejuvenation */
  efficSubStatistic() {
    return (
      <CastEfficiencyBar
        spellId={TALENTS_MONK.ESSENCE_FONT_TALENT.id}
        gapHighlightMode={GapHighlight.FullCooldown}
        minimizeIcons
        useThresholds
      />
    );
  }

  castUsageStatistic() {
    return <PerformanceBoxRow values={this.castEntries} />;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(0)}
        size="flexible"
        category={STATISTIC_CATEGORY.THEORYCRAFT}
        tooltip={
          <Trans>
            Mastery:
            <ul>
              <li>{this.gomEFHits} additional hits</li>
              <li>{formatNumber(this.gomHealing)} additional healing</li>
            </ul>
            {this.chijitooltip()}
          </Trans>
        }
      >
        <BoringValueText
          label={
            <>
              <SpellLink id={SPELLS.GUSTS_OF_MISTS.id}>Gusts of Mists</SpellLink> from{' '}
              <SpellLink id={TALENTS_MONK.ESSENCE_FONT_TALENT} />
            </>
          }
        >
          <ItemHealingDone amount={this.gomHealing + this.chijiGomHealing}></ItemHealingDone>
        </BoringValueText>
      </Statistic>
    );
  }
}

export default EssenceFont;
