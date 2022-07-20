import { t } from '@lingui/macro';
import { formatPercentage, formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import Uptime from 'interface/icons/Uptime';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import DamageTracker from 'parser/shared/modules/AbilityTracker';
import Enemies from 'parser/shared/modules/Enemies';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

class SoulBarrier extends Analyzer {
  get uptime() {
    return (
      this.selectedCombatant.getBuffUptime(SPELLS.SOUL_BARRIER_TALENT.id) / this.owner.fightDuration
    );
  }

  get suggestionThresholdsEfficiency() {
    return {
      actual: this.uptime,
      isLessThan: {
        minor: 0.35,
        average: 0.3,
        major: 0.25,
      },
      style: 'percentage',
    };
  }

  static dependencies = {
    damageTracker: DamageTracker,
    enemies: Enemies,
  };
  casts = 0;
  totalAbsorbed = 0;
  buffApplied = 0;
  buffRemoved = 0;
  buffLength = 0;
  avgBuffLength = 0;
  totalBuffLength = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.SOUL_BARRIER_TALENT.id);
    this.addEventListener(
      Events.applybuff.to(SELECTED_PLAYER).spell(SPELLS.SOUL_BARRIER_TALENT),
      this.onApplyBuff,
    );
    this.addEventListener(
      Events.absorbed.to(SELECTED_PLAYER).spell(SPELLS.SOUL_BARRIER_TALENT),
      this.onAbsorb,
    );
    this.addEventListener(
      Events.removebuff.to(SELECTED_PLAYER).spell(SPELLS.SOUL_BARRIER_TALENT),
      this.onRemoveBuff,
    );
  }

  onApplyBuff(event) {
    this.casts += 1;
    this.buffApplied = event.timestamp;
  }

  onAbsorb(event) {
    this.totalAbsorbed += event.amount;
  }

  onRemoveBuff(event) {
    if (event.ability.guid !== SPELLS.SOUL_BARRIER_TALENT.id) {
      return;
    }
    this.buffRemoved = event.timestamp;
    this.buffLength = this.buffRemoved - this.buffApplied;
    this.totalBuffLength += this.buffLength;
  }

  suggestions(when) {
    when(this.suggestionThresholdsEfficiency).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          Your uptime with <SpellLink id={SPELLS.SOUL_BARRIER_TALENT.id} /> can be improved.
        </>,
      )
        .icon(SPELLS.SOUL_BARRIER_TALENT.icon)
        .actual(
          t({
            id: 'demonhunter.vengeance.suggestions.soulBarrier.uptime',
            message: `${formatPercentage(actual)}% Soul Barrier`,
          }),
        )
        .recommended(`>${formatPercentage(recommended)}% is recommended`),
    );
  }

  statistic() {
    const avgBuffLength = this.totalBuffLength / this.casts / 1000;
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(7)}
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
        tooltip={
          <>
            Average Buff Length: <strong>{formatNumber(avgBuffLength)} seconds</strong>
            <br />
            Total Damage Absorbed: <strong>{formatNumber(this.totalAbsorbed)}</strong>
            <br />
            Healing <strong>{this.owner.formatItemHealingDone(this.totalAbsorbed)}</strong>
            <br />
            Total Casts: <strong>{this.casts}</strong>
          </>
        }
      >
        <BoringSpellValueText spellId={SPELLS.SOUL_BARRIER_TALENT.id}>
          <Uptime /> {formatPercentage(this.uptime)}% <small>Uptime</small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default SoulBarrier;
