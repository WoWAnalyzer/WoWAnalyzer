import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/paladin';
import HIT_TYPES from 'game/HIT_TYPES';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, DamageEvent } from 'parser/core/Events';
import { plotOneVariableBinomChart } from 'parser/shared/modules/helpers/Probability';
import BoringSpellValue from 'parser/ui/BoringSpellValue';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

import Abilities from '../Abilities';
import SpellUsable from '../features/SpellUsable';

const BASE_PROC_CHANCE = 0.15;

class GrandCrusader extends Analyzer {
  static dependencies = {
    abilities: Abilities,
  };
  _totalResets: number = 0;
  _exactResets: number = 0;
  _inferredResets: number = 0;
  _resetChances: number = 0;
  abilities!: Abilities;

  constructor(options: Options) {
    super(options);
    this.addEventListener(
      Events.cast
        .by(SELECTED_PLAYER)
        .spell([TALENTS.HAMMER_OF_THE_RIGHTEOUS_TALENT, TALENTS.BLESSED_HAMMER_TALENT]),
      this.trackGrandCrusaderChanceCasts,
    );
    this.addEventListener(Events.damage.to(SELECTED_PLAYER), this.trackGrandCrusaderChanceHits);
  }

  get procChance(): number {
    return BASE_PROC_CHANCE;
  }

  _lastResetSource: CastEvent | DamageEvent | null = null;

  trackGrandCrusaderChanceCasts(event: CastEvent) {
    if (
      ![TALENTS.HAMMER_OF_THE_RIGHTEOUS_TALENT.id, TALENTS.BLESSED_HAMMER_TALENT.id].includes(
        event.ability.guid,
      )
    ) {
      return;
    }
    this._resetChances += 1;
    this._lastResetSource = event;
  }

  trackGrandCrusaderChanceHits(event: DamageEvent) {
    if (![HIT_TYPES.DODGE, HIT_TYPES.PARRY].includes(event.hitType)) {
      return;
    }
    this._resetChances += 1;
    this._lastResetSource = event;
  }

  triggerInferredReset(spellUsable: SpellUsable, event: CastEvent | DamageEvent) {
    this._totalResets += 1;
    this._inferredResets += 1;
    this.resetCooldowns(spellUsable, event);
  }

  resetCooldowns(spellUsable: SpellUsable, event: CastEvent | DamageEvent) {
    // reset AS cd
    if (spellUsable.isOnCooldown(TALENTS.AVENGERS_SHIELD_TALENT.id)) {
      spellUsable.endCooldown(TALENTS.AVENGERS_SHIELD_TALENT.id, this._lastResetSource?.timestamp);
    }

    // reset Judgment CD if the CJ talent is selected
    if (
      this.selectedCombatant.hasTalent(TALENTS.CRUSADERS_JUDGMENT_TALENT) &&
      spellUsable.isOnCooldown(SPELLS.JUDGMENT_CAST_PROTECTION.id) &&
      this._lastResetSource !== null
    ) {
      // get haste as of last reset source. fingers crossed that it
      // isn't too far off
      const ecd: number | undefined = this.abilities.getExpectedCooldownDuration(
        SPELLS.JUDGMENT_CAST_PROTECTION.id,
      );
      if (ecd !== undefined) {
        spellUsable.reduceCooldown(
          SPELLS.JUDGMENT_CAST_PROTECTION.id,
          ecd,
          this._lastResetSource.timestamp,
        );
      }
    }
  }

  statistic() {
    //As we use a different formula than the standard one for XAxis, we send it along as a parameter
    const binomChartXAxis = {
      title: 'Reset %',
      tickFormat: (value: number) => `${formatPercentage(value / this._resetChances, 0)}%`,
      style: {
        fill: 'white',
      },
    };
    return (
      <Statistic
        position={STATISTIC_ORDER.DEFAULT}
        size="flexible"
        tooltip={
          <>
            Grand Crusader reset the cooldown of Avenger's Shield at least {this._totalResets}{' '}
            times. {this._inferredResets} are inferred from using it before its cooldown normally be
            up.
            <br />
            You had {this._resetChances} chances for Grand Crusader to trigger with a{' '}
            {formatPercentage(this.procChance, 0)}% chance to trigger.
          </>
        }
        dropdown={
          <div style={{ padding: '8px' }}>
            {plotOneVariableBinomChart(
              this._totalResets,
              this._resetChances,
              this.procChance,
              'Reset %',
              'Actual Resets',
              [0, 0.2],
              binomChartXAxis,
            )}
            <p>
              Likelihood of having <em>exactly</em> as many resets as you did with your traits and
              talents.
            </p>
          </div>
        }
      >
        <BoringSpellValue
          spellId={TALENTS.GRAND_CRUSADER_TALENT.id}
          value={`${this._totalResets} Resets`}
          label="Grand Crusader"
        />
      </Statistic>
    );
  }
}

export default GrandCrusader;
