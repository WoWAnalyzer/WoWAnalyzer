import { t } from '@lingui/macro';
import { formatPercentage, formatThousands } from 'common/format';
import SPELLS from 'common/SPELLS';
import { TALENTS_MONK } from 'common/TALENTS';
import { SpellLink } from 'interface';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { RoundedPanel } from 'interface/guide/components/GuideDivs';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  ApplyBuffEvent,
  DamageEvent,
  HealEvent,
  RemoveBuffEvent,
} from 'parser/core/Events';
import { mergeTimePeriods, OpenTimePeriod } from 'parser/core/mergeTimePeriods';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import DonutChart from 'parser/ui/DonutChart';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import uptimeBarSubStatistic from 'parser/ui/UptimeBarSubStatistic';

import { SPELL_COLORS } from '../../constants';
import { GUIDE_CORE_EXPLANATION_PERCENT } from '../../Guide';

class AncientTeachingsoftheMonastery extends Analyzer {
  damageSpellToHealing: Map<number, number> = new Map();
  lastDamageSpellID: number = 0;
  uptimeWindows: OpenTimePeriod[] = [];

  /**
   * After you cast Essence Font, Tiger Palm, Blackout Kick, and Rising Sun Kick heal an injured ally within 20 yards for 250% of the damage done. Lasts 15s.
   */
  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_MONK.ANCIENT_TEACHINGS_TALENT);

    this.addEventListener(
      Events.damage
        .by(SELECTED_PLAYER)
        .spell([
          SPELLS.RISING_SUN_KICK_DAMAGE,
          SPELLS.BLACKOUT_KICK,
          SPELLS.BLACKOUT_KICK_TOTM,
          SPELLS.TIGER_PALM,
        ]),
      this.lastDamageEvent,
    );
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.AT_HEAL),
      this.calculateEffectiveHealing,
    );
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.AT_CRIT_HEAL),
      this.calculateEffectiveHealing,
    );
    this.addEventListener(Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.AT_BUFF), this.onApply);
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.AT_BUFF),
      this.onRemove,
    );
  }

  lastDamageEvent(event: DamageEvent) {
    if (!this.selectedCombatant.hasBuff(SPELLS.AT_BUFF.id)) {
      return;
    }
    this.lastDamageSpellID = event.ability.guid;
    if (!this.damageSpellToHealing.has(this.lastDamageSpellID)) {
      this.damageSpellToHealing.set(this.lastDamageSpellID, 0);
    }
  }

  calculateEffectiveHealing(event: HealEvent) {
    const heal = (event.amount || 0) + (event.absorbed || 0);
    const oldHealingTotal = this.damageSpellToHealing.get(this.lastDamageSpellID) || 0;
    this.damageSpellToHealing.set(this.lastDamageSpellID, heal + oldHealingTotal);
  }

  onApply(event: ApplyBuffEvent) {
    this.uptimeWindows.push({
      start: event.timestamp,
    });
  }

  onRemove(event: RemoveBuffEvent) {
    this.uptimeWindows.at(-1)!.end = event.timestamp;
  }

  get guideSubsection(): JSX.Element {
    const explanation = (
      <>
        <strong>
          <SpellLink id={TALENTS_MONK.ANCIENT_TEACHINGS_TALENT} />
        </strong>{' '}
        is a powerful buff that enables you to do consistent healing while doing damage, a core
        identity of Mistweaver Monk. Try to maintain your buff at all times by casting{' '}
        <SpellLink id={TALENTS_MONK.ESSENCE_FONT_TALENT} /> or{' '}
        <SpellLink id={TALENTS_MONK.FAELINE_STOMP_TALENT} /> between usages of{' '}
        <SpellLink id={TALENTS_MONK.THUNDER_FOCUS_TEA_TALENT} /> when talented into{' '}
        <SpellLink id={TALENTS_MONK.UPWELLING_TALENT} />.
      </>
    );

    const data = (
      <div>
        <RoundedPanel>
          <strong>
            <SpellLink id={TALENTS_MONK.ANCIENT_TEACHINGS_TALENT} /> uptime
          </strong>
          {this.subStatistic()}
        </RoundedPanel>
      </div>
    );

    return explanationAndDataSubsection(explanation, data, GUIDE_CORE_EXPLANATION_PERCENT);
  }

  subStatistic() {
    return uptimeBarSubStatistic(this.owner.fight, {
      spells: [TALENTS_MONK.ANCIENT_TEACHINGS_TALENT],
      uptimes: mergeTimePeriods(this.uptimeWindows, this.owner.currentTimestamp),
      color: SPELL_COLORS.RISING_SUN_KICK,
    });
  }

  renderDonutChart() {
    const rskHealing = this.damageSpellToHealing.get(SPELLS.RISING_SUN_KICK_DAMAGE.id) || 0;
    const bokHealing = this.damageSpellToHealing.get(SPELLS.BLACKOUT_KICK.id) || 0;
    const totmHealing = this.damageSpellToHealing.get(SPELLS.BLACKOUT_KICK_TOTM.id) || 0;
    const tpHealing = this.damageSpellToHealing.get(SPELLS.TIGER_PALM.id) || 0;
    const totalHealing = rskHealing + bokHealing + totmHealing + tpHealing;

    const items = [
      {
        color: SPELL_COLORS.RISING_SUN_KICK,
        label: 'Rising Sun Kick',
        spellId: TALENTS_MONK.RISING_SUN_KICK_TALENT.id,
        value: rskHealing / totalHealing,
        valueTooltip: formatThousands(rskHealing),
      },
      {
        color: SPELL_COLORS.BLACKOUT_KICK,
        label: 'Blackout Kick',
        spellId: SPELLS.BLACKOUT_KICK.id,
        value: bokHealing / totalHealing,
        valueTooltip: formatThousands(bokHealing),
      },
      {
        color: SPELL_COLORS.BLACKOUT_KICK_TOTM,
        label: 'Teachings of the Monastery',
        spellId: SPELLS.BLACKOUT_KICK_TOTM.id,
        value: totmHealing / totalHealing,
        valueTooltip: formatThousands(totmHealing),
      },
      {
        color: SPELL_COLORS.TIGER_PALM,
        label: 'Tiger Palm',
        spellId: SPELLS.TIGER_PALM.id,
        value: tpHealing / totalHealing,
        valueTooltip: formatThousands(tpHealing),
      },
    ];

    return <DonutChart items={items} />;
  }

  get suggestionThresholds() {
    return {
      actual: this.selectedCombatant.getBuffUptime(SPELLS.AT_BUFF.id) / this.owner.fightDuration,
      isLessThan: {
        minor: 0.8,
        average: 0.7,
        major: 0.6,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  suggestions(when: When) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          You had suboptimal <SpellLink id={TALENTS_MONK.ANCIENT_TEACHINGS_TALENT.id} /> buff
          uptime, try using <SpellLink id={TALENTS_MONK.FAELINE_STOMP_TALENT.id} /> and{' '}
          <SpellLink id={TALENTS_MONK.ESSENCE_FONT_TALENT.id} /> more frequently in order to
          maintain the buff
        </>,
      )
        .icon(TALENTS_MONK.ANCIENT_TEACHINGS_TALENT.icon)
        .actual(
          `${formatPercentage(actual)}${t({
            id: 'monk.mistweaver.suggestions.ancientTeachings.uptime',
            message: `% uptime`,
          })}`,
        )
        .recommended(`${formatPercentage(recommended, 0)}% or better is recommended`),
    );
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
      >
        <div className="pad">
          <label>
            <SpellLink id={SPELLS.AT_HEAL.id}>Ancient Teachings</SpellLink> breakdown
          </label>
          {this.renderDonutChart()}
        </div>
      </Statistic>
    );
  }
}

export default AncientTeachingsoftheMonastery;
