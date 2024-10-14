import RageTracker from 'analysis/retail/warrior/shared/modules/core/RageTracker';
import { formatPercentage, formatThousands } from 'common/format';
import SPELLS from 'common/SPELLS';
import talents from 'common/TALENTS/warrior';
import UptimeIcon from 'interface/icons/Uptime';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DamageEvent } from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';

class Recklessness extends Analyzer.withDependencies({
  RageTracker,
}) {
  reckDamage: number = 0;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(talents.RECKLESSNESS_TALENT);

    this.addEventListener(Events.damage.by(SELECTED_PLAYER), this.onPlayerDamage);
  }

  get uptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.RECKLESSNESS.id) / this.owner.fightDuration;
  }

  get reckRageGen() {
    return (
      this.deps.RageTracker.getGeneratedBySpell(SPELLS.RECKLESSNESS.id) +
      this.deps.RageTracker.getWastedBySpell(SPELLS.RECKLESSNESS.id)
    );
  }

  get totalRageGen() {
    return this.deps.RageTracker.generated;
  }

  get ratioReckRageGen() {
    return this.reckRageGen / this.totalRageGen;
  }

  get reckDPS() {
    return this.owner.getPercentageOfTotalDamageDone(this.reckDamage);
  }

  onPlayerDamage(event: DamageEvent) {
    if (this.selectedCombatant.hasBuff(SPELLS.RECKLESSNESS.id)) {
      this.reckDamage += event.amount;
    }
  }

  statistic() {
    return (
      <Statistic
        size="flexible"
        tooltip={
          <>
            <strong>Extra Rage Generated:</strong> {formatThousands(this.reckRageGen)}
            <br />
            <strong>Percent of total rage generated during recklessness:</strong>{' '}
            {formatPercentage(this.ratioReckRageGen, 1)}%<br />
            <strong>Percent of total damage done during recklessness:</strong>{' '}
            {formatPercentage(this.reckDPS, 1)}% ({formatThousands(this.reckDamage)})
          </>
        }
      >
        <BoringSpellValueText spell={SPELLS.RECKLESSNESS}>
          <>
            <UptimeIcon /> {formatPercentage(this.uptime)}% <small>uptime</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default Recklessness;
