import { Trans } from '@lingui/macro';
import { formatThousands } from 'common/format';
import TALENTS from 'common/TALENTS/deathknight';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, DamageEvent, HealEvent, RemoveDebuffEvent } from 'parser/core/Events';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

const BLOODDRINKER_TICKS_PER_CAST = 4;

class Blooddrinker extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
  };

  protected abilityTracker!: AbilityTracker;

  _totalTicks = 0;
  _totalCasts = 0;
  _currentTicks = 0;
  _wastedTicks = 0;
  _ruinedCasts = 0;
  totalDamage = 0;
  totalHealing = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.BLOODDRINKER_TALENT);

    if (!this.active) {
      return;
    }

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.BLOODDRINKER_TALENT),
      this.onCast,
    );
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(TALENTS.BLOODDRINKER_TALENT),
      this.onDamage,
    );
    this.addEventListener(
      Events.heal.to(SELECTED_PLAYER).spell(TALENTS.BLOODDRINKER_TALENT),
      this.onHeal,
    );
    this.addEventListener(
      Events.removedebuff.by(SELECTED_PLAYER).spell(TALENTS.BLOODDRINKER_TALENT),
      this.onRemoveDebuff,
    );
  }

  onCast(event: CastEvent) {
    this._totalCasts += 1;
  }

  onDamage(event: DamageEvent) {
    this.totalDamage += event.amount + (event.absorbed || 0);
    this._currentTicks += 1;
  }

  onHeal(event: HealEvent) {
    this.totalHealing += (event.amount || 0) + (event.absorbed || 0);
  }

  onRemoveDebuff(event: RemoveDebuffEvent) {
    if (this._currentTicks < BLOODDRINKER_TICKS_PER_CAST) {
      this._wastedTicks += BLOODDRINKER_TICKS_PER_CAST - this._currentTicks;
      this._ruinedCasts += 1;
    }
    this._currentTicks = 0;
  }

  statistic() {
    this._totalTicks = this._totalCasts * BLOODDRINKER_TICKS_PER_CAST;
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(6)}
        size="flexible"
        tooltip={
          <Trans id="deathknight.blood.blooddrinker.statistic.tooltip">
            You lost <strong>{this._wastedTicks}</strong> out of <strong>{this._totalTicks}</strong>{' '}
            ticks.
            <br />
            <strong>Damage:</strong> {formatThousands(this.totalDamage)} /{' '}
            {this.owner.formatItemDamageDone(this.totalDamage)}
            <br />
            <strong>Healing:</strong> {formatThousands(this.totalHealing)} /{' '}
            {this.owner.formatItemHealingDone(this.totalHealing)}
            <br />
          </Trans>
        }
      >
        <BoringSpellValueText spell={TALENTS.BLOODDRINKER_TALENT}>
          <Trans id="deathknight.blood.blooddrinker.statistic">
            {this._ruinedCasts} / {this._totalCasts} <small>Channels cancelled early</small>
          </Trans>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default Blooddrinker;
