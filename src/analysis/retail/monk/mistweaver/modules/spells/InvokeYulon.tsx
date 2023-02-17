import { formatNumber, formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import { TALENTS_MONK } from 'common/TALENTS';
import { SpellLink } from 'interface';
import CooldownExpandable, {
  CooldownExpandableItem,
} from 'interface/guide/components/CooldownExpandable';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { Options, SELECTED_PLAYER, SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import Events, { CastEvent, HealEvent } from 'parser/core/Events';
import BoringValueText from 'parser/ui/BoringValueText';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import { getLowestPerf } from 'parser/ui/QualitativePerformance';
import Statistic from 'parser/ui/Statistic';
import StatisticListBoxItem from 'parser/ui/StatisticListBoxItem';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import BaseCelestialAnalyzer from './BaseCelestialAnalyzer';
import EssenceFont from './EssenceFont';

class InvokeYulon extends BaseCelestialAnalyzer {
  soothHealing: number = 0;
  envelopHealing: number = 0;
  protected ef!: EssenceFont;

  get totalHealing() {
    return this.soothHealing + this.envelopHealing;
  }

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(
      TALENTS_MONK.INVOKE_YULON_THE_JADE_SERPENT_TALENT,
    );
    if (!this.active) {
      return;
    }
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.ENVELOPING_BREATH_HEAL),
      this.handleEnvelopingBreath,
    );
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER_PET).spell(SPELLS.SOOTHING_BREATH),
      this.handleSoothingBreath,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS_MONK.INVOKE_YULON_THE_JADE_SERPENT_TALENT),
      this.onCast,
    );
  }

  onCast(event: CastEvent) {
    this.castTrackers.push({
      timestamp: event.timestamp,
      infusionDuration: 0,
      lessonsDuration: 0,
      totalEnvB: 0,
      totalEnvM: 0,
      averageHaste: 0,
      totmStacks: this.selectedCombatant.getBuffStacks(SPELLS.TEACHINGS_OF_THE_MONASTERY.id),
      numEfHots: this.ef.curBuffs,
      recastEf: false,
      deathTimestamp: 0,
    });
  }

  handleEnvelopingBreath(event: HealEvent) {
    this.envelopHealing += (event.amount || 0) + (event.absorbed || 0);
  }

  handleSoothingBreath(event: HealEvent) {
    this.soothHealing += (event.amount || 0) + (event.absorbed || 0);
  }

  subStatistic() {
    return (
      <StatisticListBoxItem
        title={<SpellLink id={TALENTS_MONK.INVOKE_YULON_THE_JADE_SERPENT_TALENT.id} />}
        value={`${formatPercentage(
          this.owner.getPercentageOfTotalHealingDone(this.totalHealing),
        )} %`}
      />
    );
  }

  get guideCastBreakdown() {
    const explanation = (
      <p>
        <strong>
          <SpellLink id={TALENTS_MONK.INVOKE_YULON_THE_JADE_SERPENT_TALENT.id} />
        </strong>
        <br />
        Before casting <SpellLink id={TALENTS_MONK.INVOKE_YULON_THE_JADE_SERPENT_TALENT} />, it is
        essential to prepare by doing the following
        <ul>
          <li>
            Cast <SpellLink id={TALENTS_MONK.ESSENCE_FONT_TALENT} /> to do extra healing during the
            duration of <SpellLink id={TALENTS_MONK.INVOKE_YULON_THE_JADE_SERPENT_TALENT} />
          </li>
          <li>
            If talented into <SpellLink id={TALENTS_MONK.SHAOHAOS_LESSONS_TALENT} />, cast{' '}
            <SpellLink id={TALENTS_MONK.SHEILUNS_GIFT_TALENT} /> with enough clouds to cover the
            entire duration of <SpellLink id={TALENTS_MONK.INVOKE_YULON_THE_JADE_SERPENT_TALENT} />
          </li>
        </ul>
        During the duration of <SpellLink id={TALENTS_MONK.INVOKE_YULON_THE_JADE_SERPENT_TALENT} />,
        it is important to do the following
        <ul>
          <li>
            If <SpellLink id={TALENTS_MONK.SECRET_INFUSION_TALENT} /> talented, use{' '}
            <SpellLink id={TALENTS_MONK.THUNDER_FOCUS_TEA_TALENT} /> with{' '}
            <SpellLink id={TALENTS_MONK.RENEWING_MIST_TALENT} /> or{' '}
            <SpellLink id={TALENTS_MONK.ESSENCE_FONT_TALENT} /> for a multiplicative haste bonus
          </li>
          <li>
            Recast <SpellLink id={TALENTS_MONK.ESSENCE_FONT_TALENT} /> if talented into{' '}
            <SpellLink id={TALENTS_MONK.JADE_BOND_TALENT} />
          </li>
          <li>
            Cast <SpellLink id={TALENTS_MONK.ENVELOPING_MIST_TALENT} /> on allies that are near
            other allies (e.g. not ranged players standing alone) to maximize targets hit by{' '}
            <SpellLink id={TALENTS_MONK.ENVELOPING_BREATH_TALENT} />
          </li>
        </ul>
      </p>
    );

    const data = (
      <div>
        <strong>Per-Cast Breakdown</strong>
        <small> - click to expand</small>
        {this.castTrackers.map((cast, ix) => {
          const header = (
            <>
              @ {this.owner.formatTimestamp(cast.timestamp)} &mdash;{' '}
              <SpellLink id={TALENTS_MONK.INVOKE_YULON_THE_JADE_SERPENT_TALENT.id} />
            </>
          );
          const superList = super.getCooldownExpandableItems(cast);
          const allPerfs = superList[0];
          const checklistItems: CooldownExpandableItem[] = superList[1];
          if (this.selectedCombatant.hasTalent(TALENTS_MONK.JADE_BOND_TALENT)) {
            const rval = this.getEfRefreshPerfAndItem(cast);
            allPerfs.push(rval[0]);
            checklistItems.push(rval[1]);
          }
          const lowestPerf = getLowestPerf(allPerfs);
          return (
            <CooldownExpandable
              header={header}
              checklistItems={checklistItems}
              perf={lowestPerf}
              key={ix}
            />
          );
        })}
      </div>
    );

    return explanationAndDataSubsection(explanation, data);
  }

  statistic() {
    return (
      <Statistic
        category={STATISTIC_CATEGORY.TALENTS}
        position={STATISTIC_ORDER.DEFAULT}
        size="flexible"
        tooltip={
          <>
            Healing Breakdown:
            <ul>
              <li>
                {formatNumber(this.soothHealing)} healing from{' '}
                <SpellLink id={SPELLS.SOOTHING_BREATH.id} />.
              </li>
              <li>
                {formatNumber(this.envelopHealing)} healing from{' '}
                <SpellLink id={TALENTS_MONK.ENVELOPING_BREATH_TALENT.id} />.
              </li>
            </ul>
          </>
        }
      >
        <BoringValueText
          label={
            <>
              <SpellLink id={TALENTS_MONK.INVOKE_YULON_THE_JADE_SERPENT_TALENT.id} /> and
              <br />
              <SpellLink id={TALENTS_MONK.ENVELOPING_BREATH_TALENT.id} />
            </>
          }
        >
          <ItemHealingDone amount={this.totalHealing} />
        </BoringValueText>
      </Statistic>
    );
  }
}

export default InvokeYulon;
