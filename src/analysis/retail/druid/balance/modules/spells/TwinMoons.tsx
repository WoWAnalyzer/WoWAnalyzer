import { formatNumber, formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
import Events, { CastEvent, DamageEvent } from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { TALENTS_DRUID } from 'common/TALENTS';

const TWIN_MOONS_BONUS_DAMAGE = 0.1;

class TwinMoons extends Analyzer {
  get perSecond() {
    return this.bonusDamage / (this.owner.fightDuration / 1000);
  }

  get percentTwoHits() {
    return (this.moonfireHits - this.moonfireCasts) / this.moonfireCasts;
  }

  moonfireCasts = 0;
  moonfireHits = 0;
  bonusDamage = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_DRUID.TWIN_MOONS_TALENT);
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.MOONFIRE_DEBUFF),
      this.onDamage,
    );
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.MOONFIRE_CAST), this.onCast);
  }

  onDamage(event: DamageEvent) {
    this.bonusDamage += calculateEffectiveDamage(event, TWIN_MOONS_BONUS_DAMAGE);
    if (event.tick === true) {
      return;
    }
    this.moonfireHits += 1;
  }

  onCast(event: CastEvent) {
    this.moonfireCasts += 1;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(7)}
        size="flexible"
        tooltip={`You hit ${this.moonfireHits} times with ${
          this.moonfireCasts
        } casts. This talent added ${formatNumber(this.perSecond)} DPS to your Moonfire.`}
      >
        <BoringSpellValueText spell={TALENTS_DRUID.TWIN_MOONS_TALENT}>
          <>
            {formatPercentage(this.percentTwoHits)} % <small>double hits</small>
            <br />
            {formatNumber(this.bonusDamage)} <small>damage gained</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default TwinMoons;
