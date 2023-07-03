import { formatPercentage, formatThousands } from 'common/format';
import SPELLS from 'common/SPELLS';
import talents from 'common/TALENTS/monk';
import { SpellIcon } from 'interface';
import HasteIcon from 'interface/icons/Haste';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Combatant from 'parser/core/Combatant';
import Events, { ApplyDebuffEvent, RemoveDebuffEvent } from 'parser/core/Events';
import BoringValue from 'parser/ui/BoringValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

export const HIGH_TOLERANCE_HASTE = {
  [SPELLS.LIGHT_STAGGER_DEBUFF.id]: 0.05,
  [SPELLS.MODERATE_STAGGER_DEBUFF.id]: 0.07,
  [SPELLS.HEAVY_STAGGER_DEBUFF.id]: 0.1,
};

function hasteFnGenerator(value: number) {
  return {
    haste: (combatant: Combatant) =>
      (combatant.getTalentRank(talents.HIGH_TOLERANCE_TALENT) /
        talents.HIGH_TOLERANCE_TALENT.maxRanks) *
      value,
  };
}

export const HIGH_TOLERANCE_HASTE_FNS = {
  [SPELLS.LIGHT_STAGGER_DEBUFF.id]: hasteFnGenerator(0.05),
  [SPELLS.MODERATE_STAGGER_DEBUFF.id]: hasteFnGenerator(0.07),
  [SPELLS.HEAVY_STAGGER_DEBUFF.id]: hasteFnGenerator(0.1),
};

class HighTolerance extends Analyzer {
  protected ranks = 0;
  get meanHaste() {
    return (
      Object.keys(HIGH_TOLERANCE_HASTE)
        .map(
          (key) =>
            (this.staggerDurations[Number(key)] * HIGH_TOLERANCE_HASTE[Number(key)] * this.ranks) /
            talents.HIGH_TOLERANCE_TALENT.maxRanks,
        )
        .reduce((prev, cur) => prev + cur, 0) / this.owner.fightDuration
    );
  }

  get lightDuration() {
    return this.staggerDurations[SPELLS.LIGHT_STAGGER_DEBUFF.id];
  }

  get moderateDuration() {
    return this.staggerDurations[SPELLS.MODERATE_STAGGER_DEBUFF.id];
  }

  get heavyDuration() {
    return this.staggerDurations[SPELLS.HEAVY_STAGGER_DEBUFF.id];
  }

  get noneDuration() {
    return (
      this.owner.fightDuration - this.lightDuration - this.moderateDuration - this.heavyDuration
    );
  }

  staggerDurations = {
    [SPELLS.LIGHT_STAGGER_DEBUFF.id]: 0,
    [SPELLS.MODERATE_STAGGER_DEBUFF.id]: 0,
    [SPELLS.HEAVY_STAGGER_DEBUFF.id]: 0,
  };
  private _staggerLevel: number | null = null;
  _lastDebuffApplied = 0;

  constructor(options: Options) {
    super(options);
    this.ranks = this.selectedCombatant.getTalentRank(talents.HIGH_TOLERANCE_TALENT);
    this.active = this.ranks > 0;
    this.addEventListener(Events.applydebuff.to(SELECTED_PLAYER), this.onApplyDebuff);
    this.addEventListener(Events.removedebuff.to(SELECTED_PLAYER), this.onRemoveDebuff);
    this.addEventListener(Events.fightend, this.onFightend);
  }

  onApplyDebuff(event: ApplyDebuffEvent) {
    if (!HIGH_TOLERANCE_HASTE[event.ability.guid]) {
      return;
    }
    this._lastDebuffApplied = event.timestamp;
    this._staggerLevel = event.ability.guid;
  }

  onRemoveDebuff(event: RemoveDebuffEvent) {
    if (!HIGH_TOLERANCE_HASTE[event.ability.guid]) {
      return;
    }
    this.staggerDurations[event.ability.guid] += event.timestamp - this._lastDebuffApplied;
    this._staggerLevel = null;
  }

  onFightend() {
    if (this._staggerLevel !== null) {
      this.staggerDurations[this._staggerLevel] +=
        this.owner.fight.end_time - this._lastDebuffApplied;
    }
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL()}
        size="flexible"
        tooltip={
          <>
            You spent:
            <ul>
              <li>
                <strong>{formatThousands(this.noneDuration / 1000)}s</strong> (
                {formatPercentage(this.noneDuration / this.owner.fightDuration)}%) without Stagger.
              </li>
              <li>
                <strong>{formatThousands(this.lightDuration / 1000)}s</strong> (
                {formatPercentage(this.lightDuration / this.owner.fightDuration)}%) in Light
                Stagger.
              </li>
              <li>
                <strong>{formatThousands(this.moderateDuration / 1000)}s</strong> (
                {formatPercentage(this.moderateDuration / this.owner.fightDuration)}%) in Moderate
                Stagger.
              </li>
              <li>
                <strong>{formatThousands(this.heavyDuration / 1000)}s</strong> (
                {formatPercentage(this.heavyDuration / this.owner.fightDuration)}%) in Heavy
                Stagger.
              </li>
            </ul>
          </>
        }
      >
        <BoringValue
          label={
            <>
              <SpellIcon spell={talents.HIGH_TOLERANCE_TALENT} /> Avg. Haste from High Tolerance
            </>
          }
        >
          <>
            <HasteIcon /> {formatPercentage(this.meanHaste)} %
          </>
        </BoringValue>
      </Statistic>
    );
  }
}

export default HighTolerance;
