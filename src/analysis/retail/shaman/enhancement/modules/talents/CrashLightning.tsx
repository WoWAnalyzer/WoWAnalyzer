import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS/shaman';
import TALENTS from 'common/TALENTS/shaman';
import Analyzer, { Options } from 'parser/core/Analyzer';
import UptimeIcon from 'interface/icons/Uptime';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import TalentSpellText from 'parser/ui/TalentSpellText';
import SpellLink from 'interface/SpellLink';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import Events, { DamageEvent } from 'parser/core/Events';

class CrashLightning extends Analyzer.withDependencies({
  abilityTracker: AbilityTracker,
}) {
  private damage = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.CRASH_LIGHTNING_TALENT);
    if (!this.active) {
      return;
    }

    this.addEventListener(Events.damage, this.onDamage);
  }

  onDamage(event: DamageEvent) {
    if (event.ability.guid === SPELLS.CRASH_LIGHTNING_BUFF_DAMAGE.id) {
      this.damage += event.amount + (event.absorbed ?? 0);
    }
  }

  statistic() {
    const uptime =
      this.selectedCombatant.getBuffUptime(SPELLS.CRASH_LIGHTNING_BUFF.id) /
      this.owner.fightDuration;

    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL()}
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
        tooltip={
          <>
            <SpellLink spell={SPELLS.CRASH_LIGHTNING_BUFF} /> uptime:{' '}
            <strong>{formatPercentage(uptime)}%</strong>
          </>
        }
      >
        <TalentSpellText talent={TALENTS.CRASH_LIGHTNING_TALENT}>
          <ItemDamageDone amount={this.damage} />
          <div>
            <UptimeIcon /> {formatPercentage(uptime)}% <small>buff uptime</small>
          </div>
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default CrashLightning;
