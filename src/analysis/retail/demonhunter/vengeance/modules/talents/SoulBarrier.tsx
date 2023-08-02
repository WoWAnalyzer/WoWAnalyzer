import { formatNumber, formatPercentage } from 'common/format';
import { TALENTS_DEMON_HUNTER } from 'common/TALENTS/demonhunter';
import { SpellLink } from 'interface';
import Uptime from 'interface/icons/Uptime';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { AbsorbedEvent, ApplyBuffEvent, RemoveBuffEvent } from 'parser/core/Events';
import { NumberThreshold, ThresholdStyle, When } from 'parser/core/ParseResults';
import DamageTracker from 'parser/shared/modules/AbilityTracker';
import Enemies from 'parser/shared/modules/Enemies';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import TalentSpellText from 'parser/ui/TalentSpellText';

class SoulBarrier extends Analyzer {
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

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_DEMON_HUNTER.SOUL_BARRIER_TALENT);
    this.addEventListener(
      Events.applybuff.to(SELECTED_PLAYER).spell(TALENTS_DEMON_HUNTER.SOUL_BARRIER_TALENT),
      this.onApplyBuff,
    );
    this.addEventListener(
      Events.absorbed.to(SELECTED_PLAYER).spell(TALENTS_DEMON_HUNTER.SOUL_BARRIER_TALENT),
      this.onAbsorb,
    );
    this.addEventListener(
      Events.removebuff.to(SELECTED_PLAYER).spell(TALENTS_DEMON_HUNTER.SOUL_BARRIER_TALENT),
      this.onRemoveBuff,
    );
  }

  get uptime() {
    return (
      this.selectedCombatant.getBuffUptime(TALENTS_DEMON_HUNTER.SOUL_BARRIER_TALENT.id) /
      this.owner.fightDuration
    );
  }

  get suggestionThresholdsEfficiency(): NumberThreshold {
    return {
      actual: this.uptime,
      isLessThan: {
        minor: 0.35,
        average: 0.3,
        major: 0.25,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  onApplyBuff(event: ApplyBuffEvent) {
    this.casts += 1;
    this.buffApplied = event.timestamp;
  }

  onAbsorb(event: AbsorbedEvent) {
    this.totalAbsorbed += event.amount;
  }

  onRemoveBuff(event: RemoveBuffEvent) {
    if (event.ability.guid !== TALENTS_DEMON_HUNTER.SOUL_BARRIER_TALENT.id) {
      return;
    }
    this.buffRemoved = event.timestamp;
    this.buffLength = this.buffRemoved - this.buffApplied;
    this.totalBuffLength += this.buffLength;
  }

  suggestions(when: When) {
    when(this.suggestionThresholdsEfficiency).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          Your uptime with <SpellLink spell={TALENTS_DEMON_HUNTER.SOUL_BARRIER_TALENT} /> can be
          improved.
        </>,
      )
        .icon(TALENTS_DEMON_HUNTER.SOUL_BARRIER_TALENT.icon)
        .actual(`${formatPercentage(actual)}% Soul Barrier`)
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
        <TalentSpellText talent={TALENTS_DEMON_HUNTER.SOUL_BARRIER_TALENT}>
          <Uptime /> {formatPercentage(this.uptime)}% <small>Uptime</small>
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default SoulBarrier;
