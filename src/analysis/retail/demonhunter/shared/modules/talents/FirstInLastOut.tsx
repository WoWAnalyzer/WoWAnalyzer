import { formatNumber, formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS/demonhunter';
import { TALENTS_DEMON_HUNTER } from 'common/TALENTS';
import Uptime from 'interface/icons/Uptime';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { AbsorbedEvent, ApplyBuffEvent, RemoveBuffEvent } from 'parser/core/Events';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import TalentSpellText from 'parser/ui/TalentSpellText';

export default class FirstInLastOut extends Analyzer {
  casts = 0;
  totalAbsorbed = 0;
  buffApplied = 0;
  buffRemoved = 0;
  buffLength = 0;
  avgBuffLength = 0;
  totalBuffLength = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_DEMON_HUNTER.FIRST_IN_LAST_OUT_TALENT);
    this.addEventListener(
      Events.applybuff.to(SELECTED_PLAYER).spell(SPELLS.FIRST_IN_LAST_OUT_SHIELD),
      this.onApplyBuff,
    );
    this.addEventListener(
      Events.absorbed.to(SELECTED_PLAYER).spell(SPELLS.FIRST_IN_LAST_OUT_SHIELD),
      this.onAbsorb,
    );
    this.addEventListener(
      Events.removebuff.to(SELECTED_PLAYER).spell(SPELLS.FIRST_IN_LAST_OUT_SHIELD),
      this.onRemoveBuff,
    );
  }
  get uptime() {
    return (
      this.selectedCombatant.getBuffUptime(SPELLS.FIRST_IN_LAST_OUT_SHIELD.id) /
      this.owner.fightDuration
    );
  }

  onApplyBuff(event: ApplyBuffEvent) {
    this.casts += 1;
    this.buffApplied = event.timestamp;
  }

  onAbsorb(event: AbsorbedEvent) {
    this.totalAbsorbed += event.amount;
  }

  onRemoveBuff(event: RemoveBuffEvent) {
    if (event.ability.guid !== SPELLS.FIRST_IN_LAST_OUT_SHIELD.id) {
      return;
    }
    this.buffRemoved = event.timestamp;
    this.buffLength = this.buffRemoved - this.buffApplied;
    this.totalBuffLength += this.buffLength;
  }
  statistic() {
    const avgBuffLength = this.totalBuffLength / this.casts / 1000;
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(10)}
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
        <TalentSpellText talent={TALENTS_DEMON_HUNTER.FIRST_IN_LAST_OUT_TALENT}>
          <Uptime /> {formatPercentage(this.uptime)}% <small>Uptime</small>
        </TalentSpellText>
      </Statistic>
    );
  }
}
