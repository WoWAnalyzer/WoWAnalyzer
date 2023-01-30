import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/shaman';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent, CastEvent, HealEvent, RefreshBuffEvent } from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';

class PrimordialWave extends Analyzer {
  static dependencies = {};

  healing = 0;
  riptideHealing = 0;
  waveHealing = 0;
  overHealing = 0;
  riptideOverHealing = 0;
  waveOverHealing = 0;
  target: number | undefined = undefined;
  waveTarget: number | undefined = undefined;
  riptideTargets: boolean[] = [];

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.PRIMORDIAL_WAVE_TALENT);

    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(TALENTS.PRIMORDIAL_WAVE_TALENT),
      this._onHeal,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.PRIMORDIAL_WAVE_TALENT),
      this._onCast,
    );

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(TALENTS.RIPTIDE_TALENT),
      this._riptide,
    );
    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(TALENTS.RIPTIDE_TALENT),
      this._riptide,
    );
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(TALENTS.RIPTIDE_TALENT),
      this._riptideHeal,
    );

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.HEALING_WAVE_TALENT),
      this._waveCast,
    );
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(TALENTS.HEALING_WAVE_TALENT),
      this._waveHeal,
    );
  }

  _onHeal(event: HealEvent) {
    // This isn't working as intended
    this.healing += event.amount + (event.absorbed || 0);
    this.overHealing += event.overheal || 0;
  }
  _onCast(event: CastEvent) {
    this.target = event.targetID;
  }

  _riptide(event: ApplyBuffEvent | RefreshBuffEvent) {
    if (!this.target) {
      if (this.riptideTargets[event.targetID]) {
        this.riptideTargets[event.targetID] = false;
      }
      return;
    }

    if (this.target === event.targetID) {
      this.riptideTargets[event.targetID] = true;
      this.target = undefined;
    }
  }

  _riptideHeal(event: HealEvent) {
    if (!this.riptideTargets[event.targetID]) {
      return;
    }
    this.riptideHealing += event.amount + (event.absorbed || 0);
    this.riptideOverHealing += event.overheal || 0;
  }

  _waveCast(event: CastEvent) {
    if (!this.selectedCombatant.hasBuff(SPELLS.PRIMORDIAL_WAVE_BUFF.id)) {
      return;
    }
    this.waveTarget = event.targetID;
  }

  _waveHeal(event: HealEvent) {
    if (!this.selectedCombatant.hasBuff(SPELLS.PRIMORDIAL_WAVE_BUFF.id, null, 750)) {
      return;
    }
    if (event.targetID === this.waveTarget) {
      this.waveTarget = undefined;
      return;
    }

    this.waveHealing += event.amount + (event.absorbed || 0);
    this.waveOverHealing += event.overheal || 0;
  }

  statistic() {
    const totalHealing = this.healing + this.riptideHealing + this.waveHealing;
    return (
      <Statistic
        size="flexible"
        wide
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            {this.healing} healing via Primordial Wave,{' '}
            {formatPercentage(this.overHealing / (this.healing + this.overHealing))}% Overheal
            <br />
            {this.riptideHealing} healing via Riptide,{' '}
            {formatPercentage(
              this.riptideOverHealing / (this.riptideHealing + this.riptideOverHealing),
            )}
            % Overheal
            <br />
            {this.waveHealing} healing via Healing Wave cleave,{' '}
            {formatPercentage(this.waveOverHealing / (this.waveHealing + this.waveOverHealing))}%
            Overheal
          </>
        }
      >
        <table className="table table-condensed">
          <tbody>
            <th>
              <div className="panel-heading value">Total Healing</div>
              <BoringSpellValueText spellId={TALENTS.PRIMORDIAL_WAVE_TALENT.id}>
                <ItemHealingDone amount={totalHealing} />
              </BoringSpellValueText>
            </th>
            <th>
              <div className="panel-heading value">Breakdown</div>
              <BoringSpellValueText spellId={TALENTS.PRIMORDIAL_WAVE_TALENT.id}>
                <ItemHealingDone amount={this.healing} />
                <br />
                <img src="/img/healing.png" alt="Overhealing" className="icon" />{' '}
                {formatPercentage(this.overHealing / (this.healing + this.overHealing))} %{' '}
                <small>Overhealing</small>
              </BoringSpellValueText>
              <BoringSpellValueText spellId={TALENTS.RIPTIDE_TALENT.id}>
                <ItemHealingDone amount={this.riptideHealing} />
                <br />
                <img src="/img/healing.png" alt="Overhealing" className="icon" />{' '}
                {formatPercentage(
                  this.riptideOverHealing / (this.riptideHealing + this.riptideOverHealing),
                )}{' '}
                % <small>Overhealing</small>
              </BoringSpellValueText>
              <BoringSpellValueText spellId={TALENTS.HEALING_WAVE_TALENT.id}>
                <ItemHealingDone amount={this.waveHealing} />
                <br />
                <img src="/img/healing.png" alt="Overhealing" className="icon" />{' '}
                {formatPercentage(this.waveOverHealing / (this.waveHealing + this.waveOverHealing))}{' '}
                % <small>Overhealing</small>
              </BoringSpellValueText>
            </th>
          </tbody>
        </table>
      </Statistic>
    );
  }
}

export default PrimordialWave;
