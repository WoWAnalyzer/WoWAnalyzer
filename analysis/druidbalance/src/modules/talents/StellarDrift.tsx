import { formatPercentage, formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
import Events, { CastEvent, DamageEvent } from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

const STARFALL_BONUS_DAMAGE = 0.15;
const STARFALL_BONUS_SECONDS = 2;

class StellarDrift extends Analyzer {
  get damagePercent() {
    return this.owner.getPercentageOfTotalDamageDone(this.bonusDamage);
  }

  get perSecond() {
    return this.bonusDamage / (this.owner.fightDuration / 1000);
  }

  get gainedUptime() {
    return this.countStarfallCasts * STARFALL_BONUS_SECONDS;
  }

  bonusDamage = 0;
  countStarfallCasts = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.STELLAR_DRIFT_TALENT.id);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.STARFALL), this.onDamage);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.STARFALL_CAST), this.onCast);
  }

  onDamage(event: DamageEvent) {
    this.bonusDamage += calculateEffectiveDamage(event, STARFALL_BONUS_DAMAGE);
  }

  onCast(event: CastEvent) {
    this.countStarfallCasts += 1;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(7)}
        size="flexible"
        tooltip={`Contributed ${formatNumber(this.perSecond)} DPS (${formatNumber(
          this.bonusDamage,
        )} total damage). This does not account for any extra damage gained from the increased radius or the ability to move while casting. You also gained ${
          this.gainedUptime
        } seconds of additional uptime.`}
      >
        <BoringSpellValueText spellId={SPELLS.STELLAR_DRIFT_TALENT.id}>
          <>
            {formatPercentage(this.damagePercent)} % <small>of total damage</small>
            <br />
            {formatNumber(this.gainedUptime)} <small>seconds uptime gained</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default StellarDrift;
