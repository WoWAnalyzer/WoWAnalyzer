import { formatNumber, formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import { TALENTS_MONK } from 'common/TALENTS';
import { SpellLink } from 'interface';
import CooldownExpandable, {
  CooldownExpandableItem,
} from 'interface/guide/components/CooldownExpandable';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { Options, SELECTED_PLAYER, SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import Events, { AbsorbedEvent, CastEvent, HealEvent } from 'parser/core/Events';
import BoringValueText from 'parser/ui/BoringValueText';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import { getAveragePerf } from 'parser/ui/QualitativePerformance';
import Statistic from 'parser/ui/Statistic';
import StatisticListBoxItem from 'parser/ui/StatisticListBoxItem';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import BaseCelestialAnalyzer from './BaseCelestialAnalyzer';
import { getCurrentRSKTalent } from '../../constants';
import { Talent } from 'common/TALENTS/types';

class InvokeYulon extends BaseCelestialAnalyzer {
  soothHealing = 0;
  envelopHealing = 0;
  chiCocoonHealing = 0;
  currentRskTalent: Talent;

  get totalHealing() {
    return this.soothHealing + this.envelopHealing + this.chiCocoonHealing;
  }

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(
      TALENTS_MONK.INVOKE_YULON_THE_JADE_SERPENT_TALENT,
    );
    this.currentRskTalent = getCurrentRSKTalent(this.selectedCombatant);
    if (!this.active) {
      return;
    }
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER_PET).spell(SPELLS.SOOTHING_BREATH),
      this.handleSoothingBreath,
    );
    this.addEventListener(
      Events.absorbed.by(SELECTED_PLAYER).spell(SPELLS.CHI_COCOON_BUFF_YULON),
      this.handleChiCocoon,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS_MONK.INVOKE_YULON_THE_JADE_SERPENT_TALENT),
      this.onCast,
    );
  }

  onCast(event: CastEvent) {
    this.castTrackers.push({
      timestamp: event.timestamp,
      siBuffId: this.currentSIBuffId,
      totalEnvM: 0,
      averageHaste: 0,
      totmStacks: this.selectedCombatant.getBuffStacks(SPELLS.TEACHINGS_OF_THE_MONASTERY.id),
      deathTimestamp: 0,
      castRsk: false,
    });
  }

  handleSoothingBreath(event: HealEvent) {
    this.soothHealing += (event.amount || 0) + (event.absorbed || 0);
  }

  handleChiCocoon(event: AbsorbedEvent) {
    this.chiCocoonHealing += event.amount;
  }

  subStatistic() {
    return (
      <StatisticListBoxItem
        title={<SpellLink spell={TALENTS_MONK.INVOKE_YULON_THE_JADE_SERPENT_TALENT} />}
        value={`${formatPercentage(
          this.owner.getPercentageOfTotalHealingDone(this.totalHealing),
        )} %`}
      />
    );
  }

  get guideCastBreakdown() {
    const explanationPercent = 47.5;
    const explanation = (
      <p>
        <strong>
          <SpellLink spell={TALENTS_MONK.INVOKE_YULON_THE_JADE_SERPENT_TALENT} />
        </strong>
        <br />
        Before casting <SpellLink spell={TALENTS_MONK.INVOKE_YULON_THE_JADE_SERPENT_TALENT} />, make
        sure that <SpellLink spell={this.currentRskTalent} /> is on cooldown, and make to sure cast{' '}
        {this.selectedCombatant.hasTalent(TALENTS_MONK.GIFT_OF_THE_CELESTIALS_TALENT) ? (
          <>at least one </>
        ) : (
          <>all </>
        )}{' '}
        <SpellLink spell={SPELLS.RENEWING_MIST_CAST} />
        (s) to prevent overcapping charges during Yulon's duration, and be sure to have at least 1
        proc of <SpellLink spell={TALENTS_MONK.SPIRITFONT_1_MISTWEAVER_TALENT} /> available. <hr />
        It is crucial to pair <SpellLink spell={TALENTS_MONK.THUNDER_FOCUS_TEA_TALENT} /> with{' '}
        <SpellLink spell={TALENTS_MONK.INVOKE_YULON_THE_JADE_SERPENT_TALENT} /> for the several
        buffs that <SpellLink spell={TALENTS_MONK.THUNDER_FOCUS_TEA_TALENT} /> provides, including:
        <ol>
          <li>
            <SpellLink spell={TALENTS_MONK.SPIRITFONT_2_MISTWEAVER_TALENT} />
          </li>
          <li>
            <SpellLink spell={TALENTS_MONK.FLOWING_WISDOM_TALENT} /> via{' '}
            <SpellLink spell={TALENTS_MONK.HEART_OF_THE_JADE_SERPENT_TALENT} />
          </li>
          <li>
            <SpellLink spell={TALENTS_MONK.ZEN_PULSE_TALENT} /> via{' '}
            <SpellLink spell={TALENTS_MONK.DEEP_CLARITY_TALENT} />
          </li>
          <li>
            <SpellLink spell={TALENTS_MONK.SECRET_INFUSION_TALENT} />
          </li>
        </ol>
        If <SpellLink spell={TALENTS_MONK.SECRET_INFUSION_TALENT} /> talented, use{' '}
        <SpellLink spell={TALENTS_MONK.THUNDER_FOCUS_TEA_TALENT} /> with{' '}
        <SpellLink spell={SPELLS.RENEWING_MIST_CAST} /> for a multiplicative haste bonus
        <hr />
        Be sure to cast <SpellLink spell={this.currentRskTalent} /> before your first{' '}
        <SpellLink spell={TALENTS_MONK.ENVELOPING_MIST_TALENT} /> and{' '}
        <SpellLink spell={TALENTS_MONK.RAPID_DIFFUSION_TALENT} />{' '}
        <SpellLink spell={SPELLS.RENEWING_MIST_CAST} /> falls off to extend their duration.
        <hr />
        Be sure to follow up your{' '}
        <SpellLink spell={TALENTS_MONK.INVOKE_YULON_THE_JADE_SERPENT_TALENT} /> with casts of{' '}
        <SpellLink spell={SPELLS.VIVIFY} /> to consume your{' '}
        <SpellLink spell={TALENTS_MONK.ZEN_PULSE_TALENT} /> with the highest amount of{' '}
        <SpellLink spell={TALENTS_MONK.ENVELOPING_MIST_TALENT} />s and{' '}
        <SpellLink spell={SPELLS.RENEWING_MIST_CAST} />s possible.
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
              <SpellLink spell={TALENTS_MONK.INVOKE_YULON_THE_JADE_SERPENT_TALENT} />
            </>
          );
          const superList = super.getCooldownExpandableItems(cast);
          const allPerfs = superList[0];
          const checklistItems: CooldownExpandableItem[] = superList[1];
          if (this.selectedCombatant.hasTalent(TALENTS_MONK.RISING_MIST_TALENT)) {
            const rval = this.getRskCastPerfAndItem(cast);
            allPerfs.push(rval[0]);
            checklistItems.push(rval[1]);
          }

          const avgPerf = getAveragePerf(allPerfs);
          return (
            <CooldownExpandable
              header={header}
              checklistItems={checklistItems}
              perf={avgPerf}
              key={ix}
            />
          );
        })}
      </div>
    );

    return explanationAndDataSubsection(explanation, data, explanationPercent);
  }

  statistic() {
    return (
      <Statistic
        category={STATISTIC_CATEGORY.TALENTS}
        position={STATISTIC_ORDER.CORE(7)}
        size="flexible"
        tooltip={
          <>
            Healing Breakdown:
            <ul>
              <li>
                {formatNumber(this.soothHealing)} healing from{' '}
                <SpellLink spell={SPELLS.SOOTHING_BREATH} />.
              </li>
              <li>
                {formatNumber(this.chiCocoonHealing)}{' '}
                <SpellLink spell={SPELLS.CHI_COCOON_BUFF_YULON} /> healing from{' '}
                <SpellLink spell={TALENTS_MONK.CELESTIAL_HARMONY_TALENT} />.
              </li>
            </ul>
          </>
        }
      >
        <BoringValueText
          label={
            <>
              <SpellLink spell={TALENTS_MONK.INVOKE_YULON_THE_JADE_SERPENT_TALENT} /> and
              <br />
              <SpellLink spell={TALENTS_MONK.CELESTIAL_HARMONY_TALENT} />
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
