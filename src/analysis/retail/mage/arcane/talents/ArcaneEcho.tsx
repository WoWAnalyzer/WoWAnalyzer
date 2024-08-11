import { formatNumber } from 'common/format';
import TALENTS from 'common/TALENTS/mage';
import { SpellIcon } from 'interface';
import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import Events, { CastEvent, DamageEvent, GetRelatedEvents } from 'parser/core/Events';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';

class ArcaneEcho extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
  };
  protected abilityTracker!: AbilityTracker;

  arcaneEchoes: { touchMagiCast: number; damageEvents?: DamageEvent[]; totalDamage: number }[] = [];

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.ARCANE_ECHO_TALENT);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.TOUCH_OF_THE_MAGI_TALENT),
      this.onTouchMagiCast,
    );
  }

  onTouchMagiCast(event: CastEvent) {
    const damageEvents: DamageEvent[] = GetRelatedEvents(event, 'SpellDamage');
    let damage = 0;
    damageEvents.forEach((a) => (damage += a.amount + (a.absorbed || 0)));

    this.arcaneEchoes.push({
      touchMagiCast: event.timestamp,
      damageEvents: damageEvents || [],
      totalDamage: damage,
    });
  }

  get averageDamagePerTouch() {
    let totalDamage = 0;
    this.arcaneEchoes.forEach((a) => (totalDamage += a.totalDamage));
    return totalDamage / this.abilityTracker.getAbility(TALENTS.TOUCH_OF_THE_MAGI_TALENT.id).casts;
  }

  statistic() {
    return (
      <Statistic
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            On average you did {formatNumber(this.averageDamagePerTouch)} damage per Touch of the
            Magi cast.
          </>
        }
      >
        <BoringSpellValueText spell={TALENTS.ARCANE_ECHO_TALENT}>
          <>
            <SpellIcon spell={TALENTS.ARCANE_ECHO_TALENT} />{' '}
            {formatNumber(this.averageDamagePerTouch)} <small>Average Damage</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default ArcaneEcho;
