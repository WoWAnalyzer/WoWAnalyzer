import { formatThousands, formatPercentage, formatNumber } from 'common/format';
import TALENTS from 'common/TALENTS/warlock';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyDebuffEvent, CastEvent } from 'parser/core/Events';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';

// the application of the debuff (and first tick of damage) is instant after the cast, but seems to have a little bit of leeway across multiple enemies
// this example log: /report/mvK3PYrbcwfj9qTG/15-LFR+Zul+-+Kill+(3:49)/16-Residentevil shows around +15ms, so setting 100ms buffer to account for lags
const BUFFER = 100;
const debug = false;

class VileTaint extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
  };
  protected abilityTracker!: AbilityTracker;

  _castTimestamp: number | null = null;
  _currentCastCount = 0;
  casts: number[] = [];

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.VILE_TAINT_TALENT);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.VILE_TAINT_TALENT),
      this.onVileTaintCast,
    );
    this.addEventListener(
      Events.applydebuff.by(SELECTED_PLAYER).spell(TALENTS.VILE_TAINT_TALENT),
      this.onVileTaintApplyDebuff,
    );
    this.addEventListener(Events.fightend, this.onFinished);
  }

  onVileTaintCast(event: CastEvent) {
    if (this._castTimestamp !== null) {
      // we've casted VT at least once, so we should add the current (at this time the previous) cast first before resetting the counter
      this.casts.push(this._currentCastCount);
    }
    this._castTimestamp = event.timestamp;
    this._currentCastCount = 0;
  }

  onVileTaintApplyDebuff(event: ApplyDebuffEvent) {
    if (event.timestamp <= (this._castTimestamp || 0) + BUFFER) {
      this._currentCastCount += 1;
    } else {
      debug && console.log('Vile Taint debuff applied outside of the 100ms buffer after cast');
    }
  }

  onFinished() {
    // on each cast, the previous one is saved, so the "results" of the last VT cast in fight aren't saved, so do it on fight end
    this.casts.push(this._currentCastCount);
  }

  statistic() {
    const spell = this.abilityTracker.getAbility(TALENTS.VILE_TAINT_TALENT.id);
    const damage = spell.damageEffective + spell.damageAbsorbed;
    const averageTargetsHit =
      this.casts.reduce((total, current) => total + current, 0) / spell.casts || 0;
    const dps = (damage / this.owner.fightDuration) * 1000;
    return (
      <Statistic
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
        tooltip={
          <>
            {formatThousands(damage)} damage
            <br />
            Average targets hit: {averageTargetsHit.toFixed(2)}
          </>
        }
      >
        <BoringSpellValueText spellId={TALENTS.VILE_TAINT_TALENT.id}>
          {formatNumber(dps)} DPS{' '}
          <small>
            {formatPercentage(this.owner.getPercentageOfTotalDamageDone(damage))} % of total
          </small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default VileTaint;
