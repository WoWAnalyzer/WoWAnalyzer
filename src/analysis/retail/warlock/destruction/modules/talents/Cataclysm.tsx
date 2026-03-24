import { formatThousands, formatNumber, formatPercentage } from 'common/format';
import TALENTS from 'common/TALENTS/warlock';
import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import Events, { CastEvent, DamageEvent } from 'parser/core/Events';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';

const BUFFER = 100;
const debug = false;

class Cataclysm extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
  };

  protected abilityTracker!: AbilityTracker;

  _castTimestamp: number | null = null;
  _currentCastCount = 0;
  casts: number[] = [];

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.CATACLYSM_TALENT);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.CATACLYSM_TALENT),
      this.onCataclysmCast,
    );
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(TALENTS.CATACLYSM_TALENT),
      this.onCataclysmDamage,
    );
    this.addEventListener(Events.fightend, this.onFinished);
  }

  onCataclysmCast(event: CastEvent) {
    if (this._castTimestamp !== null) {
      // we've casted Cataclysm at least once, so we should add the current (at this time the previous) cast first before resetting the counter
      this.casts.push(this._currentCastCount);
    }
    this._castTimestamp = event.timestamp;
    this._currentCastCount = 0;
  }

  onCataclysmDamage(event: DamageEvent) {
    if (this._castTimestamp !== null && event.timestamp <= this._castTimestamp + BUFFER) {
      this._currentCastCount += 1;
    } else {
      debug && this.log('Cataclysm damage outside of the 100ms buffer after cast');
    }
  }

  onFinished() {
    // on each cast, the previous one is saved, so the "results" of the last Cataclysm cast in fight aren't saved, so do it on fight end
    this.casts.push(this._currentCastCount);
  }

  statistic() {
    const ability = this.abilityTracker.getAbility(TALENTS.CATACLYSM_TALENT.id);
    const damage = ability.damageVal.effective;
    const dps = (damage / this.owner.fightDuration) * 1000;
    const averageTargetsHit =
      this.casts.reduce((total, current) => total + current, 0) / ability.casts || 0;
    debug && this.log('Casts array at fight end: ', JSON.parse(JSON.stringify(this.casts)));

    return (
      <Statistic
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
        tooltip={`${formatThousands(damage)} damage`}
      >
        <BoringSpellValueText spell={TALENTS.CATACLYSM_TALENT}>
          {formatNumber(dps)} DPS{' '}
          <small>
            {formatPercentage(this.owner.getPercentageOfTotalDamageDone(damage))} % of total
          </small>{' '}
          <br />
          {averageTargetsHit.toFixed(2)} <small>average targets hit</small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default Cataclysm;
