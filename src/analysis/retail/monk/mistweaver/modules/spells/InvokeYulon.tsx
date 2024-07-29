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
import EnvelopingBreath from './EnvelopingBreath';

class InvokeYulon extends BaseCelestialAnalyzer {
  soothHealing: number = 0;
  envelopHealing: number = 0;
  chiCocoonHealing: number = 0;
  protected envb!: EnvelopingBreath;

  get totalHealing() {
    return this.soothHealing + this.envelopHealing + this.chiCocoonHealing;
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
      Events.absorbed.by(SELECTED_PLAYER).spell(SPELLS.CHI_COCOON_HEAL_YULON),
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
      infusionDuration: 0,
      lessonsDuration: 0,
      totalEnvB: 0,
      totalEnvM: 0,
      averageHaste: 0,
      totmStacks: this.selectedCombatant.getBuffStacks(SPELLS.TEACHINGS_OF_THE_MONASTERY.id),
      deathTimestamp: 0,
      castRsk: false,
    });
  }

  handleEnvelopingBreath(event: HealEvent) {
    this.envelopHealing += (event.amount || 0) + (event.absorbed || 0);
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
        sure that <SpellLink spell={TALENTS_MONK.RISING_SUN_KICK_TALENT} /> is on cooldown, and make
        to sure cast{' '}
        {this.selectedCombatant.hasTalent(TALENTS_MONK.GIFT_OF_THE_CELESTIALS_TALENT) ? (
          <>at least one </>
        ) : (
          <>all </>
        )}{' '}
        <SpellLink spell={TALENTS_MONK.RENEWING_MIST_TALENT} />
        (s) to prevent overcapping charges Yulon's duration.
        <br />
        If <SpellLink spell={TALENTS_MONK.SECRET_INFUSION_TALENT} /> talented, use{' '}
        <SpellLink spell={TALENTS_MONK.THUNDER_FOCUS_TEA_TALENT} /> with{' '}
        <SpellLink spell={TALENTS_MONK.RENEWING_MIST_TALENT} /> for a multiplicative haste bonus
        <br />
        {this.selectedCombatant.hasTalent(TALENTS_MONK.SHAOHAOS_LESSONS_TALENT) && (
          <>
            With <SpellLink spell={TALENTS_MONK.SHAOHAOS_LESSONS_TALENT} />, cast{' '}
            <SpellLink spell={TALENTS_MONK.SHEILUNS_GIFT_TALENT} /> with enough clouds to cover the
            entire duration of{' '}
            <SpellLink spell={TALENTS_MONK.INVOKE_YULON_THE_JADE_SERPENT_TALENT} />
            <br />
          </>
        )}
        During <SpellLink spell={TALENTS_MONK.INVOKE_YULON_THE_JADE_SERPENT_TALENT} />, it is
        important to cast <SpellLink spell={TALENTS_MONK.ENVELOPING_MIST_TALENT} /> on allies that
        are near other allies (e.g. not ranged players standing alone) to maximize targets hit by{' '}
        <SpellLink spell={SPELLS.ENVELOPING_BREATH_HEAL} />. Be sure to cast{' '}
        <SpellLink spell={TALENTS_MONK.RISING_SUN_KICK_TALENT} /> before your first{' '}
        <SpellLink spell={TALENTS_MONK.ENVELOPING_MIST_TALENT} /> and{' '}
        <SpellLink spell={TALENTS_MONK.RAPID_DIFFUSION_TALENT} />{' '}
        <SpellLink spell={TALENTS_MONK.RENEWING_MIST_TALENT} /> falls off to extend their duration.
        <br />
        Be sure to follow up your{' '}
        <SpellLink spell={TALENTS_MONK.INVOKE_YULON_THE_JADE_SERPENT_TALENT} /> with casts of{' '}
        <SpellLink spell={SPELLS.VIVIFY} /> to make use of your low duration{' '}
        <SpellLink spell={TALENTS_MONK.RENEWING_MIST_TALENT} />
        s.
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
                {formatNumber(this.envelopHealing)}{' '}
                <SpellLink spell={SPELLS.ENVELOPING_BREATH_HEAL} /> healing from{' '}
                <SpellLink spell={TALENTS_MONK.CELESTIAL_HARMONY_TALENT} />.
              </li>
              <li>
                {formatNumber(this.chiCocoonHealing)}{' '}
                <SpellLink spell={SPELLS.CHI_COCOON_HEAL_YULON} /> healing from{' '}
                <SpellLink spell={TALENTS_MONK.CELESTIAL_HARMONY_TALENT} />.
              </li>
              <li>
                {this.envb.averageEnvBPerEnv.toFixed(2)} average{' '}
                <SpellLink spell={SPELLS.ENVELOPING_BREATH_HEAL} /> per{' '}
                <SpellLink spell={TALENTS_MONK.ENVELOPING_MIST_TALENT} /> cast
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
